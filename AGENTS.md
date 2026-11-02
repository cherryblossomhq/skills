# Cherry Blossom skills — agent guide

`CLAUDE.md` is a symlink to this file — edit here, not there.

One plugin for every AI agent: Cherry Blossom's MCP server and its skills. It is published from this
repo to Claude Code, Codex and Cursor, and the skills to any agent through `npx skills`.

## One description, many manifests

The plugin is described once, at the root, in the vendor-neutral
[Agent Plugins](https://agent-plugins.org) format:

| File | What it is | Read by |
|---|---|---|
| `plugin.json` | The manifest. `extensions["com.openai"]` is OpenAI's listing | Codex, Cursor, any Agent Plugins client |
| `mcp.json` | The MCP server | Codex, Cursor |
| `skills/<name>/SKILL.md` | The skills ([Agent Skills](https://agentskills.io/specification)) | every agent |

Everything else an agent needs is **generated** by `scripts/sync.mjs` from those two files:

| Generated file | For |
|---|---|
| `.claude-plugin/plugin.json` | Claude Code, which doesn't read the root manifest |
| `.claude-plugin/marketplace.json` | `claude plugin marketplace add cherryblossomhq/skills` |
| `.cursor-plugin/plugin.json` | Cursor's own format, which carries the logo |
| `.cursor-plugin/marketplace.json` | Cursor's Import from Repo and team marketplaces |
| `.agents/plugins/marketplace.json` | `codex plugin marketplace add cherryblossomhq/skills` |

Never edit a generated file: edit the root, run `npm run sync`, and commit both. CI runs
`npm run check`, which fails when a generated file is stale or a skill breaks the spec, and
`claude plugin validate --strict`.

**Adding an agent** is one entry in `TARGETS` in `scripts/sync.mjs`. Prefer an agent reading the
root files as they are; write a file of its own only for what Agent Plugins can't say.

## Skills

- A skill is a workflow around the MCP tools, not a copy of their rules. The server sends its
  instructions (the design guide Sakura is given) to every assistant that connects, and they live in
  the Cherry Blossom monorepo (`packages/editor/src/ai/designGuide.ts`). A rule copied here drifts
  from that one.
- Name tools exactly as the server lists them (`packages/editor/src/mcp/tools.ts` in the monorepo).
- Every skill says what to do when the server isn't connected: point at
  https://www.trycherryblossom.com/docs/mcp.
- `name` matches the directory: lowercase words and single hyphens, 64 characters at most.
  `description` says what it does and when to use it, in at most 1024 characters. Keep `SKILL.md`
  under 500 lines; put long reference material in `references/`.
- Write for users who aren't engineers as well as those who are, as the product does.

## Releasing

Bump `version` in `plugin.json` and run `npm run sync` on every release. Claude Code keeps installed
copies on the version they have until it changes, so a skill edit without a bump never reaches them.

Listings in the vendors' directories are submitted by hand:

- Anthropic: https://claude.ai/directory/manage (`claude plugin validate --profile directory .` first)
- OpenAI: https://developers.openai.com/plugins/deploy/submission
- Cursor: https://cursor.com/marketplace/publish

## Commits

Title only by default. No AI co-author trailers.
