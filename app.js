/* ─────────────────────────────────────────────────────────
   Disciplina PRO — app.js (reescrito)
   Melhorias:
   - Fechar dia mesmo sem 100% (parcial vs completo)
   - Botão "pular meta" por tarefa (mantém histórico honesto)
   - Calendário com 3 estados: done / partial / miss
   - Notificações locais via Notification API + scheduling local
   - Visual + micro-interactions melhoradas
   ───────────────────────────────────────────────────────── */

const ICON_POOL = ["🎯","✨","📚","💻","🏃","🚴","🧠","🙏","📿","💪","🍫","💧","🌙","💼","📝","🎨","📖","🧘","🏆","🔥"];
const STORAGE_KEY = "disciplina-pro-v4";
let deferredInstallPrompt = null;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let draggedItem = null;

const GAMIFICATION_CONSTANTS = {
  XP_PER_DAY: 20,
  XP_PER_LEVEL: 50,
  XP_FAIL_MULTIPLIER: 0.25,
  MISSION_BONUS_ALL_CHECKS: 10,
  MISSION_BONUS_CLEAN_DAY: 15,
};

// ── STATE ──────────────────────────────────────────────────
let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  day: 0,
  xp: 0,
  level: 1,
  schemaVersion: 5,
  tasks: {},       // { index: true|false|'skip'|'fail' }
  lastDate: null,
  history: [],     // 'done'|'partial'|'miss'
  mission: null,
  streak: 0,
  onboardingSeen: false,
  installBannerDismissed: false,
  winShown: false,
  challengeName: i18n.challengeNameDefault,
  customTasks: null, // [{name, icon, desc}]
  fullHistory: [],  // [{date, completedTasks, skippedTasks, failedTasks, total}]
  theme: 'dark',
  reminderEnabled: false,
  reminderTime: '20:00',
};

// Sanitize
if (state.day < 0) state.day = 0;
if (state.streak < 0) state.streak = 0;
if (state.xp < 0) state.xp = 0;
if (state.level < 1) state.level = 1;
if (!state.tasks) state.tasks = {};
if (typeof state.schemaVersion !== 'number') state.schemaVersion = 5;
if (!state.history) state.history = [];
if (!state.mission) state.mission = get_MISSIONS()[0];
if (typeof state.streak !== 'number') state.streak = 0;
if (!state.challengeName) state.challengeName = i18n.challengeNameDefault;
if (!Array.isArray(state.customTasks) || state.customTasks.length === 0) state.customTasks = get_DEFAULT_TASKS().slice();
if (!state.fullHistory) state.fullHistory = [];
if (!state.theme) state.theme = 'dark';
if (typeof state.reminderEnabled !== 'boolean') state.reminderEnabled = false;
if (!state.reminderTime) state.reminderTime = '20:00';

function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state:", e);
    showToast(i18n.toast_save_failed);
  }
}

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getTasks() {
  return Array.isArray(state.customTasks) && state.customTasks.length
    ? state.customTasks : get_DEFAULT_TASKS();
}

function taskIconFor(name, index) {
  const ICON_MAP = [
    [["bike"], "🚴"], [["python", "estudar", "curso"], "🐍"],
    [["oração", "rezar", "prayer"], "🙏"], [["terço", "salmo", "rosary"], "📿"],
    [["doce", "chocolate", "sweet"], "🍫"], [["água", "water"], "💧"],
    [["trabalho", "work"], "💼"], [["ler", "livro", "read", "book"], "📖"],
    [["treino", "agach", "squat", "gym"], "💪"],
  ];
  const lower = name.toLowerCase();
  const found = ICON_MAP.find(([kws]) => kws.some(kw => lower.includes(kw)));
  return found ? found[1] : ICON_POOL[index % ICON_POOL.length];
}

function normalizeTasks(list) {
  return list.map((name, i) => ({
    name, icon: taskIconFor(name, i), desc: i18n.customTaskDesc
  }));
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const translation = i18n[key];
    if (translation) {
      const target = el.dataset.i18nTarget;
      if (target === 'placeholder') el.placeholder = translation;
      else el.innerHTML = translation;
    }
  });
  document.title = i18n.app_name;
}

// ── TASK STATUS HELPERS ────────────────────────────────────
// state.tasks[i] can be: true (done), 'skip' (skipped), 'fail' (failed), undefined/false (pending)
function isTaskDone(i)   { return state.tasks[i] === true; }
function isTaskSkipped(i){ return state.tasks[i] === 'skip'; }
function isTaskFailed(i) { return state.tasks[i] === 'fail'; }
function isTaskDecided(i){ return isTaskDone(i) || isTaskSkipped(i) || isTaskFailed(i); }

function countDone()    { return getTasks().filter((_, i) => isTaskDone(i)).length; }
function countSkipped() { return getTasks().filter((_, i) => isTaskSkipped(i)).length; }
function countFailed()  { return getTasks().filter((_, i) => isTaskFailed(i)).length; }
function countDecided() { return getTasks().filter((_, i) => isTaskDecided(i)).length; }

function allDecided() {
  return getTasks().every((_, i) => isTaskDecided(i));
}

// ── CALENDAR ───────────────────────────────────────────────
function setupCalendar() {
  const cal = document.getElementById('calendar');
  cal.innerHTML = '';
  for (let i = 0; i < 30; i++) {
    const d = document.createElement('div');
    d.className = 'cal-day';
    d.textContent = i + 1;
    cal.appendChild(d);
  }
}

