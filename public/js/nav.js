// public/js/nav.js
(function () {
  // Single source of truth for "mobile" state
  const MQ = window.matchMedia('(max-width: 900px)');

  function applyMobileFlag() {
    const isMobile = MQ.matches;
    document.body.classList.toggle('is-mobile', isMobile);

    // When leaving mobile → force-close menu and reset button state
    const nav = document.getElementById('mainNav');
    const toggle = document.getElementById('menuToggle');
    if (!nav || !toggle) return;

    if (!isMobile) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  }

  function bindHandlers() {
    const nav = document.getElementById('mainNav');
    const toggle = document.getElementById('menuToggle');
    if (!nav || !toggle) return;

    if (!toggle.__bound) {
      toggle.__bound = true;

      const handleToggle = () => {
        // Only toggle when we are in mobile mode
        if (!document.body.classList.contains('is-mobile')) return;
        const isOpen = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
      };

      toggle.addEventListener('click', handleToggle, { passive: true });
      toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle();
        }
      });

      // Close the menu when a link is tapped
      document.addEventListener('click', (e) => {
        if (e.target.closest('#mainNav a')) {
          nav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      }, { passive: true });
    }
  }

  // Init now
  applyMobileFlag();
  bindHandlers();

  // Update on MQ changes (all browsers)
  if (typeof MQ.addEventListener === 'function') {
    MQ.addEventListener('change', applyMobileFlag);
  } else if (typeof MQ.addListener === 'function') {
    MQ.addListener(applyMobileFlag);
  }

  // Also update on resize as a belt-and-suspenders fallback
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(applyMobileFlag, 100);
  });
})();
