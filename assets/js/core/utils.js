// ======================================================
//  DOOLE • UTILITÁRIOS SENIOR (versão final otimizada)
//  Enxuto, seguro e sem redundâncias
// ======================================================

// ------------------------------
//  FORMATADOR DE PREÇO
// ------------------------------
export const formatPrice = (value) => {
  const num = Number(value);
  if (isNaN(num)) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
};

// ------------------------------
//  ESCAPE HTML (anti-XSS)
// ------------------------------
export const escapeHtml = (str) => {
  if (str === null || str === undefined) return "";
  return String(str).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return map[char];
  });
};

// ------------------------------
//  DEBOUNCE
// ------------------------------
export const debounce = (fn, delay = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

// ------------------------------
//  BOTÃO LOADING (UI PRO)
// ------------------------------
export const setLoading = (el, active, text = "Carregando...") => {
  if (!el) return;

  if (active) {
    if (!el.dataset.originalText) {
      el.dataset.originalText = el.innerHTML.trim();
    }
    el.disabled = true;
    el.innerHTML = `
      <span class="spinner-border spinner-border-sm"></span>
      ${text}
    `;
  } else {
    el.disabled = false;
    el.innerHTML = el.dataset.originalText || el.textContent;
    el.removeAttribute("data-original-text");
  }
};

// ------------------------------
//  WAIT (promise delay)
// ------------------------------
export const wait = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ------------------------------
//  STRING VAZIA?
// ------------------------------
export const isEmpty = (value) =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && value.trim() === "");

// ------------------------------
//  UID GERADOR
// ------------------------------
export const uid = (prefix = "id") =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

// ------------------------------
//  FORMATADOR BRL (valor em centavos)
// ------------------------------
export const formatBRL = (value) => {
  if (!value) return "";
  const v = Number(value) / 100;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};
