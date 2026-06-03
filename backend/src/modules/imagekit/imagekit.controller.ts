import { Request, Response } from "express";
import { imagekit } from "../../config/imagekit.js";

export const getImageKitAuth = (_req: Request, res: Response) => {
  const auth = imagekit.getAuthenticationParameters();
  res.success(auth);
};
