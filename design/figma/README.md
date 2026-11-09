# Figma scripts (Scripter + Figma Plugin API)

All Figma work for Jazlah is done by scripts in this folder, run through the **Scripter** plugin inside the Figma file. The scripts are versioned, so the design can be rebuilt or changed later. The process is described in [`.claude/agents/uiux-designer.md`](../../.claude/agents/uiux-designer.md).

| Item | Value |
|---|---|
| Figma file | _the designer agent creates "Jazlah — Product Design" in DSN-DES-1 and adds the link here_ |
| Editing account | abdulrhmanmagdy13@gmail.com |
| Plugin | [Scripter](https://www.figma.com/community/plugin/757836922707087381) (install once per account) |

## Browser setup (one time per machine)
The designer agent drives a real Chrome window through the chrome-devtools MCP. Use a dedicated profile, so the Figma login stays separate from your personal browser:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222 --user-data-dir="$HOME/.chrome-jazlah-figma"
```
1. In that window, sign in to figma.com with **abdulrhmanmagdy13@gmail.com**, and install the **Scripter** plugin once.
2. Keep the window open while the agent works. Next time, run the same command and you'll still be signed in.
3. Each developer does this once on their own machine. Kerolles signs in with the same Figma account, or with his own if it's invited as an editor to the file.

## How to run a script
1. Open the Figma file in the browser and run **Plugins → Scripter**.
2. Create a new script, paste the contents of `scripts/_lib.ts`, then the script you want, and press **Run**.
3. Check the output panel and the canvas. Scripts are idempotent, so re-running them updates in place.

## Files
- `scripts/_lib.ts`: shared helpers (find-or-create, fonts, variables, auto layout, components).
- `scripts/00-inspect.ts`: prints the file structure. **Always run this first.**
- `scripts/NN-<task-key>-<what>.ts`: one file per change batch, numbered in the order they ran.
