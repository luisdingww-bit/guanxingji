/* ============================================================
   EPHEMERIS · GEO & CALIBRATION ENGINE
   1) Apparent-solar-time correction from a static city-longitude table
   2) Five-Phase directional affinity and regional reading
   3) Interactive six-question calibration (local only, nothing uploaded)

   The compass below is an abstract symbolic diagram, NOT a map:
   no borders, no coordinates, no basemap, no third-party tiles.
   Hong Kong / Macao / Taiwan are listed as regions of China.
   ============================================================ */
(function () {
'use strict';

/* ---------- static longitude table (degrees east, no external lookup) ---------- */
var CITY = {
  '北京':116.41,'beijing':116.41,'上海':121.47,'shanghai':121.47,'广州':113.26,'guangzhou':113.26,
  '深圳':114.06,'shenzhen':114.06,'厦门':118.09,'xiamen':118.09,'福州':119.30,'fuzhou':119.30,
  '杭州':120.16,'hangzhou':120.16,'南京':118.80,'nanjing':118.80,'苏州':120.59,'suzhou':120.59,
  '天津':117.20,'tianjin':117.20,'重庆':106.55,'chongqing':106.55,'成都':104.07,'chengdu':104.07,
  '武汉':114.31,'wuhan':114.31,'西安':108.94,'xian':108.94,'xi an':108.94,'青岛':120.38,'qingdao':120.38,
  '大连':121.62,'dalian':121.62,'沈阳':123.43,'shenyang':123.43,'哈尔滨':126.53,'harbin':126.53,
  '长春':125.32,'changchun':125.32,'济南':117.00,'jinan':117.00,'郑州':113.63,'zhengzhou':113.63,
  '长沙':112.94,'changsha':112.94,'合肥':117.23,'hefei':117.23,'南昌':115.86,'nanchang':115.86,
  '昆明':102.71,'kunming':102.71,'贵阳':106.63,'guiyang':106.63,'南宁':108.37,'nanning':108.37,
  '海口':110.20,'haikou':110.20,'太原':112.55,'taiyuan':112.55,'石家庄':114.51,'shijiazhuang':114.51,
  '兰州':103.83,'lanzhou':103.83,'乌鲁木齐':87.62,'urumqi':87.62,'拉萨':91.13,'lhasa':91.13,
  '银川':106.23,'yinchuan':106.23,'西宁':101.78,'xining':101.78,'呼和浩特':111.75,'hohhot':111.75,
  '泉州':118.60,'quanzhou':118.60,'宁波':121.55,'ningbo':121.55,'无锡':120.30,'wuxi':120.30,
  '珠海':113.58,'zhuhai':113.58,'东莞':113.75,'dongguan':113.75,'佛山':113.12,'foshan':113.12,
  '中国香港':114.17,'香港':114.17,'hong kong':114.17,'hong kong, china':114.17,
  '中国澳门':113.54,'澳门':113.54,'macao':113.54,'macao, china':113.54,
  '中国台湾':121.50,'台湾':121.50,'台北':121.50,'taipei':121.50,'taiwan, china':121.50,
  '高雄':120.30,'kaohsiung':120.30,'东京':139.69,'tokyo':139.69,'首尔':126.98,'seoul':126.98,
  '新加坡':103.82,'singapore':103.82,'曼谷':100.50,'bangkok':100.50,'吉隆坡':101.69,'kuala lumpur':101.69,
  '伦敦':-0.13,'london':-0.13,'巴黎':2.35,'paris':2.35,'柏林':13.40,'berlin':13.40,
  '纽约':-74.01,'new york':-74.01,'洛杉矶':-118.24,'los angeles':-118.24,
  '旧金山':-122.42,'san francisco':-122.42,'温哥华':-123.12,'vancouver':-123.12,
  '多伦多':-79.38,'toronto':-79.38,'悉尼':151.21,'sydney':151.21,
  '墨尔本':144.96,'melbourne':144.96,'奥克兰':174.76,'auckland':174.76,
  '新疆':87.62,'xinjiang':87.62,'喀什':75.99,'kashgar':75.99,
  '西藏':91.13,'xizang':91.13,'tibet':91.13,
  '内蒙古':111.75,'inner mongolia':111.75,'海南':110.20,'hainan':110.20,
  '福建':118.09,'fujian':118.09,'广东':113.26,'guangdong':113.26,
  '浙江':120.16,'zhejiang':120.16,'江苏':118.80,'jiangsu':118.80,
  '四川':104.07,'sichuan':104.07,'山东':117.00,'shandong':117.00
};

/* Central meridian of the local standard-time zone (UTC offset x 15 deg).
   Mainland China, Hong Kong, Macao and Taiwan all use UTC+8 -> 120E.
   Daylight saving is not modelled; boundary hours should be verified. */
var TZ = {
  '东京':9,'tokyo':9,'首尔':9,'seoul':9,
  '新加坡':8,'singapore':8,'吉隆坡':8,'kuala lumpur':8,
  '曼谷':7,'bangkok':7,
  '伦敦':0,'london':0,'巴黎':1,'paris':1,'柏林':1,'berlin':1,
  '纽约':-5,'new york':-5,'洛杉矶':-8,'los angeles':-8,
  '旧金山':-8,'san francisco':-8,'温哥华':-8,'vancouver':-8,
  '多伦多':-5,'toronto':-5,
  '悉尼':10,'sydney':10,'墨尔本':10,'melbourne':10,
  '奥克兰':12,'auckland':12
};
function refMeridian(place) {
  var s = String(place || '').toLowerCase();
  var keys = Object.keys(TZ).sort(function (a, b) { return b.length - a.length; });
  for (var i = 0; i < keys.length; i++) if (s.indexOf(keys[i]) !== -1) return TZ[keys[i]] * 15;
  return 120;
}

var ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
var ZHI_EN = ['Zi','Chou','Yin','Mao','Chen','Si','Wu','Wei','Shen','You','Xu','Hai'];
var HOUR_ZH = ['23:00–01:00','01:00–03:00','03:00–05:00','05:00–07:00','07:00–09:00','09:00–11:00',
               '11:00–13:00','13:00–15:00','15:00–17:00','17:00–19:00','19:00–21:00','21:00–23:00'];

/* Equation of time, standard approximation (minutes). */
function equationOfTime(y, m, d) {
  var N = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000) + 1;
  var B = 2 * Math.PI * (N - 81) / 364;
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}
function lookup(place) {
  if (!place) return null;
  var s = String(place).toLowerCase().trim();
  if (CITY[s] !== undefined) return CITY[s];
  var keys = Object.keys(CITY).sort(function (a, b) { return b.length - a.length; });
  for (var i = 0; i < keys.length; i++) if (s.indexOf(keys[i]) !== -1) return CITY[keys[i]];
  return null;
}
function branchFromMinutes(min) {
  var q = ((min % 1440) + 1440) % 1440;
  return Math.floor(((q + 60) % 1440) / 120);
}

/* ---------- 1. apparent solar time ---------- */
function correct(input) {
  var lon = lookup(input.place);
  var clock = (input.minutes == null || isNaN(input.minutes))
    ? input.t * 120   /* mid-point of the selected double-hour */
    : input.minutes;
  var exact = !(input.minutes == null || isNaN(input.minutes));
  var ref = refMeridian(input.place);
  var out = { t:input.t, dayOffset:0, applied:false, lon:lon, ref:ref, delta:0, eq:0,
              clock:clock, solar:clock, exact:exact, clockT:input.t, place:input.place || '' };
  if (lon == null) return out;
  var delta = (lon - ref) * 4;   /* 4 min per degree from the zone central meridian */
  var eq = equationOfTime(input.y, input.m, input.d);
  var total = clock + delta + eq;
  var off = Math.floor(total / 1440);
  out.lon = lon; out.ref = ref; out.delta = delta; out.eq = eq; out.solar = total;
  out.dayOffset = off; out.t = branchFromMinutes(total); out.applied = true;
  return out;
}

/* ---------- 2. directional affinity ---------- */
var DIR = {
  '木': { zh:'东', en:'East',   deg:90,  color:'#83a99f' },
  '火': { zh:'南', en:'South',  deg:180, color:'#b5563f' },
  '土': { zh:'中', en:'Centre',deg:null,color:'#c8a86b' },
  '金': { zh:'西', en:'West',  deg:270, color:'#d9cfb6' },
  '水': { zh:'北', en:'North', deg:0,   color:'#7f97b8' }
};
var PHASE_EN = { '木':'Wood','火':'Fire','土':'Earth','金':'Metal','水':'Water' };

function affinity(c, D) {
  var dm = D.GAN_WX[c.dayGan];
  var SH = D.SHENG, KE = D.KE;
  var producesMe = Object.keys(SH).filter(function (k) { return SH[k] === dm; })[0];
  var controlsMe = Object.keys(KE).filter(function (k) { return KE[k] === dm; })[0];
  var iProduce = SH[dm], iControl = KE[dm];
  var list, reason;
  if (c.strength >= 60) {
    list = [iControl, iProduce, controlsMe];
    reason = { zh:'日主偏旺，宜泄、宜耗、宜约束，取财、食伤与官杀之气。',
               en:'The Day Master is strong; draining, spending and restraining phases are favoured — Wealth, Output and Officer.' };
  } else if (c.strength <= 42) {
    list = [producesMe, dm];
    reason = { zh:'日主偏弱，宜生宜扶，取印绶与比劫之气。',
               en:'The Day Master is weak; supporting phases are favoured — Resource and Companion.' };
  } else {
    list = [c.weakest, producesMe];
    reason = { zh:'日主中和，取全局最薄之五行为先，兼取生我之气。',
               en:'The Day Master is balanced; the thinnest phase takes priority, backed by the phase that generates it.' };
  }
  return { list:list, primary:list[0], dir:DIR[list[0]], dm:dm, reason:reason,
           iProduce:iProduce, iControl:iControl, producesMe:producesMe, controlsMe:controlsMe };
}

/* Region table. Hong Kong / Macao / Taiwan are grouped as regions of China,
   never placed in the "overseas" group. */
var REGIONS = [
  { g:'cn', wx:'木', zh:'华东', en:'East China', sub:{zh:'沪 · 苏 · 浙 · 皖 · 闽 · 赣',en:'Shanghai · Jiangsu · Zhejiang · Anhui · Fujian · Jiangxi'} },
  { g:'cn', wx:'火', zh:'华南', en:'South China', sub:{zh:'粤 · 桂 · 琼',en:'Guangdong · Guangxi · Hainan'} },
  { g:'cn', wx:'土', zh:'华中', en:'Central China', sub:{zh:'鄂 · 湘 · 豫',en:'Hubei · Hunan · Henan'} },
  { g:'cn', wx:'水', zh:'华北', en:'North China', sub:{zh:'京 · 津 · 冀 · 晋 · 内蒙古',en:'Beijing · Tianjin · Hebei · Shanxi · Inner Mongolia'} },
  { g:'cn', wx:'金', zh:'西北 / 西南', en:'West & Southwest China', sub:{zh:'陕 · 甘 · 宁 · 青 · 新 · 川 · 渝 · 云 · 贵 · 藏',en:'Shaanxi · Gansu · Ningxia · Qinghai · Xinjiang · Sichuan · Chongqing · Yunnan · Guizhou · Xizang'} },
  { g:'cn', wx:'木', zh:'东北', en:'Northeast China', sub:{zh:'辽 · 吉 · 黑',en:'Liaoning · Jilin · Heilongjiang'} },
  { g:'hmt', wx:'火', zh:'中国香港', en:'Hong Kong, China', sub:{zh:'滨海 · 南方火象',en:'Coastal · southern Fire'} },
  { g:'hmt', wx:'火', zh:'中国澳门', en:'Macao, China', sub:{zh:'滨海 · 南方火象',en:'Coastal · southern Fire'} },
  { g:'hmt', wx:'木', zh:'中国台湾', en:'Taiwan, China', sub:{zh:'东南 · 木象',en:'South-east · Wood'} },
  { g:'out', wx:'木', zh:'东亚', en:'East Asia', sub:{zh:'日本 · 韩国等',en:'Japan · Korea, etc.'} },
  { g:'out', wx:'火', zh:'东南亚', en:'South-East Asia', sub:{zh:'热带 · 火象',en:'Tropical · Fire'} },
  { g:'out', wx:'土', zh:'南亚 · 中东', en:'South Asia & Middle East', sub:{zh:'过渡带 · 土象',en:'Transition belt · Earth'} },
  { g:'out', wx:'金', zh:'欧洲 · 北美', en:'Europe & North America', sub:{zh:'西向 · 金象',en:'Western · Metal'} },
  { g:'out', wx:'水', zh:'澳新 · 太平洋', en:'Australasia & Pacific', sub:{zh:'远北 / 远南 · 水象',en:'Far north / south · Water'} }
];
var GROUPS = {
  cn:  { zh:'境内区域', en:'Within mainland China' },
  hmt: { zh:'中国港澳台地区', en:"China's Hong Kong, Macao & Taiwan regions" },
  out: { zh:'境外区域', en:'Overseas regions' }
};

function regionScore(reg, aff, D, cal) {
  var SH = D.SHENG, KE = D.KE, p = aff.primary, w = reg.wx;
  var base = 52;
  if (w === p) base += 24;
  else if (SH[w] === p) base += 16;
  else if (SH[p] === w) base += 9;
  else if (KE[w] === p || KE[p] === w) base -= 11;
  if (cal) {
    var outward = cal.outward / 100, change = cal.change / 100;
    if (reg.g === 'out') base += (outward - .5) * 22 + (change - .5) * 10;
    else if (reg.g === 'hmt') base += (outward - .5) * 9;
    else base -= (outward - .5) * 8;
  }
  return Math.max(18, Math.min(96, Math.round(base)));
}
function regionNote(reg, aff, score, lang) {
  var p = aff.primary;
  var strong = score >= 70, weak = score < 48;
  if (lang === 'en') {
    return strong
      ? 'Same or generating phase as your favoured ' + PHASE_EN[p] + '. Moving toward this direction is the chart\'s most natural fit.'
      : weak
        ? 'This phase clashes with your favoured ' + PHASE_EN[p] + '. Workable, but it asks for more adjustment.'
        : 'Neutral relation to ' + PHASE_EN[p] + '. A steady option rather than a tailwind.';
  }
  return strong
    ? '与喜用' + p + '同气或相生，是盘面上最顺的方向，宜优先考量。'
    : weak
      ? '与喜用' + p + '相制，能去但要多花力气适应，属次选。'
      : '与喜用' + p + '不冲不扶，属平稳可选，非顺风位。';
}

/* ---------- 3. questionnaire ---------- */
var QUESTIONS = [
  { zh:'眼下你最想推进的是哪一件事？', en:'What are you trying to move forward right now?',
    opts:[
      { zh:'事业或名分往上一步', en:'A step up in career or standing', w:[2,1,1,1] },
      { zh:'整理一段关系或生活秩序', en:'Sorting out a relationship or daily order', w:[1,3,0,0] },
      { zh:'换一座城市 / 换一种环境', en:'Changing city or environment', w:[3,0,3,2] }
    ]},
  { zh:'面对不确定，你通常怎么做？', en:'How do you usually meet uncertainty?',
    opts:[
      { zh:'先动起来，边走边调', en:'Move first, adjust on the way', w:[3,0,2,3] },
      { zh:'观望到不得不动', en:'Wait until there is no choice', w:[0,3,0,0] },
      { zh:'列好计划再出发', en:'Make a plan, then set out', w:[1,3,1,1] }
    ]},
  { zh:'你理想的生活半径是哪一种？', en:'What radius feels right to you?',
    opts:[
      { zh:'同一座城深耕', en:'Go deep in one city', w:[0,3,0,0] },
      { zh:'跨省或跨区域', en:'Across provinces or regions', w:[2,1,2,1] },
      { zh:'境外长期发展', en:'Long-term overseas', w:[3,0,3,3] }
    ]},
  { zh:'一天里你状态最好的时段？', en:'When is your energy at its best?',
    opts:[
      { zh:'清晨', en:'Early morning', w:[0,2,0,0] },
      { zh:'午后到傍晚', en:'Afternoon to evening', w:[1,1,1,1] },
      { zh:'夜里', en:'Late at night', w:[2,0,1,2] }
    ]},
  { zh:'要换地方，你最大的顾虑是什么？', en:'What holds you back from moving?',
    opts:[
      { zh:'人脉与积累要重来', en:'Rebuilding contacts and accumulated work', w:[0,3,0,0] },
      { zh:'收入与身份的波动', en:'Income and status volatility', w:[0,2,1,0] },
      { zh:'其实没什么顾虑', en:'Honestly, none', w:[3,0,3,3] }
    ]},
  { zh:'你更相信哪一种？', en:'Which do you trust more?',
    opts:[
      { zh:'长期积累', en:'Long accumulation', w:[0,3,0,0] },
      { zh:'一两次关键转折', en:'One or two decisive turns', w:[3,0,2,3] },
      { zh:'临场自己的判断', en:'My own judgement in the moment', w:[2,1,2,2] }
    ]}
];
var DIMS = [
  { k:'change',    zh:'变动倾向', en:'Appetite for change' },
  { k:'stability', zh:'稳定偏好', en:'Preference for stability' },
  { k:'outward',   zh:'向外半径', en:'Outward radius' },
  { k:'risk',      zh:'冒险承受', en:'Risk tolerance' }
];

function calibrate(answers, c, aff, lang) {
  var sums = { change:0, stability:0, outward:0, risk:0 };
  var answered = 0;
  QUESTIONS.forEach(function (q, i) {
    var a = answers[i];
    if (a == null || !q.opts[a]) return;
    answered++;
    var w = q.opts[a].w;
    sums.change += w[0]; sums.stability += w[1]; sums.outward += w[2]; sums.risk += w[3];
  });
  var max = Math.max(3, answered * 3) * 100;
  var out = {};
  Object.keys(sums).forEach(function (k) { out[k] = Math.round(sums[k] / max * 100); });
  out.answered = answered;

  var moving = out.change >= 60 || out.outward >= 60;
  var chartMoving = c.balance < 0.55 || aff.primary !== aff.dm;
  var align = moving === chartMoving;
  out.verdict = lang === 'en'
    ? (align
        ? 'Your answers and the chart point the same way. ' + (moving ? 'A wider radius is consistent with the reading — the work is choosing where, not whether.' : 'Staying put and deepening is consistent — no need to force a move.')
        : 'Your answers and the chart disagree. ' + (moving ? 'You want movement, but the chart favours consolidating first; sequence matters more than distance.' : 'You prefer stability, yet the chart shows more gain in a change of setting — at least keep one door open.'))
    : (align
        ? '你的回答与盘面同向。' + (moving ? '往外走与盘象一致，真正要定的不是「要不要」，而是「去哪」。' : '深耕与盘象一致，不必为了动而动。')
        : '你的回答与盘面有分歧。' + (moving ? '你想动，盘却偏向先收束；先后次序比距离更要紧。' : '你偏稳，盘却显示换环境收益更大——至少留一扇门。'));
  return out;
}

/* ---------- 4. rendering ---------- */
function Z(x, lang) { return x && (lang === 'en' ? x.en : x.zh) ? (lang === 'en' ? x.en : x.zh) : (x && x.zh) || ''; }
function h(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
  return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }

function compassSVG(aff, corr, lang) {
  var deg = aff.dir.deg == null ? 90 : aff.dir.deg;
  var marks = lang === 'en'
    ? [['N','0'],['NE','45'],['E','90'],['SE','135'],['S','180'],['SW','225'],['W','270'],['NW','315']]
    : [['北','0'],['东北','45'],['东','90'],['东南','135'],['南','180'],['西南','225'],['西','270'],['西北','315']];
  var cols = { '木':'#83a99f','火':'#b5563f','土':'#c8a86b','金':'#d9cfb6','水':'#7f97b8' };
  var parts = [];
  parts.push('<svg class="compass" viewBox="0 0 320 320" role="img" aria-label="' +
    (lang === 'en' ? 'Abstract Five-Phase direction compass (not a map)' : '抽象五行方位罗盘（非地图）') + '">');
  parts.push('<defs><radialGradient id="cg"><stop offset="0%" stop-color="#14161d"/><stop offset="100%" stop-color="#0a0b10"/></radialGradient></defs>');
  parts.push('<circle cx="160" cy="160" r="146" fill="url(#cg)" stroke="rgba(200,168,107,.35)" stroke-width="1"/>');
  parts.push('<circle cx="160" cy="160" r="116" fill="none" stroke="rgba(200,168,107,.22)"/>');
  parts.push('<circle cx="160" cy="160" r="78" fill="none" stroke="rgba(200,168,107,.14)"/>');
  parts.push('<circle cx="160" cy="160" r="40" fill="rgba(200,168,107,.06)" stroke="rgba(200,168,107,.3)"/>');
  [0,45,90,135,180,225,270,315].forEach(function (a) {
    var rad = a * Math.PI / 180;
    var x1 = 160 + 40 * Math.sin(rad), y1 = 160 - 40 * Math.cos(rad);
    var x2 = 160 + 140 * Math.sin(rad), y2 = 160 - 140 * Math.cos(rad);
    parts.push('<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="rgba(200,168,107,.16)" stroke-width="1"/>');
  });
  marks.forEach(function (mk) {
    var rad = Number(mk[1]) * Math.PI / 180;
    var x = 160 + 130 * Math.sin(rad), y = 160 - 130 * Math.cos(rad) + 4;
    parts.push('<text x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" text-anchor="middle" fill="#948d80" font-size="11" font-family="Georgia,serif">'+mk[0]+'</text>');
  });
  /* phase dots on the four cardinal directions */
  [['水',0],['木',90],['火',180],['金',270]].forEach(function (p) {
    var rad = p[1] * Math.PI / 180;
    var x = 160 + 96 * Math.sin(rad), y = 160 - 96 * Math.cos(rad);
    parts.push('<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="5" fill="'+cols[p[0]]+'" opacity="'+(p[0]===aff.primary?'1':'.45')+'"/>');
  });
  /* pointer toward the favoured direction */
  parts.push('<g class="compass-needle" transform="rotate(' + deg + ' 160 160)">' +
    '<line x1="160" y1="160" x2="160" y2="52" stroke="#e8d4a4" stroke-width="1.6"/>' +
    '<path d="M160 42 L154 58 L160 54 L166 58 Z" fill="#e8d4a4"/>' +
    '<circle cx="160" cy="160" r="4" fill="#e8d4a4"/></g>');
  parts.push('<text x="160" y="156" text-anchor="middle" fill="#8c7649" font-size="9" letter-spacing="2">' +
    (lang === 'en' ? 'FAVOURED' : '喜 用') + '</text>');
  parts.push('<text x="160" y="176" text-anchor="middle" fill="#e8d4a4" font-size="20" font-family="Georgia,serif">' +
    (lang === 'en' ? PHASE_EN[aff.primary] : aff.primary) + '</text>');
  if (corr.applied) {
    parts.push('<circle cx="160" cy="302" r="3" fill="' + aff.dir.color + '"/>');
  }
  parts.push('</svg>');
  return parts.join('');
}

function solarCard(c, corr, lang) {
  var clockName = lang === 'en' ? ZHI_EN[c.clockT || corr.clockT] : ZHI[c.clockT || corr.clockT];
  var solarName = lang === 'en' ? ZHI_EN[corr.t] : ZHI[corr.t];
  var L = {
    title:   { zh:'真太阳时校正', en:'Apparent Solar Time' },
    lon:     { zh:'出生地经度', en:'Birthplace longitude' },
    delta:   { zh:'经度时差', en:'Longitude offset' },
    eq:      { zh:'均时差', en:'Equation of time' },
    clock:   { zh:'钟表时辰', en:'Clock double-hour' },
    solar:   { zh:'校正后时辰', en:'Corrected double-hour' },
    cross:   { zh:'跨日：日柱已顺延一天', en:'Crossed midnight: day pillar advanced by one' },
    noPlace: { zh:'未识别出生地，仍按钟表时辰排盘。填入城市名即可启用经度校正。',
               en:'Birthplace not recognised; the clock hour is used. Enter a city name to enable longitude correction.' },
    approx:  { zh:'未填具体时刻，按时辰中点估算；填入出生时刻可提高精度。',
               en:'No exact time given; the mid-point of the double-hour is used. Enter a birth time for higher precision.' },
    exact:   { zh:'已按填写的具体时刻计算。', en:'Computed from the exact time you entered.' },
    ref:     { zh:'参考经线', en:'Zone central meridian' },
    note:    { zh:'真太阳时 = 钟表时 + (经度 − 所在时区中央经线) × 4 分钟 + 均时差。境内及港澳台统一 120°E；境外按当地标准时区中央经线。经度为内置静态表，未计夏令时，不调用任何定位服务；交界时辰请自行核对万年历。',
               en:'Apparent solar time = clock time + (longitude − zone central meridian) × 4 min + equation of time. China uses 120°E; overseas places use their standard-time meridian. Static built-in longitudes, no daylight-saving modelling, no location service; verify boundary hours against an ephemeris.' }
  };
  var rows = '';
  if (corr.applied) {
    rows =
      '<div class="sc-row"><dt>'+Z(L.lon,lang)+'</dt><dd>'+corr.lon.toFixed(2)+'° E</dd></div>' +
      '<div class="sc-row"><dt>'+Z(L.ref,lang)+'</dt><dd>'+Number(corr.ref).toFixed(0)+'° E</dd></div>' +
      '<div class="sc-row"><dt>'+Z(L.delta,lang)+'</dt><dd>'+(corr.delta>=0?'+':'')+corr.delta.toFixed(1)+' min</dd></div>' +
      '<div class="sc-row"><dt>'+Z(L.eq,lang)+'</dt><dd>'+(corr.eq>=0?'+':'')+corr.eq.toFixed(1)+' min</dd></div>' +
      '<div class="sc-row"><dt>'+Z(L.clock,lang)+'</dt><dd>'+h(clockName)+' · '+HOUR_ZH[corr.clockT]+'</dd></div>' +
      '<div class="sc-row"><dt>'+Z(L.solar,lang)+'</dt><dd><b>'+h(solarName)+' · '+HOUR_ZH[corr.t]+'</b></dd></div>' +
      (corr.dayOffset ? '<div class="sc-alert">'+Z(L.cross,lang)+'</div>' : '') +
      '<div class="sc-note">'+Z(corr.exact?L.exact:L.approx,lang)+'</div>';
  } else {
    rows = '<div class="sc-note">'+Z(L.noPlace,lang)+'</div>';
  }
  return '<div class="solar-card"><h4>'+Z(L.title,lang)+'</h4><dl>'+rows+'</dl><p>'+Z(L.note,lang)+'</p></div>';
}

function regionHTML(c, aff, D, cal, lang) {
  var groups = ['cn','hmt','out'];
  return groups.map(function (g) {
    var items = REGIONS.filter(function (r) { return r.g === g; }).map(function (r) {
      var s = regionScore(r, aff, D, cal);
      return '<div class="reg"><div class="reg-top"><span class="reg-name">'+h(Z(r,lang))+'</span>' +
        '<span class="reg-score">'+s+'</span></div>' +
        '<div class="reg-bar"><span style="width:'+s+'%;background:'+DIR[r.wx].color+'"></span></div>' +
        '<p class="reg-sub">'+h(Z(r.sub,lang))+'</p>' +
        '<p class="reg-note">'+h(regionNote(r, aff, s, lang))+'</p></div>';
    }).join('');
    return '<div class="reg-group"><h5>'+h(Z(GROUPS[g],lang))+'</h5>'+items+'</div>';
  }).join('');
}

function qaHTML(lang) {
  var q = QUESTIONS[0];
  return '<div class="qa-card" id="qa-card">' +
    '<div class="qa-top"><span class="qa-label">'+(lang==='en'?'CALIBRATION QUESTIONS':'问 答 校 准')+'</span>' +
      '<span class="qa-count" id="qa-count">01 / 06</span></div>' +
    '<div class="qa-progress"><span id="qa-bar" style="width:16.66%"></span></div>' +
    '<h4 class="qa-q" id="qa-q">'+h(Z(q,lang))+'</h4>' +
    '<div class="qa-opts" id="qa-opts">'+q.opts.map(function(o,i){
      return '<button type="button" class="qa-opt" data-i="'+i+'"><span class="qa-dot"></span>'+h(Z(o,lang))+'</button>';
    }).join('')+'</div>' +
    '<div class="qa-foot"><button type="button" class="qa-mini" id="qa-back">'+(lang==='en'?'BACK':'上 一 题')+'</button>' +
      '<button type="button" class="qa-mini" id="qa-skip">'+(lang==='en'?'SKIP':'跳 过')+'</button></div>' +
    '<p class="qa-privacy">'+(lang==='en'
      ? 'Answers are used only in your browser to adjust wording. Nothing is uploaded or stored.'
      : '答案只在你的浏览器内用于调整断语，不上传、不留存。')+'</p>' +
  '</div>' +
  '<div class="qa-result" id="qa-result" hidden></div>';
}

function resultHTML(c, aff, D, cal, lang) {
  var dims = DIMS.map(function (d) {
    return '<div class="dim"><span class="dim-name">'+h(Z(d,lang))+'</span>' +
      '<span class="dim-bar"><span style="width:'+cal[d.k]+'%"></span></span>' +
      '<span class="dim-val">'+cal[d.k]+'</span></div>';
  }).join('');
  var head = lang==='en' ? 'Calibrated reading' : '校 准 后 的 判 断';
  var tag = lang==='en'
    ? (cal.change>=60?'CHANGE-ORIENTED':cal.stability>=60?'STABILITY-ORIENTED':'BALANCED')
    : (cal.change>=60?'偏 动':cal.stability>=60?'偏 稳':'中 和');
  return '<div class="qr-inner"><div class="qr-head"><h4>'+head+'</h4><span class="qr-tag">'+tag+'</span></div>' +
    '<div class="dims">'+dims+'</div>' +
    '<p class="qr-verdict">'+h(cal.verdict)+'</p>' +
    '<p class="qr-note">'+(lang==='en'
      ? 'Scores above come from your six answers plus the chart\'s Five-Phase balance; they rank emphasis, not facts. Regional scores on the left have been recalculated with these answers.'
      : '以上分数由六题答案与盘面五行均衡合成，只用于调整侧重，不代表事实。左侧区域推荐度已按答案重新计算。')+'</p>' +
    '<button type="button" class="qa-mini" id="qa-reset">'+(lang==='en'?'RETAKE':'重 新 作 答')+'</button></div>';
}

/* Append both modules into an already-rendered reading. */
function append(body, c, D, lang) {
  if (!body || !window.GXJCore) return;
  lang = lang === 'en' ? 'en' : 'zh';
  var aff = affinity(c, D);
  var corr = c.corr || { applied:false, t:c.t, clockT:c.t, dayOffset:0 };
  var anchor = body.querySelector('.read-actions');
  if (!anchor || body.querySelector('#geo-module')) return;

  var titleA = lang==='en' ? 'Place & Direction' : '出 生 地 · 发 展 方 位';
  var titleB = lang==='en' ? 'Calibration Q&A' : '问 答 校 准';
  var lead = lang==='en'
    ? 'Birthplace now participates in the calculation: longitude drives an apparent-solar-time correction, and the Day Master\'s favoured phase sets a symbolic direction. This is a Five-Phase compass, not a geographic map.'
    : '出生地现已参与推算：经度用于真太阳时校正，日主喜用五行定出象意方位。下图为五行方位罗盘，不是地理地图。';
  var regionLead = lang==='en'
    ? 'Regional fit is a symbolic Five-Phase comparison, not migration, employment or investment advice. Hong Kong, Macao and Taiwan are listed as regions of China.'
    : '区域适配为五行象意比对，不是移民、就业或投资建议。中国香港、中国澳门、中国台湾均为中国的地区，单列一组。';

  var html =
  '<div class="read-section geo-sec" id="geo-module">' +
    '<div class="read-section-head"><span class="rs-no">X</span><h3 class="rs-title">'+titleA+'</h3><span class="rs-en">PLACE &amp; DIRECTION</span></div>' +
    '<p class="geo-lead">'+lead+'</p>' +
    '<div class="geo-layout"><div class="geo-compass">' + compassSVG(aff, corr, lang) +
      '<div class="compass-cap">'+(lang==='en'
        ? 'Favoured phase <b>'+PHASE_EN[aff.primary]+'</b> · direction <b>'+aff.dir.en+'</b>'
        : '喜用 <b>'+aff.primary+'</b> · 方位 <b>'+aff.dir.zh+'</b>')+'</div>' +
      '<p class="aff-reason">'+h(Z(aff.reason,lang))+'</p>' +
    '</div>' + solarCard(c, corr, lang) + '</div>' +
    '<h4 class="reg-title">'+(lang==='en'?'Regional fit':'区域适配')+'</h4>' +
    '<p class="geo-lead">'+regionLead+'</p>' +
    '<div class="reg-grid" id="reg-grid">'+regionHTML(c, aff, D, null, lang)+'</div>' +
  '</div>' +
  '<div class="read-section geo-sec" id="qa-module">' +
    '<div class="read-section-head"><span class="rs-no">XI</span><h3 class="rs-title">'+titleB+'</h3><span class="rs-en">SIX QUESTIONS</span></div>' +
    '<p class="geo-lead">'+(lang==='en'
      ? 'Six short questions calibrate the reading to your present situation. Your answers adjust the emphasis of the wording and the regional scores above.'
      : '六道短问题把断语校准到你当下的处境；答案会调整措辞侧重与上方区域推荐度。')+'</p>' +
    '<div class="qa-layout"><div class="qa-main">'+qaHTML(lang)+'</div>' +
      '<div class="qa-side"><h5>'+(lang==='en'?'HOW IT WORKS':'校 准 逻 辑')+'</h5>' +
      '<ol>'+(lang==='en'
        ? '<li>Each option carries four weights: change, stability, outward radius, risk.</li><li>Weights are summed and normalised against the chart\'s Five-Phase balance.</li><li>Regional scores are recomputed; a wider radius lifts overseas options, a steadier one lifts local options.</li><li>Everything runs locally. No answer leaves your browser.</li>'
        : '<li>每个选项带四个权重：变动、稳定、向外半径、冒险承受。</li><li>权重累加后与盘面五行均衡一并归一化。</li><li>区域推荐度重算：向外倾向高则抬升境外选项，偏稳则抬升本地选项。</li><li>全部本地计算，答案不离开浏览器。</li>')+'</ol></div></div>' +
  '</div>';

  anchor.insertAdjacentHTML('beforebegin', html);

  /* interaction state */
  var answers = [], idx = 0;
  var card = body.querySelector('#qa-card');
  var result = body.querySelector('#qa-result');
  var qEl = body.querySelector('#qa-q');
  var oEl = body.querySelector('#qa-opts');
  var countEl = body.querySelector('#qa-count');
  var barEl = body.querySelector('#qa-bar');
  var backEl = body.querySelector('#qa-back');

  function draw() {
    var q = QUESTIONS[idx];
    countEl.textContent = String(idx+1).padStart(2,'0') + ' / 06';
    barEl.style.width = ((idx+1)/QUESTIONS.length*100).toFixed(2) + '%';
    qEl.textContent = Z(q, lang);
    oEl.innerHTML = q.opts.map(function (o,i) {
      return '<button type="button" class="qa-opt'+(answers[idx]===i?' picked':'')+'" data-i="'+i+'"><span class="qa-dot"></span>'+h(Z(o,lang))+'</button>';
    }).join('');
    backEl.disabled = idx === 0;
  }
  function finish() {
    var cal = calibrate(answers, c, aff, lang);
    card.hidden = true;
    result.hidden = false;
    result.innerHTML = resultHTML(c, aff, D, cal, lang);
    var grid = body.querySelector('#reg-grid');
    if (grid) grid.innerHTML = regionHTML(c, aff, D, cal, lang);
    var reset = result.querySelector('#qa-reset');
    if (reset) reset.addEventListener('click', function () {
      answers = []; idx = 0; result.hidden = true; card.hidden = false; draw();
      var g = body.querySelector('#reg-grid');
      if (g) g.innerHTML = regionHTML(c, aff, D, null, lang);
    });
  }
  oEl.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.qa-opt') : null;
    if (!btn) return;
    answers[idx] = parseInt(btn.getAttribute('data-i'), 10);
    Array.prototype.forEach.call(oEl.querySelectorAll('.qa-opt'), function (b) { b.classList.remove('picked'); });
    btn.classList.add('picked');
    setTimeout(function () {
      if (idx < QUESTIONS.length - 1) { idx++; draw(); } else finish();
    }, 210);
  });
  body.querySelector('#qa-back').addEventListener('click', function () { if (idx > 0) { idx--; draw(); } });
  body.querySelector('#qa-skip').addEventListener('click', function () {
    answers[idx] = null;
    if (idx < QUESTIONS.length - 1) { idx++; draw(); } else finish();
  });
  draw();
}

window.GXJGeo = { correct:correct, append:append, affinity:affinity, CITY:CITY, QUESTIONS:QUESTIONS };
})();
