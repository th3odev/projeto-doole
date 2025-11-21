// =========================================================
// NOTIFICATIONS-REALTIME.JS — versão limpa sem chat notif
// =========================================================
(function () {
  async function initNotificationsRealtime() {
    const supabase = window.supabase;
    const notificationsService = window.notificationsService;

    if (!supabase || !notificationsService) return;

    const user = (await supabase.auth.getUser())?.data?.user;
    if (!user) return;

    // Realtime SOMENTE para notificações reais
    notificationsService.subscribeToUserNotifications(
      user.id,
      async (notif) => {
        // ignorar mensagens de chat completamente
        if (notif.type === "chat_message") {
          console.log("💬 Mensagem no chat — ignorando notificação global.");
          return;
        }

        console.log("🔔 Nova notificação realtime:", notif);

        // Atualiza badge no menu
        window.updateNotificationsBadge?.();

        // Toast apenas para notificações reais
        showNotificationToast(notif);
      }
    );
  }

  // -------------------------------------------------------
  // Toast simples (só para lances/aceites)
  // -------------------------------------------------------
  function showNotificationToast(notif) {
    if (!notif) return;

    const containerId = "doole-toast-container";
    let container = document.getElementById(containerId);

    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      container.className = "doole-toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "doole-toast";

    toast.innerHTML = `
      <div class="doole-toast__title">${notif.title || "Notificação"}</div>
      <div class="doole-toast__message">${notif.message || ""}</div>
    `;

    container.appendChild(toast);

    // Animação → saída suave
    setTimeout(() => {
      toast.classList.add("hide");
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // -------------------------------------------------------
  // inicialização
  // -------------------------------------------------------
  document.addEventListener("DOMContentLoaded", initNotificationsRealtime);
})();
