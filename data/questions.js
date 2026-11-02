// クイズのしくみ（問題そのものは quiz-b2.js / quiz-b1.js / quiz-bp.js）
//
// 1問の書き方: [ルール, 問題文, [正しい答え, まちがい, まちがい, まちがい], 説明, コート図(なくてもよい)]
//   ルール: 'c'=共通 / 'm'=ミニバス / 'g'=中学・一般
//   選たくしは表示のときにシャッフルされるので、正しい答えはいつも先頭に書く
//
// コート図の書き方:
//   hl:    色をつける場所（paint / three / center / nocharge / ft / side / end / centerline / board）
//   o:     オフェンス { 番号: 場所 }   x: ディフェンス { 番号: 守る相手の場所 }
//          場所は top / ls / rs / lw / rw / lc / rc / lp / rp / le / re / hp / bk / lbk / rbk / mid か [x, y]
//   ball:  ボールを持っているオフェンスの番号
//   move:  [[選手, 行き先, 順番, 'cut'|'drive'|'screen'], ...]   pass: [[出す人, もらう人, 順番], ...]
//   line:  { x1: 1, x2: 2 } で 1線・2線・3線の色をつける
//
// 問題のIDは「ステージID-何番目」なので、問題はステージの最後に追加していくこと
// （とちゅうに入れると、ふくしゅうや全問制覇の記録がずれる）

window.STAGES = [];
window.QUESTIONS = [];

window.addStage = (stage, items) => {
  window.STAGES.push(stage);
  items.forEach((it, i) => {
    const [r, q, choices, explain, court] = it;
    window.QUESTIONS.push({
      id: `${stage.id}-${String(i + 1).padStart(2, '0')}`,
      stage: stage.id,
      rule: { c: 'common', m: 'mini', g: 'general' }[r] || 'common',
      q, choices, answer: 0, explain, court,
    });
  });
};
