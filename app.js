/* ============================================================
   观星纪 · THE ASTRAL LEDGER — client-side reading engine
   All computation happens locally. Nothing is transmitted.
   ============================================================ */
(function () {
'use strict';

/* ---------- non-blocking web fonts ---------- */
try {
  const fl = document.createElement('link');
  fl.rel = 'stylesheet';
  fl.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&family=Noto+Serif+SC:wght@400;500&display=swap';
  document.head.appendChild(fl);
} catch (e) {}

/* ---------- starfield ---------- */
(function starfield() {
  const cv = document.getElementById('sky');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, stars = [], mx = 0, my = 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize() {
    W = cv.width = window.innerWidth;
    H = cv.height = window.innerHeight;
    stars = Array.from({ length: Math.min(190, Math.round(W * H / 9000)) }, function () {
      return {
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.15 + .2,
        a: Math.random() * .55 + .12,
        s: Math.random() * .012 + .003,
        d: Math.random() * Math.PI * 2
      };
    });
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    for (const st of stars) {
      const alpha = st.a * (.65 + .35 * Math.sin(t * st.s + st.d));
      ctx.beginPath();
      ctx.arc(st.x + mx * (st.r * 7), st.y + my * (st.r * 7), st.r, 0, 6.283);
      ctx.fillStyle = 'rgba(226,208,168,' + alpha.toFixed(3) + ')';
      ctx.fill();
    }
    if (!reduced) requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', function (e) {
    mx = (e.clientX / window.innerWidth - .5) * 2;
    my = (e.clientY / window.innerHeight - .5) * 2;
  }, { passive: true });
  resize();
  if (reduced) draw(0); else requestAnimationFrame(draw);
})();

/* ---------- reveal on scroll ---------- */
const revealObserver = ('IntersectionObserver' in window)
  ? new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); revealObserver.unobserve(en.target); }
      });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' })
  : null;
function observeReveals(root) {
  (root || document).querySelectorAll('.reveal:not(.in)').forEach(function (el, i) {
    if (revealObserver) revealObserver.observe(el);
    else setTimeout(function () { el.classList.add('in'); }, i * 60);
  });
}
observeReveals();

/* ============================================================
   DATA
   ============================================================ */
const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const GAN_WX = ['木','木','火','火','土','土','金','金','水','水'];
const ZHI_WX = ['水','土','木','木','土','火','火','土','金','金','土','水'];
const WX_COLOR = { '木':'#83a99f', '火':'#b5563f', '土':'#c8a86b', '金':'#d9cfb6', '水':'#7f97b8' };
const WX_ORDER = ['木','火','土','金','水'];
const SHENG = { '木':'火','火':'土','土':'金','金':'水','水':'木' };
const KE = { '木':'土','土':'水','水':'火','火':'金','金':'木' };
const CANG = {
  0:['癸'], 1:['己','癸','辛'], 2:['甲','丙','戊'], 3:['乙'],
  4:['戊','乙','癸'], 5:['丙','戊','庚'], 6:['丁','己'], 7:['己','丁','乙'],
  8:['庚','壬','戊'], 9:['辛'], 10:['戊','辛','丁'], 11:['壬','甲']
};
const NAYIN = ['海中金','炉中火','大林木','路旁土','剑锋金','山头火','涧下水','城头土','白蜡金','杨柳木',
  '泉中水','屋上土','霹雳火','松柏木','长流水','沙中金','山下火','平地木','壁上土','金箔金',
  '覆灯火','天河水','大驿土','钗钏金','桑柘木','大溪水','沙中土','天上火','石榴木','大海水'];
