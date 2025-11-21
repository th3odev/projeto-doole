// =============================================================
// NOTIFICATIONSSERVICE.JS — versão limpa, sem chat_message
// =============================================================
(function () {
  const supabase = window.supabase;

  if (!supabase) {
    console.error("❌ Supabase não encontrado em window.supabase");
    return;
  }

  // ============================================================
  // 🔔 CREATE NOTIFICATION — ignora mensagens de chat
  // ============================================================
  async function createNotification({
    userId,
    senderId,
    type,
    title,
    message,
    itemId,
    offerId,
  }) {
    try {
      // 🔥 Chat NUNCA gera notificação no banco
      if (type === "chat_message") {
        console.log("💬 Ignorando notificação de chat (não será salva).");
        return { success: true, ignored: true };
      }

      let itemTitle = null;

      // Buscar título do item automaticamente
      if (itemId) {
        const { data: item, error: itemError } = await supabase
          .from("items")
          .select("titulo")
          .eq("id", itemId)
          .single();

        if (!itemError && item) {
          itemTitle = item.titulo;
        }
      }

      // preencher placeholders
      const finalTitle = title?.replace("{item_title}", itemTitle || "Item");
      const finalMessage = message
        ?.replace(/\(id:[^)]+\)/g, "")
        ?.replace("{item_title}", itemTitle || "item");

      // salvar notificação (exceto chat)
      const { error } = await supabase.from("notifications").insert([
        {
          user_id: userId,
          sender_id: senderId,
          type,
          title: finalTitle,
          message: finalMessage,
          item_id: itemId || null,
          offer_id: offerId || null,
          lida: false,
        },
      ]);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("❌ Erro ao criar notificação:", error);
      return { success: false, error };
    }
  }

  // ============================================================
  // 🔢 CONTAR NÃO LIDAS
  // ============================================================
  async function getUnreadCountForUser(userId) {
    try {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("lida", false);

      if (error) throw error;

      return { success: true, count: count || 0 };
    } catch (error) {
      console.error("❌ Erro ao contar notificações:", error);
      return { success: false, count: 0, error };
    }
  }

  // ============================================================
  // 📄 LISTAR NOTIFICAÇÕES
  // ============================================================
  async function getNotificationsForUser(userId) {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("criado_em", { ascending: false });

      if (error) throw error;

      return { success: true, notifications: data || [] };
    } catch (error) {
      console.error("❌ Erro ao buscar notificações:", error);
      return { success: false, notifications: [], error };
    }
  }

  // ============================================================
  // ✔ MARCAR COMO LIDAS
  // ============================================================
  async function markAllAsRead(userId) {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ lida: true })
        .eq("user_id", userId)
        .eq("lida", false);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("❌ Erro ao marcar como lidas:", error);
      return { success: false, error };
    }
  }

  // ============================================================
  // 🔴 REALTIME — apenas notificações reais
  // ============================================================
  function subscribeToUserNotifications(userId, onNewNotification) {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:user:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // reforço extra: ignorar chat
          if (payload.new?.type === "chat_message") {
            console.log("💬 Ignorando realtime de chat.");
            return;
          }

          if (typeof onNewNotification === "function") {
            onNewNotification(payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log("🔔 Canal de notificações:", status);
      });

    return channel;
  }

  // ============================================================
  // EXPORT GLOBAL
  // ============================================================
  window.notificationsService = {
    createNotification,
    getUnreadCountForUser,
    getNotificationsForUser,
    markAllAsRead,
    subscribeToUserNotifications,
  };
})();
