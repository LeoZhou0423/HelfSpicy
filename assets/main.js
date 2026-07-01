const I18N = {
  "zh-CN": {
    nav_gallery: "作品", nav_about: "关于",
    hero_name: "辣不死的堡", hero_title: "<em>形式</em>追随光影",
    scroll_hint: "滚动",
    gallery_title: "Selected Work", gallery_subtitle: "Light and geometry",
    statement: "用镜头捕捉<em>几何</em>与<em>光影</em>的交汇。",
    about_label: "关于", about_name: "辣不死的堡",
    about_bio: "13岁，来自杭州。喜欢观察城市与自然的交汇，在几何线条与光影变化中寻找画面的秩序。",
    about_focus: "创作方向", about_focus_val: "街头 / 建筑 / 光影",
    about_base: "所在地", about_base_val: "中国杭州",
    footer_copy: "2026 辣不死的堡"
  },
  "en": {
    nav_gallery: "Work", nav_about: "About",
    hero_name: "辣不死的堡", hero_title: "<em>Form</em> Follows Light",
    scroll_hint: "Scroll",
    gallery_title: "Selected Work", gallery_subtitle: "Light and geometry",
    statement: "Capturing the intersection of <em>geometry</em> and <em>light</em>.",
    about_label: "About", about_name: "辣不死的堡",
    about_bio: "13 years old, from Hangzhou. Observing the meeting of city and nature, finding order in geometry and shifting light.",
    about_focus: "Focus", about_focus_val: "Street / Architecture / Light",
    about_base: "Base", about_base_val: "Hangzhou, China",
    footer_copy: "2026 辣不死的堡"
  }
};

let currentLang = 'zh-CN';
let heroScrollAnim;
let isFirstSetLang = true;
function setLang(lang) {
  currentLang = lang;
  document.body.dataset.lang = lang;
  document.querySelectorAll('.lang-switcher button').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.dataset.i18n;
    if (I18N[lang] && I18N[lang][k]) {
      if (k === 'hero_title' || k === 'statement') el.innerHTML = I18N[lang][k];
      else el.textContent = I18N[lang][k];
    }
  });
  ['name','email','message'].forEach(id => { const el = document.getElementById(id); if (el) el.placeholder = ''; });
  localStorage.setItem('lang', lang);
  splitTextRefresh();
  initStatementWords(); // 重新创建 ScrollTrigger
  // 同步 nav hover 翻转文字
  document.querySelectorAll('.nav-links a[data-text]').forEach(function(link) {
    var span = link.querySelector('[data-i18n]');
    if (span && span.dataset.i18n && I18N[lang] && I18N[lang][span.dataset.i18n]) {
      link.dataset.text = I18N[lang][span.dataset.i18n];
    }
  });
  // 首次加载由 initCinematicEntrance 负责入场动画，切换语言时才重新播放
  if (!isFirstSetLang) {
    gsap.fromTo('.hero-name span', { opacity:0, y:'110%', rotateX:-80 }, { opacity:1, y:'0%', rotateX:0, duration:1, stagger:0.03, ease:'power3.out' });
    gsap.fromTo('.hero-title span', { opacity:0, y:'110%', rotateX:-80 }, { opacity:1, y:'0%', rotateX:0, duration:1.2, stagger:0.025, ease:'power3.out' });
  }
  isFirstSetLang = false;
  updateHeroScroll();
}
/* ========== GSAP LOAD GUARD ========== */
function waitForGsapReady(callback, timeout) {
  timeout = timeout || 8000;
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    callback();
    return;
  }
  var elapsed = 0;
  var timer = setInterval(function() {
    elapsed += 100;
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      clearInterval(timer);
      callback();
    } else if (elapsed >= timeout) {
      clearInterval(timer);
      console.warn('[HalfSpicy] GSAP/ScrollTrigger failed to load within timeout');      callback();
    }
  }, 100);
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const isMobile = window.matchMedia('(pointer:coarse)').matches;

document.querySelectorAll('.lang-switcher button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
const savedLang = localStorage.getItem('lang');
setLang(savedLang && I18N[savedLang] ? savedLang : 'zh-CN');

/* ========== LENIS SMOOTH SCROLL ========== */
let lenis;
function initLenis() {
  if (prefersReducedMotion || isMobile) return;
  lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
}

/* ========== CUSTOM CURSOR ========== */
const cursor = document.getElementById('cursor');
let cursorX = 0, cursorY = 0, targetX = 0, targetY = 0;
let cursorVisible = false;

function initCursor() {
  if (isMobile || !cursor) return;
  document.addEventListener('mousemove', e => {
    targetX = e.clientX; targetY = e.clientY;
    if (!cursorVisible) { cursor.style.opacity = 1; cursorVisible = true; }
  });
  document.addEventListener('mouseleave', () => { cursor.style.opacity = 0; cursorVisible = false; });

  function animateCursor() {
    cursorX += (targetX - cursorX) * 0.15;
    cursorY += (targetY - cursorY) * 0.15;
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover states
  document.querySelectorAll('a, button, .view-trigger').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      if (el.classList.contains('view-trigger')) cursor.classList.add('view');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover', 'view');
    });
  });
}

