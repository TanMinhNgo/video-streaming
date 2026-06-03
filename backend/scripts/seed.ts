import dotenv from "dotenv";
import mongoose from "mongoose";
import { Comment } from "../src/modules/comments/comment.schema.ts";
import { User } from "../src/modules/users/user.schema.ts";
import { Video } from "../src/modules/videos/video.schema.ts";

dotenv.config();

const sampleVideoUrl = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const users = [
  {
    clerkId: "sample_clerk_01",
    username: "Frame Lab",
    email: "frame@example.com",
    avatar: "",
    bio: "Short documentaries, creator workflows, and quiet visual essays.",
    subscriberCount: 18400,
  },
  {
    clerkId: "sample_clerk_02",
    username: "Motion Notes",
    email: "motion@example.com",
    avatar: "",
    bio: "Field tests and production notes for modern video teams.",
    subscriberCount: 9200,
  },
];

const videoSeed = [
  ["Morning Color Grade Walkthrough", "editing", "color", "workflow", 48200, 1800],
  ["Desk Setup for Fast Upload Days", "studio", "upload", "creator", 35100, 1200],
  ["Progressive MP4 Streaming Test", "streaming", "player", "imagekit", 76400, 3100],
  ["Creator Analytics Review", "analytics", "creator", "dashboard", 21900, 760],
  ["Search Tags That Actually Help", "search", "metadata", "tags", 55800, 2400],
  ["Compact Studio Lighting Notes", "lighting", "studio", "production", 29800, 980],
] as const;

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required");

  await mongoose.connect(uri, { maxPoolSize: 10 });

  await Promise.all([
    Comment.deleteMany({ content: { $regex: "^Sample:" } }),
    Video.deleteMany({ imageKitFileId: { $regex: "^sample_" } }),
    User.deleteMany({ clerkId: { $in: users.map((user) => user.clerkId) } }),
  ]);

  const createdUsers = await User.insertMany(users);
  const videos = await Video.insertMany(
    videoSeed.map(([title, tagA, tagB, tagC, viewCount, likeCount], index) => ({
      title,
      description: `Sample: ${title.toLowerCase()} for testing feeds, playback, search, and creator analytics.`,
      uploaderId: createdUsers[index % createdUsers.length].clerkId,
      imageKitFileId: `sample_${index + 1}`,
      imageKitUrl: sampleVideoUrl,
      imageKitPath: `/samples/sample-${index + 1}.mp4`,
      thumbnailUrl: `https://picsum.photos/seed/streambox-seed-${index + 1}/960/540`,
      duration: 30,
      tags: [tagA, tagB, tagC],
      visibility: "public",
      status: "ready",
      viewCount,
      likeCount,
    })),
  );

  await Comment.insertMany(
    videos.slice(0, 3).flatMap((video) => [
      {
        videoId: video._id,
        userId: createdUsers[0]._id,
        content: "Sample: playback and metadata look ready.",
        likeCount: 12,
      },
      {
        videoId: video._id,
        userId: createdUsers[1]._id,
        content: "Sample: useful for testing comments and creator pages.",
        likeCount: 8,
      },
    ]),
  );

  console.log(`Seeded ${createdUsers.length} users, ${videos.length} videos, and ${videos.slice(0, 3).length * 2} comments.`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