const JIE = [
  { m:1,  d:6, order:12, zhi:1,  name:'小寒' },
  { m:2,  d:4, order:1,  zhi:2,  name:'立春' },
  { m:3,  d:6, order:2,  zhi:3,  name:'惊蛰' },
  { m:4,  d:5, order:3,  zhi:4,  name:'清明' },
  { m:5,  d:6, order:4,  zhi:5,  name:'立夏' },
  { m:6,  d:6, order:5,  zhi:6,  name:'芒种' },
  { m:7,  d:7, order:6,  zhi:7,  name:'小暑' },
  { m:8,  d:8, order:7,  zhi:8,  name:'立秋' },
  { m:9,  d:8, order:8,  zhi:9,  name:'白露' },
  { m:10, d:8, order:9,  zhi:10, name:'寒露' },
  { m:11, d:7, order:10, zhi:11, name:'立冬' },
  { m:12, d:7, order:11, zhi:0,  name:'大雪' }
];
const PALACE_NAMES = ['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','交友','官禄','田宅','福德','父母'];
const PALACE_POS = { // zhi index -> [grid-column, grid-row]
  5:[1,1], 6:[1,2], 7:[1,3], 8:[1,4],
  4:[2,1], 9:[2,4], 3:[3,1], 10:[3,4],
  2:[4,1], 1:[4,2], 0:[4,3], 11:[4,4]
};
const ZIWEI_SYSTEM = { '紫微':0, '天机':-1, '太阳':-3, '武曲':-4, '天同':-5, '廉贞':-8 };
const TIANFU_SYSTEM = { '天府':0, '太阴':1, '贪狼':2, '巨门':3, '天相':4, '天梁':5, '七杀':6, '破军':10 };
const STAR_WORDS = {
  '紫微':'气象尊而不自用，宜借势而行，忌一意独断。',
  '天机':'思绪如纶，动处生变，静处反明。',
  '太阳':'光有所及，亦有所灼；施与之间留三分。',
  '武曲':'刚而能断，收束见力；过刚则宜自缓。',
  '天同':'缓中有福，最忌自扰，顺其自然反得。',
  '廉贞':'情理相缠，囚与放只在一念之宽。',
  '天府':'库藏有余，守成为上，开仓须知其时。',
  '太阴':'盈亏有候，夜深者自明，不必与昼争。',
  '贪狼':'欲与趣并生，杂而能博，贵在择一。',
  '巨门':'言语是门亦是障，多听而少断。',
  '天相':'辅佐之器，权衡得宜则四下安稳。',
  '天梁':'荫庇自生，逢事有解，宜先立规矩。',
  '七杀':'动静皆急，宜以缓制之，以久持之。',
  '破军':'破而后立，旧局不必留恋，亦不必急弃。'
};
const TAROT = [
  { n:'愚者',   e:'THE FOOL',            up:'启程 · 未定',  dn:'躁进 · 失据',  word:'一切尚未命名，正因其未定，才有余地。' },
  { n:'魔术师', e:'THE MAGICIAN',        up:'着手 · 具足',  dn:'耗散 · 虚张',  word:'器具已在手，所缺的只是一念之专。' },
  { n:'女祭司', e:'THE HIGH PRIESTESS',  up:'静观 · 未显',  dn:'闭塞 · 自疑',  word:'帘幕未启，答案多半在沉默里成形。' },
  { n:'皇后',   e:'THE EMPRESS',         up:'滋长 · 丰盈',  dn:'过养 · 停滞',  word:'生长不须催促，时节自有其宽厚。' },
  { n:'皇帝',   e:'THE EMPEROR',         up:'立序 · 持重',  dn:'僵固 · 独断',  word:'有边界方有安稳，然界亦需留门。' },
  { n:'教皇',   e:'THE HIEROPHANT',      up:'承袭 · 问礼',  dn:'成见 · 离经',  word:'旧法可依，亦可另解，取其安而不取其缚。' },
  { n:'恋人',   e:'THE LOVERS',          up:'相照 · 抉择',  dn:'犹疑 · 分岔',  word:'所谓选择，多是看清了自己所重之物。' },
  { n:'战车',   e:'THE CHARIOT',         up:'推进 · 持辔',  dn:'失控 · 急行',  word:'前行不难，难在始终握得住缰。' },
  { n:'力量',   e:'STRENGTH',            up:'柔制 · 涵容',  dn:'强撑 · 内耗',  word:'真正持久之力，往往不以力显。' },
  { n:'隐者',   e:'THE HERMIT',          up:'内省 · 独明',  dn:'隔绝 · 久默',  word:'一盏灯只照一程，够了，不必照尽全程。' },
  { n:'命运之轮', e:'WHEEL OF FORTUNE',  up:'转机 · 循环',  dn:'迟滞 · 复沓',  word:'轮转不以人的急缓为意，顺其势可矣。' },
  { n:'正义',   e:'JUSTICE',             up:'权衡 · 持平',  dn:'偏倚 · 迟决',  word:'秤的两端，一端是事，一端是自心。' },
  { n:'倒吊人', e:'THE HANGED MAN',      up:'悬置 · 换目',  dn:'空耗 · 僵持',  word:'暂不行动，也是一种看得更清的方式。' },
  { n:'死神',   e:'DEATH',               up:'更替 · 落幕',  dn:'恋旧 · 缓变',  word:'此牌只说旧章合卷，不言他事。' },
  { n:'节制',   e:'TEMPERANCE',          up:'调和 · 有度',  dn:'失衡 · 过与不及', word:'两盏之间往复，分寸即为全部答案。' },
  { n:'恶魔',   e:'THE DEVIL',           up:'牵系 · 执著',  dn:'松缚 · 觉知',  word:'链子多半是松的，只是尚未低头去看。' },
  { n:'高塔',   e:'THE TOWER',           up:'骤变 · 去蔽',  dn:'余震 · 内崩',  word:'凡不必要者先落，落后方见地基。' },
  { n:'星星',   e:'THE STAR',            up:'微光 · 可期',  dn:'远望 · 气弱',  word:'光不必大，能续着便好。' },
  { n:'月亮',   e:'THE MOON',            up:'朦胧 · 影动',  dn:'渐明 · 疑散',  word:'夜路里所见，半是实景，半是心影。' },
  { n:'太阳',   e:'THE SUN',             up:'朗照 · 舒展',  dn:'云翳 · 稍敛',  word:'明处宜行，亦宜记得留一处阴凉。' },
  { n:'审判',   e:'JUDGEMENT',           up:'回响 · 重整',  dn:'迟疑 · 旧声',  word:'旧日之声会回来，但已不必照着唱。' },
  { n:'世界',   e:'THE WORLD',           up:'圆成 · 归位',  dn:'未竟 · 待合',  word:'一圈既合，下一圈便已在起处。' }
];
const STAGE_WORDS = ['蓄','萌','长','盛','转','敛','藏','养'];
const ADVICE_YI = [
  '顺四时以作息，勿与昼夜相争。',
  '每日留一段「无用之时」，养神胜于养形。',
  '动以缓为主，久坐则起身，久思则搁笔。',
  '亲近水木与开阔处，让目光有远可落。',
  '少思、多眠、言语留白，是长久之资。',
  '把力气分给来日，不必一日用尽。',
  '规律而清淡，比骤然的进补更相宜。',
  '与人和缓相处，情绪亦需有出有入。'
];
const ADVICE_JI = [
  '忌以一时之盛，透支往后之力。',
  '忌骤进骤止，节律一乱，恢复最费时。',
  '忌久郁不发，闷处宜开窗、宜寻人语。',
  '忌以他人之尺，量自家之缓急。',
  '忌夜间劳神，暗处最易放大细事。',
  '忌把象喻当作结论，反复求证反自扰。'
];

/* ============================================================
   UTILITIES
   ============================================================ */
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
  });
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function gzIndex(g, z) {
  for (let i = 0; i < 60; i++) if (i % 10 === g && i % 12 === z) return i;
  return 0;
}
function ganzhi(g, z) { return GAN[g] + ZHI[z]; }
function nayinOf(i) { return NAYIN[Math.floor(i / 2)]; }
function tenGod(dg, og) {
  const a = GAN_WX[dg], b = GAN_WX[og], same = (dg % 2) === (og % 2);
  if (a === b) return same ? '比肩' : '劫财';
  if (SHENG[a] === b) return same ? '食神' : '伤官';
  if (KE[a] === b) return same ? '偏财' : '正财';
  if (KE[b] === a) return same ? '七杀' : '正官';
  if (SHENG[b] === a) return same ? '偏印' : '正印';
  return '';
}
function jdn(y, m, d) {
  const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}
function pick(arr, r) { return arr[Math.floor(r() * arr.length)]; }

/* ============================================================
   CHART ENGINE
   ============================================================ */
