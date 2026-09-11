# Runtime writing skills

Vendored on 2026-09-11 from the skills.sh-linked upstream repositories:

- `copywriting`: https://github.com/coreyhaines31/marketingskills/tree/main/skills/copywriting — version 2.0.2, MIT.
- `humanizer`: https://github.com/blader/humanizer — version 3.0.0, MIT.

The complete source files and licenses are retained. SHA-256 fingerprints of the exact incorporated files are in `src/lib/ai/writing-skills.json`. Run `node scripts/sync-writing-skills.mjs` after a reviewed source update. These copies are installed in this app, not claimed as globally installed skills.

AI SDK 7.0.91 documents `uploadSkill` for OpenAI and Anthropic. Its xAI provider does not implement that API. Better SEO therefore exposes an allowlisted AI SDK `loadSkill` tool. No provider switch, fake upload reference, shell execution, arbitrary upload or global filesystem access occurs. Server instructions require reading both skills for writing tasks and preserving factual evidence while editing. Skills are editorial guidance, not a guarantee of factual accuracy or a claim to bypass AI detectors.
