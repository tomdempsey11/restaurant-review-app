// public/js/nav.js
(function () {
  const MQ = window.matchMedia('(max-width: 900px)');

  const nav   = document.getElementById('mainNav');
  const toggle = document.getElementById('menuToggle');
  if (!nav || !toggle) return;

  // --- helpers ---
  function isMobile() { return MQ.matches; }

  function openNav() {
    if (!isMobile()) return;
    nav.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-mobile-nav-open'); // shows backdrop via CSS
  }

  function closeNav() {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-mobile-nav-open');
  }

  function toggleNav() {
    if (!isMobile()) return;
    nav.classList.contains('open') ? closeNav() : openNav();
  }

  // --- initial responsive flag ---
  function applyMobileFlag() {
    document.body.classList.toggle('is-mobile', isMobile());
    if (!isMobile()) closeNav(); // leaving mobile ⇒ ensure closed
  }
  applyMobileFlag();

  // --- bind once ---
  if (!toggle.__bound) {
    toggle.__bound = true;

    // Toggle button (click or keyboard)
    toggle.addEventListener('click', (e) => { e.stopPropagation(); toggleNav(); }, { passive: true });
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleNav(); }
    });

    // Close when a nav link is clicked (on mobile)
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeNav();
      e.stopPropagation();
    }, { passive: true });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('open')) return;
      if (!nav.contains(e.target) && e.target !== toggle) closeNav();
    });

    // ESC to close
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });

    // Auto-close when resizing to desktop
    const mqListener = () => applyMobileFlag();
    if (typeof MQ.addEventListener === 'function') MQ.addEventListener('change', mqListener);
    else if (typeof MQ.addListener === 'function') MQ.addListener(mqListener);

    // Fallback debounce on resize
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(applyMobileFlag, 100); });
  }
})();
