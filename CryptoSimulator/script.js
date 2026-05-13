'use strict';
/* ══════════════════════════════════════════════════════════
   CRYPTOLAB — VANILLA JAVASCRIPT APPLICATION
   No React · No Node.js · No npm · Open index.html directly
   ══════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════════
   SECTION 1 — CONSTANTS & CONFIGURATION
   ══════════════════════════════════════════════════════════ */

const MODULES = [
  { id: 'home',    label: 'Command Center', icon: '⌂' },
  { id: 'conf',    label: 'Confidentiality',icon: '🔒' },
  { id: 'sym',     label: 'Symmetric',      icon: '⚿' },
  { id: 'asym',    label: 'Asymmetric',     icon: '⚷' },
  { id: 'attacks', label: 'Attack Lab',     icon: '⚡' },
  { id: 'sigs',    label: 'Signatures',     icon: '✍' },
  { id: 'quiz',    label: 'Challenge',      icon: '★' },
];

const BADGES = [
  { id: 'first_enc',    label: 'First Encrypt',    emoji: '🔐', desc: 'Encrypted your first message' },
  { id: 'secure_ch',    label: 'Secure Channel',   emoji: '🛡',  desc: 'Enabled encryption protection' },
  { id: 'key_master',   label: 'Key Master',       emoji: '🗝',  desc: 'Completed RSA key exchange' },
  { id: 'ethical_hack', label: 'Ethical Hacker',   emoji: '⚡', desc: 'Ran a brute-force simulation' },
  { id: 'signed',       label: 'Signed & Verified',emoji: '✍',  desc: 'Created a digital signature' },
  { id: 'quiz_ace',     label: 'Quiz Ace',         emoji: '🏆', desc: 'Scored 70%+ on the challenge' },
];

const QUIZ = [
  { q: 'What does AES stand for?', opts: ['Advanced Encryption Standard','Applied Encryption System','Automated Exchange Standard','Advanced Exchange Software'], a: 0, pts: 20 },
  { q: 'Which encryption uses the SAME key to encrypt and decrypt?', opts: ['Asymmetric','Public-key','Symmetric','Hashing'], a: 2, pts: 20 },
  { q: 'In RSA, the PUBLIC key is used to:', opts: ['Decrypt data only','Encrypt data','Sign messages','Generate primes'], a: 1, pts: 25 },
  { q: 'A brute-force attack works by:', opts: ['Exploiting software bugs','Guessing every possible combination','Intercepting traffic','Forging certificates'], a: 1, pts: 20 },
  { q: 'Diffie-Hellman is primarily used for:', opts: ['Encryption','Hashing data','Secure key exchange','Authentication only'], a: 2, pts: 20 },
  { q: 'AES-256 uses a key length of:', opts: ['64 bits','128 bits','192 bits','256 bits'], a: 3, pts: 15 },
];

const ALGOS = [
  { id:'caesar', n:'Caesar',   k:'Shift 1–25', str:5,  spd:100, blk:false, desc:'The oldest cipher — shifts each letter by a fixed amount. Only 25 possible keys. Trivially broken in seconds.' },
  { id:'des',    n:'DES',      k:'56-bit',     str:20, spd:88,  blk:true,  desc:'Data Encryption Standard (1977). 56-bit key exhausted by brute force in 1999. Officially deprecated — never use today.' },
  { id:'3des',   n:'3DES',     k:'112/168-bit',str:55, spd:50,  blk:true,  desc:'Applies DES three times. Still used in legacy banking. 3× slower than AES, being phased out.' },
  { id:'seal',   n:'SEAL',     k:'160-bit',    str:60, spd:97,  blk:false, desc:'Software-Efficient Algorithm. A stream cipher optimised for fast software encryption. Proprietary — replaced by AES.' },
  { id:'rc4',    n:'RC4',      k:'40–2048-bit',str:30, spd:96,  blk:false, desc:'RC stream cipher. Widely used in WEP and early TLS. Multiple design weaknesses found — deprecated since 2015.' },
  { id:'aes128', n:'AES-128',  k:'128-bit',    str:92, spd:96,  blk:true,  desc:'Advanced Encryption Standard. 10 rounds of SubBytes→ShiftRows→MixColumns→AddRoundKey. Military-grade.' },
  { id:'aes256', n:'AES-256',  k:'256-bit',    str:100,spd:93,  blk:true,  desc:'14 rounds. Used by NSA for TOP SECRET. Brute-force time exceeds the age of the universe — quantum-resistant.' },
];

const RSA = { p:7, q:11, n:77, phi:60, e:13, d:37 };


/* ══════════════════════════════════════════════════════════
   SECTION 2 — CRYPTO HELPERS
   ══════════════════════════════════════════════════════════ */

function caesarEnc(t, s) {
  return t.toUpperCase().split('').map(c =>
    c >= 'A' && c <= 'Z' ? String.fromCharCode(((c.charCodeAt(0)-65+s)%26)+65) : c
  ).join('');
}
function caesarDec(t, s) { return caesarEnc(t, 26 - (s % 26)); }

function modPow(base, exp, mod) {
  let r = 1n, b = BigInt(base) % BigInt(mod), e = BigInt(exp), m = BigInt(mod);
  while (e > 0n) { if (e % 2n === 1n) r = (r * b) % m; e /= 2n; b = (b * b) % m; }
  return Number(r);
}

function simpleHash(s) {
  let h = 5381n;
  for (let i = 0; i < s.length; i++) h = (h * 33n + BigInt(s.charCodeAt(i))) & 0xFFFFFFFFn;
  return h.toString(16).toUpperCase().padStart(8, '0');
}

const CS = 'abcdefghijklmnopqrstuvwxyz';
function i2s(idx, len) { let s = ''; for (let i = 0; i < len; i++) { s = CS[idx%26] + s; idx = Math.floor(idx/26); } return s; }
function s2i(s) { return s.split('').reduce((a,c) => a*26 + (c.charCodeAt(0)-97), 0); }


/* ══════════════════════════════════════════════════════════
   SECTION 3 — APPLICATION STATE
   ══════════════════════════════════════════════════════════ */

const APP = {
  pts: 0,
  badges: [],
  currentMod: 'home',
};

function getLevel() { return Math.floor(APP.pts / 100) + 1; }
function getXP()    { return APP.pts % 100; }


/* ══════════════════════════════════════════════════════════
   SECTION 4 — UI UTILITIES
   ══════════════════════════════════════════════════════════ */

let toastTimer = null;
function showToast(msg, color) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.borderColor = color;
  el.style.color = color;
  el.style.boxShadow = `0 6px 28px ${color}30`;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

function award(pts, badgeId) {
  if (pts > 0) {
    APP.pts += pts;
    updateHeader();
    showToast(`+${pts} XP`, '#10B981');
  }
  if (badgeId && !APP.badges.includes(badgeId)) {
    APP.badges.push(badgeId);
    const b = BADGES.find(x => x.id === badgeId);
    if (b) setTimeout(() => showToast(`🏅 ${b.label}`, '#818CF8'), pts > 0 ? 420 : 0);
  }
}

function updateHeader() {
  const xpEl = document.getElementById('headerXP');
  const lvEl = document.getElementById('headerLevel');
  if (xpEl) xpEl.textContent = APP.pts;
  if (lvEl) lvEl.textContent = `Lv. ${getLevel()}`;
}

function renderNav() {
  const nav = document.getElementById('navTabs');
  nav.innerHTML = MODULES.map(m =>
    `<button class="nav-tab${APP.currentMod === m.id ? ' active' : ''}"
      data-mod="${m.id}" aria-current="${APP.currentMod === m.id ? 'page' : 'false'}">
      ${m.icon} ${m.label}
    </button>`
  ).join('');
  nav.querySelectorAll('.nav-tab').forEach(btn =>
    btn.addEventListener('click', () => navigate(btn.dataset.mod))
  );
}

function strBar(pct, color) {
  return `<div class="bar-wrap"><div class="bar-fill" style="width:${pct}%;background:${color};"></div></div>`;
}

function chip(label, cls) {
  return `<span class="algo-chip ${cls}">${label.toUpperCase()}</span>`;
}

function termHTML(title, bodyHTML, heightCls = '') {
  return `
    <div class="term">
      <div class="term-header">
        <div class="term-dot" style="background:#EF4444;"></div>
        <div class="term-dot" style="background:#FBBF24;"></div>
        <div class="term-dot" style="background:#10B981;"></div>
        <span class="term-title">${title}</span>
      </div>
      <div class="term-body ${heightCls}" id="termBody_${title.replace(/\W/g,'_')}">
        ${bodyHTML}
        <span class="term-cursor">█</span>
      </div>
    </div>`;
}


/* ══════════════════════════════════════════════════════════
   SECTION 5 — MODULE: HOME
   ══════════════════════════════════════════════════════════ */