function renderCalendar() {
  const cal = document.getElementById('calendar');
  const days = cal.children;
  const locked = state.lastDate === today();
  for (let i = 0; i < 30; i++) {
    const el = days[i];
    if (!el) continue;
    el.className = 'cal-day';
    if (state.history[i] === 'done')    el.classList.add('done');
    else if (state.history[i] === 'partial') el.classList.add('partial');
    else if (state.history[i] === 'miss')    el.classList.add('miss');
    if (i === state.day && !locked)     el.classList.add('today');
  }
}

// ── STATS ──────────────────────────────────────────────────
function calculateStats() {
  const history = state.history;
  const fullHistory = state.fullHistory || [];
  const tasks = getTasks();

  let bestStreak = 0, cur = 0;
  for (const e of history) {
    if (e === 'done' || e === 'partial') cur++;
    else { bestStreak = Math.max(bestStreak, cur); cur = 0; }
  }
  bestStreak = Math.max(bestStreak, cur);

  const daysPassed = history.filter(d => d === 'done' || d === 'partial' || d === 'miss').length;
  const daysCompleted = history.filter(d => d === 'done' || d === 'partial').length;
  const completionRate = daysPassed > 0 ? Math.round((daysCompleted / daysPassed) * 100) : 0;

  const taskPerf = {};
  tasks.forEach(t => { taskPerf[t.name] = { name: t.name, icon: t.icon, completions: 0, failures: 0 }; });
  fullHistory.forEach(dayEntry => {
    (dayEntry.completedTasks || []).forEach(n => {
      if (taskPerf[n]) taskPerf[n].completions++;
    });
    (dayEntry.failedTasks || []).forEach(n => {
      if (taskPerf[n]) taskPerf[n].failures++;
    });
  });

  return {
    totalCompleted: daysCompleted,
    bestStreak,
    completionRate,
    taskPerformance: Object.values(taskPerf),
    totalDaysWithHistory: fullHistory.length,
  };
}

function renderStatsModal() {
  const stats = calculateStats();
  document.getElementById('statsDaysCount').textContent = stats.totalCompleted;
  document.getElementById('statsBestStreak').textContent = stats.bestStreak;
  document.getElementById('statsCompletionRate').textContent = `${stats.completionRate}%`;
  const list = document.getElementById('statsTaskList');
  list.innerHTML = '';
  if (stats.taskPerformance.length === 0 || stats.totalDaysWithHistory === 0) {
    list.innerHTML = `<div style="font-size:13px;color:var(--text-3)">${i18n.stats_no_data_yet}</div>`;
    return;
  }
  stats.taskPerformance.sort((a, b) => b.completions - a.completions).forEach(task => {
    const totalAttempts = task.completions + task.failures;
    const successRate = totalAttempts > 0 ? Math.round((task.completions / totalAttempts) * 100) : 0;
    const participation = stats.totalDaysWithHistory > 0 ? Math.round((totalAttempts / stats.totalDaysWithHistory) * 100) : 0;

    const el = document.createElement('div');
    el.className = 'stask-row';
    el.innerHTML = `
      <div style="font-size:20px;flex-shrink:0">${task.icon}</div>
      <div class="stask-info">
        <div class="stask-name">${task.name}</div>
        <div class="stask-rate">${i18n.success_rate}: ${successRate}% (${task.completions}/${totalAttempts})</div>
        <div class="mini-bar"><div class="mini-fill" style="width:${successRate}%"></div></div>
      </div>`;
    list.appendChild(el);
  });
}

// ── UPDATE PROGRESS UI ─────────────────────────────────────
function updateProgressUI() {
  const TASKS = getTasks();
  const done = countDone();
  const skipped = countSkipped();
  const failed = countFailed();
  const decided = countDecided();
  const total = TASKS.length;
  const locked = state.lastDate === today();
  const allD = allDecided();

  // Progress pill
  const pill = document.getElementById('progressBadge');
  pill.textContent = `${done}/${total}`;
  pill.className = 'prog-pill' + (done === total ? ' all-done' : done > 0 ? ' partial-done' : '');

  // Summary chips
  const summary = document.getElementById('closeDaySummary');
  summary.innerHTML = '';
  const pluralDone = done > 1 ? 's' : '';
  const pluralSkipped = skipped > 1 ? 's' : '';
  const pluralFailed = failed > 1 ? 's' : '';
  if (decided > 0) {
    if (done > 0) {
      const c = document.createElement('div');
      c.className = 'sum-chip c-done';
      c.textContent = `✓ ${done} ${i18n.summary_completed}${pluralDone}`;
      summary.appendChild(c);
    }
    if (skipped > 0) {
      const c = document.createElement('div');
      c.className = 'sum-chip c-skip';
      c.textContent = `✗ ${skipped} ${i18n.summary_skipped}${pluralSkipped}`;
      summary.appendChild(c);
    }
    if (failed > 0) {
      const c = document.createElement('div');
      c.className = 'sum-chip c-fail';
      c.textContent = `! ${failed} ${i18n.summary_failed}${pluralFailed}`;
      summary.appendChild(c);
    }
  }

  // Button
  const btn = document.getElementById('btn');
  const unlockBtn = document.getElementById('unlockTodayBtn');
  unlockBtn.style.display = locked ? 'block' : 'none';

  if (locked) {
    btn.textContent = i18n.btn_day_closed;
    btn.disabled = true;
    btn.className = 'btn b-locked';
  } else if (!allD) {
    const remaining = total - decided;
    const plural = remaining > 1 ? 's' : '';
    btn.textContent = i18n.btn_close_day.replace('{count}', remaining).replace('{plural}', plural);
    btn.disabled = true;
    btn.className = 'btn';
  } else if (done === total) {
    btn.textContent = i18n.btn_close_day_done;
    btn.disabled = false;
    btn.className = 'btn';
  } else {
    btn.textContent = i18n.btn_close_day_partial.replace('{done}', done).replace('{total}', total);
    btn.disabled = false;
    btn.className = 'btn b-partial';
  }

  // Helper text
  const helper = document.getElementById('helperText');
  const remaining = total - decided;
  const plural = remaining > 1 ? 's' : '';
  if (locked) {
    helper.innerHTML = i18n.helper_text_locked;
  } else if (!allD) {
    helper.innerHTML = i18n.helper_text_pending_tasks.replace('{count}', remaining).replace('{plural}', plural);
  } else if (done === total) {
    helper.innerHTML = i18n.helper_text_all_done;
  } else {
    helper.innerHTML = i18n.helper_text_partial_done.replace('{done}', done).replace('{total}', total);
  }

  updateMascot(done, total, locked);
}

