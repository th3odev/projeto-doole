// items.js - ATUALIZADO com novas classes CSS BEM
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
    filterCidade.innerHTML = `<option value="">Todas as cidades</option>`;
    cidades.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      filterCidade.appendChild(opt);
    });

    aplicarFiltros();
  }

  // renderizar cards COM NOVAS CLASSES BEM
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
          ? `<span class="badge badge--donation">Doação</span>`
          : `<span class="badge badge--sale">Venda</span>`;
      const preco =
        item.tipo === "doacao"
          ? "Grátis"
          : priceFmt.format(Number(item.preco || 0));

      // CARD COM NOVAS CLASSES BEM
      const card = document.createElement("article");
      card.className = "card card--item";
      card.innerHTML = `
        <img src="${escapeHtmlAttr(imagem)}" alt="${escapeHtmlAttr(
        item.titulo || "item"
      )}" class="card--item__image" />

        <div class="card--item__content">
          <div class="card--item__header">
            <h3 class="card--item__title">${escapeHtml(item.titulo || "")}</h3>
            ${badge}
          </div>

          <p class="card--item__description">${escapeHtml(
            item.descricao || ""
          )}</p>

          <div class="card--item__footer">
            <div class="card--item__location">
              <img src="../assets/img/icons/localizacao.svg" alt="" aria-hidden="true" class="card--item__location-icon" />
              <span>${escapeHtml(item.localizacao || "")}</span>
            </div>
            <span class="card--item__price">${preco}</span>
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

  // skeleton COM NOVAS CLASSES
  function showSkeleton(count) {
    itemsContainer.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const col = document.createElement("div");
      col.className = "col-auto";
      col.innerHTML = `
        <div class="card card--item" aria-hidden="true">
          <div class="skeleton" style="height:200px;"></div>
          <div class="card--item__content">
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
