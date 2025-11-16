import { getCurrentUser, signOutUser } from "../core/auth.js";

export const renderNavbar = async () => {
  const container = document.getElementById("navbar");
  if (!container) return;

  const user = await getCurrentUser();

  container.innerHTML = user ? navbarLogged : navbarGuest;

  if (user) {
    document
      .getElementById("logout-btn")
      ?.addEventListener("click", async () => {
        await signOutUser();
        window.location.href = "../pages/auth.html";
      });
  }
};

const navbarGuest = `
<nav class="navbar">
  <div class="navbar__container">

    <a href="../index.html" class="navbar__brand" aria-label="Página inicial">
      <img src="../assets/img/logo.png" class="navbar__logo" alt="Logo Doole">
    </a>

    <a href="../pages/auth.html" 
       class="btn btn--primary" 
       aria-label="Fazer login ou criar conta">
      Login / Cadastro
    </a>

  </div>
</nav>
`;

/* ============================================================
   NAVBAR — USUÁRIO LOGADO
   ACESSIBILIDADE 100%
   ============================================================ */
const navbarLogged = `
<nav class="navbar">
  <div class="navbar__container">

    <a href="../index.html" class="navbar__brand" aria-label="Página inicial">
      <img src="../assets/img/logo.png" class="navbar__logo" alt="Logo Doole">
    </a>

    <div class="navbar__actions">

      <a href="../pages/new-item.html" 
         class="btn btn--primary" 
         aria-label="Adicionar novo item">
        + Adicionar Item
      </a>

      <div class="dropdown">
        <button 
          class="btn btn--profile dropdown-toggle" 
          type="button" 
          data-bs-toggle="dropdown"
          aria-label="Abrir menu do usuário"
        >
          <img src="../assets/img/icons/user.svg" 
               class="btn--profile__icon" 
               alt="">
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
