(() => {
  'use strict';

  const html = document.documentElement;
  const body = document.body;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const q = (selector, context = document) => context.querySelector(selector);
  const qa = (selector, context = document) => [...context.querySelectorAll(selector)];

  // Preloader
  window.addEventListener('load', () => {
    window.setTimeout(() => q('#preloader')?.classList.add('is-hidden'), 320);
  });

  // Theme: dark by default, persists locally.
  const themeToggle = q('#themeToggle');
  const savedTheme = localStorage.getItem('arbind-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') html.dataset.theme = savedTheme;
  themeToggle?.addEventListener('click', () => {
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
    html.dataset.theme = next;
    localStorage.setItem('arbind-theme', next);
    updateThemeMeta(next);
  });

  function updateThemeMeta(theme) {
    q('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#07101f' : '#f8f3e9');
  }
  updateThemeMeta(html.dataset.theme);

  // Bilingual UI. Nepali is the first/default language.
  const languageToggle = q('#languageToggle');
  const languageLabel = q('#languageLabel');
  let currentLanguage = localStorage.getItem('arbind-language') === 'en' ? 'en' : 'ne';

  function setLanguage(language) {
    currentLanguage = language;
    html.lang = language;
    html.dataset.language = language;
    localStorage.setItem('arbind-language', language);

    qa('[data-ne][data-en]').forEach((element) => {
      element.textContent = element.dataset[language];
    });

    qa('[data-language-block]').forEach((block) => {
      block.hidden = block.dataset.languageBlock !== language;
    });

    if (languageLabel) languageLabel.textContent = language === 'ne' ? 'EN' : 'ने';
    document.title = language === 'ne'
      ? 'अरबिन धिताल — शब्द, साधना र आत्मबोध'
      : 'Arbin Dhital — Words, Devotion and Self-realization';

    const description = q('meta[name="description"]');
    if (description) {
      description.content = language === 'ne'
        ? 'अरबिन धितालको आध्यात्मिक, साहित्यिक र काव्यिक डिजिटल गृह — कविता, साहित्य, चिन्तन र कृष्णभक्ति।'
        : 'The spiritual and literary digital home of Arbin Dhital—poetry, literature, reflection and Krishna devotion.';
    }
  }

  setLanguage(currentLanguage);
  languageToggle?.addEventListener('click', () => setLanguage(currentLanguage === 'ne' ? 'en' : 'ne'));

  // Header / navigation
  const header = q('.site-header');
  const backToTop = q('#backToTop');
  const menuToggle = q('#menuToggle');
  const mobileNav = q('#mobileNav');
  let previousScroll = 0;

  function onScroll() {
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 18);
    backToTop?.classList.toggle('is-visible', y > 650);
    previousScroll = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    mobileNav?.classList.toggle('is-open', open);
    body.classList.toggle('menu-open', open);
  });

  qa('.mobile-nav a').forEach((link) => link.addEventListener('click', () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    mobileNav?.classList.remove('is-open');
    body.classList.remove('menu-open');
  }));

  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Active navigation based on visible section.
  const navLinks = qa('.desktop-nav a');
  const sections = qa('main section[id]');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-42% 0px -50% 0px', threshold: 0 });
  sections.forEach((section) => sectionObserver.observe(section));

  // Reveal elements.
  if (!prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -40px' });
    qa('.reveal').forEach((element) => revealObserver.observe(element));
  } else {
    qa('.reveal').forEach((element) => element.classList.add('is-visible'));
  }

  // Hero depth interaction.
  const heroVisual = q('#heroVisual');
  const heroArt = q('.hero-art');
  if (heroVisual && heroArt && !prefersReducedMotion && window.matchMedia('(pointer:fine)').matches) {
    heroVisual.addEventListener('pointermove', (event) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      heroArt.style.transform = `rotateY(${x * 4.5}deg) rotateX(${y * -4.5}deg) translateZ(0)`;
    });
    heroVisual.addEventListener('pointerleave', () => { heroArt.style.transform = ''; });
  }

  // Cursor aura.
  const cursorAura = q('.cursor-aura');
  if (cursorAura && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('pointermove', (event) => {
      cursorAura.style.left = `${event.clientX}px`;
      cursorAura.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  // Content filters.
  qa('.filter').forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.filter;
      qa('.filter').forEach((item) => item.classList.toggle('is-active', item === button));
      qa('.content-card').forEach((card) => {
        card.classList.toggle('is-filtered', category !== 'all' && card.dataset.category !== category);
      });
    });
  });

  // Toast helper.
  const toast = q('#toast');
  let toastTimer;
  function showToast(nepali, english) {
    if (!toast) return;
    toast.textContent = currentLanguage === 'ne' ? nepali : english;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  // Copy poem.
  q('#copyPoem')?.addEventListener('click', async () => {
    const activePoem = q(`[data-language-block="${currentLanguage}"]`);
    if (!activePoem) return;
    try {
      await navigator.clipboard.writeText(activePoem.innerText.trim());
      showToast('कविता प्रतिलिपि भयो।', 'Poem copied.');
    } catch {
      showToast('प्रतिलिपि गर्न सकिएन।', 'Could not copy the poem.');
    }
  });

  // Copy email.
  q('#copyEmail')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('contact@arbindhital.com.np');
      showToast('इमेल ठेगाना प्रतिलिपि भयो।', 'Email address copied.');
    } catch {
      showToast('प्रतिलिपि गर्न सकिएन।', 'Could not copy the email address.');
    }
  });

  // Focused reading mode.
  const readingOverlay = q('#readingOverlay');
  const readingOverlayContent = q('#readingOverlayContent');
  const readingMode = q('#readingMode');
  const closeReadingMode = q('#closeReadingMode');

  function openReadingMode() {
    const activePoem = q(`[data-language-block="${currentLanguage}"]`);
    if (!activePoem || !readingOverlay || !readingOverlayContent) return;
    readingOverlayContent.innerHTML = `<div class="poem-text poem-text--${currentLanguage}">${activePoem.innerHTML}</div><footer class="poem-signature"><span>—</span> Arbin Dhital</footer>`;
    readingOverlay.classList.add('is-open');
    readingOverlay.setAttribute('aria-hidden', 'false');
    body.classList.add('reading-open');
    closeReadingMode?.focus();
  }
  function closeReading() {
    readingOverlay?.classList.remove('is-open');
    readingOverlay?.setAttribute('aria-hidden', 'true');
    body.classList.remove('reading-open');
    readingMode?.focus();
  }
  readingMode?.addEventListener('click', openReadingMode);
  closeReadingMode?.addEventListener('click', closeReading);
  readingOverlay?.addEventListener('click', (event) => { if (event.target === readingOverlay) closeReading(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (readingOverlay?.classList.contains('is-open')) closeReading();
      if (mobileNav?.classList.contains('is-open')) menuToggle?.click();
    }
  });

  // Year.
  const year = q('#currentYear');
  if (year) year.textContent = String(new Date().getFullYear());

  // Lightweight animated particles.
  const canvas = q('#particleCanvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(54, Math.max(20, Math.floor(width / 30)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.45 + .35,
        vx: (Math.random() - .5) * .08,
        vy: -(Math.random() * .16 + .04),
        a: Math.random() * .45 + .08,
        phase: Math.random() * Math.PI * 2
      }));
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.y < -8) { particle.y = height + 8; particle.x = Math.random() * width; }
        if (particle.x < -8) particle.x = width + 8;
        if (particle.x > width + 8) particle.x = -8;
        const pulse = .65 + Math.sin(time * .001 + particle.phase) * .35;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        const dark = html.dataset.theme === 'dark';
        ctx.fillStyle = dark
          ? `rgba(244,190,88,${particle.a * pulse})`
          : `rgba(120,75,24,${particle.a * pulse * .55})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    requestAnimationFrame(draw);
  }
})();