const homeModule = (() => {
  const modCards = [
    { id:'conf',    icon:'🔒', color:'var(--cyan)',   title:'Confidentiality',   desc:'Watch live packets traverse a network — intercept them with and without encryption active.' },
    { id:'sym',     icon:'⚿', color:'var(--green)',  title:'Symmetric Encrypt',  desc:'Explore AES, DES, Caesar cipher. Compare key sizes, rounds, and speed side by side.' },
    { id:'asym',    icon:'⚷', color:'var(--purple)', title:'Asymmetric / RSA',   desc:'Step through public/private key generation, Alice–Bob encryption, and real RSA math.' },
    { id:'attacks', icon:'⚡', color:'var(--red)',    title:'Attack Lab',         desc:'Simulate brute-force and man-in-the-middle attacks. See exactly why strong keys matter.' },
    { id:'sigs',    icon:'✍', color:'var(--gold)',   title:'Digital Signatures', desc:'Hash a message, sign with a private key, verify with a public key — then test tampering.' },
    { id:'quiz',    icon:'★', color:'var(--orange)', title:'Knowledge Challenge', desc:'Six questions across all modules. Earn XP and the Quiz Ace badge at 70%+.' },
  ];

  function getHTML() {
    const earnedBadges = BADGES.filter(b => APP.badges.includes(b.id));
    const badgesHTML = earnedBadges.length ? `
      <div class="card no-mb">
        <div class="label">Earned Badges</div>
        <div class="badge-list">
          ${earnedBadges.map(b => `
            <div class="badge-item" title="${b.desc}">
              <div class="badge-emoji">${b.emoji}</div>
              <div><div class="badge-label">${b.label}</div><div class="badge-desc">${b.desc}</div></div>
            </div>`).join('')}
        </div>
      </div>` : '';

    return `
      <div class="module-enter">
        <!-- Hero -->
        <div class="card accent hero-card">
          <div class="hero-eyebrow">PER SCHOLAS · COHORT 2026-BOS-02 · INTERACTIVE LEARNING LAB</div>
          <h1 class="hero-title">Cryptography Simulator</h1>
          <p class="hero-sub">Master encryption through live animations, real attack simulations, and hands-on labs — built for CompTIA Security+ learners.</p>
          <div class="hero-stats">
            <div class="hero-stat"><div class="hero-stat-val text-cyan">${APP.pts}</div><div class="hero-stat-lbl">Total XP</div></div>
            <div class="hero-stat"><div class="hero-stat-val" style="color:var(--green);">${getLevel()}</div><div class="hero-stat-lbl">Level</div></div>
            <div class="hero-stat"><div class="hero-stat-val" style="color:var(--gold);">${APP.badges.length}/${BADGES.length}</div><div class="hero-stat-lbl">Badges</div></div>
          </div>
          <div class="xp-bar-wrap">
            <div class="xp-bar-labels"><span>Level ${getLevel()} progress</span><span>${getXP()}/100 XP</span></div>
            <div class="xp-bar"><div class="xp-bar-fill" style="width:${getXP()}%;"></div></div>
          </div>
        </div>

        <!-- Module grid -->
        <div class="grid-auto" style="margin-bottom:16px;">
          ${modCards.map(m => `
            <div class="card mod-card" data-go="${m.id}" style="border-color:${m.color}22;" tabindex="0" role="button" aria-label="Open ${m.title}">
              <div class="mod-icon">${m.icon}</div>
              <div class="mod-title" style="color:${m.color};">${m.title}</div>
              <div class="mod-desc">${m.desc}</div>
              <div class="mod-cta" style="color:${m.color};">Enter →</div>
            </div>`).join('')}
        </div>

        ${badgesHTML}

        <!-- Design system reference -->
        <div class="card" style="margin-top:16px;">
          <div class="label c-purple">Design System Reference</div>
          <div class="ds-grid">
            <div>
              <div style="font-size:12px;color:var(--muted);margin-bottom:10px;">Colour Palette</div>
              ${[['Background','#0D0B1F','var(--cyan)'],['Surface 1','#131128','var(--cyan)'],['Primary (Indigo)','#818CF8','var(--cyan)'],['Success (Emerald)','#10B981','var(--green)'],['Warning (Orange)','#F97316','var(--orange)'],['Danger (Red)','#EF4444','var(--red)'],['Deep Violet','#7C3AED','var(--purple)']].map(([n,h,c]) => `
              <div class="ds-swatch-row">
                <div class="ds-swatch" style="background:${h};border:1px solid ${c}30;"></div>
                <span class="ds-swatch-name">${n}</span>
                <span class="ds-swatch-hex font-mono" style="color:${c};font-size:11px;">${h}</span>
              </div>`).join('')}
            </div>
            <div>
              <div style="font-size:12px;color:var(--muted);margin-bottom:10px;">Typography Scale</div>
              ${[['Hero H1','Outfit 700','42px'],['Section heads','Outfit 700','28px'],['Card titles','Outfit 700','14–16px'],['Body text','DM Sans 400','14–15px'],['Labels / nav','Outfit 600','11–13px + tracking'],['Terminal / mono','Fira Code 400','13px'],['Buttons','Outfit 600','12–13px uppercase']].map(([r,f,s]) => `
              <div class="ds-type-row">
                <span class="ds-type-name">${r} </span>
                <span class="ds-type-spec">· ${f} · ${s}</span>
              </div>`).join('')}
            </div>
          </div>
        </div>
      </div>`;
  }

  function init() {
    document.querySelectorAll('[data-go]').forEach(el =>
      el.addEventListener('click', () => navigate(el.dataset.go))
    );
    document.getElementById('logoBtn').addEventListener('click', () => navigate('home'));
  }

  return { getHTML, init, cleanup() {} };
})();


/* ══════════════════════════════════════════════════════════
   SECTION 6 — MODULE: CONFIDENTIALITY
   ══════════════════════════════════════════════════════════ */

