/* ========== VIBE MOTION: simulated browsing flow ========== */
(function() {
  const cursor = document.getElementById('vibe-cursor');
  const progressBar = document.getElementById('vibe-progress-bar');
  const stepLabel = document.getElementById('vibe-step');
  const replayBtn = document.getElementById('vibe-replay');
  const nav = document.getElementById('nav');
  const bgmBtn = document.getElementById('bgm-toggle');
  const slides = document.querySelectorAll('.gallery-slide');

  const steps = [
    { t: 0, label: '准备就绪' },
    { t: 0.05, label: 'Landing' },
    { t: 0.15, label: '切换 BGM' },
    { t: 0.25, label: '进入作品' },
    { t: 0.38, label: '浏览画廊' },
    { t: 0.58, label: '横向滚动' },
    { t: 0.75, label: 'Statement' },
    { t: 0.85, label: '关于' },
    { t: 0.95, label: '结束' },
  ];

  function setStep(progress) {
    const step = steps.slice().reverse().find(s => progress >= s.t);
    if (step && stepLabel) stepLabel.textContent = step.label;
    if (progressBar) progressBar.style.width = (progress * 100) + '%';
  }

  function getCenter(el) {
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function dispatchMouseEvent(el, type, x, y) {
    const evt = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      relatedTarget: el,
    });
    el.dispatchEvent(evt);
  }

  function simulateHover(el, enter) {
    if (!el) return;
    if (enter) el.classList.add('hover');
    else el.classList.remove('hover');
  }

  function initTilt() {
    slides.forEach(function(slide) {
      const inner = slide.querySelector('.gallery-slide-inner');
      if (!inner) return;
      slide.addEventListener('mousemove', function(e) {
        const rect = slide.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tx = ((y - 0.5) * -10).toFixed(1);
        const ty = ((x - 0.5) * 10).toFixed(1);
        inner.style.transform = 'perspective(1000px) rotateX(' + tx + 'deg) rotateY(' + ty + 'deg) scale(0.95)';
      });
      slide.addEventListener('mouseleave', function() {
        inner.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(0.95)';
      });
    });
  }

  function buildTimeline() {
    const tl = gsap.timeline({
      onUpdate: function() { setStep(tl.progress()); },
      onComplete: function() {
        gsap.to(cursor, { opacity: 0, duration: 0.5 });
      }
    });

    const ww = window.innerWidth;
    const wh = window.innerHeight;

    // Initial states
    gsap.set(cursor, { x: ww / 2, y: wh / 2, opacity: 0, scale: 0.8 });
    gsap.set(nav, { y: -20, opacity: 0 });
    gsap.set('.hero-content', { opacity: 0, y: 40 });
    gsap.set('.hero-scroll', { opacity: 0 });

    // 0.0 - 1.5s: reveal nav + cursor
    tl.to(cursor, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, 0.3)
      .to(nav, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 0)
      .to('.hero-content', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, 0.4)
      .to('.hero-scroll', { opacity: 1, duration: 0.8 }, 1.2);

    // 1.5 - 3.0s: cursor moves to BGM toggle and clicks
    const bgmCenter = getCenter(bgmBtn);
    tl.to(cursor, { x: bgmCenter.x, y: bgmCenter.y, duration: 0.8, ease: 'power2.inOut' }, 1.6)
      .add(function() { cursor.classList.add('click'); }, 2.2)
      .add(function() {
        bgmBtn.dataset.playing = 'false';
        bgmBtn.style.color = 'rgba(255,255,255,0.4)';
      }, 2.3)
      .add(function() { cursor.classList.remove('click'); }, 2.5);

    // 3.0 - 4.5s: cursor hovers gallery nav link then scrolls
    const galleryLink = document.querySelector('.nav-links a[href="#gallery"]');
    const linkCenter = getCenter(galleryLink);
    tl.to(cursor, { x: linkCenter.x, y: linkCenter.y, duration: 0.8, ease: 'power2.inOut' }, 3.0)
      .add(function() { simulateHover(galleryLink, true); }, 3.5)
      .add(function() { simulateHover(galleryLink, false); }, 4.0)
      .to(window, { duration: 1.5, scrollTo: { y: '#gallery', offsetY: 0 }, ease: 'power2.inOut' }, 4.0);

    // 4.5 - 8.0s: browse first 3 slides with tilt
    slides.forEach(function(slide, i) {
      if (i >= 3) return;
      const center = getCenter(slide);
      const start = 5.0 + i * 1.2;
      tl.to(cursor, { x: center.x, y: center.y, duration: 0.6, ease: 'power2.inOut' }, start)
        .add(function() {
          const c = getCenter(slide);
          dispatchMouseEvent(slide, 'mouseenter', c.x, c.y);
          dispatchMouseEvent(slide, 'mousemove', c.x, c.y);
        }, start + 0.4)
        .add(function() {
          const rect = slide.getBoundingClientRect();
          dispatchMouseEvent(slide, 'mousemove', rect.left + rect.width * 0.7, rect.top + rect.height * 0.4);
        }, start + 0.7)
        .add(function() {
          dispatchMouseEvent(slide, 'mouseleave', center.x, center.y);
        }, start + 1.0);
    });

    // 8.0 - 13.0s: horizontal gallery scroll
    const track = document.getElementById('gallery-track');
    if (track) {
      const maxScroll = track.scrollWidth - track.clientWidth;
      tl.to(track, { x: -Math.max(0, maxScroll), duration: 4, ease: 'none' }, 8.0)
        .to(cursor, {
          motionPath: {
            path: [
              { x: ww * 0.3, y: wh * 0.55 },
              { x: ww * 0.5, y: wh * 0.55 },
              { x: ww * 0.7, y: wh * 0.55 },
            ],
            curviness: 1.2,
          },
          duration: 4,
          ease: 'none',
        }, 8.0);
    }

    // 13.0 - 15.5s: scroll to statement
    tl.to(window, { duration: 1.8, scrollTo: { y: '#statement', offsetY: 0 }, ease: 'power2.inOut' }, 13.0)
      .to(cursor, { x: ww * 0.5, y: wh * 0.5, duration: 1.2, ease: 'power2.inOut' }, 13.0);

    // 15.5 - 18.0s: scroll to about
    tl.to(window, { duration: 1.8, scrollTo: { y: '#about', offsetY: 0 }, ease: 'power2.inOut' }, 15.5)
      .to(cursor, { x: ww * 0.25, y: wh * 0.45, duration: 1.2, ease: 'power2.inOut' }, 15.8);

    // 18.0 - 20.0s: hover portrait
    const portrait = document.querySelector('.about-portrait');
    if (portrait) {
      const pc = getCenter(portrait);
      tl.to(cursor, { x: pc.x, y: pc.y, duration: 0.8, ease: 'power2.inOut' }, 18.0)
        .add(function() { simulateHover(portrait, true); }, 18.5)
        .add(function() { simulateHover(portrait, false); }, 19.3);
    }

    // 20.0 - 22.0s: back to top / end
    tl.to(window, { duration: 1.5, scrollTo: { y: 0 }, ease: 'power2.inOut' }, 20.0)
      .to(cursor, { x: ww * 0.5, y: wh * 0.5, duration: 1.2 }, 20.0)
      .add(function() { setStep(1); }, 21.5);

    return tl;
  }

  function start() {
    initTilt();
    const tl = buildTimeline();

    if (replayBtn) {
      replayBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'instant' });
        const track = document.getElementById('gallery-track');
        if (track) gsap.set(track, { x: 0 });
        bgmBtn.dataset.playing = 'true';
        cursor.classList.remove('click');
        tl.restart();
      });
    }
  }

  // Wait for GSAP + plugins
  function waitForGSAP() {
    if (typeof gsap !== 'undefined' && typeof gsap.to === 'function' &&
        typeof gsap.to(window, { scrollTo: 0, duration: 0.01 }) !== 'undefined') {
      start();
    } else {
      setTimeout(waitForGSAP, 100);
    }
  }

  waitForGSAP();
})();
