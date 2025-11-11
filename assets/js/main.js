// main.js - controle global da navbar e estado de login

document.addEventListener("DOMContentLoaded", () => {
  const navbarContainer = document.getElementById("navbar");
  if (!navbarContainer) return;

  // estado de login (simulado)
  const usuarioLogado = true;

  // retorna HTML da navbar para usuário não logado
  const renderNavbarDeslogado = () => `
    <nav class="navbar navbar-expand-lg bg-white border-bottom py-3">
      <div class="container d-flex justify-content-between align-items-center">
        <a href="index.html" class="navbar-brand">
          <img src="assets/img/logo.svg" alt="Doole" height="28" />
        </a>
        <a href="pages/auth.html" class="link-botao">Login/Cadastro</a>
      </div>
    </nav>
  `;

  // retorna HTML da navbar para usuário logado
  const renderNavbarLogado = () => `
    <nav class="navbar navbar-expand-lg bg-white border-bottom py-3">
      <div class="container d-flex justify-content-between align-items-center">
        <a href="index.html" class="navbar-brand">
          <img src="assets/img/logo.png" alt="Doole" height="28" />
        </a>
        <div class="d-flex align-items-center gap-3">
          <a href="pages/new-item.html" class="link-botao">+ Adicionar Item</a>
          <div class="dropdown">
            <button
              class="perfil-btn dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img src="assets/img/icons/user.svg" alt="Perfil" class="icon-perfil" />
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="pages/profile.html">Perfil</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-danger" href="#">Sair</a></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  `;

  // renderiza a navbar correta
  navbarContainer.innerHTML = usuarioLogado
    ? renderNavbarLogado()
    : renderNavbarDeslogado();
});
