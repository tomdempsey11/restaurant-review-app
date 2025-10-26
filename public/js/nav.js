// public/js/nav.js
(function () {
  const MOBILE_Q = window.matchMedia('(max-width: 900px)');

  function applyMobileFlag() {
    document.body.classList.toggle('is-mobile', MOBILE_Q.matches);
  }

  function bindNav() {
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;

    if (toggle.__bound) return;
    toggle.__bound = true;

    const handleToggle = () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    };

    toggle.addEventListener('click', handleToggle, { passive: true });
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggle(); }
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('#mainNav a')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    }, { passive: true });
  }

  // Init
  applyMobileFlag();
  MOBILE_Q.addEventListener ? MOBILE_Q.addEventListener('change', applyMobileFlag)
                            : MOBILE_Q.addListener(applyMobileFlag);
  document.addEventListener('DOMContentLoaded', () => { applyMobileFlag(); bindNav(); });
})();
