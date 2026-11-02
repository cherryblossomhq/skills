# Cherry Blossom for AI assistants

[Cherry Blossom](https://www.trycherryblossom.com) is a schematic and PCB editor in the browser. This
plugin connects your AI assistant to your Cherry Blossom projects and teaches it how to design with
them:

- **The MCP server** (`https://www.trycherryblossom.com/api/mcp`): the tools Sakura, Cherry Blossom's
  own copilot, designs with. Your assistant can create projects, build and wire schematics, make parts
  from supplier data, lay out and route the board, pour copper and run checks. Every edit shows live in
  the editor.
- **Skills**: how to go about it.
  - `design-a-board`: from an idea or a spec to a checked schematic and, when you ask, a routed board.
  - `review-a-design`: a read-only review of an existing design, worst problem first.

It works on every Cherry Blossom plan, Free included, and spends none of your Cherry Blossom AI
credits: the tools run on Cherry Blossom and the model on your own subscription. You sign in from the
assistant the first time it uses the server. There is no API key.

## Install

### Claude Code

```sh
claude plugin marketplace add cherryblossomhq/skills
claude plugin install cherryblossom@cherryblossom
```

Or, inside a session: `/plugin install cherryblossom --marketplace cherryblossomhq/skills`.

### Codex

```sh
codex plugin marketplace add cherryblossomhq/skills
```

Then run `codex`, open `/plugins` and install **Cherry Blossom**.

### Cursor

An admin can add it for a team: **Dashboard → Plugins & MCPs → Add Marketplace → Import from Repo**,
with `https://github.com/cherryblossomhq/skills`. To try it alone, clone this repo into
`~/.cursor/plugins/local/cherryblossom` and run **Developer: Reload Window**.

### Any other agent

The skills follow the [Agent Skills](https://agentskills.io) format, which most coding agents read:

```sh
npx skills add cherryblossomhq/skills
```

Then add the MCP server to your agent as a remote (Streamable HTTP) server at
`https://www.trycherryblossom.com/api/mcp`. [Steps for each app](https://www.trycherryblossom.com/docs/mcp).

## Try it

> Make a new Cherry Blossom project for a 555 LED blinker

> Review my USB-C power board in Cherry Blossom before I order it

## Good to know

- Your assistant's edits aren't on your undo stack. To go back, open the project's
  [version history](https://www.trycherryblossom.com/docs/sharing#version-history).
- To disconnect, uninstall the plugin, or remove Cherry Blossom from your assistant's connectors.
- [Privacy policy](https://www.trycherryblossom.com/privacy) ·
  [Terms](https://www.trycherryblossom.com/terms) · [Contact](https://www.trycherryblossom.com/contact)