/* ========== MAGNETIC ELEMENTS ========== */
function initMagnetic() {
  if (isMobile) return;
  document.querySelectorAll('.magnetic').forEach(el => {
    const strength = parseFloat(el.dataset.strength) || 0.3;
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * strength, y: y * strength, duration: 0.4, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    });
  });
}

/* ========== SCROLL PROGRESS ========== */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  gsap.to(bar, {
    width: '100%',
    ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: 'max bottom', scrub: 1.5 }
  });
}

/* ========== TEXT SPLIT UTILS ========== */
function splitText(selector) {
  document.querySelectorAll(selector).forEach(el => {
    if (el.dataset.split) return;
    el.dataset.split = 'true';
    const text = el.textContent;
    el.innerHTML = '';
    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.transform = 'translateY(110%) rotateX(-80deg)';
      el.appendChild(span);
    });
  });
}

function splitWords(selector) {
  const el = document.querySelector(selector);
  if (!el || el.dataset.splitWords) return;
  el.dataset.splitWords = 'true';
  const html = el.innerHTML;
  const temp = document.createElement('div'); temp.innerHTML = html;
  el.innerHTML = '';
  temp.childNodes.forEach(function(node) {
    if (node.nodeType === 3) {
      node.textContent.split(/(\s+)/).forEach(function(word) {
        if (!word.trim()) { el.appendChild(document.createTextNode(word)); return; }
        var span = document.createElement('span');
        span.className = 'word'; span.textContent = word;
        el.appendChild(span);
      });
    } else if (node.nodeType === 1) {
      var tag = node.tagName;
      node.textContent.split(/(\s+)/).forEach(function(word) {
        if (!word.trim()) { el.appendChild(document.createTextNode(word)); return; }
        var span = document.createElement('span');
        span.className = 'word';
        var inner = document.createElement(tag);
        inner.textContent = word;
        span.appendChild(inner);
        el.appendChild(span);
      });
    }
  });
}

function splitTextRefresh() {
  document.querySelectorAll('[data-split]').forEach(el => { el.dataset.split = ''; });
  document.querySelector('#statement-text').dataset.splitWords = '';
  splitText('.hero-name');
  splitText('.hero-title');
  splitWords('#statement-text');
}

/* ========== HERO 6 LAYER PARALLAX ========== */
let heroParallaxLayers = [];
let heroMouseX = 0, heroMouseY = 0;
let heroTargetMouseX = 0, heroTargetMouseY = 0;
let heroParallaxRunning = false;

