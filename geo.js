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


/* Three-dimensional regional reading, generated from phase + group + score. */
var INDUSTRY = {
  '木':{ zh:'教育、文创、生长型业务与需要长期培育的领域', en:'education, cultural work, and any field that grows slowly and needs patience' },
  '火':{ zh:'传媒、科技、能源与需要曝光度、传播力的行业', en:'media, technology, energy and fields that reward visibility and reach' },
  '土':{ zh:'地产、基建、运营、供应链与需要承载力的岗位', en:'property, infrastructure, operations and supply-chain roles that reward reliability' },
  '金':{ zh:'制造、金融、法务、标准与需要裁断执行力的方向', en:'manufacturing, finance, legal work and standards-driven roles that reward decisiveness' },
  '水':{ zh:'贸易、物流、跨域协作与需要流动、适配力的行当', en:'trade, logistics and cross-border coordination that reward mobility and adaptability' }
};
var PEOPLE = {
  cn:{ zh:'熟人网络密度高，关系靠时间累积；换城市等于把隐性资产重新建一遍。',
       en:'Dense established networks, accumulated over years. Changing city means rebuilding that invisible capital from scratch.' },
  hmt:{ zh:'跨境接口多，规则与节奏介于境内与海外之间，适合做「两头都懂」的角色。',
        en:'Many cross-border interfaces; rules and tempo sit between the mainland and overseas. Well suited to people who can read both sides.' },
  out:{ zh:'关系网需重建，身份与资历要重新被认证；短期孤独感高，长期自主性也高。',
        en:'Networks must be rebuilt and credentials re-recognised. Short-term isolation is higher; so is long-term autonomy.' }
};
var SHENG_STATIC = {'木':'火','火':'土','土':'金','金':'水','水':'木'};
function regionNoteEx(reg, aff, score, lang) {
  var p = aff.primary, w = reg.wx;
  var industry = INDUSTRY[w] || INDUSTRY['土'];
  var people = PEOPLE[reg.g];
  var strong = score >= 70, weak = score < 48;
  var pace = lang==='en'
    ? (strong ? 'The phase relation is a tailwind: a move here can be made earlier rather than later, with a two-to-three-year horizon.' :
       weak ? 'The phase relation asks for caution: test with a short stint or a project before committing residence.' :
              'A neutral relation: treat it as a steady option, and let the concrete opportunity decide rather than the compass.')
    : (strong ? '五行同气或相生，属顺风位；若有实质机会，可较早动，以二至三年为观察期。' :
       weak ? '五行相制，宜先以短期驻点或项目试水，不宜一步到位把生活重心搬过去。' :
              '不冲不扶，属平稳可选；让具体机会来决定，而不是让方位替你决定。');
  var relation = lang==='en'
    ? 'This region is '+(w===p?'the same phase as':(SHENG_STATIC[w]===p?'generating':'in a mixed relation with'))+' the favoured '+PHASE_EN[p]+'.'
    : '此区五行属'+w+'，与喜用'+p+(w===p?'同气':'相对')+'。';
  return '<div class="reg-dims">' +
    '<p><b>'+(lang==='en'?'Industry':'行业倾向')+'</b> '+h(Z(industry,lang))+'。</p>' +
    '<p><b>'+(lang==='en'?'People & environment':'人际与环境')+'</b> '+h(Z(people,lang))+'</p>' +
    '<p><b>'+(lang==='en'?'Pace':'节奏建议')+'</b> '+h(pace)+' <span class="reg-rel">'+h(relation)+'</span></p>' +
    '</div>';
}
function groupIntro(g, aff, lang) {
  var txt = {
    cn:{ zh:'境内区域：喜用方位主要改写的是「节奏」而非「命格」。同气之位省力，相制之位费力，但格局本身不因迁徙而变。',
         en:'Within mainland China: the favoured direction changes tempo, not structure. A same-phase location reduces friction; a controlling one adds it. The natal chart itself does not change with a move.' },
    hmt:{ zh:'中国港澳台地区：同属境内，但制度与接口更外向，五行上多取滨海火／东南木象，适合需要跨制度协调的人。',
          en:"China's Hong Kong, Macao and Taiwan regions: still within China, but with more outward-facing institutions and interfaces. Symbolically coastal Fire / south-eastern Wood — suited to work that spans different systems." },
    out:{ zh:'境外区域：距离放大的是「重建成本」，不是吉凶本身。喜用相生之位能减一点适应摩擦，但语言、资历认证与关系网仍要自己补。',
          en:'Overseas regions: distance amplifies rebuilding cost, not fortune. A generating phase softens some friction, but language, credential recognition and networks still have to be rebuilt.' }
  };
  return '<p class="reg-intro">'+h(Z(txt[g],lang))+'</p>';
}
function solarEssay(c, corr, lang) {
  if (!corr.applied) return '';
  return '<div class="geo-essay"><h5>'+(lang==='en'?'Why the correction changes the whole chart':'为什么这一步会改变整张盘')+'</h5><p>'+
    (lang==='en'
      ? 'Bazi assigns the month by solar terms and the hour by the Sun\'s local position, not by the clock on the wall. At ' + corr.lon.toFixed(2) + '°E the clock is ' + (corr.delta>=0?'+':'') + corr.delta.toFixed(1) + ' minutes from the zone meridian ' + Number(corr.ref).toFixed(0) + '°E, plus ' + corr.eq.toFixed(1) + ' minutes of equation of time. Near a double-hour boundary this is enough to move the Hour Pillar, which in turn moves the Life Palace and the whole Zi Wei star layout' + (corr.dayOffset ? ', and here it even crosses midnight, so the Day Pillar advances by one' : '') + '. Two people born at the same wall-clock time in different longitudes can therefore legitimately receive different charts. Birthplace is not decoration.'
      : '八字以节气定月、以当地太阳位置定时，不以墙上的钟为准。在 '+corr.lon.toFixed(2)+'°E，钟表时相对本时区中央经线 '+Number(corr.ref).toFixed(0)+'°E 差 '+(corr.delta>=0?'+':'')+corr.delta.toFixed(1)+' 分钟，再加均时差 '+corr.eq.toFixed(1)+' 分钟。若生在时辰交界，这足以换掉时柱；时柱一换，紫微命宫与十四主星全盘跟着改'+(corr.dayOffset?'；本例更跨过子夜，日柱亦顺延一天':'')+'。所以同一钟表时刻、不同经度出生的人，本就该得到不同的盘——出生地不是装饰字段。')+
    '</p></div>';
}
function directionEssay(c, aff, lang) {
  return '<div class="geo-essay"><h5>'+(lang==='en'?'Favoured direction in practice':'喜用方位实际怎么用')+'</h5><p>'+
    (lang==='en'
      ? 'The favoured '+PHASE_EN[aff.primary]+' points '+(aff.dir.deg===null?'inward, toward consolidation':aff.dir.en)+'. Read this as a question of environment: does the place make your characteristic way of working easier or harder? A same-phase location reduces friction in daily routine; a controlling one demands more structure. It is not a claim that luck is physically stored in a compass direction, and it is not immigration, employment or investment advice. '+(c.corr && c.corr.applied?'Your entered birthplace is already used for the solar-time correction above; the compass is a separate, symbolic layer.':'Enter a birthplace to enable the solar-time layer.')
      : '喜用'+h(aff.primary)+'指向'+(aff.dir.deg===null?'中央，宜守成收束':'「'+h(aff.dir.zh)+'」')+'。把它当成一个关于环境的问题：这个地方，是让你惯常的做事方式更省力，还是更费力？同气之位减摩擦，相制之位要求你多立规矩。它不意味着「运气藏在某个方位里」，更不是移民、就业或投资建议。'+(c.corr && c.corr.applied?'你填的出生地已用于上方真太阳时校正；罗盘是另一层象意，不与历法混用。':'填入出生地即可启用历法校正层。'))+
    '</p></div>';
}

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


