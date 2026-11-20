#!/usr/bin/env node
// Claude Code statusline: Clawd face + battery bars of usage left (5h and weekly).
// Logic ported from Handsher/usage-battery (MIT). Reads statusline JSON on stdin.
import { realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
const ok = (r) => Number.isFinite(r?.used_percentage);
const hhmm = (d) => d.toTimeString().slice(0, 5);
// 256-color codes: Apple Terminal has no 24-bit color.
const paint = (code, s) => `\x1b[38;5;${code}m${s}\x1b[0m`;
const colorOf = (left) => (left > 50 ? 114 : left > 20 ? 221 : 203);

function card(u, now = Date.now()) {
  const rl = u.rate_limits || {};
  const when = (r) => {
    if (!r?.resets_at) return '';
    const d = new Date(r.resets_at * 1000);
    const today = new Date(now).toDateString() === d.toDateString();
    return today ? hhmm(d) : `${DAYS[d.getDay()]} ${hhmm(d)}`;
  };
  const wins = [['5h', rl.five_hour], ['week', rl.seven_day]]
    .filter(([, r]) => ok(r))
    .map(([name, r]) => ({ name, left: clamp(100 - r.used_percentage), at: when(r) }));
  if (!wins.length) wins.push({ name: 'ctx', left: clamp(100 - (Number(u.context_window?.used_percentage) || 0)), at: '' });
  // The tightest window decides the face: at 0% in either one you are blocked.
  const left = Math.min(...wins.map((w) => w.left));
  const mood = left === 0 ? 'sleep' : left <= 20 ? 'tired' : left > 60 ? 'happy' : 'walk';
  return { left, mood, wins };
}

const FACE = { sleep: '(-.-) zZ', tired: '(;_;)', happy: '\\(^o^)/ ✦', walk: '(•_•)>' };

function render(c) {
  const seg = (w) => {
    const cells = Math.round(w.left / 10);
    const bar = '█'.repeat(cells) + '░'.repeat(10 - cells);
    return `${w.name} ${paint(colorOf(w.left), `${bar} ${w.left}%`)}${w.at ? ` ↻${w.at}` : ''}`;
  };
  return `${FACE[c.mood]} ${c.wins.map(seg).join(' │ ')}`;
}

// realpath so a symlinked install still counts as the main script.
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  let s = '';
  process.stdin.on('data', (d) => (s += d)).on('end', () => {
    try { console.log(render(card(JSON.parse(s)))); } catch { /* bad input: print nothing */ }
  });
}
export { card, render };
