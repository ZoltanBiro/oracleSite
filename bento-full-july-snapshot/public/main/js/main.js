/* Accessible mobile navigation. No framework or additional dependencies. */
(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#site-navigation');
  if (!toggle || !nav) return;

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('is-open');
  };
  toggle.addEventListener('click', () => {
    const willOpen = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(willOpen));
    toggle.setAttribute('aria-label', willOpen ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('is-open', willOpen);
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) close();
  });
})();
