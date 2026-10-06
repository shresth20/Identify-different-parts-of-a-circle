/* i18n.js -- every word and clip by KEY, from locales/locales.json
 *   T('p01Hey')                    -> "Hey there!"
 *   T('p04HeightIs', { h: 'h₁' })  -> "And its height is h₁."
 *   T('p20Work.0')                 -> first item of an array key
 *   I18n.voice('p01Hey')           -> "assets/VO/en/p01Hey.webm?v=1"
 *   I18n.say('p01Hey')             -> plays it; resolves true/false
 *   I18n.applyStatic()             -> fills data-i18n / data-i18n-html /
 *                                     data-i18n-attr="title:key" in HTML
 * Language: ?lan=xx on the URL, else defaultLanguage. A language without
 * recordings speaks the default language's clips. English only for now.
 * Served over http the JSON is fetched; from file:// it reads
 * locales/locales.js instead. Regenerate that after editing the JSON:
 *   (printf 'window.GAME_LOCALES='; cat locales/locales.json; echo ';') > locales/locales.js
 */
var I18n = (function () {
  'use strict';

  var PARAM     = 'lan';  /* ?lan=hi */
  var PARAM_ALT = 'lang'; /* ...and ?lang=hi */
  var JSON_PATH = 'locales/locales.json';
  var JS_PATH   = 'locales/locales.js';       /* generated fallback for file:// */
  var CLIP_EXT  = '.webm';                    /* Opus in WebM, see media rules */
  /* the file's own codes, and what <html lang> should say where they differ */
  var BCP47 = { od: 'or' };
  /* keys of the file that are not languages */
  var META = { defaultLanguage: 1, languageLabels: 1, voiceOver: 1 };

  var _data = null;
  var _lang = 'en';

  /* ---------- which language ---------- */
  function _urlLang() {
    try {
      var p = new URLSearchParams(window.location.search);
      return String(p.get(PARAM) || p.get(PARAM_ALT) || '').trim().toLowerCase();
    } catch (e) { return ''; }
  }
  function _isLang(code) {
    return !!(code && _data && !META[code] && _data[code] && typeof _data[code] === 'object');
  }
  function _default() {
    var def = _data && _data.defaultLanguage;
    return _isLang(def) ? def : 'en';
  }
  function _pick() {
    var want = _urlLang();
    return _isLang(want) ? want : _default();
  }

  /* ---------- loading ---------- */
  function _readJson(path, cb) {
    var xhr;
    try { xhr = new XMLHttpRequest(); xhr.open('GET', path, true); }
    catch (e) { return cb(null); }
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status !== 200 && xhr.status !== 0) return cb(null);
      try { cb(JSON.parse(xhr.responseText)); } catch (e) { cb(null); }
    };
    try { xhr.send(); } catch (e) { cb(null); }
  }
  function _readScript(path, cb) {
    if (window.GAME_LOCALES) return cb(window.GAME_LOCALES);
    var s = document.createElement('script');
    s.src = path;
    s.onload  = function () { cb(window.GAME_LOCALES || null); };
    s.onerror = function () { cb(null); };
    (document.head || document.documentElement).appendChild(s);
  }
  function _finish(data, cb) {
    _data = data || { defaultLanguage: 'en', en: {} };
    _lang = _pick();
    try { document.documentElement.lang = BCP47[_lang] || _lang; } catch (e) {}
    if (cb) cb(_lang);
  }
  /* Load the locale and call back with the language code. The game goes on
     showing keys if nothing can be read -- never a blocked screen. */
  function load(cb) {
    var fromScript = function () {
      _readScript(JS_PATH, function (js) {
        if (!js && typeof console !== 'undefined' && console.warn) {
          console.warn('[i18n] could not read ' + JSON_PATH + ' or ' + JS_PATH + '; showing keys');
        }
        _finish(js, cb);
      });
    };
    var local = false;
    try { local = window.location.protocol === 'file:'; } catch (e) {}
    if (local) return fromScript();          /* file:// cannot fetch the JSON */
    _readJson(JSON_PATH, function (json) {
      if (json) return _finish(json, cb);
      fromScript();
    });
  }

  /* ---------- text by key ---------- */
  function _sub(str, repl) {
    if (!repl) return str;
    Object.keys(repl).forEach(function (k) {
      str = str.split('{' + k + '}').join(String(repl[k]));
    });
    return str;
  }
  /* the raw value of a key: the language's own, else the default's */
  function _raw(key) {
    var dict = (_data && _data[_lang]) || {};
    var def  = (_data && _data[_default()]) || {};
    if (key in dict) return dict[key];
    if (key in def)  return def[key];
    /* 'p20Work.0' reaches into an array */
    var dot = key.lastIndexOf('.');
    if (dot > 0) {
      var arr = _raw(key.slice(0, dot)), i = +key.slice(dot + 1);
      if (Array.isArray(arr) && i in arr) return arr[i];
    }
    return undefined;
  }
  /* t(key, replacements): the line in the current language. An array key
     comes back as a fresh array. A missing key comes back as the key
     itself, so it can be seen and fixed. */
  function t(key, repl) {
    var val = _raw(key);
    if (Array.isArray(val)) return val.slice();
    if (typeof val !== 'string') return String(key);
    return _sub(val, repl);
  }
  function has(key) { return _raw(key) !== undefined; }
  /* "16 {unitCm}" -> "16 cm": every {key} in the template is a lookup */
  function fmt(template) {
    return String(template).replace(/\{(\w+)\}/g, function (m, k) { return has(k) ? t(k) : m; });
  }

  /* ---------- static markup ---------- */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function html(text) { return esc(text).split('²').join('<sup>2</sup>'); }
  function applyStatic(root) {
    root = root || document;
    var q = function (sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); };
    q('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (has(key)) el.textContent = t(key);
    });
    q('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (has(key)) el.innerHTML = html(t(key));
    });
    q('[data-i18n-fmt]').forEach(function (el) {
      el.innerHTML = html(fmt(el.getAttribute('data-i18n-fmt')));
    });
    q('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var at = pair.indexOf(':');
        if (at < 0) return;
        var attr = pair.slice(0, at).trim(), key = pair.slice(at + 1).trim();
        if (attr && has(key)) el.setAttribute(attr, t(key));
      });
    });
    if (root === document && has('pageTitle')) document.title = t('pageTitle');
  }

  /* ---------- voice-over by key ---------- */
  /* the recordings of the current language, else the default language's */
  function _pack() {
    var vo = (_data && _data.voiceOver) || {};
    return vo[_lang] || vo[_default()] || null;
  }
  function hasVoice() { return !!_pack(); }
  /* the clip for a key: assets/VO/en/<key>.webm, or an entry of the pack's
     "files" map when a clip is named otherwise. null when the language has
     no recordings at all. The file itself may still be missing (not yet
     recorded) -- say() treats that as silence. */
  function voice(key) {
    var p = _pack();
    if (!p || !key) return null;
    var file = (p.files && p.files[key]) || (key + CLIP_EXT);
    return (p.dir || '') + file + (p.rev ? '?v=' + p.rev : '');
  }

  var _clips = Object.create(null);           /* url -> Audio, made once */
  var _playing = null;
  function _clip(url) {
    if (!_clips[url]) { _clips[url] = new Audio(url); _clips[url].preload = 'auto'; }
    return _clips[url];
  }
  function preload(keys) {
    (keys || []).forEach(function (k) { var u = voice(k); if (u) _clip(u); });
  }
  function stop() {
    if (_playing) { try { _playing.pause(); _playing.currentTime = 0; } catch (e) {} }
    _playing = null;
  }
  /* say(key): play the key's clip; one clip at a time. Resolves with true
     when it has ended, false when there was no clip, it could not play
     (autoplay blocked, file not recorded yet) or it was cut by a later say. */
  function say(key) {
    var url = voice(key);
    stop();
    if (!url) return Promise.resolve(false);
    var a = _clip(url);
    _playing = a;
    return new Promise(function (resolve) {
      var done = function (ok) {
        a.onended = a.onerror = null;
        if (_playing === a) _playing = null;
        resolve(ok);
      };
      a.onended = function () { done(true); };
      a.onerror = function () { done(false); };
      try { a.currentTime = 0; } catch (e) {}
      var p = a.play();
      if (p && p.catch) p.catch(function () { done(false); });
    });
  }

  /* ---------- the language, read and changed ---------- */
  function getLang() { return _lang; }
  function getLanguages() {
    return Object.keys(_data || {}).filter(_isLang);
  }
  /* a new language is a reload with ?lan=xx, so every line and clip is
     built for it from the first frame */
  function setLang(code) {
    code = String(code || '').toLowerCase();
    if (!_isLang(code) || code === _lang) return false;
    try {
      var url = new URL(window.location.href);
      url.searchParams.set(PARAM, code);
      url.searchParams.delete(PARAM_ALT);
      window.location.href = url.toString();
      return true;
    } catch (e) { return false; }
  }

  return {
    load: load,
    t: t, has: has, fmt: fmt, html: html, applyStatic: applyStatic,
    hasVoice: hasVoice, voice: voice, say: say, stop: stop, preload: preload,
    getLang: getLang, getLanguages: getLanguages, setLang: setLang
  };
})();

/* the one short name the game uses for its words */
function T(key, repl) { return I18n.t(key, repl); }
