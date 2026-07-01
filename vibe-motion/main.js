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

  function waitForReady(callback) {
    const check = function() {
      const win = getInnerWin();
      const doc = getInnerDoc();
      if (win && doc && doc.readyState === 'complete' &&
          typeof win.gsap !== 'undefined' &&
          doc.querySelector('.gallery-slide')) {
        // 再预留 600ms 让主站 entrance 动画完成
        setTimeout(callback, 600);
      } else {
        setTimeout(check, 200);
      }
    };
    iframe.addEventListener('load', check);
    check();
  }

  function buildTimeline() {
    const win = getInnerWin();
    const doc = getInnerDoc();
    if (!win || !doc) return;

    const ww = window.innerWidth;
    const wh = window.innerHeight;
    const galleryTrack = doc.getElementById('gallery-track');

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
    tl.to(cursor, { x: bgmCenter.x, y: bgmCenter.y, duration: 0.8, ease: 'power2.inOut' }, 1.2)
      .add(function() { cursor.classList.add('click'); }, 2.0)
      .add(function() { dispatch(bgmBtn, 'click', bgmCenter.x, bgmCenter.y); }, 2.1)
      .add(function() { cursor.classList.remove('click'); }, 2.5);

    // 3.0 - 4.8s: hover nav gallery link
    const galleryLink = doc.querySelector('.nav-links a[href="#gallery"]');
    const linkCenter = getCenter(galleryLink);
    tl.to(cursor, { x: linkCenter.x, y: linkCenter.y, duration: 0.8, ease: 'power2.inOut' }, 3.0)
      .add(function() { dispatch(galleryLink, 'mouseenter', linkCenter.x, linkCenter.y); }, 3.6)
      .add(function() { dispatch(galleryLink, 'mouseleave', linkCenter.x, linkCenter.y); }, 4.4);

    // 4.8 - 7.0s: scroll to gallery
    const gallerySection = doc.getElementById('gallery');
    const galleryTop = gallerySection ? gallerySection.offsetTop : 0;
    scrollTo(galleryTop, 1.6, 4.8, tl);

    // 7.0 - 13.0s: browse gallery slides + horizontal scroll
    const slides = doc.querySelectorAll('.gallery-slide');
    const firstThree = Array.prototype.slice.call(slides, 0, 3);
    firstThree.forEach(function(slide, i) {
      const start = 7.0 + i * 1.4;
      const center = getCenter(slide);
      tl.to(cursor, { x: center.x, y: center.y, duration: 0.6, ease: 'power2.inOut' }, start)
        .add(function() { dispatch(slide, 'mouseenter', center.x, center.y); }, start + 0.4)
        .add(function() {
          const rect = slide.getBoundingClientRect();
          dispatch(slide, 'mousemove', rect.left + rect.width * 0.65, rect.top + rect.height * 0.45);
        }, start + 0.6)
        .add(function() { dispatch(slide, 'mouseleave', center.x, center.y); }, start + 1.1);
    });

    // Continue scrolling through gallery to trigger horizontal pin
    scrollTo(galleryTop + 2000, 4.5, 9.0, tl);

    // 13.0 - 15.5s: scroll to statement
    const statement = doc.getElementById('statement-text') || doc.querySelector('.statement');
    const statementTop = statement ? (statement.closest('section') || statement).offsetTop : (galleryTop + 2500);
    scrollTo(statementTop, 1.8, 13.0, tl);
    tl.to(cursor, { x: ww * 0.5, y: wh * 0.5, duration: 1.2, ease: 'power2.inOut' }, 13.2);

    // 15.5 - 18.0s: scroll to about
    const about = doc.getElementById('about');
    const aboutTop = about ? about.offsetTop : (statementTop + 800);
    scrollTo(aboutTop, 1.8, 15.5, tl);
    tl.to(cursor, { x: ww * 0.25, y: wh * 0.45, duration: 1.2, ease: 'power2.inOut' }, 15.8);

    // 18.0 - 20.0s: hover about portrait
    const portrait = doc.querySelector('.about-portrait');
    if (portrait) {
      const pc = getCenter(portrait);
      tl.to(cursor, { x: pc.x, y: pc.y, duration: 0.8, ease: 'power2.inOut' }, 18.0)
        .add(function() { dispatch(portrait, 'mouseenter', pc.x, pc.y); }, 18.5)
        .add(function() { dispatch(portrait, 'mousemove', pc.x, pc.y); }, 18.6)
        .add(function() { dispatch(portrait, 'mouseleave', pc.x, pc.y); }, 19.4);
    }

    // 20.0 - 22.0s: back to top
    scrollTo(0, 1.5, 20.0, tl);
    tl.to(cursor, { x: ww * 0.5, y: wh * 0.5, duration: 1.2 }, 20.0);

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
