import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export const metadata: Metadata = { title: "Configuration du projet" };

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
