export type SeoLevel = "Débutant" | "Intermédiaire" | "Avancé" | "Expert";
export type BusinessType = "SaaS" | "E-commerce" | "Service local" | "Média / Blog" | "Agence";

export type OnboardingProfile = {
  role: string;
  seoLevel: SeoLevel | "";
  businessType: BusinessType | "";
  goals: string[];
  websiteUrl: string;
  competitors: string[];
  googleConnected: boolean;
};

export type Finding = { id: string; title: string; detail: string; impact: "Critique" | "Élevé" | "Moyen" | "Faible"; category: string; effort: string };
export type Recommendation = { slug: string; title: string; description: string; impact: string; time: string; badge: string };
