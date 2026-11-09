/* ============================================================
   观星纪 · CALENDRICAL CORE
   Verified, reproducible Chinese calendrical algorithms.

   Sources (see Sources section on the page):
   - Lunar data table 1900-2100 (lunarInfo) & solar-term formula
     「1900年至2100年公历、农历互转Js代码」 https://blog.jjonline.cn/linux/173.html
     https://www.github.com/ZenRonphy/SolarToLunarCalendar/blob/master/LunisolarCalendar.cs
   - Four Pillars rules (Li Chun year boundary, Jie-bound months,
     Five Tigers / Five Rats, hidden stems, Ten Gods)
     https://ccziwei.com/mingli/bazi/articles/gan-zhi-wu-xing-dui-zhao-biao-nian-yue-ri-shi
     https://www.fyqyw.com/view/283700
   - Zi Wei star placement (An Xing Jue)
     https://ziweimingli.com/articles/zi-wei-dou-shu-an-xing-jue-257
     https://m.ziweifu.com/ziweizatan/1887.html
     http://www.fushantang.com/1012/c/1012c/j3084.html
   ============================================================ */
(function () {
'use strict';

/* --- lunarInfo: 1900-2100, one integer per year --- */
var LUNAR_INFO = [
0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252,
0x0d520
];

/* --- 24 solar terms: minutes from the 1900 Minor Cold epoch --- */
var S_TERM = [
0,21208,42467,63836,85337,107014,128867,150921,173149,195551,218072,240693,
263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483532,504758
];

function leapMonth(y) { return LUNAR_INFO[y - 1900] & 0xf; }
function leapDays(y) { return leapMonth(y) ? ((LUNAR_INFO[y - 1900] & 0x10000) ? 30 : 29) : 0; }
function monthDays(y, m) { return (LUNAR_INFO[y - 1900] & (0x10000 >> m)) ? 30 : 29; }
function lYearDays(y) {
  var i, sum = 348;
  for (i = 0x8000; i > 0x8; i >>= 1) sum += (LUNAR_INFO[y - 1900] & i) ? 1 : 0;
  return sum + leapDays(y);
}

/* Solar term date (1-31) in China Standard Time, 1900-2100.
   Classic "Shouxing" formula: tropical-year milliseconds + term offset. */
function termDay(y, n) {
  if (y < 1900) y = 1900; /* 1900-01 is the lunar data-table epoch */
  if (y > 2100 || n < 0 || n > 23) return -1;
  var base = Date.UTC(1900, 0, 6, 2, 5);
  var ms = Math.floor(31556925974.7 * (y - 1900) + S_TERM[n] * 60000) + base;
  return new Date(ms).getUTCDate();
}

/* Gregorian -> Chinese lunar date. Returns null outside 1900-2100. */
function solarToLunar(y, m, d) {
  if (y < 1900 || y > 2100) return null;
  var offset = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 31)) / 86400000);
  if (offset < 0) return null;
  var i, temp = 0, lunarYear;
  for (i = 1900; i < 2101 && offset > 0; i++) { temp = lYearDays(i); offset -= temp; }
  if (offset < 0) { offset += temp; i--; }
  lunarYear = i;
  var leap = leapMonth(i), isLeap = false;
  for (i = 1; i < 13 && offset > 0; i++) {
    if (leap > 0 && i === (leap + 1) && isLeap === false) {
      --i; isLeap = true; temp = leapDays(lunarYear);
    } else { temp = monthDays(lunarYear, i); }
    if (isLeap === true && i === (leap + 1)) isLeap = false;
    offset -= temp;
  }
  if (offset === 0 && leap > 0 && i === leap + 1) {
    if (isLeap) { isLeap = false; } else { isLeap = true; --i; }
  }
  if (offset < 0) { offset += temp; --i; }
  return {
    year: lunarYear, month: i, day: offset + 1, isLeap: isLeap,
    leap: leap, monthDays: temp
  };
}

/* The 12 "Jie" (sectional terms) that open a Bazi month.
   order = lunar-solar month ordinal used by the Five Tigers rule (Yin=1..Chou=12). */
