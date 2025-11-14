// itens listagem - mantém lógica original com melhorias (ordenar, filtros, truncamento)
// comentários simples, lowercase

document.addEventListener("DOMContentLoaded", async () => {
  const itemsContainer = document.getElementById("itemsContainer");
  const searchInput = document.getElementById("searchInput");
  const filterTipo = document.getElementById("filterTipo");
  const filterCidade = document.getElementById("filterCidade");
  const sortSelect = document.getElementById("sortSelect");

  const priceFmt = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  let allItems = [];

  // carregar itens do supabase
  async function carregarItens() {
    showSkeleton(6);

    const { data: items, error } = await supabase
      .from("items")
      .select(
        "id, titulo, descricao, tipo, preco, localizacao, imagens, criado_em"
      )
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("erro ao carregar itens:", error);
      itemsContainer.innerHTML = `<p class="text-center text-muted">Erro ao carregar itens.</p>`;
      return;
    }

    allItems = items || [];

    // popula cidades (únicas)
    const cidades = [
      ...new Set((allItems || []).map((i) => i.localizacao).filter(Boolean)),
    ];
    filterCidade.innerHTML = `<option value="">Filtrar cidades</option>`;
    cidades.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      filterCidade.appendChild(opt);
    });

    aplicarFiltros();
  }

  // renderizar cards
  function renderizarItens(items) {
    itemsContainer.innerHTML = "";

    if (!items || items.length === 0) {
      itemsContainer.innerHTML = `<p class="text-center text-muted">Nenhum item encontrado.</p>`;
      return;
    }

    const fragment = document.createDocumentFragment();

    items.forEach((item) => {
      const wrapper = document.createElement("div");
      wrapper.className = "col-auto d-flex justify-content-start";

      const imagem =
        (item.imagens && item.imagens[0]) || "../assets/img/placeholder.png";
      const badge =
        item.tipo === "doacao"
          ? `<span class="badge-doacao">Doação</span>`
          : `<span class="badge-venda">Venda</span>`;
      const preco =
        item.tipo === "doacao"
          ? "Grátis"
          : priceFmt.format(Number(item.preco || 0));

      const card = document.createElement("article");
      card.className = "card-item";
      card.innerHTML = `
        <img src="${escapeHtmlAttr(imagem)}" alt="${escapeHtmlAttr(
        item.titulo || "item"
      )}" />

        <div class="conteudo">
          <div class="d-flex justify-content-between align-items-start w-100">
            <h3 class="titulo-card">${escapeHtml(item.titulo || "")}</h3>
            ${badge}
          </div>

          <p class="descricao-card">${escapeHtml(item.descricao || "")}</p>

          <div class="rodape mt-2 w-100">
            <div class="localizacao">
              <img src="../assets/img/icons/localizacao.svg" alt="" aria-hidden="true" />
              <span>${escapeHtml(item.localizacao || "")}</span>
            </div>
            <span class="preco-card">${preco}</span>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        window.location.href = `item.html?id=${encodeURIComponent(item.id)}`;
      });

      wrapper.appendChild(card);
      fragment.appendChild(wrapper);
    });

    itemsContainer.appendChild(fragment);
  }

  // aplicar filtros + ordenação
  function aplicarFiltros() {
    let items = Array.isArray(allItems) ? [...allItems] : [];

    const tipo = filterTipo.value;
    const cidade = filterCidade.value;
    const busca = (searchInput.value || "").toLowerCase().trim();

    if (tipo) items = items.filter((i) => i.tipo === tipo);
    if (cidade) items = items.filter((i) => i.localizacao === cidade);
    if (busca) {
      items = items.filter((i) => {
        const t = (i.titulo || "").toLowerCase();
        const d = (i.descricao || "").toLowerCase();
        return t.includes(busca) || d.includes(busca);
      });
    }

    // ordenação
    const sortVal = sortSelect?.value || "recentes";
    items.sort((a, b) => {
      if (sortVal === "recentes") {
        const ta = new Date(a.criado_em || 0).getTime();
        const tb = new Date(b.criado_em || 0).getTime();
        return tb - ta;
      }
      if (sortVal === "preco-asc") {
        const pa = Number(a.preco || 0);
        const pb = Number(b.preco || 0);
        return pa - pb;
      }
      if (sortVal === "preco-desc") {
        const pa = Number(a.preco || 0);
        const pb = Number(b.preco || 0);
        return pb - pa;
      }
      if (sortVal === "alpha") {
        const ta = (a.titulo || "").toLowerCase();
        const tb = (b.titulo || "").toLowerCase();
        return ta.localeCompare(tb);
      }
      return 0;
    });

    renderizarItens(items);
  }

  // skeleton simples
  function showSkeleton(count) {
    itemsContainer.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const col = document.createElement("div");
      col.className = "col-auto";
      col.innerHTML = `
        <div class="card-item" aria-hidden="true">
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

  // eventos
  searchInput.addEventListener(
    "input",
    debounce(() => aplicarFiltros(), 220)
  );
  filterTipo.addEventListener("change", aplicarFiltros);
  filterCidade.addEventListener("change", aplicarFiltros);
  if (sortSelect) sortSelect.addEventListener("change", aplicarFiltros);

  // debounce util
  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // escape para texto inserido no DOM
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // escape para atributos (mais seguro pra url/img)
  function escapeHtmlAttr(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  await carregarItens();
});
