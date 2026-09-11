"use client";
import { useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { useRouter } from "next/navigation";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { profileSchema } from "@/lib/profile-schema";
import { api } from "@/lib/project-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DisplayControls } from "@/components/display-controls";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

type Profile = { name: string; email: string; image: string; emailVerified: boolean; createdAt: string };
export function ProfileForm({ user }: { user: Profile }) {
  const t = useTranslations("profile");
  const format = useFormatter();
  const router = useRouter();
  const { refetch: refreshSession } = authClient.useSession();
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(user.image);
  const [saved, setSaved] = useState({ name: user.name, image: user.image });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const valid = profileSchema.safeParse({ name, image }).success;
  const dirty = name.trim() !== saved.name || image !== saved.image;
  return <div className="mx-auto flex max-w-4xl flex-col gap-6">
    <header><h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1><p className="mt-2 text-muted-foreground">{t("description")}</p></header>
    <Tabs defaultValue="personal" className="gap-6"><TabsList variant="line" aria-label={t("title")}><TabsTrigger value="personal">{t("personal")}</TabsTrigger><TabsTrigger value="preferences">{t("preferences")}</TabsTrigger></TabsList><TabsContent value="personal"><form onSubmit={async e => { e.preventDefault(); if (!valid || pending) return; setError(""); setSuccess(false); setPending(true); try { await api("/api/profile", { method: "PATCH", body: JSON.stringify({ name: name.trim(), image }) }); setSaved({ name: name.trim(), image }); setSuccess(true); await refreshSession({ query: { disableCookieCache: true } }); router.refresh(); } catch { setError(t("saveError")); } finally { setPending(false); } }}>
      <Card><CardHeader><div className="flex items-center gap-4"><Avatar size="lg"><AvatarImage src={saved.image || undefined} alt=""/><AvatarFallback>{saved.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div><CardTitle>{t("personal")}</CardTitle><CardDescription>{t("personalDescription")}</CardDescription></div></div></CardHeader><CardContent><FieldGroup>
        <Field><FieldLabel htmlFor="profile-name">{t("name")}</FieldLabel><Input id="profile-name" name="name" autoComplete="name" required maxLength={100} value={name} disabled={pending} onChange={e => { setName(e.target.value); setSuccess(false); }}/></Field>
        <Field data-invalid={image !== "" && !profileSchema.shape.image.safeParse(image).success}><FieldLabel htmlFor="profile-image">{t("image")}</FieldLabel><Input id="profile-image" type="url" value={image} maxLength={2048} disabled={pending} aria-invalid={image !== "" && !profileSchema.shape.image.safeParse(image).success} onChange={e => { setImage(e.target.value); setSuccess(false); }} placeholder="https://…"/><FieldDescription>{t("imageHelp")}</FieldDescription></Field>
        <Field><FieldLabel htmlFor="profile-email">{t("email")}</FieldLabel><Input id="profile-email" value={user.email} readOnly autoComplete="email"/><FieldDescription>{t("emailHelp")}</FieldDescription></Field>
      </FieldGroup></CardContent><CardFooter className="flex-wrap justify-between gap-3"><p role={error ? "alert" : "status"} className={error ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>{error || (success ? t("saved") : dirty ? t("unsaved") : "")}</p><Button type="submit" disabled={pending || !valid || !dirty}>{pending ? <Loader2 data-icon="inline-start" className="size-4 animate-spin"/> : <Save data-icon="inline-start" className="size-4"/>}{pending ? t("saving") : t("save")}</Button></CardFooter></Card>
    </form></TabsContent><TabsContent value="preferences">
    <div className="grid gap-6 md:grid-cols-2"><Card><CardHeader><CardTitle>{t("account")}</CardTitle></CardHeader><CardContent><dl className="flex flex-col gap-4 text-sm"><div><dt className="text-muted-foreground">{t("joined")}</dt><dd className="mt-1">{format.dateTime(new Date(user.createdAt), { dateStyle: "long" })}</dd></div><div><dt className="text-muted-foreground">{t("verification")}</dt><dd className="mt-1 flex items-center gap-2">{user.emailVerified && <ShieldCheck className="size-4"/>}{user.emailVerified ? t("verified") : t("unverified")}</dd></div></dl></CardContent></Card><Card><CardHeader><CardTitle>{t("preferences")}</CardTitle><CardDescription>{t("preferencesHelp")}</CardDescription></CardHeader><CardContent><DisplayControls/></CardContent></Card></div>
    </TabsContent></Tabs>
  </div>;
}