function initHeroParallax() {
  if (prefersReducedMotion) return;

  const container = document.getElementById('hero');
  if (!container) return;

  // 背景组：被文字遮挡 (z-index: 5)
  const bgWrap = document.createElement('div');
  bgWrap.style.cssText = 'position:absolute;inset:0;z-index:5;overflow:hidden;';
  container.insertBefore(bgWrap, container.firstChild);

  // 前景组：遮挡文字 (z-index: 30) - 已移除
  /*
  const fgWrap = document.createElement('div');
  fgWrap.style.cssText = 'position:absolute;inset:0;z-index:30;overflow:hidden;pointer-events:none;';
  container.appendChild(fgWrap);
  */

  // 背景组（在文字后面）— 手机端放大 s 值让视差可见
  var sMult = isMobile ? 3 : 1;
  const bgConfigs = [
    { file: '6.webp', s: 0.0 },
    { file: '5.webp', s: 0.008 * sMult },
    { file: '4.webp', s: 0.015 * sMult },
    { file: '3.webp', s: 0.025 * sMult },
  ];

  // 前景组（在文字前面）- 已移除
  // const fgConfigs = [
  //   { file: '2.webp', s: 0.03 },
  //   { file: '1.webp', s: 0.06 },
  // ];

  function createLayer(cfg, parent, index) {
    const el = document.createElement('img');
    el.alt = '';
    el.setAttribute('aria-hidden', 'true');
    // 先绑定 onload 再设置 src，避免缓存命中导致事件 missed
    el.onload = function() { this.style.opacity = '1'; };
    el.onerror = function() { this.style.opacity = '1'; };
    el.src = `img/${cfg.file}`;
    // 手机端：放大 buffer 避免视差穿帮
    var initScale = isMobile ? 1.12 : 1.15;
    el.style.cssText = `
      position:absolute;inset:0;
      width:100%;height:100%;
      object-fit:cover;
      will-change:transform;
      transition:opacity 0.6s ease;
      opacity:0;
      transform:scale(${initScale});
    `;
    el.dataset.s = cfg.s;
    el.dataset.scale = initScale;
    if (el.complete && el.naturalWidth > 0) el.style.opacity = '1';
    parent.appendChild(el);
    heroParallaxLayers.push(el);
  }

  bgConfigs.forEach((cfg, i) => createLayer(cfg, bgWrap, i));

  // 桌面：mousemove
  document.addEventListener('mousemove', function(e) {
    heroTargetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    heroTargetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // 手机：陀螺仪 deviceorientation
  // 参考成熟实践（diorama tutorial / Subvisual / Mantine Parallax）：
  //   1. 第一帧记录 tiltOrigin 做基线，后续只追踪 delta
  //   2. lerp 0.18 是公认甜区（jitter vs 跟手平衡点）
  //   3. ÷25 控制灵敏度，无需关联真实角度范围
  if (isMobile) {
    var tiltOrigin = null;
    var hasOrientation = false;
    var orientationTimer = null;

    var handleOrientation = function(e) {
      if (e.gamma === null && e.beta === null) return;
      hasOrientation = true;
      // 首次事件：记录基线（自然握持姿态）
      if (tiltOrigin === null) {
        tiltOrigin = { gamma: e.gamma, beta: e.beta };
      }
      // 两轴都用原始值，统一走 lerp 平滑（γ 0.18 / β 0.10）
      heroTargetMouseX = Math.max(-1, Math.min(1, (e.gamma - tiltOrigin.gamma) / 70));
      heroTargetMouseY = Math.max(-1, Math.min(1, (e.beta - tiltOrigin.beta) / 70));
    };

    // 直接添加监听器（Android / iOS 16.4+ HTTPS 无需权限）
    window.addEventListener('deviceorientation', handleOrientation);
    // iOS 13–16.3：需要用户手势触发权限请求
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      var _permAsked = false;
      var _permFn = function() {
        if (_permAsked) return;
        _permAsked = true;
        DeviceOrientationEvent.requestPermission().then(function(state) {
          if (state === 'granted') {
            window.removeEventListener('deviceorientation', handleOrientation);
            window.addEventListener('deviceorientation', handleOrientation);
          }
        });
        document.removeEventListener('touchstart', _permFn);
        document.removeEventListener('click', _permFn);
      };
      document.addEventListener('touchstart', _permFn);
      document.addEventListener('click', _permFn);
    }

    // 2s 后检测是否收到陀螺仪数据，没收到则停掉循环省电
    orientationTimer = setTimeout(function() {
      if (!hasOrientation) {
        heroParallaxRunning = false;
      }
    }, 2000);
  }

  heroParallaxRunning = true;
  requestAnimationFrame(parityLoop);
}

function parityLoop() {
  if (!heroParallaxRunning) return;
  // X（gamma/左右）：0.18 跟手快；Y（beta/前后）：0.10 平滑去噪声
  heroMouseX += (heroTargetMouseX - heroMouseX) * 0.18;
  heroMouseY += (heroTargetMouseY - heroMouseY) * 0.10;
  for (var i = 0; i < heroParallaxLayers.length; i++) {
    var el = heroParallaxLayers[i];
    var s = parseFloat(el.dataset.s);
    var sc = parseFloat(el.dataset.scale) || 1;
    // 桌面端鼠标可扫全屏，移动端陀螺仪倾斜范围有限，故 mult 更大
    var multX = isMobile ? 120 : 200;
    var multY = isMobile ? 80 : 120;
    var dx = heroMouseX * s * multX;
    var dy = heroMouseY * s * multY;
    el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sc + ')';
  }
  requestAnimationFrame(parityLoop);
}

/* ========== HERO TEXT ANIMATIONS ========== */

function updateHeroScroll() {
  if (heroScrollAnim) {
    heroScrollAnim.scrollTrigger.kill();
    heroScrollAnim.kill();
  }
  // 恢复统一位置，不再区分中英文
  gsap.set('.hero-content', { yPercent: 0 });
  heroScrollAnim = gsap.to('.hero-content', {
    yPercent: -4, opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '60% top', scrub: true }
  });
}

