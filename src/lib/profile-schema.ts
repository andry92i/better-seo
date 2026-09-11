import { z } from "zod";

// Identity, email and verification are never editable through this endpoint.
export const profileSchema = z.object({
  name: z.string().trim().min(1).max(100),
  image: z.union([z.literal(""), z.url().max(2048).refine(value => {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  })]),
}).strict();
