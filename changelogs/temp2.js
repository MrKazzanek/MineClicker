
let blocks = [];
let blockId = 0;
let heroBase64 = '';

const BLOCKS_DEF = {
  heading: { text: 'Nowa sekcja' },
  paragraph: { text: 'Wpisz tekst...' },
  list: { items: ['Zmiana 1', 'Zmiana 2'] },
  change: { kind: 'feat', label: '', text: 'Dodano nową funkcję' },
  image: { src: '', alt: '', caption: '' },
  table: { headers: ['Kol 1', 'Kol 2'], rows: [['Dane 1', 'Dane 2']] },
  callout: { icon: '💡', text: 'Ważna informacja' },
  code: { lang: '', text: 'console.log("Hello");' },
  divider: {},
  video: { url: '' },
  community: { title: 'Pytanie do graczy', text: 'Co sądzicie o aktualizacji?' }
};

const BLOCKS_UI = {
  heading: { icon: 'H', color: 'rgba(124,58,237,.25)' },
  paragraph: { icon: '¶', color: 'rgba(100,116,139,.15)' },
  list: { icon: '≡', color: 'rgba(16,185,129,.15)' },
  change: { icon: '⊞', color: 'rgba(245,158,11,.15)' },
  image: { icon: '🖼', color: 'rgba(59,130,246,.15)' },
  table: { icon: '⊟', color: 'rgba(14,165,233,.15)' },
  callout: { icon: '💡', color: 'rgba(168,85,247,.15)' },
  code: { icon: '</>', color: 'rgba(100,116,139,.2)' },
  divider: { icon: '─', color: 'rgba(100,116,139,.1)' },
  video: { icon: '▶️', color: 'rgba(239,68,68,.15)' },
  community: { icon: '👥', color: 'rgba(168,85,247,.2)' }
};

// Utils
const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const nl2br = s => String(s||'').replace(/\n/g,'<br>');

function showToast(msg, type='success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + type;
  setTimeout(() => el.classList.remove('show'), 3000);
}

// Blocks Management
window.addBlock = (type) => {
  blocks.push({ id: ++blockId, type, ...JSON.parse(JSON.stringify(BLOCKS_DEF[type])) });
  renderBlocks();
  updatePreview();
}
window.removeBlock = (id) => { blocks = blocks.filter(b => b.id !== id); renderBlocks(); updatePreview(); }
window.moveBlock = (id, dir) => {
  const i = blocks.findIndex(b => b.id === id);
  if (i < 0 || i+dir < 0 || i+dir >= blocks.length) return;
  [blocks[i], blocks[i+dir]] = [blocks[i+dir], blocks[i]];
  renderBlocks(); updatePreview();
}
window.updateBlock = (id, key, val) => {
  const b = blocks.find(b => b.id === id);
  if (b) { b[key] = val; updatePreview(); }
}

