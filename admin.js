// ─────────────────────────────────────────────────────────────────────────────
//  admin.js  —  ESG e Tal CMS  v2
//  Easter egg: Ctrl + Shift + A
// ─────────────────────────────────────────────────────────────────────────────
(function () {
  'use strict';

  const DB_ROOT = 'siteContent';

  const S = {
    open: false, loggedIn: false,
    tab: 'news', editLang: 'pt',
    db: null, auth: null, dbData: null,
    editingId: null, editingType: null,
    confirmCb: null,
  };

  // ╔═══════════════════════════╗
  // ║  CSS                      ║
  // ╚═══════════════════════════╝
  function injectCSS() {
    const s = document.createElement('style');
    s.id = 'adm-styles';
    s.textContent = `
#adm-backdrop *, #adm-backdrop *::before, #adm-backdrop *::after { box-sizing:border-box; }
#adm-backdrop {
  position:fixed; inset:0; z-index:9990;
  background:rgba(3,8,18,.9);
  backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
  display:none; align-items:center; justify-content:center;
  font-family:'DM Sans',sans-serif;
}
#adm-backdrop.adm-open { display:flex; }
#adm-panel {
  background:#071524;
  border:1px solid rgba(16,185,129,.2);
  border-radius:1.25rem;
  width:min(1200px,96vw); height:min(820px,95vh);
  display:flex; flex-direction:column; overflow:hidden;
  box-shadow:0 48px 120px rgba(0,0,0,.75),0 0 0 1px rgba(16,185,129,.06);
  animation:adm-pop .28s cubic-bezier(.34,1.2,.64,1) both;
  position:relative;
}
@keyframes adm-pop { from{opacity:0;transform:scale(.93) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }

/* Header */
#adm-header {
  display:flex; align-items:center; gap:.875rem;
  padding:.85rem 1.375rem;
  border-bottom:1px solid rgba(255,255,255,.065);
  flex-shrink:0; background:rgba(255,255,255,.018);
}
.adm-logo { display:flex; align-items:center; gap:.5rem; font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; color:#e4edf6; flex-shrink:0; }
.adm-logo-dot { width:8px; height:8px; border-radius:50%; background:#10B981; box-shadow:0 0 8px rgba(16,185,129,.9); animation:adm-pulse 2.4s ease-in-out infinite; }
@keyframes adm-pulse { 0%,100%{box-shadow:0 0 5px rgba(16,185,129,.6)} 50%{box-shadow:0 0 14px rgba(16,185,129,1)} }
.adm-chip { padding:.16rem .55rem; border-radius:99px; background:rgba(16,185,129,.1); border:1px solid rgba(16,185,129,.25); color:#10B981; font-size:.65rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; flex-shrink:0; }
.adm-status-bar { flex:1; min-width:0; display:flex; align-items:center; justify-content:flex-end; gap:.5rem; }
.adm-sdot { width:6px; height:6px; border-radius:50%; flex-shrink:0; background:rgba(255,255,255,.2); transition:background .3s; }
.adm-sdot.ok  { background:#10B981; box-shadow:0 0 6px rgba(16,185,129,.7); }
.adm-sdot.err { background:#f87171; }
.adm-sdot.info{ background:#60a5fa; }
.adm-stxt { font-size:.72rem; color:rgba(255,255,255,.3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:240px; }
.adm-stxt.ok  { color:#10B981; } .adm-stxt.err { color:#f87171; } .adm-stxt.info { color:#60a5fa; }
.adm-hbtn { width:30px; height:30px; border-radius:.45rem; border:1px solid rgba(255,255,255,.09); background:transparent; color:rgba(255,255,255,.45); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:.78rem; transition:all .18s; flex-shrink:0; }
.adm-hbtn:hover { border-color:rgba(255,255,255,.22); color:#fff; background:rgba(255,255,255,.07); }
.adm-hbtn.cls:hover { border-color:rgba(248,113,113,.4); color:#f87171; background:rgba(248,113,113,.07); }

/* Body */
#adm-body { display:flex; flex:1; min-height:0; }

/* Sidebar */
#adm-sidebar { width:196px; flex-shrink:0; border-right:1px solid rgba(255,255,255,.06); display:flex; flex-direction:column; padding:.875rem .625rem; background:rgba(255,255,255,.012); }
.adm-nlbl { font-size:.6rem; font-weight:700; letter-spacing:.15em; text-transform:uppercase; color:rgba(255,255,255,.2); padding:.5rem .625rem .25rem; }
.adm-nbtn { display:flex; align-items:center; gap:.55rem; padding:.55rem .75rem; border-radius:.5rem; border:none; background:transparent; color:rgba(255,255,255,.42); font-size:.8rem; font-weight:500; cursor:pointer; transition:all .18s; font-family:'DM Sans',sans-serif; text-align:left; width:100%; margin-bottom:.1rem; }
.adm-nbtn i { font-size:.76rem; width:15px; text-align:center; flex-shrink:0; }
.adm-nbtn:hover { background:rgba(255,255,255,.055); color:rgba(255,255,255,.72); }
.adm-nbtn.on { background:rgba(16,185,129,.1); color:#10B981; border:1px solid rgba(16,185,129,.18); }
.adm-nbtn.on i { color:#10B981; }
.adm-sfoot { margin-top:auto; padding-top:.75rem; border-top:1px solid rgba(255,255,255,.06); }
.adm-utxt { font-size:.68rem; color:rgba(255,255,255,.25); padding:.3rem .625rem .45rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

/* Content */
#adm-content { flex:1; min-width:0; display:flex; flex-direction:column; overflow:hidden; }
.adm-chdr { padding:.95rem 1.375rem .8rem; border-bottom:1px solid rgba(255,255,255,.06); display:flex; align-items:center; gap:.875rem; flex-shrink:0; }
.adm-ctitle { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:700; color:#e4edf6; }
.adm-cdesc  { font-size:.73rem; color:rgba(255,255,255,.3); margin-top:.08rem; }
.adm-lgrp   { display:flex; gap:.2rem; margin-left:auto; }
.adm-lbtn   { padding:.22rem .55rem; border-radius:.35rem; border:1px solid rgba(255,255,255,.09); background:transparent; color:rgba(255,255,255,.35); font-size:.68rem; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .18s; text-transform:uppercase; letter-spacing:.06em; }
.adm-lbtn.on { background:rgba(16,185,129,.14); border-color:rgba(16,185,129,.32); color:#10B981; }

/* Scroll */
.adm-scroll { flex:1; overflow-y:auto; padding:1.125rem 1.375rem 2rem; }
.adm-scroll::-webkit-scrollbar { width:3px; }
.adm-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:99px; }

/* Accordion */
.adm-acc { border:1px solid rgba(255,255,255,.07); border-radius:.75rem; margin-bottom:.75rem; overflow:hidden; }
.adm-ahdr { display:flex; align-items:center; gap:.625rem; padding:.8rem 1rem; cursor:pointer; background:rgba(255,255,255,.022); user-select:none; transition:background .18s; }
.adm-ahdr:hover { background:rgba(255,255,255,.045); }
.adm-ahdr.on { background:rgba(16,185,129,.055); border-bottom:1px solid rgba(255,255,255,.06); }
.adm-aico { width:28px; height:28px; border-radius:.4rem; flex-shrink:0; background:rgba(16,185,129,.1); border:1px solid rgba(16,185,129,.18); display:flex; align-items:center; justify-content:center; font-size:.72rem; color:#10B981; }
.adm-atitle { font-size:.82rem; font-weight:600; color:rgba(255,255,255,.78); flex:1; }
.adm-achev  { font-size:.65rem; color:rgba(255,255,255,.25); transition:transform .2s; }
.adm-ahdr.on .adm-achev { transform:rotate(180deg); color:#10B981; }
.adm-abody { padding:1rem; display:none; }
.adm-abody.on { display:block; }

/* Fields */
.adm-field { margin-bottom:.75rem; }
.adm-label { display:block; font-size:.68rem; font-weight:600; color:rgba(255,255,255,.35); margin-bottom:.25rem; letter-spacing:.04em; }
.adm-label small { color:rgba(255,255,255,.18); font-weight:400; margin-left:.2rem; }
.adm-input, .adm-textarea { width:100%; background:rgba(255,255,255,.035); border:1px solid rgba(255,255,255,.09); border-radius:.45rem; color:rgba(255,255,255,.82); font-family:'DM Sans',sans-serif; font-size:.8rem; line-height:1.55; padding:.5rem .7rem; transition:border-color .18s,background .18s; outline:none; }
.adm-input::placeholder, .adm-textarea::placeholder { color:rgba(255,255,255,.16); }
.adm-input:focus, .adm-textarea:focus { border-color:rgba(16,185,129,.45); background:rgba(16,185,129,.035); }
.adm-textarea { resize:vertical; min-height:68px; }
.adm-r2 { display:grid; grid-template-columns:1fr 1fr; gap:.625rem; }
.adm-r3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:.625rem; }

/* Buttons */
.adm-btn { display:inline-flex; align-items:center; gap:.38rem; padding:.5rem 1.1rem; border-radius:.45rem; border:none; font-family:'DM Sans',sans-serif; font-size:.78rem; font-weight:600; cursor:pointer; transition:all .18s; white-space:nowrap; }
.adm-pri  { background:#10B981; color:#fff; }
.adm-pri:hover  { background:#059669; transform:translateY(-1px); box-shadow:0 5px 18px rgba(16,185,129,.32); }
.adm-pri:disabled { background:rgba(16,185,129,.3); cursor:not-allowed; transform:none !important; box-shadow:none !important; }
.adm-gho  { background:rgba(255,255,255,.055); border:1px solid rgba(255,255,255,.1); color:rgba(255,255,255,.6); }
.adm-gho:hover  { background:rgba(255,255,255,.1); color:#fff; }
.adm-red  { background:rgba(248,113,113,.08); border:1px solid rgba(248,113,113,.22); color:#f87171; }
.adm-red:hover  { background:rgba(248,113,113,.18); border-color:rgba(248,113,113,.45); transform:translateY(-1px); }
.adm-add  { background:rgba(16,185,129,.07); border:1px dashed rgba(16,185,129,.35); color:#10B981; width:100%; justify-content:center; padding:.6rem; border-radius:.5rem; margin-top:.625rem; }
.adm-add:hover { background:rgba(16,185,129,.14); }
.adm-acts { display:flex; gap:.45rem; padding-top:.875rem; flex-wrap:wrap; align-items:center; }

/* Item list */
.adm-ilist { display:flex; flex-direction:column; gap:.4rem; margin-bottom:.5rem; }
.adm-irow  { display:flex; align-items:center; gap:.625rem; padding:.625rem .875rem; border-radius:.55rem; border:1px solid rgba(255,255,255,.07); background:rgba(255,255,255,.025); transition:all .18s; }
.adm-irow:hover { border-color:rgba(255,255,255,.13); background:rgba(255,255,255,.05); }
.adm-irow.on { border-color:rgba(16,185,129,.32); background:rgba(16,185,129,.055); }
.adm-iico  { width:30px; height:30px; border-radius:.4rem; flex-shrink:0; background:rgba(16,185,129,.08); border:1px solid rgba(16,185,129,.18); display:flex; align-items:center; justify-content:center; font-size:.72rem; color:#10B981; }
.adm-imeta { flex:1; min-width:0; cursor:pointer; }
.adm-ihl   { font-size:.78rem; font-weight:600; color:rgba(255,255,255,.75); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.adm-idt   { font-size:.66rem; color:rgba(255,255,255,.28); margin-top:.06rem; }
.adm-ibts  { display:flex; gap:.3rem; flex-shrink:0; }
.adm-ibtn  { width:26px; height:26px; border-radius:.35rem; border:1px solid rgba(255,255,255,.08); background:transparent; color:rgba(255,255,255,.3); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:.65rem; transition:all .18s; }
.adm-ibtn.e:hover { border-color:rgba(16,185,129,.4); color:#10B981; background:rgba(16,185,129,.08); }
.adm-ibtn.d:hover { border-color:rgba(248,113,113,.4); color:#f87171; background:rgba(248,113,113,.07); }
.adm-empty { font-size:.76rem; color:rgba(255,255,255,.25); padding:.5rem 0 .875rem; font-style:italic; }

/* Edit panel */
.adm-epanel { border:1px solid rgba(16,185,129,.18); border-radius:.625rem; padding:1rem; margin-top:.5rem; background:rgba(16,185,129,.04); }
.adm-etitle { font-size:.68rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#10B981; margin-bottom:.875rem; display:flex; align-items:center; gap:.4rem; }

/* HR */
.adm-hr { border:none; border-top:1px solid rgba(255,255,255,.06); margin:.875rem 0; }

/* Login */
#adm-login { flex:1; display:flex; align-items:center; justify-content:center; flex-direction:column; padding:2rem; }
.adm-lcard { background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.09); border-radius:1rem; padding:2.25rem 2rem; width:min(400px,100%); text-align:center; }
.adm-lico  { width:52px; height:52px; border-radius:.875rem; background:rgba(16,185,129,.1); border:1px solid rgba(16,185,129,.22); display:flex; align-items:center; justify-content:center; font-size:1.3rem; color:#10B981; margin:0 auto 1.375rem; }
.adm-ltitle{ font-family:'Playfair Display',serif; font-size:1.3rem; font-weight:700; color:#e4edf6; margin-bottom:.3rem; }
.adm-lsub  { font-size:.78rem; color:rgba(255,255,255,.3); margin-bottom:1.625rem; }
.adm-lf    { margin-bottom:.625rem; text-align:left; }
.adm-lerr  { color:#f87171; font-size:.75rem; margin-bottom:.625rem; min-height:1.1em; }

/* Toast */
.adm-twrap { position:fixed; bottom:1.5rem; right:1.5rem; z-index:99999; display:flex; flex-direction:column; gap:.4rem; align-items:flex-end; pointer-events:none; }
.adm-toast { display:flex; align-items:center; gap:.55rem; padding:.6rem 1rem; border-radius:.55rem; font-family:'DM Sans',sans-serif; font-size:.78rem; font-weight:500; box-shadow:0 8px 28px rgba(0,0,0,.5); pointer-events:auto; animation:adm-tin .22s ease both; max-width:320px; }
.adm-toast.out { animation:adm-tout .22s ease both; }
@keyframes adm-tin  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes adm-tout { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(6px)} }
.adm-toast.ok   { background:#064e3b; border:1px solid rgba(16,185,129,.35); color:#6ee7b7; }
.adm-toast.err  { background:#450a0a; border:1px solid rgba(248,113,113,.3);  color:#fca5a5; }
.adm-toast.info { background:#1e3a5f; border:1px solid rgba(96,165,250,.3);   color:#93c5fd; }

/* Confirm */
#adm-confirm { position:absolute; inset:0; z-index:100; display:none; align-items:center; justify-content:center; background:rgba(3,8,18,.88); backdrop-filter:blur(6px); border-radius:1.25rem; }
#adm-confirm.on { display:flex; }
.adm-ccard { background:#0d2038; border:1px solid rgba(248,113,113,.25); border-radius:.875rem; padding:1.875rem 1.625rem; width:min(380px,90%); text-align:center; animation:adm-pop .22s ease both; }
.adm-cico  { width:44px; height:44px; border-radius:.75rem; background:rgba(248,113,113,.1); border:1px solid rgba(248,113,113,.22); display:flex; align-items:center; justify-content:center; font-size:1.1rem; color:#f87171; margin:0 auto 1rem; }
.adm-ctit  { font-size:.95rem; font-weight:700; color:#e4edf6; margin-bottom:.375rem; }
.adm-csub  { font-size:.78rem; color:rgba(255,255,255,.38); margin-bottom:1.375rem; line-height:1.6; }
.adm-cbtns { display:flex; gap:.5rem; justify-content:center; }

/* Spinner */
.adm-spin { display:inline-block; width:13px; height:13px; border:2px solid rgba(255,255,255,.18); border-top-color:#10B981; border-radius:50%; animation:adm-rot .65s linear infinite; }
@keyframes adm-rot { to{transform:rotate(360deg)} }

/* Firebase warning */
.adm-fbwarn { display:flex; align-items:flex-start; gap:.5rem; background:rgba(245,158,11,.07); border:1px solid rgba(245,158,11,.22); border-radius:.55rem; padding:.65rem .875rem; font-size:.74rem; color:rgba(245,158,11,.85); margin-bottom:.875rem; }

/* Mobile */
@media(max-width:700px){
  #adm-panel { width:99vw; height:98vh; border-radius:.75rem; }
  #adm-sidebar { width:48px; padding:.625rem .3rem; }
  .adm-nlbl,.adm-nbtn span,.adm-utxt { display:none; }
  .adm-nbtn { justify-content:center; padding:.55rem 0; }
  .adm-r2,.adm-r3 { grid-template-columns:1fr; }
  .adm-cdesc { display:none; }
}
    `;
    document.head.appendChild(s);
  }

  // ╔═══════════════════════════╗
  // ║  HTML Shell               ║
  // ╚═══════════════════════════╝
  function injectHTML() {
    const wrap = document.createElement('div');
    wrap.id = 'adm-backdrop';
    wrap.innerHTML = `
      <div id="adm-panel" role="dialog" aria-modal="true">
        <div id="adm-header">
          <div class="adm-logo"><div class="adm-logo-dot"></div><span>ESG e Tal</span></div>
          <div class="adm-chip">CMS</div>
          <div class="adm-status-bar">
            <div class="adm-sdot" id="adm-sdot"></div>
            <span class="adm-stxt" id="adm-stxt">Iniciando…</span>
          </div>
          <button class="adm-hbtn cls" id="adm-close" title="Fechar  Ctrl+Shift+A">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div id="adm-body">
          <div id="adm-sidebar">
            <div class="adm-nlbl">Conteúdo</div>
            <button class="adm-nbtn on" data-tab="news"><i class="fa-solid fa-newspaper"></i><span>Notícias</span></button>
            <button class="adm-nbtn"    data-tab="research"><i class="fa-solid fa-flask-vial"></i><span>Pesquisa</span></button>
            <button class="adm-nbtn"    data-tab="copy"><i class="fa-solid fa-pen-nib"></i><span>Textos</span></button>
            <button class="adm-nbtn"    data-tab="hero"><i class="fa-solid fa-gauge-high"></i><span>Hero Stats</span></button>
            <div class="adm-sfoot">
              <div class="adm-utxt" id="adm-uemail">—</div>
              <button class="adm-nbtn" id="adm-logout" style="color:rgba(248,113,113,.65)">
                <i class="fa-solid fa-right-from-bracket"></i><span>Sair</span>
              </button>
            </div>
          </div>
          <div id="adm-content"></div>
        </div>
        <div id="adm-confirm">
          <div class="adm-ccard">
            <div class="adm-cico"><i class="fa-solid fa-trash-can"></i></div>
            <div class="adm-ctit" id="adm-ctit">Confirmar</div>
            <div class="adm-csub" id="adm-csub">Esta ação não pode ser desfeita.</div>
            <div class="adm-cbtns">
              <button class="adm-btn adm-gho" id="adm-ccancel">Cancelar</button>
              <button class="adm-btn adm-red" id="adm-cok"><i class="fa-solid fa-trash-can"></i> Excluir</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    const tc = document.createElement('div');
    tc.className = 'adm-twrap'; tc.id = 'adm-toasts';
    document.body.appendChild(tc);
  }

  // ╔═══════════════════════════╗
  // ║  Firebase                 ║
  // ╚═══════════════════════════╝
  function initFirebase() {
    if (typeof firebase === 'undefined' || typeof firebaseConfig === 'undefined') {
      setStatus('Firebase não configurado', 'err'); return;
    }
    try {
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      S.db = firebase.database(); S.auth = firebase.auth();
      setStatus('Firebase conectado', 'ok');
      S.auth.onAuthStateChanged(u => {
        S.loggedIn = !!u;
        const el = document.getElementById('adm-uemail');
        if (el) el.textContent = u ? u.email : '—';
        renderContent();
      });
      S.db.ref(DB_ROOT).on('value', snap => {
        S.dbData = snap.val() || {};
        setStatus('Sincronizado ✓', 'ok');
        pushToSite(S.dbData);
        if (S.open) renderContent();
      });
    } catch (e) { setStatus('Erro: ' + e.message, 'err'); }
  }

  function pushToSite(d) {
    const r = window.__esgData; if (!r) return;
    ['pt', 'en'].forEach(lang => {
      if (d.news?.[lang]?.item1) Object.assign(r.ui[lang].news.item1, d.news[lang].item1);
      if (d.news?.[lang]?.item2) Object.assign(r.ui[lang].news.item2, d.news[lang].item2);
      if (d.research?.[lang]?.item1) Object.assign(r.ui[lang].research.item1, d.research[lang].item1);
      if (d.copy?.[lang]) {
        const c = d.copy[lang];
        if (c.hero) Object.assign(r.ui[lang].hero, c.hero);
        if (c.about) Object.assign(r.ui[lang].about, c.about);
        if (c.contact) Object.assign(r.ui[lang].contact, c.contact);
        if (c.footer) Object.assign(r.ui[lang].footer, c.footer);
        if (c.nav) Object.assign(r.ui[lang].nav, c.nav);
        if (c.newsNl) Object.assign(r.ui[lang].news.nl, c.newsNl);
      }
    });
    r.dynamicNewsItems = d.dynamicNews ? Object.values(d.dynamicNews).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) : [];
    r.dynamicResearchItems = d.dynamicResearch ? Object.values(d.dynamicResearch).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) : [];
    if (d.heroStats && Array.isArray(d.heroStats)) r.heroStats = d.heroStats;
  }

  // ╔═══════════════════════════╗
  // ║  UI Helpers               ║
  // ╚═══════════════════════════╝
  function setStatus(msg, type = '') {
    const dot = document.getElementById('adm-sdot'); const txt = document.getElementById('adm-stxt');
    if (dot) dot.className = 'adm-sdot ' + type;
    if (txt) { txt.textContent = msg; txt.className = 'adm-stxt ' + type; }
  }

  function toast(msg, type = 'ok', dur = 3200) {
    const tc = document.getElementById('adm-toasts'); if (!tc) return;
    const icons = { ok: 'fa-circle-check', err: 'fa-circle-xmark', info: 'fa-circle-info' };
    const t = document.createElement('div');
    t.className = 'adm-toast ' + type;
    t.innerHTML = `<i class="fa-solid ${icons[type] || icons.ok}"></i> ${esc(msg)}`;
    tc.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 240); }, dur);
  }

  function askConfirm(title, sub, cb) {
    S.confirmCb = cb;
    document.getElementById('adm-ctit').textContent = title;
    document.getElementById('adm-csub').textContent = sub || 'Esta ação não pode ser desfeita.';
    document.getElementById('adm-confirm')?.classList.add('on');
  }

  function renderContent() {
    const el = document.getElementById('adm-content'); if (!el) return;
    if (!S.loggedIn) { el.innerHTML = loginHTML(); bindLogin(); return; }
    el.innerHTML = tabHTML(); bindTab();
  }

  // ╔═══════════════════════════╗
  // ║  Login                    ║
  // ╚═══════════════════════════╝
  function loginHTML() {
    return `<div id="adm-login"><div class="adm-lcard">
      <div class="adm-lico"><i class="fa-solid fa-lock-keyhole"></i></div>
      <div class="adm-ltitle">Acesso Admin</div>
      <div class="adm-lsub">ESG e Tal CMS · Firebase Auth</div>
      <div class="adm-lf"><label class="adm-label">E-mail</label><input id="adm-email" class="adm-input" type="email" placeholder="admin@esgetal.com.br" autocomplete="email"></div>
      <div class="adm-lf"><label class="adm-label">Senha</label><input id="adm-pwd" class="adm-input" type="password" placeholder="••••••••" autocomplete="current-password"></div>
      <div class="adm-lerr" id="adm-lerr"></div>
      <button class="adm-btn adm-pri" id="adm-lbtn" style="width:100%;justify-content:center;margin-top:.25rem"><i class="fa-solid fa-right-to-bracket"></i> Entrar</button>
    </div></div>`;
  }

  function bindLogin() {
    const btn = document.getElementById('adm-lbtn'); const err = document.getElementById('adm-lerr');
    const go = async () => {
      const e = document.getElementById('adm-email')?.value.trim();
      const p = document.getElementById('adm-pwd')?.value;
      if (!e || !p) { if (err) err.textContent = 'Preencha os campos.'; return; }
      btn.disabled = true; btn.innerHTML = '<span class="adm-spin"></span> Entrando…';
      try { await S.auth.signInWithEmailAndPassword(e, p); }
      catch (ex) { if (err) err.textContent = 'Credenciais inválidas.'; btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Entrar'; }
    };
    btn?.addEventListener('click', go);
    document.getElementById('adm-pwd')?.addEventListener('keydown', ev => { if (ev.key === 'Enter') go(); });
  }

  // ╔═══════════════════════════╗
  // ║  Tab wrapper              ║
  // ╚═══════════════════════════╝
  const TAB_META = {
    news: { title: 'Notícias', desc: 'Notícias fixas + dinâmicas ilimitadas' },
    research: { title: 'Pesquisa & Estudos', desc: 'Artigo em destaque + extras' },
    copy: { title: 'Textos do Site', desc: 'Hero · Nav · About · Contato · Newsletter · Footer' },
    hero: { title: 'Hero — Estatísticas', desc: '4 badges do hero' },
  };

  function tabHTML() {
    const m = TAB_META[S.tab];
    const fbW = !S.db ? `<div class="adm-fbwarn"><i class="fa-solid fa-triangle-exclamation"></i><span>Firebase não configurado — dados não serão persistidos.</span></div>` : '';
    const hasLang = S.tab !== 'hero';
    const lgrp = hasLang ? `<div class="adm-lgrp">
      <button class="adm-lbtn ${S.editLang === 'pt' ? 'on' : ''}" data-lang="pt">PT</button>
      <button class="adm-lbtn ${S.editLang === 'en' ? 'on' : ''}" data-lang="en">EN</button>
    </div>` : '';
    return `
      <div class="adm-chdr">
        <div><div class="adm-ctitle">${m.title}</div><div class="adm-cdesc">${m.desc}</div></div>
        ${lgrp}
      </div>
      <div class="adm-scroll">
        ${fbW}
        ${S.tab === 'news' ? newsHTML() : ''}
        ${S.tab === 'research' ? resHTML() : ''}
        ${S.tab === 'copy' ? copyHTML() : ''}
        ${S.tab === 'hero' ? heroHTML() : ''}
      </div>`;
  }

  // ╔═══════════════════════════╗
  // ║  NEWS                     ║
  // ╚═══════════════════════════╝
  function newsHTML() {
    const lang = S.editLang; const r = window.__esgData;
    const n1 = r?.ui[lang]?.news?.item1 || {}, n2 = r?.ui[lang]?.news?.item2 || {};
    const dyn = dynList('dynamicNews');

    return `
      ${acc('an1', 'fa-book-open', `Notícia 1 — Livro <small>(${lang.toUpperCase()})</small>`, true, `
        <div class="adm-r2">
          <div class="adm-field"><label class="adm-label">Data</label><input class="adm-input" id="n1-date" value="${esc(n1.date)}" placeholder="dd/mm/aaaa"></div>
          <div class="adm-field"><label class="adm-label">Texto do link <small>botão de compra</small></label><input class="adm-input" id="n1-link" value="${esc(n1.link)}"></div>
        </div>
        <div class="adm-field"><label class="adm-label">Manchete</label><input class="adm-input" id="n1-headline" value="${esc(n1.headline)}"></div>
        <div class="adm-field"><label class="adm-label">Corpo §1</label><textarea class="adm-textarea" id="n1-body">${esc(n1.body)}</textarea></div>
        <div class="adm-field"><label class="adm-label">Corpo §2</label><textarea class="adm-textarea" id="n1-body2">${esc(n1.body2)}</textarea></div>
        <div class="adm-acts">
          <button class="adm-btn adm-pri" id="save-n1"><i class="fa-solid fa-cloud-arrow-up"></i> Salvar</button>
          <button class="adm-btn adm-red" id="reset-n1" title="Remove os overrides do Firebase"><i class="fa-solid fa-rotate-left"></i> Resetar</button>
        </div>
      `)}
      ${acc('an2', 'fa-award', `Notícia 2 — Prêmio <small>(${lang.toUpperCase()})</small>`, false, `
        <div class="adm-r2">
          <div class="adm-field"><label class="adm-label">Data</label><input class="adm-input" id="n2-date" value="${esc(n2.date)}"></div>
          <div class="adm-field"><label class="adm-label">Manchete</label><input class="adm-input" id="n2-headline" value="${esc(n2.headline)}"></div>
        </div>
        <div class="adm-field"><label class="adm-label">Corpo</label><textarea class="adm-textarea" id="n2-body">${esc(n2.body)}</textarea></div>
        <div class="adm-acts">
          <button class="adm-btn adm-pri" id="save-n2"><i class="fa-solid fa-cloud-arrow-up"></i> Salvar</button>
          <button class="adm-btn adm-red" id="reset-n2"><i class="fa-solid fa-rotate-left"></i> Resetar</button>
        </div>
      `)}
      ${acc('adyn', 'fa-circle-plus', 'Notícias Extras', true, `
        <div class="adm-ilist">${dynRows(dyn, lang, 'news')}</div>
        ${S.editingType === 'news' && S.editingId ? dynNewsForm(dyn.find(x => x.id === S.editingId)) : ''}
        <button class="adm-btn adm-add" id="new-news"><i class="fa-solid fa-plus"></i> Nova Notícia</button>
      `)}`;
  }

  function dynNewsForm(item) {
    const it = item || {};
    return `<div class="adm-epanel">
      <div class="adm-etitle"><i class="fa-solid fa-pen"></i> ${item ? 'Editando' : 'Nova'} Notícia</div>
      <div class="adm-r2">
        <div class="adm-field"><label class="adm-label">Data PT</label><input class="adm-input" id="dn-dpt" value="${esc(it.date?.pt)}"></div>
        <div class="adm-field"><label class="adm-label">Data EN</label><input class="adm-input" id="dn-den" value="${esc(it.date?.en)}"></div>
      </div>
      <div class="adm-field"><label class="adm-label">Manchete PT</label><input class="adm-input" id="dn-hpt" value="${esc(it.headline?.pt)}"></div>
      <div class="adm-field"><label class="adm-label">Manchete EN</label><input class="adm-input" id="dn-hen" value="${esc(it.headline?.en)}"></div>
      <div class="adm-field"><label class="adm-label">Corpo PT</label><textarea class="adm-textarea" id="dn-bpt">${esc(it.body?.pt)}</textarea></div>
      <div class="adm-field"><label class="adm-label">Corpo EN</label><textarea class="adm-textarea" id="dn-ben">${esc(it.body?.en)}</textarea></div>
      <div class="adm-r2">
        <div class="adm-field"><label class="adm-label">URL do link <small>opcional</small></label><input class="adm-input" id="dn-lurl" value="${esc(it.linkUrl)}" placeholder="https://…"></div>
        <div class="adm-field"><label class="adm-label">Texto link PT</label><input class="adm-input" id="dn-lpt" value="${esc(it.linkText?.pt)}"></div>
      </div>
      <div class="adm-field"><label class="adm-label">Texto link EN</label><input class="adm-input" id="dn-len" value="${esc(it.linkText?.en)}"></div>
      <div class="adm-acts">
        <button class="adm-btn adm-pri" id="save-dyn-news"><i class="fa-solid fa-cloud-arrow-up"></i> Salvar</button>
        <button class="adm-btn adm-gho" id="cancel-dyn-news"><i class="fa-solid fa-xmark"></i> Cancelar</button>
      </div>
    </div>`;
  }

  // ╔═══════════════════════════╗
  // ║  RESEARCH                 ║
  // ╚═══════════════════════════╝
  function resHTML() {
    const lang = S.editLang; const r = window.__esgData;
    const ri = r?.ui[lang]?.research?.item1 || {};
    const dyn = dynList('dynamicResearch');

    return `
      ${acc('ar1', 'fa-file-lines', `Artigo em Destaque <small>(${lang.toUpperCase()})</small>`, true, `
        <div class="adm-r2">
          <div class="adm-field"><label class="adm-label">Data</label><input class="adm-input" id="r1-date" value="${esc(ri.date)}"></div>
          <div class="adm-field"><label class="adm-label">Texto CTA</label><input class="adm-input" id="r1-cta" value="${esc(ri.cta)}"></div>
        </div>
        <div class="adm-field"><label class="adm-label">Manchete</label><input class="adm-input" id="r1-headline" value="${esc(ri.headline)}"></div>
        <div class="adm-field"><label class="adm-label">Autor / Descrição</label><input class="adm-input" id="r1-author" value="${esc(ri.author)}"></div>
        <div class="adm-field"><label class="adm-label">§1</label><textarea class="adm-textarea" id="r1-body1">${esc(ri.body1)}</textarea></div>
        <div class="adm-field"><label class="adm-label">§2</label><textarea class="adm-textarea" id="r1-body2">${esc(ri.body2)}</textarea></div>
        <div class="adm-field"><label class="adm-label">§3</label><textarea class="adm-textarea" id="r1-body3">${esc(ri.body3)}</textarea></div>
        <div class="adm-acts">
          <button class="adm-btn adm-pri" id="save-r1"><i class="fa-solid fa-cloud-arrow-up"></i> Salvar</button>
          <button class="adm-btn adm-red" id="reset-r1"><i class="fa-solid fa-rotate-left"></i> Resetar</button>
        </div>
      `)}
      ${acc('ares', 'fa-circle-plus', 'Artigos Extras', true, `
        <div class="adm-ilist">${dynRows(dyn, lang, 'research')}</div>
        ${S.editingType === 'research' && S.editingId ? dynResForm(dyn.find(x => x.id === S.editingId)) : ''}
        <button class="adm-btn adm-add" id="new-res"><i class="fa-solid fa-plus"></i> Novo Artigo</button>
      `)}`;
  }

  function dynResForm(item) {
    const it = item || {};
    return `<div class="adm-epanel">
      <div class="adm-etitle"><i class="fa-solid fa-pen"></i> ${item ? 'Editando' : 'Novo'} Artigo</div>
      <div class="adm-r2">
        <div class="adm-field"><label class="adm-label">Data PT</label><input class="adm-input" id="dr-dpt" value="${esc(it.date?.pt)}"></div>
        <div class="adm-field"><label class="adm-label">Data EN</label><input class="adm-input" id="dr-den" value="${esc(it.date?.en)}"></div>
      </div>
      <div class="adm-field"><label class="adm-label">Manchete PT</label><input class="adm-input" id="dr-hpt" value="${esc(it.headline?.pt)}"></div>
      <div class="adm-field"><label class="adm-label">Manchete EN</label><input class="adm-input" id="dr-hen" value="${esc(it.headline?.en)}"></div>
      <div class="adm-field"><label class="adm-label">Autor PT</label><input class="adm-input" id="dr-apt" value="${esc(it.author?.pt)}"></div>
      <div class="adm-field"><label class="adm-label">Autor EN</label><input class="adm-input" id="dr-aen" value="${esc(it.author?.en)}"></div>
      <div class="adm-field"><label class="adm-label">Corpo PT</label><textarea class="adm-textarea" id="dr-bpt">${esc(it.body?.pt)}</textarea></div>
      <div class="adm-field"><label class="adm-label">Corpo EN</label><textarea class="adm-textarea" id="dr-ben">${esc(it.body?.en)}</textarea></div>
      <div class="adm-r2">
        <div class="adm-field"><label class="adm-label">URL CTA <small>opcional</small></label><input class="adm-input" id="dr-curl" value="${esc(it.ctaUrl)}" placeholder="https://…"></div>
        <div class="adm-field"><label class="adm-label">Texto CTA PT</label><input class="adm-input" id="dr-cpt" value="${esc(it.ctaText?.pt)}"></div>
      </div>
      <div class="adm-field"><label class="adm-label">Texto CTA EN</label><input class="adm-input" id="dr-cen" value="${esc(it.ctaText?.en)}"></div>
      <div class="adm-acts">
        <button class="adm-btn adm-pri" id="save-dyn-res"><i class="fa-solid fa-cloud-arrow-up"></i> Salvar</button>
        <button class="adm-btn adm-gho" id="cancel-dyn-res"><i class="fa-solid fa-xmark"></i> Cancelar</button>
      </div>
    </div>`;
  }

  // ╔═══════════════════════════╗
  // ║  COPY                     ║
  // ╚═══════════════════════════╝
  function copyHTML() {
    const lang = S.editLang, r = window.__esgData;
    const h = r?.ui[lang]?.hero || {}, ab = r?.ui[lang]?.about || {};
    const ct = r?.ui[lang]?.contact || {}, ft = r?.ui[lang]?.footer || {};
    const nav = r?.ui[lang]?.nav || {}, nl = r?.ui[lang]?.news?.nl || {};

    return `
      ${acc('ch', 'fa-globe', `Hero — Textos <small>(${lang.toUpperCase()})</small>`, false, `
        <div class="adm-r3">
          <div class="adm-field"><label class="adm-label">Tag 1</label><input class="adm-input" id="h-t1" value="${esc(h.tag1)}"></div>
          <div class="adm-field"><label class="adm-label">Tag 2</label><input class="adm-input" id="h-t2" value="${esc(h.tag2)}"></div>
          <div class="adm-field"><label class="adm-label">Tag 3</label><input class="adm-input" id="h-t3" value="${esc(h.tag3)}"></div>
        </div>
        <div class="adm-field"><label class="adm-label">Subtítulo</label><textarea class="adm-textarea" id="h-sub">${esc(h.subtitle)}</textarea></div>
        <div class="adm-r2">
          <div class="adm-field"><label class="adm-label">Botão primário</label><input class="adm-input" id="h-cta" value="${esc(h.cta)}"></div>
          <div class="adm-field"><label class="adm-label">Botão secundário</label><input class="adm-input" id="h-ctas" value="${esc(h.ctaSub)}"></div>
        </div>
        <div class="adm-acts">
          <button class="adm-btn adm-pri" id="save-hcopy"><i class="fa-solid fa-cloud-arrow-up"></i> Salvar</button>
          <button class="adm-btn adm-red" id="reset-hcopy"><i class="fa-solid fa-rotate-left"></i> Resetar</button>
        </div>
      `)}
      ${acc('cnav', 'fa-bars', `Navegação <small>(${lang.toUpperCase()})</small>`, false, `
        <div class="adm-r3">
          <div class="adm-field"><label class="adm-label">Inicial/Home</label><input class="adm-input" id="nv-home"    value="${esc(nav.home)}"></div>
          <div class="adm-field"><label class="adm-label">Notícias</label>    <input class="adm-input" id="nv-news"    value="${esc(nav.news)}"></div>
          <div class="adm-field"><label class="adm-label">Quem Somos</label>  <input class="adm-input" id="nv-about"   value="${esc(nav.about)}"></div>
        </div>
        <div class="adm-r3">
          <div class="adm-field"><label class="adm-label">Áreas</label>       <input class="adm-input" id="nv-areas"   value="${esc(nav.areas)}"></div>
          <div class="adm-field"><label class="adm-label">Pesquisa</label>    <input class="adm-input" id="nv-res"     value="${esc(nav.research)}"></div>
          <div class="adm-field"><label class="adm-label">Contatos</label>    <input class="adm-input" id="nv-contact" value="${esc(nav.contact)}"></div>
        </div>
        <div class="adm-acts">
          <button class="adm-btn adm-pri" id="save-nav"><i class="fa-solid fa-cloud-arrow-up"></i> Salvar</button>
          <button class="adm-btn adm-red" id="reset-nav"><i class="fa-solid fa-rotate-left"></i> Resetar</button>
        </div>
      `)}
      ${acc('cab', 'fa-user-tie', `Quem Somos / About <small>(${lang.toUpperCase()})</small>`, false, `
        <div class="adm-field"><label class="adm-label">Subtítulo principal</label><input class="adm-input" id="ab-sub" value="${esc(ab.subtitle)}"></div>
        <div class="adm-field"><label class="adm-label">Citação (quote)</label><textarea class="adm-textarea" id="ab-qt">${esc(ab.quote)}</textarea></div>
        <div class="adm-r2">
          <div class="adm-field"><label class="adm-label">Autor da citação</label><input class="adm-input" id="ab-qa" value="${esc(ab.quoteAuthor)}"></div>
          <div class="adm-field"><label class="adm-label">Cargo</label><input class="adm-input" id="ab-qr" value="${esc(ab.quoteRole)}"></div>
        </div>
        <div class="adm-hr"></div>
        <div class="adm-field"><label class="adm-label">Depoimento</label><textarea class="adm-textarea" id="ab-te">${esc(ab.testimonial)}</textarea></div>
        <div class="adm-r2">
          <div class="adm-field"><label class="adm-label">Autor do depoimento</label><input class="adm-input" id="ab-ta" value="${esc(ab.testimonialAuthor)}"></div>
          <div class="adm-field"><label class="adm-label">Cargo</label><input class="adm-input" id="ab-tr" value="${esc(ab.testimonialRole)}"></div>
        </div>
        <div class="adm-acts">
          <button class="adm-btn adm-pri" id="save-about"><i class="fa-solid fa-cloud-arrow-up"></i> Salvar</button>
          <button class="adm-btn adm-red" id="reset-about"><i class="fa-solid fa-rotate-left"></i> Resetar</button>
        </div>
      `)}
      ${acc('cct', 'fa-envelope', `Contato <small>(${lang.toUpperCase()})</small>`, false, `
        <div class="adm-field"><label class="adm-label">Título</label><input class="adm-input" id="ct-title" value="${esc(ct.title)}"></div>
        <div class="adm-field"><label class="adm-label">Subtítulo</label><textarea class="adm-textarea" id="ct-sub">${esc(ct.subtitle)}</textarea></div>
        <div class="adm-field"><label class="adm-label">Corpo</label><textarea class="adm-textarea" id="ct-body">${esc(ct.body)}</textarea></div>
        <div class="adm-r2">
          <div class="adm-field"><label class="adm-label">Botão 1 (WhatsApp proposta)</label><input class="adm-input" id="ct-c1" value="${esc(ct.cta1)}"></div>
          <div class="adm-field"><label class="adm-label">Botão 2 (WhatsApp chat)</label><input class="adm-input" id="ct-c2" value="${esc(ct.cta2)}"></div>
        </div>
        <div class="adm-acts">
          <button class="adm-btn adm-pri" id="save-contact"><i class="fa-solid fa-cloud-arrow-up"></i> Salvar</button>
          <button class="adm-btn adm-red" id="reset-contact"><i class="fa-solid fa-rotate-left"></i> Resetar</button>
        </div>
      `)}
      ${acc('cnl', 'fa-paper-plane', `Newsletter <small>(${lang.toUpperCase()})</small>`, false, `
        <div class="adm-r2">
          <div class="adm-field"><label class="adm-label">Título</label><input class="adm-input" id="nl-title"  value="${esc(nl.title)}"></div>
          <div class="adm-field"><label class="adm-label">Botão inscrição</label><input class="adm-input" id="nl-btn" value="${esc(nl.btn)}"></div>
        </div>
        <div class="adm-field"><label class="adm-label">Subtítulo</label><textarea class="adm-textarea" id="nl-sub">${esc(nl.subtitle)}</textarea></div>
        <div class="adm-r2">
          <div class="adm-field"><label class="adm-label">Placeholder nome</label><input class="adm-input" id="nl-namePh"  value="${esc(nl.namePh)}"></div>
          <div class="adm-field"><label class="adm-label">Placeholder e-mail</label><input class="adm-input" id="nl-emailPh" value="${esc(nl.emailPh)}"></div>
        </div>
        <div class="adm-r2">
          <div class="adm-field"><label class="adm-label">Mensagem sucesso</label><input class="adm-input" id="nl-ok"   value="${esc(nl.ok)}"></div>
          <div class="adm-field"><label class="adm-label">Disclaimer</label><input class="adm-input" id="nl-disc" value="${esc(nl.disclaimer)}"></div>
        </div>
        <div class="adm-acts">
          <button class="adm-btn adm-pri" id="save-nl"><i class="fa-solid fa-cloud-arrow-up"></i> Salvar</button>
          <button class="adm-btn adm-red" id="reset-nl"><i class="fa-solid fa-rotate-left"></i> Resetar</button>
        </div>
      `)}
      ${acc('cft', 'fa-shoe-prints', `Footer <small>(${lang.toUpperCase()})</small>`, false, `
        <div class="adm-r2">
          <div class="adm-field"><label class="adm-label">Tagline</label><input class="adm-input" id="ft-tag"    value="${esc(ft.tagline)}"></div>
          <div class="adm-field"><label class="adm-label">Copyright / Rights</label><input class="adm-input" id="ft-rights" value="${esc(ft.rights)}"></div>
        </div>
        <div class="adm-acts">
          <button class="adm-btn adm-pri" id="save-footer"><i class="fa-solid fa-cloud-arrow-up"></i> Salvar</button>
          <button class="adm-btn adm-red" id="reset-footer"><i class="fa-solid fa-rotate-left"></i> Resetar</button>
        </div>
      `)}`;
  }

  // ╔═══════════════════════════╗
  // ║  HERO STATS               ║
  // ╚═══════════════════════════╝
  function heroHTML() {
    const def = [
      { value: '4', label_pt: 'Áreas de Atuação', label_en: 'Areas of Expertise' },
      { value: '60h+', label_pt: 'Horas de Diálogos', label_en: 'Hours of Dialogues' },
      { value: 'GRI', label_pt: 'Padrão Internacional', label_en: 'International Standard' },
      { value: 'ESG', label_pt: '100% Transparência', label_en: 'Full Transparency' },
    ];
    const st = (S.dbData?.heroStats && Array.isArray(S.dbData.heroStats)) ? S.dbData.heroStats : def;
    const rows = st.map((s, i) => `
      <div class="adm-acc" style="margin-bottom:.5rem">
        <div class="adm-ahdr on" onclick="this.classList.toggle('on');this.nextElementSibling.classList.toggle('on')">
          <div class="adm-aico"><span style="font-family:'Playfair Display',serif;font-weight:700;font-size:.88rem">${esc(s.value)}</span></div>
          <span class="adm-atitle">Stat ${i + 1}</span>
          <i class="fa-solid fa-chevron-down adm-achev"></i>
        </div>
        <div class="adm-abody on" style="padding:.875rem">
          <div class="adm-r3">
            <div class="adm-field"><label class="adm-label">Valor</label><input class="adm-input sv" data-i="${i}" value="${esc(s.value)}"></div>
            <div class="adm-field"><label class="adm-label">Label PT</label><input class="adm-input slp" data-i="${i}" value="${esc(s.label_pt)}"></div>
            <div class="adm-field"><label class="adm-label">Label EN</label><input class="adm-input sle" data-i="${i}" value="${esc(s.label_en)}"></div>
          </div>
        </div>
      </div>`).join('');
    return `${rows}
      <div class="adm-acts" style="margin-top:.25rem">
        <button class="adm-btn adm-pri" id="save-stats"><i class="fa-solid fa-cloud-arrow-up"></i> Salvar Stats</button>
        <button class="adm-btn adm-red" id="reset-stats"><i class="fa-solid fa-rotate-left"></i> Resetar</button>
      </div>`;
  }

  // ╔═══════════════════════════╗
  // ║  Accordion helper         ║
  // ╚═══════════════════════════╝
  function acc(id, icon, titleHTML, openByDefault, body) {
    const oc = openByDefault ? 'on' : '';
    return `<div class="adm-acc" id="${id}">
      <div class="adm-ahdr ${oc}" onclick="this.classList.toggle('on');this.nextElementSibling.classList.toggle('on')">
        <div class="adm-aico"><i class="fa-solid ${icon}"></i></div>
        <span class="adm-atitle">${titleHTML}</span>
        <i class="fa-solid fa-chevron-down adm-achev"></i>
      </div>
      <div class="adm-abody ${oc}">${body}</div>
    </div>`;
  }

  // ╔═══════════════════════════╗
  // ║  Dynamic list helpers     ║
  // ╚═══════════════════════════╝
  function dynList(key) {
    const raw = S.dbData?.[key];
    return raw ? Object.values(raw).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) : [];
  }

  function dynRows(items, lang, type) {
    if (!items.length) return `<div class="adm-empty">Nenhum item ainda. Clique em "+" para adicionar.</div>`;
    return items.map(it => {
      const sel = S.editingType === type && S.editingId === it.id ? 'on' : '';
      const icon = type === 'news' ? 'fa-rss' : 'fa-file-lines';
      return `<div class="adm-irow ${sel}">
        <div class="adm-iico"><i class="fa-solid ${icon}"></i></div>
        <div class="adm-imeta" data-edit="${type}:${it.id}">
          <div class="adm-ihl">${esc(it.headline?.[lang] || it.headline?.pt || '(sem título)')}</div>
          <div class="adm-idt">${esc(it.date?.[lang] || it.date?.pt || '')}</div>
        </div>
        <div class="adm-ibts">
          <button class="adm-ibtn e" data-edit="${type}:${it.id}" title="Editar"><i class="fa-solid fa-pen"></i></button>
          <button class="adm-ibtn d" data-del="${type}:${it.id}"  title="Excluir"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </div>`;
    }).join('');
  }

  // ╔═══════════════════════════╗
  // ║  Bind tab events          ║
  // ╚═══════════════════════════╝
  function bindTab() {
    // lang toggle
    document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => {
      S.editLang = b.dataset.lang; renderContent();
    }));

    // edit/delete dynamic rows
    document.querySelectorAll('[data-edit]').forEach(el => el.addEventListener('click', e => {
      e.stopPropagation();
      const [type, id] = el.dataset.edit.split(':');
      S.editingType = type; S.editingId = id; renderContent();
    }));
    document.querySelectorAll('[data-del]').forEach(el => el.addEventListener('click', e => {
      e.stopPropagation();
      const [type, id] = el.dataset.del.split(':');
      const label = type === 'news' ? 'notícia' : 'artigo';
      askConfirm(`Excluir este ${label}?`, 'Remove permanentemente do banco de dados.', async () => {
        const path = type === 'news' ? `${DB_ROOT}/dynamicNews/${id}` : `${DB_ROOT}/dynamicResearch/${id}`;
        await fbDel(path, `${label.charAt(0).toUpperCase() + label.slice(1)} excluído`);
        if (S.editingId === id) { S.editingId = null; S.editingType = null; }
      });
    }));

    if (S.tab === 'news') {
      on('save-n1', () => fbUpd(`${DB_ROOT}/news/${S.editLang}/item1`, fields({ date: 'n1-date', headline: 'n1-headline', link: 'n1-link', body: 'n1-body', body2: 'n1-body2' }), 'save-n1', 'Notícia 1 salva'));
      on('reset-n1', () => askConfirm('Resetar Notícia 1?', 'Remove overrides e exibe o texto padrão do código.', () => fbDel(`${DB_ROOT}/news/${S.editLang}/item1`, 'Notícia 1 resetada')));
      on('save-n2', () => fbUpd(`${DB_ROOT}/news/${S.editLang}/item2`, fields({ date: 'n2-date', headline: 'n2-headline', body: 'n2-body' }), 'save-n2', 'Notícia 2 salva'));
      on('reset-n2', () => askConfirm('Resetar Notícia 2?', '', () => fbDel(`${DB_ROOT}/news/${S.editLang}/item2`, 'Notícia 2 resetada')));
      on('new-news', () => { S.editingType = 'news'; S.editingId = newId(); renderContent(); });
      on('cancel-dyn-news', () => { S.editingType = null; S.editingId = null; renderContent(); });
      on('save-dyn-news', () => {
        const id = S.editingId; if (!id) return;
        const p = { id, date: { pt: v('dn-dpt'), en: v('dn-den') }, headline: { pt: v('dn-hpt'), en: v('dn-hen') }, body: { pt: v('dn-bpt'), en: v('dn-ben') }, linkUrl: v('dn-lurl'), linkText: { pt: v('dn-lpt'), en: v('dn-len') }, createdAt: S.dbData?.dynamicNews?.[id]?.createdAt || Date.now() };
        fbSet(`${DB_ROOT}/dynamicNews/${id}`, p, 'save-dyn-news', 'Notícia salva', () => { S.editingId = null; S.editingType = null; });
      });
    }

    if (S.tab === 'research') {
      on('save-r1', () => fbUpd(`${DB_ROOT}/research/${S.editLang}/item1`, fields({ date: 'r1-date', headline: 'r1-headline', author: 'r1-author', cta: 'r1-cta', body1: 'r1-body1', body2: 'r1-body2', body3: 'r1-body3' }), 'save-r1', 'Artigo salvo'));
      on('reset-r1', () => askConfirm('Resetar artigo em destaque?', '', () => fbDel(`${DB_ROOT}/research/${S.editLang}/item1`, 'Artigo resetado')));
      on('new-res', () => { S.editingType = 'research'; S.editingId = newId(); renderContent(); });
      on('cancel-dyn-res', () => { S.editingType = null; S.editingId = null; renderContent(); });
      on('save-dyn-res', () => {
        const id = S.editingId; if (!id) return;
        const p = { id, date: { pt: v('dr-dpt'), en: v('dr-den') }, headline: { pt: v('dr-hpt'), en: v('dr-hen') }, author: { pt: v('dr-apt'), en: v('dr-aen') }, body: { pt: v('dr-bpt'), en: v('dr-ben') }, ctaUrl: v('dr-curl'), ctaText: { pt: v('dr-cpt'), en: v('dr-cen') }, createdAt: S.dbData?.dynamicResearch?.[id]?.createdAt || Date.now() };
        fbSet(`${DB_ROOT}/dynamicResearch/${id}`, p, 'save-dyn-res', 'Artigo salvo', () => { S.editingId = null; S.editingType = null; });
      });
    }

    if (S.tab === 'copy') {
      const l = S.editLang;
      on('save-hcopy', () => fbUpd(`${DB_ROOT}/copy/${l}/hero`, fields({ tag1: 'h-t1', tag2: 'h-t2', tag3: 'h-t3', subtitle: 'h-sub', cta: 'h-cta', ctaSub: 'h-ctas' }), 'save-hcopy', 'Hero salvo'));
      on('reset-hcopy', () => askConfirm('Resetar Hero?', '', () => fbDel(`${DB_ROOT}/copy/${l}/hero`, 'Hero resetado')));
      on('save-nav', () => fbUpd(`${DB_ROOT}/copy/${l}/nav`, fields({ home: 'nv-home', news: 'nv-news', about: 'nv-about', areas: 'nv-areas', research: 'nv-res', contact: 'nv-contact' }), 'save-nav', 'Nav salva'));
      on('reset-nav', () => askConfirm('Resetar navegação?', '', () => fbDel(`${DB_ROOT}/copy/${l}/nav`, 'Nav resetada')));
      on('save-about', () => fbUpd(`${DB_ROOT}/copy/${l}/about`, fields({ subtitle: 'ab-sub', quote: 'ab-qt', quoteAuthor: 'ab-qa', quoteRole: 'ab-qr', testimonial: 'ab-te', testimonialAuthor: 'ab-ta', testimonialRole: 'ab-tr' }), 'save-about', 'About salvo'));
      on('reset-about', () => askConfirm('Resetar About?', '', () => fbDel(`${DB_ROOT}/copy/${l}/about`, 'About resetado')));
      on('save-contact', () => fbUpd(`${DB_ROOT}/copy/${l}/contact`, fields({ title: 'ct-title', subtitle: 'ct-sub', body: 'ct-body', cta1: 'ct-c1', cta2: 'ct-c2' }), 'save-contact', 'Contato salvo'));
      on('reset-contact', () => askConfirm('Resetar Contato?', '', () => fbDel(`${DB_ROOT}/copy/${l}/contact`, 'Contato resetado')));
      on('save-nl', () => fbUpd(`${DB_ROOT}/copy/${l}/newsNl`, fields({ title: 'nl-title', subtitle: 'nl-sub', namePh: 'nl-namePh', emailPh: 'nl-emailPh', btn: 'nl-btn', ok: 'nl-ok', disclaimer: 'nl-disc' }), 'save-nl', 'Newsletter salva'));
      on('reset-nl', () => askConfirm('Resetar Newsletter?', '', () => fbDel(`${DB_ROOT}/copy/${l}/newsNl`, 'Newsletter resetada')));
      on('save-footer', () => fbUpd(`${DB_ROOT}/copy/${l}/footer`, fields({ tagline: 'ft-tag', rights: 'ft-rights' }), 'save-footer', 'Footer salvo'));
      on('reset-footer', () => askConfirm('Resetar Footer?', '', () => fbDel(`${DB_ROOT}/copy/${l}/footer`, 'Footer resetado')));
    }

    if (S.tab === 'hero') {
      on('save-stats', () => {
        const def = [{ value: '4', label_pt: 'Áreas de Atuação', label_en: 'Areas of Expertise' }, { value: '60h+', label_pt: 'Horas de Diálogos', label_en: 'Hours of Dialogues' }, { value: 'GRI', label_pt: 'Padrão Internacional', label_en: 'International Standard' }, { value: 'ESG', label_pt: '100% Transparência', label_en: 'Full Transparency' }];
        const st = (S.dbData?.heroStats && Array.isArray(S.dbData.heroStats)) ? JSON.parse(JSON.stringify(S.dbData.heroStats)) : JSON.parse(JSON.stringify(def));
        document.querySelectorAll('.sv').forEach(el => { const i = +el.dataset.i; if (st[i]) st[i].value = el.value; });
        document.querySelectorAll('.slp').forEach(el => { const i = +el.dataset.i; if (st[i]) st[i].label_pt = el.value; });
        document.querySelectorAll('.sle').forEach(el => { const i = +el.dataset.i; if (st[i]) st[i].label_en = el.value; });
        fbSet(`${DB_ROOT}/heroStats`, st, 'save-stats', 'Stats salvos');
      });
      on('reset-stats', () => askConfirm('Resetar Hero Stats?', 'Remove os overrides e exibe os valores padrão.', () => fbDel(`${DB_ROOT}/heroStats`, 'Stats resetadas')));
    }
  }

  // ╔═══════════════════════════╗
  // ║  Firebase ops             ║
  // ╚═══════════════════════════╝
  async function fbUpd(path, data, btnId, msg) {
    const b = document.getElementById(btnId), orig = b?.innerHTML;
    if (b) { b.disabled = true; b.innerHTML = '<span class="adm-spin"></span> Salvando…'; }
    try {
      if (S.db) await S.db.ref(path).update(data);
      else pushToSite({ [path.split('/')[1]]: data });
      toast(msg || 'Salvo ✓', 'ok'); setStatus(msg || 'Salvo ✓', 'ok');
    } catch (e) { toast('Erro: ' + e.message, 'err'); setStatus('Erro', 'err'); }
    finally { if (b) { b.disabled = false; b.innerHTML = orig; } }
  }

  async function fbSet(path, data, btnId, msg, cb) {
    const b = document.getElementById(btnId), orig = b?.innerHTML;
    if (b) { b.disabled = true; b.innerHTML = '<span class="adm-spin"></span> Salvando…'; }
    try {
      if (S.db) await S.db.ref(path).set(data);
      toast(msg || 'Salvo ✓', 'ok'); setStatus(msg || 'Salvo ✓', 'ok');
      if (cb) cb(); else renderContent();
    } catch (e) { toast('Erro: ' + e.message, 'err'); if (b) { b.disabled = false; b.innerHTML = orig; } }
  }

  async function fbDel(path, msg, cb) {
    try {
      if (S.db) await S.db.ref(path).remove();
      toast(msg || 'Removido ✓', 'info'); setStatus(msg || 'Removido', 'info');
      if (cb) cb();
    } catch (e) { toast('Erro: ' + e.message, 'err'); }
  }

  // ╔═══════════════════════════╗
  // ║  Global events            ║
  // ╚═══════════════════════════╝
  function bindGlobal() {
    document.getElementById('adm-close')?.addEventListener('click', toggle);
    document.getElementById('adm-backdrop')?.addEventListener('click', e => { if (e.target.id === 'adm-backdrop') toggle(); });

    document.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => {
      S.tab = btn.dataset.tab; S.editingId = null; S.editingType = null;
      document.querySelectorAll('.adm-nbtn').forEach(b => b.classList.remove('on'));
      btn.classList.add('on'); renderContent();
    }));

    document.getElementById('adm-logout')?.addEventListener('click', async () => {
      await S.auth?.signOut(); toast('Sessão encerrada', 'info');
    });

    // Confirm modal
    document.getElementById('adm-cok')?.addEventListener('click', () => {
      document.getElementById('adm-confirm')?.classList.remove('on');
      S.confirmCb?.(); S.confirmCb = null;
    });
    document.getElementById('adm-ccancel')?.addEventListener('click', () => {
      document.getElementById('adm-confirm')?.classList.remove('on');
      S.confirmCb = null;
    });

    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') { e.preventDefault(); toggle(); }
      if (e.key === 'Escape' && S.open) toggle();
    });
  }

  // ╔═══════════════════════════╗
  // ║  Utils                    ║
  // ╚═══════════════════════════╝
  const v = id => document.getElementById(id)?.value.trim() || '';
  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const on = (id, fn) => document.getElementById(id)?.addEventListener('click', fn);
  const fields = map => { const o = {}; for (const [k, id] of Object.entries(map)) o[k] = v(id); return o; };
  const newId = () => 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

  function toggle() {
    S.open = !S.open;
    document.getElementById('adm-backdrop')?.classList.toggle('adm-open', S.open);
    if (S.open) { S.editingId = null; S.editingType = null; renderContent(); }
  }

  // ╔═══════════════════════════╗
  // ║  Boot                     ║
  // ╚═══════════════════════════╝
  function boot() { injectCSS(); injectHTML(); bindGlobal(); setTimeout(initFirebase, 350); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();