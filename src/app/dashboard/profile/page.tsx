import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const { name, email, image, emailVerified, createdAt } = session.user;
  return <ProfileForm user={{ name, email, image: image ?? "", emailVerified, createdAt: createdAt.toISOString() }}/>;
}