function initCinematicEntrance() {
  if (prefersReducedMotion) {
    document.querySelectorAll('.hero-name span, .hero-title span').forEach(s => {
      s.style.opacity = 1; s.style.transform = 'none';
    });
    return;
  }

  // 如果 GSAP 尚未就绪，先保证文字可见，避免白屏/缺光效
  if (typeof gsap === 'undefined') {
    document.querySelectorAll('.hero-name, .hero-title').forEach(function(el) { el.style.opacity = 1; });
    var nav = document.querySelector('.nav');
    if (nav) { nav.style.opacity = 1; nav.style.transform = 'none'; }
    var grain = document.querySelector('.grain');
    if (grain) grain.style.opacity = 0.035;
    var heroScroll = document.querySelector('.hero-scroll');
    if (heroScroll) heroScroll.style.opacity = 1;
    return;
  }

  splitText('.hero-name');
  splitText('.hero-title');

  gsap.set('.grain', { opacity: 0 });
  gsap.set('.nav', { y: '-100%', opacity: 0 });
  gsap.set('.hero-scroll', { opacity: 0, y: 20 });
  gsap.set('.hero-scroll-line', { scaleY: 0 });
  gsap.set('.hero-name span', { opacity: 0, y: '110%', rotateX: -80 });
  gsap.set('.hero-title span', { opacity: 0, y: '110%', rotateX: -80 });

  const tl = gsap.timeline({ delay: 0.3 });
  tl.to('.grain', { opacity: 0.035, duration: 1, ease: 'power2.out' })
    .to('.nav', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=0.8')
    .to('.hero-name span', { opacity: 1, y: '0%', rotateX: 0, duration: 1.2, stagger: 0.04, ease: 'power3.out' }, '-=0.8')
    .to('.hero-title span', { opacity: 1, y: '0%', rotateX: 0, duration: 1.4, stagger: 0.03, ease: 'power3.out' }, '-=1')
    .to('.hero-scroll', { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, '-=0.8')
    .to('.hero-scroll-line', { scaleY: 1, duration: 1.2, ease: 'power2.out' }, '-=0.8');
}

function initHeroText() {
  if (prefersReducedMotion) {
    document.querySelectorAll('.hero-name span, .hero-title span').forEach(s => {
      s.style.opacity = 1; s.style.transform = 'none';
    });
    return;
  }

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  updateHeroScroll();
}

/* ========== REVEALS ========== */
function initReveals() {
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.fromTo(el, { opacity: 0, y: 80 }, {
      opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
    });
  });
}

/* ========== HORIZONTAL GALLERY ========== */
let galleryVelocity = 0;
let gallerySetupDone = false;

