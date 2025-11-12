document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const toggleAuth = document.getElementById("toggle-auth");
  const title = document.getElementById("form-title");
  const subtitle = document.getElementById("form-subtitle");

  let showingLogin = true;

  toggleAuth.addEventListener("click", (e) => {
    e.preventDefault();
    showingLogin = !showingLogin;

    if (showingLogin) {
      registerForm.classList.add("d-none");
      loginForm.classList.remove("d-none");
      title.textContent = "Bem-vindo de volta";
      subtitle.textContent = "Entre com suas credenciais para continuar";
      toggleAuth.innerHTML = `Não tem uma conta? <a href="#">Cadastre-se</a>`;
    } else {
      loginForm.classList.add("d-none");
      registerForm.classList.remove("d-none");
      title.textContent = "Cadastre-se";
      subtitle.textContent = "Preencha os dados para criar sua conta";
      toggleAuth.innerHTML = `Já tem uma conta? <a href="#">Entrar</a>`;
    }
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const senha = document.getElementById("login-password").value;

    const { error } = await window.supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert("Erro ao fazer login: " + error.message);
    } else {
      window.location.href = "profile.html";
    }
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nomeCompleto = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value;
    const senha = document.getElementById("register-password").value;
    const confirmar = document.getElementById("register-confirm").value;

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
      return;
    }

    if (data?.user) {
      await window.supabase
        .from("profiles")
        .insert([{ id: data.user.id, nome: nomeCompleto, email }]);
    }

    alert("Conta criada com sucesso! Faça login para continuar.");
    registerForm.classList.add("d-none");
    loginForm.classList.remove("d-none");
    title.textContent = "Bem-vindo de volta";
    subtitle.textContent = "Entre com suas credenciais para continuar";
    toggleAuth.innerHTML = `Não tem uma conta? <a href="#">Cadastre-se</a>`;
  });
});
