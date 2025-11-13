document.addEventListener("DOMContentLoaded", async () => {
  const itemsContainer = document.getElementById("itemsContainer");
  const searchInput = document.getElementById("searchInput");
  const filterTipo = document.getElementById("filterTipo");
  const filterCidade = document.getElementById("filterCidade");

  const priceFmt = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  // =============================
  //  Função para carregar itens
  // =============================
  async function carregarItens() {
    showSkeleton(6);

    const { data: items, error } = await supabase
      .from("items")
      .select(
        "id, titulo, descricao, tipo, preco, localizacao, imagens, criado_em"
      )
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("Erro ao carregar itens:", error);
      itemsContainer.innerHTML = `<p class="text-center text-muted">Erro ao carregar itens.</p>`;
      return;
    }

    const cidades = [
      ...new Set(items.map((i) => i.localizacao).filter(Boolean)),
    ];
    filterCidade.innerHTML = `<option value="">Filtrar cidades</option>`;
    cidades.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      filterCidade.appendChild(opt);
    });

    renderizarItens(items);
  }

  // =============================
  //  Renderizar Cards
  // =============================
  function renderizarItens(items) {
    itemsContainer.innerHTML = "";

    if (!items || items.length === 0) {
      itemsContainer.innerHTML = `<p class="text-center text-muted">Nenhum item encontrado.</p>`;
      return;
    }

    const fragment = document.createDocumentFragment();

    items.forEach((item) => {
      const col = document.createElement("div");
      col.className = "col-12 col-sm-6 col-md-4 col-lg-3";

      const imagem = item.imagens?.[0] || "../assets/img/placeholder.png";
      const badge =
        item.tipo === "doacao"
          ? `<span class="badge-doacao">Doação</span>`
          : `<span class="badge-venda">Venda</span>`;
      const preco =
        item.tipo === "doacao"
          ? "Grátis"
          : priceFmt.format(Number(item.preco || 0));

      let descricao = item.descricao || "";
      if (descricao.length > 100) descricao = descricao.slice(0, 100) + "...";

      const card = document.createElement("article");
      card.className = "card-item";
      card.innerHTML = `
        <img src="${imagem}" alt="${item.titulo}" />

        <div class="conteudo">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h3 class="titulo-card">${item.titulo}</h3>
            ${badge}
          </div>

          <p class="descricao-card">${descricao}</p>

          <div class="d-flex justify-content-between align-items-center mt-3">
            <div class="localizacao">
              <img src="../assets/img/icons/localizacao.svg" alt="" aria-hidden="true" />
              <span>${item.localizacao}</span>
            </div>
            <span class="preco-card">${preco}</span>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        window.location.href = `item.html?id=${item.id}`;
      });

      col.appendChild(card);
      fragment.appendChild(col);
    });

    itemsContainer.appendChild(fragment);
  }

  // =============================
  //  Filtro e busca
  // =============================
  async function aplicarFiltros() {
    const { data: items, error } = await supabase.from("items").select("*");

    if (error) return console.error(error);

    let filtrados = items;
    const tipo = filterTipo.value;
    const cidade = filterCidade.value;
    const busca = searchInput.value.toLowerCase();

    if (tipo) filtrados = filtrados.filter((i) => i.tipo === tipo);
    if (cidade) filtrados = filtrados.filter((i) => i.localizacao === cidade);
    if (busca)
      filtrados = filtrados.filter(
        (i) =>
          i.titulo.toLowerCase().includes(busca) ||
          i.descricao.toLowerCase().includes(busca)
      );

    renderizarItens(filtrados);
  }

  function showSkeleton(count) {
    itemsContainer.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const col = document.createElement("div");
      col.className = "col-12 col-sm-6 col-md-4 col-lg-3";
      col.innerHTML = `
        <div class="card-item">
          <div class="skeleton" style="height:200px;"></div>
          <div class="p-3">
            <div class="skeleton mb-2" style="width:60%; height:16px;"></div>
            <div class="skeleton mb-2" style="width:90%; height:12px;"></div>
            <div class="skeleton" style="width:40%; height:14px;"></div>
          </div>
        </div>`;
      itemsContainer.appendChild(col);
    }
  }

  searchInput.addEventListener("input", () => aplicarFiltros());
  filterTipo.addEventListener("change", aplicarFiltros);
  filterCidade.addEventListener("change", aplicarFiltros);

  await carregarItens();
});
