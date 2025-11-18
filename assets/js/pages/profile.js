document.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabase;

  const user = (await supabase.auth.getUser())?.data?.user;

  const nameEl = document.getElementById("profileName");
  const emailEl = document.getElementById("profileEmail");

  const itemsList = document.getElementById("itemsList");
  const offersList = document.getElementById("offersList");

  const tabItems = document.getElementById("tabItems");
  const tabOffers = document.getElementById("tabOffers");

  if (!user) {
    window.location.href = "./auth.html";
    return;
  }

  emailEl.textContent = user.email;

  const { data: profile } = await supabase
    .from("users")
    .select("nome, sobrenome")
    .eq("id", user.id)
    .single();

  let displayName = "";

  if (profile?.nome) {
    displayName = profile.nome.trim();

    if (profile.sobrenome) {
      const inicial = profile.sobrenome.trim().charAt(0).toUpperCase();
      displayName += ` ${inicial}.`;
    }
  } else {
    displayName = user.email.split("@")[0];
  }

  nameEl.textContent = displayName;

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
            <button class="btn-small-blue">Ver Lances</button>
            <button class="btn-small-delete delete-item" data-id="${item.id}">
              Excluir
            </button>
          </div>

        </div>
      `;
    });

    document.querySelectorAll(".delete-item").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;

        if (!confirm("Deseja realmente excluir este item?")) return;

        await supabase.from("items").delete().eq("id", id);
        loadMyItems();
      });
    });
  }

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

  loadMyItems();
});
