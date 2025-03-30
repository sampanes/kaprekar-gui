// script.js
const digits = ["d1", "d2", "d3", "d4"].map(id => document.getElementById(id));
const startBtn = document.getElementById("startBtn");
const continueBtn = document.getElementById("continueBtn");
const stepsDiv = document.getElementById("steps");

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

  const parts = [num1, "-", num2, "=", result];
  parts.forEach((text, i) => {
    setTimeout(() => {
      const span = document.createElement("span");
      span.textContent = text;
      content.appendChild(span);
    }, i * 400);
  });

  lastResult = result;

  if (result === KAPREKAR_CONSTANT) {
    continueBtn.disabled = true;
    continueBtn.textContent = "Kaprekar reached!";
  } else {
    continueBtn.textContent = `Continue with ${lastResult}`;
    continueBtn.disabled = false;
    continueBtn.style.display = "inline-block";
  }
}

function clearSteps() {
  stepsDiv.innerHTML = "";
  stepCount = 0;
  continueBtn.style.display = "none";
  continueBtn.disabled = false;
  lastResult = "0000";
}

startBtn.onclick = () => {
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