function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
/* ------------------------------------------------------------------
   Concrete birthplace placement. Keywords carry region / phase / bearing;
   unmatched places fall back to a longitude band. No map, no coordinates
   beyond the longitude already used for solar-time correction.
   ------------------------------------------------------------------ */
var PLACE_MAP = [
  ['厦门|福州|泉州|莆田|漳州|福建','华东 · 闽南','South-east China (Fujian)','木','东南','South-east',135,'cn'],
  ['上海|苏|杭州|宁波|南京|浙江|江苏|安徽|合肥|无锡|苏州','华东','East China','木','东','East',90,'cn'],
  ['北京|天津|河北|石家庄|山西|太原|内蒙古|呼和浩特','华北','North China','水','北','North',0,'cn'],
  ['广州|深圳|东莞|佛山|珠海|广东|广西|南宁|海南|海口','华南','South China','火','南','South',180,'cn'],
  ['武汉|长沙|郑州|湖北|湖南|河南|南昌|江西','华中','Central China','土','中','Centre',null,'cn'],
  ['成都|重庆|四川|贵州|贵阳|云南|昆明|西藏|拉萨|陕西|西安|甘肃|兰州|宁夏|银川|青海|西宁|新疆|乌鲁木齐|喀什','西部','West China','金','西','West',270,'cn'],
  ['沈阳|大连|长春|哈尔滨|辽宁|吉林|黑龙江','东北','Northeast China','木','东北','North-east',45,'cn'],
  ['香港|中國香港|中国香港|hong kong','中国香港',"Hong Kong, China",'火','南','South',180,'hmt'],
  ['澳门|中國澳門|中国澳门|macao','中国澳门','Macao, China','火','南','South',180,'hmt'],
  ['台湾|台灣|中国台湾|中國台灣|台北|高雄|taiwan|taipei','中国台湾','Taiwan, China','木','东南','South-east',135,'hmt'],
  ['东京|tokyo|首尔|seoul|大阪|京都','东亚','East Asia','木','东','East',90,'out'],
  ['新加坡|曼谷|吉隆坡|越南|泰国|马来西亚|印尼|菲律宾|singapore|bangkok','东南亚','South-East Asia','火','南','South',180,'out'],
  ['伦敦|巴黎|柏林|法兰克福|阿姆斯特丹|london|paris|berlin','欧洲','Europe','金','西','West',270,'out'],
  ['纽约|洛杉矶|旧金山|温哥华|多伦多|芝加哥|new york|los angeles|san francisco|vancouver|toronto','北美','North America','金','西','West',270,'out'],
  ['悉尼|墨尔本|奥克兰|sydney|melbourne|auckland','澳新','Australasia','水','北','North',0,'out']
];
function locatePlace(place, lon) {
  var s = String(place || '').trim();
  if (s) {
    for (var i = 0; i < PLACE_MAP.length; i++) {
      var row = PLACE_MAP[i], keys = row[0].split('|');
      for (var j = 0; j < keys.length; j++) {
        if (s.toLowerCase().indexOf(keys[j].toLowerCase()) !== -1) {
          return { name:s, matched:keys[j], rz:row[1], re:row[2], wx:row[3],
                   dz:row[4], de:row[5], deg:row[6], g:row[7], lon:lon };
        }
      }
    }
  }
  if (lon == null || lon === undefined) {
    return { name:s || '', matched:'', rz:'未定位', re:'Not located', wx:'土',
             dz:'中', de:'Centre', deg:null, g:'cn', lon:null };
  }
  var band = lon < 100 ? ['西部','West China','金','西','West',270]
           : lon < 112 ? ['中西部','Central-West China','土','西南','South-west',225]
           : lon < 122 ? ['中东部','Central-East China','木','东南','South-east',135]
                       : ['东部沿海','Eastern Seaboard','木','东','East',90];
  return { name:s || '', matched:'经度带 ' + lon.toFixed(2) + '°E', rz:band[0], re:band[1],
           wx:band[2], dz:band[3], de:band[4], deg:band[5], g:'cn', lon:lon };
}
function hhmm(m) {
  var q = ((m % 1440) + 1440) % 1440;
  return String(Math.floor(q / 60)).padStart(2, '0') + ':' + String(q % 60).padStart(2, '0');
}
function relLabel(a, b, D, lang) {
  if (a === b) return lang==='en' ? 'same phase (同气)' : '同气';
  if (D.SHENG[a] === b) return lang==='en' ? 'a generates b (相生)' : '相生（我生彼）';
  if (D.SHENG[b] === a) return lang==='en' ? 'b generates a (受生)' : '受生（彼生我）';
  if (D.KE[a] === b) return lang==='en' ? 'a controls b (相克)' : '相克（我克彼）';
  if (D.KE[b] === a) return lang==='en' ? 'b controls a (受克)' : '受克（彼克我）';
  return lang==='en' ? 'neutral' : '平和';
}
function placeNumbers(c, D, aff, loc) {
  var dm = D.GAN_WX[c.dayGan], fav = aff.primary, lp = loc.wx;
  var favDeg = aff.dir.deg == null ? null : aff.dir.deg;
  var gap = (favDeg == null || loc.deg == null) ? null : Math.abs(favDeg - loc.deg);
  if (gap !== null && gap > 180) gap = 360 - gap;
  var same = lp === fav, gen = D.SHENG[lp] === fav, ctrl = D.KE[lp] === fav || D.KE[fav] === lp;
  var stay = Math.round(clamp(52 + (same?20:gen?11:ctrl?-13:0) + (gap===null?0:8-gap/22), 22, 92));
  var move = Math.round(clamp(55 + (same?9:gen?18:ctrl?-4:6) + (gap===null?0:gap/14), 24, 94));
  var back = Math.round(clamp(46 - (same?12:0) + (gap===null?0:gap/24), 18, 78));
  return { dm:dm, fav:fav, lp:lp, gap:gap, stay:stay, move:move, back:back,
           same:same, gen:gen, ctrl:ctrl, favDeg:favDeg };
}
function starText(arr, lang) {
  if (!arr || !arr.length) return lang==='en' ? 'empty palace' : '空宫';
  return arr.slice(0,2).map(function (s) {
    return lang==='en' && window.GXJI18N ? (window.GXJI18N.TERMS.star[s] || s) : s;
  }).join(' · ');
}

