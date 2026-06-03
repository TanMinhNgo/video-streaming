import "express";

declare global {
  namespace Express {
    interface Response {
      success: <T>(data: T, statusCode?: number) => void;
      error: (message: string, statusCode?: number) => void;
    }
  }
}

export {};
