// assets/js/components/chat/chat-events.js
window.initChatEvents = function (supabase, convView, listView) {
  let currentUserId = null;

  // pegar usuário logado
  supabase.auth.getUser().then((res) => {
    currentUserId = res.data?.user?.id || null;
  });

  // canal realtime
  const channel = supabase.channel("chat-realtime");

  // ================================
  // 📩 NOVA MENSAGEM (REALTIME)
  // ================================
  channel.on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "messages" },
    async (payload) => {
      const msg = payload.new;
      if (!msg || !currentUserId) return;

      const chatBtn = document.getElementById("chatBtn");
      const active = convView.getActiveConversationId();

      // mensagem minha → ignora
      if (msg.sender_id === currentUserId) return;

      // conversa aberta → insere direto
      if (active && msg.conversation_id === active) {
        convView.handleIncomingMessage(msg);
        chatBtn?.classList.remove("chat-has-new");
        return;
      }

      // conversa fechada → badge
      chatBtn?.classList.add("chat-has-new");

      // marcar conversa na lista como não lida
      listView?.updateConversationItem?.(msg.conversation_id);
    }
  );

  // ================================
  // 🔌 SUBSCRIBE
  // ================================
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      console.log("🔔 Realtime conectado (somente mensagens).");
    }
  });
};