/* --- 1. the numeric chain from birthplace to the chart --- */
function chainHTML(c, D, loc, corr, aff, lang) {
  var ZHI = D.ZHI, GAN = D.GAN;
  var bn = function (z) { return lang==='en' && window.GXJI18N ? window.GXJI18N.TERMS.branch[z] : ZHI[z]; };
  var gn = function (g) { return lang==='en' && window.GXJI18N ? window.GXJI18N.TERMS.stem[g] : GAN[g]; };
  var clockT = corr.clockT == null ? c.clockT : corr.clockT;
  var corrected = gn((C_ziGan(c, D) + corr.t) % 10) + bn(corr.t);
  var naive = c.naive || null;
  var naiveText = naive ? (gn(naive.hourGan) + bn(naive.t)) : '—';
  var alt = c.alt || null;
  var altText = alt ? (gn(alt.hourGan) + bn(alt.t)) : '—';
  var changed = naive && (naive.t !== corr.t);
  var steps = [];
  steps.push([lang==='en' ? 'You entered' : '你填的是',
    (loc.name || (lang==='en'?'not entered':'未填')) + (loc.lon!=null ? ' · ' + loc.lon.toFixed(2) + '°E' : '') +
    (loc.matched ? ' · ' + (lang==='en'?'matched: ':'归类：') + loc.matched : '')]);
  steps.push([lang==='en' ? 'Longitude offset' : '经度时差',
    corr.applied
      ? ((lang==='en'?'central meridian ':'中央经线 ') + Number(corr.ref).toFixed(0) + '°E · (' + loc.lon.toFixed(2) + '−' + Number(corr.ref).toFixed(0) + ') × 4 = ' +
         (corr.delta>=0?'+':'') + corr.delta.toFixed(1) + ' min' + (lang==='en'?' · equation of time ':' · 均时差 ') + (corr.eq>=0?'+':'') + corr.eq.toFixed(1) + ' min')
      : (lang==='en' ? 'No recognised place — no correction applied.' : '未识别到出生地，未做校正。')]);
  steps.push([lang==='en' ? 'Clock → apparent solar time' : '钟表时 → 真太阳时',
    hhmm(corr.clock) + ' → ' + hhmm(corr.solar) + (corr.exact ? '' : (lang==='en'?' (hour mid-point)':'（时辰中点）')) +
    ' · ' + (lang==='en'?'hour ':'时辰 ') + (lang==='en'? '': ZHI[clockT] + ' → ') + bn(corr.t) +
    ' · ' + (lang==='en' ? c.toBoundary + ' min to the next hour boundary' : '距下一时辰边界还有 ' + c.toBoundary + ' 分钟')]);
  steps.push([lang==='en' ? 'Hour Pillar' : '时柱',
    (lang==='en'?'corrected ':'校正后 ') + '<b>' + h(corrected) + '</b>' +
    (lang==='en'?' · clock-only would give ':' · 只按钟表则为 ') + '<b>' + h(naiveText) + '</b>' +
    (changed ? (lang==='en'?' — <b>the pillar changes</b>':' — <b>时柱已改变</b>') : (lang==='en'?' — unchanged':' — 本次未换柱'))]);
  steps.push([lang==='en' ? 'Life Palace & stars' : '命宫与主星',
    (lang==='en'?'corrected ':'校正后 ') + '<b>' + bn(c.mingZhi) + '</b> · ' + h(starText(c.mingStars, lang)) +
    (naive ? (lang==='en'?' · clock-only ':' · 不校正则 ') + bn(naive.mingZhi) + ' · ' + h(starText(naive.stars, lang)) : '')]);
  steps.push([lang==='en' ? 'If born just across the boundary' : '若生在交界另一侧',
    '<b>' + h(altText) + '</b>' + (lang==='en'?' → Life Palace ':' → 命宫 ') + (alt?bn(alt.mingZhi):'—') +
    ' · ' + h(starText(alt ? alt.stars : [], lang)) +
    (lang==='en'
      ? '. This is why the birthplace field is not decoration: eight minutes moved the whole star layout for people born near 11:00 or 23:00.'
      : '。这就是出生地不是装饰字段的原因：生在 11:00 / 23:00 交界的人，几分钟之差会换掉整张星盘。')]);
  var title = lang==='en' ? 'Birthplace → your chart, step by step' : '出生地 → 你的命盘：逐步可复算';
  return '<div class="chain"><h5>' + title + '</h5>' + steps.map(function (s, i) {
    return '<div class="chain-step"><span class="cs-n">' + String(i+1).padStart(2,'0') + '</span>' +
      '<div class="cs-body"><span class="cs-k">' + h(s[0]) + '</span><span class="cs-val">' + s[1] + '</span></div></div>';
  }).join('') + '</div>';
}
function C_ziGan(c, D) {
  /* recompute the Zi-hour stem from the day stem (Five Rats) */
  return (c.dayGan % 5) * 2;
}

