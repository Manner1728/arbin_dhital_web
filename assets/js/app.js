"use strict";

const root = document.documentElement;
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  language: localStorage.getItem("arbin-language") || "ne",
  theme: localStorage.getItem("arbin-theme") || "dark",
  filter: "all",
  search: "",
  items: [],
  activeItem: null,
  soundscape: "silence",
};

const typeLabels = {
  poem: { ne: "कविता", en: "Poem" },
  article: { ne: "लेख", en: "Article" },
  novel: { ne: "उपन्यास", en: "Novel" },
};

const defaultImages = {
  poem: "assets/images/contemplation.jpg",
  article: "assets/images/krishna-glow.png",
  novel: "assets/images/radha-krishna-glow.png",
};

const builtInWriting = [
  {
    id: "poem-last-birth",
    type: "poem",
    title: "शून्यमा विलीन अन्तिम जन्म",
    author: "अर्बिन धिताल",
    image: "assets/images/poem-last-birth.png",
    excerpt: "जन्म, शून्यता, वैराग्य र चेतनाको मौन खोज।",
    content: `अन्तिम जम्म हो मित्र।
अन्तिम जन्म हो।।
अरु जन्म को के आश के भरोसा। 
उतारचढाव आएका छन
 आउछन आउदै जानेछन।
कहिले कामबासनाले ठ्याक्कै  मदहोस बनाउछ।
कहिले बैराग ले सचेतना जगाउछ।
लोभ नभएका होइन किन लुकाउनु।
मोह ले नगलाएको कहाँ हो र?

कहिले भोकले शरीर ख्याल गराउछ
कहिले शोकले मन पिरोलिदिन्छ।
कुन मन सोच्दछु आफुलाइ
आफू भन्छ मौनतामा तिमी छैनौ !

तिमी छौ त केबल शुन्यमा 
सुनिएका मुखारबिन्द गुरुका !! 
त्यो शून्य के हो खोजिरहेछु
खोज्दाखोज्दै म त विलिन भएछु।

तितो स्वाद पनि आनन्द भन्छन।
मीठो सुगन्द पनि बिष ।।
कुन अभागी किन भन्छौ
न शोक भोक  न म राग रिस !! 

हेर मलाइ तिमी आफुलाइ हेरेजस्तै
आँखा बन्द गरि हेरिदेउ मलाइ
कान बन्द गरि सुनिदेउ प्रिय।
मन जलाइ चेतनामा सुम्पिदेउ मलाइ ।

म को हुं म जान्दिन
न मेरो कुनै मार्ग छ 
न मसंग कुनै पद प्रतिष्ठा
न जिवको उत्कर्ष छ।`,
  },
  {
    id: "poem-vitaragi",
    type: "poem",
    title: "आफ्नै वीतरागी",
    author: "अर्बिन धिताल",
    image: "assets/images/poem-vitaragi.png",
    excerpt: "अहम्, बोध, चेतना र लक्ष्यविहीन आत्मयात्राको काव्यिक संवाद।",
    content: `म बोध हो शब्दमा भन्छन मान्छे हरु
म चेतना हो पनि भन्ने गर्छन।
स्वभावमा नजनिएका भएपनी
भावमा नबुझिएका भएपनी
अहंम कहा दबिन्छ र ?
 म कहाँ हराउछ र ?
कतिन्जेल !!! 

 मौका हेरेर आफ्नो बिराटता 
आफैमा बोकि हराउछ ।।
अहम को उत्सर्ग मा उ 
चेतना कहलाउछ ।।

न मेरो कुनै मार्ग छ
न मेरो कुनै लक्ष।
तराजुमा जोखी हेरें 
तौलिदिने मेरो उद्देश्य छ।

म मोक्ष राख्दिन मनमा 
न संसार को रागी हुं
म सोचाइको केबल 
 आफ्नै बितरागी हुं।।

आफ्नै बितरागी हुं।`,
  },
  {
    id: "poem-hidden-mind",
    type: "poem",
    title: "दबाइएको मनको खोजी",
    author: "अर्बिन धिताल",
    image: "assets/images/poem-hidden-mind.png",
    excerpt: "कृत्रिम आवरणभित्र दबिएको असली मन र स्वतन्त्रताको खोज।",
    content: `दबाइएर खोजिएको मन ।।

ओढेर पछ्यौरी श्रिङ्गारको 
ढाकेछौ असलीपन लाई !!
छोपेर भावको त्यो खोलाको 
उर्लिएको त्यो भेललाइ !! 
कुन खुशी खोजिरहेछौ
कुन दुख भुलाइरहेछौ? 

मरेर दिनभर किन हासो खोजिरहेछौ?
जागेर रातभर तिमी आफै हराइरहेछौ 
भिडलाइ रिझाउन पिरलाइ बुझाउन 
खै किन तिमी सरम बारिरहेछौ !,

ज्वाला को तापमा 
सुन्दरताको रागमा 
अट्टाहस हासो तिमी
हासिरहेछौ !! 

कुन खुशी खोजिरहेछौ
कुन दुख भुलाइरहेछौ? 

घामलाइ छोपेर छोपिएजस्तै
जुनलाइ ढाकेर रमाएझै।
खुला आकाशमुनी 
तिमी आफू सर माएझै ।। 

अबरोध गरेको कसले ?
छेकेको छ जसले! 
तिमी नै त होला
भुलेर संसारको रसले।।

कृतिम कृति को जगमा
रिति को थितिको भरमा
हिडाइरहेछौ पाउ बिना
दुखिएहेछौ घाउ बिना ।। 

निरशताको उजागर हुदा तिमी 
भरोसामा शंकाको भरमा तिमी 
जिइरहेछौ पल पल मरि मरि
बुनिरहेछौ तानको कर्म भरीभरी`,
  },
  {
    id: "poem-ke-paune",
    type: "poem",
    title: "के पाउने यहाँ तिमिले?",
    author: "अर्बिन धिताल",
    image: "assets/images/contemplation.jpg",
    excerpt: "अनित्य संसार, आत्मबोध र आफैँलाई चिन्न गरिएको गहिरो आह्वान।",
    content: `के पाउने यहाँ तिमिले?
अनि के गुमाउने?
कहिले नभएको तिम्रो साथमा छ आज
तिम्रो साथको भोलि अर्कैको हुनेछ ।
कहिले ख्याल गरेका छौ??
जुन शरिरको लागि जुटाएका छौ
प्रयत्नरत छौ त्यो नै तिमी होइनौ।

अन्जान भविस्यको निमित्त
परिचित वर्तमानमा तड्पिरहेछौ किन !!
दुई दिनको लागि तयारी गर्छौ तर
अन्जान यात्राको वेवास्ता किन गर्दैछौ
तिमी त सदा ऐश्वर्यले भरिएका छौ
तर आफुलाइ चिन्न चाहेनौ कहिले।
अनवरत छौ भोग्न तिमी संसार
जन्म मृत्युको यो अनित्यमा ।
तिम्रो तप तिम्रो बिरुद्ध छ आज
अनि सपना जड संजाल को बिज ।

धर्तिको अंशलाइ तिमी आफू नभन
तर आफुलाइ जान्न ढिला नगर ।
तिमी बलेको प्रकाश हौ सदा प्रकाशित छौ
अन्धकारको पर्दाले आफुलाइ नढाक
अनित्य संसारलाइ नित्यको आखाले नहेर
छोड्ने बस्तुको मोहमा नपर

भोगको सुखमा दौडिदै गर्दा
तिमी परमरसबाट बिमुख भयौ
आफुलाइ जान्दैमा तिमी गुम्दैनौ  नडराउ
शुन्यमा शुन्यसरी बिलाउदैनौ ।
बरु भरिन्छौ यसअघी खाली थियौ
सुक्ष्मबाट बिराटतामा तिमी अघाउदैनौ ।`,
  },
];

