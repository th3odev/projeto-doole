// ==============================
// ITEM DETAIL PAGE — DOOLE
// ==============================

import { escapeHtml, formatPrice } from "../core/utils.js";
import { initOfferModal } from "../components/offer-modal.js";

// Elements
const elTitulo = document.getElementById("item-titulo");
const elPreco = document.getElementById("item-preco");
const elDesc = document.getElementById("item-descricao");
const elLocal = document.getElementById("item-localizacao");
const elCat = document.getElementById("item-categoria");

const elPrincipal = document.getElementById("imagem-principal");
const elGaleria = document.getElementById("galeria");

const elQtdOfertas = document.getElementById("qtd-ofertas");
const elMaiorOferta = document.getElementById("maior-oferta");

const elRelacionados = document.getElementById("itens-relacionados");

const placeholder = "../assets/img/placeholder.png";

// mantemos o maior lance e o dono do item
let maiorOfertaAtual = 0;
let donoItemId = null;
let tipoItem = null; // << ESSENCIAL para detectar "doacao"

// Helpers
function getItemId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function safeText(node, text) {
  if (!node) return;
  node.textContent = text ?? "";
}

// =======================================
// LOAD ITEM PRINCIPAL
// =======================================
async function loadItem() {
  const id = getItemId();
  if (!id) {
    console.error("❌ ID do item ausente na URL");
    return;
  }

  try {
    const { data, error } = await supabase
      .from("items")
      .select("*, categorias:categoria_id(nome)")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao carregar item:", error);
      return;
    }
    if (!data) {
      console.warn("Item não encontrado");
      return;
    }

    // salva dono do item
    donoItemId = data.usuario_id;

    // salva tipo (pra saber se é doação)
    tipoItem = data.tipo;

    safeText(elTitulo, data.titulo || "Sem título");
    safeText(
      elPreco,
      data.tipo === "doacao" ? "Doação" : formatPrice(data.preco)
    );
    safeText(elDesc, data.descricao || "");
    safeText(elLocal, data.localizacao || "-");
    safeText(elCat, data.categorias?.nome || "Categoria");

    // GALLERY
    const imgs = Array.isArray(data.imagens)
      ? data.imagens.filter(Boolean)
      : [];

    if (!imgs.length) {
      setMainImage(placeholder);
      elGaleria.innerHTML = "";
    } else {
      setMainImage(imgs[0]);
      renderGallery(imgs, data.titulo);
    }

    await Promise.all([loadOffers(id), loadRelated(data.categoria_id, id)]);
  } catch (err) {
    console.error("Erro loadItem:", err);
  }
}

// =======================================
// GALLERY RENDER
// =======================================
function renderGallery(imgs = [], title = "") {
  if (!elGaleria) return;
  elGaleria.innerHTML = "";

  imgs.forEach((src, idx) => {
    const img = document.createElement("img");
    img.src = src || placeholder;
    img.alt = `${title || "Item"} — foto ${idx + 1}`;
    img.className = "item-detail__thumbnail";
    img.tabIndex = 0;

    img.addEventListener("click", () => {
      setMainImage(src);
      setActiveThumb(img);
    });

    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        img.click();
      }
    });

    elGaleria.appendChild(img);
  });

  const first = elGaleria.querySelector("img");
  setActiveThumb(first);
}

function setActiveThumb(selected) {
  if (!elGaleria) return;

  elGaleria
    .querySelectorAll("img")
    .forEach((t) => t.classList.remove("item-detail__thumbnail--active"));

  if (!selected) return;
  selected.classList.add("item-detail__thumbnail--active");
}

function setMainImage(src) {
  elPrincipal.src = src || placeholder;
  elPrincipal.alt = elTitulo?.textContent || "Imagem do item";
}

// =======================================
// OFERTAS
// =======================================
async function loadOffers(itemId) {
  try {
    const { data } = await supabase
      .from("offers")
      .select("valor")
      .eq("item_id", itemId)
      .order("valor", { ascending: false });

    elQtdOfertas.textContent = data?.length || 0;
    maiorOfertaAtual = data?.[0]?.valor ?? 0;

    elMaiorOferta.textContent =
      tipoItem === "doacao" ? "—" : formatPrice(maiorOfertaAtual);
  } catch (e) {
    console.error("Erro loadOffers:", e);
  }
}

// =======================================
// RELACIONADOS
// =======================================
async function loadRelated(categoriaId, itemId) {
  if (!categoriaId) return;

  try {
    const { data } = await supabase
      .from("items")
      .select("id, titulo, preco, tipo, localizacao, imagens")
      .eq("categoria_id", categoriaId)
      .neq("id", itemId)
      .limit(6);

    elRelacionados.innerHTML = "";

    if (!data || data.length === 0) {
      elRelacionados.innerHTML = `<p class="text-center text-muted">Nenhum item relacionado.</p>`;
      return;
    }

    data.forEach((it) => {
      const imgSrc =
        Array.isArray(it.imagens) && it.imagens[0]
          ? it.imagens[0]
          : placeholder;

      const precoTxt = it.tipo === "doacao" ? "Grátis" : formatPrice(it.preco);

      const card = document.createElement("article");
      card.className = "card card--item card--related--small";

      card.innerHTML = `
        <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(
        it.titulo
      )}" class="card--item__image" />
        <div class="card--item__content">
          <h3 class="card--item__title">${escapeHtml(it.titulo)}</h3>
          <p class="card--item__description">${escapeHtml(
            it.localizacao || ""
          )}</p>
          <div class="card--item__footer">
            <span class="card--item__price">${precoTxt}</span>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        window.location.href = `item-detail.html?id=${it.id}`;
      });

      elRelacionados.appendChild(card);
    });
  } catch (e) {
    console.error("Erro loadRelated:", e);
  }
}

// =======================================
// INIT
// =======================================
document.addEventListener("DOMContentLoaded", async () => {
  await loadItem();

  const itemId = getItemId();
  const btnOferta = document.getElementById("btn-oferta");

  // inicializa modal passando também o tipo
  const modalOferta = initOfferModal(
    supabase,
    itemId,
    maiorOfertaAtual,
    donoItemId,
    tipoItem // << novo
  );

  btnOferta.addEventListener("click", () => {
    modalOferta.open();
  });
});
