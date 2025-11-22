let currentMode = "focus";
let remainingSeconds = 25 * 60;
let timerInterval = null;

const modeButtons = document.querySelectorAll(".mode-btn");
const timerDisplay = document.getElementById("timerDisplay");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const focusInput = document.getElementById("focusInput");
const shortBreakInput = document.getElementById("shortBreakInput");
const longBreakInput = document.getElementById("longBreakInput");
const beepSound = document.getElementById("beepSound");

const totalFocusEl = document.getElementById("totalFocus");
const sessionsDoneEl = document.getElementById("sessionsDone");

let totalFocusMinutes = 0;
let sessionsDone = 0;

function getDurationForMode(mode) {
  const focus = Number(focusInput.value) || 25;
  const shortBreak = Number(shortBreakInput.value) || 5;
  const longBreak = Number(longBreakInput.value) || 15;

  if (mode === "focus") return focus * 60;
  if (mode === "short-break") return shortBreak * 60;
  if (mode === "long-break") return longBreak * 60;
  return focus * 60;
}

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function setMode(mode) {
  currentMode = mode;
  remainingSeconds = getDurationForMode(mode);
  updateDisplay();

  modeButtons.forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.mode === mode)
  );
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(remainingSeconds);
}

function tick() {
  if (remainingSeconds > 0) {
    remainingSeconds--;
    updateDisplay();
  } else {
    clearInterval(timerInterval);
    timerInterval = null;
    pauseBtn.disabled = true;
    startBtn.disabled = false;

    // Sound + stats update if focus session completed
    beepSound.currentTime = 0;
    beepSound.play().catch(() => {});

    if (currentMode === "focus") {
      const focusMinutes = Math.round(getDurationForMode("focus") / 60);
      totalFocusMinutes += focusMinutes;
      sessionsDone += 1;
      totalFocusEl.textContent = totalFocusMinutes;
      sessionsDoneEl.textContent = sessionsDone;
    }
  }
}

startBtn.addEventListener("click", () => {
  if (!timerInterval) {
    timerInterval = setInterval(tick, 1000);
    pauseBtn.disabled = false;
    startBtn.disabled = true;
  }
});

pauseBtn.addEventListener("click", () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    pauseBtn.disabled = true;
    startBtn.disabled = false;
  }
});

resetBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
  remainingSeconds = getDurationForMode(currentMode);
  updateDisplay();
  pauseBtn.disabled = true;
  startBtn.disabled = false;
});

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null;
    setMode(btn.dataset.mode);
    pauseBtn.disabled = true;
    startBtn.disabled = false;
  });
});

// Update duration if user changes inputs
[focusInput, shortBreakInput, longBreakInput].forEach((input) => {
  input.addEventListener("change", () => {
    remainingSeconds = getDurationForMode(currentMode);
    updateDisplay();
  });
});

// Initial display
updateDisplay();

// Shared resources with localStorage
const resourceForm = document.getElementById("resourceForm");
const resourceTitle = document.getElementById("resourceTitle");
const resourceLink = document.getElementById("resourceLink");
const resourceList = document.getElementById("resourceList");

const STORAGE_KEY = "virtual-study-room-resources";

function loadResources() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveResources(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function renderResources() {
  const items = loadResources();
  resourceList.innerHTML = "";

  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = "No resources yet. Add something for your study group!";
    li.style.fontSize = "0.8rem";
    li.style.color = "#9ca3af";
    resourceList.appendChild(li);
    return;
  }

  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "resource-item";

    const titleEl = document.createElement("div");
    titleEl.className = "resource-title";
    titleEl.textContent = item.title;

    const linkEl = document.createElement("a");
    linkEl.className = "resource-link";
    linkEl.href = item.link;
    linkEl.target = "_blank";
    linkEl.rel = "noopener noreferrer";
    linkEl.textContent = item.link;

    const meta = document.createElement("div");
    meta.className = "resource-meta";
    meta.innerHTML = `<span>Added on ${item.date}</span>`;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "Remove";
    delBtn.addEventListener("click", () => {
      const updated = loadResources().filter((_, i) => i !== index);
      saveResources(updated);
      renderResources();
    });

    meta.appendChild(delBtn);

    li.appendChild(titleEl);
    li.appendChild(linkEl);
    li.appendChild(meta);

    resourceList.appendChild(li);
  });
}

resourceForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = resourceTitle.value.trim();
  const link = resourceLink.value.trim();

  if (!title || !link) return;

  const items = loadResources();
  const today = new Date();
  const dateStr = today.toLocaleDateString();

  items.unshift({
    title,
    link,
    date: dateStr,
  });

  saveResources(items);
  resourceTitle.value = "";
  resourceLink.value = "";
  renderResources();
});

// Initial render
renderResources();
