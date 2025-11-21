// ======================================================
// NEW ITEM PAGE — FINAL SÊNIOOOOR COM REMOVE FOTO (X)
// ======================================================

import { setLoading, escapeHtml, wait, isEmpty } from "../core/utils.js";
import { requireAuth } from "../core/authguard.js";
import { getCurrentUser } from "../core/auth.js";

// ------------------------------------------------------
//  BLOQUEAR ACESSO
// ------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  await requireAuth();
  await loadCategorias();
});

// DOM
const form = document.getElementById("new-item-form");

const inputTitulo = document.getElementById("titulo");
const inputDescricao = document.getElementById("descricao");
const inputCategoria = document.getElementById("categoria");
const inputCidade = document.getElementById("cidade");
const inputUf = document.getElementById("uf");
const inputTipo = document.getElementById("tipo");
const inputPreco = document.getElementById("preco");
const inputImages = document.getElementById("item-images");
const previewContainer = document.getElementById("preview-container");

const MAX_IMAGES = 6;
const MAX_SIZE_MB = 5;

let selectedFiles = []; // lista final

// Controle de exibição do preço
inputTipo.addEventListener("change", () => {
  if (inputTipo.value === "doacao") {
    inputPreco.parentElement.style.display = "none";
    inputPreco.value = "";
  } else {
    inputPreco.parentElement.style.display = "block";
  }
});

// Iniciar estado correto
if (inputTipo.value === "doacao") {
  inputPreco.parentElement.style.display = "none";
}

// Formatar valor para R$ automaticamente
inputPreco.addEventListener("input", () => {
  let value = inputPreco.value;

  // remove tudo que NÃO for número
  value = value.replace(/\D/g, "");

  // evita crash digitando tudo apagado
  if (value === "") {
    inputPreco.value = "";
    return;
  }

  // transforma em centavos
  value = (Number(value) / 100).toFixed(2);

  // formata em BRL
  inputPreco.value = Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
});

// Função para converter para número limpo na hora de salvar
function getPrecoNumber() {
  if (!inputPreco.value) return 0;

  return Number(
    inputPreco.value
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
  );
}

// ------------------------------------------------------
// CARREGAR CATEGORIAS (tabela correta!!)
// ------------------------------------------------------
async function loadCategorias() {
  try {
    const { data, error } = await window.supabase
      .from("categories") // <<< AQUI O NOME CERTO
      .select("*");

    if (error) throw error;

    inputCategoria.innerHTML =
      `<option value="">Selecione</option>` +
      data
        .map(
          (cat) => `<option value="${cat.id}">${escapeHtml(cat.nome)}</option>`
        )
        .join("");
  } catch (err) {
    console.error("Erro ao carregar categorias:", err);
    inputCategoria.innerHTML = `<option value="">Erro ao carregar</option>`;
  }
}

// ------------------------------------------------------
// LISTENER DE UPLOAD
// ------------------------------------------------------
inputImages.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);

  if (selectedFiles.length + files.length > MAX_IMAGES) {
    alert(`Máximo de ${MAX_IMAGES} imagens.`);
    return;
  }

  for (const file of files) {
    if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
      alert(`A imagem ${file.name} excede 5MB.`);
      return;
    }
  }

  selectedFiles.push(...files);
  inputImages.value = ""; // PERMITE reenviar a mesma foto
  renderPreview();
});

// ------------------------------------------------------
// RENDER PREVIEW (SEM DUPLICAR EVENTOS)
// ------------------------------------------------------
function renderPreview() {
  previewContainer.innerHTML = "";

  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const item = document.createElement("div");
      item.classList.add("upload__preview-item");

      item.innerHTML = `
        <img src="${e.target.result}" class="upload__preview-image" />
        <button class="upload__remove-btn" data-index="${index}">×</button>
      `;

      previewContainer.appendChild(item);
    };

    reader.readAsDataURL(file);
  });
}

// ------------------------------------------------------
// EVENTO GLOBAL PARA REMOVER IMAGENS
// ------------------------------------------------------
previewContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("upload__remove-btn")) {
    const index = e.target.dataset.index;
    selectedFiles.splice(index, 1);
    renderPreview();
  }
});

// ------------------------------------------------------
// SUBMIT DO FORM
// ------------------------------------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = form.querySelector("button[type='submit']");
  setLoading(submitBtn, true, "Salvando...");

  try {
    if (isEmpty(inputTitulo.value)) throw "Preencha o título";
    if (isEmpty(inputDescricao.value)) throw "Preencha a descrição";
    if (!inputCategoria.value) throw "Selecione uma categoria";
    if (isEmpty(inputCidade.value)) throw "Informe a cidade";
    if (!inputUf.value) throw "Informe a UF";

    if (inputTipo.value === "venda" && isEmpty(inputPreco.value)) {
      throw "Informe o valor";
    }

    const imagens = await uploadImages();
    const user = await getCurrentUser();

    const novoItem = {
      titulo: inputTitulo.value.trim(),
      descricao: inputDescricao.value.trim(),
      categoria_id: inputCategoria.value,
      localizacao: `${inputCidade.value} - ${inputUf.value}`,
      tipo: inputTipo.value,
      preco: inputTipo.value === "venda" ? getPrecoNumber() : 0,
      imagens,
      usuario_id: user.id,
      criado_em: new Date(),
    };

    const { data, error } = await window.supabase
      .from("items")
      .insert(novoItem)
      .select();

    if (error) throw error;

    await wait(600);
    alert("Item criado com sucesso!");
    window.location.href = `item-detail.html?id=${data[0].id}`;
  } catch (err) {
    alert(err.message || err);
  } finally {
    setLoading(submitBtn, false);
  }
});

// ------------------------------------------------------
// UPLOAD IMAGENS FINAL
// ------------------------------------------------------
async function uploadImages() {
  if (selectedFiles.length === 0) return [];

  const uploaded = [];

  for (const file of selectedFiles) {
    const filePath = `items/${Date.now()}-${file.name}`;

    const { error } = await window.supabase.storage
      .from("public-images")
      .upload(filePath, file);

    if (error) throw error;

    const { data: urlData } = window.supabase.storage
      .from("public-images")
      .getPublicUrl(filePath);

    uploaded.push(urlData.publicUrl);
  }

  return uploaded;
}
