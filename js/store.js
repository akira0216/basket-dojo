// 記録の保存・読み込み（端末の中の localStorage に保存）
window.Store = (() => {
  const KEY = 'basketDojo.v1';
  const STAT_KEYS = ['shoot', 'dribble', 'pass', 'defense', 'physical', 'iq'];

  function newProfile(name, avatar) {
    return fillDefaults({
      id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name, avatar,
    });
  }

  // 古いデータや読み込んだデータに足りない項目をおぎなう
  function fillDefaults(p) {
    p.xp = p.xp || 0;
    p.stats = p.stats || {};
    STAT_KEYS.forEach(k => { p.stats[k] = p.stats[k] || 0; });
    p.stages = p.stages || {};       // stageId -> { stars, bestRate }
    p.wrong = p.wrong || [];         // ふくしゅうする問題のID
    p.solved = p.solved || [];       // 1回でもせいかいした問題のID（全問制覇の記録）
    p.drillCount = p.drillCount || {};
    p.drillDay = p.drillDay || {};   // drillId -> 最後にXPをもらった日
    p.days = p.days || [];           // 練習した日（YYYY-MM-DD）
    p.daily = p.daily || { date: '', quiz: 0, drill: 0, done: false };
    p.badges = p.badges || [];
    p.skills = p.skills || [];
    p.quizTotal = p.quizTotal || 0;
    return p;
  }

  function load() {
    try {
      const s = localStorage.getItem(KEY);
      if (s) {
        const d = JSON.parse(s);
        d.profiles = (d.profiles || []).map(fillDefaults);
        return d;
      }
    } catch (e) { console.warn('load failed', e); }
    return { version: 1, profiles: [], currentId: null };
  }

  let data = load();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); }
    catch (e) { console.warn('save failed', e); }
  }

  function current() {
    return data.profiles.find(p => p.id === data.currentId) || null;
  }

  function setCurrent(id) { data.currentId = id; save(); }

  function addProfile(name, avatar) {
    const p = newProfile(name, avatar);
    data.profiles.push(p);
    data.currentId = p.id;
    save();
    return p;
  }

  function exportText() {
    return JSON.stringify({ app: 'basket-dojo', version: 1, exportedAt: new Date().toISOString(), data });
  }

  function importText(text) {
    const obj = JSON.parse(text);
    if (!obj || obj.app !== 'basket-dojo' || !obj.data || !Array.isArray(obj.data.profiles)) {
      throw new Error('バスケ道場のバックアップではありません');
    }
    obj.data.profiles = obj.data.profiles.map(fillDefaults);
    data = obj.data;
    save();
  }

  return {
    get data() { return data; },
    STAT_KEYS, save, current, setCurrent, addProfile, exportText, importText,
  };
})();
