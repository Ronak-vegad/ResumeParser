/* ══════════════════════════════════════════════════════
   RESUME PARSER PRO — Main Application Script
══════════════════════════════════════════════════════ */

'use strict';

// ── State ──────────────────────────────────────────────
let selectedFile = null;
// Per-category chip state: { categoryKey: Set of lowercased values }
const catSkills = {};
const SKILL_CATS = [
  'languages', 'developerTools', 'frameworks',
  'databases', 'softSkills', 'coursework', 'areasOfInterest'
];
SKILL_CATS.forEach(c => { catSkills[c] = new Set(); });

// ── DOM refs (cached on DOMContentLoaded) ─────────────
const $ = id => document.getElementById(id);

// Pages
const pageUpload  = $('page-upload');
const pageParsed  = $('page-parsed');
const pageSuccess = $('page-success');

// Page 1
const dropZone       = $('dropZone');
const fileInput      = $('fileInput');
const browseBtn      = $('browseBtn');
const fileCard       = $('fileCard');
const fileName       = $('fileName');
const fileSize       = $('fileSize');
const removeFileBtn  = $('removeFileBtn');
const analyzeBtn     = $('analyzeBtn');
const analyzeBtnTxt  = $('analyzeBtnText');
const analyzeSpinner = $('analyzeSpinner');
const statusText     = $('statusText');

// Page 2
const parseAnotherBtn  = $('parseAnotherBtn');
const confirmBtnTop    = $('confirmBtnTop');
const confirmBtnBottom = $('confirmBtnBottom');
const parseBadge       = $('parseBadge');
const parseBadgeText   = $('parseBadgeText');
const parsedFileName   = $('parsedFileName');
const expContainer     = $('expContainer');
const addExpBtn        = $('addExpBtn');
const projectContainer = $('projectContainer');
const addProjectBtn    = $('addProjectBtn');

// Page 3
const restartBtn = $('restartBtn');

// ── Navigation ─────────────────────────────────────────
function showPage(page) {
  [pageUpload, pageParsed, pageSuccess].forEach(p => p.classList.remove('active'));
  page.classList.add('active');
  window.scrollTo(0, 0);
}

// ── Page 1: File Selection & Drag/Drop ─────────────────
browseBtn.addEventListener('click', e => {
  e.stopPropagation();
  fileInput.click();
});

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
});

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) handleFileSelect(fileInput.files[0]);
});

// Drag events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev =>
  dropZone.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); })
);

dropZone.addEventListener('dragover', () => dropZone.classList.add('drag-over'));
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  dropZone.classList.remove('drag-over');
  const files = e.dataTransfer.files;
  if (files.length > 0) handleFileSelect(files[0]);
});

removeFileBtn.addEventListener('click', e => {
  e.stopPropagation();
  clearFile();
});

function handleFileSelect(file) {
  // Validate type
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    setStatus('Only PDF files are supported. Please select a .pdf file.', 'error');
    return;
  }
  // Validate size (10 MB)
  if (file.size > 10 * 1024 * 1024) {
    setStatus('File is too large. Maximum size is 10 MB.', 'error');
    return;
  }

  selectedFile = file;

  // Show file card
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  fileCard.classList.remove('hidden');

  // Enable button
  analyzeBtn.disabled = false;
  setStatus('Ready to analyze', 'ready');
}

function clearFile() {
  selectedFile = null;
  fileInput.value = '';
  fileCard.classList.add('hidden');
  analyzeBtn.disabled = true;
  setStatus('Upload a PDF resume to begin', '');
}

