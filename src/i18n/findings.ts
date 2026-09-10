import type { Locale } from "./locale";
import keys from "./source-keys.json";
import english from "../../messages/en.json";
/** Localize legacy, application-generated findings without changing source evidence. */
export function localizeFinding<T extends {title:string;description:string;category:string;evidence:{url?:string;observed?:string}|null}>(finding:T,locale:Locale):T {
  if(locale==="fr")return finding;
  const key=keys[finding.title as keyof typeof keys];
  if(key){
    const title=english.ui[key as keyof typeof english.ui];
    return {...finding,title,description:finding.description.startsWith(finding.title+" sur ")?title+" — "+finding.evidence?.url:finding.description};
  }
  if(finding.category==="Opportunité GSC"){
    try{
      const row=JSON.parse(finding.evidence?.observed??"");
      if(typeof row.keys?.[0]!=="string"||typeof row.impressions!=="number"||typeof row.position!=="number")return finding;
      return {...finding,title:`Optimize “${row.keys[0]}”`,description:`${new Intl.NumberFormat(locale).format(row.impressions)} impressions, average position ${row.position.toFixed(1)}. Verify intent and content before editing the page.`};
    }catch{return finding;}
  }
  return finding;
}