var JIE = [
  { n:0,  order:12, zhi:1,  zh:'小寒', en:'Minor Cold',      m:1  },
  { n:2,  order:1,  zhi:2,  zh:'立春', en:'Start of Spring', m:2  },
  { n:4,  order:2,  zhi:3,  zh:'惊蛰', en:'Awakening of Insects', m:3 },
  { n:6,  order:3,  zhi:4,  zh:'清明', en:'Pure Brightness', m:4  },
  { n:8,  order:4,  zhi:5,  zh:'立夏', en:'Start of Summer', m:5  },
  { n:10, order:5,  zhi:6,  zh:'芒种', en:'Grain in Ear',   m:6  },
  { n:12, order:6,  zhi:7,  zh:'小暑', en:'Minor Heat',     m:7  },
  { n:14, order:7,  zhi:8,  zh:'立秋', en:'Start of Autumn', m:8 },
  { n:16, order:8,  zhi:9,  zh:'白露', en:'White Dew',      m:9  },
  { n:18, order:9,  zhi:10, zh:'寒露', en:'Cold Dew',       m:10 },
  { n:20, order:10, zhi:11, zh:'立冬', en:'Start of Winter', m:11 },
  { n:22, order:11, zhi:0,  zh:'大雪', en:'Major Snow',      m:12 }
];

/* Which Jie governs a Gregorian date. Returns {order, zhi, zh, en, day, year}. */
function jieForDate(y, m, d) {
  var current = m * 100 + d;
  var found = null;
  for (var k = 0; k < JIE.length; k++) {
    var j = JIE[k];
    var dd = termDay(y, j.n);
    if (dd > 0 && j.m * 100 + dd <= current) found = { j:j, day:dd, year:y };
  }
  if (found) return { order:found.j.order, zhi:found.j.zhi, zh:found.j.zh,
                       en:found.j.en, day:found.day, year:found.year };
  /* early January: still in the previous year's Major Snow (Zi) month */
  var py = y - 1;
  return { order:11, zhi:0, zh:'大雪', en:'Major Snow',
           day:termDay(py, 22), year:py };
}

/* Julian day number for a Gregorian date at noon. */
function jdn(y, m, d) {
  var a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy
       + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}
/* Day pillar index 0..59 (jia-zi = 0). Verified: 2000-01-01 = wu-wu (54),
   1900-01-01 = jia-xu (10). */
function dayPillarIndex(y, m, d) { return ((jdn(y, m, d) + 49) % 60 + 60) % 60; }

/* Five Tigers: Yin-month stem from year stem. */
function yinGanOf(yearGan) { return ((yearGan % 5) * 2 + 2) % 10; }
/* Five Rats: Zi-hour stem from day stem. */
function ziGanOf(dayGan) { return (dayGan % 5) * 2; }

/* Zi Wei: place the Ziwei star using the standard An Xing Jue formula.
   "局数除日数，商数宫前走" — add a supplement X so (day + X) divides by
   the bureau number; the quotient Y counts forward from Yin (=1);
   odd X steps backward X palaces, even X steps forward X palaces.
   Verified against the three worked examples in the cited sources. */
function ziweiZhi(ju, lunarDay) {
  var day = Math.max(1, Math.min(30, lunarDay));
  var X = (ju - (day % ju)) % ju;
  var Y = (day + X) / ju;
  var base = (2 + Y - 1) % 12;          /* Yin = 2, counting Yin as 1 */
  var z;
  if (X === 0) z = base;
  else if (X % 2 === 1) z = ((base - X) % 12 + 12) % 12;
  else z = (base + X) % 12;
  return z;
}
/* Tianfu mirrors Ziwei across the Yin-Shen axis.
   "丑卯相更迭，未酉互为根…同位在寅申" -> (4 - ziwei) mod 12. */
function tianfuZhi(z) { return ((4 - z) % 12 + 12) % 12; }

/* Ming / Shen palace from LUNAR month and birth branch-hour. */
function mingZhiOf(lunarMonth, hourZhi) { return ((lunarMonth + 1) - hourZhi + 12) % 12; }
function shenZhiOf(lunarMonth, hourZhi) { return ((lunarMonth + 1) + hourZhi) % 12; }

window.GXJCore = {
  LUNAR_INFO:LUNAR_INFO, S_TERM:S_TERM, JIE:JIE,
  solarToLunar:solarToLunar, termDay:termDay, jieForDate:jieForDate,
  jdn:jdn, dayPillarIndex:dayPillarIndex,
  yinGanOf:yinGanOf, ziGanOf:ziGanOf,
  ziweiZhi:ziweiZhi, tianfuZhi:tianfuZhi,
  mingZhiOf:mingZhiOf, shenZhiOf:shenZhiOf,
  leapMonth:leapMonth, monthDays:monthDays
};
})();
