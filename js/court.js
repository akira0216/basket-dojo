// ハーフコートのSVGを作る
// 1m = 20px（コートはば15m → 300px、ハーフコート14m → 280px）。上がゴール側。
window.Court = (() => {
  const W = 300, H = 280;
  const BX = 150, BY = 31.5; // リングの中心
  const ARC_Y = 59.8;        // 3ポイントの直線とアーチのつなぎ目

  const AREAS = {
    paint: `<rect x="101" y="0" width="98" height="116" />`,
    three: `<path d="M0 0 L18 0 L18 ${ARC_Y} A135 135 0 0 0 282 ${ARC_Y} L282 0 L300 0 L300 280 L0 280 Z" />`,
    center: `<path d="M114 280 A36 36 0 0 1 186 280 Z" />`,
  };
  const LINES = {
    ft: `<line x1="101" y1="116" x2="199" y2="116" />`,
  };

  function svg(opt = {}) {
    const hl = opt.highlight || [];
    const areas = hl.filter(k => AREAS[k]).map(k => AREAS[k]).join('');
    const lines = hl.filter(k => LINES[k]).map(k => LINES[k]).join('');
    const players = (opt.players || []).map(p => p.t === 'x'
      ? `<g class="pl-def"><line x1="${p.x - 8}" y1="${p.y - 8}" x2="${p.x + 8}" y2="${p.y + 8}"/><line x1="${p.x + 8}" y1="${p.y - 8}" x2="${p.x - 8}" y2="${p.y + 8}"/><text x="${p.x + 10}" y="${p.y - 8}">${p.label || ''}</text></g>`
      : `<g class="pl-off"><circle cx="${p.x}" cy="${p.y}" r="10"/><text x="${p.x}" y="${p.y + 4}">${p.label || ''}</text></g>`).join('');

    return `<svg class="court" viewBox="0 0 ${W} ${H}" role="img" aria-label="ハーフコートの図">
  <rect class="floor" x="0" y="0" width="${W}" height="${H}" />
  <g class="hl-area">${areas}</g>
  <g class="lines">
    <rect x="0" y="0" width="${W}" height="${H}" />
    <rect x="101" y="0" width="98" height="116" />
    <path d="M114 116 A36 36 0 0 0 186 116" />
    <path class="dash" d="M114 116 A36 36 0 0 1 186 116" />
    <path d="M18 0 L18 ${ARC_Y} A135 135 0 0 0 282 ${ARC_Y} L282 0" />
    <path d="M125 ${BY} A25 25 0 0 0 175 ${BY}" />
    <path d="M114 280 A36 36 0 0 1 186 280" />
    <line x1="135" y1="24" x2="165" y2="24" />
    <circle cx="${BX}" cy="${BY}" r="4.5" />
  </g>
  <g class="hl-line">${lines}</g>
  <g class="players">${players}</g>
</svg>`;
  }

  return { svg };
})();
