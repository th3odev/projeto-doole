// ================================================
// CHAT GLOBAL – funciona em todas as páginas
// ================================================
window.initChat = async function () {
  const supabase = window.supabase;

  const user = (await supabase.auth.getUser())?.data?.user;
  if (!user) return;

  console.log("💬 Chat inicializando…");

  const isPages = window.location.pathname.includes("/pages/");
  const basePath = isPages
    ? "../assets/js/components/chat/"
    : "assets/js/components/chat/";

  const iconPath = isPages
    ? "../assets/img/icons/chat.svg"
    : "assets/img/icons/chat.svg";

  const chatBtn = document.getElementById("chatBtn");
  const chatModal = document.getElementById("chatModal");
  const chatClose = document.getElementById("chatClose");
  const icon = document.getElementById("chatIcon");

  if (!chatBtn || !chatModal || !chatClose) {
    console.warn("⚠️ Elementos do chat não encontrados.");
    return;
  }

  if (icon) icon.src = iconPath;

  // carregar scripts
  const files = [
    "chat-button.js",
    "chat-modal.js",
    "chat-service.js",
    "chat-events.js",
    "chat-view/list-view.js",
    "chat-view/conversation-view.js",
  ];

  for (const file of files) {
    await new Promise((resolve) => {
      const tag = document.createElement("script");
      tag.src = basePath + file + "?v=" + Date.now();
      tag.onload = resolve;
      document.body.appendChild(tag);
    });
  }

  // iniciar módulos
  const service = window.initChatService(supabase);
  const modalCtrl = window.initChatModal();
  const convView = window.initConversationView(service, supabase);
  const listView = window.initListView(service, convView);

  window.convView = convView;
  window.listView = listView;
  window.chatService = service;

  // 🔥 unread inicial (offline)
  try {
    await listView.load(user.id);
    window.updateChatButtonBadge?.(listView.getTotalUnread());
  } catch (e) {
    console.error("Erro carregando unread inicial:", e);
  }

  // botão flutuante
  window.initChatButton(modalCtrl, {
    async loadConversations() {
      await listView.load(user.id);
    },
  });

  setTimeout(() => {
    window.initChatEvents(supabase, convView, listView);
  }, 150);

  chatClose.addEventListener("click", () => {
    modalCtrl.close();
  });

  console.log("💬 Chat carregado e ativo!");
};
document.addEventListener("DOMContentLoaded", window.initChat);
