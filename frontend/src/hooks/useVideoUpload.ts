import { useState } from "react";
import { createVideo } from "@/api/videos";
import { imagekit } from "@/lib/imagekit";

export const useVideoUpload = (token?: string | null) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const getVideoDuration = (file: File): Promise<number> =>
    new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => resolve(Math.round(video.duration));
      video.src = URL.createObjectURL(file);
    });

  const upload = async (file: File, payload: { title: string; description?: string; tags: string[] }) => {
    if (!token) throw new Error("Unauthorized");
    setUploading(true);
    try {
      const result = (await (imagekit as any).upload({
        file,
        fileName: `video_${Date.now()}_${file.name}`,
        folder: "/videos",
        tags: payload.tags,
        useUniqueFileName: false,
      })) as any;
      setProgress(100);
      const duration = await getVideoDuration(file);
      await createVideo(
        {
          ...payload,
          imageKitFileId: result.fileId,
          imageKitUrl: result.url,
          imageKitPath: result.filePath,
          thumbnailUrl: result.thumbnailUrl,
          duration,
        },
        token,
      );
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress };
};
