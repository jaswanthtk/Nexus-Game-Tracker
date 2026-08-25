---
trigger: always_on
---

# Project Rules — Game Tracker (01CE1306)

STACK
- Vanilla HTML, CSS, JavaScript, XML (games.xml), and browser localStorage ONLY.
- No frameworks, no build tools, no package.json, no backend/database/API of any
  kind. If a task seems to require one, stop and ask before adding it.

DO NOT BREAK EXISTING LOGIC
- Before editing any existing file, read it fully first.
- Never rename or remove an HTML id, class, or data-attribute, or change the
  games.xml schema, without first confirming (by searching app.js and admin.js)
  whether it's referenced there. If it is, update every reference in the same
  change — never leave one side stale.
- Do not refactor or "clean up" code you weren't asked to touch. If you notice a
  bug in untouched code, report it in the Walkthrough — do not fix it inline.

CHANGE DISCIPLINE
- Before any wide-reaching change (redesign, new pages, restructuring), create a
  backup: a git branch/tag or a copied folder, so we can roll back.
- Keep changes scoped to what the current Implementation Plan describes. If you
  discover the task needs to grow, pause and update the plan rather than
  expanding silently.

VERIFICATION (do this before marking any task complete)
- Open every page you touched using the browser subagent and confirm zero
  console errors.
- Click through all nav links you touched and confirm none 404 or dead-end.
- For any feature touching localStorage, verify data survives a page refresh.
- Capture a screenshot or recording of the above as part of your Walkthrough.

COMMUNICATION
- Always produce a Task List and Implementation Plan before writing code, and
  wait for my review/comments on the plan before executing it.
- Keep the Walkthrough scoped to what actually changed — no marketing language,
  just what changed, why, and how I can verify it.