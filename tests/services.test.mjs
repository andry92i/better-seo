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
