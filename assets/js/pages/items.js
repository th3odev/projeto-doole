// assets/js/pages/items.js
import { debounce } from "../core/utils.js";

const itemsContainer = document.getElementById("itemsContainer");
const paginationContainer = document.getElementById("pagination");

const searchInput = document.getElementById("searchInput");
const filterTipo = document.getElementById("filterTipo");
const filterCidade = document.getElementById("filterCidade");
const filterCategoria = document.getElementById("filterCategoria");
const sortSelect = document.getElementById("sortSelect");

const ITEMS_PER_PAGE = 8;

let allItems = [];
let filteredItems = [];
let currentPage = 1;

/* =========================
   CARREGAR DADOS
========================= */
async function carregarDados() {
  showSkeleton(6);

  try {
    // categorias
    const { data: cats } = await supabase
      .from("categories")
      .select("id, nome")
      .order("nome", { ascending: true });

    if (Array.isArray(cats)) populateCategorias(cats);

    // itens
    const { data: items, error } = await supabase
      .from("items")
      .select(
        "id, titulo, descricao, tipo, preco, localizacao, imagens, criado_em, categoria_id, status"
      )
      .eq("status", "ativo")
      .order("criado_em", { ascending: false });

    if (error) throw error;

    // ofertas aceitas
    const { data: ofertasAceitas } = await supabase
      .from("offers")
      .select("item_id")
      .eq("status", "aceita");

    const itensComOfertaAceita = new Set(
      (ofertasAceitas || []).map((o) => o.item_id)
    );

    allItems = (items || []).filter((i) => !itensComOfertaAceita.has(i.id));

    populateCidades(allItems);
    aplicarFiltros();
  } catch (err) {
    console.error("Erro ao carregar itens:", err);
    itemsContainer.innerHTML = `<p class="text-center text-muted">Erro ao carregar itens.</p>`;
  }
}

/* =========================
   FILTROS + ORDENAÇÃO
========================= */
function aplicarFiltros() {
  let items = [...allItems];

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

  const sortVal = sortSelect?.value || "recentes";
  items.sort((a, b) => {
    if (sortVal === "recentes") {
      return new Date(b.criado_em) - new Date(a.criado_em);
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

  filteredItems = items;
  currentPage = 1;
  renderPage();
}

/* =========================
   PAGINAÇÃO
========================= */
function renderPage() {
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = filteredItems.slice(start, end);

  renderizarItens(pageItems);
  renderPagination();
}

function renderPagination() {
  if (!paginationContainer) return;
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  if (totalPages <= 1) return;

  paginationContainer.appendChild(
    createPageButton("«", currentPage - 1, currentPage === 1)
  );

  for (let i = 1; i <= totalPages; i++) {
    paginationContainer.appendChild(createPageButton(i, i, i === currentPage));
  }

  paginationContainer.appendChild(
    createPageButton("»", currentPage + 1, currentPage === totalPages)
  );
}

function createPageButton(text, page, disabled) {
  const li = document.createElement("li");
  li.className = `page-item ${disabled ? "disabled" : ""}`;

  const btn = document.createElement("button");
  btn.className = "page-link";
  btn.textContent = text;

  btn.onclick = () => {
    if (!disabled) {
      currentPage = page;
      renderPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  li.appendChild(btn);
  return li;
}

/* =========================
   RENDERIZAÇÃO (ORIGINAL)
========================= */
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
            <img src="../assets/img/icons/localizacao.svg" alt="" aria-hidden="true" />
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

  itemsContainer.classList.toggle("center-mobile", items.length === 1);
}

/* =========================
   SELECTS
========================= */
function populateCategorias(categories = []) {
  filterCategoria.innerHTML = `<option value="">Todas as categorias</option>`;
  categories.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = String(c.id);
    opt.textContent = c.nome || "Categoria";
    filterCategoria.appendChild(opt);
  });
}

function populateCidades(items = []) {
  const cidades = [...new Set(items.map((i) => i.localizacao).filter(Boolean))];
  filterCidade.innerHTML = `<option value="">Todas as cidades</option>`;
  cidades.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    filterCidade.appendChild(opt);
  });
}

/* =========================
   HELPERS
========================= */
function showSkeleton(count = 6) {
  itemsContainer.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const sk = document.createElement("div");
    sk.className = "card card--item";
    sk.innerHTML = `<div class="skeleton" style="height:200px"></div>`;
    itemsContainer.appendChild(sk);
  }
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeHtmlAttr(str = "") {
  return escapeHtml(str).replace(/'/g, "&#39;");
}

function formatCurrency(v) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(v || 0));
}

/* =========================
   EVENTS
========================= */
searchInput?.addEventListener("input", debounce(aplicarFiltros, 220));
filterTipo?.addEventListener("change", aplicarFiltros);
filterCidade?.addEventListener("change", aplicarFiltros);
filterCategoria?.addEventListener("change", aplicarFiltros);
sortSelect?.addEventListener("change", aplicarFiltros);

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", carregarDados);
