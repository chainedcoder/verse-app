// ============================================
// VERSE — Export / Download Template Chooser
// ============================================

import { getPoem, getAuthor } from '../data.js';
import { showToast } from '../toast.js';
import { getTheme, getAccent } from '../theme.js';

let selectedTemplate = 'siteview';
let colorIndex = 0;

// Accent color HSL definitions matching base.css
const accentDefs = {
  indigo: { h: 235, s: 45 },
  rose: { h: 348, s: 60 },
  emerald: { h: 160, s: 50 },
  amber: { h: 32, s: 65 },
  violet: { h: 270, s: 50 },
  ocean: { h: 200, s: 60 },
};

function hsl(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function getSiteViewColors() {
  const accent = getAccent() || 'indigo';
  const def = accentDefs[accent] || accentDefs.indigo;
  return [
    // Light theme variant
    { bg: '#faf8f4', text: '#1a1a2e', secondary: '#5a5a6e', tertiary: '#8a8a9a', accent: hsl(def.h, def.s, 22), accentSoft: hsl(def.h, def.s, 94), cardBg: '#ffffff', border: '#e8e4dc', label: 'Light' },
    // Dark theme variant
    { bg: '#0e0e1a', text: '#e8e4dc', secondary: '#9a96a6', tertiary: '#6a667a', accent: hsl(def.h, def.s, 72), accentSoft: hsl(def.h, 30, 18), cardBg: '#1a1a30', border: '#242038', label: 'Dark' },
  ];
}

const templateColors = {
  siteview: getSiteViewColors(),
  minimal: [
    { bg: '#ffffff', text: '#1a1a1a', accent: '#1a1a2e' },
    { bg: '#f9f6f0', text: '#2c2820', accent: '#4a3f35' },
    { bg: '#e8e6e1', text: '#1a1a1a', accent: '#222222' }
  ],
  dark: [
    { bg: '#12112a', text: '#e8e0d4', accent: '#3a3660' },
    { bg: '#1a1a1a', text: '#e8e8e8', accent: '#444444' },
    { bg: '#11221c', text: '#d4e8dd', accent: '#2a4a38' }
  ],
  love: [
    { bg: '#f5f0e4', text: '#1a1a1a', accent: '#c0392b' },
    { bg: '#fff0f3', text: '#2a1a1c', accent: '#d65a73' },
    { bg: '#fcedea', text: '#2c1e1c', accent: '#b05050' }
  ],
  story: [
    { bg: '#2d1f3d', text: '#f0e8ff', accent: '#9b7eb8' },
    { bg: '#0d1117', text: '#c9d1d9', accent: '#58a6ff' },
    { bg: '#3d261f', text: '#ffece8', accent: '#d97c66' }
  ]
};

export function renderExport(poemId) {
  const poem = getPoem(poemId);
  if (!poem) {
    return `
      <div class="container" style="padding:60px 0; text-align:center;">
        <h2 style="margin-bottom:8px;">Poem not found</h2>
        <a href="#/" class="btn btn-primary">Back to feed</a>
      </div>
    `;
  }
  const author = getAuthor(poem.authorId);
  const previewLines = poem.fullText.split('\n').slice(0, 4).join('<br>');
  const storyLines = poem.fullText.split('\n').slice(0, 2).join('<br>');
  const loveLines = poem.fullText.split('\n').slice(1, 3).join('<br>');

  // Refresh siteview colors in case accent changed
  templateColors.siteview = getSiteViewColors();
  const svC = templateColors.siteview[0];

  selectedTemplate = 'siteview';
  colorIndex = 0;

  return `
    <div class="container" style="padding:32px 0;">
      <div class="export-header">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:20px;">
          <button class="poem-viewer-back" id="export-back">
            <i class="ti ti-arrow-left" style="font-size:18px;" aria-hidden="true"></i>
            <span>Back to poem</span>
          </button>
        </div>
        <h2 style="font-size:18px; font-weight:500; margin:0 0 4px; font-family:'Inter',sans-serif;">Choose a layout for "${poem.title}"</h2>
        <p style="font-size:13px; color:var(--text-secondary); margin:0;">Pick a style to download or share</p>
      </div>

      <div class="template-grid" id="template-grid" style="margin-top:24px;">

        <!-- Template: Site View -->
        <div class="template-card selected" data-template="siteview" id="tpl-siteview">
          <div class="template-preview template-preview-siteview" style="background:${svC.bg}; color:${svC.text};">
            <div style="font-family:'Playfair Display',serif; font-size:14px; font-weight:bold; margin-bottom:4px;">${poem.title}</div>
            <div class="siteview-border-line" style="font-family:'Playfair Display',serif; font-size:12px; line-height:1.6; font-style:italic; padding-left:8px; border-left:3px solid ${svC.accent};">
              ${previewLines}
            </div>
            <div style="margin-top:12px; font-size:9px; color:currentColor; opacity:0.6;">— ${author.name}</div>
          </div>
          <div class="template-info">
            <div>
              <div class="template-info-name">Site view</div>
              <div class="template-info-desc">As seen on Verse</div>
            </div>
            <span class="template-selected-badge" id="badge-siteview">Selected</span>
          </div>
        </div>

        <!-- Template A: Minimal -->
        <div class="template-card" data-template="minimal" id="tpl-minimal">
          <div class="template-preview template-preview-minimal" style="background:#ffffff; color:#1a1a1a;">
            <div style="font-family:'Playfair Display',serif; font-size:14px; font-weight:bold; margin-bottom:4px;">${poem.title}</div>
            <div class="minimal-border-line" style="font-family:'Playfair Display',serif; font-size:12px; line-height:1.6; font-style:italic; padding-left:8px; border-left:2px solid #1a1a2e;">
              ${previewLines}
            </div>
            <div style="margin-top:12px; font-size:9px; color:currentColor; opacity:0.6;">— ${author.name}</div>
          </div>
          <div class="template-info">
            <div>
              <div class="template-info-name">Minimal</div>
              <div class="template-info-desc">Clean borders</div>
            </div>
            <i class="ti ti-download" style="font-size:14px; color:var(--text-tertiary);" aria-hidden="true"></i>
          </div>
        </div>

        <!-- Template B: Dark -->
        <div class="template-card" data-template="dark" id="tpl-dark">
          <div class="template-preview template-preview-dark" style="background:#12112a; color:#e8e0d4;">
            <div style="font-family:'Playfair Display',serif; font-size:14px; font-weight:bold; margin-bottom:4px;">${poem.title}</div>
            <div class="dark-border-line" style="font-family:'Playfair Display',serif; font-size:12px; line-height:1.6; font-style:italic; padding-left:8px; border-left:2px solid #3a3660;">
              ${previewLines}
            </div>
            <div style="margin-top:12px; font-size:9px; color:currentColor; opacity:0.6;">— ${author.name}</div>
          </div>
          <div class="template-info">
            <div>
              <div class="template-info-name">Dark cinematic</div>
              <div class="template-info-desc">Deep and moody</div>
            </div>
            <i class="ti ti-download" style="font-size:14px; color:var(--text-tertiary);" aria-hidden="true"></i>
          </div>
        </div>

        <!-- Template C: Love letter -->
        <div class="template-card" data-template="love" id="tpl-love">
          <div class="template-preview template-preview-love" style="background:#f5f0e4; color:#1a1a1a;">
            <div class="love-leaf" style="position:absolute; right:14px; top:14px; opacity:0.15; font-size:40px; color:#c0392b;">❧</div>
            <div class="love-title" style="font-family:'Playfair Display',serif; font-size:16px; font-weight:700; color:#c0392b; line-height:1.1; margin-bottom:10px; text-transform:uppercase;">${poem.title}</div>
            <div style="font-size:9px; color:currentColor; opacity:0.7; line-height:1.7; font-style:italic;">${loveLines}</div>
          </div>
          <div class="template-info">
            <div>
              <div class="template-info-name">Love letter</div>
              <div class="template-info-desc">Elegant romance</div>
            </div>
            <i class="ti ti-download" style="font-size:14px; color:var(--text-tertiary);" aria-hidden="true"></i>
          </div>
        </div>

        <!-- Template D: Story -->
        <div class="template-card" data-template="story" id="tpl-story">
          <div class="template-preview template-preview-story" style="background:#2d1f3d; color:#f0e8ff;">
            <div style="font-family:'Playfair Display',serif; font-size:14px; font-weight:bold; margin-bottom:6px; text-align:center;">${poem.title}</div>
            <div style="font-family:'Playfair Display',serif; font-size:12px; line-height:1.8; font-style:italic; text-align:center;">
              ${storyLines}
            </div>
            <div style="font-size:9px; color:currentColor; opacity:0.6; text-align:center; margin-top:12px;">— ${author.name}</div>
          </div>
          <div class="template-info">
            <div>
              <div class="template-info-name">Story format</div>
              <div class="template-info-desc">Instagram 9:16</div>
            </div>
            <i class="ti ti-download" style="font-size:14px; color:var(--text-tertiary);" aria-hidden="true"></i>
          </div>
        </div>

      </div>

      <div class="export-actions" style="position:relative; display:flex; justify-content:center; gap:10px; margin-top:24px;">
        <button class="btn btn-ghost" id="preview-btn" style="display:flex; align-items:center; gap:6px;">
          <i class="ti ti-eye" style="font-size:14px;" aria-hidden="true"></i> Preview
        </button>
        <button class="btn btn-primary" id="download-btn" style="display:flex; align-items:center; gap:6px;">
          <i class="ti ti-download" style="font-size:14px;" aria-hidden="true"></i> Download
        </button>
      </div>
    </div>
  `;
}

export function initExport(poemId) {
  const poem = getPoem(poemId);
  const author = getAuthor(poem?.authorId);
  if (!poem || !author) return;

  function applyColorsToHTML() {
    const c = templateColors[selectedTemplate][colorIndex];
    const preview = document.querySelector(`.template-preview-${selectedTemplate}`);
    if (!preview) return;

    preview.style.background = c.bg;
    preview.style.color = c.text;

    if (selectedTemplate === 'siteview') {
      const textDiv = preview.querySelector('.siteview-border-line');
      if (textDiv) textDiv.style.borderLeftColor = c.accent;
    }
    if (selectedTemplate === 'minimal') {
      const textDiv = preview.querySelector('.minimal-border-line');
      if (textDiv) textDiv.style.borderLeftColor = c.accent;
    }
    if (selectedTemplate === 'dark') {
      const textDiv = preview.querySelector('.dark-border-line');
      if (textDiv) textDiv.style.borderLeftColor = c.accent;
    }
    if (selectedTemplate === 'love') {
      const titleDiv = preview.querySelector('.love-title');
      if (titleDiv) titleDiv.style.color = c.accent;
      const leafDiv = preview.querySelector('.love-leaf');
      if (leafDiv) leafDiv.style.color = c.accent;
    }
  }

  function getPaletteHTML(tId) {
    const colors = templateColors[tId];
    return `
      <div class="card-palette" style="display:flex; gap:6px;">
        ${colors.map((c, idx) => `
          <div class="theme-accent-color ${idx === colorIndex ? 'active' : ''}" 
               data-index="${idx}" 
               style="background:${c.bg}; border: 1px solid ${idx === colorIndex ? 'var(--accent)' : c.text}; opacity: ${idx === colorIndex ? '1' : '0.6'}; width:18px; height:18px; border-radius:50%; cursor:pointer; box-shadow: ${idx === colorIndex ? '0 0 0 2px var(--bg-card)' : 'none'};">
          </div>
        `).join('')}
      </div>
    `;
  }

  // Initial color application if needed
  applyColorsToHTML();

  // Set default palette on initial selected card
  const initialCard = document.getElementById(`tpl-${selectedTemplate}`);
  if (initialCard) {
    const info = initialCard.querySelector('.template-info');
    if (info) {
      const lastChild = info.lastElementChild;
      if (lastChild && (lastChild.tagName === 'SPAN' || lastChild.tagName === 'I')) lastChild.remove();
      info.insertAdjacentHTML('beforeend', getPaletteHTML(selectedTemplate));
    }
  }

  // Back button
  document.getElementById('export-back')?.addEventListener('click', () => {
    window.history.back();
  });

  // Template selection and inline palette click
  const grid = document.getElementById('template-grid');
  grid?.addEventListener('click', (e) => {
    // Handle inline color dot click
    const dot = e.target.closest('.theme-accent-color');
    if (dot) {
      colorIndex = parseInt(dot.dataset.index, 10);
      applyColorsToHTML();
      const card = e.target.closest('.template-card');
      const info = card.querySelector('.template-info');
      const paletteContainer = info.querySelector('.card-palette');
      if (paletteContainer) {
        paletteContainer.outerHTML = getPaletteHTML(card.dataset.template);
      }
      return; // stop execution so template isn't re-selected
    }

    const card = e.target.closest('.template-card');
    if (!card) return;

    selectedTemplate = card.dataset.template;
    colorIndex = 0; // reset color

    // Update selection UI
    grid.querySelectorAll('.template-card').forEach(c => {
      c.classList.remove('selected');
      const palette = c.querySelector('.card-palette');
      if (palette) palette.remove();

      const info = c.querySelector('.template-info');
      const existingIcon = info?.querySelector('.ti-download');
      if (!existingIcon && info) {
        const iconSpan = document.createElement('i');
        iconSpan.className = 'ti ti-download';
        iconSpan.style.fontSize = '14px';
        iconSpan.style.color = 'var(--text-tertiary)';
        iconSpan.setAttribute('aria-hidden', 'true');
        const lastChild = info.lastElementChild;
        if (lastChild && !lastChild.classList.contains('template-info-name') && !lastChild.querySelector('.template-info-name')) {
          lastChild.remove();
        }
        info.appendChild(iconSpan);
      }
    });

    card.classList.add('selected');
    const info = card.querySelector('.template-info');
    if (info) {
      const lastChild = info.lastElementChild;
      if (lastChild && lastChild.tagName === 'I') lastChild.remove();

      // Inject the color palette directly into the selected card's info area
      info.insertAdjacentHTML('beforeend', getPaletteHTML(selectedTemplate));
    }
  });

  // Preview button
  document.getElementById('preview-btn')?.addEventListener('click', () => {
    const canvas = generateCanvas(poem, author, selectedTemplate, colorIndex);

    const modal = document.createElement('div');
    modal.className = 'preview-modal';
    Object.assign(modal.style, {
      position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: '9999',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '24px'
    });

    const img = document.createElement('img');
    img.src = canvas.toDataURL();
    Object.assign(img.style, {
      maxHeight: '80vh', maxWidth: '100%', objectFit: 'contain',
      borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-ghost';
    closeBtn.textContent = 'Close Preview';
    Object.assign(closeBtn.style, {
      marginTop: '24px', color: '#fff', borderColor: 'rgba(255,255,255,0.3)'
    });
    closeBtn.onclick = () => document.body.removeChild(modal);

    modal.appendChild(img);
    modal.appendChild(closeBtn);

    modal.onclick = (e) => {
      if (e.target === modal) document.body.removeChild(modal);
    };

    document.body.appendChild(modal);
  });

  // Download button
  document.getElementById('download-btn')?.addEventListener('click', () => {
    const canvas = generateCanvas(poem, author, selectedTemplate, colorIndex);
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `verse-${poem.id}-${selectedTemplate}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Downloaded as ${selectedTemplate} poster!`);
    }, 'image/png');
  });
}

