---
name: route-a-board
description: Route a Cherry Blossom PCB well, from placement that routes cleanly to trace widths sized for their current, power before signals, a ground pour and a clean check. Use when the user asks to route, re-route, finish or tidy a board's traces in Cherry Blossom, or when route_pcb leaves connections unrouted or nets narrower than their width.
---

# Route a board in Cherry Blossom

Most of good routing is placement and order. The router keeps what's already routed, so whatever goes
down first gets the room. This skill is the order of work. The server's instructions hold the rules,
so follow them. If `route_pcb` isn't available, the server isn't connected: send the user to
https://www.trycherryblossom.com/docs/mcp.

## Steps

1. **Save.** `get_design`, then `save_version` ("before routing"): there is no undo tool.
2. **Rules.** If the user named a fab, `set_design_rules` with its `fab_capability`. Keep
   high-voltage nets apart with `set_net_class` (a clearance of their own). Use `set_clearance_rule`
   for a part whose own pins sit closer than that (a relay, a fuse holder).
3. **Placement.** If parts aren't placed, run `layout_pcb`. Then `look` at the PCB and fix
   placement with `place_parts`, before any trace goes down:
   - decoupling capacitors at the pins they serve, with a regulator's input, inductor and output
     loops tight;
   - connectors at the board edge;
   - parts turned and ordered so the ratsnest lines are short and don't cross.

   Lock each part you placed on purpose (`lock: true`).
4. **Widths.** `set_net_width` for every net that carries more than about 0.5 A. Work the current out
   from the parts (the regulator's output, the motor, the LED string) and say what you assumed.
   Widths on 1 oz outer copper, for a 10 °C rise:

   | Current | Width |
   |---|---|
   | 1 A | 0.3 mm |
   | 2 A | 0.8 mm |
   | 3 A | 1.4 mm |
   | 5 A | 2.8 mm |

   For 2 oz copper (`set_board`), halve them.
5. **Ground.** `set_pour` GND on both layers. Pads on a poured net join the pour themselves, so GND
   needs no traces.
6. **Power first, then signals.** `route_pcb` with `nets` set to the current-carrying nets, then
   `route_pcb` with no nets for the rest.
7. **Read the result before changing anything.** It says what stayed unrouted, which nets went in
   narrower than their width, and why:
   - **Narrower:** do what it says. That means routing those nets first, or drawing them with
     `draw_trace` from pin to pin at the width, or making room. Never use a polygon pour in place
     of a trace.
   - **Short of room:** make the board bigger with `set_board`, then run `layout_pcb` with
     `relayout_all` and route again.
   - **Stuck at fine-pitch pads (USB-C, QFN):** routing again on the same layout gives the same
     answer. Move or turn the part, loosen the rules if the fab allows, or leave those connections
     to the user.
   - **After moving parts or changing a width:** `clear_routing` those nets or refs, then route
     again.
8. **Finish.** `set_pour` GND with `stitch`, then `run_checks`, and fix every error. Then `look` at
   the PCB once.

## Report

Say in plain words:
- what you routed;
- the width of each power net and the current you assumed;
- what's left unrouted or narrower, and why.

End with the project's link. Gerbers and the other fabrication files come from the editor's Export
menu.
