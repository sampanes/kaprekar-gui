// script.js
const startBtn = document.getElementById("startBtn");
const continueBtn = document.getElementById("continueBtn");
const stepsDiv = document.getElementById("steps");
const digitModeLabel = document.getElementById("digit-mode-label");

const kaprekarMessages = { /* TODO add more messages for 5+ digit loops */
  4: {
    9: "...9 is crazy this wasn't supposed to happen...",
    8: "You spammed the button<br>wow",
    7: "This is the longest journey, 7 steps! 🐢<br>Best of the best, only 21.9% take this long!",
    6: "You really took a scenic route, 6 steps! 🐢<br>You're in the top 38.4% of slowest journeys to 6174!",
    5: "Takin' the long way around, 5 steps! 🐢<br>Numbers have a 53.6% chance of taking 5 or more steps",
    4: "You took 4 steps to get there!<br>You're in the 66th percentile of slow journeys to 6174",
    3: "Getting to 6174 in 3 steps or more happens<br>90.4% of the time. Find a longer route!",
    2: "Getting to 6174 in 2 steps or more happens<br>96.2% of the time. Find a longer route!",
    1: "Getting to 6174 in 1 step is technically rare<br>But unimpressive all things considered"
  },
  3: {
    1: "A single step to 495? You're a prodigy. Or lucky.",
    2: "Two steps to 495. Classic.",
    3: "Three steps? Alright, scenic route for 3-digit crew.",
  },
  2: {
    loop: "2-digit numbers enter a loop, not a final convergence. 🚨",
  },
  default: {
    loop: "This digit count creates a repeating cycle instead of a fixed point.",
    fallback: "You've gone beyond the algorithm. 🌀"
  }
};

const convergenceData = {
  2: [
    { loop: [9, 81, 63, 27, 45, 9], maxSteps: 2 }
  ],
  3: [
    { loop: [495, 495], maxSteps: 6 }
  ],
  4: [
    { loop: [6174, 6174], maxSteps: 7 }
  ],
  5: [
    { loop: [53955, 59994, 53955], maxSteps: 2 },
    { loop: [61974, 82962, 75933, 63954, 61974], maxSteps: 6 },
    { loop: [62964, 71973, 83952, 74943, 62964], maxSteps: 6 }
  ],
  6: [
    { loop: [420876, 851742, 750843, 840852, 860832, 862632, 642654, 420876], maxSteps: 13 },
    { loop: [549945, 549945], maxSteps: 1 },
    { loop: [631764, 631764], maxSteps: 4 }
  ],
  7: [
    { loop: [7509843, 9529641, 8719722, 8649432, 7519743, 8429652, 7619733, 8439552, 7509843], maxSteps: 13 }
  ],
  8: [
    { loop: [43208766, 85317642, 75308643, 84308652, 86308632, 86326632, 64326654, 43208766], maxSteps: 15 },
    { loop: [63317664, 63317664], maxSteps: 4 },
    { loop: [64308654, 83208762, 86526432, 64308654], maxSteps: 19 },
    { loop: [97508421, 97508421], maxSteps: 3 }
  ],
  9: [
    { loop: [554999445, 554999445], maxSteps: 1 },
    { loop: [753098643, 954197541, 883098612, 976494321, 874197522, 865296432, 763197633, 844296552, 762098733, 964395531, 863098632, 965296431, 873197622, 865395432, 753098643], maxSteps: 13 },
    { loop: [864197532, 864197532], maxSteps: 7 }
  ],
  10: [
    { loop: [4332087666, 8533176642, 7533086643, 8433086652, 8633086632, 8633266632, 6433266654, 4332087666], maxSteps: 10 },
    { loop: [6333176664, 6333176664], maxSteps: 3 },
    { loop: [6431088654, 8732087622, 8655264432, 6431088654], maxSteps: 14 },
    { loop: [6433086654, 8332087662, 8653266432, 6433086654], maxSteps: 17 },
    { loop: [6543086544, 8321088762, 8765264322, 6543086544], maxSteps: 9 },
    { loop: [9751088421, 9775084221, 9755084421, 9751088421], maxSteps: 6 },
    { loop: [9753086421, 9753086421], maxSteps: 10 },
    { loop: [9975084201, 9975084201], maxSteps: 2 }
  ]
};

let stepCount = 0;
let resultList = [];
let numDigits = 4;
let lastResult = "0000";
let pendingCelebrationTimeout = null;
let showMeTimeout = null;
const convergentKeys = Object.keys(convergenceData).map(Number);
const MIN_DIGITS = Math.min(...convergentKeys);
const MAX_DIGITS = Math.max(...convergentKeys);

