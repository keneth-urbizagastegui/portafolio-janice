const ACCENT_COLOR = "#B0A171";

const PLACEHOLDER_ITEMS = [
  { title: "Postre 1", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", src: "https://via.placeholder.com/800x600" },
  { title: "Postre 2", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", src: "https://via.placeholder.com/600x800" },
  { title: "Postre 3", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", src: "https://via.placeholder.com/1200x800" },
  { title: "Postre 4", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", src: "https://via.placeholder.com/700x900" },
  { title: "Postre 5", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", src: "https://via.placeholder.com/900x700" },
  { title: "Postre 6", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", src: "https://via.placeholder.com/900x1200" },
  { title: "Postre 7", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", src: "https://via.placeholder.com/800x1000" },
  { title: "Postre 8", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", src: "https://via.placeholder.com/1000x800" },
  { title: "Postre 9", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", src: "https://via.placeholder.com/600x600" },
  { title: "Postre 10", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", src: "https://via.placeholder.com/1200x1200" },
  { title: "Postre 11", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", src: "https://via.placeholder.com/640x960" },
  { title: "Postre 12", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", src: "https://via.placeholder.com/960x640" }
];

async function loadImages() {
  try {
    const res = await fetch("images/images.json", { cache: "no-store" });
    if (!res.ok) throw new Error("No images.json");
    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) throw new Error("Empty images.json");
    return items;
  } catch (e) {
    return PLACEHOLDER_ITEMS;
  }
}

function createGalleryItem(item) {
  const wrap = document.createElement("figure");
  wrap.className = "gallery-item";
  wrap.tabIndex = 0;

  const img = document.createElement("img");
  img.className = "gallery-img";
  img.src = encodeURI(item.src);
  img.alt = item.alt || item.title || "Trabajo de pastelería";
  img.loading = "lazy";
  img.decoding = "async";
  img.onerror = () => {
    const fallback = (encodeURI(item.src || "").replace(/\.png$/i, ".jpg")) || "";
    if (fallback && fallback !== img.src){
      img.src = fallback;
    }
  };

  const overlay = document.createElement("figcaption");
  overlay.className = "gallery-overlay";
  overlay.innerHTML = `
    <h3 class="overlay-title">${item.title || "Título"}</h3>
    <p class="overlay-desc">${item.desc || "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}</p>
  `;

  wrap.appendChild(img);
  wrap.appendChild(overlay);

  // Sin toggles: overlay solo por hover

  return wrap;
}

function observeVisibility(el) {
  const io = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    }
  }, { rootMargin: "80px" });
  io.observe(el);
}

async function initGallery() {
  const container = document.getElementById("gallery");
  if (!container) return;
  const items = await loadImages();
  items.forEach((item) => {
    const node = createGalleryItem(item);
    container.appendChild(node);
    observeVisibility(node);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.style.setProperty("--accent", ACCENT_COLOR);
  initGallery();
  setupHeroImage();
  initParallaxHero();
});

function initParallaxHero(){
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  const heroImg = document.querySelector('.hero-image');
  if (!heroImg) return;
  let latestY = 0; let ticking = false;
  const MAX_OFFSET = 60; // px, clamp para móvil

  function onScroll(){
    latestY = window.scrollY || window.pageYOffset;
    if (!ticking){
      window.requestAnimationFrame(() => {
        const offset = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, latestY * 0.15));
        heroImg.style.transform = `translateY(${offset * -1}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

async function setupHeroImage(){
  const el = document.querySelector('.hero-image');
  if (!el) return;
  const candidates = ['images/hero.webp','images/hero.jpeg','images/hero.jpg','images/hero.png'];
  for (const raw of candidates){
    const src = encodeURI(raw);
    const ok = await new Promise((resolve) => {
      const test = new Image();
      test.decoding = 'async';
      test.onload = () => resolve(true);
      test.onerror = () => resolve(false);
      test.src = src;
    });
    if (ok){
      el.src = src;
      const preload = document.querySelector('link[rel="preload"][as="image"]');
      if (preload) preload.href = src;
      const og = document.querySelector('meta[property="og:image"]');
      if (og) og.setAttribute('content', src);
      break;
    }
  }
}
