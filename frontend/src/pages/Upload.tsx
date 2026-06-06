import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { FileVideo, UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useVideoUpload } from "@/hooks/useVideoUpload";

export const UploadPage = () => {
  const { getToken } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private" | "unlisted">("public");
  const [file, setFile] = useState<File | null>(null);
  const { upload, uploading, progress } = useVideoUpload();

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "video/mp4": [".mp4"], "video/webm": [".webm"] },
    maxSize: 500 * 1024 * 1024,
    multiple: false,
    onDrop: (files) => setFile(files[0] ?? null),
    onDropRejected: (rejections) => {
      const code = rejections[0]?.errors[0]?.code;
      toast.error(code === "file-too-large" ? "Video vượt quá giới hạn 500 MB" : "Chỉ hỗ trợ file MP4 hoặc WebM");
    },
  });

  const onSubmit = async () => {
    if (!file) return toast.error("Chọn file video");
    const tk = await getToken();
    if (!tk) return toast.error("Bạn cần đăng nhập");
    if (!title.trim()) return toast.error("Nhập tiêu đề video");
    const run = upload(file, {
      title: title.trim(),
      description,
      tags: tags.split(",").map((v) => v.trim()).filter(Boolean),
      visibility,
    }, tk);
    try {
      await toast.promise(run, {
        loading: "Đang tải video...",
        success: "Tải video thành công",
        error: "Tải video thất bại",
      });
      setFile(null);
      setTitle("");
      setDescription("");
      setTags("");
      setVisibility("public");
    } catch {
      // Toast above already presents the upload error.
    }
  };

  return (
    <div className="space-y-4">
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <h1 className="text-xl font-semibold">Tải video lên</h1>
          <p className="mt-1 text-sm text-muted-foreground">Video được tải trực tiếp lên ImageKit, tối đa 500 MB.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            {...getRootProps()}
            className="cursor-pointer rounded-xl border border-dashed p-8 text-center transition hover:border-foreground/40 hover:bg-accent/50"
          >
            <input {...getInputProps()} />
            {file ? <FileVideo className="mx-auto mb-3 size-8" /> : <UploadCloud className="mx-auto mb-3 size-8 text-muted-foreground" />}
            <p className="break-all text-sm font-medium">{file ? file.name : "Kéo thả video hoặc chọn từ thiết bị"}</p>
            <p className="mt-1 text-xs text-muted-foreground">MP4 hoặc WebM</p>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Tiêu đề</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Nhập tiêu đề video" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Mô tả</span>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} placeholder="Giới thiệu nội dung video" rows={5} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Tags</span>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="music, tutorial" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Quyền riêng tư</span>
              <select
                value={visibility}
                onChange={(event) => setVisibility(event.target.value as typeof visibility)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="public">Công khai</option>
                <option value="unlisted">Không công khai</option>
                <option value="private">Riêng tư</option>
              </select>
            </label>
          </div>
          {uploading ? (
            <div className="space-y-1.5" aria-live="polite">
              <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-foreground transition-[width]" style={{ width: `${progress}%` }} /></div>
              <p className="text-right text-xs tabular-nums text-muted-foreground">{Math.round(progress)}%</p>
            </div>
          ) : null}
          <Button className="w-full sm:w-auto" type="button" disabled={!file || !title.trim() || uploading} onClick={onSubmit}>
            {uploading ? "Đang tải..." : "Tải video"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
