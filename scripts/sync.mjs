#!/usr/bin/env node
// The plugin is described once, at the root, in the vendor-neutral Agent Plugins format
// (agent-plugins.org): `plugin.json`, `mcp.json` and `skills/`. Codex and Cursor read those as
// they are. Claude Code, Cursor's own plugin format and the two marketplaces each want a file of
// their own, so this script writes them from the root ones. Never edit a generated file by hand:
// edit the root and run `npm run sync`. `npm run check` (CI) fails when one has drifted, or when a
// skill breaks the Agent Skills spec (agentskills.io/specification).
//
// Adding an agent is adding an entry to TARGETS.

import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const read = (path) => JSON.parse(readFileSync(join(ROOT, path), "utf8"))

const plugin = read("plugin.json")
const { mcpServers } = read("mcp.json")

// Agent Plugins has no place for a display name or a logo; OpenAI's extension is where the root
// manifest already holds them, so the other agents' files take theirs from there too.
const brand = plugin.extensions["com.openai"].interface

/** The root manifest's metadata, in the order the agents' own manifests list it. */
const metadata = {
  name: plugin.name,
  version: plugin.version,
  description: plugin.description,
  author: plugin.author,
  homepage: plugin.homepage,
  repository: plugin.repository,
  license: plugin.license,
  keywords: plugin.keywords,
}

/** Each MCP server in an agent's own shape. Only remote servers so far; a stdio one needs its paths mapped too. */
function servers(shape) {
  return Object.fromEntries(
    Object.entries(mcpServers).map(([name, server]) => {
      if (server.type !== "streamable-http") throw new Error(`mcp.json: ${name} is ${server.type}; teach scripts/sync.mjs that transport first`)
      return [name, shape(server)]
    }),
  )
}

const owner = { name: plugin.author.name, email: plugin.author.email }

const TARGETS = {
  // Claude Code reads `.claude-plugin/plugin.json` and not the root one, and finds `skills/` itself.
  // https://code.claude.com/docs/en/plugins/manifest-reference
  ".claude-plugin/plugin.json": {
    ...metadata,
    displayName: brand.displayName,
    // Read only by Anthropic's directory, for the listing.
    icon: brand.logo,
    documentationUrl: plugin.homepage,
    supportUrl: brand.supportURL,
    privacyPolicyUrl: brand.privacyPolicyURL,
    termsOfServiceUrl: brand.termsOfServiceURL,
    mcpServers: servers(({ url, headers }) => ({ type: "http", url, ...(headers && { headers }) })),
  },
  // `claude plugin marketplace add cherryblossomhq/skills`, the plugin being the repo itself.
  // https://code.claude.com/docs/en/plugins/marketplace-reference
  ".claude-plugin/marketplace.json": {
    name: plugin.name,
    description: brand.shortDescription,
    owner,
    plugins: [{ name: plugin.name, source: "./", description: plugin.description }],
  },
  // Cursor reads the root manifest as an Agent Plugin too; its own format is what carries the logo.
  // It infers the transport from `url`. https://cursor.com/docs/reference/plugins
  ".cursor-plugin/plugin.json": {
    ...metadata,
    author: owner,
    logo: brand.logo.replace(/^\.\//, ""),
    mcpServers: servers(({ url, headers }) => ({ url, ...(headers && { headers }) })),
  },
  // `codex plugin marketplace add cherryblossomhq/skills`. Codex reads the root manifest and mcp.json.
  // https://developers.openai.com/plugins/build/plugins
  ".agents/plugins/marketplace.json": {
    name: plugin.name,
    interface: { displayName: brand.displayName },
    plugins: [
      {
        name: plugin.name,
        source: { source: "local", path: "./" },
        policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
        category: brand.category,
      },
    ],
  },
}

/** What's wrong with each skill under the Agent Skills spec; Agent Plugins skips a skill that breaks it. */
function skillProblems() {
  const problems = []
  for (const dir of readdirSync(join(ROOT, "skills"))) {
    const file = join(ROOT, "skills", dir, "SKILL.md")
    if (!existsSync(file)) continue
    const front = readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---\n/)?.[1]
    if (!front) {
      problems.push(`skills/${dir}: SKILL.md has no frontmatter`)
      continue
    }
    const field = (key) => front.match(new RegExp(`^${key}:\\s*(.*)$`, "m"))?.[1].trim()
    const name = field("name")
    const description = field("description")
    if (name !== dir) problems.push(`skills/${dir}: name is "${name}", not the directory's`)
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(dir) || dir.length > 64) problems.push(`skills/${dir}: name must be lowercase words joined by single hyphens, at most 64 characters`)
    if (!description || description.length > 1024) problems.push(`skills/${dir}: description must be 1-1024 characters`)
  }
  return problems
}

const check = process.argv.includes("--check")
const stale = []
for (const [path, value] of Object.entries(TARGETS)) {
  const text = `${JSON.stringify(value, null, 2)}\n`
  const file = join(ROOT, path)
  if (existsSync(file) && readFileSync(file, "utf8") === text) continue
  if (check) {
    stale.push(path)
  } else {
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, text)
    console.log(`wrote ${path}`)
  }
}

const problems = [...stale.map((path) => `${path} is out of date: run npm run sync`), ...skillProblems()]
for (const problem of problems) console.error(problem)
process.exit(problems.length ? 1 : 0)
