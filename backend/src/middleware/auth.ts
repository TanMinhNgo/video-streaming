import { getAuth } from "@clerk/express";
import { Request } from "express";

export const getRequestAuth = (req: Request) => getAuth(req);

export const getRequestUserId = (req: Request) => getRequestAuth(req).userId ?? undefined;
