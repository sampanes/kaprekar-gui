
const digits = ["d1", "d2", "d3", "d4"].map(id => document.getElementById(id));
const startBtn = document.getElementById("startBtn");
const continueBtn = document.getElementById("continueBtn");
const stepsDiv = document.getElementById("steps");

let stepCount = 0;
let lastResult = "0000";

function updateStartText() {
  const num = digits.map(d => d.textContent).join("");
  startBtn.textContent = `Start with ${num}`;
}

function fakeKaprekarStep(n) {
  // Dummy logic for now — returns three strings
  const num1 = "4213";
  const num2 = "1234";
  const result = "2979";
  return [num1, num2, result];
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
  continueBtn.textContent = `Continue with ${lastResult}`;
  continueBtn.style.display = "inline-block";
}

function clearSteps() {
  stepsDiv.innerHTML = "";
  stepCount = 0;
  continueBtn.style.display = "none";
}

startBtn.onclick = () => {
  clearSteps();
  const [n1, n2, res] = fakeKaprekarStep("0000");
  animateStep(n1, n2, res);
};

continueBtn.onclick = () => {
  const [n1, n2, res] = fakeKaprekarStep(lastResult);
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