// ── RENDER TASKS ───────────────────────────────────────────
function renderTasks() {
  const wrap = document.getElementById('tasks');
  wrap.innerHTML = '';
  const TASKS = getTasks();
  const locked = state.lastDate === today();

  TASKS.forEach((task, i) => {
    const done = isTaskDone(i);
    const skipped = isTaskSkipped(i);
    const failed = isTaskFailed(i);
    const statusText = done ? i18n.task_status_completed : skipped ? i18n.task_status_skipped : failed ? i18n.task_status_failed : i18n.task_status_pending;

    const el = document.createElement('button');
    el.type = 'button';
    el.className = `task-item${done ? ' t-done' : ''}${skipped ? ' t-skip' : ''}${failed ? ' t-fail' : ''}`;
    el.dataset.taskIndex = i;
    el.setAttribute('aria-label', `${task.name}, ${statusText}`);
    el.innerHTML = `
      <div class="t-icon">${task.icon}</div>
      <div class="t-body">
        <div class="t-name">${task.name}</div>
        <div class="t-desc">${task.desc}</div>
      </div>
      <div class="t-actions">
        <div class="t-check">✓</div>
        ${!locked ? `<div class="t-fail-btn" data-fail="${i}" title="${i18n.fail_task_tooltip}">!</div>
                     <div class="t-skip-btn" data-skip="${i}" title="${i18n.skip_task_tooltip}">✗</div>` : ''}
      </div>`;

    // Check click (toggle done)
    el.addEventListener('click', (e) => {
      if (locked) return;
      if (e.target.closest('.t-skip-btn') || e.target.closest('.t-fail-btn')) return;
      handleTaskCheck(i);
    });

    // Skip click
    const skipBtn = el.querySelector('.t-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (locked) return;
        handleTaskSkip(i);
      });
    }

    // Fail click
    const failBtn = el.querySelector('.t-fail-btn');
    if (failBtn) {
      failBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (locked) return;
        handleTaskSkip(i, true); // Using skip handler with a flag
      });
    }

    wrap.appendChild(el);
  });
}

function handleTaskCheck(i) {
  const wasDone = isTaskDone(i);
  state.tasks[i] = wasDone ? false : true;
  save();

  const el = document.querySelector(`[data-task-index="${i}"]`);
  if (el) {
    el.classList.toggle('t-done', isTaskDone(i));
    el.classList.remove('t-skip');
    el.classList.remove('t-fail');
  }

  if (!wasDone && isTaskDone(i)) {
    playTick(); vibrate(10);
    if (countDone() === getTasks().length) {
      playAllDone();
      showToast(i18n.toast_all_tasks_completed);
    } else {
      showToast(`${getTasks()[i].name} ${i18n.toast_task_completed}`);
    }
  } else {
    showToast(`${getTasks()[i].name} ${i18n.toast_task_unchecked}`);
  }
  updateProgressUI();
}

function handleTaskSkip(i, isFail = false) {
  const targetState = isFail ? 'fail' : 'skip';
  const wasInThisState = state.tasks[i] === targetState;
  state.tasks[i] = wasInThisState ? false : targetState;
  save();

  const el = document.querySelector(`[data-task-index="${i}"]`);
  if (el) {
    el.classList.remove('t-done');
    el.classList.toggle('t-skip', state.tasks[i] === 'skip');
    el.classList.toggle('t-fail', state.tasks[i] === 'fail');
  }

  vibrate(5);
  const taskName = getTasks()[i].name;
  let message;
  if (wasInThisState) {
    message = i18n.toast_task_reactivated;
  } else {
    message = isFail ? i18n.toast_task_failed : i18n.toast_task_skipped;
  }
  showToast(message.replace('{taskName}', taskName));
  updateProgressUI();
}

