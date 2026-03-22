const ICON_POOL = ["🎯","✨","📚","💻","🏃","🚴","🧠","🙏","📿","💪","🍫","💧","🌙","💼","📝","🎨","📖","🧘","🏆","🔥"];
const VAPID_PUBLIC_KEY = "BDS_T-d3nLp2GImA-o_pWCoI-yq8u2zYFqgJzY_jJ6M";
const STORAGE_KEY = "disciplina-pro-v3";
let deferredInstallPrompt = null;
let draggedItem = null;

let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  day: 0,
  xp: 0,
  level: 1,
  hearts: 3,
  tasks: {},
  lastDate: null,
  history: [],
  mission: null,
  streak: 0,
  onboardingSeen: false,
  installBannerDismissed: false,
  winShown: false,
  challengeName: i18n.challengeNameDefault,
  customTasks: null,
  fullHistory: [],
  theme: 'dark'
};

// Sanitize state on load and persist the fix. This is crucial for recovering from corrupted data.
let stateWasSanitized = false;
if (state.day < 0) { state.day = 0; stateWasSanitized = true; }
if (state.streak < 0) { state.streak = 0; stateWasSanitized = true; }
if (state.xp < 0) { state.xp = 0; stateWasSanitized = true; }
if (state.level < 1) { state.level = 1; stateWasSanitized = true; }
if (typeof state.hearts !== 'number' || state.hearts < 0 || state.hearts > 3) { state.hearts = 3; stateWasSanitized = true; }

if (stateWasSanitized) {
  console.log("Corrupted state detected and sanitized.");
  save();
}

if (!state.tasks) state.tasks = {};
if (!state.history) state.history = [];
if (!state.mission) state.mission = get_MISSIONS()[0];
if (typeof state.streak !== "number") state.streak = state.day || 0;
if (typeof state.onboardingSeen !== "boolean") state.onboardingSeen = false;
if (typeof state.installBannerDismissed !== "boolean") state.installBannerDismissed = false;
if (typeof state.winShown !== "boolean") state.winShown = false;
if (!state.challengeName) state.challengeName = i18n.challengeNameDefault;
if (!Array.isArray(state.customTasks) || state.customTasks.length === 0) state.customTasks = get_DEFAULT_TASKS().slice();
if (!state.fullHistory) state.fullHistory = [];
if (!state.theme) state.theme = 'dark';

function today() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getTasks() {
  return Array.isArray(state.customTasks) && state.customTasks.length ? state.customTasks : get_DEFAULT_TASKS();
}

function taskIconFor(name, index) {
  const ICON_MAP = [
    [["bike"], "🚴"],
    [["python", "estudar", "curso"], "🐍"],
    [["oração", "rezar"], "🙏"],
    [["terço", "salmo"], "📿"],
    [["doce", "chocolate"], "🍫"],
    [["água"], "💧"],
    [["trabalho"], "💼"],
    [["ler", "livro"], "📖"],
    [["treino", "agach"], "💪"],
  ];
  const lower = name.toLowerCase();
  const found = ICON_MAP.find(([keywords]) => keywords.some(kw => lower.includes(kw)));
  if (found) return found[1];
  return ICON_POOL[index % ICON_POOL.length];
}

function normalizeTasks(list) {
  return list.map((name, index) => ({
    name,
    icon: taskIconFor(name, index),
    desc: i18n.customTaskDesc
  }));
}

function createGoalItem(name) {
  const item = document.createElement('div');
  item.className = 'goal-item';
  item.draggable = true;
  item.innerHTML = `
    <span class="drag-handle">⠿</span>
    <input type="text" class="goal-input" placeholder="Nova meta">
    <button type="button" class="remove-goal-btn">×</button>
  `;
  const input = item.querySelector('.goal-input');
  input.value = name;
  item.querySelector('.remove-goal-btn').onclick = () => item.remove();
  return item;
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.goal-item:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function setupGoalsEditor() {
  const container = document.getElementById('goalsContainer');
  container.addEventListener('dragstart', e => {
    if (e.target.classList.contains('goal-item')) {
      draggedItem = e.target;
      setTimeout(() => e.target.classList.add('dragging'), 0);
      vibrate(20);
    }
  });
  container.addEventListener('dragend', e => {
    if (draggedItem) {
      draggedItem.classList.remove('dragging');
      draggedItem = null;
    }
  });
  container.addEventListener('dragover', e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(container, e.clientY);
    if (draggedItem) {
      if (afterElement == null) {
        container.appendChild(draggedItem);
      } else {
        container.insertBefore(draggedItem, afterElement);
      }
    }
  });
  document.getElementById('addGoalBtn').onclick = () => {
    const newItem = createGoalItem('');
    container.appendChild(newItem);
    newItem.querySelector('input').focus();
  };
}

