// assets/js/components/chat/chat-view/list-view.js
window.initListView = function (service, convView) {
  const list = document.getElementById("chatList");

  let cachedConversations = [];
  let currentUserId = null;

  // -------------------------------------------
  // Re-renderizar uma única conversa na lista
  // -------------------------------------------
  function updateConversationItem(conversationId) {
    const item = document.querySelector(
      `.chat-item[data-id="${conversationId}"]`
    );
    if (!item) return;

    item.classList.add("chat-item--unread");
  }

  // -------------------------------------------
  // Carregar lista completa
  // -------------------------------------------
  async function load(userId) {
    currentUserId = userId;
    cachedConversations = await service.getConversations(userId);

    if (!cachedConversations.length) {
      list.innerHTML = "<p>Nenhuma negociação.</p>";
      return;
    }

    list.innerHTML = cachedConversations
      .map(
        (c) => `
      <div class="chat-item" data-id="${c.id}">
        <img src="${c.items?.imagens?.[0] || "../assets/img/placeholder.webp"}">
        <div>
          <h4 class="chat-item__title">${c.items?.titulo}</h4>
          <span class="chat-item__meta">Negociando…</span>
        </div>
      </div>`
      )
      .join("");

    // clique em cada conversa
    document.querySelectorAll(".chat-item").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.dataset.id;
        const conv = cachedConversations.find((c) => c.id === id);
        if (!conv) return;

        el.classList.remove("chat-item--unread");

        const btn = document.getElementById("chatBtn");
        btn?.classList.remove("chat-has-new");

        convView.open(conv, userId);
      });
    });
  }

  // -------------------------------------------
  // Atualizar a lista SE a lista estiver ativa
  // -------------------------------------------
  async function liveRefresh(conversationId) {
    const modal = document.getElementById("chatModal");

    // só atualiza se a lista estiver sendo exibida
    if (!modal.classList.contains("open")) return;

    const wasOpen = convView.getActiveConversationId();

    await load(currentUserId);

    // se uma conversa estava aberta, reabre ela
    if (wasOpen) {
      const conv = cachedConversations.find((c) => c.id === wasOpen);
      if (conv) convView.open(conv, currentUserId);
    }

    updateConversationItem(conversationId);
  }

  return {
    load,
    updateConversationItem,
    liveRefresh,
  };
};
