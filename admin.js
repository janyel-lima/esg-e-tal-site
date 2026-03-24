// ─────────────────────────────────────────────────────────────────────────────
//  admin.js  —  ESG e Tal CMS
//  Ativar painel: Ctrl + Shift + A
// ─────────────────────────────────────────────────────────────────────────────

(function () {
    'use strict';

    // ── Constants ──────────────────────────────────────────────────────────────
    const DB_ROOT = 'siteContent';
    const TRIGGER = { ctrl: true, shift: true, key: 'A' };

    // ── State ──────────────────────────────────────────────────────────────────
    const S = {
        open: false,
        loggedIn: false,
        tab: 'news',       // 'news' | 'research' | 'hero'
        editLang: 'pt',    // 'pt' | 'en'
        saving: false,
        status: '',
        firebase: null,
        db: null,
        auth: null,
        dbData: null,
        editingItemId: null,
    };

    // ── Inject CSS ─────────────────────────────────────────────────────────────
    function injectCSS() {
        const s = document.createElement('style');
        s.id = 'adm-styles';
        s.textContent = `
      /* ── Admin overlay ── */
      #adm-backdrop {
        position: fixed; inset: 0; z-index: 9990;
        background: rgba(4, 9, 18, 0.88);
        backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
        display: none; align-items: center; justify-content: center;
        font-family: 'DM Sans', sans-serif;
      }
      #adm-backdrop.adm-open { display: flex; }

      #adm-panel {
        background: #071524;
        border: 1px solid rgba(16,185,129,0.22);
        border-radius: 1.375rem;
        width: min(1160px, 96vw);
        height: min(780px, 94vh);
        display: flex; flex-direction: column;
        overflow: hidden;
        box-shadow: 0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(16,185,129,0.07);
        animation: adm-pop 0.28s cubic-bezier(.34,1.2,.64,1) both;
      }
      @keyframes adm-pop {
        from { opacity: 0; transform: scale(.93) translateY(14px); }
        to   { opacity: 1; transform: scale(1)  translateY(0); }
      }

      /* ── Header ── */
      #adm-header {
        display: flex; align-items: center; gap: 1rem;
        padding: .95rem 1.5rem;
        border-bottom: 1px solid rgba(255,255,255,.065);
        flex-shrink: 0;
        background: rgba(255,255,255,.02);
      }
      .adm-logo {
        display: flex; align-items: center; gap: .55rem;
        font-family: 'Playfair Display', serif;
        font-size: 1.05rem; font-weight: 700; color: #e4edf6;
        letter-spacing: -.01em; flex-shrink: 0;
      }
      .adm-logo-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: #10B981;
        box-shadow: 0 0 8px rgba(16,185,129,.8);
        animation: adm-pulse 2.2s ease-in-out infinite;
      }
      @keyframes adm-pulse {
        0%,100% { box-shadow: 0 0 6px rgba(16,185,129,.7); }
        50%      { box-shadow: 0 0 14px rgba(16,185,129,1); }
      }
      .adm-badge {
        padding: .18rem .6rem; border-radius: 99px;
        background: rgba(16,185,129,.12); border: 1px solid rgba(16,185,129,.28);
        color: #10B981; font-size: .68rem; font-weight: 700; letter-spacing: .1em;
        text-transform: uppercase;
      }
      .adm-status {
        margin-left: auto; font-size: .76rem; color: rgba(255,255,255,.36);
        min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        max-width: 260px;
      }
      .adm-status.ok   { color: #10B981; }
      .adm-status.err  { color: #f87171; }
      .adm-status.info { color: #60a5fa; }

      .adm-icon-btn {
        width: 32px; height: 32px; border-radius: .5rem; border: 1px solid rgba(255,255,255,.1);
        background: transparent; color: rgba(255,255,255,.5); cursor: pointer;
        display: flex; align-items: center; justify-content: center; font-size: .8rem;
        transition: all .2s; flex-shrink: 0;
      }
      .adm-icon-btn:hover { border-color: rgba(255,255,255,.25); color: #fff; background: rgba(255,255,255,.06); }
      .adm-icon-btn.danger:hover { border-color: #f87171; color: #f87171; }

      /* ── Body ── */
      #adm-body { display: flex; flex: 1; min-height: 0; }

      /* ── Sidebar ── */
      #adm-sidebar {
        width: 200px; flex-shrink: 0;
        border-right: 1px solid rgba(255,255,255,.065);
        display: flex; flex-direction: column;
        padding: 1rem .75rem; gap: .25rem;
        background: rgba(255,255,255,.015);
      }
      .adm-sidebar-lbl {
        font-size: .62rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
        color: rgba(255,255,255,.22); padding: .4rem .5rem .2rem; margin-top: .4rem;
      }
      .adm-tab-btn {
        display: flex; align-items: center; gap: .6rem;
        padding: .6rem .75rem; border-radius: .625rem; border: none;
        background: transparent; color: rgba(255,255,255,.45);
        font-size: .82rem; font-weight: 500; cursor: pointer;
        transition: all .2s; font-family: 'DM Sans', sans-serif;
        text-align: left; width: 100%;
      }
      .adm-tab-btn i { font-size: .8rem; width: 16px; text-align: center; }
      .adm-tab-btn:hover { background: rgba(255,255,255,.06); color: rgba(255,255,255,.75); }
      .adm-tab-btn.active {
        background: rgba(16,185,129,.12); color: #10B981;
        border: 1px solid rgba(16,185,129,.2);
      }
      .adm-tab-btn.active i { color: #10B981; }
      .adm-sidebar-footer { margin-top: auto; padding-top: .75rem; border-top: 1px solid rgba(255,255,255,.065); }
      .adm-user-info {
        font-size: .72rem; color: rgba(255,255,255,.3); padding: .4rem .5rem;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }

      /* ── Content area ── */
      #adm-content { flex: 1; min-width: 0; display: flex; flex-direction: column; }
      .adm-content-header {
        padding: 1.1rem 1.5rem .85rem;
        border-bottom: 1px solid rgba(255,255,255,.065);
        display: flex; align-items: center; gap: 1rem; flex-shrink: 0;
      }
      .adm-content-title {
        font-family: 'Playfair Display', serif;
        font-size: 1.1rem; font-weight: 700; color: #e4edf6;
      }
      .adm-lang-toggle {
        display: flex; gap: .25rem; margin-left: auto;
      }
      .adm-lang-btn {
        padding: .25rem .6rem; border-radius: .375rem; border: 1px solid rgba(255,255,255,.1);
        background: transparent; color: rgba(255,255,255,.4); font-size: .72rem; font-weight: 600;
        cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s;
        text-transform: uppercase; letter-spacing: .06em;
      }
      .adm-lang-btn.active { background: rgba(16,185,129,.15); border-color: rgba(16,185,129,.35); color: #10B981; }

      .adm-scroll { flex: 1; overflow-y: auto; padding: 1.25rem 1.5rem; }
      .adm-scroll::-webkit-scrollbar { width: 4px; }
      .adm-scroll::-webkit-scrollbar-track { background: transparent; }
      .adm-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 99px; }

      /* ── Items list ── */
      .adm-items-list { display: flex; flex-direction: column; gap: .5rem; margin-bottom: 1.5rem; }
      .adm-item-row {
        display: flex; align-items: center; gap: .75rem;
        padding: .75rem 1rem; border-radius: .625rem;
        border: 1px solid rgba(255,255,255,.07);
        background: rgba(255,255,255,.03); cursor: pointer;
        transition: all .2s;
      }
      .adm-item-row:hover { border-color: rgba(255,255,255,.14); background: rgba(255,255,255,.055); }
      .adm-item-row.selected { border-color: rgba(16,185,129,.35); background: rgba(16,185,129,.06); }
      .adm-item-row-icon {
        width: 34px; height: 34px; border-radius: .5rem; flex-shrink: 0;
        background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.2);
        display: flex; align-items: center; justify-content: center;
        font-size: .78rem; color: #10B981;
      }
      .adm-item-row-meta { flex: 1; min-width: 0; }
      .adm-item-row-hl { font-size: .82rem; font-weight: 600; color: rgba(255,255,255,.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .adm-item-row-date { font-size: .7rem; color: rgba(255,255,255,.3); margin-top: .1rem; }
      .adm-item-row-del {
        width: 28px; height: 28px; border-radius: .4rem; border: 1px solid rgba(255,255,255,.08);
        background: transparent; color: rgba(255,255,255,.25); cursor: pointer;
        display: flex; align-items: center; justify-content: center; font-size: .7rem;
        transition: all .2s; flex-shrink: 0;
      }
      .adm-item-row-del:hover { border-color: rgba(248,113,113,.4); color: #f87171; background: rgba(248,113,113,.08); }

      /* ── Form ── */
      .adm-form-section {
        background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.075);
        border-radius: .875rem; padding: 1.25rem 1.25rem 1rem; margin-bottom: 1rem;
      }
      .adm-form-section-title {
        font-size: .7rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
        color: #10B981; margin-bottom: .875rem;
        display: flex; align-items: center; gap: .4rem;
      }
      .adm-field { margin-bottom: .875rem; }
      .adm-label {
        display: block; font-size: .72rem; font-weight: 600; color: rgba(255,255,255,.4);
        margin-bottom: .3rem; letter-spacing: .04em;
      }
      .adm-input, .adm-textarea {
        width: 100%; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1);
        border-radius: .5rem; color: rgba(255,255,255,.85); font-family: 'DM Sans', sans-serif;
        font-size: .83rem; line-height: 1.5; padding: .55rem .75rem;
        transition: border-color .2s, background .2s;
        outline: none;
      }
      .adm-input::placeholder, .adm-textarea::placeholder { color: rgba(255,255,255,.18); }
      .adm-input:focus, .adm-textarea:focus {
        border-color: rgba(16,185,129,.5); background: rgba(16,185,129,.04);
      }
      .adm-textarea { resize: vertical; min-height: 72px; }

      /* ── Buttons ── */
      .adm-btn {
        display: inline-flex; align-items: center; gap: .4rem;
        padding: .55rem 1.2rem; border-radius: .5rem; border: none;
        font-family: 'DM Sans', sans-serif; font-size: .8rem; font-weight: 600;
        cursor: pointer; transition: all .2s;
      }
      .adm-btn-primary { background: #10B981; color: #fff; }
      .adm-btn-primary:hover { background: #059669; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,.35); }
      .adm-btn-primary:disabled { background: rgba(16,185,129,.35); cursor: not-allowed; transform: none; box-shadow: none; }
      .adm-btn-ghost { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); color: rgba(255,255,255,.65); }
      .adm-btn-ghost:hover { background: rgba(255,255,255,.1); color: #fff; }
      .adm-btn-add { background: rgba(16,185,129,.1); border: 1px dashed rgba(16,185,129,.4); color: #10B981; width: 100%; justify-content: center; padding: .65rem; border-radius: .625rem; }
      .adm-btn-add:hover { background: rgba(16,185,129,.18); }

      .adm-actions { display: flex; gap: .5rem; padding-top: .75rem; flex-wrap: wrap; }

      /* ── Login ── */
      #adm-login {
        flex: 1; display: flex; align-items: center; justify-content: center;
        flex-direction: column; padding: 2rem;
      }
      .adm-login-card {
        background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.1);
        border-radius: 1rem; padding: 2.5rem 2rem; width: min(400px, 100%);
        text-align: center;
      }
      .adm-login-icon {
        width: 56px; height: 56px; border-radius: 1rem;
        background: rgba(16,185,129,.12); border: 1px solid rgba(16,185,129,.25);
        display: flex; align-items: center; justify-content: center;
        font-size: 1.4rem; color: #10B981; margin: 0 auto 1.5rem;
      }
      .adm-login-title {
        font-family: 'Playfair Display', serif; font-size: 1.35rem; font-weight: 700;
        color: #e4edf6; margin-bottom: .4rem;
      }
      .adm-login-sub { font-size: .82rem; color: rgba(255,255,255,.35); margin-bottom: 1.75rem; }
      .adm-login-field { margin-bottom: .75rem; text-align: left; }
      .adm-login-error { color: #f87171; font-size: .78rem; margin-bottom: .75rem; min-height: 1.2em; }

      /* ── Loading ── */
      .adm-loading {
        display: inline-block; width: 14px; height: 14px;
        border: 2px solid rgba(255,255,255,.2); border-top-color: #10B981;
        border-radius: 50%; animation: adm-spin .7s linear infinite;
      }
      @keyframes adm-spin { to { transform: rotate(360deg); } }

      /* ── Firebase offline notice ── */
      .adm-fb-notice {
        background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.25);
        border-radius: .625rem; padding: .75rem 1rem;
        font-size: .78rem; color: rgba(245,158,11,.9);
        margin-bottom: 1rem; display: flex; align-items: flex-start; gap: .5rem;
      }

      /* ── Separator ── */
      .adm-sep { border: none; border-top: 1px solid rgba(255,255,255,.065); margin: 1rem 0; }

      /* ── Two-col row ── */
      .adm-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }

      /* ── Mobile ── */
      @media (max-width: 680px) {
        #adm-panel { width: 99vw; height: 98vh; border-radius: .75rem; }
        #adm-sidebar { width: 52px; padding: .75rem .35rem; }
        .adm-sidebar-lbl, .adm-tab-btn span, .adm-user-info { display: none; }
        .adm-tab-btn { justify-content: center; }
        .adm-row-2 { grid-template-columns: 1fr; }
      }
    `;
        document.head.appendChild(s);
    }

    // ── Inject HTML ─────────────────────────────────────────────────────────────
    function injectHTML() {
        const el = document.createElement('div');
        el.id = 'adm-backdrop';
        el.innerHTML = `
      <div id="adm-panel" role="dialog" aria-modal="true" aria-label="Painel Admin ESG e Tal">
        <!-- Header -->
        <div id="adm-header">
          <div class="adm-logo">
            <div class="adm-logo-dot"></div>
            <span>ESG e Tal</span>
          </div>
          <div class="adm-badge">Admin CMS</div>
          <span id="adm-status" class="adm-status">Aguardando Firebase…</span>
          <button class="adm-icon-btn" id="adm-close-btn" title="Fechar (Ctrl+Shift+A)">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Body -->
        <div id="adm-body">
          <!-- Sidebar -->
          <div id="adm-sidebar">
            <div class="adm-sidebar-lbl">Conteúdo</div>
            <button class="adm-tab-btn active" data-tab="news">
              <i class="fa-solid fa-newspaper"></i><span>Notícias</span>
            </button>
            <button class="adm-tab-btn" data-tab="research">
              <i class="fa-solid fa-flask"></i><span>Pesquisa</span>
            </button>
            <button class="adm-tab-btn" data-tab="hero">
              <i class="fa-solid fa-chart-bar"></i><span>Hero Stats</span>
            </button>

            <div class="adm-sidebar-footer">
              <div class="adm-user-info" id="adm-user-email">Não autenticado</div>
              <button class="adm-tab-btn" id="adm-logout-btn" style="color:rgba(248,113,113,.7)">
                <i class="fa-solid fa-right-from-bracket"></i><span>Sair</span>
              </button>
            </div>
          </div>

          <!-- Main content -->
          <div id="adm-content">
            <!-- Will be rendered by renderContent() -->
          </div>
        </div>
      </div>
    `;
        document.body.appendChild(el);
    }

    // ── Firebase ─────────────────────────────────────────────────────────────────
    function initFirebase() {
        if (typeof firebase === 'undefined' || typeof firebaseConfig === 'undefined') {
            setStatus('Firebase não configurado. Edite firebase-config.js', 'err');
            return;
        }
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            S.db = firebase.database();
            S.auth = firebase.auth();
            setStatus('Firebase conectado', 'ok');

            // Auth state
            S.auth.onAuthStateChanged(user => {
                S.loggedIn = !!user;
                const emailEl = document.getElementById('adm-user-email');
                if (emailEl) emailEl.textContent = user ? user.email : 'Não autenticado';
                renderContent();
            });

            // Real-time data listener
            S.db.ref(DB_ROOT).on('value', snap => {
                S.dbData = snap.val() || {};
                setStatus('Dados sincronizados ✓', 'ok');
                pushToSite(S.dbData);
                if (S.open) renderContent();
            });
        } catch (e) {
            setStatus('Erro Firebase: ' + e.message, 'err');
        }
    }

    // ── Push Firebase data to the Alpine.js site ────────────────────────────────
    function pushToSite(data) {
        const root = window.__esgData;
        if (!root) return;

        // News items (existing)
        if (data.news) {
            ['pt', 'en'].forEach(lang => {
                if (data.news[lang]) {
                    const src = data.news[lang];
                    if (src.item1) Object.assign(root.ui[lang].news.item1, src.item1);
                    if (src.item2) Object.assign(root.ui[lang].news.item2, src.item2);
                }
            });
        }

        // Dynamic extra news items
        if (data.dynamicNews) {
            root.dynamicNewsItems = Object.values(data.dynamicNews)
                .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        } else {
            root.dynamicNewsItems = [];
        }

        // Research items
        if (data.research) {
            ['pt', 'en'].forEach(lang => {
                if (data.research[lang] && data.research[lang].item1) {
                    Object.assign(root.ui[lang].research.item1, data.research[lang].item1);
                }
            });
        }

        // Dynamic research
        if (data.dynamicResearch) {
            root.dynamicResearchItems = Object.values(data.dynamicResearch)
                .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        } else {
            root.dynamicResearchItems = [];
        }

        // Hero stats
        if (data.heroStats) {
            root.heroStats = data.heroStats;
        }
    }

    // ── UI Helpers ───────────────────────────────────────────────────────────────
    function setStatus(msg, type = '') {
        const el = document.getElementById('adm-status');
        if (!el) return;
        el.textContent = msg;
        el.className = 'adm-status ' + type;
    }

    function renderContent() {
        const el = document.getElementById('adm-content');
        if (!el) return;
        if (!S.loggedIn) {
            el.innerHTML = renderLoginHTML();
            bindLogin();
            return;
        }
        el.innerHTML = renderTabContentHTML();
        bindTabContent();
    }

    // ── Login ────────────────────────────────────────────────────────────────────
    function renderLoginHTML() {
        return `
      <div id="adm-login">
        <div class="adm-login-card">
          <div class="adm-login-icon"><i class="fa-solid fa-lock"></i></div>
          <div class="adm-login-title">Acesso Administrativo</div>
          <div class="adm-login-sub">ESG e Tal CMS · Autenticação Firebase</div>
          <div class="adm-login-field">
            <label class="adm-label">E-mail</label>
            <input id="adm-email" class="adm-input" type="email" placeholder="admin@esgetal.com.br" autocomplete="email">
          </div>
          <div class="adm-login-field">
            <label class="adm-label">Senha</label>
            <input id="adm-pwd" class="adm-input" type="password" placeholder="••••••••" autocomplete="current-password">
          </div>
          <div class="adm-login-error" id="adm-login-err"></div>
          <button class="adm-btn adm-btn-primary" id="adm-login-btn" style="width:100%;justify-content:center">
            <i class="fa-solid fa-right-to-bracket"></i> Entrar
          </button>
        </div>
      </div>`;
    }

    function bindLogin() {
        const btn = document.getElementById('adm-login-btn');
        const errEl = document.getElementById('adm-login-err');
        const doLogin = async () => {
            const email = document.getElementById('adm-email')?.value.trim();
            const pwd = document.getElementById('adm-pwd')?.value;
            if (!email || !pwd) { if (errEl) errEl.textContent = 'Preencha e-mail e senha.'; return; }
            btn.disabled = true;
            btn.innerHTML = '<span class="adm-loading"></span> Entrando…';
            try {
                await S.auth.signInWithEmailAndPassword(email, pwd);
                if (errEl) errEl.textContent = '';
            } catch (e) {
                if (errEl) errEl.textContent = 'Credenciais inválidas.';
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Entrar';
            }
        };
        btn?.addEventListener('click', doLogin);
        document.getElementById('adm-pwd')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    }

    // ── Tab content ──────────────────────────────────────────────────────────────
    function renderTabContentHTML() {
        const headerMap = {
            news: { icon: 'fa-newspaper', title: 'Gerenciar Notícias' },
            research: { icon: 'fa-flask', title: 'Gerenciar Pesquisa & Estudos' },
            hero: { icon: 'fa-chart-bar', title: 'Hero — Estatísticas' },
        };
        const h = headerMap[S.tab];
        const fbOK = !!S.db;
        const notice = !fbOK ? `<div class="adm-fb-notice"><i class="fa-solid fa-triangle-exclamation"></i><span>Firebase não configurado — edite <code>firebase-config.js</code> para persistir dados.</span></div>` : '';

        return `
      <div class="adm-content-header">
        <i class="fa-solid ${h.icon}" style="color:#10B981;font-size:.95rem"></i>
        <span class="adm-content-title">${h.title}</span>
        <div class="adm-lang-toggle">
          <button class="adm-lang-btn ${S.editLang === 'pt' ? 'active' : ''}" data-editlang="pt">PT</button>
          <button class="adm-lang-btn ${S.editLang === 'en' ? 'active' : ''}" data-editlang="en">EN</button>
        </div>
      </div>
      <div class="adm-scroll">
        ${notice}
        ${S.tab === 'news' ? renderNewsTab() : ''}
        ${S.tab === 'research' ? renderResearchTab() : ''}
        ${S.tab === 'hero' ? renderHeroTab() : ''}
      </div>`;
    }

    // ── News Tab ─────────────────────────────────────────────────────────────────
    function renderNewsTab() {
        const site = window.__esgData;
        const lang = S.editLang;
        const ni1 = site?.ui[lang]?.news?.item1 || {};
        const ni2 = site?.ui[lang]?.news?.item2 || {};
        const dyn = S.dbData?.dynamicNews ? Object.values(S.dbData.dynamicNews) : [];

        const dynRows = dyn.map((item, idx) => `
      <div class="adm-item-row ${S.editingItemId === item.id ? 'selected' : ''}" data-dynid="${item.id}">
        <div class="adm-item-row-icon"><i class="fa-solid fa-rss"></i></div>
        <div class="adm-item-row-meta">
          <div class="adm-item-row-hl">${escHtml(item.headline?.[lang] || item.headline?.pt || '(sem título)')}</div>
          <div class="adm-item-row-date">${escHtml(item.date?.[lang] || item.date?.pt || '')}</div>
        </div>
        <button class="adm-item-row-del" data-del-dynid="${item.id}" title="Excluir">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>`).join('');

        return `
      <!-- Existing item 1 -->
      <div class="adm-form-section">
        <div class="adm-form-section-title"><i class="fa-solid fa-book-open"></i> Notícia 1 — Livro (${lang.toUpperCase()})</div>
        <div class="adm-row-2">
          <div class="adm-field">
            <label class="adm-label">Data</label>
            <input class="adm-input" id="n1-date" value="${escHtml(ni1.date || '')}" placeholder="dd/mm/aaaa">
          </div>
        </div>
        <div class="adm-field">
          <label class="adm-label">Manchete</label>
          <input class="adm-input" id="n1-headline" value="${escHtml(ni1.headline || '')}" placeholder="Título da notícia">
        </div>
        <div class="adm-field">
          <label class="adm-label">Texto do link principal</label>
          <input class="adm-input" id="n1-link" value="${escHtml(ni1.link || '')}" placeholder="Texto do link">
        </div>
        <div class="adm-field">
          <label class="adm-label">Corpo (§1)</label>
          <textarea class="adm-textarea" id="n1-body">${escHtml(ni1.body || '')}</textarea>
        </div>
        <div class="adm-field">
          <label class="adm-label">Corpo (§2)</label>
          <textarea class="adm-textarea" id="n1-body2">${escHtml(ni1.body2 || '')}</textarea>
        </div>
        <div class="adm-actions">
          <button class="adm-btn adm-btn-primary" id="save-n1"><i class="fa-solid fa-cloud-arrow-up"></i> Salvar</button>
        </div>
      </div>

      <!-- Existing item 2 -->
      <div class="adm-form-section">
        <div class="adm-form-section-title"><i class="fa-solid fa-award"></i> Notícia 2 — Prêmio (${lang.toUpperCase()})</div>
        <div class="adm-row-2">
          <div class="adm-field">
            <label class="adm-label">Data</label>
            <input class="adm-input" id="n2-date" value="${escHtml(ni2.date || '')}" placeholder="dd/mm/aaaa">
          </div>
        </div>
        <div class="adm-field">
          <label class="adm-label">Manchete</label>
          <input class="adm-input" id="n2-headline" value="${escHtml(ni2.headline || '')}" placeholder="Título da notícia">
        </div>
        <div class="adm-field">
          <label class="adm-label">Corpo</label>
          <textarea class="adm-textarea" id="n2-body">${escHtml(ni2.body || '')}</textarea>
        </div>
        <div class="adm-actions">
          <button class="adm-btn adm-btn-primary" id="save-n2"><i class="fa-solid fa-cloud-arrow-up"></i> Salvar</button>
        </div>
      </div>

      <!-- Dynamic items -->
      <div class="adm-form-section">
        <div class="adm-form-section-title"><i class="fa-solid fa-circle-plus"></i> Notícias Extras (dinâmicas)</div>
        <div class="adm-items-list">${dynRows || '<div style="font-size:.8rem;color:rgba(255,255,255,.3);padding:.5rem 0">Nenhuma notícia extra ainda.</div>'}</div>
        <button class="adm-btn adm-btn-add" id="new-dyn-news"><i class="fa-solid fa-plus"></i> Adicionar Notícia</button>

        <!-- Editing a dynamic item -->
        <div id="dyn-news-form" style="${S.editingItemId ? '' : 'display:none'}; margin-top:1rem;">
          <hr class="adm-sep">
          <div class="adm-form-section-title"><i class="fa-solid fa-pen"></i> Editando (${lang.toUpperCase()})</div>
          <div class="adm-row-2">
            <div class="adm-field">
              <label class="adm-label">Data PT</label>
              <input class="adm-input" id="dyn-date-pt" value="${escHtml(getDynField('date.pt'))}">
            </div>
            <div class="adm-field">
              <label class="adm-label">Data EN</label>
              <input class="adm-input" id="dyn-date-en" value="${escHtml(getDynField('date.en'))}">
            </div>
          </div>
          <div class="adm-field">
            <label class="adm-label">Manchete PT</label>
            <input class="adm-input" id="dyn-headline-pt" value="${escHtml(getDynField('headline.pt'))}">
          </div>
          <div class="adm-field">
            <label class="adm-label">Manchete EN</label>
            <input class="adm-input" id="dyn-headline-en" value="${escHtml(getDynField('headline.en'))}">
          </div>
          <div class="adm-field">
            <label class="adm-label">Corpo PT</label>
            <textarea class="adm-textarea" id="dyn-body-pt">${escHtml(getDynField('body.pt'))}</textarea>
          </div>
          <div class="adm-field">
            <label class="adm-label">Corpo EN</label>
            <textarea class="adm-textarea" id="dyn-body-en">${escHtml(getDynField('body.en'))}</textarea>
          </div>
          <div class="adm-field">
            <label class="adm-label">URL do Link (opcional)</label>
            <input class="adm-input" id="dyn-link-url" value="${escHtml(getDynField('linkUrl'))}">
          </div>
          <div class="adm-row-2">
            <div class="adm-field">
              <label class="adm-label">Texto do Link PT</label>
              <input class="adm-input" id="dyn-link-pt" value="${escHtml(getDynField('linkText.pt'))}">
            </div>
            <div class="adm-field">
              <label class="adm-label">Texto do Link EN</label>
              <input class="adm-input" id="dyn-link-en" value="${escHtml(getDynField('linkText.en'))}">
            </div>
          </div>
          <div class="adm-actions">
            <button class="adm-btn adm-btn-primary" id="save-dyn-news"><i class="fa-solid fa-cloud-arrow-up"></i> Salvar Notícia</button>
            <button class="adm-btn adm-btn-ghost" id="cancel-dyn-news"><i class="fa-solid fa-xmark"></i> Cancelar</button>
          </div>
        </div>
      </div>`;
    }

    // ── Research Tab ─────────────────────────────────────────────────────────────
    function renderResearchTab() {
        const site = window.__esgData;
        const lang = S.editLang;
        const ri = site?.ui[lang]?.research?.item1 || {};

        return `
      <div class="adm-form-section">
        <div class="adm-form-section-title"><i class="fa-solid fa-file-lines"></i> Artigo em Destaque (${lang.toUpperCase()})</div>
        <div class="adm-row-2">
          <div class="adm-field">
            <label class="adm-label">Data</label>
            <input class="adm-input" id="r1-date" value="${escHtml(ri.date || '')}" placeholder="dd/mm/aaaa">
          </div>
        </div>
        <div class="adm-field">
          <label class="adm-label">Manchete</label>
          <input class="adm-input" id="r1-headline" value="${escHtml(ri.headline || '')}">
        </div>
        <div class="adm-field">
          <label class="adm-label">Autor</label>
          <input class="adm-input" id="r1-author" value="${escHtml(ri.author || '')}">
        </div>
        <div class="adm-field">
          <label class="adm-label">Texto do botão CTA</label>
          <input class="adm-input" id="r1-cta" value="${escHtml(ri.cta || '')}">
        </div>
        <div class="adm-field">
          <label class="adm-label">Parágrafo 1</label>
          <textarea class="adm-textarea" id="r1-body1">${escHtml(ri.body1 || '')}</textarea>
        </div>
        <div class="adm-field">
          <label class="adm-label">Parágrafo 2</label>
          <textarea class="adm-textarea" id="r1-body2">${escHtml(ri.body2 || '')}</textarea>
        </div>
        <div class="adm-field">
          <label class="adm-label">Parágrafo 3</label>
          <textarea class="adm-textarea" id="r1-body3">${escHtml(ri.body3 || '')}</textarea>
        </div>
        <div class="adm-actions">
          <button class="adm-btn adm-btn-primary" id="save-r1"><i class="fa-solid fa-cloud-arrow-up"></i> Salvar Artigo</button>
        </div>
      </div>

      <!-- Add more research items -->
      <div class="adm-form-section">
        <div class="adm-form-section-title"><i class="fa-solid fa-circle-plus"></i> Artigos Extras (dinâmicos)</div>
        ${renderDynResearchList()}
        <button class="adm-btn adm-btn-add" id="new-dyn-research"><i class="fa-solid fa-plus"></i> Adicionar Artigo</button>
        <div id="dyn-research-form" style="display:none;margin-top:1rem">
          <hr class="adm-sep">
          <div class="adm-form-section-title"><i class="fa-solid fa-pen"></i> Novo Artigo</div>
          <div class="adm-row-2">
            <div class="adm-field"><label class="adm-label">Data PT</label><input class="adm-input" id="dr-date-pt"></div>
            <div class="adm-field"><label class="adm-label">Data EN</label><input class="adm-input" id="dr-date-en"></div>
          </div>
          <div class="adm-field"><label class="adm-label">Manchete PT</label><input class="adm-input" id="dr-headline-pt"></div>
          <div class="adm-field"><label class="adm-label">Manchete EN</label><input class="adm-input" id="dr-headline-en"></div>
          <div class="adm-field"><label class="adm-label">Autor PT</label><input class="adm-input" id="dr-author-pt"></div>
          <div class="adm-field"><label class="adm-label">Autor EN</label><input class="adm-input" id="dr-author-en"></div>
          <div class="adm-field"><label class="adm-label">Corpo PT</label><textarea class="adm-textarea" id="dr-body-pt"></textarea></div>
          <div class="adm-field"><label class="adm-label">Corpo EN</label><textarea class="adm-textarea" id="dr-body-en"></textarea></div>
          <div class="adm-field"><label class="adm-label">URL do Link CTA</label><input class="adm-input" id="dr-cta-url"></div>
          <div class="adm-row-2">
            <div class="adm-field"><label class="adm-label">Texto CTA PT</label><input class="adm-input" id="dr-cta-pt"></div>
            <div class="adm-field"><label class="adm-label">Texto CTA EN</label><input class="adm-input" id="dr-cta-en"></div>
          </div>
          <div class="adm-actions">
            <button class="adm-btn adm-btn-primary" id="save-dyn-research"><i class="fa-solid fa-cloud-arrow-up"></i> Salvar</button>
            <button class="adm-btn adm-btn-ghost" id="cancel-dyn-research"><i class="fa-solid fa-xmark"></i> Cancelar</button>
          </div>
        </div>
      </div>`;
    }

    function renderDynResearchList() {
        const lang = S.editLang;
        const dyn = S.dbData?.dynamicResearch ? Object.values(S.dbData.dynamicResearch) : [];
        if (!dyn.length) return '<div style="font-size:.8rem;color:rgba(255,255,255,.3);padding:.5rem 0;margin-bottom:.75rem">Nenhum artigo extra ainda.</div>';
        return dyn.map(item => `
      <div class="adm-item-row" style="margin-bottom:.5rem">
        <div class="adm-item-row-icon"><i class="fa-solid fa-file-lines"></i></div>
        <div class="adm-item-row-meta">
          <div class="adm-item-row-hl">${escHtml(item.headline?.[lang] || item.headline?.pt || '(sem título)')}</div>
          <div class="adm-item-row-date">${escHtml(item.date?.[lang] || item.date?.pt || '')}</div>
        </div>
        <button class="adm-item-row-del" data-del-resid="${item.id}" title="Excluir">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>`).join('');
    }

    // ── Hero Tab ──────────────────────────────────────────────────────────────────
    function renderHeroTab() {
        const lang = S.editLang;
        const defaultStats = [
            { value: '4', label_pt: 'Áreas de Atuação', label_en: 'Areas of Expertise' },
            { value: '60h+', label_pt: 'Horas de Diálogos', label_en: 'Hours of Dialogues' },
            { value: 'GRI', label_pt: 'Padrão Internacional', label_en: 'International Standard' },
            { value: 'ESG', label_pt: '100% Transparência', label_en: 'Full Transparency' },
        ];
        const stats = (S.dbData?.heroStats && Array.isArray(S.dbData.heroStats)) ? S.dbData.heroStats : defaultStats;

        const rows = stats.map((st, i) => `
      <div class="adm-form-section" style="margin-bottom:.75rem">
        <div class="adm-form-section-title"><i class="fa-solid fa-hashtag"></i> Stat ${i + 1}</div>
        <div class="adm-row-2">
          <div class="adm-field">
            <label class="adm-label">Valor (número/texto)</label>
            <input class="adm-input stat-value" data-idx="${i}" value="${escHtml(st.value || '')}">
          </div>
          <div class="adm-field">
            <label class="adm-label">Label PT</label>
            <input class="adm-input stat-label-pt" data-idx="${i}" value="${escHtml(st.label_pt || '')}">
          </div>
        </div>
        <div class="adm-field">
          <label class="adm-label">Label EN</label>
          <input class="adm-input stat-label-en" data-idx="${i}" value="${escHtml(st.label_en || '')}">
        </div>
      </div>`).join('');

        return `
      ${rows}
      <div class="adm-actions">
        <button class="adm-btn adm-btn-primary" id="save-hero-stats"><i class="fa-solid fa-cloud-arrow-up"></i> Salvar Estatísticas</button>
      </div>`;
    }

    // ── Dynamic item helpers ─────────────────────────────────────────────────────
    function getDynField(path) {
        if (!S.editingItemId || !S.dbData?.dynamicNews) return '';
        const item = S.dbData.dynamicNews[S.editingItemId];
        if (!item) return '';
        const keys = path.split('.');
        let v = item;
        for (const k of keys) v = v?.[k];
        return v || '';
    }

    function newId() {
        return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }

    // ── Bind tab events ──────────────────────────────────────────────────────────
    function bindTabContent() {
        // Lang toggle
        document.querySelectorAll('[data-editlang]').forEach(btn => {
            btn.addEventListener('click', () => {
                S.editLang = btn.dataset.editlang;
                renderContent();
            });
        });

        // Save News 1
        document.getElementById('save-n1')?.addEventListener('click', async () => {
            const lang = S.editLang;
            const payload = {
                date: val('n1-date'),
                headline: val('n1-headline'),
                link: val('n1-link'),
                body: val('n1-body'),
                body2: val('n1-body2'),
            };
            await saveToFB(`${DB_ROOT}/news/${lang}/item1`, payload, 'save-n1');
        });

        // Save News 2
        document.getElementById('save-n2')?.addEventListener('click', async () => {
            const lang = S.editLang;
            const payload = {
                date: val('n2-date'),
                headline: val('n2-headline'),
                body: val('n2-body'),
            };
            await saveToFB(`${DB_ROOT}/news/${lang}/item2`, payload, 'save-n2');
        });

        // New dyn news
        document.getElementById('new-dyn-news')?.addEventListener('click', () => {
            S.editingItemId = newId();
            renderContent();
        });

        // Select existing dyn news
        document.querySelectorAll('[data-dynid]').forEach(row => {
            row.addEventListener('click', () => {
                S.editingItemId = row.dataset.dynid;
                renderContent();
            });
        });

        // Delete dyn news
        document.querySelectorAll('[data-del-dynid]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!confirm('Excluir esta notícia?')) return;
                const id = btn.dataset.delDynid;
                if (S.db) await S.db.ref(`${DB_ROOT}/dynamicNews/${id}`).remove();
                if (S.editingItemId === id) S.editingItemId = null;
            });
        });

        // Delete dyn research
        document.querySelectorAll('[data-del-resid]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!confirm('Excluir este artigo?')) return;
                const id = btn.dataset.delResid;
                if (S.db) await S.db.ref(`${DB_ROOT}/dynamicResearch/${id}`).remove();
            });
        });

        // Save dyn news
        document.getElementById('save-dyn-news')?.addEventListener('click', async () => {
            const id = S.editingItemId;
            if (!id) return;
            const payload = {
                id,
                date: { pt: val('dyn-date-pt'), en: val('dyn-date-en') },
                headline: { pt: val('dyn-headline-pt'), en: val('dyn-headline-en') },
                body: { pt: val('dyn-body-pt'), en: val('dyn-body-en') },
                linkUrl: val('dyn-link-url'),
                linkText: { pt: val('dyn-link-pt'), en: val('dyn-link-en') },
                createdAt: S.dbData?.dynamicNews?.[id]?.createdAt || Date.now(),
            };
            await saveToFB(`${DB_ROOT}/dynamicNews/${id}`, payload, 'save-dyn-news');
            S.editingItemId = null;
            renderContent();
        });

        // Cancel dyn news
        document.getElementById('cancel-dyn-news')?.addEventListener('click', () => {
            S.editingItemId = null;
            renderContent();
        });

        // Research item 1
        document.getElementById('save-r1')?.addEventListener('click', async () => {
            const lang = S.editLang;
            const payload = {
                date: val('r1-date'),
                headline: val('r1-headline'),
                author: val('r1-author'),
                cta: val('r1-cta'),
                body1: val('r1-body1'),
                body2: val('r1-body2'),
                body3: val('r1-body3'),
            };
            await saveToFB(`${DB_ROOT}/research/${lang}/item1`, payload, 'save-r1');
        });

        // New dyn research
        document.getElementById('new-dyn-research')?.addEventListener('click', () => {
            document.getElementById('dyn-research-form').style.display = '';
        });
        document.getElementById('cancel-dyn-research')?.addEventListener('click', () => {
            document.getElementById('dyn-research-form').style.display = 'none';
        });
        document.getElementById('save-dyn-research')?.addEventListener('click', async () => {
            const id = newId();
            const payload = {
                id,
                date: { pt: val('dr-date-pt'), en: val('dr-date-en') },
                headline: { pt: val('dr-headline-pt'), en: val('dr-headline-en') },
                author: { pt: val('dr-author-pt'), en: val('dr-author-en') },
                body: { pt: val('dr-body-pt'), en: val('dr-body-en') },
                ctaUrl: val('dr-cta-url'),
                ctaText: { pt: val('dr-cta-pt'), en: val('dr-cta-en') },
                createdAt: Date.now(),
            };
            await saveToFB(`${DB_ROOT}/dynamicResearch/${id}`, payload, 'save-dyn-research');
            document.getElementById('dyn-research-form').style.display = 'none';
        });

        // Hero stats
        document.getElementById('save-hero-stats')?.addEventListener('click', async () => {
            const defaultStats = [
                { value: '4', label_pt: 'Áreas de Atuação', label_en: 'Areas of Expertise' },
                { value: '60h+', label_pt: 'Horas de Diálogos', label_en: 'Hours of Dialogues' },
                { value: 'GRI', label_pt: 'Padrão Internacional', label_en: 'International Standard' },
                { value: 'ESG', label_pt: '100% Transparência', label_en: 'Full Transparency' },
            ];
            const stats = (S.dbData?.heroStats && Array.isArray(S.dbData.heroStats))
                ? [...S.dbData.heroStats] : [...defaultStats];
            document.querySelectorAll('.stat-value').forEach(el => {
                const i = parseInt(el.dataset.idx);
                if (stats[i]) stats[i].value = el.value;
            });
            document.querySelectorAll('.stat-label-pt').forEach(el => {
                const i = parseInt(el.dataset.idx);
                if (stats[i]) stats[i].label_pt = el.value;
            });
            document.querySelectorAll('.stat-label-en').forEach(el => {
                const i = parseInt(el.dataset.idx);
                if (stats[i]) stats[i].label_en = el.value;
            });
            await saveToFB(`${DB_ROOT}/heroStats`, stats, 'save-hero-stats');
        });
    }

    // ── Firebase save helper ─────────────────────────────────────────────────────
    async function saveToFB(path, data, btnId) {
        const btn = document.getElementById(btnId);
        const orig = btn?.innerHTML;
        if (btn) { btn.disabled = true; btn.innerHTML = '<span class="adm-loading"></span> Salvando…'; }
        try {
            if (S.db) {
                await S.db.ref(path).update(data);
                setStatus('Salvo com sucesso ✓', 'ok');
            } else {
                // No Firebase — update Alpine.js directly only
                pushToSite({ [path.split('/')[1]]: data });
                setStatus('Salvo localmente (sem Firebase)', 'info');
            }
        } catch (e) {
            setStatus('Erro ao salvar: ' + e.message, 'err');
        } finally {
            if (btn) { btn.disabled = false; btn.innerHTML = orig; }
        }
    }

    // ── Utils ────────────────────────────────────────────────────────────────────
    function val(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }
    function escHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ── Bind global events ────────────────────────────────────────────────────────
    function bindEvents() {
        // Close button
        document.getElementById('adm-close-btn')?.addEventListener('click', toggle);

        // Close on backdrop click
        document.getElementById('adm-backdrop')?.addEventListener('click', e => {
            if (e.target.id === 'adm-backdrop') toggle();
        });

        // Sidebar tabs
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                S.tab = btn.dataset.tab;
                S.editingItemId = null;
                document.querySelectorAll('.adm-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderContent();
            });
        });

        // Logout
        document.getElementById('adm-logout-btn')?.addEventListener('click', async () => {
            await S.auth?.signOut();
        });

        // Keyboard shortcut
        document.addEventListener('keydown', e => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                toggle();
            }
            if (e.key === 'Escape' && S.open) toggle();
        });
    }

    // ── Toggle ───────────────────────────────────────────────────────────────────
    function toggle() {
        S.open = !S.open;
        const backdrop = document.getElementById('adm-backdrop');
        backdrop?.classList.toggle('adm-open', S.open);
        if (S.open) renderContent();
    }

    // ── Boot ─────────────────────────────────────────────────────────────────────
    function boot() {
        injectCSS();
        injectHTML();
        bindEvents();
        // Slight delay to let Alpine.js init
        setTimeout(initFirebase, 300);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();