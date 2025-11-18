window.renderNavbar = async () => {
  const container = document.getElementById("navbar");
  if (!container) return;

  // Obtém usuário do supabase
  const { data } = await window.supabase.auth.getUser();
  const user = data?.user;

  container.innerHTML = user ? navbarLogged : navbarGuest;

  // evento de logout
  if (user) {
    document
      .getElementById("logout-btn")
      ?.addEventListener("click", async () => {
        await window.supabase.auth.signOut();
        window.location.href = "../pages/auth.html";
      });
  }
};

const navbarGuest = `
<nav class="navbar">
  <div class="navbar__container">
    <a href="../index.html" class="navbar__brand">
      <img src="../assets/img/logo.png" class="navbar__logo">
    </a>

    <a href="../pages/auth.html" class="btn btn--primary">
      Login / Cadastro
    </a>
  </div>
</nav>
`;

const navbarLogged = `
<nav class="navbar">
  <div class="navbar__container">

    <a href="../index.html" class="navbar__brand">
      <img src="../assets/img/logo.png" class="navbar__logo">
    </a>

    <div class="navbar__actions">
      <a href="../pages/new-item.html" class="btn btn--primary">
        + Adicionar Item
      </a>

      <div class="dropdown">
        <button 
          class="btn btn--profile dropdown-toggle" 
          type="button" 
          data-bs-toggle="dropdown">
          <img src="../assets/img/icons/user.svg" class="btn--profile__icon">
        </button>

        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="../pages/profile.html">Perfil</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" id="logout-btn">Sair</a></li>
        </ul>
      </div>
    </div>

  </div>
</nav>
`;
