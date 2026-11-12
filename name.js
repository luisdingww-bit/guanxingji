/* ============================================================
   EPHEMERIS · NAME & CHART-STRUCTURE MODULE
   - Five-Grid name numerology (Kumazaki school, 1918 Japan)
   - Kangxi stroke counts, 81-numeral tiers, Three Talents
   - Bazi month-command structure + four-phase life arc
   - Combines with the birthplace / favoured-phase reading from geo.js

   Honest scope: name numerology is NOT classical Chinese Bazi or Zi Wei.
   It is a modern Japanese-derived school, transmitted to Taiwan/HK in the
   1930s, with disputed predictive validity. Sources are listed in the UI.
   ============================================================ */
(function () {
'use strict';

/* --- Kangxi (traditional-form) stroke counts, common-name selection ---
   Simplified characters are mapped to their traditional Kangxi count.
   Characters absent from this table are reported as "unverified" and
   the module deliberately withholds a numerology verdict. */
var KX = {
  /* surnames */
  '丁':2,'卜':2,'于':3,'于':3,'万':15,'萬':15,'王':4,'方':4,'毛':4,'孔':4,'尹':4,'尤':4,
  '史':5,'白':5,'石':5,'田':5,'包':5,'左':5,'甘':5,'司':5,'馬':10,'马':10,
  '朱':6,'任':6,'江':7,'何':7,'余':7,'吳':7,'吴':7,'李':7,'宋':7,'沈':7,'杜':7,'呂':7,'吕':7,'汪':7,
  '邱':8,'周':8,'林':8,'金':8,'孟':8,'岳':8,'易':8,'武':8,'邵':8,'欧':15,'歐':15,
  '胡':9,'姜':9,'姚':9,'韋':9,'韦':9,'段':9,'侯':9,'施':9,'柯':9,'紀':9,'纪':9,
  '高':10,'徐':10,'孫':10,'孙':10,'袁':10,'唐':10,'秦':10,'翁':10,'夏':10,'倪':10,'殷':10,'陸':10,'陆':10,
  '張':11,'张':11,'曹':11,'梁':11,'許':11,'许':11,'崔':11,'常':11,'康':11,'婁':11,'娄':11,
  '黃':12,'黄':12,'彭':12,'曾':12,'馮':12,'冯':12,'程':12,'湯':13,'汤':13,'賀':12,'贺':12,'傅':12,
  '楊':13,'杨':13,'雷':13,'賈':13,'贾':13,'鄒':12,'邹':12,
  '趙':14,'赵':14,'廖':14,'熊':14,'華':14,'华':14,
  '劉':15,'刘':15,'潘':15,'黎':15,'蔡':17,'蒋':17,'蔣':17,'鄧':19,'邓':19,'鄭':19,'郑':19,
  '錢':16,'钱':16,'盧':16,'卢':16,'陳':16,'陈':16,'陶':16,'龍':16,'龙':16,
  '謝':17,'谢':17,'韓':17,'韩':17,'鍾':17,'钟':17,'戴':18,'魏':18,
  '羅':19,'罗':19,'蕭':19,'萧':19,'譚':19,'谭':19,'嚴':20,'严':20,'顧':21,'顾':21,
  '龔':22,'龚':22,'蘇':22,'苏':22,'諸':15,'诸':15,'葛':15,'慕':15,'容':10,'上':3,'官':8,
  /* given-name characters */
  '一':1,'乙':1,'力':2,'人':2,'入':2,'又':2,
  '三':3,'上':3,'下':3,'子':3,'女':3,'小':3,'山':3,'川':3,'大':3,'千':3,'士':3,'之':4,
  '四':4,'中':4,'天':4,'文':4,'木':4,'水':4,'火':4,'心':4,'仁':4,'元':4,'友':4,'丹':4,'尹':4,
  '五':5,'玉':5,'生':5,'弘':5,'立':5,'平':5,'正':5,'民':5,'永':5,'世':5,'由':5,'加':5,'可':5,
  '六':6,'字':6,'安':6,'好':6,'光':6,'竹':6,'米':6,'臣':6,'自':6,'至':6,'舟':6,'旭':6,'亦':6,'百':6,'老':6,
  '男':7,'良':7,'成':7,'志':7,'宏':7,'君':7,'孝':7,'秀':7,'言':7,'辰':7,'佑':7,'妍':7,'廷':7,
  '明':8,'東':8,'东':8,'長':8,'长':8,'青':8,'昌':8,'忠':8,'承':8,'依':8,'佳':8,'欣':8,'宜':8,'雨':8,
  '建':9,'俊':9,'信':9,'盈':9,'秋':9,'炳':9,'科':9,'虹':9,'星':9,'柏':9,'泉':9,'冠':9,'奕':9,
  '家':10,'軒':10,'轩':10,'恩':10,'庭':10,'哲':10,'峰':10,'倫':10,'伦':10,'書':10,'书':10,'容':10,
  '恆':10,'恒':10,'祐':10,'芳':10,'芷':10,'純':10,'纯':10,'紋':10,'纹':10,
  '偉':11,'伟':11,'國':11,'国':11,'敏':11,'章':11,'祥':11,'珮':11,'婉':11,'翌':11,'培':11,'婕':11,
  '涵':12,'凱':12,'凯':12,'善':12,'博':12,'傑':12,'杰':12,'景':12,'雅':12,'淳':12,'惠':12,
  '翔':12,'然':12,'晴':12,'舒':12,'婷':12,'惟':12,'雯':12,'堯':12,'尧':12,
  '暉':13,'晖':13,'新':13,'義':13,'义':13,'裕':13,'鼎':13,'琪':13,'瑜':13,'楓':13,'枫':13,
  '筠':13,'詩':13,'诗':13,'聖':13,'圣':13,'熙':13,'群':13,'楠':13,
  '嘉':14,'榮':14,'荣':14,'銘':14,'铭':14,'寧':14,'宁':14,'瑋':14,'玮':14,'菁':14,'萌':14,'瑜':14,
  '慧':15,'德':15,'毅':15,'霆':15,'瑩':15,'莹':15,'慶':15,'庆':15,'賢':15,'贤':15,'儀':15,'仪':15,
  '儒':16,'霖':16,'靜':16,'静':16,'穎':16,'颖':16,'璇':16,'曉':16,'晓':16,'蓁':16,'樺':16,'桦':16,
  '駿':17,'骏':17,'鴻':17,'鸿':17,'璟':17,'遠':17,'远':17,'霞':17,'謙':17,'谦':17,
  '豐':18,'丰':18,'謹':18,'谨':18,'顏':18,'颜':18,'蕊':18,
  '麗':19,'丽':19,'鵬':19,'鹏':19,'韻':19,'韵':19,
  '寶':20,'宝':20,'馨':20,'瀚':20,'曦':20,
  '鶴':21,'鹤':21,'譽':21,'誉':21,'權':22,'权':22,'儷':23,'俪':23,
  '陽':12,'阳':12,'皇':9,'甫':7,'尉':11,'遲':15,'迟':15,'公':4,
  '海':11,'剛':10,'刚':10,'強':11,'强':11,'潔':16,'洁':16,'清':12,
  '怡':9,'珊':10,'珍':10,'彥':9,'彦':9,'維':14,'维':14,'綺':14,'绮':14,
  '澤':17,'泽':17,'諾':16,'诺':16,'謹':18,'鵬':19,'軒':10
};
var COMPOUND = ['歐陽','欧阳','司馬','司马','諸葛','诸葛','上官','慕容','夏侯','皇甫','尉遲','尉迟','公孫','公孙','長孫','长孙'];

/* 81 numerals, five tiers. Different schools disagree (notably 42 / 49);
   this is one documented five-tier table, not a universal authority. */
var TIERS = {
  great: [3,5,11,13,15,16,21,23,24,29,31,33,39,41,47,48,52,61,63,67,68,81],
  good:  [1,6,7,8,17,18,25,32,35,37,38,45,57,58,65,73],
  half:  [27,30,40,42,49,50,51,53,71,75,77,78],
  bad:   [2,4,12,22,26,36,43,55,72],
  worst: [9,10,14,19,20,28,34,44,46,54,56,59,60,62,64,66,69,70,74,76,79,80]
};
var TIER_ZH = { great:'大吉', good:'吉', half:'半吉', bad:'凶', worst:'大凶' };
var TIER_EN = { great:'Highly auspicious', good:'Auspicious', half:'Mixed', bad:'Inauspicious', worst:'Highly inauspicious' };
var TIER_COLOR = { great:'#c8a86b', good:'#83a99f', half:'#a89a7c', bad:'#b5563f', worst:'#8f3f30' };

var GRID_META = [
  { k:'heaven', zh:'天格', en:'Heaven Grid', noteZh:'先天传承，影响力最弱，主要与人格配合观察。', noteEn:'Inherited; the weakest influence, read mainly together with the Personality Grid.' },
  { k:'person', zh:'人格', en:'Personality Grid', noteZh:'主运，五格核心，主性格、才能、事业与人际。', noteEn:'Main luck and the centre of the five grids: character, ability, career and relationships.' },
  { k:'earth',  zh:'地格', en:'Earth Grid', noteZh:'前运，主中年以前的活动力与早年环境。', noteEn:'Early luck: activity and environment before middle age.' },
  { k:'outer',  zh:'外格', en:'Outer Grid', noteZh:'主社交、外部环境与亲缘厚薄。', noteEn:'Social contacts, outer circumstances and the breadth of family ties.' },
  { k:'total',  zh:'总格', en:'Total Grid', noteZh:'后运，主中年至晚年的整体走向。', noteEn:'Later luck: the overall course from middle age onward.' }
];
var WX_BY_TAIL = { 1:'木',2:'木',3:'火',4:'火',5:'土',6:'土',7:'金',8:'金',9:'水',0:'水' };
var WX_EN = { '木':'Wood','火':'Fire','土':'Earth','金':'Metal','水':'Water' };
var STRUCT = {
  '正官':{ zh:'正官格', en:'Direct Officer Structure' },
  '七杀':{ zh:'七杀格', en:'Seven Killings Structure' },
  '正财':{ zh:'正财格', en:'Direct Wealth Structure' },
  '偏财':{ zh:'偏财格', en:'Indirect Wealth Structure' },
  '食神':{ zh:'食神格', en:'Eating God Structure' },
  '伤官':{ zh:'伤官格', en:'Hurting Officer Structure' },
  '正印':{ zh:'正印格', en:'Direct Resource Structure' },
  '偏印':{ zh:'偏印格', en:'Indirect Resource Structure' },
  '比肩':{ zh:'建禄格', en:'Established Prosperity Structure' },
  '劫财':{ zh:'月刃格', en:'Monthly Blade Structure' }
};

function Z(x, lang) { return x ? (lang === 'en' ? (x.en || x.zh) : (x.zh || x.en)) : ''; }
function h(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
  return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }

function tenGod(dg, og, D) {
  var a = D.GAN_WX[dg], b = D.GAN_WX[og], same = (dg % 2) === (og % 2);
  if (a === b) return same ? '比肩' : '劫财';
  if (D.SHENG[a] === b) return same ? '食神' : '伤官';
  if (D.KE[a] === b) return same ? '偏财' : '正财';
  if (D.KE[b] === a) return same ? '七杀' : '正官';
  if (D.SHENG[b] === a) return same ? '偏印' : '正印';
  return '';
}
function numeral(n) {
  var v = n;
  while (v > 81) v -= 80;
  var tier = 'half';
  Object.keys(TIERS).forEach(function (k) { if (TIERS[k].indexOf(v) !== -1) tier = k; });
  var tail = v % 10;
  return { value:v, raw:n, tier:tier, wx:WX_BY_TAIL[tail], phase:WX_EN[WX_BY_TAIL[tail]] };
}

/* Five grids, per the documented formulas. */
function fiveGrids(name, D) {
  var s = String(name || '').replace(/[\s·・,，.。]/g, '');
  var chars = Array.from(s);
  if (!chars.length) return { ok:false, reason:'empty' };
  if (/[A-Za-z]/.test(s)) return { ok:false, reason:'latin', chars:chars };
  var missing = [];
  var strokes = chars.map(function (ch) {
    var v = KX[ch];
    if (v === undefined) { missing.push(ch); return null; }
    return v;
  });
  if (/[A-Za-z]/.test(s)) return { ok:false, reason:'latin', chars:chars };
  if (missing.length) return { ok:false, reason:'missing', missing:missing, chars:chars, strokes:strokes };

  var compound = null;
  for (var i = 0; i < COMPOUND.length; i++) if (s.indexOf(COMPOUND[i]) === 0) { compound = COMPOUND[i]; break; }
  var surnameLen = compound ? 2 : 1;
  if (chars.length < surnameLen + 1) return { ok:false, reason:'short', chars:chars };
  var given = strokes.slice(surnameLen);
  var surname = strokes.slice(0, surnameLen);
  var surLast = surname[surname.length - 1], surFirst = surname[0];
  var g1 = given[0], g2 = given.length > 1 ? given[1] : null;

  var heaven = compound ? (surFirst + surLast) : (surFirst + 1);
  var person = surLast + g1;
  var earth = g2 == null ? (g1 + 1) : (g1 + g2);
  var total = strokes.reduce(function (a, b) { return a + b; }, 0);
  var outer = compound
    ? (g2 == null ? (total - person + 1) : (total - person))
    : (g2 == null ? 2 : (total - person + 1));
  return {
    ok:true, compound:compound, chars:chars, strokes:strokes,
    values:{ heaven:heaven, person:person, earth:earth, outer:outer, total:total },
    numerals:{
      heaven:numeral(heaven), person:numeral(person), earth:numeral(earth),
      outer:numeral(outer), total:numeral(total)
    }
  };
}
function threeTalents(g, D) {
  var t = [g.numerals.heaven.wx, g.numerals.person.wx, g.numerals.earth.wx];
  var relations = [];
  for (var i = 0; i < 2; i++) {
    var a = t[i], b = t[i+1];
    if (a === b) relations.push('same');
    else if (D.SHENG[a] === b || D.SHENG[b] === a) relations.push('generate');
    else if (D.KE[a] === b || D.KE[b] === a) relations.push('control');
    else relations.push('neutral');
  }
  var harmful = relations.filter(function (r) { return r === 'control'; }).length;
  var grade = harmful === 0 ? 'smooth' : harmful === 1 ? 'mixed' : 'strained';
  return { phases:t, relations:relations, grade:grade };
}
function chartStructure(c, D) {
  var firstHidden = (c.pillars[1].cang || '').split(' · ')[0];
  var idx = D.GAN.indexOf(firstHidden);
  var god = idx >= 0 ? tenGod(c.dayGan, idx, D) : '';
  return { god:god, meta:STRUCT[god] || null, hidden:firstHidden, dm:D.GAN[c.dayGan] + ' ' + D.GAN_WX[c.dayGan] };
}

function noNameHTML(lang, reason, g) {
  var map = {
    empty:{ zh:'未填写姓名，姓名学部分未启用；下方仍按八字排出命格。', en:'No name entered, so name numerology is skipped. The Bazi structure below is still computed.' },
    latin:{ zh:'姓名含拉丁字母。五格剖象以汉字康熙笔画为基础，暂不结论；下方八字命格仍然有效。',
            en:'The name contains Latin letters. Five-Grid numerology requires Chinese characters with Kangxi stroke counts, so no verdict is given; the Bazi structure below still applies.' },
    short:{ zh:'姓名过短，无法区分姓与名；请填写完整汉字姓名。', en:'The name is too short to separate surname and given name. Please enter a full Chinese name.' },
    missing:{ zh:'笔画表未收录「'+h((g.missing || []).join('、'))+'」。为避免臆测，本站不对未核笔画的字下数理结论；下方八字命格仍然有效。',
              en:'Stroke data for "'+h((g.missing || []).join(', '))+'" is not in the verified table. Rather than guess, no numerology verdict is given; the Bazi structure below still applies.' }
  };
  return '<div class="nm-placeholder">'+Z(map[reason] || map.empty, lang)+'</div>';
}

function gridHTML(g, lang) {
  var rows = GRID_META.map(function (m) {
    var v = g.values[m.k], n = g.numerals[m.k];
    return '<div class="nm-grid"><div class="ng-head"><span class="ng-name">'+h(Z(m, lang))+'</span>' +
      '<span class="ng-tier" style="color:'+TIER_COLOR[n.tier]+'">'+(lang==='en'?TIER_EN[n.tier]:TIER_ZH[n.tier])+'</span></div>' +
      '<div class="ng-num">'+v+'</div>' +
      '<div class="ng-foot"><span>'+(lang==='en'?n.phase:n.wx)+' · '+(lang==='en'?'numeral '+n.value:'数理 '+n.value)+'</span></div>' +
      '<p class="ng-note">'+h(Z(m.noteZh ? {zh:m.noteZh,en:m.noteEn} : {zh:'',en:''}, lang))+'</p></div>';
  }).join('');
  return '<div class="nm-grids">'+rows+'</div>';
}
function strokesHTML(g, lang) {
  return '<div class="nm-strokes"><span class="ns-label">'+(lang==='en'?'Kangxi strokes':'康熙笔画')+'</span>' +
    g.chars.map(function (ch, i) {
      return '<span class="ns-item"><b>'+h(ch)+'</b> '+g.strokes[i]+'</span>';
    }).join('') +
    (g.compound ? '<span class="ns-tag">'+(lang==='en'?'compound surname':'复姓')+'</span>' : '') + '</div>';
}
function talentsHTML(t, lang) {
  var relZh = { same:'同气', generate:'相生', control:'相克', neutral:'平和' };
  var relEn = { same:'same phase', generate:'generating', control:'controlling', neutral:'neutral' };
  var tagZh = { smooth:'配置流畅', mixed:'喜忧参半', strained:'克制偏多' };
  var tagEn = { smooth:'A smooth configuration', mixed:'A mixed configuration', strained:'A strained configuration' };
  return '<div class="nm-talents"><div class="nt-chain">' +
    t.phases.map(function (p, i) {
      return (i ? '<span class="nt-link">'+(lang==='en'?relEn[t.relations[i-1]]:relZh[t.relations[i-1]])+'</span>' : '') +
        '<span class="nt-node">'+h(lang==='en'?WX_EN[p]:p)+'</span>';
    }).join('') + '</div><span class="nt-grade nt-'+t.grade+'">'+h(lang==='en'?tagEn[t.grade]:tagZh[t.grade])+'</span>'+
    '<p>'+(lang==='en'
      ? 'Heaven → Personality → Earth. Generating or identical phases are read as smooth; controlling phases as strained.'
      : '天 → 人 → 地。同气与相生为顺，相克为滞；三才只作姓名学内部的结构参考。')+'</p></div>';
}

function structureHTML(c, D, st, aff, g, lang) {
  var nameEn = st.meta ? st.meta.en : 'Undetermined Structure';
  var nameZh = st.meta ? st.meta.zh : '格局未定';
  var starTxt = c.mingStars.slice(0,2).map(function(s){ return D.TAROT ? (window.GXJI18N && lang==='en' ? (window.GXJI18N.TERMS.star[s]||s) : s) : s; }).join(' · ');
  var godEn = { '正官':'Direct Officer','七杀':'Seven Killings','正财':'Direct Wealth','偏财':'Indirect Wealth',
                '食神':'Eating God','伤官':'Hurting Officer','正印':'Direct Resource','偏印':'Indirect Resource',
                '比肩':'Friend','劫财':'Rob Wealth' }[st.god] || st.god;
  var strongWord = c.strength>=63 ? (lang==='en'?'strong':'偏旺') : c.strength<=40 ? (lang==='en'?'weak':'偏弱') : (lang==='en'?'balanced':'中和');
  var basis = lang==='en'
    ? 'Month branch <b>'+D.ZHI[c.pillars[1].z]+'</b> hides '+st.hidden+' → <b>'+godEn+'</b>; Day Master <b>'+D.GAN[c.dayGan]+' ('+D.GAN_WX[c.dayGan]+')</b>, '+strongWord+'; Life Palace stars <b>'+h(starTxt)+'</b>; favoured direction <b>'+(aff ? aff.dir.en : '—')+'</b>.'
    : '月支 <b>'+D.ZHI[c.pillars[1].z]+'</b> 藏干本气 '+st.hidden+' → <b>'+h(st.god)+'</b>；日主 <b>'+D.GAN[c.dayGan]+D.GAN_WX[c.dayGan]+'</b>，气势'+strongWord+'；命宫 <b>'+h(starTxt)+'</b>；喜用方位 <b>'+(aff?aff.dir.zh:'—')+'</b>。';
  /* strip the awkward trailing placeholder if aff is missing */
  basis = basis.replace(/<b>\s*<\/b>/g, '<b>—</b>');
  var verdict = lang==='en'
    ? 'Read together: the chart takes <b>'+nameEn+'</b> as its structural spine, the Day Master is '+strongWord+', and the favoured phase points '+(aff?'toward '+aff.dir.en:'inward')+'. '+
      (g && g.ok ? 'The name\'s main-luck numeral '+g.numerals.person.value+' ('+TIER_EN[g.numerals.person.tier]+') '+(g.numerals.person.tier==='great'||g.numerals.person.tier==='good'?'echoes that reading':'adds a caution to it')+'. ' : '')+
      'This is a symbolic synthesis of three different systems, not a factual forecast.'
    : '合而观之：盘面以 <b>'+nameZh+'</b> 为骨，日主'+strongWord+'，喜用之指向'+(aff?'「'+aff.dir.zh+'」':'未定')+'。'+
      (g && g.ok ? '姓名人格数理 '+g.numerals.person.value+'（'+TIER_ZH[g.numerals.person.tier]+'）'+(g.numerals.person.tier==='great'||g.numerals.person.tier==='good'?'与此同调':'对此另添一层提醒')+'。' : '')+
      '此为三套体系的象意合参，不是事实预测。';
  return '<div class="nm-structure"><div class="ns2-head"><div><span class="ns2-k">'+(lang==='en'?'CHART STRUCTURE':'命 格')+'</span>' +
    '<h4>'+h(lang==='en'?nameEn:nameZh)+'</h4></div>' +
    (g && g.ok ? '<span class="ns2-badge">'+(lang==='en'?'Main luck ':'人格 ')+g.numerals.person.value+'</span>' : '')+'</div>' +
    '<p class="ns2-basis">'+basis+'</p><p class="ns2-verdict">'+verdict+'</p></div>';
}

function lifeArcHTML(c, D, g, st, lang) {
  var labels = lang==='en'
    ? ['Laying roots · before 20','Building · 20–35','Turning · 35–50','Conserving · 50 onward']
    : ['立根 · 20 岁前','起势 · 20–35','转折 · 35–50','收敛 · 50 岁后'];
  var wordsZh = [
    '格局之根在此段成形，环境给的框架比个人选择更重；宜把基本功做厚，不必急着定方向。',
    '主运启动，'+ (st.god || '格局') +'之力开始兑现；适合在一条主线上持续加码，换跑道成本最高。',
    '总格与主运交接，盘面显示此处最易出现「该收的收、该放的放」；主动整理比被动应付划算。',
    '节奏转缓，宜守成、宜把经验结构化；往外扩张的收益下降，向内沉淀的收益上升。'
  ];
  var wordsEn = [
    'The structure takes root here; environment weighs more than choice. Build fundamentals rather than fixing a direction early.',
    'Main luck engages and the '+(st.meta?st.meta.en:'chart structure')+' starts to pay out. Compounding on one line beats switching tracks.',
    'Later luck meets main luck here. Deliberate pruning beats reacting to events — close what is overdue.',
    'The tempo slows. Consolidation and turning experience into a system outperform outward expansion.'
  ];
  var pts = c.pts || [];
  return '<div class="nm-arc">' + labels.map(function (lb, i) {
    var seg = pts.slice(i*2, i*2+3);
    var avg = seg.length ? Math.round(seg.reduce(function(a,p){return a+p.v;},0)/seg.length) : 55;
    return '<div class="na-item"><div class="na-dot"></div><div class="na-body">' +
      '<div class="na-top"><span>'+h(lb)+'</span><span class="na-score">'+(lang==='en'?'rhythm ':'节律 ')+avg+'</span></div>' +
      '<p>'+h(lang==='en'?wordsEn[i]:wordsZh[i])+'</p></div></div>';
  }).join('') + '</div>';
}

function sourcesHTML(lang) {
  var items = [
    ['五格剖象法 / Five-Grid numerology','baike.baidu.com/item/总格数理','https://baike.baidu.com/item/%E6%80%BB%E6%A0%BC%E6%95%B0%E7%90%86/1815675'],
    ['计算规则与康熙笔画 / Formulas & Kangxi strokes','ordoslfy.com','https://www.ordoslfy.com/court/847917a3.html'],
    ['81 数理五档表 / 81-numeral tiers','shunshi.ai','https://shunshi.ai/zh-cn/wiki/naming/wuge/shuli_81'],
    ['81 灵动数对照 / 81 numeral reference','suanming.tw','https://suanming.tw/numerology/nameology-81-numbers'],
    ['源流与争议 / Origin & dispute','baike.baidu.com 起名文化','https://baike.baidu.com/view/2804765.htm']
  ];
  return '<div class="nm-sources"><h5>'+(lang==='en'?'Sources & limits':'文献与边界')+'</h5><ul>' +
    items.map(function (it) { return '<li><a href="'+it[2]+'" target="_blank" rel="noopener noreferrer">'+h(it[0])+' ↗</a><span>'+h(it[1])+'</span></li>'; }).join('') +
    '</ul><p>'+(lang==='en'
      ? 'Five-Grid numerology was formulated in Japan in 1918 by Kumazaki Ken\'ō from Chinese numerological ideas, brought to Taiwan by Bai Huiwen in the 1930s, and only reached mainland China in the 1990s. It is NOT part of classical Bazi or Zi Wei, and its predictive validity is disputed. The 81-numeral table varies between schools (42 and 49 are contested). Stroke counts here use a curated Kangxi table; unverified characters yield no verdict. Nothing on this page is naming, legal, medical or life advice.'
      : '五格剖象由日本熊崎健翁于 1918 年据中国易学数理整理而成，1930 年代经白惠文传入台湾，1990 年代才在大陆流行，**不属于八字或紫微的正统体系**，应验性亦存争议。81 数理各派判法不一（42、49 等分歧尤大），本站采用其中一种五档表。笔画依据为精选康熙笔画表，未收录之字不下结论。本页不构成取名、法律、医疗或人生建议。').replace(/\*\*/g,'')+'</p></div>';
}

function append(body, c, D, lang) {
  if (!body || body.querySelector('#name-module')) return;
  lang = lang === 'en' ? 'en' : 'zh';
  var aff = window.GXJGeo && window.GXJGeo.affinity ? window.GXJGeo.affinity(c, D) : null;
  var name = (c.input && c.input.name) || '';
  var g = fiveGrids(name, D);
  var st = chartStructure(c, D);
  var anchor = body.querySelector('#geo-module') || body.querySelector('.read-actions');
  if (!anchor) return;

  var title = lang==='en' ? 'Name & Life Structure' : '姓 名 · 命 格';
  var lead = lang==='en'
    ? 'The name now joins the reading: Five-Grid numerology is cross-read with the Bazi month-command structure, the Life Palace stars and the birthplace direction. Three systems, one synthesis — with their different origins stated plainly below.'
    : '姓名现已纳入推演：五格数理与八字月令格局、命宫主星、出生地方位合参。三套体系同源与否，下方如实说明。';

  var inner = '';
  if (g.ok) {
    inner += strokesHTML(g, lang) + gridHTML(g, lang) + talentsHTML(threeTalents(g, D), lang);
  } else {
    inner += noNameHTML(lang, g.reason, g);
  }
  inner += structureHTML(c, D, st, aff, g, lang);
  inner += '<h4 class="nm-sub">'+(lang==='en'?'Life arc · four phases':'人生走向 · 四段')+'</h4>' +
           '<p class="geo-lead">'+(lang==='en'
             ? 'Phases combine the rhythm curve, the month-command structure and (where available) the name\'s main-luck numeral. They describe emphasis, not events.'
             : '四段由元气曲线、月令格局与姓名人格数理（如可用）合成，只描述侧重，不指向具体事件。')+'</p>' +
           lifeArcHTML(c, D, g, st, lang);
  inner += sourcesHTML(lang);

  var html = '<div class="read-section geo-sec" id="name-module">' +
    '<div class="read-section-head"><span class="rs-no">IX</span><h3 class="rs-title">'+title+'</h3><span class="rs-en">NAME &amp; STRUCTURE</span></div>' +
    '<p class="geo-lead">'+lead+'</p>' + inner + '</div>';
  anchor.insertAdjacentHTML('beforebegin', html);
}

window.GXJName = { append:append, fiveGrids:fiveGrids, numeral:numeral, KX:KX, TIERS:TIERS };
})();