function renderGoalsEditor() {
  const container = document.getElementById('goalsContainer');
  container.innerHTML = '';
  const tasks = getTasks();
  if (tasks.length > 0) {
    tasks.forEach(task => {
      container.appendChild(createGoalItem(task.name));
    });
  }
}

function setupCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";
  for (let i = 0; i < 30; i++) {
    const d = document.createElement("div");
    d.className = "day";
    calendar.appendChild(d);
  }
}

function renderCalendar() {
  const calendar = document.getElementById("calendar");
  const days = calendar.children;
  const isTodayLocked = state.lastDate === today();
  for (let i = 0; i < 30; i++) {
    const dayElement = days[i];
    if (!dayElement) continue;
    dayElement.classList.toggle("done", state.history[i] === "done");
    dayElement.classList.toggle("miss", state.history[i] === "miss");
    dayElement.classList.toggle("today", i === state.day && !isTodayLocked);
  }
}

function calculateStats() {
    const history = state.history;
    const fullHistory = state.fullHistory || [];
    const tasks = getTasks();

    // Best Streak
    let bestStreak = 0;
    let currentStreak = 0;
    for (const entry of history) {
        if (entry === 'done') {
            currentStreak++;
        } else {
            bestStreak = Math.max(bestStreak, currentStreak);
            currentStreak = 0;
        }
    }
    bestStreak = Math.max(bestStreak, currentStreak);

    // Completion Rate
    const daysPassed = history.filter(d => d === 'done' || d === 'miss').length;
    const daysDone = history.filter(d => d === 'done').length;
    const completionRate = daysPassed > 0 ? Math.round((daysDone / daysPassed) * 100) : 0;

    // Task Performance
    const taskPerformance = {};
    tasks.forEach(task => {
        taskPerformance[task.name] = {
            name: task.name,
            icon: task.icon,
            completions: 0,
        };
    });

    fullHistory.forEach(dayEntry => {
        dayEntry.completedTasks.forEach(taskName => {
            if (taskPerformance[taskName]) {
                taskPerformance[taskName].completions++;
            }
        });
    });

    return {
        totalCompleted: daysDone,
        bestStreak,
        completionRate,
        taskPerformance: Object.values(taskPerformance),
        totalDaysWithHistory: fullHistory.length
    };
}

function renderStatsModal() {
    const stats = calculateStats();

    document.getElementById('statsDaysCount').textContent = stats.totalCompleted;
    document.getElementById('statsBestStreak').textContent = stats.bestStreak;
    document.getElementById('statsCompletionRate').textContent = `${stats.completionRate}%`;

    const taskList = document.getElementById('statsTaskList');
    taskList.innerHTML = '';

    if (stats.taskPerformance.length === 0 || stats.totalDaysWithHistory === 0) {
        taskList.innerHTML = `<div class="helper">${i18n.helper_text_all_done}</div>`; // Reusing a translation
        return;
    }

    stats.taskPerformance.sort((a, b) => b.completions - a.completions).forEach(task => {
        const item = document.createElement('div');
        item.className = 'stats-task-item';
        const completionPercentage = stats.totalDaysWithHistory > 0 ? Math.round((task.completions / stats.totalDaysWithHistory) * 100) : 0;
        item.innerHTML = `
            <div class="task-icon">${task.icon}</div>
            <div class="task-text"><div class="stats-task-name">${task.name}</div><div class="stats-task-rate">${completionPercentage}% (${task.completions}/${stats.totalDaysWithHistory})</div></div>
            <div class="xpbar" style="width:60px;height:8px"><div class="xpfill" style="width:${completionPercentage}%"></div></div>`;
        taskList.appendChild(item);
    });
}

