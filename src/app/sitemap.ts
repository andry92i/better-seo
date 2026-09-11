import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';
import { resources } from '@/lib/content/resources';
export default function sitemap(): MetadataRoute.Sitemap {
 const pages:MetadataRoute.Sitemap=[{url:`${siteUrl}/`}];
 for(const locale of ['en','fr']) {
  for(const path of ['resources',...resources.map(r=>`resources/${r.slug}`)]) pages.push({url:`${siteUrl}/${locale}/${path}`,alternates:{languages:{en:`${siteUrl}/en/${path}`,fr:`${siteUrl}/fr/${path}`}}});
 }
 return pages;
}
