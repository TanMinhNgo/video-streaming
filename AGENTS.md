# 🎬 Video Streaming Platform — Personal Dev Prompt

> Stack: Node.js + Express.js · MongoDB Atlas · ImageKit · Clerk · Vite + React + TypeScript

---

## 📦 Video Storage & Streaming — ImageKit

> **Quan trọng:** Không dùng HLS, không dùng FFmpeg. Dùng **ImageKit Progressive MP4** streaming trực tiếp.

### Upload Flow

1. Frontend gọi `GET /api/imagekit/auth` để lấy token đã sign
2. Backend dùng `imagekit.getAuthenticationParameters()` trả về `{ token, expire, signature }`
3. Frontend upload thẳng từ browser lên ImageKit *(không qua backend)* dùng ImageKit JS SDK
4. Sau khi upload xong, frontend gửi metadata về backend lưu MongoDB

### Streaming MP4

```ts
// Lấy URL stream
imagekit.url({ path: video.imageKitPath, transformation: [{ format: 'mp4' }] })

// Signed URL cho private video
imagekit.url({ signed: true, expireSeconds: 3600 })

// Thumbnail on-the-fly
// ik.imagekit.io/id/video.mp4?tr=w-320,h-180,fo-auto
```

### ImageKit SDK Setup (Backend)

```ts
import ImageKit from 'imagekit'

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
})
```

| Method | Dùng cho |
|---|---|
| `imagekit.getAuthenticationParameters()` | Sign params cho client upload |
| `imagekit.getFileDetails(fileId)` | Lấy metadata sau upload |
| `imagekit.deleteFile(fileId)` | Xóa khi user delete video |
| `imagekit.url({ path, transformation, signed })` | Generate URL |

---

## 🖥️ Backend — Node.js + Express.js

### Setup

- Runtime: **Node.js 20+**, TypeScript strict
- Framework: **Express.js**, RESTful API, MVC pattern
- Cấu trúc module: mỗi feature có `controller` + `service` + `router` + `schema`

### Authentication — Clerk

```ts
// Package: @clerk/express
// Middleware global
app.use(clerkMiddleware())

// Protected route
router.get('/me', requireAuth(), userController.getMe)

// Lấy userId
const userId = req.auth.userId

// Webhook sync user events (dùng svix verify)
POST /api/webhooks/clerk
```

### Database — MongoDB Atlas + Mongoose

```ts
mongoose.connect(MONGODB_URI, { maxPoolSize: 10 })
```

#### Schemas

<details>
<summary><strong>User</strong></summary>

```ts
{
  clerkId:         String  // unique, index
  username:        String
  email:           String
  avatar:          String
  bio:             String
  subscriberCount: Number  // default: 0
  createdAt:       Date
}
```
</details>

<details>
<summary><strong>Video</strong></summary>

```ts
{
  title:           String   // required
  description:     String
  uploaderId:      ObjectId // ref: User, index
  imageKitFileId:  String   // required
  imageKitUrl:     String   // required
  thumbnailUrl:    String
  duration:        Number   // seconds
  fileSize:        Number
  mimeType:        String
  viewCount:       Number   // default: 0
  likeCount:       Number   // default: 0
  tags:            [String]
  visibility:      enum ['public', 'private', 'unlisted'] // default: 'public'
  status:          enum ['uploading', 'ready', 'deleted'] // default: 'ready'
  createdAt:       Date
  updatedAt:       Date
}
```
</details>

<details>
<summary><strong>Comment</strong></summary>

```ts
{
  videoId:   ObjectId // ref: Video, index
  userId:    ObjectId // ref: User, index
  content:   String   // max 500 chars
  likeCount: Number   // default: 0
  createdAt: Date
}
```
</details>

<details>
<summary><strong>WatchHistory</strong></summary>

```ts
{
  userId:         ObjectId // ref: User
  videoId:        ObjectId // ref: Video
  watchDuration:  Number   // seconds
  completionRate: Number   // 0–1
  watchedAt:      Date
}
// Index: { userId: 1, watchedAt: -1 }
```
</details>

