// =============================================================
// NOTIFICATIONSSERVICE.JS — FINAL COM {item_title}
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
      // Chat não gera notificação
      if (type === "chat_message") {
        console.log("💬 Ignorando notificação de chat (não salva no banco).");
        return { success: true, ignored: true };
      }

      // Buscar título do item
      let itemTitle = null;

      if (itemId) {
        const { data: item, error } = await supabase
          .from("items")
          .select("titulo")
          .eq("id", itemId)
          .single();

        if (!error && item) itemTitle = item.titulo;
      }

      // Aplicar placeholder
      const finalTitle = title?.replaceAll(
        "{item_title}",
        itemTitle || "seu item"
      );

      const finalMessage = message
        ?.replace(/\(id:[^)]+\)/g, "") // limpar IDs
        ?.replaceAll("{item_title}", itemTitle || "seu item");

      // Salvar notificação
      const { error } = await supabase.from("notifications").insert([
        {
          user_id: userId,
          sender_id: senderId,
          type,
          title: finalTitle, // <-- Agora salva o título real!
          message: finalMessage, // <-- Agora salva a mensagem real!
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
  // 🔴 REALTIME — Apenas notificações reais (exceto chat)
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
          if (payload.new?.type === "chat_message") return;
          if (typeof onNewNotification === "function") {
            onNewNotification(payload.new);
          }
        }
      )
      .subscribe();

    return channel;
  }

  // EXPORT GLOBAL
  window.notificationsService = {
    createNotification,
    getUnreadCountForUser,
    getNotificationsForUser,
    markAllAsRead,
    subscribeToUserNotifications,
  };
})();
