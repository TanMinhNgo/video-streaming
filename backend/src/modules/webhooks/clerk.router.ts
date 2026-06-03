import { Router } from "express";
import { Webhook } from "svix";
import { env } from "../../config/env.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { deleteUserFromClerk, upsertUserFromClerk } from "../users/user.service.js";

export const clerkWebhookRouter = Router();

clerkWebhookRouter.post(
  "/clerk",
  asyncHandler(async (req, res) => {
    if (!env.clerkWebhookSecret) {
      res.error("CLERK_WEBHOOK_SECRET is not configured", 500);
      return;
    }

    const svixId = req.header("svix-id");
    const svixTimestamp = req.header("svix-timestamp");
    const svixSignature = req.header("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      res.error("Missing Svix headers", 400);
      return;
    }

    const wh = new Webhook(env.clerkWebhookSecret);
    const payload = req.body.toString();

    const event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: Record<string, unknown> };

    if (event.type === "user.created" || event.type === "user.updated") {
      await upsertUserFromClerk(event.data as never);
    }

    if (event.type === "user.deleted") {
      const clerkId = typeof event.data.id === "string" ? event.data.id : "";
      if (clerkId) {
        await deleteUserFromClerk(clerkId);
      }
    }

    res.success({ received: true });
  }),
);
