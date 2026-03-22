const DEFAULT_TASKS = [
  { name: "15 min de bike", icon: "🚴", desc: "movimento e energia" },
  { name: "10 agachamentos", icon: "🍑", desc: "força e constância" },
  { name: "Estudar Python", icon: "🐍", desc: "crescimento e foco" },
  { name: "Oração", icon: "🙏", desc: "São José Dormindo" },
  { name: "Terço + Salmo 139", icon: "📿", desc: "oração completa" },
  { name: "Sem doce/chocolate", icon: "🍫", desc: "disciplina do dia" }
];

const ICON_POOL = ["🎯","✨","📚","💻","🏃","🚴","🧠","🙏","📿","💪","🍫","💧","🌙","💼","📝","🎨","📖","🧘","🏆","🔥"];

const MESSAGES = [
  "Sem desculpas. Só consistência.",
  "Cada dia fechado fortalece sua identidade.",
  "Hoje conta. Hoje constrói o resultado.",
  "Você não precisa de motivação. Precisa de sequência."
];

const MISSIONS = [
  "+10 XP se fechar o dia com todos os checks.",
  "Missão limpa: complete tudo sem pular nenhum item.",
  "Modo foco: finalize o checklist completo hoje."
];

const MASCOT_MESSAGES = {
  neutral: [
    "Vamos fechar esse dia.",
    "Um passo de cada vez.",
    "O primeiro passo é o mais importante.",
    "Foco na primeira meta de hoje."
  ],
  partial: [
    "Boa. Continua assim.",
    "Você está no caminho certo.",
    "Não pare agora, a consistência é a chave.",
    "Mais um passo dado!"
  ],
  almost: [
    "Você está quase lá!",
    "Falta pouco, não desista agora.",
    "A reta final! Vamos com tudo."
  ],
  done: [
    "Tudo pronto. Fecha esse dia agora.",
    "Mandou bem! Dia concluído. ✨"
  ],
  locked: [
    "Hoje já foi. Amanhã tem mais.",
    "Descanse. Você mereceu."
  ]
};

const VAPID_PUBLIC_KEY = "BDS_T-d3nLp2GImA-o_pWCoI-yq8u2zYFqgJzY_jJ6M_p_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_j_-";
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
  customTasks: null
};

if (!state.tasks) state.tasks = {};
if (!state.history) state.history = [];
if (!state.mission) state.mission = get_MISSIONS()[0];
if (typeof state.streak !== "number") state.streak = state.day || 0;
if (typeof state.onboardingSeen !== "boolean") state.onboardingSeen = false;
if (typeof state.installBannerDismissed !== "boolean") state.installBannerDismissed = false;
if (typeof state.winShown !== "boolean") state.winShown = false;
if (!state.challengeName) state.challengeName = i18n.challengeNameDefault;
if (!Array.isArray(state.customTasks) || state.customTasks.length === 0) state.customTasks = get_DEFAULT_TASKS().slice();

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
  const lower = name.toLowerCase();
  if (lower.includes("bike")) return "🚴";
  if (lower.includes("python") || lower.includes("estudar") || lower.includes("curso")) return "🐍";
  if (lower.includes("oração") || lower.includes("rezar")) return "🙏";
  if (lower.includes("terço") || lower.includes("salmo")) return "📿";
  if (lower.includes("doce") || lower.includes("chocolate")) return "🍫";
  if (lower.includes("água")) return "💧";
  if (lower.includes("trabalho")) return "💼";
  if (lower.includes("ler") || lower.includes("livro")) return "📖";
  if (lower.includes("treino") || lower.includes("agach")) return "💪";
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

function renderCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";
  for (let i = 0; i < 30; i++) {
    const d = document.createElement("div");
    d.className = "day";
    if (state.history[i] === "done") d.classList.add("done");
    if (state.history[i] === "miss") d.classList.add("miss");
    if (i === state.day && state.lastDate !== today()) d.classList.add("today");
    calendar.appendChild(d);
  }
}