// ── CLOSE DAY ──────────────────────────────────────────────
document.getElementById('btn').onclick = () => {
  if (state.lastDate === today()) return;
  if (!allDecided()) return;

  const TASKS = getTasks();
  const done = countDone();
  const failed = countFailed();
  const total = TASKS.length;
  const isFullDone = done === total;
  const isPartial = done > 0 && done < total;
  const isMiss = done === 0;

  const oldXp = state.xp;
  state.day += 1;
  state.lastDate = today();

  if (isMiss) {
    // Zero metas: dia perdido, sem XP, streak quebra
    state.history[state.day - 1] = 'miss';
    state.streak = 0;
    showToast(i18n.toast_day_closed_miss);
  } else {
    const effectiveDone = done + (failed * GAMIFICATION_CONSTANTS.XP_FAIL_MULTIPLIER);
    let xpGain = isFullDone ? GAMIFICATION_CONSTANTS.XP_PER_DAY : Math.round(GAMIFICATION_CONSTANTS.XP_PER_DAY * (effectiveDone / total));
    let bonusXp = 0;
    let missionToast = '';

    const missions = get_MISSIONS();
    // Mission Bonus: "+10 XP if you close the day with all checks." (index 0)
    if (isFullDone && state.mission === missions[0]) {
      bonusXp = GAMIFICATION_CONSTANTS.MISSION_BONUS_ALL_CHECKS;
      xpGain += bonusXp;
      missionToast = i18n.toast_mission_complete.replace('{xp}', bonusXp);
    }
    // Mission Bonus: "Clean mission: complete everything without skipping any item." (index 1)
    else if (isFullDone && countSkipped() === 0 && countFailed() === 0 && state.mission === missions[1]) {
      bonusXp = GAMIFICATION_CONSTANTS.MISSION_BONUS_CLEAN_DAY;
      xpGain += bonusXp;
      missionToast = i18n.toast_mission_clean_complete.replace('{xp}', bonusXp);
    }

    state.xp += xpGain;
    // Streak does not break on 'fail', only on 'miss' or if day is skipped entirely.
    // The logic for breaking streak on missed days is in updateMissedDay().
    if (!isMiss) state.streak += 1;
    state.history[state.day - 1] = isFullDone ? 'done' : 'partial';
    showToast(i18n.toast_day_closed.replace('{xp}', xpGain) + missionToast);
    showXpGainToast(xpGain);
  }

  // Save full history entry
  const completedTaskNames = TASKS.filter((_, i) => isTaskDone(i)).map(t => t.name);
  const skippedTaskNames   = TASKS.filter((_, i) => isTaskSkipped(i)).map(t => t.name);
  const failedTaskNames    = TASKS.filter((_, i) => isTaskFailed(i)).map(t => t.name);
  state.fullHistory.push({
    date: state.lastDate,
    completedTasks: completedTaskNames,
    skippedTasks: skippedTaskNames,
    failedTasks: failedTaskNames,
    total: TASKS.length,
  });

  state.tasks = {};
  state.mission = randomItem(get_MISSIONS());

  // Level up check
  let leveledUp = false;
  while (state.xp >= state.level * GAMIFICATION_CONSTANTS.XP_PER_LEVEL) {
    state.level += 1;
    leveledUp = true;
  }

  save();
  render();
  renderTasks();
  if (!isMiss) {
    animateXpGain(oldXp, state.xp);
    playTick();
    setTimeout(() => playTick(), 90);
    launchConfetti(isFullDone ? 30 : 16);
  }

  // Streak milestone share
  const streakMilestones = [3, 7, 15, 30];
  if (!isMiss && streakMilestones.includes(state.streak)) {
    document.getElementById('shareStreakText').textContent = state.streak;
    document.getElementById('shareSubText').textContent = i18n.share_streak_subtext;
    setTimeout(() => openModal('shareModal'), 900);
  }

  if (leveledUp) {
    setTimeout(() => {
      launchConfetti(60);
      playLevelUp();
      vibrate([80, 40, 80, 40, 80]);
      const lb = document.getElementById('level');
      lb.classList.remove('level-flash'); void lb.offsetWidth; lb.classList.add('level-flash');
      document.getElementById('levelupText').textContent = `${i18n.levelup_text_prefix} ${state.level}.`;
      openModal('levelupModal');
    }, 500);
  }

  if (state.day >= 30 && !state.winShown) {
    state.winShown = true; save();
    setTimeout(() => {
      openModal('winModal');
      launchConfetti(40); playLevelUp();
    }, 300);
  }
};

// ── MASCOT ─────────────────────────────────────────────────
function updateMascot(done, total, locked) {
  const face = document.getElementById('mascotFace');
  const msg  = document.getElementById('mascotMessage');
  let mood = 'neutral';

  if (state.day === 0 && !locked) {
    face.textContent = '👋';
    msg.textContent = i18n.mascot_welcome;
    mood = 'welcome';
  } else if (locked) {
    face.textContent = '😴'; mood = 'locked';
    msg.textContent = randomItem(get_MASCOT_MESSAGES().locked);
  } else if (done === total && total > 0) {
    face.textContent = '😄'; mood = 'done';
    msg.textContent = randomItem(get_MASCOT_MESSAGES().done);
  } else if (done === total - 1 && total > 1) {
    face.textContent = '🤩'; mood = 'almost';
    msg.textContent = randomItem(get_MASCOT_MESSAGES().almost);
  } else if (done > 0) {
    face.textContent = '🙂'; mood = 'partial';
    msg.textContent = randomItem(get_MASCOT_MESSAGES().partial);
  } else {
    face.textContent = '😐'; mood = 'neutral';
    msg.textContent = randomItem(get_MASCOT_MESSAGES().neutral);
  }
  face.dataset.mood = mood;
}

document.getElementById('mascotCard').onclick = () => {
  const face = document.getElementById('mascotFace');
  const msg  = document.getElementById('mascotMessage');
  const pool = get_MASCOT_MESSAGES()[face.dataset.mood || 'neutral'];
  if (!prefersReducedMotion) {
    face.classList.remove('bounce'); void face.offsetWidth; face.classList.add('bounce');
  }
  vibrate(15);
  msg.style.opacity = '0';
  setTimeout(() => {
    let next = randomItem(pool);
    if (pool.length > 1) while (next === msg.textContent) next = randomItem(pool);
    msg.textContent = next;
    msg.style.opacity = '1';
  }, 150);
};