function updateProgressUI() {
  const TASKS = getTasks();
  const done = Object.values(state.tasks).filter(Boolean).length;
  const allDone = done === TASKS.length;
  const locked = state.lastDate === today();

  document.getElementById("unlockTodayBtn").style.display = locked ? 'inline-block' : 'none';

  document.getElementById("progressBadge").textContent = `${done}/${TASKS.length}`;
  document.getElementById("btn").disabled = !allDone || locked;
  document.getElementById("btn").textContent = locked ? i18n.btn_day_closed : allDone ? i18n.btn_close_day_done : i18n.btn_close_day;
  document.getElementById("helperText").textContent = locked
    ? i18n.helper_text_locked
    : allDone
      ? i18n.helper_text_all_done
      : `${TASKS.length - done} ${i18n.helper_text_remaining}`;

  updateMascot(allDone, locked);
}

function handleTaskClick(event) {
  if (state.lastDate === today()) return;

  const taskElement = event.currentTarget;
  const index = parseInt(taskElement.dataset.taskIndex, 10);
  const task = getTasks()[index];

  // 1. Update state
  state.tasks[index] = !state.tasks[index];
  save();

  // 2. Give feedback
  const TASKS = getTasks();
  const doneCount = Object.values(state.tasks).filter(Boolean).length;
  const allDone = doneCount === TASKS.length;

  if (state.tasks[index] && allDone) {
    playAllDone();
    showToast(i18n.toast_all_tasks_completed);
  } else {
    playTick();
    showToast(`${task.name} ${state.tasks[index] ? i18n.toast_task_completed : i18n.toast_task_unchecked}`);
  }

  // 3. Efficiently update the DOM
  taskElement.classList.toggle("done", state.tasks[index]);
  updateProgressUI();
}

function renderTasks() {
  const tasksWrap = document.getElementById("tasks");
  tasksWrap.innerHTML = "";
  const TASKS = getTasks();

  TASKS.forEach((task, i) => {
    const checked = !!state.tasks[i];
    const el = document.createElement("button");
    el.type = "button";
    el.className = `task${checked ? " done" : ""}`;
    el.dataset.taskIndex = i;
    el.innerHTML = `
      <div class="task-icon">${task.icon}</div>
      <div class="task-text">
        <div class="task-name">${task.name}</div>
        <div class="task-desc">${task.desc}</div>
      </div>
      <div class="task-check">✓</div>
    `;
    el.onclick = handleTaskClick;
    tasksWrap.appendChild(el);
  });
}

function applyTheme(theme) {
  document.body.className = `theme-${theme}`;
  document.querySelector('meta[name="theme-color"]').setAttribute("content", theme === 'dark' ? '#44e0b2' : '#ffffff');
  document.getElementById('lightThemeBtn').classList.toggle('active', theme === 'light');
  document.getElementById('darkThemeBtn').classList.toggle('active', theme === 'dark');
}

function setTheme(newTheme) {
  if (state.theme === newTheme) return;
  state.theme = newTheme;
  save();
  applyTheme(newTheme);
}

function updateMascot(done, locked) {
  const face = document.getElementById("mascotFace");
  const msg = document.getElementById("mascotMessage");
  face.className = "mascot-face";
  let mood = 'neutral'; // Default mood

  if (locked) {
    face.textContent = "😴";
    msg.textContent = randomItem(get_MASCOT_MESSAGES().locked);
    mood = 'locked';
  } else if (done) {
    face.textContent = "😄";
    face.classList.add("happy");
    msg.textContent = randomItem(get_MASCOT_MESSAGES().done);
    mood = 'done';
  } else {
    const completed = Object.values(state.tasks).filter(Boolean).length;
    const totalTasks = getTasks().length;

    if (completed === 0) {
      face.textContent = "😐";
      msg.textContent = randomItem(get_MASCOT_MESSAGES().neutral);
      mood = 'neutral';
    } else if (completed === totalTasks - 1 && totalTasks > 1) {
      face.textContent = "🤩";
      face.classList.add("happy");
      msg.textContent = randomItem(get_MASCOT_MESSAGES().almost);
      mood = 'almost';
    } else {
      face.textContent = "🙂";
      msg.textContent = randomItem(get_MASCOT_MESSAGES().partial);
      mood = 'partial';
    }
  }
  face.dataset.mood = mood; // Store the current mood
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1400);
}

function playTone(freq, duration, type = "sine", volume = 0.03) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!window.__streakAudioCtx) window.__streakAudioCtx = new AudioCtx();
    const ctx = window.__streakAudioCtx;
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration / 1000);
    osc.stop(ctx.currentTime + duration / 1000);
  } catch (e) {}
}

