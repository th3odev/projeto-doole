// ===============================
// MODAL DE OFERTA — DOOLE
// ===============================

export function initOfferModal(
  supabase,
  itemId,
  maiorOfertaAtual,
  donoItemId,
  tipoItem
) {
  const modal = document.getElementById("modal-oferta");
  const overlay = document.getElementById("modal-overlay");
  const closeBtn = document.getElementById("modal-close");

  const selectRet = document.getElementById("select-retirada");
  const inputRetirada = document.getElementById("valor-retirada");
  const fieldOferta = document
    .querySelector("#valor-oferta")
    .closest(".doole-field");
  const inputOferta = document.getElementById("valor-oferta");
  const lanceMin = document.getElementById("lance-minimo");
  const btnEnviar = document.getElementById("btn-enviar-oferta");

  // === SE ITEM FOR DOAÇÃO → esconder campos ===
  if (tipoItem === "doacao") {
    fieldOferta.classList.add("hidden");
    lanceMin.parentElement.classList.add("hidden");
  } else {
    lanceMin.textContent = `R$${String(maiorOfertaAtual).replace(".", ",")}`;
  }

  function open() {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function close() {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }

  overlay.addEventListener("click", close);
  closeBtn.addEventListener("click", close);

  // exibir campo retirada
  selectRet.addEventListener("change", () => {
    if (selectRet.value === "sim") {
      inputRetirada.classList.remove("hidden");
    } else {
      inputRetirada.classList.add("hidden");
      inputRetirada.value = "";
    }
  });

  // formatação BRL
  function formatBRL(v) {
    v = v.replace(/\D/g, "");
    if (!v) return "";
    return "R$" + (Number(v) / 100).toFixed(2).replace(".", ",");
  }

  function getNumber(v) {
    return Number(v.replace(/\D/g, "")) / 100 || 0;
  }

  inputOferta.addEventListener("input", () => {
    inputOferta.value = formatBRL(inputOferta.value);
  });

  inputRetirada.addEventListener("input", () => {
    inputRetirada.value = formatBRL(inputRetirada.value);
  });

  btnEnviar.addEventListener("click", async () => {
    const user = (await supabase.auth.getUser())?.data?.user;
    if (!user) return alert("Você precisa estar logado.");

    if (user.id === donoItemId)
      return alert("Você não pode fazer oferta no seu próprio item.");

    const valorOferta =
      tipoItem === "doacao" ? 0 : getNumber(inputOferta.value);
    const valorRet = getNumber(inputRetirada.value);

    if (tipoItem !== "doacao" && valorOferta < maiorOfertaAtual)
      return alert(`O lance mínimo é R$${maiorOfertaAtual}`);

    const { error } = await supabase.from("offers").insert({
      item_id: itemId,
      usuario_id: user.id,
      dono_item_id: donoItemId,
      valor: valorOferta,
      retirada_valor: selectRet.value === "sim" ? valorRet : 0,
    });

    if (error) {
      console.error(error);
      return alert("Erro ao enviar oferta.");
    }

    alert("Oferta enviada com sucesso!");
    close();
    window.location.reload();
  });

  return { open, close };
}
