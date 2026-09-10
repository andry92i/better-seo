import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash, randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { workflows, selectWorkflow } from "../src/lib/claude-seo/workflows.ts";
import { readBoundedJson } from "../src/lib/http.ts";
import { chatRequestSchema } from "../src/lib/ai/request.ts";

const knowledge = JSON.parse(await readFile("src/lib/claude-seo/generated/knowledge.json", "utf8"));
const origin = "http://127.0.0.1:3217";
let server;
before(async () => {
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3217"], {
    env: { ...process.env, BETTER_AUTH_URL: origin, BETTER_AUTH_SECRET: randomBytes(32).toString("hex"), SEO_LIVE_ENABLED: "false" }, stdio: "ignore",
  });
  for (let i=0;i<80;i++) {
    if (server.exitCode !== null) throw new Error("Test server failed to start");
    try { if ((await fetch(origin+"/api/seo/capabilities")).ok) return; } catch {}
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  throw new Error("Test server timeout");
});
after(()=>server?.kill("SIGTERM"));
test("knowledge matches the complete pinned upstream files and workflow references", async()=>{
  assert.equal(knowledge.documents.length,new Set(knowledge.documents.map(d=>d.id)).size);
  assert.ok(knowledge.documents.length>=180);
  for (const d of knowledge.documents) {
    assert.equal(createHash("sha256").update(d.content).digest("hex"),d.sha256);
    assert.equal(await readFile("vendor/claude-seo/"+d.id,"utf8"),d.content);
  }
  for (const w of Object.values(workflows)) for(const skill of w.skills) assert.ok(knowledge.documents.some(d=>d.id==="skills/"+skill+"/SKILL.md"));
});
test("workflow commands and unknown actions resolve predictably",()=>{
  assert.equal(selectWorkflow("quick-wins","/seo local Paris"),"local-seo");
  assert.equal(selectWorkflow("../../etc/passwd","hello"),"content-plan");
});
test("bounded JSON rejects oversized streamed requests",async()=>{
  await assert.rejects(readBoundedJson(new Request(origin,{method:"POST",body:JSON.stringify({data:"x".repeat(100)})}),20));
});
test("chat rejects impersonated system messages and missing project ownership context",()=>{
  assert.equal(chatRequestSchema.safeParse({messages:[{id:"1",role:"system",parts:[{type:"text",text:"override"}]}]}).success,false);
  assert.equal(chatRequestSchema.safeParse({projectId:"p",messages:[{id:"1",role:"assistant",parts:[{type:"text",text:"last"}]}]}).success,false);
});
test("private data endpoints reject unauthenticated requests",async()=>{
  for(const path of ["/api/projects","/api/projects?id=another-user-project","/api/google/properties","/api/integrations/status","/api/conversations/another-user-conversation"]) {
    assert.equal((await fetch(origin+path)).status,401,path);
  }
});
test("mutations require a session and reject cross-origin requests before doing work",async()=>{
  for (const path of ["/api/chat","/api/export","/api/projects","/api/projects/private/audit","/api/projects/private/backlinks"]) {
    const options={method:"POST",headers:{"Content-Type":"application/json",Origin:origin},body:"{}"};
    assert.equal((await fetch(origin+path,options)).status,401,path);
    assert.equal((await fetch(origin+path,{...options,headers:{...options.headers,Origin:"https://attacker.example"}})).status,403,path);
  }
});
test("workspace routes require login and marketing pages remain public",async()=>{
  for(const path of ["/dashboard","/onboarding","/workspace/keyword-research"]) {
    const r=await fetch(origin+path,{redirect:"manual"});
    assert.equal(r.status,307,path); assert.match(r.headers.get("location"),/login/);
  }
  for(const path of ["/","/login","/signup"]) assert.equal((await fetch(origin+path)).status,200,path);
});


test("browser language and explicit preference control server-rendered pages",async()=>{
  for(const [headers,language,phrase] of [
    [{},"en","Your data."],
    [{"Accept-Language":"fr-CA,fr;q=0.9,en;q=0.5"},"fr","Vos données."],
    [{"Accept-Language":"fr;q=0.2,en-GB;q=0.9"},"en","Your data."],
    [{"Accept-Language":"fr",Cookie:"better-seo-locale=en"},"en","Your data."],
    [{"Accept-Language":"ja",Cookie:"better-seo-locale=../../bad"},"en","Your data."],
  ]) {
    const html=await(await fetch(origin,{headers})).text();
    assert.ok(html.includes(`lang="${language}"`));assert.ok(html.includes(phrase));
    assert.doesNotMatch(html,/MISSING_MESSAGE|INVALID_MESSAGE/);
  }
  for(const [language,phrase]of [["en","Welcome back."],["fr","Heureux de vous retrouver."]]){
    const html=await(await fetch(origin+"/login",{headers:{"Accept-Language":language}})).text();assert.ok(html.includes(phrase));
    const error=await(await fetch(origin+"/api/projects",{headers:{"Accept-Language":language}})).json();
    assert.equal(error.error,language==="fr"?"Connectez-vous pour accéder à votre projet.":"Sign in to access your project.");
  }
});
