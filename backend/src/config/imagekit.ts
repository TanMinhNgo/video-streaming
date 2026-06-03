import ImageKit from "imagekit";
import { env } from "./env.ts";

let imagekitInstance: ImageKit | null = null;

export const getImageKit = () => {
  if (!env.imagekitPublicKey || !env.imagekitPrivateKey || !env.imagekitUrlEndpoint) {
    throw new Error("ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT.");
  }

  imagekitInstance ??= new ImageKit({
    publicKey: env.imagekitPublicKey,
    privateKey: env.imagekitPrivateKey,
    urlEndpoint: env.imagekitUrlEndpoint,
  });

  return imagekitInstance;
};
