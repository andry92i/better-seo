'use client';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { seoTasks, taskGroups, taskPrompt } from '@/lib/claude-seo/tasks';

export function SeoTaskPicker({ website, onSelect }: { website: string; onSelect: (prompt: string) => void }) {
  const locale = useLocale() === 'fr' ? 'fr' : 'en';
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string>('audit');
  const match = (text: string) => text.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim());
  const results = seoTasks.filter(task => match(task[locale]) || match(task.command));
  return <section className="mt-7 min-w-0" aria-label={locale === 'fr' ? 'Choisir une analyse SEO' : 'Choose an SEO task'}>
    <Input aria-label={locale === 'fr' ? 'Rechercher une tâche' : 'Search tasks'} placeholder={locale === 'fr' ? 'Rechercher : images, contenu, backlinks…' : 'Search: images, content, backlinks…'} value={query} onChange={event => setQuery(event.target.value)} className="mb-3" />
    <Tabs value={selected} onValueChange={setSelected}>
      <div className="max-w-full overflow-x-auto"><TabsList variant="line" aria-label={locale === 'fr' ? 'Catégories' : 'Categories'}>{Object.entries(taskGroups).map(([id,label]) => <TabsTrigger key={id} value={id}>{label[locale]}</TabsTrigger>)}</TabsList></div>
      {Object.keys(taskGroups).map(group => <TabsContent key={group} value={group}>
        <div className="divide-y">{results.filter(task => query.trim() || task.group === group).map(task => <button key={task.command} type="button" className="flex w-full flex-col gap-1 px-1 py-3 text-left hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring sm:flex-row sm:items-center sm:justify-between sm:gap-5" onClick={() => onSelect(taskPrompt(task, locale, website))}>
          <span className="text-sm font-medium">{task[locale]}</span><span className="text-xs text-muted-foreground sm:max-w-[45%] sm:text-right">{task.needs[locale]}</span>
        </button>)}</div>
        {!results.filter(task => query.trim() || task.group === group).length && <p role="status" className="py-5 text-sm text-muted-foreground">{locale === 'fr' ? 'Aucune tâche trouvée. Tu peux écrire ta demande librement.' : 'No tasks found. You can write your own request.'}</p>}
      </TabsContent>)}
    </Tabs>
    <p className="mt-3 text-xs leading-5 text-muted-foreground">{locale === 'fr' ? 'La sélection prépare ta demande. Tu peux la modifier avant de l’envoyer. Les données indiquées sont nécessaires pour une analyse personnalisée.' : 'Selecting a task prepares your request. Edit it before sending. The listed sources are needed for a personalized analysis.'}</p>
  </section>;
}
