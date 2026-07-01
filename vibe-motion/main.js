/* ========== VIBE MOTION: real browsing flow simulation ========== */
(function() {
  const iframe = document.getElementById('site-frame');
  const cursor = document.getElementById('cursor');

  function getInnerDoc() {
    return iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
  }

  function getInnerWin() {
    return iframe.contentWindow;
  }

  function getCenter(el) {
    if (!el) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function dispatch(el, type, x, y) {
    if (!el) return;
    const evt = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      relatedTarget: el,
      view: getInnerWin(),
    });
    el.dispatchEvent(evt);
  }

  function scrollTo(y, duration, position, tl) {
    const win = getInnerWin();
    if (!win) return;
    const start = win.scrollY;
    const proxy = { v: start };
    tl.to(proxy, {
      v: y,
      duration: duration,
      ease: 'power2.inOut',
      onUpdate: function() {
        win.scrollTo(0, proxy.v);
      }
    }, position);
  }

  // 平滑移动光标，确保落点准确以便触发对应元素的交互
  function moveCursor(x, y, duration, position, tl) {
    tl.to(cursor, { x: x, y: y, duration: duration, ease: 'power2.inOut' }, position);
    return tl;
  }

  function waitForReady(callback) {
    let attempts = 0;
    const check = function() {
      attempts++;
      const win = getInnerWin();
      const doc = getInnerDoc();

      if (!win || !doc || !doc.body || !doc.body.children.length) {
        if (attempts > 25) {
          console.error('[Vibe Motion] iframe did not load. Use an HTTP server (e.g. python -m http.server 8080) instead of opening file://');
          return;
        }
        setTimeout(check, 200);
        return;
      }

      const galleryReady = doc.querySelector('.gallery-slide');
      const gsapReady = typeof win.gsap !== 'undefined';
      const pinReady = typeof win.__galleryPinEnd === 'number' && win.__galleryPinEnd > 0;

      if (doc.readyState === 'complete' && galleryReady && gsapReady && pinReady) {
        console.log('[Vibe Motion] iframe ready, pin end:', win.__galleryPinEnd);
        setTimeout(callback, 800);
      } else {
        if (attempts > 120) {
          console.error('[Vibe Motion] timeout waiting for iframe GSAP / gallery pin');
          return;
        }
        setTimeout(check, 200);
      }
    };
    iframe.addEventListener('load', check);
    check();
  }

  function getGalleryPinEnd(doc, win, galleryTop) {
    if (win.__galleryPinEnd) return win.__galleryPinEnd;
    // fallback: rough estimate
    const track = doc.getElementById('gallery-track');
    if (track) {
      return galleryTop + Math.max(0, track.scrollWidth - win.innerWidth) + win.innerHeight;
    }
    return galleryTop + 2500;
  }

  function buildTimeline() {
    const win = getInnerWin();
    const doc = getInnerDoc();
    if (!win || !doc) return;

    const ww = window.innerWidth;
    const wh = window.innerHeight;

    const gallerySection = doc.getElementById('gallery');
    const galleryTop = gallerySection ? gallerySection.offsetTop : 0;
    const galleryPinEnd = getGalleryPinEnd(doc, win, galleryTop);

    const statement = doc.getElementById('statement-text') || doc.querySelector('.statement');
    const statementTop = statement ? (statement.closest('section') || statement).offsetTop : (galleryPinEnd + 800);

    const about = doc.getElementById('about');
    const aboutTop = about ? about.offsetTop : (statementTop + 800);

    const tl = gsap.timeline({
      onComplete: function() {
        gsap.to(cursor, { opacity: 0, duration: 0.6 });
      }
    });

    gsap.set(cursor, { x: ww / 2, y: wh / 2, opacity: 0 });

    // 0.0 - 1.2s: cursor fades in
    tl.to(cursor, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.4);

    // 1.2 - 3.0s: toggle BGM
    const bgmBtn = doc.getElementById('bgm-toggle');
    const bgmCenter = getCenter(bgmBtn);
    moveCursor(bgmCenter.x, bgmCenter.y, 0.8, 1.2, tl)
      .add(function() { cursor.classList.add('click'); }, 2.0)
      .add(function() { dispatch(bgmBtn, 'click', bgmCenter.x, bgmCenter.y); }, 2.1)
      .add(function() { cursor.classList.remove('click'); }, 2.5);

    // 3.0 - 4.8s: hover nav gallery link
    const galleryLink = doc.querySelector('.nav-links a[href="#gallery"]');
    const linkCenter = getCenter(galleryLink);
    moveCursor(linkCenter.x, linkCenter.y, 0.8, 3.0, tl)
      .add(function() { dispatch(galleryLink, 'mouseenter', linkCenter.x, linkCenter.y); }, 3.6)
      .add(function() { dispatch(galleryLink, 'mouseleave', linkCenter.x, linkCenter.y); }, 4.4);

    // 4.8 - 6.6s: scroll to gallery top
    scrollTo(galleryTop, 1.8, 4.8, tl);

    // 6.6 - 12.6s: horizontal gallery scroll (must not overlap with other scroll tweens)
    scrollTo(galleryPinEnd, 6.0, 6.6, tl);

    // 12.6 - 14.6s: cursor browses slides while horizontal scroll happens
    const slides = doc.querySelectorAll('.gallery-slide');
    const browseSlides = Array.prototype.slice.call(slides, 0, 4);
    browseSlides.forEach(function(slide, i) {
      const start = 7.0 + i * 1.2;
      const center = getCenter(slide);
      moveCursor(center.x, center.y, 0.5, start, tl)
        .add(function() { dispatch(slide, 'mouseenter', center.x, center.y); }, start + 0.3)
        .add(function() {
          const rect = slide.getBoundingClientRect();
          dispatch(slide, 'mousemove', rect.left + rect.width * 0.6, rect.top + rect.height * 0.45);
        }, start + 0.5)
        .add(function() { dispatch(slide, 'mouseleave', center.x, center.y); }, start + 0.9);
    });

    // 14.6 - 16.8s: scroll to statement
    scrollTo(statementTop, 2.2, 14.6, tl);
    tl.to(cursor, { x: ww * 0.5, y: wh * 0.5, duration: 1.2, ease: 'power2.inOut' }, 14.8);

    // 16.8 - 19.0s: scroll to about
    scrollTo(aboutTop, 2.2, 16.8, tl);
    moveCursor(ww * 0.25, wh * 0.45, 1.2, 17.2, tl);

    // 19.0 - 21.0s: hover about portrait
    const portrait = doc.querySelector('.about-portrait');
    if (portrait) {
      const pc = getCenter(portrait);
      moveCursor(pc.x, pc.y, 0.8, 19.0, tl)
        .add(function() { dispatch(portrait, 'mouseenter', pc.x, pc.y); }, 19.5)
        .add(function() { dispatch(portrait, 'mousemove', pc.x, pc.y); }, 19.6)
        .add(function() { dispatch(portrait, 'mouseleave', pc.x, pc.y); }, 20.4);
    }

    // 21.0 - 23.0s: back to top
    scrollTo(0, 2.0, 21.0, tl);
    moveCursor(ww * 0.5, wh * 0.5, 1.2, 21.0, tl);

    return tl;
  }

  function start() {
    const tl = buildTimeline();
    if (!tl) {
      console.warn('[Vibe Motion] failed to build timeline');
    }
  }

  waitForReady(start);
})();
