// assets/js/components/chat/chat-modal.js
window.initChatModal = function () {
  const modal = document.getElementById("chatModal");

  if (!modal) {
    console.warn("❌ chatModal não encontrado no DOM.");
    return {
      open: () => {},
      close: () => {},
      isOpen: () => false,
    };
  }

  function open() {
    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("open"), 10);
  }

  function close() {
    modal.classList.remove("open");
    setTimeout(() => {
      modal.classList.add("hidden");
    }, 150);
  }

  function isOpen() {
    return modal.classList.contains("open");
  }

  return { open, close, isOpen };
};
