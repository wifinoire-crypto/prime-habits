const todayKey = () => new Date().toISOString().slice(0, 10);

const defaultState = {
  habits: [
    { id: crypto.randomUUID(), name: "Study 45 minutes", category: "Study", createdAt: todayKey() },
    { id: crypto.randomUUID(), name: "Drink water", category: "Health", createdAt: todayKey() },
    { id: crypto.randomUUID(), name: "Plan tomorrow", category: "Personal", createdAt: todayKey() }
  ],
  completions: {},
  reflections: {}
};

let state = loadState();

function loadState() {
  const saved = localStorage.getItem("primeHabitsState");
  return saved ? JSON.parse(saved) : defaultState;
}

function saveState() {
  localStorage.setItem("primeHabitsState", JSON.stringify(state));
}

function isDone(habitId, date = todayKey()) {
  return state.completions[date]?.includes(habitId);
}

function toggleHabit(habitId) {
  const date = todayKey();
  if (!state.completions[date]) state.completions[date] = [];

  if (state.completions[date].includes(habitId)) {
    state.completions[date] = state.completions[date].filter(id => id !== habitId);
  } else {
    state.completions[date].push(habitId);
  }

  saveState();
  render();
}

function addHabit(name, category) {
  state.habits.push({
    id: crypto.randomUUID(),
    name,
    category,
    createdAt: todayKey()
  });
  saveState();
  render();
}

function deleteHabit(habitId) {
  state.habits = state.habits.filter(habit => habit.id !== habitId);
  Object.keys(state.completions).forEach(date => {
    state.completions[date] = state.completions[date].filter(id => id !== habitId);
  });
  saveState();
  render();
}

function getStreak(habitId) {
  let streak = 0;
  const current = new Date();

  for (let i = 0; i < 365; i++) {
    const date = new Date(current);
    date.setDate(current.getDate() - i);
    const key = date.toISOString().slice(0, 10);

    if (isDone(habitId, key)) streak++;
    else break;
  }

  return streak;
}

function getWeekDates() {
  const dates = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    dates.push(date);
  }

  return dates;
}

function weeklyPercent(date) {
  const key = date.toISOString().slice(0, 10);
  if (state.habits.length === 0) return 0;
  const completed = state.completions[key]?.length || 0;
  return Math.round((completed / state.habits.length) * 100);
}

function renderToday() {
  const list = document.getElementById("todayHabitList");
  list.innerHTML = "";

  state.habits.forEach(habit => {
    const done = isDone(habit.id);
    const item = document.createElement("div");
    item.className = "habit-item";
    item.innerHTML = `
      <div class="check ${done ? "done" : ""}" data-id="${habit.id}">${done ? "✓" : ""}</div>
      <div class="habit-meta">
        <h4>${habit.name}</h4>
        <span class="badge">${habit.category}</span>
      </div>
      <strong>${getStreak(habit.id)}d</strong>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll(".check").forEach(check => {
    check.addEventListener("click", () => toggleHabit(check.dataset.id));
  });

  const completed = state.completions[todayKey()]?.length || 0;
  const total = state.habits.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const best = state.habits.reduce((max, habit) => Math.max(max, getStreak(habit.id)), 0);

  document.getElementById("completedCount").textContent = `${completed}/${total}`;
  document.getElementById("dailyPercent").textContent = `${percent}%`;
  document.getElementById("bestStreak").textContent = `${best} days`;
}

function renderHabits() {
  const list = document.getElementById("allHabitList");
  list.innerHTML = "";

  state.habits.forEach(habit => {
    const item = document.createElement("div");
    item.className = "habit-item";
    item.innerHTML = `
      <div class="check done">•</div>
      <div class="habit-meta">
        <h4>${habit.name}</h4>
        <span class="badge">${habit.category}</span>
      </div>
      <button class="delete-btn" data-id="${habit.id}">Delete</button>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteHabit(btn.dataset.id));
  });
}

function renderProgress() {
  const bars = document.getElementById("weekBars");
  bars.innerHTML = "";

  getWeekDates().forEach(date => {
    const percent = weeklyPercent(date);
    const label = date.toLocaleDateString(undefined, { weekday: "short" });

    const row = document.createElement("div");
    row.className = "day-row";
    row.innerHTML = `
      <strong>${label}</strong>
      <div class="bar-track"><div class="bar-fill" style="width:${percent}%"></div></div>
      <span>${percent}%</span>
    `;
    bars.appendChild(row);
  });

  const streakList = document.getElementById("streakList");
  streakList.innerHTML = "";

  state.habits.forEach(habit => {
    const item = document.createElement("div");
    item.className = "habit-item";
    item.innerHTML = `
      <div class="check done">🔥</div>
      <div class="habit-meta">
        <h4>${habit.name}</h4>
        <span class="badge">${habit.category}</span>
      </div>
      <strong>${getStreak(habit.id)} days</strong>
    `;
    streakList.appendChild(item);
  });
}

function renderReflection() {
  const box = document.getElementById("reflectionBox");
  box.value = state.reflections[todayKey()] || "";

  const completed = state.completions[todayKey()]?.length || 0;
  const missed = state.habits
    .filter(habit => !isDone(habit.id))
    .map(habit => habit.name);

  document.getElementById("promptBox").textContent =
`Act like my habit coach. Review my day and give me a simple plan for tomorrow.

Completed habits: ${completed}/${state.habits.length}
Missed habits: ${missed.length ? missed.join(", ") : "None"}
Reflection: ${box.value || "No reflection yet."}

Give me:
1. One thing I did well
2. One thing to improve
3. A realistic habit plan for tomorrow`;
}

function render() {
  document.getElementById("dateLabel").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

  renderToday();
  renderHabits();
  renderProgress();
  renderReflection();
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".view").forEach(view => view.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(`${btn.dataset.view}View`).classList.add("active");
    document.getElementById("viewTitle").textContent = btn.textContent;
  });
});

document.getElementById("habitForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("habitName").value.trim();
  const category = document.getElementById("habitCategory").value;

  if (name) addHabit(name, category);

  event.target.reset();
});

document.getElementById("saveReflectionBtn").addEventListener("click", () => {
  state.reflections[todayKey()] = document.getElementById("reflectionBox").value.trim();
  saveState();
  renderReflection();
});

document.getElementById("copyPromptBtn").addEventListener("click", async () => {
  await navigator.clipboard.writeText(document.getElementById("promptBox").textContent);
  alert("Prompt copied.");
});

document.getElementById("resetDemoBtn").addEventListener("click", () => {
  localStorage.removeItem("primeHabitsState");
  state = structuredClone(defaultState);
  saveState();
  render();
});

render();
