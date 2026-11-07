# Cherry Blossom skills — agent guide

There is deliberately no `CLAUDE.md`: Claude Code reads this file when there isn't one. The plugin
is the whole repo, so a `CLAUDE.md` would ship in it, and the plugin directory flags both kinds: a
real one is never loaded from a plugin (`claude plugin validate --strict` fails on it) and a symlink
isn't followed, which holds the plugin as one it can't read completely. Nothing in the repo may be
a symlink.

One plugin for every AI agent: Cherry Blossom's MCP server and its skills. It is published from this
repo to Claude Code, Codex and Cursor, and the skills to any agent through `npx skills`.

## Only Markdown, text, JSON, YAML and images

The plugin is the whole repo, and Anthropic's directory accepts from an organization it hasn't
verified only Markdown, plain text, JSON, YAML and PNG, JPEG, GIF, WebP or ICO images, each text
file UTF-8 with no NUL bytes. Version 0.2.0 was refused for a sync script (`scripts/sync.mjs`), the
`package.json` that ran it and an SVG logo. So the repo holds:

- No scripts or programs, nothing that starts with `#!`, and no package manager file
  (`package.json`, lockfiles, `pnpm-workspace.yaml` and the like).
- No SVG: the logo is `assets/logo.png`, 512 px with a transparent background.
- No `CLAUDE.md` and no symlinks (see above).

A check that needs code runs in CI from a published tool, as the skill check does, never from a
file in the repo.

## One description, many manifests

The plugin is described once, at the root, in the vendor-neutral
[Agent Plugins](https://agent-plugins.org) format:

| File | What it is | Read by |
|---|---|---|
| `plugin.json` | The manifest. `extensions["com.openai"]` is OpenAI's listing | Codex, Cursor, any Agent Plugins client |
| `mcp.json` | The MCP server | Codex, Cursor |
| `skills/<name>/SKILL.md` | The skills ([Agent Skills](https://agentskills.io/specification)) | every agent |

The other agents' files repeat parts of those two, by hand:

| File | For | Repeats |
|---|---|---|
| `.claude-plugin/plugin.json` | Claude Code, which doesn't read the root manifest ([reference](https://code.claude.com/docs/en/plugins/manifest-reference)) | the metadata, OpenAI's display name, logo (`icon`) and links, each server's `url` as `type: "http"` |
| `.claude-plugin/marketplace.json` | `claude plugin marketplace add cherryblossomhq/skills` ([reference](https://code.claude.com/docs/en/plugins/marketplace-reference)) | name, short description, owner |
| `.cursor-plugin/plugin.json` | Cursor's own format, which carries the logo ([reference](https://cursor.com/docs/reference/plugins)) | the metadata, the logo, each server's `url` |
| `.cursor-plugin/marketplace.json` | Cursor's Import from Repo and team marketplaces | name, owner |
| `.agents/plugins/marketplace.json` | `codex plugin marketplace add cherryblossomhq/skills` ([reference](https://developers.openai.com/plugins/build/plugins)) | name, display name, category |

Edit the root first, then the files that repeat what you changed, in the same commit. CI fails when
the two `plugin.json` files' metadata (name, version, description, homepage, repository, license,
keywords) or server URLs differ from the root's, when a skill breaks the Agent Skills spec
(`agentskills validate`, the spec's reference validator) and on `claude plugin validate --strict`.

**Adding an agent**: prefer one that reads the root files as they are; write a file of its own only
for what Agent Plugins can't say, and add it to the table above.

The MCP server signs in with OAuth and takes no key. Give each manifest only the server's `url`:
the directory's scan holds a plugin that passes along anything credential-shaped, such as
`headers`.

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

Bump `version` in `plugin.json`, `.claude-plugin/plugin.json` and `.cursor-plugin/plugin.json` on
every release. Claude Code keeps installed copies on the version they have until it changes, so a
skill edit without a bump never reaches them.

Listings in the vendors' directories are submitted by hand:

- Anthropic: https://claude.ai/directory/manage (`claude plugin validate --profile directory .` first)
- OpenAI: https://developers.openai.com/plugins/deploy/submission
- Cursor: https://cursor.com/marketplace/publish

## Commits

Title only by default. No AI co-author trailers.
