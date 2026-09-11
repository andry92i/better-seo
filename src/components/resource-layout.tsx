import Link from 'next/link';
import { Brand } from './brand';
import { DisplayControls } from './display-controls';
import { buttonVariants } from './ui/button';
export function ResourceLayout({locale,children}:{locale:'en'|'fr';children:React.ReactNode}) {
 const fr=locale==='fr';
 return <div className="min-h-screen"><a href="#resource-main" className="sr-only focus:not-sr-only focus:p-4">{fr?'Aller au contenu':'Skip to content'}</a><header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-b px-5 py-5 sm:px-8"><Link href="/" aria-label={fr?'Better SEO, accueil':'Better SEO home'}><Brand/></Link><nav aria-label={fr?'Navigation principale':'Main navigation'} className="flex flex-wrap items-center gap-3 text-sm"><Link href={`/${locale}/resources`}>{fr?'Ressources':'Resources'}</Link><DisplayControls/><Link href="/login" className={buttonVariants({variant:'outline',size:'sm'})}>{fr?'Connexion':'Sign in'}</Link></nav></header>{children}<footer className="mx-auto mt-20 flex max-w-6xl flex-wrap justify-between gap-5 border-t px-5 py-8 text-sm text-muted-foreground sm:px-8"><span>Better SEO</span><Link href={`/${locale}/resources/seo-methodology`}>{fr?'Sources et méthode':'Sources and methodology'}</Link><Link href={`/${locale}/resources`}>{fr?'Toutes les ressources':'All resources'}</Link></footer></div>;
}
