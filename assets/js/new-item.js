document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("new-item-form");
  const categoriaSelect = document.getElementById("categoria");
  const tipoSelect = document.getElementById("tipo");
  const precoInput = document.getElementById("preco");
  const uploadLabel = document.getElementById("upload-label");
  const fileInput = document.getElementById("item-images");
  const previewContainer = document.getElementById("preview-container");

  // =============================
  // 1️⃣ Verifica login
  // =============================
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    alert("Você precisa estar logado para acessar esta página!");
    window.location.href = "./auth.html";
    return;
  }

  // =============================
  // 2️⃣ Carrega categorias
  // =============================
  async function carregarCategorias() {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) {
      console.error("Erro ao carregar categorias:", error.message);
      return;
    }

    data.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.nome;
      categoriaSelect.appendChild(option);
    });
  }
  carregarCategorias();

  // =============================
  // 3️⃣ Preview imagens
  // =============================
  fileInput.addEventListener("change", () => {
    previewContainer.innerHTML = "";
    const files = fileInput.files;

    for (const file of files) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.style.width = "90px";
        img.style.height = "90px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "8px";
        img.style.border = "1px solid #ddd";
        previewContainer.appendChild(img);
      };

      reader.readAsDataURL(file);
    }
  });

  // =============================
  // 4️⃣ Drag & Drop
  // =============================
  uploadLabel.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadLabel.style.borderColor = "var(--cor-principal-1)";
  });

  uploadLabel.addEventListener("dragleave", () => {
    uploadLabel.style.borderColor = "#d9d9d9";
  });

  uploadLabel.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadLabel.style.borderColor = "#d9d9d9";

    const files = e.dataTransfer.files;
    fileInput.files = files;

    fileInput.dispatchEvent(new Event("change"));
  });

  // =============================
  // 5️⃣ Atualiza campo de preço
  // =============================
  function atualizarCampoValor() {
    if (tipoSelect.value === "doacao") {
      precoInput.disabled = true;
      precoInput.value = "Doação";
    } else {
      precoInput.disabled = false;
      precoInput.value = "R$ 0,00";
    }
  }

  tipoSelect.addEventListener("change", atualizarCampoValor);
  atualizarCampoValor(); // <<< ESSA LINHA FAZ O QUE VOCÊ PEDIU!

  // =============================
  // 6️⃣ Formatar valor (pt-BR)
  // =============================
  precoInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value) {
      value = (parseInt(value) / 100).toFixed(2);
      e.target.value = `R$ ${value
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
    } else {
      e.target.value = "R$ 0,00";
    }
  });

  // =============================
  // 7️⃣ Submissão
  // =============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();
    const descricao = document.getElementById("descricao").value.trim();

    const tipo = tipoSelect.value;

    const precoRaw = precoInput.value.replace(/[^\d,]/g, "").replace(",", ".");
    const preco = tipo === "doacao" ? 0 : parseFloat(precoRaw) || 0;

    const categoria_id = parseInt(categoriaSelect.value);

    const cidade = document.getElementById("cidade").value.trim();
    const uf = document.getElementById("uf").value.trim();

    const imagens = fileInput.files;

    if (!titulo || !descricao || !categoria_id || !cidade) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      alert("Você precisa estar logado para adicionar um item!");
      return;
    }

    // =============================
    // Upload Storage
    // =============================
    let imagensUrls = [];

    for (let i = 0; i < imagens.length; i++) {
      const file = imagens[i];
      const filePath = `${user.id}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("public-images")
        .upload(filePath, file);

      if (uploadError) {
        console.error(uploadError.message);
        alert("Erro ao enviar imagem!");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("public-images")
        .getPublicUrl(filePath);

      imagensUrls.push(urlData.publicUrl);
    }

    // =============================
    // Inserir item
    // =============================
    const { error: insertError } = await supabase.from("items").insert([
      {
        titulo,
        descricao,
        tipo,
        preco,
        categoria_id,
        usuario_id: user.id,
        imagens: imagensUrls,

        // armazenamos junto mas separado internamente
        localizacao: `${cidade} - ${uf}`,
        cidade,
        uf,
      },
    ]);

    if (insertError) {
      alert("Erro ao adicionar item!");
      return;
    }

    alert("✅ Item adicionado com sucesso!");
    window.location.href = "items.html";
  });
});