function vibrate(duration = 10) {
  if ('vibrate' in navigator) {
    try { navigator.vibrate(duration); } catch(e) {}
  }
}

function playTick() {
  playTone(680, 90, "triangle", 0.025);
  vibrate(10);
}

function playAllDone() {
  playTone(523, 80, "sine", 0.03);
  setTimeout(() => playTone(659, 80, "sine", 0.03), 80);
  setTimeout(() => playTone(783, 120, "sine", 0.03), 160);
  vibrate(40);
}

function playLevelUp() {
  playTone(520, 120, "triangle", 0.03);
  setTimeout(() => playTone(780, 140, "triangle", 0.03), 90);
  setTimeout(() => playTone(980, 180, "triangle", 0.03), 180);
}

function animateXpGain(from, to) {
  const start = performance.now();
  const duration = 700;
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const value = Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3)));
    document.getElementById("xp").textContent = `${value} XP`;
    const visual = ((value % 50) / 50) * 100;
    document.getElementById("xpBadge").textContent = `${value % 50}/50`;
    document.getElementById("xpFill").style.width = `${visual}%`;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function launchConfetti(amount = 26) {
  const root = document.getElementById("confetti");
  root.innerHTML = "";
  const colors = ["#7cff6b", "#44e0b2", "#7a7cff", "#ffd54a", "#ff5f7a"];
  for (let i = 0; i < amount; i++) {
    const piece = document.createElement("span");
    piece.className = "piece";
    piece.style.left = `${20 + Math.random() * 60}%`;
    piece.style.top = `${12 + Math.random() * 12}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty("--x", `${-140 + Math.random() * 280}px`);
    piece.style.setProperty("--y", `${220 + Math.random() * 160}px`);
    piece.style.animationDelay = `${Math.random() * 120}ms`;
    root.appendChild(piece);
  }
  setTimeout(() => { root.innerHTML = ""; }, 1200);
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function subscribeToNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    console.log("Push subscription:", JSON.stringify(subscription));
    showToast(i18n.toast_reminders_on);
    // Em um app real, você enviaria a 'subscription' para seu servidor aqui.
  } catch (error) {
    console.error("Falha ao se inscrever para notificações:", error);
    showToast(i18n.toast_reminders_fail);
  }
  updateNotificationUI();
}

async function askNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    await subscribeToNotifications();
  } else {
    showToast(i18n.toast_permission_denied);
  }
  updateNotificationUI();
}

async function updateNotificationUI() {
  const btn = document.getElementById("enableNotificationsBtn");

  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    if (btn) btn.style.display = 'none';
    return;
  }
  if (btn) btn.style.display = 'block';

  const permission = Notification.permission;
  if (permission === "granted") {
    btn.textContent = i18n.reminders_enabled;
    btn.disabled = true;
  } else if (permission === "denied") {
    btn.textContent = i18n.reminders_blocked;
    btn.disabled = true;
  }
}

function applyTranslations() {
  document.documentElement.lang = userLang.toUpperCase();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (i18n[key]) el.textContent = i18n[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (i18n[key]) el.placeholder = i18n[key];
  });
}

function renderInstallUi() {
  const installBtn = document.getElementById("installBtn");
  const banner = document.getElementById("installBanner");
  const inStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  const canPrompt = !!deferredInstallPrompt;
  installBtn.hidden = !canPrompt || inStandalone;
  banner.classList.toggle("show", canPrompt && !inStandalone && !state.installBannerDismissed);
}

async function triggerInstall() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  try { await deferredInstallPrompt.userChoice; } catch (e) {}
  deferredInstallPrompt = null;
  state.installBannerDismissed = true;
  save();
  renderInstallUi();
}

function updateMissedDay() {
  if (!state.lastDate) return;
  const last = new Date(`${state.lastDate}T12:00:00`);
  const now = new Date(`${today()}T12:00:00`);
  const diff = Math.round((now - last) / 86400000);
  if (diff > 1) {
    const missedIndex = state.day;
    if (missedIndex < 30 && state.history[missedIndex] !== "done") {
      state.history[missedIndex] = "miss";
    }
    state.streak = 0;
    save();
  }
}

function render() {
  const TASKS = getTasks();
  document.getElementById("heroTitle").textContent = `🔥 ${state.challengeName}`;
  document.getElementById("xp").textContent = `${state.xp} XP`;
  document.getElementById("level").textContent = `${i18n.level} ${state.level}`;
  document.getElementById("hearts").textContent = "❤️".repeat(state.hearts);
  document.getElementById("mission").textContent = state.mission;
  document.getElementById("daysCount").textContent = state.day;
  document.getElementById("streakCount").textContent = state.streak;
  document.getElementById("calendarSub").textContent = `${state.day}/30 ${i18n.days_suffix}`;
  document.getElementById("challengeNameInput").value = state.challengeName;
  updateNotificationUI();

  const xpProgress = ((state.xp % 50) / 50) * 100;
  document.getElementById("xpBadge").textContent = `${state.xp % 50}/50`;
  document.getElementById("xpFill").style.width = `${xpProgress}%`;

  updateProgressUI();
  renderCalendar();
  renderInstallUi();
}

function showXpGainToast(amount) {
  const toast = document.getElementById('xpGainToast');
  if (!toast) return;
  const btn = document.getElementById('btn');
  const rect = btn.getBoundingClientRect();
  toast.textContent = `+${amount} XP`;
  toast.style.left = `${rect.left + (rect.width / 2) - (toast.offsetWidth / 2)}px`;
  toast.style.top = `${rect.top - 40}px`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 1400);
}

document.getElementById('openStatsBtn').onclick = () => {
    renderStatsModal();
    document.getElementById('statsModal').classList.add('show');
};

document.getElementById('closeStatsBtn').onclick = () => {
    document.getElementById('statsModal').classList.remove('show');
};

document.getElementById("enableNotificationsBtn").onclick = () => {
  askNotificationPermission();
};

document.getElementById('lightThemeBtn').onclick = () => {
  setTheme('light');
};

document.getElementById('darkThemeBtn').onclick = () => {
  setTheme('dark');
};

document.querySelector('.mascot-card').onclick = () => {
  const face = document.getElementById("mascotFace");
  const msg = document.getElementById("mascotMessage");
  const currentMood = face.dataset.mood || 'neutral';
  const messagePool = get_MASCOT_MESSAGES()[currentMood];

  // Animate face with a "pop"
  face.classList.remove('pop');
  void face.offsetWidth; // Trigger reflow to restart animation
  face.classList.add('pop');
  vibrate(20);

  // Animate message change with a fade
  msg.style.opacity = 0;
  setTimeout(() => {
    // Find a new message that is different from the current one
    let newMessage = randomItem(messagePool);
    if (messagePool.length > 1) {
      while (newMessage === msg.textContent) { newMessage = randomItem(messagePool); }
    }
    msg.textContent = newMessage;
    msg.style.opacity = 1;
  }, 150);
};

document.getElementById("toggleSettingsBtn").onclick = () => {
  const content = document.getElementById("settingsContent");
  const btn = document.getElementById("toggleSettingsBtn");
  const isVisible = content.classList.contains("show");
  if (!isVisible) {
    renderGoalsEditor();
  }
  content.classList.toggle("show");
  btn.textContent = isVisible ? i18n.edit : i18n.close;
};

document.getElementById("saveCustomizationBtn").onclick = () => {
  const name = document.getElementById("challengeNameInput").value.trim() || "Disciplina PRO";
  const goalsRaw = [...document.querySelectorAll('#goalsContainer .goal-input')]
    .map(input => input.value.trim())
    .filter(Boolean)
    .slice(0, 12);

  if (goalsRaw.length === 0) {
    showToast(i18n.toast_at_least_one_goal);
    return;
  }

  const previousTasks = getTasks();
  const newTasks = normalizeTasks(goalsRaw);
  const changed = newTasks.length !== previousTasks.length || newTasks.some((task, i) => !previousTasks[i] || previousTasks[i].name !== task.name);

  state.challengeName = name;
  state.customTasks = newTasks;
  if (changed && state.lastDate !== today()) state.tasks = {};
  save();
  showToast(i18n.toast_customization_saved);
  render();
  renderTasks();
};

document.getElementById("resetCustomizationBtn").onclick = () => {
  state.challengeName = i18n.challengeNameDefault;
  state.customTasks = get_DEFAULT_TASKS().slice();
  if (state.lastDate !== today()) state.tasks = {};
  save();
  showToast(i18n.toast_goals_reset);
  render();
  renderTasks();
};

document.getElementById("unlockTodayBtn").onclick = () => {
  document.getElementById("unlockConfirmModal").classList.add("show");
};

document.getElementById("cancelUnlockBtn").onclick = () => {
  document.getElementById("unlockConfirmModal").classList.remove("show");
};
document.getElementById("confirmUnlockBtn").onclick = () => {
  // Guard to prevent state corruption. Only allow unlock if the day was closed today and day > 0.
  if (state.lastDate !== today() || state.day <= 0) {
    showToast(i18n.toast_unlock_not_allowed);
    document.getElementById("unlockConfirmModal").classList.remove("show");
    return;
  }

  // Reverte os status
  state.day -= 1;
  state.streak -= 1;
  state.xp -= 20;

  // Garante que os valores não fiquem negativos
  if (state.xp < 0) state.xp = 0;
  if (state.streak < 0) state.streak = 0;

  // Verifica se o nível precisa ser diminuído
  while (state.xp < (state.level - 1) * 50 && state.level > 1) {
    state.level -= 1;
  }

  state.lastDate = null;
  state.history.pop(); // Remove o status "done" do histórico

  // Restaura as tarefas para o estado "todas marcadas" para que o usuário possa fechar o dia novamente
  const TASKS = getTasks();
  state.tasks = {};
  TASKS.forEach((_, i) => {
    state.tasks[i] = true;
  });

  save();
  showToast(i18n.toast_day_unlocked);
  document.getElementById("unlockConfirmModal").classList.remove("show");
  render();
  renderTasks();
};

document.getElementById("closeLevelupBtn").onclick = () => {
  document.getElementById("levelupModal").classList.remove("show");
};

document.getElementById("closeWinBtn").onclick = () => {
  document.getElementById("winModal").classList.remove("show");
};

document.getElementById("shareBtn").onclick = async () => {
  const shareData = {
    title: `🔥 Disciplina PRO`,
    text: `Eu completei ${state.streak} ${state.streak > 1 ? 'dias' : 'dia'} de streak no desafio Disciplina PRO! 💪`,
    url: 'https://disciplina-pro-checklist.vercel.app/'
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Fallback para desktop ou navegadores sem suporte
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      showToast('Link copiado! Cole para compartilhar.');
    }
  } catch (err) {
    console.error("Erro ao compartilhar:", err);
  }
};

document.getElementById("closeShareBtn").onclick = () => {
  document.getElementById("shareModal").classList.remove("show");
};

document.getElementById("startChallengeBtn").onclick = () => {
  state.onboardingSeen = true;
  save();
  document.getElementById("welcomeScreen").classList.remove("show");
};

document.getElementById("backupBtn").onclick = () => {
  const dataStr = JSON.stringify(state);
  const dataBlob = new Blob([dataStr], {type: "application/json"});
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  const date = new Date().toISOString().slice(0, 10);
  link.download = `disciplina-pro-backup-${date}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast(i18n.toast_backup_created);
};

document.getElementById("restoreBtn").onclick = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const newState = JSON.parse(event.target.result);
        // Validação básica para garantir que é um backup válido
        if (newState && typeof newState.day === 'number' && typeof newState.xp === 'number') {
          state = newState;
          save();
          showToast(i18n.toast_restore_success);
          render();
          renderTasks();
          renderGoalsEditor();
        } else throw new Error("Invalid backup file format");
      } catch (err) { showToast(i18n.toast_restore_fail); console.error(err); }
    };
    reader.readAsText(file);
  };
  input.click();
};