function setStatus(msg, type) {
  statusText.textContent = msg;
  statusText.className = 'status-text';
  if (type) statusText.classList.add(type);
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ── Page 1: Analyze ────────────────────────────────────
analyzeBtn.addEventListener('click', analyzeResume);

async function analyzeResume() {
  if (!selectedFile) return;

  // UI: loading state
  analyzeBtn.disabled = true;
  analyzeBtnTxt.textContent = 'Parsing…';
  analyzeSpinner.classList.remove('hidden');
  setStatus('Reading your resume… this may take a moment.', 'processing');

  const formData = new FormData();
  formData.append('file', selectedFile);

  let parsedData = null;
  let parseSuccess = true;

  try {
    const res = await fetch('http://localhost:8000/parse-resume', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Server error (${res.status})`);
    }

    parsedData = await res.json();

  } catch (err) {
    parseSuccess = false;
    setStatus(`Error: ${err.message}`, 'error');
    parsedData = null;
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtnTxt.textContent = 'Analyze Resume';
    analyzeSpinner.classList.add('hidden');
  }

  // Always navigate to page 2 (success or failure state)
  showParsedPage(parsedData, parseSuccess);
}

// ── Page 2: Populate & render ──────────────────────────
function showParsedPage(data, success) {
  // Update badge
  if (success && data) {
    parseBadge.className = 'parse-badge badge-success';
    parseBadgeIcon(parseBadge, 'check');
    parseBadgeText.textContent = 'Parsed successfully';
  } else {
    parseBadge.className = 'parse-badge badge-warning';
    parseBadgeIcon(parseBadge, 'warn');
    parseBadgeText.textContent = 'Parsing failed — fill in manually';
  }

  parsedFileName.textContent = selectedFile ? selectedFile.name : '';

  // Populate fields
  populateParsedForm(data || {});

  showPage(pageParsed);
}

function parseBadgeIcon(badge, type) {
  const existing = badge.querySelector('svg');
  if (existing) existing.remove();
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '14'); svg.setAttribute('height', '14');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2.5');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  if (type === 'check') {
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    poly.setAttribute('points', '20 6 9 17 4 12');
    svg.appendChild(poly);
  } else {
    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1','12'); line1.setAttribute('y1','9');
    line1.setAttribute('x2','12'); line1.setAttribute('y2','13');
    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1','12'); line2.setAttribute('y1','17');
    line2.setAttribute('x2','12.01'); line2.setAttribute('y2','17');
    svg.appendChild(line1); svg.appendChild(line2);
  }
  badge.insertBefore(svg, badge.firstChild);
}

function v(val) { return val || ''; }

function populateParsedForm(d) {
  // Personal Info
  $('f-name').value     = v(d.full_name);
  $('f-location').value = v(d.location);

  // Job title — try top-level title, else first work experience
  let title = v(d.title);
  if (!title && d.work_experience && d.work_experience.length > 0) {
    title = d.work_experience[0].job_title || '';
  }
  $('f-title').value = title;

  // Contact
  $('f-email').value    = v(d.email);
  $('f-phone').value    = v(d.phone_number || d.phone);
  $('f-linkedin').value = v(d.linkedin);

  // Skills — categorized
  // Map from backend snake_case / camelCase keys
  const ts = d.technical_skills || {};
  const skillMap = {
    languages:       toArr(d.languages_programming || ts.languages       || d.languages),
    developerTools:  toArr(ts.developer_tools                            || d.developerTools),
    frameworks:      toArr(ts.frameworks                                 || d.frameworks),
    databases:       toArr(ts.databases                                  || d.databases),
    softSkills:      toArr(ts.soft_skills                                || d.softSkills),
    coursework:      toArr(ts.coursework                                 || d.coursework),
    areasOfInterest: toArr(ts.areas_of_interest                         || d.areasOfInterest),
  };
  // If only a flat skills[] came back, put it all under languages as fallback
  if (Array.isArray(d.skills) && d.skills.length && Object.values(skillMap).every(a => a.length === 0)) {
    skillMap.languages = d.skills;
  }
  SKILL_CATS.forEach(cat => {
    catSkills[cat].clear();
    const wrap = $(`cat-chips-${cat}`);
    if (wrap) { wrap.innerHTML = ''; }
    skillMap[cat].forEach(s => addCatChip(cat, s));
  });


  // Summary
  $('f-summary').value = v(d.professional_summary || d.summary);
  autoResizeTextarea($('f-summary'));

  // Work experience
  expContainer.innerHTML = '';
  if (Array.isArray(d.work_experience) && d.work_experience.length > 0) {
    d.work_experience.forEach(exp => addExpCard({
      role:        exp.job_title || exp.role || '',
      company:     exp.company || exp.company_name || '',
      period:      (exp.start_date && exp.end_date)
                     ? `${exp.start_date} – ${exp.end_date}`
                     : (exp.period || exp.duration || ''),
      description: Array.isArray(exp.responsibilities)
                     ? exp.responsibilities.join('\n')
                     : (exp.responsibilities || exp.description || '')
    }));
  }

  // Education
  let edu = {};
  if (Array.isArray(d.education) && d.education.length > 0) {
    edu = d.education[0];
  }
  $('f-degree').value      = v(edu.degree);
  $('f-institution').value = v(edu.institution || edu.university);
  $('f-year').value        = v(edu.year || edu.graduation_year);

  // Additional Info
  const langs = d.languages;
  $('f-languages').value = Array.isArray(langs) ? langs.join(', ') : v(langs);
  $('f-github').value    = v(d.github || d.portfolio);

  const certs = d.certifications;
  $('f-certs').value = Array.isArray(certs) ? certs.join('\n') : v(certs);
  autoResizeTextarea($('f-certs'));

  // Projects
  projectContainer.innerHTML = '';
  if (Array.isArray(d.projects) && d.projects.length > 0) {
    d.projects.forEach(p => addProjectCard({
      name:        p.name        || p.title       || '',
      techStack:   p.techStack   || p.technologies || '',
      description: p.description || '',
      githubLink:  p.githubLink  || p.github_link  || '',
      liveLink:    p.liveLink    || p.live_link    || '',
    }));
  } else {
    addProjectCard({});
  }
}

// ── Categorized Skills Chip Input ─────────────────────────
document.querySelectorAll('.cat-chip-input').forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cat = input.dataset.cat;
      const val = input.value.trim();
      if (val) { addCatChip(cat, val); input.value = ''; }
    }
  });
});

function addCatChip(cat, text) {
  if (!text) return;
  const key = text.toLowerCase();
  if (catSkills[cat] && catSkills[cat].has(key)) return; // no duplicates within category
  if (catSkills[cat]) catSkills[cat].add(key);

  const wrap = $(`cat-chips-${cat}`);
  if (!wrap) return;

  const chip = document.createElement('div');
  chip.className = 'chip';

  const label = document.createElement('span');
  label.textContent = text;

  const btn = document.createElement('button');
  btn.className = 'chip-remove';
  btn.setAttribute('aria-label', 'Remove ' + text);
  btn.innerHTML = '×';
  btn.addEventListener('click', () => {
    if (catSkills[cat]) catSkills[cat].delete(key);
    chip.remove();
  });

  chip.appendChild(label);
  chip.appendChild(btn);
  wrap.appendChild(chip);
}

// Helper: normalize any value to a string array
function toArr(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

// ── Work Experience Cards ──────────────────────────────
addExpBtn.addEventListener('click', () => addExpCard({}));

function addExpCard({ role = '', company = '', period = '', description = '' } = {}) {
  const card = document.createElement('div');
  card.className = 'exp-card';

  card.innerHTML = `
    <div class="exp-header">
      <input class="exp-role field-input" value="${escHtml(role)}" placeholder="Job Title" />
      <span class="exp-period-pill" contenteditable="true"
        data-placeholder="Period">${escHtml(period)}</span>
    </div>
    <input class="exp-company field-input" value="${escHtml(company)}" placeholder="Company name" />
    <textarea class="exp-desc field-textarea" placeholder="Responsibilities / description…">${escHtml(description)}</textarea>
    <button class="exp-remove-btn">Remove</button>
  `;

  card.querySelector('.exp-remove-btn').addEventListener('click', () => card.remove());

  const pill = card.querySelector('.exp-period-pill');
  pill.addEventListener('focus', () => { if (!pill.textContent.trim()) pill.textContent = ''; });
  pill.addEventListener('blur',  () => { if (!pill.textContent.trim()) pill.textContent = ''; });

  const ta = card.querySelector('.exp-desc');
  ta.addEventListener('input', () => autoResizeTextarea(ta));
  autoResizeTextarea(ta);

  expContainer.appendChild(card);
}

// ── Project Cards ──────────────────────────────────────
addProjectBtn.addEventListener('click', () => addProjectCard({}));

function addProjectCard({ name = '', techStack = '', description = '', githubLink = '', liveLink = '' } = {}) {
  const card = document.createElement('div');
  card.className = 'proj-card';

  card.innerHTML = `
    <div class="proj-row-2col">
      <input class="field-input" value="${escHtml(name)}" placeholder="Project title" />
      <input class="field-input" value="${escHtml(techStack)}" placeholder="React, FastAPI, PostgreSQL…" />
    </div>
    <textarea class="field-textarea" style="min-height:80px" placeholder="What did you build and what problem did it solve?">${escHtml(description)}</textarea>
    <div class="proj-row-2col">
      <input class="field-input" value="${escHtml(githubLink)}" placeholder="github.com/…" />
      <input class="field-input" value="${escHtml(liveLink)}" placeholder="Live demo URL (optional)" />
    </div>
    <button class="proj-remove-btn">Remove</button>
  `;

  card.querySelector('.proj-remove-btn').addEventListener('click', () => card.remove());

  const ta = card.querySelector('textarea');
  ta.addEventListener('input', () => autoResizeTextarea(ta));
  autoResizeTextarea(ta);

  projectContainer.appendChild(card);
}

// ── Textarea auto-resize ───────────────────────────────
function autoResizeTextarea(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

// Hook all static textareas
document.querySelectorAll('textarea').forEach(ta => {
  ta.addEventListener('input', () => autoResizeTextarea(ta));
});

// ── Page 2: Navigation ─────────────────────────────────
parseAnotherBtn.addEventListener('click', resetAll);
confirmBtnTop.addEventListener('click', handleConfirm);
confirmBtnBottom.addEventListener('click', handleConfirm);

function handleConfirm() {
  showPage(pageSuccess);
}

// ── Page 3: Restart ────────────────────────────────────
restartBtn.addEventListener('click', resetAll);

function resetAll() {
  clearFile();
  // Clear text fields
  ['f-name','f-title','f-location','f-email','f-phone','f-linkedin',
   'f-summary','f-degree','f-institution','f-year','f-languages','f-github','f-certs']
    .forEach(id => { if ($(id)) $(id).value = ''; });
  // Clear categorized skills
  SKILL_CATS.forEach(cat => {
    catSkills[cat].clear();
    const wrap = $(`cat-chips-${cat}`);
    if (wrap) wrap.innerHTML = '';
  });
  // Clear dynamic sections
  expContainer.innerHTML = '';
  projectContainer.innerHTML = '';
  setStatus('Upload a PDF resume to begin', '');
  showPage(pageUpload);
}

// ── Utility ────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
