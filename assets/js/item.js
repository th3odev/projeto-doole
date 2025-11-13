// item.js
import { supabase, getCurrentUser } from "./supabaseClient.js";

function getIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function fetchItemById(id) {
  const { data, error } = await supabase
    .from("items")
    .select("*, categorias:categoria_id (id, nome)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

async function fetchHighestOffer(itemId) {
  const { data, error } = await supabase
    .from("offers")
    .select("valor")
    .eq("item_id", itemId)
    .order("valor", { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0]?.valor ?? null;
}

async function fetchRelatedItems(categoryId, excludeId) {
  const { data } = await supabase
    .from("items")
    .select("id, titulo, imagens, preco, tipo")
    .eq("categoria_id", categoryId)
    .neq("id", excludeId)
    .limit(4);
  return data || [];
}

async function initItemPage() {
  try {
    const id = getIdFromQuery();
    const item = await fetchItemById(id);
    if (!item) return showToast("Item não encontrado", "warning");

    // render básico
    document.getElementById("item-title").textContent = item.titulo;
    document.getElementById("item-desc").textContent = item.descricao;
    document.getElementById("item-price").textContent = item.preco
      ? formatPrice(item.preco)
      : item.tipo === "doacao"
      ? "Doação"
      : "—";

    // galeria
    const gallery = document.getElementById("item-gallery");
    gallery.innerHTML = (item.imagens || [])
      .map((url) => `<img src="${url}" class="img-fluid mb-2" alt="">`)
      .join("");

    // maior oferta
    const highest = await fetchHighestOffer(id);
    document.getElementById("item-highest-offer").textContent = highest
      ? formatPrice(highest)
      : "Nenhuma oferta ainda";

    // botão oferta
    if (item.tipo === "venda") {
      document.getElementById("btn-open-offer").style.display = "inline-block";
      // armazenar item id para modal
      document.getElementById("offer-item-id").value = id;
    } else {
      document.getElementById("btn-open-offer").style.display = "none";
    }

    // itens relacionados
    const related = await fetchRelatedItems(item.categoria_id, id);
    const relatedEl = document.getElementById("related-items");
    relatedEl.innerHTML = related
      .map(
        (r) =>
          `<a href="/item.html?id=${r.id}" class="d-block mb-2">${escapeHtml(
            r.titulo
          )}</a>`
      )
      .join("");
  } catch (err) {
    console.error(err);
    showToast("Erro ao carregar item", "danger");
  }
}

initItemPage();