const confModule = (() => {
  let rafId = null, launchTimer = null, lastTime = null;
  let pktX = 0, pktPhase = 'idle', pktPaused = false;
  let isEncrypted = false, earned = false;
  const LOG_MAX = 8;
  let logEntries = [];

  function addLog(t, m, c) {
    logEntries.push({ t, m, c });
    if (logEntries.length > LOG_MAX) logEntries.shift();
    renderLog();
  }

  function renderLog() {
    const el = document.getElementById('netLogBody');
    if (!el) return;
    el.innerHTML = logEntries.map(l =>
      `<div class="net-log-line" style="color:${l.c};"><span class="prefix">[${l.t}] </span>${l.m}</div>`
    ).join('') + '<span class="term-cursor">█</span>';
    el.scrollTop = el.scrollHeight;
  }

  function updatePacket() {
    const pktEl  = document.getElementById('svgPacket');
    const pktTxt = document.getElementById('pktLabel');
    const pktLck = document.getElementById('pktLock');
    const cable  = document.getElementById('netCable');
    const tapLine= document.getElementById('eveTapLine');
    const eveGrp = document.getElementById('eveGroup');
    const eveCirc= document.getElementById('eveCircle');
    const eveStatus= document.getElementById('eveStatus');
    const netStat= document.getElementById('netStatus');
    const bobCirc= document.getElementById('bobCircle');
    if (!pktEl) return;

    const aliceX = 70, bobX = 610, pathY = 106, eveX = 340, eveY = 52;
    const col = isEncrypted ? '#10B981' : (pktPhase === 'intercepted' ? '#EF4444' : '#F97316');

    if (pktPhase === 'idle') {
      pktEl.style.visibility = 'hidden'; return;
    }
    pktEl.style.visibility = 'visible';

    let svgX = aliceX + (pktX / 100) * (bobX - aliceX);
    let svgY = pathY;
    if (pktPhase === 'intercepted') { svgX = eveX; svgY = eveY; }

    pktEl.setAttribute('transform', `translate(${svgX},${svgY})`);
    pktEl.querySelector('rect').setAttribute('stroke', col);
    pktEl.querySelector('rect').setAttribute('fill', col.replace('#','rgba(') + (col === '#10B981' ? ',0.18)' : ',0.18)'));
    if (pktTxt) { pktTxt.setAttribute('fill', col); pktTxt.textContent = isEncrypted ? '♦♦♦♦♦' : 'HELLO'; }
    if (pktLck) pktLck.style.display = isEncrypted ? '' : 'none';

    if (cable) cable.setAttribute('stroke', isEncrypted ? 'rgba(16,185,129,0.4)' : 'rgba(249,115,22,0.4)');
    if (tapLine) tapLine.style.display = isEncrypted ? 'none' : '';
    if (eveGrp)  eveGrp.style.opacity  = isEncrypted ? '0.15' : '1';
    if (eveCirc) eveCirc.setAttribute('stroke', pktPhase === 'intercepted' ? '#EF4444' : 'rgba(239,68,68,0.5)');
    if (eveStatus) eveStatus.textContent = pktPhase === 'intercepted' ? '⚠ INTERCEPTED' : (isEncrypted ? 'BLOCKED' : '');
    if (bobCirc)   bobCirc.setAttribute('stroke', pktPhase === 'arrived' ? '#10B981' : 'var(--cyan)');
    if (netStat)   netStat.textContent  = isEncrypted ? '✓  End-to-end encrypted  —  Eve sees only random ciphertext' : '⚠  Unencrypted  —  Eve can intercept and read every packet';
  }

  function launchPkt() {
    if (pktPhase === 'idle') { pktX = 0; pktPhase = 'moving'; pktPaused = false; updatePacket(); }
  }

  function animate(ts) {
    if (!lastTime) lastTime = ts;
    const dt = ts - lastTime; lastTime = ts;
    if (pktPhase === 'moving' && !pktPaused) {
      pktX = Math.min(pktX + 16 * (dt / 1000), 100);
      if (!isEncrypted && pktX >= 50) {
        pktPhase = 'intercepted'; pktPaused = true;
        addLog('INTERCEPT', '⚠ Eve captured packet! Plaintext readable: "HELLO BOB"', '#EF4444');
        updatePacket();
        setTimeout(() => { pktX = 0; pktPhase = 'idle'; pktPaused = false; updatePacket(); }, 2000);
      } else if (pktX >= 100) {
        pktPhase = 'arrived'; pktPaused = true;
        if (isEncrypted) addLog('SUCCESS', '✓ Encrypted packet delivered safely. Eve saw only ciphertext.', '#10B981');
        updatePacket();
        setTimeout(() => { pktX = 0; pktPhase = 'idle'; pktPaused = false; updatePacket(); }, 600);
      } else { updatePacket(); }
    }
    rafId = requestAnimationFrame(animate);
  }

  function getHTML() {
    return `
      <div class="module-enter">
        <div class="sec-head">
          <h2><span class="icon">🔒</span> Confidentiality</h2>
          <p>Watch data travel across a live network. Toggle encryption to see the difference between plaintext exposure and ciphertext protection in real time.</p>
        </div>

        <!-- Network SVG -->
        <div class="card accent" style="padding:20px 20px 14px;">
          <div class="network-svg-wrap">
            <svg id="networkSVG" viewBox="0 0 680 194" style="width:100%;height:auto;display:block;">
              <defs>
                <pattern id="pGrid" width="44" height="44" patternUnits="userSpaceOnUse">
                  <path d="M 44 0 L 0 0 0 44" fill="none" stroke="rgba(129,140,248,0.04)" stroke-width="1"/>
                </pattern>
              </defs>
              <rect width="680" height="194" fill="url(#pGrid)"/>

              <!-- Network cable -->
              <line id="netCable" x1="70" y1="106" x2="610" y2="106" stroke="rgba(249,115,22,0.4)" stroke-width="2.5" stroke-dasharray="8,5"/>
              <!-- Eve tap line -->
              <line id="eveTapLine" x1="340" y1="102" x2="340" y2="56" stroke="rgba(239,68,68,0.45)" stroke-width="2" stroke-dasharray="5,3"/>

              <!-- Alice -->
              <circle cx="70" cy="106" r="30" fill="#1B1840" stroke="var(--cyan)" stroke-width="2"/>
              <text x="70" y="113" text-anchor="middle" font-size="22">👩‍💻</text>
              <text x="70" y="150" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Outfit">ALICE</text>
              <text x="70" y="164" text-anchor="middle" fill="var(--muted)" font-size="10" font-family="Outfit">SENDER</text>

              <!-- Bob -->
              <circle id="bobCircle" cx="610" cy="106" r="30" fill="#1B1840" stroke="var(--cyan)" stroke-width="2"/>
              <text x="610" y="113" text-anchor="middle" font-size="22">👨‍💻</text>
              <text x="610" y="150" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Outfit">BOB</text>
              <text x="610" y="164" text-anchor="middle" fill="var(--muted)" font-size="10" font-family="Outfit">RECEIVER</text>

              <!-- Eve group -->
              <g id="eveGroup" style="opacity:1;transition:opacity 0.55s;">
                <circle id="eveCircle" cx="340" cy="52" r="26" fill="#1B1840" stroke="rgba(239,68,68,0.5)" stroke-width="2"/>
                <text x="340" y="59" text-anchor="middle" font-size="20">🕵️</text>
                <text x="340" y="86" text-anchor="middle" fill="var(--red)" font-size="11" font-family="Outfit">EVE</text>
                <text id="eveStatus" x="340" y="24" text-anchor="middle" fill="var(--red)" font-size="10" font-family="Outfit" style="animation:scanPulse 0.6s infinite;"></text>
              </g>

              <!-- Packet (moved by JS) -->
              <g id="svgPacket" style="visibility:hidden;">
                <rect x="-24" y="-13" width="48" height="26" rx="6" fill="rgba(249,115,22,0.18)" stroke="var(--orange)" stroke-width="2"/>
                <text id="pktLabel" x="0" y="5" text-anchor="middle" fill="var(--orange)" font-size="10" font-family="Fira Code">HELLO</text>
                <text id="pktLock" x="0" y="-20" text-anchor="middle" font-size="12" style="display:none;">🔒</text>
              </g>

              <!-- Status text -->
              <text id="netStatus" x="340" y="190" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Outfit">⚠  Unencrypted  —  Eve can intercept and read every packet</text>
            </svg>
          </div>

          <div class="enc-controls">
            <button id="encToggleBtn" class="btn btn-red">🔓 Encryption: OFF</button>
            <span id="encHelper" class="enc-helper">Traffic travels in plaintext — interceptable by any network observer.</span>
          </div>
        </div>

        <!-- Network log -->
        <div class="card">
          <div class="label">Network Event Log</div>
          <div class="term">
            <div class="term-header">
              <div class="term-dot" style="background:#EF4444;"></div>
              <div class="term-dot" style="background:#FBBF24;"></div>
              <div class="term-dot" style="background:#10B981;"></div>
              <span class="term-title">network_monitor.sh</span>
            </div>
            <div class="term-body" id="netLogBody"></div>
          </div>
        </div>

        <!-- Explainer cards -->
        <div class="grid-2">
          <div class="card no-mb border-red" style="padding:20px;">
            <div style="font-size:22px;margin-bottom:9px;">⚠</div>
            <div style="font-family:var(--font-head);font-size:14px;font-weight:700;color:var(--red);margin-bottom:8px;">Without Encryption</div>
            <div style="font-size:13px;color:var(--muted);line-height:1.7;">Data travels as readable plaintext. Passwords, messages, and sensitive files are visible to anyone monitoring the network — including attackers like Eve.</div>
          </div>
          <div class="card no-mb border-green" style="padding:20px;">
            <div style="font-size:22px;margin-bottom:9px;">✓</div>
            <div style="font-family:var(--font-head);font-size:14px;font-weight:700;color:var(--green);margin-bottom:8px;">With Encryption</div>
            <div style="font-size:13px;color:var(--muted);line-height:1.7;">A key transforms plaintext into random-looking ciphertext. Even if Eve intercepts every packet, she cannot recover the original message without the decryption key.</div>
          </div>
        </div>
      </div>`;
  }

  function init() {
    pktX = 0; pktPhase = 'idle'; pktPaused = false;
    isEncrypted = false; lastTime = null;
    logEntries = [{ t: 'SYS', m: 'Network monitor online. Encryption: DISABLED', c: '#F97316' }];
    renderLog();

    launchPkt();
    launchTimer = setInterval(launchPkt, 2800);
    rafId = requestAnimationFrame(animate);

    document.getElementById('encToggleBtn').addEventListener('click', function() {
      isEncrypted = !isEncrypted;
      this.textContent = isEncrypted ? '🔒 Encryption: ON' : '🔓 Encryption: OFF';
      this.className = `btn ${isEncrypted ? 'btn-green' : 'btn-red'}`;
      const helper = document.getElementById('encHelper');
      if (helper) helper.textContent = isEncrypted
        ? 'All packets are AES-256 encrypted before transmission.'
        : 'Traffic travels in plaintext — interceptable by any network observer.';
      if (isEncrypted) {
        addLog('ENCRYPT', 'AES-256 channel secured — packets encrypted', '#10B981');
        if (!earned) { award(25, 'secure_ch'); earned = true; }
      } else {
        addLog('WARN', 'Encryption disabled — traffic exposed in plaintext', '#F97316');
      }
    });
  }

  function cleanup() {
    cancelAnimationFrame(rafId);
    clearInterval(launchTimer);
    rafId = null; launchTimer = null; lastTime = null;
  }

  return { getHTML, init, cleanup };
})();


/* ══════════════════════════════════════════════════════════
   SECTION 7 — MODULE: SYMMETRIC ENCRYPTION
   ══════════════════════════════════════════════════════════ */

