// script.js
const startBtn = document.getElementById("startBtn");
const continueBtn = document.getElementById("continueBtn");
const stepsDiv = document.getElementById("steps");
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

const convergents = {
  2: new Set([9, 45, 81, 27, 63]),
  3: new Set([495]),
  4: new Set([6174]),
  5: new Set([53955, 71973, 83952, 63954, 82962, 62964, 61974, 59994, 75933, 74943]),
  6: new Set([860832, 862632, 642654, 420876, 840852, 631764, 549945, 750843, 851742]),
  7: new Set([8439552, 9529641, 8719722, 7509843, 8429652, 7619733, 8649432, 7519743]),
  8: new Set([86526432, 63317664, 75308643, 97508421, 86326632, 85317642, 84308652,
              43208766, 64308654, 86308632, 83208762, 64326654]),
  9: new Set([763197633, 954197541, 863098632, 865395432, 844296552, 964395531,
              762098733, 965296431, 865296432, 976494321, 874197522, 753098643,
              883098612, 554999445, 873197622, 864197532]),
  10: new Set([8653266432, 9755084421, 6431088654, 9751088421, 8633086632, 9975084201, 8655264432,
               7533086643, 8433086652, 9775084221, 6433086654, 8765264322, 8533176642, 8732087622,
               8633266632, 6543086544, 9753086421, 6333176664, 6433266654, 8332087662, 4332087666,
               8321088762]),
};


let stepCount = 0;
let resultList = [];
let numDigits = 4;
let lastResult = "0000";
const convergentKeys = Object.keys(convergents).map(k => parseInt(k));
const MIN_DIGITS = Math.min(...convergentKeys);
const MAX_DIGITS = Math.max(...convergentKeys);

function getKaprekarMessage(stepsTaken) {
  const messagesForDigits = kaprekarMessages[numDigits] || {};
  // Exact match for steps
  if (messagesForDigits[stepsTaken]) {
    return messagesForDigits[stepsTaken];
  }
  // Handle special loop case
  if (messagesForDigits.loop) {
    return messagesForDigits.loop;
  }
  // Fallback to shared default message if available
  return kaprekarMessages.default.fallback;
}

function singleConvergentPoint() {
  const set = convergents[numDigits];
  return set instanceof Set && set.size === 1;
}

// Updates the #clickable-digits container to have exactly numDigits children.
function updateDigitsContainer() {
  const container = document.getElementById("clickable-digits");
  container.innerHTML = "";
  for (let i = 1; i <= numDigits; i++) {
    const digitDiv = document.createElement("div");
    digitDiv.className = "digit";
    digitDiv.id = "d" + i;
    digitDiv.innerHTML = "0";
    
    // Add click event to update the digit value (example: increment the digit)
    digitDiv.addEventListener("click", function() {
      let current = parseInt(digitDiv.textContent);
      current = (current + 1) % 10;
      digitDiv.textContent = current;
      updateStartText(); // Update button text if needed
    });
    clearSteps();
    container.appendChild(digitDiv);
  }
}


// Returns the combined innerHTML values as a big integer.
function getDigitsValue() {
  const container = document.getElementById("clickable-digits");
  let str = "";
  Array.from(container.children).forEach(child => {
    str += child.textContent;
  });
  return BigInt(str);
}

// Clicking "Kaprekar's" decreases numDigits (with a minimum of 1 digit).
document.getElementById("kaprekar").addEventListener("click", function() {
  if (numDigits > MIN_DIGITS) {
    numDigits--;
    document.documentElement.style.setProperty('--digit-count', numDigits);
    updateDigitsContainer();
    updateStartText()
  }
});

// Clicking "Convergence" increases numDigits.
document.getElementById("convergence").addEventListener("click", function() {
  if (numDigits < MAX_DIGITS) {
    numDigits++;
    document.documentElement.style.setProperty('--digit-count', numDigits);
    updateDigitsContainer();
    updateStartText()
  }
});

// Initialize the container when the script loads.
updateDigitsContainer();


function updateStartText() {
  const num = padByDigits(getDigitsValue());
  startBtn.textContent = `Start with ${num}`;
}

function isAllDigitsSame(str) {
  return str.split('').every(ch => ch === str[0]);
}

function padByDigits(n) {
  return String(n).padStart(numDigits, '0');
}

function kaprekarStep(n) {
  let digits = padByDigits(n).split('').map(Number);
  let high = parseInt([...digits].sort((a,b) => b - a).join(''));
  let low  = parseInt([...digits].sort((a,b) => a - b).join(''));
  let result = high - low;
  resultList.push(result);
  console.log("kaprekar step: ",resultList);
  return [padByDigits(high), padByDigits(low), padByDigits(result)];
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

function brokeReality(stepsTaken) {
  if (numDigits == 4) return stepsTaken > 7;
  return false;
}

function numIsConvergent(num) {
  const numInt = parseInt(num);
  const set = convergents[numDigits];
  return set ? set.has(numInt) : false;
}


function celebrateKaprekar(stepsTaken, btnMsg) {
  console.log("Celebrate: "+resultList);
  throwConfetti();
  continueBtn.disabled = true;
  continueBtn.textContent = btnMsg;
  continueBtn.classList.add("reached")

  showBottomMessage(getKaprekarMessage(stepsTaken));

  if (brokeReality(stepsTaken)) {
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

  if (singleConvergentPoint() && numIsConvergent(lastResult)) {
    celebrateKaprekar(stepCount, "Kaprekar reached!");
  } else if (numIsConvergent(lastResult)) {

    console.log("Animate step, num is convergent: ",resultList);
    const lastNum = parseInt(lastResult);
    const appearances = resultList.filter(n => n === lastNum).length;
    
    if (appearances >= 2) {
      celebrateKaprekar(stepCount, "Loop closed!");
    } else {
      continueBtn.textContent = `Loop with ${lastResult}`;
      continueBtn.disabled = false;
      continueBtn.style.display = "inline-block";
      continueBtn.style.backgroundColor = "";
      continueBtn.style.color = "";
      continueBtn.style.border = "";
    }
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
      if (numIsConvergent(text)) {
        span.style.fontWeight = "bold";
        span.style.color = "#ff6f91";
      }
      content.appendChild(span);
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
  resultList = []
  console.log("Clear steps: ",resultList);
  hideBottomMessage();
}

function showBottomMessage(inMsg) {
  const msgBox = document.getElementById("kaprekar-message");
  const msg = inMsg;
  msgBox.innerHTML = msg;
  msgBox.classList.add("show");
}

function hideBottomMessage() {
  const msgBox = document.getElementById("kaprekar-message");
  msgBox.textContent = "";
  msgBox.classList.remove("show");
}

startBtn.onclick = () => {
  startBtn.blur();
  const digitElements = Array.from(document.querySelectorAll("#clickable-digits .digit"));
  const num = digitElements.map(d => d.textContent).join("");  
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
  // Get current digit elements and their text values
  const digitValues = Array.from(document.querySelectorAll("#clickable-digits .digit"))
                           .map(d => d.textContent);
  // Sort the values numerically, join them, and convert to a number
  let low = parseInt(digitValues.sort((a, b) => a - b).join(''));
  if (low === 1467) return;
  const [n1, n2, res] = kaprekarStep(lastResult);
  animateStep(n1, n2, res);
};

updateStartText();
