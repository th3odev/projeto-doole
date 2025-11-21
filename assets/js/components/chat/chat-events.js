// =====================================================
// CHAT-EVENTS — realtime estilo WhatsApp
// =====================================================
window.initChatEvents = function (supabase, convView, listView) {
  let currentUserId = null;

  // pegar usuário logado
  supabase.auth.getUser().then((res) => {
    currentUserId = res.data?.user?.id || null;
  });

  const channel = supabase.channel("chat-realtime");

  channel.on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "messages" },
    (payload) => {
      const msg = payload.new;
      if (!msg || !currentUserId) return;

      // mensagens minhas → ignora
      if (msg.sender_id === currentUserId) return;

      const convId = msg.conversation_id;
      const activeId = convView.getActiveConversationId();

      // --------------------------------------------------
      // conversa aberta → só mostra a msg e limpa unread
      // --------------------------------------------------
      if (activeId && activeId === convId) {
        convView.handleIncomingMessage(msg);
        listView.clearConversationItem?.(convId);

        // atualiza badge com total atual
        const total = listView.getTotalUnread?.() ?? 0;
        window.updateChatButtonBadge?.(total);
        return;
      }

      // --------------------------------------------------
      // conversa fechada → marca unread
      // --------------------------------------------------
      listView.updateConversationItem?.(convId);

      const total = listView.getTotalUnread?.() ?? 0;
      window.updateChatButtonBadge?.(total);
    }
  );

  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      console.log("🔔 Realtime conectado (chat).");
    }
  });
};
