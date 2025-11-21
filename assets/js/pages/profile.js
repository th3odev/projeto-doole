// ===============================================
// PROFILE.JS — versão estável e funcional
// ===============================================
import { initOffersManageModal } from "../components/offers-manage-modal.js";

document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabase;

  const user = (await supabase.auth.getUser())?.data?.user;
  if (!user) {
    window.location.href = "./auth.html";
    return;
  }

  // elementos
  const nameEl = document.getElementById("profileName");
  const emailEl = document.getElementById("profileEmail");
  const itemsList = document.getElementById("itemsList");
  const offersList = document.getElementById("offersList");
  const tabItems = document.getElementById("tabItems");
  const tabOffers = document.getElementById("tabOffers");

  // modal de ofertas (lances recebidos)
  const modal = document.getElementById("offersModal");
  const modalOverlay = document.getElementById("offersModalOverlay");
  const modalClose = document.getElementById("offersModalClose");
  const modalList = document.getElementById("offersModalList");

  function openOffersModal() {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeOffersModal() {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }

  modalOverlay.addEventListener("click", closeOffersModal);
  modalClose.addEventListener("click", closeOffersModal);

  // módulo de lances
  const manageOffers = initOffersManageModal(supabase);

  // =============================================================
  // carregar lances do item
  // =============================================================
  async function loadOffersForItem(itemId) {
    modalList.innerHTML = "<p>Carregando...</p>";

    const { data, error } = await supabase
      .from("offers")
      .select("*, users:usuario_id(nome), status, criado_em, retirada_valor")
      .eq("item_id", itemId)
      .order("valor", { ascending: false });

    if (error) {
      modalList.innerHTML = "<p>Erro ao carregar lances.</p>";
      console.error(error);
      return;
    }

    if (!data || data.length === 0) {
      modalList.innerHTML = "<p>Nenhum lance recebido ainda.</p>";
      return;
    }

    modalList.innerHTML = "";

    manageOffers.renderOffersList({
      offers: data,
      modalList,
      reload: loadOffersForItem,
    });
  }

  // =============================================================
  // dados do usuário
  // =============================================================
  emailEl.textContent = user.email;

  const { data: profile } = await supabase
    .from("users")
    .select("nome, sobrenome")
    .eq("id", user.id)
    .single();

  const displayName = profile?.nome
    ? profile.nome + (profile.sobrenome ? ` ${profile.sobrenome[0]}.` : "")
    : user.email.split("@")[0];

  nameEl.textContent = displayName;

  // =============================================================
  // meus itens
  // =============================================================
  async function loadMyItems() {
    const { data } = await supabase
      .from("items")
      .select("*")
      .eq("usuario_id", user.id);

    itemsList.innerHTML = "";

    if (!data || data.length === 0) {
      itemsList.innerHTML = `<p class="text-center text-gray">Você ainda não cadastrou itens.</p>`;
      return;
    }

    data.forEach((item) => {
      const img = item.imagens?.[0] || "../assets/img/placeholder.webp";

      itemsList.innerHTML += `
<div class="profile-item">

  <div class="profile-item__image">
    <a href="./item-detail.html?id=${item.id}">
      <img src="${img}">
    </a>
  </div>

  <div class="profile-item__info">
    <a href="./item-detail.html?id=${item.id}">
      <h3 class="profile-item__title">${item.titulo}</h3>
    </a>

    <p class="profile-item__desc">${item.descricao}</p>

    <p class="profile-item__price">
      R$${Number(item.preco || 0).toFixed(2)}
    </p>
  </div>

  <div class="profile-item__actions">
    <button class="profile-btn view-offers" data-id="${item.id}">
      ver lances
    </button>

    <button class="profile-btn profile-btn--delete delete-item" data-id="${
      item.id
    }">
      excluir
    </button>
  </div>

</div>
`;
    });

    // excluir
    document.querySelectorAll(".delete-item").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Deseja excluir este item?")) return;
        await supabase.from("items").delete().eq("id", btn.dataset.id);
        loadMyItems();
      });
    });

    // ver lances
    document.querySelectorAll(".view-offers").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await loadOffersForItem(btn.dataset.id);
        openOffersModal();
      });
    });
  }

  window.reloadProfileItems = loadMyItems;

  // =============================================================
  // meus lances (comprador)
  // =============================================================
  async function loadMyOffers() {
    const { data } = await supabase
      .from("offers")
      .select("*, items(*)")
      .eq("usuario_id", user.id);

    offersList.innerHTML = "";

    if (!data || data.length === 0) {
      offersList.innerHTML = `<p class="text-center text-gray">Você ainda não enviou lances.</p>`;
      return;
    }

    data.forEach((of) => {
      const img = of.items?.imagens?.[0] || "../assets/img/placeholder.webp";

      const status = of.status || "pendente";

      let actionsHtml = "";
      let statusLabel = "";

      if (status === "aceita") {
        actionsHtml = `
<button class="profile-btn start-chat" data-item="${of.item_id}">
  iniciar chat
</button>`;
        statusLabel = "aceita";
      } else if (status === "pendente") {
        actionsHtml = `
<button class="profile-btn profile-btn--delete cancel-offer" data-id="${of.id}">
  cancelar
</button>`;
        statusLabel = "pendente";
      } else if (status === "recusada") {
        statusLabel = "recusada";
      } else if (status === "cancelada") {
        statusLabel = "cancelada";
      }

      offersList.innerHTML += `
<div class="profile-item">

  <div class="profile-item__image">
    <a href="./item-detail.html?id=${of.items.id}">
      <img src="${img}">
    </a>
  </div>

  <div class="profile-item__info">
    <a href="./item-detail.html?id=${of.items.id}">
      <h3 class="profile-item__title">${of.items.titulo}</h3>
    </a>

    <p class="profile-item__desc">
      Seu lance: R$${Number(of.valor).toFixed(2)}
    </p>
  </div>

  <div class="profile-item__actions">
    ${
      actionsHtml ||
      `<span class="profile-item__status profile-item__status--${status}">
         ${statusLabel}
       </span>`
    }
  </div>

</div>
`;
    });

    // iniciar chat (lance aceito)
    document.querySelectorAll(".start-chat").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const itemId = btn.dataset.item;

        const { data: conv, error } = await supabase
          .from("conversations")
          .select("id")
          .eq("item_id", itemId)
          .maybeSingle();

        if (error || !conv) {
          alert("Erro: conversa não encontrada.");
          return;
        }

        const modal = document.getElementById("chatModal");
        const list = document.getElementById("chatList");
        const convBox = document.getElementById("chatConversation");

        modal.classList.remove("hidden");
        modal.classList.add("open");

        list.classList.add("hidden");
        convBox.classList.remove("hidden");

        window.loadChatConversation(conv.id);
      });
    });

    // cancelar lance (somente pendente)
    document.querySelectorAll(".cancel-offer").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const offerId = btn.dataset.id;
        const ok = confirm("Tem certeza que deseja cancelar este lance?");
        if (!ok) return;

        const { error } = await supabase
          .from("offers")
          .update({ status: "cancelada" })
          .eq("id", offerId)
          .eq("status", "pendente");

        if (error) {
          console.error(error);
          alert("Não foi possível cancelar o lance.");
          return;
        }

        loadMyOffers();
      });
    });
  }

  // =============================================================
  // abas
  // =============================================================
  tabItems.addEventListener("click", () => {
    tabItems.classList.add("active");
    tabOffers.classList.remove("active");

    itemsList.classList.remove("d-none");
    offersList.classList.add("d-none");

    loadMyItems();
  });

  tabOffers.addEventListener("click", () => {
    tabOffers.classList.add("active");
    tabItems.classList.remove("active");

    itemsList.classList.add("d-none");
    offersList.classList.remove("d-none");

    loadMyOffers();
  });

  // eventos realtime
  window.addEventListener("offer:accepted", () => {
    loadMyItems();
    closeOffersModal();
  });

  window.addEventListener("offer:updated", (ev) => {
    const itemId = ev.detail?.itemId;
    if (itemId) loadOffersForItem(itemId);
  });

  // inicialização
  loadMyItems();
});