function generateCanvas(poem, author, template, cIndex) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const c = templateColors[template][cIndex];

  const cfg = {
    w: 1080,
    h: template === 'story' ? 1920 : 1350,
    bg: c.bg,
    textColor: c.text,
    accent: c.accent
  };

  canvas.width = cfg.w;
  canvas.height = cfg.h;

  // Background
  ctx.fillStyle = cfg.bg;
  ctx.fillRect(0, 0, cfg.w, cfg.h);

  // Decorative elements
  if (template === 'love') {
    ctx.fillStyle = c.accent;
    ctx.globalAlpha = 0.15;
    ctx.font = '200px serif';
    ctx.fillText('❧', cfg.w - 260, 220);
    ctx.globalAlpha = 1.0;
  }

  const padding = 100;
  let y = template === 'story' ? 400 : 200;

  const x = template === 'story' ? cfg.w / 2 : padding;

  // Helper to wrap text
  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line.trim(), x, currentY);
    return currentY;
  }

  // ---- Site View template: same layout as minimal/dark but with exact site theme colors ----
  if (template === 'siteview') {
    ctx.fillStyle = cfg.accent;
    ctx.fillRect(padding - 20, y - 10, 4, 0); // placeholder, sized after text
    const borderStartY = y - 10;

    // Title
    ctx.textAlign = 'left';
    ctx.fillStyle = cfg.textColor;
    ctx.font = 'bold 42px Playfair Display, serif';
    const maxTitleWidth = cfg.w - (padding * 2);
    y = wrapText(ctx, poem.title, padding, y, maxTitleWidth, 64);
    y += 100;

    // Poem text with accent left border
    ctx.fillStyle = cfg.textColor;
    ctx.font = 'italic 20px Playfair Display, serif';
    ctx.lineHeight = 1.8;

    const poemBorderStartY = y - 50;
    const lines = poem.fullText.split('\n');
    lines.forEach(line => {
      if (line.trim() === '') {
        y += 30;
      } else {
        ctx.fillText(line, padding + 30, y);
        y += 50;
      }
    });

    // Draw the 3px accent border (matching .poem-body border-left: 3px)
    ctx.fillStyle = cfg.accent;
    ctx.fillRect(padding - 20, poemBorderStartY, 5, y - poemBorderStartY - 20);

    // Author
    y += 40;
    ctx.fillStyle = cfg.textColor;
    ctx.globalAlpha = 0.6;
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText(`— ${author.name}`, padding, y);
    ctx.globalAlpha = 1.0;

    return canvas;
  }

  // ---- Title ----
  ctx.textAlign = template === 'story' ? 'center' : 'left';
  const maxTitleWidth = cfg.w - (padding * 2);
  if (template === 'love') {
    ctx.fillStyle = cfg.accent;
    ctx.font = 'bold 72px Playfair Display, serif';
    y = wrapText(ctx, poem.title.toUpperCase(), padding, y, maxTitleWidth, 80);
    y += 80;
  } else {
    ctx.fillStyle = cfg.textColor;
    ctx.font = template === 'story' ? 'italic 46px Playfair Display, serif' : 'bold 52px Playfair Display, serif';
    const lineHeight = template === 'story' ? 50 : 64;
    y = wrapText(ctx, poem.title, x, y, maxTitleWidth, lineHeight);
    y += template === 'story' ? 80 : 100;
  }

  // Poem text
  ctx.fillStyle = cfg.textColor;
  ctx.font = `italic ${template === 'story' ? '32' : '30'}px Playfair Display, serif`;
  ctx.textAlign = template === 'story' ? 'center' : 'left';

  // Left border for minimal and dark
  if (template === 'minimal' || template === 'dark') {
    ctx.fillStyle = cfg.accent;
    ctx.fillRect(padding - 20, y - 10, 4, 0); // Will be sized after text
    const borderStartY = y - 10;

    ctx.fillStyle = cfg.textColor;
    const lines = poem.fullText.split('\n');

    lines.forEach(line => {
      if (line.trim() === '') {
        y += 30;
      } else {
        ctx.fillText(line, padding + 10, y);
        y += 50;
      }
    });

    // Draw the border line
    ctx.fillStyle = cfg.accent;
    ctx.fillRect(padding - 20, borderStartY, 4, y - borderStartY - 20);
  } else {
    const lines = poem.fullText.split('\n');

    lines.forEach(line => {
      if (line.trim() === '') {
        y += 30;
      } else {
        ctx.fillText(line, x, y);
        y += 50;
      }
    });
  }

  // Author
  y += 40;
  ctx.fillStyle = cfg.textColor;
  ctx.globalAlpha = 0.6;
  ctx.font = '24px Inter, sans-serif';
  ctx.fillText(`— ${author.name}`, x, y);
  ctx.globalAlpha = 1.0;

  // Watermark for story
  if (template === 'story') {
    ctx.fillStyle = cfg.textColor;
    ctx.globalAlpha = 0.6;
    ctx.font = '22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('verse.app', cfg.w / 2, cfg.h - 100);
    ctx.globalAlpha = 1.0;
  }

  return canvas;
}