const symModule = (() => {
  let currentAlgo = 'caesar';
  let txt = 'HELLO WORLD';
  let shift = 3;
  let earned = false;

  function getHTML() {
    const sel = ALGOS.find(a => a.id === currentAlgo);
    const ct = caesarEnc(txt, shift);
    const dt = caesarDec(ct, shift);
    const strCol = sel.str > 70 ? 'var(--green)' : sel.str > 40 ? 'var(--orange)' : 'var(--red)';
    const strClass = sel.str > 70 ? 'green' : sel.str > 40 ? 'orange' : 'red';

    return `
      <div class="module-enter">
        <div class="sec-head">
          <h2><span class="icon">⚿</span> Symmetric Encryption</h2>
          <p>The same key encrypts and decrypts. Fast, efficient, and ideal for bulk data — but both parties must securely share that one key.</p>
        </div>

        <!-- Algorithm tabs -->
        <div class="algo-tabs">
          ${ALGOS.map(a => `<button class="algo-tab${a.id === currentAlgo ? ' active' : ''}" data-algo="${a.id}">${a.n}</button>`).join('')}
        </div>

        <!-- Algorithm info -->
        <div class="card p-sm">
          <div class="algo-info">
            <div class="algo-desc-col">
              <div class="algo-name" id="algoName">${sel.n}</div>
              <div class="algo-chips" id="algoChips">
                ${chip(sel.blk ? 'Block Cipher' : 'Stream Cipher', sel.blk ? 'chip-cyan' : 'chip-purple')}
                ${chip(sel.k, strClass === 'green' ? 'chip-green' : strClass === 'orange' ? 'chip-orange' : 'chip-red')}
              </div>
              <div class="algo-desc" id="algoDesc">${sel.desc}</div>
            </div>
            <div class="algo-bars-col">
              <div class="algo-bar-row">
                <div class="algo-bar-label">Security Strength</div>
                ${strBar(sel.str, strCol)}
                <div class="algo-bar-pct" id="strPct">${sel.str}%</div>
              </div>
              <div class="algo-bar-row">
                <div class="algo-bar-label">Relative Speed</div>
                ${strBar(sel.spd, 'var(--cyan)')}
                <div class="algo-bar-pct" id="spdPct">${sel.spd}%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Caesar Lab (shown only for caesar) -->
        <div class="card" id="caesarLab" style="display:${currentAlgo === 'caesar' ? '' : 'none'};">
          <div class="label">Interactive Cipher Lab — Caesar Cipher</div>
          <div class="cipher-inputs">
            <div>
              <div class="cipher-input-label">Plaintext Message</div>
              <input id="plainInput" type="text" class="cipher-input" value="${txt}" maxlength="40"/>
            </div>
            <div class="shift-display">
              <div class="cipher-input-label">Shift Key</div>
              <div class="shift-num text-cyan" id="shiftNum">${shift}</div>
            </div>
          </div>
          <input id="shiftSlider" type="range" min="1" max="25" value="${shift}" class="shift-slider"/>
          <button class="btn btn-cyan" id="encryptBtn" style="margin-bottom:4px;">▶ Encrypt Message</button>
          <div id="charPairsWrap" class="char-pairs mt-12"></div>
          <div class="cipher-outputs" style="margin-top:16px;">
            <div>
              <div class="label c-orange">Ciphertext (Encrypted)</div>
              <div class="cipher-output-box ct" id="ctBox">${ct}</div>
            </div>
            <div>
              <div class="label c-green">Decrypted (same key)</div>
              <div class="cipher-output-box dt" id="dtBox">${dt}</div>
            </div>
          </div>
        </div>

        <!-- AES visual (shown for aes128/aes256) -->
        <div class="card" id="aesVisual" style="display:${(currentAlgo==='aes128'||currentAlgo==='aes256') ? '' : 'none'};">
          <div class="label">AES Round Structure</div>
          <div class="aes-pipeline">
            ${['Plaintext','SubBytes','ShiftRows','MixColumns','AddRoundKey','→ Ciphertext'].map((s,i,arr) =>
              `<span class="aes-step ${i===0||i===arr.length-1?'primary':'sub'}">${s}</span>${i<arr.length-1&&i>0?'<span class="aes-arrow">→</span>':''}`
            ).join('')}
          </div>
          <div style="font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:14px;">
            Repeated for <span style="color:var(--cyan);font-family:var(--font-mono);">${currentAlgo==='aes128'?10:14} rounds</span> — each round creates an avalanche effect where flipping one input bit changes ~50% of ciphertext bits.
          </div>
          <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start;">
            ${[{l:'Plaintext State',v:['48','65','6C','6C','6F','20','57','6F','72','6C','64','21','00','00','00','00'],c:'var(--orange)',cb:'rgba(249,115,22,0.12)',cb2:'rgba(249,115,22,0.28)'},
               {l:'After SubBytes', v:['52','E5','F0','F0','C3','B7','D5','C3','05','47','4E','FD','63','63','63','63'],c:'var(--purple)',cb:'rgba(124,58,237,0.12)',cb2:'rgba(124,58,237,0.28)'},
               {l:'Ciphertext (≈)', v:['A1','D3','9F','2C','B8','4E','5A','7F','C1','82','DA','03','6F','14','28','9E'],c:'var(--cyan)',cb:'rgba(129,140,248,0.12)',cb2:'rgba(129,140,248,0.28)'}
             ].map(mat => `
              <div>
                <div style="font-size:11px;color:${mat.c};font-family:var(--font-head);font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">${mat.l}</div>
                <div class="state-matrix">
                  ${mat.v.map(v=>`<div class="matrix-cell" style="background:${mat.cb};border:1px solid ${mat.cb2};color:${mat.c};">${v}</div>`).join('')}
                </div>
              </div>`).join('')}
          </div>
        </div>

        <!-- Block vs Stream -->
        <div class="card">
          <div class="label">Block Cipher vs Stream Cipher</div>
          <div class="block-stream-grid">
            <div class="block-col">
              <h3 style="color:var(--cyan);">⬛ Block Cipher</h3>
              ${['Divides data into fixed-size blocks (128-bit for AES)','Encrypts each block using the same key + mode','Requires padding if data isn\'t a block-size multiple','Examples: AES, DES, 3DES — best for stored/file data'].map(p=>`<p>• ${p}</p>`).join('')}
            </div>
            <div class="block-col">
              <h3 style="color:var(--purple);">〰 Stream Cipher</h3>
              ${['Encrypts one bit or byte at a time continuously','Generates a keystream XORed with plaintext','No padding needed — ideal for real-time data','Examples: RC4, SEAL, ChaCha20 — best for live streams'].map(p=>`<p>• ${p}</p>`).join('')}
            </div>
          </div>
        </div>

        <!-- Comparison table -->
        <div class="card no-mb" style="overflow-x:auto;">
          <div class="label">Algorithm Comparison Table</div>
          <table class="algo-table" style="margin-top:6px;">
            <thead><tr>${['Algorithm','Key Size','Type','Rounds','Security Status','Speed'].map(h=>`<th>${h}</th>`).join('')}</tr></thead>
            <tbody>
              ${[['Caesar','~5 bits','Stream','1','❌ Broken','⚡ Instant','bad',''],
                 ['DES','56-bit','Block','16','⚠ Deprecated','🐇 Fast','warn',''],
                 ['3DES','112/168b','Block','48','⚠ Legacy','🐢 3× Slower','warn',''],
                 ['SEAL','160-bit','Stream','N/A','⚠ Proprietary','⚡ Fast','warn',''],
                 ['RC4','40–2048b','Stream','N/A','❌ Broken','⚡ Instant','bad',''],
                 ['AES-128','128-bit','Block','10','✅ Secure','⚡ HW-accel','ok',''],
                 ['AES-256','256-bit','Block','14','✅ Quantum+','⚡ HW-accel','ok','']].map(row =>
                `<tr><td class="td-name">${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td class="${row[6]}">${row[4]}</td><td>${row[5]}</td></tr>`
              ).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  function updateAlgoUI() {
    const sel = ALGOS.find(a => a.id === currentAlgo);
    const strCol = sel.str > 70 ? 'var(--green)' : sel.str > 40 ? 'var(--orange)' : 'var(--red)';
    const strClass = sel.str > 70 ? 'chip-green' : sel.str > 40 ? 'chip-orange' : 'chip-red';
    const el = n => document.getElementById(n);
    if (el('algoName')) el('algoName').textContent = sel.n;
    if (el('algoDesc')) el('algoDesc').textContent = sel.desc;
    if (el('algoChips')) el('algoChips').innerHTML = chip(sel.blk?'Block Cipher':'Stream Cipher', sel.blk?'chip-cyan':'chip-purple') + chip(sel.k, strClass);
    if (el('strPct')) { el('strPct').textContent = sel.str + '%'; el('strPct').previousElementSibling.querySelector('.bar-fill').style.width = sel.str + '%'; el('strPct').previousElementSibling.querySelector('.bar-fill').style.background = strCol; }
    if (el('spdPct')) { el('spdPct').textContent = sel.spd + '%'; el('spdPct').previousElementSibling.querySelector('.bar-fill').style.width = sel.spd + '%'; }
    if (el('caesarLab')) el('caesarLab').style.display = currentAlgo === 'caesar' ? '' : 'none';
    if (el('aesVisual')) el('aesVisual').style.display = (currentAlgo==='aes128'||currentAlgo==='aes256') ? '' : 'none';
    document.querySelectorAll('.algo-tab').forEach(t => t.classList.toggle('active', t.dataset.algo === currentAlgo));
  }

  function animateChars(plain, cipher) {
    const wrap = document.getElementById('charPairsWrap');
    if (!wrap) return;
    wrap.innerHTML = plain.toUpperCase().split('').map((c, i) =>
      `<div class="char-pair" style="animation-delay:${i*40}ms;">
        <div class="char-box orig">${c}</div>
        <div class="char-arrow">↓</div>
        <div class="char-box enc">${cipher[i] || c}</div>
      </div>`
    ).join('');
  }

  function updateCaesar() {
    const el = n => document.getElementById(n);
    const ct = caesarEnc(txt, shift);
    const dt = caesarDec(ct, shift);
    if (el('ctBox')) el('ctBox').textContent = ct;
    if (el('dtBox')) el('dtBox').textContent = dt;
    if (el('shiftNum')) el('shiftNum').textContent = shift;
  }

  function init() {
    document.querySelectorAll('.algo-tab').forEach(tab =>
      tab.addEventListener('click', () => {
        currentAlgo = tab.dataset.algo;
        updateAlgoUI();
      })
    );

    const plainInput = document.getElementById('plainInput');
    const shiftSlider = document.getElementById('shiftSlider');
    if (plainInput) {
      plainInput.addEventListener('input', () => {
        txt = plainInput.value;
        document.getElementById('charPairsWrap').innerHTML = '';
        updateCaesar();
      });
    }
    if (shiftSlider) {
      shiftSlider.addEventListener('input', () => {
        shift = parseInt(shiftSlider.value);
        document.getElementById('charPairsWrap').innerHTML = '';
        updateCaesar();
      });
    }

    const encBtn = document.getElementById('encryptBtn');
    if (encBtn) {
      encBtn.addEventListener('click', () => {
        const ct = caesarEnc(txt, shift);
        animateChars(txt, ct);
        if (!earned) { award(30, 'first_enc'); earned = true; }
      });
    }
  }

  return { getHTML, init, cleanup() { currentAlgo = 'caesar'; } };
})();


/* ══════════════════════════════════════════════════════════
   SECTION 8 — MODULE: ASYMMETRIC / RSA
   ══════════════════════════════════════════════════════════ */

const asymModule = (() => {
  let step = 0, msg = 4, earned = false;

  function getSteps(e, d) {
    return [
      { title:'Key Generation', icon:'⚙', col:'var(--purple)', lines:[`Bob selects two prime numbers: p = ${RSA.p},  q = ${RSA.q}`,`Computes modulus:   n = p × q = ${RSA.n}`,`Computes Euler's totient:   φ(n) = (p-1)(q-1) = ${RSA.phi}`,`Chooses public exponent:   e = ${RSA.e}   [gcd(${RSA.e}, ${RSA.phi}) = 1]`,`Computes private key:   d = ${RSA.d}   [e × d ≡ 1 mod φ(n)]`,`Check: ${RSA.e} × ${RSA.d} = ${RSA.e*RSA.d} = ${Math.floor(RSA.e*RSA.d/RSA.phi)}×${RSA.phi}+1  ✓`] },
      { title:'Key Exchange', icon:'📤', col:'var(--cyan)', lines:[`Bob publishes PUBLIC key:   (n=${RSA.n},  e=${RSA.e})`,`Bob keeps SECRET key:       d=${RSA.d}  ← never shared`,``,`Anyone can encrypt with the public key.`,`Only Bob can decrypt — he alone holds d.`,`This solves the key-distribution problem of symmetric crypto.`] },
      { title:'Alice Encrypts', icon:'🔐', col:'var(--orange)', lines:[`Alice has message M = ${msg}`,`Uses Bob's PUBLIC key (n=${RSA.n}, e=${RSA.e}):`,`C = M^e mod n`,`C = ${msg}^${RSA.e} mod ${RSA.n}`,`C = ${e}`,`Alice sends ciphertext ${e} over the network.`] },
      { title:'Bob Decrypts', icon:'🔓', col:'var(--green)', lines:[`Bob receives ciphertext C = ${e}`,`Uses his PRIVATE key d=${RSA.d}:`,`M = C^d mod n`,`M = ${e}^${RSA.d} mod ${RSA.n}`,`M = ${d}   ${d===msg?'✓ Original message recovered!':''}`,`Eve intercepted ${e} but cannot reverse it without d.`] },
    ];
  }

  function renderSVG(e, d) {
    const arrowColors = ['var(--purple)','var(--cyan)','var(--orange)','var(--green)'];
    const ac = arrowColors[step];
    let arrows = '';
    if (step===1) arrows = `<line x1="580" y1="60" x2="104" y2="60" stroke="${ac}" stroke-width="2" stroke-dasharray="7,5" marker-start="url(#aBwd)"/><rect x="260" y="46" width="162" height="28" rx="6" fill="#23204C" stroke="${ac}45"/><text x="341" y="64" text-anchor="middle" fill="${ac}" font-size="10" font-family="Fira Code">Public Key (n=${RSA.n}, e=${RSA.e})</text>`;
    if (step===2) arrows = `<line x1="102" y1="60" x2="578" y2="60" stroke="${ac}" stroke-width="2" stroke-dasharray="7,5" marker-end="url(#aFwd)"/><rect x="258" y="44" width="166" height="32" rx="6" fill="#23204C" stroke="${ac}45"/><text x="341" y="58" text-anchor="middle" fill="${ac}" font-size="10" font-family="Fira Code">Ciphertext C = ${e}</text><text x="341" y="72" text-anchor="middle" fill="var(--muted)" font-size="9" font-family="Fira Code">encrypted with Bob's public key</text>`;
    const bobRing = step===3 ? `<circle cx="610" cy="60" r="32" fill="transparent" stroke="var(--green)" stroke-width="2" stroke-dasharray="5,3"/>` : '';
    const bobStroke = step===3 ? 'var(--green)' : 'var(--muted)';

    return `<svg viewBox="0 0 680 118" style="width:100%;height:auto;display:block;">
      <defs>
        <marker id="aFwd" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L0,7 L7,3.5z" fill="${ac}"/></marker>
        <marker id="aBwd" markerWidth="7" markerHeight="7" refX="2" refY="3.5" orient="auto"><path d="M7,0 L7,7 L0,3.5z" fill="${ac}"/></marker>
      </defs>
      <circle cx="70" cy="60" r="28" fill="#1B1840" stroke="${step>=2?'var(--orange)':'var(--muted)'}" stroke-width="2"/>
      <text x="70" y="67" text-anchor="middle" font-size="24">👩‍💻</text>
      <text x="70" y="97" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Outfit">ALICE</text>
      <circle cx="610" cy="60" r="28" fill="#1B1840" stroke="${bobStroke}" stroke-width="${step===3?'2.5':'2'}"/>
      <text x="610" y="67" text-anchor="middle" font-size="24">👨‍💻</text>
      <text x="610" y="97" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Outfit">BOB</text>
      ${step===0?`<text x="610" y="22" text-anchor="middle" fill="var(--purple)" font-size="11" font-family="Outfit">⚙ Generating RSA keys…</text>`:''}
      ${step===3?`<text x="610" y="22" text-anchor="middle" fill="var(--green)" font-size="11" font-family="Outfit">✓ Decrypted: M = ${msg}</text>`:''}
      ${bobRing}
      ${arrows}
    </svg>`;
  }

  function getHTML() {
    const enc = modPow(msg, RSA.e, RSA.n);
    const dec = modPow(enc, RSA.d, RSA.n);
    const steps = getSteps(enc, dec);
    const cur = steps[step];

    return `
      <div class="module-enter">
        <div class="sec-head">
          <h2><span class="icon">⚷</span> Asymmetric Encryption — RSA</h2>
          <p>Two mathematically linked keys: a PUBLIC key anyone can use to encrypt, and a PRIVATE key only the owner holds to decrypt. Walk through real RSA arithmetic step by step.</p>
        </div>

        <!-- Step progress dots -->
        <div class="step-dots" id="stepDots">
          ${steps.map((s,i) => `<div class="step-dot" data-step="${i}" style="${i<=step?'background:'+s.col:''}" title="${s.title}"></div>`).join('')}
        </div>

        <!-- Alice-Bob SVG -->
        <div class="card p-xs" id="aliceBobWrap">
          ${renderSVG(enc, dec)}
        </div>

        <!-- Step detail -->
        <div class="card accent">
          <div class="step-header">
            <div>
              <div class="step-num">Step ${step+1} of ${steps.length}</div>
              <div class="step-title" style="color:${cur.col};">${cur.icon} ${cur.title}</div>
            </div>
            <div class="step-nav-btns">
              ${step>0?`<button class="btn btn-purple sm" id="stepBack">← Back</button>`:''}
              <button class="btn ${step===steps.length-1?'btn-green':'btn-cyan'} sm" id="stepNext">
                ${step===steps.length-1?'Complete ✓':'Next →'}
              </button>
            </div>
          </div>
          <div class="term">
            <div class="term-header">
              <div class="term-dot" style="background:#EF4444;"></div>
              <div class="term-dot" style="background:#FBBF24;"></div>
              <div class="term-dot" style="background:#10B981;"></div>
              <span class="term-title">rsa_calculator.py</span>
            </div>
            <div class="term-body h-lg" id="rsaTerm">
              ${cur.lines.map((line,i) => line ? `<div class="term-line" style="color:${line.includes('✓')?'var(--green)':line.includes('PUBLIC')||line.includes('public')?'var(--cyan)':line.includes('SECRET')||line.includes('never')?'var(--red)':'var(--green)'};animation:charFlip .18s ease ${i*.07}s both;"><span class="prefix">&gt; </span>${line}</div>` : '<br/>').join('')}
              <span class="term-cursor">█</span>
            </div>
          </div>
        </div>

        <!-- Interactive message slider -->
        <div class="card" id="msgSliderCard" style="display:${step>=2?'':'none'};">
          <div class="label">Try Different Messages (M = 2–6, all coprime to n=${RSA.n})</div>
          <div class="msg-slider-wrap">
            <span class="msg-slider-label">Message M =</span>
            <input type="range" class="msg-slider" id="msgSlider" min="2" max="6" value="${msg}"/>
            <div class="msg-slider-val" id="msgVal">${msg}</div>
            <div class="msg-result">Encrypted C → <span style="color:var(--orange);" id="encResult">${enc}</span><br/>Decrypted M → <span style="color:var(--green);" id="decResult">${dec}</span>${dec===msg?' <span style="color:var(--green);">✓</span>':''}</div>
          </div>
        </div>

        <!-- Other algorithms -->
        <div class="card">
          <div class="label">Other Asymmetric Algorithms</div>
          <div class="other-algos-grid">
            ${[{n:'Diffie-Hellman',c:'var(--cyan)',bg:'rgba(129,140,248,0.10)',b:'rgba(129,140,248,0.26)',use:'Key exchange — not encryption. Alice and Bob derive a shared secret over a public channel without ever transmitting it directly.'},
               {n:'DSS / DSA',c:'var(--purple)',bg:'rgba(124,58,237,0.10)',b:'rgba(124,58,237,0.26)',use:'Digital Signature Standard. Based on discrete logarithm problem. Designed for signing only — not encryption.'},
               {n:'ElGamal',c:'var(--orange)',bg:'rgba(249,115,22,0.10)',b:'rgba(249,115,22,0.26)',use:'Built on Diffie-Hellman. Used in PGP email encryption. Produces ciphertext 2× the size of the plaintext.'},
               {n:'ECC',c:'var(--green)',bg:'rgba(16,185,129,0.10)',b:'rgba(16,185,129,0.26)',use:'Elliptic Curve Cryptography. Same security as RSA with far smaller keys — 256-bit ECC ≈ 3072-bit RSA.'}].map(x =>
              `<div class="other-algo-card" style="background:${x.bg};border-color:${x.b};">
                <div class="other-algo-name" style="color:${x.c};">${x.n}</div>
                <div class="other-algo-desc">${x.use}</div>
              </div>`).join('')}
          </div>
        </div>

        <!-- Sym vs Asym -->
        <div class="sym-asym-grid">
          ${[{t:'Symmetric',c:'var(--green)',icon:'⚿',pros:['Extremely fast','Great for large data','Simple key usage'],cons:['Key-sharing problem','One key compromise = total exposure']},
             {t:'Asymmetric',c:'var(--cyan)',icon:'⚷',pros:['No shared secret needed','Enables digital signatures','Solves key distribution'],cons:['100–1000× slower than AES','Complex math required','Large key sizes needed']}].map(x =>
            `<div class="card sym-asym-card no-mb" style="border-color:${x.c}22;">
              <div class="sym-asym-title" style="color:${x.c};">${x.icon} ${x.t}</div>
              ${x.pros.map(p=>`<div class="pro">✓ ${p}</div>`).join('')}
              ${x.cons.map(c=>`<div class="con">✗ ${c}</div>`).join('')}
            </div>`).join('')}
        </div>
      </div>`;
  }

  function refreshStep() {
    const enc = modPow(msg, RSA.e, RSA.n);
    const dec = modPow(enc, RSA.d, RSA.n);
    const steps = getSteps(enc, dec);
    const cur = steps[step];

    // Update dots
    document.querySelectorAll('.step-dot').forEach((d,i) => {
      d.style.background = i <= step ? steps[i].col : 'rgba(255,255,255,.08)';
    });

    // Update SVG
    const svgWrap = document.getElementById('aliceBobWrap');
    if (svgWrap) svgWrap.innerHTML = renderSVG(enc, dec);

    // Update step title
    const stepTitle = document.querySelector('.step-title');
    if (stepTitle) { stepTitle.textContent = `${cur.icon} ${cur.title}`; stepTitle.style.color = cur.col; }
    const stepNum = document.querySelector('.step-num');
    if (stepNum) stepNum.textContent = `Step ${step+1} of ${steps.length}`;

    // Update terminal
    const rsaTerm = document.getElementById('rsaTerm');
    if (rsaTerm) rsaTerm.innerHTML = cur.lines.map((line,i) =>
      line ? `<div class="term-line" style="color:${line.includes('✓')?'var(--green)':line.includes('PUBLIC')||line.includes('public')?'var(--cyan)':line.includes('SECRET')||line.includes('never')?'var(--red)':'var(--green)'};animation:charFlip .18s ease ${i*.07}s both;"><span class="prefix">&gt; </span>${line}</div>` : '<br/>'
    ).join('') + '<span class="term-cursor">█</span>';

    // Show/hide nav buttons
    const navArea = document.querySelector('.step-nav-btns');
    if (navArea) navArea.innerHTML = (step>0?`<button class="btn btn-purple sm" id="stepBack">← Back</button>`:'') +
      `<button class="btn ${step===steps.length-1?'btn-green':'btn-cyan'} sm" id="stepNext">${step===steps.length-1?'Complete ✓':'Next →'}</button>`;

    // Show/hide slider
    const sliderCard = document.getElementById('msgSliderCard');
    if (sliderCard) sliderCard.style.display = step >= 2 ? '' : 'none';

    // Rebind nav buttons
    bindStepNav(enc, dec);
  }

  function bindStepNav(enc, dec) {
    const nextBtn = document.getElementById('stepNext');
    const backBtn = document.getElementById('stepBack');
    if (nextBtn) nextBtn.addEventListener('click', () => {
      if (step < 3) { step++; award(15); refreshStep(); }
      else if (!earned) { award(40,'key_master'); earned = true; }
    });
    if (backBtn) backBtn.addEventListener('click', () => { if (step > 0) { step--; refreshStep(); } });
  }

  function init() {
    const enc = modPow(msg, RSA.e, RSA.n);
    const dec = modPow(enc, RSA.d, RSA.n);

    document.querySelectorAll('.step-dot').forEach(d =>
      d.addEventListener('click', () => { step = parseInt(d.dataset.step); refreshStep(); })
    );

    bindStepNav(enc, dec);

    const slider = document.getElementById('msgSlider');
    if (slider) slider.addEventListener('input', () => {
      msg = parseInt(slider.value);
      const e2 = modPow(msg, RSA.e, RSA.n);
      const d2 = modPow(e2, RSA.d, RSA.n);
      const mv = document.getElementById('msgVal'); if(mv) mv.textContent = msg;
      const er = document.getElementById('encResult'); if(er) er.textContent = e2;
      const dr = document.getElementById('decResult'); if(dr) dr.textContent = d2;
      const svgW = document.getElementById('aliceBobWrap'); if(svgW) svgW.innerHTML = renderSVG(e2, d2);
    });
  }

  return { getHTML, init, cleanup() { step = 0; msg = 4; } };
})();