/* --- 2. birthplace phase × Day Master × favoured phase, with numbers --- */
function placeVerdictHTML(c, D, aff, loc, corr, lang) {
  var n = placeNumbers(c, D, aff, loc);
  var dmWx = n.dm, fav = n.fav, lp = n.lp;
  var wxs = c.wxPct || {};
  var head = lang==='en'
    ? 'Your birthplace is <b>'+h(loc.re||loc.rz)+'</b> ('+h(loc.de)+ (loc.deg!=null?' '+loc.deg+'°':'') +'), classed <b>'+PHASE_EN[lp]+'</b>. Day Master is <b>'+D.GAN[c.dayGan]+' ('+PHASE_EN[dmWx]+')</b>; the chart favours <b>'+PHASE_EN[fav]+'</b> ('+h(aff.dir.en)+ (n.favDeg!=null?' '+n.favDeg+'°':'') +').'
    : '出生地 <b>'+h(loc.rz)+'</b>（'+h(loc.dz)+(loc.deg!=null?' '+loc.deg+'°':'')+'），五行属 <b>'+h(lp)+'</b>；日主 <b>'+D.GAN[c.dayGan]+h(dmWx)+'</b>，盘面喜用 <b>'+h(fav)+'</b>（'+h(aff.dir.zh)+(n.favDeg!=null?' '+n.favDeg+'°':'')+'）。';
  var rel1 = relLabel(lp, dmWx, D, lang), rel2 = relLabel(lp, fav, D, lang);
  var pctDm = wxs[dmWx] != null ? wxs[dmWx] : '—';
  var pctFav = wxs[fav] != null ? wxs[fav] : '—';
  var body = lang==='en'
    ? 'Local phase '+PHASE_EN[lp]+' vs your Day Master '+PHASE_EN[dmWx]+': <b>'+h(rel1)+'</b>. Your chart already carries '+pctDm+'% '+PHASE_EN[dmWx]+' and '+pctFav+'% '+PHASE_EN[fav]+'; against the favoured phase the local phase is <b>'+h(rel2)+'</b>. '+
      (n.same ? 'That means the place you started from reinforces the phase you need — early grounding is real, but staying also keeps adding the same input rather than opening an outlet.' :
       n.gen ? 'The local phase generates your favoured phase, so the starting environment quietly feeds the thing the chart needs; the risk is taking that support for granted.' :
       n.ctrl ? 'The local phase works against the favoured phase, which reads as friction in daily routine rather than bad luck.' :
                'The local phase is neutral to the favoured phase; place is neither helping nor blocking the core structure.')+
      (n.gap!=null ? ' The compass gap between home ('+loc.deg+'°) and the favoured direction ('+n.favDeg+'°) is <b>'+n.gap+'°</b> — '+(n.gap<=45?'adjacent, a short move in symbolic terms':n.gap<=135?'a quarter-to-half turn, a real change of setting':'nearly opposite, the largest adjustment')+'.' : '')
    : '本地'+h(lp)+'与日主'+h(dmWx)+'：<b>'+h(rel1)+'</b>。你的盘里'+h(dmWx)+'已占 '+pctDm+'%、喜用'+h(fav)+'占 '+pctFav+'%；本地五行对喜用是 <b>'+h(rel2)+'</b>。'+
      (n.same ? '也就是说，你起步的地方正好补着你需要的那股气——早年得地是真的，但继续留着，是继续加同一种输入，而不是替它开一个出口。' :
       n.gen ? '本地之气生喜用，起点的环境在不动声色地供着盘面所需；要留意的是把这份托底当成理所当然。' :
       n.ctrl ? '本地之气与喜用相制，读作日常节奏上的摩擦，不是「运气差」。' :
                '本地与喜用不冲不扶，方位既不帮忙也不挡路，核心结构仍由八字本身决定。')+
      (n.gap!=null ? ' 罗盘上本地方位 '+loc.deg+'° 与喜用方位 '+n.favDeg+'° 相差 <b>'+n.gap+'°</b> —— '+(n.gap<=45?'相邻位，象意上是一次短距离移动':n.gap<=135?'四分之一到半圈，属于真正换环境':'近乎对冲，是最大的一次调整')+'。' : '');
  var metrics = [
    { k:lang==='en'?'Stay near birthplace':'留在本地', v:n.stay, d:lang==='en'?'same-phase grounding, limited outlet':'同气托底，但出口有限' },
    { k:lang==='en'?'Move toward favoured direction':'往喜用方位', v:n.move, d:lang==='en'?'opens the generating / draining path':'引出相生或泄秀的路径' },
    { k:lang==='en'?'Move opposite':'反向而行', v:n.back, d:lang==='en'?'highest rebuilding cost':'重建成本最高' }
  ].map(function (m) {
    return '<div class="pv-metric"><div class="pm-top"><span>'+h(m.k)+'</span><b>'+m.v+'</b></div>' +
      '<div class="pm-bar"><span style="width:'+m.v+'%"></span></div><p>'+h(m.d)+'</p></div>';
  }).join('');
  var note = lang==='en'
    ? 'Scores come from the phase relation (same +20 / generating +11 / controlling −13), the bearing gap and the chart\'s balance index '+Math.round(c.balance*100)+'/100. They rank environmental friction, not fortune.'
    : '分数由五行关系（同气 +20 / 相生 +11 / 相制 −13）、方位夹角与盘面均衡度 '+Math.round(c.balance*100)+'/100 合成，排的是环境摩擦，不是吉凶。';
  return '<div class="place-verdict"><h5>'+(lang==='en'?'Your birthplace × your chart':'出生地 × 你的命格')+'</h5>' +
    '<p class="pv-head">'+head+'</p><p class="pv-body">'+body+'</p>' +
    '<div class="pv-metrics">'+metrics+'</div><p class="pv-note">'+note+'</p></div>';
}