<details>
<summary><strong>Interaction</strong></summary>

```ts
{
  userId:    ObjectId // ref: User
  videoId:   ObjectId // ref: Video
  type:      enum ['like', 'dislike', 'save']
  createdAt: Date
}
// Index: { userId: 1, videoId: 1 } unique
```
</details>

<details>
<summary><strong>AnalyticsEvent</strong></summary>

```ts
{
  sessionId: String   // index
  userId:    String   // nullable
  videoId:   ObjectId // nullable
  eventType: String
  metadata:  Mixed
  timestamp: Date     // index
}
// TTL index: expireAfterSeconds: 2592000 (30 ngày)
```
</details>

### Error Logging — Sentry

```ts
// Init TRƯỚC khi import Express
Sentry.init({
  dsn: SENTRY_DSN,
  environment: NODE_ENV,
  tracesSampleRate: NODE_ENV === 'production' ? 0.2 : 1.0,
  integrations: [Sentry.mongooseIntegration()],
})

// Sau tất cả routes
Sentry.setupExpressErrorHandler(app)

// Trong auth middleware
Sentry.setUser({ id: req.auth.userId })

// Trong catch blocks
Sentry.captureException(error)
```

### Winston Logger

```ts
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
})
```

> Dùng `logger` thay `console.log` hoàn toàn. Log mọi request: `method`, `url`, `statusCode`, `responseTime`, `userId`.

### Security Middleware

```ts
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(mongoSanitize())
app.use(hpp())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => (req.auth?.userId ? 500 : 100),
  message: { error: 'Too many requests' },
})
app.use('/api', limiter)
```

### Tracking Middleware

- Custom Express middleware ghi lại page views và API calls
- Batch insert vào MongoDB mỗi **30 giây** dùng `setInterval`
- Không block request, dùng `process.nextTick` để async

### API Routes

| Method | Route | Mô tả | Auth |
|---|---|---|---|
| `GET` | `/health` | Healthcheck | — |
| `POST` | `/api/webhooks/clerk` | Clerk webhook | — |
| `GET` | `/api/imagekit/auth` | Lấy ImageKit upload params | ✅ |
| `POST` | `/api/videos` | Lưu metadata sau upload | ✅ |
| `GET` | `/api/videos` | List videos public (paginated) | — |
| `GET` | `/api/videos/:id` | Video detail + tăng viewCount | — |
| `PUT` | `/api/videos/:id` | Update title/desc/tags | ✅ owner |
| `DELETE` | `/api/videos/:id` | Xóa video + ImageKit file | ✅ owner |
| `GET` | `/api/videos/:id/stream-url` | Lấy signed streaming URL | — |
| `GET` | `/api/videos/recommendations` | Gợi ý video (tag-based) | — |
| `GET` | `/api/search?q=` | Full-text search | — |
| `POST` | `/api/videos/:id/like` | Toggle like | ✅ |
| `POST` | `/api/videos/:id/comment` | Thêm comment | ✅ |
| `GET` | `/api/videos/:id/comments` | List comments (paginated) | — |
| `GET` | `/api/users/:id` | Profile public | — |
| `GET` | `/api/users/me` | Profile của mình | ✅ |
| `PUT` | `/api/users/me` | Update profile | ✅ |
| `POST` | `/api/users/:id/subscribe` | Subscribe/unsubscribe | ✅ |
| `POST` | `/api/analytics/events` | Batch track events | optional |
| `GET` | `/api/analytics/videos/:id` | Stats video | ✅ owner |
| `GET` | `/api/analytics/dashboard` | Dashboard creator | ✅ |

### Recommendation Logic

```ts
// Lấy tags từ 10 video gần xem nhất của user
// Tìm videos có tags overlap, loại trừ đã xem
// Fallback: trending (top viewCount 24h)

const pipeline = [
  {
    $match: {
      tags: { $in: userTags },
      _id: { $nin: watchedIds },
      visibility: 'public',
      status: 'ready',
    },
  },
  {
    $addFields: {
      score: { $size: { $setIntersection: ['$tags', userTags] } },
    },
  },
  { $sort: { score: -1, viewCount: -1 } },
  { $limit: 20 },
]
```

