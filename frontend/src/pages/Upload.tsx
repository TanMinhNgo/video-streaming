import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";
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
  const [file, setFile] = useState<File | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { upload, uploading, progress } = useVideoUpload(token);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "video/mp4": [".mp4"], "video/webm": [".webm"] },
    maxSize: 500 * 1024 * 1024,
    multiple: false,
    onDrop: (files) => setFile(files[0] ?? null),
  });

  const onSubmit = async () => {
    if (!file) return toast.error("Chọn file video");
    const tk = await getToken();
    if (!tk) return toast.error("Bạn cần đăng nhập");
    setToken(tk);
    const run = upload(file, {
      title,
      description,
      tags: tags.split(",").map((v) => v.trim()).filter(Boolean),
    });
    await toast.promise(run, {
      loading: "Uploading video...",
      success: "Upload thành công",
      error: "Upload thất bại",
    });
    setFile(null);
    setTitle("");
    setDescription("");
    setTags("");
  };

  return (
    <main className="space-y-4">
      <Card>
        <CardHeader><h1 className="text-xl font-semibold">Upload Video</h1></CardHeader>
        <CardContent className="space-y-3">
      <p className="text-sm text-muted-foreground">Upload direct to ImageKit and publish metadata instantly.</p>
      <div {...getRootProps()} className="cursor-pointer rounded-lg border border-dashed p-6 text-center">
        <input {...getInputProps()} />
        <p>{file ? file.name : "Kéo thả video hoặc click để chọn"}</p>
      </div>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={5} />
      <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tag1, tag2" />
      <Button type="button" disabled={!file || !title || uploading} onClick={onSubmit}>
        {uploading ? `Uploading ${Math.round(progress)}%` : "Upload"}
      </Button>
      </CardContent>
      </Card>
    </main>
  );
};