function buildChart(input) {
  const y = input.y, m = input.m, d = input.d, t = input.t;

  /* --- solar term / month pillar --- */
  let jie = null;
  for (const j of JIE) if (m > j.m || (m === j.m && d >= j.d)) jie = j;
  if (!jie) jie = { m:12, d:7, order:11, zhi:0, name:'大雪' }; // early Jan belongs to previous Zi month
  const monthOrder = jie.order;

  /* --- year pillar (Li Chun boundary) --- */
  const beforeLiChun = (m < 2) || (m === 2 && d < 4);
  const chartYear = beforeLiChun ? y - 1 : y;
  const yearIdx = ((chartYear - 4) % 60 + 60) % 60;
  const yearGan = yearIdx % 10, yearZhi = yearIdx % 12;

  /* --- month pillar (Five Tigers) --- */
  const yinGan = ((yearGan % 5) * 2 + 2) % 10;
  const monthGan = (yinGan + monthOrder - 1) % 10;
  const monthZhi = jie.zhi;

  /* --- day pillar (Julian day number) --- */
  const dayIdx = ((jdn(y, m, d) + 49) % 60 + 60) % 60;
  const dayGan = dayIdx % 10, dayZhi = dayIdx % 12;

  /* --- hour pillar (Five Rats) --- */
  const ziGan = (dayGan % 5) * 2;
  const hourGan = (ziGan + t) % 10, hourZhi = t;

  const pillars = [
    { label:'年 柱', g:yearGan,  z:yearZhi,  i:gzIndex(yearGan, yearZhi) },
    { label:'月 柱', g:monthGan, z:monthZhi, i:gzIndex(monthGan, monthZhi) },
    { label:'日 柱', g:dayGan,   z:dayZhi,   i:gzIndex(dayGan, dayZhi) },
    { label:'时 柱', g:hourGan,  z:hourZhi,  i:gzIndex(hourGan, hourZhi) }
  ];
  pillars.forEach(function (p, k) {
    p.name = ganzhi(p.g, p.z);
    p.nayin = nayinOf(p.i);
    p.cang = CANG[p.z].join(' · ');
    p.god = k === 2 ? '日主' : tenGod(dayGan, p.g);
  });

  /* --- five elements, weighted by hidden stems --- */
  const wx = { '木':0, '火':0, '土':0, '金':0, '水':0 };
  pillars.forEach(function (p) {
    wx[GAN_WX[p.g]] += 1;
    CANG[p.z].forEach(function (c, k) { wx[GAN_WX[GAN.indexOf(c)]] += (k === 0 ? 1 : .45); });
  });
  const wxTotal = WX_ORDER.reduce(function (s, k) { return s + wx[k]; }, 0);
  const wxPct = {}; WX_ORDER.forEach(function (k) { wxPct[k] = Math.round(wx[k] / wxTotal * 100); });
  const dominant = WX_ORDER.slice().sort(function (a, b) { return wx[b] - wx[a]; })[0];
  const weakest = WX_ORDER.slice().sort(function (a, b) { return wx[a] - wx[b]; })[0];
  const spread = wxPct[dominant] - wxPct[weakest];
  const balance = clamp(1 - spread / 55, 0, 1);

  /* --- day-master strength --- */
  let strength = 34;
  const dmWx = GAN_WX[dayGan];
  if (ZHI_WX[monthZhi] === dmWx || SHENG[ZHI_WX[monthZhi]] === dmWx) strength += 22;
  else strength -= 8;
  pillars.forEach(function (p, k) {
    if (k === 2) return;
    if (GAN_WX[p.g] === dmWx || SHENG[GAN_WX[p.g]] === dmWx) strength += 7;
  });
  CANG[dayZhi].forEach(function (c) { if (GAN_WX[GAN.indexOf(c)] === dmWx) strength += 5; });
  strength = clamp(Math.round(strength), 12, 92);
  const strengthWord = strength >= 63 ? '偏旺' : strength <= 40 ? '偏弱' : '中和';

  /* --- Zi Wei: ming / shen palaces, palace stems, five-element bureau --- */
  const mingZhi = ((monthOrder + 1) - t + 12) % 12;
  const shenZhi = ((monthOrder + 1) + t) % 12;
  const palaceGan = function (z) { return (yinGan + ((z - 2 + 12) % 12)) % 10; };
  const mingGan = palaceGan(mingZhi);
  const mingNayin = nayinOf(gzIndex(mingGan, mingZhi));
  const juName = { '水':'水二局', '木':'木三局', '金':'金四局', '土':'土五局', '火':'火六局' }[mingNayin.slice(-1)] || '土五局';
  const ju = { '水':2, '木':3, '金':4, '土':5, '火':6 }[mingNayin.slice(-1)] || 5;

  /* --- symbolic star layout (NOT a professional chart) --- */
  const seed = hash([y, m, d, t, input.gender, input.name].join('|'));
  const r = rng(seed);
  const ziweiZhi = (mingZhi + 2 + (d % 5) + (ju % 3)) % 12;
  const tianfuZhi = (ziweiZhi + 6 + (ju % 2)) % 12;
  const starsByZhi = Array.from({ length:12 }, function () { return []; });
  Object.keys(ZIWEI_SYSTEM).forEach(function (s) {
    const z = ((ziweiZhi + ZIWEI_SYSTEM[s]) % 12 + 12) % 12; starsByZhi[z].push(s);
  });
  Object.keys(TIANFU_SYSTEM).forEach(function (s) {
    const z = ((tianfuZhi + TIANFU_SYSTEM[s]) % 12 + 12) % 12; starsByZhi[z].push(s);
  });
  let mingStars = starsByZhi[mingZhi];
  let borrowed = false;
  if (!mingStars.length) { mingStars = starsByZhi[(mingZhi + 6) % 12]; borrowed = true; }
  const oppStars = starsByZhi[(mingZhi + 6) % 12];
  const palaceName = {};
  PALACE_NAMES.forEach(function (nm, k) { palaceName[((mingZhi - k) % 12 + 12) % 12] = nm; });

  /* --- Tarot: deterministic three-card spread --- */
  const lifeCard = ((y + m + d - 1) % 22 + 22) % 22;
  const used = {}; const cards = [];
  ['过 去','现 在','将 来'].forEach(function (pos, k) {
    let idx = Math.floor(r() * 22);
    let guard = 0;
    while (used[idx] && guard++ < 40) idx = Math.floor(r() * 22);
    used[idx] = 1;
    cards.push({ pos:pos, idx:idx, rev: r() > .64, k:k });
  });

  /* --- vitality arc (purely symbolic) --- */
  const phase = (mingZhi / 12) * Math.PI * 2 + (dayGan % 5) * .31;
  const pts = [];
  for (let i = 0; i < 9; i++) {
    let v = 57 + 15 * Math.sin(phase + i * .62) + 9 * Math.cos(phase * 1.7 + i * .9)
          + (balance - .5) * 12 + (strength - 50) * .06 + (r() - .5) * 7;
    pts.push({ age: 10 + i * 10, v: Math.round(clamp(v, 32, 86)) });
  }
  const stages = [];
  for (let s = 0; s < 4; s++) {
    const seg = pts.slice(s * 2, s * 2 + 3);
    const avg = seg.reduce(function (a, p) { return a + p.v; }, 0) / seg.length;
    const slope = seg[seg.length - 1].v - seg[0].v;
    let nm;
    if (slope > 9) nm = avg < 58 ? '萌' : '长';
    else if (slope < -9) nm = avg < 55 ? '藏' : '敛';
    else nm = avg > 66 ? '盛' : avg < 50 ? '转' : (s === 3 ? '养' : '蓄');
    if (!STAGE_WORDS.includes(nm)) nm = '蓄';
    stages.push({ age:(10 + s * 20) + '–' + (30 + s * 20), name:nm,
      note: s === 0 ? '立其根，宜宽不宜满。' : s === 1 ? '气渐盛，宜分力于长久。'
          : s === 2 ? '势有转，宜顺而勿强。' : '归于缓，宜养其从容。' });
  }
  const peakAge = pts.reduce(function (a, b) { return b.v > a.v ? b : a; }).age;

  /* --- flow-year note (2026 Bing Wu) --- */
  const flowGan = 2, flowZhi = 6; // 2026 · 丙午
  const flowRelation = (flowZhi === yearZhi) ? '与生年同支，谓之伏吟之象，宜守常'
    : ((flowZhi + 6) % 12 === yearZhi) ? '与生年相冲，动象偏多，宜缓行'
    : '与生年无冲无合，气象平平，宜自定其节奏';
  const flowWord = '丙午之年，火气炎上，' + flowRelation + '。' +
    (balance > .6 ? '五行尚匀，顺势即可，不必另作张罗。' : dominant + '气偏盛，宜以静事养之，勿添新局。');

  return {
    input:input, y:y, m:m, d:d, t:t, jie:jie, monthOrder:monthOrder,
    chartYear:chartYear, yearGan:yearGan, yearZhi:yearZhi,
    pillars:pillars, dayGan:dayGan, dayZhi:dayZhi,
    wx:wx, wxPct:wxPct, dominant:dominant, weakest:weakest, balance:balance,
    strength:strength, strengthWord:strengthWord,
    mingZhi:mingZhi, shenZhi:shenZhi, mingGan:mingGan, mingNayin:mingNayin,
    ju:ju, juName:juName, palaceGan:palaceGan, palaceName:palaceName,
    starsByZhi:starsByZhi, mingStars:mingStars, oppStars:oppStars, borrowed:borrowed,
    ziweiZhi:ziweiZhi, tianfuZhi:tianfuZhi,
    cards:cards, lifeCard:lifeCard, pts:pts, stages:stages, peakAge:peakAge,
    flowWord:flowWord, seed:seed, r:r
  };
}

