# usage-counter-terminal

Claude Code statusline that shows how much of your weekly usage is left, as a face and a 10-cell battery:

```
\(^o^)/ ✦ 5h █████████░ 94% ↻18:53 │ week ██████████ 98% ↻Mon 01:30
```

- Above 60% left: happy. 21–60%: walking. 20% or less: tired, red. 0%: asleep.
- Shows the 5-hour and weekly windows side by side; the tightest one sets the face. Without plan limits (API key) it shows context-window usage.
- It appears in the statusline row below the input box. The position cannot be moved.

## Install

Needs Node 18+. Add to `~/.claude/settings.json`:

```json
"statusLine": { "type": "command", "command": "node '/path/to/usage-battery.mjs'" }
```

Test: `node test.mjs`

## Credit

Terminal port of [Handsher/usage-battery](https://github.com/Handsher/usage-battery) (MIT). Not affiliated with Anthropic.
