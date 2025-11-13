// offers.js
import { supabase, getCurrentUser } from "./supabaseClient.js";

async function submitOffer(event) {
  event.preventDefault();
  const btn = document.getElementById("btn-send-offer");
  setLoading(btn, true);

  try {
    const user = await getCurrentUser();
    if (!user)
      throw new Error("Você precisa estar logado para enviar ofertas.");

    const itemId = document.getElementById("offer-item-id").value;
    const valorRaw = document
      .getElementById("offer-value")
      .value.replace(/[^0-9,.-]/g, "")
      .replace(",", ".");
    const valor = parseFloat(valorRaw);
    if (!valor || valor <= 0) throw new Error("Valor inválido");

    // buscar maior oferta atual
    const { data: maxData, error: maxErr } = await supabase
      .from("offers")
      .select("valor")
      .eq("item_id", itemId)
      .order("valor", { ascending: false })
      .limit(1);

    if (maxErr) throw maxErr;
    const max = maxData?.[0]?.valor ?? 0;
    if (valor <= max) {
      throw new Error(
        `Ofertas devem ser maiores que a atual (${formatPrice(max)}).`
      );
    }

    const payload = {
      item_id: itemId,
      usuario_id: user.id,
      valor,
    };

    const { error } = await supabase.from("offers").insert(payload);
    if (error) throw error;

    showToast("Oferta enviada com sucesso", "success");
    // fechar modal e atualizar detalhe
    // $('#offerModal').modal('hide'); // se usar jQuery+Bootstrap
    window.location.reload();
  } catch (err) {
    console.error(err);
    showToast(err.message || "Erro ao enviar oferta", "danger");
  } finally {
    setLoading(btn, false);
  }
}

document.getElementById("form-offer").addEventListener("submit", submitOffer);
