---
description: Enable the usage-counter-terminal statusline in ~/.claude/settings.json
---

Set the `statusLine` key in `~/.claude/settings.json` to:

```json
{ "type": "command", "command": "node '${CLAUDE_PLUGIN_ROOT}/usage-battery.mjs'" }
```

Replace `${CLAUDE_PLUGIN_ROOT}` with the real absolute path of this plugin's directory (the folder containing `usage-battery.mjs`; find it with `find ~/.claude/plugins -name usage-battery.mjs`). Keep all other settings. If a `statusLine` already exists, show it and ask before overwriting. Tell the user to restart Claude Code.
