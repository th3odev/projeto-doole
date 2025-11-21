// ================================================
// CHAT GLOBAL – FUNCIONA EM TODO O SITE
// ================================================
window.initChat = async function () {
  const supabase = window.supabase;

  // usuário logado
  const user = (await supabase.auth.getUser())?.data?.user;
  if (!user) return;

  console.log("💬 Chat inicializando…");

  // caminhos dinâmicos
  const isPages = window.location.pathname.includes("/pages/");
  const basePath = isPages
    ? "../assets/js/components/chat/"
    : "assets/js/components/chat/";

  const iconPath = isPages
    ? "../assets/img/icons/chat.svg"
    : "assets/img/icons/chat.svg";

  // elementos
  const chatBtn = document.getElementById("chatBtn");
  const chatModal = document.getElementById("chatModal");
  const chatClose = document.getElementById("chatClose");
  const icon = document.getElementById("chatIcon");

  if (!chatBtn || !chatModal || !chatClose) {
    console.warn("⚠️ Elementos do chat não encontrados.");
    return;
  }

  if (icon) icon.src = iconPath;

  // carregar módulos do chat dinamicamente
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

  // ================================
  // Inicializar módulos
  // ================================
  const service = window.initChatService(supabase);
  const modalCtrl = window.initChatModal();
  const convView = window.initConversationView(service, supabase);
  const listView = window.initListView(service, convView);

  // deixar globais (IMPORTANTE)
  window.convView = convView;
  window.listView = listView;
  window.chatService = service;

  // atrasamos eventos para garantir que tudo existe
  setTimeout(() => {
    window.initChatEvents(supabase, convView, listView);
  }, 150);

  // ================================
  // Abrir modal pelo botão flutuante
  // ================================
  chatBtn.classList.remove("hidden");

  chatBtn.addEventListener("click", () => {
    modalCtrl.open();
    listView.load(user.id);
    chatBtn.classList.remove("chat-has-new");
  });

  // fechar modal
  chatClose.addEventListener("click", () => {
    modalCtrl.close();
  });

  console.log("💬 Chat carregado e ativo!");

  // ============================================================
  // FUNÇÃO GLOBAL PARA ABRIR UMA CONVERSA DIRETO (profile.js usa)
  // ============================================================
  window.loadChatConversation = async function (conversationId) {
    const currentUser = (await supabase.auth.getUser())?.data?.user;
    if (!currentUser) return;

    // pegar conversas
    const convs = await service.getConversations(currentUser.id);
    const conversation = convs.find((c) => c.id === conversationId);

    if (!conversation) {
      console.error("❌ Conversa não encontrada:", conversationId);
      return;
    }

    // abrir modal
    chatModal.classList.remove("hidden");
    chatModal.classList.add("open");

    // trocar da lista → conversa
    document.getElementById("chatList").classList.add("hidden");
    document.getElementById("chatConversation").classList.remove("hidden");

    // abrir conversa normal
    convView.open(conversation, currentUser.id);
  };
};

document.addEventListener("DOMContentLoaded", window.initChat);
