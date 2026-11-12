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
/* --- decoded public dataset (20k+ Kangxi stroke entries) --- */
var DATA = window.GXJNamingData || { kx:'', wx:'', shuli81:{}, sancai:{} };
var KX_MAP = {}, WX_MAP = {}, PH_CODE = {'1':'木','2':'火','3':'土','4':'金','5':'水'};
(function () {
  var s = DATA.kx || '';
  for (var i = 0; i + 2 < s.length; i += 3) KX_MAP[s[i]] = parseInt(s.slice(i+1, i+3), 10);
  var w = DATA.wx || '';
  for (var j = 0; j + 1 < w.length; j += 2) WX_MAP[w[j]] = PH_CODE[w[j+1]];
})();
var SHULI = DATA.shuli81 || {}, SANCAI = DATA.sancai || {};
var DATA_COUNT = Object.keys(KX_MAP).length;
function strokeOf(ch) {
  if (KX_MAP[ch] !== undefined) return KX_MAP[ch];
  if (KX[ch] !== undefined) return KX[ch];
  return null;
}
function phaseOf(ch) { return WX_MAP[ch] || null; }

var TIER_ESSAY = {
  great:{ zh:'此数属大吉，主气势完足、贵人易得，落在哪一格，哪一格所管的人生段落便容易顺势而成。',
          en:'This is a highly auspicious numeral: momentum is ample and helpers tend to appear without being sought. Whichever grid it occupies, the life phase governed by that grid tends to unfold with the current rather than against it.' },
  good:{ zh:'此数属吉，主稳步积累、少有横逆；好处不在一夜之间显，而在三五年后回看才明白。',
         en:'This is an auspicious numeral of steady accumulation rather than sudden windfall. Its value is rarely visible in the moment; it becomes obvious only when looking back over three or five years.' },
  half:{ zh:'此数半吉，吉处与耗处并存：能成事，但往往要附带付出额外的协调成本。',
         en:'A mixed numeral: gains and costs arrive together. Things do get done, but usually with an added tax of coordination, patience or compromise.' },
  bad:{ zh:'此数属凶，主反复与消耗，宜以制度与节奏去对冲，不宜靠一时兴致硬推。',
        en:'An inauspicious numeral, associated with repetition and attrition. It is better buffered by routine and pacing than pushed through on a burst of enthusiasm.' },
  worst:{ zh:'此数属大凶，传统上视为波折之数；但五格只是姓名学内部判分，不可据此断定人生。',
          en:'Classed as highly inauspicious in the traditional table. This remains an internal score within one modern naming school — it is not a verdict on a life.' }
};
var GRID_ESSAY = {
  heaven:{ zh:'天格由姓氏决定，代表先天传承与早年环境，本身不主吉凶，只作为人格的参照。',
           en:'The Heaven Grid is fixed by the surname. It carries inherited circumstance rather than personal fortune, and is read only as a reference for the Personality Grid.' },
  person:{ zh:'人格是主运，性格、才能、事业与人际的总枢纽；此数之轻重，决定整张姓名盘的基调。',
           en:'The Personality Grid is the main luck and the pivot of the whole chart — character, ability, career and relationships all pass through it. Its weight sets the tone of the entire reading.' },
  earth:{ zh:'地格是前运，管中年以前的活动力、早年处境与亲密关系的质量。',
          en:'The Earth Grid governs early luck: activity before middle age, the starting environment, and the quality of close relationships.' },
  outer:{ zh:'外格管社交、外部环境与贵人／小人的比例，也反映亲缘厚薄。',
          en:'The Outer Grid governs social contact, external circumstances and the balance between helpful and difficult people, as well as the breadth of family ties.' },
  total:{ zh:'总格是后运，主中年以后整体走向，也常被用来看晚景与下一代的承接。',
          en:'The Total Grid governs later luck: the overall course after middle age, and traditionally the shape of later years and what is handed on.' }
};
var LEVEL_EN = { '大吉':'highly auspicious', '吉':'auspicious', '半吉':'mixed', '凶':'inauspicious', '大凶':'highly inauspicious' };


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
  return { value:v, raw:n, tier:tier, wx:WX_BY_TAIL[tail], phase:WX_EN[WX_BY_TAIL[tail]],
           detail:SHULI[String(v)] || null };
}

