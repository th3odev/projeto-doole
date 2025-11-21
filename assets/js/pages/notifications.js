// assets/js/pages/notifications.js
import { formatDistanceToNow } from "../core/utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabase;
  const user = (await supabase.auth.getUser())?.data?.user;

  if (!user) {
    window.location.href = "./auth.html";
    return;
  }

  const list = document.getElementById("notificationsList");

  // =====================================================
  // REMOVER NOTIFICAÇÃO
  // =====================================================
  async function deleteNotification(id, cardEl) {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // remove do DOM
      cardEl.remove();

      // atualiza badge
      window.updateNotificationsBadge?.();

      // se limpou tudo, mostra mensagem padrão
      if (!list.children.length) {
        list.innerHTML =
          '<p class="text-muted">Nenhuma notificação encontrada.</p>';
      }
    } catch (err) {
      console.error("Erro ao excluir notificação:", err);
      alert("Erro ao excluir notificação.");
    }
  }

  // =====================================================
  // CARREGAR NOTIFICAÇÕES
  // =====================================================
  async function carregarNotificacoes() {
    list.innerHTML = "<p>Carregando...</p>";

    const { success, notifications, error } =
      await window.notificationsService.getNotificationsForUser(user.id);

    if (!success) {
      list.innerHTML = "<p>Erro ao carregar notificações.</p>";
      console.error(error);
      return;
    }

    if (!notifications || notifications.length === 0) {
      list.innerHTML =
        '<p class="text-muted">Nenhuma notificação encontrada.</p>';
      return;
    }

    list.innerHTML = "";

    notifications.forEach((n) => {
      const card = document.createElement("div");
      card.className = "notification-card" + (n.lida ? "" : " unread");

      const time = formatDistanceToNow(n.criado_em);

      let actionBtn = "";

      // =====================================================
      // BOTÕES POR TIPO DE NOTIFICAÇÃO
      // =====================================================

      // → Lance recebido pelo vendedor
      if (n.type === "offer_received") {
        actionBtn = `
          <a href="../pages/profile.html#items" class="notif-btn">
            Ver ofertas no meu item
          </a>`;
      }

      // → Lance aceito para o comprador
      if (n.type === "offer_accepted") {
        actionBtn = `
          <a href="../pages/profile.html#offers" class="notif-btn">
            Ver lance aceito
          </a>`;
      }

      // → Mensagem no chat
      if (n.type === "chat_message") {
        actionBtn = `
          <a href="../pages/profile.html#chat" class="notif-btn">
            Abrir chat
          </a>`;
      }

      // =====================================================
      // TEMPLATE DO CARD
      // =====================================================
      card.innerHTML = `
        <div class="notification-card__header">
          <div>
            <div class="notification-title">${n.title}</div>
            <div class="notification-time">${time} atrás</div>
          </div>
          <button class="notif-delete-btn" aria-label="Excluir notificação">×</button>
        </div>

        <div class="notification-message">${n.message}</div>

        ${actionBtn}
      `;

      // botão excluir
      const deleteBtn = card.querySelector(".notif-delete-btn");
      deleteBtn.addEventListener("click", () => {
        if (confirm("Deseja excluir esta notificação?")) {
          deleteNotification(n.id, card);
        }
      });

      list.appendChild(card);
    });

    // =====================================================
    // MARCAR COMO LIDAS
    // =====================================================
    await window.notificationsService.markAllAsRead(user.id);

    window.updateNotificationsBadge?.();
  }

  carregarNotificacoes();
});
