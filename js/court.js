// ハーフコートのSVGを作る（選手・パス・動きのアニメーションつき）
// 1m = 20px（コートはば15m → 300px、ハーフコート14m → 280px）。上がゴール側。
window.Court = (() => {
  const W = 300, H = 280;
  const BX = 150, BY = 31.5; // リングの中心
  const ARC_Y = 59.8;        // 3ポイントの直線とアーチのつなぎ目

  // よく使う場所（問題データでは名前で指定できる）
  const SPOTS = {
    top: [150, 192], ls: [92, 178], rs: [208, 178],
    lw: [42, 128], rw: [258, 128], lc: [22, 22], rc: [278, 22],
    lp: [112, 62], rp: [188, 62], le: [104, 116], re: [196, 116], hp: [150, 112],
    bk: [150, 52], lbk: [128, 50], rbk: [172, 50], mid: [150, 262],
  };
  const P = v => Array.isArray(v) ? v : (SPOTS[v] || [150, 150]);
  // ディフェンスは、守る相手の場所からゴール寄りに少し下がった所に置く
  const toward = (p, d = 22) => {
    const vx = BX - p[0], vy = BY - p[1];
    const len = Math.hypot(vx, vy) || 1;
    return [p[0] + vx / len * d, p[1] + vy / len * d];
  };
  const ballAt = p => [p[0] + 10, p[1] - 10];

  const AREAS = {
    paint: `<rect x="101" y="0" width="98" height="116" />`,
    three: `<path d="M0 0 L18 0 L18 ${ARC_Y} A135 135 0 0 0 282 ${ARC_Y} L282 0 L300 0 L300 280 L0 280 Z" />`,
    center: `<path d="M114 280 A36 36 0 0 1 186 280 Z" />`,
    nocharge: `<path d="M125 ${BY} A25 25 0 0 0 175 ${BY} Z" />`,
    front: `<rect x="0" y="0" width="300" height="280" />`,
  };
  const LINES = {
    ft: `<line x1="101" y1="116" x2="199" y2="116" />`,
    side: `<line x1="0" y1="0" x2="0" y2="280" /><line x1="300" y1="0" x2="300" y2="280" />`,
    end: `<line x1="0" y1="0" x2="300" y2="0" />`,
    centerline: `<line x1="0" y1="280" x2="300" y2="280" />`,
    board: `<line x1="135" y1="24" x2="165" y2="24" />`,
  };

  const anims = {};
  let seq = 0;

  // 選手の動きを「場面（フレーム）」の列にする
  function build(c) {
    const pl = {};
    Object.entries(c.o || {}).forEach(([n, s]) => { pl['o' + n] = { t: 'o', n, pos: P(s) }; });
    Object.entries(c.x || {}).forEach(([n, s]) => { pl['x' + n] = { t: 'x', n, pos: Array.isArray(s) ? s : toward(P(s)) }; });

    const cur = {};
    Object.keys(pl).forEach(k => { cur[k] = pl[k].pos; });
    let holder = c.ball ? 'o' + c.ball : null;
    const frames = [{ pl: { ...cur }, ball: holder ? ballAt(cur[holder]) : null }];
    const arrows = [];
    const moves = c.move || [];
    const passes = c.pass || [];
    const steps = [...new Set([...moves.map(m => m[2] || 1), ...passes.map(p => p[2] || 1)])].sort((a, b) => a - b);

    steps.forEach(s => {
      moves.filter(m => (m[2] || 1) === s).forEach(([k, to, , type]) => {
        if (!cur[k]) return;
        // ディフェンスが場所の名前で動くときは、その場所の相手を守る位置にする
        const dest = k[0] === 'x' && !Array.isArray(to) ? toward(P(to)) : P(to);
        arrows.push({ from: cur[k], to: dest, type: type || (k === holder ? 'drive' : 'cut') });
        cur[k] = dest;
      });
      passes.filter(p => (p[2] || 1) === s).forEach(([a, b]) => {
        if (!cur[a] || !cur[b]) return;
        arrows.push({ from: cur[a], to: cur[b], type: 'pass' });
        holder = b;
      });
      frames.push({ pl: { ...cur }, ball: holder ? ballAt(cur[holder]) : null });
    });
    return { pl, frames, arrows };
  }

  function arrowSvg(a, mid) {
    const [x1, y1] = a.from, [x2, y2] = a.to;
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (len < 20) return '';
    const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    const sx = x1 + ux * 13, sy = y1 + uy * 13;
    const ex = x2 - ux * 14, ey = y2 - uy * 14;
    if (a.type === 'screen') {
      const nx = -uy * 9, ny = ux * 9;
      return `<g class="ar screen"><line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}"/><line x1="${ex + nx}" y1="${ey + ny}" x2="${ex - nx}" y2="${ey - ny}"/></g>`;
    }
    if (a.type === 'drive') {
      // ドリブルはジグザグの線
      const pts = [];
      const n = Math.max(4, Math.floor((len - 27) / 7));
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const off = i === 0 || i === n ? 0 : (i % 2 ? 4 : -4);
        pts.push(`${sx + (ex - sx) * t - uy * off},${sy + (ey - sy) * t + ux * off}`);
      }
      return `<polyline class="ar drive" points="${pts.join(' ')}" marker-end="url(#${mid})"/>`;
    }
    return `<line class="ar ${a.type}" x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" marker-end="url(#${mid})"/>`;
  }

  const tf = p => `transform:translate(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px)`;

  function svg(opt = {}) {
    const id = 'ct' + (++seq);
    const hl = opt.hl || opt.highlight || [];
    const areas = hl.filter(k => AREAS[k]).map(k => AREAS[k]).join('');
    const lines = hl.filter(k => LINES[k]).map(k => LINES[k]).join('');
    const { pl, frames, arrows } = build(opt);
    const lineOf = opt.line || {};
    const f0 = frames[0];

    const players = Object.entries(pl).map(([k, p]) => {
      const ln = lineOf[k] ? ` l${lineOf[k]}` : '';
      const tag = lineOf[k] ? `<text class="ln" y="-16">${lineOf[k]}線</text>` : '';
      return p.t === 'x'
        ? `<g class="pl def${ln}" data-k="${k}" style="${tf(f0.pl[k])}"><circle class="hit" r="11"/><path d="M-6 -6 L6 6 M6 -6 L-6 6"/><text class="nm" x="9" y="13">${p.n}</text>${tag}</g>`
        : `<g class="pl off" data-k="${k}" style="${tf(f0.pl[k])}"><circle r="11"/><text class="nm" y="4.5">${p.n}</text>${tag}</g>`;
    }).join('');
    const ball = f0.ball ? `<circle class="ball" data-k="ball" r="5.5" style="${tf(f0.ball)}"/>` : '';

    if (frames.length > 1) anims[id] = frames;

    return `<svg class="court" id="${id}" viewBox="-4 -4 ${W + 8} ${H + 8}" role="img" aria-label="ハーフコートの図">
  <defs><marker id="${id}-ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z"/></marker></defs>
  <rect class="floor" x="-4" y="-4" width="${W + 8}" height="${H + 8}" />
  <g class="hl-area">${areas}</g>
  <g class="lines">
    <rect x="0" y="0" width="${W}" height="${H}" />
    <rect class="key" x="101" y="0" width="98" height="116" />
    <path d="M114 116 A36 36 0 0 0 186 116" />
    <path class="dash" d="M114 116 A36 36 0 0 1 186 116" />
    <path d="M18 0 L18 ${ARC_Y} A135 135 0 0 0 282 ${ARC_Y} L282 0" />
    <path d="M125 ${BY} A25 25 0 0 0 175 ${BY}" />
    <path d="M114 280 A36 36 0 0 1 186 280" />
    <line x1="135" y1="24" x2="165" y2="24" />
    <circle class="rim" cx="${BX}" cy="${BY}" r="4.5" />
  </g>
  <g class="hl-line">${lines}</g>
  <g class="arrows">${arrows.map(a => arrowSvg(a, id + '-ah')).join('')}</g>
  <g class="players">${players}${ball}</g>
</svg>`;
  }

  function apply(el, frame) {
    el.querySelectorAll('[data-k]').forEach(g => {
      const k = g.dataset.k;
      const p = k === 'ball' ? frame.ball : frame.pl[k];
      if (p) g.style.transform = `translate(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px)`;
    });
  }

  // 動きを最初から再生する
  function play(id) {
    const el = document.getElementById(id);
    const frames = anims[id];
    if (!el || !frames) return;
    clearTimeout(el._t);
    el.classList.add('no-tr');
    apply(el, frames[0]);
    void el.getBoundingClientRect();
    el.classList.remove('no-tr');
    el.classList.add('playing');
    let i = 1;
    const next = () => {
      if (i >= frames.length) { el.classList.remove('playing'); return; }
      apply(el, frames[i++]);
      el._t = setTimeout(next, 1250);
    };
    el._t = setTimeout(next, 500);
  }

  const hasAnim = html => /id="(ct\d+)"/.test(html) && !!anims[html.match(/id="(ct\d+)"/)[1]];

  return { svg, play, hasAnim };
})();
