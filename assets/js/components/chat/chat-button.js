// =====================================================
// CHAT BUTTON — controla apenas abrir/fechar + badge
// =====================================================
window.initChatButton = function (modal, render) {
  const btn = document.getElementById("chatBtn");
  if (!btn) return;

  // badge numérico
  let badge = document.getElementById("chatBtnBadge");
  if (!badge) {
    badge = document.createElement("span");
    badge.id = "chatBtnBadge";
    badge.className = "chat-btn-badge hidden";
    badge.textContent = "0";
    btn.appendChild(badge);
  }

  // abrir / fechar modal
  btn.onclick = async () => {
    if (modal.isOpen()) {
      modal.close();
      return;
    }

    modal.open();

    // carrega lista, mas NÃO mexe em unreadSet
    if (render?.loadConversations) {
      await render.loadConversations();
    }
  };

  btn.classList.remove("hidden");

  // função global para atualizar badge
  window.updateChatButtonBadge = (count) => {
    const total = Number.isFinite(count) ? count : 0;

    if (total <= 0) {
      badge.classList.add("hidden");
      badge.textContent = "0";
      btn.classList.remove("chat-has-new");
      return;
    }

    badge.textContent = total > 99 ? "99+" : String(total);
    badge.classList.remove("hidden");
    btn.classList.add("chat-has-new");
  };

  // função global para resetar badge, se precisar
  window.resetChatButtonBadge = () => {
    window.updateChatButtonBadge(0);
  };

  return btn;
};