// Step animation timing (one part per slot, plus a small tail beat for the celebration)
const STEP_PART_DURATION = 280;
const STEP_CELEBRATION_TAIL = 200;

// Stagger applied to the per-character entry animation inside each part
const STEP_CHAR_STAGGER = 22;

/* --------------------------------------------------------------------------
   Message lookup
-------------------------------------------------------------------------- */
function getKaprekarMessage(stepsTaken, result) {
  const messagesForDigits = kaprekarMessages[numDigits] || {};

  if (messagesForDigits[stepsTaken]) {
    return messagesForDigits[stepsTaken];
  }

  const loopIndex = getLoopIndex(result);
  const loops = convergenceData[numDigits];

  if (loopIndex !== -1 && loops?.[loopIndex]) {
    const totalLoops = loops.length;
    const loopData = loops[loopIndex];
    const maxSteps = loopData.maxSteps;
    const period = new Set(loopData.loop).size;
    const maxTotalSteps = maxSteps + period;
    const isSinglePoint = singleConvergentPoint();
    const naturalClose = isSinglePoint ? maxSteps : maxTotalSteps;

    // Spam path — user kept clicking Continue past the natural close.
    // Still mathematically inside the same known cycle, just walking it
    // again. Report how many extra cycles they ran.
    if (stepsTaken > naturalClose) {
      const extra = stepsTaken - naturalClose;
      const cycles = extra / period;
      const loopsRun = (cycles % 1 === 0) ? String(cycles) : cycles.toFixed(1);
      const tail = period === 1 ? "extra times" : "extra times around the cycle";
      return `You spammed the Continue button and looped <b>${loopsRun}</b> ${tail}. 🌀<br>` +
             `Past the natural close, every click just walks the same cycle again.`;
    }

    const oneOf = `This is ${totalLoops === 1 ? "the only" : "one of " + totalLoops} known loop${totalLoops === 1 ? "" : "s"}`;
    return `A loop appears as the highlighted number changing until it returns to itself.<br>` +
           `${oneOf} for ${numDigits}-digit numbers.<br>` +
           `This particular loop takes at most <b>${maxSteps} step${maxSteps !== 1 ? "s" : ""}</b> to reach,` +
           ` <b>${maxTotalSteps} step${maxTotalSteps !== 1 ? "s" : ""}</b> total including one full cycle.`;
  }

  if (messagesForDigits.loop) {
    return messagesForDigits.loop;
  }
  return kaprekarMessages.default.fallback;
}

function singleConvergentPoint() {
  const loops = convergenceData[numDigits];
  if (!loops || loops.length !== 1) return false;
  return new Set(loops[0].loop).size === 1;
}

function getLoopIndex(num) {
  const numInt = parseInt(num.toString().replace(/,/g, ''));
  const loops = convergenceData[numDigits];
  if (!loops) return -1;
  return loops.findIndex(entry => entry.loop.includes(numInt));
}

function getMaxStepsForLoop(num) {
  const index = getLoopIndex(num);
  const loops = convergenceData[numDigits];
  return index !== -1 ? loops[index].maxSteps : null;
}

/* --------------------------------------------------------------------------
   Digit container
-------------------------------------------------------------------------- */
function updateDigitsContainer() {
  const container = document.getElementById("clickable-digits");
  container.innerHTML = "";
  for (let i = 1; i <= numDigits; i++) {
    const digitDiv = document.createElement("div");
    digitDiv.className = "digit";
    digitDiv.id = "d" + i;
    digitDiv.setAttribute("role", "button");
    digitDiv.setAttribute("aria-label", `Digit ${i}, tap to cycle`);
    digitDiv.tabIndex = 0;
    digitDiv.textContent = "0";

    const handler = () => {
      const current = parseInt(digitDiv.textContent, 10);
      const next = (current + 1) % 10;
      digitDiv.textContent = String(next);
      digitDiv.classList.remove("tick");
      // restart the tick animation cleanly
      void digitDiv.offsetWidth;
      digitDiv.classList.add("tick");
      updateStartText();
    };

    digitDiv.addEventListener("click", handler);
    digitDiv.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        handler();
      }
    });
    container.appendChild(digitDiv);
  }
  refreshDigitModeLabel();
  clearSteps();
}

