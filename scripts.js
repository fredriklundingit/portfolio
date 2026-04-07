// ── LIGHTBOX ─────────────────────────────────────────────────
let lbCurrentId   = null;
let lbCurrentSlide = 0;

function lbOpen(carouselId) {
  lbCurrentId = carouselId;
  const carousel = document.querySelector(`[data-carousel="${carouselId}"]`);
  const slides   = carousel.querySelectorAll('.tp-carousel-slide');
  lbCurrentSlide = [...slides].findIndex(s => s.classList.contains('active'));

  const row      = carousel.closest('.tp-row');
  const title    = row.querySelector('.tp-feature-title')?.textContent || '';
  const desc     = row.querySelector('.tp-feature-desc')?.textContent  || '';
  const overlay  = document.getElementById(`overlay-${carouselId}`);
  const oCodes   = overlay ? overlay.querySelectorAll('.tp-overlay-code') : [];

  const videoEl = document.getElementById('lb-video');
  videoEl.innerHTML = '';
  slides.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'tp-lightbox-slide' + (i === lbCurrentSlide ? ' active' : '');
    div.innerHTML = s.innerHTML;
    videoEl.appendChild(div);
  });

  const codeEl = document.getElementById('lb-code');
  codeEl.innerHTML = '';
  if (oCodes.length) {
    oCodes.forEach((c, i) => {
      const div = document.createElement('div');
      div.className = 'tp-lightbox-code-slide' + (i === lbCurrentSlide ? ' active' : '');
      div.innerHTML = c.innerHTML;
      codeEl.appendChild(div);
    });
  } else {
    codeEl.innerHTML = '<div class="tp-lightbox-code-slide active"><pre><span class="cmt">// Add your code here</span></pre></div>';
  }

  document.getElementById('lb-title').textContent   = title;
  document.getElementById('lb-desc').textContent    = desc;
  document.getElementById('lb-counter').textContent = `${lbCurrentSlide + 1} / ${slides.length}`;

  document.getElementById('tp-lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function lbClose() {
  document.getElementById('tp-lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function lbClickOutside(e) {
  if (e.target === document.getElementById('tp-lightbox')) lbClose();
}

function lbNav(dir) {
  const videoSlides = document.querySelectorAll('#lb-video .tp-lightbox-slide');
  const codeSlides  = document.querySelectorAll('#lb-code .tp-lightbox-code-slide');
  const total = videoSlides.length;

  videoSlides[lbCurrentSlide].classList.remove('active');
  codeSlides[lbCurrentSlide]?.classList.remove('active');

  lbCurrentSlide = (lbCurrentSlide + dir + total) % total;

  videoSlides[lbCurrentSlide].classList.add('active');
  codeSlides[lbCurrentSlide]?.classList.add('active');
  document.getElementById('lb-counter').textContent = `${lbCurrentSlide + 1} / ${total}`;
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') lbClose();
  if (e.key === 'ArrowLeft')  lbNav(-1);
  if (e.key === 'ArrowRight') lbNav(1);
});

// ── CAROUSEL / CODE ───────────────────────────────────────────
function projSlideNav(btn, dir) {
  const bar    = btn.closest('.proj-code-slides-bar');
  const slides = bar.closest('.proj-code-slides').querySelectorAll('.proj-code-slide');
  const counter = bar.querySelector('.proj-slide-counter');
  const total  = slides.length;
  let current  = [...slides].findIndex(s => s.classList.contains('active'));
  slides[current].classList.remove('active');
  current = (current + dir + total) % total;
  slides[current].classList.add('active');
  if (counter) counter.textContent = `${current + 1} / ${total}`;
}

function projToggleCode(btn) {
  const block = btn.nextElementSibling;
  const isOpen = block.style.display !== 'none';
  block.style.display = isOpen ? 'none' : 'block';
  btn.textContent = isOpen ? 'View Code ↓' : 'Hide Code ↑';
  btn.classList.toggle('open', !isOpen);
}

function overlayNav(id, dir) {
  const overlay  = document.getElementById(`overlay-${id}`);
  if (!overlay) return;
  const codes    = overlay.querySelectorAll('.tp-overlay-code');
  const counter  = document.getElementById(`overlay-counter-${id}`);
  const total    = codes.length;
  let current    = [...codes].findIndex(c => c.classList.contains('active'));
  codes[current].classList.remove('active');
  current = (current + dir + total) % total;
  codes[current].classList.add('active');
  if (counter) counter.textContent = `${current + 1} / ${total}`;
}