// ── RENDER ──────────────────────────────────────────────────
function render() {
  document.getElementById('heroTitle').textContent = state.challengeName || i18n.challengeNameDefault;
  document.getElementById('heroName').textContent = i18n.app_name;
  document.getElementById('xp').textContent = state.xp;
  document.getElementById('level').textContent = `LV ${state.level}`;
  document.getElementById('mission').textContent = state.mission;
  document.getElementById('daysCount').textContent = state.day;
  document.getElementById('streakCount').textContent = state.streak;
  document.getElementById('daysCount2').textContent = state.day;
  document.getElementById('streakCount2').textContent = state.streak;
  document.getElementById('calendarSub').textContent = `${state.day}/30`;
  document.getElementById('challengeNameInput').value = state.challengeName;

  const xpForLevel = state.xp % GAMIFICATION_CONSTANTS.XP_PER_LEVEL;
  const xpPct = (xpForLevel / GAMIFICATION_CONSTANTS.XP_PER_LEVEL) * 100;
  document.getElementById('xpBadge').textContent = `${xpForLevel}/${GAMIFICATION_CONSTANTS.XP_PER_LEVEL}`;
  document.getElementById('xpFill').style.width = `${xpPct}%`;

  updateProgressUI();
  renderCalendar();
  renderInstallUi();
  updateReminderUI();
}

// ── MISSED DAY DETECTION ───────────────────────────────────
function updateMissedDay() {
  if (!state.lastDate) return;
  const last = new Date(`${state.lastDate}T12:00:00`);
  const now  = new Date(`${today()}T12:00:00`);
  const diff = Math.round((now - last) / 86400000);
  if (diff > 1) {
    const missedDays = diff - 1;
    // Mark missed days
    for (let m = 0; m < missedDays; m++) {
      const idx = state.day + m;
      if (idx < 30 && state.history[idx] !== 'done' && state.history[idx] !== 'partial') {
        state.history[idx] = 'miss';
      }
    }
    state.day += missedDays;
    state.streak = 0;
    save();
  }
}

// ── TOAST ──────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('show'), 1600);
}

// ── XP GAIN TOAST ─────────────────────────────────────────
function showXpGainToast(amount) {
  const t = document.getElementById('xpGainToast');
  if (!t) return;
  const btn = document.getElementById('btn');
  const r = btn.getBoundingClientRect();
  t.textContent = `+${amount} XP`;
  t.style.left = `${r.left + r.width / 2 - 30}px`;
  t.style.top  = `${r.top - 40}px`;
  t.classList.remove('show'); void t.offsetWidth;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1000);
}

// ── AUDIO ──────────────────────────────────────────────────
function playTone(freq, dur, type = 'sine', vol = 0.025) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!window.__audioCtx) window.__audioCtx = new Ctx();
    const ctx = window.__audioCtx;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = type; osc.frequency.value = freq; gain.gain.value = vol;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur / 1000);
    osc.stop(ctx.currentTime + dur / 1000);
  } catch (e) {}
}
function vibrate(d = 10) { if (prefersReducedMotion) return; try { navigator.vibrate?.(d); } catch(e) {} }
function playTick()   { playTone(680, 90, 'triangle', 0.022); vibrate(10); }
function playAllDone(){ playTone(523,80); setTimeout(()=>playTone(659,80),80); setTimeout(()=>playTone(783,120),160); vibrate(40); }
function playLevelUp(){ playTone(520,120,'triangle'); setTimeout(()=>playTone(780,140,'triangle'),90); setTimeout(()=>playTone(980,180,'triangle'),180); }

// ── XP ANIMATION ───────────────────────────────────────────
function animateXpGain(from, to) {
  if (prefersReducedMotion) {
    document.getElementById('xp').textContent = to;
    const xpForLevel = to % GAMIFICATION_CONSTANTS.XP_PER_LEVEL;
    const xpBadge = document.getElementById('xpBadge');
    if (xpBadge) xpBadge.textContent = `${xpForLevel}/${GAMIFICATION_CONSTANTS.XP_PER_LEVEL}`;
    const xpFill = document.getElementById('xpFill');
    if (xpFill) xpFill.style.width = `${(xpForLevel / GAMIFICATION_CONSTANTS.XP_PER_LEVEL) * 100}%`;
    return;
  }
  const start = performance.now();
  const dur = 700;
  (function step(now) {
    const t = Math.min((now - start) / dur, 1);
    const v = Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3)));
    const xpForLevel = v % GAMIFICATION_CONSTANTS.XP_PER_LEVEL;
    document.getElementById('xp').textContent = v;
    document.getElementById('xpBadge').textContent = `${xpForLevel}/${GAMIFICATION_CONSTANTS.XP_PER_LEVEL}`;
    document.getElementById('xpFill').style.width = `${(xpForLevel / GAMIFICATION_CONSTANTS.XP_PER_LEVEL) * 100}%`;
    if (t < 1) requestAnimationFrame(step);
  })(start);
}

// ── CONFETTI ───────────────────────────────────────────────
function launchConfetti(n = 26) {
  if (prefersReducedMotion) return;
  const root = document.getElementById('confetti');
  root.innerHTML = '';
  const colors = ['#b8ff65','#00e5c8','#9b6dff','#ffb830','#ff4f6d'];
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div');
    p.className = 'piece';
    p.style.cssText = `
      left:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration:${0.8 + Math.random() * 1.4}s;
      animation-delay:${Math.random() * .5}s;
      width:${6 + Math.random()*8}px;
      height:${6 + Math.random()*8}px;
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'}`;
    root.appendChild(p);
    setTimeout(() => p.remove(), 2500);
  }
}