/* Five grids, per the documented formulas. */
function fiveGrids(name, D) {
  var s = String(name || '').replace(/[\s·・,，.。]/g, '');
  var chars = Array.from(s);
  if (!chars.length) return { ok:false, reason:'empty' };
  if (/[A-Za-z]/.test(s)) return { ok:false, reason:'latin', chars:chars };
  var missing = [];
  var strokes = chars.map(function (ch) {
    var v = strokeOf(ch);
    if (v === null || v === undefined) { missing.push(ch); return null; }
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
    missing:{ zh:'字库（'+DATA_COUNT+' 字）仍未收录「'+h((g.missing || []).join('、'))+'」，多为极生僻字或异体。为避免臆测，本站不对未核笔画的字下数理结论；下方八字命格仍然有效。',
              en:'The '+DATA_COUNT+'-character dataset has no entry for "'+h((g.missing || []).join(', '))+'" — usually a very rare or variant glyph. Rather than guess, no numerology verdict is given; the Bazi structure below still applies.' }
  };
  return '<div class="nm-placeholder">'+Z(map[reason] || map.empty, lang)+'</div>';
}

function gridReading(n, key, lang) {
  var d = n.detail;
  var title = d ? d.poem : ('数理 ' + n.value);
  if (lang === 'en') {
    return '<p class="ng-poem">«'+h(title)+'» <span>'+TIER_EN[n.tier]+'</span></p>' +
      '<p class="ng-reading">'+h(TIER_ESSAY[n.tier].en)+' '+h(GRID_ESSAY[key].en)+'</p>' +
      (d && d.keywords ? '<p class="ng-kw">Classical keywords: '+h(d.keywords)+'</p>' : '');
  }
  return '<p class="ng-poem">'+h(title)+' <span>'+TIER_ZH[n.tier]+'</span></p>' +
    '<p class="ng-reading">'+h(d ? d.text : TIER_ESSAY[n.tier].zh)+' '+h(GRID_ESSAY[key].zh)+'</p>' +
    (d && d.keywords ? '<p class="ng-kw">'+h(d.keywords)+'</p>' : '');
}
function gridHTML(g, lang) {
  var rows = GRID_META.map(function (m) {
    var v = g.values[m.k], n = g.numerals[m.k];
    return '<div class="nm-grid"><div class="ng-head"><span class="ng-name">'+h(Z(m, lang))+'</span>' +
      '<span class="ng-tier" style="color:'+TIER_COLOR[n.tier]+'">'+(lang==='en'?TIER_EN[n.tier]:TIER_ZH[n.tier])+'</span></div>' +
      '<div class="ng-num">'+v+'</div>' +
      '<div class="ng-foot"><span>'+(lang==='en'?n.phase:n.wx)+' · '+(lang==='en'?'numeral '+n.value:'数理 '+n.value)+'</span></div>' +
      gridReading(n, m.k, lang) + '</div>';
  }).join('');
  return '<div class="nm-grids">'+rows+'</div>'+
    '<p class="nm-datnote">'+(lang==='en'
      ? 'Numeral titles and Chinese readings are quoted from a public 81-numeral dataset; English explications are written to the same tier and grid, with proper names kept in the original. Schools disagree on several numbers (notably 42 and 49).'
      : '数理名称与中文断语引自公开的 81 数理数据集，英文按同一档位与格位另行撰写、专名保留原文。42、49 等数各派判法不一，本站不硬定一尊。')+'</p>';
}

/* name-character phases vs the chart's favoured phase */
function wuxingHTML(c, D, g, aff, lang) {
  if (!g.ok || !aff) return '';
  var fav = aff.primary;
  var rows = g.chars.map(function (ch, i) {
    var w = phaseOf(ch);
    var rel = 'none';
    if (w) {
      if (w === fav) rel = 'same';
      else if (D.SHENG[w] === fav) rel = 'helps';
      else if (D.SHENG[fav] === w) rel = 'drains';
      else if (D.KE[fav] === w) rel = 'checked';
      else if (D.KE[w] === fav) rel = 'checks';
    }
    var label = {
      same:{zh:'同气扶喜',en:'same phase — supports'},
      helps:{zh:'生我喜用',en:'generates the favoured phase'},
      drains:{zh:'喜用所生',en:'fed by the favoured phase'},
      checked:{zh:'为喜用所克',en:'controlled by the favoured phase'},
      checks:{zh:'克我喜用',en:'controls the favoured phase'},
      none:{zh:'字义五行未录',en:'phase not recorded'}
    }[rel];
    return '<div class="nw-item"><span class="nw-ch">'+h(ch)+'</span>' +
      '<span class="nw-phase">'+(w ? h(lang==='en'?WX_EN[w]:w) : '—')+'</span>' +
      '<span class="nw-stroke">'+(lang==='en'?'Kangxi ':'康熙 ')+g.strokes[i]+'</span>' +
      '<span class="nw-rel nw-'+rel+'">'+h(Z(label,lang))+'</span></div>';
  }).join('');
  var supportive = g.chars.filter(function (ch) {
    var w = phaseOf(ch);
    return w && (w === fav || D.SHENG[w] === fav);
  }).length;
  var essay = lang==='en'
    ? 'The chart favours <b>'+WX_EN[fav]+'</b> ('+h(Z(aff.reason,lang))+'). Of the '+g.chars.length+' characters, '+supportive+' carry a phase identical to or generating that favourite. In this school a name is read as a mild supplement to the natal chart: it can echo a needed phase, but it cannot rewrite a Bazi structure. Character phases come from a public 12,487-character dataset based on meaning and radical, which is a different convention from the Five Phases of the stems and branches — read the comparison as a cross-reference, not an equation.'
    : '本盘喜用 <b>'+h(fav)+'</b>（'+h(Z(aff.reason,lang))+'）。姓名 '+g.chars.length+' 字中，有 '+supportive+' 字的字义五行与喜用同气或直接生扶。按姓名学的看法，名字对命局是「微调」而非「改写」：可以呼应所需之气，改不了月令格局。字义五行取自公开的 12,487 字数据集，依字义与部首归类，与干支五行并非同一套口径，此处作交叉参照，不作等量换算。';
  return '<div class="nm-wuxing"><h5>'+(lang==='en'?'Name phases × favoured phase':'姓名字义五行 × 八字喜用')+'</h5>' +
    '<div class="nw-list">'+rows+'</div><p>'+essay+'</p></div>';
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
  var key = t.phases.join('');
  var info = SANCAI[key] || null;
  var grade = info ? (LEVEL_EN[info.level] || 'mixed') : (t.grade === 'smooth' ? 'auspicious' : 'strained');
  var reading = lang==='en'
    ? (info
        ? 'The classical 125-combination table classes <b>'+t.phases.map(function(p){return WX_EN[p];}).join('–')+'</b> as <b>'+grade+'</b>. In English: a '+(info.level==='大吉'||info.level==='吉'?'supportive':'demanding')+' configuration means the flow between inherited circumstance, personal drive and early environment is '+(info.level==='大吉'||info.level==='吉'?'mostly unobstructed, so effort compounds':'often interrupted, so pacing and health routines matter more than speed')+'. The original Chinese text is retained below as the source wording.'
        : 'Heaven → Personality → Earth: generating or identical phases are read as smooth, controlling phases as strained.')
    : (info
        ? '三才 <b>'+h(key)+'</b>，传统 125 组合表列为 <b>'+h(info.level)+'</b>：'+h(info.text)+' 此判断只落在姓名学内部，用以观察「先天—主运—前运」之间是否顺行。'
        : '天 → 人 → 地。同气与相生为顺，相克为滞。');
  return '<div class="nm-talents"><div class="nt-chain">' +
    t.phases.map(function (p, i) {
      return (i ? '<span class="nt-link">'+(lang==='en'?relEn[t.relations[i-1]]:relZh[t.relations[i-1]])+'</span>' : '') +
        '<span class="nt-node">'+h(lang==='en'?WX_EN[p]:p)+'</span>';
    }).join('') + '</div><span class="nt-grade nt-'+t.grade+'">'+h(grade)+'</span>'+
    '<p class="nt-reading">'+reading+'</p>'+
    (info && lang==='en' ? '<p class="nt-source">«'+h(info.text)+'»</p>' : '')+'</div>';
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
      'In practical terms: the month branch sets the kind of pressure you handle best, the Life Palace stars describe how you move under it, the birthplace longitude fixes the hour the chart is built on, and the name numerals add a twentieth-century-derived layer of self-narrative on top. These are systems with different histories. Keep the Bazi structure as the spine, treat direction as a question of pace and environment, and take the name reading as a mirror for habits — not as a forecast.'
    : '合而观之：盘面以 <b>'+nameZh+'</b> 为骨，日主'+strongWord+'，喜用之指向'+(aff?'「'+aff.dir.zh+'」':'未定')+'。'+
      (g && g.ok ? '姓名人格数理 '+g.numerals.person.value+'（'+TIER_ZH[g.numerals.person.tier]+'）'+(g.numerals.person.tier==='great'||g.numerals.person.tier==='good'?'与此同调':'对此另添一层提醒')+'。' : '')+
      '落到实处说：月令定的是你最能承接哪一类压力，命宫主星说的是你在压力下的动作方式，出生地经度决定这张盘究竟按哪个时辰起，姓名数理则是二十世纪才成形的一层自我叙事。三套体系来历不同，宜以八字格局为骨、以方位为环境节奏之问、以姓名为照见习惯的镜子，不可互相代替，更不是事实预测。';
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
    '格局之根在此段成形：环境给的框架比个人选择更重，家庭、地域与早年教育先替你划了边界。此段宜把基本功做厚、把可迁移的能力攒下，不必急着定终身方向；地格所主的前运，也多半在此显出活动力的强弱。',
    '主运启动，'+(st.god || '格局')+'之力开始兑现：日主得令与否、喜用是否透干，会直接反映在事业与收入曲线的斜率上。此段最适合在一条主线上持续加码，换跑道的成本最高；人格数理若吉，贵人常在转折处出现。',
    '总格与主运交接，是盘面上最容易「该收的收、该放的放」的一段：旧结构已不敷用，新结构尚未成形。主动整理关系、资产与身份，比被动应付事件划算；出生地方位若与喜用相悖，此段也常是重新择城的窗口。',
    '节奏转缓，宜守成、宜把经验结构化，把「会做」变成「可传」。往外扩张的边际收益下降，向内沉淀与照看身体的收益上升；总格所主的后运，在此显其厚度。'
  ];
  var wordsEn = [
    'The structure takes root here: family, region and early schooling draw the boundaries before personal choice does. Build transferable fundamentals rather than fixing a life direction early; the Earth Grid shows how much raw drive is available for this stretch.',
    'Main luck engages and the '+(st.meta?st.meta.en:'chart structure')+' begins to pay out. Whether the Day Master commands the season, and whether the favoured phase is exposed, show up directly in the slope of career and income. Compounding on one line beats switching tracks; an auspicious Personality numeral tends to bring helpers at exactly the turning points.',
    'Later luck meets main luck here — the stretch where what is overdue most needs closing. Old structures no longer fit and new ones are not yet built. Deliberate pruning of relationships, assets and roles beats reacting to events; if the birthplace direction runs against the favoured phase, this is also the usual window for choosing a different city.',
    'The tempo slows. Consolidate, and turn experience into something transmissible — from "I can do it" to "it can be taught". The marginal return on outward expansion falls while the return on inward consolidation and physical care rises; the Total Grid shows its substance here.'
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
    ['康熙笔画与字义五行数据集 / Kangxi strokes & character phases','shunshi-kangxi-core@0.1.1 (npm)','https://www.npmjs.com/package/shunshi-kangxi-core'],
    ['81 数理与 125 三才组合原文 / 81 numerals & 125 Three-Talents texts','shunshi-naming-core@0.1.0 (npm)','https://www.npmjs.com/package/shunshi-naming-core'],
    ['常用汉字笔画对照 / Common-character stroke reference','kllmctrl/chinese-dictionary','https://github.com/kllmctrl/chinese-dictionary'],
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
    inner += strokesHTML(g, lang) + gridHTML(g, lang) + talentsHTML(threeTalents(g, D), lang) +
             wuxingHTML(c, D, g, aff, lang);
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
