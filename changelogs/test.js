
// ────────────────────────────────────────────────────────────────────────────
// STATE
// ────────────────────────────────────────────────────────────────────────────
let blocks = [];
let heroBase64 = '';
let blockIdCounter = 0;

function uid() { return ++blockIdCounter; }

// ────────────────────────────────────────────────────────────────────────────
// SECTIONS TOGGLE
// ────────────────────────────────────────────────────────────────────────────
function toggleSection(id) {
  document.getElementById(id).classList.toggle('open');
}

// ────────────────────────────────────────────────────────────────────────────
// BLOCKS
// ────────────────────────────────────────────────────────────────────────────
const BLOCK_DEFAULTS = {
  heading:   { type:'heading',   text:'Nowa sekcja' },
  paragraph: { type:'paragraph', text:'' },
  list:      { type:'list',      items:['Pierwsza zmiana','Druga zmiana'] },
  change:    { type:'change',    kind:'feat', label:'', text:'' },
  image:     { type:'image',     src:'', alt:'', caption:'' },
  table:     { type:'table',     headers:['Kolumna 1','Kolumna 2'], rows:[['Wartość A','Wartość B']] },
  callout:   { type:'callout',   icon:'💡', text:'' },
  code:      { type:'code',      lang:'', text:'' },
  divider:   { type:'divider' },
  video:     { type:'video',     url:'' },
  community: { type:'community', title:'Pytanie do graczy', text:'' },
};

const BLOCK_COLORS = {
  heading:'rgba(124,58,237,.25)',paragraph:'rgba(100,116,139,.15)',list:'rgba(16,185,129,.15)',
  change:'rgba(245,158,11,.15)',image:'rgba(59,130,246,.15)',table:'rgba(14,165,233,.15)',
  callout:'rgba(168,85,247,.15)',code:'rgba(100,116,139,.2)',divider:'rgba(100,116,139,.1)',
  video:'rgba(239,68,68,.15)',community:'rgba(168,85,247,.2)'
};
const BLOCK_ICONS = {
  heading:'H',paragraph:'¶',list:'≡',change:'⊞',image:'🖼',table:'⊟',callout:'💡',code:'</>',divider:'─',video:'▶️',community:'👥'
};

function addBlock(type, data) {
  const block = { id: uid(), ...BLOCK_DEFAULTS[type], ...(data||{}) };
  blocks.push(block);
  renderBlocksList();
  updatePreview();
}

function removeBlock(id) {
  blocks = blocks.filter(b => b.id !== id);
  renderBlocksList();
  updatePreview();
}