function renderBlocks() {
  const list = document.getElementById('blocks-list');
  list.innerHTML = blocks.map(b => {
    const ui = BLOCKS_UI[b.type] || { icon: '?', color: 'transparent' };
    let inner = '';
    
    if (b.type === 'heading') inner = '<label>Tekst</label><input type="text" value="' + esc(b.text) + '" oninput="updateBlock(' + b.id + ',\'text\',this.value)" />';
    else if (b.type === 'paragraph') inner = '<label>Tekst</label><textarea oninput="updateBlock(' + b.id + ',\'text\',this.value)">' + esc(b.text) + '</textarea>';
    else if (b.type === 'list') inner = '<label>Elementy (nowa linia = nowy element)</label><textarea oninput="updateBlock(' + b.id + ',\'items\',this.value.split(\'\\n\'))">' + esc((b.items||[]).join('\n')) + '</textarea>';
    else if (b.type === 'change') inner = '<label>Typ zmiany</label><select onchange="updateBlock(' + b.id + ',\'kind\',this.value)">' + ['feat','fix','perf','break','info'].map(k=>'<option value="' + k + '" ' + (b.kind===k?'selected':'') + '>' + k.toUpperCase() + '</option>').join('') + '</select><label style="margin-top:8px">Etykieta</label><input type="text" value="' + esc(b.label||'') + '" oninput="updateBlock(' + b.id + ',\'label\',this.value)" /><label style="margin-top:8px">Opis</label><textarea oninput="updateBlock(' + b.id + ',\'text\',this.value)">' + esc(b.text) + '</textarea>';
    else if (b.type === 'image') inner = '<label>Ścieżka</label><input type="text" value="' + esc(b.src) + '" oninput="updateBlock(' + b.id + ',\'src\',this.value)" /><label style="margin-top:8px">Alt text</label><input type="text" value="' + esc(b.alt) + '" oninput="updateBlock(' + b.id + ',\'alt\',this.value)" /><label style="margin-top:8px">Podpis</label><input type="text" value="' + esc(b.caption) + '" oninput="updateBlock(' + b.id + ',\'caption\',this.value)" />';
    else if (b.type === 'table') inner = '<label>Nagłówki (oddzielone |)</label><input type="text" value="' + esc((b.headers||[]).join(' | ')) + '" oninput="updateBlock(' + b.id + ',\'headers\',this.value.split(\'|\').map(s=>s.trim()))" /><label style="margin-top:8px">Wiersze (oddzielone |, enter = nowy wiersz)</label><textarea oninput="updateBlock(' + b.id + ',\'rows\',this.value.split(\'\\n\').filter(r=>r.trim()).map(r=>r.split(\'|\').map(s=>s.trim())))">' + esc((b.rows||[]).map(r=>r.join(' | ')).join('\n')) + '</textarea>';
    else if (b.type === 'callout') inner = '<label>Ikona</label><input type="text" value="' + esc(b.icon) + '" style="width:60px" oninput="updateBlock(' + b.id + ',\'icon\',this.value)" /><label style="margin-top:8px">Tekst</label><textarea oninput="updateBlock(' + b.id + ',\'text\',this.value)">' + esc(b.text) + '</textarea>';
    else if (b.type === 'code') inner = '<label>Język</label><input type="text" value="' + esc(b.lang) + '" oninput="updateBlock(' + b.id + ',\'lang\',this.value)" /><label style="margin-top:8px">Kod</label><textarea style="font-family:monospace" oninput="updateBlock(' + b.id + ',\'text\',this.value)">' + esc(b.text) + '</textarea>';
    else if (b.type === 'divider') inner = '<p style="font-size: .8rem; color: var(--muted)">Brak opcji konfiguracyjnych.</p>';
    else if (b.type === 'video') inner = '<label>Link YouTube</label><input type="text" value="' + esc(b.url) + '" oninput="updateBlock(' + b.id + ',\'url\',this.value)" />';
    else if (b.type === 'community') inner = '<label>Tytuł</label><input type="text" value="' + esc(b.title) + '" oninput="updateBlock(' + b.id + ',\'title\',this.value)" /><label style="margin-top:8px">Treść</label><textarea oninput="updateBlock(' + b.id + ',\'text\',this.value)">' + esc(b.text) + '</textarea>';

    return '<div class="block-item open"><div class="block-header" onclick="this.parentElement.classList.toggle(\'open\')"><div style="display:flex;align-items:center;gap:8px"><span class="block-type-badge" style="background:' + ui.color + ';color:var(--text)">' + ui.icon + '</span><span style="font-weight:500">' + b.type + '</span></div><div class="block-actions" onclick="event.stopPropagation()"><button class="icon-btn" onclick="moveBlock(' + b.id + ',-1)">↑</button><button class="icon-btn" onclick="moveBlock(' + b.id + ',1)">↓</button><button class="icon-btn del" onclick="removeBlock(' + b.id + ')">✕</button></div></div><div class="block-inner">' + inner + '</div></div>';
  }).join('');
}

// Data gathering
function getFormData() {
  return {
    version: document.getElementById('f-version').value.trim(),
    title: document.getElementById('f-title').value.trim(),
    author: document.getElementById('f-author').value.trim(),
    date: document.getElementById('f-date').value,
    excerpt: document.getElementById('f-excerpt').value.trim(),
    tags: Array.from(document.querySelectorAll('.tag-cb:checked')).map(cb => cb.value),
    prev: document.getElementById('f-prev').value.trim(),
    next: document.getElementById('f-next').value.trim(),
    hero: heroBase64 || document.getElementById('f-hero-path').value.trim()
  };
}

