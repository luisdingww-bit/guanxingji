/* ============================================================
   EPHEMERIS · English reading renderer
   An independent scholarly rendering, not a word-for-word gloss.
   Shares the same chart data and CSS as the Chinese reading.
   ============================================================ */
(function () {
'use strict';

var TAROT_EN = [
  { up:'beginning · unfixed', dn:'haste · no ground', w:'Nothing has been named yet; that is exactly where the room is.' },
  { up:'starting · equipped', dn:'scatter · display', w:'The tools are already in hand; what is missing is commitment.' },
  { up:'stillness · latent', dn:'blocked · self-doubt', w:'The curtain stays drawn; the answer forms in silence.' },
  { up:'growth · abundance', dn:'over-nurture · stall', w:'Growth does not need hurrying; the season is generous on its own.' },
  { up:'order · steadiness', dn:'rigidity · unilateral', w:'Boundaries make safety, but a boundary needs a door.' },
  { up:'inheritance · form', dn:'prejudice · departure', w:'Old rules can be relied on, or read differently. Keep the steadiness, not the binding.' },
  { up:'reciprocity · choice', dn:'hesitation · fork', w:'A choice is mostly a clear view of what you actually value.' },
  { up:'advance · held reins', dn:'loss of control · speed', w:'Moving is not the hard part; keeping hold of the reins is.' },
  { up:'gentle mastery · containment', dn:'overstrain · friction', w:'The strength that lasts rarely announces itself as strength.' },
  { up:'introspection · private light', dn:'isolation · long silence', w:'One lamp lights one stretch of road. That is enough.' },
  { up:'turning · recurrence', dn:'lag · repetition', w:'The wheel is indifferent to your urgency; move with its direction.' },
  { up:'weighing · evenness', dn:'bias · delayed judgement', w:'One pan holds the matter; the other holds your own mind.' },
  { up:'suspension · changed view', dn:'waste · deadlock', w:'Not acting is also a way of seeing more clearly.' },
  { up:'replacement · a closing chapter', dn:'attachment · slow change', w:'This card says only that a chapter closes. It says nothing else.' },
  { up:'temperance · proportion', dn:'imbalance · excess and deficit', w:'Pouring between two vessels: proportion is the whole answer.' },
  { up:'attachment · fixation', dn:'loosening · awareness', w:'The chain is usually already slack; you have not looked down yet.' },
  { up:'sudden change · unmasking', dn:'aftershock · inner collapse', w:'What is unnecessary falls first; then you can see the foundation.' },
  { up:'faint light · promise', dn:'distant hope · low energy', w:'The light need not be large. It only needs to keep going.' },
  { up:'haze · moving shadows', dn:'clearing · doubts disperse', w:'On a night road, half of what you see is landscape and half is projection.' },
  { up:'clear light · ease', dn:'clouded · subdued', w:'Walk in the open, and remember to leave somewhere shaded.' },
  { up:'echo · reordering', dn:'hesitation · an old voice', w:'The old voice returns, but you no longer have to sing along.' },
  { up:'completion · in place', dn:'unfinished · pending', w:'One circle closes; the next has already begun at the same point.' }
];

var STAR_EN = {
  '紫微':'Authority that does not act alone; borrow momentum rather than issuing orders.',
  '天机':'A mind like spun thread: movement breeds change, stillness brings clarity.',
  '太阳':'Light reaches far and also scorches; leave a third unspent in what you give.',
  '武曲':'Decisive and able to cut losses; too much rigidity breaks it.',
  '天同':'Ease carries its own luck. Self-interference is the main risk.',
  '廉贞':'Feeling and reason entangle; confinement and release differ by one generous thought.',
  '天府':'A storehouse with surplus. Consolidation beats expansion; timing governs withdrawal.',
  '太阴':'Waxing and waning keep their schedule; what is clear at night need not compete with noon.',
  '贪狼':'Appetite and curiosity arrive together. Breadth is a gift; choosing one thing is the work.',
  '巨门':'Speech is a door and a barrier. Listen more; judge less.',
  '天相':'The instrument of a good deputy: balance well and things stay steady.',
  '天梁':'Shelter arises on its own; difficulties find solutions. Set the rules first.',
  '七杀':'Both motion and stillness run hot. Meet it with slowness and duration.',
  '破军':'Break, then rebuild. No need to cling to the old arrangement — or to rush its removal.'
};

var DOMAIN_EN = {
  personality: [
    'You are not slow to warm up; you decide whether to invest only after you have read someone. Early distance is often misread as coldness — it is screening. You trust slowly, then stop guarding altogether, and that has cost you.',
    'Soft on the surface, hard at the core: easy-going until a line is crossed, then you withdraw entirely, without argument or explanation. People usually notice only after contact stops.',
    'Feeling arrives fast and leaves slowly. You hold it together by day and replay it at night. It is not overthinking; it is a slow ending.'
  ],
  career: [
    'You do best where there is a clear counterpart. Being underestimated makes comebacks easier. Around 30 a sudden jump in responsibility tends to appear: take it and you move up, decline it and you wait another cycle.',
    'Career is cumulative, not explosive. You become the person nobody can replace in one narrow field. The first decade looks slow; the second looks remarkably stable.',
    'Do not compare starting speeds with other people. A key operational role inside a mature system, or a small operation whose tempo you control, suits you; a large platform consumes most of your energy.'
  ],
  wealth: [
    'You have an instinct for money but tend to open too many lines at once. The issue is not earning, it is dispersion. After 35, consolidating into one main line is when accumulation actually starts.',
    'Steady-trickle wealth: not one large win, but no leaks. Your real exposure is covering for other people and being unable to refuse a loan or an advance.',
    'Money moves in and out quickly, and large decisions get made in an emotional spike. A hard rule — anything above a set figure waits overnight — will outperform any investment tip.'
  ],
  love: [
    'You give space first and ask for confirmation later, half a beat behind the other person, which lets an initially intense partner cool off first. You need a relationship that does not require constant closeness.',
    'Your criteria are actually fixed, but you rarely state them, so a pattern of "manage for a while, then end abruptly" repeats. Saying the criteria early saves two or three years.',
    'You tend to take on most of the explaining and repairing. It is not a question of being good enough; you have turned maintenance into a duty. Hand part of it over sooner.'
  ],
  family: [
    'Your family supplied a very specific script for "how one ought to be", and it took real effort to separate it from what you wanted. That work is largely done; stop re-litigating it.',
    'Kinship, for you, is "rarely in touch, but present without fail when something breaks". You are not expressive, yet you are usually the one holding the net.',
    'An early comparison or disruption set a standard you are still measuring yourself against. Its effect on your drive matters more than the standard itself.'
  ],
  vitality: [
    'The underlying stamina is fine; the allocation is not. When busy you commit all of it, when idle you switch off completely. You need less variability, not more supplementation.',
    'Endurance-type energy with slow recovery: one late night costs two or three days. Continuity matters more than intensity; regular sleep outperforms occasional hard training.',
    'Energy tracks emotion closely. When something is unresolved, sleep and appetite disorder first. Stabilise those two and the rest follows.'
  ]
};

var DETAIL_EN = [
  { tag:'Daily rhythm', t:'Your mind is sharper after noon than at dawn; put consequential decisions in the afternoon or evening. Forcing an early start merely flattens the whole day.', by:'Day Master strength' },
  { tag:'Decisions', t:'You gather everything first and commit at the last possible moment. It looks like hesitation; actually you are waiting for a point you will not regret.', by:'Ten Relationships distribution' },
  { tag:'Spending', t:'Generous with tools, equipment and anything long-lived; extremely frugal about daily trifles. An expensive purchase is easy; buying the same thing twice is irritating.', by:'Wealth palace' },
  { tag:'Social mode', t:'Talkative and quick with familiar people, silent enough with strangers to be read as aloof. Your sociability is a switch, not a dial.', by:'Life palace stars' },
  { tag:'Under stress', t:'You do not argue or confide; you start tidying — clearing a desk, deleting files. That is how you take a sense of control back.', by:'Rhythm curve trough' },
  { tag:'Space', t:'You need a seat whose light and sound you can control. A window or a corner both work; someone moving behind you does not.', by:'Tai Yin / Zi Wei placement' },
  { tag:'Eating', t:'Meal times get squeezed out by work, then one large meal compensates. You prefer strong flavours to bland ones.', by:'Earth phase weighting' },
  { tag:'Memory', t:'You remember people, scenes and exactly who said what — not numbers or dates. The event is usually right and the timing wrong.', by:'Hidden stems' },
  { tag:'Disagreement', t:'You barely object in the moment and may even nod. The real opinion surfaces afterwards and gets replayed several times.', by:'Present card, reversed or upright' },
  { tag:'Order', t:'A lot of objects, each with a fixed place. When someone else tidies for you, you cannot find anything. It is an index, not a mess.', by:'Birth card archetype' }
];

var ADVICE_YI_EN = [
  'Keep your schedule aligned with the seasons; do not argue with day and night.',
  'Reserve a stretch of deliberately useless time each day. Restoring attention beats supplementing the body.',
  'Move slowly and consistently; stand up after long sitting, put the pen down after long thinking.',
  'Spend time near water, trees and open views; give your eyes somewhere distant to land.',
  'Less rumination, more sleep, and leave some space in conversation.',
  'Divide your strength across future days; do not spend it all in one.',
  'Regular and light beats a sudden intensive correction.',
  'Keep relationships unhurried; emotion needs both an inlet and an outlet.'
];
var ADVICE_JI_EN = [
  'Do not spend tomorrow\'s reserves on today\'s peak.',
  'Avoid stop-start bursts; a broken rhythm costs the most to restore.',
  'Do not let low mood sit unspoken. Open a window, or talk to someone.',
  'Do not measure your pace with somebody else\'s ruler.',
  'Avoid mental work late at night; small things expand in the dark.',
  'Do not treat a symbolic reading as a conclusion; re-checking it only unsettles you.'
];

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
  });
}
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function smoothPath(pts) {
  var d = 'M' + pts[0].x.toFixed(1) + ',' + pts[0].y.toFixed(1);
  for (var i = 0; i < pts.length - 1; i++) {
    var p0 = pts[i-1] || pts[i], p1 = pts[i], p2 = pts[i+1], p3 = pts[i+2] || p2;
    d += ' C' + (p1.x + (p2.x-p0.x)/6).toFixed(1) + ',' + (p1.y + (p2.y-p0.y)/6).toFixed(1)
       + ' ' + (p2.x - (p3.x-p1.x)/6).toFixed(1) + ',' + (p2.y - (p3.y-p1.y)/6).toFixed(1)
       + ' ' + p2.x.toFixed(1) + ',' + p2.y.toFixed(1);
  }
  return d;
}

