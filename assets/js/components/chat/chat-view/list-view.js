// ===============================================================
// LIST-VIEW.JS — agora carrega mensagens não lidas do banco
// ===============================================================
window.initListView = function (service, convView) {
  const list = document.getElementById("chatList");

  let cachedConversations = [];
  let currentUserId = null;

  const unreadSet = new Set();

  // aplicar visual
  function applyUnreadStyles() {
    document.querySelectorAll(".chat-item").forEach((el) => {
      const id = el.dataset.id;
      if (unreadSet.has(id)) {
        el.classList.add("chat-item--unread");
      } else {
        el.classList.remove("chat-item--unread");
      }
    });
  }

  function markUnread(convId) {
    unreadSet.add(String(convId));
    applyUnreadStyles();
    window.updateChatButtonBadge?.(unreadSet.size);
  }

  function clearUnread(convId) {
    unreadSet.delete(String(convId));
    applyUnreadStyles();
    window.updateChatButtonBadge?.(unreadSet.size);
  }

  async function load(userId) {
    currentUserId = userId;

    // 🔥 pegar conversas
    cachedConversations = await service.getConversations(userId);

    // 🔥 pegar mensagens não lidas
    const unreadMsgs = await service.getUnreadByConversation(userId);
    unreadSet.clear();
    unreadMsgs.forEach((m) => unreadSet.add(String(m.conversation_id)));

    // render
    if (!cachedConversations.length) {
      list.innerHTML = "<p>Nenhuma negociação.</p>";
      return;
    }

    list.innerHTML = cachedConversations
      .map(
        (c) => `
        <div class="chat-item" data-id="${c.id}">
          <img src="${
            c.items?.imagens?.[0] || "../assets/img/placeholder.webp"
          }">
          <div>
            <h4 class="chat-item__title">${c.items?.titulo}</h4>
            <span class="chat-item__meta">Negociando…</span>
          </div>
        </div>`
      )
      .join("");

    document.querySelectorAll(".chat-item").forEach((el) => {
      el.onclick = () => {
        const id = el.dataset.id;
        const conv = cachedConversations.find((c) => c.id === id);
        if (!conv) return;
        clearUnread(id);
        convView.open(conv, userId);
      };
    });

    applyUnreadStyles();
  }

  return {
    load,
    updateConversationItem: markUnread,
    clearConversationItem: clearUnread,
    getTotalUnread() {
      return unreadSet.size;
    },
  };
};
