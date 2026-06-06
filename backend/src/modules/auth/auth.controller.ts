import { Request, Response } from "express";
import { getRequestAuth } from "../../middleware/auth.ts";

export const getAuthStatus = (req: Request, res: Response) => {
  const auth = getRequestAuth(req);
  const authorization = req.header("authorization");
  const hasBearerToken = authorization?.startsWith("Bearer ") ?? false;

  res.success({
    isAuthenticated: Boolean(auth.userId),
    userId: auth.userId ?? null,
    sessionId: auth.sessionId ?? null,
    authorizationHeaderPresent: Boolean(authorization),
    bearerTokenPresent: hasBearerToken,
    diagnostic: auth.userId
      ? "Clerk token is valid."
      : hasBearerToken
        ? "Bearer token was received but Clerk did not authenticate it. Verify that frontend and backend keys belong to the same Clerk instance and environment."
        : "No Bearer token was received. Send Authorization: Bearer <Clerk session token>.",
  });
};
