document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabase;

  const user = (await supabase.auth.getUser())?.data?.user;

  // ELEMENTOS DO PERFIL
  const nameEl = document.getElementById("profileName");
  const emailEl = document.getElementById("profileEmail");

  const itemsList = document.getElementById("itemsList");
  const offersList = document.getElementById("offersList");

  const tabItems = document.getElementById("tabItems");
  const tabOffers = document.getElementById("tabOffers");

  // ELEMENTOS DO MODAL DE LANCES
  const modal = document.getElementById("offersModal");
  const modalOverlay = document.getElementById("offersModalOverlay");
  const modalClose = document.getElementById("offersModalClose");
  const modalList = document.getElementById("offersModalList");

  // FUNÇÕES DO MODAL
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

  // ================================
  //   CARREGAR LANCES DO ITEM
  // ================================
  async function loadOffersForItem(itemId) {
    modalList.innerHTML = "<p>Carregando...</p>";

    const { data, error } = await supabase
      .from("offers")
      .select("*, users:usuario_id(nome)")
      .eq("item_id", itemId)
      .order("valor", { ascending: false });

    if (error) {
      modalList.innerHTML = "<p>Erro ao carregar lances.</p>";
      return;
    }

    if (!data.length) {
      modalList.innerHTML = "<p>Nenhum lance recebido ainda.</p>";
      return;
    }

    modalList.innerHTML = "";

    data.forEach((of) => {
      const retiradaTxt =
        of.retirada_valor > 0
          ? `Cobrou retirada: R$${of.retirada_valor.toFixed(2)}`
          : "Não cobra retirada";

      modalList.innerHTML += `
        <div class="offer-card">
          <h4>${of.users?.nome || "Usuário"}</h4>
          <p>Lance: <strong>R$${of.valor.toFixed(2)}</strong></p>
          <p>${retiradaTxt}</p>
          <p class="small">Data: ${new Date(of.criado_em).toLocaleString()}</p>

          <div class="offer-card__actions">
            <button class="btn-small-blue">Aceitar</button>
            <button class="btn-small-delete">Recusar</button>
          </div>
        </div>
      `;
    });
  }

  // ================================
  //   REDIRECIONAR SE NÃO LOGADO
  // ================================
  if (!user) {
    window.location.href = "./auth.html";
    return;
  }

  emailEl.textContent = user.email;

  // ================================
  //   NOME DO PERFIL
  // ================================
  const { data: profile } = await supabase
    .from("users")
    .select("nome, sobrenome")
    .eq("id", user.id)
    .single();

  let displayName = profile?.nome
    ? profile.nome.trim() +
      (profile.sobrenome ? ` ${profile.sobrenome[0].toUpperCase()}.` : "")
    : user.email.split("@")[0];

  nameEl.textContent = displayName;

  // ================================
  //   CARREGAR MEUS ITENS
  // ================================
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

          <div class="profile-item__content">
            <a href="./item-detail.html?id=${item.id}">
              <h3 class="profile-item__title">${item.titulo}</h3>
            </a>

            <p class="profile-item__desc">${item.descricao}</p>
            <p class="profile-item__price">R$${Number(item.preco).toFixed(
              2
            )}</p>
          </div>

          <div class="profile-item__actions">
            <button class="btn-small-blue view-offers" data-id="${item.id}">
              Ver Lances
            </button>
            <button class="btn-small-delete delete-item" data-id="${item.id}">
              Excluir
            </button>
          </div>

        </div>
      `;
    });

    // --- DELETAR ITEM ---
    document.querySelectorAll(".delete-item").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;

        if (!confirm("Deseja realmente excluir este item?")) return;

        await supabase.from("items").delete().eq("id", id);
        loadMyItems();
      });
    });

    // --- VER LANCES ---
    document.querySelectorAll(".view-offers").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        await loadOffersForItem(id);
        openOffersModal();
      });
    });
  }

  // ================================
  //   CARREGAR MEUS LANCES ENVIADOS
  // ================================
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
      const img = of.items.imagens?.[0] || "../assets/img/placeholder.webp";

      offersList.innerHTML += `
        <div class="profile-item">

          <div class="profile-item__image">
            <a href="./item-detail.html?id=${of.items.id}">
              <img src="${img}">
            </a>
          </div>

          <div class="profile-item__content">
            <a href="./item-detail.html?id=${of.items.id}">
              <h3 class="profile-item__title">${of.items.titulo}</h3>
            </a>

            <p class="profile-item__desc">
              Seu lance: R$${Number(of.valor).toFixed(2)}
            </p>
          </div>

          <div class="profile-item__actions">
            <button class="btn-small-blue">Ver Item</button>
          </div>

        </div>
      `;
    });
  }

  // ================================
  //   TROCA ENTRE AS ABAS
  // ================================
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

  // carregar por padrão
  loadMyItems();
});
