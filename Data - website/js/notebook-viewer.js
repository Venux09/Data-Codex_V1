/* ================================================================
   NOTEBOOK VIEWER
   ----------------------------------------------------------------
   Parses .ipynb / .md / .py / .csv files and renders them as-is —
   this file never rewrites or summarizes anything from a project
   file. It also drives the "Add Project" upload UI and the
   manifest-based project grid/detail pages for Datasets, Machine
   Learning, and AI Engineering.

   The source file (your notebook) is the source of truth. This
   file is only a renderer.
   ================================================================ */

function escapeHtml(str){
  return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function padNum(n){ return String(n).padStart(2,'0'); }

/* ---------------------------------------------------------------
   Code block (shared by notebook code cells, markdown fences, and
   plain .py files) — same look as the rest of the site.
   --------------------------------------------------------------- */
function codeBlockHtml(code, lang){
  const id = 'cb' + Math.random().toString(36).slice(2,9);
  return `<div class="codeblock">
    <div class="codeblock-head">
      <span class="codeblock-lang">${lang || 'text'}</span>
      <button class="copy-btn" onclick="copyCode('${id}', this)">Copy</button>
    </div>
    <pre><code id="${id}" class="language-${lang || 'plaintext'}">${escapeHtml(code)}</code></pre>
  </div>`;
}
function copyCode(id, btn){
  const el = document.getElementById(id);
  navigator.clipboard.writeText(el.textContent).then(()=>{
    const old = btn.textContent; btn.textContent = 'Copied';
    setTimeout(()=>{ btn.textContent = old; }, 1400);
  }).catch(()=>{});
}

/* ---------------------------------------------------------------
   Minimal markdown -> HTML. Covers what notebook markdown cells
   actually use: headings, bold/italic, inline code, fenced code
   blocks, links, lists, blockquotes, paragraphs. It converts
   syntax to HTML — it does not reword or summarize your text.
   --------------------------------------------------------------- */
function mdInline(s){
  let t = escapeHtml(s);
  t = t.replace(/`([^`]+)`/g, '<code class="inline">$1</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="text-decoration:underline;">$1</a>');
  return t;
}

function mdToHtml(src){
  const codeBlocks = [];
  const text = String(src).replace(/```(\w*)\n?([\s\S]*?)```/g, (m, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(codeBlockHtml(code.replace(/\n$/,''), lang));
    return `%%CODEBLOCK${idx}%%`;
  });

  const lines = text.split('\n');
  let html = '';
  let listBuf = null;
  let paraBuf = [];

  function flushPara(){ if(paraBuf.length){ html += `<p>${mdInline(paraBuf.join(' '))}</p>`; paraBuf = []; } }
  function flushList(){
    if(listBuf){ html += `<${listBuf.type}>${listBuf.items.map(i=>`<li>${mdInline(i)}</li>`).join('')}</${listBuf.type}>`; listBuf = null; }
  }

  for(const raw of lines){
    const trimmed = raw.trim();
    if(trimmed.startsWith('%%CODEBLOCK')){ flushPara(); flushList(); html += trimmed; continue; }
    if(!trimmed){ flushPara(); flushList(); continue; }
    let m;
    if((m = trimmed.match(/^(#{1,6})\s+(.*)$/))){
      flushPara(); flushList();
      const level = Math.min(m[1].length + 1, 6);
      html += `<h${level} class="nb-heading">${mdInline(m[2])}</h${level}>`;
      continue;
    }
    if((m = trimmed.match(/^[-*]\s+(.*)$/))){
      flushPara();
      if(!listBuf || listBuf.type !== 'ul'){ flushList(); listBuf = { type:'ul', items:[] }; }
      listBuf.items.push(m[1]);
      continue;
    }
    if((m = trimmed.match(/^\d+\.\s+(.*)$/))){
      flushPara();
      if(!listBuf || listBuf.type !== 'ol'){ flushList(); listBuf = { type:'ol', items:[] }; }
      listBuf.items.push(m[1]);
      continue;
    }
    if(trimmed.startsWith('>')){
      flushPara(); flushList();
      html += `<blockquote>${mdInline(trimmed.replace(/^>\s?/,''))}</blockquote>`;
      continue;
    }
    flushList();
    paraBuf.push(trimmed);
  }
  flushPara(); flushList();

  html = html.replace(/%%CODEBLOCK(\d+)%%/g, (m, idx) => codeBlocks[Number(idx)]);
  return html;
}

/* ---------------------------------------------------------------
   .ipynb rendering — preserves cell order exactly:
   markdown -> code -> output -> markdown -> code -> output ...
   Nothing is flattened, reordered, or rewritten.
   --------------------------------------------------------------- */
function renderOutput(o){
  if(o.output_type === 'stream'){
    const text = Array.isArray(o.text) ? o.text.join('') : (o.text || '');
    const cls = o.name === 'stderr' ? 'nb-output nb-stderr' : 'nb-output';
    return `<div class="${cls}">${escapeHtml(text)}</div>`;
  }
  if(o.output_type === 'error'){
    const tb = (o.traceback || []).join('\n').replace(/\x1b\[[0-9;]*m/g, '');
    return `<div class="nb-output nb-error"><span class="nb-error-label">${escapeHtml(o.ename || 'Error')}</span>: ${escapeHtml(o.evalue || '')}\n${escapeHtml(tb)}</div>`;
  }
  if(o.output_type === 'execute_result' || o.output_type === 'display_data'){
    const data = o.data || {};
    if(data['image/png']){
      const src = Array.isArray(data['image/png']) ? data['image/png'].join('') : data['image/png'];
      return `<div class="nb-output nb-image"><img src="data:image/png;base64,${src}" alt="notebook output"></div>`;
    }
    if(data['text/html']){
      const html = Array.isArray(data['text/html']) ? data['text/html'].join('') : data['text/html'];
      return `<div class="nb-output nb-html">${html}</div>`;
    }
    if(data['text/plain']){
      const text = Array.isArray(data['text/plain']) ? data['text/plain'].join('') : data['text/plain'];
      return `<div class="nb-output">${escapeHtml(text)}</div>`;
    }
  }
  return '';
}

function renderIpynbCells(nb){
  const cells = nb.cells || [];
  let html = '';
  for(const cell of cells){
    const source = Array.isArray(cell.source) ? cell.source.join('') : (cell.source || '');
    if(cell.cell_type === 'markdown'){
      if(!source.trim()) continue;
      html += `<div class="nb-cell nb-markdown">${mdToHtml(source)}</div>`;
    } else if(cell.cell_type === 'code'){
      const hasOutput = Array.isArray(cell.outputs) && cell.outputs.length > 0;
      if(!source.trim() && !hasOutput) continue;
      const execLabel = (cell.execution_count !== undefined && cell.execution_count !== null) ? cell.execution_count : ' ';
      html += `<div class="nb-cell nb-code-cell">
        <div class="nb-exec">In [${execLabel}]:</div>
        ${codeBlockHtml(source, 'python')}
        ${(cell.outputs || []).map(renderOutput).join('')}
      </div>`;
    } else if(cell.cell_type === 'raw'){
      if(!source.trim()) continue;
      html += `<div class="nb-cell nb-raw"><pre>${escapeHtml(source)}</pre></div>`;
    }
  }
  return html || `<p class="empty-hint">This notebook has no renderable cells.</p>`;
}

/* ---------------------------------------------------------------
   Other file types — light support, per the roadmap. .ipynb stays
   the fully-featured path.
   --------------------------------------------------------------- */
function renderCsvPreview(text){
  const lines = text.split(/\r?\n/).filter(l => l.length);
  if(!lines.length) return `<p class="empty-hint">Empty file.</p>`;
  const rows = lines.slice(0, 51).map(l => l.split(','));
  const header = rows[0];
  const body = rows.slice(1);
  return `<div class="nb-output nb-html">
    <p style="color:var(--text-faint);font-size:0.82rem;margin:0 0 10px;">Showing ${body.length} of ${lines.length-1} rows.</p>
    <div class="overflow-x"><table><thead><tr>${header.map(h=>`<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
    <tbody>${body.map(r=>`<tr>${r.map(c=>`<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
  </div>`;
}

function renderFileContent(filePath, text){
  const ext = filePath.split('.').pop().toLowerCase();
  if(ext === 'ipynb'){
    try{ return renderIpynbCells(JSON.parse(text)); }
    catch(e){ return `<div class="empty-card"><b>Couldn't parse this notebook</b><span>${escapeHtml(String(e))}</span></div>`; }
  }
  if(ext === 'md') return `<div class="nb-cell nb-markdown">${mdToHtml(text)}</div>`;
  if(ext === 'py') return `<div class="nb-cell nb-code-cell">${codeBlockHtml(text, 'python')}</div>`;
  if(ext === 'csv') return `<div class="nb-cell">${renderCsvPreview(text)}</div>`;
  return `<div class="nb-cell"><pre>${escapeHtml(text.slice(0,4000))}</pre></div>`;
}

/* ---------------------------------------------------------------
   Manifest-driven grid + detail pages
   --------------------------------------------------------------- */
const SECTION_ROUTE = { datasets: 'dataset', ml: 'ml', ai: 'ai' };
const SECTION_LABEL = { datasets: 'datasets', ml: 'ML projects', ai: 'AI Engineering projects' };

function fetchManifest(section){
  return fetch(`notebooks/${section}/manifest.json?_=${Date.now()}`)
    .then(r => r.ok ? r.json() : { entries: [] })
    .then(d => d.entries || [])
    .catch(() => null); // null = couldn't reach it at all (likely no local server running)
}

async function renderProjectGrid(section, mountId){
  const mount = document.getElementById(mountId);
  mount.innerHTML = `<div class="grid">${uploadDropzoneHtml(section)}</div>`;
  const grid = mount.querySelector('.grid');
  setupDropzone(section);

  const entries = await fetchManifest(section);
  if(entries === null){
    grid.insertAdjacentHTML('beforeend', `<div class="empty-card"><b>Can't reach the local server</b><span>Open this site with <code class="inline">python3 serve.py</code> (not by double-clicking index.html) so uploads and notebook rendering can work.</span></div>`);
    return;
  }
  if(entries.length === 0){
    grid.insertAdjacentHTML('beforeend', `<div class="empty-card"><b>Nothing here yet</b><span>Upload a notebook above, or drop one into notebooks/${section}/ directly.</span></div>`);
    return;
  }
  entries.forEach(e => {
    grid.insertAdjacentHTML('beforeend', `
      <div class="card" onclick="navigate('${SECTION_ROUTE[section]}Detail','${e.id}')">
        <span class="card-num">${padNum(e.number)}</span>
        <span class="card-cat">${e.files.length} file${e.files.length > 1 ? 's' : ''}</span>
        <h3>${escapeHtml(e.title)}</h3>
      </div>
    `);
  });
}

async function renderProjectDetail(section, id){
  const app = document.getElementById('app');
  const backRoute = section;
  app.innerHTML = `<div class="page-head"><p class="empty-hint">Loading…</p></div>`;

  const entries = await fetchManifest(section);
  if(!entries){ app.innerHTML = notFound('project', backRoute); return; }
  const entry = entries.find(e => e.id === id);
  if(!entry){ app.innerHTML = notFound('project', backRoute); return; }
  document.title = entry.title + " — Data Intelligence Codex";

  let body = '';
  for(let i = 0; i < entry.files.length; i++){
    const filePath = entry.files[i];
    const label = (entry.labels && entry.labels[i]) || filePath;
    if(entry.files.length > 1){
      body += `<div class="nb-file-divider"><span>File ${i+1} of ${entry.files.length}</span><h3>${escapeHtml(label)}</h3></div>`;
    }
    try{
      const res = await fetch(`notebooks/${section}/${filePath}?_=${Date.now()}`);
      const text = await res.text();
      body += renderFileContent(filePath, text);
    }catch(e){
      body += `<div class="empty-card"><b>Couldn't load ${escapeHtml(filePath)}</b></div>`;
    }
  }

  app.innerHTML = `
    <div class="detail-head">
      <span class="back-link" onclick="navigate('${backRoute}')">‹ All ${escapeHtml(SECTION_LABEL[section])}</span>
      <p class="meta-tag">Project log ${padNum(entry.number)}</p>
      <h2>${escapeHtml(entry.title)}</h2>
    </div>
    <div class="nb-container">${body}</div>
  `;
  if(window.hljs) hljs.highlightAll();
}

/* ---------------------------------------------------------------
   Add Project — drag & drop + choose-file upload
   --------------------------------------------------------------- */
function uploadDropzoneHtml(section){
  return `<div class="dropzone" id="dz-${section}">
    <div class="dropzone-inner">
      <span class="dropzone-plus">+</span>
      <p class="dropzone-title">Add Project</p>
      <p class="dropzone-sub">Drop your notebook here</p>
      <p class="dropzone-types">.ipynb · .md · .py · .csv</p>
      <label class="btn-sm dropzone-btn">
        Choose File
        <input type="file" id="file-${section}" accept=".ipynb,.md,.py,.csv" style="display:none;" onchange="handleFileSelect('${section}', this.files[0])">
      </label>
      <p class="dropzone-status" id="status-${section}"></p>
    </div>
  </div>`;
}

function setupDropzone(section){
  const dz = document.getElementById(`dz-${section}`);
  if(!dz) return;
  ['dragenter','dragover'].forEach(evt => dz.addEventListener(evt, e => { e.preventDefault(); dz.classList.add('drag-over'); }));
  ['dragleave','drop'].forEach(evt => dz.addEventListener(evt, e => { e.preventDefault(); dz.classList.remove('drag-over'); }));
  dz.addEventListener('drop', e => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if(file) handleFileSelect(section, file);
  });
}

async function handleFileSelect(section, file){
  if(!file) return;
  const statusEl = document.getElementById(`status-${section}`);
  const allowed = ['.ipynb','.md','.py','.csv'];
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if(!allowed.includes(ext)){
    if(statusEl) statusEl.textContent = `${ext} isn't supported yet — use .ipynb, .md, .py, or .csv.`;
    return;
  }
  if(statusEl) statusEl.textContent = `Uploading ${file.name}…`;

  const fd = new FormData();
  fd.append('section', section);
  fd.append('file', file);
  try{
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if(data.ok){
      if(statusEl) statusEl.textContent = `Added "${data.title}".`;
      dispatch(); // re-render the current page so the new entry shows up immediately
    } else {
      if(statusEl) statusEl.textContent = data.error || 'Upload failed.';
    }
  }catch(e){
    if(statusEl) statusEl.textContent = 'Upload failed — is python3 serve.py running?';
  }
}