/* ══════════════════════════════════════════════════════════
   SECTION 9 — MODULE: ATTACK LAB
   ══════════════════════════════════════════════════════════ */

const attackModule = (() => {
  let bfTimer = null, startTime = null;
  let bfTarget = 'ab', bfRunning = false, bfFound = false;
  let bfCount = 0, bfElapsed = '0.0', bfAttempt = '';
  let mPhase = -1, mTimer = null, earned = false;

  const mitmLabels = [
    'Alice wants to talk securely with Bob…',
    'Eve intercepts the connection, posing as Bob to Alice.',
    'Eve also poses as Alice to Bob — both are deceived.',
    '⚠ Eve reads and can modify ALL messages silently.',
    '✓ Defence: TLS certificates + Certificate Authorities verify identity.',
  ];

  function getHTML() {
    return `
      <div class="module-enter">
        <div class="sec-head">
          <h2><span class="icon">⚡</span> Attack Lab</h2>
          <p>Simulate real cryptographic attacks in a safe environment to understand why key length, randomness, and encryption strength are non-negotiable.</p>
        </div>

        <!-- Brute Force Card -->
        <div class="card accent">
          <div class="attack-title text-red">⚡ Brute-Force Attack Simulator</div>
          <p style="font-size:14px;color:var(--muted);margin-bottom:18px;line-height:1.7;">An attacker methodically tries every possible password combination until the correct one is found. Watch the speed — then see why 256-bit keys are mathematically uncrackable.</p>

          <div style="display:flex;gap:14px;align-items:flex-end;flex-wrap:wrap;margin-bottom:18px;">
            <div>
              <div class="target-label">Target Password (2–4 lowercase letters)</div>
              <input id="targetInput" type="text" class="target-input" value="${bfTarget}" maxlength="4"/>
            </div>
            <div style="display:flex;gap:10px;">
              <button id="bfStartBtn" class="btn btn-red">⚡ Start Attack</button>
              <button id="bfStopBtn" class="btn btn-orange" style="display:none;">■ Stop</button>
            </div>
          </div>

          <!-- BF Display -->
          <div class="bf-display">
            <div class="bf-header">
              <span class="bf-header-lbl">Current Attempt</span>
              <span class="bf-count">Attempts: <span id="bfCountEl">0</span></span>
            </div>
            <div class="bf-attempt-wrap">
              <div class="bf-attempt" id="bfAttemptEl">${'?'.repeat(bfTarget.length)}</div>
            </div>
            <div id="bfFoundMsg" class="bf-found-msg" style="display:none;"></div>
            <div class="bf-stats">
              <div class="bf-stat"><div class="bf-stat-lbl">Elapsed</div><div class="bf-stat-val" id="bfElapsedEl">0.0s</div></div>
              <div class="bf-stat"><div class="bf-stat-lbl">Status</div><div class="bf-stat-val" id="bfStatusEl">READY</div></div>
            </div>
          </div>

          <!-- Time comparison -->
          <div class="label c-orange">Real-World Time-to-Crack Comparison</div>
          <div class="crack-times">
            ${[{l:'3 lowercase letters (17,576 combos)',t:'< 1 second',pct:3,c:'var(--red)'},
               {l:'8 lowercase letters',t:'~ 2 hours',pct:22,c:'var(--orange)'},
               {l:'8 chars + uppercase + numbers',t:'~ 3 days',pct:40,c:'var(--orange)'},
               {l:'12 chars + symbols + mixed case',t:'~ 34,000 years',pct:78,c:'var(--green)'},
               {l:'AES-128 key brute force',t:'> age of universe',pct:100,c:'var(--green)'}].map(x =>
              `<div class="crack-row">
                <div class="crack-label">${x.l}</div>
                <div class="crack-bar-wrap"><div class="crack-bar" style="width:${x.pct}%;background:${x.c};"></div></div>
                <div class="crack-time" style="color:${x.c};">${x.t}</div>
              </div>`).join('')}
          </div>
        </div>

        <!-- MITM Card -->
        <div class="card no-mb">
          <div class="attack-title" style="color:var(--purple);">🕵 Man-in-the-Middle (MITM) Attack</div>
          <p style="font-size:14px;color:var(--muted);margin-bottom:16px;line-height:1.7;">Eve inserts herself between Alice and Bob, impersonating each party to the other. Both believe they have a secure channel — neither knows Eve is reading everything.</p>

          <svg id="mitmSVG" viewBox="0 0 680 120" style="width:100%;height:auto;margin-bottom:14px;display:block;">
            <circle cx="70"  cy="60" r="26" fill="#1B1840" stroke="var(--cyan)" stroke-width="2"/>
            <text x="70"  y="67" text-anchor="middle" font-size="22">👩‍💻</text>
            <text x="70"  y="94" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Outfit">ALICE</text>
            <circle cx="610" cy="60" r="26" fill="#1B1840" stroke="var(--cyan)" stroke-width="2"/>
            <text x="610" y="67" text-anchor="middle" font-size="22">👨‍💻</text>
            <text x="610" y="94" text-anchor="middle" fill="var(--muted)" font-size="11" font-family="Outfit">BOB</text>
            <g id="eveGrpMitm" style="opacity:0.15;transition:opacity .55s;">
              <circle id="mitmEveCirc" cx="340" cy="60" r="28" fill="#1B1840" stroke="var(--purple)" stroke-width="2"/>
              <text x="340" y="67" text-anchor="middle" font-size="22">🕵️</text>
              <text x="340" y="96" text-anchor="middle" fill="var(--red)" font-size="11" font-family="Outfit">EVE</text>
              <text id="eveReadAll" x="340" y="26" text-anchor="middle" fill="var(--red)" font-size="10" font-family="Outfit" style="display:none;">READING ALL</text>
            </g>
            <line id="mitmLine1" x1="100" y1="60" x2="580" y2="60" stroke="var(--border)" stroke-width="2" stroke-dasharray="6,5"/>
            <line id="mitmLine2" x1="100" y1="60" x2="308" y2="60" stroke="var(--red)" stroke-width="2" stroke-dasharray="6,5" style="display:none;"/>
            <line id="mitmLine3" x1="372" y1="60" x2="580" y2="60" stroke="var(--red)" stroke-width="2" stroke-dasharray="6,5" style="display:none;"/>
            <text id="mitmLbl1" x="204" y="47" text-anchor="middle" fill="var(--red)" font-size="10" font-family="Outfit" style="display:none;">Alice→Eve</text>
            <text id="mitmLbl2" x="476" y="47" text-anchor="middle" fill="var(--red)" font-size="10" font-family="Outfit" style="display:none;">Eve→Bob</text>
            <text id="mitmDefence" x="340" y="115" text-anchor="middle" fill="var(--green)" font-size="10" font-family="Outfit" style="display:none;">Defence: TLS + PKI certificates verify authentic endpoints</text>
          </svg>

          <div class="mitm-msg" id="mitmMsg">Press the button below to simulate a MITM attack step by step.</div>
          <button class="btn btn-purple" id="mitmBtn">▶ Simulate MITM Attack</button>
        </div>
      </div>`;
  }

  function updateBFUI() {
    const el = id => document.getElementById(id);
    const att = el('bfAttemptEl'), cnt = el('bfCountEl'), elapsed = el('bfElapsedEl'), status = el('bfStatusEl');
    const foundMsg = el('bfFoundMsg');
    if (att) { att.textContent = bfAttempt || '?'.repeat(Math.min(bfTarget.length, 4)); att.className = `bf-attempt ${bfFound?'cracked':bfRunning?'running':''}`; }
    if (cnt) cnt.textContent = bfCount.toLocaleString();
    if (elapsed) elapsed.textContent = bfElapsed + 's';
    if (status) { status.textContent = bfFound ? 'CRACKED' : bfRunning ? 'RUNNING' : 'READY'; status.className = `bf-stat-val ${bfFound?'cracked':bfRunning?'running':''}`; }
    if (foundMsg) { foundMsg.style.display = bfFound ? '' : 'none'; if (bfFound) foundMsg.textContent = `Password cracked: "${bfTarget}" — ${bfCount.toLocaleString()} attempts in ${bfElapsed}s`; }
    if (el('bfStartBtn')) el('bfStartBtn').style.display = bfRunning ? 'none' : '';
    if (el('bfStopBtn')) el('bfStopBtn').style.display = bfRunning ? '' : 'none';
  }

  function startBF() {
    const t = (document.getElementById('targetInput')?.value || 'ab').toLowerCase().replace(/[^a-z]/g,'').slice(0,4) || 'ab';
    bfTarget = t;
    const tLen = t.length;
    const tIdx = s2i(t);
    const batch = tLen<=2 ? 5 : tLen===3 ? 50 : 500;
    bfRunning = true; bfFound = false; bfCount = 0; bfAttempt = '';
    startTime = Date.now();
    updateBFUI();
    let idx = 0;
    bfTimer = setInterval(() => {
      let done = false;
      for (let b = 0; b < batch; b++) { if (idx === tIdx) { done = true; break; } if (idx < tIdx) idx++; }
      bfAttempt = i2s(Math.min(idx, tIdx), tLen);
      bfCount = idx;
      bfElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      updateBFUI();
      if (done) {
        bfFound = true; bfRunning = false;
        clearInterval(bfTimer); bfTimer = null;
        updateBFUI();
        if (!earned) { award(35, 'ethical_hack'); earned = true; }
      }
    }, 50);
  }

  function stopBF() {
    clearInterval(bfTimer); bfTimer = null;
    bfRunning = false; updateBFUI();
  }

  function updateMITM() {
    const el = id => document.getElementById(id);
    const eveGrp = el('eveGrpMitm'), eveCirc = el('mitmEveCirc');
    const line1 = el('mitmLine1'), line2 = el('mitmLine2'), line3 = el('mitmLine3');
    const lbl1 = el('mitmLbl1'), lbl2 = el('mitmLbl2'), readAll = el('eveReadAll'), defence = el('mitmDefence');
    const msg = el('mitmMsg'), btn = el('mitmBtn');

    if (eveGrp) eveGrp.style.opacity = mPhase >= 1 ? '1' : '0.15';
    if (eveCirc) eveCirc.setAttribute('stroke', mPhase >= 3 ? 'var(--red)' : 'var(--purple)');
    if (line1) line1.style.display = mPhase >= 1 ? 'none' : '';
    if (line2) line2.style.display = mPhase >= 1 ? '' : 'none';
    if (line3) line3.style.display = mPhase >= 1 ? '' : 'none';
    if (lbl1) lbl1.style.display = mPhase >= 2 ? '' : 'none';
    if (lbl2) lbl2.style.display = mPhase >= 2 ? '' : 'none';
    if (readAll) readAll.style.display = mPhase >= 3 ? '' : 'none';
    if (defence) defence.style.display = mPhase >= 4 ? '' : 'none';
    if (msg) { msg.textContent = mPhase >= 0 ? mitmLabels[Math.min(mPhase, mitmLabels.length-1)] : 'Press the button below to simulate a MITM attack step by step.'; msg.className = `mitm-msg ${mPhase >= 4 ? 'success' : ''}`; }
    if (btn) btn.textContent = mPhase >= 0 ? '↻ Replay Attack' : '▶ Simulate MITM Attack';
  }

  function runMITM() {
    clearInterval(mTimer); mPhase = 0; updateMITM();
    let p = 0;
    mTimer = setInterval(() => { p++; mPhase = p; updateMITM(); if (p >= mitmLabels.length-1) { clearInterval(mTimer); mTimer = null; } }, 1500);
  }

  function init() {
    document.getElementById('bfStartBtn')?.addEventListener('click', () => {
      if (!bfRunning) startBF();
    });
    document.getElementById('bfStopBtn')?.addEventListener('click', stopBF);
    document.getElementById('targetInput')?.addEventListener('input', function() {
      bfTarget = this.value.toLowerCase().replace(/[^a-z]/g,'').slice(0,4);
    });
    document.getElementById('mitmBtn')?.addEventListener('click', runMITM);
  }

  function cleanup() {
    clearInterval(bfTimer); bfTimer = null;
    clearInterval(mTimer); mTimer = null;
    bfRunning = false;
  }

  return { getHTML, init, cleanup };
})();