/* ============================================================
   READING TEXT (deliberately imprecise)
   ============================================================ */
function makeReadings(c) {
  const r = c.r;
  const dm = GAN[c.dayGan] + GAN_WX[c.dayGan];
  const dominantWord = { '木':'生发','火':'炎上','土':'承载','金':'收敛','水':'流动' }[c.dominant];
  const weakWord = { '木':'疏朗','火':'温煦','土':'厚载','金':'清肃','水':'润下' }[c.weakest];
  const starText = c.mingStars.slice(0, 2).map(function (s) { return STAR_WORDS[s]; }).join('');
  const present = TAROT[c.cards[1].idx];
  const presentKey = c.cards[1].rev ? present.dn : present.up;

  const baziBody =
    '日主 <span class="q">' + esc(dm) + '</span>，生于' + esc(c.jie.name) + '之后，' +
    '得' + (c.strength >= 55 ? '令' : '地') + '而' + esc(c.strengthWord) + '。' +
    '四柱之间' + esc(c.dominant) + '气偏' + (c.wxPct[c.dominant] > 32 ? '盛' : '显') +
    '，' + esc(c.weakest) + '气稍薄；' + esc(dominantWord) + '与' + esc(weakWord) + '互为表里，' +
    '故其气象' + (c.balance > .62 ? '尚称匀停，缓急自有分寸' : '偏于一侧，宜以反侧之事调之') + '。' +
    '此柱所记者为<b>气候</b>，非关年岁长短。';
  const baziBasis = '据《渊海子平》「五行贵在中和」之意；取年以立春为界、月以节气为界、日以日辰起数、时以五鼠遁推之。仅列干支生克之象，不作吉凶断。';

  const ziweiBody =
    '命宫在' + esc(ZHI[c.mingZhi]) + '，身宫在' + esc(ZHI[c.shenZhi]) + '，' +
    '纳音' + esc(c.mingNayin) + '，定为' + esc(c.juName) + '。' +
    '命垣' + (c.borrowed ? '无正曜，借对宫之星观之' : '得') +
    '<span class="q">' + esc(c.mingStars.slice(0, 2).join(' · ') || '空宫') + '</span>' +
    (c.oppStars.length ? '，三方会' + esc(c.oppStars.slice(0, 2).join('、')) : '') + '。' +
    esc(starText) + '星曜所主，只是动静与明暗之势，不指具体事期。';
  const ziweiBasis = '参紫微星系逆布、天府星系顺布之相对格局，取「三方四正」会照之意。本站为意象简盘，星位以生辰意象排布，非专业命盘，不落流曜、四化与大小限。';

  const tarotBody =
    '过去得「' + esc(TAROT[c.cards[0].idx].n) + '」，现在得「' + esc(present.n) + '」' +
    (c.cards[1].rev ? '逆位' : '正位') + '，将来得「' + esc(TAROT[c.cards[2].idx].n) + '」。' +
    '三牌连读，现前一牌偏在<span class="q">' + esc(presentKey.split(' · ')[0]) + '</span>二字。' +
    esc(present.word) + '本命牌取「' + esc(TAROT[c.lifeCard].n) + '」，' +
    '只作一面镜子——照见此刻的心绪，不照见终局。';
  const tarotBasis = '以生辰为固定种子抽大阿卡纳三牌，正逆由种子定；牌义取荣格原型之象征读法，与术数盘互不印证、互不推论。';

  const syn =
    '合三术观之：<em>' + esc(c.dominant) + '气' + esc(dominantWord) + '</em>，日主' + esc(c.strengthWord) +
    '；命垣见<em>' + esc(c.mingStars.slice(0, 2).join(' · ') || '空宫借星') + '</em>，主' +
    (c.balance > .6 ? '静多于动' : '动多于静') + '；三牌以「<em>' + esc(present.n) + '</em>」居中，' +
    '示<em>' + esc(presentKey.split(' · ')[0]) + '</em>之候。' +
    '三处各说各话，却都指向同一件事：此盘之要，不在长短，而在<em>节律</em>——' +
    (c.balance > .6 ? '气既匀，则顺其自然，勿自生波澜。' : '气有偏，则于偏处留一寸余地，盛时知收，缓时知养。') +
    ' 至于岁月几何，术数无以为答，本站亦不作此想。';

  const yi = []; const ji = [];
  while (yi.length < 4) { const x = pick(ADVICE_YI, r); if (yi.indexOf(x) < 0) yi.push(x); }
  while (ji.length < 3) { const x = pick(ADVICE_JI, r); if (ji.indexOf(x) < 0) ji.push(x); }
  if (c.balance < .5) yi[0] = '五行' + c.dominant + '偏盛，宜以' + weakWord + '之事调之：缓、静、少争。';
  if (c.strengthWord === '偏弱') yi[1] = '日主偏柔，宜借势而行，勿以一人之力扛全程。';

  return {
    baziBody:baziBody, baziBasis:baziBasis,
    ziweiBody:ziweiBody, ziweiBasis:ziweiBasis,
    tarotBody:tarotBody, tarotBasis:tarotBasis,
    syn:syn, yi:yi, ji:ji
  };
}

