import { NextFunction, Request, Response } from "express";

export const apiResponse = (_req: Request, res: Response, next: NextFunction) => {
  res.success = (data, statusCode = 200) => {
    res.status(statusCode).json({ success: true, data });
  };

  res.error = (message, statusCode = 400) => {
    res.status(statusCode).json({ success: false, error: message });
  };

  next();
};
