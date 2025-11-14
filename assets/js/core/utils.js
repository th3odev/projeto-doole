// Formatação de preço
export const formatPrice = (value) => {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value || 0));
  } catch (e) {
    return `R$ ${value || "0,00"}`;
  }
};

// Escape HTML (segurança)
export const escapeHtml = (str) => {
  if (!str && str !== 0) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Debounce para search
export const debounce = (fn, ms) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), ms);
  };
};

// Loading states
export const setLoading = (
  element,
  isLoading,
  loadingText = "Carregando..."
) => {
  if (isLoading) {
    element.setAttribute("data-original-text", element.innerHTML);
    element.disabled = true;
    element.innerHTML = `<span class="spinner-border spinner-border-sm"></span> ${loadingText}`;
  } else {
    element.disabled = false;
    element.innerHTML =
      element.getAttribute("data-original-text") || element.textContent;
  }
};