// Generate HTML safe string
function blockToHtml(b) {
  if (b.type === 'heading') return '<h2>' + esc(b.text) + '</h2>';
  if (b.type === 'paragraph') return '<p>' + nl2br(esc(b.text)) + '</p>';
  if (b.type === 'list') return '<ul>' + (b.items||[]).map(i=>'<li>'+esc(i)+'</li>').join('') + '</ul>';
  if (b.type === 'change') {
    const l = b.label || b.kind.toUpperCase();
    return '<div class="change-block ' + b.kind + '"><div class="cb-label">' + esc(l) + '</div><p>' + nl2br(esc(b.text)) + '</p></div>';
  }
  if (b.type === 'image') return '<img src="' + esc(b.src) + '" alt="' + esc(b.alt) + '" />' + (b.caption ? '<div class="img-caption">' + esc(b.caption) + '</div>' : '');
  if (b.type === 'table') {
    const th = (b.headers||[]).map(h=>'<th>'+esc(h)+'</th>').join('');
    const tr = (b.rows||[]).map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('');
    return '<table><thead><tr>' + th + '</tr></thead><tbody>' + tr + '</tbody></table>';
  }
  if (b.type === 'callout') return '<div class="callout"><span class="callout-icon">' + esc(b.icon) + '</span><p>' + nl2br(esc(b.text)) + '</p></div>';
  if (b.type === 'code') return '<pre><code>' + esc(b.text) + '</code></pre>';
  if (b.type === 'divider') return '<hr class="pv-hr" />';
  if (b.type === 'video') {
    const m = (b.url||'').match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\n]+)/);
    return m ? '<iframe src="https://www.youtube.com/embed/' + m[1] + '" allowfullscreen></iframe>' : '';
  }
  if (b.type === 'community') return '<div class="community-box"><h4>' + esc(b.title) + '</h4><p>' + nl2br(esc(b.text)) + '</p></div>';
  return '';
}

// Live Preview
window.updatePreview = () => {
  const d = getFormData();
  const htmlBlocks = blocks.map(blockToHtml).join('\\n');
  const tagMap = { feat:'Nowość', fix:'Poprawka', perf:'Wydajność', break:'Breaking', patch:'Patch', event:'Event' };
  
  let tagsHtml = d.tags.map(t => '<span class="pv-tag">' + (tagMap[t]||t) + '</span>').join('');
  let heroHtml = d.hero 
    ? '<img class="pv-hero" src="' + esc(d.hero) + '" />'
    : '<div class="pv-hero-ph"><span class="pv-hero-ph-text">v' + esc(d.version) + '</span></div>';

  document.getElementById('preview-area').innerHTML = 
    heroHtml +
    '<div class="pv-meta">' +
      '<span class="pv-version">v' + esc(d.version || '?.?.?') + '</span>' +
      '<span class="pv-date">' + esc(d.date || 'Brak daty') + '</span>' +
      tagsHtml +
    '</div>' +
    '<div class="pv-title">' + esc(d.title || 'Tytuł Aktualizacji') + '</div>' +
    (d.author ? '<div class="pv-author">Autor: ' + esc(d.author) + '</div>' : '') +
    (d.excerpt ? '<div class="pv-excerpt">' + nl2br(esc(d.excerpt)) + '</div>' : '') +
    '<div class="pv-content">' + htmlBlocks + '</div>';
}

// Export Generators
function getFullHtml() {
  const d = getFormData();
  const htmlBlocks = blocks.map(blockToHtml).join('\\n    ');
  const fname = (d.version || 'changelog').replace(/[^a-zA-Z0-9.\\-]/g, '_');
  const tagMap = { feat:'Nowość', fix:'Poprawka', perf:'Wydajność', break:'Breaking', patch:'Patch', event:'Event' };
  
  let out = '<!DOCTYPE html>\\n<html lang="pl">\\n<head>\\n';
  out += '  <meta charset="UTF-8" />\\n';
  out += '  <title>v' + esc(d.version) + ' - Changelog</title>\\n';
  out += '  <link rel="stylesheet" href="changelog-style.css" />\\n';
  out += '</head>\\n<body>\\n\\n';
  out += '<header><a href="index.html">← Wróć do listy</a></header>\\n\\n';
  out += '<article>\\n';
  out += '  <h1>' + esc(d.title) + '</h1>\\n';
  out += '  <div class="content">\\n';
  out += '    ' + htmlBlocks + '\\n';
  out += '  </div>\\n';
  out += '</article>\\n\\n';
  out += '<' + '/body>\\n<' + '/html>';
  
  return { html: out, fname: fname + '.html' };
}

