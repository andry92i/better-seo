import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false } };
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return <AppShell>{children}</AppShell>;
}
