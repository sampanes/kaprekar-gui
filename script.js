// script.js
const digits = ["d1", "d2", "d3", "d4"].map(id => document.getElementById(id));
const startBtn = document.getElementById("startBtn");
const continueBtn = document.getElementById("continueBtn");
const stepsDiv = document.getElementById("steps");
const kaprekarMessages = {
  9: "...9 is crazy this wasn't supposed to happen...",
  8: "You spammed the button<br>wow",
  7: "This is the longest journey, 7 steps! 🐢<br>Best of the best, only 21.9% take this long!",
  6: "You really took a scenic route, 6 steps! 🐢<br>You're in the top 38.4% of slowest journeys to 6174!",
  5: "Takin' the long way around, 5 steps! 🐢<br>Numbers have a 53.6% chance of taking 5 or more steps",
  4: "You took 4 steps to get there!<br>You're in the 66th percentile of slow journeys to 6174",
  3: "Getting to 6174 in 3 steps or more happens<br>90.4% of the time. Find a longer route!",
  2: "Getting to 6174 in 2 steps or more happens<br>96.2% of the time. Find a longer route!",
  1: "Getting to 6174 in 1 step is technically rare<br>But unimpressive all things considered"
};


let stepCount = 0;
let lastResult = "0000";
const KAPREKAR_CONSTANT = "6174";

function updateStartText() {
  const num = digits.map(d => d.textContent).join("");
  startBtn.textContent = `Start with ${num}`;
}

function isAllDigitsSame(str) {
  return str.split('').every(ch => ch === str[0]);
}

function pad4(n) {
  return String(n).padStart(4, '0');
}

function kaprekarStep(n) {
  let digits = pad4(n).split('').map(Number);
  let high = parseInt([...digits].sort((a,b) => b - a).join(''));
  let low  = parseInt([...digits].sort((a,b) => a - b).join(''));
  let result = high - low;
  return [pad4(high), pad4(low), pad4(result)];
}

function throwConfetti() {
  for (let i = 0; i < 40; i++) {
    const confetto = document.createElement("div");
    confetto.className = "confetto";
    confetto.style.left = Math.random() * window.innerWidth + "px";
    confetto.style.top = "-20px";
    confetto.style.backgroundColor = getRandomConfettiColor();
    confetto.style.animationDelay = Math.random() * 0.3 + "s";

    document.body.appendChild(confetto);

    setTimeout(() => confetto.remove(), 3000);
  }
}
  
function getRandomConfettiColor() {
  const colors = ["#f94144", "#f3722c", "#f9c74f", "#90be6d", "#577590", "#43aa8b", "#ff6f91"];
  return colors[Math.floor(Math.random() * colors.length)];
}
  
function celebrateKaprekar(stepsTaken) {
  throwConfetti();
  continueBtn.disabled = true;
  continueBtn.textContent = "Kaprekar reached!";
  continueBtn.classList.add("reached")

  const msgBox = document.getElementById("kaprekar-message");
  const msg = kaprekarMessages[stepsTaken] || "You've gone beyond the algorithm. 🌀";
  msgBox.innerHTML = msg;
  msgBox.classList.add("show");
  if (stepsTaken > 7) {
    continueBtn.textContent = "Unplug Reality?";
    continueBtn.classList.remove("btn-active");
    continueBtn.classList.add("btn-finished");
  }  
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

  // update button state immediately before animation
  lastResult = result;

  if (result === KAPREKAR_CONSTANT) {
    celebrateKaprekar(stepCount);
  } else {
    continueBtn.textContent = `Continue with ${lastResult}`;
    continueBtn.disabled = false;
    continueBtn.style.display = "inline-block";
    continueBtn.style.backgroundColor = "";
    continueBtn.style.color = "";
    continueBtn.style.border = "";
  }

  const parts = [num1, "-", num2, "=", result];
  parts.forEach((text, i) => {
    const delay = i * 300;
    setTimeout(() => {
      const span = document.createElement("span");
      span.textContent = text;
      content.appendChild(span);

      if (i === parts.length - 1 && result !== KAPREKAR_CONSTANT) {
        continueBtn.disabled = false;
      }
    }, delay);
  });
}

function clearSteps() {
  stepsDiv.innerHTML = "";
  stepCount = 0;
  continueBtn.style.display = "none";
  continueBtn.disabled = false;
  lastResult = "0000";
  continueBtn.classList.remove("reached")

  const msgBox = document.getElementById("kaprekar-message");
  msgBox.textContent = "";
  msgBox.classList.remove("show");
}


startBtn.onclick = () => {
  startBtn.blur();
  const num = digits.map(d => d.textContent).join("");
  clearSteps();

  if (isAllDigitsSame(num)) {
    alert("Digits must not all be the same.");
    return;
  }

  const [n1, n2, res] = kaprekarStep(num);
  animateStep(n1, n2, res);
};

continueBtn.onclick = () => {
  continueBtn.blur();
  if (continueBtn.disabled) return;
  let low  = parseInt([...digits].sort((a,b) => a - b).join(''));
  if (low == 1467) return;
  const [n1, n2, res] = kaprekarStep(lastResult);
  animateStep(n1, n2, res);
};

digits.forEach(d => {
  d.onclick = () => {
    let val = parseInt(d.textContent);
    val = (val + 1) % 10;
    d.textContent = val;
    updateStartText();
  };
});

updateStartText();
alert("JS is running");