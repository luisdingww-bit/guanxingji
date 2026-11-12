/* ============================================================
   观星纪 / EPHEMERIS · bilingual layer
  zh-Hans  <->  English (scholarly terminology, not literal glosses)
   ============================================================ */
(function () {
'use strict';

var UI = {
  'brand.zh':      { zh:'观星纪', en:'EPHEMERIS' },
  'brand.roman':   { zh:'GUANXINGJI', en:'GUANXINGJI' },
  'tagline':       { zh:'ASTRAL LEDGER', en:'AN ASTRAL LEDGER' },
  'nav.method':    { zh:'三术', en:'METHOD' },
  'nav.cast':      { zh:'起盘', en:'CAST' },
  'nav.boundary':  { zh:'边界', en:'BOUNDARY' },
  'nav.sources':   { zh:'文献', en:'SOURCES' },
  'nav.cta':       { zh:'起 一 盘', en:'CAST A CHART' },
  'lang.label':    { zh:'EN', en:'中' },
  'lang.title':    { zh:'Switch to English', en:'切换到中文' },

  'hero.eyebrow':  { zh:'卷 一 · 直 断', en:'VOLUME I · DIRECT READING' },
  'hero.l1a':      { zh:'命，', en:'FATE,' },
  'hero.l1b':      { zh:'亦可推', en:'CAN BE READ' },
  'hero.l2a':      { zh:'势，', en:'AND ITS' },
  'hero.l2b':      { zh:'可以断', en:'COURSE, PLAINLY' },
  'hero.desc':     { zh:'以四柱定其骨，以星垣布其象，以三牌取其喻。<br>三术合参，直断寿元、运势与生活细处，不绕弯。',
                      en:'Four Pillars give it structure; the star chart gives it position; three cards give it a mirror.<br>One reading, stated plainly: longevity, fortune, and the texture of daily life.' },
  'hero.index':    { zh:'01 / 05', en:'01 / 05' },
  'hero.scroll':   { zh:'向下阅', en:'SCROLL' },

  'sec.method':    { zh:'三术合参', en:'THREE LENSES' },
  'sec.method.en': { zh:'THREE LENSES, ONE READING', en:'BAZI · ZI WEI · TAROT' },
  'method.lead':   { zh:'同一段生辰，换三种目光去看。<br>东方问「气」，星垣问「位」，塔罗问「心」——合起来，给一个不绕弯的判断。',
                     en:'One birth moment, seen three ways.<br>The Four Pillars ask about qi, the star chart about position, the cards about the mind — together, a plain answer.' },
  'm1.num':        { zh:'壹 · 01', en:'I · 01' },
  'm1.title':      { zh:'四柱八字', en:'FOUR PILLARS' },
  'm1.en':         { zh:'BAZI', en:'FOUR PILLARS OF DESTINY' },
  'm1.body':       { zh:'以生辰推年月日时四柱，看五行偏全、日主强弱、十神透藏。直接说清你的底气、短板与发力的时间差。',
                     en:'Year, month, day and hour are resolved into Four Pillars using solar terms and the sexagenary cycle. Five Phases balance, Day Master strength and the Ten Relationships are computed, not guessed.' },
  'm1.tags':       { zh:'节气定月|五虎遁|五行占比', en:'SOLAR TERMS|FIVE TIGERS|PHASE WEIGHTS' },
  'm2.num':        { zh:'贰 · 02', en:'II · 02' },
  'm2.title':      { zh:'紫微星垣', en:'ZI WEI STAR CHART' },
  'm2.en':         { zh:'ZI WEI DOU SHU', en:'PURPLE STAR ASTROLOGY' },
  'm2.body':       { zh:'定命身二宫，布十四主星于十二垣。命宫主星与三方会照，直接对应性格、事业、财路与关系模式。',
                     en:'Life and Body palaces are fixed from the lunar month and hour; the fourteen major stars are placed by the standard An Xing Jue formula across twelve palaces.' },
  'm2.tags':       { zh:'命身二宫|三方四正|标准主星盘', en:'LIFE / BODY|THREE-PART SQUARE|14 MAJOR STARS' },
  'm3.num':        { zh:'叁 · 03', en:'III · 03' },
  'm3.title':      { zh:'塔罗三牌', en:'THREE CARDS' },
  'm3.en':         { zh:'TAROT SPREAD', en:'MAJOR ARCANA' },
  'm3.body':       { zh:'以生辰为种子，抽过去、现在、将来三牌。不谈玄虚，直指你现在卡在哪、哪件事早该收尾。',
                     en:'Three Major Arcana cards drawn from a birth-data seed. Read as archetypal mirrors: what is stuck, and what is overdue for an ending.' },
  'm3.tags':       { zh:'大阿卡纳|正逆位|三牌阵列', en:'22 ARCANA|UPRIGHT / REVERSED|PAST · NOW · NEXT' },
  'disc.longevity':{ zh:'<strong>关于「寿元」</strong> — 本站提供两种断语尺度：<strong>大胆直断</strong>给出寿元区间、关口岁段与逐年运势，<strong>含蓄意象</strong>只观节律、不落数字。两者均为术数文化演绎与算法推演，不是医学结论，也不是事实预测。',
                     en:'<strong>On longevity</strong> — Two registers are offered. <strong>Direct Reading</strong> gives a symbolic longevity band, threshold decades and year-by-year fortune; <strong>Subtle Imagery</strong> shows rhythm only. Both are cultural-algorithmic constructions, not medical conclusions or factual predictions.' },

  'sec.cast':      { zh:'起 盘', en:'CAST A CHART' },
  'sec.cast.en':   { zh:'CAST YOUR CHART', en:'ENTER YOUR BIRTH DATA' },
  'f.name':        { zh:'姓名', en:'FULL NAME' },
  'f.name.opt':    { zh:'参与姓名学推演', en:'USED IN NAME NUMEROLOGY' },
  'f.name.ph':     { zh:'请输入汉字全名', en:'Enter your full Chinese name' },
  'f.name.hint':   { zh:'与八字、出生地合参；仅在本地计算，可留空。',
                     en:'Read alongside Bazi and birthplace; computed locally and optional.' },
  'f.date':        { zh:'公历生辰', en:'GREGORIAN BIRTH DATE' },
  'f.date.req':    { zh:'必填', en:'REQUIRED' },
  'f.hour':        { zh:'出生时辰', en:'BIRTH HOUR (SHICHEN)' },
  'f.gender':      { zh:'性别', en:'SEX (FOR ADDRESS)' },
  'f.gender.opt':  { zh:'用于称谓', en:'FOR ADDRESS' },
  'f.gender.q':    { zh:'乾造 · 男', en:'Male · Qian' },
  'f.gender.k':    { zh:'坤造 · 女', en:'Female · Kun' },
  'f.place':       { zh:'出生地', en:'BIRTHPLACE' },
  'f.place.opt':   { zh:'选填 · 参与真太阳时校正', en:'OPTIONAL · USED FOR SOLAR-TIME CORRECTION' },
  'f.place.ph':    { zh:'例如：厦门 / 中国香港', en:'e.g. Xiamen / Hong Kong, China' },
  'f.time':        { zh:'出生时刻', en:'BIRTH TIME' },
  'f.time.opt':    { zh:'自动判定时辰', en:'DERIVES THE DOUBLE-HOUR' },
  'f.time.hint':   { zh:'一个输入同时判定时辰与做真太阳时校正；不知道具体分钟可保留默认值。',
                     en:'One field derives the double-hour and drives the solar-time correction; keep the default if you do not know the exact minute.' },
  'f.hour.derived':{ zh:'推定时辰：', en:'Derived double-hour: ' },
  'f.scale':       { zh:'断语尺度', en:'READING REGISTER' },
  'f.scale.req':   { zh:'默认大胆', en:'DIRECT BY DEFAULT' },
  'f.scale.bold':  { zh:'大胆直断 · 给寿元、运势与生活细节', en:'DIRECT · longevity, fortune and life details' },
  'f.scale.subtle':{ zh:'含蓄意象 · 只观节律，不落数字', en:'SUBTLE · rhythm only, no figures' },
  'f.consent':     { zh:'我已阅读并理解', en:'I have read and understood the ' },
  'f.consent.link':{ zh:'边界声明', en:'Boundary Notes' },
  'f.consent.tail':{ zh:'：本站内容为术数文化演绎与算法生成的象征性推演，不构成医学、法律、投资或人生决策建议；相关判断与责任由我自行承担。',
                     en:': this site is a cultural-algorithmic construction. Nothing here is medical, legal, investment or life advice; I take full responsibility for how I use it.' },
  'f.submit':      { zh:'起 盘', en:'CAST CHART' },
  'f.note':        { zh:'所有推算在你的浏览器本地完成，不上传、不留存、不读取任何设备数据。',
                     en:'All computation runs locally in your browser. Nothing is uploaded, retained, or read from your device.' },
  'f.err.date':    { zh:'请填写公历出生日期。', en:'Please enter your Gregorian birth date.' },
  'f.err.range':   { zh:'日期超出可推算范围（1900 年至今）。', en:'Date outside the computable range (1900–today).' },
  'f.err.consent': { zh:'请先阅读并勾选边界声明。', en:'Please accept the Boundary Notes first.' },
  'f.err.generic': { zh:'起盘出错：', en:'Chart failed: ' },

  'sec.sources':   { zh:'文献与算法', en:'SOURCES & METHOD' },
  'sec.sources.en':{ zh:'SOURCES & METHOD', en:'REPRODUCIBLE, CITED' },
  'sources.lead':  { zh:'本版排盘不再使用近似月份或随机星位。节气按寿星公式逐日推算，命宫依农历月与生时，紫微星依「局数除日数」标准口诀定位，天府依寅申轴对称，十四主星依紫微系逆布、天府系顺布。下列为可查证的原始资料。',
                     en:'This build replaces approximate month boundaries and arbitrary star placement. Solar terms are computed per year; the Life Palace uses the lunar month and birth hour; Zi Wei is placed by the classical bureau/day formula; Tian Fu mirrors it across the Yin–Shen axis; the fourteen major stars follow the two standard sequences. Sources below are publicly verifiable.' },
  'sources.limits':{ zh:'仍保留的边界：不排辅佐煞曜、四化、大限与流曜；不做真太阳时经度校正（出生地仅作记录）；闰月生人按当月月序计；节气公式在 1900–2100 年间个别年份可能有 ±1 日误差，交界日出生者请自行核对万年历。',
                     en:'Remaining limits: minor stars, four transformations, decade cycles and annual stars are not charted; no longitude / apparent-solar-time correction (birthplace is recorded only); leap-month births use that month number; the solar-term formula can be ±1 day in isolated years within 1900–2100 — those born on a boundary should verify against an ephemeris.' },

  'sec.boundary':  { zh:'边 界', en:'BOUNDARY' },
  'sec.boundary.en':{ zh:'THE BOUNDARY', en:'WHAT THIS IS NOT' },
  'bnd.quote':    { zh:'「数可言其势，不可代其择。」', en:'"A chart can describe a tendency. It cannot make the choice."' },
  'bnd.p1':       { zh:'命理是一套延续千年的叙事语言。本站默认把断语尺度调到最大：给寿元区间、给六维直断、给生活细节、给逐年运势，措辞不再绕弯；也可在起盘时切回含蓄意象，只观节律、不落数字。',
                    en:'Chinese astrology is a narrative language with a long lineage. This site reads plainly by default — a symbolic longevity band, six domains, daily-life inferences and yearly fortune — or you can switch to the subtler register.' },
  'bnd.p2':       { zh:'但有两条得说清楚：其一，所有数字都由算法与象意加权生成，不是任何形式的医学结论或事实预测；其二，环境、医疗与选择对人生的影响，远大于一张盘。把它当作一面能照见习惯的镜子，比当作判决书有用得多。',
                    en:'Two things stay explicit. First, every number is generated from symbolic weights, not from any medical or empirical model. Second, environment, healthcare and choices shape a life far more than a chart does. Use it as a mirror for habits, not as a verdict.' },
  'bnd.i1':       { zh:'寿元区间由五行停匀、日主气势、命垣星曜、塔罗本命加权合成，是象意数字，不是生理预测。',
                    en:'The longevity band weights Five-Phase balance, Day Master strength, palace stars and the birth card. It is a symbolic figure, not a physiological forecast.' },
  'bnd.i2':       { zh:'「关口岁段」取元气曲线低谷与传统关口之说，只作转折与放慢的提醒，不指具体事件。',
                    en:'Threshold decades mark troughs in the rhythm curve. They signal transition and a slower pace, never a specific event.' },
  'bnd.i3':       { zh:'「生活细节」全部由盘面象意推演，不读取设备、位置、浏览记录或任何真实数据。',
                    en:'Life-detail inferences come solely from chart symbolism; no device, location, browsing history or personal data is accessed.' },
  'bnd.i4':       { zh:'星盘为标准十四主星盘，节气按公式推算；辅星、四化、大限未排，不用于专业术数论断。',
                    en:'The star chart contains the fourteen major stars only. Minor stars, transformations and decade cycles are excluded; it is not a practitioner-grade chart.' },
  'bnd.i5':       { zh:'不上传、不存储、不共享任何填写信息；内容的使用与判断责任由使用者自行承担。',
                    en:'No data is uploaded, stored or shared. Responsibility for interpretation and use rests with the reader.' },
  'footer.1':     { zh:'观星纪 · EPHEMERIS · GUANXINGJI', en:'EPHEMERIS · GUANXINGJI · 观星纪' },
  'footer.2':     { zh:'术数文化演绎 · 非医学或事实预测', en:'CULTURAL-ALGORITHMIC CONSTRUCTION · NOT MEDICAL OR FACTUAL PREDICTION' },
  'footer.3':     { zh:'MMXXVI', en:'MMXXVI' },

  'bgm.title':    { zh:'星 律 · 背景音', en:'SIDEREAL · AMBIENT' },
  'bgm.hint':     { zh:'点一下页面，开启背景音', en:'Click anywhere to enable the soundtrack' },
  'bgm.loop':     { zh:'LOOP', en:'LOOP' },
  'bgm.play':     { zh:'播放背景音', en:'Play soundtrack' },
  'bgm.pause':    { zh:'暂停背景音', en:'Pause soundtrack' },
  'bgm.mute':     { zh:'静音', en:'Mute' },
  'bgm.unmute':   { zh:'取消静音', en:'Unmute' },
  'bgm.volume':   { zh:'音量大小', en:'Volume' },
  'bgm.error':   { zh:'音频加载失败，请刷新页面重试', en:'Audio failed to load — please refresh' },

  'ritual.1':     { zh:'推 四 柱', en:'COMPUTING THE PILLARS' },
  'ritual.1s':    { zh:'以节气定月，以日辰起时', en:'Solar terms fix the month; the day fixes the hour' },
  'ritual.2':     { zh:'布 星 垣', en:'PLACING THE STARS' },
  'ritual.2s':    { zh:'定命身二宫，列十四主星', en:'Life and Body palaces, fourteen major stars' },
  'ritual.3':     { zh:'抽 三 牌', en:'DRAWING THREE CARDS' },
  'ritual.3s':    { zh:'以生辰为种，取过去现在将来', en:'A birth-seeded spread: past, present, next' },
  'ritual.4':     { zh:'合 参 成 盘', en:'SYNTHESISING' },
  'ritual.4s':    { zh:'三术各言其象，不落定数', en:'Three lenses, one reading' }
};

/* ---- scholarly terminology ---- */
var TERMS = {
  stem: ['Jia','Yi','Bing','Ding','Wu','Ji','Geng','Xin','Ren','Gui'],
  stemPhase: ['Yang Wood','Yin Wood','Yang Fire','Yin Fire','Yang Earth','Yin Earth','Yang Metal','Yin Metal','Yang Water','Yin Water'],
  branch: ['Zi','Chou','Yin','Mao','Chen','Si','Wu','Wei','Shen','You','Xu','Hai'],
  branchAnimal: ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'],
  phase: { '木':'Wood','火':'Fire','土':'Earth','金':'Metal','水':'Water' },
  god: { '比肩':'Friend','劫财':'Rob Wealth','食神':'Eating God','伤官':'Hurting Officer',
         '正财':'Direct Wealth','偏财':'Indirect Wealth','正官':'Direct Officer','七杀':'Seven Killings',
         '正印':'Direct Resource','偏印':'Indirect Resource','日主':'Day Master' },
  star: { '紫微':'Zi Wei','天机':'Tian Ji','太阳':'Tai Yang','武曲':'Wu Qu','天同':'Tian Tong',
          '廉贞':'Lian Zhen','天府':'Tian Fu','太阴':'Tai Yin','贪狼':'Tan Lang','巨门':'Ju Men',
          '天相':'Tian Xiang','天梁':'Tian Liang','七杀':'Qi Sha','破军':'Po Jun' },
  starGloss: { '紫微':'Purple Star','天机':'Heavenly Mechanism','太阳':'Sun','武曲':'Martial Tune','天同':'Heavenly Harmony',
               '廉贞':'Purity','天府':'Heavenly Treasury','太阴':'Moon','贪狼':'Greedy Wolf','巨门':'Great Gate',
               '天相':'Heavenly Chancellor','天梁':'Heavenly Beam','七杀':'Seven Killings','破军':'Broken Army' },
  palace: ['Life','Siblings','Spouse','Children','Wealth','Health','Migration','Friends','Career','Property','Felicity','Parents'],
  palaceFull: ['Life Palace (Ming)','Siblings','Spouse','Children','Wealth','Health','Migration','Friends & Associates','Career','Property','Felicity','Parents'],
  nayin: ['Sea Metal','Furnace Fire','Great Forest Wood','Roadside Earth','Sword-Edge Metal','Mountain-Top Fire','Brook Water','City Wall Earth','White Wax Metal','Willow Wood',
          'Spring Water','House-Roof Earth','Thunderbolt Fire','Pine & Cypress Wood','Long-Flowing Water','Sand Gold','Mountain-Foot Fire','Flatland Wood','Wall Earth','Gold Foil',
          'Covered Lamp Fire','Milky Way Water','Post-Road Earth','Hairpin Gold','Mulberry Wood','Great Stream Water','Sand Earth','Heavenly Fire','Pomegranate Wood','Great Sea Water'],
  bureau: { 2:'Water · 2nd Bureau', 3:'Wood · 3rd Bureau', 4:'Metal · 4th Bureau', 5:'Earth · 5th Bureau', 6:'Fire · 6th Bureau' },
  bureauZh: { 2:'水二局', 3:'木三局', 4:'金四局', 5:'土五局', 6:'火六局' }
};

var lang = 'zh';
var listeners = [];
try { var saved = localStorage.getItem('gxj-lang'); if (saved === 'en' || saved === 'zh') lang = saved; } catch (e) {}

function get(key) {
  var entry = UI[key];
  if (!entry) return null;
  return entry[lang];
}
/* Format a bilingual template: F(zhTemplate, enTemplate, vars) */
function F(zh, en, vars) {
  var s = lang === 'en' ? en : zh;
  if (vars) Object.keys(vars).forEach(function (k) {
    s = s.split('{' + k + '}').join(String(vars[k]));
  });
  return s;
}
function term(kind, key, fallback) {
  if (lang !== 'en') return fallback;
  var t = TERMS[kind];
  if (!t) return fallback;
  if (typeof t === 'function') return t(key);
  var v = (t instanceof Array) ? t[key] : t[key];
  return v === undefined ? fallback : v;
}
function applyStatic() {
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var v = get(el.getAttribute('data-i18n'));
    if (v !== null) el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
    var v = get(el.getAttribute('data-i18n-html'));
    if (v !== null) el.innerHTML = v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
    var v = get(el.getAttribute('data-i18n-ph'));
    if (v !== null) el.setAttribute('placeholder', v);
  });
  document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
    var spec = el.getAttribute('data-i18n-attr').split('|');
    var v = get(spec[1]);
    if (v !== null) el.setAttribute(spec[0], v);
  });
  var btn = document.getElementById('lang-toggle');
  if (btn) {
    btn.textContent = get('lang.label');
    btn.setAttribute('title', get('lang.title'));
    btn.setAttribute('aria-label', get('lang.title'));
  }
  document.title = lang === 'en'
    ? 'EPHEMERIS (Guanxingji) — Ba Zi · Zi Wei · Tarot'
    : '观星纪 EPHEMERIS · 八字 / 紫微 / 塔罗';

  document.body.classList.toggle('lang-en', lang === 'en');

  /* pipe-separated tag lists */
  document.querySelectorAll('[data-i18n-list]').forEach(function (ul) {
    var v = get(ul.getAttribute('data-i18n-list'));
    if (!v) return;
    var parts = v.split('|');
    ul.querySelectorAll('li').forEach(function (li, i) { if (parts[i]) li.textContent = parts[i]; });
  });

  var tg = document.getElementById('bgm-toggle'), mt = document.getElementById('bgm-mute');
  if (tg) tg.setAttribute('aria-label', get('bgm.play'));
  if (mt) mt.setAttribute('aria-label', get('bgm.mute'));
  var vol = document.getElementById('bgm-volume');
  if (vol) vol.setAttribute('aria-label', get('bgm.volume'));
  if (window.__gxjPaintHour) window.__gxjPaintHour();
}
function setLang(next) {
  if (next !== 'zh' && next !== 'en') return;
  lang = next;
  try { localStorage.setItem('gxj-lang', lang); } catch (e) {}
  applyStatic();
  listeners.forEach(function (fn) { try { fn(lang); } catch (e) {} });
}
function onChange(fn) { listeners.push(fn); }
function toggle() { setLang(lang === 'zh' ? 'en' : 'zh'); }

window.GXJI18N = {
  UI:UI, TERMS:TERMS, F:F, term:term, get:get,
  applyStatic:applyStatic, setLang:setLang, onChange:onChange, toggle:toggle,
  get lang() { return lang; }
};

/* Language + ritual steps live outside the strict dictionary so the
   reading engine can reuse the same keys at render time. */
window.GXRitual = [
  ['ritual.1','ritual.1s'], ['ritual.2','ritual.2s'],
  ['ritual.3','ritual.3s'], ['ritual.4','ritual.4s']
];
})();