// ── THEME ──────────────────────────────────────────────────
function applyTheme(theme) {
  document.body.className = `theme-${theme}`;
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#0d0d14' : '#f2f2f8';
  document.getElementById('lightThemeBtn').classList.toggle('active', theme === 'light');
  document.getElementById('darkThemeBtn').classList.toggle('active', theme === 'dark');
}
function setTheme(t) { if (state.theme === t) return; state.theme = t; save(); applyTheme(t); }
document.getElementById('lightThemeBtn').onclick = () => setTheme('light');
document.getElementById('darkThemeBtn').onclick  = () => setTheme('dark');

// ── SETTINGS TOGGLE ────────────────────────────────────────
// O botão de configurações agora abre um modal.
document.getElementById('toggleSettingsBtn').onclick = () => {
  const body = document.getElementById('settingsBody');
  const btn  = document.getElementById('toggleSettingsBtn');
  const open = body.classList.toggle('show');
  btn.textContent = open ? i18n.close : i18n.edit;
  if (open) renderGoalsEditor();
};

// ── GOALS EDITOR ───────────────────────────────────────────
function createGoalItem(name) {
  const el = document.createElement('div');
  el.className = 'goal-item'; el.draggable = true;
  el.innerHTML = `
    <span class="drag-handle">⠿</span>
    <input class="goal-input" type="text" placeholder="Nome da meta" value="${name.replace(/"/g,'&quot;')}">
    <button type="button" class="rm-goal">×</button>`;
  el.querySelector('.rm-goal').onclick = () => el.remove();
  return el;
}

function setupGoalsEditor() {
  const c = document.getElementById('goalsContainer');
  c.addEventListener('dragstart', e => {
    if (e.target.classList.contains('goal-item')) {
      draggedItem = e.target;
      setTimeout(() => e.target.classList.add('dragging'), 0);
      vibrate(18);
    }
  });
  c.addEventListener('dragend', () => {
    if (draggedItem) { draggedItem.classList.remove('dragging'); draggedItem = null; }
  });
  c.addEventListener('dragover', e => {
    e.preventDefault();
    if (!draggedItem) return;
    const after = [...c.querySelectorAll('.goal-item:not(.dragging)')].reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const off = e.clientY - box.top - box.height / 2;
      return off < 0 && off > closest.offset ? { offset: off, element: child } : closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
    after ? c.insertBefore(draggedItem, after) : c.appendChild(draggedItem);
  });
  document.getElementById('addGoalBtn').onclick = () => {
    const item = createGoalItem('');
    c.appendChild(item);
    item.querySelector('input').focus();
  };
}

function renderGoalsEditor() {
  const c = document.getElementById('goalsContainer');
  c.innerHTML = '';
  getTasks().forEach(t => c.appendChild(createGoalItem(t.name)));
}

document.getElementById('saveCustomizationBtn').onclick = () => {
  const name = document.getElementById('challengeNameInput').value.trim() || 'Disciplina PRO';
  const raw = [...document.querySelectorAll('#goalsContainer .goal-input')]
    .map(i => i.value.trim()).filter(Boolean).slice(0, 12);
  if (!raw.length) { showToast('Adicione pelo menos uma meta.'); return; }
  const prev = getTasks();
  const next = normalizeTasks(raw);
  const changed = next.length !== prev.length || next.some((t, i) => !prev[i] || prev[i].name !== t.name);
  state.challengeName = name;
  state.customTasks = next;
  if (changed && state.lastDate !== today()) state.tasks = {};
  save(); showToast('Metas salvas!');
  render(); renderTasks();
  document.getElementById('settingsBody').classList.remove('show');
  document.getElementById('toggleSettingsBtn').textContent = i18n.edit;
};

document.getElementById('resetCustomizationBtn').onclick = () => {
  state.challengeName = i18n.challengeNameDefault;
  state.customTasks = get_DEFAULT_TASKS().slice();
  if (state.lastDate !== today()) state.tasks = {};
  save(); showToast('Metas redefinidas.');
  render(); renderTasks();
  renderGoalsEditor();
  document.getElementById('settingsBody').classList.remove('show');
  document.getElementById('toggleSettingsBtn').textContent = i18n.edit;
};

// ── LOCAL REMINDERS ────────────────────────────────────────
// We use Notification API + a periodic check via visibilitychange / setInterval
// No backend needed.
let reminderInterval = null;

function updateReminderUI() {
  const toggle = document.getElementById('reminderToggle');
  const status = document.getElementById('reminderStatus');
  const timeInput = document.getElementById('reminderTimeInput');
  toggle.classList.toggle('on', state.reminderEnabled);
  toggle.setAttribute('role', 'switch');
  toggle.setAttribute('aria-checked', state.reminderEnabled);
  timeInput.value = state.reminderTime;
  if (state.reminderEnabled) {
    status.textContent = i18n.reminder_status_on_full.replace('{time}', state.reminderTime);
    status.style.color = 'var(--c-neon)';
  } else {
    status.textContent = i18n.reminder_status_off;
    status.style.color = '';
  }
}

