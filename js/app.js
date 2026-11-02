// バスケ道場 アプリ本体
(() => {
  'use strict';

  const $app = document.getElementById('app');

  // ===== 定数 =====
  const STAT_INFO = {
    shoot: { name: 'シュート', short: 'シュート' },
    dribble: { name: 'ドリブル', short: 'ドリブル' },
    pass: { name: 'パス', short: 'パス' },
    defense: { name: 'ディフェンス', short: 'DF' },
    physical: { name: 'フィジカル', short: 'フィジカル' },
    iq: { name: 'バスケIQ', short: 'IQ' },
  };

  const LEAGUES = [
    { id: 'B2', name: 'B2', desc: '用語・ルール・ファウルの基本' },
    { id: 'B1', name: 'B1', desc: 'せめと守りの基本戦じゅつ' },
    { id: 'BP', name: 'Bプレ', desc: 'ピック&ロール・ゾーン・試合の判だん' },
  ];
  const PREV_LEAGUE = { B1: 'B2', BP: 'B1' };

  const LEVEL_NAMES = { 1: 'きほん', 2: 'ステップアップ', 3: 'チャレンジ' };

  // 技：ステータス（表示の数字）が条件をこえると使えるようになる
  const SKILLS = [
    { id: 'jumpshot', name: 'ジャンプシュート', req: { shoot: 5 } },
    { id: 'cross', name: 'クロスオーバー', req: { dribble: 5 } },
    { id: 'bounce', name: 'バウンズパス', req: { pass: 5 } },
    { id: 'boxout', name: 'ボックスアウト', req: { physical: 8 } },
    { id: 'legthru', name: 'レッグスルー', req: { dribble: 10 } },
    { id: 'steal', name: 'スティール', req: { defense: 10 } },
    { id: 'three', name: '3ポイントシュート', req: { shoot: 15 } },
    { id: 'behind', name: 'ビハインドザバック', req: { dribble: 20 } },
    { id: 'nolook', name: 'ノールックパス', req: { pass: 15, iq: 15 } },
    { id: 'floater', name: 'フローター', req: { shoot: 20, iq: 10 } },
    { id: 'euro', name: 'ユーロステップ', req: { dribble: 20, physical: 15 } },
    { id: 'stepback', name: 'ステップバック3P', req: { dribble: 25, shoot: 25 } },
  ];

  const BADGES = [
    { id: 'first_quiz', icon: '📝', name: 'はじめてのクイズ' },
    { id: 'first_drill', icon: '👟', name: 'はじめての練習' },
    { id: 'mission', icon: '✅', name: 'ミッション達成' },
    { id: 'perfect', icon: '💯', name: '全問せいかい' },
    { id: 'streak3', icon: '🔥', name: '3日れんぞく' },
    { id: 'streak7', icon: '🔥', name: '7日れんぞく' },
    { id: 'streak30', icon: '🌋', name: '30日れんぞく' },
    { id: 'drill10', icon: '🏅', name: '練習10回' },
    { id: 'drill50', icon: '🥇', name: '練習50回' },
    { id: 'drill100', icon: '👑', name: '練習100回' },
    { id: 'b2clear', icon: '🔷', name: 'B2クリア' },
    { id: 'b1clear', icon: '🔶', name: 'B1クリア' },
    { id: 'bpclear', icon: '🏆', name: 'Bプレクリア' },
    { id: 'solve100', icon: '📚', name: '100問せいかい' },
    { id: 'solveall', icon: '🎓', name: '全問制覇' },
  ];

  const AVATARS = ['🏀', '⛹️', '🦁', '🐯', '🦅', '🐺', '🔥', '⚡', '🐉', '🦈'];

  const XP_CORRECT = 10;
  const XP_REVIEW = 5;
  const XP_STAR = 10;
  const XP_MISSION = 30;
  const XP_DRILL_AGAIN = 5;
  const MISSION_QUIZ = 5;

  // 画面で使う線のアイコン
  const ICON = {
    quiz: '<svg viewBox="0 0 32 32"><rect x="5" y="4" width="22" height="24" rx="3"/><path d="M10 10l5 5M15 10l-5 5"/><circle cx="21" cy="21" r="3"/><path d="M13 21h4" stroke-dasharray="2 2"/></svg>',
    drill: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11"/><path d="M5 16h22M16 5v22M8.5 8.5c4 4 4 11 0 15M23.5 8.5c-4 4-4 11 0 15"/></svg>',
    record: '<svg viewBox="0 0 32 32"><path d="M5 27h22"/><rect x="8" y="16" width="4" height="11"/><rect x="14" y="10" width="4" height="17"/><rect x="20" y="5" width="4" height="22"/></svg>',
    setting: '<svg viewBox="0 0 32 32"><path d="M6 9h20M6 16h20M6 23h20"/><circle cx="12" cy="9" r="2.5"/><circle cx="21" cy="16" r="2.5"/><circle cx="10" cy="23" r="2.5"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  };

  // ===== 小さな道具 =====
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const fmtDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => fmtDate(new Date());
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const sum = a => a.reduce((x, y) => x + y, 0);

  // レベルLになるのに必要な合計XP：0, 50, 150, 300, 500, ...
  const xpForLevel = L => 25 * (L - 1) * L;
  const levelOf = xp => { let L = 1; while (xp >= xpForLevel(L + 1)) L++; return L; };
  const titleOf = L => L >= 20 ? 'レジェンド' : L >= 15 ? 'キャプテン' : L >= 10 ? 'エース' : L >= 5 ? 'スターター' : 'ルーキー';

  // ステータスの表示の数字（1〜99）
  const statVal = (p, k) => Math.min(99, 1 + Math.floor(p.stats[k] / 2));
  const overall = p => Math.round(sum(Store.STAT_KEYS.map(k => statVal(p, k))) / Store.STAT_KEYS.length);
  const threeRate = p => Math.round(20 + statVal(p, 'shoot') * 0.3);

  const ruleTag = r => r === 'mini' ? '<span class="tag tag-mini">ミニバス</span>'
    : r === 'general' ? '<span class="tag tag-gen">中学・一般</span>' : '';

  const stars = n => `<span class="stars" aria-label="星${n}つ">${[1, 2, 3].map(i => `<i class="${i <= n ? 'on' : ''}">★</i>`).join('')}</span>`;

  // ===== おいわい（レベルアップなど）の表示 =====
  const celebrateQueue = [];
  function celebrate(item) {
    celebrateQueue.push(item);
    if (celebrateQueue.length === 1) showCelebrate();
  }
  function showCelebrate() {
    const item = celebrateQueue[0];
    if (!item) return;
    const el = document.createElement('div');
    el.className = 'overlay';
    el.innerHTML = `<div class="celebrate" role="dialog" aria-modal="true">
      <div class="cel-emoji">${item.emoji}</div>
      <h2>${esc(item.title)}</h2>
      <p>${esc(item.text || '')}</p>
      <button class="btn btn-led wide">やったー！</button>
    </div>`;
    el.querySelector('button').addEventListener('click', () => {
      el.remove();
      celebrateQueue.shift();
      showCelebrate();
    });
    document.body.appendChild(el);
    el.querySelector('button').focus();
    Sound.fanfare();
  }

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._id);
    toast._id = setTimeout(() => t.classList.remove('show'), 2400);
  }

  // ===== 音 =====
  const Sound = (() => {
    let ctx = null;
    function ensure() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      }
      if (ctx && ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function beep(freq = 880, dur = 0.15, when = 0) {
      const c = ensure();
      if (!c) return;
      const o = c.createOscillator();
      const g = c.createGain();
      o.frequency.value = freq;
      o.type = 'sine';
      g.gain.setValueAtTime(0.25, c.currentTime + when);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + when + dur);
      o.connect(g).connect(c.destination);
      o.start(c.currentTime + when);
      o.stop(c.currentTime + when + dur);
    }
    function buzzer() {
      const c = ensure();
      if (!c) return;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'square';
      o.frequency.value = 180;
      g.gain.setValueAtTime(0.12, c.currentTime);
      g.gain.setValueAtTime(0.001, c.currentTime + 0.7);
      o.connect(g).connect(c.destination);
      o.start();
      o.stop(c.currentTime + 0.7);
    }
    function fanfare() { [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.18, i * 0.12)); }
    function good() { beep(880, 0.12); beep(1175, 0.18, 0.1); }
    function bad() { beep(220, 0.25); }
    function say(text) {
      try {
        if (!window.speechSynthesis) return;
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ja-JP';
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
      } catch (e) { /* 読み上げできない端末はなにもしない */ }
    }
    return { ensure, beep, buzzer, fanfare, good, bad, say };
  })();

  // ===== 記録の更新 =====
  function ensureDaily(p) {
    if (p.daily.date !== today()) p.daily = { date: today(), quiz: 0, drill: 0, done: false };
  }

  function markActive(p) {
    const t = today();
    if (!p.days.includes(t)) {
      p.days.push(t);
      if (p.days.length > 400) p.days = p.days.slice(-400);
    }
  }

  function streakOf(p) {
    const set = new Set(p.days);
    const d = new Date();
    if (!set.has(fmtDate(d))) d.setDate(d.getDate() - 1);
    let n = 0;
    while (set.has(fmtDate(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  function addXP(p, n) {
    const before = levelOf(p.xp);
    p.xp += n;
    const after = levelOf(p.xp);
    if (after > before) {
      const newTitle = titleOf(after) !== titleOf(before);
      celebrate({ emoji: '⬆️', title: `レベルアップ！ Lv${after}`, text: newTitle ? `「${titleOf(after)}」になった！` : 'このちょうしでがんばろう！' });
    }
  }

  function addStats(p, stat) {
    Object.entries(stat).forEach(([k, v]) => { p.stats[k] = (p.stats[k] || 0) + v; });
    SKILLS.forEach(s => {
      if (p.skills.includes(s.id)) return;
      if (Object.entries(s.req).every(([k, v]) => statVal(p, k) >= v)) {
        p.skills.push(s.id);
        celebrate({ emoji: '✨', title: '新しい技！', text: `「${s.name}」が使えるようになった！` });
      }
    });
  }

  function giveBadge(p, id) {
    if (p.badges.includes(id)) return;
    p.badges.push(id);
    const b = BADGES.find(x => x.id === id);
    celebrate({ emoji: b.icon, title: 'バッジゲット！', text: b.name });
  }

  const validSolved = p => {
    const ids = new Set(window.QUESTIONS.map(q => q.id));
    return p.solved.filter(id => ids.has(id)).length;
  };

  function checkBadges(p) {
    const s = streakOf(p);
    if (s >= 3) giveBadge(p, 'streak3');
    if (s >= 7) giveBadge(p, 'streak7');
    if (s >= 30) giveBadge(p, 'streak30');
    const drills = sum(Object.values(p.drillCount));
    if (drills >= 1) giveBadge(p, 'first_drill');
    if (drills >= 10) giveBadge(p, 'drill10');
    if (drills >= 50) giveBadge(p, 'drill50');
    if (drills >= 100) giveBadge(p, 'drill100');
    if (p.quizTotal >= 1) giveBadge(p, 'first_quiz');
    if (leagueCleared(p, 'B2')) giveBadge(p, 'b2clear');
    if (leagueCleared(p, 'B1')) giveBadge(p, 'b1clear');
    if (leagueCleared(p, 'BP')) giveBadge(p, 'bpclear');
    const solved = validSolved(p);
    if (solved >= 100) giveBadge(p, 'solve100');
    if (solved >= window.QUESTIONS.length) giveBadge(p, 'solveall');
  }

  function checkMission(p) {
    ensureDaily(p);
    if (!p.daily.done && p.daily.quiz >= MISSION_QUIZ && p.daily.drill >= 1) {
      p.daily.done = true;
      addXP(p, XP_MISSION);
      giveBadge(p, 'mission');
      celebrate({ emoji: '🎉', title: '今日のミッション達成！', text: `ボーナス +${XP_MISSION}XP` });
    }
  }

  const stagesOf = league => window.STAGES.filter(s => s.league === league);
  const questionsOf = stageId => window.QUESTIONS.filter(q => q.stage === stageId);
  const leagueCleared = (p, league) => {
    const st = stagesOf(league);
    return st.length > 0 && st.every(s => (p.stages[s.id]?.stars || 0) >= 2);
  };
  const leagueOpen = (p, id) => !PREV_LEAGUE[id] || leagueCleared(p, PREV_LEAGUE[id]);
  const leagueStars = (p, id) => sum(stagesOf(id).map(s => p.stages[s.id]?.stars || 0));

  // 今日のおすすめドリル（日付と選手で毎日かわる。レベルが上がると上の段階も出る）
  function recommended(p) {
    const L = levelOf(p.xp);
    const maxLv = L >= 10 ? 3 : L >= 4 ? 2 : 1;
    let seed = [...(today() + p.id)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    const rand = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296; };
    const pool = window.DRILLS.filter(d => d.level <= maxLv);
    const picks = [];
    const cats = new Set();
    let guard = 0;
    while (picks.length < 3 && guard++ < 200) {
      const d = pool[Math.floor(rand() * pool.length)];
      if (picks.includes(d) || cats.has(d.cat)) continue;
      picks.push(d);
      cats.add(d.cat);
    }
    return picks;
  }

  // ===== 画面の切りかえ =====
  let view = 'profiles';
  let params = {};
  let quiz = null;
  let timer = null;

  function go(v, prm) {
    stopTimer();
    view = v;
    params = prm || {};
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    const p = Store.current();
    if (!p && view !== 'profiles' && view !== 'newProfile') view = 'profiles';
    if (p) ensureDaily(p);
    const fn = VIEWS[view] || VIEWS.home;
    $app.innerHTML = fn(p);
    $app.dataset.view = view;
    if (view === 'quiz') {
      const svg = $app.querySelector('.court');
      if (svg && $app.querySelector('[data-act=playCourt]')) setTimeout(() => Court.play(svg.id), 400);
    }
  }

  function header(p, title, back = 'home', sub = '') {
    return `<header class="topbar">
      <button class="icon-btn" data-go="${back}" aria-label="もどる">${ICON.back}</button>
      <div class="topbar-title"><h1>${esc(title)}</h1>${sub ? `<small>${esc(sub)}</small>` : ''}</div>
      ${p ? `<span class="topbar-lv"><small>Lv</small>${levelOf(p.xp)}</span>` : '<span></span>'}
    </header>`;
  }

  // 6つのステータスのレーダーチャート
  function radar(p, size = 150) {
    const keys = Store.STAT_KEYS;
    const vals = keys.map(k => statVal(p, k));
    const max = Math.max(20, Math.ceil((Math.max(...vals) + 5) / 10) * 10);
    const c = size / 2, r = size / 2 - 26;
    const pt = (i, v) => {
      const a = -Math.PI / 2 + i * Math.PI * 2 / keys.length;
      return [c + Math.cos(a) * r * v, c + Math.sin(a) * r * v];
    };
    const ring = f => keys.map((_, i) => pt(i, f).map(n => n.toFixed(1)).join(',')).join(' ');
    const shape = vals.map((v, i) => pt(i, v / max).map(n => n.toFixed(1)).join(',')).join(' ');
    const labels = keys.map((k, i) => {
      const [x, y] = pt(i, 1.28);
      return `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}">${STAT_INFO[k].short}</text>`;
    }).join('');
    return `<svg class="radar" viewBox="0 0 ${size} ${size}" role="img" aria-label="ステータス">
      <polygon class="rg" points="${ring(1)}"/><polygon class="rg" points="${ring(0.66)}"/><polygon class="rg" points="${ring(0.33)}"/>
      <polygon class="rv" points="${shape}"/>${labels}
    </svg>`;
  }

  function playerCard(p, big = false) {
    const L = levelOf(p.xp);
    const cur = p.xp - xpForLevel(L);
    const need = xpForLevel(L + 1) - xpForLevel(L);
    return `<section class="pcard ${big ? 'big' : ''}">
      <div class="pcard-main">
        <div class="jersey">
          <span class="jersey-lv">Lv</span>
          <span class="jersey-no">${L}</span>
        </div>
        <div class="pcard-id">
          <div class="pcard-name">${esc(p.name)}</div>
          <div class="pcard-title">${titleOf(L)}</div>
          <div class="pcard-ovr"><span>総合</span><b>${overall(p)}</b></div>
        </div>
        ${radar(p, big ? 190 : 150)}
      </div>
      <div class="xp">
        <div class="xp-bar"><i style="width:${Math.round(cur / need * 100)}%"></i></div>
        <span class="xp-text"><b>${cur}</b>/${need} XP</span>
      </div>
    </section>`;
  }

  // ===== 各画面 =====
  const VIEWS = {
    profiles() {
      const ps = Store.data.profiles;
      return `<div class="screen splash">
        <div class="brand">
          <svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26"/><path d="M6 32h52M32 6v52M14 14c9 9 9 27 0 36M50 14c-9 9-9 27 0 36"/></svg>
          <h1 class="brand-name">バスケ道場</h1>
          <p class="brand-sub">知って、考えて、練習する</p>
        </div>
        <p class="section-label">だれが練習する？</p>
        <div class="profile-list">
          ${ps.map(p => `<button class="profile-card" data-act="pick" data-id="${p.id}">
            <span class="avatar">${p.avatar}</span>
            <span class="pname">${esc(p.name)}</span>
            <span class="plv"><b>Lv${levelOf(p.xp)}</b> ${titleOf(levelOf(p.xp))}</span>
          </button>`).join('')}
          <button class="profile-card add" data-go="newProfile"><span class="avatar">＋</span><span class="pname">選手をつくる</span></button>
        </div>
      </div>`;
    },

    newProfile() {
      return `<div class="screen">
        ${header(null, '選手をつくる', 'profiles')}
        <div class="panel">
          <label class="field"><span>なまえ</span><input id="np-name" maxlength="10" placeholder="例：たろう" autocomplete="off" /></label>
          <p class="field-label">アイコン</p>
          <div class="avatar-pick">
            ${AVATARS.map((a, i) => `<button class="av ${i === 0 ? 'sel' : ''}" data-act="av" data-av="${a}" aria-label="${a}">${a}</button>`).join('')}
          </div>
          <button class="btn btn-led wide" data-act="createProfile">この選手でスタート</button>
        </div>
      </div>`;
    },

    home(p) {
      const d = p.daily;
      const total = window.QUESTIONS.length;
      const solved = validSolved(p);
      const quizN = Math.min(d.quiz, MISSION_QUIZ);
      const drillN = Math.min(d.drill, 1);
      return `<div class="screen home">
        <header class="home-top">
          <button class="who" data-go="profiles" aria-label="選手をかえる"><span class="avatar">${p.avatar}</span></button>
          <div class="streak ${streakOf(p) ? 'on' : ''}"><span class="flame">🔥</span><b>${streakOf(p)}</b><small>日れんぞく</small></div>
        </header>

        ${playerCard(p)}

        <section class="board ${d.done ? 'done' : ''}">
          <div class="board-head">
            <h2>今日のミッション</h2>
            <span class="board-bonus">${d.done ? '達成！' : `+${XP_MISSION}XP`}</span>
          </div>
          <div class="board-cells">
            <div class="cell ${quizN >= MISSION_QUIZ ? 'ok' : ''}"><small>クイズ</small><b class="led">${quizN}<span>/${MISSION_QUIZ}</span></b></div>
            <div class="cell ${drillN >= 1 ? 'ok' : ''}"><small>ドリル</small><b class="led">${drillN}<span>/1</span></b></div>
          </div>
        </section>

        <nav class="menu">
          <button class="tile tile-quiz" data-go="leagues">
            <span class="tile-icon">${ICON.quiz}</span>
            <span class="tile-name">クイズ道場</span>
            <span class="tile-meta">せいかい ${solved} / ${total}問</span>
            <span class="tile-progress"><i style="width:${solved / total * 100}%"></i></span>
          </button>
          <button class="tile tile-drill" data-go="drills">
            <span class="tile-icon">${ICON.drill}</span>
            <span class="tile-name">ドリル</span>
            <span class="tile-meta">今日のおすすめ 3つ</span>
          </button>
          <button class="tile tile-small" data-go="record">
            <span class="tile-icon">${ICON.record}</span><span class="tile-name">記録</span>
          </button>
          <button class="tile tile-small" data-go="settings">
            <span class="tile-icon">${ICON.setting}</span><span class="tile-name">せってい</span>
          </button>
        </nav>
      </div>`;
    },

    leagues(p) {
      return `<div class="screen">
        ${header(p, 'クイズ道場', 'home', `せいかい ${validSolved(p)} / ${window.QUESTIONS.length}問`)}
        <div class="rafters">
          ${LEAGUES.map(lg => {
            const open = leagueOpen(p, lg.id);
            const st = stagesOf(lg.id);
            const got = leagueStars(p, lg.id);
            const max = st.length * 3;
            return `<button class="banner b-${lg.id} ${open ? '' : 'locked'}" ${open ? `data-go="stages" data-league="${lg.id}"` : `data-act="lockedLeague" data-league="${lg.id}"`}>
              <span class="banner-name">${lg.name}</span>
              <span class="banner-desc">${lg.desc}</span>
              <span class="banner-stars">${open ? `★ ${got}/${max}` : `${ICON.lock}`}</span>
            </button>`;
          }).join('')}
        </div>
        <p class="note">つぎのリーグは、前のリーグの全ステージを★2以上にすると開くよ</p>
        ${p.wrong.length ? `<button class="review" data-act="startReview">
          <span><b>ふくしゅう</b><small>まちがえた問題にもう一度チャレンジ</small></span>
          <span class="review-n led">${p.wrong.length}</span>
        </button>` : ''}
      </div>`;
    },

    stages(p) {
      const lg = params.league || 'B2';
      const league = LEAGUES.find(l => l.id === lg);
      return `<div class="screen">
        ${header(p, `${league.name} リーグ`, 'leagues', league.desc)}
        <ol class="stage-list b-${lg}">
          ${stagesOf(lg).map(s => {
            const qs = questionsOf(s.id);
            const done = qs.filter(q => p.solved.includes(q.id)).length;
            const st = p.stages[s.id]?.stars || 0;
            return `<li><button class="stage ${st === 3 ? 'perfect' : ''}" data-act="startStage" data-id="${s.id}">
              <span class="stage-icon">${s.icon}</span>
              <span class="stage-body"><b>${esc(s.name)}</b><small>せいかい ${done}/${qs.length}</small></span>
              ${stars(st)}
            </button></li>`;
          }).join('')}
        </ol>
        <p class="note">★1：60%以上　★2：80%以上　★3：全問せいかい</p>
      </div>`;
    },

    quiz(p) {
      const q = quiz.list[quiz.idx];
      const total = quiz.list.length;
      const courtHtml = q.court ? Court.svg(q.court) : '';
      const animated = courtHtml && Court.hasAnim(courtHtml);
      const hasPlayers = q.court && (q.court.o || q.court.x);
      return `<div class="screen quiz">
        <header class="quiz-top">
          <button class="icon-btn" data-act="quitQuiz" aria-label="やめる">${ICON.close}</button>
          <div class="pips" aria-label="${quiz.idx + 1}問目 / ${total}問">
            ${quiz.list.map((_, i) => `<i class="${i < quiz.idx ? (quiz.results[i] ? 'ok' : 'ng') : i === quiz.idx ? 'now' : ''}"></i>`).join('')}
          </div>
          <span class="quiz-count led">${quiz.idx + 1}<span>/${total}</span></span>
        </header>
        <div class="qcard">
          <div class="qmeta">${ruleTag(q.rule)}</div>
          <p class="qtext">${esc(q.q)}</p>
          ${courtHtml ? `<div class="court-wrap">${courtHtml}
            <div class="court-foot">
              ${hasPlayers ? '<span class="legend"><i class="lg-o"></i>せめ（o）<i class="lg-x"></i>守り（x）</span>' : '<span></span>'}
              ${animated ? `<button class="mini-btn" data-act="playCourt">${ICON.play}うごきを見る</button>` : ''}
            </div>
          </div>` : ''}
        </div>
        <div class="choices">
          ${q.order.map((i, n) => `<button class="choice" data-act="answer" data-i="${i}"><span class="choice-key">${'ABCD'[n]}</span><span>${esc(q.choices[i])}</span></button>`).join('')}
        </div>
        <div id="feedback"></div>
      </div>`;
    },

    result(p) {
      const r = params;
      return `<div class="screen result">
        <div class="result-board">
          <p class="result-label">${r.review ? 'ふくしゅう' : esc(r.stageName || '')}</p>
          <p class="result-score led">${r.correct}<span>/${r.total}</span></p>
          ${r.review ? '' : `<div class="result-stars">${stars(r.stars)}</div>`}
          <p class="result-xp">+${r.xp} XP</p>
        </div>
        <p class="result-msg">${r.stars === 3 ? 'パーフェクト！ 全問せいかい！' : r.correct / r.total >= 0.8 ? 'ナイス！ その調子！' : 'おしい！ 説明を読んでもう一度やってみよう'}</p>
        ${r.wrongCount ? `<p class="note center">まちがえた ${r.wrongCount}問 は「ふくしゅう」に入ったよ</p>` : ''}
        <div class="row">
          ${r.review ? '' : `<button class="btn" data-act="startStage" data-id="${r.stageId}">もう一度</button>`}
          <button class="btn btn-led" data-go="${r.review ? 'leagues' : 'stages'}" data-league="${r.league || ''}">つぎへ</button>
        </div>
        <button class="btn-link" data-go="home">ホームにもどる</button>
      </div>`;
    },

    drills(p) {
      const t = today();
      const rec = recommended(p);
      const card = d => `<button class="drill ${p.drillDay[d.id] === t ? 'done' : ''}" data-go="drill" data-id="${d.id}">
        <span class="drill-icon">${d.icon}</span>
        <span class="drill-body">
          <b>${esc(d.name)}</b>
          <small><span class="lvchip lv${d.level}">${LEVEL_NAMES[d.level]}</span>${d.sec}秒×${d.sets}</small>
        </span>
        <span class="drill-side">${p.drillDay[d.id] === t ? '<span class="check">✓</span>' : `<span class="drill-xp">+${d.xp}</span>`}<small>${p.drillCount[d.id] || 0}回</small></span>
      </button>`;
      return `<div class="screen">
        ${header(p, 'ドリル', 'home', 'サイレントボールで家の中でできる練習')}
        <section class="rec">
          <h2>今日のおすすめ</h2>
          <div class="drill-grid">${rec.map(card).join('')}</div>
        </section>
        <p class="note">まわりに物がないか確かめてから始めよう。家族と2人でやるメニューもあるよ。</p>
        ${window.DRILL_CATS.map(cat => {
          const list = window.DRILLS.filter(d => d.cat === cat);
          return list.length ? `<section class="drill-cat"><h2>${cat}</h2><div class="drill-grid">${list.map(card).join('')}</div></section>` : '';
        }).join('')}
      </div>`;
    },

    drill(p) {
      const d = window.DRILLS.find(x => x.id === params.id);
      const doneToday = p.drillDay[d.id] === today();
      return `<div class="screen">
        ${header(p, d.name, 'drills', `${d.cat}・${LEVEL_NAMES[d.level]}`)}
        <div class="shotclock" id="timer">
          <div class="sc-label" id="tm-label">じゅんびOK？</div>
          <div class="sc-digits led" id="tm-sec">${d.sec}</div>
          <div class="sc-sets" id="tm-set">${Array.from({ length: d.sets }, (_, i) => `<i>${d.setLabels?.[i] ? esc(d.setLabels[i]) : `${i + 1}`}</i>`).join('')}</div>
          <div class="row" id="tm-btns">
            <button class="btn btn-led wide" data-act="tmStart">スタート</button>
          </div>
        </div>
        <section class="panel">
          <p class="goal">${esc(d.goal)}</p>
          <ol class="steps">${d.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
          <h3 class="tips-head">コツ</h3>
          <ul class="tips">${d.tips.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
          <p class="gain-line">${Object.entries(d.stat).map(([k, v]) => `<span>${STAT_INFO[k].name} +${v}</span>`).join('')}<span class="xp-chip">${doneToday ? `+${XP_DRILL_AGAIN}XP（今日2回目から）` : `+${d.xp}XP`}</span></p>
        </section>
        <button class="btn wide ghost" data-act="drillDone">タイマーなしで「できた！」</button>
      </div>`;
    },

    record(p) {
      const drills = sum(Object.values(p.drillCount));
      const days = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        days.push({ day: d.getDate(), on: p.days.includes(fmtDate(d)), today: i === 0 });
      }
      const total = window.QUESTIONS.length;
      const solved = validSolved(p);
      return `<div class="screen">
        ${header(p, 'じぶんの記録')}
        ${playerCard(p, true)}

        <section class="panel">
          <div class="stat-rows">
            ${Store.STAT_KEYS.map(k => {
              const v = statVal(p, k);
              return `<div class="stat-row"><span>${STAT_INFO[k].name}</span><div class="meter"><i style="width:${v}%"></i></div><b class="led">${v}</b></div>`;
            }).join('')}
          </div>
          <div class="three-rate"><span>3ポイントせいこう率</span><b class="led">${threeRate(p)}<small>%</small></b></div>
        </section>

        <section class="panel">
          <div class="facts">
            <div><b class="led">${p.xp}</b><small>合計XP</small></div>
            <div><b class="led">${solved}<span>/${total}</span></b><small>せいかいした問題</small></div>
            <div><b class="led">${drills}</b><small>練習した回数</small></div>
          </div>
        </section>

        <section class="panel">
          <h2>使える技</h2>
          <div class="skills">
            ${SKILLS.map(s => {
              const has = p.skills.includes(s.id);
              const req = Object.entries(s.req).map(([k, v]) => `${STAT_INFO[k].name}${v}`).join('・');
              return `<div class="skill ${has ? 'on' : ''}"><b>${has ? esc(s.name) : '？？？'}</b><small>${has ? '使える！' : `${req}で開く`}</small></div>`;
            }).join('')}
          </div>
        </section>

        <section class="panel">
          <h2>この2週間</h2>
          <div class="cal">${days.map(d => `<span class="${d.on ? 'on' : ''} ${d.today ? 'today' : ''}">${d.day}</span>`).join('')}</div>
        </section>

        <section class="panel">
          <h2>バッジ</h2>
          <div class="badges">
            ${BADGES.map(b => { const on = p.badges.includes(b.id); return `<div class="badge ${on ? 'on' : ''}"><span>${on ? b.icon : '?'}</span><small>${esc(b.name)}</small></div>`; }).join('')}
          </div>
        </section>
      </div>`;
    },

    settings(p) {
      return `<div class="screen">
        ${header(p, 'せってい')}
        <section class="panel">
          <h2>選手をかえる</h2>
          <button class="btn wide" data-go="profiles">選手えらびへ</button>
        </section>
        <section class="panel">
          <h2>記録のバックアップ</h2>
          <p class="note">この端末に入っている全員の記録を書き出します。機種変更のときなどに使ってね。</p>
          <div class="row">
            <button class="btn" data-act="exportCopy">コピーする</button>
            <button class="btn" data-act="exportFile">ファイルに保存</button>
          </div>
        </section>
        <section class="panel">
          <h2>記録を読みこむ</h2>
          <p class="note">今この端末にある記録は、読みこんだ記録に置きかわります。</p>
          <textarea id="import-text" rows="4" placeholder="コピーした記録をここにはりつけ"></textarea>
          <div class="row">
            <button class="btn" data-act="importText">はりつけた記録を読みこむ</button>
            <label class="btn">ファイルから読みこむ<input type="file" id="import-file" accept=".json,application/json" hidden /></label>
          </div>
        </section>
        <p class="note center">バスケ道場 v0.2</p>
      </div>`;
    },
  };

  // ===== クイズ =====
  function startQuiz(list, opt) {
    quiz = {
      ...opt,
      list: list.map(q => ({ ...q, order: shuffle(q.choices.map((_, i) => i)) })),
      idx: 0, correct: 0, xp: 0, answered: false, wrongCount: 0, results: [],
    };
    go('quiz');
  }

  function answer(btn) {
    if (!quiz || quiz.answered) return;
    quiz.answered = true;
    const p = Store.current();
    const q = quiz.list[quiz.idx];
    const chosen = Number(btn.dataset.i);
    const ok = chosen === q.answer;
    quiz.results[quiz.idx] = ok;

    document.querySelectorAll('.choice').forEach(b => {
      b.disabled = true;
      const i = Number(b.dataset.i);
      if (i === q.answer) b.classList.add('correct');
      else if (i === chosen) b.classList.add('wrong');
    });

    ensureDaily(p);
    p.daily.quiz++;
    p.quizTotal++;
    markActive(p);
    if (ok) {
      quiz.correct++;
      const gain = quiz.review ? XP_REVIEW : XP_CORRECT;
      quiz.xp += gain;
      addXP(p, gain);
      addStats(p, { iq: 1 });
      p.wrong = p.wrong.filter(id => id !== q.id);
      if (!p.solved.includes(q.id)) p.solved.push(q.id);
      Sound.good();
    } else {
      quiz.wrongCount++;
      if (!p.wrong.includes(q.id)) p.wrong.push(q.id);
      Sound.bad();
    }
    checkMission(p);
    Store.save();

    const last = quiz.idx === quiz.list.length - 1;
    const fb = document.getElementById('feedback');
    fb.innerHTML = `<div class="feedback ${ok ? 'ok' : 'ng'}" role="status">
      <p class="fb-head">${ok ? 'せいかい！' : 'ざんねん…'}${ok ? `<span class="fb-xp">+${quiz.review ? XP_REVIEW : XP_CORRECT}XP</span>` : ''}</p>
      ${ok ? '' : `<p class="fb-answer">答え：${esc(q.choices[q.answer])}</p>`}
      <p class="fb-text">${esc(q.explain)}</p>
      <button class="btn btn-led wide" data-act="next">${last ? 'けっかを見る' : 'つぎの問題'}</button>
    </div>`;
    document.querySelectorAll('.pips i')[quiz.idx]?.classList.add(ok ? 'ok' : 'ng');
    fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function nextQuestion() {
    if (quiz.idx < quiz.list.length - 1) {
      quiz.idx++;
      quiz.answered = false;
      render();
      window.scrollTo(0, 0);
      return;
    }
    finishQuiz();
  }

  function finishQuiz() {
    const p = Store.current();
    const total = quiz.list.length;
    const rate = quiz.correct / total;
    let st = 0;
    if (!quiz.review) {
      st = rate === 1 ? 3 : rate >= 0.8 ? 2 : rate >= 0.6 ? 1 : 0;
      const rec = p.stages[quiz.stageId] || { stars: 0, bestRate: 0 };
      if (st > rec.stars) {
        const bonus = (st - rec.stars) * XP_STAR;
        quiz.xp += bonus;
        addXP(p, bonus);
        rec.stars = st;
      }
      rec.bestRate = Math.max(rec.bestRate, rate);
      p.stages[quiz.stageId] = rec;
      if (st === 3) giveBadge(p, 'perfect');
    }
    checkBadges(p);
    Store.save();
    const stage = window.STAGES.find(s => s.id === quiz.stageId);
    const r = { correct: quiz.correct, total, stars: st, xp: quiz.xp, review: quiz.review, stageId: quiz.stageId, stageName: stage?.name, league: stage?.league, wrongCount: quiz.wrongCount };
    quiz = null;
    go('result', r);
  }

  // ===== ドリルのタイマー =====
  let wakeLock = null;
  async function requestWakeLock() {
    try { if (navigator.wakeLock) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { /* 対応していない端末 */ }
  }
  function releaseWakeLock() {
    if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
  }

  function stopTimer() {
    if (timer) { clearInterval(timer.iv); timer = null; }
    releaseWakeLock();
  }

  function startTimer() {
    const d = window.DRILLS.find(x => x.id === params.id);
    Sound.ensure();
    requestWakeLock();
    if (timer) clearInterval(timer.iv);
    timer = { d, set: 0, phase: 'count', remain: 3, paused: false };
    Sound.beep(660, 0.12);
    timer.iv = setInterval(tick, 1000);
    updateTimer();
  }

  const setLabel = (d, i) => (d.setLabels && d.setLabels[i]) || '';

  function tick() {
    if (!timer || timer.paused) return;
    timer.remain--;
    const d = timer.d;
    if (timer.remain > 0) {
      if (timer.remain <= 3) Sound.beep(660, 0.1);
      updateTimer();
      return;
    }
    if (timer.phase === 'count' || timer.phase === 'rest') {
      timer.phase = 'work';
      timer.remain = d.sec;
      Sound.beep(1047, 0.35);
      Sound.say(setLabel(d, timer.set) ? `${setLabel(d, timer.set)}、スタート` : 'スタート');
    } else if (timer.phase === 'work') {
      if (timer.set < d.sets - 1) {
        timer.set++;
        timer.phase = d.rest ? 'rest' : 'count';
        timer.remain = d.rest || 3;
        Sound.buzzer();
        Sound.say('休けい');
      } else {
        timer.phase = 'done';
        clearInterval(timer.iv);
        releaseWakeLock();
        Sound.buzzer();
        setTimeout(() => Sound.say('おわり！よくがんばったね'), 700);
      }
    }
    updateTimer();
  }

  function updateTimer() {
    const el = id => document.getElementById(id);
    if (!timer || !el('tm-sec')) return;
    const { d, phase, set, remain, paused } = timer;
    const label = setLabel(d, set);
    el('timer').className = `shotclock ph-${phase}${phase === 'work' && remain <= 3 ? ' hurry' : ''}`;
    el('tm-label').textContent = phase === 'count' ? 'よーい…' : phase === 'rest' ? `休けい${label ? `｜つぎは ${label}` : ''}` : phase === 'done' ? 'おわり！ よくがんばった！' : (label || 'がんばれ！');
    el('tm-sec').textContent = phase === 'done' ? 'OK' : remain;
    el('tm-set').querySelectorAll('i').forEach((i, n) => {
      i.className = n < set || phase === 'done' ? 'done' : n === set ? 'now' : '';
    });
    el('tm-btns').innerHTML = phase === 'done'
      ? `<button class="btn btn-led wide" data-act="drillDone">できた！ XPをもらう</button>`
      : `<button class="btn" data-act="tmPause">${paused ? 'さいかい' : '一時ていし'}</button><button class="btn ghost" data-act="tmReset">さいしょから</button>`;
  }

  function drillDone() {
    const p = Store.current();
    const d = window.DRILLS.find(x => x.id === params.id);
    const t = today();
    const first = p.drillDay[d.id] !== t;
    const gain = first ? d.xp : XP_DRILL_AGAIN;
    ensureDaily(p);
    p.daily.drill++;
    p.drillCount[d.id] = (p.drillCount[d.id] || 0) + 1;
    p.drillDay[d.id] = t;
    markActive(p);
    addXP(p, gain);
    addStats(p, first ? d.stat : {});
    checkMission(p);
    checkBadges(p);
    Store.save();
    toast(`+${gain}XP ${first ? Object.entries(d.stat).map(([k, v]) => `${STAT_INFO[k].name}+${v}`).join(' ') : ''}`);
    go('drills');
  }

  // ===== バックアップ =====
  async function exportCopy() {
    const text = Store.exportText();
    try {
      await navigator.clipboard.writeText(text);
      toast('コピーしました。メモアプリなどにはりつけて保存してね');
    } catch (e) {
      const ta = document.getElementById('import-text');
      ta.value = text;
      ta.select();
      toast('下のらんに記録を出したので、全部コピーしてね');
    }
  }

  function exportFile() {
    const blob = new Blob([Store.exportText()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `basket-dojo-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function doImport(text) {
    if (!text.trim()) { toast('記録がはりつけられていません'); return; }
    if (!confirm('今の記録が、読みこんだ記録に置きかわります。よろしいですか？')) return;
    try {
      Store.importText(text);
      toast('読みこみました！');
      go(Store.current() ? 'home' : 'profiles');
    } catch (e) {
      alert('読みこめませんでした：' + e.message);
    }
  }

  // ===== ボタン操作 =====
  $app.addEventListener('click', e => {
    const el = e.target.closest('[data-go],[data-act]');
    if (!el) return;
    const p = Store.current();

    if (el.dataset.go) {
      const prm = {};
      if (el.dataset.league) prm.league = el.dataset.league;
      if (el.dataset.id) prm.id = el.dataset.id;
      if (el.dataset.go === 'stages' && !prm.league) prm.league = params.league || 'B2';
      go(el.dataset.go, prm);
      return;
    }

    switch (el.dataset.act) {
      case 'pick':
        Store.setCurrent(el.dataset.id);
        go('home');
        break;
      case 'av':
        document.querySelectorAll('.av').forEach(b => b.classList.toggle('sel', b === el));
        break;
      case 'createProfile': {
        const name = document.getElementById('np-name').value.trim();
        if (!name) { toast('なまえを入れてね'); return; }
        const av = document.querySelector('.av.sel')?.dataset.av || '🏀';
        Store.addProfile(name, av);
        go('home');
        break;
      }
      case 'lockedLeague': {
        const prev = LEAGUES.find(l => l.id === PREV_LEAGUE[el.dataset.league]);
        toast(`${prev.name}リーグの全ステージを★2以上にすると開くよ`);
        break;
      }
      case 'startStage': {
        const list = shuffle(questionsOf(el.dataset.id));
        startQuiz(list, { stageId: el.dataset.id, review: false });
        break;
      }
      case 'startReview': {
        const list = shuffle(window.QUESTIONS.filter(q => p.wrong.includes(q.id))).slice(0, 10);
        if (list.length) startQuiz(list, { review: true });
        else { p.wrong = []; Store.save(); render(); }
        break;
      }
      case 'playCourt': {
        const svg = $app.querySelector('.court');
        if (svg) Court.play(svg.id);
        break;
      }
      case 'answer': answer(el); break;
      case 'next': nextQuestion(); break;
      case 'quitQuiz':
        if (confirm('クイズをやめる？（ここまでのXPはもらえるよ）')) {
          const league = window.STAGES.find(s => s.id === quiz?.stageId)?.league;
          quiz = null;
          go(league ? 'stages' : 'leagues', { league });
        }
        break;
      case 'tmStart': startTimer(); break;
      case 'tmPause':
        if (timer) { timer.paused = !timer.paused; updateTimer(); }
        break;
      case 'tmReset': stopTimer(); render(); break;
      case 'drillDone': drillDone(); break;
      case 'exportCopy': exportCopy(); break;
      case 'exportFile': exportFile(); break;
      case 'importText': doImport(document.getElementById('import-text').value); break;
    }
  });

  $app.addEventListener('change', e => {
    if (e.target.id !== 'import-file') return;
    const f = e.target.files[0];
    if (!f) return;
    f.text().then(doImport);
    e.target.value = '';
  });

  // ===== 起動 =====
  if (Store.current()) view = 'home';
  render();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('sw', e));
  }
})();
