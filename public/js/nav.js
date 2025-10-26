// public/js/nav.js
(function () {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when a link is tapped
  nav.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
})();
