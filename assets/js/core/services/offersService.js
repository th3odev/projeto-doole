// ===============================================
// SERVICE DE LANCES — 100% REPARADO
// ===============================================
(function () {
  const supabase = window.supabase;

  if (!supabase) {
    console.error("❌ Supabase não encontrado");
    return;
  }

  // ============================================
  // ACEITAR LANCE + CRIAR CONVERSA
  // ============================================
  async function acceptOffer({ offerId, itemId, compradorId, vendedorId }) {
    try {
      // 1) Atualiza a oferta como aceita
      const { error: updateError } = await supabase
        .from("offers")
        .update({ status: "aceita" })
        .eq("id", offerId);

      if (updateError) throw updateError;

      // 2) Verifica se já existe conversa
      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("item_id", itemId)
        .maybeSingle();

      let conversationId = existingConversation?.id;

      // 3) Se não existir, cria
      if (!conversationId) {
        const { data: newConv, error: convErr } = await supabase
          .from("conversations")
          .insert([
            {
              item_id: itemId,
              comprador_id: compradorId,
              vendedor_id: vendedorId,
              iniciado_em: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (convErr) throw convErr;
        conversationId = newConv.id;
      }

      // 4) Notificação ao comprador
      await supabase.from("notifications").insert([
        {
          user_id: compradorId,
          sender_id: vendedorId,
          type: "offer_accepted",
          title: "Seu lance foi aceito!",
          message: "Agora você pode conversar com o vendedor.",
          item_id: itemId,
          offer_id: offerId,
        },
      ]);

      return { success: true, conversationId };
    } catch (err) {
      console.error("❌ Erro ao aceitar oferta:", err);
      return { success: false };
    }
  }

  // ============================================
  // RECUSAR OFERTA
  // ============================================
  async function rejectOffer({ offerId }) {
    try {
      const { error } = await supabase
        .from("offers")
        .update({ status: "recusada" })
        .eq("id", offerId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("❌ Erro ao recusar lance:", error);
      return { success: false, error };
    }
  }

  // ============================================
  // CRIAR OFERTA
  // ============================================
  async function createOffer({
    itemId,
    compradorId,
    vendedorId,
    valor,
    retiradaValor,
    cobraRetirada,
  }) {
    try {
      const { data: offer, error } = await supabase
        .from("offers")
        .insert([
          {
            item_id: itemId,
            usuario_id: compradorId,
            dono_item_id: vendedorId,
            valor,
            retirada_valor: retiradaValor || 0,
            cobra_retirada: !!cobraRetirada,
            status: "pendente",
            criado_em: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Notificar vendedor
      await supabase.from("notifications").insert([
        {
          user_id: vendedorId,
          sender_id: compradorId,
          type: "offer_received",
          title: "Você recebeu um novo lance",
          message: "Um comprador enviou um lance para seu item.",
          item_id: itemId,
          offer_id: offer.id,
        },
      ]);

      return { success: true, offer };
    } catch (error) {
      console.error("❌ Erro ao criar lance:", error);
      return { success: false, error };
    }
  }

  // EXPORT
  window.offersService = {
    acceptOffer,
    rejectOffer,
    createOffer,
  };
})();
