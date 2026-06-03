import { User } from "./user.schema.js";

interface ClerkUserPayload {
  id: string;
  username?: string | null;
  email_addresses?: Array<{ email_address?: string }>;
  image_url?: string | null;
}

export const upsertUserFromClerk = async (payload: ClerkUserPayload) => {
  const email = payload.email_addresses?.[0]?.email_address ?? "";
  return User.findOneAndUpdate(
    { clerkId: payload.id },
    {
      $set: {
        username: payload.username ?? "",
        email,
        avatar: payload.image_url ?? "",
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
};

export const deleteUserFromClerk = async (clerkId: string) => {
  return User.findOneAndDelete({ clerkId });
};
