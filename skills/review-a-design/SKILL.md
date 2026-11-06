---
name: review-a-design
description: Review an existing Cherry Blossom schematic or PCB for mistakes without changing it, from wiring and pinouts to support circuits, ratings and layout, and report what to fix. Use when the user asks to review, check, audit or sanity-check a board or schematic in Cherry Blossom, or asks whether a design is ready to order.
---

# Review a design in Cherry Blossom

A review reads the project and changes nothing until the user says so. Cherry Blossom's MCP server
supplies the tools; if `list_projects` isn't available, the server isn't connected (steps at
https://www.trycherryblossom.com/docs/mcp).

Use only the tools that read: `list_projects`, `get_design`, `get_wiring`, `run_checks`,
`search_parts`, `find_part`, `get_part_data`, `read_datasheet` and `look`. `verify_parts` updates the
parts it checks, so offer it rather than running it.

## Steps

1. **Find the project.** `list_projects`, and ask which one if more than one could be meant. Then
   `get_design`, every sheet of it.
2. **Run the checks.** `run_checks`. Every error is a finding. Weigh each warning: say why one that
   isn't a mistake is fine. Skip the warnings the user has ignored.
3. **Parts.** For every IC, regulator, sensor and module:
   - A part `run_checks` marks unverified or contradicted is a finding: its pins or footprint may not
     be the real part's.
   - Compare its pins and package with `get_part_data`.
   - Read its datasheet (`read_datasheet`: pins, ratings, application) and compare the support
     circuit with the recommended one: decoupling per supply pin, input and output capacitors,
     feedback divider values, pull-ups, crystal load capacitors, enable, reset and boot pins. Cite
     the page.
   - Check ratings against the design: supply voltage, input range, output current, power
     dissipation.
4. **Nets.** Every IC has its supply and ground. Rails carry the voltage their name says. No net
   joins two outputs. Connectors put the right signal on the right pin.
5. **Board, if it's laid out.** `look` at the PCB and read its numbers: unrouted connections, parts
   off the board, overlaps. Then the layout itself: decoupling capacitors at their pins, a switching
   regulator's loops short, power nets wide enough for their current (the widths in `route-a-board`),
   a ground pour, clearance for high-voltage nets.

## Report

List findings worst first, in three groups: **Must fix** (the board won't work, or could be
damaged), **Should fix** (works, but marginal or fragile) and **Consider**. For each, name the parts,
pins or net, say why it matters, cite the datasheet page where one applies, and say the fix. Say
what you checked and found fine as well, briefly. End with the project's link, and offer to make the
fixes: that changes the design, so wait for the user to say yes.