const audioLibrary = [
  { title: "Indian Flute & Tabla — Remastered", titleNe: "भारतीय बाँसुरी र तबला — रिमास्टर", duration: "२:१६", file: "assets/media/audio/indian-flute-tabla-remastered.mp3" },
  { title: "Radha Krishna Prem Rang", titleNe: "राधा–कृष्ण प्रेम रङ्ग", duration: "४:०३", file: "assets/media/audio/radha-krishna-prem-rang.mp3" },
  { title: "Beautiful Flute Music", titleNe: "सुन्दर बाँसुरी धुन", duration: "०:५५", file: "assets/media/audio/beautiful-flute-music.mp3" },
  { title: "Shyam Tera Rang", titleNe: "श्याम तेरा रङ्ग", duration: "५:३२", file: "assets/media/audio/shyam-tera-rang.mp3" },
  { title: "Hare Krishna — Relaxing Theme", titleNe: "हरे कृष्ण — शान्त धुन", duration: "२:१९", file: "assets/media/audio/hare-krishna-relaxing-theme.mp3" },
  { title: "Krishna Flute — Deep Sleep I", titleNe: "कृष्ण बाँसुरी — गहिरो विश्राम १", duration: "६:०६", file: "assets/media/audio/krishna-flute-deep-sleep-1.mp3" },
  { title: "Krishna Flute — Deep Sleep II", titleNe: "कृष्ण बाँसुरी — गहिरो विश्राम २", duration: "८:३७", file: "assets/media/audio/krishna-flute-deep-sleep-2.mp3" },
  { title: "Original Flute Melody", titleNe: "मूल बाँसुरी धुन", duration: "", file: "assets/media/flute-melody.mp3" },
];

function showToast(ne, en = ne) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = state.language === "ne" ? ne : en;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function safeAssetUrl(value, fallback) {
  if (!value || typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (/^(javascript|data):/i.test(trimmed) || trimmed.includes("..")) return fallback;
  return trimmed;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[char]));
}

function nepaliNumber(value) {
  if (state.language !== "ne") return String(value);
  return String(value).replace(/\d/g, (digit) => "०१२३४५६७८९"[Number(digit)]);
}

