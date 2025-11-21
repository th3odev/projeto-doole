// assets/js/core/notifications-realtime.js
(function () {
  async function initNotificationsRealtime() {
    const supabase = window.supabase;
    const notificationsService = window.notificationsService;

    if (!supabase || !notificationsService) return;

    const user = (await supabase.auth.getUser())?.data?.user;
    if (!user) return;

    // Assina realtime de notificações
    notificationsService.subscribeToUserNotifications(
      user.id,
      async (novaNotif) => {
        console.log("🔔 Nova notificação realtime:", novaNotif);

        // Atualiza badge
        if (window.updateNotificationsBadge) {
          window.updateNotificationsBadge();
        }

        // Mostra toast
        showNotificationToast(novaNotif);
      }
    );
  }

  // Toast simples no canto inferior direito
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

    // Animação de saída
    setTimeout(() => {
      toast.classList.add("hide");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3500);
  }

  // Inicia quando DOM estiver pronto
  document.addEventListener("DOMContentLoaded", initNotificationsRealtime);
})();
