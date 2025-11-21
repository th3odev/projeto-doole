// assets/js/components/chat/chat-button.js
window.initChatButton = function (modal, render) {
  const btn = document.getElementById("chatBtn");

  if (!btn) {
    console.warn("⚠️ Botão do chat não encontrado!");
    return;
  }

  btn.addEventListener("click", async () => {
    if (modal.isOpen()) {
      modal.close();
    } else {
      modal.open();

      // limpamos o "tem nova" ao abrir a lista
      btn.classList.remove("chat-has-new");

      await render.loadConversations();
    }
  });

  btn.classList.remove("hidden");

  return btn;
};
