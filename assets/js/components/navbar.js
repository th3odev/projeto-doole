import { getCurrentUser, signOutUser } from "../core/auth.js";

export const renderNavbar = async () => {
  const navbarContainer = document.getElementById("navbar");
  if (!navbarContainer) return;

  try {
    const user = await getCurrentUser();

    const navbarHTML = user ? renderLoggedInNavbar() : renderLoggedOutNavbar();
    navbarContainer.innerHTML = navbarHTML;

    if (user) {
      setupLogout();
    }
  } catch (error) {
    console.error("Erro ao renderizar navbar:", error);
    navbarContainer.innerHTML = renderLoggedOutNavbar();
  }
};

const renderLoggedOutNavbar = () => `
  <nav class="navbar">
    <div class="navbar__container">
      <a href="../index.html" class="navbar__brand">
        <img src="../assets/img/logo.png" alt="Doole" class="navbar__logo">
      </a>
      <a href="../pages/auth.html" class="btn btn--primary">Login / Cadastro</a>
    </div>
  </nav>
`;

const renderLoggedInNavbar = () => `
  <nav class="navbar">
    <div class="navbar__container">
      <a href="../index.html" class="navbar__brand">
        <img src="../assets/img/logo.png" alt="Doole" class="navbar__logo">
      </a>

      <div class="navbar__actions">
        <a href="../pages/new-item.html" class="btn btn--primary">+ Adicionar Item</a>

        <div class="dropdown">
          <button class="btn btn--profile dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <img src="../assets/img/icons/user.svg" alt="Perfil" class="btn--profile__icon">
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="../pages/profile.html">Perfil</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#" id="logout-btn">Sair</a></li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
`;

const setupLogout = () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await signOutUser();
    });
  }
};
