import { spawn } from "node:child_process";
import { createRequire } from "node:module";

// The preview runner uses --strictPort. Serve the verified build in that environment
// because its process sandbox does not support the dev server's memory telemetry.
// Ordinary "pnpm dev" still runs the Next.js development server.
const require = createRequire(import.meta.url);
const preview = process.argv.includes("--strictPort");
const args = process.argv.slice(2)
  .filter((argument) => argument !== "--strictPort")
  .map((argument) => argument === "--host" ? "--hostname" : argument);
const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), preview ? "start" : "dev", ...args], {
  stdio: "inherit",
  env: process.env,
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
child.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
child.on("exit", (code) => { process.exitCode = code ?? 1; });