function moveBlock(id, dir) {
  const i = blocks.findIndex(b=>b.id===id);
  if (i < 0) return;
  const j = i + dir;
  if (j < 0 || j >= blocks.length) return;
  [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
  renderBlocksList();
  updatePreview();
}

function updateBlock(id, key, value) {
  const b = blocks.find(b=>b.id===id);
  if (!b) return;
  b[key] = value;
  updatePreview();
}

function renderBlocksList() {
  const list = document.getElementById('blocks-list');
  list.innerHTML = blocks.map((b,i) => renderBlockItem(b,i)).join('');
  // open first block that was just added
}

function renderBlockItem(b, i) {
  const color = BLOCK_COLORS[b.type]||'transparent';
  const icon = BLOCK_ICONS[b.type]||'?';
  let inner = '';

  if (b.type === 'heading') {
    inner = `<div class="field"><label>Tekst nagłówka</label>
      <input type="text" value="${esc(b.text)}" oninput="updateBlock(${b.id},'text',this.value);updatePreview()" /></div>`;
  } else if (b.type === 'paragraph') {
    inner = `<div class="field"><label>Tekst</label>
      <textarea oninput="updateBlock(${b.id},'text',this.value);updatePreview()">${esc(b.text)}</textarea></div>`;
  } else if (b.type === 'list') {
    inner = `<div class="field"><label>Elementy (jeden na linię)</label>
      <textarea oninput="updateBlock(${b.id},'items',this.value.split('\\n'));updatePreview()">${(b.items||[]).join('\n')}</textarea></div>`;
  } else if (b.type === 'change') {
    inner = `<div class="field"><label>Typ zmiany</label>
      <select onchange="updateBlock(${b.id},'kind',this.value);updatePreview()">
        ${['feat','fix','perf','break','info'].map(k=>`<option value="${k}" ${b.kind===k?'selected':''}>${{feat:'✨ Nowość',fix:'🐛 Poprawka',perf:'⚡ Wydajność',break:'💥 Breaking',info:'ℹ️ Info'}[k]}</option>`).join('')}
      </select></div>
      <div class="field"><label>Etykieta (opcjonalna)</label>
      <input type="text" value="${esc(b.label||'')}" placeholder="np. NOWE, WAŻNE..." oninput="updateBlock(${b.id},'label',this.value);updatePreview()" /></div>
      <div class="field"><label>Opis zmiany</label>
      <textarea oninput="updateBlock(${b.id},'text',this.value);updatePreview()">${esc(b.text)}</textarea></div>`;
  } else if (b.type === 'image') {
    inner = `<div class="field"><label>Ścieżka do obrazu</label>
      <input type="text" value="${esc(b.src)}" placeholder="assets/screenshot.png" oninput="updateBlock(${b.id},'src',this.value);updatePreview()" /></div>
      <div class="field"><label>Alt text</label>
      <input type="text" value="${esc(b.alt)}" placeholder="Opis obrazu" oninput="updateBlock(${b.id},'alt',this.value);updatePreview()" /></div>
      <div class="field"><label>Podpis (opcjonalny)</label>
      <input type="text" value="${esc(b.caption||'')}" oninput="updateBlock(${b.id},'caption',this.value);updatePreview()" /></div>`;
  } else if (b.type === 'table') {
    inner = `<div class="field"><label>Nagłówki kolumn (oddziel | )</label>
      <input type="text" value="${esc((b.headers||[]).join(' | '))}" oninput="updateBlock(${b.id},'headers',this.value.split('|').map(s=>s.trim()));updatePreview()" /></div>
      <div class="field"><label>Wiersze (każdy wiersz nowa linia, kolumny oddziel | )</label>
      <textarea oninput="updateBlock(${b.id},'rows',this.value.split('\\n').filter(r=>r.trim()).map(r=>r.split('|').map(c=>c.trim())));updatePreview()">${(b.rows||[]).map(r=>r.join(' | ')).join('\n')}</textarea></div>`;
  } else if (b.type === 'callout') {
    inner = `<div class="field"><label>Ikona emoji</label>
      <input type="text" value="${esc(b.icon||'💡')}" maxlength="2" style="width:60px" oninput="updateBlock(${b.id},'icon',this.value);updatePreview()" /></div>
      <div class="field"><label>Treść</label>
      <textarea oninput="updateBlock(${b.id},'text',this.value);updatePreview()">${esc(b.text)}</textarea></div>`;
  } else if (b.type === 'code') {
    inner = `<div class="field"><label>Język (opcjonalny)</label>
      <input type="text" value="${esc(b.lang||'')}" placeholder="js, python, bash..." style="width:120px" oninput="updateBlock(${b.id},'lang',this.value);updatePreview()" /></div>
      <div class="field"><label>Kod</label>
      <textarea style="font-family:'JetBrains Mono',monospace;font-size:.8rem" oninput="updateBlock(${b.id},'text',this.value);updatePreview()">${esc(b.text)}</textarea></div>`;
  } else if (b.type === 'divider') {
    inner = `<p style="color:var(--muted);font-size:.8rem">Pozioma linia separatora.</p>`;
  } else if (b.type === 'video') {
    inner = `<div class="field"><label>Link YouTube (wklej pełny link lub ID)</label>
      <input type="text" value="${esc(b.url||'')}" placeholder="https://www.youtube.com/watch?v=..." oninput="updateBlock(${b.id},'url',this.value);updatePreview()" /></div>`;
  } else if (b.type === 'community') {
    inner = `<div class="field"><label>Tytuł sekcji (np. Pytanie do graczy)</label>
      <input type="text" value="${esc(b.title||'')}" oninput="updateBlock(${b.id},'title',this.value);updatePreview()" /></div>
      <div class="field"><label>Treść pytania/prośby</label>
      <textarea oninput="updateBlock(${b.id},'text',this.value);updatePreview()">${esc(b.text)}</textarea></div>`;
  }

  return `<div class="block-item open">
    <div class="block-header" onclick="this.parentElement.classList.toggle('open')">
      <div style="display:flex;align-items:center;gap:8px">
        <span class="block-type-badge" style="background:${color};color:var(--muted-hi)">${icon}</span>
        <span style="font-size:.82rem;color:var(--muted-hi)">${b.type}</span>
      </div>
      <div class="block-actions" onclick="event.stopPropagation()">
        <button class="icon-btn" title="W górę" onclick="moveBlock(${b.id},-1)">↑</button>
        <button class="icon-btn" title="W dół" onclick="moveBlock(${b.id},1)">↓</button>
        <button class="icon-btn del" title="Usuń" onclick="removeBlock(${b.id})">✕</button>
      </div>
    </div>
    <div class="block-inner">${inner}</div>
  </div>`;
}

// ────────────────────────────────────────────────────────────────────────────
// HERO IMAGE
// ────────────────────────────────────────────────────────────────────────────
function handleImgFile(e) {
  const file = e.target.files[0]; if (!file) return;
  readImg(file);
}
function handleImgDrop(e) {
  e.preventDefault();
  document.getElementById('img-drop').classList.remove('drag');
  const file = e.dataTransfer.files[0]; if (!file) return;
  readImg(file);
}
function readImg(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    heroBase64 = ev.target.result;
    document.getElementById('hero-preview').src = heroBase64;
    document.getElementById('hero-preview').style.display='block';
    document.getElementById('f-hero-path').value = '';
    updatePreview();
  };
  reader.readAsDataURL(file);
}

