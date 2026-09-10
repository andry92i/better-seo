"use client";
import { create } from "zustand";
export const useAppStore = create<{ projectId: string; selectProject: (id: string) => void }>(set => ({
  projectId: "", selectProject: projectId => set({ projectId }),
}));
