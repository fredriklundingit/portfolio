// ── VIDEO POPUP ───────────────────────────────────────────────
function videoPopupOpen(src) {
  const popup = document.getElementById('video-popup');
  const vid   = document.getElementById('video-popup-vid');
  if (!popup || !vid) return;
  vid.src = src;
  vid.play().catch(() => {});
  popup.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function videoPopupClose() {
  const popup = document.getElementById('video-popup');
  const vid   = document.getElementById('video-popup-vid');
  if (!popup || !vid) return;
  vid.pause();
  vid.src = '';
  popup.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') videoPopupClose();
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

  // Click outside popup to close
  const popup = document.getElementById('video-popup');
  if (popup) {
    popup.addEventListener('click', e => {
      if (e.target === popup) videoPopupClose();
    });
  }

  // Carousel track click → video popup (tool pages)
  document.querySelectorAll('.tp-carousel-track').forEach(track => {
    track.addEventListener('click', () => {
      const activeSlide = track.querySelector('.tp-carousel-slide.active');
      if (!activeSlide) return;
      const vid = activeSlide.querySelector('video');
      if (!vid) return;
      const src = vid.getAttribute('src') || vid.dataset.src;
      if (src) videoPopupOpen(src);
    });
  });

  // Project/contribution videos click → video popup
  // Only on proj-page elements, not tool pages
  const projPage = document.querySelector('.proj-page');
  if (projPage) {
    projPage.querySelectorAll('.proj-twocol-media video, .proj-hero video, .proj-contribution-media video, .proj-contribution-media-full video, .proj-compare video, .other-project-thumb video').forEach(vid => {
      vid.style.cursor = 'pointer';
      vid.addEventListener('click', () => {
        const src = vid.getAttribute('src') || vid.dataset.src;
        if (src) videoPopupOpen(src);
      });
    });
  }

  // ── Video setup ───────────────────────────────────────────────
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