function refreshDigitModeLabel() {
  if (digitModeLabel) {
    digitModeLabel.textContent = `${numDigits}-DIGIT MODE`;
  }
}

function getDigitsValue() {
  const container = document.getElementById("clickable-digits");
  let str = "";
  Array.from(container.children).forEach(child => {
    str += child.textContent;
  });
  return BigInt(str);
}

function changeDigitCount(delta) {
  const next = numDigits + delta;
  if (next < MIN_DIGITS || next > MAX_DIGITS) return;
  numDigits = next;
  document.documentElement.style.setProperty('--digit-count', numDigits);
  updateDigitsContainer();
  updateStartText();
}

["kaprekar", "convergence"].forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const delta = id === "kaprekar" ? -1 : +1;
  el.addEventListener("click", () => changeDigitCount(delta));
  el.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      changeDigitCount(delta);
    }
  });
});

updateDigitsContainer();

/* --------------------------------------------------------------------------
   Buttons (label helpers — continueBtn has inner label/arrow spans)
-------------------------------------------------------------------------- */
function setBtnLabel(btn, text) {
  const labelEl = btn.querySelector(".btn-label");
  if (labelEl) labelEl.textContent = text;
  else btn.textContent = text;
}

function showContinueBtn() {
  continueBtn.disabled = false;
  continueBtn.style.display = "inline-flex";
  continueBtn.classList.remove("reached", "btn-finished");
}

function updateStartText() {
  const num = padByDigits(getDigitsValue());
  setBtnLabel(startBtn, `Start with ${num}`);
}

/* --------------------------------------------------------------------------
   Kaprekar step
-------------------------------------------------------------------------- */
function isAllDigitsSame(str) {
  return str.split('').every(ch => ch === str[0]);
}

function padByDigits(n) {
  return String(n).padStart(numDigits, '0');
}

function kaprekarStep(n) {
  const digits = padByDigits(n).split('').map(Number);
  const high = parseInt([...digits].sort((a, b) => b - a).join(''));
  const low  = parseInt([...digits].sort((a, b) => a - b).join(''));
  const result = high - low;
  resultList.push(result);
  return [padByDigits(high), padByDigits(low), padByDigits(result)];
}

/* --------------------------------------------------------------------------
   Confetti — cream-palette tuned
-------------------------------------------------------------------------- */
const CONFETTI_COLORS = [
  "#CF4500", // signal
  "#F37338", // light signal
  "#9A3A0A", // clay
  "#141413", // ink
  "#E8E2DA", // deeper cream
  "#FCFBFA", // lifted cream
];

function throwConfetti() {
  for (let i = 0; i < 56; i++) {
    const confetto = document.createElement("div");
    confetto.className = "confetto";
    confetto.style.left = (Math.random() * window.innerWidth) + "px";
    confetto.style.top = "-20px";
    confetto.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    confetto.style.animationDelay = (Math.random() * 0.4) + "s";
    confetto.style.transform = `rotate(${Math.floor(Math.random() * 360)}deg)`;
    document.body.appendChild(confetto);
    setTimeout(() => confetto.remove(), 3200);
  }
}

function brokeReality(stepsTaken) {
  if (numDigits === 4) return stepsTaken > 7;
  return false;
}

function numIsConvergent(num) {
  const numInt = parseInt(num.toString().replace(/,/g, ''));
  const loops = convergenceData[numDigits];
  if (!loops || !Array.isArray(loops)) return false;
  return loops.some(entry => entry.loop.includes(numInt));
}

function celebrateKaprekar(stepsTaken, btnMsg) {
  throwConfetti();
  continueBtn.disabled = true;
  setBtnLabel(continueBtn, btnMsg);
  continueBtn.classList.add("reached");

  showBottomMessage(getKaprekarMessage(stepsTaken, lastResult));
  injectCycleViz(lastResult);

  // Pulse the whole app frame briefly to mark the moment.
  const app = document.querySelector(".app");
  if (app) {
    app.classList.remove("celebrating");
    void app.offsetWidth;
    app.classList.add("celebrating");
    setTimeout(() => app.classList.remove("celebrating"), 1200);
  }

  if (brokeReality(stepsTaken)) {
    setBtnLabel(continueBtn, "Unplug Reality?");
    continueBtn.classList.remove("reached");
    continueBtn.classList.add("btn-finished");
  }
}

/* --------------------------------------------------------------------------
   Cycle visualization — small SVG diagram of the loop topology
-------------------------------------------------------------------------- */
const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs = {}, text) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  if (text !== undefined) el.textContent = text;
  return el;
}

