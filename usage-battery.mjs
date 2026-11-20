#!/usr/bin/env node
// Claude Code statusline: Clawd face + 10-cell battery of usage left.
// Logic ported from Handsher/usage-battery (MIT). Reads statusline JSON on stdin.
import { realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
const ok = (r) => Number.isFinite(r?.used_percentage);
const hhmm = (d) => d.toTimeString().slice(0, 5);
// 256-color codes: Apple Terminal has no 24-bit color.
const paint = (code, s) => `\x1b[38;5;${code}m${s}\x1b[0m`;

function card(u, now = Date.now()) {
  const rl = u.rate_limits || {};
  const week = ok(rl.seven_day) ? rl.seven_day : null;
  const five = ok(rl.five_hour) ? rl.five_hour : null;
  const main = week || five;
  const left = main ? clamp(100 - main.used_percentage)
    : clamp(100 - (Number(u.context_window?.used_percentage) || 0));
  const title = week ? 'WEEKLY' : five ? '5 HOURS' : 'CONTEXT';
  const when = (r) => {
    if (!r?.resets_at) return '';
    const d = new Date(r.resets_at * 1000);
    const today = new Date(now).toDateString() === d.toDateString();
    return today ? hhmm(d) : `${DAYS[d.getDay()]} ${hhmm(d)}`;
  };
  const color = left > 50 ? 114 : left > 20 ? 221 : 203;
  const mood = left === 0 ? 'sleep' : left <= 20 ? 'tired' : left > 60 ? 'happy' : 'walk';
  return { left, title, color, mood, reset: when(main), five: week && five ? { left: clamp(100 - five.used_percentage), at: when(five) } : null };
}

const FACE = { sleep: '(-.-) zZ', tired: '(;_;)', happy: '\\(^o^)/ ✦', walk: '(•_•)>' };

function render(c) {
  const cells = Math.round(c.left / 10);
  const bar = '█'.repeat(cells) + '░'.repeat(10 - cells);
  let out = `${FACE[c.mood]} ${paint(c.color, `[${bar}] ${c.left}%`)} ${c.title}`;
  if (c.reset) out += ` · resets ${c.reset}`;
  if (c.five) out += ` │ 5h ${c.five.left}%${c.five.at ? ` · refills ${c.five.at}` : ''}`;
  return out;
}

// realpath so a symlinked install still counts as the main script.
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  let s = '';
  process.stdin.on('data', (d) => (s += d)).on('end', () => {
    try { console.log(render(card(JSON.parse(s)))); } catch { /* bad input: print nothing */ }
  });
}
export { card, render };
