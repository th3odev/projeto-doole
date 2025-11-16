// ==============================
// ITEM DETAIL PAGE — DOOLE (otimizado)
// ==============================

import { escapeHtml, formatPrice } from "../core/utils.js";

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

// Helpers
function getItemId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function safeText(node, text) {
  if (!node) return;
  node.textContent = text ?? "";
}

// Load main item
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

    safeText(elTitulo, data.titulo || "Sem título");
    safeText(
      elPreco,
      data.tipo === "doacao" ? "Doação" : formatPrice(data.preco)
    );
    safeText(elDesc, data.descricao || "");
    safeText(elLocal, data.localizacao || "-");
    safeText(elCat, data.categorias?.nome || "Categoria");

    // gallery
    const imgs = Array.isArray(data.imagens)
      ? data.imagens.filter(Boolean)
      : [];
    if (!imgs.length) {
      setMainImage(placeholder);
      if (elGaleria) elGaleria.innerHTML = "";
    } else {
      setMainImage(imgs[0]);
      renderGallery(imgs, data.titulo);
    }

    await Promise.all([loadOffers(id), loadRelated(data.categoria_id, id)]);
  } catch (err) {
    console.error("Erro loadItem:", err);
  }
}

// Gallery render
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

  // active first thumb
  const first = elGaleria.querySelector("img");
  setActiveThumb(first);
}

// active thumb + try to center
function setActiveThumb(selected) {
  if (!elGaleria) return;
  elGaleria
    .querySelectorAll("img")
    .forEach((t) => t.classList.remove("item-detail__thumbnail--active"));
  if (!selected) return;
  selected.classList.add("item-detail__thumbnail--active");

  // try center
  try {
    const rect = selected.getBoundingClientRect();
    const parentRect = elGaleria.getBoundingClientRect();
    if (rect.left < parentRect.left || rect.right > parentRect.right) {
      const offset =
        rect.left - parentRect.left - (parentRect.width / 2 - rect.width / 2);
      elGaleria.scrollBy({ left: offset, behavior: "smooth" });
    }
  } catch (e) {
    /* ignore */
  }
}

function setMainImage(src) {
  if (!elPrincipal) return;
  elPrincipal.src = src || placeholder;
  elPrincipal.alt = elTitulo?.textContent
    ? `${elTitulo.textContent}`
    : "Imagem do item";
}

// Offers
async function loadOffers(itemId) {
  try {
    const { data } = await supabase
      .from("offers")
      .select("valor")
      .eq("item_id", itemId)
      .order("valor", { ascending: false });

    if (elQtdOfertas) elQtdOfertas.textContent = data?.length || 0;
    const maior = data?.[0]?.valor ?? 0;
    if (elMaiorOferta) elMaiorOferta.textContent = formatPrice(maior);
  } catch (e) {
    console.error("Erro loadOffers:", e);
  }
}

// Related items
async function loadRelated(categoriaId, itemId) {
  if (!categoriaId) return;
  try {
    const { data } = await supabase
      .from("items")
      .select("id, titulo, preco, tipo, localizacao, imagens")
      .eq("categoria_id", categoriaId)
      .neq("id", itemId)
      .limit(6);

    if (!elRelacionados) return;
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

// Init
document.addEventListener("DOMContentLoaded", () => {
  loadItem();

  const btnOferta = document.getElementById("btn-oferta");
  if (btnOferta) {
    btnOferta.addEventListener("click", () => {
      btnOferta.disabled = true;
      btnOferta.style.opacity = "0.8";
      setTimeout(() => {
        btnOferta.disabled = false;
        btnOferta.style.opacity = "";
      }, 800);
    });
  }
});