### Pagination Helper (Cursor-based)

```ts
const query = lastId ? { _id: { $lt: lastId }, ...filters } : filters
const videos = await Video.find(query).sort({ _id: -1 }).limit(limit + 1)
const hasMore = videos.length > limit

return {
  data: videos.slice(0, limit),
  hasMore,
  nextCursor: hasMore ? videos[limit - 1]._id : null,
}
```

---

## 🎨 Frontend — Vite + React + TypeScript

### Setup

- **Vite 5**, React 18, TypeScript strict
- Path alias: `@/` → `src/`
- **Tailwind CSS** + **shadcn/ui** làm component base
- `react-hot-toast` cho notifications

### Axios Setup

```ts
// src/lib/axios.ts
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

api.interceptors.request.use(async (config) => {
  const token = await getToken() // Clerk getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      // Clerk xử lý redirect tự động
    }
    if (error.response?.status === 429) {
      toast.error('Quá nhiều request, thử lại sau')
    }
    if (error.response?.status >= 500) {
      toast.error('Lỗi server, thử lại sau')
      Sentry.captureException(error)
    }
    return Promise.reject(error)
  }
)
```

### TanStack Query

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (count, error) => count < 2 && error.response?.status !== 404,
      refetchOnWindowFocus: false,
    },
  },
})

// Query keys factory
export const videoKeys = {
  all: ['videos'] as const,
  lists: () => [...videoKeys.all, 'list'] as const,
  detail: (id: string) => [...videoKeys.all, 'detail', id] as const,
  recommendations: () => [...videoKeys.all, 'recommendations'] as const,
}

// Infinite scroll
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: videoKeys.lists(),
  queryFn: ({ pageParam }) =>
    api.get('/videos', { params: { cursor: pageParam } }),
  getNextPageParam: (last) => last.data.nextCursor ?? undefined,
  initialPageParam: undefined,
})

// Optimistic update cho like
const likeMutation = useMutation({
  mutationFn: (videoId: string) => api.post(`/videos/${videoId}/like`),
  onMutate: async (videoId) => {
    await queryClient.cancelQueries({ queryKey: videoKeys.detail(videoId) })
    const prev = queryClient.getQueryData(videoKeys.detail(videoId))
    queryClient.setQueryData(videoKeys.detail(videoId), (old) => ({
      ...old,
      likeCount: old.isLiked ? old.likeCount - 1 : old.likeCount + 1,
      isLiked: !old.isLiked,
    }))
    return { prev }
  },
  onError: (_, videoId, ctx) => {
    queryClient.setQueryData(videoKeys.detail(videoId), ctx?.prev)
  },
  onSettled: (_, __, videoId) => {
    queryClient.invalidateQueries({ queryKey: videoKeys.detail(videoId) })
  },
})
```

### Zustand Stores

```ts
// usePlayerStore — persist volume vào localStorage
interface PlayerState {
  currentVideo: Video | null
  isPlaying:    boolean
  volume:       number  // 0–1
  currentTime:  number
  setCurrentVideo: (v: Video) => void
  setPlaying:      (v: boolean) => void
  setVolume:       (v: number) => void
}

// useTrackingStore — sessionId persist sessionStorage
interface TrackingState {
  sessionId: string
  events:    TrackingEvent[]
  addEvent:  (e: Omit<TrackingEvent, 'sessionId' | 'timestamp'>) => void
  flush:     () => Promise<void>
}
// flush tự động mỗi 10s ở App.tsx + window beforeunload

// useUIStore
interface UIState {
  theme:         'light' | 'dark'
  sidebarOpen:   boolean
  toggleTheme:   () => void
  toggleSidebar: () => void
}
```

### Video Player — HTML5 `<video>`

> Không dùng `hls.js`, dùng `<video>` native.

```tsx
// Component: VideoPlayer.tsx
const videoRef = useRef<HTMLVideoElement>()

// Custom controls
// play/pause · seek bar · volume · mute · fullscreen · PiP · speed (0.5/1/1.25/1.5/2x)

