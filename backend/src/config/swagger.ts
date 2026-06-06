import { OpenAPIV3 } from "openapi-types";

const ok = (schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): OpenAPIV3.SchemaObject => ({
  type: "object",
  required: ["success", "data"],
  properties: {
    success: { type: "boolean", enum: [true] },
    data: schema,
  },
});

const errorResponse: OpenAPIV3.ResponseObject = {
  description: "Request failed",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
    },
  },
};

const bearerSecurity = [{ clerkBearer: [] }];

export const openApiDocument: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "Video Streaming API",
    version: "1.0.0",
    description:
      "REST API for the video streaming platform. For protected routes, click Authorize and paste the Clerk session token returned by frontend getToken(). Swagger adds the Bearer prefix automatically.",
  },
  servers: [{ url: "/", description: "Current backend" }],
  tags: [
    { name: "System" },
    { name: "Auth" },
    { name: "ImageKit" },
    { name: "Videos" },
    { name: "Users" },
    { name: "Analytics" },
    { name: "Webhooks" },
  ],
  components: {
    securitySchemes: {
      clerkBearer: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Clerk session token from useAuth().getToken(). Paste only the token, without 'Bearer '.",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        required: ["success", "error"],
        properties: {
          success: { type: "boolean", enum: [false] },
          error: { type: "string" },
          details: { type: "array", items: { type: "object" } },
        },
      },
      Video: {
        type: "object",
        properties: {
          _id: { type: "string", example: "665f1d9c2f8db147fa1d0001" },
          title: { type: "string" },
          description: { type: "string" },
          uploaderId: { type: "string", description: "Clerk user ID" },
          imageKitFileId: { type: "string" },
          imageKitUrl: { type: "string", format: "uri" },
          imageKitPath: { type: "string" },
          thumbnailUrl: { type: "string", format: "uri" },
          duration: { type: "number", minimum: 0 },
          fileSize: { type: "number", minimum: 0 },
          mimeType: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          visibility: { type: "string", enum: ["public", "private", "unlisted"] },
          status: { type: "string", enum: ["uploading", "ready", "deleted"] },
          viewCount: { type: "number" },
          likeCount: { type: "number" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateVideoInput: {
        type: "object",
        required: ["title", "imageKitFileId", "imageKitUrl", "imageKitPath"],
        properties: {
          title: { type: "string", minLength: 1, example: "Video demo" },
          description: { type: "string", example: "Mô tả video" },
          imageKitFileId: { type: "string", example: "abc123" },
          imageKitUrl: { type: "string", format: "uri", example: "https://ik.imagekit.io/demo/videos/demo.mp4" },
          imageKitPath: { type: "string", example: "/videos/demo.mp4" },
          thumbnailUrl: { type: "string", format: "uri" },
          duration: { type: "number", minimum: 0, example: 120 },
          fileSize: { type: "number", minimum: 0, example: 10485760 },
          mimeType: { type: "string", maxLength: 100, example: "video/mp4" },
          tags: { type: "array", maxItems: 20, items: { type: "string", maxLength: 50 }, example: ["music", "demo"] },
          visibility: { type: "string", enum: ["public", "private", "unlisted"], default: "public" },
        },
      },
      UpdateVideoInput: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 1 },
          description: { type: "string" },
          tags: { type: "array", maxItems: 20, items: { type: "string", maxLength: 50 } },
          visibility: { type: "string", enum: ["public", "private", "unlisted"] },
        },
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          clerkId: { type: "string" },
          username: { type: "string" },
          email: { type: "string", format: "email" },
          avatar: { type: "string", format: "uri" },
          bio: { type: "string" },
          subscriberCount: { type: "number" },
          subscriptions: { type: "array", items: { type: "string" } },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Comment: {
        type: "object",
        properties: {
          _id: { type: "string" },
          videoId: { type: "string" },
          userId: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/User" }] },
          content: { type: "string", maxLength: 500 },
          likeCount: { type: "number" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      AnalyticsEventInput: {
        type: "object",
        required: ["sessionId", "eventType"],
        properties: {
          sessionId: { type: "string" },
          userId: { type: "string", nullable: true, description: "Ignored when a valid Clerk token is present." },
          videoId: { type: "string", nullable: true },
          eventType: { type: "string", example: "video_progress" },
          metadata: { type: "object", additionalProperties: true },
          timestamp: { type: "string", format: "date-time" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: { "200": { description: "Healthy" } },
      },
    },
    "/api/auth/status": {
      get: {
        tags: ["Auth"],
        summary: "Diagnose Clerk authentication",
        description: "Returns whether the Authorization header reached Express and whether Clerk accepted the token.",
        security: bearerSecurity,
        responses: { "200": { description: "Authentication diagnostic" } },
      },
    },
    "/api/imagekit/auth": {
      get: {
        tags: ["ImageKit"],
        summary: "Get signed ImageKit browser upload parameters",
        security: bearerSecurity,
        responses: {
          "200": { description: "ImageKit token, expiry and signature" },
          "401": errorResponse,
        },
      },
    },
    "/api/videos": {
      get: {
        tags: ["Videos"],
        summary: "List public videos",
        parameters: [{ name: "cursor", in: "query", schema: { type: "string" } }],
        responses: { "200": { description: "Cursor-paginated videos" } },
      },
      post: {
        tags: ["Videos"],
        summary: "Save video metadata after ImageKit upload",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateVideoInput" } },
          },
        },
        responses: {
          "201": {
            description: "Video created",
            content: { "application/json": { schema: ok({ $ref: "#/components/schemas/Video" }) } },
          },
          "400": errorResponse,
          "401": errorResponse,
        },
      },
    },
    "/api/videos/mine": {
      get: {
        tags: ["Videos"],
        summary: "List current user's videos",
        security: bearerSecurity,
        responses: { "200": { description: "Videos" }, "401": errorResponse },
      },
    },
    "/api/videos/recommendations": {
      get: {
        tags: ["Videos"],
        summary: "Get recommended videos",
        security: bearerSecurity,
        responses: { "200": { description: "Recommendations" } },
      },
    },
    "/api/videos/creator/{userId}": {
      get: {
        tags: ["Videos"],
        summary: "List public videos for a MongoDB user ID",
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Videos" }, "404": errorResponse },
      },
    },
    "/api/videos/{id}": {
      get: {
        tags: ["Videos"],
        summary: "Get video detail and increment view count",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Video" }, "404": errorResponse },
      },
      put: {
        tags: ["Videos"],
        summary: "Update an owned video",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateVideoInput" } } },
        },
        responses: { "200": { description: "Updated video" }, "400": errorResponse, "401": errorResponse, "404": errorResponse },
      },
      delete: {
        tags: ["Videos"],
        summary: "Delete an owned video and its ImageKit file",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Deleted" }, "401": errorResponse, "404": errorResponse },
      },
    },
    "/api/videos/{id}/stream-url": {
      get: {
        tags: ["Videos"],
        summary: "Get video stream URL",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Stream URL" }, "404": errorResponse },
      },
    },
    "/api/videos/{id}/like": {
      post: {
        tags: ["Videos"],
        summary: "Toggle like",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Like state and count" }, "401": errorResponse, "404": errorResponse },
      },
    },
    "/api/videos/{id}/comment": {
      post: {
        tags: ["Videos"],
        summary: "Add comment",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["content"],
                properties: { content: { type: "string", minLength: 1, maxLength: 500 } },
              },
            },
          },
        },
        responses: { "201": { description: "Comment created" }, "400": errorResponse, "401": errorResponse },
      },
    },
    "/api/videos/{id}/comments": {
      get: {
        tags: ["Videos"],
        summary: "List comments",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "cursor", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Cursor-paginated comments" } },
      },
    },
    "/api/search": {
      get: {
        tags: ["Videos"],
        summary: "Search public videos",
        parameters: [{ name: "q", in: "query", required: true, schema: { type: "string", maxLength: 100 } }],
        responses: { "200": { description: "Search results" } },
      },
    },
    "/api/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get current user",
        security: bearerSecurity,
        responses: { "200": { description: "Current user" }, "401": errorResponse },
      },
      put: {
        tags: ["Users"],
        summary: "Update current user",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string", minLength: 1 },
                  bio: { type: "string", maxLength: 500 },
                  avatar: { type: "string", format: "uri" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Updated user" }, "400": errorResponse, "401": errorResponse },
      },
    },
    "/api/users/subscriptions/feed": {
      get: {
        tags: ["Users"],
        summary: "Get subscription feed",
        security: bearerSecurity,
        responses: { "200": { description: "Videos" }, "401": errorResponse },
      },
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get public user profile",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "User" }, "404": errorResponse },
      },
    },
    "/api/users/{id}/subscribe": {
      post: {
        tags: ["Users"],
        summary: "Toggle subscription",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Subscription state" }, "401": errorResponse, "404": errorResponse },
      },
    },
    "/api/analytics/events": {
      post: {
        tags: ["Analytics"],
        summary: "Insert analytics events",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "array", items: { $ref: "#/components/schemas/AnalyticsEventInput" } },
            },
          },
        },
        responses: { "200": { description: "Inserted count" }, "400": errorResponse },
      },
    },
    "/api/analytics/videos/{id}": {
      get: {
        tags: ["Analytics"],
        summary: "Get analytics for an owned video",
        security: bearerSecurity,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Video analytics" }, "401": errorResponse, "403": errorResponse },
      },
    },
    "/api/analytics/dashboard": {
      get: {
        tags: ["Analytics"],
        summary: "Get creator dashboard totals",
        security: bearerSecurity,
        responses: { "200": { description: "Dashboard" }, "401": errorResponse },
      },
    },
    "/api/analytics/history": {
      get: {
        tags: ["Analytics"],
        summary: "Get current user's watch history",
        security: bearerSecurity,
        responses: { "200": { description: "History" }, "401": errorResponse },
      },
    },
    "/api/webhooks/clerk": {
      post: {
        tags: ["Webhooks"],
        summary: "Receive Clerk user webhooks",
        description: "Called by Clerk with Svix headers. Do not call from the frontend.",
        responses: { "200": { description: "Received" }, "400": errorResponse },
      },
    },
  },
};