function buildCycleSVG(members) {
  const n = members.length;

  if (n === 1) {
    const svg = svgEl("svg", {
      class: "cycle-viz",
      viewBox: "0 0 220 110",
      "aria-hidden": "true",
    });
    // self-loop arc above the node
    svg.appendChild(svgEl("path", {
      class: "cycle-edge",
      d: "M 96 56 C 80 6, 140 6, 124 56",
    }));
    // arrowhead at the loop's return
    svg.appendChild(svgEl("path", {
      class: "cycle-arrow",
      d: "M 124 56 L 120 50 M 124 56 L 130 52",
    }));
    svg.appendChild(svgEl("circle", {
      class: "cycle-node",
      cx: 110, cy: 64, r: 10,
    }));
    svg.appendChild(svgEl("text", {
      class: "cycle-label",
      x: 110, y: 96, "text-anchor": "middle",
    }, "fixed point"));
    return svg;
  }

  const w = 320, h = 220;
  const cx = w / 2, cy = h / 2 - 8;
  const r = Math.min(cx, cy) - 30;
  const svg = svgEl("svg", {
    class: "cycle-viz",
    viewBox: `0 0 ${w} ${h}`,
    "aria-hidden": "true",
  });

  const nodes = members.map((num, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return { num, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  // edges: curved arcs between consecutive nodes, with subtle outward bow
  for (let i = 0; i < n; i++) {
    const from = nodes[i];
    const to = nodes[(i + 1) % n];
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);
    // bow outward from the centroid (cx, cy)
    const outX = midX - cx;
    const outY = midY - cy;
    const outLen = Math.hypot(outX, outY) || 1;
    const bow = 14;
    const cpX = midX + (outX / outLen) * bow;
    const cpY = midY + (outY / outLen) * bow;
    svg.appendChild(svgEl("path", {
      class: "cycle-edge",
      d: `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} Q ${cpX.toFixed(1)} ${cpY.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`,
    }));
  }

  // nodes
  nodes.forEach((node) => {
    svg.appendChild(svgEl("circle", {
      class: "cycle-node",
      cx: node.x.toFixed(1),
      cy: node.y.toFixed(1),
      r: 7,
    }));
  });

  // period label below the cluster
  svg.appendChild(svgEl("text", {
    class: "cycle-label",
    x: cx,
    y: h - 12,
    "text-anchor": "middle",
  }, `period ${n}`));

  return svg;
}

function injectCycleViz(resultNum) {
  const msgBox = document.getElementById("kaprekar-message");
  if (!msgBox) return;
  const loopIndex = getLoopIndex(resultNum);
  const loops = convergenceData[numDigits];
  if (loopIndex === -1 || !loops?.[loopIndex]) return;
  const members = [...new Set(loops[loopIndex].loop)];
  const svg = buildCycleSVG(members);
  // mark which member is the user's landing point
  const cycleNodes = svg.querySelectorAll(".cycle-node");
  const landingIdx = members.indexOf(parseInt(String(resultNum).replace(/,/g, ''), 10));
  if (landingIdx !== -1 && cycleNodes[landingIdx]) {
    cycleNodes[landingIdx].classList.add("is-current");
  }
  msgBox.appendChild(svg);
  if (members.length > 1) {
    injectShowMeControls(msgBox, members);
  }
}

/* --------------------------------------------------------------------------
   "Show me" the cycle — walks a visit marker around every member of the
   loop the user just closed, with a label flashing the current value.
   (showMeTimeout is declared with the other top-level state above to avoid
   a temporal-dead-zone reference during initial updateDigitsContainer().)
-------------------------------------------------------------------------- */
function injectShowMeControls(msgBox, members) {
  const controls = document.createElement("div");
  controls.className = "show-me-controls";

  const label = document.createElement("div");
  label.className = "show-me-label";
  label.setAttribute("aria-live", "polite");
  label.textContent = "";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "show-me-btn";
  btn.textContent = "Show me the cycle";
  btn.addEventListener("click", () => showMeTheCycle(btn, label, members));

  controls.appendChild(label);
  controls.appendChild(btn);
  msgBox.appendChild(controls);
}

function showMeTheCycle(btn, label, members) {
  if (showMeTimeout) clearTimeout(showMeTimeout);
  btn.disabled = true;
  btn.classList.add("playing");

  const nodes = document.querySelectorAll(".cycle-node");
  nodes.forEach(n => n.classList.remove("is-visiting"));

  const stepMs = Math.max(280, Math.min(580, 5000 / members.length));

  let i = 0;
  const tick = () => {
    if (i > 0) {
      const prev = nodes[i - 1];
      if (prev) prev.classList.remove("is-visiting");
    }
    if (i >= members.length) {
      btn.disabled = false;
      btn.classList.remove("playing");
      btn.textContent = "Show me again";
      showMeTimeout = null;
      return;
    }
    const node = nodes[i];
    if (node) node.classList.add("is-visiting");
    label.textContent = members[i].toLocaleString();
    label.classList.remove("flash");
    void label.offsetWidth;  // restart animation
    label.classList.add("flash");
    i++;
    showMeTimeout = setTimeout(tick, stepMs);
  };
  tick();
}

function cancelShowMe() {
  if (showMeTimeout) {
    clearTimeout(showMeTimeout);
    showMeTimeout = null;
  }
}

/* --------------------------------------------------------------------------
   Step animation — per-character spans so the nth digit of every row
   lines up vertically regardless of font (works on Sofia Sans + tabular-nums).
-------------------------------------------------------------------------- */
function buildPartElement(text, kind) {
  const partEl = document.createElement("span");
  partEl.className = `step-part step-${kind}`;
  if (kind === "num" && numIsConvergent(text)) {
    partEl.classList.add("convergent");
  }
  // One inline-block per character (width: 1ch in CSS).
  Array.from(text).forEach((ch, i) => {
    const cs = document.createElement("span");
    cs.className = "step-char";
    if (ch === " ") cs.classList.add("is-space");
    if (ch === ",") cs.classList.add("is-comma");
    cs.style.animationDelay = (i * STEP_CHAR_STAGGER) + "ms";
    cs.textContent = ch;
    partEl.appendChild(cs);
  });
  return partEl;
}

function animateStep(num1, num2, result) {
  stepCount++;
  const row = document.createElement("div");
  row.className = "step-row";

  const label = document.createElement("div");
  label.className = "step-label";
  label.textContent = `Step ${stepCount}`;

  const content = document.createElement("div");
  content.className = "step-content";

  row.appendChild(label);
  row.appendChild(content);
  stepsDiv.appendChild(row);

  lastResult = result;

  let pendingCelebration = null;
  if (singleConvergentPoint() && numIsConvergent(lastResult)) {
    pendingCelebration = () => celebrateKaprekar(stepCount, "Kaprekar reached!");
    row.classList.add("loop-closed");
  } else if (numIsConvergent(lastResult)) {
    const lastNum = parseInt(lastResult);
    const appearances = resultList.filter(n => n === lastNum).length;
    if (appearances >= 2) {
      pendingCelebration = () => celebrateKaprekar(stepCount, "Loop closed!");
      row.classList.add("loop-closed");
    } else {
      setBtnLabel(continueBtn, `Loop with ${lastResult}`);
      showContinueBtn();
    }
  } else {
    setBtnLabel(continueBtn, `Continue with ${lastResult}`);
    showContinueBtn();
  }

  const paddedWidth = numDigits + Math.floor((numDigits - 1) / 3);

  const partsData = [
    { text: Number(num1).toLocaleString().padStart(paddedWidth), kind: "num" },
    { text: " - ", kind: "op" },
    { text: Number(num2).toLocaleString().padStart(paddedWidth), kind: "num" },
    { text: " = ", kind: "op" },
    { text: Number(result).toLocaleString().padStart(paddedWidth), kind: "num" },
  ];

  partsData.forEach((part, i) => {
    setTimeout(() => {
      content.appendChild(buildPartElement(part.text, part.kind));
    }, i * STEP_PART_DURATION);
  });

  if (pendingCelebration) {
    // Debounce: only the most recently scheduled celebration actually fires.
    // If the user spams Continue, we coalesce the celebrate-confetti-message
    // into one event at the latest stepCount.
    if (pendingCelebrationTimeout) clearTimeout(pendingCelebrationTimeout);
    pendingCelebrationTimeout = setTimeout(() => {
      pendingCelebrationTimeout = null;
      pendingCelebration();
    }, partsData.length * STEP_PART_DURATION + STEP_CELEBRATION_TAIL);
  }
}

/* --------------------------------------------------------------------------
   Steps housekeeping
-------------------------------------------------------------------------- */
function clearSteps() {
  stepsDiv.innerHTML = "";
  stepCount = 0;
  continueBtn.style.display = "none";
  continueBtn.disabled = false;
  lastResult = "0000";
  continueBtn.classList.remove("reached", "btn-finished");
  resultList = [];
  if (pendingCelebrationTimeout) {
    clearTimeout(pendingCelebrationTimeout);
    pendingCelebrationTimeout = null;
  }
  cancelShowMe();
  hideBottomMessage();
}

function showBottomMessage(inMsg) {
  cancelShowMe();
  const msgBox = document.getElementById("kaprekar-message");
  msgBox.innerHTML = inMsg;
  msgBox.classList.add("show");
}

function hideBottomMessage() {
  cancelShowMe();
  const msgBox = document.getElementById("kaprekar-message");
  msgBox.textContent = "";
  msgBox.classList.remove("show");
}

/* --------------------------------------------------------------------------
   Wire up the buttons
-------------------------------------------------------------------------- */
startBtn.onclick = () => {
  startBtn.blur();
  const digitElements = Array.from(document.querySelectorAll("#clickable-digits .digit"));
  const num = digitElements.map(d => d.textContent).join("");
  clearSteps();

  if (isAllDigitsSame(num)) {
    flashError("All digits the same yields zero — pick at least two different digits.");
    return;
  }

  const [n1, n2, res] = kaprekarStep(num);
  animateStep(n1, n2, res);
};

continueBtn.onclick = () => {
  continueBtn.blur();
  if (continueBtn.disabled) return;
  const digitValues = Array.from(document.querySelectorAll("#clickable-digits .digit"))
                           .map(d => d.textContent);
  const low = parseInt(digitValues.sort((a, b) => a - b).join(''));
  if (low === 1467) return;
  const [n1, n2, res] = kaprekarStep(lastResult);
  animateStep(n1, n2, res);
};

/* --------------------------------------------------------------------------
   Reality-break alarm — dormant
   ------------------------------------------------------------------------
   Mathematically unreachable: the verification test (kaprekar.test.js)
   confirms that every n-digit non-repdigit input for n in 2..10 lands in
   one of the known cycles in convergenceData. If a future change ever
   produces a kaprekar result outside that table, this alarm exists to
   shout about it. Intentionally never called from any user flow.
   Exposed on window for dev-time preview: open the console and call
       window.__kaprekarTriggerRealityBreak({ note: "test" })
   to see the warning lights without breaking math.
-------------------------------------------------------------------------- */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function triggerRealityBreak(diagnostic) {
  if (document.querySelector(".reality-banner")) return; // idempotent
  document.body.classList.add("reality-broken");
  const banner = document.createElement("div");
  banner.className = "reality-banner";
  banner.innerHTML = `
    <div class="reality-banner-eyebrow">⚠ &nbsp;ANOMALY&nbsp; ⚠</div>
    <div class="reality-banner-title">Reality-breaking combination detected</div>
    <div class="reality-banner-text">Send this to me immediately.</div>
    <pre class="reality-banner-diag">${escapeHtml(JSON.stringify(diagnostic ?? {}, null, 2))}</pre>
  `;
  document.body.appendChild(banner);
}

if (typeof window !== "undefined") {
  window.__kaprekarTriggerRealityBreak = triggerRealityBreak;
}

/* --------------------------------------------------------------------------
   Non-blocking error nudge (replaces alert())
-------------------------------------------------------------------------- */
function flashError(message) {
  const msgBox = document.getElementById("kaprekar-message");
  msgBox.innerHTML = `<span style="color: var(--signal); font-weight: 700;">${message}</span>`;
  msgBox.classList.add("show");
  clearTimeout(flashError._t);
  flashError._t = setTimeout(() => hideBottomMessage(), 2400);
}

updateStartText();

/* --------------------------------------------------------------------------
   Keyboard shortcuts: Space / Enter to advance Continue or Start.
   Focused digits keep their existing Space/Enter cycle behavior.
-------------------------------------------------------------------------- */
document.addEventListener("keydown", (ev) => {
  if (ev.key !== " " && ev.key !== "Enter") return;
  const active = document.activeElement;
  if (active) {
    if (active.tagName === "INPUT" || active.tagName === "TEXTAREA") return;
    if (active.tagName === "BUTTON") return;  // any focused button handles its own key
    if (active.classList) {
      if (active.classList.contains("digit")) return;
      if (active.classList.contains("title-word")) return;
    }
  }
  ev.preventDefault();
  if (!continueBtn.disabled && continueBtn.style.display !== "none") {
    continueBtn.click();
  } else if (!startBtn.disabled) {
    startBtn.click();
  }
});
