"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OnboardingProfile } from "@/lib/types";

const initialProfile: OnboardingProfile = { role: "", seoLevel: "", businessType: "", goals: [], websiteUrl: "https://github.com", competitors: [], googleConnected: false };
type AppStore = { profile: OnboardingProfile; auditComplete: boolean; updateProfile: (data: Partial<OnboardingProfile>) => void; completeAudit: () => void; reset: () => void };

export const useAppStore = create<AppStore>()(persist((set) => ({
  profile: initialProfile,
  auditComplete: false,
  updateProfile: (data) => set((state) => ({ profile: { ...state.profile, ...data } })),
  completeAudit: () => set({ auditComplete: true }),
  reset: () => set({ profile: initialProfile, auditComplete: false }),
}), { name: "better-seo-workspace" }));
