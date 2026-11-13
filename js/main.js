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

  /* ---------- Daily log: weight chart (sample data) ---------- */
  const chartEl = document.getElementById('weight-chart');
  if (chartEl) {
    const data = [
      ['10/30', 8.5], ['11/01', 8.5], ['11/03', 8.4], ['11/05', 8.4], ['11/06', 8.3],
      ['11/08', 8.3], ['11/10', 8.3], ['11/11', 8.2], ['11/12', 8.2], ['11/13', 8.2],
    ];
    const W = 520, H = 220, P = { l: 44, r: 16, t: 16, b: 30 };
    const min = 8.0, max = 8.7;
    const x = (i) => P.l + (i * (W - P.l - P.r)) / (data.length - 1);
    const y = (v) => P.t + ((max - v) * (H - P.t - P.b)) / (max - min);
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    let inner = '<defs><linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e07a4f" stop-opacity=".28"/><stop offset="1" stop-color="#e07a4f" stop-opacity="0"/></linearGradient></defs>';
    [8.0, 8.2, 8.4, 8.6].forEach((v) => {
      inner += `<line class="grid-line" x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${P.l - 8}" y="${y(v) + 4}" text-anchor="end">${v.toFixed(1)}</text>`;
    });
    data.forEach(([d], i) => { if (i % 3 === 0 || i === data.length - 1) inner += `<text class="axis" x="${x(i)}" y="${H - 8}" text-anchor="middle">${d}</text>`; });
    const pts = data.map(([, v], i) => `${x(i)},${y(v)}`).join(' ');
    inner += `<polygon class="area" points="${P.l},${H - P.b} ${pts} ${W - P.r},${H - P.b}"/>`;
    inner += `<polyline class="line" points="${pts}"/>`;
    data.forEach(([d, v], i) => {
      inner += `<circle class="hit" cx="${x(i)}" cy="${y(v)}" r="16" data-i="${i}"/><circle class="pt" cx="${x(i)}" cy="${y(v)}" r="5" data-i="${i}" tabindex="0" role="button" aria-label="${d} ${v.toFixed(1)}kg"/>`;
    });
    svg.innerHTML = inner;
    chartEl.appendChild(svg);

    const tip = document.getElementById('weight-tip');
    const ptEls = [...svg.querySelectorAll('.pt')];
    const show = (i) => {
      ptEls.forEach((el, j) => el.classList.toggle('on', j === i));
      const [d, v] = data[i];
      const prev = i > 0 ? v - data[i - 1][1] : 0;
      const diff = i > 0 ? `（前回から ${prev === 0 ? '±0.0' : (prev > 0 ? '+' : '−') + Math.abs(prev).toFixed(1)}kg）` : '';
      tip.innerHTML = `${d} の体重　<b>${v.toFixed(1)}kg</b> ${diff}`;
    };
    svg.addEventListener('click', (e) => { const i = e.target.dataset && e.target.dataset.i; if (i !== undefined) show(Number(i)); });
    ptEls.forEach((el, i) => el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); } }));

    const table = document.getElementById('weight-table');
    table.querySelector('tbody').innerHTML = data.slice().reverse().map(([d, v]) => `<tr><td>${d}</td><td>${v.toFixed(1)} kg</td></tr>`).join('');
    const tg = document.getElementById('weight-toggle');
    tg.addEventListener('click', () => {
      const on = tg.getAttribute('aria-pressed') !== 'true';
      tg.setAttribute('aria-pressed', String(on));
      tg.textContent = on ? 'グラフで見る' : '数値で見る';
      table.hidden = !on; chartEl.hidden = on; tip.hidden = on;
    });
  }

  /* ---------- Daily log: period switch (sample values) ---------- */
  const periodBtns = document.querySelectorAll('.period [role="radio"]');
  const calcGrid = document.getElementById('calc-grid');
  if (periodBtns.length && calcGrid) {
    const sets = {
      last: { days: '12<small>日</small>', weight: '−0.3<small>kg</small>', water: '340<small>ml/日</small>', poop: 'ふつう 9日・やわらかめ 2日・下痢 1日', walk: '52<small>分/日</small>' },
      7: { days: '6<small>日</small>', weight: '−0.1<small>kg</small>', water: '330<small>ml/日</small>', poop: 'ふつう 4日・やわらかめ 1日・下痢 1日', walk: '50<small>分/日</small>' },
      14: { days: '12<small>日</small>', weight: '−0.3<small>kg</small>', water: '340<small>ml/日</small>', poop: 'ふつう 9日・やわらかめ 2日・下痢 1日', walk: '52<small>分/日</small>' },
      30: { days: '25<small>日</small>', weight: '−0.4<small>kg</small>', water: '345<small>ml/日</small>', poop: 'ふつう 20日・やわらかめ 4日・下痢 1日', walk: '55<small>分/日</small>' },
    };
    const dds = calcGrid.querySelectorAll('dd');
    periodBtns.forEach((btn) => btn.addEventListener('click', () => {
      periodBtns.forEach((b) => b.setAttribute('aria-checked', String(b === btn)));
      const set = sets[btn.dataset.period];
      dds.forEach((dd) => dd.classList.add('fade'));
      setTimeout(() => dds.forEach((dd) => { dd.innerHTML = set[dd.dataset.k]; dd.classList.remove('fade'); }), reduceMotion ? 0 : 200);
    }));
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
