// =====================================================
// CHAT-SERVICE.JS — agora com suporte a mensagens não lidas
// =====================================================
window.initChatService = function (supabase) {
  return {
    // Conversas onde o usuário é comprador OU vendedor
    async getConversations(userId) {
      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          id,
          item_id,
          comprador_id,
          vendedor_id,
          iniciado_em,
          items:items!conversations_item_id_fkey (
            id,
            titulo,
            imagens
          )
        `
        )
        .or(`comprador_id.eq.${userId},vendedor_id.eq.${userId}`)
        .order("iniciado_em", { ascending: false });

      if (error) {
        console.error("❌ Erro getConversations:", error);
        return [];
      }

      return data || [];
    },

    // Mensagens da conversa
    async getMessages(conversationId) {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("enviado_em", { ascending: true });

      if (error) {
        console.error("❌ Erro getMessages:", error);
        return [];
      }

      return data || [];
    },

    // 🔥 BUSCAR MENSAGENS NÃO LIDAS POR CONVERSA
    async getUnreadByConversation(userId) {
      const { data, error } = await supabase
        .from("messages")
        .select("conversation_id")
        .eq("lida", false)
        .neq("sender_id", userId);

      if (error) {
        console.error("❌ Erro getUnreadByConversation:", error);
        return [];
      }

      return data || []; // lista com conversation_id
    },

    // Enviar mensagem
    async sendMessage(conversationId, senderId, conteudo) {
      try {
        const { data, error } = await supabase
          .from("messages")
          .insert([
            {
              conversation_id: conversationId,
              sender_id: senderId,
              conteudo,
              lida: false,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error("❌ Erro sendMessage:", err);
        return null;
      }
    },
    async getUnreadByConversation(userId) {
      const { data, error } = await supabase
        .from("messages")
        .select("conversation_id")
        .eq("lida", false)
        .not("sender_id", "eq", userId)
        .not("sender_id", "is", null); // evita mensagens sem sender_id

      if (error) {
        console.error("❌ Erro getUnreadByConversation:", error);
        return [];
      }

      return data || [];
    },
  };
};
