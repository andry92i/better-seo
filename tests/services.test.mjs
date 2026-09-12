import { test } from "node:test";
import assert from "node:assert/strict";
import * as XLSX from "xlsx";
import { inspectHtml, technicalFindings } from "../src/lib/seo/crawl.ts";
import { isPublicAddress, publicUrl, publicFetch } from "../src/lib/seo/public-fetch.ts";
import { parseBacklinks } from "../src/lib/seo/backlinks.ts";
import { displayEvidence } from "../src/lib/seo/display-evidence.ts";
import { exportDocument } from "../src/lib/export.ts";

test("crawl extracts observed HTML and ignores script text",()=>{
 const p=inspectHtml("https://example.org",'<title>Observed title</title><meta name="description" content="Observed description"><main><h1>Actual heading</h1><p>Visible words</p><img src="x"><a href="/a">A</a><a href="https://other.org">B</a></main><script>Never count me</script><script type="application/ld+json">{"@graph":[{"@type":"LocalBusiness"}]}</script>');
 assert.equal(p.title,"Observed title");assert.deepEqual(p.h1,["Actual heading"]);assert.equal(p.missingAlt,1);
 assert.deepEqual(p.internalLinks,["https://example.org/a"]);assert.deepEqual(p.schemaTypes,["LocalBusiness"]);
 assert.doesNotMatch(p.text,/Never count me/);
 const findings=technicalFindings({pages:[p]});
 assert.ok(findings.some(f=>f.title.includes("alt")));assert.ok(!findings.some(f=>f.title.includes("title absente")));
 assert.ok(findings.every(f=>f.evidence.url==="https://example.org"));
});
test("private, loopback, mapped IPv4, link-local and reserved addresses cannot be crawled",async()=>{
 for(const value of ["127.0.0.1","10.1.2.3","169.254.169.254","192.168.1.1","172.16.1.1","::1","::ffff:127.0.0.1","fc00::1","fe80::1","0.0.0.0","224.0.0.1"]) assert.equal(isPublicAddress(value),false,value);
 assert.equal(isPublicAddress("8.8.8.8"),true);
 for(const value of ["http://example.org","https://localhost","https://test.internal","https://user:password@example.org","https://example.org:8443"]) assert.throws(()=>publicUrl(value));
 await assert.rejects(publicFetch("https://127.0.0.1"),/non publique/);
});
test("GSC CSV handles BOM, French delimiters, escaped quotes and invalid quoting",()=>{
 const r=parseBacklinks('\ufeffSite;Liens\n"example.org";"12"\n"other.org";"mot ""cité"""');
 assert.deepEqual(r.headers,["Site","Liens"]);assert.equal(r.domainCount,2);assert.equal(r.rows[1][1],'mot "cité"');
 assert.throws(()=>parseBacklinks('a,b\n"unterminated'));
});
test("dashboard truncation preserves source totals and does not mutate stored evidence",()=>{
 const raw={gsc:{status:"available",data:{rows:Array.from({length:300},(_,i)=>({clicks:i})),previous:[1],totals:{clicks:999}}},crawl:{data:{pages:[{text:"full evidence",title:"A"}]}}};
 const view=displayEvidence(raw);
 assert.equal(view.gsc.data.rows.length,200);assert.equal(view.gsc.data.totals.clicks,999);assert.equal(view.crawl.data.pages[0].text,undefined);
 assert.equal(raw.gsc.data.rows.length,300);assert.equal(raw.crawl.data.pages[0].text,"full evidence");
});
test("exports preserve content and never turn user strings into Excel formulas",async()=>{
 const content='# Report\n\n=HYPERLINK("https://example.org")\n| Action | KPI |\n| --- | --- |\n| Fix title | Clicks |';
 assert.equal((await exportDocument(content,"md")).body,content);
 for(const format of ["docx","xlsx"]) {
  const result=await exportDocument(content,format);
  assert.equal(Buffer.from(result.body).subarray(0,2).toString(),"PK");
  if(format==="xlsx") {
   const book=XLSX.read(result.body);const cell=book.Sheets["Result"].B4;
   assert.equal(cell.t,"s");assert.equal(cell.f,undefined);assert.equal(cell.v,content.split("\n")[2]);
   assert.equal(book.Sheets["Tables"].A2.v,"Fix title");
  }
 }
});


test("French spreadsheet export localizes sheet names without changing content",async()=>{
 const result=await exportDocument("Bonjour","xlsx","fr");
 const book=XLSX.read(result.body);assert.equal(book.Sheets["Résultat"].B2.v,"Bonjour");
});