function checkAndFireReminder() {
  if (!state.reminderEnabled) return;
  if (state.lastDate === today()) return; // Already closed today
  const now = new Date();
  const [h, m] = state.reminderTime.split(':').map(Number);
  if (now.getHours() === h && now.getMinutes() === m) {
    const lastFired = localStorage.getItem('disciplina-reminder-fired');
    if (lastFired !== today()) {
      localStorage.setItem('disciplina-reminder-fired', today());
      sendLocalNotification();
    }
  }
}

function sendLocalNotification() {
  if (Notification.permission === 'granted') {
    new Notification('Disciplina PRO 🔥', {
      body: 'Não esqueça de completar suas metas hoje!',
      icon: './icon-192.png',
    });
  }
}

async function toggleReminder() {
  if (state.reminderEnabled) {
    state.reminderEnabled = false;
    save(); updateReminderUI();
    showToast(i18n.toast_reminders_off);
    return;
  }
  if (Notification.permission === 'denied') {
    showToast(i18n.toast_permission_blocked);
    return;
  }
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    state.reminderEnabled = true;
    save(); updateReminderUI();
    showToast(i18n.toast_reminders_on);
    startReminderInterval();
  } else {
    showToast(i18n.toast_permission_denied);
  }
}

function startReminderInterval() {
  clearInterval(reminderInterval);
  reminderInterval = setInterval(checkAndFireReminder, 60000);
  checkAndFireReminder();
}

document.getElementById('reminderToggle').onclick = toggleReminder;
document.getElementById('reminderTimeInput').onchange = (e) => {
  state.reminderTime = e.target.value;
  save(); updateReminderUI();
  showToast(i18n.toast_reminder_time_updated.replace('{time}', state.reminderTime));
};

if (state.reminderEnabled) startReminderInterval();

// ── INSTALL PWA ────────────────────────────────────────────
function renderInstallUi() {
  const btn = document.getElementById('installBtn');
  const banner = document.getElementById('installBanner');
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  btn.hidden = !deferredInstallPrompt || standalone;
  banner.classList.toggle('show', !!deferredInstallPrompt && !standalone && !state.installBannerDismissed);
}

async function triggerInstall() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  try { await deferredInstallPrompt.userChoice; } catch(e) {}
  deferredInstallPrompt = null;
  state.installBannerDismissed = true; save();
  renderInstallUi(); showToast(i18n.toast_app_installed);
}

window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstallPrompt = e; renderInstallUi(); });
window.addEventListener('appinstalled', () => { deferredInstallPrompt = null; state.installBannerDismissed = true; save(); renderInstallUi(); showToast(i18n.toast_app_installed); });

document.getElementById('installBtn').onclick = triggerInstall;
document.getElementById('bannerInstallBtn').onclick = triggerInstall;
document.getElementById('dismissInstallBannerBtn').onclick = () => {
  state.installBannerDismissed = true; save(); renderInstallUi();
};

// ── UNLOCK ─────────────────────────────────────────────────
document.getElementById('unlockTodayBtn').onclick = () => openModal('unlockConfirmModal');
document.getElementById('cancelUnlockBtn').onclick = () => closeModal('unlockConfirmModal');
document.getElementById('confirmUnlockBtn').onclick = () => {
  if (state.lastDate !== today() || state.day <= 0) {
    showToast(i18n.toast_unlock_not_allowed);
    closeModal('unlockConfirmModal');
    return;
  }
  const lastEntry = state.fullHistory[state.fullHistory.length - 1];
  const wasPartial = state.history[state.day - 1] === 'partial';
  const wasMiss    = state.history[state.day - 1] === 'miss';

  let xpToRevert = 0;
  if (!wasMiss && lastEntry) {
    const effectiveDone = (lastEntry.completedTasks?.length || 0) + ((lastEntry.failedTasks?.length || 0) * GAMIFICATION_CONSTANTS.XP_FAIL_MULTIPLIER);
    xpToRevert = Math.round(GAMIFICATION_CONSTANTS.XP_PER_DAY * (effectiveDone / lastEntry.total));
  }

  state.day -= 1;
  state.xp = Math.max(0, state.xp - xpToRevert);
  if (!wasMiss) state.streak = Math.max(0, state.streak - 1);
  while (state.xp < (state.level - 1) * GAMIFICATION_CONSTANTS.XP_PER_LEVEL && state.level > 1) state.level--;
  state.lastDate = null;
  state.history.pop();
  state.fullHistory.pop();

  // Restore tasks to all checked so user can easily close again
  const TASKS = getTasks();
  state.tasks = {};
  TASKS.forEach((_, i) => { state.tasks[i] = true; });

  save();
  showToast(i18n.toast_day_unlocked);
  closeModal('unlockConfirmModal');
  render(); renderTasks();
};

// ── MODALS ─────────────────────────────────────────────────
// Refatorado para acessibilidade (focus trap, escape key, overlay click)
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const previouslyFocused = document.activeElement;
  modal.previouslyFocused = previouslyFocused;

  const modalContent = modal.querySelector('.modal, .welcome-card, .stats-modal, .share-modal');
  if (modalContent) {
    modalContent.setAttribute('role', 'dialog');
    modalContent.setAttribute('aria-modal', 'true');
  }

  modal.classList.add('show');

  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  if (firstFocusable) firstFocusable.focus();

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeModal(modalId);
    if (e.key !== 'Tab' || !firstFocusable) return;

    if (e.shiftKey) { // Shift + Tab
      if (document.activeElement === firstFocusable) { lastFocusable.focus(); e.preventDefault(); }
    } else { // Tab
      if (document.activeElement === lastFocusable) { firstFocusable.focus(); e.preventDefault(); }
    }
  };

  const handleOverlayClick = (e) => { if (e.target === modal) closeModal(modalId); };

  document.addEventListener('keydown', handleKeyDown);
  modal.addEventListener('click', handleOverlayClick);

  modal.cleanup = () => {
    document.removeEventListener('keydown', handleKeyDown);
    modal.removeEventListener('click', handleOverlayClick);
    if (modal.previouslyFocused) { modal.previouslyFocused.focus(); delete modal.previouslyFocused; }
  };
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal || !modal.classList.contains('show')) return;
  modal.classList.remove('show');
  if (modal.cleanup) { modal.cleanup(); delete modal.cleanup; }
}