// ────────────────────────────────────────────────────────────────────────────
// PREVIEW
// ────────────────────────────────────────────────────────────────────────────
function getFormData() {
  return {
    version: document.getElementById('f-version').value.trim(),
    title:   document.getElementById('f-title').value.trim(),
    author:  document.getElementById('f-author').value.trim(),
    date:    document.getElementById('f-date').value,
    excerpt: document.getElementById('f-excerpt').value.trim(),
    tags:    [...document.querySelectorAll('.tag-cb:checked')].map(c=>c.value),
    prev:    document.getElementById('f-prev').value.trim(),
    next:    document.getElementById('f-next').value.trim(),
    heroPath:document.getElementById('f-hero-path').value.trim(),
  };
}

function renderBlockPreview(b) {
  if (b.type==='heading') return `<h2>${esc(b.text)}</h2>`;
  if (b.type==='paragraph') return `<p>${nl2br(esc(b.text))}</p>`;
  if (b.type==='list') return `<ul>${(b.items||[]).map(it=>`<li>${esc(it)}</li>`).join('')}</ul>`;
  if (b.type==='change') {
    const labelMap={feat:'NOWOŚĆ',fix:'POPRAWKA',perf:'WYDAJNOŚĆ',break:'BREAKING',info:'INFO'};
    const lbl = b.label || labelMap[b.kind]||b.kind;
    return `<div class="change-block ${b.kind}"><div class="cb-label">${esc(lbl)}</div><p>${nl2br(esc(b.text))}</p></div>`;
  }
  if (b.type==='image') {
    const cap = b.caption ? `<div class="img-caption">${esc(b.caption)}</div>` : '';
    return `<img src="${esc(b.src)}" alt="${esc(b.alt||'')}" />${cap}`;
  }
  if (b.type==='table') {
    const ths = (b.headers||[]).map(h=>`<th>${esc(h)}</th>`).join('');
    const trs = (b.rows||[]).map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('');
    return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
  }
  if (b.type==='callout') return `<div class="callout"><span class="callout-icon">${b.icon||'💡'}</span><p>${nl2br(esc(b.text))}</p></div>`;
  if (b.type==='code') return `<pre>${esc(b.text)}</pre>`;
  if (b.type==='divider') return `<hr class="pv-hr" />`;
  if (b.type==='video') {
    const v = (b.url||'').match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\n]+)/);
    const vid = v ? v[1] : '';
    return vid ? `<iframe src="https://www.youtube.com/embed/${vid}" allowfullscreen></iframe>` : `<p style="color:var(--danger)">Nieprawidłowy lub pusty link YouTube</p>`;
  }
  if (b.type==='community') return `<div class="community-box"><h4>${esc(b.title)}</h4><p>${nl2br(esc(b.text))}</p></div>`;
  return '';
}