function render(body, c, D) {
  var I = window.GXJI18N, T = I.TERMS, GAN = D.GAN, ZHI = D.ZHI,
      GAN_WX = D.GAN_WX, TAROT = D.TAROT, escFn = D.esc;
  var r = rng(c.seed + 7717);
  var scaleEl = document.querySelector('input[name="scale"]:checked');
  var direct = !scaleEl || scaleEl.value !== 'subtle';
  var name = c.input.name || 'Reader';
  var dmEn = T.stem[c.dayGan] + ' (' + T.stemPhase[c.dayGan] + ')';
  var stars = c.mingStars.slice(0,2);
  var starEn = stars.map(function(s){ return T.star[s] || s; }).join(' · ') || 'Empty palace';
  var present = TAROT[c.cards[1].idx];
  var presentKey = TAROT_EN[c.cards[1].idx][c.cards[1].rev ? 'dn' : 'up'].split(' · ')[0];
  var pz = function (g,z) { return T.stem[g] + ' ' + T.branch[z]; };

  /* pillars */
  var labels = ['YEAR','MONTH','DAY','HOUR'];
  var pillarsHtml = c.pillars.map(function (p, k) {
    return '<div class="pillar"><div class="p-label">' + labels[k] + '</div>' +
      '<div class="p-gan">' + esc(T.stem[p.g]) + '</div>' +
      '<div class="p-zhi">' + esc(T.branch[p.z]) + '</div>' +
      '<div class="p-foot"><b>' + esc(T.god[p.god] || p.god) + ' · ' + esc(T.nayin[Math.floor(p.i/2)]) + '</b>' +
      'Hidden: ' + esc(p.cang.split(' · ').map(function(x){ return T.stem[GAN.indexOf(x)]; }).join(' · ')) + '</div></div>';
  }).join('');

  var PH_EN = ['Wood','Fire','Earth','Metal','Water'];
  var PH_ZH = ['木','火','土','金','水'];
  var elHtml = PH_ZH.map(function (k, i) {
    return '<div class="el-row"><span class="el-name">' + PH_EN[i] + '</span>' +
      '<span class="el-bar"><span class="el-fill" data-w="' + c.wxPct[k] + '" style="background:' + D.WX_COLOR[k] + '"></span></span>' +
      '<span class="el-count">' + c.wxPct[k] + '</span></div>';
  }).join('');

  /* palaces */
  var palacesHtml = '';
  var POS = { 5:[1,1],6:[1,2],7:[1,3],8:[1,4],4:[2,1],9:[2,4],3:[3,1],10:[3,4],2:[4,1],1:[4,2],0:[4,3],11:[4,4] };
  for (var z = 0; z < 12; z++) {
    var pos = POS[z];
    var pn = T.palace[Object.keys(c.palaceName).length ? (function(){
      // palaceName maps zhi -> Chinese name; find index
      var zhName = c.palaceName[z];
      var zhList = ['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','交友','官禄','田宅','福德','父母'];
      return zhList.indexOf(zhName);
    })() : 0];
    palacesHtml += '<div class="palace' + (z === c.mingZhi ? ' is-ming' : '') + (z === c.shenZhi ? ' is-shen' : '') +
      '" style="grid-column:' + pos[0] + ';grid-row:' + pos[1] + '">' +
      '<div class="p-head"><span class="p-name">' + esc(pn || '—') + '</span><span class="p-ganzhi">' + esc(pz(c.palaceGan(z), z)) + '</span></div>' +
      '<div class="p-stars">' + c.starsByZhi[z].map(function (s) {
        return '<span class="star' + (s === '紫微' || s === '天府' ? ' main' : '') + '">' + esc(T.star[s] || s) + '</span>';
      }).join('') + '</div>' +
      (z === c.mingZhi ? '<span class="p-tag">LIFE</span>' : '') +
      (z === c.shenZhi && z !== c.mingZhi ? '<span class="p-tag shen">BODY</span>' : '') + '</div>';
  }
  var centerSvg = '<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="30" stroke="currentColor" stroke-width=".6" opacity=".55"/><circle cx="40" cy="40" r="21" stroke="currentColor" stroke-width=".6" opacity=".4"/><path d="M40 4v72M4 40h72" stroke="currentColor" stroke-width=".6" opacity=".25"/></svg>';
  var centerHtml = '<div class="chart-center"><div class="cc-symbol">' + centerSvg + '</div>' +
    '<div class="cc-title">' + esc(name) + '</div><div class="cc-sub">NATAL CHART</div><div class="cc-line"></div>' +
    '<div class="cc-detail">' + (c.input.gender === 'kun' ? 'Female' : 'Male') + ' · ' + esc(T.bureau[c.ju]) + '<br>' +
    'Life ' + esc(pz(c.mingGan, c.mingZhi)) + '<br>Body ' + esc(T.branch[c.shenZhi]) + '</div></div>';

  /* tarot */
  var tarotHtml = c.cards.map(function (card, k) {
    var tk = TAROT[card.idx], te = TAROT_EN[card.idx];
    var keys = card.rev ? te.dn : te.up;
    return '<div class="tarot-slot"><div class="ts-label">' + ['PAST','PRESENT','NEXT'][k] + '</div>' +
      '<div class="tarot-card" data-k="' + k + '" tabindex="0" role="button" aria-label="Flip card">' +
      '<div class="tc-inner"><div class="tc-back"><svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="22" fill="none" stroke="currentColor"/><circle cx="30" cy="30" r="12" fill="none" stroke="currentColor"/><path d="M30 2v56M2 30h56" stroke="currentColor" opacity=".35"/></svg><span>ARCANA ' + String(card.idx).padStart(2,'0') + '</span></div>' +
      '<div class="tc-face"><div class="tc-num">' + String(card.idx).padStart(2,'0') + ' / XXI</div>' +
      '<div class="tc-glyph"><svg viewBox="0 0 60 60" fill="none" stroke="currentColor"><circle cx="30" cy="30" r="18"/><path d="M30 6v48M6 30h48"/><circle cx="30" cy="30" r="6"/></svg></div>' +
      '<div class="tc-name">' + esc(tk.e.replace('THE ','')) + '</div>' +
      '<div class="tc-en">' + esc(tk.n) + '</div>' +
      '<div class="tc-pos' + (card.rev ? ' rev' : '') + '">' + (card.rev ? 'REVERSED' : 'UPRIGHT') + '</div></div></div></div>' +
      '<div class="ts-key">' + esc(keys) + '</div></div>';
  }).join('');

  /* vitality curve */
  var W = 900, H = 300, x0 = 56, x1 = W - 30, y0 = 26, y1 = H - 44;
  var vp = c.pts.map(function (p,i) { return { x:x0+(i/8)*(x1-x0), y:y1-(p.v/100)*(y1-y0) }; });
  var line = smoothPath(vp);
  var area = line + ' L' + x1 + ',' + y1 + ' L' + x0 + ',' + y1 + ' Z';
  var grid = ''; for (var g=0; g<=4; g++) { var yy=y0+(g/4)*(y1-y0); grid += '<line class="vit-grid-line" x1="'+x0+'" y1="'+yy+'" x2="'+x1+'" y2="'+yy+'"/>'; }
  var axis = c.pts.map(function(p,i){ return '<text class="vit-axis-text" x="'+vp[i].x+'" y="'+(H-14)+'" text-anchor="middle">'+p.age+'</text>'; }).join('');
  var dots = vp.map(function(p){ return '<circle class="vit-dot" cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="3.4"/>'; }).join('');
  var vitSvg = '<svg class="vit-svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Symbolic vitality curve">' +
    '<defs><linearGradient id="vitGradE" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c8a86b" stop-opacity=".28"/><stop offset="100%" stop-color="#c8a86b" stop-opacity="0"/></linearGradient></defs>' +
    grid + '<text class="vit-axis-text" x="8" y="'+(y0+4)+'">HIGH</text><text class="vit-axis-text" x="8" y="'+(y1+4)+'">LOW</text>' +
    '<path class="vit-area" d="'+area+'" style="fill:url(#vitGradE)"/><path class="vit-line" d="'+line+'"/>'+dots+axis+'</svg>';
  var stageNames = ['蓄','萌','长','盛','转','敛','藏','养'];
  var enStage = { '蓄':'Storing','萌':'Emerging','长':'Growing','盛':'Peaking','转':'Turning','敛':'Gathering in','藏':'Conserving','养':'Nurturing' };
  var stageNotes = ['Establish roots; leave room rather than filling it.','Energy rises — distribute effort across the long run.','The trend turns; follow it instead of forcing it.','Return to a slower tempo; cultivate composure.'];
  var stageHtml = c.stages.map(function (s,i) {
    return '<div class="stage"><div class="stage-age">'+esc(s.age)+'</div><div class="stage-name">'+esc(enStage[s.name]||s.name)+'</div><div class="stage-note">'+esc(stageNotes[i])+'</div></div>';
  }).join('');

  /* three lenses */
  var wxTop = T.phase[c.dominant], wxLow = T.phase[c.weakest];
  var baziBody = 'The Day Master is <b>'+esc(dmEn)+'</b>, born after '+esc(c.jie.en||c.jie.name||'the sectional term')+', '+
    'with an overall strength of <b>'+esc(c.strengthWord==='偏旺'?'predominant':c.strengthWord==='偏弱'?'weak':'balanced')+'</b> ('+c.strength+'/100). '+
    wxTop+' '+c.wxPct[c.dominant]+'% is heaviest, '+wxLow+' '+c.wxPct[c.weakest]+'% thinnest — in plain terms: <b>you carry a load well, but not sustained pressure</b>. '+
    'Rules and external resources outweigh sheer will, so positioning and leverage beat confrontation. '+
    'The month and hour pillars show '+esc(T.god[c.pillars[1].god]||c.pillars[1].god)+' and '+esc(T.god[c.pillars[3].god]||c.pillars[3].god)+', '+
    'a signature of growing up inside a clear script of "how things should be done". '+
    '<b>Verdict: the first three decades build endurance; influence arrives later</b>, and usually requires one deliberate change of environment.';
  var baziBasis = 'Year bounded by Start of Spring (Li Chun); month bounded by the twelve sectional solar terms computed per year; month stem by the Five Tigers rule; day pillar from the Julian day number ((JDN+49) mod 60); hour stem by the Five Rats rule. Hidden stems are weighted to obtain the Five-Phase percentages; Day Master strength combines command of the season, rootedness and support. Every figure is reproducible from the same birth data.';

  var ziweiBody = 'The Life Palace sits in '+esc(T.branch[c.mingZhi])+', holding <b>'+esc(starEn)+'</b>'+(c.borrowed?' (borrowed from the opposite palace)':'')+
    '; Na Yin '+esc(T.nayin[Math.floor(D.gzi(c.mingGan,c.mingZhi)/2)]||c.mingNayin)+' places it in the <b>'+esc(T.bureau[c.ju])+'</b>. '+
    esc(STAR_EN[stars[0]]||'An empty palace takes its character from the three-part square.')+' '+
    'Zi Wei is positioned by the classical bureau/day formula; Tian Fu mirrors it in '+esc(T.branch[c.tianfuZhi])+'; the fourteen major stars follow the standard retrograde Zi Wei sequence and prograde Tian Fu sequence. '+
    '<b>Verdict: 35–45 is the window where resources convert into position.</b> Playing safe in that decade is the likelier way to lose it.';
  var ziweiBasis = 'Life Palace = forward count of the lunar month from Yin, then backward count of the birth hour; Body Palace uses a forward count. Palace stems come from the Five Tigers rule; the Five-Phase Bureau from Na Yin of the Life Palace stems. An Xing Jue: supplement the lunar day to divide by the bureau number, count the quotient forward from Yin, then step back or forward by the parity of the supplement. Verified against the worked examples in the cited sources. Only the fourteen major stars are charted.';

  var tarotBody = 'Past: «'+esc(TAROT[c.cards[0].idx].e)+'»; present: «'+esc(present.e)+'» '+(c.cards[1].rev?'reversed':'upright')+
    '; next: «'+esc(TAROT[c.cards[2].idx].e)+'». Stated plainly: you have already left one established order, and you are in the gap where '+
    '<b>the old should close but the new is not yet standing</b>. The final card suggests repeated looking back, so the gap will last longer than expected. '+
    'The present card turns on «'+esc(presentKey)+'» — here it <b>does not signify death</b>, only that something is overdue for an ending: a relationship, a job, or a habit you already know is unsustainable. '+
    '<b>Verdict: delay costs more than closure.</b> Your birth card, «'+esc(TAROT[c.lifeCard].e)+'», points to the real skill: reassembling what was broken rather than starting over.';
  var tarotBasis = 'Three Major Arcana cards drawn from a fixed birth-data seed; order and orientation are deterministic. Read as Jungian archetypes and presented alongside — not as proof of — the calendrical charts.';

  var syn = 'The three lenses converge on one sentence: <em>you mature late, and a deliberate break is what changes the track</em>. '+
    'The Four Pillars say leverage, not confrontation; the star chart says movement, not consolidation; the present card simply says "close it". '+
    'The least comfortable conclusion is therefore: <em>your present risk is not failure, but staying put</em>. '+
    (direct ? 'The symbolic longevity band is set out below; what is actually valuable in this chart is the fourteen years from 32 to 46 — used well, they make the following decades light; spent maintaining the status quo, they have to be repaid later. ' : '')+
    'The figures are symbols. The choices are yours.';

  /* bold modules */
  var extra = '';
  if (direct) {
    var LON = { '天梁':5,'天同':4,'天府':4,'太阴':3,'紫微':3,'天相':3,'太阳':2,'天机':0,'武曲':0,'贪狼':-1,'巨门':-1,'廉贞':-2,'七杀':-3,'破军':-3 };
    var starScore = 0;
    stars.forEach(function(s){ starScore += (LON[s]||0); });
    c.oppStars.slice(0,2).forEach(function(s){ starScore += (LON[s]||0)*.4; });
    var TL = {13:-3,16:-2,15:2,17:3,19:3,21:3,14:2,9:1,8:2,2:1,10:1,6:1,3:1};
    var tarotScore = (TL[c.lifeCard]||0)+(TL[c.cards[1].idx]||0)*.5+(c.cards[1].rev?-1:0);
    var eq = c.balance*11, qi = (c.strength-50)*.07;
    var mid = Math.round(clamp(72+eq+qi+starScore+tarotScore+(r()-.5)*8,62,94));
    var lo = Math.max(60,mid-5), hi = Math.min(96,mid+6);
    var factors = [
      ['Phase balance', (eq>0?'+':'')+eq.toFixed(1), wxTop+' '+c.wxPct[c.dominant]+'% / '+wxLow+' '+c.wxPct[c.weakest]+'%; the Yuan Hai Zi Ping treats equilibrium as the desirable state'],
      ['Day Master', (qi>0?'+':'')+qi.toFixed(1), dmEn+', strength '+c.strength+'/100'],
      ['Palace stars', (starScore>0?'+':'')+starScore.toFixed(1), starEn+'; Tian Liang / Tian Tong / Tian Fu are traditionally sheltering stars, Qi Sha / Po Jun disruptive'],
      ['Birth card', (tarotScore>0?'+':'')+tarotScore.toFixed(1), '«'+TAROT[c.lifeCard].e+'» plus the present card «'+present.e+'»'],
      ['Chart jitter', '±4.0', 'Deterministic from the birth data; repeated casts are identical']
    ];
    var lows = [];
    for (var q=1;q<c.pts.length-1;q++) if (c.pts[q].v<=c.pts[q-1].v && c.pts[q].v<=c.pts[q+1].v) lows.push(c.pts[q].age);
    if (!lows.length) lows = [c.peakAge-20, c.peakAge+10];
    var gates = [
      [Math.max(20,lows[0]-2)+'–'+(lows[0]+2), 'First threshold', 'A stretch where body and workload tend to be pushed together. Traditionally a "passage": defer major decisions, keep regular hours, and do not change job and home in the same year.'],
      [Math.max(20,(lows[1]||lows[0]+20)-2)+'–'+((lows[1]||lows[0]+20)+2), 'Second threshold', 'The second turning point usually arrives as "something can no longer be sustained". Close it; do not buy reassurance by keeping things unchanged.'],
      [(mid-9)+'–'+(mid-4), 'Conservation period', 'The near edge of the band. Traditional practice advises consolidation, routine check-ups and a lower tempo rather than new ventures.']
    ];
    extra += '<div class="read-section bold-sec"><div class="read-section-head"><span class="rs-no">VI</span><h3 class="rs-title">Longevity Band</h3><span class="rs-en">LONGEVITY SPAN</span></div>' +
      '<div class="longevity"><div class="lon-top"><div class="lon-main"><div class="lon-label">TRADITIONAL SYMBOLIC ESTIMATE · MIDPOINT</div>' +
      '<div class="lon-num">'+mid+'<span>years</span></div><div class="lon-range">Band <b>'+lo+' – '+hi+' years</b></div></div>' +
      '<div class="lon-side"><p>This is neither a clinical estimate nor a probability. It is a weighted sum of the five factors to the right, plus one deterministic jitter term. The same birth data always produces the same figure.</p>'+
      '<p>Traditional practice reads longevity as the "thickness of qi", never from a single star. We keep that logic but expose every step instead of hiding it.</p></div></div>' +
      '<div class="lon-factors">'+factors.map(function(f){ return '<div class="lf-row"><span class="lf-k">'+esc(f[0])+'</span><span class="lf-v">'+esc(f[1])+'</span><span class="lf-d">'+esc(f[2])+'</span></div>'; }).join('')+'</div>' +
      '<div class="gate-head">THRESHOLD DECADES · «PASSAGES» IN THE CLASSICAL SENSE</div>' +
      '<div class="gate-row">'+gates.map(function(g2){ return '<div class="gate"><div class="g-age">'+esc(g2[0])+'</div><div class="g-t">'+esc(g2[1])+'</div><p>'+esc(g2[2])+'</p></div>'; }).join('')+'</div>' +
      '<p class="bold-note">Stated plainly: a passage is a classical term for a transition, derived from troughs in the rhythm curve and the near edge of the band. It does not correspond to any event, illness or date. Read it as a prompt to slow down, not as a forecast.</p></div></div>';

    var DMETA = [
      ['personality','Temperament','Day Master '+T.stemPhase[c.dayGan]],
      ['career','Career & Standing','Officer star · Career palace '+T.branch[(c.mingZhi+8)%12]],
      ['wealth','Wealth & Resources','Wealth star · Wealth palace '+T.branch[(c.mingZhi+4)%12]],
      ['love','Relationships','Spouse palace '+T.branch[(c.mingZhi+2)%12]],
      ['family','Home & Kin','Year pillar · Property palace '+T.branch[(c.mingZhi+9)%12]],
      ['vitality','Constitution & Energy',wxTop+' predominant · Health palace '+T.branch[(c.mingZhi+7)%12]]
    ];
    var domainCards = DMETA.map(function(m){
      var s = Math.round(clamp(52+(c.balance-.5)*20+(c.pts[Math.floor(r()*9)].v-55)*.35+(r()-.5)*26,34,94));
      var tier = s>=72?0:s>=52?1:2;
      return '<div class="domain-card"><div class="dc-head"><div><span class="dc-name">'+esc(m[1])+'</span><span class="dc-en">'+esc(m[0].toUpperCase())+'</span></div><span class="dc-score">'+s+'</span></div>'+
        '<div class="dc-bar"><span class="dc-fill" style="width:'+s+'%"></span></div><p class="dc-body">'+esc(DOMAIN_EN[m[0]][tier])+'</p>'+
        '<p class="dc-basis">From '+esc(m[2])+'</p></div>';
    }).join('');
    extra += '<div class="read-section bold-sec"><div class="read-section-head"><span class="rs-no">VII</span><h3 class="rs-title">Six Domains</h3><span class="rs-en">SIX DOMAINS</span></div><div class="domain-grid">'+domainCards+'</div></div>';

    var dets = DETAIL_EN.slice(0,8);
    extra += '<div class="read-section bold-sec"><div class="read-section-head"><span class="rs-no">VIII</span><h3 class="rs-title">Life-Detail Inferences</h3><span class="rs-en">LIFE DETAILS</span></div>' +
      '<p class="bold-lead">These eight statements are inferred from chart symbolism. <b>No device, location, browsing history or personal data is read.</b> A hit means the symbolism is broad; a miss is equally normal. It is a mirror, not a dossier.</p>' +
      '<div class="detail-list">'+dets.map(function(d,i){ return '<div class="detail"><span class="dt-i">'+String(i+1).padStart(2,'0')+'</span><span class="dt-tag">'+esc(d.tag)+'</span><div><p class="dt-text">'+esc(d.t)+'</p><p class="dt-by">From '+esc(d.by)+'</p></div></div>'; }).join('')+'</div></div>';

    var FOCUS = ['career moves','financial arrangements','relationship handling','a change of residence','study and credentials','physical rhythm'];
    var years = [];
    for (var yy=2026, k2=0; k2<8; k2++, yy++) {
      var gi=((yy-4)%60+60)%60, gs=gi%10, zs=gi%12;
      var a=GAN_WX[gs], b=GAN_WX[c.dayGan];
      var boost=(a===b||D.SHENG[a]===b)?12:(D.KE[a]===b)?6:(D.KE[b]===a)?-10:(D.SHENG[b]===a)?-4:0;
      var sc=Math.round(clamp(56+boost+(c.pts[Math.min(8,Math.floor(k2/1.2))].v-55)*.3+(r()-.5)*16,30,95));
      var focus=FOCUS[Math.floor(r()*FOCUS.length)];
      var word = sc>=74 ? 'A favourable year. Push what can be pushed now, especially '+focus+'; it tends to settle in one move.'
               : sc>=53 ? 'An even year: no great shock, no free gifts. '+focus.charAt(0).toUpperCase()+focus.slice(1)+' advances by accumulation, not sprinting.'
               : 'A conserving year. Avoid new ventures and large commitments; settle old accounts and close leaks, particularly in '+focus+'.';
      var tags = ['Work','Money','Ties','Energy'].map(function(n){ var v=r()+(sc-55)/180; return '<span class="tag '+(v>.72?'good':v>.40?'':'care')+'">'+n+' · '+(v>.72?'FAVOUR':v>.40?'EVEN':'GUARD')+'</span>'; }).join('');
      years.push('<div class="year-row"><div class="yr-left"><span class="yr-y">'+yy+'</span><span class="yr-gz">'+esc(T.stem[gs]+' '+T.branch[zs])+'</span><span class="yr-score">'+sc+'</span></div>'+
        '<div class="yr-body"><div class="yr-tags">'+tags+'</div><p class="yr-word">'+esc(word)+'</p>'+
        '<p class="yr-do">'+(sc>=70?'DO: act, commit long-term / AVOID: verbal promises':sc>=50?'DO: steady foundational work / AVOID: three parallel projects':'DO: reduce load, defer big decisions / AVOID: pushing through')+'</p></div></div>');
    }
    extra += '<div class="read-section bold-sec"><div class="read-section-head"><span class="rs-no">IX</span><h3 class="rs-title">Year-by-Year Fortune</h3><span class="rs-en">EIGHT YEARS</span></div>' +
      '<div class="year-list">'+years.join('')+'</div><p class="bold-note">Yearly scores combine the productive / controlling relation between the annual stem phase and the Day Master, the corresponding segment of the rhythm curve, and a seeded jitter. They rank tempo; they do not predict events.</p></div>';
  }

  var yi = ADVICE_YI_EN.slice(0,4), ji = ADVICE_JI_EN.slice(0,3);
  var lunarTxt = c.lunar ? ('Lunar ' + c.lunar.year + ', month ' + c.lunar.month + (c.lunar.isLeap ? ' (leap)' : '') + ', day ' + c.lunar.day) : '—';

  var html =
  '<div class="read-hero"><p class="read-hero-label">DIRECT READING · LONGEVITY / FORTUNE / DAILY LIFE</p>' +
    '<h2 class="read-hero-name"><span>'+esc(name)+'</span> · A CHART</h2><p class="read-hero-sub">Three lenses, one reading.</p>' +
    '<dl class="read-meta">' +
      '<div><dt>GREGORIAN BIRTH</dt><dd>'+esc(c.y+' · '+c.m+' · '+c.d+' · '+T.branch[c.t]+' hour')+'</dd></div>' +
      '<div><dt>LUNAR DATE</dt><dd>'+esc(lunarTxt)+'</dd></div>' +
      '<div><dt>DAY MASTER</dt><dd>'+esc(dmEn)+'</dd></div>' +
      '<div><dt>LIFE PALACE</dt><dd>'+esc(pz(c.mingGan,c.mingZhi)+' · '+T.bureau[c.ju])+'</dd></div>' +
      '<div><dt>BIRTH CARD</dt><dd>'+esc(TAROT[c.lifeCard].e)+'</dd></div>' +
    '</dl></div>' +
  '<section class="read-section"><div class="read-section-head"><span class="rs-no">I</span><h3 class="rs-title">Four Pillars · Structure</h3><span class="rs-en">FOUR PILLARS</span></div>' +
    '<div class="pillars">'+pillarsHtml+'</div>' +
    '<div class="elements"><p class="el-title">FIVE PHASES · WEIGHTED BY HIDDEN STEMS</p>'+elHtml+
    '<p class="el-summary">Stems count 1, branch principal qi 1, secondary and residual qi 0.45 each. <strong>'+esc(wxTop)+'</strong> dominates ('+c.wxPct[c.dominant]+'%); <strong>'+esc(wxLow)+'</strong> is thinnest ('+c.wxPct[c.weakest]+'%). Day Master strength: '+c.strength+'/100. These numbers describe chart structure only — not physique or lifespan.</p></div></section>' +
  '<section class="read-section"><div class="read-section-head"><span class="rs-no">II</span><h3 class="rs-title">Zi Wei · Twelve Palaces</h3><span class="rs-en">ZI WEI DOU SHU</span></div>' +
    '<div class="chart-layout"><div class="chart-grid">'+palacesHtml+centerHtml+'</div>' +
    '<div class="chart-side"><h4>Palaces & Structure</h4><p class="cs-en">MING / SHEN / STRUCTURE</p><dl>' +
      '<div class="cs-block"><dt>LIFE PALACE STARS</dt><dd><b>'+esc(starEn)+'</b><br>'+esc(STAR_EN[stars[0]]||'An empty palace takes its character from the three-part square.')+'</dd></div>' +
      '<div class="cs-block"><dt>THREE-PART SQUARE</dt><dd>Opposite palace '+esc(T.branch[(c.mingZhi+6)%12])+' holds <b>'+esc(c.oppStars.slice(0,2).map(function(s){return T.star[s]||s;}).join(' · ')||'no major star')+'</b>; the trine also meets '+esc(T.branch[(c.mingZhi+4)%12])+' and '+esc(T.branch[(c.mingZhi+8)%12])+'.</dd></div>' +
      '<div class="cs-block"><dt>FIVE-PHASE BUREAU</dt><dd>Life Palace Na Yin <b>'+esc(T.nayin[Math.floor(D.gzi(c.mingGan,c.mingZhi)/2)]||c.mingNayin)+'</b> → <b>'+esc(T.bureau[c.ju])+'</b>. The bureau sets the step used to place Zi Wei; decade cycles and annual stars are not charted here.</dd></div>' +
    '</dl><p class="cs-notice">Only the fourteen major stars are placed, using the standard An Xing Jue sequences. Minor stars, the four transformations and decade cycles are excluded — this is not a practitioner-grade chart.</p></div></div></section>' +
  '<section class="read-section"><div class="read-section-head"><span class="rs-no">III</span><h3 class="rs-title">Tarot · Three Cards</h3><span class="rs-en">TAROT SPREAD</span></div>' +
    '<div class="tarot-row">'+tarotHtml+'</div><p class="tarot-hint">Click a card to flip · card order is fixed by the birth data</p></section>' +
  '<section class="read-section"><div class="read-section-head"><span class="rs-no">IV</span><h3 class="rs-title">Vitality Rhythm</h3><span class="rs-en">VITALITY ARC</span></div>' +
    '<div class="vitality"><div class="vit-head"><div><h4>Symbolic rhythm curve</h4><p>Composed from Five-Phase balance, Day Master strength, star movement and card tempo. The vertical axis marks high / low energy; it has no unit, threshold or predictive meaning.</p></div><span class="vit-legend">SYMBOLIC ONLY</span></div>' +
    vitSvg + '<div class="stage-row">'+stageHtml+'</div>' +
    '<p class="vit-caveat"><b>Stated plainly</b>: the curve is built from phase balance, Day Master force, star movement and card tempo. '+(direct?'The longevity band and thresholds appear below; both are symbolic constructions':'It does not encode a lifespan')+' — not a clinical conclusion and not a factual prediction. What actually shapes a life is sleep, environment, healthcare and choice, not this chart.</p></div></section>' +
  '<section class="read-section"><div class="read-section-head"><span class="rs-no">V</span><h3 class="rs-title">The Three Readings</h3><span class="rs-en">THE READING</span></div>' +
    '<div class="readings">' +
      '<article class="reading-card"><div class="rc-head"><span class="rc-no">I</span><h4 class="rc-title">Four Pillars</h4><span class="rc-en">BAZI</span></div><p class="rc-body">'+baziBody+'</p><dl class="rc-basis"><dt>BASIS</dt><dd>'+esc(baziBasis)+'</dd></dl></article>' +
      '<article class="reading-card"><div class="rc-head"><span class="rc-no">II</span><h4 class="rc-title">Star Chart</h4><span class="rc-en">ZI WEI</span></div><p class="rc-body">'+ziweiBody+'</p><dl class="rc-basis"><dt>BASIS</dt><dd>'+esc(ziweiBasis)+'</dd></dl></article>' +
      '<article class="reading-card"><div class="rc-head"><span class="rc-no">III</span><h4 class="rc-title">Tarot</h4><span class="rc-en">TAROT</span></div><p class="rc-body">'+tarotBody+'</p><dl class="rc-basis"><dt>BASIS</dt><dd>'+esc(tarotBasis)+'</dd></dl></article>' +
    '</div><div class="synthesis"><p class="syn-label">SYNTHESIS</p><p class="syn-text">'+syn+'</p>' +
    '<dl class="syn-grid">' +
      '<div class="syn-cell"><dt>CURRENT YEAR · BING WU (2026)</dt><dd>Fire is ascendant in a Bing-Wu year. Favour steady rhythms, avoid forcing new structures, and keep decisions reversible.</dd></div>' +
      '<div class="syn-cell"><dt>PHASE EMPHASIS</dt><dd><strong>'+esc(wxTop)+' / '+esc(wxLow)+'</strong>; chart balance index '+Math.round(c.balance*100)+'/100. Read the image, not the integer.</dd></div>' +
      '<div class="syn-cell"><dt>CURVE HIGH</dt><dd>The symbolic curve rises near the <strong>'+c.peakAge+'-year band</strong>. A description of shape, not a prediction of events.</dd></div>' +
    '</dl><div class="advice"><div class="adv-col"><h5>DO · rhythm</h5><ul>'+yi.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></div>' +
    '<div class="adv-col"><h5>AVOID · self-interference</h5><ul>'+ji.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></div></div>' +
    '<p class="fine-print">The suggestions above concern daily rhythm, not medicine, nutrition or psychology. Everything on this site is a cultural-algorithmic construction; it is not medical, legal, investment or life advice. Interpretation and responsibility rest with the reader.</p></div>' +
    extra +
    '<div class="read-actions"><button class="btn-ghost" id="btn-recast">CAST AGAIN</button>' +
    '<button class="btn-ghost" id="btn-copy">COPY SUMMARY</button>' +
    '<button class="btn-ghost" id="btn-print">PRINT / SAVE PDF</button></div></section>';

  body.innerHTML = html;
  setTimeout(function () {
    body.querySelectorAll('.el-fill').forEach(function (el) { el.style.width = el.dataset.w + '%'; });
  }, 120);
  body.querySelectorAll('.tarot-card').forEach(function (card, i) {
    setTimeout(function () { card.classList.add('flipped'); }, 350 + i * 260);
    var toggle = function () { card.classList.toggle('flipped'); };
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });

  document.getElementById('btn-recast').addEventListener('click', function () {
    document.getElementById('cast').scrollIntoView({ behavior:'smooth', block:'start' });
  });
  document.getElementById('btn-copy').addEventListener('click', function () {
    var summary = [
      'EPHEMERIS (Guanxingji) — chart summary (cultural-algorithmic construction)',
      'Birth: '+c.y+'-'+c.m+'-'+c.d+' · '+T.branch[c.t]+' hour',
      'Four Pillars: '+c.pillars.map(function(p){return T.stem[p.g]+' '+T.branch[p.z];}).join(' / '),
      'Day Master: '+dmEn,
      'Life Palace: '+pz(c.mingGan,c.mingZhi)+' · '+T.bureau[c.ju],
      'Three cards: '+c.cards.map(function(x){return TAROT[x.idx].e+(x.rev?' (R)':' (U)');}).join(' / '),
      'Note: symbolic reading, not medical or factual prediction.'
    ].join('\n');
    var btn = document.getElementById('btn-copy');
    var done = function () { btn.textContent = 'COPIED ✓'; setTimeout(function(){ btn.textContent='COPY SUMMARY'; },1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(summary).then(done, function(){ fallback(summary,done); });
    else fallback(summary, done);
  });
  document.getElementById('btn-print').addEventListener('click', function () { window.print(); });
}
function fallback(text, done) {
  var ta = document.createElement('textarea');
  ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); done(); } catch (e) {}
  document.body.removeChild(ta);
}

window.GXJEn = { render:render };
})();
