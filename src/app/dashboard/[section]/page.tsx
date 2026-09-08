import { notFound } from "next/navigation";
import { SeoPage, type Section } from "@/components/seo-pages";
const routes = ["keywords","competitors","audit","content","backlinks","local","reports","integrations","settings"];
export function generateStaticParams() { return routes.map(section => ({section})); }
export default async function Page({params}:{params:Promise<{section:string}>}) {
  const {section}=await params;
  if(!routes.includes(section)) notFound();
  return <SeoPage section={section as Section}/>;
}
