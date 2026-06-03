import type { Comment, Paginated, User, Video } from "@/types";

const sampleVideoUrl = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export const sampleUsers: User[] = [
  {
    _id: "sample-user-01",
    clerkId: "sample_clerk_01",
    username: "Frame Lab",
    email: "frame@example.com",
    avatar: "",
    bio: "Short documentaries, creator workflows, and quiet visual essays.",
    subscriberCount: 18400,
  },
  {
    _id: "sample-user-02",
    clerkId: "sample_clerk_02",
    username: "Motion Notes",
    email: "motion@example.com",
    avatar: "",
    bio: "Field tests and production notes for modern video teams.",
    subscriberCount: 9200,
  },
];

export const sampleVideos: Video[] = [
  {
    _id: "sample-01",
    title: "Morning Color Grade Walkthrough",
    description: "A compact breakdown of contrast, skin tone, and natural light choices for a cafe scene.",
    imageKitUrl: sampleVideoUrl,
    imageKitPath: "/samples/morning-color-grade.mp4",
    thumbnailUrl: "https://picsum.photos/seed/streambox-grade/960/540",
    viewCount: 48200,
    likeCount: 1800,
    visibility: "public",
    tags: ["editing", "color", "workflow"],
    uploaderId: "sample-user-01",
    createdAt: "2026-05-28T08:30:00.000Z",
  },
  {
    _id: "sample-02",
    title: "Desk Setup for Fast Upload Days",
    description: "How a creator station is arranged for recording, metadata checks, and direct cloud upload.",
    imageKitUrl: sampleVideoUrl,
    imageKitPath: "/samples/desk-upload-flow.mp4",
    thumbnailUrl: "https://picsum.photos/seed/streambox-desk/960/540",
    viewCount: 35100,
    likeCount: 1200,
    visibility: "public",
    tags: ["studio", "upload", "creator"],
    uploaderId: "sample-user-02",
    createdAt: "2026-05-26T12:00:00.000Z",
  },
  {
    _id: "sample-03",
    title: "Progressive MP4 Streaming Test",
    description: "A simple playback sample for native video controls, seeking, and watch event tracking.",
    imageKitUrl: sampleVideoUrl,
    imageKitPath: "/samples/progressive-stream.mp4",
    thumbnailUrl: "https://picsum.photos/seed/streambox-player/960/540",
    viewCount: 76400,
    likeCount: 3100,
    visibility: "public",
    tags: ["streaming", "player", "imagekit"],
    uploaderId: "sample-user-01",
    createdAt: "2026-05-24T15:45:00.000Z",
  },
  {
    _id: "sample-04",
    title: "Creator Analytics Review",
    description: "Reading retention, watch duration, and search intent before planning the next upload.",
    imageKitUrl: sampleVideoUrl,
    imageKitPath: "/samples/creator-analytics.mp4",
    thumbnailUrl: "https://picsum.photos/seed/streambox-analytics/960/540",
    viewCount: 21900,
    likeCount: 760,
    visibility: "public",
    tags: ["analytics", "creator", "dashboard"],
    uploaderId: "sample-user-02",
    createdAt: "2026-05-21T10:20:00.000Z",
  },
  {
    _id: "sample-05",
    title: "Search Tags That Actually Help",
    description: "A practical pass through video titles, descriptions, and tags for a better discovery feed.",
    imageKitUrl: sampleVideoUrl,
    imageKitPath: "/samples/search-tags.mp4",
    thumbnailUrl: "https://picsum.photos/seed/streambox-search/960/540",
    viewCount: 55800,
    likeCount: 2400,
    visibility: "public",
    tags: ["search", "metadata", "tags"],
    uploaderId: "sample-user-01",
    createdAt: "2026-05-18T18:15:00.000Z",
  },
  {
    _id: "sample-06",
    title: "Compact Studio Lighting Notes",
    description: "A small-room lighting setup with practical fixtures, soft fill, and clean shadows.",
    imageKitUrl: sampleVideoUrl,
    imageKitPath: "/samples/studio-lighting.mp4",
    thumbnailUrl: "https://picsum.photos/seed/streambox-lighting/960/540",
    viewCount: 29800,
    likeCount: 980,
    visibility: "public",
    tags: ["lighting", "studio", "production"],
    uploaderId: "sample-user-02",
    createdAt: "2026-05-15T09:05:00.000Z",
  },
];

export const sampleComments: Comment[] = [
  {
    _id: "sample-comment-01",
    content: "The native player seek behavior feels smooth with this setup.",
    likeCount: 12,
    userId: { _id: "sample-user-02", username: "Motion Notes", avatar: "" },
    createdAt: "2026-05-29T09:10:00.000Z",
  },
  {
    _id: "sample-comment-02",
    content: "The metadata examples are useful for testing search and recommendations.",
    likeCount: 8,
    userId: { _id: "sample-user-01", username: "Frame Lab", avatar: "" },
    createdAt: "2026-05-29T11:40:00.000Z",
  },
];

export const toPaginatedVideos = (videos = sampleVideos): Paginated<Video> => ({
  data: videos,
  hasMore: false,
  nextCursor: null,
});

export const findSampleVideo = (id: string) => sampleVideos.find((video) => video._id === id) ?? sampleVideos[0];

export const searchSampleVideos = (query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return sampleVideos;
  return sampleVideos.filter((video) =>
    [video.title, video.description, ...video.tags].some((value) => value.toLowerCase().includes(normalized)),
  );
};

export const sampleUserById = (id: string) =>
  sampleUsers.find((user) => user._id === id || user.clerkId === id) ?? sampleUsers[0];