function applyLanguage(language) {
  state.language = language;
  root.lang = language === "ne" ? "ne" : "en";
  root.dataset.language = language;
  $("#languageLabel").textContent = language === "ne" ? "EN" : "ने";
  $$("[data-ne]").forEach((element) => {
    const value = element.getAttribute(language === "ne" ? "data-ne" : "data-en");
    if (value) element.textContent = value;
  });
  $$("[data-placeholder-ne]").forEach((element) => {
    element.placeholder = element.getAttribute(language === "ne" ? "data-placeholder-ne" : "data-placeholder-en") || "";
  });
  localStorage.setItem("arbin-language", language);
  renderContent();
  renderAudio();
  const names = {
    flute: language === "ne" ? "अनन्त बाँसुरी" : "Endless flute",
    meditation: language === "ne" ? "ध्यान नाद" : "Meditation resonance",
    silence: language === "ne" ? "मौनता" : "Silence",
  };
  if ($("#nowPlaying")) $("#nowPlaying").textContent = names[state.soundscape];
}

function applyTheme(theme) {
  state.theme = theme;
  root.dataset.theme = theme;
  localStorage.setItem("arbin-theme", theme);
}

applyTheme(state.theme);

$("#languageToggle")?.addEventListener("click", () => {
  applyLanguage(state.language === "ne" ? "en" : "ne");
  showToast("नेपाली भाषा सक्रिय भयो।", "English language activated.");
});

$("#themeToggle")?.addEventListener("click", () => {
  applyTheme(state.theme === "dark" ? "light" : "dark");
  showToast(state.theme === "dark" ? "गाढा दृश्य सक्रिय भयो।" : "उज्यालो दृश्य सक्रिय भयो।", state.theme === "dark" ? "Dark theme activated." : "Light theme activated.");
});

$("#menuToggle")?.addEventListener("click", () => {
  const isOpen = $("#mobileNav").classList.toggle("open");
  $("#menuToggle").setAttribute("aria-expanded", String(isOpen));
});
$$(".mobile-nav a").forEach((link) => link.addEventListener("click", () => $("#mobileNav").classList.remove("open")));

window.addEventListener("load", () => setTimeout(() => $("#preloader")?.classList.add("is-hidden"), 500));
$("#year").textContent = new Date().getFullYear();

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in-view");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });
$$(".reveal").forEach((element) => revealObserver.observe(element));

