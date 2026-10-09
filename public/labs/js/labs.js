'use strict';

// Only the shared Labs shell uses this file. Individual experiments own their JS.
(function () {
  const toggle = document.querySelector('.labs-nav-toggle');
  const menu = document.getElementById('labs-navigation');
  if (!toggle || !menu) return;

  const close = function () {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    menu.classList.remove('is-open');
  };

  toggle.addEventListener('click', function () {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) close();
    else {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close navigation');
      menu.classList.add('is-open');
    }
  });

  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', close);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') close();
  });
  document.addEventListener('click', function (event) {
    if (!toggle.contains(event.target) && !menu.contains(event.target)) close();
  });
})();