function initHorizontalGallery() {
  const wrap = document.getElementById('gallery-wrap');
  const track = document.getElementById('gallery-track');
  if (!wrap || !track) return;
  const slides = track.querySelectorAll('.gallery-slide');
  if (slides.length === 0) return;

  // 手机端：CSS scroll-snap + native swipe，初始化 counter
  if (window.innerWidth < 900) {
    slides.forEach(function(s) { s.style.opacity = '1'; });
    var iscroll = document.getElementById('gallery-counter');
    if (!iscroll) {
      iscroll = document.createElement('div');
      iscroll.id = 'gallery-counter';
      iscroll.className = 'gallery-counter';
      document.body.appendChild(iscroll);
    }
    function updateCounter() {
      var wrapRect = wrap.getBoundingClientRect();
      var viewCenter = wrapRect.left + wrapRect.width / 2;
      var closest = 0, distMin = Infinity;
      slides.forEach(function(s, i) {
        var r = s.getBoundingClientRect();
        var d = Math.abs(r.left + r.width / 2 - viewCenter);
        if (d < distMin) { distMin = d; closest = i + 1; }
      });
      var total = slides.length;
      iscroll.textContent = (closest < 10 ? '0' : '') + closest + ' / ' + (total < 10 ? '0' : '') + total;
    }
    wrap.addEventListener('scroll', updateCounter);
    updateCounter();

    // 聚焦效果：当前 slide 最亮，其他暗化
    var mobObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('mobile-active');
          entry.target.classList.remove('mobile-inactive');
        } else {
          entry.target.classList.remove('mobile-active');
          entry.target.classList.add('mobile-inactive');
        }
      });
    }, { root: wrap, threshold: 0.5 });
    slides.forEach(function(s) { mobObserver.observe(s); });

    return;
  }

  if (prefersReducedMotion) {
    slides.forEach(function(s) { s.style.opacity = '1'; });
    return;
  }

  const allImgs = track.querySelectorAll('img');
  let loaded = 0;

  function setupScroll() {
    if (gallerySetupDone) return;
    gallerySetupDone = true;

    var targetH = window.innerHeight * 0.72;
    slides.forEach(function(slide) {
      var img = slide.querySelector('img');
      if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
        var ratio = img.naturalWidth / img.naturalHeight;
        slide.style.width = Math.round(targetH * ratio) + 'px';
      }
    });

    var totalW = track.scrollWidth - window.innerWidth;
    if (totalW <= 0) { gallerySetupDone = false; return; }

    var counter = document.getElementById('gallery-counter');
    if (!counter) {
      counter = document.createElement('div');
      counter.id = 'gallery-counter';
      counter.className = 'gallery-counter';
      document.body.appendChild(counter);
    }

    var lastSlide = slides[slides.length - 1];
    var lastImg = lastSlide.querySelector('img');
    var lastSlideW = lastImg && lastImg.naturalWidth > 0
      ? targetH * (lastImg.naturalWidth / lastImg.naturalHeight)
      : 400;
    var centerExtra = Math.max(0, (window.innerWidth - lastSlideW) / 2);
    var totalScroll = totalW + centerExtra;

    var trackTween = gsap.to(track, {
      x: -totalScroll,
      ease: 'none',
      scrollTrigger: {
        trigger: wrap,
        start: 'top top',
        end: function() { return '+=' + totalScroll; },
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: function(self) {
          galleryVelocity = self.getVelocity();
          if (counter) {
            var total = slides.length;
            var current = Math.min(total, Math.max(1, Math.floor(self.progress * total) + 1));
            counter.textContent = (current < 10 ? '0' : '') + current + ' / ' + (total < 10 ? '0' : '') + total;
          }
        }
      }
    });

    slides.forEach(function(slide) {
      gsap.fromTo(slide, { opacity: 0.35, scale: 0.9, filter: 'grayscale(40%)' }, {
        opacity: 1, scale: 1, filter: 'grayscale(0%)',
        ease: 'none',
        scrollTrigger: {
          trigger: slide,
          containerAnimation: trackTween,
          start: 'left 85%', end: 'left 35%',
          scrub: true
        }
      });
    });

    var slideInners = track.querySelectorAll('.gallery-slide-inner');
    var lastSkew = 0;
    var lastScaleY = 1;
    function updateSkew() {
      var targetSkew = Math.max(-3.5, Math.min(3.5, galleryVelocity / 900));
      lastSkew += (targetSkew - lastSkew) * 0.08;
      var targetScaleY = Math.max(0.97, 1 - Math.abs(galleryVelocity) / 20000);
      lastScaleY += (targetScaleY - lastScaleY) * 0.08;
      /* 合并 skew + tilt + brightness 到同一个 transform */
      slideInners.forEach(function(s) {
        var tx = parseFloat(s.dataset.tiltX || 0);
        var ty = parseFloat(s.dataset.tiltY || 0);
        var br = parseFloat(s.dataset.tiltBright || 1);
        s.style.transform = 'skewX(' + lastSkew + 'deg) scaleY(' + lastScaleY + ') perspective(1000px) rotateX(' + tx + 'deg) rotateY(' + ty + 'deg) scale(0.95)';
        s.style.filter = 'brightness(' + br + ')';
      });
      galleryVelocity *= 0.94;
      requestAnimationFrame(updateSkew);
    }
    updateSkew();

    // 暴露给 vibe-motion：横向滚动 pin 的结束滚动位置
    window.__galleryPinEnd = wrap.offsetTop + totalScroll;
  }

  function onImgReady() {
    loaded++;
    if (loaded >= allImgs.length) setupScroll();
  }

  allImgs.forEach(function(img) {
    if (img.complete && img.naturalWidth > 0) {
      loaded++;
    } else {
      img.addEventListener('load', onImgReady);
      img.addEventListener('error', onImgReady);
    }
  });
  if (loaded >= allImgs.length) setupScroll();
}

/* ========== STATEMENT WORD HIGHLIGHT ========== */
function initStatement() {
  splitWords('#statement-text');
  initStatementWords();
}

