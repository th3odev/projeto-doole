// profile.js
import { supabase, getCurrentUser } from "./supabaseClient.js";

async function loadProfile() {
  const user = await getCurrentUser();
  if (!user) return (window.location.href = "/auth.html");

  document.getElementById("profile-name").textContent =
    user.user_metadata?.nome || user.email;

  // meus produtos
  const { data: myItems } = await supabase
    .from("items")
    .select("*")
    .eq("usuario_id", user.id)
    .order("criado_em", { ascending: false });
  document.getElementById("my-items-list").innerHTML = myItems
    .map(
      (i) =>
        `<li><a href="/item.html?id=${i.id}">${escapeHtml(i.titulo)}</a></li>`
    )
    .join("");

  // minhas ofertas
  const { data: myOffers } = await supabase
    .from("offers")
    .select("id, valor, criado_em, items (id, titulo)")
    .eq("usuario_id", user.id)
    .order("criado_em", { ascending: false });
  document.getElementById("my-offers-list").innerHTML = myOffers
    .map(
      (o) =>
        `<li>${formatPrice(o.valor)} — <a href="/item.html?id=${
          o.items.id
        }">${escapeHtml(o.items.titulo)}</a></li>`
    )
    .join("");
}

loadProfile();