const TAG_MAP = {fix:'Poprawka',feat:'Nowość',perf:'Wydajność',break:'Breaking',patch:'Patch'};

function updatePreview() {
  const d = getFormData();
  const heroSrc = heroBase64 || d.heroPath;
  const tags = d.tags.map(t=>`<span class="tag tag-${t}">${TAG_MAP[t]||t}</span>`).join('');
  const content = blocks.map(renderBlockPreview).join('\n');

  let heroHtml = heroSrc
    ? `<img class="pv-hero" src="${heroSrc}" alt="" />`
    : `<div class="pv-hero-ph"><div class="pv-hero-ph-text">v${d.version||'?'}</div></div>`;

  document.getElementById('preview-area').innerHTML = `
    ${heroHtml}
    <div class="pv-meta">
      <span class="pv-version">v${d.version||'?'}</span>
      <span class="pv-date">${d.date||'brak daty'}</span>
      ${tags}
    </div>
    <div class="pv-title">${d.title||'Tytuł aktualizacji'}</div>
    ${d.author ? `<div style="font-family:'JetBrains Mono',monospace;font-size:.8rem;color:var(--muted);margin-bottom:8px">Autor: ${esc(d.author)}</div>` : ''}
    ${d.excerpt ? `<div class="pv-excerpt">${d.excerpt}</div>` : ''}
    <div class="pv-content">${content}</div>
  `;
}

// ────────────────────────────────────────────────────────────────────────────
// GENERATE HTML
// ────────────────────────────────────────────────────────────────────────────
function generateHtml() {
  const d = getFormData();
  const heroSrc = heroBase64 || d.heroPath;
  const tags = d.tags.map(t=>`<span class="tag tag-${t}">${TAG_MAP[t]||t}</span>`).join('');
  const content = blocks.map(b => generateBlockHtml(b)).join('\n    ');
  const fname = (d.version||'1.0.0').replace(/\s/g,'_');

  const heroBlock = heroSrc
    ? `<div class="hero-image-wrap"><img src="${heroSrc}" alt="Hero v${d.version}" /></div>`
    : `<div class="hero-gradient"><div class="hero-gradient-inner">v${d.version}</div></div>`;

  const prevNav = d.prev
    ? `<a class="ver-btn prev" href="${d.prev}.html"><span class="vb-label">← Poprzednia</span><span class="vb-ver">v${d.prev}</span></a>`:'';
  const nextNav = d.next
    ? `<a class="ver-btn next" href="${d.next}.html"><span class="vb-label">Następna →</span><span class="vb-ver">v${d.next}</span></a>`:'';

  return { html: `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>v${d.version} — Moja Gra</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="changelog-style.css" />
</head>
<body>

<header>
  <div class="header-inner">
    <a href="../index.html" class="logo">
      <img src="logo.png" alt="Logo" class="main-logo" style="height: 32px; object-fit: contain;" />
    </a>
    <a href="index.html" class="back-link">← Wszystkie changelogi</a>
  </div>
</header>

${heroBlock}

<article>
  <div class="article-meta">
    <span class="art-version">v${d.version}</span>
    <span class="art-date">${d.date}</span>
    ${tags}
  </div>
  <h1 class="article-title">${d.title}</h1>
  ${d.author ? `<p style="font-family:'JetBrains Mono',monospace;font-size:.85rem;color:var(--muted);margin:-5px 0 20px;">Autor: ${esc(d.author)}</p>` : ''}
  ${d.excerpt ? `<p class="article-excerpt">${d.excerpt}</p>` : ''}

  <div class="cl-content">
    ${content}
  </div>

  <nav class="version-nav">
    ${prevNav}${nextNav}
  </nav>
</article>

<footer>
  <a href="index.html">← Wszystkie changelogi</a>
</footer>

</body>
</html>`, filename: `${fname}.html` };
}

