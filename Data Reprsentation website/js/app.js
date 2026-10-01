/* ================================================================
   DATA INTELLIGENCE CODEX — APP
   ----------------------------------------------------------------
   Rendering, routing, theme, and the background atmosphere.
   You should not need to edit this file to add content — see
   content.js for that. Edit this file only if you want to change
   how a page is structured.
   ================================================================ */

const app = document.getElementById('app');
const YEAR = new Date().getFullYear();

function renderHome(){
  document.title = "Data Intelligence Codex";
  app.innerHTML = `
    <section class="hero">
      <span class="hero-archive-tag">ARCHIVE / ${YEAR}</span>
      <p class="eyebrow">Data Science / Machine Learning / AI Engineering</p>
      <h1 class="hero-title">
        <span class="line-1">Data Intelligence</span>
        <span class="line-2">Codex</span>
      </h1>
      <p class="hero-subhead">Projects, experiments, and technical notes.</p>
      <p class="hero-desc">A working archive of data systems, machine learning experiments, and AI engineering projects — documenting what was built, why it works, where it breaks, and what I learned from it.</p>
      <div class="editorial">
        <span class="editorial-rule"></span>
        <p>Every project is a case study in how data becomes a system.</p>
      </div>
      <div class="hero-ctas">
        <a class="btn btn-primary" onclick="navigate('datasets')">Explore the Codex</a>
        <a class="btn btn-ghost" onclick="navigate('ml')">View Projects</a>
      </div>
    </section>

    <section class="codex-section">
      <p class="meta-tag">Project log 001</p>
      <h2>The Codex</h2>
      <p class="codex-lead">Selected experiments in data analysis, machine learning, retrieval systems, and AI engineering.</p>
      <p class="codex-body">Projects are documented from raw data through implementation, evaluation, and iteration.</p>

      <div class="areas-grid">
        <div class="area-card" onclick="navigate('datasets')">
          <span class="area-index">01</span>
          <h3>Data Science</h3>
          <p>Explore datasets, uncover patterns, clean messy data, and turn observations into meaningful insights.</p>
          <span class="area-cta">Explore Datasets →</span>
        </div>
        <div class="area-card" onclick="navigate('ml')">
          <span class="area-index">02</span>
          <h3>Machine Learning</h3>
          <p>Experiment with models, understand their behavior, compare approaches, and learn from their failures.</p>
          <span class="area-cta">Explore ML →</span>
        </div>
        <div class="area-card" onclick="navigate('ai')">
          <span class="area-index">03</span>
          <h3>AI Engineering</h3>
          <p>Build systems with embeddings, RAG, LLMs, agents, and the technologies shaping modern AI.</p>
          <span class="area-cta">Explore AI →</span>
        </div>
      </div>
    </section>
  `;
}

function renderDatasets(){
  document.title = "Datasets — Data Intelligence Codex";
  app.innerHTML = `
    <div class="page-head"><h2>Datasets</h2></div>
    <div id="gridMount"></div>
  `;
  renderProjectGrid('datasets', 'gridMount');
}
function renderDatasetDetail(id){ renderProjectDetail('datasets', id); }

function renderML(){
  document.title = "Machine Learning — Data Intelligence Codex";
  app.innerHTML = `
    <div class="page-head"><h2>Machine Learning</h2></div>
    <div id="gridMount"></div>
  `;
  renderProjectGrid('ml', 'gridMount');
}
function renderMLDetail(id){ renderProjectDetail('ml', id); }

function renderAI(){
  document.title = "AI Engineering — Data Intelligence Codex";
  app.innerHTML = `
    <div class="page-head"><h2>AI Engineering</h2></div>
    <div id="gridMount"></div>
  `;
  renderProjectGrid('ai', 'gridMount');
}
function renderAIDetail(id){ renderProjectDetail('ai', id); }

