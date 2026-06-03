import ImageKit from "imagekit";
import { env } from "./env.js";

export const imagekit = new ImageKit({
  publicKey: env.imagekitPublicKey,
  privateKey: env.imagekitPrivateKey,
  urlEndpoint: env.imagekitUrlEndpoint,
});
