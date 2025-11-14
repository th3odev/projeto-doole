// assets/js/pages/auth.js - VERSÃO FUNCIONAL

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const toggleAuth = document.getElementById("toggle-auth");
  const title = document.getElementById("form-title");
  const subtitle = document.getElementById("form-subtitle");

  let showingLogin = true;

  console.log("✅ Auth.js carregado - elementos:", {
    loginForm: !!loginForm,
    registerForm: !!registerForm,
    toggleAuth: !!toggleAuth,
  });

  toggleAuth.addEventListener("click", (e) => {
    e.preventDefault();
    showingLogin = !showingLogin;
    console.log("🔄 Toggle clicked, agora showingLogin:", showingLogin);

    if (showingLogin) {
      // Mostrar login, esconder cadastro
      registerForm.classList.add("d-none");
      loginForm.classList.remove("d-none");
      title.textContent = "Bem-vindo de volta";
      subtitle.textContent = "Entre com suas credenciais para continuar";
      toggleAuth.innerHTML = `Não tem uma conta? <a href="#">Cadastre-se</a>`;
    } else {
      // Mostrar cadastro, esconder login
      loginForm.classList.add("d-none");
      registerForm.classList.remove("d-none");
      title.textContent = "Cadastre-se";
      subtitle.textContent = "Preencha os dados para criar sua conta";
      toggleAuth.innerHTML = `Já tem uma conta? <a href="#">Entrar</a>`;
    }
  });

  // Login
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
    } else {
      console.log("✅ Login bem-sucedido");
      window.location.href = "profile.html";
    }
  });

  // Cadastro
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nomeCompleto = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value;
    const senha = document.getElementById("register-password").value;
    const confirmar = document.getElementById("register-confirm").value;

    console.log("📝 Tentando cadastro:", email);

    if (senha !== confirmar) {
      alert("As senhas não coincidem!");
      return;
    }

    const { data, error } = await window.supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome: nomeCompleto },
      },
    });

    if (error) {
      alert("Erro ao cadastrar: " + error.message);
      console.error("❌ Erro cadastro:", error);
      return;
    }

    if (data?.user) {
      // Criar perfil do usuário
      await window.supabase
        .from("profiles")
        .insert([{ id: data.user.id, nome: nomeCompleto, email }]);

      console.log("✅ Usuário cadastrado:", data.user.id);
    }

    alert("Conta criada com sucesso! Faça login para continuar.");

    // Voltar para o formulário de login
    registerForm.classList.add("d-none");
    loginForm.classList.remove("d-none");
    title.textContent = "Bem-vindo de volta";
    subtitle.textContent = "Entre com suas credenciais para continuar";
    toggleAuth.innerHTML = `Não tem uma conta? <a href="#">Cadastre-se</a>`;
    showingLogin = true;
  });
});
