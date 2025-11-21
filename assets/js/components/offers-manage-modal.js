// ===============================================
// MODAL DE GERENCIAMENTO DE OFERTAS — DOOLE (modular)
// ===============================================

export function initOffersManageModal(supabase) {
  // Método principal chamado pelo profile.js
  async function renderOffersList({ offers, modalList, reload }) {
    modalList.innerHTML = "";

    // Verifica se há lance aceito
    const acceptedOffer = offers.find((o) => o.status === "aceita");

    // ======================================================
    // SE JÁ EXISTE LANCE ACEITO → mostra alerta + botão chat
    // ======================================================
    if (acceptedOffer) {
      const alertEl = document.createElement("div");
      alertEl.className = "offer-alert-accepted";
      alertEl.innerHTML = `
        <strong>⚠ Lance já aceito</strong><br>
        Você já aceitou um lance para este item.
        <br><br>
        <button class="btn-start-chat" data-item="${acceptedOffer.item_id}">
          Iniciar Chat
        </button>
      `;
      modalList.appendChild(alertEl);

      // botão abre o chat
      alertEl
        .querySelector(".btn-start-chat")
        .addEventListener("click", async (e) => {
          const itemId = e.target.dataset.item;

          // garantir que conversa existe
          const { data: conv } = await supabase
            .from("conversations")
            .select("id")
            .eq("item_id", itemId)
            .maybeSingle();

          if (!conv) {
            alert("Erro: conversa não encontrada.");
            return;
          }

          // abre o chat (simples e funcional)
          document.getElementById("chatBtn").click();
        });
    }

    // ======================================================
    // LISTAGEM DOS LANCES
    // ======================================================
    offers.forEach((offer) => {
      const card = document.createElement("div");
      card.className = "offer-card";

      // cores por status
      if (offer.status === "aceita") card.classList.add("offer-card--accepted");
      if (offer.status === "recusada")
        card.classList.add("offer-card--rejected");

      const userName = offer.users?.nome || "Usuário";
      const dataFormatada = new Date(offer.criado_em).toLocaleString("pt-BR");

      const isPending = offer.status === "pendente";
      const canManage = isPending && !acceptedOffer;

      card.innerHTML = `
        <div class="offer-card__user">${userName}</div>

        <div class="offer-card__info">
          Lance: <strong>R$${Number(offer.valor).toFixed(2)}</strong><br>
          ${
            offer.cobra_retirada
              ? `Cobra retirada: R$${Number(offer.retirada_valor).toFixed(2)}`
              : "Não cobra retirada"
          }
          <br>
          <small>${dataFormatada}</small>
        </div>

        <div class="offer-card__status">${offer.status.toUpperCase()}</div>

        ${
          canManage
            ? `
          <div class="offer-card__actions">
            <button class="btn-accept">Aceitar</button>
            <button class="btn-reject">Recusar</button>
          </div>
          `
            : ""
        }
      `;

      modalList.appendChild(card);

      // ======================================================
      // BTN → ACEITAR
      // ======================================================
      if (canManage) {
        card
          .querySelector(".btn-accept")
          .addEventListener("click", async () => {
            const { success } = await window.offersService.acceptOffer({
              offerId: offer.id,
              itemId: offer.item_id,
              compradorId: offer.usuario_id,
              vendedorId: offer.dono_item_id,
            });

            if (success) {
              alert("Lance aceito!");

              // dispara evento global p/ profile.js
              window.dispatchEvent(
                new CustomEvent("offer:accepted", {
                  detail: { itemId: offer.item_id },
                })
              );

              reload(offer.item_id);
            }
          });

        // ======================================================
        // BTN → RECUSAR
        // ======================================================
        card
          .querySelector(".btn-reject")
          .addEventListener("click", async () => {
            const { success } = await window.offersService.rejectOffer({
              offerId: offer.id,
            });

            if (success) {
              alert("Lance recusado!");

              window.dispatchEvent(
                new CustomEvent("offer:updated", {
                  detail: { itemId: offer.item_id },
                })
              );

              reload(offer.item_id);
            }
          });
      }
    });
  }

  // Retorna função usada pelo profile.js
  return { renderOffersList };
}
