// public/js/nav.js
console.log("[nav] script loaded");

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");
  console.log("[nav] DOM ready", { hasToggle: !!toggle, hasNav: !!nav });

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    console.log("[nav] clicked → open:", isOpen, {
      classList: nav.className,
      display: getComputedStyle(nav).display
    });
  });
});