/* --- 3. four life phases tied to this person, this place, this direction --- */
function futurePlaceHTML(c, D, aff, loc, lang) {
  var n = placeNumbers(c, D, aff, loc);
  var dm = D.GAN[c.dayGan] + D.GAN_WX[c.dayGan];
  var st = c.pillars[1].god || '';
  var stars = starText(c.mingStars, lang);
  var pts = c.pts || [];
  var segAvg = function (i) {
    var a = pts.slice(i*2, i*2+3);
    return a.length ? Math.round(a.reduce(function (s,p){return s+p.v;},0)/a.length) : 55;
  };
  var zh = [
    '以 '+ (loc.name||'你的出生地') +' 起盘，本地'+loc.wx+'与日主'+D.GAN_WX[c.dayGan]+'为'+relLabel(loc.wx, D.GAN_WX[c.dayGan], D, 'zh')+'。这落到你身上就是：早年的秩序感由环境给足，不必自己挣，所以习惯先观察再动。此段节律 '+segAvg(0)+'/100，'+(n.same?'同气太足反而少了推力，宜把可迁移的本事攒下，别急着离乡':'本地不供这股气，宜向外找补，但不必急着搬')+'。命宫'+stars+'，也偏向先在既有结构里长本事。',
    '月柱十神「'+st+'」、日主'+dm+'，这一段要的是'+ (n.gen?'把本地的相生之气变成作品与收入':'一个能把'+aff.primary+'之气引出来的出口') +'。喜用方位 '+ (n.favDeg!=null?n.favDeg+'°':'中央') +'，与本地差 '+(n.gap!=null?n.gap+'°':'—')+'；若 '+n.move+' > '+n.stay+'（本例正是如此），含义很具体：这十年换环境的收益高于只换工作，因为换环境同时改了方位、行业与人际密度。节律 '+segAvg(1)+'/100，宜在一条主线上加码，不宜三条并行。',
    '到这里，'+(c.strengthWord==='偏旺'?'日主偏旺':'日主'+c.strengthWord)+'、'+aff.primary+'气 '+ (c.wxPct[aff.primary]!=null?c.wxPct[aff.primary]+'%':'—') +'，命宫'+stars+'的结构开始显出上限：旧环境能给的都给过了。盘面这一段最值得做的，是把前面攒的东西换一个承载它的地方——'+(n.gap!=null&&n.gap<=45?'夹角只有 '+n.gap+'°，不必跨大区，往相邻的火／土位就够':'夹角 '+n.gap+'°，需要一次真正的跨区移动')+'。节律 '+segAvg(2)+'/100，主动整理胜过被动应付。',
    '末段节律 '+segAvg(3)+'/100，留 '+n.stay+' / 往 '+n.move+' / 反 '+n.back+' 的差距在这里收敛：方位不再决定增量，决定的是你把经验交给谁。若前一段已经往喜用方位动过，此处宜守成、把「会做」变成「可传」；若一直留在本地，也无需补一次迁移，真正要补的是'+aff.primary+'气对应的作息与输出习惯。'
  ];
  var en = [
    'Charted from '+(loc.name||'your birthplace')+': local '+PHASE_EN[loc.wx]+' vs Day Master '+PHASE_EN[D.GAN_WX[c.dayGan]]+' is '+relLabel(loc.wx, D.GAN_WX[c.dayGan], D, 'en')+'. For you that means early order was supplied by the environment rather than earned — hence the instinct to observe before moving. Rhythm here is '+segAvg(0)+'/100; '+(n.same?'same-phase grounding is real but adds no thrust, so bank transferable skills rather than leaving early':'the place does not supply that phase, so look outward for it without relocating yet')+'. Life Palace '+h(stars)+' also favours growing competence inside an existing structure.',
    'Month-pillar relationship "'+h((window.GXJI18N && window.GXJI18N.TERMS.god[st]) || st)+'" with Day Master '+D.GAN[c.dayGan]+' ('+PHASE_EN[D.GAN_WX[c.dayGan]]+') wants '+(n.gen?'the local generating phase turned into output and income':'an outlet that draws out '+PHASE_EN[aff.primary])+'. The favoured bearing is '+(n.favDeg!=null?n.favDeg+'°':'centre')+', '+ (n.gap!=null?n.gap+'°':'—') +' from home. When the move score ('+n.move+') exceeds the stay score ('+n.stay+'), the concrete reading is: changing environment pays more than changing job, because it alters bearing, industry and network density at once. Rhythm '+segAvg(1)+'/100 — compound on one line, not three.',
    'By now a '+(c.strength>=63?'strong':c.strength<=40?'weak':'balanced')+' Day Master with '+ (c.wxPct[aff.primary]!=null?c.wxPct[aff.primary]+'%':'—') +' '+PHASE_EN[aff.primary]+' and a Life Palace of '+h(stars)+' shows its ceiling: the starting environment has given what it can. The useful move is to put accumulated work somewhere that can carry it — '+(n.gap!=null&&n.gap<=45?'only '+n.gap+'° apart, so an adjacent Fire/Earth region suffices, not a cross-continent leap':'a '+n.gap+'° gap, so a genuine cross-region move')+'. Rhythm '+segAvg(2)+'/100; deliberate pruning beats reacting.',
    'Final rhythm '+segAvg(3)+'/100. The stay '+n.stay+' / move '+n.move+' / opposite '+n.back+' spread narrows here: direction stops adding increment, and what matters is who receives the experience. If you already moved toward the favoured bearing, consolidate and make skill teachable; if you stayed, a late relocation is not owed — what is owed is the daily routine and output habit that '+PHASE_EN[aff.primary]+' stands for.'
  ];
  var labels = lang==='en'
    ? ['Before 20 · where you started','20–35 · where the structure pays','35–50 · where the ceiling appears','50 onward · what you hand on']
    : ['20 岁前 · 起点给了什么','20–35 · 格局在哪里兑现','35–50 · 上限在哪里出现','50 岁后 · 交给谁'];
  return '<div class="future-place"><h5>'+(lang==='en'?'Your future, tied to your birthplace and chart':'未来走向 × 出生地 × 你的命格')+'</h5>' +
    labels.map(function (lb, i) {
      return '<div class="fp-item"><span class="fp-age">'+h(lb)+'</span><p>'+h(lang==='en'?en[i]:zh[i])+'</p></div>';
    }).join('') + '</div>';
}

