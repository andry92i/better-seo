"use server";

import { z } from "zod";
import { actionClient } from "@/lib/safe-action";

const onboardingSchema = z.object({
  websiteUrl: z.url(),
  role: z.string().min(2),
  seoLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  businessType: z.enum(["SAAS", "ECOMMERCE", "LOCAL_SERVICE", "PUBLISHER", "AGENCY"]),
  goals: z.array(z.string()).min(1),
});

export const validateOnboardingAction = actionClient.inputSchema(onboardingSchema).action(async ({ parsedInput }) => ({ validated: true, profile: parsedInput }));
