export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await window.supabase.auth.getUser();
  return user;
};

export const checkAuth = async (redirectTo = "/pages/auth.html") => {
  const user = await getCurrentUser();
  if (!user && redirectTo) {
    window.location.href = redirectTo;
    return null;
  }
  return user;
};

export const signOutUser = async () => {
  await window.supabase.auth.signOut();
  window.location.href = "/pages/auth.html";
};
