// assets/js/pages/items.js
import { debounce } from "../core/utils.js";

const itemsContainer = document.getElementById("itemsContainer");
const searchInput = document.getElementById("searchInput");
const filterTipo = document.getElementById("filterTipo");
const filterCidade = document.getElementById("filterCidade");
const filterCategoria = document.getElementById("filterCategoria");
const sortSelect = document.getElementById("sortSelect");

let allItems = [];

// carregar categorias e itens
async function carregarDados() {
  showSkeleton(6);

  try {
    // busca categorias (para popular select)
    const { data: cats, error: catErr } = await supabase
      .from("categories")
      .select("id, nome")
      .order("nome", { ascending: true });

    if (!catErr && Array.isArray(cats)) {
      populateCategorias(cats);
    } else {
      console.warn("Não foi possível carregar categories:", catErr);
    }

    // busca items
    const { data: items, error } = await supabase
      .from("items")
      .select(
        "id, titulo, descricao, tipo, preco, localizacao, imagens, criado_em, categoria_id"
      )
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("erro ao carregar itens:", error);
      itemsContainer.innerHTML = `<p class="text-center text-muted">Erro ao carregar itens.</p>`;
      return;
    }

    allItems = items || [];

    // popula cidades únicas
    populateCidades(allItems);

    aplicarFiltros();
  } catch (err) {
    console.error("Erro geral ao carregar dados:", err);
    itemsContainer.innerHTML = `<p class="text-center text-muted">Erro ao carregar itens.</p>`;
  }
}

function populateCategorias(categories = []) {
  if (!filterCategoria) return;
  filterCategoria.innerHTML = `<option value="">Todas as categorias</option>`;
  categories.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = String(c.id);
    opt.textContent = c.nome || "Categoria";
    filterCategoria.appendChild(opt);
  });
}

function populateCidades(items = []) {
  if (!filterCidade) return;
  const cidades = [...new Set(items.map((i) => i.localizacao).filter(Boolean))];
  filterCidade.innerHTML = `<option value="">Todas as cidades</option>`;
  cidades.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    filterCidade.appendChild(opt);
  });
}

/* ---------- Renderização ---------- */
function renderizarItens(items) {
  itemsContainer.innerHTML = "";

  if (!items || items.length === 0) {
    itemsContainer.innerHTML = `<p class="text-center text-muted">Nenhum item encontrado.</p>`;
    itemsContainer.classList.remove("center-mobile");
    return;
  }

  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card card--item";
    card.dataset.itemId = item.id;
    card.dataset.categoryId = item.categoria_id || "";
    card.dataset.category = item.categoria_id ? String(item.categoria_id) : "";
    card.dataset.type = item.tipo || "";

    const imagem =
      (item.imagens && item.imagens[0]) || "../assets/img/placeholder.png";
    const preco =
      item.tipo === "doacao" ? "Grátis" : formatCurrency(item.preco);

    card.innerHTML = `
      <img src="${escapeHtmlAttr(imagem)}" alt="${escapeHtmlAttr(
      item.titulo || "item"
    )}" class="card--item__image" />

      <div class="card--item__content">
        <div class="card--item__header">
          <h3 class="card--item__title">${escapeHtml(item.titulo || "")}</h3>
          ${
            item.tipo === "doacao"
              ? `<span class="badge badge--donation">Doação</span>`
              : `<span class="badge badge--sale">Venda</span>`
          }
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
      window.location.href = `item-detail.html?id=${encodeURIComponent(
        item.id
      )}`;
    });

    fragment.appendChild(card);
  });

  itemsContainer.appendChild(fragment);

  // centralizar se só tiver 1 visível (mobile UX)
  const visibleCount =
    itemsContainer.querySelectorAll(".card:not(.d-none)").length;
  itemsContainer.classList.toggle("center-mobile", visibleCount === 1);
}

/* ---------- Filtros e ordenação ---------- */
function aplicarFiltros() {
  let items = Array.isArray(allItems) ? [...allItems] : [];

  const tipo = filterTipo?.value || "";
  const cidade = filterCidade?.value || "";
  const categoria = filterCategoria?.value || "";
  const busca = (searchInput?.value || "").toLowerCase().trim();

  if (tipo) items = items.filter((i) => i.tipo === tipo);
  if (cidade) items = items.filter((i) => i.localizacao === cidade);
  if (categoria)
    items = items.filter(
      (i) => String(i.categoria_id || "") === String(categoria)
    );
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
      return (
        new Date(b.criado_em || 0).getTime() -
        new Date(a.criado_em || 0).getTime()
      );
    }
    if (sortVal === "preco-asc") {
      return Number(a.preco || 0) - Number(b.preco || 0);
    }
    if (sortVal === "preco-desc") {
      return Number(b.preco || 0) - Number(a.preco || 0);
    }
    if (sortVal === "alpha") {
      return (a.titulo || "")
        .toLowerCase()
        .localeCompare((b.titulo || "").toLowerCase());
    }
    return 0;
  });

  renderizarItens(items);
}

/* ---------- Skeletons ---------- */
function showSkeleton(count = 6) {
  itemsContainer.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const sk = document.createElement("div");
    sk.className = "card card--item";
    sk.setAttribute("aria-hidden", "true");
    sk.innerHTML = `
      <div class="skeleton" style="height:200px; width:100%;"></div>
      <div class="card--item__content">
        <div class="skeleton mb-2" style="width:60%; height:16px;"></div>
        <div class="skeleton mb-2" style="width:90%; height:12px;"></div>
        <div class="skeleton" style="width:40%; height:14px;"></div>
      </div>
    `;
    itemsContainer.appendChild(sk);
  }
}

/* ---------- Helpers ---------- */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function escapeHtmlAttr(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function formatCurrency(v) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(v || 0));
  } catch (e) {
    return `R$ ${v || "0,00"}`;
  }
}

/* ---------- Event listeners ---------- */
if (searchInput)
  searchInput.addEventListener(
    "input",
    debounce(() => aplicarFiltros(), 220)
  );
if (filterTipo) filterTipo.addEventListener("change", aplicarFiltros);
if (filterCidade) filterCidade.addEventListener("change", aplicarFiltros);
if (filterCategoria) filterCategoria.addEventListener("change", aplicarFiltros);
if (sortSelect) sortSelect.addEventListener("change", aplicarFiltros);

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  carregarDados();
});
