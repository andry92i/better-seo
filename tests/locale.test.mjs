import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolveLocale} from "../src/i18n/locale.ts";
const en=JSON.parse(readFileSync('messages/en.json')).ui,fr=JSON.parse(readFileSync('messages/fr.json')).ui;
test('locale matching respects quality values, exclusions, regional variants and explicit choice',()=>{
 for(const [override,header,expected]of [[undefined,undefined,'en'],[undefined,'fr-CA,en;q=.5','fr'],[undefined,'fr;q=0,en;q=.1','en'],[undefined,'en;q=.2,fr;q=.9','fr'],[undefined,'fr;q=garbage,en','en'],[undefined,'fr;q=2,en','en'],['fr','en','fr'],['../../fr','ja','en'],[undefined,'de,fr;q=.9','fr']])assert.equal(resolveLocale(override,header),expected);
});
test('translation catalogs have matching nonempty keys and every legacy label resolves',()=>{
 assert.deepEqual(Object.keys(en).sort(),Object.keys(fr).sort());
 for(const value of [...Object.values(en),...Object.values(fr)])assert.ok(typeof value==='string'&&value.trim());
 const keys=JSON.parse(readFileSync('src/i18n/source-keys.json'));for(const key of Object.values(keys))assert.ok(en[key]&&fr[key],key);
});
test('core text and surface color pairs meet WCAG AA normal-text contrast',()=>{
 const luminance=hex=>{const rgb=hex.match(/[a-f\d]{2}/gi).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
 for(const [fg,bg]of [['536477','f6f9fc'],['536477','ffffff'],['b2c0d1','172331'],['edf2f8','101821'],['ffffff','533afd'],['0d253d','f5e9d4'],['e0e7ff','1c1e54'],['b42318','ffffff'],['ffb4ab','172331']]){
  const a=luminance(fg),b=luminance(bg);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,`${fg}/${bg}`);
 }
});

test('account navigation and profile translations are complete and provider-neutral',()=>{
 const catalogs=['en','fr'].map(lang=>JSON.parse(readFileSync(`messages/${lang}.json`)));
 for(const namespace of ['workspace','profile'])assert.deepEqual(Object.keys(catalogs[0][namespace]).sort(),Object.keys(catalogs[1][namespace]).sort());
 for(const catalog of catalogs)assert.doesNotMatch(JSON.stringify(catalog),/grok|simulation/i);
});