function generateMarkdown() {
  const d = getFormData();
  let md = '# v' + d.version + ' - ' + d.title + '\\n\\n';
  if (d.date) md += '**Data:** ' + d.date + '\\n';
  if (d.author) md += '**Autor:** ' + d.author + '\\n\\n';
  if (d.excerpt) md += '> ' + d.excerpt.replace(/\\n/g, '\\n> ') + '\\n\\n';

  blocks.forEach(b => {
    if (b.type==='heading') md += '## ' + b.text + '\\n\\n';
    if (b.type==='paragraph') md += b.text + '\\n\\n';
    if (b.type==='list') md += (b.items||[]).map(i=>'- '+i).join('\\n') + '\\n\\n';
    if (b.type==='change') md += '**[' + (b.label||b.kind.toUpperCase()) + ']** ' + b.text + '\\n\\n';
    if (b.type==='image') md += '![' + b.alt + '](' + b.src + ')\\n' + (b.caption ? '*'+b.caption+'*\\n\\n' : '\\n');
    if (b.type==='code') md += '```' + b.lang + '\\n' + b.text + '\\n```\\n\\n';
    if (b.type==='table') {
      md += '| ' + (b.headers||[]).join(' | ') + ' |\\n';
      md += '| ' + (b.headers||[]).map(()=>'---').join(' | ') + ' |\\n';
      (b.rows||[]).forEach(r => md += '| ' + r.join(' | ') + ' |\\n');
      md += '\\n';
    }
    if (b.type==='callout') md += '> **' + b.icon + '** ' + b.text.replace(/\\n/g, '\\n> ') + '\\n\\n';
    if (b.type==='divider') md += '---\\n\\n';
    if (b.type==='video') md += '[Wideo](' + b.url + ')\\n\\n';
    if (b.type==='community') md += '### ' + b.title + '\\n' + b.text + '\\n\\n';
  });
  return md.trim();
}

// Actions
document.getElementById('btn-preview-code').addEventListener('click', () => {
  document.getElementById('code-output').textContent = getFullHtml().html;
  document.getElementById('code-modal').classList.add('open');
});

document.getElementById('btn-export-md').addEventListener('click', () => {
  navigator.clipboard.writeText(generateMarkdown()).then(() => showToast('Skopiowano jako Markdown!'));
});

document.getElementById('btn-download').addEventListener('click', () => {
  const data = getFullHtml();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data.html], {type:'text/html'}));
  a.download = data.fname;
  a.click();
  showToast('Pobrano plik: ' + data.fname);
});

document.getElementById('btn-data-js').addEventListener('click', () => {
  document.getElementById('data-modal').classList.add('open');
  document.getElementById('data-output').textContent = '';
});

window.generateDataJs = () => {
  const d = getFormData();
  const entry = {
    version: d.version, title: d.title, date: d.date,
    excerpt: d.excerpt, tags: d.tags, file: getFullHtml().fname,
    heroImage: d.hero ? '(obecny obraz)' : ''
  };
  
  let arr = [];
  const raw = document.getElementById('existing-data').value.trim();
  if (raw) {
    try { arr = new Function(raw + '\\nreturn typeof CHANGELOGS_DATA!=="undefined"?CHANGELOGS_DATA:[];')(); } 
    catch(e) { showToast('Błąd parsowania starego pliku JS', 'error'); return; }
  }
  
  const idx = arr.findIndex(x => x.version === d.version);
  if (idx >= 0) arr[idx] = entry; else arr.push(entry);
  arr.sort((a,b) => new Date(b.date||0) - new Date(a.date||0));
  
  document.getElementById('data-output').textContent = 'const CHANGELOGS_DATA = ' + JSON.stringify(arr, null, 2) + ';';
}

window.copyText = (id) => {
  const el = document.getElementById(id);
  if (el.textContent) {
    navigator.clipboard.writeText(el.textContent).then(() => showToast('Skopiowano do schowka!'));
  }
}

// Drag & Drop Hero
const imgDrop = document.getElementById('img-drop');
const fileInput = document.getElementById('hero-file');
imgDrop.addEventListener('click', () => fileInput.click());
imgDrop.addEventListener('dragover', e => { e.preventDefault(); imgDrop.classList.add('drag'); });
imgDrop.addEventListener('dragleave', () => imgDrop.classList.remove('drag'));
imgDrop.addEventListener('drop', e => {
  e.preventDefault(); imgDrop.classList.remove('drag');
  handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', e => handleFile(e.target.files[0]));

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const r = new FileReader();
  r.onload = ev => {
    heroBase64 = ev.target.result;
    document.getElementById('f-hero-path').value = '';
    const preview = document.getElementById('hero-preview');
    preview.src = heroBase64; preview.style.display = 'block';
    updatePreview();
  };
  r.readAsDataURL(file);
}

// Mobile Tabs
document.querySelectorAll('.mobile-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    if (tab.dataset.target === 'preview') document.getElementById('workspace').classList.add('show-preview');
    else document.getElementById('workspace').classList.remove('show-preview');
  });
});

document.getElementById('f-date').value = new Date().toISOString().slice(0,10);
updatePreview();
