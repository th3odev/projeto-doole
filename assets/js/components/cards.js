import { formatPrice, escapeHtml } from "../core/utils.js";

export const renderItemCard = (item, options = {}) => {
  const { showBadge = true, clickable = true, className = "" } = options;

  const imagem =
    (item.imagens && item.imagens[0]) || "../assets/img/placeholder.png";
  const badge =
    item.tipo === "doacao"
      ? `<span class="badge badge--donation">Doação</span>`
      : `<span class="badge badge--sale">Venda</span>`;
  const preco = item.tipo === "doacao" ? "Grátis" : formatPrice(item.preco);

  const cardHTML = `
    <article class="card card--item ${className}" data-item-id="${item.id}">
      <img src="${imagem}" alt="${escapeHtml(
    item.titulo || "item"
  )}" class="card--item__image" />
      
      <div class="card--item__content">
        <div class="card--item__header">
          <h3 class="card--item__title">${escapeHtml(item.titulo || "")}</h3>
          ${showBadge ? badge : ""}
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
    </article>
  `;

  return cardHTML;
};

export const setupCardClick = (cardElement, itemId) => {
  cardElement.addEventListener("click", () => {
    window.location.href = `item.html?id=${encodeURIComponent(itemId)}`;
  });
};

export const renderSkeletonCards = (container, count = 6) => {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const col = document.createElement("div");
    col.className = "col-auto";
    col.innerHTML = `
      <div class="card card--item" aria-hidden="true">
        <div class="skeleton" style="height:200px;"></div>
        <div class="p-3">
          <div class="skeleton mb-2" style="width:60%; height:16px;"></div>
          <div class="skeleton mb-2" style="width:90%; height:12px;"></div>
          <div class="skeleton" style="width:40%; height:14px;"></div>
        </div>
      </div>`;
    container.appendChild(col);
  }
};
