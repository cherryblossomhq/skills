---
name: design-a-board
description: Design a circuit board in Cherry Blossom, from an idea or a spec to a checked schematic and, when asked, a placed and routed PCB. Use when the user wants to design, build or prototype a PCB, a schematic or an electronics project (a sensor board, a power supply, an LED driver, a microcontroller breakout), or names Cherry Blossom.
---

# Design a board in Cherry Blossom

Cherry Blossom is a schematic and PCB editor in the browser. Its MCP server gives you the tools its
own copilot, Sakura, designs with, on the user's projects. The instructions the server sends when it
connects are the rules for those tools (pins, nets, parts, layout): follow them. This skill is the
order of work around them.

## Before you start

- **Check the tools are there** (`list_projects`, `create_project`, `get_design`). If they aren't, the
  server isn't connected: tell the user to add `https://www.trycherryblossom.com/api/mcp` to their
  assistant, with the steps for their app at https://www.trycherryblossom.com/docs/mcp. It works on
  every plan, Free included, and they sign in from the assistant; there is no API key.
- **Ask only what changes the circuit**: how it's powered (USB-C, a battery, a 12 V jack), what it
  connects to (a sensor, a motor, LEDs, a host over USB or I2C), and any part the user has already
  chosen. Assume the rest, and say what you assumed.

## Steps

1. **Project.** `create_project` for a new design. For an existing one, `list_projects`, then
   `get_design` before any edit, and say what you're about to change before a large rework: edits
   save at once and aren't on the user's undo stack (the editor's version history keeps earlier
   copies). Give the user the project's link straight away so they can watch it being built.
2. **Parts.** Basic parts (resistors, capacitors, LEDs, connectors, switches) come from
   `search_parts`. Chips, regulators, sensors and modules come from `create_part` with the name the
   user gave: it builds the pins and footprint from supplier data. Never write a pin map from memory
   when a supplier has the part.
3. **Circuit.** `add_component` and `connect`, with nets named by function (`VIN`, `3V3`, `SDA`).
   Every IC gets its supply, its ground and its decoupling. Take support-circuit values (feedback
   resistors, crystal load capacitors, pull-ups) from `read_datasheet`, and cite the page.
4. **Blocks.** `group_parts` by function (`USB-C INPUT`, `3.3V POWER`, `MCU`), then
   `tidy_schematic`: `whole_sheet` on a new project, otherwise only the blocks you made or changed.
5. **Check.** `run_checks`, and fix every problem you introduced. Then `look` at the schematic once
   and fix what the numbers show: overlaps, wires through symbols, unconnected pins.
6. **Board, only when the user asks.** Lay it out and route it as the `route-a-board` skill says:
   placement first, power nets at their width before the signals, a GND pour, then `run_checks`.

## Report

Say in plain words what you built, the main parts and the LCSC numbers `create_part` chose, every
assumption, and anything unverified (a part made from memory, a lookup that failed). End with the
project's link. Fabrication files (Gerbers, drill, BOM, pick-and-place) and STEP are exported from the
editor's Export menu; they aren't made through these tools.
