/* MediKataru for pet — LP interactions */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header shadow & to-top ---------- */
  const header = document.querySelector('.site-header');
  const toTop = document.getElementById('to-top');
  const spCta = document.getElementById('sp-cta');
  const hero = document.querySelector('.hero');
  const finalCta = document.querySelector('.final-cta');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    toTop.classList.toggle('is-show', y > 600);
    // mobile sticky CTA: after the hero, hidden while the final CTA is on screen
    const pastHero = hero.getBoundingClientRect().bottom < 80;
    const f = finalCta.getBoundingClientRect();
    const finalVisible = f.top < window.innerHeight && f.bottom > 0;
    const showSp = pastHero && !finalVisible;
    spCta.classList.toggle('is-show', showSp);
    toTop.classList.toggle('lift', showSp);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('global-nav');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    nav.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Scroll reveal (with stagger inside groups) ---------- */
  const reveals = document.querySelectorAll('.reveal');
  // stagger siblings that share a parent
  const groups = new Map();
  reveals.forEach((el) => {
    const p = el.parentElement;
    const i = groups.get(p) || 0;
    el.style.setProperty('--d', `${Math.min(i, 6) * 0.08}s`);
    groups.set(p, i + 1);
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Count-up numbers ---------- */
  const counters = document.querySelectorAll('.count');
  const runCount = (el) => {
    const from = Number(el.dataset.from || 0);
    const to = Number(el.dataset.to);
    const dur = 1400;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && !reduceMotion) {
    counters.forEach((el) => { el.textContent = el.dataset.from || '0'; });
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { runCount(entry.target); co.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => co.observe(el));
  }

  /* ---------- Before / After tabs ---------- */
  const tablist = document.querySelector('.demo-tabs');
  if (tablist) {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      tablist.dataset.active = tab.id === 'tab-after' ? 'after' : 'before';
      if (focus) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
          select(next, true);
        }
      });
    });
    select(tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0]);
  }

  /* ---------- Warm up the app ----------
     The app runs on Render's free tier and sleeps when idle.
     A lightweight no-cors request on page load starts waking it up,
     so it is more likely to be ready when the visitor taps a CTA. */
  const APP_URL = 'https://medikataru-for-pet.onrender.com/';
  const warmUp = () => { try { fetch(APP_URL, { mode: 'no-cors', cache: 'no-store' }).catch(() => {}); } catch (_) { /* ignore */ } };
  if ('requestIdleCallback' in window) requestIdleCallback(warmUp, { timeout: 3000 }); else setTimeout(warmUp, 1500);

  /* ---------- FAQ: one open at a time ---------- */
  const faqs = document.querySelectorAll('.faq details');
  faqs.forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) faqs.forEach((o) => { if (o !== d) o.open = false; });
  }));
})();