function carouselNav(id, dir) {
  const carousel = document.querySelector(`[data-carousel="${id}"]`);
  const slides   = carousel.querySelectorAll('.tp-carousel-slide');
  const counter  = carousel.querySelector('.tp-carousel-counter');
  const overlay  = document.getElementById(`overlay-${id}`);
  const oCounter = document.getElementById(`overlay-counter-${id}`);
  const oCodes   = overlay ? overlay.querySelectorAll('.tp-overlay-code') : [];

  let current = [...slides].findIndex(s => s.classList.contains('active'));
  slides[current].classList.remove('active');
  current = (current + dir + slides.length) % slides.length;
  slides[current].classList.add('active');

  const label = `${current + 1} / ${slides.length}`;
  if (counter) counter.textContent = label;
  if (oCounter) oCounter.textContent = label;

  oCodes.forEach(c => c.classList.remove('active'));
  if (oCodes[current]) oCodes[current].classList.add('active');
}

function carouselPrev(id) { carouselNav(id, -1); }
function carouselNext(id) { carouselNav(id,  1); }

function carouselToggleCode(id) {
  const overlay = document.getElementById(`overlay-${id}`);
  const toggle  = document.querySelector(`[data-carousel="${id}"] .tp-code-toggle`);
  if (!overlay) return;

  const isOpen = overlay.classList.contains('visible');
  overlay.classList.toggle('visible', !isOpen);
  if (toggle) {
    toggle.textContent = isOpen ? 'View Code ↓' : 'Hide Code ↑';
    toggle.classList.toggle('open', !isOpen);
  }
}

function toggleCode(btn) {
  const block = btn.nextElementSibling;
  const isOpen = block.style.display !== 'none';
  block.style.display = isOpen ? 'none' : 'block';
  btn.textContent = isOpen ? 'View Code ↓' : 'Hide Code ↑';
  btn.classList.toggle('open', !isOpen);
}

// ── VIDEO SETUP ───────────────────────────────────────────────
const playingVideos = new Set();

function setupHoverVideo(vid, hoverTarget) {
  vid.muted = true;
  vid.loop  = true;
  hoverTarget.addEventListener('mouseenter', () => {
    if (vid.dataset.src && !vid.getAttribute('src')) {
      vid.src = vid.dataset.src;
    }
    vid.play().catch(() => {});
    playingVideos.add(vid);
  });
  hoverTarget.addEventListener('mouseleave', () => {
    vid.pause();
    playingVideos.delete(vid);
  });
}

function setupProjectVideo(vid) {
  const row = vid.closest('.project-row');
  if (row) setupHoverVideo(vid, row);
}

function setupToolVideo(vid) {
  vid.muted = true;
  vid.loop  = true;
  if (vid.dataset.src && !vid.getAttribute('src')) {
    vid.src = vid.dataset.src;
  }
  vid.play().catch(() => {});
  playingVideos.add(vid);
}

function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });
  els.forEach(el => { el.classList.remove('visible'); obs.observe(el); });
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    document.querySelectorAll('video').forEach(v => { if (!v.paused) v.pause(); });
  } else {
    document.querySelectorAll('.tool-card video').forEach(vid => {
      vid.play().catch(() => {});
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('dragover',  e => e.preventDefault());
  document.addEventListener('drop',      e => e.preventDefault());

  // Carousel track click → lightbox (tool pages only)
  document.querySelectorAll('.tp-carousel-track').forEach(track => {
    const id = track.closest('[data-carousel]')?.dataset.carousel;
    if (id) track.addEventListener('click', () => lbOpen(id));
  });

  // Video setup
  document.querySelectorAll('video[data-src]').forEach(vid => {
    if (vid.closest('.tool-card')) {
      setupToolVideo(vid);
    } else if (vid.closest('.project-thumb')) {
      setupProjectVideo(vid);
    } else {
      const container = vid.closest('.tp-row')
        || vid.closest('.proj-contribution-border')
        || vid.closest('.proj-twocol')
        || vid.closest('.tp-hero')
        || vid.closest('.proj-hero')
        || vid.closest('.other-project-card')
        || vid.parentElement;
      if (container) setupHoverVideo(vid, container);
    }
  });

  initReveal();
});
