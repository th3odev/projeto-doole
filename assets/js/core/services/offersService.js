// ===============================================
// SERVICE DE LANCES — FINAL COM {item_title}
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
      // Atualiza oferta
      const { error: updateError } = await supabase
        .from("offers")
        .update({ status: "aceita" })
        .eq("id", offerId);

      if (updateError) throw updateError;

      // Verifica conversa existente
      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("item_id", itemId)
        .maybeSingle();

      let conversationId = existingConversation?.id;

      // Cria conversa se não existir
      if (!conversationId) {
        const { data: newConv, error } = await supabase
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

        if (error) throw error;
        conversationId = newConv.id;
      }

      // Notificação → comprador
      await supabase.from("notifications").insert([
        {
          user_id: compradorId,
          sender_id: vendedorId,
          type: "offer_accepted",
          title: "Seu lance no item {item_title} foi aceito!",
          message:
            "Parabéns! Seu lance no item {item_title} foi aceito. Agora você pode conversar com o vendedor.",
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

      // Notificação → vendedor
      await supabase.from("notifications").insert([
        {
          user_id: vendedorId,
          sender_id: compradorId,
          type: "offer_received",
          title: "Novo lance no item {item_title}",
          message:
            "Você recebeu uma nova oferta no item {item_title}. Clique para ver detalhes.",
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

  window.offersService = {
    acceptOffer,
    rejectOffer,
    createOffer,
  };
})();
