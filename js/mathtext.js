/* ==========================================================================
 * mathtext.js -- a fraction stood up in a line of type
 * --------------------------------------------------------------------------
 * The game's text is plain strings: a formula on a pill, a sentence in a
 * box. A fraction in one of them is spelled with the glyph (½, ¼, ¾ ...) or
 * as digits either side of a fraction slash (3⁄8), and that is how the
 * string is kept, compared and shuffled. This module is the one place the
 * glyph is DRAWN differently: written into the page the way it is written
 * on paper -- the numerator over the denominator, with the bar between --
 * as a .frac span (css/style.css), wherever text goes into a pill or a box.
 * A word may stand over the bar too ("radius⁄2"), and a fraction held in
 * brackets gets brackets as tall as it is (.frac-group).
 *
 *   MathText.write(el, text)  -- empties `el` and fills it with `text`,
 *                                every fraction in it stood up
 *   MathText.has(text)        -- whether a line carries one at all
 *
 * The stacked span reads back as its digits run together ("12"), so a
 * caller that needs the label as data keeps the string (dataset.name on a
 * pill, pages.js) rather than reading the element's text. A screen reader
 * is given the fraction whole, as an image with the glyph for its label.
 *
 * Load order: before js/typer.js and js/pages.js, which write through it.
 * ========================================================================== */
(function (global) {
  'use strict';

  /* The glyphs a line may spell a fraction with -> [numerator, denominator]. */
  var GLYPHS = {
    '½': ['1', '2'],
    '⅓': ['1', '3'], '⅔': ['2', '3'],
    '¼': ['1', '4'], '¾': ['3', '4'],
    '⅕': ['1', '5'], '⅖': ['2', '5'], '⅗': ['3', '5'], '⅘': ['4', '5'],
    '⅙': ['1', '6'], '⅚': ['5', '6'],
    '⅛': ['1', '8'], '⅜': ['3', '8'], '⅝': ['5', '8'], '⅞': ['7', '8']
  };
  /* One glyph, or a word or digits over digits round U+2044 FRACTION SLASH
     ("3⁄8", "radius⁄2") -- never the ordinary solidus, so "π/2" in prose
     and "7/6" in a page count are left alone. Either figure may carry a
     degree sign ("80°⁄360°", the central-angle pages), and a fraction
     held in brackets -- "(radius⁄2)" -- is one token with them, so the
     brackets can be drawn as tall as the stack they hold, as LaTeX's
     \left( \right) are. */
  var TOKEN = /[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\([A-Za-z\d°]+⁄[\d°]+\)|[A-Za-z\d°]+⁄[\d°]+/g;

  function parts(tok) {
    return GLYPHS[tok] || tok.split('⁄');
  }

  function bracketed(tok) {
    return tok.charAt(0) === '(' && tok.charAt(tok.length - 1) === ')';
  }

  function has(text) {
    TOKEN.lastIndex = 0;
    return TOKEN.test(String(text == null ? '' : text));
  }

  /* The stack: numerator, then denominator wearing the bar as its top edge.
     A bracketed one is the stack between two tall brackets, all one span,
     so it never breaks across a row. */
  function frac(tok) {
    if (bracketed(tok)) {
      var inner = tok.slice(1, -1);
      var wrap = document.createElement('span');
      wrap.className = 'frac-group';
      wrap.setAttribute('role', 'img');
      wrap.setAttribute('aria-label', '(' + parts(inner).join('/') + ')');
      var stack = frac(inner);
      stack.removeAttribute('role');
      stack.removeAttribute('aria-label');
      wrap.appendChild(paren('('));
      wrap.appendChild(stack);
      wrap.appendChild(paren(')'));
      return wrap;
    }
    var p = parts(tok);
    var el = document.createElement('span');
    el.className = 'frac';
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', GLYPHS[tok] ? tok : p[0] + '/' + p[1]);
    var n = document.createElement('span');
    n.className = 'frac__n';
    n.textContent = p[0];
    var d = document.createElement('span');
    d.className = 'frac__d';
    d.textContent = p[1];
    el.appendChild(n);
    el.appendChild(d);
    return el;
  }

  function paren(ch) {
    var b = document.createElement('span');
    b.className = 'frac-paren';
    b.setAttribute('aria-hidden', 'true');
    b.textContent = ch;
    return b;
  }

  /* `text` into `el`, as text nodes with a .frac for each fraction. A line
     with none in it comes out as one text node -- what el.textContent =
     text would have made -- so writing through here costs nothing. */
  function write(el, text) {
    var s = String(text == null ? '' : text);
    el.textContent = '';
    var from = 0;
    var m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(s)) !== null) {
      if (m.index > from) el.appendChild(document.createTextNode(s.slice(from, m.index)));
      el.appendChild(frac(m[0]));
      from = m.index + m[0].length;
    }
    if (from < s.length) el.appendChild(document.createTextNode(s.slice(from)));
    return el;
  }

  global.MathText = {
    GLYPHS: GLYPHS,
    has: has,
    write: write
  };
})(window);