function compassSVG(aff, corr, lang, loc) {
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
  /* dashed pointer toward the birthplace bearing */
  if (loc && loc.deg != null) {
    parts.push('<g class="compass-local" transform="rotate(' + loc.deg + ' 160 160)">' +
      '<line x1="160" y1="160" x2="160" y2="70" stroke="#83a99f" stroke-width="1.3" stroke-dasharray="4 4" opacity=".85"/>' +
      '<circle cx="160" cy="70" r="3.4" fill="#83a99f"/></g>');
  }
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
        '<div class="reg-note">'+regionNoteEx(r, aff, s, lang)+'</div></div>';
    }).join('');
    return '<div class="reg-group"><h5>'+h(Z(GROUPS[g],lang))+'</h5>'+groupIntro(g, aff, lang)+items+'</div>';
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

  var loc = locatePlace(c.input && c.input.place, corr.lon);
  var titleA = lang==='en' ? 'Birthplace × Your Chart' : '出 生 地 × 你 的 命 盘';
  var titleB = lang==='en' ? 'Calibration Q&A' : '问 答 校 准';
  var lead = lang==='en'
    ? 'Every figure below is computed from what you entered: your place, your clock time, your four pillars. Gold needle = favoured phase direction; dashed green = your birthplace bearing. This is a symbolic compass, not a map.'
    : '下面每个数字都由你填的内容算出：出生地、出生时刻、四柱。金色指针为喜用方位，绿色虚线为出生地方位；这是象意罗盘，不是地理地图。';
  var regionLead = lang==='en'
    ? 'Regional fit is a symbolic Five-Phase comparison, not migration, employment or investment advice. Hong Kong, Macao and Taiwan are listed as regions of China.'
    : '区域适配为五行象意比对，不是移民、就业或投资建议。中国香港、中国澳门、中国台湾均为中国的地区，单列一组。';

  var html =
  '<div class="read-section geo-sec" id="geo-module">' +
    '<div class="read-section-head"><span class="rs-no">X</span><h3 class="rs-title">'+titleA+'</h3><span class="rs-en">PLACE &amp; DIRECTION</span></div>' +
    '<p class="geo-lead">'+lead+'</p>' +
    chainHTML(c, D, loc, corr, aff, lang) + placeVerdictHTML(c, D, aff, loc, corr, lang) +
    solarEssay(c, corr, lang) +
    '<div class="geo-layout"><div class="geo-compass">' + compassSVG(aff, corr, lang, loc) +
      '<div class="compass-cap">'+(lang==='en'
        ? 'Favoured phase <b>'+PHASE_EN[aff.primary]+'</b> · direction <b>'+aff.dir.en+'</b>'
        : '喜用 <b>'+aff.primary+'</b> · 方位 <b>'+aff.dir.zh+'</b>')+'</div>' +
      '<p class="aff-reason">'+h(Z(aff.reason,lang))+' '+
      (lang==='en'
        ? 'Birthplace bearing '+(loc.deg!=null?loc.deg+'°':'—')+' ('+h(loc.de)+') vs favoured '+(aff.dir.deg!=null?aff.dir.deg+'°':'centre')+'.'
        : '出生地方位 '+(loc.deg!=null?loc.deg+'°':'—')+'（'+h(loc.dz)+'）对照喜用 '+(aff.dir.deg!=null?aff.dir.deg+'°':'中')+'。')+'</p>' +
    '</div>' + solarCard(c, corr, lang) + '</div>' +
    '<h4 class="reg-title">'+(lang==='en'?'Regional fit · three dimensions':'区域适配 · 三维展开')+'</h4>' +
    '<p class="geo-lead">'+regionLead+'</p>' +
    '<div class="reg-grid" id="reg-grid">'+regionHTML(c, aff, D, null, lang)+'</div>' +
    futurePlaceHTML(c, D, aff, loc, lang) +
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
