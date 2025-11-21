// assets/js/components/chat/chat-service.js
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

    // Mensagens de uma conversa
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

    // Enviar mensagem
    async sendMessage(conversationId, senderId, conteudo) {
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            conversation_id: conversationId,
            sender_id: senderId,
            conteudo,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("❌ Erro sendMessage:", error);
        return null;
      }

      return data;
    },
  };
};
