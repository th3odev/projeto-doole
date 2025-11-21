// assets/js/components/chat/chat-render.js
window.initChatRender = function (service) {
  const list = document.getElementById("chatList");

  if (!list) {
    console.warn("⚠️ chatList não encontrado.");
    return { loadConversations: () => {} };
  }

  // carregar conversas
  async function loadConversations() {
    const user = await window.supabase.auth.getUser();
    const userId = user?.data?.user?.id;

    if (!userId) return;

    const convs = await service.getConversations(userId);

    if (!convs.length) {
      list.innerHTML = "<p>Nenhuma negociação.</p>";
      return;
    }

    list.innerHTML = convs
      .map(
        (c) => `
      <div class="chat-item" data-id="${c.id}">
        <img src="${c.items?.imagens?.[0] || "../assets/img/placeholder.webp"}">
        <div>
          <p class="chat-item__title">${c.items?.titulo}</p>
          <p class="chat-item__meta">Negociando…</p>
        </div>
      </div>
      `
      )
      .join("");
  }

  // marcar conversa como contendo nova mensagem
  function updateConversationItem(convId) {
    const item = list.querySelector(`.chat-item[data-id="${convId}"]`);
    if (!item) return;

    item.classList.add("chat-item--new");
  }

  // limpar indicador quando abrir conversa
  function clearConversationItem(convId) {
    const item = list.querySelector(`.chat-item[data-id="${convId}"]`);
    if (!item) return;

    item.classList.remove("chat-item--new");
  }

  return {
    loadConversations,
    updateConversationItem,
    clearConversationItem,
  };
};
