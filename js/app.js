// バスケ道場 アプリ本体
(() => {
  'use strict';

  const $app = document.getElementById('app');

  // ===== 定数 =====
  const STAT_INFO = {
    shoot: { name: 'シュート', icon: '🎯' },
    dribble: { name: 'ドリブル', icon: '🏀' },
    pass: { name: 'パス', icon: '🤝' },
    defense: { name: 'ディフェンス', icon: '🛡️' },
    physical: { name: 'フィジカル', icon: '💪' },
    iq: { name: 'バスケIQ', icon: '🧠' },
  };

  const LEAGUES = [
    { id: 'B2', name: 'B2', desc: '用語・ルール・ファウルの基本' },
    { id: 'B1', name: 'B1', desc: '1線・2線・3線、ヘルプ、速こう' },
    { id: 'BP', name: 'Bプレ', desc: 'ピック&ロール、ゾーン、試合さいごの判だん' },
  ];

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
    { id: 'mission', icon: '✅', name: 'デイリーミッション達成' },
    { id: 'perfect', icon: '💯', name: '全問せいかい' },
    { id: 'streak3', icon: '🔥', name: '3日れんぞく' },
    { id: 'streak7', icon: '🔥', name: '7日れんぞく' },
    { id: 'streak30', icon: '🌋', name: '30日れんぞく' },
    { id: 'drill10', icon: '🏅', name: '練習10回' },
    { id: 'drill50', icon: '🥇', name: '練習50回' },
    { id: 'b2clear', icon: '🏆', name: 'B2クリア' },
  ];

  const AVATARS = ['🏀', '⛹️', '🦁', '🐯', '🦅', '🐺', '🔥', '⚡', '🐉', '🦈'];

  const XP_CORRECT = 10;
  const XP_REVIEW = 5;
  const XP_STAR = 10;
  const XP_MISSION = 30;
  const XP_DRILL_AGAIN = 5;
  const MISSION_QUIZ = 5;

  // ===== 小さな道具 =====
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const fmtDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => fmtDate(new Date());
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  // レベルLになるのに必要な合計XP：0, 50, 150, 300, 500, ...
  const xpForLevel = L => 25 * (L - 1) * L;
  const levelOf = xp => { let L = 1; while (xp >= xpForLevel(L + 1)) L++; return L; };
  const titleOf = L => L >= 20 ? 'レジェンド' : L >= 15 ? 'キャプテン' : L >= 10 ? 'エース' : L >= 5 ? 'スターター' : 'ルーキー';

  // ステータスの表示の数字（1〜99）
  const statVal = (p, k) => Math.min(99, 1 + Math.floor(p.stats[k] / 2));
  const threeRate = p => Math.round(20 + statVal(p, 'shoot') * 0.3);

  const ruleTag = r => r === 'mini' ? '<span class="tag tag-mini">ミニバス</span>'
    : r === 'general' ? '<span class="tag tag-gen">中学・一般</span>' : '';

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
    el.innerHTML = `<div class="celebrate"><div class="cel-emoji">${item.emoji}</div><h2>${esc(item.title)}</h2><p>${esc(item.text || '')}</p><button class="btn btn-primary">やったー！</button></div>`;
    el.querySelector('button').addEventListener('click', () => {
      el.remove();
      celebrateQueue.shift();
      showCelebrate();
    });
    document.body.appendChild(el);
    Sound.fanfare();
  }

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._id);
    toast._id = setTimeout(() => t.classList.remove('show'), 2200);
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
    return { ensure, beep, fanfare, good, bad, say };
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

  function checkBadges(p) {
    const s = streakOf(p);
    if (s >= 3) giveBadge(p, 'streak3');
    if (s >= 7) giveBadge(p, 'streak7');
    if (s >= 30) giveBadge(p, 'streak30');
    const drills = Object.values(p.drillCount).reduce((a, b) => a + b, 0);
    if (drills >= 1) giveBadge(p, 'first_drill');
    if (drills >= 10) giveBadge(p, 'drill10');
    if (drills >= 50) giveBadge(p, 'drill50');
    if (p.quizTotal >= 1) giveBadge(p, 'first_quiz');
    if (leagueCleared(p, 'B2')) giveBadge(p, 'b2clear');
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
  const leagueCleared = (p, league) => {
    const st = stagesOf(league);
    return st.length > 0 && st.every(s => (p.stages[s.id]?.stars || 0) >= 2);
  };
  const leagueOpen = (p, id) => id === 'B2' ? true : id === 'B1' ? leagueCleared(p, 'B2') : leagueCleared(p, 'B1');

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
  }

  function header(p, title, back = 'home') {
    return `<header class="bar">
      <button class="icon-btn" data-go="${back}" aria-label="もどる">‹</button>
      <h1>${esc(title)}</h1>
      <span class="bar-xp">${p ? `Lv${levelOf(p.xp)}` : ''}</span>
    </header>`;
  }

  // ===== 各画面 =====
  const VIEWS = {
    profiles() {
      const ps = Store.data.profiles;
      return `<div class="screen center-screen">
        <div class="logo">🏀</div>
        <h1 class="app-title">バスケ道場</h1>
        <p class="sub">だれが練習する？</p>
        <div class="profile-list">
          ${ps.map(p => `<button class="profile-card" data-act="pick" data-id="${p.id}">
            <span class="avatar">${p.avatar}</span>
            <span class="pname">${esc(p.name)}</span>
            <span class="plv">Lv${levelOf(p.xp)} ${titleOf(levelOf(p.xp))}</span>
          </button>`).join('')}
          <button class="profile-card add" data-go="newProfile"><span class="avatar">＋</span><span class="pname">選手をつくる</span></button>
        </div>
      </div>`;
    },

    newProfile() {
      return `<div class="screen">
        ${header(null, '選手をつくる', 'profiles')}
        <label class="field">なまえ<input id="np-name" maxlength="10" placeholder="例：たろう" /></label>
        <p class="label">アイコン</p>
        <div class="avatar-pick">
          ${AVATARS.map((a, i) => `<button class="av ${i === 0 ? 'sel' : ''}" data-act="av" data-av="${a}">${a}</button>`).join('')}
        </div>
        <button class="btn btn-primary wide" data-act="createProfile">つくる！</button>
      </div>`;
    },

    home(p) {
      const L = levelOf(p.xp);
      const cur = p.xp - xpForLevel(L);
      const need = xpForLevel(L + 1) - xpForLevel(L);
      const d = p.daily;
      const quizDone = Math.min(d.quiz, MISSION_QUIZ);
      return `<div class="screen">
        <header class="home-head">
          <button class="avatar big" data-go="profiles" aria-label="選手をかえる">${p.avatar}</button>
          <div class="home-info">
            <div class="pname">${esc(p.name)}</div>
            <div class="lv">Lv${L} <span class="title">${titleOf(L)}</span></div>
            <div class="xpbar"><div style="width:${Math.round(cur / need * 100)}%"></div></div>
            <div class="xptext">${cur} / ${need} XP</div>
          </div>
          <div class="streak">🔥<b>${streakOf(p)}</b><small>日れんぞく</small></div>
        </header>

        <section class="card mission ${d.done ? 'done' : ''}">
          <h2>今日のミッション ${d.done ? '✅' : ''}</h2>
          <div class="mrow"><span>🧠 クイズに${MISSION_QUIZ}問答える</span><b>${quizDone}/${MISSION_QUIZ}</b></div>
          <div class="mrow"><span>🏀 ドリルを1つやる</span><b>${Math.min(d.drill, 1)}/1</b></div>
          <p class="hint">${d.done ? '達成！ また明日もがんばろう' : `達成すると +${XP_MISSION}XP`}</p>
        </section>

        <div class="menu-grid">
          <button class="menu-btn quiz" data-go="leagues"><span>🧠</span>クイズ道場</button>
          <button class="menu-btn drill" data-go="drills"><span>🏀</span>ドリル</button>
          <button class="menu-btn record" data-go="record"><span>📊</span>じぶんの記録</button>
          <button class="menu-btn setting" data-go="settings"><span>⚙️</span>せってい</button>
        </div>
      </div>`;
    },

    leagues(p) {
      return `<div class="screen">
        ${header(p, 'クイズ道場')}
        ${p.wrong.length ? `<button class="card review" data-act="startReview">📚 ふくしゅう（${p.wrong.length}問）<small>まちがえた問題にもう一度チャレンジ</small></button>` : ''}
        ${LEAGUES.map(lg => {
          const open = leagueOpen(p, lg.id);
          const ready = stagesOf(lg.id).length > 0;
          const prev = lg.id === 'B1' ? 'B2' : 'B1';
          const note = !open ? `🔒 ${prev}を全部★2以上でかいほう` : !ready ? '🚧 じゅんび中' : '';
          return `<button class="league ${lg.id} ${open && ready ? '' : 'locked'}" ${open && ready ? `data-go="stages" data-league="${lg.id}"` : 'disabled'}>
            <span class="lg-name">${lg.name}</span>
            <span class="lg-desc">${lg.desc}</span>
            ${note ? `<span class="lg-note">${note}</span>` : ''}
          </button>`;
        }).join('')}
      </div>`;
    },

    stages(p) {
      const lg = params.league || 'B2';
      return `<div class="screen">
        ${header(p, `${LEAGUES.find(l => l.id === lg).name} リーグ`, 'leagues')}
        ${stagesOf(lg).map(s => {
          const rec = p.stages[s.id];
          const stars = rec?.stars || 0;
          const n = window.QUESTIONS.filter(q => q.stage === s.id).length;
          return `<button class="stage" data-act="startStage" data-id="${s.id}">
            <span class="st-icon">${s.icon}</span>
            <span class="st-body"><b>${esc(s.name)}</b><small>${n}問</small></span>
            <span class="stars">${'★'.repeat(stars)}<i>${'★'.repeat(3 - stars)}</i></span>
          </button>`;
        }).join('')}
        <p class="hint">★1：60%以上　★2：80%以上　★3：全問せいかい</p>
      </div>`;
    },

    quiz(p) {
      const q = quiz.list[quiz.idx];
      const total = quiz.list.length;
      return `<div class="screen quiz-screen">
        <header class="bar">
          <button class="icon-btn" data-act="quitQuiz" aria-label="やめる">✕</button>
          <div class="progress"><div style="width:${quiz.idx / total * 100}%"></div></div>
          <span class="bar-xp">${quiz.idx + 1}/${total}</span>
        </header>
        <div class="qbox">
          ${ruleTag(q.rule)}
          <p class="qtext">${esc(q.q)}</p>
          ${q.court ? `<div class="court-wrap">${Court.svg(q.court)}</div>` : ''}
        </div>
        <div class="choices">
          ${q.order.map(i => `<button class="choice" data-act="answer" data-i="${i}">${esc(q.choices[i])}</button>`).join('')}
        </div>
        <div id="feedback"></div>
      </div>`;
    },

    result(p) {
      const r = params;
      return `<div class="screen center-screen">
        <div class="logo">${r.stars === 3 ? '🏆' : r.stars >= 1 ? '🎉' : '💪'}</div>
        <h1>${r.review ? 'ふくしゅう終わり！' : 'ステージ終わり！'}</h1>
        <p class="big-score">${r.correct} / ${r.total} 問せいかい</p>
        ${r.review ? '' : `<p class="stars big">${'★'.repeat(r.stars)}<i>${'★'.repeat(3 - r.stars)}</i></p>`}
        <p class="gain">+${r.xp} XP</p>
        ${r.wrongCount ? `<p class="hint">まちがえた ${r.wrongCount}問 は「ふくしゅう」に入ったよ</p>` : ''}
        <div class="row">
          ${r.review ? '' : `<button class="btn" data-act="startStage" data-id="${r.stageId}">もう一度</button>`}
          <button class="btn btn-primary" data-go="${r.review ? 'leagues' : 'stages'}" data-league="${r.league || ''}">つぎへ</button>
        </div>
        <button class="btn-link" data-go="home">ホームにもどる</button>
      </div>`;
    },

    drills(p) {
      const t = today();
      return `<div class="screen">
        ${header(p, 'ドリル')}
        <p class="hint">サイレントボールで家の中でもできるよ。まわりに物がないか確かめてから始めよう！</p>
        <div class="drill-list">
          ${window.DRILLS.map(d => `<button class="drill-card" data-go="drill" data-id="${d.id}">
            <span class="d-icon">${d.icon}</span>
            <span class="d-body"><b>${esc(d.name)}</b><small>${esc(d.cat)}・${d.sec}秒×${d.sets}</small>
              <small class="d-stat">${Object.entries(d.stat).map(([k, v]) => `${STAT_INFO[k].icon}+${v}`).join(' ')}　+${d.xp}XP</small></span>
            <span class="d-count">${p.drillDay[d.id] === t ? '✅' : ''}<small>${p.drillCount[d.id] || 0}回</small></span>
          </button>`).join('')}
        </div>
      </div>`;
    },

    drill(p) {
      const d = window.DRILLS.find(x => x.id === params.id);
      const doneToday = p.drillDay[d.id] === today();
      return `<div class="screen">
        ${header(p, d.name, 'drills')}
        <div class="card">
          <p class="goal">🎯 ${esc(d.goal)}</p>
          <ol class="steps">${d.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
          <p class="label">コツ</p>
          <ul class="tips">${d.tips.map(s => `<li>💡 ${esc(s)}</li>`).join('')}</ul>
        </div>
        <div class="timer card" id="timer">
          <div class="tm-label" id="tm-label">じゅんびOK？</div>
          <div class="tm-sec" id="tm-sec">${d.sec}</div>
          <div class="tm-set" id="tm-set">${d.sets}セット${d.rest ? `（休けい${d.rest}秒）` : ''}</div>
          <div class="row" id="tm-btns">
            <button class="btn btn-primary" data-act="tmStart">スタート</button>
          </div>
        </div>
        <button class="btn wide" data-act="drillDone">タイマーなしで「できた！」</button>
        <p class="hint">${doneToday ? `今日はもうXPをもらったよ。もう一度やると +${XP_DRILL_AGAIN}XP` : `できたら +${d.xp}XP`}</p>
      </div>`;
    },

    record(p) {
      const L = levelOf(p.xp);
      const drills = Object.values(p.drillCount).reduce((a, b) => a + b, 0);
      const days = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        days.push({ day: d.getDate(), on: p.days.includes(fmtDate(d)) });
      }
      return `<div class="screen">
        ${header(p, 'じぶんの記録')}
        <section class="card player-card">
          <div class="pc-head"><span class="avatar big">${p.avatar}</span>
            <div><div class="pname">${esc(p.name)}</div><div class="lv">Lv${L} ${titleOf(L)}</div><small>${p.xp}XP・クイズ${p.quizTotal}問・練習${drills}回</small></div></div>
          <div class="stats">
            ${Store.STAT_KEYS.map(k => {
              const v = statVal(p, k);
              return `<div class="stat"><span>${STAT_INFO[k].icon} ${STAT_INFO[k].name}</span><div class="sbar"><div style="width:${v}%"></div></div><b>${v}</b></div>`;
            }).join('')}
          </div>
          <p class="three">🎯 3ポイントせいこう率 <b>${threeRate(p)}%</b></p>
        </section>

        <section class="card">
          <h2>使える技</h2>
          <div class="skills">
            ${SKILLS.map(s => {
              const has = p.skills.includes(s.id);
              const req = Object.entries(s.req).map(([k, v]) => `${STAT_INFO[k].icon}${v}`).join(' ');
              return `<div class="skill ${has ? 'on' : ''}">${has ? '✨ ' + esc(s.name) : '🔒 ？？？'}<small>${req}</small></div>`;
            }).join('')}
          </div>
        </section>

        <section class="card">
          <h2>この2週間</h2>
          <div class="cal">${days.map(d => `<span class="${d.on ? 'on' : ''}">${d.day}</span>`).join('')}</div>
        </section>

        <section class="card">
          <h2>バッジ</h2>
          <div class="badges">
            ${BADGES.map(b => `<div class="badge ${p.badges.includes(b.id) ? 'on' : ''}"><span>${p.badges.includes(b.id) ? b.icon : '❔'}</span><small>${esc(b.name)}</small></div>`).join('')}
          </div>
        </section>
      </div>`;
    },

    settings(p) {
      return `<div class="screen">
        ${header(p, 'せってい')}
        <section class="card">
          <h2>選手をかえる</h2>
          <button class="btn wide" data-go="profiles">選手えらびへ</button>
        </section>
        <section class="card">
          <h2>記録のバックアップ</h2>
          <p class="hint">この端末に入っている全員の記録を書き出します。機種変更のときなどに使ってね。</p>
          <div class="row">
            <button class="btn" data-act="exportCopy">コピーする</button>
            <button class="btn" data-act="exportFile">ファイルに保存</button>
          </div>
        </section>
        <section class="card">
          <h2>記録を読みこむ</h2>
          <p class="hint">⚠️ 今この端末にある記録は、読みこんだ記録に置きかわります。</p>
          <textarea id="import-text" rows="4" placeholder="コピーした記録をここにはりつけ"></textarea>
          <div class="row">
            <button class="btn" data-act="importText">はりつけた記録を読みこむ</button>
            <label class="btn">ファイルから読みこむ<input type="file" id="import-file" accept=".json,application/json" hidden /></label>
          </div>
        </section>
        <p class="hint center">バスケ道場 v0.1</p>
      </div>`;
    },
  };

  // ===== クイズ =====
  function startQuiz(list, opt) {
    quiz = {
      ...opt,
      list: list.map(q => ({ ...q, order: shuffle(q.choices.map((_, i) => i)) })),
      idx: 0, correct: 0, xp: 0, answered: false, wrongCount: 0,
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
      Sound.good();
    } else {
      quiz.wrongCount++;
      if (!p.wrong.includes(q.id)) p.wrong.push(q.id);
      Sound.bad();
    }
    checkMission(p);
    Store.save();

    const last = quiz.idx === quiz.list.length - 1;
    document.getElementById('feedback').innerHTML = `<div class="feedback ${ok ? 'ok' : 'ng'}">
      <h3>${ok ? '⭕ せいかい！' : '❌ ざんねん…'}</h3>
      <p>${esc(q.explain)}</p>
      <button class="btn btn-primary wide" data-act="next">${last ? 'けっかを見る' : 'つぎの問題'}</button>
    </div>`;
    document.getElementById('feedback').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    let stars = 0;
    if (!quiz.review) {
      stars = rate === 1 ? 3 : rate >= 0.8 ? 2 : rate >= 0.6 ? 1 : 0;
      const rec = p.stages[quiz.stageId] || { stars: 0, bestRate: 0 };
      if (stars > rec.stars) {
        const bonus = (stars - rec.stars) * XP_STAR;
        quiz.xp += bonus;
        addXP(p, bonus);
        rec.stars = stars;
      }
      rec.bestRate = Math.max(rec.bestRate, rate);
      p.stages[quiz.stageId] = rec;
      if (stars === 3) giveBadge(p, 'perfect');
    }
    checkBadges(p);
    Store.save();
    const stage = window.STAGES.find(s => s.id === quiz.stageId);
    const r = { correct: quiz.correct, total, stars, xp: quiz.xp, review: quiz.review, stageId: quiz.stageId, league: stage?.league, wrongCount: quiz.wrongCount };
    quiz = null;
    go('result', r);
  }

  // ===== ドリルのタイマー =====
  function stopTimer() {
    if (timer) { clearInterval(timer.iv); timer = null; }
    releaseWakeLock();
  }

  let wakeLock = null;
  async function requestWakeLock() {
    try { if (navigator.wakeLock) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { /* 対応していない端末 */ }
  }
  function releaseWakeLock() {
    if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
  }

  function startTimer() {
    const d = window.DRILLS.find(x => x.id === params.id);
    Sound.ensure();
    requestWakeLock();
    stopTimerInterval();
    timer = { d, set: 0, phase: 'count', remain: 3, paused: false };
    Sound.beep(660, 0.12);
    timer.iv = setInterval(tick, 1000);
    updateTimer();
  }

  function stopTimerInterval() { if (timer) clearInterval(timer.iv); }

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
        Sound.beep(523, 0.4);
        Sound.say('休けい');
      } else {
        timer.phase = 'done';
        clearInterval(timer.iv);
        releaseWakeLock();
        Sound.fanfare();
        Sound.say('おわり！よくがんばったね');
      }
    }
    updateTimer();
  }

  const setLabel = (d, i) => (d.setLabels && d.setLabels[i]) || '';

  function updateTimer() {
    const el = id => document.getElementById(id);
    if (!timer || !el('tm-sec')) return;
    const { d, phase, set, remain, paused } = timer;
    const label = setLabel(d, set);
    el('timer').className = `timer card ph-${phase}`;
    el('tm-label').textContent = phase === 'count' ? 'よーい…' : phase === 'rest' ? '休けい（つぎのじゅんび）' : phase === 'done' ? 'おわり！' : (label || 'がんばれ！');
    el('tm-sec').textContent = phase === 'done' ? '🎉' : remain;
    el('tm-set').textContent = phase === 'done' ? `${d.sets}セット 全部できた！` : `セット ${set + 1} / ${d.sets}${phase === 'rest' && label ? ` つぎは ${label}` : ''}`;
    el('tm-btns').innerHTML = phase === 'done'
      ? `<button class="btn btn-primary" data-act="drillDone">できた！ XPをもらう</button>`
      : `<button class="btn" data-act="tmPause">${paused ? 'さいかい' : '一時ていし'}</button><button class="btn" data-act="tmReset">さいしょから</button>`;
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
    toast(`+${gain}XP ${first ? Object.entries(d.stat).map(([k, v]) => `${STAT_INFO[k].icon}+${v}`).join(' ') : ''}`);
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
      case 'startStage': {
        const list = shuffle(window.QUESTIONS.filter(q => q.stage === el.dataset.id));
        startQuiz(list, { stageId: el.dataset.id, review: false });
        break;
      }
      case 'startReview': {
        const list = shuffle(window.QUESTIONS.filter(q => p.wrong.includes(q.id))).slice(0, 10);
        if (list.length) startQuiz(list, { review: true });
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
