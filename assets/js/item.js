/* item.js — usa window.supabase (definido no supabaseClient.js) */
/* Não usa import/export para evitar problemas de MIME/module. */

document.addEventListener("DOMContentLoaded", async () => {
  const supa = window.supabase;
  if (!supa) {
    console.error("Supabase não inicializado. Verifique supabaseClient.js");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const itemId = params.get("id");

  // elementos
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

  const priceFmt = (v) => {
    try {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(Number(v || 0));
    } catch (e) {
      return "R$ " + (v || "0,00");
    }
  };

  // fallback placeholder
  const placeholder = "../assets/img/placeholder.png";

  // Carrega item
  async function loadItem() {
    if (!itemId) {
      console.error("item id ausente na URL");
      return;
    }

    // busca item e nome da categoria
    const { data, error } = await supa
      .from("items")
      .select("*, categorias:categoria_id(nome)")
      .eq("id", itemId)
      .single();

    if (error) {
      console.error("Erro carregando item:", error);
      return;
    }
    if (!data) {
      console.warn("Item não encontrado");
      return;
    }

    // preencher dados
    elTitulo.textContent = data.titulo || "Título do item";
    elPreco.textContent =
      data.tipo === "doacao" ? "Doação" : priceFmt(data.preco);
    elDesc.textContent = data.descricao || "";
    elLocal.textContent = data.localizacao || "";
    elCat.textContent =
      data.categorias?.nome ||
      (data.categoria_id ? String(data.categoria_id) : "Categoria");

    // imagens
    const imgs = Array.isArray(data.imagens)
      ? data.imagens.filter(Boolean)
      : [];
    if (imgs.length === 0) {
      elPrincipal.src = placeholder;
      elGaleria.innerHTML = "";
    } else {
      elPrincipal.src = imgs[0];
      renderGallery(imgs, data.titulo || "Imagem");
    }

    // ofertas e relacionados
    await Promise.all([loadOffers(), loadRelated(data.categoria_id)]);
  }

  // renderiza galeria (thumbnails com scroll e clique)
  function renderGallery(imgs, title) {
    elGaleria.innerHTML = "";
    imgs.forEach((src, idx) => {
      const img = document.createElement("img");
      img.src = src || placeholder;
      img.alt = `${title} - foto ${idx + 1}`;
      img.tabIndex = 0;
      img.className = idx === 0 ? "active" : "";
      img.addEventListener("click", () => {
        setActiveThumb(img);
        elPrincipal.src = src || placeholder;
        // garantir foco suave no principal em mobile (opcional)
        elPrincipal.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      img.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          img.click();
        }
      });
      elGaleria.appendChild(img);
    });

    // deixar o container com scroll suave
    elGaleria.style.scrollBehavior = "smooth";
  }

  function setActiveThumb(selected) {
    const thumbs = elGaleria.querySelectorAll("img");
    thumbs.forEach((t) => t.classList.remove("active"));
    selected.classList.add("active");

    // se miniatura estiver parcialmente fora da viewport, ajustar scroll para centro-la
    const rect = selected.getBoundingClientRect();
    const parentRect = elGaleria.getBoundingClientRect();
    if (rect.left < parentRect.left || rect.right > parentRect.right) {
      const offset =
        rect.left - parentRect.left - (parentRect.width / 2 - rect.width / 2);
      elGaleria.scrollBy({ left: offset, behavior: "smooth" });
    }
  }

  // carregar ofertas
  async function loadOffers() {
    const { data } = await supa
      .from("offers")
      .select("valor")
      .eq("item_id", itemId)
      .order("valor", { ascending: false });

    elQtdOfertas.textContent = data?.length || 0;
    const maior = data?.[0]?.valor ?? 0;
    elMaiorOferta.textContent = priceFmt(maior);
  }

  // itens relacionados
  async function loadRelated(catId) {
    if (!catId) return;
    const { data } = await supa
      .from("items")
      .select("*")
      .eq("categoria_id", catId)
      .neq("id", itemId)
      .limit(6);

    elRelacionados.innerHTML = "";

    if (!data || data.length === 0) return;

    data.forEach((it) => {
      const col = document.createElement("div");
      col.className = "col-12 col-sm-6 col-md-4";

      const imgSrc =
        (Array.isArray(it.imagens) && it.imagens[0]) || placeholder;
      const precoTxt =
        it.tipo === "doacao"
          ? "<span class='texto-laranja'>Grátis</span>"
          : `<strong class="texto-laranja">${priceFmt(it.preco)}</strong>`;

      col.innerHTML = `
        <div class="card-relacionado">
          <img src="${imgSrc}" alt="${escapeHtml(
        it.titulo || "item relacionado"
      )}">
          <div class="p-3">
            <h5 class="mb-2" style="font-size:15px; font-weight:700;">${escapeHtml(
              it.titulo || ""
            )}</h5>
            <p class="text-muted small mb-2">${escapeHtml(
              it.localizacao || ""
            )}</p>
            ${precoTxt}
          </div>
        </div>
      `;

      col.addEventListener("click", () => {
        window.location.href = `item.html?id=${it.id}`;
      });

      elRelacionados.appendChild(col);
    });
  }

  // escape simples para prevenir injeção de HTML ao inserir strings
  function escapeHtml(str) {
    if (!str && str !== 0) return "";
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // inicializa
  await loadItem();

  // (opcional) vincular botão fazer oferta - aqui só exemplo visual
  const btnOferta = document.getElementById("btn-oferta");
  if (btnOferta) {
    btnOferta.addEventListener("click", () => {
      // abrir modal / navegação para login/checkout — você decide
      // por enquanto só efeito visual:
      btnOferta.disabled = true;
      btnOferta.style.opacity = "0.8";
      setTimeout(() => {
        btnOferta.disabled = false;
        btnOferta.style.opacity = "";
      }, 800);
    });
  }
});