/* ══════════════════════════════════════════════════════════
   SECTION 10 — MODULE: DIGITAL SIGNATURES
   ══════════════════════════════════════════════════════════ */

const sigModule = (() => {
  let msg = 'The sky is blue.';
  let signed = false, tampered = false, earned = false;

  const flowSteps = ['Message','Hash (SHA-256)','Encrypt hash w/ Private Key','→ Signature','Recipient decrypts w/ Public Key','Compare hashes','Valid ✓ / Invalid ✗'];
  const flowColors = ['var(--cyan)','var(--orange)','var(--purple)','var(--purple)','var(--cyan)','var(--green)','var(--green)'];

  function getHash()  { return simpleHash(msg); }
  function getSig()   { const h = getHash(); return h.split('').map(c => String.fromCharCode(c.charCodeAt(0)+3)).join(''); }
  function getVHash() { return simpleHash(tampered ? msg+'[TAMPERED]' : msg); }
  function isValid()  { return getVHash() === getHash(); }

  function renderPipeline() {
    const h = getHash(), sig = getSig(), vh = getVHash(), ok = isValid();
    const rows = [
      { lbl:'Original Message',      val:msg,  c:'var(--text)',   border:'var(--border)', bg:'transparent', show:true },
      { lbl:'Hash (SHA-256 style)',   val:tampered?vh:h,  c:'var(--orange)', border:'rgba(249,115,22,0.25)', bg:'rgba(249,115,22,0.10)', show:signed },
      { lbl:'Signature (hash encrypted with private key)', val:sig, c:'var(--purple)', border:'rgba(124,58,237,0.25)', bg:'rgba(124,58,237,0.15)', show:signed },
      { lbl:'Verification result',    val:ok?'✓ SIGNATURE VALID — message is authentic and unaltered':'✗ SIGNATURE INVALID — message was tampered with!', c:ok?'var(--green)':'var(--red)', border:ok?'rgba(16,185,129,0.25)':'rgba(239,68,68,0.25)', bg:ok?'rgba(16,185,129,0.13)':'rgba(239,68,68,0.13)', show:signed },
    ];
    const pipeEl = document.getElementById('pipeline');
    if (!pipeEl) return;
    pipeEl.innerHTML = rows.map((r, i) => `
      <div class="pipeline-row${r.show?'':' dimmed'}">
        <div class="pipeline-num" style="color:${r.c};border-color:${r.border};background:${r.bg.replace(')',', 0.3)')===r.bg?r.bg:r.bg};">${i+1}</div>
        <div class="pipeline-content">
          <div class="pipeline-label">${r.lbl}</div>
          <div class="pipeline-value" style="color:${r.c};border-color:${r.border};background:${r.bg};${i===3&&signed?'animation:correctPop .4s ease;':''}">${r.show?r.val:'—'}</div>
        </div>
      </div>`).join('');
    updateSigButtons();
  }

  function updateSigButtons() {
    const signBtn = document.getElementById('signBtn'), tampBtn = document.getElementById('tampBtn');
    if (tampBtn) tampBtn.style.display = signed ? '' : 'none';
    if (tampBtn && signed) { tampBtn.textContent = tampered ? '↩ Restore Message' : '⚡ Tamper with Message'; tampBtn.className = `btn ${tampered?'btn-red':'btn-orange'}`; }
  }

  function getHTML() {
    return `
      <div class="module-enter">
        <div class="sec-head">
          <h2><span class="icon">✍</span> Digital Signatures</h2>
          <p>Sign a message with your private key — anyone can verify its authenticity using your public key. Tampering invalidates the signature instantly.</p>
        </div>

        <!-- How it works -->
        <div class="card">
          <div class="label">How Digital Signatures Work</div>
          <div class="sig-flow">
            ${flowSteps.map((s,i) => `<span class="sig-flow-step" style="color:${flowColors[i]};border-color:${flowColors[i]}28;background:${flowColors[i]}14;">${s}</span>${i<flowSteps.length-1?'<span class="sig-flow-arrow">→</span>':''}`).join('')}
          </div>
        </div>

        <!-- Interactive lab -->
        <div class="card accent">
          <div class="label">Interactive Signing Lab</div>
          <div style="margin-bottom:14px;">
            <div style="font-size:11px;color:var(--muted);font-family:var(--font-head);font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-bottom:7px;">Your Message</div>
            <input id="sigMsgInput" type="text" class="cipher-input" value="${msg.replace(/"/g,'&quot;')}"/>
          </div>
          <div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;">
            <button id="signBtn" class="btn btn-cyan">✍ Sign Message</button>
            <button id="tampBtn" class="btn btn-orange" style="display:${signed?'':'none'};">${tampered?'↩ Restore Message':'⚡ Tamper with Message'}</button>
          </div>
          <div class="pipeline" id="pipeline"></div>
        </div>

        <!-- Why sign / How verify -->
        <div class="sig-why-grid">
          ${[{t:'Why Sign?',c:'var(--cyan)',pts:['Proves the message came from you (authentication)','Confirms nothing was altered in transit (integrity)','Non-repudiation — you cannot deny signing it','Used in TLS, code signing, email (S/MIME), blockchain']},
             {t:'How Verification Works',c:'var(--purple)',pts:['Sender: hash the message → encrypt hash with private key','Receiver: decrypt signature with sender\'s PUBLIC key','Receiver independently hashes the received message','If both hashes match → authentic. If not → tampered.']}].map(x =>
            `<div class="card sig-why-card no-mb" style="border-color:${x.c}22;">
              <div class="sig-why-title" style="color:${x.c};">${x.t}</div>
              ${x.pts.map(p=>`<div class="sig-why-pt">• ${p}</div>`).join('')}
            </div>`).join('')}
        </div>
      </div>`;
  }

  function init() {
    signed = false; tampered = false;
    renderPipeline();

    document.getElementById('sigMsgInput')?.addEventListener('input', function() {
      msg = this.value;
      signed = false; tampered = false;
      renderPipeline();
    });

    document.getElementById('signBtn')?.addEventListener('click', () => {
      signed = true; tampered = false;
      if (!earned) { award(30,'signed'); earned = true; }
      renderPipeline();
    });

    document.getElementById('tampBtn')?.addEventListener('click', () => {
      tampered = !tampered;
      renderPipeline();
    });
  }

  return { getHTML, init, cleanup() { signed = false; tampered = false; } };
})();