/* ============================================================
   SVG HELPERS
   ============================================================ */
function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = 'M' + pts[0].x.toFixed(1) + ',' + pts[0].y.toFixed(1);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d += ' C' + c1x.toFixed(1) + ',' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ',' + c2y.toFixed(1) + ' ' + p2.x.toFixed(1) + ',' + p2.y.toFixed(1);
  }
  return d;
}
function glyph(kind, idx) {
  const g = idx % 6;
  const common = 'stroke="currentColor" stroke-width="1.1" fill="none"';
  if (kind === 'back') {
    return '<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="30" ' + common + ' opacity=".55"/><circle cx="40" cy="40" r="21" ' + common + ' opacity=".4"/><path d="M40 4v72M4 40h72M15 15l50 50M65 15L15 65" ' + common + ' opacity=".25"/><circle cx="40" cy="40" r="4" fill="currentColor" opacity=".8"/></svg>';
  }
  const shapes = [
    '<circle cx="30" cy="30" r="20" ' + common + '/><circle cx="30" cy="30" r="9" ' + common + '/><path d="M30 4v10M30 46v10M4 30h10M46 30h10" ' + common + '/>',
    '<path d="M30 5 55 52H5Z" ' + common + '/><circle cx="30" cy="32" r="7" ' + common + '/>',
    '<rect x="9" y="9" width="42" height="42" ' + common + ' transform="rotate(45 30 30)"/><circle cx="30" cy="30" r="8" ' + common + '/>',
    '<path d="M30 5c14 12 14 38 0 50C16 43 16 17 30 5Z" ' + common + '/><path d="M30 12v36M18 30h24" ' + common + '/>',
    '<path d="M8 44c8-24 16-24 22 0s14 24 22 0" ' + common + '/><circle cx="30" cy="14" r="5" ' + common + '/>',
    '<path d="M30 4v52M10 18l40 24M50 18L10 42" ' + common + '/><circle cx="30" cy="30" r="13" ' + common + '/>'
  ];
  return '<svg viewBox="0 0 60 60" aria-hidden="true">' + shapes[g] + '</svg>';
}

/* ============================================================
   RENDER
   ============================================================ */