test("profile edits reject identity changes and unsafe avatar URLs", async()=>{
 const {profileSchema}=await import("../src/lib/profile-schema.ts");
 assert.equal(profileSchema.parse({name:" Andry ",image:""}).name,"Andry");
 for(const value of [{name:" ",image:""},{name:"Andry",image:"javascript:alert(1)"},{name:"Andry",image:"http://example.com/a.png"},{name:"Andry",image:"https://user:secret@example.com/a.png"},{name:"Andry",image:"",emailVerified:true},{name:"Andry",image:"",id:"another-user"}]) assert.equal(profileSchema.safeParse(value).success,false);
});
test("spreadsheet exports keep separate tables and escaped pipes intact",async()=>{
 const content="| Topic | Value |\n| --- | --- |\n| A \\| B | =1+1 |\n\nAnother table\n\n| Task | Owner |\n| --- | --- |\n| Review | Editor |";
 const file=await exportDocument(content,"xlsx");const book=XLSX.read(file.body);
 assert.deepEqual(book.SheetNames,["Result","Tables","Tables 2"]);
 assert.equal(book.Sheets.Tables.A2.v,"A | B");assert.equal(book.Sheets.Tables.B2.t,"s");assert.equal(book.Sheets.Tables.B2.f,undefined);
 assert.equal((await exportDocument(content,"txt")).body,content);
});

test("upstream canonical case fix handles mixed-case rel attributes",()=>{
 const p=inspectHtml("https://example.org",'<link REL="Canonical" href="https://example.org/"><h1>Example</h1>');
 assert.equal(p.canonical,"https://example.org/");
});
test("cover commands route both supported slash spellings",async()=>{
 const {selectWorkflow}=await import('../src/lib/claude-seo/workflows.ts');
 for(const prefix of ['/seo ', '/seo-']) {
  assert.equal(selectWorkflow('content-plan',prefix+'schema example.com'),'schema-analysis');
  assert.equal(selectWorkflow('content-plan',prefix+'backlinks rival.com'),'backlinks');
  assert.equal(selectWorkflow('content-plan',prefix+'geo my homepage'),'ai-search');
 }
});
test("writing skills are complete, paginated and allowlisted",async()=>{
 const {loadWritingSkill}=await import('../src/lib/ai/writing-skills.ts');
 const {createHash}=await import('node:crypto');
 for(const id of ['copywriting/SKILL.md','humanizer/SKILL.md']) {
  let offset=0, content='', result;
  do {result=loadWritingSkill(id,offset);content+=result.content;offset=result.nextOffset;} while(offset!==null);
  assert.equal(createHash('sha256').update(content).digest('hex'),result.sha256);
  assert.ok(content.length>5000);
 }
 assert.equal(loadWritingSkill('../../.env').status,'unavailable');
 assert.equal(loadWritingSkill('humanizer/SKILL.md',-1).status,'unavailable');
});

test("production canonical never inherits a localhost auth origin",async()=>{
 const {canonicalOrigin}=await import('../src/lib/site.ts');
 for(const value of ['http://localhost:3000','https://localhost','not a URL','https://user:password@example.org','https://preview.internal']) assert.equal(canonicalOrigin(value),'https://better-seo-five.vercel.app');
 assert.equal(canonicalOrigin('https://www.example.org/path'),'https://www.example.org');
});