function generateBlockHtml(b) {
  if (b.type==='heading') return `<h2>${b.text}</h2>`;
  if (b.type==='paragraph') return `<p>${b.text.replace(/\n/g,'<br>')}</p>`;
  if (b.type==='list') return `<ul>\n      ${(b.items||[]).map(it=>`<li>${it}</li>`).join('\n      ')}\n    </ul>`;
  if (b.type==='change') {
    const labelMap={feat:'NOWOŚĆ',fix:'POPRAWKA',perf:'WYDAJNOŚĆ',break:'BREAKING',info:'INFO'};
    const lbl = b.label || labelMap[b.kind]||b.kind;
    return `<div class="change-block ${b.kind}">\n      <div class="cb-label">${lbl}</div>\n      <p>${b.text}</p>\n    </div>`;
  }
  if (b.type==='image') {
    const cap = b.caption ? `\n    <div class="img-caption">${b.caption}</div>` : '';
    return `<img src="${b.src}" alt="${b.alt||''}" />${cap}`;
  }
  if (b.type==='table') {
    const ths = (b.headers||[]).map(h=>`<th>${h}</th>`).join('');
    const trs = (b.rows||[]).map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('\n      ');
    return `<table>\n      <thead><tr>${ths}</tr></thead>\n      <tbody>\n      ${trs}\n      </tbody>\n    </table>`;
  }
  if (b.type==='callout') return `<div class="callout"><span class="callout-icon">${b.icon||'💡'}</span><p>${b.text}</p></div>`;
  if (b.type==='code') return `<pre><code>${b.text.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>`;
  if (b.type==='divider') return `<hr />`;
  if (b.type==='video') {
    const v = (b.url||'').match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\n]+)/);
    return v ? `<iframe src="https://www.youtube.com/embed/${v[1]}" allowfullscreen style="width:100%;aspect-ratio:16/9;border-radius:10px;border:none;margin:16px 0;"></iframe>` : '';
  }
  if (b.type==='community') return `<div class="community-box" style="border:1px dashed #a855f7;background:rgba(124,58,237,.15);border-radius:8px;padding:16px;margin:16px 0;text-align:center;"><h4 style="font-family:'Space Grotesk',sans-serif;color:#a855f7;margin-top:0;margin-bottom:8px;">${b.title}</h4><p style="margin:0">${b.text.replace(/\n/g,'<br>')}</p></div>`;
  return '';
}