const sections = $$("main section[id]");
const navLinks = $$(".desktop-nav a, .mobile-nav a");
window.addEventListener("scroll", () => {
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  $("#pageProgress").style.width = `${scrollable > 0 ? (scrollY / scrollable) * 100 : 0}%`;
  const position = scrollY + 180;
  let active = sections[0]?.id || "home";
  sections.forEach((section) => { if (position >= section.offsetTop) active = section.id; });
  navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${active}`));
}, { passive: true });

window.addEventListener("pointermove", (event) => {
  const light = $("#cursorLight");
  if (!light || prefersReducedMotion) return;
  light.style.left = `${event.clientX}px`;
  light.style.top = `${event.clientY}px`;
  light.style.opacity = ".9";
}, { passive: true });

function initAmbientCanvas() {
  const canvas = $("#ambientCanvas");
  const context = canvas?.getContext("2d");
  if (!canvas || !context) return;

  let width = innerWidth;
  let height = innerHeight;
  let ratio = 1;
  let stars = [];
  let cosmicDust = [];
  let comets = [];
  let nextCometAt = performance.now() + 3400;
  let previousFrame = 0;
  let animationFrame = 0;
  let isVisible = true;

  const randomBetween = (minimum, maximum) => minimum + Math.random() * (maximum - minimum);

  function makeStars() {
    const count = Math.min(380, Math.max(190, Math.round(width / 4.2)));
    stars = Array.from({ length: count }, (_, index) => {
      const depth = randomBetween(.18, 1);
      return {
        x: Math.random(),
        y: Math.random(),
        depth,
        size: index % 31 === 0 ? randomBetween(1.7, 2.45) : randomBetween(.28, 1.25) * depth,
        alpha: randomBetween(.25, .92),
        phase: randomBetween(0, Math.PI * 2),
        speed: randomBetween(.000035, .00011) * (Math.random() > .5 ? 1 : -1),
        color: index % 8 === 0 ? "gold" : index % 5 === 0 ? "blue" : "white",
      };
    });
    cosmicDust = Array.from({ length: Math.min(90, Math.max(45, Math.round(width / 18))) }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: randomBetween(10, 42),
      alpha: randomBetween(.012, .045),
      speed: randomBetween(.000008, .000026),
      phase: randomBetween(0, Math.PI * 2),
      color: Math.random() > .5 ? "violet" : "cyan",
    }));
  }

  const resize = () => {
    width = innerWidth;
    height = innerHeight;
    ratio = Math.min(devicePixelRatio || 1, 1.8);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    makeStars();
  };

  function drawNebula(time, lightTheme) {
    const fields = lightTheme
      ? [
          [.12, .18, .43, "104, 89, 210", .09],
          [.83, .28, .38, "190, 72, 170", .065],
          [.58, .78, .46, "36, 145, 179", .07],
        ]
      : [
          [.08, .15, .48, "75, 58, 200", .22],
          [.88, .27, .42, "191, 69, 181", .16],
          [.61, .78, .50, "25, 153, 183", .15],
          [.28, .92, .35, "215, 139, 66", .08],
        ];
    context.save();
    context.globalCompositeOperation = lightTheme ? "source-over" : "screen";
    fields.forEach(([xRatio, yRatio, radiusRatio, rgb, opacity], index) => {
      const driftX = Math.sin(time * .00006 + index * 1.7) * width * .055;
      const driftY = Math.cos(time * .000045 + index * 1.15) * height * .048;
      const x = xRatio * width + driftX;
      const y = yRatio * height + driftY;
      const radius = Math.max(width, height) * radiusRatio;
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${rgb},${opacity})`);
      gradient.addColorStop(.28, `rgba(${rgb},${opacity * .52})`);
      gradient.addColorStop(.7, `rgba(${rgb},${opacity * .12})`);
      gradient.addColorStop(1, `rgba(${rgb},0)`);
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    });
    context.restore();
  }

  function drawDust(time, lightTheme) {
    context.save();
    context.globalCompositeOperation = lightTheme ? "source-over" : "screen";
    const scrollShift = scrollY * .008;
    cosmicDust.forEach((particle) => {
      const x = ((particle.x + time * particle.speed) % 1) * width;
      const y = ((particle.y + scrollShift / Math.max(height, 1) + Math.sin(time * .00012 + particle.phase) * .025) % 1) * height;
      const rgb = particle.color === "violet" ? "139, 105, 238" : "74, 190, 210";
      const alpha = lightTheme ? particle.alpha * .55 : particle.alpha;
      const gradient = context.createRadialGradient(x, y, 0, x, y, particle.radius);
      gradient.addColorStop(0, `rgba(${rgb},${alpha})`);
      gradient.addColorStop(1, `rgba(${rgb},0)`);
      context.fillStyle = gradient;
      context.fillRect(x - particle.radius, y - particle.radius, particle.radius * 2, particle.radius * 2);
    });
    context.restore();
  }

  function drawStars(time, lightTheme) {
    const palette = lightTheme
      ? { white: "47, 63, 112", blue: "70, 105, 180", gold: "147, 105, 35" }
      : { white: "236, 243, 255", blue: "130, 185, 255", gold: "247, 216, 143" };
    const scrollShift = scrollY * .025;
    context.save();
    context.globalCompositeOperation = lightTheme ? "source-over" : "screen";
    stars.forEach((star, index) => {
      const x = ((star.x + time * star.speed) % 1 + 1) % 1 * width;
      const y = ((star.y + (scrollShift * star.depth) / Math.max(height, 1)) % 1) * height;
      const twinkle = .68 + Math.sin(time * .0015 * star.depth + star.phase) * .32;
      const alpha = star.alpha * twinkle * (lightTheme ? .48 : 1);
      const rgb = palette[star.color];
      if (star.size > 1.5) {
        const glow = context.createRadialGradient(x, y, 0, x, y, star.size * 7);
        glow.addColorStop(0, `rgba(${rgb},${alpha})`);
        glow.addColorStop(.18, `rgba(${rgb},${alpha * .48})`);
        glow.addColorStop(1, `rgba(${rgb},0)`);
        context.fillStyle = glow;
        context.fillRect(x - star.size * 7, y - star.size * 7, star.size * 14, star.size * 14);
        context.strokeStyle = `rgba(${rgb},${alpha * .45})`;
        context.lineWidth = .55;
        context.beginPath();
        context.moveTo(x - star.size * 5, y);
        context.lineTo(x + star.size * 5, y);
        context.moveTo(x, y - star.size * 5);
        context.lineTo(x, y + star.size * 5);
        context.stroke();
      }
      context.beginPath();
      context.fillStyle = `rgba(${rgb},${alpha})`;
      context.arc(x, y, Math.max(.28, star.size), 0, Math.PI * 2);
      context.fill();

      if (index % 57 === 0 && !lightTheme) {
        const companion = stars[(index + 9) % stars.length];
        const cx = ((companion.x + time * companion.speed) % 1 + 1) % 1 * width;
        const cy = ((companion.y + (scrollShift * companion.depth) / Math.max(height, 1)) % 1) * height;
        const distance = Math.hypot(cx - x, cy - y);
        if (distance < 130) {
          context.strokeStyle = "rgba(154, 177, 238, .055)";
          context.lineWidth = .6;
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(cx, cy);
          context.stroke();
        }
      }
    });
    context.restore();
  }

  function createComet(time) {
    const fromLeft = Math.random() > .5;
    comets.push({
      x: fromLeft ? randomBetween(-.08, .18) * width : randomBetween(.72, .98) * width,
      y: randomBetween(.06, .42) * height,
      vx: (fromLeft ? 1 : -1) * randomBetween(.32, .48),
      vy: randomBetween(.18, .3),
      life: 0,
      maxLife: randomBetween(850, 1450),
      length: randomBetween(90, 180),
      color: Math.random() > .35 ? "174, 216, 255" : "247, 216, 143",
      lastTime: time,
    });
  }

  function drawComets(time, lightTheme) {
    if (!prefersReducedMotion && time >= nextCometAt) {
      createComet(time);
      nextCometAt = time + randomBetween(5200, 10800);
    }
    context.save();
    context.globalCompositeOperation = lightTheme ? "source-over" : "screen";
    comets = comets.filter((comet) => {
      const delta = Math.min(42, time - comet.lastTime);
      comet.lastTime = time;
      comet.life += delta;
      comet.x += comet.vx * delta;
      comet.y += comet.vy * delta;
      const progress = comet.life / comet.maxLife;
      const alpha = Math.sin(Math.min(1, progress) * Math.PI) * (lightTheme ? .23 : .72);
      const magnitude = Math.hypot(comet.vx, comet.vy) || 1;
      const tailX = comet.x - (comet.vx / magnitude) * comet.length;
      const tailY = comet.y - (comet.vy / magnitude) * comet.length;
      const gradient = context.createLinearGradient(tailX, tailY, comet.x, comet.y);
      gradient.addColorStop(0, `rgba(${comet.color},0)`);
      gradient.addColorStop(.72, `rgba(${comet.color},${alpha * .32})`);
      gradient.addColorStop(1, `rgba(${comet.color},${alpha})`);
      context.strokeStyle = gradient;
      context.lineWidth = 1.3;
      context.beginPath();
      context.moveTo(tailX, tailY);
      context.lineTo(comet.x, comet.y);
      context.stroke();
      context.beginPath();
      context.fillStyle = `rgba(${comet.color},${alpha})`;
      context.arc(comet.x, comet.y, 1.7, 0, Math.PI * 2);
      context.fill();
      return comet.life < comet.maxLife;
    });
    context.restore();
  }

  const draw = (time = performance.now()) => {
    if (!isVisible) return;
    if (!prefersReducedMotion && time - previousFrame < 30) {
      animationFrame = requestAnimationFrame(draw);
      return;
    }
    previousFrame = time;
    const lightTheme = root.dataset.theme === "light";
    context.clearRect(0, 0, width, height);
    drawNebula(time, lightTheme);
    drawDust(time, lightTheme);
    drawStars(time, lightTheme);
    drawComets(time, lightTheme);
    if (!prefersReducedMotion) animationFrame = requestAnimationFrame(draw);
  };

  resize();
  draw(performance.now());
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    isVisible = !document.hidden;
    if (isVisible && !prefersReducedMotion) {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(draw);
    }
  });
}
initAmbientCanvas();