test("rich crawl evidence preserves alternate URLs, JSON-LD and image semantics",()=>{
 const p=inspectHtml("https://example.org/en", '<html lang="en"><head><link hreflang="fr" href="https://example.org/fr"><script type="application/ld+json">{"@type":"Product","name":"Actual product"}</script></head><body><h1>Product</h1><h3>Details</h3><img src="x" alt="" width="30" height="20"><img data-src="photo.jpg"></body></html>');
 assert.deepEqual(p.alternates,[{language:'fr',href:'https://example.org/fr'}]);
 assert.equal(p.structuredData[0].json.name,'Actual product');
 assert.equal(p.imageDetails[0].alt,'');assert.equal(p.imageDetails[1].loading,'javascript');
 assert.equal(p.language,'en');assert.equal(p.headings[1].level,3);
});
test("sitemap parser separates indexes and rejects external or private-format targets",async()=>{
 const {inspectSitemap}=await import('../src/lib/seo/crawl.ts');
 const r=inspectSitemap('<sitemapindex><sitemap><loc>https://example.org/a.xml</loc></sitemap><sitemap><loc>https://evil.org/a.xml</loc></sitemap></sitemapindex>','https://example.org');
 assert.deepEqual(r,{pages:[],sitemaps:['https://example.org/a.xml']});
 const p=inspectSitemap('<urlset><url><loc>https://example.org/en</loc></url><url><loc>http://example.org/a</loc></url></urlset>','https://example.org');assert.deepEqual(p.pages,['https://example.org/en']);
});
test("international checks distinguish observed broken reciprocity from missing evidence",async()=>{
 const {analyzeEvidence}=await import('../src/lib/seo/analysis.ts');
 const a=inspectHtml('https://example.org/en','<link hreflang="fr" href="https://example.org/fr"><link hreflang="de" href="https://example.org/de">');
 const b=inspectHtml('https://example.org/fr','<h1>Page</h1>');
 const result=analyzeEvidence({crawl:{data:{pages:[a,b]}}},'international');
 assert.ok(result.rows.some(r=>r.check==='missing-return-alternate'));
 assert.ok(result.rows.some(r=>r.check==='alternate-not-in-sample'));
 assert.ok(result.rows.some(r=>r.check==='missing-self-alternate'));
 assert.equal(analyzeEvidence({},'international').status,'unavailable');
});
test("drift uses only comparable snapshots and never treats omitted sample URLs as deleted",async()=>{
 const {analyzeEvidence}=await import('../src/lib/seo/analysis.ts');
 const page=inspectHtml('https://example.org/a','<title>New title</title>');
 const now={crawl:{data:{pages:[page]}}};const before={crawl:{data:{pages:[{...page,title:'Old title'},{...page,url:'https://example.org/b'}]}}};
 assert.equal(analyzeEvidence(now,'drift').status,'unavailable');
 const result=analyzeEvidence(now,'drift',before);
 assert.ok(result.rows.some(r=>r.check==='changed-title'&&r.observed.before==='Old title'));
 assert.ok(result.rows.some(r=>r.check==='absent-from-sample'&&/does not establish deletion/.test(r.interpretation)));
});
test("GSC shortlist preserves missing previous rows as unknown and stable pagination",async()=>{
 const {analyzeEvidence}=await import('../src/lib/seo/analysis.ts');
 const rows=Array.from({length:22},(_,i)=>({keys:['query'+i,'https://example.org/'+i],clicks:5,impressions:200+i,ctr:0.02,position:8}));
 const e={gsc:{data:{rows,previous:[],coverage:'top rows'}}};
 const first=analyzeEvidence(e,'opportunities'),second=analyzeEvidence(e,'opportunities',undefined,first.nextOffset);
 assert.equal(first.rows.length,20);assert.equal(second.rows.length,2);assert.equal(second.nextOffset,null);
 assert.equal(first.rows[0].observed.clickChange,null);assert.equal(first.rows[0].observed.previous,null);
 assert.equal(rows[0].impressions,200);
});
test("Google URL inspection honors property boundaries",async()=>{
 const {belongsToProperty}=await import('../src/lib/google/inspection.ts');
 assert.equal(belongsToProperty('https://blog.example.org/a','sc-domain:example.org'),true);
 for(const url of ['https://example.org.evil.com/','https://notexample.org/','https://user:secret@example.org/']) assert.equal(belongsToProperty(url,'sc-domain:example.org'),false);
 assert.equal(belongsToProperty('https://example.org/blog/a','https://example.org/blog/'),true);
 assert.equal(belongsToProperty('https://example.org/blogger/a','https://example.org/blog/'),false);
});
test("all task suggestions map to specific workflows and prepare editable requests",async()=>{
 const {seoTasks,taskPrompt}=await import('../src/lib/claude-seo/tasks.ts');
 const {selectWorkflow,workflows}=await import('../src/lib/claude-seo/workflows.ts');
 assert.equal(new Set(seoTasks.map(t=>t.command)).size,seoTasks.length);
 for(const task of seoTasks) for(const locale of ['en','fr']) {
  const prompt=taskPrompt(task,locale,'https://example.org');assert.match(prompt,/https:\/\/example.org/);
  assert.ok(workflows[selectWorkflow('unknown',prompt)]);assert.ok(task.needs[locale]);
 }
 assert.equal(selectWorkflow('unknown','/seo content my blog'),'content-review');
 assert.equal(selectWorkflow('unknown','/seo write my blog'),'rewrite-landing');
});
