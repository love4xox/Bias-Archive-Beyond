// public/js/theme.js
const THEME_KEY = "bias_archive_theme";

export function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(savedTheme);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const nextTheme = current === "light" ? "dark" : "light";
  applyTheme(nextTheme);
  localStorage.setItem(THEME_KEY, nextTheme);
  return nextTheme;
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("theme-toggle-btn");
  if (btn) {
    btn.innerHTML = theme === "dark" ? "🌙 DARK EDITION" : "☀️ LIGHT EDITION";
  }
}