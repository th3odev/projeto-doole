document.addEventListener("DOMContentLoaded", async () => {
  const navbarContainer = document.getElementById("navbar");
  if (!navbarContainer) return;

  try {
    // Verifica sessão atual do usuário
    const { data, error } = await supabase.auth.getSession();
    const session = data?.session;

    // Navbar para usuário deslogado
    const navbarDeslogado = `
      <nav class="navbar navbar-expand-lg bg-white border-bottom py-3">
        <div class="container d-flex justify-content-between align-items-center">
          <a href="index.html" class="navbar-brand">
            <img src="assets/img/logo.png" alt="Doole" height="40">
          </a>
          <a href="pages/auth.html" class="link-botao">Login / Cadastro</a>
        </div>
      </nav>
    `;

    // Navbar para usuário logado
    const navbarLogado = `
      <nav class="navbar navbar-expand-lg bg-white border-bottom py-3">
        <div class="container d-flex justify-content-between align-items-center">
          <a href="index.html" class="navbar-brand">
            <img src="assets/img/logo.png" alt="Doole" height="40">
          </a>

          <div class="d-flex align-items-center gap-3">
            <a href="pages/new-item.html" class="link-botao">+ Adicionar Item</a>

            <div class="dropdown">
              <button class="perfil-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="assets/img/icons/user.svg" alt="Perfil" class="icon-perfil">
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="pages/profile.html">Perfil</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" href="#" id="logout-btn">Sair</a></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    `;

    // Renderiza navbar conforme o estado do login
    navbarContainer.innerHTML = session ? navbarLogado : navbarDeslogado;

    // Logout (se logado)
    if (session) {
      const logoutBtn = document.getElementById("logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
          await supabase.auth.signOut();
          window.location.href = "pages/auth.html";
        });
      }
    }
  } catch (err) {
    console.error("Erro ao carregar navbar:", err.message);
  }
});