function iconSvg(name){
  if(name === 'github'){
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.08.78 2.18v3.23c0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.11 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zm7.5 0h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05C19.6 8 21 10.2 21 13.85V23h-4v-8.1c0-1.93-.03-4.4-2.68-4.4-2.68 0-3.1 2.1-3.1 4.27V23h-4V8z"/></svg>`;
}

function renderAbout(){
  document.title = "About — Data Intelligence Codex";
  app.innerHTML = `
    <div class="page-head"><h2>About / Projects</h2></div>
    <div class="about-grid">
      <div>
        ${ABOUT_CONTENT.sections.length ? ABOUT_CONTENT.sections.map(s=>`
          <div class="about-block"><h3>${s.heading}</h3><p>${s.body}</p></div>
        `).join('') : `<div class="empty-card"><b>No content yet</b><span>Add sections to ABOUT_CONTENT.sections in content.js to populate this column.</span></div>`}
      </div>
      <div>
        <div class="about-block">
          <h3>Currently learning</h3>
          <div class="now-list">
            ${NOW_LEARNING.map(n=>`
              <div class="now-item"><span class="now-dot"></span><div><b>${n.title}</b><span>${n.note}</span></div></div>
            `).join('')}
            ${NOW_LEARNING.length === 0 ? `<div class="empty-card"><b>Nothing added yet</b><span>Add entries to NOW_LEARNING in content.js.</span></div>` : ''}
          </div>
        </div>
        <div class="about-block">
          <h3>Elsewhere</h3>
          ${SOCIAL_LINKS.length ? `<div class="links-card">
            ${SOCIAL_LINKS.map(l=>`
              <a class="link-row" href="${l.href}" target="_blank" rel="noopener">
                <span class="ic">${iconSvg(l.icon)}</span>
                <div><b>${l.label}</b><span>${l.sub}</span></div>
              </a>
            `).join('')}
          </div>` : `<div class="empty-card"><b>No links yet</b><span>Add entries to SOCIAL_LINKS in content.js.</span></div>`}
        </div>
      </div>
    </div>
  `;
}

function notFound(thing, back){
  return `<div class="page-head">
    <h2>That ${thing} isn't here.</h2>
    <p>It may have been renamed or removed. <a onclick="navigate('${back}')" style="color:var(--text);text-decoration:underline;cursor:pointer;">Back to ${back}</a>.</p>
  </div>`;
}

/* ================================================================
   ROUTER
   ================================================================ */
const ROUTES = {
  home: renderHome, datasets: renderDatasets, datasetDetail: renderDatasetDetail,
  ml: renderML, mlDetail: renderMLDetail,
  ai: renderAI, aiDetail: renderAIDetail,
  about: renderAbout
};
const NAV_MAP = { home:'home', datasets:'datasets', datasetDetail:'datasets', ml:'ml', mlDetail:'ml', ai:'ai', aiDetail:'ai', about:'about' };

function navigate(route, param){
  const hash = param ? `#/${route.replace('Detail','')}/${param}` : `#/${route}`;
  if(location.hash === hash){ dispatch(); } else { location.hash = hash; }
  closeMenu();
  window.scrollTo({top:0, behavior:'instant'});
}

function dispatch(){
  const raw = location.hash.replace('#/', '') || 'home';
  const parts = raw.split('/');
  let route = parts[0] || 'home';
  let param = parts[1];
  if(route === 'dataset' && param){ route = 'datasetDetail'; }
  else if(route === 'ml' && param){ route = 'mlDetail'; }
  else if(route === 'ai' && param){ route = 'aiDetail'; }
  if(!ROUTES[route]) route = 'home';
  ROUTES[route](param);
  document.querySelectorAll('.nav-link').forEach(a=>{
    a.classList.toggle('active', a.dataset.route === NAV_MAP[route]);
  });
}
window.addEventListener('hashchange', dispatch);

/* mobile menu */
const navLinks = document.getElementById('navLinks');
const menuBtn = document.getElementById('menuBtn');
menuBtn.addEventListener('click', ()=> navLinks.classList.toggle('open'));
function closeMenu(){ navLinks.classList.remove('open'); }

/* ================================================================
   THEME
   ================================================================ */
const themeToggle = document.getElementById('themeToggle');
const SUN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" stroke-linecap="round"/></svg>`;
const MOON = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg>`;

function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.innerHTML = theme === 'dark' ? SUN : MOON;
  try{ localStorage.setItem('dc-theme', theme); }catch(e){}
}
function getInitialTheme(){
  try{
    const saved = localStorage.getItem('dc-theme');
    if(saved) return saved;
  }catch(e){}
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
let currentTheme = getInitialTheme();
applyTheme(currentTheme);
themeToggle.addEventListener('click', ()=>{
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
});

/* ================================================================
   BACKGROUND ATMOSPHERE — leaves + drifting dust
   Kept very low-contrast on purpose: the atmosphere should register
   before any single particle does. Density is reduced on narrow
   (mobile) viewports.
   ================================================================ */
(function(){
  const canvas = document.getElementById('leafCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, leaves = [], dust = [];

  function density(){ return W < 640 ? 0.55 : 1; }

  function resize(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function isDarkMode(){
    const t = document.documentElement.getAttribute('data-theme');
    if(t === 'light') return false;
    if(t === 'dark') return true;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function makeLeaf(initial){
    return {
      x: Math.random()*W,
      y: initial ? Math.random()*H : -30 - Math.random()*140,
      size: 7 + Math.random()*24,
      speed: 0.12 + Math.random()*0.32,
      drift: (Math.random()-0.5)*0.4,
      angle: Math.random()*Math.PI*2,
      spin: (Math.random()-0.5)*0.008,
      sway: Math.random()*Math.PI*2,
      swaySpeed: 0.004 + Math.random()*0.006,
      opacity: 0.03 + Math.random()*0.13,
      blur: Math.random() < 0.35 ? (1 + Math.random()*2.5) : 0
    };
  }
  function makeDust(initial){
    return {
      x: Math.random()*W,
      y: initial ? Math.random()*H : H + Math.random()*60,
      r: 0.6 + Math.random()*1.6,
      speed: 0.03 + Math.random()*0.07,
      drift: (Math.random()-0.5)*0.15,
      phase: Math.random()*Math.PI*2,
      flicker: 0.008 + Math.random()*0.014,
      baseOpacity: 0.05 + Math.random()*0.12
    };
  }

  function seed(){
    leaves = []; dust = [];
    const leafCount = Math.round(20 * density());
    const dustCount = Math.round(46 * density());
    for(let i=0;i<leafCount;i++) leaves.push(makeLeaf(true));
    for(let i=0;i<dustCount;i++) dust.push(makeDust(true));
  }
  seed();
  window.addEventListener('resize', ()=>{ seed(); });

  function drawLeaf(l, tone){
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.angle);
    if(l.blur) ctx.filter = `blur(${l.blur}px)`;
    ctx.globalAlpha = l.opacity;
    ctx.shadowColor = `rgba(${tone},0.5)`;
    ctx.shadowBlur = 6;
    ctx.fillStyle = `rgba(${tone},0.8)`;
    ctx.beginPath();
    const s = l.size;
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s*0.8, -s*0.5, s*0.8, s*0.5, 0, s);
    ctx.bezierCurveTo(-s*0.8, s*0.5, -s*0.8, -s*0.5, 0, -s);
    ctx.fill();
    ctx.restore();
  }

  function drawDust(d, tone){
    const flicker = 0.5 + 0.5*Math.sin(d.phase);
    ctx.save();
    ctx.globalAlpha = d.baseOpacity * flicker;
    ctx.shadowColor = `rgba(${tone},0.8)`;
    ctx.shadowBlur = 4;
    ctx.fillStyle = `rgba(${tone},0.9)`;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function tick(){
    ctx.clearRect(0,0,W,H);
    const dark = isDarkMode();
    const tone = dark ? '241,239,233' : '18,17,16';

    for(const l of leaves){
      l.sway += l.swaySpeed;
      l.y += l.speed;
      l.x += l.drift + Math.sin(l.sway)*0.25;
      l.angle += l.spin;
      if(l.y > H + 40){ Object.assign(l, makeLeaf(false)); }
      drawLeaf(l, tone);
    }
    for(const d of dust){
      d.phase += d.flicker;
      d.y -= d.speed;
      d.x += d.drift;
      if(d.y < -10){ Object.assign(d, makeDust(false)); }
      drawDust(d, tone);
    }
    requestAnimationFrame(tick);
  }
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    requestAnimationFrame(tick);
  }
})();

/* ================================================================
   INIT
   ================================================================ */
document.getElementById('footYear').textContent = YEAR;
dispatch();