function initStatementWords() {
  if (prefersReducedMotion) {
    var ws = document.querySelectorAll('#statement-text .word');
    ws.forEach(function(w) { w.classList.add('active', 'em-active'); });
    gsap.set(ws, { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' });
    return;
  }

  // Cleanup existing animations to prevent duplicates on language switch
  gsap.killTweensOf('#statement-text .word');
  gsap.killTweensOf('#statement-text');
  gsap.killTweensOf('.statement .light-wash');
  ScrollTrigger.getAll().forEach(function(st) {
    if (st.trigger === document.querySelector('.statement') ||
        (st.trigger && st.trigger.closest && st.trigger.closest('.statement'))) {
      st.kill();
    }
  });

  // Reset light-wash to initial state to prevent stale inline styles
  var existingWash = document.querySelector('.statement .light-wash');
  if (existingWash) {
    gsap.set(existingWash, { left: '-80px', opacity: 0, clearProps: 'transform' });
  }

  var words = document.querySelectorAll('#statement-text .word');
  var emWords = [];
  words.forEach(function(word) {
    if (word.querySelector('em')) emWords.push(word);
  });

  // Set initial state: dimmed, blurred, rotated, offset
  gsap.set(words, {
    opacity: 0,
    y: 50,
    rotateX: 30,
    filter: 'blur(10px)',
    transformOrigin: 'center bottom',
    transformPerspective: 1000
  });

  // Main reveal: unified scrubbed timeline with staggered word emergence
  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.statement',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5,
      onUpdate: function(self) {
        words.forEach(function(word) {
          if (self.progress > 0.5) word.classList.add('active');
          else word.classList.remove('active');
        });
        emWords.forEach(function(word) {
          if (self.progress > 0.05) word.classList.add('active', 'em-active');
          else word.classList.remove('active', 'em-active');
        });
      }
    }
  });

  tl.to(words, {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: 'blur(0px)',
    duration: 1,
    stagger: {
      each: 0.06,
      from: 'start'
    },
    ease: 'power3.out'
  });

  // Light wash sweep: a luminous beam crosses the text during reveal
  var statement = document.querySelector('.statement');
  var wash = statement.querySelector('.light-wash');
  if (!wash) {
    wash = document.createElement('div');
    wash.className = 'light-wash';
    statement.appendChild(wash);
  }

  gsap.fromTo(wash,
    { left: '-80px', opacity: 0 },
    { left: '100%', opacity: 1, duration: 2, ease: 'none',
      scrollTrigger: {
        trigger: '.statement',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    }
  );

  // Subtle parallax drift on the whole text block
  gsap.fromTo('#statement-text',
    { y: 30 },
    { y: -30, ease: 'none',
      scrollTrigger: {
        trigger: '.statement',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    }
  );
}

/* ========== ABOUT ANIMATIONS ========== */
/* ========== 3D TILT ========== */
function init3DTilt() {
  if (prefersReducedMotion || isMobile) return;
  /* 倾斜与 skew 循环共存:
     用 dataset 存倾斜值, skew 循环读取后合并到 transform */
  const slides = document.querySelectorAll('.gallery-slide');
  slides.forEach(function(slide) {
    const inner = slide.querySelector('.gallery-slide-inner');
    if (!inner) return;
    inner.classList.add('tilt');
    slide.addEventListener('mousemove', function(e) {
      const rect = slide.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      inner.dataset.tiltX = ((y - 0.5) * -10).toFixed(1);
      inner.dataset.tiltY = ((x - 0.5) * 10).toFixed(1);
      /* 同时增加一点亮度 → 凸起感 */
      inner.dataset.tiltBright = (1 + (1 - Math.abs(x - 0.5) * 2 - Math.abs(y - 0.5) * 2) * 0.08).toFixed(2);
    });
    slide.addEventListener('mouseleave', function() {
      inner.dataset.tiltX = '0';
      inner.dataset.tiltY = '0';
      inner.dataset.tiltBright = '1';
    });
  });
}

/* ========== PARALLAX DEPTH ========== */
function initParallaxDepth() {
  if (prefersReducedMotion || isMobile) return;
  // 肖像容器 + 图片独立错位 → 深度分层
  var portraitWrap = document.querySelector('.about-portrait');
  var portraitImg = document.querySelector('.about-portrait img');
  if (portraitImg) {
    gsap.fromTo(portraitImg, { scale: 1 }, {
      scale: 1.15,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5
      }
    });
  }
  if (portraitWrap) {
    gsap.fromTo(portraitWrap, { yPercent: -8 }, {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5
      }
    });
  }
  // 简介文字: 独立移动产生分层深度 (避开 .reveal 冲突)
  var aboutBio = document.querySelector('.about-bio');
  if (aboutBio) {
    gsap.fromTo(aboutBio, { y: 0 }, {
      y: -36,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5
      }
    });
  }
}