function renderReading(c) {
  const t = makeReadings(c);
  const name = c.input.name || '无名氏';
  const gz = function (g, z) { return GAN[g] + ZHI[z]; };
  const dateText = c.y + ' 年 ' + c.m + ' 月 ' + c.d + ' 日 · ' + ZHI[c.t] + '时';

  /* pillars */
  const pillarsHtml = c.pillars.map(function (p) {
    return '<div class="pillar">' +
      '<div class="p-label">' + esc(p.label) + '</div>' +
      '<div class="p-gan">' + esc(GAN[p.g]) + '</div>' +
      '<div class="p-zhi">' + esc(ZHI[p.z]) + '</div>' +
      '<div class="p-foot"><b>' + esc(p.god) + ' · ' + esc(p.nayin) + '</b>藏干 ' + esc(p.cang) + '</div>' +
    '</div>';
  }).join('');

  /* elements */
  const elHtml = WX_ORDER.map(function (k) {
    return '<div class="el-row"><span class="el-name">' + k + '</span>' +
      '<span class="el-bar"><span class="el-fill" data-w="' + c.wxPct[k] + '" style="background:' + WX_COLOR[k] + '"></span></span>' +
      '<span class="el-count">' + c.wxPct[k] + '</span></div>';
  }).join('');

  /* palaces */
  let palacesHtml = '';
  for (let z = 0; z < 12; z++) {
    const pos = PALACE_POS[z];
    const stars = c.starsByZhi[z];
    const isMing = z === c.mingZhi, isShen = z === c.shenZhi;
    palacesHtml += '<div class="palace' + (isMing ? ' is-ming' : '') + (isShen ? ' is-shen' : '') +
      '" style="grid-column:' + pos[0] + ';grid-row:' + pos[1] + '">' +
      '<div class="p-head"><span class="p-name">' + esc(c.palaceName[z]) + '</span>' +
      '<span class="p-ganzhi">' + esc(gz(c.palaceGan(z), z)) + '</span></div>' +
      '<div class="p-stars">' + stars.map(function (s) {
        return '<span class="star' + (s === '紫微' || s === '天府' ? ' main' : '') + '">' + esc(s) + '</span>';
      }).join('') + '</div>' +
      (isMing ? '<span class="p-tag">命</span>' : '') +
      (isShen && !isMing ? '<span class="p-tag shen">身</span>' : '') +
    '</div>';
  }
  const centerHtml = '<div class="chart-center">' +
    '<div class="cc-symbol">' + glyph('back', 0) + '</div>' +
    '<div class="cc-title">' + esc(name) + '</div>' +
    '<div class="cc-sub">MING CHART</div>' +
    '<div class="cc-line"></div>' +
    '<div class="cc-detail">' + esc(c.input.gender === 'kun' ? '坤造' : '乾造') + ' · ' + esc(c.juName) + '<br>' +
      '命宫 ' + esc(gz(c.mingGan, c.mingZhi)) + '<br>身宫 ' + esc(ZHI[c.shenZhi]) + '宫</div>' +
  '</div>';

  /* tarot */
  const tarotHtml = c.cards.map(function (card) {
    const tk = TAROT[card.idx];
    const keys = card.rev ? tk.dn : tk.up;
    return '<div class="tarot-slot"><div class="ts-label">' + esc(card.pos) + '</div>' +
      '<div class="tarot-card" data-k="' + card.k + '" tabindex="0" role="button" aria-label="翻开塔罗牌">' +
        '<div class="tc-inner">' +
          '<div class="tc-back">' + glyph('back', card.idx) + '<span>ARCANA ' + String(card.idx).padStart(2,'0') + '</span></div>' +
          '<div class="tc-face">' +
            '<div class="tc-num">' + String(card.idx).padStart(2, '0') + ' / XXI</div>' +
            '<div class="tc-glyph">' + glyph('face', card.idx) + '</div>' +
            '<div class="tc-name">' + esc(tk.n) + '</div>' +
            '<div class="tc-en">' + esc(tk.e) + '</div>' +
            '<div class="tc-pos' + (card.rev ? ' rev' : '') + '">' + (card.rev ? '逆 位' : '正 位') + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="ts-key">' + esc(keys) + '</div>' +
    '</div>';
  }).join('');

  /* vitality svg */
  const W = 900, H = 300, x0 = 56, x1 = W - 30, y0 = 26, y1 = H - 44;
  const vpts = c.pts.map(function (p, i) {
    return { x: x0 + (i / 8) * (x1 - x0), y: y1 - (p.v / 100) * (y1 - y0), v:p.v, age:p.age };
  });
  const line = smoothPath(vpts);
  const area = line + ' L' + x1.toFixed(1) + ',' + y1 + ' L' + x0.toFixed(1) + ',' + y1 + ' Z';
  let grid = '';
  for (let g = 0; g <= 4; g++) {
    const yy = y0 + (g / 4) * (y1 - y0);
    grid += '<line class="vit-grid-line" x1="' + x0 + '" y1="' + yy + '" x2="' + x1 + '" y2="' + yy + '"/>';
  }
  let axis = '';
  c.pts.forEach(function (p, i) {
    axis += '<text class="vit-axis-text" x="' + vpts[i].x + '" y="' + (H - 14) + '" text-anchor="middle">' + p.age + '</text>';
  });
  let dots = '';
  vpts.forEach(function (p) { dots += '<circle class="vit-dot" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="3.4"/>'; });
  let bands = '';
  for (let s = 0; s < 4; s++) {
    const bx = x0 + (s / 4) * (x1 - x0);
    if (s % 2 === 0) bands += '<rect class="vit-band" x="' + bx.toFixed(1) + '" y="' + y0 + '" width="' + ((x1 - x0) / 4).toFixed(1) + '" height="' + (y1 - y0) + '"/>';
  }
  const vitSvg = '<svg class="vit-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="象征性的生命节律曲线">' +
    '<defs><linearGradient id="vitGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#c8a86b" stop-opacity=".28"/>' +
      '<stop offset="100%" stop-color="#c8a86b" stop-opacity="0"/>' +
    '</linearGradient></defs>' +
    bands + grid +
    '<text class="vit-axis-text" x="8" y="' + (y0 + 4) + '">盛</text>' +
    '<text class="vit-axis-text" x="8" y="' + (y1 + 4) + '">缓</text>' +
    '<path class="vit-area" d="' + area + '"/>' +
    '<path class="vit-line" d="' + line + '"/>' + dots + axis +
  '</svg>';
  const stageHtml = c.stages.map(function (s) {
    return '<div class="stage"><div class="stage-age">' + esc(s.age) + '</div>' +
      '<div class="stage-name">' + esc(s.name) + '</div>' +
      '<div class="stage-note">' + esc(s.note) + '</div></div>';
  }).join('');

  /* assembly */
  const html =
  '<div class="read-hero reveal">' +
    '<p class="read-hero-label">A READING OF RHYTHM · NOT OF ENDINGS</p>' +
    '<h2 class="read-hero-name"><span>' + esc(name) + '</span> · 命盘一观</h2>' +
    '<p class="read-hero-sub">Three lenses, one rhythm.</p>' +
    '<dl class="read-meta">' +
      '<div><dt>公 历 生 辰</dt><dd>' + esc(dateText) + '</dd></div>' +
      '<div><dt>四 柱 日 主</dt><dd>' + esc(GAN[c.dayGan] + GAN_WX[c.dayGan]) + '</dd></div>' +
      '<div><dt>命 宫</dt><dd>' + esc(gz(c.mingGan, c.mingZhi)) + ' · ' + esc(c.juName) + '</dd></div>' +
      '<div><dt>本 命 牌</dt><dd>' + esc(TAROT[c.lifeCard].n) + '</dd></div>' +
    '</dl>' +
  '</div>' +

  '<section class="read-section reveal">' +
    '<div class="read-section-head"><span class="rs-no">I</span><h3 class="rs-title">四柱 · 气候</h3><span class="rs-en">FOUR PILLARS</span></div>' +
    '<div class="pillars">' + pillarsHtml + '</div>' +
    '<div class="elements"><p class="el-title">五 行 分 布 · WEIGHTED BY HIDDEN STEMS</p>' + elHtml +
      '<p class="el-summary">以天干各一、地支本气一、中余气各半加权。<strong>' + esc(c.dominant) + '</strong>最显（' + c.wxPct[c.dominant] + '%），' +
      '<strong>' + esc(c.weakest) + '</strong>最薄（' + c.wxPct[c.weakest] + '%）；日主气势' + esc(c.strengthWord) +
      '，指数 ' + c.strength + ' / 100。此数仅描述盘面结构，与体格、寿数无关。</p>' +
    '</div>' +
  '</section>' +

  '<section class="read-section reveal">' +
    '<div class="read-section-head"><span class="rs-no">II</span><h3 class="rs-title">星垣 · 十二宫</h3><span class="rs-en">ZI WEI</span></div>' +
    '<div class="chart-layout">' +
      '<div class="chart-grid">' + palacesHtml + centerHtml + '</div>' +
      '<div class="chart-side">' +
        '<h4>命身与格局</h4><p class="cs-en">MING / SHEN / STRUCTURE</p>' +
        '<dl>' +
          '<div class="cs-block"><dt>命 宫 主 星</dt><dd><b>' + esc(c.mingStars.slice(0,2).join(' · ') || '空宫') + '</b>' +
            (c.borrowed ? '（借对宫之星）' : '') + '<br>' + esc(STAR_WORDS[c.mingStars[0]] || '空宫无正曜，宜观三方之会。') + '</dd></div>' +
          '<div class="cs-block"><dt>三 方 会 照</dt><dd>对宫 ' + esc(ZHI[(c.mingZhi + 6) % 12]) + ' 见 <b>' +
            esc(c.oppStars.slice(0,2).join(' · ') || '无正曜') + '</b>；' +
            '会 ' + esc(ZHI[(c.mingZhi + 4) % 12]) + '、' + esc(ZHI[(c.mingZhi + 8) % 12]) + ' 二垣，取其动静相参之意。</dd></div>' +
          '<div class="cs-block"><dt>五 行 局</dt><dd>命宫纳音 <b>' + esc(c.mingNayin) + '</b>，归入 <b>' + esc(c.juName) + '</b>。' +
            '局者，节奏之单位也；此处只取其名，不行大限、不推流曜。</dd></div>' +
        '</dl>' +
        '<p class="cs-notice">此盘为意象简盘：星曜依生辰意象布列，取传统星系相对位置之意，并非专业紫微排盘，请勿用于术数研习或相互校对。</p>' +
      '</div>' +
    '</div>' +
  '</section>' +

  '<section class="read-section reveal">' +
    '<div class="read-section-head"><span class="rs-no">III</span><h3 class="rs-title">塔罗 · 三牌</h3><span class="rs-en">TAROT SPREAD</span></div>' +
    '<div class="tarot-row">' + tarotHtml + '</div>' +
    '<p class="tarot-hint">点击牌面可翻覆 · 牌序由生辰固定生成，反复起盘结果一致</p>' +
  '</section>' +

  '<section class="read-section reveal">' +
    '<div class="read-section-head"><span class="rs-no">IV</span><h3 class="rs-title">生命节律</h3><span class="rs-en">VITALITY ARC</span></div>' +
    '<div class="vitality">' +
      '<div class="vit-head"><div><h4>元气起伏 · 意象曲线</h4>' +
        '<p>由五行均衡度、日主气势、命垣星动与牌意缓急合成，用以观照不同阶段的养息节奏。纵轴为「盛 / 缓」，无单位、无阈值、无预测含义。</p></div>' +
        '<span class="vit-legend">SYMBOLIC ONLY</span></div>' +
      vitSvg +
      '<div class="stage-row">' + stageHtml + '</div>' +
      '<p class="vit-caveat"><b>请留意</b>：曲线不对应任何真实年龄走势，末端亦不代表终点。本站不推算寿命、岁数或死亡时间；' +
      '若你对健康或生命长度有所挂心，请咨询专业医师，或与你信任的人谈谈。</p>' +
    '</div>' +
  '</section>' +

  '<section class="read-section reveal">' +
    '<div class="read-section-head"><span class="rs-no">V</span><h3 class="rs-title">三术断语 · 模糊依据</h3><span class="rs-en">THE READING</span></div>' +
    '<div class="readings">' +
      '<article class="reading-card"><div class="rc-head"><span class="rc-no">壹</span><h4 class="rc-title">四柱</h4><span class="rc-en">BAZI</span></div>' +
        '<p class="rc-body">' + t.baziBody + '</p>' +
        '<dl class="rc-basis"><dt>依 据 · 模 糊 而 言</dt><dd>' + esc(t.baziBasis) + '</dd></dl></article>' +
      '<article class="reading-card"><div class="rc-head"><span class="rc-no">贰</span><h4 class="rc-title">星垣</h4><span class="rc-en">ZI WEI</span></div>' +
        '<p class="rc-body">' + t.ziweiBody + '</p>' +
        '<dl class="rc-basis"><dt>依 据 · 模 糊 而 言</dt><dd>' + esc(t.ziweiBasis) + '</dd></dl></article>' +
      '<article class="reading-card"><div class="rc-head"><span class="rc-no">叁</span><h4 class="rc-title">塔罗</h4><span class="rc-en">TAROT</span></div>' +
        '<p class="rc-body">' + t.tarotBody + '</p>' +
        '<dl class="rc-basis"><dt>依 据 · 模 糊 而 言</dt><dd>' + esc(t.tarotBasis) + '</dd></dl></article>' +
    '</div>' +
    '<div class="synthesis">' +
      '<p class="syn-label">SYNTHESIS · 合 参</p>' +
      '<p class="syn-text">' + t.syn + '</p>' +
      '<dl class="syn-grid">' +
        '<div class="syn-cell"><dt>本 年 · 丙 午</dt><dd>' + esc(c.flowWord) + '</dd></div>' +
        '<div class="syn-cell"><dt>气 象 偏 重</dt><dd><strong>' + esc(c.dominant) + ' · ' + esc(c.weakest) + '</strong> 之间；' +
          '盘面均衡度 ' + Math.round(c.balance * 100) + ' / 100，取其象，不取其数。</dd></div>' +
        '<div class="syn-cell"><dt>曲 线 高 处</dt><dd>意象曲线于 <strong>' + c.peakAge + ' 岁段</strong> 略显舒展。' +
          '此为图形描述，非人生预测，不指向任何具体事件。</dd></div>' +
      '</dl>' +
      '<div class="advice">' +
        '<div class="adv-col"><h5>宜 · 养息之意象</h5><ul>' + t.yi.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
        '<div class="adv-col"><h5>忌 · 自扰之处</h5><ul>' + t.ji.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
      '</div>' +
      '<p class="fine-print">以上宜忌为生活意象提示，非医学、营养或心理建议。所有断语刻意保持模糊，不包含寿命、疾病、祸福与具体事件之预测。</p>' +
    '</div>' +
    '<div class="read-actions">' +
      '<button class="btn-ghost" id="btn-recast">重 新 起 盘</button>' +
      '<button class="btn-ghost" id="btn-copy">复 制 命 盘 摘 要</button>' +
      '<button class="btn-ghost" id="btn-print">打 印 / 存 为 PDF</button>' +
    '</div>' +
  '</section>';

  const body = document.getElementById('reading-body');
  body.innerHTML = html;
  const section = document.getElementById('reading');
  section.hidden = false;
  observeReveals(section);

  /* animated bars */
  setTimeout(function () {
    body.querySelectorAll('.el-fill').forEach(function (el) { el.style.width = el.dataset.w + '%'; });
  }, 260);
  /* tarot flip-in */
  body.querySelectorAll('.tarot-card').forEach(function (card, i) {
    setTimeout(function () { card.classList.add('flipped'); }, 620 + i * 330);
    const toggle = function () { card.classList.toggle('flipped'); };
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });

  if (window.GXJBold) window.GXJBold.enhance(body, c, {
    GAN:GAN, ZHI:ZHI, GAN_WX:GAN_WX, TAROT:TAROT, STAR_WORDS:STAR_WORDS,
    WX_ORDER:WX_ORDER, WX_COLOR:WX_COLOR, SHENG:SHENG, KE:KE,
    esc:esc, clamp:clamp, rng:rng, hash:hash
  });

  document.getElementById('btn-recast').addEventListener('click', function () {
    document.getElementById('cast').scrollIntoView({ behavior:'smooth', block:'start' });
  });
  document.getElementById('btn-copy').addEventListener('click', function () {
    const summary = [
      '观星纪 · 命盘摘要（术数文化演绎）',
      '生辰：' + dateText,
      '四柱：' + c.pillars.map(function (p) { return p.name; }).join(' '),
      '日主：' + GAN[c.dayGan] + GAN_WX[c.dayGan] + ' · ' + c.strengthWord,
      '命宫：' + gz(c.mingGan, c.mingZhi) + ' · ' + c.juName,
      '命宫主星：' + (c.mingStars.slice(0,2).join(' · ') || '空宫'),
      '三牌：' + c.cards.map(function (x) { return TAROT[x.idx].n + (x.rev ? '（逆）' : '（正）'); }).join(' / '),
      '本命牌：' + TAROT[c.lifeCard].n,
      '说明：以上为术数文化演绎与算法推演，非医学诊断或事实预测。'
    ].join('\n');
    const done = function () { const b = document.getElementById('btn-copy'); b.textContent = '已 复 制 ✓'; setTimeout(function () { b.textContent = '复 制 命 盘 摘 要'; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summary).then(done, function () { fallbackCopy(summary, done); });
    } else fallbackCopy(summary, done);
  });
  document.getElementById('btn-print').addEventListener('click', function () {
    document.querySelectorAll('#reading .reveal').forEach(function (el) { el.classList.add('in'); });
    document.querySelectorAll('#reading .el-fill').forEach(function (el) { el.style.width = el.dataset.w + '%'; });
    setTimeout(function () { window.print(); }, 80);
  });
}
function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); done(); } catch (e) {}
  document.body.removeChild(ta);
}