document.getElementById("installBtn").onclick = triggerInstall;
document.getElementById("bannerInstallBtn").onclick = triggerInstall;
document.getElementById("dismissInstallBannerBtn").onclick = () => {
  state.installBannerDismissed = true;
  save();
  renderInstallUi();
};

document.getElementById("btn").onclick = () => {
  const TASKS = getTasks();
  const done = Object.values(state.tasks).filter(Boolean).length;
  const allDone = done === TASKS.length;
  if (state.lastDate === today()) return;
  if (!allDone) return;

  const oldXp = state.xp;
  state.day += 1;
  state.streak += 1;
  state.xp += 20;
  state.lastDate = today();
  state.history[state.day - 1] = "done";

  // Salva o estado detalhado das tarefas para as estatísticas
  const completedTaskNames = getTasks()
    .filter((_, i) => state.tasks[i])
    .map(task => task.name);
  state.fullHistory.push({
    date: state.lastDate,
    completedTasks: completedTaskNames
  });

  state.tasks = {};
  state.mission = randomItem(get_MISSIONS());
 
  let leveledUp = false;
  while (state.xp >= state.level * 50) {
    state.level += 1;
    leveledUp = true;
  }
 
  save();
  render();
  renderTasks();
  animateXpGain(oldXp, state.xp);
  showXpGainToast(20);
  showToast(i18n.toast_day_closed);
  playTick();
  setTimeout(() => playTick(), 90);
  launchConfetti(28); // Standard confetti for closing a day
 
  const streakMilestones = [3, 7, 15, 30];
  if (streakMilestones.includes(state.streak)) {
    const shareTitleText = document.getElementById('shareTitleText');
    shareTitleText.textContent = `🔥 ${state.streak} ${i18n.days_suffix} de Streak!`;
    setTimeout(() => {
      document.getElementById("shareModal").classList.add("show");
    }, 800);
  }
 
  if (leveledUp) {
    // More elaborate animation sequence for level up
    setTimeout(() => {
      // 1. More intense confetti
      launchConfetti(60);
      
      // 2. Play sound and vibration
      playLevelUp();
      vibrate([100, 50, 100, 50, 100]);

      // 3. Animate the level badge in the hero section
      const levelBadge = document.getElementById("level");
      levelBadge.classList.remove("level-up-flash"); // Reset animation
      void levelBadge.offsetWidth; // Trigger reflow to restart animation
      levelBadge.classList.add("level-up-flash");

      // 4. Show the modal
      document.getElementById("levelupText").textContent = `${i18n.levelup_text_prefix} ${state.level}.`;
      document.getElementById("levelupModal").classList.add("show");
    }, 500); // Delay to let the XP bar finish
  }
 
  if (state.day >= 30 && !state.winShown) {
    state.winShown = true;
    save();
    setTimeout(() => {
      document.getElementById("winModal").classList.add("show");
      launchConfetti(40);
      playLevelUp();
    }, 220);
  }
};

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  renderInstallUi();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  state.installBannerDismissed = true;
  save();
  renderInstallUi();
  showToast(i18n.toast_app_installed);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((err) => {
      console.error("Falha ao registrar o Service Worker:", err);
    });
  });
}

