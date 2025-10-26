// public/js/nav.js
(() => {
  const ready = (fn) =>
    document.readyState !== "loading"
      ? fn()
      : document.addEventListener("DOMContentLoaded", fn);

  ready(() => {
    const nav = document.getElementById("mainNav");
    const toggle = document.getElementById("menuToggle");
    console.log("[nav] init", { hasNav: !!nav, hasToggle: !!toggle });

    if (!nav || !toggle) return;

    // Event delegation: works even if the button is re-rendered
    document.addEventListener(
      "click",
      (e) => {
        // Toggle open/close
        if (e.target.closest("#menuToggle")) {
          const isOpen = nav.classList.toggle("open");
          toggle.setAttribute("aria-expanded", String(isOpen));
          console.log("[nav] delegated click ->", isOpen);
        }

        // Close when a menu link is tapped
        if (e.target.closest("#mainNav a")) {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        }
      },
      { passive: true }
    );
  });
})();
