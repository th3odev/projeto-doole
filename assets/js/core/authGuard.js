import { getCurrentUser } from "./auth.js";

export const requireAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "../pages/auth.html";
  }
};