/* ============================================================
   FORM / RITUAL
   ============================================================ */
(function initForm() {
  const form = document.getElementById('cast-form');
  const dateEl = document.getElementById('f-date');
  const errEl = document.getElementById('form-error');
  const ritual = document.getElementById('ritual');
  const rStep = document.getElementById('ritual-step');
  const rSub = document.getElementById('ritual-sub');
  try { dateEl.max = new Date().toISOString().slice(0, 10); } catch (e) {}
  dateEl.value = '2004-06-15';

  const steps = [
    ['推 四 柱', '以节气定月，以日辰起时'],
    ['布 星 垣', '定命身二宫，列十四主星'],
    ['抽 三 牌', '以生辰为种，取过去现在将来'],
    ['合 参 成 盘', '三术各言其象，不落定数']
  ];

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errEl.hidden = true;
    const raw = dateEl.value;
    if (!raw) { showError('请填写公历出生日期。'); return; }
    const parts = raw.split('-').map(Number);
    const y = parts[0], m = parts[1], d = parts[2];
    if (y < 1900 || y > new Date().getFullYear() || m < 1 || m > 12 || d < 1 || d > 31) {
      showError('日期超出可推算范围（1900 年至今）。'); return;
    }
    if (!document.getElementById('f-consent').checked) { showError('请先阅读并勾选边界声明。'); return; }

    const input = {
      y:y, m:m, d:d,
      t:parseInt(document.getElementById('f-hour').value, 10),
      gender:(form.querySelector('input[name=gender]:checked') || {}).value || 'qian',
      name:(document.getElementById('f-name').value || '').trim(),
      place:(document.getElementById('f-place').value || '').trim()
    };

    ritual.hidden = false;
    let k = 0;
    rStep.textContent = steps[0][0]; rSub.textContent = steps[0][1];
    const timer = setInterval(function () {
      k++;
      if (k < steps.length) { rStep.textContent = steps[k][0]; rSub.textContent = steps[k][1]; }
      else {
        clearInterval(timer);
        const chart = buildChart(input);
        renderReading(chart);
        ritual.hidden = true;
        setTimeout(function () {
          document.getElementById('reading').scrollIntoView({ behavior:'smooth', block:'start' });
        }, 120);
      }
    }, 560);
  });

  function showError(msg) { errEl.textContent = msg; errEl.hidden = false; }
})();

})();