function initAbout() {
  if (prefersReducedMotion) return;
  const portrait = document.querySelector('.about-portrait img');
  if (portrait) {
    gsap.fromTo(portrait, { scale: 1.2, yPercent: -10 }, {
      scale: 1, yPercent: 0,
      ease: 'none',
      scrollTrigger: { trigger: '.about-section', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }
}

/* ========== LIGHTBOX ========== */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const title = document.getElementById('lightbox-title');
  const meta = document.getElementById('lightbox-meta');
  const close = document.querySelector('.lightbox-close');
  if (!lightbox || !img) return;

  document.querySelectorAll('.gallery-slide').forEach(slide => {
    slide.addEventListener('click', () => {
      const innerImg = slide.querySelector('img');
      const caption = slide.querySelector('.gallery-caption');
      const index = slide.dataset.index;
      if (innerImg) {
        img.src = innerImg.src;
        img.alt = innerImg.alt;
        title.textContent = caption ? caption.textContent : '';
        meta.textContent = index ? `No. ${index}` : '';
        lightbox.classList.add('active');
        gsap.fromTo(img, { scale: 0.92 }, { scale: 1, duration: 0.6, ease: 'power2.out' });
        gsap.to(img, { scale: 1.03, duration: 8, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 0.6 });
        if (lenis) lenis.stop();
      }
    });
  });

  function closeLightbox() {
    gsap.killTweensOf(img);
    gsap.to(img, { scale: 0.92, duration: 0.5, ease: 'power2.inOut', onComplete: function() {
      lightbox.classList.remove('active');
      if (lenis) lenis.start();
      gsap.set(img, { scale: 1 });
    }});
  }
  close.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

function initNavScroll() {
  var nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ========== SMOOTH ANCHOR SCROLL ========== */
function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        // 直接瞬间跳转，跳过横向滚动区的 scrub 动画以免卡顿
        if (lenis) lenis.scrollTo(target, { immediate: true });
        else window.scrollTo({ top: target.offsetTop, behavior: 'instant' });
      }
    });
  });
}

