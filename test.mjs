import assert from 'node:assert/strict';
import { card } from './usage-battery.mjs';

const now = Date.UTC(2026, 0, 1, 12);
const week = (used) => ({ rate_limits: { seven_day: { used_percentage: used } } });
const c = (u) => card(u, now);

assert.deepEqual([c(week(10)).left, c(week(10)).mood], [90, 'happy']);
assert.deepEqual([c(week(50)).left, c(week(50)).mood], [50, 'walk']);
assert.deepEqual([c(week(85)).left, c(week(85)).mood], [15, 'tired']);
assert.deepEqual([c(week(100)).left, c(week(100)).mood], [0, 'sleep']);
assert.equal(c({}).title, 'CONTEXT');
assert.equal(c({}).left, 100);
// window present but number missing: no NaN, falls back to the other window
const odd = c({ rate_limits: { seven_day: {}, five_hour: { used_percentage: 40 } } });
assert.deepEqual([odd.left, odd.title], [60, '5 HOURS']);
console.log('ok');
