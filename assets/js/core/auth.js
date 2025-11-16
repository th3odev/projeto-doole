// assets/js/core/auth.js
// Usa window.supabase, porque supabaseClient.js não exporta nada

// Retorna usuário logado ou null
export const getCurrentUser = async () => {
  const { data } = await window.supabase.auth.getSession();
  return data?.session?.user || null;
};

// Login
export const signInUser = async (email, password) => {
  return await window.supabase.auth.signInWithPassword({
    email,
    password,
  });
};

// Cadastro
export const signUpUser = async (email, password) => {
  return await window.supabase.auth.signUp({
    email,
    password,
  });
};

// Logout
export const signOutUser = async () => {
  await window.supabase.auth.signOut();
};