/* ══════════════════════════════════════════════════════════
   SECTION 11 — MODULE: QUIZ / KNOWLEDGE CHALLENGE
   ══════════════════════════════════════════════════════════ */

const quizModule = (() => {
  let qIdx = 0, sel = null, answered = false, score = 0, done = false, bEarned = false;

  function totalPts() { return QUIZ.reduce((a,q) => a+q.pts, 0); }

  function getHTML() {
    if (done) return renderResult();
    return `
      <div class="module-enter">
        <div class="quiz-header">
          <div class="sec-head" style="margin-bottom:0;">
            <h2 style="margin-bottom:0;"><span class="icon">★</span> Knowledge Challenge</h2>
          </div>
          <div style="font-family:var(--font-mono);font-size:14px;color:var(--muted);">
            Q${qIdx+1}/${QUIZ.length} | <span style="color:var(--green);">${score} pts</span>
          </div>
        </div>

        <!-- Progress segments -->
        <div class="quiz-progress">
          ${QUIZ.map((_,i) => `<div class="quiz-seg${i<qIdx?' done':i===qIdx?' current':''}"></div>`).join('')}
        </div>

        <!-- Question card -->
        <div class="card accent" id="quizCard">
          <div class="quiz-pts">${QUIZ[qIdx].pts} Points</div>
          <div class="quiz-q">${QUIZ[qIdx].q}</div>
          <div class="quiz-options" id="quizOptions">
            ${QUIZ[qIdx].opts.map((opt,i) => `
              <button class="quiz-opt${answered&&i===QUIZ[qIdx].a?' correct':answered&&i===sel&&i!==QUIZ[qIdx].a?' incorrect':''}" data-idx="${i}" ${answered?'disabled':''}>
                <span class="quiz-opt-letter" style="border-color:inherit;">${answered&&i===QUIZ[qIdx].a?'✓':answered&&i===sel&&i!==QUIZ[qIdx].a?'✗':['A','B','C','D'][i]}</span>
                ${opt}
              </button>`).join('')}
          </div>
          ${answered ? `<div class="quiz-next"><button class="btn ${sel===QUIZ[qIdx].a?'btn-green':'btn-cyan'}" id="quizNext">${qIdx<QUIZ.length-1?'Next Question →':'See Results →'}</button></div>` : ''}
        </div>
      </div>`;
  }

  function renderResult() {
    const pct = Math.round((score / totalPts()) * 100);
    return `
      <div class="module-enter">
        <div class="card accent quiz-result">
          <div class="quiz-result-emoji">${pct>=80?'🏆':pct>=60?'⭐':'💪'}</div>
          <div class="quiz-result-title" style="color:${pct>=80?'var(--green)':'var(--cyan)'};">${pct>=80?'Excellent!':pct>=60?'Good Job!':'Keep Learning!'}</div>
          <div class="quiz-result-score">Score: <span style="color:var(--cyan);">${score}/${totalPts()} points (${pct}%)</span></div>
          ${pct>=70?`<div class="quiz-badge-earned">🏆 Badge Unlocked: Quiz Ace</div>`:''}
          <button class="btn btn-cyan" id="quizReset">↻ Try Again</button>
        </div>
      </div>`;
  }

  function pick(i) {
    if (answered) return;
    sel = i; answered = true;
    const q = QUIZ[qIdx];
    if (i === q.a) { score += q.pts; award(q.pts); }
    // Update option styles
    document.querySelectorAll('.quiz-opt').forEach((btn, bi) => {
      if (bi === q.a)          { btn.classList.add('correct');   btn.querySelector('.quiz-opt-letter').textContent = '✓'; }
      else if (bi === sel)     { btn.classList.add('incorrect'); btn.querySelector('.quiz-opt-letter').textContent = '✗'; }
      btn.disabled = true;
    });
    // Add next button
    const card = document.getElementById('quizCard');
    if (card && !document.getElementById('quizNext')) {
      const div = document.createElement('div');
      div.className = 'quiz-next';
      div.innerHTML = `<button class="btn ${sel===q.a?'btn-green':'btn-cyan'}" id="quizNext">${qIdx<QUIZ.length-1?'Next Question →':'See Results →'}</button>`;
      card.appendChild(div);
      div.querySelector('#quizNext').addEventListener('click', nextQ);
    }
  }

  function nextQ() {
    if (qIdx < QUIZ.length-1) { qIdx++; answered = false; sel = null; render(); }
    else {
      done = true;
      if (score/totalPts() >= 0.7 && !bEarned) { award(50,'quiz_ace'); bEarned = true; }
      render();
    }
  }

  function render() {
    const container = document.getElementById('moduleContainer');
    container.innerHTML = getHTML();
    bindEvents();
  }

  function bindEvents() {
    if (done) { document.getElementById('quizReset')?.addEventListener('click', () => { qIdx=0;sel=null;answered=false;score=0;done=false;bEarned=false; render(); }); return; }
    document.querySelectorAll('.quiz-opt').forEach(btn => btn.addEventListener('click', () => pick(parseInt(btn.dataset.idx))));
    document.getElementById('quizNext')?.addEventListener('click', nextQ);
  }

  function init() { bindEvents(); }

  return {
    getHTML,
    init,
    cleanup() { qIdx = 0; sel = null; answered = false; score = 0; done = false; }
  };
})();


/* ══════════════════════════════════════════════════════════
   SECTION 12 — ROUTER / MODULE LIFECYCLE
   ══════════════════════════════════════════════════════════ */

const modRegistry = {
  home:    homeModule,
  conf:    confModule,
  sym:     symModule,
  asym:    asymModule,
  attacks: attackModule,
  sigs:    sigModule,
  quiz:    quizModule,
};

let activeMod = null;

function navigate(modId) {
  if (!modRegistry[modId]) return;
  if (activeMod) activeMod.cleanup();

  APP.currentMod = modId;
  activeMod = modRegistry[modId];

  // Update navigation
  renderNav();

  // Render module
  const container = document.getElementById('moduleContainer');
  container.innerHTML = activeMod.getHTML();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Init (attach events, start animations)
  activeMod.init();
}


/* ══════════════════════════════════════════════════════════
   SECTION 13 — APPLICATION INIT
   ══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Render navigation
  renderNav();
  updateHeader();

  // Logo click → home
  const logoBtn = document.getElementById('logoBtn');
  if (logoBtn) { logoBtn.addEventListener('click', () => navigate('home')); logoBtn.addEventListener('keydown', e => { if(e.key==='Enter') navigate('home'); }); }

  // Start on home
  navigate('home');
});
