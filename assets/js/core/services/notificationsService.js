// assets/js/core/services/notificationsService.js
(function () {
  const supabase = window.supabase;

  if (!supabase) {
    console.error("❌ Supabase não encontrado em window.supabase");
    return;
  }

  // ============================================
  // 🔔 CREATE NOTIFICATION (com título automático)
  // ============================================
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

      // Substituir {item_title} dinamicamente
      const finalTitle = title?.replace("{item_title}", itemTitle || "Item");
      const finalMessage = message
        ?.replace(/\(id:[^)]+\)/g, "") // remove "(id: ...)"
        ?.replace("{item_title}", itemTitle || "item");

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

  // ============================================
  // 🔢 CONTAR NOTIFICAÇÕES NÃO LIDAS
  // ============================================
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
      return { success: false, error, count: 0 };
    }
  }

  // ============================================
  // 📄 LISTAR TODAS AS NOTIFICAÇÕES DO USUÁRIO
  // ============================================
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
      return { success: false, error, notifications: [] };
    }
  }

  // ============================================
  // ✔ MARCAR TODAS COMO LIDAS
  // ============================================
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

  // ============================================
  // 🔴 SUBSCRIÇÃO REALTIME — NOTIFICAÇÕES AO VIVO
  // ============================================
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

  // ============================================
  // EXPORT GLOBAL
  // ============================================
  window.notificationsService = {
    createNotification,
    getUnreadCountForUser,
    getNotificationsForUser,
    markAllAsRead,
    subscribeToUserNotifications,
  };
})();
