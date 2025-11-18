// assets/js/pages/auth-page.js — VERSÃO SÊNIOR

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const toggleAuth = document.getElementById("toggle-auth");
  const title = document.getElementById("form-title");
  const subtitle = document.getElementById("form-subtitle");

  let showingLogin = true;

  console.log("✅ Auth.js carregado com sucesso.");

  // --------------------------------------------------
  // 🔄 TROCAR LOGIN <-> CADASTRO
  // --------------------------------------------------
  const renderToggleLink = () => {
    if (showingLogin) {
      toggleAuth.innerHTML = `
        Não tem uma conta? 
        <a href="#" class="auth-page__footer-link">Cadastre-se</a>
      `;
    } else {
      toggleAuth.innerHTML = `
        Já tem uma conta? 
        <a href="#" class="auth-page__footer-link">Entrar</a>
      `;
    }
  };

  const switchForms = () => {
    showingLogin = !showingLogin;

    if (showingLogin) {
      // Mostrar LOGIN
      registerForm.classList.add("d-none");
      loginForm.classList.remove("d-none");
      title.textContent = "Bem-vindo de volta";
      subtitle.textContent = "Entre com suas credenciais para continuar";
    } else {
      // Mostrar CADASTRO
      loginForm.classList.add("d-none");
      registerForm.classList.remove("d-none");
      title.textContent = "Cadastre-se";
      subtitle.textContent = "Preencha os dados para criar sua conta";
    }

    renderToggleLink(); // sempre reaplica a classe correta
  };

  toggleAuth.addEventListener("click", (e) => {
    e.preventDefault();
    switchForms();
  });

  // Render inicial (garante classe do link)
  renderToggleLink();

  // --------------------------------------------------
  // 🔐 LOGIN
  // --------------------------------------------------
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const senha = document.getElementById("login-password").value;

    console.log("🔐 Tentando login:", email);

    const { error } = await window.supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert("Erro ao fazer login: " + error.message);
      console.error("❌ Erro login:", error);
      return;
    }

    console.log("✅ Login bem-sucedido");
    window.location.href = "profile.html";
  });

  // --------------------------------------------------
  // 📝 CADASTRO
  // --------------------------------------------------
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value;
    const senha = document.getElementById("register-password").value;
    const confirmar = document.getElementById("register-confirm").value;

    if (senha !== confirmar) {
      alert("As senhas não coincidem!");
      return;
    }

    console.log("📝 Tentando cadastro:", email);

    const { data, error } = await window.supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    });

    if (error) {
      alert("Erro ao cadastrar: " + error.message);
      console.error("❌ Erro cadastro:", error);
      return;
    }

    if (data?.user) {
      await window.supabase
        .from("profiles")
        .insert([{ id: data.user.id, nome, email }]);

      console.log("✅ Perfil criado:", data.user.id);
    }

    alert("Conta criada com sucesso! Faça login para continuar.");

    // Voltar ao login
    showingLogin = true;
    switchForms();
  });
});