function normalizeManifestItems(items) {
  return (Array.isArray(items) ? items : []).filter((item) => ["poem", "article", "novel", "audio", "video"].includes(item.type));
}

async function loadContent() {
  try {
    const response = await fetch(`content-manifest.json?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Manifest unavailable");
    const manifest = await response.json();
    const loaded = normalizeManifestItems(manifest.items);
    const writing = loaded.filter((item) => ["poem", "article", "novel"].includes(item.type));
    const media = loaded.filter((item) => ["audio", "video"].includes(item.type));
    state.items = writing.length ? writing : builtInWriting;
    renderDynamicMedia(media);
  } catch {
    state.items = builtInWriting;
  }
  renderContent();
  updateCounts();
}

function filteredItems() {
  const term = state.search.trim().toLocaleLowerCase("ne");
  return state.items.filter((item) => {
    const matchesType = state.filter === "all" || item.type === state.filter;
    const haystack = `${item.title || ""} ${item.excerpt || ""} ${item.content || ""}`.toLocaleLowerCase("ne");
    return matchesType && (!term || haystack.includes(term));
  });
}

function renderContent() {
  const grid = $("#contentGrid");
  if (!grid || !state.items.length) return;
  const items = filteredItems();
  grid.innerHTML = items.map((item, index) => {
    const image = safeAssetUrl(item.image, defaultImages[item.type] || defaultImages.article);
    const label = typeLabels[item.type]?.[state.language] || item.type;
    const read = state.language === "ne" ? (item.downloadOnly ? "फाइल खोल्नुहोस्" : "पूर्ण रचना पढ्नुहोस्") : (item.downloadOnly ? "Open file" : "Read the full work");
    const indexLabel = nepaliNumber(String(index + 1).padStart(2, "0"));
    return `
      <article class="content-card reveal in-view" data-content-id="${escapeHTML(item.id)}" tabindex="0" role="button" aria-label="${escapeHTML(item.title)}">
        <div class="content-card__image"><img src="${escapeHTML(image)}" alt="" loading="lazy"></div>
        <span class="content-card__index">${indexLabel}</span>
        <div class="content-card__body">
          <span class="content-card__meta"><i></i>${escapeHTML(label)} · ${escapeHTML(item.author || "अर्बिन धिताल")}</span>
          <h3>${escapeHTML(item.title || "Untitled")}</h3>
          <p>${escapeHTML(item.excerpt || "")}</p>
          <span class="content-card__open">${escapeHTML(read)} <b>↗</b></span>
        </div>
      </article>`;
  }).join("");
  $("#emptyState").hidden = items.length > 0;
  $$(".content-card", grid).forEach((card) => {
    const activate = () => openContent(card.dataset.contentId);
    card.addEventListener("click", activate);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); }
    });
  });
}

function openContent(id) {
  const item = state.items.find((candidate) => String(candidate.id) === String(id));
  if (!item) return;
  if (item.downloadOnly && item.url) {
    window.open(safeAssetUrl(item.url, "#"), "_blank", "noopener");
    return;
  }
  state.activeItem = item;
  $("#readerType").textContent = typeLabels[item.type]?.[state.language] || item.type;
  $("#readerTitle").textContent = item.title || "";
  $("#readerAuthor").textContent = `— ${item.author || "अर्बिन धिताल"}`;
  $("#readerText").textContent = item.content || item.excerpt || "";
  $("#readerImage").src = safeAssetUrl(item.image, defaultImages[item.type] || defaultImages.article);
  $("#readerImage").alt = item.title || "";
  $("#readerDialog").classList.remove("is-focus");
  $("#readerDialog").showModal();
  document.body.classList.add("is-locked");
}

function closeReader() {
  $("#readerDialog")?.close();
  document.body.classList.remove("is-locked");
}
$("#readerClose")?.addEventListener("click", closeReader);
$("#readerDialog")?.addEventListener("click", (event) => {
  if (event.target === $("#readerDialog")) closeReader();
});
$("#readerDialog")?.addEventListener("close", () => document.body.classList.remove("is-locked"));
$("#copyContent")?.addEventListener("click", async () => {
  if (!state.activeItem) return;
  try {
    await navigator.clipboard.writeText(state.activeItem.content || state.activeItem.excerpt || "");
    showToast("रचना प्रतिलिपि गरियो।", "Writing copied.");
  } catch {
    showToast("प्रतिलिपि गर्न सकिएन।", "Could not copy.");
  }
});
$("#readerFocus")?.addEventListener("click", () => $("#readerDialog").classList.toggle("is-focus"));

$("#contentSearch")?.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderContent();
});
$$("[data-filter]").forEach((button) => button.addEventListener("click", () => {
  state.filter = button.dataset.filter;
  $$("[data-filter]").forEach((candidate) => candidate.classList.toggle("is-active", candidate === button));
  renderContent();
}));

function updateCounts() {
  const poemCount = state.items.filter((item) => item.type === "poem").length;
  const writingCount = state.items.filter((item) => item.type === "article" || item.type === "novel").length;
  $("#poemCount").textContent = nepaliNumber(poemCount);
  $("#writingCount").textContent = nepaliNumber(writingCount);
}

$$("[data-practice-tab]").forEach((button) => button.addEventListener("click", () => {
  const selected = button.dataset.practiceTab;
  $$("[data-practice-tab]").forEach((candidate) => candidate.classList.toggle("is-active", candidate === button));
  $$("[data-practice-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.practicePanel === selected));
}));

let breathTimer = null;
let breathRemaining = 12 * 60;
function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return nepaliNumber(`${minutes}:${seconds}`);
}
function updateBreathInstruction() {
  const elapsed = (12 * 60 - breathRemaining) % 15;
  let ne = "बिस्तारै श्वास लिनुहोस्…";
  let en = "Breathe in slowly…";
  if (elapsed >= 5 && elapsed < 9) { ne = "सहज रूपमा रोक्नुहोस्…"; en = "Pause gently…"; }
  if (elapsed >= 9) { ne = "लामो प्रश्वास छोड्नुहोस्…"; en = "Exhale slowly and fully…"; }
  $("#breathInstruction").textContent = state.language === "ne" ? ne : en;
}
$("#breathStart")?.addEventListener("click", () => {
  if (breathTimer) {
    clearInterval(breathTimer);
    breathTimer = null;
    $("#breathOrb").classList.remove("is-breathing");
    $("#breathStart").textContent = state.language === "ne" ? "फेरि सुरु गर्नुहोस्" : "Begin again";
    showToast("श्वास–ध्यान रोकियो।", "Breath practice paused.");
    return;
  }
  if (breathRemaining <= 0) breathRemaining = 12 * 60;
  $("#breathOrb").classList.add("is-breathing");
  $("#breathStart").textContent = state.language === "ne" ? "अभ्यास रोक्नुहोस्" : "Pause practice";
  updateBreathInstruction();
  breathTimer = setInterval(() => {
    breathRemaining -= 1;
    $("#breathTime").textContent = formatClock(breathRemaining);
    updateBreathInstruction();
    if (breathRemaining <= 0) {
      clearInterval(breathTimer);
      breathTimer = null;
      $("#breathOrb").classList.remove("is-breathing");
      $("#breathInstruction").textContent = state.language === "ne" ? "अभ्यास पूरा भयो। अब एक मिनेट मौन बस्नुहोस्।" : "Practice complete. Rest in silence for one minute.";
      $("#breathStart").textContent = state.language === "ne" ? "फेरि सुरु गर्नुहोस्" : "Begin again";
      showToast("१२-मिनेट अभ्यास पूरा भयो।", "12-minute practice complete.");
    }
  }, 1000);
});

class LivingSound {
  constructor() {
    this.context = null;
    this.master = null;
    this.nodes = [];
    this.timers = [];
    this.mode = "silence";
    this.reverb = null;
  }

  async prepare() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.context.createGain();
      this.master.gain.value = .16;
      const compressor = this.context.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.ratio.value = 5;
      this.master.connect(compressor).connect(this.context.destination);
    }
    if (this.context.state === "suspended") await this.context.resume();
  }

  remember(node) {
    this.nodes.push(node);
    return node;
  }

  clear() {
    this.timers.forEach((timer) => clearInterval(timer));
    this.timers = [];
    this.nodes.forEach((node) => {
      try { node.stop?.(); } catch {}
      try { node.disconnect?.(); } catch {}
    });
    this.nodes = [];
    this.mode = "silence";
    this.reverb = null;
  }

  createReverb(seconds = 3.5, decay = 2.4) {
    const convolver = this.remember(this.context.createConvolver());
    const length = Math.floor(this.context.sampleRate * seconds);
    const impulse = this.context.createBuffer(2, length, this.context.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * ((1 - i / length) ** decay);
    }
    convolver.buffer = impulse;
    return convolver;
  }

  drone(frequency, level = .035, detune = 0) {
    const oscillator = this.remember(this.context.createOscillator());
    const gain = this.remember(this.context.createGain());
    const filter = this.remember(this.context.createBiquadFilter());
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.detune.value = detune;
    filter.type = "lowpass";
    filter.frequency.value = 480;
    gain.gain.value = level;
    oscillator.connect(filter).connect(gain).connect(this.master);
    oscillator.start();
  }

  fluteNote(frequency, start, duration) {
    const oscillator = this.remember(this.context.createOscillator());
    const breath = this.remember(this.context.createOscillator());
    const breathGain = this.remember(this.context.createGain());
    const gain = this.remember(this.context.createGain());
    const filter = this.remember(this.context.createBiquadFilter());
    const vibrato = this.remember(this.context.createOscillator());
    const vibratoGain = this.remember(this.context.createGain());
    const reverb = this.reverb;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    breath.type = "triangle";
    breath.frequency.value = frequency * 2.01;
    breathGain.gain.value = .055;
    vibrato.frequency.value = 5.1;
    vibratoGain.gain.value = 4.5;
    vibrato.connect(vibratoGain).connect(oscillator.frequency);
    filter.type = "lowpass";
    filter.frequency.value = 2200;
    filter.Q.value = 1.2;
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(.14, start + .25);
    gain.gain.setValueAtTime(.11, start + Math.max(.35, duration - .4));
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(filter);
    breath.connect(breathGain).connect(filter);
    filter.connect(gain).connect(this.master);
    if (reverb) gain.connect(reverb);
    oscillator.start(start);
    breath.start(start);
    vibrato.start(start);
    oscillator.stop(start + duration + .05);
    breath.stop(start + duration + .05);
    vibrato.stop(start + duration + .05);
  }

  scheduleFlutePhrase() {
    if (this.mode !== "flute") return;
    const scales = [
      [293.66, 329.63, 369.99, 440, 493.88, 587.33],
      [261.63, 293.66, 349.23, 392, 440, 523.25],
    ];
    const scale = scales[Math.floor(Math.random() * scales.length)];
    const now = this.context.currentTime + .12;
    let cursor = 0;
    const count = 7 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i += 1) {
      const frequency = scale[Math.floor(Math.random() * scale.length)];
      const duration = [.72, .96, 1.25, 1.6][Math.floor(Math.random() * 4)];
      this.fluteNote(frequency, now + cursor, duration);
      cursor += duration * .86;
    }
  }

  rain() {
    const length = this.context.sampleRate * 3;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * .22;
    const source = this.remember(this.context.createBufferSource());
    const filter = this.remember(this.context.createBiquadFilter());
    const gain = this.remember(this.context.createGain());
    source.buffer = buffer;
    source.loop = true;
    filter.type = "lowpass";
    filter.frequency.value = 1200;
    gain.gain.value = .055;
    source.connect(filter).connect(gain).connect(this.master);
    source.start();
  }

  bowl() {
    if (this.mode !== "meditation") return;
    const now = this.context.currentTime;
    const base = [146.83, 174.61, 220][Math.floor(Math.random() * 3)];
    [1, 2.01, 3.96].forEach((multiple, index) => {
      const oscillator = this.remember(this.context.createOscillator());
      const gain = this.remember(this.context.createGain());
      oscillator.type = "sine";
      oscillator.frequency.value = base * multiple;
      gain.gain.setValueAtTime(index === 0 ? .13 : .055, now);
      gain.gain.exponentialRampToValueAtTime(.0001, now + 7);
      oscillator.connect(gain).connect(this.master);
      oscillator.start(now);
      oscillator.stop(now + 7.1);
    });
  }

  async start(mode) {
    await this.prepare();
    this.clear();
    this.mode = mode;
    if (mode === "flute") {
      this.reverb = this.createReverb(3.2, 2.7);
      this.reverb.connect(this.master);
      this.drone(146.83, .045);
      this.drone(220, .028, 4);
      this.scheduleFlutePhrase();
      this.timers.push(setInterval(() => this.scheduleFlutePhrase(), 8000));
    } else if (mode === "meditation") {
      this.drone(73.42, .055);
      this.drone(110, .035, -5);
      this.rain();
      this.bowl();
      this.timers.push(setInterval(() => this.bowl(), 9000));
    }
  }
}

const livingSound = new LivingSound();
const wave = $("#soundWave");
if (wave) {
  wave.innerHTML = Array.from({ length: 52 }, (_, index) => `<i style="--i:${index};--h:${12 + Math.round(Math.random() * 62)}"></i>`).join("");
}

function pauseUploadedAudio() {
  $$("audio").forEach((audio) => { audio.pause(); });
}

async function setSoundscape(mode) {
  if (mode === "silence") {
    livingSound.clear();
  } else {
    pauseUploadedAudio();
    await livingSound.start(mode);
  }
  state.soundscape = mode;
  $$("[data-soundscape]").forEach((button) => button.classList.toggle("is-active", button.dataset.soundscape === mode));
  const names = {
    flute: state.language === "ne" ? "अनन्त बाँसुरी" : "Endless flute",
    meditation: state.language === "ne" ? "ध्यान नाद" : "Meditation resonance",
    silence: state.language === "ne" ? "मौनता" : "Silence",
  };
  $("#nowPlaying").textContent = names[mode];
  $("#soundToggle").textContent = mode === "silence" ? "▶" : "■";
  $(".now-playing").classList.toggle("is-playing", mode !== "silence");
  wave?.classList.toggle("is-playing", mode !== "silence");
}

$$("[data-soundscape]").forEach((button) => button.addEventListener("click", () => setSoundscape(button.dataset.soundscape)));
$("#quickFlute")?.addEventListener("click", () => {
  setSoundscape("flute");
  document.querySelector("#sound")?.scrollIntoView({ behavior: "smooth" });
});
$("#soundToggle")?.addEventListener("click", () => setSoundscape(state.soundscape === "silence" ? "flute" : "silence"));

function renderAudio(extra = []) {
  const list = $("#audioList");
  if (!list) return;
  const discovered = extra.filter((item) => item.type === "audio").map((item) => ({
    title: item.title,
    titleNe: item.title,
    duration: "",
    file: item.url,
  }));
  const tracks = [...audioLibrary, ...discovered];
  list.innerHTML = tracks.map((track, index) => `
    <article class="audio-row">
      <button type="button" data-audio-index="${index}" aria-label="Play ${escapeHTML(track.title)}">▶</button>
      <div><strong>${escapeHTML(state.language === "ne" ? track.titleNe : track.title)}</strong><small>${escapeHTML(track.duration || (state.language === "ne" ? "अपलोड गरिएको अडियो" : "Uploaded audio"))}</small></div>
      <audio controls preload="metadata" src="${escapeHTML(safeAssetUrl(track.file, ""))}"></audio>
    </article>`).join("");
  $("#audioCount").textContent = nepaliNumber(tracks.length);
  $$(".audio-row", list).forEach((row) => {
    const audio = $("audio", row);
    const button = $("button", row);
    button.addEventListener("click", () => audio.paused ? audio.play() : audio.pause());
    audio.addEventListener("play", () => {
      livingSound.clear();
      state.soundscape = "silence";
      $$("audio").forEach((other) => { if (other !== audio) other.pause(); });
      $$(".audio-row button").forEach((otherButton) => { otherButton.textContent = otherButton === button ? "Ⅱ" : "▶"; });
      $("#nowPlaying").textContent = $("strong", row).textContent;
      $(".now-playing").classList.add("is-playing");
      wave?.classList.add("is-playing");
    });
    audio.addEventListener("pause", () => {
      button.textContent = "▶";
      if ($$("audio").every((candidate) => candidate.paused)) {
        $(".now-playing").classList.remove("is-playing");
        wave?.classList.remove("is-playing");
      }
    });
  });
}

function renderDynamicMedia(items = []) {
  renderAudio(items);
  const videos = items.filter((item) => item.type === "video");
  const grid = $("#videoGrid");
  videos.forEach((item, index) => {
    const article = document.createElement("article");
    article.className = "video-card reveal in-view";
    const video = document.createElement("video");
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = safeAssetUrl(item.url, "");
    const caption = document.createElement("div");
    const number = document.createElement("span");
    number.textContent = nepaliNumber(String(index + 4).padStart(2, "0"));
    const title = document.createElement("h3");
    title.textContent = item.title || "Video";
    caption.append(number, title);
    article.append(video, caption);
    grid.append(article);
  });
}

renderAudio();
loadContent();
applyLanguage(state.language);

let silenceTimer = null;
function closeSilence() {
  clearInterval(silenceTimer);
  silenceTimer = null;
  $("#silenceOverlay").classList.remove("is-visible");
  $("#silenceOverlay").setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-locked");
}
$("#oneMinuteSilence")?.addEventListener("click", () => {
  setSoundscape("silence");
  let remaining = 60;
  $("#silenceTime").textContent = formatClock(remaining);
  $("#silenceOverlay").classList.add("is-visible");
  $("#silenceOverlay").setAttribute("aria-hidden", "false");
  document.body.classList.add("is-locked");
  silenceTimer = setInterval(() => {
    remaining -= 1;
    $("#silenceTime").textContent = formatClock(remaining);
    if (remaining <= 0) {
      closeSilence();
      showToast("एक मिनेटको मौनता पूरा भयो।", "One minute of silence is complete.");
    }
  }, 1000);
});
$("#silenceClose")?.addEventListener("click", closeSilence);