/* ========== PRELOADER ========== */
function initPreloader() {
  var preloader = document.getElementById('preloader');
  var progress = document.getElementById('preloader-progress');
  var percent = document.getElementById('preloader-percent');
  if (!preloader) return;

  // vibe-motion 模式下跳过预加载，直接展示完整页面供录制
  if (location.search.indexOf('vibe-motion') !== -1) {
    preloader.style.display = 'none';
    document.body.style.overflow = '';
    waitForGsapReady(function() {
      if (typeof initCinematicEntrance === 'function') initCinematicEntrance();
      if (typeof initHeroText === 'function') initHeroText();
    }, 8000);
    return;
  }

  var done = false;
  // 页面上已有的 img（gallery、about 等）
  var images = [].filter.call(document.querySelectorAll('img'), function(el) { return el.getAttribute('src') && el.getAttribute('src') !== ''; });
  // 关键动态资源：Hero 视差层，必须在预加载阶段完成，否则进场后会是空白
  var criticalSrcs = ['img/6.webp', 'img/5.webp', 'img/4.webp', 'img/3.webp'];
  criticalSrcs.forEach(function(src) {
    var img = new Image();
    img.src = src;
    images.push(img);
  });
  var total = images.length;
  var loaded = 0;
  var minDisplay = 1500; // 最短显示 1.5s，防止闪烁
  var startTime = performance.now();
  var fallbackTimer = null;
  var stuckTimer = null;     // 卡住检测
  var stuckInterval = null;  // 卡住时的伪进度动画

  // 初始最小进度，避免显示 0%
  var initialPct = Math.min(0.15, total > 0 ? 1 / total : 0.15);
  progress.style.width = (initialPct * 100) + '%';
  percent.textContent = Math.round(initialPct * 100) + '%';

  // 如果页面上没有图片，兜底 2s 后消失
  if (total === 0) {
    fallbackTimer = setTimeout(finish, 2000);
    return;
  }

  // 3s 后如果进度仍未移动 → 进入「卡住」状态：显示脉冲动画
  stuckTimer = setTimeout(function() {
    if (done || loaded > 0) return;
    progress.style.transition = 'width 1s ease-in-out, opacity 0.5s';
    var dir = 1;
    stuckInterval = setInterval(function() {
      if (done) { clearInterval(stuckInterval); return; }
      var base = initialPct * 100;
      var pulse = base + (dir > 0 ? 8 : -5);
      progress.style.width = pulse + '%';
      percent.textContent = Math.round(pulse) + '%';
      dir *= -1;
    }, 1200);
  }, 3000);

  function onLoad() {
    loaded++;
    // 一旦有真实进度，取消卡住动画
    if (stuckInterval) { clearInterval(stuckInterval); stuckInterval = null; }
    if (stuckTimer) { clearTimeout(stuckTimer); stuckTimer = null; }
    progress.style.transition = '';
    updateProgress();
    if (loaded >= total) {
      var elapsed = performance.now() - startTime;
      if (elapsed < minDisplay) {
        setTimeout(finish, minDisplay - elapsed);
      } else {
        finish();
      }
    }
  }

  function updateProgress() {
    var pct = Math.min(0.95, loaded / total);
    progress.style.width = (pct * 100) + '%';
    percent.textContent = Math.round(pct * 100) + '%';
  }

  function finish() {
    if (done) return;
    done = true;
    if (fallbackTimer) clearTimeout(fallbackTimer);
    if (stuckTimer) { clearTimeout(stuckTimer); stuckTimer = null; }
    if (stuckInterval) { clearInterval(stuckInterval); stuckInterval = null; }
    if (typeof cancelPreloaderFallback === 'function') cancelPreloaderFallback();

    progress.style.transition = '';
    progress.style.width = '100%';
    percent.textContent = '100%';

    function runEntrance() {
      preloader.style.display = 'none';
      document.body.style.overflow = '';
      // 等待 GSAP 就绪后再执行依赖它的入场动画，避免首刷光效丢失
      waitForGsapReady(function() {
        if (typeof initCinematicEntrance === 'function') initCinematicEntrance();
        if (typeof initHeroText === 'function') initHeroText();
      }, 8000);
    }

    if (typeof gsap !== 'undefined') {
      gsap.to(preloader, {
        yPercent: -100, duration: 1.2, ease: 'power4.inOut',
        onComplete: runEntrance
      });
    } else {
      runEntrance();
    }
  }

  // 给每张图片绑 load/error
  for (var i = 0; i < images.length; i++) {
    var img = images[i];
    // 已经加载完成的直接计数
    if (img.complete && img.naturalWidth > 0) {
      loaded++;
    } else {
      img.addEventListener('load', onLoad);
      img.addEventListener('error', onLoad); // 错误也算
    }
  }

  // 已经完成的图片可能已经占满 total，直接检查
  if (loaded >= total) {
    var elapsed = performance.now() - startTime;
    if (elapsed < minDisplay) {
      setTimeout(finish, minDisplay - elapsed);
    } else {
      finish();
    }
    return;
  }

  // 兜底：15s 强制关闭，给大图和慢网足够时间；如果卡住会先有脉冲动画提示
  fallbackTimer = setTimeout(finish, 15000);

  updateProgress();
}
/* ========== BGM ========== */
function initBGM() {
  var audio = document.getElementById('bgm');
  var btn = document.getElementById('bgm-toggle');
  if (!audio || !btn) return;

  audio.volume = 0;
  var saved = localStorage.getItem('bgm_playing');
  var isPlaying = false;
  var fadeTimer = null;

  function attemptPlay() {
    if (!isPlaying) return;
    fadeIn();
  }

  function setState(playing) {
    isPlaying = playing;
    btn.dataset.playing = playing ? 'true' : 'false';
    localStorage.setItem('bgm_playing', playing ? '1' : '');
  }

  function fadeIn() {
    if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
    audio.volume = 0;
    var p = audio.play();
    if (p) p.catch(function(e) { console.warn('[BGM] play error:', e); });
    var v = 0;
    fadeTimer = setInterval(function() {
      v += 0.05;
      if (v >= 0.5) { audio.volume = 0.5; clearInterval(fadeTimer); fadeTimer = null; }
      else audio.volume = v;
    }, 60);
  }

  function fadeOut() {
    if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
    var v = audio.volume;
    fadeTimer = setInterval(function() {
      v -= 0.08;
      if (v <= 0) {
        audio.pause();
        audio.volume = 0;
        clearInterval(fadeTimer); fadeTimer = null;
      } else {
        audio.volume = v;
      }
    }, 40);
  }

  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (isPlaying) { fadeOut(); setState(false); }
    else { fadeIn(); setState(true); }
  });

  // 默认开启；若用户明确关闭过（saved === '0'）则保持静音
  if (saved !== '0') {
    setState(true);
    attemptPlay();
  }

  // 浏览器自动播放策略：首次用户交互后若仍被暂停则再次尝试播放
  function resumeOnInteraction() {
    document.removeEventListener('click', resumeOnInteraction);
    document.removeEventListener('touchstart', resumeOnInteraction);
    if (isPlaying && audio.paused) attemptPlay();
  }
  document.addEventListener('click', resumeOnInteraction);
  document.addEventListener('touchstart', resumeOnInteraction);
}

/* ========== INIT ========== */
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();

  // 等待 GSAP/ScrollTrigger 就绪后再初始化依赖动画，避免 CDN 首刷未命中导致光效丢失
  waitForGsapReady(function() {
    try { gsap.registerPlugin(ScrollTrigger); } catch (e) { console.warn('[HalfSpicy] GSAP registerPlugin failed:', e); }
    initLenis();
    initMagnetic();
    initScrollProgress();
    initHorizontalGallery();
    initStatement();
    initReveals();
    initAbout();
    initLightbox();
    initParallaxDepth();
  }, 8000);

  /* 以下功能不依赖 GSAP，始终运行 */
  initCursor();
  initHeroParallax();
  initBGM();
  initAnchors();
  initNavScroll();
  init3DTilt();

  // 汉堡菜单
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      if (lenis) { mobileMenu.classList.contains('active') ? lenis.stop() : lenis.start(); }
    });
    mobileMenu.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        if (lenis) lenis.start();
      });
    });
  }
});
