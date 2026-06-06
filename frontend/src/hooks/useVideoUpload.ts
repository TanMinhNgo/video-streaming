import { useState } from "react";
import { createVideo } from "@/api/videos";
import { api } from "@/api/axios";
import { imagekit } from "@/lib/imagekit";

type ImageKitAuth = {
  token: string;
  expire: number;
  signature: string;
};

type ApiOk<T> = { success: true; data: T };

export const useVideoUpload = () => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const getVideoDuration = (file: File): Promise<number> =>
    new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      const objectUrl = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(Math.round(video.duration));
      };
      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(0);
      };
      video.src = objectUrl;
    });

  const upload = async (
    file: File,
    payload: { title: string; description?: string; tags: string[]; visibility: "public" | "private" | "unlisted" },
  ) => {
    setUploading(true);
    setProgress(0);
    try {
      const authResponse = await api.get<ApiOk<ImageKitAuth>>("/imagekit/auth");
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) setProgress((event.loaded / event.total) * 100);
      });
      const result = await imagekit.upload({
        file,
        fileName: `video_${Date.now()}_${file.name}`,
        folder: "/videos",
        tags: payload.tags,
        useUniqueFileName: false,
        xhr,
        ...authResponse.data.data,
      });
      setProgress(100);
      const duration = await getVideoDuration(file);
      await createVideo({
        ...payload,
        imageKitFileId: result.fileId,
        imageKitUrl: result.url,
        imageKitPath: result.filePath,
        thumbnailUrl: result.thumbnailUrl,
        duration,
        fileSize: result.size,
        mimeType: file.type,
      });
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress };
};