// Keyboard shortcuts
// Space → play/pause
// F     → fullscreen
// ← →   → seek ±5s
// ↑ ↓   → volume

// URL
imagekit.url({ path, transformation: [{ format: 'mp4' }] })
// Private → GET /api/videos/:id/stream-url lấy signed URL trước

// Tracking: gửi event mỗi 5s khi đang play
```

### Video Upload — ImageKit SDK

```ts
import ImageKit from 'imagekit-javascript'

const imagekit = new ImageKit({
  publicKey:              import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
  urlEndpoint:            import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
  authenticationEndpoint: `${import.meta.env.VITE_API_URL}/imagekit/auth`,
})

const handleUpload = async (file: File) => {
  // 1. Upload lên ImageKit
  const result = await imagekit.upload({
    file,
    fileName:        `${userId}_${Date.now()}_${file.name}`,
    folder:          `/videos/${userId}`,
    tags:            form.tags,
    useUniqueFileName: false,
    onUploadProgress: (e) => setProgress(e.loaded / e.total * 100),
  })

  // 2. Lưu metadata vào backend
  await api.post('/videos', {
    imageKitFileId: result.fileId,
    imageKitUrl:    result.url,
    imageKitPath:   result.filePath,
    thumbnailUrl:   result.thumbnailUrl,
    duration:       await getVideoDuration(file),
    ...form,
  })
}

// Drag & drop: react-dropzone
// accept: { 'video/mp4': ['.mp4'], 'video/webm': ['.webm'] }
// maxSize: 500MB

// Lấy duration từ file local
const getVideoDuration = (file: File): Promise<number> =>
  new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => resolve(Math.round(video.duration))
    video.src = URL.createObjectURL(file)
  })
```

### Tracking — Client Side

```ts
// Hook: useTracking.ts
export const useTracking = (videoId?: string) => {
  const { addEvent } = useTrackingStore()
  const { userId }   = useAuth()

  const track = useCallback(
    (eventType: string, metadata?: object) => {
      addEvent({ eventType, videoId, userId, metadata })
    },
    [videoId, userId]
  )

  return { track }
}
```

| Event | Trigger |
|---|---|
| `video_play` | Nhấn play |
| `video_pause` | Nhấn pause |
| `video_seek` | Kéo seek bar |
| `video_ended` | Video kết thúc |
| `video_progress` | Mỗi 25% (25/50/75/100) |
| `like_click` | Nhấn like |
| `comment_submit` | Gửi comment |
| `share_click` | Nhấn share |
| `page_view` | Vào trang |
| `search_submit` | Tìm kiếm |

```ts
// Batch flush ở App.tsx
useEffect(() => {
  const id = setInterval(flushEvents, 10000)
  window.addEventListener('beforeunload', flushEvents)
  return () => {
    clearInterval(id)
    window.removeEventListener('beforeunload', flushEvents)
    flushEvents()
  }
}, [])

