const root = document.documentElement;
const toast = document.getElementById('toast');
const preloader = document.getElementById('preloader');
const cursorAura = document.getElementById('cursorAura');
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
const themeToggle = document.getElementById('themeToggle');
const languageToggle = document.getElementById('languageToggle');
const languageLabel = document.getElementById('languageLabel');

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function updateLanguage(lang) {
  root.setAttribute('data-language', lang);
  document.documentElement.lang = lang === 'ne' ? 'ne' : 'en';
  languageLabel.textContent = lang === 'ne' ? 'EN' : 'ने';
  document.querySelectorAll('[data-ne]').forEach(el => {
    const key = lang === 'ne' ? 'data-ne' : 'data-en';
    const value = el.getAttribute(key);
    if (value) el.textContent = value;
  });
  document.querySelectorAll('[data-placeholder-ne]').forEach(el => {
    el.placeholder = el.getAttribute(lang === 'ne' ? 'data-placeholder-ne' : 'data-placeholder-en') || '';
  });
  localStorage.setItem('arbin-language', lang);
}

function updateTheme(theme) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('arbin-theme', theme);
}

const storedLang = localStorage.getItem('arbin-language') || 'ne';
const storedTheme = localStorage.getItem('arbin-theme') || 'dark';
updateLanguage(storedLang);
updateTheme(storedTheme);

languageToggle?.addEventListener('click', () => {
  const next = root.getAttribute('data-language') === 'ne' ? 'en' : 'ne';
  updateLanguage(next);
  showToast(next === 'ne' ? 'नेपाली मोड सक्रिय भयो।' : 'English mode activated.');
});

themeToggle?.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  updateTheme(next);
  showToast(next === 'dark' ? (root.getAttribute('data-language') === 'ne' ? 'डार्क मोड सक्रिय भयो।' : 'Dark mode activated.') : (root.getAttribute('data-language') === 'ne' ? 'लाइट मोड सक्रिय भयो।' : 'Light mode activated.'));
});

menuToggle?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => mobileNav.classList.remove('open')));

window.addEventListener('load', () => {
  setTimeout(() => preloader?.classList.add('is-hidden'), 650);
});

// scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('in-view');
  });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// nav state
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-nav a')];
window.addEventListener('scroll', () => {
  const y = window.scrollY + 140;
  let current = sections[0]?.id || '';
  sections.forEach(section => {
    if (y >= section.offsetTop) current = section.id;
  });
  navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${current}`));
}, { passive: true });

// copy poem
const poemText = document.getElementById('poemText');
document.getElementById('copyPoem')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(poemText.innerText.trim());
    showToast(root.getAttribute('data-language') === 'ne' ? 'कविता प्रतिलिपि गरियो।' : 'Poem copied.');
  } catch {
    showToast(root.getAttribute('data-language') === 'ne' ? 'प्रतिलिपि गर्न सकिएन।' : 'Could not copy.');
  }
});

document.getElementById('readingMode')?.addEventListener('click', () => {
  document.body.classList.toggle('reading-focus');
  const active = document.body.classList.contains('reading-focus');
  showToast(active ? (root.getAttribute('data-language') === 'ne' ? 'पठन मोड सक्रिय भयो।' : 'Reading mode enabled.') : (root.getAttribute('data-language') === 'ne' ? 'पठन मोड बन्द भयो।' : 'Reading mode disabled.'));
});

// mouse aura
window.addEventListener('pointermove', (e) => {
  if (!cursorAura) return;
  cursorAura.style.opacity = '.95';
  cursorAura.style.left = `${e.clientX}px`;
  cursorAura.style.top = `${e.clientY}px`;
});
window.addEventListener('pointerleave', () => { if (cursorAura) cursorAura.style.opacity = '0'; });

// tiny tilt effect
const tiltElements = document.querySelectorAll('[data-tilt]');
tiltElements.forEach((el) => {
  const intensity = 10;
  el.addEventListener('mousemove', (e) => {
    if (window.innerWidth < 1024) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * intensity;
    const ry = (px - 0.5) * intensity;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

// particles
const canvas = document.getElementById('particleCanvas');
const ctx = canvas?.getContext('2d');
let particles = [];
function resizeCanvas() {
  if (!canvas || !ctx) return;
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  const count = Math.min(70, Math.max(28, Math.round(window.innerWidth / 22)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2 + 0.4,
    vy: Math.random() * 0.4 + 0.12,
    vx: (Math.random() - .5) * 0.25,
    alpha: Math.random() * 0.45 + 0.10
  }));
}
function hexToRGBA(hex, alpha) {
  const h = (hex || '#ffd46a').trim().replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
function drawParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  const primary = getComputedStyle(root).getPropertyValue('--primary');
  const secondary = getComputedStyle(root).getPropertyValue('--secondary');
  particles.forEach((p, i) => {
    p.y -= p.vy;
    p.x += p.vx;
    if (p.y < -10) { p.y = window.innerHeight + 10; p.x = Math.random() * window.innerWidth; }
    if (p.x < -10) p.x = window.innerWidth + 10;
    if (p.x > window.innerWidth + 10) p.x = -10;
    ctx.beginPath();
    ctx.fillStyle = i % 2 ? hexToRGBA(primary, p.alpha) : hexToRGBA(secondary, p.alpha * .85);
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(drawParticles);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
drawParticles();
