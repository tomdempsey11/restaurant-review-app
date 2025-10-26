// public/js/nav.js
(function attach() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');

  // If the nodes aren't there yet, try again after DOM is ready.
  if (!toggle || !nav) {
    document.addEventListener('DOMContentLoaded', attach, { once: true });
    return;
  }

  // Avoid double-binding across hot reloads/renders
  if (toggle.__bound) return;
  toggle.__bound = true;

  const handleToggle = () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    console.log('[nav] toggled:', isOpen);
  };

  // Click + keyboard support
  toggle.addEventListener('click', handleToggle, { passive: true });
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  });

  // Close when a link inside the menu is clicked
  document.addEventListener('click', (e) => {
    if (e.target.closest('#mainNav a')) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  }, { passive: true });

  console.log('[nav] bound:', { hasToggle: !!toggle, hasNav: !!nav });
})();