try {
  updateMissedDay();
  applyTheme(state.theme);
  applyTranslations();
  setupCalendar();
  setupGoalsEditor();
  renderGoalsEditor();
  render();
  renderTasks();
  if (!state.onboardingSeen) {
    document.getElementById("welcomeScreen").classList.add("show");
  }

  // Hide splash screen after a short delay to let the app render and animations settle
  setTimeout(() => {
    document.getElementById('splashScreen').classList.add('hidden');
  }, 400);

} catch (error) {
  console.error("A critical rendering error occurred:", error);
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; color: white; font-family: sans-serif; max-width: 600px; margin: 40px auto;">
        <h1 style="color: #ff5f7a;">Ocorreu um Erro Crítico</h1>
        <p style="line-height: 1.6;">Parece que os dados salvos do aplicativo estão corrompidos, o que impede seu funcionamento. Isso pode acontecer após uma atualização.</p>
        <p style="line-height: 1.6;"><strong>Para resolver, clique no botão abaixo para fazer um reset completo do aplicativo.</strong></p>
        <button id="hardResetBtn" style="background: #ff5f7a; color: white; border: none; padding: 14px 24px; font-size: 16px; font-weight: bold; border-radius: 12px; cursor: pointer; margin-top: 20px;">Limpar Dados e Recarregar</button>
        <p style="font-size: 12px; opacity: 0.7; line-height: 1.5; margin-top: 12px;">Atenção: Isso irá apagar todo o seu progresso, mas corrigirá o aplicativo. Use esta opção se o app não estiver carregando corretamente.</p>
    </div>
    <script>
      // O texto é fixo (hardcoded) pois não podemos garantir que o i18n carregou.
      const splash = document.getElementById('splashScreen');
      if (splash) {
        splash.classList.add('hidden');
      }
      document.getElementById('hardResetBtn').onclick = function() {
        this.disabled = true;
        this.textContent = 'Limpando...';
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(function(registrations) {
            return Promise.all(registrations.map(r => r.unregister()));
          }).then(function() {
            localStorage.clear();
            window.location.reload(true);
          });
        } else {
          localStorage.clear();
          window.location.reload(true);
        }
      };
    <\/script>
  `;
}