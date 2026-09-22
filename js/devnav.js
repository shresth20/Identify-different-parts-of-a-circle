/* ==========================================================================
 * devnav.js -- TEMPORARY level bar (Back / Skip / Replay)
 * --------------------------------------------------------------------------
 * A development control, not part of the lesson. Three buttons in the
 * bottom-right corner that move the lesson a LEVEL at a time:
 *
 *   Back    the previous level, from its first beat
 *   Skip    the next level, from its first beat
 *   Replay  the level on screen, from its first beat
 *
 * Every one of them is Pages.runFrom(), so a jump is a real start of a real
 * level: the run in flight is retired, the board is put back to the state
 * that level expects to find, and the level then plays itself normally. No
 * beat is fast-forwarded and nothing is left half drawn.
 *
 * It owns its own markup and its own styles so it is one file to delete:
 * remove this file and its <script> tag in index.html and nothing else in
 * the project knows it was here.
 *
 * Keyboard, for the same three: Alt+Left, Alt+Right, Alt+R.
 *
 * Load order: js/pages.js -> js/script.js -> js/devnav.js
 * ========================================================================== */
(function (global) {
  'use strict';

  var CSS = [
    '.devnav{',
    /* Pinned to the WINDOW's bottom-right corner, not to the lesson's frame:
       out in the letterbox below the board, clear of the whole stage. */
    '  position:fixed; z-index:9999;',
    '  bottom:max(10px,env(safe-area-inset-bottom,0px));',
    '  right:max(10px,env(safe-area-inset-right,0px));',
    '  display:flex; align-items:center; gap:8px;',
    '  padding:7px 9px; border-radius:999px;',
    '  background:rgba(43,44,137,.30);',
    '  border:1px solid rgba(255,255,255,.35);',
    '  box-shadow:0 8px 22px rgba(43,44,137,.22);',
    '  backdrop-filter:blur(7px); -webkit-backdrop-filter:blur(7px);',
    '  font-family:var(--font-body,system-ui,sans-serif);',
    '  opacity:.55; transition:opacity .18s ease;',
    '}',
    /* Out of the way until it is wanted -- it sits over the board. */
    '.devnav:hover,.devnav:focus-within{opacity:1;}',
    '.devnav__tag{',
    '  padding:0 8px; font-size:11px; font-weight:700; letter-spacing:.04em;',
    '  color:#fff; text-transform:uppercase; white-space:nowrap; opacity:.85;',
    '}',
    '.devnav__btn{',
    '  appearance:none; cursor:pointer; white-space:nowrap;',
    '  padding:7px 14px; border-radius:999px;',
    '  border:1px solid rgba(255,255,255,.55);',
    '  background:linear-gradient(180deg,rgba(255,255,255,.95),rgba(255,255,255,.72));',
    '  color:#2B2C89; font:inherit; font-size:13px; font-weight:700;',
    '  line-height:1; transition:filter .15s ease, transform .1s ease;',
    '}',
    '.devnav__btn:hover{filter:brightness(1.04);}',
    '.devnav__btn:active{transform:translateY(1px);}',
    '.devnav__btn:focus-visible{outline:2px solid #FFF; outline-offset:2px;}',
    '.devnav__btn[disabled]{opacity:.42; cursor:default; filter:none;}',
    '@media (max-width:640px){',
    '  .devnav{gap:6px; padding:5px 6px;}',
    '  .devnav__btn{padding:6px 10px; font-size:12px;}',
    '  .devnav__tag{display:none;}',
    '}'
  ].join('\n');

  function style() {
    var el = document.createElement('style');
    el.id = 'devnavStyle';
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  function button(label, title, onClick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'devnav__btn';
    b.textContent = label;
    b.title = title;
    b.addEventListener('click', onClick);
    return b;
  }

  function mount() {
    var Pages = global.Pages;
    if (!Pages || !Pages.runFrom) {
      console.warn('devnav.js: Pages.runFrom() is missing -- level bar not shown.');
      return;
    }

    style();

    var at = 0, count = 1;

    /* A jump is only ever "start this level". The run in flight is retired by
       runFrom() itself, so there is nothing to tidy up here. */
    function go(index) { Pages.runFrom(index); }

    var tag  = document.createElement('span');
    tag.className = 'devnav__tag';

    var back = button('« Back', 'Previous level (Alt+Left)',
                      function () { go(at - 1); });
    var skip = button('Skip »', 'Next level (Alt+Right)',
                      function () { go(at + 1); });
    var again = button('↺ Replay', 'Replay this level (Alt+R)',
                       function () { go(at); });

    var bar = document.createElement('div');
    bar.className = 'devnav';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Level controls (development)');
    bar.appendChild(tag);
    bar.appendChild(back);
    bar.appendChild(skip);
    bar.appendChild(again);

    /* On the body: the bar belongs to the window, not to the staged lesson. */
    document.body.appendChild(bar);

    /* The lesson says which level it is on; the bar only reads it. */
    Pages.onLevel(function (index, total, name) {
      at = index; count = total;
      tag.textContent = (index + 1) + '/' + total + ' · ' + name;
      back.disabled = index <= 0;
      skip.disabled = index >= total - 1;
    });

    document.addEventListener('keydown', function (ev) {
      if (!ev.altKey || ev.ctrlKey || ev.metaKey) return;
      var k = ev.key;
      if (k === 'ArrowLeft' && at > 0)            { ev.preventDefault(); go(at - 1); }
      else if (k === 'ArrowRight' && at < count - 1) { ev.preventDefault(); go(at + 1); }
      else if (k === 'r' || k === 'R')            { ev.preventDefault(); go(at); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})(window);