// ────────────────────────────────────────────────────────────────────────────
// DOWNLOAD
// ────────────────────────────────────────────────────────────────────────────
document.getElementById('btn-download').addEventListener('click', () => {
  const d = getFormData();
  if (!d.version) { toast('Wpisz numer wersji!','error'); return; }
  const { html, filename } = generateHtml();
  const blob = new Blob([html], {type:'text/html'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  toast(`Pobrano ${filename} ✓`,'success');
});

document.getElementById('btn-preview-code').addEventListener('click', () => {
  const d = getFormData();
  if (!d.version) { toast('Wpisz numer wersji!','error'); return; }
  const { html } = generateHtml();
  document.getElementById('code-output').textContent = html;
  document.getElementById('code-modal').classList.add('open');
});

function copyCode() {
  navigator.clipboard.writeText(document.getElementById('code-output').textContent).then(()=>toast('Skopiowano! ✓','success'));
}

document.getElementById('btn-export-md').addEventListener('click', () => {
  const d = getFormData();
  if (!d.version) { toast('Wpisz numer wersji!','error'); return; }
  
  let md = `# v${d.version} - ${d.title}\n`;
  if (d.author) md += `**Autor:** ${d.author}\n`;
  md += `**Data:** ${d.date}\n`;
  if (d.tags.length) md += `**Tagi:** ${d.tags.join(', ')}\n`;
  if (d.excerpt) md += `\n> ${d.excerpt}\n\n`;

  blocks.forEach(b => {
    if (b.type === 'heading') md += `## ${b.text}\n\n`;
    if (b.type === 'paragraph') md += `${b.text}\n\n`;
    if (b.type === 'list') md += (b.items||[]).map(it=>`- ${it}`).join('\n') + '\n\n';
    if (b.type === 'change') {
      const lbl = b.label || b.kind.toUpperCase();
      md += `**[${lbl}]** ${b.text}\n\n`;
    }
    if (b.type === 'image') md += `![${b.alt||''}](${b.src})\n${b.caption ? `*${b.caption}*\n\n` : '\n'}`;
    if (b.type === 'table') {
      md += `| ${(b.headers||[]).join(' | ')} |\n`;
      md += `| ${(b.headers||[]).map(()=>'---').join(' | ')} |\n`;
      (b.rows||[]).forEach(r => { md += `| ${r.join(' | ')} |\n`; });
      md += '\n';
    }
    if (b.type === 'callout') md += `> **${b.icon||'💡'}** ${b.text.replace(/\n/g,'\n> ')}\n\n`;
    if (b.type === 'code') md += `\`\`\`${b.lang||''}\n${b.text}\n\`\`\`\n\n`;
    if (b.type === 'divider') md += `---\n\n`;
    if (b.type === 'video') md += `[Wideo YouTube](${b.url})\n\n`;
    if (b.type === 'community') md += `### 👥 ${b.title}\n${b.text}\n\n`;
  });

  navigator.clipboard.writeText(md).then(()=>toast('Skopiowano jako Markdown! ✓','success'));
});

// ────────────────────────────────────────────────────────────────────────────
// CHANGELOGS-DATA.JS
// ────────────────────────────────────────────────────────────────────────────
document.getElementById('btn-data-js').addEventListener('click', () => {
  document.getElementById('data-output').textContent = '';
  document.getElementById('data-modal').classList.add('open');
});

function generateDataJs() {
  const d = getFormData();
  if (!d.version) { toast('Wpisz numer wersji!','error'); return; }
  const fname = d.version.replace(/\s/g,'_') + '.html';
  const heroSrc = heroBase64 ? '(base64 wbudowany)' : d.heroPath;
  const newEntry = {
    version: d.version,
    date: d.date,
    title: d.title,
    excerpt: d.excerpt,
    tags: d.tags,
    heroImage: heroBase64 ? '(wklej ścieżkę lub base64)' : d.heroPath,
    file: fname,
  };

  // parse existing
  let existing = [];
  const raw = document.getElementById('existing-data').value.trim();
  if (raw) {
    try {
      const fn = new Function(raw + '\nreturn typeof CHANGELOGS_DATA!=="undefined"?CHANGELOGS_DATA:[];');
      existing = fn();
    } catch(e) { toast('Błąd parsowania istniejącego pliku','error'); }
  }
  // replace or push
  const idx = existing.findIndex(e=>e.version===d.version);
  if (idx>=0) existing[idx]=newEntry; else existing.push(newEntry);
  // sort
  existing.sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));

  const out = `// changelogs-data.js — Zarządzaj tą listą by aktualizować stronę główną changelogów
// Plik ten powinien znajdować się w folderze changelogs/

const CHANGELOGS_DATA = ${JSON.stringify(existing, null, 2)};`;
  document.getElementById('data-output').textContent = out;
}

function copyDataJs() {
  const txt = document.getElementById('data-output').textContent;
  if (!txt) { generateDataJs(); return; }
  navigator.clipboard.writeText(txt).then(()=>toast('Skopiowano data.js! ✓','success'));
}

// ────────────────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────────────────
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function nl2br(s) { return s.replace(/\n/g,'<br>'); }

let toastTimer;
function toast(msg, type='') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (type?' '+type:'');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>el.classList.remove('show'),2800);
}

// close modals on bg click
document.querySelectorAll('.code-modal-bg').forEach(bg => {
  bg.addEventListener('click', e => { if(e.target===bg) bg.classList.remove('open'); });
});

// set today's date
document.getElementById('f-date').value = new Date().toISOString().slice(0,10);

// initial preview
updatePreview();
