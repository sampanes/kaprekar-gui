// Node-only, no-DOM test for the Kaprekar routine.
//
// Verifies that convergenceData in script.js correctly describes every cycle
// reachable for digit counts 2..10, and that the declared maxSteps matches the
// actual worst-case number of iterations needed to first enter the cycle.
//
// Strategy: iterate distinct digit multisets (not integers) since the Kaprekar
// step depends only on the digit multiset. For n=10 that's C(19,10)=92378
// trajectories instead of 10^10.
//
// Run: node kaprekar.test.js

'use strict';
const fs = require('fs');
const path = require('path');

function extractConvergenceData(source) {
  const idx = source.indexOf('const convergenceData');
  if (idx === -1) throw new Error('convergenceData not found in script.js');
  const open = source.indexOf('{', idx);
  let depth = 0, end = -1;
  for (let i = open; i < source.length; i++) {
    const c = source[i];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (end === -1) throw new Error('Unbalanced braces in convergenceData literal');
  return eval('(' + source.slice(open, end) + ')');
}

function kaprekarStep(num, n) {
  const padded = String(num).padStart(n, '0');
  const digits = [...padded];
  const desc = digits.slice().sort((a, b) => b.localeCompare(a)).join('');
  const asc  = digits.slice().sort().join('');
  return Number(desc) - Number(asc);
}

function trajectory(start, n) {
  const seen = new Map();
  let cur = start;
  let step = 0;
  while (!seen.has(cur)) {
    seen.set(cur, step);
    cur = kaprekarStep(cur, n);
    step++;
    if (step > 200) throw new Error(`No convergence for start=${start} n=${n}`);
  }
  const cycleStart = seen.get(cur);
  const sequence = new Array(seen.size);
  for (const [num, idx] of seen) sequence[idx] = num;
  return {
    stepsToLoop: cycleStart,
    loop: sequence.slice(cycleStart),
  };
}

function* multisets(n) {
  const arr = new Array(n);
  function* rec(pos, minDigit) {
    if (pos === n) { yield arr.slice(); return; }
    for (let d = minDigit; d <= 9; d++) {
      arr[pos] = d;
      yield* rec(pos + 1, d);
    }
  }
  yield* rec(0, 0);
}

function multisetToNumber(digits) {
  return Number(digits.slice().sort((a, b) => b - a).join(''));
}

function isRepdigit(digits) {
  return digits.every(d => d === digits[0]);
}

function cycleKey(loop) {
  return [...new Set(loop)].sort((a, b) => a - b).join(',');
}

function scan(n) {
  const observed = new Map();
  let trajectories = 0;
  for (const digits of multisets(n)) {
    if (isRepdigit(digits)) continue;
    trajectories++;
    const start = multisetToNumber(digits);
    const { stepsToLoop, loop } = trajectory(start, n);
    const key = cycleKey(loop);
    const prev = observed.get(key);
    if (!prev) observed.set(key, { loop, maxSteps: stepsToLoop });
    else if (stepsToLoop > prev.maxSteps) prev.maxSteps = stepsToLoop;
  }
  return { observed, trajectories };
}

function fmt(loop, max = 4) {
  if (loop.length <= max) return JSON.stringify(loop);
  return `[${loop.slice(0, max).join(', ')}, ...${loop.length - max} more]`;
}

function main() {
  const source = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
  const convergenceData = extractConvergenceData(source);

  let pass = 0, fail = 0;
  const t0 = Date.now();

  const digitCounts = Object.keys(convergenceData).map(Number).sort((a, b) => a - b);
  for (const n of digitCounts) {
    const tn = Date.now();
    const { observed, trajectories } = scan(n);
    const declared = convergenceData[n];
    const ms = Date.now() - tn;
    console.log(`\n${n}-digit  (${trajectories} multisets, ${ms}ms)`);

    const matchedKeys = new Set();
    for (const d of declared) {
      const k = cycleKey(d.loop);
      const obs = observed.get(k);
      if (!obs) {
        console.log(`  FAIL  declared cycle ${fmt(d.loop)} never observed`);
        fail++;
        continue;
      }
      matchedKeys.add(k);
      if (obs.maxSteps !== d.maxSteps) {
        console.log(`  FAIL  cycle@${d.loop[0]}  maxSteps declared=${d.maxSteps} observed=${obs.maxSteps}`);
        fail++;
      } else {
        console.log(`  pass  cycle@${d.loop[0]}  maxSteps=${obs.maxSteps}  period=${new Set(d.loop).size}`);
        pass++;
      }
    }
    for (const [k, v] of observed) {
      if (matchedKeys.has(k)) continue;
      console.log(`  FAIL  observed cycle ${fmt(v.loop)} not in convergenceData`);
      fail++;
    }
  }

  console.log(`\n${pass} pass, ${fail} fail in ${Date.now() - t0}ms total`);
  process.exit(fail > 0 ? 1 : 0);
}

main();