function updateMascot(done, locked) {
  const face = document.getElementById("mascotFace");
  const msg = document.getElementById("mascotMessage");
  face.className = "mascot-face";

  if (locked) {
    face.textContent = "😴";
    msg.textContent = randomItem(i18n.mascot_locked1 ? MASCOT_MESSAGES.locked : translations.pt.mascot_locked1);
    return;
  }
  if (done) {
    face.textContent = "😄";
    face.classList.add("happy");
    msg.textContent = randomItem(MASCOT_MESSAGES.done);
    return;
  }
  const completed = Object.values(state.tasks).filter(Boolean).length;
  const totalTasks = getTasks().length;

  if (completed === 0) {
    face.textContent = "😐";
    msg.textContent = randomItem(MASCOT_MESSAGES.neutral);
  } else if (completed === totalTasks - 1 && totalTasks > 1) {
    face.textContent = "🤩";
    face.classList.add("happy");
    msg.textContent = randomItem(MASCOT_MESSAGES.almost);
  } else {
    face.textContent = "🙂";
    msg.textContent = randomItem(MASCOT_MESSAGES.partial);
  }
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
  const card = document.getElementById("notificationsCard");

  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    card.hidden = true;
    return;
  }

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
  document.getElementById("msg").textContent = randomItem(get_MESSAGES());
  document.getElementById("mission").textContent = state.mission;
  document.getElementById("daysCount").textContent = state.day;
  document.getElementById("streakCount").textContent = state.streak;
  document.getElementById("calendarSub").textContent = `${state.day}/30 ${i18n.days_suffix}`;
  document.getElementById("challengeNameInput").value = state.challengeName;
  renderGoalsEditor();
  updateNotificationUI();

  const xpProgress = ((state.xp % 50) / 50) * 100;
  document.getElementById("xpBadge").textContent = `${state.xp % 50}/50`;
  document.getElementById("xpFill").style.width = `${xpProgress}%`;

  const tasksWrap = document.getElementById("tasks");
  tasksWrap.innerHTML = "";

  TASKS.forEach((task, i) => {
    const checked = !!state.tasks[i];
    const el = document.createElement("button");
    el.type = "button";
    el.className = `task${checked ? " done" : ""}`;
    el.innerHTML = `
      <div class="task-icon">${task.icon}</div>
      <div class="task-text">
        <div class="task-name">${task.name}</div>
        <div class="task-desc">${task.desc}</div>
      </div>
      <div class="task-check">✓</div>
    `;
    el.onclick = () => {
      if (state.lastDate === today()) return;
      state.tasks[i] = !state.tasks[i];
      save();
      playTick();
      showToast(`${task.name} ${state.tasks[i] ? i18n.toast_task_completed : i18n.toast_task_unchecked}`);
      render();
    };
    tasksWrap.appendChild(el);
  });

  const done = Object.values(state.tasks).filter(Boolean).length;
  const allDone = done === TASKS.length;
  const locked = state.lastDate === today();

  document.getElementById("progressBadge").textContent = `${done}/${TASKS.length}`;
  document.getElementById("btn").disabled = !allDone || locked;
  document.getElementById("btn").textContent = locked ? i18n.btn_day_closed : allDone ? i18n.btn_close_day_done : i18n.btn_close_day;
  document.getElementById("helperText").textContent = locked
    ? i18n.helper_text_locked
    : allDone
      ? i18n.helper_text_all_done
      : `${TASKS.length - done} ${i18n.helper_text_remaining}`;

  updateMascot(allDone, locked);
  renderCalendar();
  renderInstallUi();
}

document.getElementById("enableNotificationsBtn").onclick = () => {
  askNotificationPermission();
};

document.querySelector('.mascot-card').onclick = () => {
  const msg = document.getElementById("mascotMessage");
  msg.textContent = randomItem(get_MESSAGES());
  vibrate(10);
};

document.getElementById("toggleCustomizationBtn").onclick = () => {
  const content = document.getElementById("customizationContent");
  const btn = document.getElementById("toggleCustomizationBtn");
  const isVisible = content.classList.contains("show");
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
};

document.getElementById("resetCustomizationBtn").onclick = () => {
  state.challengeName = i18n.challengeNameDefault;
  state.customTasks = get_DEFAULT_TASKS().slice();
  if (state.lastDate !== today()) state.tasks = {};
  save();
  showToast(i18n.toast_goals_reset);
  render();
};

document.getElementById("unlockTodayBtn").onclick = () => {
  state.lastDate = null;
  save();
  showToast(i18n.toast_day_unlocked);
  render();
};

document.getElementById("closeLevelupBtn").onclick = () => {
  document.getElementById("levelupModal").classList.remove("show");
};

document.getElementById("closeOnboardingBtn").onclick = () => {
  state.onboardingSeen = true;
  save();
  document.getElementById("onboardingModal").classList.remove("show");
};

document.getElementById("closeWinBtn").onclick = () => {
  document.getElementById("winModal").classList.remove("show");
};

document.getElementById("shareBtn").onclick = async () => {
  const shareData = {
    title: `🔥 Disciplina PRO`,
    text: `Eu completei ${state.streak} ${state.streak > 1 ? 'dias' : 'dia'} de streak no desafio Disciplina PRO! 💪`,
    url: 'https://disciplina-pro.vercel.app' // Substitua pela URL do seu app
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
  document.getElementById("shareModal").classList.remove("show");
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
  state.tasks = {};
  state.mission = randomItem(get_MISSIONS());

  let leveledUp = false;
  while (state.xp >= state.level * 50) {
    state.level += 1;
    leveledUp = true;
  }

  save();
  render();
  animateXpGain(oldXp, state.xp);
  showToast(i18n.toast_day_closed);
  playTick();
  setTimeout(() => playTick(), 90);
  launchConfetti(28);

  const streakMilestones = [3, 7, 15, 30];
  if (streakMilestones.includes(state.streak)) {
    const shareTitle = document.querySelector('#shareContent .share-title');
    shareTitle.textContent = `🔥 ${state.streak} ${i18n.days_suffix} de Streak!`;
    setTimeout(() => {
      document.getElementById("shareModal").classList.add("show");
    }, 800);
  }

  if (leveledUp) {
    document.getElementById("levelupText").textContent = `${i18n.levelup_text_prefix} ${state.level}.`;
    document.getElementById("levelupModal").classList.add("show");
    playLevelUp();
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
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

updateMissedDay();
applyTranslations();
render();
setupGoalsEditor();
if (!state.onboardingSeen) document.getElementById("onboardingModal").classList.add("show");