import { Request, Response } from "express";
import { getImageKit } from "../../config/imagekit.ts";

export const getImageKitAuth = (_req: Request, res: Response) => {
  const imagekit = getImageKit();
  const auth = imagekit.getAuthenticationParameters();
  res.success(auth);
};