// Infinite scroll
const { ref: sentinelRef } = useInView({
  onChange: (inView) => { if (inView && hasNextPage) fetchNextPage() },
})
// <div ref={sentinelRef} /> ở cuối list
```

### Routes — React Router v6 (Lazy)

| Path | Page | Auth |
|---|---|---|
| `/` | Home — video grid + recommendations | — |
| `/watch/:id` | Watch — player + comments + related | — |
| `/upload` | Upload | ✅ |
| `/studio` | Studio dashboard | ✅ |
| `/studio/video/:id` | Edit video | ✅ |
| `/channel/:id` | Channel profile | — |
| `/search` | Search results | — |
| `/subscriptions` | Feed subscriptions | ✅ |
| `/history` | Watch history | ✅ |

---

## 🗂️ Project Structure

### Backend

```
src/
├── config/
│   ├── db.ts              ← mongoose connect
│   ├── imagekit.ts        ← imagekit instance
│   ├── redis.ts           ← ioredis (cache only)
│   └── sentry.ts          ← Sentry.init (import đầu tiên)
├── middleware/
│   ├── auth.ts            ← requireAuth wrapper
│   ├── errorHandler.ts    ← global error handler + Sentry
│   ├── requestLogger.ts   ← winston request logging
│   └── trackingBatch.ts   ← batch event collector
├── modules/
│   ├── videos/            ← router · controller · service · schema
│   ├── users/
│   ├── analytics/
│   ├── comments/
│   └── imagekit/          ← auth endpoint
├── utils/
│   ├── pagination.ts
│   ├── apiResponse.ts     ← chuẩn hóa response format
│   └── asyncHandler.ts    ← wrap async route handlers
├── app.ts                 ← Express setup, middleware chain
└── server.ts              ← http.listen, graceful shutdown
```

### Frontend

```
src/
├── api/
│   ├── axios.ts           ← instance + interceptors
│   ├── videos.ts
│   ├── users.ts
│   └── analytics.ts
├── components/
│   ├── ui/                ← shadcn components
│   ├── player/
│   │   ├── VideoPlayer.tsx
│   │   └── PlayerControls.tsx
│   ├── video/
│   │   ├── VideoCard.tsx
│   │   ├── VideoGrid.tsx
│   │   └── UploadForm.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── Sidebar.tsx
├── hooks/
│   ├── useTracking.ts
│   ├── useVideoUpload.ts
│   └── useInfiniteVideos.ts
├── pages/
│   ├── Home.tsx
│   ├── Watch.tsx
│   ├── Upload.tsx
│   └── Studio.tsx
├── stores/
│   ├── playerStore.ts
│   ├── trackingStore.ts
│   └── uiStore.ts
├── types/
│   └── index.ts           ← Video, User, Comment interfaces
├── lib/
│   ├── queryClient.ts
│   ├── imagekit.ts        ← imagekit-javascript instance
│   └── utils.ts           ← cn() · formatDuration() · formatCount()
└── main.tsx
```

---

## 📦 Dependencies

### Backend

```json
{
  "express": "latest",
  "@clerk/express": "latest",
  "mongoose": "latest",
  "imagekit": "latest",
  "ioredis": "latest",
  "@sentry/node": "latest",
  "winston": "latest",
  "helmet": "latest",
  "cors": "latest",
  "express-rate-limit": "latest",
  "express-mongo-sanitize": "latest",
  "hpp": "latest",
  "multer": "latest",
  "zod": "latest",
  "svix": "latest",
  "dotenv": "latest",
  "uuid": "latest"
}
```

`devDependencies`: `typescript@latest` · `ts-node-dev@latest` · `@types/*@latest`

### Frontend

```json
{
  "react": "latest",
  "react-dom": "latest",
  "react-router": "latest",
  "@clerk/clerk-react": "latest",
  "axios": "latest",
  "@tanstack/react-query": "latest",
  "zustand": "latest",
  "imagekit-javascript": "latest",
  "react-dropzone": "latest",
  "react-hook-form": "latest",
  "@hookform/resolvers": "latest",
  "zod": "latest",
  "react-hot-toast": "latest",
  "react-intersection-observer": "latest",
  "lucide-react": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest",
  "date-fns": "latest",
  "uuid": "latest",
  "@sentry/react": "latest"
}
```

---

## ⚙️ Environment Variables

### Backend `.env`

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/videoapp
REDIS_URL=redis://localhost:6379
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
IMAGEKIT_PUBLIC_KEY=public_...
IMAGEKIT_PRIVATE_KEY=private_...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
SENTRY_DSN=https://...@sentry.io/...
CLIENT_URL=http://localhost:5173
LOG_LEVEL=debug
```

### Frontend `.env.local`

```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_IMAGEKIT_PUBLIC_KEY=public_...
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
VITE_SENTRY_DSN=https://...@sentry.io/...
```

---

## 📝 Lưu Ý Implementation

**1. Video streaming** — dùng `<video src={signedUrl}>` thẳng. ImageKit tự handle byte-range requests nên seek hoạt động tốt.

**2. Thumbnail tự động:**
```ts
imagekit.url({
  path: video.imageKitPath,
  transformation: [{ height: 180, width: 320, cropMode: 'extract', focus: 'auto', format: 'jpg' }],
})
```

**3. Redis** — chỉ dùng cho cache đơn giản (video detail, user profile), không cần Bull Queue vì không có transcoding.
```
GET → check Redis → miss → query MongoDB → set Redis TTL 5min
```

**4. Graceful shutdown:**
```ts
process.on('SIGTERM', async () => {
  await mongoose.disconnect()
  server.close(() => process.exit(0))
})
```

**5. apiResponse helper:**
```ts
res.success(data, statusCode?)  // → { success: true, data }
res.error(message, statusCode?) // → { success: false, error: message }
```

**6. asyncHandler wrapper:**
```ts
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)
```
## 🚀 DevOps & Infrastructure

### 1) Containerization

- Backend Dockerfile: Node 20 Alpine, multi-stage build
  - Stage `deps`: cài dependencies
  - Stage `build`: `npm run build`
  - Stage `runtime`: copy `dist` + production deps, chạy non-root user
- Frontend Dockerfile: build static assets bằng Vite, serve qua Nginx (hoặc Caddy)
- Docker Compose local:
  - services: `backend`, `frontend`, `redis`
  - mount env files riêng cho local dev
  - expose ports: `5000`, `5173`, `6379`

### 2) Environment Strategy

- Tách biến môi trường theo `dev`, `staging`, `production`
- Không commit secrets vào git
- Secrets management:
  - GitHub Actions Secrets cho CI/CD
  - Render Environment Variables cho runtime
- Bắt buộc có:
  - `MONGODB_URI`, `REDIS_URL`
  - `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`
  - `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`
  - `SENTRY_DSN`, `CLIENT_URL`

### 3) CI/CD (GitHub Actions)

- Trigger:
  - `pull_request` vào `main`: quality checks
  - `push` vào `main`: build + deploy
- Pipeline bắt buộc:
  - Backend: `npm ci` → `npm run typecheck` → `npm test` → `npm run build`
  - Frontend: `npm ci` → `npm run build`
- Deploy strategy:
  - Auto-deploy Render từ GitHub branch `main`
  - Chỉ deploy khi toàn bộ checks pass

### 4) Deployment Topology (Render)

- `backend` service:
  - healthcheck path: `/health`
  - auto-restart on failure
  - minimal instances: 1
- `frontend` service:
  - static site hoặc web service tùy mô hình
  - chỉ public các assets cần thiết
- Optional:
  - staging services tách biệt để QA trước production

### 5) Observability

- Logging:
  - Winston JSON logs (console + files)
  - Request log fields: `method`, `url`, `statusCode`, `responseTime`, `userId`
- Error tracking:
  - Sentry cho backend + frontend
  - release tagging theo commit SHA
- Metrics tối thiểu:
  - request rate, error rate, p95 latency
  - Mongo query latency
  - Redis hit/miss ratio

### 6) Security Hardening

- Middleware: Helmet, CORS allowlist, sanitize/hpp, rate limit
- CORS chỉ allow frontend domain hợp lệ theo env
- Webhook verify bắt buộc bằng Svix signature (Clerk)
- Rotate keys định kỳ:
  - Clerk keys
  - ImageKit private key
  - Mongo credentials

### 7) Data Safety & Recovery

- MongoDB Atlas:
  - bật automated backups + point-in-time restore (nếu plan hỗ trợ)
- Retention:
  - `AnalyticsEvent` TTL 30 ngày
- Restore drill:
  - test restore định kỳ trên staging

### 8) Release & Rollback

- Release policy:
  - squash merge vào `main`
  - mỗi deploy gắn release note ngắn
- Rollback:
  - Render rollback về deploy trước
  - verify lại `/health` + smoke test critical routes

### 9) Runbooks (On-call)

- Incident checklist:
  1. check `/health`
  2. check Sentry issues spike
  3. check Mongo/Redis connectivity
  4. rollback nếu lỗi production impact cao
- Postmortem template:
  - timeline
  - root cause
  - corrective actions
  - prevention actions
