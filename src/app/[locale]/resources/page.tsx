import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resources } from '@/lib/content/resources';
import { ResourceLayout } from '@/components/resource-layout';
import { siteUrl } from '@/lib/site';
type Props={params:Promise<{locale:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {locale}=await params;if(locale!=='en'&&locale!=='fr')notFound();
 return {title:locale==='fr'?'Guides SEO et méthode d’analyse | Better SEO':'SEO guides and evidence-led workflows | Better SEO',description:locale==='fr'?'Guides pratiques sur Search Console, les audits techniques et les contenus SEO. Comprenez les données, les méthodes et les limites de Better SEO.':'Practical guides to Search Console, technical audits and SEO content. Understand the data, methods and coverage behind Better SEO.',alternates:{canonical:`/${locale}/resources`,languages:{en:`${siteUrl}/en/resources`,fr:`${siteUrl}/fr/resources`}}};
}
export default async function Resources({params}:Props){
 const {locale}=await params;if(locale!=='en'&&locale!=='fr')notFound();const fr=locale==='fr';
 return <ResourceLayout locale={locale}><main id="resource-main" className="mx-auto max-w-6xl px-5 pt-12 sm:px-8 sm:pt-20"><div className="max-w-3xl"><h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{fr?'Des données à la prochaine action SEO':'From search data to your next SEO action'}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{fr?'Comprendre vos sources, examiner votre site et préparer des contenus utiles. Choisissez le guide qui répond à votre question.':'Understand your sources, investigate your website and prepare useful content. Choose the guide that answers your question.'}</p></div><div className="mt-12 divide-y border-y">{resources.map((r,i)=><Link key={r.slug} href={`/${locale}/resources/${r.slug}`} className="group grid gap-3 py-7 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)] sm:gap-7"><span className="text-sm text-muted-foreground">{String(i+1).padStart(2,'0')}</span><h2 className="text-xl font-medium group-hover:text-primary">{r[locale].heading}</h2><p className="max-w-xl text-sm leading-7 text-muted-foreground">{r[locale].description}</p></Link>)}</div></main></ResourceLayout>;
}
