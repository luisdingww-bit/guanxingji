/* ============================================================
   观星纪 · DIRECT READING ENGINE (bold mode)
   Explicit, non-metaphorical readings: longevity span, life domains,
   concrete life-detail inferences, and year-by-year fortune.
   All output is generated from chart symbolism, never from real data.
   ============================================================ */
(function () {
'use strict';

window.GXJBold = {
  enhance: function (body, c, D) {
    var scaleEl = document.querySelector('input[name="scale"]:checked');
    if (window.GXJI18N && window.GXJI18N.lang === 'en') return;
    var scale = scaleEl ? scaleEl.value : 'bold';
    if (scale !== 'bold') return;

    var B = compute(c, D);
    var esc = D.esc;

    var label = body.querySelector('.read-hero-label');
    if (label) label.textContent = 'DIRECT READING · 寿 元 / 运 势 / 生 活 细 节';

    var bodies = body.querySelectorAll('.rc-body');
    if (bodies[0]) bodies[0].innerHTML = B.texts.bazi;
    if (bodies[1]) bodies[1].innerHTML = B.texts.ziwei;
    if (bodies[2]) bodies[2].innerHTML = B.texts.tarot;

    var dts = body.querySelectorAll('.rc-basis dt');
    for (var i = 0; i < dts.length; i++) dts[i].textContent = '推 演 依 据';
    var dds = body.querySelectorAll('.rc-basis dd');
    var basis = [B.texts.baziBasis, B.texts.ziweiBasis, B.texts.tarotBasis];
    for (var j = 0; j < dds.length; j++) if (basis[j]) dds[j].textContent = basis[j];

    var syn = body.querySelector('.syn-text');
    if (syn) syn.innerHTML = B.texts.syn;

    var caveat = body.querySelector('.vit-caveat');
    if (caveat) caveat.innerHTML = '<b>直说</b>：这条曲线由五行均衡、日主气势、星曜动静与牌意缓急合成，用来标各阶段的盛缓。下方已给出寿元区间与关口岁段，但两者同属术数象征推演——不是体检结论，也不是事实预测。真正影响长度的，是作息、环境、医疗与选择，不是这张盘。';

    var fine = body.querySelector('.fine-print');
    if (fine) fine.textContent = '以上宜忌为生活节奏提示，非医学、营养或心理建议。全站内容为术数文化演绎与算法生成，不构成医疗、法律、投资或人生决策建议；相关判断与责任由使用者自行承担。';

    var actions = body.querySelector('.read-actions');
    if (actions) actions.insertAdjacentHTML('beforebegin', B.html);

    var copyBtn = body.querySelector('#btn-copy');
    if (copyBtn) copyBtn.textContent = '复 制 直 断 摘 要';

    /* keep static page copy consistent with bold mode */
    var heroA = document.querySelector('.disclaimer-inline p');
    if (heroA) heroA.innerHTML = '<strong>关于「寿元」</strong> — 本站按传统术数给出寿元区间、关口岁段与逐年运势，属文化演绎与算法推演，不是医学结论，也不是事实预测。可在起盘时切换为含蓄意象模式。';
  }
};

/* ============================================================ */
function compute(c, D) {
  var GAN = D.GAN, ZHI = D.ZHI, GAN_WX = D.GAN_WX, T = D.TAROT;
  var esc = D.esc, clamp = D.clamp, r = D.rng(D.hash('gxj-bold|' + c.seed));
  var dm = GAN[c.dayGan] + GAN_WX[c.dayGan];
  var stars = c.mingStars.slice(0, 2);
  var starTxt = stars.join(' · ') || '空宫借星';
  var present = T[c.cards[1].idx];
  var pkey = (c.cards[1].rev ? present.dn : present.up).split(' · ')[0];

  /* ---------- 1. LONGEVITY SPAN ---------- */
  var LON = { '天梁':5, '天同':4, '天府':4, '太阴':3, '紫微':3, '天相':3, '太阳':2,
              '天机':0, '武曲':0, '贪狼':-1, '巨门':-1, '廉贞':-2, '七杀':-3, '破军':-3 };
  var starScore = 0;
  stars.forEach(function (s) { starScore += (LON[s] || 0); });
  c.oppStars.slice(0, 2).forEach(function (s) { starScore += (LON[s] || 0) * .4; });
  var TL = { 13:-3, 16:-2, 15:2, 17:3, 19:3, 21:3, 14:2, 9:1, 8:2, 2:1, 10:1, 6:1, 3:1 };
  var tarotScore = (TL[c.lifeCard] || 0) + (TL[c.cards[1].idx] || 0) * .5 + (c.cards[1].rev ? -1 : 0);
  var eq = c.balance * 11, qi = (c.strength - 50) * .07;
  var mid = Math.round(clamp(72 + eq + qi + starScore + tarotScore + (r() - .5) * 8, 62, 94));
  var lo = Math.max(60, mid - 5), hi = Math.min(96, mid + 6);
  var factors = [
    { k:'五行停匀', v:signed(eq), d:'五行' + c.dominant + ' ' + c.wxPct[c.dominant] + '% / ' + c.weakest + ' ' + c.wxPct[c.weakest] + '%，《渊海子平》以中和为贵，偏枯则减' },
    { k:'日主气势', v:signed(qi), d:'日主' + dm + '，' + c.strengthWord + '（' + c.strength + '/100），主元气承载' },
    { k:'命垣星曜', v:signed(starScore), d:starTxt + '；天梁/天同/天府旧称荫星，七杀/破军主动荡' },
    { k:'塔罗本命', v:signed(tarotScore), d:'本命牌「' + T[c.lifeCard].n + '」+ 现前牌「' + present.n + '」之原型意象' },
    { k:'盘面扰动', v:'±4.0', d:'由生辰唯一确定，重复起盘结果完全一致' }
  ];
  var lows = [];
  for (var q = 1; q < c.pts.length - 1; q++) {
    if (c.pts[q].v <= c.pts[q-1].v && c.pts[q].v <= c.pts[q+1].v) lows.push(c.pts[q].age);
  }
  if (!lows.length) lows = [c.peakAge - 20, c.peakAge + 10];
  var gates = [
    { age:Math.max(20, lows[0] - 2) + '–' + (lows[0] + 2), t:'元气低谷 · 第一关',
      w:'这段最容易把身体和事情一起硬扛。旧说称「关口」，主变动与转折：重大决策往后放，作息别乱，别在这两年同时换工作又换住处。' },
    { age:Math.max(20, (lows[1] || lows[0] + 20) - 2) + '–' + ((lows[1] || lows[0] + 20) + 2), t:'元气低谷 · 第二关',
      w:'第二个转折点，多半以「某件事撑不下去了」的形式出现。直说：该收的收，别用维持现状换安心。' },
    { age:(mid - 9) + '–' + (mid - 4), t:'养气之期',
      w:'寿元推演的中段前缘，传统谓之养气之期。宜守成、宜定期体检、宜把节奏降下来；不宜开新局、不宜大额冒险。' }
  ];

  /* ---------- 2. LIFE DOMAINS ---------- */
  var DOMAIN_TEXT = {
    personality: [
      '你不是慢热，是习惯先把人看透再决定投不投入。前几次见面给人的距离感常被误读成冷淡，其实是筛选。直说：你信人慢，但一旦信了就懒得再防，这点吃过亏。',
      '你的性子外柔内硬：表面好说话，底线一到就整段抽离，不吵也不解释。别人往往到失去联系才反应过来。',
      '你情绪来得快、过得慢，白天能压住，夜里会翻出来重放一遍。你不是想太多，是收尾太慢。'
    ],
    career: [
      '适合在有明确对手的场子做事，越被低估越容易翻盘。30 岁前后有一次权责突然变大的机会，接住就上位，推掉要再等一轮。',
      '事业不走爆发路线，靠把一个领域磨到别人替不了。前十年看着慢，后半段会突然显得很稳——这是积累型，不是运气型。',
      '别和别人比起步速度。适合成熟体系里的关键执行位，或自己掌控节奏的小盘子；硬扛大平台会耗掉大半精力。'
    ],
    wealth: [
      '对钱有直觉，但容易同时开太多条线。财不是赚不到，是散在几个方向里；35 岁后收敛到一条主线，积累才真正开始。',
      '财帛属细水型：不靠一次大的，靠持续不漏。你最该防的不是亏钱，是替别人兜底、和不好意思拒绝的借与垫。',
      '钱进钱出都快，容易在情绪上头时做大额决定。给自己立一条「超过某个数就隔夜再定」的硬规矩，比任何理财建议都管用。'
    ],
    love: [
      '感情里你先给空间、再要确认，节奏比对方慢半拍，容易让一开始很热的人先冷掉。你适合能接受「不天天黏」的关系。',
      '你挑人的标准其实很固定，但不太说出口，于是常出现「凑合一阵再突然结束」的循环。直说：把标准提前讲，能省掉两三年。',
      '容易在关系里承担过多解释与收拾的工作。你不是不够好，是把维持当成了责任；该让对方接手的部分要早一点交出去。'
    ],
    family: [
      '家里给过你一套很具体的「该怎么做」，你成年后花了不少力气才把它和自己的想要分开。这件事基本定型了，不用再内耗。',
      '亲缘上属于「不常联系但真出事一定到」的类型。你不太会表达，但兜底的往往是你。',
      '早年环境有过一次比较或变动，你到现在还在跟那个标准较劲。它对你的推动力，比它本身重要。'
    ],
    vitality: [
      '精力底子不差，问题在分配：一忙就全押上去，闲下来又彻底断电。你需要的不是补，是别把波动做得这么大。',
      '体能属于耐耗型，恢复偏慢。熬一次要两三天才回来，所以连续性比强度更重要——规律作息对你的收益远大于突击锻炼。',
      '精力明显受情绪牵动：心里有事时最先乱的是睡眠和胃口。先把这两样稳住，其它指标会跟着回来。'
    ]
  };
  var DOMAIN_META = [
    { k:'personality', n:'性格底色', e:'TEMPERAMENT', w:['日主' + c.strengthWord, '命垣' + starTxt] },
    { k:'career', n:'事业 · 名利', e:'CAREER', w:['官星' + (c.pillars[1].god || '藏'), '官禄宫' + ZHI[(c.mingZhi + 8) % 12]] },
    { k:'wealth', n:'财帛 · 资源', e:'WEALTH', w:['财星透' + c.weakest + '气', '财帛宫' + ZHI[(c.mingZhi + 8) % 12]] },
    { k:'love', n:'感情 · 关系', e:'RELATIONS', w:['夫妻宫' + ZHI[(c.mingZhi + 2) % 12], '现前牌「' + present.n + '」'] },
    { k:'family', n:'家宅 · 亲缘', e:'FAMILY', w:['年柱' + c.pillars[0].name, '田宅宫' + ZHI[(c.mingZhi + 9) % 12]] },
    { k:'vitality', n:'体魄 · 精力', e:'VITALITY', w:['五行' + c.dominant + '偏盛', '疾厄宫' + ZHI[(c.mingZhi + 7) % 12]] }
  ];
  var domains = DOMAIN_META.map(function (m) {
    var s = Math.round(clamp(52 + (c.balance - .5) * 20 + (c.pts[Math.floor(r() * 9)].v - 55) * .35 + (r() - .5) * 26, 34, 94));
    var tier = s >= 72 ? 0 : s >= 52 ? 1 : 2;
    return { name:m.n, en:m.e, score:s, text:DOMAIN_TEXT[m.k][tier], basis:m.w.join(' · ') };
  });

  /* ---------- 3. LIFE DETAIL INFERENCES ---------- */
  var DETAILS = [
    { tag:'作息', t:'你晚间的头脑比清晨清楚，重要判断放在下午到入夜之间更准；硬逼自己早起，只会把一整天的状态拖平。' },
    { tag:'决策', t:'习惯先把信息收齐，再拖到最后一刻才定。外人看是犹豫，实际是你在等一个不会后悔的时点。' },
    { tag:'消费', t:'对工具、设备、能长期用的东西舍得花钱，对日常琐碎反而极省；买贵的不心疼，买重复的会烦。' },
    { tag:'人际', t:'熟人圈话多、反应快，生人圈沉默到被误读成高冷。你的社交是开关式的，不是渐变式的。' },
    { tag:'压力反应', t:'压力大时不吵不诉，会开始收拾东西、整理桌面、删文件——这是你把失控感重新收回来的方式。' },
    { tag:'空间偏好', t:'需要一个能自己控制光线和声音的位置，靠窗或角落都行，最怕背后有人走来走去。' },
    { tag:'饮食节奏', t:'三餐时间容易被事情挤掉，忙起来靠一顿大的补回来；口味偏重，不太爱清淡。' },
    { tag:'记忆方式', t:'记人、记场景、记谁说过什么，但不记数字和日期；所以常常记对了事，记错了时间。' },
    { tag:'争执模式', t:'当场基本不反驳，甚至会点头；真正的意见事后才浮上来，然后在脑子里复盘好几遍。' },
    { tag:'秩序感', t:'桌面和手机里东西很多，但每样有固定位置；别人一替你整理就找不着——这不是乱，是自己的索引。' }
  ];
  var BY = ['日主' + dm + ' · ' + c.strengthWord, '命垣' + starTxt, '五行' + c.dominant + '偏盛 / ' + c.weakest + '偏薄',
            c.pillars[0].god + '在年 · ' + c.pillars[3].god + '在时', '现前牌「' + present.n + '」' + (c.cards[1].rev ? '逆位' : '正位'),
            '元气曲线 ' + c.peakAge + ' 岁段为峰', '本命牌「' + T[c.lifeCard].n + '」'];
  var order = DETAILS.map(function (d, i) { return { d:d, k:r(), i:i }; }).sort(function (a, b) { return a.k - b.k; }).slice(0, 8);
  var details = order.map(function (o, i) { return { tag:o.d.tag, t:o.d.t, by:BY[(o.i + i) % BY.length] }; });

  /* ---------- 4. YEAR-BY-YEAR FORTUNE ---------- */
  var FOCUS = ['事业推进', '财务安排', '关系处理', '住处变动', '学习取证', '身体节奏'];
  var years = [];
  for (var y = 0; y < 8; y++) {
    var yy = 2026 + y;
    var gi = ((yy - 4) % 60 + 60) % 60;
    var g = gi % 10, z = gi % 12;
    var a = GAN_WX[g], b = GAN_WX[c.dayGan];
    var boost = (a === b || D.SHENG[a] === b) ? 12 : (D.KE[a] === b) ? 6 : (D.KE[b] === a) ? -10 : (D.SHENG[b] === a) ? -4 : 0;
    var sc = Math.round(clamp(56 + boost + (c.pts[Math.min(8, Math.floor((yy - 2026) / 1.2))].v - 55) * .3 + (r() - .5) * 16, 30, 95));
    var focus = FOCUS[Math.floor(r() * FOCUS.length)];
    var word = sc >= 74
      ? '顺年。该推进的事今年就推，别留到明年；尤其' + focus + '，容易一次到位。'
      : sc >= 53
        ? '平年。不出大事，也不白给；' + focus + '靠积累，不靠冲刺。'
        : '守年。别开新局、别做大额决定，' + focus + '上以收拾旧账、把漏补上为主。';
    var tags = ['事业','财','关系','精力'].map(function (n) {
      var v = r() + (sc - 55) / 180;
      return { n:n, s:v > .72 ? '利' : v > .40 ? '平' : '守' };
    });
    years.push({ year:yy, gz:GAN[g] + ZHI[z], score:sc, word:word, tags:tags,
      yi: sc >= 70 ? '宜主动争取、宜定长期的事' : sc >= 50 ? '宜按部就班、宜补基础' : '宜减负、宜延后重大决定',
      ji: sc >= 70 ? '忌轻信口头承诺' : sc >= 50 ? '忌同时开三条线' : '忌硬撑、忌替人兜底' });
  }

  /* ---------- 5. DIRECT TEXTS FOR THREE LENSES ---------- */
  var topWx = c.dominant, lowWx = c.weakest;
  var texts = {};
  texts.bazi =
    '日主 <b>' + esc(dm) + '</b>，生于' + esc(c.jie.name) + '之后，全局<b>' + esc(c.strengthWord) + '</b>（' + c.strength + '/100）。' +
    esc(topWx) + ' ' + c.wxPct[topWx] + '% 最重，' + esc(lowWx) + ' ' + c.wxPct[lowWx] + '% 最薄——' +
    '说人话就是：<b>你扛得住事，但扛不住长期被压着</b>。规则和外部资源比你的个人意志强，所以找位置、借势，比硬碰有用。' +
    '四柱里 ' + esc(c.pillars[1].god) + '、' + esc(c.pillars[3].god) + ' 透出，' +
    '说明从小被「该怎么做」框着长大，做事讲分寸、怕出错；' + esc(c.pillars[0].god) + ' 在年柱，' +
    '早年环境给过你一次比较，你到现在还在跟那个标准较劲。' +
    '<b>直断：30 岁之前攒的是忍耐力，之后才开始拿到话语权。</b>不是没运气，是运来得偏晚，而且要靠一次主动换环境兑现。';
  texts.baziBasis = '年以立春为界、月以节气为界、日以儒略日数推干支、时以五鼠遁；藏干加权得五行占比，再以得令/得地/得势合一判日主强弱。上述数字全部可复算，同一生辰结果不变。';

  texts.ziwei =
    '命宫在' + esc(ZHI[c.mingZhi]) + '，<b>' + esc(starTxt) + '</b>' + (c.borrowed ? '（借对宫）' : '') +
    '，纳音' + esc(c.mingNayin) + '，' + esc(c.juName) + '。' +
    '这组星最直白的意思：<b>' + esc(D.STAR_WORDS[stars[0]] || '命垣无正曜，气势要看对宫与三方。') + '</b>' +
    '三方会 ' + esc(c.oppStars.slice(0, 2).join('、') || '无正曜') + '，' +
    (c.oppStars.length ? '说明帮你的人有，但都得你自己先动，不会自动上门。' : '说明盘里缺少天然兜底的结构，出了事得自己收。') +
    '<b>直断：35–45 这十年是把资源换成位置的关键窗口</b>；之前所有试错都在给这段铺路。这段求稳反而漏，该争的要争。';
  texts.ziweiBasis = '命宫以农历月自寅顺数、生时逆数而定，身宫顺数；宫干用五虎遁，纳音定五行局；紫微依「局数除日数，商数宫前走」口诀定位，天府依寅申轴对称，十四主星依紫微系逆布、天府系顺布。';

  texts.tarot =
    '过去「' + esc(T[c.cards[0].idx].n) + '」、现在「' + esc(present.n) + '」' + (c.cards[1].rev ? '逆位' : '正位') +
    '、将来「' + esc(T[c.cards[2].idx].n) + '」。不绕弯说：你已经离开过一套旧规矩，' +
    '现在正卡在<b>旧的该收尾、新的还没立起来</b>的空档；将来一牌显示你会反复回头确认，所以这个空档比预期长。' +
    '现前牌落在「' + esc(pkey) + '」——它在这里<b>不指生死</b>，只指某件事该结束了：' +
    '大概率是一段关系、一份工作，或一个你早知道撑不下去的习惯。' +
    '<b>直断：拖着不结，成本比结束高。</b>本命牌「' + esc(T[c.lifeCard].n) + '」，' +
    '说明你真正的本事是把断掉的东西重新拼起来，不是从头再来。';
  texts.tarotBasis = '以生辰为固定种子抽 22 张大阿卡纳三张，正逆位与顺序均由种子决定；牌义取原型心理学的直白读法，与术数盘并列呈现，不互相证明。';

  texts.syn =
    '三处合起来就一句话：<em>你是晚成型，而且必须靠一次主动的断裂换赛道</em>。' +
    '八字说气' + esc(c.strengthWord) + '、要借势；星盘说命垣' + esc(starTxt) + '、宜动不宜守；塔罗现前牌直接给「该收尾了」。' +
    '所以这份盘最不客气的判断是：<em>你眼下真正的风险不是失败，是一直不换</em>。' +
    '传统寿元推演给到 <em>' + lo + '–' + hi + '</em>，但盘面真正值钱的是 <em>32–46</em> 这十四年——' +
    '那段用好了，后面几十年都轻松；耗在维持现状上，后面就得一直补。' +
    '数字是象意，选择是你的。';

  /* ---------- 6. HTML ---------- */
  var html = '';

  /* longevity */
  html += '<div class="read-section bold-sec">' +
    '<div class="read-section-head"><span class="rs-no">VI</span><h3 class="rs-title">寿元推演</h3><span class="rs-en">LONGEVITY SPAN</span></div>' +
    '<div class="longevity">' +
      '<div class="lon-top">' +
        '<div class="lon-main"><div class="lon-label">传 统 术 数 寿 元 推 演 · 中 数</div>' +
          '<div class="lon-num">' + mid + '<span>岁</span></div>' +
          '<div class="lon-range">推演区间 <b>' + lo + ' – ' + hi + ' 岁</b></div></div>' +
        '<div class="lon-side"><p>这个数不是体检结论，也不是概率估计。它由右侧五项加权合成：五行停匀、日主气势、命垣星曜、塔罗本命，加一个由生辰唯一确定的扰动项。同一生辰反复起盘，结果完全一致。</p>' +
          '<p>传统命理里寿元看「气之厚薄」，不看单一星曜；本站沿用这个思路，但把每一步摊开给你看，不藏黑箱。</p></div>' +
      '</div>' +
      '<div class="lon-factors">' + factors.map(function (f) {
        return '<div class="lf-row"><span class="lf-k">' + esc(f.k) + '</span><span class="lf-v">' + esc(f.v) + '</span><span class="lf-d">' + esc(f.d) + '</span></div>';
      }).join('') + '</div>' +
      '<div class="gate-head">关 口 岁 段 · 旧 说 谓 之「关」</div>' +
      '<div class="gate-row">' + gates.map(function (g) {
        return '<div class="gate"><div class="g-age">' + esc(g.age) + ' 岁</div><div class="g-t">' + esc(g.t) + '</div><p>' + esc(g.w) + '</p></div>';
      }).join('') + '</div>' +
      '<p class="bold-note">直说：关口是传统术数对「转折期」的说法，取自元气曲线低谷与寿元中段前缘，不对应任何具体事件、疾病或日期。把它当作该放慢的提醒，不要当作预告。</p>' +
    '</div>' +
  '</div>';

  /* domains */
  html += '<div class="read-section bold-sec">' +
    '<div class="read-section-head"><span class="rs-no">VII</span><h3 class="rs-title">命运总断 · 六维直断</h3><span class="rs-en">SIX DOMAINS</span></div>' +
    '<div class="domain-grid">' + domains.map(function (d) {
      return '<div class="domain-card"><div class="dc-head"><div><span class="dc-name">' + esc(d.name) + '</span><span class="dc-en">' + esc(d.en) + '</span></div>' +
        '<span class="dc-score">' + d.score + '</span></div>' +
        '<div class="dc-bar"><span class="dc-fill" style="width:' + d.score + '%"></span></div>' +
        '<p class="dc-body">' + esc(d.text) + '</p>' +
        '<p class="dc-basis">参 ' + esc(d.basis) + '</p></div>';
    }).join('') + '</div>' +
  '</div>';

  /* life details */
  html += '<div class="read-section bold-sec">' +
    '<div class="read-section-head"><span class="rs-no">VIII</span><h3 class="rs-title">生活细节推演</h3><span class="rs-en">LIFE DETAILS</span></div>' +
    '<p class="bold-lead">以下八条由盘面象意推演，<b>不读取你的设备、位置、浏览记录或任何真实数据</b>。对得上是因为象意笼统，对不上也正常——它是一面镜子，不是档案。</p>' +
    '<div class="detail-list">' + details.map(function (d, i) {
      return '<div class="detail"><span class="dt-i">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="dt-tag">' + esc(d.tag) + '</span>' +
        '<div><p class="dt-text">' + esc(d.t) + '</p><p class="dt-by">推自 ' + esc(d.by) + '</p></div></div>';
    }).join('') + '</div>' +
  '</div>';

  /* yearly fortune */
  html += '<div class="read-section bold-sec">' +
    '<div class="read-section-head"><span class="rs-no">IX</span><h3 class="rs-title">流年运势 · 八年直断</h3><span class="rs-en">YEAR BY YEAR</span></div>' +
    '<div class="year-list">' + years.map(function (y) {
      return '<div class="year-row"><div class="yr-left"><span class="yr-y">' + y.year + '</span><span class="yr-gz">' + esc(y.gz) + '</span>' +
        '<span class="yr-score">' + y.score + '</span></div>' +
        '<div class="yr-body"><div class="yr-tags">' + y.tags.map(function (t) {
          return '<span class="tag ' + (t.s === '利' ? 'good' : t.s === '守' ? 'care' : '') + '">' + esc(t.n) + ' · ' + esc(t.s) + '</span>';
        }).join('') + '</div>' +
        '<p class="yr-word">' + esc(y.word) + '</p>' +
        '<p class="yr-do">' + esc(y.yi) + ' ／ ' + esc(y.ji) + '</p></div></div>';
    }).join('') + '</div>' +
    '<p class="bold-note">逐年分数由流年干支五行与日主的生克关系、元气曲线对应段、以及固定种子扰动合成，用于给节奏排序，不对应具体事件。</p>' +
  '</div>';

  return { longevity:{ mid:mid, lo:lo, hi:hi }, domains:domains, details:details, years:years, texts:texts, html:html };
}

function signed(v) {
  var n = Math.round(v * 10) / 10;
  return (n > 0 ? '+' : '') + n.toFixed(1);
}
})();
