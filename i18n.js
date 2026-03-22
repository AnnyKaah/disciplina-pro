const translations = {
  en: {
    challengeNameDefault: "30-Day Challenge",
    customTaskDesc: "focus and consistency",
    level: "Level",
    days_suffix: "days",
    toast_reminders_on: "Reminders enabled!",
    toast_reminders_fail: "Failed to enable reminders.",
    toast_permission_denied: "Notification permission denied.",
    reminders_enabled: "Reminders Enabled",
    reminders_blocked: "Reminders Blocked",
    toast_task_completed: "completed!",
    toast_task_unchecked: "unchecked.",
    btn_day_closed: "Day closed",
    btn_close_day_done: "Close the day",
    btn_close_day: "Complete all",
    helper_text_locked: "You've already closed the day. Come back tomorrow!",
    helper_text_all_done: "All set! Close the day to earn XP.",
    helper_text_remaining: "goals remaining",
    edit: "Edit",
    close: "Close",
    toast_at_least_one_goal: "Add at least one goal.",
    toast_customization_saved: "Goals saved!",
    toast_goals_reset: "Goals reset to default.",
    toast_day_unlocked: "Day unlocked! Update your goals.",
    toast_day_closed: "Day closed! +20 XP.",
    levelup_text_prefix: "You've reached level",
    toast_app_installed: "App installed successfully!",
    DEFAULT_TASKS: [
      { name: "15 min of cycling", icon: "🚴", desc: "movement and energy" },
      { name: "10 squats", icon: "🍑", desc: "strength and consistency" },
      { name: "Study Python", icon: "🐍", desc: "growth and focus" },
      { name: "Prayer", icon: "🙏", desc: "Sleeping St. Joseph" },
      { name: "Rosary + Psalm 139", icon: "📿", desc: "complete prayer" },
      { name: "No sweets/chocolate", icon: "🍫", desc: "discipline of the day" }
    ],
    MESSAGES: [
      "No excuses. Just consistency.",
      "Every closed day strengthens your identity.",
      "Today counts. Today builds the result.",
      "You don't need motivation. You need a streak."
    ],
    MISSIONS: [
      "+10 XP if you close the day with all checks.",
      "Clean mission: complete everything without skipping any item.",
      "Focus mode: finish the complete checklist today."
    ],
    MASCOT_MESSAGES: {
      neutral: ["Let's wrap up this day.", "One step at a time.", "The first step is the most important.", "Focus on today's first goal."],
      partial: ["Good. Keep it up.", "You're on the right track.", "Don't stop now, consistency is key.", "Another step taken!"],
      almost: ["You're almost there!", "Just a little more, don't give up now.", "The final stretch! Let's go all in."],
      done: ["All set. Close this day now.", "Well done! Day completed. ✨"],
      locked: ["Today is done. More tomorrow.", "Rest. You've earned it."]
    }
  },
  pt: {
    challengeNameDefault: "Desafio de 30 Dias",
    customTaskDesc: "foco e consistência",
    level: "Nível",
    days_suffix: "dias",
    toast_reminders_on: "Lembretes ativados!",
    toast_reminders_fail: "Falha ao ativar lembretes.",
    toast_permission_denied: "Permissão para notificações negada.",
    reminders_enabled: "Lembretes Ativados",
    reminders_blocked: "Lembretes Bloqueados",
    toast_task_completed: "concluída!",
    toast_task_unchecked: "desmarcada.",
    btn_day_closed: "Dia fechado",
    btn_close_day_done: "Fechar o dia",
    btn_close_day: "Complete tudo",
    helper_text_locked: "Você já fechou o dia. Volte amanhã!",
    helper_text_all_done: "Tudo pronto! Feche o dia para ganhar XP.",
    helper_text_remaining: "metas restantes",
    edit: "Editar",
    close: "Fechar",
    toast_at_least_one_goal: "Adicione pelo menos uma meta.",
    toast_customization_saved: "Metas salvas!",
    toast_goals_reset: "Metas redefinidas para o padrão.",
    toast_day_unlocked: "Dia destravado! Atualize suas metas.",
    toast_day_closed: "Dia fechado! +20 XP.",
    levelup_text_prefix: "Você alcançou o nível",
    toast_app_installed: "App instalado com sucesso!",
    DEFAULT_TASKS: [
      { name: "15 min de bike", icon: "🚴", desc: "movimento e energia" },
      { name: "10 agachamentos", icon: "🍑", desc: "força e constância" },
      { name: "Estudar Python", icon: "🐍", desc: "crescimento e foco" },
      { name: "Oração", icon: "🙏", desc: "São José Dormindo" },
      { name: "Terço + Salmo 139", icon: "📿", desc: "oração completa" },
      { name: "Sem doce/chocolate", icon: "🍫", desc: "disciplina do dia" }
    ],
    MESSAGES: [
      "Sem desculpas. Só consistência.",
      "Cada dia fechado fortalece sua identidade.",
      "Hoje conta. Hoje constrói o resultado.",
      "Você não precisa de motivação. Precisa de sequência."
    ],
    MISSIONS: [
      "+10 XP se fechar o dia com todos os checks.",
      "Missão limpa: complete tudo sem pular nenhum item.",
      "Modo foco: finalize o checklist completo hoje."
    ],
    MASCOT_MESSAGES: {
      neutral: ["Vamos fechar esse dia.", "Um passo de cada vez.", "O primeiro passo é o mais importante.", "Foco na primeira meta de hoje."],
      partial: ["Boa. Continua assim.", "Você está no caminho certo.", "Não pare agora, a consistência é a chave.", "Mais um passo dado!"],
      almost: ["Você está quase lá!", "Falta pouco, não desista agora.", "A reta final! Vamos com tudo."],
      done: ["Tudo pronto. Fecha esse dia agora.", "Mandou bem! Dia concluído. ✨"],
      locked: ["Hoje já foi. Amanhã tem mais.", "Descanse. Você mereceu."]
    }
  }
};

const userLang = navigator.language.startsWith('pt') ? 'pt' : 'en';
const i18n = translations[userLang];

function get_DEFAULT_TASKS() {
  return i18n.DEFAULT_TASKS;
}
function get_MESSAGES() {
  return i18n.MESSAGES;
}
function get_MISSIONS() {
  return i18n.MISSIONS;
}
function get_MASCOT_MESSAGES() {
  return i18n.MASCOT_MESSAGES;
}