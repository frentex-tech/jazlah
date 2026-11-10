# Figma scripts (Scripter + Figma Plugin API)

All Figma work for Jazlah is done by scripts in this folder, run through the **Scripter** plugin inside the Figma file. The scripts are versioned, so the design can be rebuilt or changed later. The process is described in [`.claude/agents/uiux-designer.md`](../../.claude/agents/uiux-designer.md).

| Item | Value |
|---|---|
| Figma file | [Jazlah — Product Design](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-%E2%80%94-Product-Design) (Drafts of abdulrhmanmagdy13@gmail.com) |
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

## How to run a script (loader: no copy-paste)
Scripts are plain JavaScript files in `scripts/`. Scripter fetches them from GitHub and runs them, so you never paste long code into Scripter:

1. Commit and push the script on your branch, and note the commit SHA (`git rev-parse HEAD`). Pin the URL to the SHA, because raw.githubusercontent caches branch URLs for minutes.
2. In Figma: **Plugins → Scripter → New script (+)**, type this one line (replace `<sha>` and the file name), then press **⌘↩**:
```js
const B="https://raw.githubusercontent.com/frentex-tech/jazlah/<sha>/design/figma/scripts/"; const AF=Object.getPrototypeOf(async function(){}).constructor; const src=(await Promise.all(["_lib.js","_ds.js","00-inspect.js"].map(async f=>(await (await fetch(B+f)).text())))).join("\n"); await new AF("figma","print","B",src)(figma,print,B)
```
3. Read the output in Scripter. Scripts are idempotent, so re-running them updates in place.

Notes, verified on 2026-11-10:
- Scripter can `fetch` raw GitHub URLs and run code with `AsyncFunction`.
- `figma.currentUser` is **not** available in Scripter, so don't use it.
- Before typing, take a snapshot and check the Scripter editor is the focused element (otherwise keystrokes hit the Figma canvas and trigger shortcuts). ⌘A does not reliably select the editor text, so click **New script (+)** for every run.
- Pasting with ⌘V into the Scripter editor doesn't work through browser automation. Use the keyboard-typing tool for the one-line loader.
- Monaco auto-closes brackets and quotes, but typed balanced code comes out correct.

## Files
- `scripts/_lib.js` and `scripts/_ds.js`: shared helpers (find-or-create, fonts, variables, auto layout) and design-system builders (text, boxes, sections, variable lookups). The loader prepends both to every script and passes `B`, the pinned scripts URL (scripts read `tokens.json` through it).
- `scripts/00-inspect.js`: prints the file structure. **Always run this first.**
- `scripts/NN-<task-key>-<what>.js`: one file per change batch, numbered in the order they ran. Plain JS only (no TypeScript types), top-level `await` allowed, with globals `figma` and `print`.
