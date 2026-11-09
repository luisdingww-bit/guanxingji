/* ============================================================
   观星纪 · background audio controller
   loop playback + volume slider + persisted volume + autoplay fallback
   ============================================================ */
(function () {
'use strict';

var audio = document.getElementById('bgm');
if (!audio) return;

var bar     = document.getElementById('bgm-bar');
var toggle  = document.getElementById('bgm-toggle');
var muteBtn = document.getElementById('bgm-mute');
var slider  = document.getElementById('bgm-volume');
var val     = document.getElementById('bgm-val');
var hint    = document.getElementById('bgm-hint');
var durEl   = document.getElementById('bgm-dur');
var icoPlay = document.getElementById('ico-play');
var icoPause= document.getElementById('ico-pause');
var icoVol  = document.getElementById('ico-vol');
var icoMute = document.getElementById('ico-mute');

var STORE = 'gxj-bgm-volume';
var DEFAULT_VOL = .45;
var lastVol = DEFAULT_VOL;

function clamp(v) { return Math.max(0, Math.min(1, v)); }
function readVol() {
  try {
    var v = parseFloat(localStorage.getItem(STORE));
    return isNaN(v) ? DEFAULT_VOL : clamp(v);
  } catch (e) { return DEFAULT_VOL; }
}
function writeVol(v) {
  try { localStorage.setItem(STORE, String(v)); } catch (e) {}
}
function mmss(s) {
  if (!isFinite(s) || s <= 0) return '--:--';
  var m = Math.floor(s / 60), q = Math.floor(s % 60);
  return (m < 10 ? '0' : '') + m + ':' + (q < 10 ? '0' : '') + q;
}
function paintVolume() {
  var pct = Math.round(audio.volume * 100);
  slider.value = pct;
  val.textContent = pct + '%';
  slider.style.background = 'linear-gradient(90deg, var(--gold) 0%, var(--gold) ' + pct +
    '%, rgba(255,255,255,.16) ' + pct + '%, rgba(255,255,255,.16) 100%)';
  var muted = audio.muted || audio.volume === 0;
  icoVol.style.display  = muted ? 'none' : 'block';
  icoMute.style.display = muted ? 'block' : 'none';
  var J = window.GXJI18N;
  muteBtn.setAttribute('aria-label', J ? J.get(muted ? 'bgm.unmute' : 'bgm.mute') : (muted ? '取消静音' : '静音'));
}
function paintPlaying(on) {
  bar.classList.toggle('is-playing', on);
  icoPlay.style.display  = on ? 'none' : 'block';
  icoPause.style.display = on ? 'block' : 'none';
  var I = window.GXJI18N;
  toggle.setAttribute('aria-label', I ? I.get(on ? 'bgm.pause' : 'bgm.play') : (on ? '暂停背景音' : '播放背景音'));
  if (on) hint.hidden = true;
}
function attemptPlay() {
  var p = audio.play();
  if (p && typeof p.then === 'function') {
    p.then(function () { paintPlaying(true); })
     .catch(function () { paintPlaying(false); hint.hidden = false; });
  } else {
    paintPlaying(!audio.paused);
  }
}

audio.loop = true;
audio.volume = readVol();
lastVol = audio.volume > 0 ? audio.volume : DEFAULT_VOL;
paintVolume();
paintPlaying(false);

audio.addEventListener('play',  function () { paintPlaying(true); });
audio.addEventListener('pause', function () { paintPlaying(false); });
audio.addEventListener('volumechange', paintVolume);
audio.addEventListener('loadedmetadata', function () { durEl.textContent = mmss(audio.duration); });
audio.addEventListener('error', function () {
  hint.textContent = window.GXJI18N ? window.GXJI18N.get('bgm.error') : '音频加载失败，请刷新页面重试';
  hint.hidden = false;
});

toggle.addEventListener('click', function () {
  if (audio.paused) attemptPlay(); else audio.pause();
});

muteBtn.addEventListener('click', function () {
  if (audio.muted || audio.volume === 0) {
    audio.muted = false;
    if (audio.volume === 0) {
      audio.volume = lastVol || DEFAULT_VOL;
      writeVol(audio.volume);
    }
  } else {
    lastVol = audio.volume;
    audio.muted = true;
  }
  paintVolume();
});

slider.addEventListener('input', function () {
  var v = clamp(parseInt(slider.value, 10) / 100);
  audio.muted = false;
  audio.volume = v;
  if (v > 0) lastVol = v;
  writeVol(v);
  paintVolume();
});

/* browsers block unmuted autoplay: try anyway, then start on first gesture */
attemptPlay();
function kick() { if (audio.paused) attemptPlay(); }
document.addEventListener('pointerdown', kick, { once: true, passive: true });
document.addEventListener('keydown', kick, { once: true });

})();
