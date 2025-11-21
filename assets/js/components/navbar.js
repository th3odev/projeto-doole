// ===============================
// NAVBAR DO DOOLE (ATUALIZADO)
// ===============================

window.renderNavbar = async () => {
  const container = document.getElementById("navbar");
  if (!container) return;

  const { data } = await window.supabase.auth.getUser();
  const user = data?.user;

  container.innerHTML = user ? navbarLogged : navbarGuest;

  // logout
  if (user) {
    document
      .getElementById("logout-btn")
      ?.addEventListener("click", async () => {
        await window.supabase.auth.signOut();
        window.location.href = "../pages/auth.html";
      });

    // iniciar badge de notificação
    window.updateNotificationsBadge?.();
  }
};

// ===============================
// NAVBAR NÃO LOGADO
// ===============================
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

// ===============================
// NAVBAR LOGADO
// ===============================
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
          data-bs-toggle="dropdown" 
          >

        <div class="navbar-profile-wrapper">
          <img src="../assets/img/icons/user.svg" class="btn--profile__icon" />
          <span id="notifBadge" class="notif-badge hidden">0</span>
        </div>


        </button>

        <ul class="dropdown-menu dropdown-menu-end">

          <li>
            <a class="dropdown-item" href="../pages/notifications.html">
              Notificações 
              <span id="notifBadgeMenu" class="notif-badge-menu hidden">0</span>
            </a>
          </li>

          <li><a class="dropdown-item" href="../pages/profile.html">Perfil</a></li>

          <li><hr class="dropdown-divider"></li>

          <li><a class="dropdown-item text-danger" id="logout-btn">Sair</a></li>

        </ul>

      </div>
    </div>

  </div>
</nav>
`;

/* ===============================
   BADGE DE NOTIFICAÇÕES — ATUALIZAÇÃO
   =============================== */

window.updateNotificationsBadge = async () => {
  const supabase = window.supabase;

  const user = (await supabase.auth.getUser())?.data?.user;
  if (!user) return;

  const { success, count } =
    await window.notificationsService.getUnreadCountForUser(user.id);

  const badge = document.getElementById("notifBadge");
  const badgeMenu = document.getElementById("notifBadgeMenu");

  if (!badge || !badgeMenu) return;

  // Nenhuma notificação → esconder
  if (!success || !count || count === 0) {
    badge.classList.add("hidden");
    badgeMenu.classList.add("hidden");
    return;
  }

  // Mostrar número
  badge.textContent = count;
  badgeMenu.textContent = count;

  badge.classList.remove("hidden");
  badgeMenu.classList.remove("hidden");
};