function restartChallenge() {
  state.day = 0;
  state.history = [];
  state.fullHistory = [];
  state.tasks = {};
  state.lastDate = null;
  state.streak = 0;
  state.winShown = false;
  state.mission = randomItem(get_MISSIONS());
  save();
  closeModal('winModal');
  render();
  renderTasks();
  showToast(i18n.toast_challenge_restarted);
}

document.getElementById('closeLevelupBtn').onclick = () => closeModal('levelupModal');
document.getElementById('closeWinBtn').onclick     = () => closeModal('winModal');
document.getElementById('closeShareBtn').onclick   = () => closeModal('shareModal');
document.getElementById('closeStatsBtn').onclick   = () => closeModal('statsModal');
document.getElementById('openStatsBtn').onclick    = () => { renderStatsModal(); openModal('statsModal'); };
document.getElementById('restartChallengeBtn').onclick = restartChallenge;
document.getElementById('startChallengeBtn').onclick = () => {
  state.onboardingSeen = true; save();
  closeModal('welcomeScreen');
};

// ── SHARE ──────────────────────────────────────────────────
document.getElementById('shareBtn').onclick = async () => {
  const text = i18n.share_streak_text
    .replace('{streak}', state.streak)
    .replace('{appName}', i18n.app_name);
  const data = {
    title: 'Disciplina PRO 🔥',
    text: text,
    url: 'https://disciplina-pro-checklist.vercel.app/' // This URL should probably be a constant
  };
  try {
    if (navigator.share) await navigator.share(data);
    else { navigator.clipboard.writeText(`${data.text} ${data.url}`); showToast(i18n.toast_link_copied); }
  } catch(e) {}
};

document.getElementById('shareAppBtn').onclick = async () => {
  const url = 'https://disciplina-pro-checklist.vercel.app/';
  try {
    if (navigator.share) await navigator.share({ title: 'Disciplina PRO', url });
    else { navigator.clipboard.writeText(url); showToast(i18n.toast_link_copied); }
  } catch(e) { navigator.clipboard.writeText(url); showToast(i18n.toast_link_copied); }
};

// ── BACKUP / RESTORE ───────────────────────────────────────
document.getElementById('backupBtn').onclick = () => {
  const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `disciplina-backup-${today()}.json` });
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(i18n.toast_backup_created);
};

document.getElementById('restoreBtn').onclick = () => {
  const inp = Object.assign(document.createElement('input'), { type: 'file', accept: '.json,application/json' });
  inp.onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const ns = JSON.parse(ev.target.result);
        if (ns && typeof ns.day === 'number' && typeof ns.xp === 'number') { // Basic validation
          if (ns.schemaVersion !== state.schemaVersion) {
            if (!confirm(i18n.backup_version_mismatch)) return;
          }
          state = ns; save(); showToast(i18n.toast_restore_success); render(); renderTasks(); renderGoalsEditor();
        } else throw new Error();
      } catch { showToast(i18n.toast_restore_fail); }
    };
    reader.readAsText(file);
  };
  inp.click();
};

// ── HARD RESET ─────────────────────────────────────────────
document.getElementById('hardResetBtn').onclick = () => {
  if (!confirm(i18n.confirm_hard_reset)) return;
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs =>
      Promise.all(regs.map(r => r.unregister()))
    ).then(() => { localStorage.clear(); location.reload(true); });
  } else { localStorage.clear(); location.reload(true); }
};

// ── SERVICE WORKER ─────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}

// ── INIT ───────────────────────────────────────────────────
try {
  document.documentElement.lang = userLang;
  updateMissedDay();
  applyTheme(state.theme);
  setupCalendar();
  applyI18n();
  setupGoalsEditor();
  renderGoalsEditor();
  render();
  renderTasks();
  if (!state.onboardingSeen) openModal('welcomeScreen');

  // Handle App Shortcut actions
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  if (action) {
    // Use a small timeout to ensure the UI is ready
    setTimeout(() => {
      if (action === 'stats') openModal('statsModal');
      else if (action === 'settings') document.getElementById('toggleSettingsBtn')?.click();
      // Clear the action from URL to avoid re-triggering on reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 500);
  }

  setTimeout(() => document.getElementById('splashScreen').classList.add('hidden'), 450);
} catch (err) {
  console.error('Critical init error:', err);
  document.body.innerHTML = `
    <div style="padding:30px;text-align:center;color:#f0f0fa;font-family:sans-serif;max-width:500px;margin:60px auto">
      <h2 style="color:#ff4f6d">${i18n.error_load_title || 'Error loading'}</h2>
      <p style="margin:12px 0;line-height:1.6">${i18n.error_load_subtitle || 'Data may be corrupted. Click below to reset.'}</p>
      <button onclick="localStorage.clear();location.reload(true)" style="background:#ff4f6d;color:#fff;border:none;padding:14px 22px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;margin-top:12px">
        ${i18n.error_load_button || 'Clear Data and Reload'}
      </button>
    </div>`;
}