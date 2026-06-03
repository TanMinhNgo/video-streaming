export interface User {
  _id: string;
  clerkId: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  subscriberCount: number;
}

export interface Video {
  _id: string;
  title: string;
  description: string;
  imageKitUrl: string;
  imageKitPath: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  visibility: "public" | "private" | "unlisted";
  tags: string[];
  uploaderId: string;
  createdAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  likeCount: number;
  userId: Pick<User, "_id" | "username" | "avatar">;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  hasMore: boolean;
  nextCursor: string | null;
}

