// document.addEventListener("DOMContentLoaded", async () => {
//   const supabase = window.supabase;

//   const user = (await supabase.auth.getUser())?.data?.user;
//   if (!user) return (window.location.href = "./auth.html");

//   const params = new URLSearchParams(window.location.search);
//   const itemId = params.get("id");

//   const listEl = document.getElementById("offersList");

//   if (!itemId) {
//     listEl.innerHTML = "<p>Item inválido.</p>";
//     return;
//   }

//   // carregar lances do item
//   const { data, error } = await supabase
//     .from("offers")
//     .select("*, users:usuario_id(nome)")
//     .eq("item_id", itemId)
//     .order("valor", { ascending: false });

//   if (error) {
//     listEl.innerHTML = "<p>Erro ao carregar lances.</p>";
//     return;
//   }

//   if (!data.length) {
//     listEl.innerHTML = "<p>Nenhum lance recebido ainda.</p>";
//     return;
//   }

//   listEl.innerHTML = "";

//   data.forEach((of) => {
//     const retiradaTxt =
//       of.retirada_valor > 0
//         ? `Cobrou retirada: R$${of.retirada_valor.toFixed(2)}`
//         : "Não cobra retirada";

//     listEl.innerHTML += `
//       <div class="offer-card">
//         <h4>${of.users?.nome || "Usuário"}</h4>
//         <p>Lance: <strong>R$${of.valor.toFixed(2)}</strong></p>
//         <p>${retiradaTxt}</p>
//         <p class="small">Data: ${new Date(of.criado_em).toLocaleString()}</p>
//       </div>
//     `;
//   });
// });
