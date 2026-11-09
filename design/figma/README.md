# Figma scripts (Scripter + Figma Plugin API)

All Figma work for Jazlah is done by scripts in this folder, run through the **Scripter** plugin inside the Figma file. The scripts are versioned, so the design can be rebuilt or changed later. The process is described in [`.claude/agents/uiux-designer.md`](../../.claude/agents/uiux-designer.md).

| Item | Value |
|---|---|
| Figma file | _add link after DSN-DES-1 creates it_ |
| Editing account | _the Frentex account with edit access_ |
| Plugin | [Scripter](https://www.figma.com/community/plugin/757836922707087381) (install once per account) |

## How to run a script
1. Open the Figma file in the browser and run **Plugins → Scripter**.
2. Create a new script, paste the contents of `scripts/_lib.ts`, then the script you want, and press **Run**.
3. Check the output panel and the canvas. Scripts are idempotent, so re-running them updates in place.

## Files
- `scripts/_lib.ts`: shared helpers (find-or-create, fonts, variables, auto layout, components).
- `scripts/00-inspect.ts`: prints the file structure. **Always run this first.**
- `scripts/NN-<task-key>-<what>.ts`: one file per change batch, numbered in the order they ran.
