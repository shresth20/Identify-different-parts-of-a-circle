/* ==========================================================================
 * sector-area.js -- Skill 3: the area of a sector, beat by beat
 * --------------------------------------------------------------------------
 * The lesson in index.html, built from the nCircle_Skills storyboard. It
 * runs on the first lesson's engine -- Motion, Flow, Typer, Mascot, Beats --
 * and borrows pages.js's machinery for the board: the bird jumping up onto
 * the header and back down behind it, the line typed beside it, the Next
 * disc that hands the pace to the learner. So the two lessons are one game.
 *
 * What is new here is the content and three kinds of question the
 * storyboard asks with:
 *
 *   a dropdown blank   a dashed slot in a sentence; tap it, pick a choice
 *   a tap-the-answer   three pills, the first lesson's own, under the
 *                      question or in the footer
 *   a tap-the-figure   a point on the rim, a region, a handle to drag
 *
 * A wrong answer is never the end of a question: the choice is struck out,
 * the bird says so, and the learner tries again. The right one goes green
 * with a tick, the bird is pleased, and the working behind it is shown.
 *
 * Every wait is taken out through Flow, so Replay unwinds a scene in one go
 * and Skip plays it out to its Next. Under Skip a question is answered for
 * the learner, so the board lands in the state the beats after it expect.
 *
 * A section of pages.js (see addSection there), as skills 2 and 4 are: its
 * scenes are appended to the lesson's, it plays on the one board and the
 * one bird, and the level bar, Next, Skip and Replay reach it unchanged.
 * Its own picture is built in #saStage, not in the shared figure, and its
 * stylesheet (css/sector-area.css) only applies while body.sa-lesson is on
 * -- set while this skill's scenes play and taken off by reset() -- so
 * nothing here can restyle the other skills, nor theirs this one.
 *
 * Load order: pages.js and the sections before it -> sector-area.js ->
 *             segarea.js (skill 4) -> script.js
 * ========================================================================== */
(function (global) {
  'use strict';

  var M = global.Motion;
  var Flow = global.Flow;
  var Beats = global.Beats;
  var Pages = global.Pages;
  var K = Pages && Pages.kit;
  var NS = 'http://www.w3.org/2000/svg';

  if (!Pages || !Pages.addSection || !K || !K.typer) {
    console.error('sector-area.js: load it after js/pages.js.');
    return;
  }

  /* ---- pacing -----------------------------------------------------------
     BEAT is the gap between one line and the next, SHORT the gap between
     two marks of one drawing, LOOK how long a finished drawing is left to
     be looked at before anything is said about it. */
  var BEAT  = 560;
  var SHORT = 280;
  var LOOK  = 1100;
  var PEN   = 1.5;          /* s: the pen once round a circle               */
  var SWEEP = 1.1;          /* s: a sector swept out                        */

  var PRAISE = ['fbCorrect', 'p29WellDone', 's3ThatsRight', 's3GreatJob'];
  var OOPS   = ['s3OopsTryAgain', 's3OopsOnceMore', 's3OopsAlmost'];

  var dom = null;
  var mascot = null;
  var sayBubble = null;
  var sayPrompt = null;
  var praised = 0;

  /* ======================================================================
   * Small tools
   * ====================================================================== */
  function $(id) { return document.getElementById(id); }
  function wait(ms) { return Flow.wait(ms); }
  function anim(a) { return Flow.anim(a); }
  function quiet(p) { if (p && p.catch) p.catch(function () {}); return p; }
  /* words by key; `tr`, not T, since several scenes name a sector T */
  function tr(key, repl) { return global.I18n ? global.I18n.t(key, repl) : key; }
  function keyed(key, repl) { return repl ? { text: tr(key, repl), vo: key } : K.keyed(key); }
  function lineOf(text) { return text && typeof text === 'object' ? text : { text: String(text), vo: null }; }
  /* A line's clip (assets/VO-skill 3/En), started as its words start and
     listened to the end -- pages.js's hear, so Skip stops it and Replay
     takes it with the scene. Resolves true once heard, false when there
     was no clip or a later line cut it.
       Never waited for past the line's own length and a margin: a clip
     whose `ended` never comes (a stalled load, a busy device -- seen in a
     test run, 2026-10-09) must not hold the lesson; the next line's clip
     takes the voice over as ever. */
  var VO_SLACK = 2500;      /* ms past the last word's cue */
  function voiceOf(line) {
    if (!line.vo || !global.I18n) return Promise.resolve(false);
    if (!K.hear) return quiet(global.I18n.say(line.vo));
    var cues = global.I18n.cues ? global.I18n.cues(line.vo, line.text) : null;
    var most = Math.max(VO_MIN, (cues ? cues[cues.length - 1] : tr(line.vo).length * VO_PACE) + VO_SLACK);
    return Promise.race([K.hear(line.vo), wait(most).then(function () { return true; })]);
  }
  /* The words of a recorded line typed on its clip's clock, each word as
     it is heard (the cues in locales.json) -- for a typer pages.js did not
     make, the perch bubble's; the header's and the bubble's find theirs. */
  function timed(line) {
    /* the shown text goes along: a line with a placeholder ("{f}") has
       its words only once filled, and cues(key, text) counts those */
    var cues = line.vo && global.I18n && global.I18n.cues ? global.I18n.cues(line.vo, line.text) : null;
    return cues ? { at: cues } : undefined;
  }
  /* Answers are shown in a random order, so the right one is not always
     first; the order of the list in the code still names them. */
  function shuffled(n) {
    var o = [];
    for (var i = 0; i < n; i++) o.push(i);
    for (var j = n - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1)), t = o[j]; o[j] = o[k]; o[k] = t;
    }
    return o;
  }
  function praise() { return keyed(PRAISE[praised++ % PRAISE.length]); }
  function oops() { return keyed(OOPS[(Math.random() * OOPS.length) | 0]); }

  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function h(tag, cls, content, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (content != null) e.innerHTML = content;
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---- the words of a formula --------------------------------------------
     Each kind of number keeps one ink everywhere (see sector-area.css): an
     angle is magenta, a radius amber, π blue, an area mint, an answer
     green. These build the markup the panels and the choices are set in. */
  function fr(n, d, cls) {
    return '<span class="frac' + (cls ? ' ' + cls : '') + '"><span class="frac__n">' +
           n + '</span><span class="frac__d">' + d + '</span></span>';
  }
  function c(cls, s) { return '<span class="c-' + cls + '">' + s + '</span>'; }
  var X  = '<span class="op">×</span>';
  var EQ = '<span class="op">=</span>';
  var MINUS = '<span class="op">−</span>';
  var PIR2 = c('pi', 'πr²');
  var DD = '<span data-dd></span>';

  /* ---- geometry ------------------------------------------------------------
     Angles are in degrees, measured the way a protractor is read: from
     three o'clock, counter-clockwise. SVG's y runs down, so the sine is
     subtracted. */
  function r2(n) { return Math.round(n * 100) / 100; }
  function pt(C, r, deg) {
    var a = deg * Math.PI / 180;
    return { x: C.x + r * Math.cos(a), y: C.y - r * Math.sin(a) };
  }
  /* A ring that starts at twelve and runs clockwise, as the first lesson's
     rim does -- the way a hand draws one. */
  function ringD(cx, cy, r) {
    return 'M' + cx + ' ' + (cy - r) + ' A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r) +
           ' A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy - r);
  }
  function arcD(C, r, a0, a1) {
    var span = a1 - a0;
    var p = pt(C, r, a0);
    if (span >= 359.99) {
      var q = pt(C, r, a0 + 180);
      return 'M' + r2(p.x) + ' ' + r2(p.y) + ' A' + r + ' ' + r + ' 0 1 0 ' + r2(q.x) + ' ' + r2(q.y) +
             ' A' + r + ' ' + r + ' 0 1 0 ' + r2(p.x) + ' ' + r2(p.y);
    }
    var e = pt(C, r, a1);
    return 'M' + r2(p.x) + ' ' + r2(p.y) + ' A' + r + ' ' + r + ' 0 ' + (span > 180 ? 1 : 0) +
           ' 0 ' + r2(e.x) + ' ' + r2(e.y);
  }
  function wedgeD(C, r, a0, a1) {
    var span = a1 - a0;
    if (span <= 0.01) return 'M' + C.x + ' ' + C.y;
    if (span >= 359.99) return arcD(C, r, a0, a0 + 360) + ' Z';
    var p = pt(C, r, a0), e = pt(C, r, a1);
    return 'M' + C.x + ' ' + C.y + ' L' + r2(p.x) + ' ' + r2(p.y) +
           ' A' + r + ' ' + r + ' 0 ' + (span > 180 ? 1 : 0) + ' 0 ' + r2(e.x) + ' ' + r2(e.y) + ' Z';
  }
  /* A ring-shaped wedge, for the folds of the fan. */
  function bandD(C, r0, r1, a0, a1) {
    var p = pt(C, r1, a0), q = pt(C, r1, a1), s = pt(C, r0, a1), t = pt(C, r0, a0);
    var big = (a1 - a0) > 180 ? 1 : 0;
    return 'M' + r2(t.x) + ' ' + r2(t.y) + ' L' + r2(p.x) + ' ' + r2(p.y) +
           ' A' + r1 + ' ' + r1 + ' 0 ' + big + ' 0 ' + r2(q.x) + ' ' + r2(q.y) +
           ' L' + r2(s.x) + ' ' + r2(s.y) +
           ' A' + r0 + ' ' + r0 + ' 0 ' + big + ' 1 ' + r2(t.x) + ' ' + r2(t.y) + ' Z';
  }
  function segD(p, q) { return 'M' + r2(p.x) + ' ' + r2(p.y) + ' L' + r2(q.x) + ' ' + r2(q.y); }
  function fmt(n) { return String(Math.round(n * 100) / 100); }

  /* ======================================================================
   * Motion helpers, all tracked by Motion so Skip and Replay reach them
   * ====================================================================== */
  /* ---- the figure that waits in the middle --------------------------------
     A picture-and-words page opens with the picture alone, centred on the
     board: it is drawn there, where the eye is. The first time anything is
     put up beside it -- a line, a card, the answers -- it glides over to its
     own column and the words come in after it. `held` is the picture still
     waiting; settleFig sends it and hands back how long the words should
     wait for it to get out of their way. */
  var held = null;
  var GLIDE = 0.75;
  function inPanel(els) {
    var list = els && els.length != null && !els.nodeType ? els : [els];
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].closest && list[i].closest('.sa-panel, .tray')) return true;
    }
    return false;
  }
  function settleFig() {
    if (!held) return 0;
    var w = held;
    held = null;
    M.to(w, { xPercent: 0, duration: M.dur(GLIDE), ease: 'power2.inOut' });
    return M.dur(GLIDE * 0.6);
  }

  function fadeIn(els, o) {
    o = o || {};
    var after = inPanel(els) ? settleFig() : 0;
    return M.fromTo(els, { opacity: 0, y: o.y == null ? 8 : o.y },
      { opacity: 1, y: 0, duration: M.dur(o.d || 0.45), ease: 'power2.out',
        stagger: M.gap(o.stagger || 0), delay: after });
  }
  function popIn(els, o) {
    o = o || {};
    return M.fromTo(els, { opacity: 0, scale: o.from || 0.6, transformOrigin: 'center center' },
      { opacity: 1, scale: 1, duration: M.dur(o.d || 0.42), ease: M.POP,
        stagger: M.gap(o.stagger || 0) });
  }
  function fadeOut(els) {
    return M.to(els, { opacity: 0, duration: M.dur(0.3), ease: 'power2.in' });
  }
  function cardIn(el) {
    var after = inPanel(el) ? settleFig() : 0;
    return M.fromTo(el, { opacity: 0, scale: 0.9, y: 12, transformOrigin: '50% 100%' },
      { opacity: 1, scale: 1, y: 0, duration: M.dur(0.46), ease: 'back.out(1.6)', delay: after });
  }

  /* ======================================================================
   * The figure kit
   * ====================================================================== */
  function figure(host, vb) {
    var wrap = h('div', 'sa-fig-wrap', null, host);
    var s = svgEl('svg', { 'class': 'sa-fig', viewBox: vb || '22 22 376 376',
                           preserveAspectRatio: 'xMidYMid meet', role: 'img' }, wrap);
    /* The first picture of a picture-and-words page starts in the middle
       of the board (see settleFig). Held as a share of its own width, so a
       resize while it waits keeps it centred. */
    if (host.classList.contains('sa-scene--split') && !held) {
      var a = host.getBoundingClientRect(), b = wrap.getBoundingClientRect();
      if (b.width) {
        M.set(wrap, { xPercent: ((a.left + a.width / 2) - (b.left + b.width / 2)) / b.width * 100 });
        held = wrap;
      }
    }
    return { wrap: wrap, svg: s };
  }

  function text(parent, x, y, s, cls, anchor) {
    var t = svgEl('text', { 'class': cls || 'lbl', x: r2(x), y: r2(y),
                            'text-anchor': anchor || 'middle', 'dominant-baseline': 'central' }, parent);
    t.textContent = s;
    return t;
  }

  /* A circle, in layers: the wash, the regions, the rim, the lines on it,
     the marks, the centre -- each layer painting over the one before. */
  function circle(svg, cx, cy, r) {
    var C = { x: cx, y: cy, r: r };
    C.g     = svgEl('g', {}, svg);
    C.disc  = svgEl('circle', { 'class': 'figure__disc', cx: cx, cy: cy, r: r }, C.g);
    C.under = svgEl('g', {}, C.g);
    C.rim   = svgEl('path', { 'class': 'figure__rim', d: ringD(cx, cy, r) }, C.g);
    C.tip   = svgEl('circle', { 'class': 'rim-tip', cx: cx, cy: cy - r, r: 7 }, C.g);
    C.over  = svgEl('g', {}, C.g);
    C.marks = svgEl('g', {}, C.g);
    C.dot   = svgEl('circle', { 'class': 'centre__dot sa-centre', cx: cx, cy: cy, r: 6.5 }, C.g);
    C.top   = svgEl('g', {}, C.g);
    return C;
  }

  /* The pen once round, then the colour poured in, then the centre. */
  function drawCircle(C, time) {
    return anim(Beats.drawRim(C.rim, C.tip, { time: time || PEN }))
      .then(function () { return anim(Beats.fillDisc(C.disc)); })
      .then(function () { return anim(Beats.plotDot(C.dot, 0.45)); });
  }

  /* A sector: its region, the arc that bounds it and its two radii. The
     major one shares the minor one's radii, so it is made without its own. */
  function sector(C, a0, a1, kind, o) {
    o = o || {};
    var S = { C: C, kind: kind || 'minor' };
    S.region = svgEl('path', { 'class': 's-region s-region--' + S.kind, d: '' }, C.under);
    S.arc = svgEl('path', { 'class': 's-arc s-arc--' + S.kind, d: '' }, C.over);
    if (o.radii !== false) {
      S.ra = svgEl('path', { 'class': 's-radius', d: '' }, C.over);
      S.rb = svgEl('path', { 'class': 's-radius', d: '' }, C.over);
    }
    S.set = function (b0, b1) {
      S.a0 = b0; S.a1 = b1;
      S.region.setAttribute('d', wedgeD(C, C.r, b0, b1));
      S.arc.setAttribute('d', arcD(C, C.r, b0, b1));
      if (S.ra) {
        S.ra.setAttribute('d', segD(C, pt(C, C.r, b0)));
        S.rb.setAttribute('d', segD(C, pt(C, C.r, b1)));
      }
    };
    S.set(a0, a1);
    return S;
  }
  /* The two sectors of a circle lit in turn -- the minor, then the major,
     and round again -- while a question about both of them waits. A CSS
     loop (sa-region-glow), half a period out of step between the two; the
     returned function puts both back to rest. */
  function glowTurns(minor, major) {
    minor.classList.add('is-glow-a');
    major.classList.add('is-glow-b');
    return function () {
      minor.classList.remove('is-glow-a');
      major.classList.remove('is-glow-b');
    };
  }

  function radii(S, seconds) {
    return Promise.all([anim(Beats.growLine(S.ra, seconds || 0.8, 'power2.inOut')),
                        wait(160).then(function () {
                          return anim(Beats.growLine(S.rb, seconds || 0.8, 'power2.inOut'));
                        })]);
  }
  function sweep(S, seconds) {
    var a0 = S.a0, a1 = S.a1, C = S.C;
    return anim(Beats.secFill(S.region, function (t) {
      return wedgeD(C, C.r, a0, a0 + (a1 - a0) * t);
    }, seconds || SWEEP));
  }
  function arcIn(S, seconds) { return anim(Beats.growLine(S.arc, seconds || SWEEP, 'power2.inOut')); }
  function show(els) { M.set(els, { opacity: 1 }); }

  /* The mark at the centre: a small arc between the two radii, and its
     name set just outside it. */
  function angleMark(C, a0, a1, s, o) {
    o = o || {};
    var A = { r: o.r || 30 };
    A.arc = svgEl('path', { 'class': 's-angle' + (o.major ? ' s-angle--major' : '') }, C.marks);
    A.lbl = text(C.marks, 0, 0, s || '', 'lbl ' + (o.cls || 'lbl--angle'));
    A.set = function (b0, b1, label) {
      /* A right angle is marked as one: a small square in the corner, not
         an arc. */
      if (Math.abs((b1 - b0) - 90) < 0.5) {
        var q = A.r * 0.62, u = pt({ x: 0, y: 0 }, q, b0), v = pt({ x: 0, y: 0 }, q, b1);
        A.arc.setAttribute('d', 'M' + r2(C.x + u.x) + ' ' + r2(C.y + u.y) +
          ' L' + r2(C.x + u.x + v.x) + ' ' + r2(C.y + u.y + v.y) +
          ' L' + r2(C.x + v.x) + ' ' + r2(C.y + v.y));
      } else {
        A.arc.setAttribute('d', arcD(C, A.r, b0, b1));
      }
      /* Near a full turn the mark is a whole ring round the centre, and a
         name set beside it at its middle would sit on the ring: it goes
         just below the ring instead. */
      A.b0 = b0; A.b1 = b1;
      var dist = A.r + (o.gap || 24);
      var span = b1 - b0;
      /* A name too wide for the gap between the two radii is moved out
         along the middle of the sector until it fits between them --
         never past the rim. */
      if (span < 180 && C.r) {
        var len = 0;
        try { len = A.lbl.getComputedTextLength(); } catch (e) {}
        if (label != null && label !== A.lbl.textContent) len = len * String(label).length / Math.max(1, A.lbl.textContent.length);
        if (len > 0) {
          var need = (len / 2 + 10) / Math.tan(span / 2 * Math.PI / 180) + 12;
          dist = Math.min(Math.max(dist, need), C.r - 16);
        }
      }
      var p = span >= 300 ? { x: C.x, y: C.y + A.r + 26 } : pt(C, dist, (b0 + b1) / 2);
      A.lbl.setAttribute('x', r2(p.x));
      A.lbl.setAttribute('y', r2(p.y));
      if (label != null) A.lbl.textContent = label;
    };
    A.set(a0, a1, s);
    return A;
  }
  function angleIn(A) {
    /* measured again now the name is laid out, so the fit is exact */
    if (A.set && A.b0 != null) A.set(A.b0, A.b1);
    /* A mark already on a figure carried over from the screen before is
       left as it is -- only a changed name is popped in. */
    if (A.__shown) {
      if (A.__said === A.lbl.textContent) return Promise.resolve();
      A.__said = A.lbl.textContent;
      return anim(popIn(A.lbl, { from: 0.7 }));
    }
    A.__shown = true;
    A.__said = A.lbl.textContent;
    return Promise.all([anim(Beats.growLine(A.arc, 0.5)), anim(fadeIn(A.lbl, { y: 4 }))]);
  }

  /* A curved pointer from a word to the thing it names, with a barbed
     head: the first lesson's callout, drawn in the board's own ink. */
  function pointer(parent, from, to, bend) {
    var mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
    var dx = to.x - from.x, dy = to.y - from.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
    var cx = mx - dy / len * (bend || 30), cy = my + dx / len * (bend || 30);
    var line = svgEl('path', { 'class': 's-callout',
      d: 'M' + r2(from.x) + ' ' + r2(from.y) + ' Q' + r2(cx) + ' ' + r2(cy) + ' ' + r2(to.x) + ' ' + r2(to.y) }, parent);
    var ax = to.x - cx, ay = to.y - cy, al = Math.sqrt(ax * ax + ay * ay) || 1;
    ax /= al; ay /= al;
    var b = 10, w = 6;
    var head = svgEl('path', { 'class': 's-callout',
      d: 'M' + r2(to.x - ax * b - ay * w) + ' ' + r2(to.y - ay * b + ax * w) +
         ' L' + r2(to.x) + ' ' + r2(to.y) +
         ' L' + r2(to.x - ax * b + ay * w) + ' ' + r2(to.y - ay * b - ax * w) }, parent);
    return { line: line, head: head };
  }
  /* Curved arrows from a line of words in the panel to the parts of the
     picture it is about, drawn one after the other. They leave from the
     words' left edge -- read in the picture's own units, so the arrows sit
     exactly at the sentence wherever the layout has put it -- and each
     bows away from the next, so two never cross. */
  function pointTo(svg, el, targets) {
    var r = el.getBoundingClientRect();
    var p = svg.createSVGPoint();
    p.x = r.left - 10;
    p.y = r.top + r.height / 2;
    var from = p.matrixTransform(svg.getScreenCTM().inverse());
    var ps = targets.map(function (t, i) {
      var lift = targets.length > 1 ? (i ? 12 : -12) : 0;
      var P = pointer(svg, { x: from.x, y: from.y + lift }, t, i ? -46 : 46);
      P.line.classList.add('s-callout--soft');
      P.head.classList.add('s-callout--soft');
      return P;
    });
    return ps.reduce(function (chain, P) {
      return chain.then(function () { return pointerIn(P); });
    }, Promise.resolve()).then(function () { return ps; });
  }
  function pointerIn(P) {
    return anim(Beats.growLine(P.line, 0.6)).then(function () { return anim(fadeIn(P.head, { y: 0, d: 0.2 })); });
  }

  /* ======================================================================
   * The board: header, bird, Next (ported from pages.js)
   * ====================================================================== */
  function clearPrompt() {
    sayPrompt.clear();
    M.set(dom.promptLine, { clearProps: 'opacity,transform,filter' });
  }

  /* Say a line in the header, and carry the bird to where the new line
     leaves room for it -- the row is centred as a pair, so the bird's spot
     depends on the line's width. The step is eased rather than jumped. */
  function sayInHeader(text) {
    var slot = dom.slotHeader;
    var before = slot.getBoundingClientRect().left;
    var reveal = sayPrompt.reserve(text);
    var shift = before - slot.getBoundingClientRect().left;
    if (Math.abs(shift) > 0.5) {
      M.set(slot, { x: shift });
      M.to(slot, { x: 0, duration: M.dur(0.42), ease: 'power2.inOut' });
    }
    return reveal();
  }

  var speaking = 0;
  function speak(text, mood) {
    var said = lineOf(text);
    var mine = ++speaking;
    var line = perch ? perch.line : dom.promptLine;
    var has = line.textContent.trim().length > 0;
    var gone = has ? anim(Beats.lineOut(line)) : Promise.resolve();
    return gone.then(function () {
      if (mine !== speaking) return;
      M.set(line, { clearProps: 'opacity,transform,filter' });
      mascot.state(mood || 'talking');
      var heard = quiet(voiceOf(said));
      return Promise.all([perch ? perch.typer(said.text, timed(said)) : sayInHeader(said.text), heard]);
    }).then(function () {
      if (mine === speaking) mascot.settle();
    });
  }

  /* ---- the bird's jump on and off the board ------------------------------
     Up from behind the board, over its top edge and down onto the header;
     and back the same way. Two elements share each arc -- the bird and the
     hopper behind the board -- and swap at the apex, the one point where
     neither overlaps the board (see pages.js for the full account). */
  var FOOT = 0.90, CLEAR = 8, PARK = 14;

  function flightPlan(cell) {
    var b = dom.board.getBoundingClientRect();
    return { centre: b.top - CLEAR - (FOOT - 0.5) * cell.height, park: b.top + PARK };
  }
  function hopperOff() {
    dom.hopper.classList.remove('on');
    mascot.unmirror(dom.hopper);
  }
  function jumpDone() {
    hopperOff();
    M.set([mascot.el, dom.hopper], { clearProps: 'transform' });
  }

  function mascotJumpIn(slot) {
    var el = mascot.el;
    el.classList.add('is-away');
    el.hidden = false;
    mascot.placeIn(slot || dom.slotHeader);

    var cell = el.getBoundingClientRect();
    if (!cell.width || M.reducedMotion()) {
      el.classList.remove('is-away');
      return Promise.resolve();
    }
    var plan = flightPlan(cell);
    M.set(dom.hopper, { left: cell.left, top: plan.park, width: cell.width, height: cell.height, y: 0 });
    mascot.mirror(dom.hopper);
    dom.hopper.classList.add('on');

    return anim(Beats.hopUp(dom.hopper, plan.centre - (plan.park + cell.height / 2)))
      .then(function () {
        var at = el.getBoundingClientRect();
        var from = plan.centre - (at.top + at.height / 2);
        M.set(el, { y: from });
        el.classList.remove('is-away');
        hopperOff();
        return anim(Beats.landOn(el, from));
      })
      .then(jumpDone, function (err) { jumpDone(); throw err; });
  }

  function mascotJumpOut() {
    var el = mascot.el;
    if (el.hidden || el.classList.contains('is-away')) return Promise.resolve();
    var cell = el.getBoundingClientRect();
    if (!cell.width || M.reducedMotion()) {
      el.classList.add('is-away');
      return Promise.resolve();
    }
    var plan = flightPlan(cell);
    return anim(Beats.springOff(el, plan.centre - (cell.top + cell.height / 2)))
      .then(function () {
        var at = el.getBoundingClientRect();
        M.set(dom.hopper, {
          left: cell.left, top: cell.top, width: cell.width, height: cell.height,
          y: (at.top + at.height / 2) - (cell.top + cell.height / 2)
        });
        mascot.mirror(dom.hopper);
        dom.hopper.classList.add('on');
        el.classList.add('is-away');
        return anim(Beats.hopDown(dom.hopper, plan.park - cell.top));
      })
      .then(jumpDone, function (err) { jumpDone(); throw err; });
  }

  function birdOnHeader() {
    var el = mascot.el;
    var home = perch ? perch.slot : dom.slotHeader;
    return el.parentNode === home && !el.hidden && !el.classList.contains('is-away');
  }

  /* ---- the bird on the page ------------------------------------------------
     For a question asked beside the figure rather than over it: a perch in
     the panel, with a speech bubble beside it. While a perch is up, every
     line the bird says -- the question, the feedback -- is said there, in
     the bubble, and the header stays empty. The bird gets there the way it
     gets onto the header: up from behind the board and down onto its spot. */
  var perch = null;
  function perchIn(host) {
    var row = h('div', 'sa-speak', null, host);
    var slot = h('div', 'sa-perch', null, row);
    var bub = h('div', 'sa-bubble',
      '<span class="type-wrap"><span class="type-ghost"></span>' +
      '<span class="type" aria-live="polite"><span class="txt"></span></span></span>' +
      /* The tail: the hero bubble's drawing (index.html), stamped again, so
         the box reads as the same object wherever the bird speaks -- as
         skill 2's bubble-02 does. Placed, sized and coloured by .sa-bubble
         (css/sector-area.css); the fill and the stroke read the bubble's
         own --bubble-bg and --note-edge, so a verdict recolours it too. */
      '<svg class="bubble-tail" viewBox="0 0 44 42" aria-hidden="true">' +
      '<path d="M4 0 H42 V8 C36 20 24 30 2 42 C8 32 8 20 4 8 Z" fill="var(--bubble-bg)" />' +
      '<path d="M42 8 C36 20 24 30 2 42 C8 32 8 20 4 8" fill="none" stroke="var(--note-edge)" ' +
      'stroke-width="4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />' +
      '</svg>', row);
    var wrap = bub.querySelector('.type-wrap');
    var typer = global.Typer.create(wrap, { box: bub });
    M.set(bub, { opacity: 0 });
    return { row: row, slot: slot, bubble: bub, line: wrap, typer: typer, open: false };
  }
  /* The bird onto the perch, and its first line into the bubble as the
     bubble opens out of its beak. */
  function perchSay(P, text, mood) {
    var line = lineOf(text);
    /* A bird standing on the header hops straight across to the perch --
       one arc over the board, the header kept open (user, 2026-10-09: no
       leaving behind the board and coming up again); a bird that is away
       comes up from behind the board as ever. */
    var el = mascot.el;
    var onHeader = el.parentNode === dom.slotHeader && !el.hidden && !el.classList.contains('is-away');
    perch = P;
    var mine = ++speaking;
    told++;
    var reveal = P.typer.reserve(line.text, timed(line));
    var come = onHeader ? K.mascotHopTo(P.slot, true) : mascotJumpIn(P.slot);
    return come.then(function () {
      mascot.state(mood || 'talking');
      var heard = quiet(voiceOf(line));
      P.open = true;
      quiet(anim(M.fromTo(P.bubble, { opacity: 0, scale: 0.2, transformOrigin: '0% 70%' },
        { opacity: 1, scale: 1, duration: M.dur(0.44), ease: 'back.out(1.6)' })));
      return Promise.all([reveal(), heard]);
    }).then(function () { if (mine === speaking) mascot.settle(); });
  }
  /* And off it: the bubble shuts, the bird springs away behind the board. */
  function perchOut() {
    var P = perch;
    if (!P) return Promise.resolve();
    speaking++;
    told++;
    return Promise.all([anim(M.to(P.bubble, { opacity: 0, scale: 0.9, duration: M.dur(0.24), ease: 'power2.in' })),
                        mascotJumpOut()])
      .then(function () { perch = null; });
  }

  /* The bird says a line: from where it stands if it is on the header, or
     it comes up to say it. The line is reserved BEFORE the jump, so the bird
     lands where the finished line will put it. */
  function say(text, mood) {
    var line = lineOf(text);
    if (birdOnHeader()) return speak(line, mood);
    if (perch) return perchSay(perch, line, mood);
    var mine = ++speaking;
    var reveal = sayPrompt.reserve(line.text);
    return mascotJumpIn().then(function () {
      mascot.state(mood || 'talking');
      var heard = quiet(voiceOf(line));
      return Promise.all([reveal(), heard]);
    }).then(function () { if (mine === speaking) mascot.settle(); });
  }

  /* A line in the field bubble, or across the top of the board. */
  function bubbleSay(text) {
    var line = lineOf(text);
    var heard = quiet(voiceOf(line));
    return Promise.all([sayBubble(line.text), heard]);
  }
  function sayTop(text) {
    var line = lineOf(text);
    var reveal = sayPrompt.reserve(line.text);
    var heard = quiet(voiceOf(line));
    return Promise.all([reveal(), heard]);
  }

  /* A line said by the voice alone, with nothing written -- as skill 1's
     "This is the radius." is: the last line is taken off the header (the
     bird stays), the bird talks for as long as the clip runs, and `along`
     -- what the voice is reading out, written on the board -- is acted out
     at the same time. A line not yet recorded holds for the time it would
     take to say; under Skip nothing is heard and only `along` is played. */
  var VO_MIN = 1600, VO_PACE = 65;
  function voiceAlone(key, along) {
    if (Flow.isFast() || !global.I18n) return Promise.resolve(along ? along() : null);
    var floor = Math.max(VO_MIN, tr(key).length * VO_PACE);
    return hush().then(function () {
      var from = Date.now();
      var mine = speaking;
      mascot.state('talking');
      var heard = voiceOf({ text: '', vo: key }).then(function (played) {
        if (mine === speaking) mascot.settle();
        if (!played) return wait(floor - (Date.now() - from));
      });
      return Promise.all([heard, along ? along() : null]);
    });
  }

  /* Feedback said as a run of short lines, each replacing the last: "Not
     quite! Look again." first, and the reason after it. A newer answer
     cuts an older run off, so a learner who tries again at once is never
     still being told about the choice before. */
  var told = 0;
  function sayAll(lines, mood) {
    var mine = ++told;
    return [].concat(lines).reduce(function (chain, line, i) {
      return chain.then(function () {
        if (mine !== told) return;
        return (i ? wait(BEAT) : Promise.resolve()).then(function () {
          if (mine === told) return say(line, mood);
        });
      });
    }, Promise.resolve());
  }

  /* The last line taken off the header, the bird left standing: for a
     drawing that is meant to be watched before anything is said about it. */
  function hush() {
    speaking++;
    told++;
    if (!dom.promptLine.textContent.trim()) return Promise.resolve();
    return anim(Beats.lineOut(dom.promptLine)).then(function () {
      clearPrompt();
      mascot.settle();
    });
  }

  /* The bird and its line off the header, between two parts of the lesson. */
  function leaveHeader() {
    return Promise.all([mascotJumpOut(), anim(Beats.lineOut(dom.promptLine))])
      .then(clearPrompt);
  }

  /* ---- Next ----------------------------------------------------------------
     Every hand-over is a page turned, and a page is what the level bar
     moves in. A jump seeking past this one steps over it. */
  /* The lesson's own hand-over (pages.js), so the page is counted where the
     level bar counts every other skill's. */
  function handOver() {
    var btn = dom.nextBtn;
    autoplay(function () { if (!btn.hidden) btn.click(); }, 1500);
    return K.handOver(btn);
  }

  function ripple(ev, el) {
    var r = el.getBoundingClientRect();
    M.tapRipple((ev && ev.clientX) || (r.left + r.width / 2),
                (ev && ev.clientY) || (r.top + r.height / 2));
  }

  /* A burst of confetti from an element on the board. */
  function burstAt(el) {
    if (!el) return;
    var f = dom.frame.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    /* beside the element, not on it: the numbers in it stay readable */
    var x = Math.min(r.right + 46, f.right - 40) - f.left;
    if (r.right + 46 > f.right - 40) x = Math.max(r.left - 46, f.left + 40) - f.left;
    quiet(anim(Beats.confetti(dom.burst, x, r.top + r.height / 2 - f.top)));
  }

  /* ======================================================================
   * Waiting on the learner
   * ----------------------------------------------------------------------
   * One wait for "whichever of these is pressed first". Flow.once is the
   * lesson's one cancellable wait and it waits on ONE element, so every
   * target here forwards its press to a hidden gate, and the gate is what
   * is waited on. Under Skip the `auto` answer is taken for the learner.
   * ====================================================================== */
  /* Testing only: window.__autoplay answers every question correctly, at
     normal speed, after a short pause -- so the whole lesson can be
     watched end to end without a person. Off unless set. */
  function autoplay(fn, ms) {
    if (global.__autoplay) setTimeout(fn, ms || global.__autoplay);
  }
  function waitPick(targets, auto) {
    if (Flow.isFast() && auto) return Promise.resolve(auto);
    var got = null;
    if (auto) autoplay(function () { got = auto; if (dom.gate) dom.gate.click(); });
    function on(ev) {
      got = ev.currentTarget;
      ripple(ev, got);
      dom.gate.click();
    }
    function onKey(ev) {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      ev.preventDefault();
      got = ev.currentTarget;
      dom.gate.click();
    }
    targets.forEach(function (t) {
      t.addEventListener('click', on);
      if (!(t instanceof HTMLButtonElement)) t.addEventListener('keydown', onKey);
    });
    function off() {
      targets.forEach(function (t) {
        t.removeEventListener('click', on);
        t.removeEventListener('keydown', onKey);
      });
    }
    /* A skip that arrives while this waits settles it with nothing picked:
       it is then answered for the learner, as a skip before it would be. */
    return Flow.once(dom.gate).then(function () { off(); return got || auto; },
                                    function (err) { off(); throw err; });
  }

  /* A condition the learner reaches by doing something continuous -- a
     handle dragged to a mark. `check()` is offered to the scene to call as
     things change; the wait ends the first time it is called true. */
  function until(auto) {
    var armed = true;
    var p = Flow.isFast() ? Promise.resolve() : Flow.once(dom.gate);
    if (Flow.isFast() && auto) auto();
    if (auto && !Flow.isFast()) autoplay(function () { if (armed) { auto(); dom.gate.click(); } });
    return {
      done: p.then(function () { armed = false; }),
      check: function (ok) { if (armed && ok) dom.gate.click(); }
    };
  }

  /* ---- the answers in the footer ------------------------------------------ */
  function clearChoices() {
    var box = dom.choices;
    if (box.hasAttribute('hidden')) return Promise.resolve();
    var btns = Array.prototype.slice.call(box.children);
    return anim(M.to(btns, { opacity: 0, y: 8, duration: M.dur(0.24), ease: 'power2.in' }))
      .then(function () { box.setAttribute('hidden', ''); box.textContent = ''; K.choices([]); });
  }

  /* Three (or two) pills -- the first lesson's own .choice, wherever they
     stand; resolves once the right one is pressed. */
  /* `o.host` puts the pills on the page itself, in a row under the
     question, rather than in the footer. */
  function askChoice(labels, right, o) {
    o = o || {};
    var box = o.host ? h('div', 'sa-mcq' + (o.tiles ? ' sa-mcq--tiles' : ''), null, o.host) : dom.choices;
    box.textContent = '';
    var btns = labels.map(function (l, i) {
      var b = h('button', 'choice', l, box);
      b.type = 'button';
      return b;
    });
    if (!o.keepOrder) shuffled(btns.length).forEach(function (i) { box.appendChild(btns[i]); });
    /* The footer is the board's: told what is in it, its wipe takes them. */
    if (box === dom.choices) K.choices(btns);
    box.removeAttribute('hidden');
    btns.forEach(function (b) { M.button3d(b, { edge: 4 }); });
    var good = btns[right];

    function loop() {
      var live = btns.filter(function (b) { return !b.__out; });
      return waitPick(live, good).then(function (b) {
        if (b === good) {
          btns.forEach(function (x) { x.classList.add('is-done'); });
          quiet(anim(Beats.choiceRight(good)));
          burstAt(good);
          return (o.voice || sayAll)(o.yes || praise(), 'happy');
        }
        b.__out = true;
        quiet(anim(Beats.choiceWrong(b)).then(function () {
          b.classList.remove('is-wrong');
          b.classList.add('is-out');
        }));
        var why = o.why && o.why[btns.indexOf(b)];
        if (o.onWrong) o.onWrong(btns.indexOf(b));
        quiet((o.voice || sayAll)(why || o.no || oops(), 'confused'));
        return loop();
      });
    }
    var inOrder = Array.prototype.slice.call(box.children).filter(function (e) { return btns.indexOf(e) >= 0; });
    return anim(M.fromTo(inOrder, { opacity: 0, y: 14, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: M.dur(0.42), ease: 'back.out(1.5)',
        stagger: M.gap(o.stagger || 0.08), delay: settleFig() }))
      .then(function () { if (o.onShown) o.onShown(); })
      .then(loop);
  }

  /* ---- the dropdown blank ---------------------------------------------------
     A dashed slot set into a sentence. Tap it and the choices drop out under
     it (or over it, `up`); a wrong one shows red in the slot for a moment,
     shakes, and is struck off the list; the right one stays, green, with a
     tick on the corner. */
  function dropdown(host, opts, right, o) {
    o = o || {};
    var dd = h('span', 'dd' + (o.up ? ' dd--up' : ''), null, host);
    var face = h('button', 'dd__face',
      '<span class="dd__val"></span>' +
      '<svg class="dd__caret" viewBox="0 0 12 8" aria-hidden="true"><path d="M1.5 1.5 6 6.5 10.5 1.5"/></svg>', dd);
    face.type = 'button';
    face.setAttribute('aria-label', tr('s3A11yDropdown'));
    var menu = h('span', 'dd__menu', null, dd);
    menu.setAttribute('role', 'listbox');
    menu.hidden = true;
    var items = opts.map(function (t) {
      var b = h('button', 'dd__opt', t, menu);
      b.type = 'button';
      b.setAttribute('role', 'option');
      return b;
    });
    if (!o.keepOrder) shuffled(items.length).forEach(function (i) { menu.appendChild(items[i]); });
    var tick = svgEl('svg', { 'class': 'dd__tick', viewBox: '0 0 24 24', 'aria-hidden': 'true' }, dd);
    svgEl('circle', { cx: 12, cy: 12, r: 10.5 }, tick);
    svgEl('path', { d: 'M7 12.5 10.5 16 17 8.5' }, tick);
    var val = face.querySelector('.dd__val');
    var good = items[right];

    /* The row the blank sits in is lifted over its neighbours while the
       menu is open. The rows of a worked example that are still to come
       are invisible but on the page -- each its own layer -- and without
       this the next one down lies over the menu and takes its taps. */
    var row = dd.closest('.step, .sa-eq, .sa-line, .sa-dstep, .sa-work__r');
    function open(on) {
      dd.classList.toggle('is-open', on);
      if (row) row.classList.toggle('has-open', on);
      menu.hidden = !on;
      if (on) {
        quiet(anim(M.fromTo(menu, { opacity: 0, y: o.up ? 6 : -6 },
          { opacity: 1, y: 0, duration: M.dur(0.22), ease: 'power2.out' })));
      }
    }
    function win() {
      open(false);
      dd.classList.remove('is-asking', 'is-wrong');
      val.innerHTML = good.innerHTML;
      dd.classList.add('is-right');
      face.disabled = true;
      Beats.sfx('correct');
      quiet(anim(M.correct(face)));
      return anim(M.fromTo(tick, { opacity: 0, scale: 0, transformOrigin: 'center center' },
        { opacity: 1, scale: 1, duration: M.dur(0.4), ease: M.POP }));
    }

    return {
      el: dd,
      /* Ask, and wait for the right answer. */
      ask: function (q) {
        q = q || {};
        dd.classList.add('is-asking');
        function loop() {
          var live = [face].concat(items.filter(function (i) { return !i.__out; }));
          return waitPick(live, good).then(function (b) {
            if (b === face) { open(menu.hidden); return loop(); }
            if (b === good) {
              return win().then(function () {
                burstAt(face);
                if (q.yes !== false) return sayAll(q.yes || praise(), 'happy');
              });
            }
            open(false);
            b.__out = true;
            b.classList.add('is-out');
            val.innerHTML = b.innerHTML;
            dd.classList.add('is-wrong');
            Beats.sfx('wrong');
            quiet(anim(M.incorrect(face)).then(function () {
              if (dd.classList.contains('is-right')) return;
              return wait(350).then(function () {
                if (dd.classList.contains('is-right')) return;
                dd.classList.remove('is-wrong');
                val.innerHTML = '';
              });
            }));
            var why = q.why && q.why[items.indexOf(b)];
            quiet(sayAll(why || q.no || oops(), 'confused'));
            return loop();
          });
        }
        return loop();
      }
    };
  }

  /* ---- steps, notes, rules --------------------------------------------------- */
  function stepRow(list, n, body) {
    return h('div', 'step', '<span class="step__badge">' + n + '</span><span class="step__body">' +
             body + '</span>', list);
  }
  function stepIn(s) {
    return anim(M.fromTo(s, { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: M.dur(0.45), ease: 'power2.out' }));
  }
  function stepDone(s) { s.classList.add('is-done'); }
  function ddIn(s) { return s.querySelector('[data-dd]'); }

  function noteCard(host, html, cls) {
    var n = h('div', 'sa-note' + (cls ? ' ' + cls : ''), html, host);
    /* Popped only when the scene asks for it, so a card can be laid out
       ahead of the beat it belongs to. */
    return { el: n, get shown() { return anim(cardIn(n)); } };
  }
  function ruleCard(host, tag, eq, cls) {
    var r = h('div', 'sa-rule' + (cls ? ' ' + cls : ''),
      (tag ? '<span class="sa-rule__tag">' + tag + '</span>' : '') +
      '<span class="sa-rule__eq">' + eq + '</span>', host);
    return { el: r, get shown() { return anim(cardIn(r)); } };
  }
  function lineIn(host, html, cls) {
    var l = h('p', 'sa-line' + (cls ? ' ' + cls : ''), html, host);
    M.set(l, { opacity: 0 });
    return l;
  }

  /* ---- the stage -------------------------------------------------------------
     Each scene builds its picture into a fresh container, after the last
     one's has faded away. */
  function clearStage() {
    parkFigure();
    var kids = Array.prototype.slice.call(dom.stage.children).filter(function (k) { return k !== parked; });
    var jobs = [clearChoices()];
    if (kids.length) {
      jobs.push(anim(M.to(kids, { opacity: 0, y: -6, duration: M.dur(0.32), ease: 'power2.in' }))
        .then(function () { kids.forEach(function (k) { if (k.parentNode) k.parentNode.removeChild(k); }); }));
    }
    return Promise.all(jobs);
  }
  function stage(kind) {
    held = null;
    return perchOut().then(clearStage).then(function () {
      /* the screen gets one turn to claim a parked figure; after that it goes */
      setTimeout(dropParked, 0);
      return h('div', 'sa-scene sa-scene--' + kind, null, dom.stage);
    });
  }

  /* ======================================================================
   * Common figures
   * ====================================================================== */

  /* A sector drawn with its radius and angle written on it: the figure of
     every practice question. `spec`: theta, at (the start angle), r (the
     words for the radius), major (shade the major sector instead). */
  function sectorFigure(host, spec) {
    var F = figure(host, '34 34 352 352');
    var C = circle(F.svg, 210, 210, 150);
    var a0 = spec.at == null ? 90 - spec.theta / 2 : spec.at, a1 = a0 + spec.theta;
    var S = sector(C, a0, a1, 'minor');
    var T = sector(C, a1, a0 + 360, 'major', { radii: false });
    var A = angleMark(C, a0, a1, spec.label || (spec.theta + '°'), { r: spec.theta > 100 ? 26 : 34 });
    /* The radius named where it is, as a textbook names it: along the
       second radius, centred on it, just off the line on the side away
       from the sector, and turned to run with the line -- never upside
       down. */
    var rot = -a1;
    while (rot <= -90) rot += 180;
    while (rot > 90) rot -= 180;
    /* The turn is on a group of its own, so the label's own fade -- a
       transform the motion library writes -- can never undo it. */
    var Rg = svgEl('g', {}, C.top);
    var R = text(Rg, 0, 0, spec.r, 'lbl lbl--radius lbl--along');
    /* Kept wholly inside the circle: measured as it actually sets, then
       slid along the radius so it clears both the rim and the centre, and
       made a little smaller if even that is not room enough. */
    function placeR() {
      var len = 0;
      try { len = R.getComputedTextLength(); } catch (e) {}
      var room = C.r - 34;
      if (len > room) {
        var fs = Math.max(13, 19 * room / len);
        R.style.fontSize = fs + 'px';
        len = len * fs / 19;
      }
      var rc = Math.max(22 + len / 2, C.r - 14 - len / 2);
      var m = pt(C, rc, a1), off = pt({ x: 0, y: 0 }, 17, a1 + 90);
      var x = m.x + off.x, y = m.y + off.y;
      R.setAttribute('x', r2(x));
      R.setAttribute('y', r2(y));
      Rg.setAttribute('transform', 'rotate(' + r2(rot) + ' ' + r2(x) + ' ' + r2(y) + ')');
    }
    placeR();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeR);
    var majorA = spec.major ? angleMark(C, a1, a0 + 360, spec.majorLabel || '?', { r: 46, major: true, cls: 'lbl--major', gap: 26 }) : null;
    return {
      F: F, C: C, S: S, T: T, A: A, R: R, majorA: majorA,
      draw: function (slow) {
        return drawCircle(C, slow ? PEN : 1.1)
          .then(function () { return radii(S, 0.6); })
          .then(function () {
            var jobs = [sweep(S, 0.9), arcIn(S, 0.9)];
            if (spec.major) jobs.push(wait(500).then(function () { return sweep(T, 1.2); }));
            return Promise.all(jobs);
          })
          .then(function () { return angleIn(A); })
          .then(function () { return majorA ? angleIn(majorA) : null; })
          .then(function () { placeR(); return anim(fadeIn(R, { y: 0 })); });
      }
    };
  }

  /* A tap-the-answer practice page: the figure on the left, the given and
     the formula on the right; the right answer brings the working. */
  /* The question asked from a perch, as the "Tap the area" page asks it:
     the bird in the panel, the question in a warm bubble above it. Every
     answer is said in that bubble -- red for a wrong one, and then the
     question again; green for the right one. Returns the voice to hand to
     askChoice. */
  function bubbleVoice(P, question) {
    var asked = 0;
    function tone(t) {
      P.bubble.classList.toggle('is-no', t === 'no');
      P.bubble.classList.toggle('is-yes', t === 'yes');
    }
    var voice = function (lines, mood) {
      var mine = ++asked;
      if (mood === 'happy') {
        tone('yes');
        return sayAll(lines, mood);
      }
      tone('no');
      return sayAll(lines, mood)
        .then(function () { return wait(1500); })
        .then(function () {
          if (mine !== asked || !perch) return;
          tone(null);
          return say(question);
        });
    };
    voice.stop = function () { asked++; };
    return voice;
  }

  /* A solution written a piece at a time, as on the radar and fan screens:
     one step a line with the equals signs in a column, each line's terms
     arriving one after another, and any number taken off the figure making
     its label there pulse as it is written. `steps` is a list of
     [left side, [[term, figure label to pulse?], ...]]. Resolves to the
     last line, which is the answer. */
  async function writeSteps(host, steps) {
    var work = h('div', 'sa-work', null, host);
    function pulse(el) {
      quiet(anim(M.fromTo(el, { scale: 1, transformOrigin: '50% 50%' },
        { scale: 1.35, duration: M.dur(0.25), ease: 'power2.out', yoyo: true, repeat: 1 })));
    }
    var last = null;
    for (var i = 0; i < steps.length; i++) {
      if (steps[i][2]) await say(steps[i][2]);
      var row = h('div', 'sa-work__row', null, work);
      var l = h('span', 'sa-work__l', steps[i][0], row);
      var eq = h('span', 'sa-work__eq', '=', row);
      var r = h('span', 'sa-work__r', null, row);
      var bits = steps[i][1].map(function (pc) {
        var sp = h('span', 'sa-work__bit', pc[0], r);
        M.set(sp, { opacity: 0 });
        return { el: sp, from: pc[1] };
      });
      M.set([l, eq], { opacity: 0 });
      await anim(M.fromTo([l, eq], { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: M.dur(0.3), ease: 'power2.out' }));
      for (var j = 0; j < bits.length; j++) {
        if (bits[j].from) pulse(bits[j].from);
        await anim(M.fromTo(bits[j].el, { opacity: 0, y: 8, scale: 0.85 },
          { opacity: 1, y: 0, scale: 1, duration: M.dur(0.32), ease: 'back.out(1.6)' }));
        await wait(260);
      }
      last = row;
      await wait(500);
    }
    last.classList.add('is-answer');
    Beats.sfx('correct');
    burstAt(last);
    return last;
  }

  function practice(spec) {
    return stage('split').then(async function (sc) {
      var fig = sectorFigure(sc, spec);
      var panel = h('div', 'sa-panel sa-panel--practice', null, sc);
      var P = perchIn(panel);
      P.row.classList.add('sa-speak--above');
      P.bubble.classList.add('sa-bubble--sun');
      var slot = h('div', 'sa-qslot', null, panel);
      sc.classList.add('sa-scene--practice');
      var given = ruleCard(sc, spec.tag || tr('s3TagRemember'), spec.rule ||
        ('A ' + EQ + fr('θ', '360', 'c-ang') + X + PIR2), 'sa-rule--small');
      M.set(given.el, { opacity: 0 });

      await leaveHeader();
      await fig.draw();
      /* What the problem gives is set across the top of the board, on its
         own, and stays there; the bird then asks the question itself. */
      if (spec.given) {
        dom.board.classList.add('has-given');
        await sayTop(spec.given);
      }
      await anim(fadeIn(P.row, { y: 0 }));
      await perchSay(P, spec.prompt);
      var voice = bubbleVoice(P, spec.prompt);
      /* The answers one at a time, and the formula to remember after them. */
      await askChoice(spec.options, spec.right, {
        host: slot, tiles: true, voice: voice,
        onWrong: spec.onWrong ? function (i) { spec.onWrong(i, fig); } : null, stagger: 0.35,
        onShown: function () { quiet(anim(cardIn(given.el))); },
        yes: keyed('fbThatsCorrect'), why: spec.why
      });
      await wait(900);

      /* Answered: the question goes, and the working takes its place. */
      voice.stop();
      var gone = Array.prototype.slice.call(panel.children);
      if (spec.steps) gone.push(given.el);
      await Promise.all([anim(fadeOut(gone)), perchOut()]);
      gone.forEach(function (g) { if (g.parentNode) g.parentNode.removeChild(g); });
      if (spec.lit) spec.lit(fig);
      if (spec.steps) {
        panel.className = 'sa-panel sa-panel--centre';
        if (spec.head) {
          var hd0 = h('div', 'sa-wk__head', spec.head, panel);
          await anim(cardIn(hd0));
          await wait(SHORT);
        }
        await writeSteps(panel, spec.steps(fig));
        await wait(600);
        if (spec.found) {
          if (spec.given) {
            await anim(Beats.lineOut(dom.promptLine));
            clearPrompt();
            dom.board.classList.remove('has-given');
          }
          var fp = spec.found.at(fig);
          var fl = text(fig.C.top, fp.x, fp.y, spec.found.label, 'lbl lbl--area s-found-lbl');
          if (spec.found.region) spec.found.region(fig).classList.add('is-focus');
          await Promise.all([say(spec.found.say, 'happy'), anim(popIn(fl, { from: 0.4 }))]);
        }
      } else {
        await noteCard(panel, spec.note).shown;
      }
      await wait(BEAT);
    });
  }


  /* ======================================================================
   * The scenes -- one per stretch of the storyboard
   * ====================================================================== */

  /* ---- 0. Intro ------------------------------------------------------------
     The skill before this one is cleared away, the board goes, and the bird
     -- on its mark out on the field, as on the lesson's welcome -- says
     hello to this skill in its bubble (the lesson's own welcome screen is
     skill 1's, shown once). The board comes back in with the next scene. */
  async function sWelcome() {
    await K.wipeBoard();
    lessonOn();
    mascot.el.hidden = false;
    mascot.placeIn(dom.slotHero);
    mascot.el.classList.remove('is-away');
    mascot.idle();
    if (dom.board.classList.contains('show')) await anim(Beats.boardOut(dom.board));
    /* A header an earlier skill closed is opened again while the board is
       out of sight: this skill's bird always stands on an open one. */
    await Promise.all([anim(K.collapseHeader(false)),
                       anim(K.collapseHeader(false, 'is-bare'))]);
    return wait(SHORT)
      .then(function () {
        mascot.state('talking');
        Beats.bubbleArm(dom.bubble);
        var said = bubbleSay(keyed('s3IntroHey'));
        Beats.bubbleIn(dom.bubble);
        return said;
      })
      .then(function () { return wait(BEAT); })
      .then(function () { return bubbleSay(keyed('s3IntroToday')); })
      .then(function () { return wait(BEAT); })
      .then(function () { return bubbleSay(keyed('s3IntroWarmup')); })
      .then(function () { mascot.settle(); return wait(SHORT); })
      .then(handOver);
  }

  /* ---- 1. Which one is a sector? -----------------------------------------
     The board opens on three empty cards, and nothing is said. Each card
     draws one part of a circle, slowly, and lights it: a segment (cut by a
     chord), a sector (cut by two radii), an arc (cut by two points). Only
     then does the bird ask which card shows a sector -- so the learner meets
     the word beside the two things it is not. */
  var SLOW_PEN = 1.6;          /* s: each card's circle, in slow motion       */
  var clipN = 0;

  /* A region coloured in from a point outward -- the chord's middle, for a
     segment -- through a clip circle that grows until it covers it. */
  function growFrom(svg, region, x, y, seconds) {
    var defs = svg.querySelector('defs') || svgEl('defs', {}, svg);
    var id = 'saGrow' + (++clipN);
    var clip = svgEl('clipPath', { id: id }, defs);
    var c = svgEl('circle', { cx: r2(x), cy: r2(y), r: 0 }, clip);
    region.setAttribute('clip-path', 'url(#' + id + ')');
    M.set(region, { opacity: 1 });
    Beats.pop();
    return anim(M.to(c, { attr: { r: 340 }, duration: M.dur(seconds || 1.1), ease: 'power2.inOut' }));
  }

  /* The piece a card is about, lit; the other piece of the same circle
     stepped well back, so the lit one is what the eye lands on.
       Stepped back WITH its edge: the circle's outline is cut into the two
     arcs that bound the two pieces, and the arc along the dimmed piece
     dims with it. `lit` and `dim` are those two arcs as [from, to] angles.
     Edges the two pieces share -- a chord, the radii -- stay full, since
     they bound the lit piece too. */
  function spotlight(C, on, off, lit, dim) {
    var a = svgEl('path', { 'class': 'figure__rim', d: arcD(C, C.r, lit[0], lit[1]) });
    var b = svgEl('path', { 'class': 'figure__rim', d: arcD(C, C.r, dim[0], dim[1]) });
    C.g.insertBefore(a, C.rim.nextSibling);
    C.g.insertBefore(b, a);
    M.set([a, b], { opacity: 1 });
    M.set(C.rim, { opacity: 0 });
    on.classList.add('is-focus');
    off.classList.add('is-dim');
    b.classList.add('is-dim');
    C.dimRim = b;
    return wait(500);
  }

  function cardFigure(card) {
    return svgEl('svg', { 'class': 'sa-card__fig', viewBox: '48 48 324 324',
                          preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true' }, card);
  }

  async function sPickSector() {
    await anim(Beats.bubbleOut(dom.bubble));
    sayBubble.clear();
    await anim(Beats.boardIn(dom.board));
    await wait(SHORT);
    var sc = await stage('cards');
    var cards = ['segment', 'sector', 'arc'].map(function (k) {
      var b = h('button', 'sa-card sa-card--' + k, null, sc);
      b.type = 'button';
      b.setAttribute('aria-label', tr('s3A11yCard'));
      return b;
    });
    await anim(M.fromTo(cards, { opacity: 0, y: 16, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: M.dur(0.5), ease: 'power3.out', stagger: M.gap(0.12) }));

    /* 1. The segment: a filled circle, a chord, the two regions it makes,
          and the MAJOR segment lit. */
    var f1 = cardFigure(cards[0]);
    var C1 = circle(f1, 210, 210, 150);
    var ca = 205, cb = 335;                         /* the chord's two ends */
    var pa = pt(C1, 150, ca), pb = pt(C1, 150, cb);
    var segMinor = svgEl('path', { 'class': 's-seg s-seg--minor',
      d: 'M' + r2(pa.x) + ' ' + r2(pa.y) + ' A150 150 0 0 0 ' + r2(pb.x) + ' ' + r2(pb.y) + ' Z' }, C1.under);
    var segMajor = svgEl('path', { 'class': 's-seg s-seg--major',
      d: 'M' + r2(pb.x) + ' ' + r2(pb.y) + ' A150 150 0 1 0 ' + r2(pa.x) + ' ' + r2(pa.y) + ' Z' }, C1.under);
    var chord = svgEl('path', { 'class': 'chord-line s-chord', d: segD(pa, pb) }, C1.over);
    var chordDots = [pa, pb].map(function (p) {
      return svgEl('circle', { 'class': 's-dot', cx: r2(p.x), cy: r2(p.y), r: 5.5 }, C1.top);
    });
    var mid = { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 };

    await anim(Beats.drawRim(C1.rim, C1.tip, { time: SLOW_PEN }));
    await anim(Beats.fillDisc(C1.disc));
    await wait(SHORT);
    await anim(popIn(chordDots, { stagger: 0.18 }));
    await anim(Beats.growLine(chord, 0.8, 'power2.inOut'));
    await wait(SHORT);
    await growFrom(f1, segMinor, mid.x, mid.y, 0.6);
    await growFrom(f1, segMajor, mid.x, mid.y, 0.9);
    await wait(SHORT);
    await spotlight(C1, segMinor, segMajor, [ca, cb], [cb, ca + 360]);
    await wait(1000);

    /* 2. The sector: a filled circle, two radii, the two regions they make,
          and the MINOR sector lit. */
    var f2 = cardFigure(cards[1]);
    var C2 = circle(f2, 210, 210, 150);
    var S = sector(C2, 55, 145, 'minor');
    var T = sector(C2, 145, 415, 'major', { radii: false });
    var ends = [pt(C2, 150, 55), pt(C2, 150, 145)].map(function (p) {
      return svgEl('circle', { 'class': 's-dot', cx: r2(p.x), cy: r2(p.y), r: 5.5 }, C2.top);
    });

    await anim(Beats.drawRim(C2.rim, C2.tip, { time: SLOW_PEN }));
    await anim(Beats.fillDisc(C2.disc));
    await anim(Beats.plotDot(C2.dot, 0.35));
    await wait(SHORT);
    await radii(S, 0.75);
    await anim(popIn(ends, { stagger: 0.15 }));
    await wait(SHORT);
    await sweep(S, 0.7);
    await sweep(T, 1.0);
    await wait(SHORT);
    await spotlight(C2, S.region, T.region, [55, 145], [145, 415]);
    await wait(1000);

    /* 3. The arc: a plain white circle, two points on it, the two arcs
          between them, and the MINOR arc lit. */
    var f3 = cardFigure(cards[2]);
    var C3 = circle(f3, 210, 210, 150);
    C3.disc.setAttribute('class', 'figure__disc s-disc--white');
    var aa = 30, ab = 120;
    var minorArc = svgEl('path', { 'class': 's-arcpiece s-arcpiece--minor', d: arcD(C3, 150, aa, ab) }, C3.over);
    var majorArc = svgEl('path', { 'class': 's-arcpiece s-arcpiece--major', d: arcD(C3, 150, ab, aa + 360) }, C3.over);
    var arcDots = [pt(C3, 150, aa), pt(C3, 150, ab)].map(function (p) {
      return svgEl('circle', { 'class': 's-dot', cx: r2(p.x), cy: r2(p.y), r: 6 }, C3.top);
    });

    await anim(Beats.drawRim(C3.rim, C3.tip, { time: SLOW_PEN }));
    await wait(SHORT);
    await anim(popIn(arcDots, { stagger: 0.2 }));
    await wait(SHORT);
    await anim(Beats.growLine(minorArc, 0.6, 'power2.inOut'));
    await anim(Beats.growLine(majorArc, 1.1, 'power2.inOut'));
    await wait(SHORT);
    await spotlight(C3, minorArc, majorArc, [aa, ab], [ab, aa + 360]);
    await wait(800);

    /* A look at all three before the question: each card is picked out
       in turn. */
    var lit = [segMinor, S.region, minorArc];
    for (var q = 0; q < cards.length; q++) {
      cards[q].classList.add('is-look');
      lit[q].classList.add('is-flash2');
      await wait(900);
      cards[q].classList.remove('is-look');
    }
    await wait(1700);
    lit.forEach(function (e) { e.classList.remove('is-flash2'); });
    await wait(SHORT);

    /* What makes each card what it is, pulsed as its name is said: the
       chord of the segment, the two radii and the arc of the sector, the
       boundary piece of the arc. */
    function beat(els) {
      return Promise.all(els.map(function (el) {
        return anim(M.fromTo(el, { scale: 1, transformOrigin: '50% 50%' },
          { scale: 1.12, duration: M.dur(0.3), ease: 'power2.out', yoyo: true, repeat: 3 }));
      }));
    }
    function sweepGlow(els) { els.forEach(function (e) { e.classList.add('is-defining'); }); }
    var DEFS = [
      { els: [chord], name: 'segment' },
      { els: [S.ra, S.rb, S.arc], name: 'sector' },
      { els: [minorArc], name: 'arc' }
    ];

    /* The question, with the bird. A wrong card shakes and steps back, and
       the bird says what that card shows instead; the right one goes green. */
    await say(keyed('s3PickAsk'));
    sc.classList.add('is-live');
    /* pressed as the first lesson's pills are: the wall collapses under
       the finger */
    cards.forEach(function (c) { M.button3d(c, { edge: 5 }); });
    var right = cards[1];
    for (;;) {
      var picked = await waitPick(cards.filter(function (c) { return !c.__out; }), right);
      if (picked === right) break;
      picked.__out = true;
      picked.classList.add('is-wrong');
      Beats.sfx('wrong');
      (function (c) {
        quiet(anim(M.incorrect(c)).then(function () {
          c.classList.remove('is-wrong');
          c.classList.add('is-tried');
        }));
      })(picked);
      var dw = DEFS[cards.indexOf(picked)];
      sweepGlow(dw.els);
      quiet(beat(dw.els));
      quiet(sayAll(picked === cards[0]
        ? [keyed('fbNotQuite'), keyed('s3PickWrongSeg')]
        : [keyed('fbNotQuite'), keyed('s3PickWrongArc')], 'confused'));
    }
    sc.classList.remove('is-live');
    right.classList.add('is-right');
    cards.forEach(function (c) { if (c !== right) c.classList.add('is-done'); });
    Beats.sfx('correct');
    quiet(anim(M.correct(right)));
    burstAt(right);
    sweepGlow(DEFS[1].els);
    quiet(beat(DEFS[1].els));
    await sayAll([keyed('fbThatsCorrect'),
                  keyed('s3PickRight')], 'happy');
    await wait(SHORT);
    /* All three named, each card glowing as it is: the recall rounded off. */
    cards.forEach(function (c) { c.classList.remove('is-done', 'is-tried'); c.classList.add('is-named'); });
    sweepGlow(DEFS[0].els.concat(DEFS[2].els));
    await say(keyed('s3PickRecap'), 'happy');
    cards.forEach(function (c) { c.classList.remove('is-named'); });
    DEFS.forEach(function (d) { d.els.forEach(function (e) { e.classList.remove('is-defining'); }); });
    /* No Next: the sector circle itself carries on into the next scene,
       three seconds after this one has finished speaking. */
    carry = { svg: f2, C: C2, S: S, T: T };
    await wait(3000);
  }

  /* ---- 2. Name the two sectors ----------------------------------------------
     The sector card's own circle -- the very element, not a copy -- lifted
     out of its card and carried to the middle of the board as everything
     else fades, growing as it goes; the major sector comes back up to full
     on the way. Two dotted arrows reach out from its two regions to two
     blank boxes, two name cards come in under it, and the learner drags
     each name to its box. */
  var carry = null;            /* the figure the cards scene hands on */
  var maskN = 0;

  /* The line that ties a box to the region it names: the first lesson's
     own leader (buildBox in pages.js, .q-leader in style.css) -- a dashed
     line that runs level out of the box's side for a short stub, turns
     once, and runs straight to its spot on the region, with no head. It
     is drawn as boxIn draws it there: a solid copy in a mask is grown
     along it and the dashes show through behind it. In the scene's own
     pixels, at the first lesson's weight and dash scaled by `unit` (what
     one of its picture units measures on this board, see nameBox). */
  function boxLeader(ink, box, to) {
    var R = ink.getBoundingClientRect();
    var b = box.rect.getBoundingClientRect();
    var u = box.unit;
    var left = (b.left + b.width / 2) < (R.left + R.width / 2);
    var edge = { x: (left ? b.right : b.left) - R.left, y: b.top + b.height / 2 - R.top };
    var turn = { x: edge.x + (left ? 1 : -1) * K.LEAD_STUB * u, y: edge.y };
    var d = 'M' + r2(edge.x) + ' ' + r2(edge.y) + ' L' + r2(turn.x) + ' ' + r2(turn.y) +
            ' L' + r2(to.x) + ' ' + r2(to.y);
    var defs = ink.querySelector('defs') || svgEl('defs', {}, ink);
    var id = 'saLead' + (++maskN);
    var mask = svgEl('mask', { id: id, maskUnits: 'userSpaceOnUse', x: 0, y: 0,
                               width: r2(R.width), height: r2(R.height) }, defs);
    var pen = svgEl('path', { 'class': 'q-leader-mask', d: d }, mask);
    pen.style.strokeWidth = r2(8 * u) + 'px';
    var line = svgEl('path', { 'class': 'q-leader is-shown', d: d, mask: 'url(#' + id + ')' }, ink);
    line.style.strokeWidth = r2(2 * u) + 'px';
    line.style.strokeDasharray = r2(4 * u) + ' ' + r2(7 * u);
    /* armQuiz lifts a box's leader with it (is-over); this is that line */
    box.leader = line;
    M.set(pen, { opacity: 0 });
    return {
      draw: function () {
        M.set(pen, { opacity: 1 });
        return anim(Beats.growLine(pen, 0.52, 'power1.inOut'));
      }
    };
  }

  /* Where a point of a figure's own picture is, in the scene's pixels. */
  function figToScene(svg, scene, p) {
    var q = svg.createSVGPoint();
    q.x = p.x; q.y = p.y;
    var sp = q.matrixTransform(svg.getScreenCTM());
    var r = scene.getBoundingClientRect();
    return { x: sp.x - r.left, y: sp.y - r.top };
  }

  /* The two boxes, of the first lesson's own make -- see buildBox in
     pages.js: a dashed pill, the tick that lands in it, the word set
     inside -- drawn as SVG so the one stylesheet (.q-box, style.css)
     dresses both lessons' boxes alike, and sized in pixels to what a box
     of that lesson measures on this board, so the two read as one object
     at two moments. The dotted arrow is the box's tie to its region, so
     the leader the first lesson's box carries is an empty group here. */
  var QB_PAD = 8;              /* picture units of air round the pill, for its pulse */
  var WRONG_HOLD = 1800;       /* ms: a wrong-drop line read before the ask returns  */
  function nameBox(host, name, cls) {
    var W = K.BOX_W, H = K.BOX_H, cy = H / 2;
    var svg = svgEl('svg', { 'class': 'sa-drop ' + cls,
      viewBox: (-QB_PAD) + ' ' + (-QB_PAD) + ' ' + (W + 2 * QB_PAD) + ' ' + (H + 2 * QB_PAD) }, host);
    /* the unit the first lesson's figure is drawn at, on this board */
    var st = dom.board.querySelector('.board__stage').getBoundingClientRect();
    var unit = Math.min(st.width / K.VB_W, st.height / K.VB_H) || 1;
    svg.style.width = r2(unit * (W + 2 * QB_PAD)) + 'px';
    svg.style.height = r2(unit * (H + 2 * QB_PAD)) + 'px';
    var leader = svgEl('g', {}, svg);
    var g = svgEl('g', { 'class': 'q-box', 'data-name': name, tabindex: 0, role: 'button' }, svg);
    var rect = svgEl('rect', { 'class': 'q-box__rect', x: 0, y: 0, width: W, height: H, rx: cy }, g);
    var badge = svgEl('g', { 'class': 'q-badge' }, g);
    svgEl('circle', { 'class': 'q-badge__ring', cx: 24, cy: cy, r: 10 }, badge);
    svgEl('path', { 'class': 'q-badge__tick',
      d: 'M18.5 ' + cy + ' L22.5 ' + (cy + 4) + ' L29.5 ' + (cy - 4) }, badge);
    var txt = svgEl('text', { 'class': 'figure-label q-box__text', x: W / 2 + 9, y: cy + 7.5,
      'text-anchor': 'middle' }, g);
    var box = { name: name, g: g, rect: rect, badge: badge, text: txt, leader: leader,
                mask: null, filled: false, el: svg, unit: unit };
    K.emptyBox(box);
    g.classList.add('is-shown');
    return box;
  }

  async function sNameSectors() {
    var MINOR = 's3LblMinorSector', MAJOR = 's3LblMajorSector';
    var old = Array.prototype.slice.call(dom.stage.children);
    var sc = h('div', 'sa-scene sa-scene--name', null, dom.stage);
    var boxL = nameBox(sc, MINOR, 'sa-drop--l');
    var cell = h('div', 'sa-name__fig', null, sc);
    var boxR = nameBox(sc, MAJOR, 'sa-drop--r');
    var ink = svgEl('svg', { 'class': 'sa-name__ink', 'aria-hidden': 'true' }, sc);
    M.set([boxL.el, boxR.el], { opacity: 0 });
    var flip = h('div', 'sa-flip', null, cell);

    var fig, C, S, T;
    if (carry && carry.svg.isConnected) {
      /* The handover: measured where it stands in its card, moved into the
         middle of the board, and put back -- by a transform -- exactly
         where it was, then let go to its new place. */
      fig = carry.svg; C = carry.C; S = carry.S; T = carry.T;
      var r0 = fig.getBoundingClientRect();
      flip.appendChild(fig);
      fig.setAttribute('class', 'sa-fig sa-fig--moved');
      var r1 = fig.getBoundingClientRect();
      var k = Math.min(r0.width, r0.height) / Math.min(r1.width, r1.height);
      M.set(flip, { x: (r0.left + r0.width / 2) - (r1.left + r1.width / 2),
                    y: (r0.top + r0.height / 2) - (r1.top + r1.height / 2),
                    scale: k, transformOrigin: '50% 50%' });
      /* The major sector, and its edge, come back up to full on the way. */
      [T.region, C.dimRim].forEach(function (el) {
        if (!el) return;
        el.style.transition = 'opacity .9s ease';
        el.classList.remove('is-dim');
      });
      S.region.classList.remove('is-focus');
      await Promise.all([
        anim(M.to(flip, { x: 0, y: 0, scale: 1, duration: M.dur(1.2), ease: 'power3.inOut' })),
        anim(M.to(old, { opacity: 0, duration: M.dur(0.5), ease: 'power2.in' })),
        leaveHeader()
      ]);
    } else {
      /* Reached straight from the level bar: the same figure, drawn whole. */
      fig = svgEl('svg', { 'class': 'sa-fig sa-fig--moved', viewBox: '48 48 324 324',
                           preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true' }, flip);
      C = circle(fig, 210, 210, 150);
      S = sector(C, 55, 145, 'minor');
      T = sector(C, 145, 415, 'major', { radii: false });
      var ends = [pt(C, 150, 55), pt(C, 150, 145)].map(function (p) {
        return svgEl('circle', { 'class': 's-dot', cx: r2(p.x), cy: r2(p.y), r: 5.5 }, C.top);
      });
      show([C.rim, C.disc, C.dot, S.region, S.ra, S.rb, T.region].concat(ends));
      await Promise.all([old.length ? anim(M.to(old, { opacity: 0, duration: M.dur(0.4) })) : null,
                         anim(popIn(flip, { from: 0.85 })), leaveHeader()]);
    }
    old.forEach(function (o) { if (o.parentNode) o.parentNode.removeChild(o); });
    carry = null;
    await wait(SHORT);

    /* The leaders, in the scene's own pixels, from each box to its region;
       each box lands at the end of its line as it is drawn, as the first
       lesson's boxIn has it. */
    var R = sc.getBoundingClientRect();
    ink.setAttribute('viewBox', '0 0 ' + r2(R.width) + ' ' + r2(R.height));
    var aL = boxLeader(ink, boxL, figToScene(fig, sc, pt(C, 92, 118)));
    var aR = boxLeader(ink, boxR, figToScene(fig, sc, pt(C, 92, 300)));
    await aL.draw();
    await anim(popIn(boxL.el, { from: 0.72 }));
    await wait(320);
    await aR.draw();
    await anim(popIn(boxR.el, { from: 0.72 }));
    await wait(SHORT);

    /* The two names, in the band under the board, as the first lesson's
       are (buildChips, pages.js): the same pills, in a random order, so
       the left name is not always the left box's. */
    var chips = K.buildChips(dom.tray, Math.random() < 0.5 ? [MINOR, MAJOR] : [MAJOR, MINOR]);
    K.chips(chips);
    await anim(Beats.trayIn(dom.tray, chips));
    /* The names are live from the moment they arrive: a learner who starts
       dragging while the bird is still asking is not ignored. */
    var ASK = keyed('s3NameAsk');
    var said = say(ASK);

    /* The region a box is for lights up while a name is held over it; a
       name put right flashes its region and shows its central angle --
       the size the name is about, as a number. */
    var REG = {};
    REG[MINOR] = S.region; REG[MAJOR] = T.region;
    var a0 = S.a0, a1 = S.a1;
    var angMinor = angleMark(C, a0, a1, (a1 - a0) + '°', { r: 32 });
    var angMajor = angleMark(C, a1, a0 + 360, (360 - (a1 - a0)) + '°', { r: 46, major: true, cls: 'lbl--major', gap: 26 });
    M.set([angMinor.arc, angMinor.lbl, angMajor.arc, angMajor.lbl], { opacity: 0 });
    var ANG = {};
    ANG[MINOR] = angMinor; ANG[MAJOR] = angMajor;
    function confirm(name) {
      var r = REG[name];
      r.classList.remove('is-lit');
      r.classList.add('is-flash2');
      quiet(angleIn(ANG[name]));
      quiet(wait(2700).then(function () { r.classList.remove('is-flash2'); }));
    }

    /* Answered as the first lesson's naming page is answered (sceneQuiz,
       pages.js): the bird stays on the header; a right drop says nothing
       -- the green box and its tick are the answer; a wrong drop is
       answered on the spot in one line, the name goes home, and the
       instruction comes back up after it. The drag, the tap-then-tap and
       the keyboard are armQuiz's, the box and chip beats are Beats'. */
    var WRONG = {};
    WRONG[MINOR] = 's3NameWrongMinor'; WRONG[MAJOR] = 's3NameWrongMajor';
    var fb = { n: 0, up: false };
    var placed = 0;
    function sayWrong(box) {
      var mine = ++fb.n;
      fb.up = true;
      return say(keyed(WRONG[box.name]), 'confused')
        .then(function () { return wait(WRONG_HOLD); })
        .then(function () {
          if (mine !== fb.n) return;
          fb.up = false;
          return say(ASK);
        });
    }
    var done = K.armQuiz({ boxes: [boxL, boxR] }, chips, {
      group: sc,
      onHover: function (box) {
        S.region.classList.toggle('is-lit', !!box && box.name === MINOR);
        T.region.classList.toggle('is-lit', !!box && box.name === MAJOR);
      },
      onRight: function (box) {
        placed++;
        confirm(box.name);
        /* A wrong-drop line still up is answered by the right drop: the
           instruction goes back up, unless that was the last name. */
        if (fb.up) {
          fb.n++;
          fb.up = false;
          if (placed < 2) quiet(say(ASK));
        }
      },
      onWrong: function (box) { quiet(sayWrong(box)); }
    });
    await quiet(said);
    await done;
    fb.n++;                       /* no instruction after this */
    S.region.classList.remove('is-lit');
    T.region.classList.remove('is-lit');
    show([angMinor.arc, angMinor.lbl, angMajor.arc, angMajor.lbl]);
    await wait(700);
    /* the names are spent: the band under the board is emptied */
    K.resetFooter();

    /* Both names in: the finished picture -- circle, boxes and arrows as
       one piece -- grows to fill the board, centred. One uniform zoom, so
       every arrow stays on its box. */
    var stR = dom.stage.getBoundingClientRect();
    var scR = sc.getBoundingClientRect();
    var parts = [fig, boxL.el, boxR.el].map(function (e) { return e.getBoundingClientRect(); });
    var box = {
      l: Math.min.apply(null, parts.map(function (r) { return r.left; })),
      t: Math.min.apply(null, parts.map(function (r) { return r.top; })),
      r: Math.max.apply(null, parts.map(function (r) { return r.right; })),
      b: Math.max.apply(null, parts.map(function (r) { return r.bottom; }))
    };
    var k = Math.min(stR.height * 0.94 / (box.b - box.t), stR.width * 0.94 / (box.r - box.l), 1.4);
    var cx = (box.l + box.r) / 2 - scR.left, cy = (box.t + box.b) / 2 - scR.top;
    var zoom = k > 1.02 ? anim(M.to(sc, {
      transformOrigin: '0 0', scale: k,
      x: (stR.left + stR.width / 2) - scR.left - k * cx,
      y: (stR.top + stR.height / 2) - scR.top - k * cy,
      duration: M.dur(0.9), ease: 'power3.inOut'
    })) : null;
    /* 5. Both at once: together, the two make the whole circle. */
    var both = [S.region, T.region];
    await Promise.all([zoom,
      sayAll([keyed('s3GreatJob'), keyed('s3NameTwoRadii')], 'happy')]);
    both.forEach(function (r) { r.classList.remove('is-flash2', 'is-lit'); r.classList.add('is-flash2'); });
    await say(keyed('s3NameWhole'), 'happy');
    await wait(BEAT);
    await handOver();
  }

  /* ---- 3. A word on the field ------------------------------------------------
     A breather between the recall and the new work. The bird leaves the
     header, the board shrinks away over the landscape, and the bird --
     standing on the field again, as it did before the lesson began -- says
     what has been done, with the word it was about picked out, and what
     comes next. Next brings the board back. */

  /* The word a bubble line is about, worn as a pill -- in the typed line
     and in the hidden layout copy under it alike, so the words land
     exactly where the copy reserved them. Run after reserve, before the
     reveal. */
  function keyWord(wrap, word) {
    ['.type-ghost', '.type .txt'].forEach(function (sel) {
      var words = wrap.querySelectorAll(sel + ' .wd');
      for (var i = 0; i < words.length; i++) {
        if (words[i].textContent.trim().replace(/[.,!?]+$/, '').toLowerCase() === word) {
          words[i].classList.add('wd--key');
          break;
        }
      }
    });
  }

  /* A word on the field: off the board, over the landscape, two lines in
     the bubble -- the first with its key word worn as a pill -- then Next,
     and the board grows back in for what comes next. */
  async function fieldTalk(first, key, second) {
    await perchOut();
    await leaveHeader();
    mascot.placeIn(dom.slotHero);
    mascot.el.classList.remove('is-away');
    mascot.idle();
    if (dom.board.classList.contains('show')) await anim(Beats.boardOut(dom.board));
    dom.stage.textContent = '';
    dom.choices.textContent = '';
    dom.choices.setAttribute('hidden', '');
    await wait(SHORT);

    mascot.state('talking');
    Beats.bubbleArm(dom.bubble);
    var line = lineOf(first);
    var reveal = sayBubble.reserve(line.text);
    if (key) keyWord(dom.bubble, key);
    Beats.bubbleIn(dom.bubble);
    var heard = quiet(voiceOf(line));
    await Promise.all([reveal(), heard]);
    mascot.settle();
    var rest = [].concat(second);
    for (var i = 0; i < rest.length; i++) {
      await wait(1400);
      mascot.state('talking');
      await bubbleSay(rest[i]);
      mascot.settle();
    }
    await wait(SHORT);
    await handOver();

    await anim(Beats.bubbleOut(dom.bubble));
    sayBubble.clear();
    await anim(Beats.boardIn(dom.board));
    /* The board has closed over the bird: it is away now, so the next
       page's leave-taking has nothing to spring off the field -- a bird
       springing up from under the board was seen behind it (user,
       2026-10-09) -- and its next jump in comes up from behind the board
       as ever. */
    mascot.el.classList.add('is-away');
    await wait(SHORT);
  }

  function sTermsIntro() {
    return fieldTalk(keyed('s3TermsRevised'), null,
                     keyed('s3TermsNowArea'));
  }

  function sMajorIntro() {
    return fieldTalk(keyed('s3MajorLearnt'), null,
                     [keyed('s3MajorHow'),
                      keyed('s3FindOut')]);
  }

  function sApplyIntro() {
    return fieldTalk(keyed('s3ApplyYay'), null,
                     keyed('s3ApplySolve'));
  }


  /* ---- 4. The central angle ------------------------------------------------
     The first of the terms. One circle in the middle of the board, drawn
     slowly; two radii; the two sectors they make, each in its colour; and
     the angle between the radii marked θ. The bird names it, and for three
     seconds the major sector -- region and edge -- steps back so the minor
     sector and its angle are all there is to look at; then the circle is
     whole again. */
  async function sCentralTerm() {
    var sc = await stage('solo');
    var F = figure(sc);
    var C = circle(F.svg, 210, 210, 150);
    var a0 = 60, a1 = 130;             /* θ = 70°: a general angle, not a right one */
    var S = sector(C, a0, a1, 'minor');
    var T = sector(C, a1, a0 + 360, 'major', { radii: false });
    var ends = [pt(C, 150, a0), pt(C, 150, a1)].map(function (p) {
      return svgEl('circle', { 'class': 's-dot', cx: r2(p.x), cy: r2(p.y), r: 5.5 }, C.top);
    });
    var A = angleMark(C, a0, a1, 'θ', { r: 38, gap: 22 });
    A.lbl.classList.add('lbl--big');

    await anim(Beats.drawRim(C.rim, C.tip, { time: SLOW_PEN }));
    await anim(Beats.fillDisc(C.disc));
    await anim(Beats.plotDot(C.dot, 0.35));
    await wait(SHORT);
    await radii(S, 0.75);
    await anim(popIn(ends, { stagger: 0.15 }));
    await wait(SHORT);
    await Promise.all([sweep(S, 0.7), arcIn(S, 0.7)]);
    await sweep(T, 1.0);
    await wait(SHORT);
    await angleIn(A);
    await wait(SHORT);

    /* Named, and the major sector stepped back while the line is said and
       for three seconds in all; the angle breathes the whole time. */
    var lit = svgEl('path', { 'class': 'figure__rim', d: arcD(C, C.r, a0, a1) });
    var dim = svgEl('path', { 'class': 'figure__rim', d: arcD(C, C.r, a1, a0 + 360) });
    C.g.insertBefore(lit, C.rim.nextSibling);
    C.g.insertBefore(dim, lit);
    M.set([lit, dim], { opacity: 1 });
    M.set(C.rim, { opacity: 0 });
    var said = say(keyed('s3CentralIs'));
    function pulse(els, n) {
      return Promise.all(els.map(function (el) {
        return anim(M.fromTo(el, { scale: 1, transformOrigin: '50% 50%' },
          { scale: 1.1, duration: M.dur(0.3), ease: 'power2.out', yoyo: true, repeat: n || 1 }));
      }));
    }
    S.ra.classList.add('is-defining');
    S.rb.classList.add('is-defining');
    quiet(pulse([S.ra, S.rb], 3).then(function () {
      S.ra.classList.remove('is-defining');
      S.rb.classList.remove('is-defining');
      return pulse([A.arc, A.lbl], 3);
    }));
    [T.region, dim].forEach(function (el) {
      el.style.transition = 'opacity .6s ease';
      el.classList.add('is-dim');
    });
    A.arc.classList.add('is-focus');
    A.lbl.classList.add('is-focus');
    await Promise.all([said, wait(4200)]);

    /* Back to the whole circle. */
    [T.region, dim].forEach(function (el) {
      el.style.transition = 'opacity .9s ease';
      el.classList.remove('is-dim');
    });
    A.arc.classList.remove('is-focus');
    A.lbl.classList.remove('is-focus');
    await wait(900);

    /* What if the angle went all the way round? One radius is walked
       round like a clock's second hand -- clockwise, in ticks of 6°, each
       a quick step that overshoots a hair and settles -- and the minor
       sector opens with it until it is the whole circle. The angle is
       read out as it goes. */
    await say(keyed('s3Central360Q'));
    await wait(BEAT);
    await say(keyed('s3FindOut'));
    await wait(SHORT);
    A.lbl.classList.remove('lbl--big');
    A.set(a0, a1, 'θ = ' + (a1 - a0) + '°');
    await anim(popIn(A.lbl, { from: 0.7 }));
    await say(keyed('s3CentralHere', { deg: a1 - a0 }));
    await wait(SHORT);
    var hand = { a: a0 };
    function place() {
      var cur = hand.a;
      var deg = Math.round(a1 - cur);
      S.set(cur, a1);
      T.set(a1, cur + 360);
      lit.setAttribute('d', arcD(C, C.r, cur, a1));
      dim.setAttribute('d', arcD(C, C.r, a1, cur + 360));
      var p = pt(C, C.r, cur);
      ends[0].setAttribute('cx', r2(p.x));
      ends[0].setAttribute('cy', r2(p.y));
      A.set(cur, a1, 'θ = ' + deg + '°');
    }
    place();
    var STEP = 6;
    var tl = M.timeline();
    for (var at = a0 - STEP; at >= a1 - 360 - 0.01; at -= STEP) {
      tl.to(hand, { a: at, duration: M.dur(0.075), ease: 'back.out(3)', onUpdate: place });
      tl.call(Beats.pop);
      tl.to({}, { duration: M.dur(0.045) });
    }
    await anim(tl);
    hand.a = a1 - 360;
    place();

    /* The full turn: the sector is the whole circle, lit twice and then
       left at rest. */
    Beats.sfx('correct');
    [S.region, A.arc, A.lbl].forEach(function (el) { el.classList.add('is-flash2'); });
    await anim(M.fromTo(S.region, { scale: 1, transformOrigin: '50% 50%' },
      { scale: 1.04, duration: M.dur(0.28), ease: 'power2.out', yoyo: true, repeat: 1 }));
    burstAt(F.svg);
    await say(keyed('s3CentralFull'), 'happy');
    await wait(SHORT);
    S.region.classList.remove('is-flash2');
    void S.region.getBoundingClientRect();
    S.region.classList.add('is-flash2');
    await say(keyed('s3CentralWhole'), 'happy');
    await wait(BEAT);
    fullTurn = { sc: sc, wrap: F.wrap, svg: F.svg, C: C, S: S, A: A, at: a1 };
    await handOver();
  }

  /* ---- 5. Tap the area of the circle -----------------------------------------
     The full-turn circle of the scene before -- the same element -- stays
     on the board and glides to the left as its page becomes a picture and
     a panel; its radius is named r. The bird comes onto a perch in the
     panel and asks, in a warm bubble, which of four tiles is the circle's
     area. */
  var fullTurn = null;

  async function sAreaTap() {
    var K = fullTurn;
    fullTurn = null;
    var sc, C, S, svg, wrap, panel, at;
    if (K && K.sc.isConnected) {
      sc = K.sc; C = K.C; S = K.S; svg = K.svg; wrap = K.wrap; at = K.at;
      [S.region, K.A.arc, K.A.lbl].forEach(function (el) { el.classList.remove('is-focus', 'is-flash2'); });
      /* From the middle of the board to the left column, as one glide. */
      var r0 = svg.getBoundingClientRect();
      sc.className = 'sa-scene sa-scene--split';
      panel = h('div', 'sa-panel', null, sc);
      var r1 = svg.getBoundingClientRect();
      var k = Math.min(r0.width, r0.height) / Math.min(r1.width, r1.height);
      M.set(wrap, { x: (r0.left + r0.width / 2) - (r1.left + r1.width / 2),
                    y: (r0.top + r0.height / 2) - (r1.top + r1.height / 2),
                    scale: k, transformOrigin: '50% 50%' });
      /* the line goes; the bird stays on the header until its perch is up */
      await Promise.all([hush(),
        anim(M.to(wrap, { x: 0, y: 0, scale: 1, duration: M.dur(0.9), ease: 'power3.inOut' }))]);
    } else {
      /* Reached straight from the level bar: the full-turn circle, drawn whole. */
      sc = await stage('split');
      var F = figure(sc);
      svg = F.svg; wrap = F.wrap;
      C = circle(svg, 210, 210, 150);
      at = 130;
      S = sector(C, at - 360, at, 'minor');
      var A0 = angleMark(C, at - 360, at, 'θ = 360°', { r: 38, gap: 22 });
      show([C.rim, C.disc, C.dot, S.region, S.arc, S.ra, S.rb, A0.arc, A0.lbl]);
      panel = h('div', 'sa-panel', null, sc);
      M.set(wrap, { xPercent: 0 });
      held = null;
      await leaveHeader();
    }

    /* The radius, named. */
    var m = pt(C, 84, at + 9);
    var rl = text(C.top, m.x, m.y, 'r', 'lbl lbl--radius lbl--big');
    await anim(popIn(rl, { from: 0.5 }));
    var area = text(C.top, C.x, C.y + 100, tr('s3LblAreaPiR2'), 'lbl lbl--pi lbl--big');
    M.set(area, { opacity: 0 });
    await wait(SHORT);

    /* The question, from a perch, in a bubble of its own warm colour. */
    var P = perchIn(panel);
    P.row.classList.add('sa-speak--above');
    P.bubble.classList.add('sa-bubble--sun');
    await anim(fadeIn(P.row, { y: 0 }));
    /* What the circle now is, said over the circle itself; the bubble then
       asks only the question. */
    var over = text(C.top, C.x, C.y - C.r - 22, tr('s3AreaOver'), 'lbl s-over-lbl');
    await anim(fadeIn(over, { y: 6 }));
    await wait(SHORT);
    var QUESTION = keyed('s3AreaAsk');
    await perchSay(P, QUESTION);
    /* Every answer is spoken in the question's own bubble, by the bird on
       its perch: the feedback first, and then, after a moment to read it,
       the question again. A newer tap takes the bubble over from an older
       one, so a question is never put back over newer feedback. */
    var asked = 0;
    function tone(t) {
      P.bubble.classList.toggle('is-no', t === 'no');
      P.bubble.classList.toggle('is-yes', t === 'yes');
    }
    function inBubble(lines, mood) {
      var mine = ++asked;
      /* A right answer is not explained: the bubble only says so, and the
         page then gives the answer as a result of its own (below). */
      if (mood === 'happy') {
        tone('yes');
        return sayAll(lines, mood);
      }
      /* The bubble wears the verdict: red while it is saying what was
         wrong, green while it is saying what was right, and its own warm
         colour again for the question. */
      tone(mood === 'happy' ? 'yes' : 'no');
      return sayAll(lines, mood)
        .then(function () { return wait(1500); })
        .then(function () {
          if (mine !== asked || !perch) return;
          tone(null);
          return say(QUESTION);
        });
    }
    await askChoice(['πr', 'πr²', '2πr'], 1, {
      host: h('div', 'sa-qslot sa-qslot--big', null, panel),
      tiles: true,
      voice: inBubble,
      yes: keyed('fbThatsCorrect'),
      why: {
        0: [keyed('s3NotQuiteLook'), keyed('s3AreaWrongR')],
        2: [keyed('s3NotQuiteLook'), keyed('s3AreaWrong2PiR')]
      }
    });
    await wait(900);

    /* The question has been answered: it goes -- bubble, bird and tiles --
       and the answer is set in its place, on one line, as a result. */
    asked++;
    var gone = Array.prototype.slice.call(panel.children);
    await Promise.all([anim(fadeOut(gone)), perchOut()]);
    gone.forEach(function (g) { if (g.parentNode) g.parentNode.removeChild(g); });
    var res = h('div', 'sa-result sa-result--two',
      '<span class="sa-result__tick" aria-hidden="true"></span>' +
      '<span class="sa-result__lines"><span class="sa-result__txt">' + tr('s3LblAreaOfCircle') + ' ' + EQ + ' ' + c('pi', 'π') + c('r', 'r²') + '</span>' +
      '<span class="sa-result__sub">' + EQ + ' ' + tr('s3ResSectorAngle') + '&nbsp;' + c('ang', '360°') + '</span></span>', panel);
    panel.classList.add('sa-panel--centre');
    /* the r in the formula is the r on the figure: it pulses as the card comes */
    quiet(anim(M.fromTo(rl, { scale: 1, transformOrigin: '50% 50%' },
      { scale: 1.4, duration: M.dur(0.3), ease: 'power2.out', yoyo: true, repeat: 3 })));
    await anim(cardIn(res));
    await wait(BEAT);
    areaFig = { sc: sc, svg: svg, wrap: wrap, C: C, S: S, at: at, panel: panel, area: area, over: over };
    await handOver();
  }

  /* ---- 6. From the whole circle to any angle ------------------------------
     The same circle again, still a full turn. Beside it the area is worked
     down from 360° to 1°: the 360 of "1 × 360" is lifted out of its line
     and flown down under the 1 as the sector closes to a hair of 1°; then
     the 1 becomes 10, in place, as the sector opens to 10°; then the
     learner says what the area is for any angle θ. */
  var areaFig = null;

  /* A number carried from one place in the working to another: a copy of
     it lifted off the first and flown, on a low arc, to where the second
     will stand. In the frame's own pixels; the copy is gone when it lands. */
  function flyNumber(from, to, seconds) {
    var f = dom.frame.getBoundingClientRect();
    var a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    var cs = getComputedStyle(from);
    var bit = h('span', 'sa-fly', from.textContent, dom.frame);
    bit.style.left = (a.left - f.left) + 'px';
    bit.style.top = (a.top - f.top) + 'px';
    bit.style.fontSize = cs.fontSize;
    bit.style.fontWeight = cs.fontWeight;
    bit.style.color = cs.color;
    var dx = (b.left + b.width / 2) - (a.left + a.width / 2);
    var dy = (b.top + b.height / 2) - (a.top + a.height / 2);
    var k = (parseFloat(getComputedStyle(to).fontSize) || 1) / (parseFloat(cs.fontSize) || 1);
    var pen = { t: 0 };
    var tl = M.timeline({ revert: function () { if (bit.parentNode) bit.parentNode.removeChild(bit); } });
    tl.to(pen, {
      t: 1, duration: M.dur(seconds || 1.1), ease: 'power2.inOut',
      onUpdate: function () {
        var t = pen.t;
        M.set(bit, { x: dx * t, y: dy * t - Math.sin(Math.PI * t) * 46,
                     scale: 1 + (k - 1) * t + Math.sin(Math.PI * t) * 0.25 });
      }
    });
    tl.call(function () { if (bit.parentNode) bit.parentNode.removeChild(bit); });
    return anim(tl);
  }

  /* A number in the working changed where it stands: the old value melts
     away and the new one comes up through it. */
  function dissolveTo(el, value) {
    return anim(M.to(el, { opacity: 0, filter: 'blur(4px)', duration: M.dur(0.3), ease: 'power2.in' }))
      .then(function () {
        el.textContent = value;
        return anim(M.to(el, { opacity: 1, filter: 'blur(0px)', duration: M.dur(0.4), ease: 'power2.out' }));
      });
  }

  /* ---- the magnifying glass ---------------------------------------------
     A lens over a figure that shows one small spot of it, enlarged: a ring
     round the spot, a fine line out to the glass, and inside the glass the
     spot redrawn k times larger -- redrawn, not scaled, so its lines keep
     their own weight and the gap between two radii is what grows. `draw`
     is handed a map from figure to lens and the group to draw into. */
  var lensN = 0;
  function magnifier(svg, focus, at, k, draw) {
    var R = 68;
    var g = svgEl('g', { 'class': 's-lens' }, svg);
    var ring = svgEl('circle', { 'class': 's-lens__spot', cx: r2(focus.x), cy: r2(focus.y), r: r2(R / k + 2) }, g);
    var dx = at.x - focus.x, dy = at.y - focus.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var a0 = { x: focus.x + dx / d * (R / k + 2), y: focus.y + dy / d * (R / k + 2) };
    var a1 = { x: at.x - dx / d * (R + 5), y: at.y - dy / d * (R + 5) };
    var lead = svgEl('path', { 'class': 's-lens__lead', d: segD(a0, a1) }, g);
    var glass = svgEl('g', { 'class': 's-lens__glass' }, g);
    var id = 'saLens' + (++lensN);
    var defs = svg.querySelector('defs') || svgEl('defs', {}, svg);
    var clip = svgEl('clipPath', { id: id }, defs);
    svgEl('circle', { cx: r2(at.x), cy: r2(at.y), r: R }, clip);
    /* the handle, out from the rim of the glass, away from the spot */
    var hx = dx / d, hy = dy / d;
    var h0 = { x: at.x + hx * (R + 4), y: at.y + hy * (R + 4) };
    var h1 = { x: at.x + hx * (R + 44), y: at.y + hy * (R + 44) };
    svgEl('path', { 'class': 's-lens__handle', d: segD(h0, h1) }, glass);
    svgEl('circle', { 'class': 's-lens__back', cx: r2(at.x), cy: r2(at.y), r: R }, glass);
    var inner = svgEl('g', { 'clip-path': 'url(#' + id + ')' }, glass);
    draw(function (p) {
      return { x: at.x + k * (p.x - focus.x), y: at.y + k * (p.y - focus.y) };
    }, inner);
    svgEl('path', { 'class': 's-lens__sheen',
      d: 'M' + r2(at.x - R * .62) + ' ' + r2(at.y - R * .2) + ' A' + R * .7 + ' ' + R * .7 + ' 0 0 1 ' +
         r2(at.x - R * .1) + ' ' + r2(at.y - R * .66) }, glass);
    svgEl('circle', { 'class': 's-lens__rim', cx: r2(at.x), cy: r2(at.y), r: R }, glass);
    M.set([ring, lead, glass], { opacity: 0 });
    return {
      show: function () {
        return anim(popIn(ring, { from: 0.3 }))
          .then(function () { return anim(Beats.growLine(lead, 0.45)); })
          .then(function () {
            Beats.pop();
            return anim(M.fromTo(glass, { opacity: 0, scale: 0.2, transformOrigin: r2(at.x) + 'px ' + r2(at.y) + 'px' },
              { opacity: 1, scale: 1, duration: M.dur(0.55), ease: 'back.out(1.5)' }));
          });
      },
      hide: function () {
        return anim(M.to(glass, { opacity: 0, scale: 0.3, transformOrigin: r2(at.x) + 'px ' + r2(at.y) + 'px',
                                   duration: M.dur(0.35), ease: 'power2.in' }))
          .then(function () { return anim(fadeOut([ring, lead])); })
          .then(function () { if (g.parentNode) g.parentNode.removeChild(g); });
      }
    };
  }

  async function sAreaDerive() {
    var K = areaFig;
    areaFig = null;
    var sc, C, S, svg, panel, at;
    if (K && K.sc.isConnected) {
      sc = K.sc; C = K.C; S = K.S; svg = K.svg; panel = K.panel; at = K.at;
      var olds = Array.prototype.slice.call(panel.children).concat([K.area], K.over ? [K.over] : []);
      await anim(fadeOut(olds));
      Array.prototype.slice.call(panel.children).forEach(function (o) { panel.removeChild(o); });
      panel.classList.remove('sa-panel--centre');
      if (K.area.parentNode) K.area.parentNode.removeChild(K.area);
      if (K.over && K.over.parentNode) K.over.parentNode.removeChild(K.over);
    } else {
      /* Reached straight from the level bar: the full-turn circle, whole. */
      sc = await stage('split');
      var F = figure(sc);
      held = null;
      M.set(F.wrap, { xPercent: 0 });     /* already in its column */
      svg = F.svg;
      C = circle(svg, 210, 210, 150);
      at = 130;
      S = sector(C, at - 360, at, 'minor');
      var m0 = pt(C, 84, at + 9);
      show([C.rim, C.disc, C.dot, S.region, S.arc, S.ra, S.rb,
            text(C.top, m0.x, m0.y, 'r', 'lbl lbl--radius lbl--big')]);
      panel = h('div', 'sa-panel', null, sc);
    }
    /* The angle mark is re-made, so it is this scene's to move. */
    var old = C.marks.querySelectorAll('*');
    Array.prototype.forEach.call(old, function (n) { n.parentNode.removeChild(n); });
    var A = angleMark(C, at - 360, at, 'θ = 360°', { r: 38, gap: 22 });
    show([A.arc, A.lbl]);
    var deg = { v: 360 };
    function turnTo(v) {
      deg.v = v;
      S.set(at - v, at);
      A.set(at - v, at, 'θ = ' + Math.round(v) + '°');
      /* A thin sector has no room for its name inside: the label steps
         out past the moving radius, clear of the fixed one and its r. */
      if (v < 60) {
        var q = pt(C, 52, at - v - 50);
        A.lbl.setAttribute('x', r2(q.x));
        A.lbl.setAttribute('y', r2(q.y));
        A.lbl.setAttribute('text-anchor', 'start');
      } else {
        A.lbl.setAttribute('text-anchor', 'middle');
      }
    }

    /* ---- the derivation, step by step -----------------------------------
       Every step stays on the board as a numbered card: a short caption
       in words, and under it the working, written a term at a time. The
       step being worked is at full strength and the ones before it step
       back; once there are more than four, the oldest folds away. */
    var deck = h('div', 'sa-derive', null, panel);
    var steps = [];
    var MAX_SHOWN = 4;
    async function addStep(cap, bits) {
      steps.forEach(function (st) { st.classList.add('is-past'); });
      var st = h('div', 'sa-dstep', '<span class="sa-dstep__n">' + (steps.length + 1) + '</span>' +
        '<div class="sa-dstep__body"><p class="sa-dstep__cap">' + cap + '</p><p class="sa-dstep__eq"></p></div>', deck);
      var eq = st.querySelector('.sa-dstep__eq');
      var keys = {};
      var els = bits.map(function (bt) {
        var sp = h('span', 'sa-dstep__bit', bt[0], eq);
        if (bt[1]) keys[bt[1]] = sp;
        M.set(sp, { opacity: 0 });
        return sp;
      });
      steps.push(st);
      /* the oldest card folds away once the deck is full */
      var fold = null;
      var shown = steps.filter(function (x) { return !x.__gone; });
      if (shown.length > MAX_SHOWN) {
        var old = shown[0];
        old.__gone = true;
        fold = anim(M.to(old, { opacity: 0, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0,
                                duration: M.dur(0.5), ease: 'power2.inOut',
                                onComplete: function () { old.style.display = 'none'; } }));
      }
      await Promise.all([fold, anim(M.fromTo(st, { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: M.dur(0.5), ease: 'power3.out' }))]);
      return { el: st, keys: keys, bits: els };
    }
    /* the working of a step, a term at a time; `skip` leaves some terms to
       be brought in by the caller (a number that flies in, a blank) */
    async function writeBits(step, skip) {
      for (var i = 0; i < step.bits.length; i++) {
        if (skip && skip.indexOf(step.bits[i]) >= 0) continue;
        await anim(M.fromTo(step.bits[i], { opacity: 0, y: 8, scale: 0.88 },
          { opacity: 1, y: 0, scale: 1, duration: M.dur(0.34), ease: 'back.out(1.6)' }));
        await wait(200);
      }
    }
    var ONE = fr('1', '360', 'c-ang');

    /* ---- 1. The whole circle ---------------------------------------------- */
    await say(keyed('s3DeriveWhole'));
    var s1 = await addStep(tr('s3DeriveWhole'),
      [[c('a', 'A')], [EQ], [PIR2]]);
    await writeBits(s1);
    S.region.classList.add('is-flash2');
    await wait(LOOK);

    /* ---- 2. 360 sectors of 1° ----------------------------------------------
       The circle is cut into its 360 one-degree sectors: fine spokes swept
       round from the fixed radius, and the whole of it lit as one. */
    var defs = svg.querySelector('defs') || svgEl('defs', {}, svg);
    var clip = svgEl('clipPath', { id: 'saSpokes' }, defs);
    var clipD = svgEl('path', { d: '' }, clip);
    var spokes = svgEl('g', { 'clip-path': 'url(#saSpokes)', 'class': 's-spokes' }, C.over);
    var dd0 = '';
    for (var k = 0; k < 360; k++) dd0 += segD(C, pt(C, C.r, k)) + ' ';
    svgEl('path', { 'class': 's-fine', d: dd0 }, spokes);
    await say(keyed('s3DeriveCut'));
    var s2 = await addStep(tr('s3DeriveMadeOf'),
      [['<span class="c-ang" data-fly>360</span>', 'n360'], [X], [tr('s3DeriveOneDeg')], [EQ], [PIR2]]);
    await Promise.all([
      anim(Beats.secFill(clipD, function (t) { return wedgeD(C, C.r + 2, at - 360 * t, at); }, 2.2)),
      writeBits(s2)
    ]);
    await say(keyed('s3DeriveTogether'));
    await wait(SHORT);

    /* ---- 3. One sector of 1° ------------------------------------------------
       The 360 is carried down to divide, and the sector closes to 1°. */
    await say(keyed('s3DeriveOne'));
    var s3 = await addStep(tr('s3StepAreaAngle', { a: '<span class="c-val"><span data-k="c1">1</span>°</span>' }),
      [[c('a', 'A')], [EQ], [PIR2], ['<span class="op">÷</span>'], ['<span class="c-ang">360</span>', 'to360'],
       [EQ], ['<span class="frac c-ang"><span class="frac__n c-val"><span data-k="n1">1</span></span><span class="frac__d">360</span></span>'],
       [X], [PIR2]]);
    var tail = s3.bits.slice(5);
    await writeBits(s3, [s3.keys.to360].concat(tail));
    await Promise.all([
      flyNumber(s2.keys.n360, s3.keys.to360, 1.1).then(function () {
        M.set(s3.keys.to360, { opacity: 1 });
        Beats.pop();
        return anim(M.fromTo(s3.keys.to360, { scale: 1.35 }, { scale: 1, duration: M.dur(0.35), ease: M.POP }));
      }),
      anim(M.to(spokes, { opacity: 0, duration: M.dur(0.9), delay: M.dur(0.3) })),
      anim(M.to(deg, { v: 1, duration: M.dur(1.4), ease: 'power2.inOut', onUpdate: function () { turnTo(deg.v); } }))
    ]);
    turnTo(1);
    for (var t2 = 0; t2 < tail.length; t2++) {
      await anim(M.fromTo(tail[t2], { opacity: 0, y: 8, scale: 0.88 },
        { opacity: 1, y: 0, scale: 1, duration: M.dur(0.34), ease: 'back.out(1.6)' }));
      await wait(200);
    }
    await wait(SHORT);

    /* 1° is a hair at this size: a glass over the spot where it meets the
       rim shows the two radii really do stand apart. */
    var LK = 6;
    var lens = magnifier(svg, pt(C, 142, at - 0.5), pt(C, 76, at + 82), LK, function (mp, gl) {
      var Cm = mp(C);
      svgEl('circle', { 'class': 's-lens__disc', cx: r2(Cm.x), cy: r2(Cm.y), r: r2(C.r * LK) }, gl);
      var w0 = pt(C, C.r, at - 1), w1 = pt(C, C.r, at);
      svgEl('path', { 'class': 's-region s-region--minor s-lens__wedge',
        d: 'M' + r2(Cm.x) + ' ' + r2(Cm.y) + ' L' + r2(mp(w0).x) + ' ' + r2(mp(w0).y) +
           ' A' + r2(C.r * LK) + ' ' + r2(C.r * LK) + ' 0 0 0 ' + r2(mp(w1).x) + ' ' + r2(mp(w1).y) + ' Z' }, gl);
      svgEl('circle', { 'class': 's-lens__edge', cx: r2(Cm.x), cy: r2(Cm.y), r: r2(C.r * LK) }, gl);
      [at - 1, at].forEach(function (a2) {
        svgEl('path', { 'class': 's-lens__radius', d: segD(Cm, mp(pt(C, C.r, a2))) }, gl);
      });
      var m0 = mp(pt(C, 137, at - 1)), m1 = mp(pt(C, 137, at));
      svgEl('path', { 'class': 's-lens__angle',
        d: 'M' + r2(m0.x) + ' ' + r2(m0.y) + ' A' + r2(137 * LK) + ' ' + r2(137 * LK) + ' 0 0 0 ' + r2(m1.x) + ' ' + r2(m1.y) }, gl);
      var lp = mp(pt(C, 138.5, at + 1.9));
      var tt = text(gl, lp.x, lp.y, '1°', 'lbl lbl--angle s-lens__lbl');
      M.set(tt, { opacity: 1 });
    });
    await say(keyed('s3DeriveZoom'));
    await lens.show();
    await wait(2400);
    await lens.hide();
    await wait(SHORT);

    /* ---- 3, continued: from 1° to 10°, on the same card -------------------
       The division has done its work and folds away, leaving A = (1/360) ×
       πr²; then a 0 dissolves in after each 1 -- 1° becomes 10°, 1/360
       becomes 10/360 -- as the sector opens to 10°. */
    await wait(2500);
    var gone = s3.bits.slice(2, 6);
    await anim(M.to(gone, { opacity: 0, filter: 'blur(4px)', duration: M.dur(0.4), ease: 'power2.in' }));
    var FlipK = global.Flip;
    var state = FlipK && !Flow.isFast() ? FlipK.getState(s3.bits) : null;
    gone.forEach(function (g) { g.style.display = 'none'; });
    if (state) await anim(FlipK.from(state, { duration: M.dur(0.45), ease: 'power2.inOut' }));
    await say(keyed('s3DeriveTen'));
    var zeros = [s3.el.querySelector('[data-k="c1"]'), s3.el.querySelector('[data-k="n1"]')].map(function (one) {
      var z = document.createElement('span');
      z.textContent = '0';
      one.parentNode.insertBefore(z, one.nextSibling);
      M.set(z, { opacity: 0, filter: 'blur(6px)' });
      return z;
    });
    await Promise.all([
      anim(M.to(zeros, { opacity: 1, filter: 'blur(0px)', duration: M.dur(0.7), ease: 'power2.out', stagger: M.gap(0.15) })),
      anim(M.to(deg, { v: 10, duration: M.dur(1.2), ease: 'power2.inOut', onUpdate: function () { turnTo(deg.v); } }))
    ]);
    turnTo(10);
    Beats.pop();
    await wait(LOOK);

    /* A few more angles, chosen at random: each one dissolves into the card
       and the sector turns to it, so the learner sees that only the number
       on top changes. */
    var c1 = s3.el.querySelector('[data-k="c1"]'), n1 = s3.el.querySelector('[data-k="n1"]');
    zeros.forEach(function (z) { z.parentNode.removeChild(z); });
    c1.textContent = '10';
    n1.textContent = '10';
    A.lbl.classList.add('is-val');
    var pool = [25, 40, 55, 80, 100, 120, 135, 150, 170, 200, 225, 250, 280, 300];
    var picks = [];
    while (picks.length < 5) {
      var v = pool[Math.floor(Math.random() * pool.length)];
      if (picks.indexOf(v) < 0) picks.push(v);
    }
    await say(keyed('s3DeriveMore'));
    for (var pi = 0; pi < picks.length; pi++) {
      var val = picks[pi];
      await anim(M.to([c1, n1], { opacity: 0, filter: 'blur(5px)', duration: M.dur(0.25), ease: 'power2.in' }));
      c1.textContent = val;
      n1.textContent = val;
      await Promise.all([
        anim(M.to([c1, n1], { opacity: 1, filter: 'blur(0px)', duration: M.dur(0.35), ease: 'power2.out' })),
        anim(M.to(deg, { v: val, duration: M.dur(0.9), ease: 'power2.inOut', onUpdate: function () { turnTo(deg.v); } }))
      ]);
      turnTo(val);
      Beats.pop();
      await wait(1100);
    }
    await say(keyed('s3DeriveOnlyTop'));
    await wait(SHORT);
    A.lbl.classList.remove('is-val');

    /* ---- 5. Any angle θ -------------------------------------------------------- */
    await anim(M.to(deg, { v: 75, duration: M.dur(1.1), ease: 'power2.inOut', onUpdate: function () { turnTo(deg.v); } }));
    A.set(at - 75, at, 'θ');
    await say(keyed('s3DeriveAskTheta'));
    var s5 = await addStep(tr('s3StepAreaAngle', { a: '<span class="c-val">θ</span>' }),
      [[c('a', 'A')], [EQ], [DD, 'blank']]);
    await writeBits(s5);
    var D = dropdown(ddIn(s5.el), [fr('θ', '360', 'c-ang') + X + c('pi', '2πr'),
                                fr('θ', '180', 'c-ang') + X + PIR2,
                                fr('θ', '360', 'c-ang') + X + PIR2], 2, { up: true });
    await D.ask({
      yes: [keyed('fbThatsCorrect'), keyed('s3DeriveRight')],
      why: {
        0: [keyed('fbNotQuite'), keyed('s3DeriveWrong2PiR')],
        1: [keyed('fbNotQuite'), keyed('s3DeriveWrong180')]
      }
    });
    await wait(LOOK);

    /* ---- The formula, on its own ------------------------------------------------
       The steps fold away and the result is set out in a box of its own. */
    await anim(M.to(deck, { opacity: 0, y: -12, duration: M.dur(0.45), ease: 'power2.in' }));
    deck.parentNode.removeChild(deck);
    panel.classList.add('sa-panel--centre');
    var rule = ruleCard(panel, tr('s3RuleSectorTheta'),
      c('a', 'A') + EQ + fr('θ', '360', 'c-ang') + X + PIR2);
    rule.el.classList.add('sa-rule--hero');
    await rule.shown;
    rule.el.classList.add('is-glow');
    S.region.classList.add('is-lit');
    burstAt(rule.el);
    Beats.sfx('correct');
    await wait(LOOK);

    /* ---- Try it ------------------------------------------------------------------
       The end of the moving radius becomes a handle; dragged, the sector
       follows the finger and a line of its own under the formula reads the
       angle and its fraction. The derivation is not touched. */
    var tryLine = h('p', 'sa-try', '<span class="sa-try__tag">' + tr('s3TryIt') + '</span>' +
      '<span class="sa-try__eq"><span class="c-val" data-k="tdeg">θ</span><span class="op">→</span>' +
      c('a', 'A') + EQ + '<span class="frac c-ang"><span class="frac__n c-val" data-k="tnum">θ</span><span class="frac__d">360</span></span>' +
      X + PIR2 + '</span>', panel);
    var tDeg = tryLine.querySelector('[data-k="tdeg"]'), tNum = tryLine.querySelector('[data-k="tnum"]');
    M.set(tryLine, { opacity: 0 });
    var hd = svgEl('g', { 'class': 's-handle', tabindex: 0, role: 'slider',
      'aria-label': tr('s3A11yHandle'),
      'aria-valuemin': 1, 'aria-valuemax': 359 }, C.top);
    svgEl('circle', { 'class': 's-handle__halo', cx: 0, cy: 0, r: 22 }, hd);
    svgEl('circle', { 'class': 's-handle__ring', cx: 0, cy: 0, r: 12 }, hd);
    svgEl('circle', { 'class': 's-handle__dot', cx: 0, cy: 0, r: 5 }, hd);
    svgEl('circle', { cx: 0, cy: 0, r: 28, fill: 'transparent' }, hd);
    function placeHandle() {
      var q = pt(C, C.r, at - deg.v);
      hd.setAttribute('transform', 'translate(' + r2(q.x) + ' ' + r2(q.y) + ')');
      hd.setAttribute('aria-valuenow', Math.round(deg.v));
    }
    function setDeg(v) {
      turnTo(v);
      placeHandle();
      var n = Math.round(v);
      tDeg.textContent = 'θ = ' + n + '°';
      tNum.textContent = n;
      A.lbl.classList.add('is-val');
    }
    placeHandle();
    M.set(hd, { opacity: 0 });
    var grabbing = false, travelled = 0;
    var explored = until(function () { setDeg(120); });
    function angleOf(ev) {
      var q = svg.createSVGPoint();
      q.x = ev.clientX; q.y = ev.clientY;
      q = q.matrixTransform(svg.getScreenCTM().inverse());
      var a2 = Math.atan2(C.y - q.y, q.x - C.x) * 180 / Math.PI;
      var v = ((at - a2) % 360 + 360) % 360;
      if (deg.v > 300 && v < 60) v = 359;
      if (deg.v < 60 && v > 300) v = 1;
      return Math.max(1, Math.min(359, v));
    }
    hd.addEventListener('pointerdown', function (ev) {
      if (!hd.__live) return;
      grabbing = true;
      hd.classList.add('is-held');
      try { hd.setPointerCapture(ev.pointerId); } catch (e) {}
      ev.preventDefault();
    });
    hd.addEventListener('pointermove', function (ev) {
      if (!grabbing) return;
      var v = angleOf(ev);
      travelled += Math.abs(v - deg.v);
      setDeg(v);
    });
    function letGo() {
      if (!grabbing) return;
      grabbing = false;
      hd.classList.remove('is-held');
      explored.check(travelled >= 40);
    }
    hd.addEventListener('pointerup', letGo);
    hd.addEventListener('pointercancel', letGo);
    hd.addEventListener('keydown', function (ev) {
      if (!hd.__live) return;
      var step = ev.key === 'ArrowUp' || ev.key === 'ArrowLeft' ? 1 :
                 ev.key === 'ArrowDown' || ev.key === 'ArrowRight' ? -1 : 0;
      if (!step) return;
      ev.preventDefault();
      setDeg(Math.max(1, Math.min(359, deg.v + step * 5)));
      travelled += 5;
      explored.check(travelled >= 40);
    });
    rule.el.classList.remove('is-glow');
    A.set(at - deg.v, at, 'θ');
    hd.__live = true;
    await Promise.all([anim(fadeIn(tryLine, { y: 10 })), anim(popIn(hd))]);
    await say(keyed('s3DeriveDrag'));
    await explored.done;
    hd.__live = false;
    hd.classList.add('is-done');
    await wait(600);
    await say(keyed('s3DeriveWorks'), 'happy');
    await wait(BEAT);
    await handOver();
  }


  /* ---- 11. A worked example (slides 28-34) ----------------------------------
     The working on the left, one line at a time, and each line the learner
     completes before the next is written: the angle over 360, the radius
     squared, the sum simplified, the area. */
  async function sWorked() {
    var sc = await stage('work');
    var col = h('div', 'sa-wk sa-wk--align', null, sc);
    var fig = sectorFigure(sc, { theta: 60, at: 15, r: tr('s3LblR21') });

    /* The formula, set out first -- as a solution in a notebook is. What
       is given, r and θ, is already written on the figure, so it is not
       restated beside it: the bird points at it there instead. */
    var head = h('div', 'sa-wk__head',
      '<p class="sa-wk__formula"><b>' + tr('s3Formula') + '</b> ' + c('a', 'A') + EQ + fr('θ', '360', 'c-ang') + X + PIR2 + '</p>', col);
    var formula = head.querySelector('.sa-wk__formula');
    M.set(formula, { opacity: 0 });
    var list = h('div', 'steps', null, col);

    var s1 = stepRow(list, 1, c('a', 'A') + EQ + DD + X + PIR2);
    var s2 = stepRow(list, 2, c('a', 'A') + EQ + fr('60', '360', 'c-ang') + X + fr('22', '7', 'c-pi') + X + DD);
    /* the simplification, written a piece at a time */
    function bitsRow(n, parts) {
      var r = stepRow(list, n, parts.map(function (x) { return '<span class="sa-work__bit">' + x + '</span>'; }).join(''));
      r.__bits = Array.prototype.slice.call(r.querySelectorAll('.sa-work__bit'));
      M.set(r.__bits, { opacity: 0 });
      return r;
    }
    var s3 = bitsRow(3, [c('a', 'A'), EQ, fr('1', '6', 'c-ang'), X, c('pi', '22'), X, c('r', '3'), X, c('r', '21')]);
    var s4 = bitsRow(4, [c('a', 'A'), EQ, fr('1', '6', 'c-ang'), X, c('pi', '1386')]);
    var s5 = stepRow(list, 5, c('a', 'A') + EQ + DD);
    var d1 = dropdown(ddIn(s1), [fr('60', '360', 'c-ang'), fr('360', '60', 'c-ang'), fr('60', '180', 'c-ang')], 0);
    var d2 = dropdown(ddIn(s2), [c('r', '21²'), c('r', '21'), c('r', '2 × 21')], 0);
    var d5 = dropdown(ddIn(s5), [tr('s3Val231sq'), tr('s3Val1386sq'), tr('val462sq')], 0, { up: true });
    function pulse(el) {
      quiet(anim(M.fromTo(el, { scale: 1, transformOrigin: '50% 50%' },
        { scale: 1.35, duration: M.dur(0.28), ease: 'power2.out', yoyo: true, repeat: 1 })));
    }
    async function writeRow(r) {
      await stepIn(r);
      for (var i = 0; i < r.__bits.length; i++) {
        await anim(M.fromTo(r.__bits[i], { opacity: 0, y: 8, scale: 0.88 },
          { opacity: 1, y: 0, scale: 1, duration: M.dur(0.32), ease: 'back.out(1.6)' }));
        await wait(220);
      }
      stepDone(r);
    }

    /* The figure first, with nothing said; then the problem. */
    await leaveHeader();
    await fig.draw();
    await wait(SHORT);
    await say(keyed('s3WkFind'));
    /* r and θ, picked out on the figure: that is the given. */
    pulse(fig.R);
    await wait(SHORT);
    pulse(fig.A.lbl);
    await wait(LOOK);
    await anim(fadeIn(formula, { y: 6 }));
    await wait(LOOK);

    /* 1. θ into the formula. */
    await stepIn(s1);
    await say(keyed('s3WkPutTheta'));
    pulse(fig.A.lbl);
    await d1.ask({
      yes: [keyed('fbThatsCorrect'), keyed('s3WkThetaRight')],
      why: {
        1: [keyed('fbNotQuite'), keyed('s3WkThetaWrongFlip')],
        2: [keyed('fbNotQuite'), keyed('s3FullTurn360')]
      }
    });
    stepDone(s1);

    /* 2. r into the formula, with π = 22/7 said first. */
    await stepIn(s2);
    await say(keyed('s3WkPutR'));
    pulse(fig.R);
    await d2.ask({
      yes: [keyed('fbThatsCorrect'), keyed('s3WkRRight')],
      why: {
        1: [keyed('fbNotQuite'), keyed('s3WkRWrong21')],
        2: [keyed('fbNotQuite'), keyed('s3WkRWrongDouble')]
      }
    });
    stepDone(s2);

    /* 3-4. The simplification, written on the board as the voice reads it
       out -- voice only, the working is the text (s3WkSimplify, s3WkProduct). */
    await voiceAlone('s3WkSimplify', function () { return writeRow(s3); });
    await wait(SHORT);
    await voiceAlone('s3WkProduct', function () { return writeRow(s4); });
    await wait(SHORT);

    /* 5. The answer. */
    await stepIn(s5);
    await say(keyed('s3FindArea'));
    await d5.ask({
      yes: keyed('fbThatsCorrect'),
      why: {
        1: [keyed('fbNotQuite'), keyed('s3WkWrongWhole')],
        2: [keyed('fbNotQuite'), keyed('s3WkWrongThird')]
      }
    });
    stepDone(s5);
    burstAt(s5);

    /* What was found, said -- and set in the sector. */
    fig.S.region.classList.add('is-focus');
    var fp = pt(fig.C, 104, 45);
    var fl = text(fig.C.top, fp.x, fp.y, tr('s3Val231sq'), 'lbl lbl--area s-found-lbl');
    await Promise.all([say(keyed('s3WkFound'), 'happy'), anim(popIn(fl, { from: 0.4 }))]);
    await wait(BEAT);
    await handOver();
  }


  /* ---- 12-13. Practice: minor sectors (slides 35-38) -------------------------- */
  function sPractice1() {
    function flash(els) {
      els.forEach(function (e) { e.classList.add('is-lit'); });
      quiet(wait(1600).then(function () { els.forEach(function (e) { e.classList.remove('is-lit'); }); }));
    }
    return practice({
      theta: 90, r: tr('s3LblR28'),
      prompt: keyed('s3MinorAsk'),
      options: [tr('val616sq'), tr('s3Val2464sq'), tr('val154sq')], right: 0,
      why: {
        1: [keyed('fbNotQuite'), keyed('s3P1WrongWhole')],
        2: [keyed('fbNotQuite'), keyed('s3P1WrongR14')]
      },
      /* a wrong answer shown on the figure: the whole circle, or the radius */
      onWrong: function (i, fig) {
        if (i === 1) {
          /* the whole circle shaded, briefly: that is what 2464 cm² is */
          var all = svgEl('circle', { 'class': 's-whole', cx: fig.C.x, cy: fig.C.y, r: fig.C.r }, fig.C.under);
          quiet(anim(M.fromTo(all, { opacity: 0 }, { opacity: 0.85, duration: M.dur(0.35), yoyo: true, repeat: 3,
            onComplete: function () { if (all.parentNode) all.parentNode.removeChild(all); } })));
        }
        if (i === 2) quiet(anim(M.fromTo(fig.R, { scale: 1, transformOrigin: '50% 50%' },
          { scale: 1.35, duration: M.dur(0.3), ease: 'power2.out', yoyo: true, repeat: 3 })));
      },
      /* the formula only: r and θ are already on the figure */
      head: '<p class="sa-wk__formula"><b>' + tr('s3Formula') + '</b> ' + c('a', 'A') + EQ + fr('θ', '360', 'c-ang') + X + PIR2 + '</p>',
      steps: function (fig) {
        return [
          [c('a', 'A'), [[fr('90', '360', 'c-ang'), fig.A.lbl], [X], [PIR2]]],
          ['', [[fr('1', '4', 'c-ang')], [X], [fr('22', '7', 'c-pi')], [X], [c('r', '28'), fig.R], [X], [c('r', '28')]],
           keyed('s3P1PutPiR')],
          ['', [[c('pi', '22')], [X], [c('r', '28')]], keyed('s3P1Cancel')],
          ['', [[c('ans', tr('val616sq'))]]]
        ];
      },
      found: {
        label: tr('val616sq'),
        at: function (fig) { return pt(fig.C, 100, 90); },
        region: function (fig) { return fig.S.region; },
        say: keyed('s3P1Found')
      }
    }).then(handOver);
  }




  /* ---- 14. Which covers more (slide 39) ----------------------------------------
     Two circles drawn to scale -- one twice the other's radius -- each with
     a minor sector, and the surprise that the two are the same size. */
  async function sCompare() {
    var sc = await stage('compare');
    /* Two matching cards in the middle of the board, each with its circle
       drawn large -- to scale with each other, so Circle II is half the
       size -- its name on a tag, and room under it for its working. */
    function card(name) {
      var cd = h('div', 'sa-cmp', null, sc);
      h('span', 'sa-cmp__tag', name, cd);
      var F = svgEl('svg', { 'class': 'sa-cmp__fig', viewBox: '50 50 320 320',
                             preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true' }, cd);
      var work = h('div', 'sa-cmp__work', '', cd);
      M.set(work, { opacity: 0 });
      return { el: cd, svg: F, work: work };
    }
    function along(C, a1, s, gap) {
      var g = svgEl('g', {}, C.top);
      var t = text(g, 0, 0, s, 'lbl lbl--radius lbl--along');
      var len = 0;
      try { len = t.getComputedTextLength(); } catch (e) {}
      var m = pt(C, Math.max(C.r * 0.55, C.r - 12 - len / 2), a1), off = pt({ x: 0, y: 0 }, gap || 15, a1 + 90);
      t.setAttribute('x', r2(m.x + off.x));
      t.setAttribute('y', r2(m.y + off.y));
      var rot = -a1;
      while (rot <= -90) rot += 180;
      while (rot > 90) rot -= 180;
      g.setAttribute('transform', 'rotate(' + r2(rot) + ' ' + r2(m.x + off.x) + ' ' + r2(m.y + off.y) + ')');
      return t;
    }
    var K1 = card(tr('s3CircleI')), K2 = card(tr('s3CircleII'));
    M.set([K1.el, K2.el], { opacity: 0 });
    var C1 = circle(K1.svg, 210, 210, 150);
    var C2 = circle(K2.svg, 210, 210, 75);
    /* Two minor sectors with the same area: Circle I has twice the radius,
       Circle II four times the angle. */
    var S1 = sector(C1, 0, 30, 'minor');
    var S2 = sector(C2, 0, 120, 'minor');
    var A1 = angleMark(C1, 0, 30, '30°', { r: 48, gap: 26 });
    var A2 = angleMark(C2, 0, 120, '120°', { r: 18, gap: 18 });
    /* on the level radius, under the line: the thin 30° sector has room
       for its angle and nothing else */
    var R1 = along(C1, 0, tr('s3LblR12'), -15);
    /* Circle II is given by its diameter: the radius on the right carried
       on, dashed, across to the far side, and the whole line named. */
    var dia = svgEl('path', { 'class': 's-dia-dash', d: segD(pt(C2, C2.r, 180), C2) }, C2.over);
    var R2 = text(C2.top, C2.x, C2.y + 22, tr('s3LblD12'), 'lbl lbl--radius');
    R2.style.fontSize = '20px';
    M.set(dia, { opacity: 0 });

    await anim(M.fromTo([K1.el, K2.el], { opacity: 0, y: 16, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: M.dur(0.5), ease: 'power3.out', stagger: M.gap(0.12) }));
    /* Both circles drawn whole, with nothing said, and only then compared. */
    await leaveHeader();
    await Promise.all([drawCircle(C1, 1.1), wait(250).then(function () { return drawCircle(C2, 1.1); })]);
    await Promise.all([radii(S1, 0.6), radii(S2, 0.6)]);
    await Promise.all([sweep(S1, 0.9), arcIn(S1, 0.9), sweep(S2, 0.9), arcIn(S2, 0.9)]);
    await Promise.all([angleIn(A1), angleIn(A2)]);
    await anim(Beats.growLine(dia, 0.5));
    await anim(fadeIn([R1, R2], { y: 0, stagger: 0.1 }));
    await wait(SHORT);
    await say(keyed('s3CmpAsk'));

    /* The working of a card, a piece at a time, each label pulsing on the
       figure as its number is used. */
    function pulse(el) {
      quiet(anim(M.fromTo(el, { scale: 1, transformOrigin: '50% 50%' },
        { scale: 1.35, duration: M.dur(0.28), ease: 'power2.out', yoyo: true, repeat: 1 })));
    }
    async function writeWork(K, S, lines) {
      K.work.textContent = '';
      M.set(K.work, { opacity: 1 });
      S.region.classList.add('is-lit');
      for (var i = 0; i < lines.length; i++) {
        var row = h('div', 'sa-cmp__row', null, K.work);
        var bits = lines[i].map(function (pc) {
          var sp = h('span', 'sa-work__bit', pc[0], row);
          M.set(sp, { opacity: 0 });
          return { el: sp, from: pc[1] };
        });
        for (var j = 0; j < bits.length; j++) {
          if (bits[j].from) pulse(bits[j].from);
          await anim(M.fromTo(bits[j].el, { opacity: 0, y: 6, scale: 0.88 },
            { opacity: 1, y: 0, scale: 1, duration: M.dur(0.3), ease: 'back.out(1.6)' }));
          await wait(180);
        }
        await wait(300);
      }
    }

    /* A wrong pick is answered with the rule, and a reminder that Circle II
       gives its diameter. */
    var RULE = [keyed('s3TryAgain'), keyed('s3CmpRule')];
    await askChoice([tr('s3CircleI'), tr('s3CircleII'), tr('s3CmpEqual')], 2, {
      tiles: true,
      yes: keyed('s3CmpRight'),
      why: { 0: RULE, 1: RULE }
    });

    /* The working: Circle I, then Circle II. */
    await writeWork(K1, S1, [
      [[c('a', 'A') + EQ], [fr('30', '360', 'c-ang'), A1.lbl], [X], [c('pi', 'π')], [X], [c('r', '12²'), R1], [EQ], [c('ans', tr('s3Val12PiSq'))]]
    ]);
    await wait(SHORT);
    await writeWork(K2, S2, [
      [[c('r', 'r') + EQ], [c('r', '12 ÷ 2'), R2], [EQ], [c('r', tr('s3Lbl6cm'))]],
      [[c('a', 'A') + EQ], [fr('120', '360', 'c-ang'), A2.lbl], [X], [c('pi', 'π')], [X], [c('r', '6²')], [EQ], [c('ans', tr('s3Val12PiSq'))]]
    ]);
    [K1.el, K2.el].forEach(function (e) { e.classList.add('is-match'); });
    Beats.sfx('correct');
    await wait(SHORT);
    await sayAll([keyed('s3CmpWhy1'),
                  keyed('s3CmpWhy2')], 'happy');
    await wait(BEAT);
    await handOver();
  }



  /* ---- 15. The major sector (slides 40-41) ------------------------------------
     Both sectors coloured; the learner taps the bigger. The right one is
     lifted out of the circle along its own middle and set back, lit. */
  /* ---- a figure carried from one screen to the next -----------------------
     When a screen draws the same circle the screen before it drew -- the
     same angle, the same radius -- the circle is not drawn again: it is
     lifted out of the old screen as that screen fades, parked where it
     stands, and set into the new one, which is laid out the same way, so
     it never moves. Only its names change. */
  var keptFig = null;      /* { key, obj } -- the last figure that may carry on */
  var parked = null;       /* that figure's box, lifted out between screens   */

  function parkFigure() {
    if (!keptFig) return;
    var w = keptFig.obj.F.wrap;
    if (!w.isConnected || !dom.stage.contains(w)) { keptFig = null; return; }
    var a = dom.stage.getBoundingClientRect(), b = w.getBoundingClientRect();
    var hold = document.createElement('div');
    hold.className = w.className;
    hold.style.width = b.width + 'px';
    hold.style.height = b.height + 'px';
    w.parentNode.insertBefore(hold, w);
    w.style.position = 'absolute';
    w.style.left = (b.left - a.left) + 'px';
    w.style.top = (b.top - a.top) + 'px';
    w.style.width = b.width + 'px';
    w.style.height = b.height + 'px';
    dom.stage.appendChild(w);
    parked = w;
  }
  function unpark() {
    if (!parked) return;
    var w = parked;
    parked = null;
    ['position', 'left', 'top', 'width', 'height'].forEach(function (k) { w.style[k] = ''; });
  }
  /* A parked figure the new screen did not ask for goes, quietly. */
  function dropParked() {
    if (!parked) return;
    var w = parked;
    parked = null;
    keptFig = null;
    quiet(anim(fadeOut(w)).then(function () { if (w.parentNode) w.parentNode.removeChild(w); }));
  }

  function majorFigure(host, minorDeg, spec) {
    spec = spec || {};
    var key = 'major|' + minorDeg + '|' + (spec.r || '') + '|' + (spec.minorLabel || '') + '|' + (spec.rAlong || '');
    if (parked && keptFig && keptFig.key === key) {
      var o = keptFig.obj;
      unpark();
      host.insertBefore(o.F.wrap, host.firstChild);
      M.set(o.F.wrap, { clearProps: 'opacity,transform' });
      /* back to a plain picture: no light left on from the screen before */
      [o.S.region, o.T.region, o.S.arc, o.T.arc, o.A.arc, o.A.lbl, o.B.arc, o.B.lbl].forEach(function (e) {
        e.classList.remove('is-lit', 'is-focus', 'is-dim', 'is-flash2');
      });
      o.B.set(o.T.a0, o.T.a1, spec.majorLabel || '');
      /* an answer set on the figure belongs to the screen that found it */
      Array.prototype.forEach.call(o.F.svg.querySelectorAll('.s-found-lbl'), function (n) { n.parentNode.removeChild(n); });
      o.draw = function () { return Promise.resolve(); };
      return o;
    }
    var F = figure(host, '30 34 360 384');
    var C = circle(F.svg, 210, 210, 150);
    var a0 = 90 - minorDeg / 2, a1 = 90 + minorDeg / 2;
    var S = sector(C, a0, a1, 'minor');
    var T = sector(C, a1, a0 + 360, 'major', { radii: false });
    var A = angleMark(C, a0, a1, spec.minorLabel || (minorDeg + '°'), { r: 30 });
    var B = angleMark(C, a1, a0 + 360, spec.majorLabel || '', { r: 44, major: true, cls: 'lbl--major', gap: 26 });
    var R = spec.r ? text(F.svg, 210, 400, spec.r, 'lbl lbl--radius') : null;
    if (spec.rAlong) {
      /* along the first radius, on the side away from the minor sector */
      var rot = -a0;
      while (rot <= -90) rot += 180;
      while (rot > 90) rot -= 180;
      var mid = pt(C, 92, a0), off = pt({ x: 0, y: 0 }, 17, a0 - 90);
      var rg = svgEl('g', { transform: 'rotate(' + r2(rot) + ' ' + r2(mid.x + off.x) + ' ' + r2(mid.y + off.y) + ')' }, C.top);
      R = text(rg, mid.x + off.x, mid.y + off.y, spec.rAlong, 'lbl lbl--radius lbl--along');
    }
    var obj = {
      F: F, C: C, S: S, T: T, A: A, B: B, R: R,
      draw: function () {
        return drawCircle(C, 1.1)
          .then(function () { return radii(S, 0.6); })
          .then(function () { return Promise.all([sweep(S, 0.8), arcIn(S, 0.8)]); })
          .then(function () { return Promise.all([sweep(T, 1.2), arcIn(T, 1.2)]); })
          .then(function () { return angleIn(A); })
          .then(function () { return R ? anim(fadeIn(R, { y: 4 })) : null; });
      }
    };
    keptFig = { key: key, obj: obj };
    return obj;
  }



  /* ---- 16. Its angle (slides 42-43) -------------------------------------------- */
  async function sReflex() {
    var sc = await stage('split');
    var fig = majorFigure(sc, 100, { majorLabel: '?' });
    var panel = h('div', 'sa-panel sa-panel--centre', null, sc);
    var box = h('div', 'sa-workcard', null, panel);
    var l1 = lineIn(box, tr('s3RefMinorAngle', { a: '<span class="c-ang">100°</span>' }));
    var grid = h('div', 'sa-eqgrid', null, box);
    function eqRow(left, right) {
      var r = h('div', 'sa-work__row', '<span class="sa-work__l">' + left + '</span>' +
        '<span class="sa-work__eq">=</span><span class="sa-work__r">' + right + '</span>', grid);
      var parts = Array.prototype.slice.call(r.children);
      M.set(parts, { opacity: 0 });
      r.__parts = parts;
      return r;
    }
    var l2 = eqRow('<span class="c-ang">100°</span> <span class="op">+</span> <span class="c-maj">?</span>',
                   '<span class="c-ang">360°</span>');
    var l3 = eqRow('<span class="c-maj">?</span>',
                   '<span class="c-ang">360°</span> ' + MINUS + ' <span class="c-ang">100°</span> ' + EQ + ' ' + DD);
    var D = dropdown(ddIn(l3), ['280°', '270°', '260°'], 2, { keepOrder: true });

    /* The circle is drawn whole, with nothing said. */
    await leaveHeader();
    await fig.draw();
    await wait(SHORT);

    /* The full turn: the minor angle, then the major angle round the rest,
       then the whole turn lit as one. */
    fig.A.arc.classList.add('is-flash2');
    fig.A.lbl.classList.add('is-flash2');
    await wait(900);
    await angleIn(fig.B);
    fig.B.arc.classList.add('is-flash2');
    fig.B.lbl.classList.add('is-flash2');
    await wait(900);
    var ring = svgEl('circle', { 'class': 's-turn', cx: fig.C.x, cy: fig.C.y, r: 38 }, fig.C.marks);
    await Promise.all([
      say(keyed('s3RefFullTurn')),
      anim(M.fromTo(ring, { opacity: 0 }, { opacity: 1, duration: M.dur(0.4), yoyo: true, repeat: 3 }))
    ]);
    if (ring.parentNode) ring.parentNode.removeChild(ring);
    [fig.A.arc, fig.A.lbl, fig.B.arc, fig.B.lbl].forEach(function (e) { e.classList.remove('is-flash2'); });
    await wait(SHORT);

    /* The question, with the working on the board. */
    await say(keyed('s3RefAsk'));
    await anim(fadeIn(l1));
    await wait(SHORT);
    await anim(fadeIn(l2.__parts));
    await wait(LOOK);
    await anim(fadeIn(l3.__parts));
    await D.ask({
      yes: [keyed('fbThatsCorrect'), keyed('s3RefRight')],
      why: {
        0: [keyed('fbNotQuite'), keyed('s3RefWrongAdd')],
        1: [keyed('fbNotQuite'), keyed('s3RefWrongSub')]
      }
    });
    fig.T.region.classList.add('is-lit');
    fig.B.set(fig.T.a0, fig.T.a1, '260°');
    await anim(popIn(fig.B.lbl, { from: 0.7 }));
    await wait(SHORT);

    /* The term, and the rule. */
    await say(keyed('s3RefReflex'));
    await wait(SHORT);
    var rule = ruleCard(panel, tr('s3RuleInGeneral'), tr('s3LblCentralMajor') + ' ' + EQ + ' ' +
      '<span class="c-ang">360° − θ</span>', 'sa-rule--small');
    await Promise.all([say(keyed('s3RefGeneral'), 'happy'), rule.shown]);
    rule.el.classList.add('is-glow');
    fig.T.region.classList.remove('is-lit');
    await wait(BEAT);
    await handOver();
  }


  /* ---- 17. Which angle for the major area (slide 44) ---------------------------- */
  async function sMajorAngle() {
    var sc = await stage('split');
    var fig = majorFigure(sc, 100, { majorLabel: '260°' });
    /* The question asked from a perch: the bird and its bubble above, the
       three angles as plain tiles, and the formula card under the FIGURE,
       where the practice pages carry theirs (.sa-scene--practice): in the
       panel it took the room the bird needs to stand at its full size
       (user, 2026-10-09: one size for the bird wherever it is on the right). */
    var panel = h('div', 'sa-panel sa-panel--practice', null, sc);
    var P = perchIn(panel);
    P.row.classList.add('sa-speak--above');
    P.bubble.classList.add('sa-bubble--sun');
    var slot = h('div', 'sa-qslot', null, panel);
    sc.classList.add('sa-scene--practice');
    /* the rule of the screen before: the major sector's own angle, 360° − θ */
    var rule = ruleCard(sc, tr('s3RuleAreaMajor'),
      c('a', 'A') + EQ + '<span class="frac c-ang"><span class="frac__n" data-k="num">360° − θ</span>' +
      '<span class="frac__d">360</span></span>' + X + PIR2, 'sa-rule--small');
    var num = rule.el.querySelector('[data-k="num"]');
    M.set(rule.el, { opacity: 0 });
    var Q = keyed('s3MaAsk');

    await hush();                /* the bird stays: it hops to the perch next */
    await fig.draw();
    await angleIn(fig.B);
    await anim(fadeIn(P.row, { y: 0 }));
    await perchSay(P, Q);
    var voice = bubbleVoice(P, Q);
    await askChoice(['100°', '260°', '360°'], 1, {
      host: slot, tiles: true, voice: voice, stagger: 0.35,
      /* the card comes in as the voice reads it out -- voice only, the card
         is its text (s3P3Rule); an answer said over it cuts it short */
      onShown: function () {
        quiet(anim(cardIn(rule.el)));
        if (Flow.isFast()) return;
        var mine = speaking;
        mascot.state('talking');
        quiet(voiceOf({ text: '', vo: 's3P3Rule' })).then(function () {
          if (mine === speaking) mascot.settle();
        }, function () {});
      },
      yes: keyed('fbThatsCorrect'),
      why: {
        0: [keyed('fbNotQuite'), keyed('s3MaWrong100')],
        2: [keyed('fbNotQuite'), keyed('s3MaWrong360')]
      },
      onWrong: function (i) {
        var r = i === 0 ? fig.S.region : null;
        if (!r) return;
        r.classList.add('is-lit');
        quiet(wait(1400).then(function () { r.classList.remove('is-lit'); }));
      }
    });
    voice.stop();

    /* The card filled in: 360° − θ becomes 360° − 100°, which becomes 260. */
    fig.T.region.classList.add('is-lit');
    async function swap(html) {
      await anim(M.to(num, { opacity: 0, filter: 'blur(5px)', duration: M.dur(0.3), ease: 'power2.in' }));
      num.innerHTML = html;
      await anim(M.to(num, { opacity: 1, filter: 'blur(0px)', duration: M.dur(0.4), ease: 'power2.out' }));
    }
    await wait(SHORT);
    await swap('360° − 100°');
    quiet(anim(M.fromTo(fig.A.lbl, { scale: 1, transformOrigin: '50% 50%' },
      { scale: 1.35, duration: M.dur(0.28), ease: 'power2.out', yoyo: true, repeat: 1 })));
    await wait(1200);
    await swap('260');
    quiet(anim(M.fromTo(fig.B.lbl, { scale: 1, transformOrigin: '50% 50%' },
      { scale: 1.35, duration: M.dur(0.28), ease: 'power2.out', yoyo: true, repeat: 1 })));
    rule.el.classList.add('is-glow');
    await wait(SHORT);
    await say(keyed('s3MaSo'), 'happy');
    await wait(BEAT);
    await handOver();
  }



  /* ---- 18. A worked major sector (slides 45-50) --------------------------------- */
  async function sWorkedMajor() {
    var sc = await stage('work');
    var col = h('div', 'sa-wk sa-wk--align', null, sc);
    var fig = majorFigure(sc, 45, { minorLabel: '45°', majorLabel: '360° − θ = ?', rAlong: tr('s3LblR14') });

    /* The formula only: r and θ are already on the figure (see sWorked). */
    var head = h('div', 'sa-wk__head',
      '<p class="sa-wk__formula"><b>' + tr('s3Formula') + '</b> ' + c('a', 'A') + EQ + fr('360° − θ', '360', 'c-ang') + X + PIR2 + '</p>', col);
    var formula = head.querySelector('.sa-wk__formula');
    M.set(formula, { opacity: 0 });
    var list = h('div', 'steps', null, col);
    function bitsRow(n, parts) {
      var r = stepRow(list, n, parts.map(function (x) { return '<span class="sa-work__bit">' + x + '</span>'; }).join(''));
      r.__bits = Array.prototype.slice.call(r.querySelectorAll('.sa-work__bit'));
      M.set(r.__bits, { opacity: 0 });
      return r;
    }
    var s1 = stepRow(list, 1, c('ang', '360° − θ') + EQ + c('ang', '360° − 45°') + EQ + DD);
    var s2 = stepRow(list, 2, c('a', 'A') + EQ + fr('315', '360', 'c-ang') + X + fr('22', '7', 'c-pi') + X + DD);
    var s3 = bitsRow(3, [c('a', 'A'), EQ, fr('7', '8', 'c-ang'), X, c('pi', '22'), X, c('r', '2'), X, c('r', '14')]);
    var s4 = bitsRow(4, [c('a', 'A'), EQ, fr('7', '8', 'c-ang'), X, c('pi', '616')]);
    var s5 = stepRow(list, 5, c('a', 'A') + EQ + DD);
    var d1 = dropdown(ddIn(s1), ['315°', '135°', '45°'], 0);
    var d2 = dropdown(ddIn(s2), [c('r', '14²'), c('r', '14'), c('r', '28²')], 0);
    var d5 = dropdown(ddIn(s5), [tr('s3Val539sq'), tr('val77sq'), tr('val616sq')], 0, { up: true });
    function pulse(el) {
      if (!el) return;
      quiet(anim(M.fromTo(el, { scale: 1, transformOrigin: '50% 50%' },
        { scale: 1.35, duration: M.dur(0.28), ease: 'power2.out', yoyo: true, repeat: 1 })));
    }
    async function writeRow(r) {
      await stepIn(r);
      for (var i = 0; i < r.__bits.length; i++) {
        await anim(M.fromTo(r.__bits[i], { opacity: 0, y: 8, scale: 0.88 },
          { opacity: 1, y: 0, scale: 1, duration: M.dur(0.32), ease: 'back.out(1.6)' }));
        await wait(220);
      }
      stepDone(r);
    }

    /* The figure first, with nothing said; then the problem. */
    await leaveHeader();
    await fig.draw();
    await angleIn(fig.B);
    await wait(SHORT);
    await say(keyed('s3FindMajor'));
    /* r and θ, picked out on the figure: that is the given. */
    pulse(fig.R);
    await wait(SHORT);
    pulse(fig.A.lbl);
    await wait(LOOK);
    await anim(fadeIn(formula, { y: 6 }));
    await wait(LOOK);

    /* 1. The major sector's own angle. */
    await stepIn(s1);
    await say(keyed('s3WmFirst'));
    pulse(fig.B.lbl);
    await d1.ask({
      yes: [keyed('fbThatsCorrect'), keyed('s3WmRight')],
      why: {
        1: [keyed('fbNotQuite'), keyed('s3FullTurn360')],
        2: [keyed('fbNotQuite'), keyed('s3WmWrong45')]
      }
    });
    stepDone(s1);
    fig.B.set(fig.T.a0, fig.T.a1, '360° − θ = 315°');
    await anim(popIn(fig.B.lbl, { from: 0.8 }));

    /* 2. r into the formula, with π = 22/7 said first. */
    await stepIn(s2);
    await say(keyed('s3WmPutR'));
    pulse(fig.R);
    await d2.ask({
      yes: [keyed('fbThatsCorrect'), keyed('s3WmRRight')],
      why: {
        1: [keyed('fbNotQuite'), keyed('s3WmRWrong14')],
        2: [keyed('fbNotQuite'), keyed('s3WmRWrong28')]
      }
    });
    stepDone(s2);

    /* 3-4. The simplification, written as the voice reads it out (voice
       only, as on the worked minor sector). */
    await voiceAlone('s3WmSimplify', function () { return writeRow(s3); });
    await wait(SHORT);
    await voiceAlone('s3WmProduct', function () { return writeRow(s4); });
    await wait(SHORT);

    /* 5. The answer, found by the learner. */
    await stepIn(s5);
    await say(keyed('s3FindArea'));
    await d5.ask({
      yes: keyed('fbThatsCorrect'),
      why: {
        1: [keyed('fbNotQuite'), keyed('s3WmWrongMinor')],
        2: [keyed('fbNotQuite'), keyed('s3WmWrongWhole')]
      }
    });
    stepDone(s5);
    burstAt(s5);

    /* What was found, said -- and set in the major sector. */
    fig.T.region.classList.add('is-focus');
    var fp = pt(fig.C, 92, 180);
    var fl = text(fig.C.top, fp.x, fp.y, tr('s3Val539sq'), 'lbl lbl--area s-found-lbl');
    await Promise.all([say(keyed('s3WmFound'), 'happy'), anim(popIn(fl, { from: 0.4 }))]);
    fig.T.region.classList.remove('is-focus');
    await wait(BEAT);
    await handOver();
  }


  /* ---- 19. Another way (slides 51-54) ---------------------------------------------
     The same sector, by subtraction: the whole circle, less the minor
     sector, is the major sector. */
  async function sAnotherWay() {
    var sc = await stage('split');
    var fig = majorFigure(sc, 45, { minorLabel: '45°', majorLabel: '360° − θ = 315°', rAlong: tr('s3LblR14') });
    /* Two questions from a perch, one after the other: the bird and its
       bubble above, the answers as tiles, and each answer found set on a
       card underneath, so the two build up into the working. */
    var panel = h('div', 'sa-panel sa-panel--practice', null, sc);
    var P = perchIn(panel);
    P.row.classList.add('sa-speak--above');
    P.bubble.classList.add('sa-bubble--sun');
    var slot = h('div', 'sa-qslot', null, panel);
    var found = h('div', 'sa-found', null, panel);

    async function ask(q, opts, why, yesNote, first) {
      if (first) await perchSay(P, q); else await say(q);
      var voice = bubbleVoice(P, q);
      slot.textContent = '';
      await askChoice(opts, 0, { host: slot, tiles: true, voice: voice, stagger: 0.3,
                                 yes: keyed('fbThatsCorrect'), why: why });
      voice.stop();
      await wait(700);
      var tiles = Array.prototype.slice.call(slot.children);
      await anim(fadeOut(tiles));
      slot.textContent = '';
      P.bubble.classList.remove('is-yes', 'is-no');
      var ln = h('p', 'sa-found__row', yesNote, found);
      await anim(fadeIn(ln, { y: 8 }));
    }

    await leaveHeader();
    await fig.draw();
    await angleIn(fig.B);
    /* What this screen sets out to do, across the top of the board; the
       bird asks each question under it. */
    dom.board.classList.add('has-given');
    await sayTop(keyed('s3AwIntro'));
    await anim(fadeIn(P.row, { y: 0 }));
    await ask(keyed('s3AwAskCircle'),
      [tr('s3CmSq', { n: c('pi', '196π') }), tr('s3CmSq', { n: c('pi', '28π') }), tr('s3CmSq', { n: c('pi', '784π') })],
      { 1: [keyed('fbNotQuite'), keyed('s3AwWrong28Pi')],
        2: [keyed('fbNotQuite'), keyed('s3AwWrong784')] },
      tr('s3LblAreaOfCircle') + ' ' + EQ + ' ' + c('pi', 'π') + X + c('r', '14²') + EQ + tr('s3CmSq', { n: c('pi', '196π') }), true);
    await ask(keyed('s3AwAskMinor'),
      [fr('1', '8', 'c-ang') + X + c('pi', '196π'), fr('7', '8', 'c-ang') + X + c('pi', '196π'),
       fr('1', '8', 'c-ang') + X + c('pi', '784π')],
      { 1: [keyed('fbNotQuite'), keyed('s3AwWrong78')],
        2: [keyed('fbNotQuite'), keyed('s3AwWrong784Pi')] },
      tr('s3LblAreaMinor') + ' ' + EQ + ' ' + fr('1', '8', 'c-ang') + X + tr('s3CmSq', { n: c('pi', '196π') }));
    fig.S.region.classList.add('is-lit');
    await wait(BEAT);
    await handOver();

    /* Page two: the bird leaves its perch, the line at the top goes, and the
       subtraction is worked out in the panel. */
    await perchOut();
    await anim(Beats.lineOut(dom.promptLine));
    clearPrompt();
    dom.board.classList.remove('has-given');
    var old = Array.prototype.slice.call(panel.children);
    panel.className = 'sa-panel sa-panel--centre';
    await anim(fadeOut(old));
    old.forEach(function (o) { panel.removeChild(o); });
    fig.S.region.classList.remove('is-lit');
    /* the working on the shared grid: every = in one column */
    await say(keyed('s3MajorByDiff'));
    await writeSteps(panel, [
      [tr('s3LblMajorSector'), [[tr('s3WordCircle')], [MINUS], [tr('s3WordMinorSector')]]],
      ['', [['196π'], [MINUS], [fr('1', '8', 'c-ang')], [X], ['196π']]],
      ['', [[fr('7', '8', 'c-ang')], [X], ['196π']]],
      ['', [[c('ans', tr('s3Val539sq'))]]]
    ]);
    fig.T.region.classList.add('is-lit');
    await say(keyed('s3AwSame'), 'happy');
    await wait(BEAT);
    await handOver();
  }

  /* ---- 20. Two rules for the major sector (slide 55) ------------------------------ */
  async function sMajorRules() {
    var sc = await stage('split');
    var fig = majorFigure(sc, 70, { minorLabel: 'θ', majorLabel: '360° − θ' });
    var panel = h('div', 'sa-panel sa-panel--centre', null, sc);
    var r1 = ruleCard(panel, tr('s3RuleAreaAMajor'),
      c('a', 'A') + EQ + fr('360 − θ', '360', 'c-ang') + X + PIR2, 'sa-rule--small');
    var r2 = ruleCard(panel, tr('s3RuleOr'),
      c('a', 'A') + EQ + PIR2 + MINUS + tr('s3WordAreaMinor'), 'sa-rule--small');
    M.set([r1.el, r2.el], { opacity: 0 });

    /* The circle is drawn first, with nothing said, and only then talked
       about. */
    await leaveHeader();
    await fig.draw();
    await angleIn(fig.B);
    await wait(SHORT);
    await say(keyed('s3MrTwoWays'));
    fig.T.region.classList.add('is-lit');
    await say(keyed('s3MrWay1'));
    await anim(cardIn(r1.el));
    await wait(LOOK);
    await say(keyed('s3MrWay2'));
    await anim(cardIn(r2.el));
    r1.el.classList.add('is-glow');
    r2.el.classList.add('is-glow');
    await wait(BEAT);
    await handOver();
  }

  /* ---- 21-22. Practice: major sectors (slides 56-59) ------------------------------- */
  function litMajor(fig) { fig.T.region.classList.add('is-lit'); }
  function sPractice3() {
    var RULE = [keyed('fbNotQuite'), keyed('s3P3Rule')];
    return practice({
      theta: 120, r: tr('s3LblR21'), major: true, majorLabel: '?',
      prompt: keyed('s3FindMajor'),
      rule: c('a', 'A') + EQ + fr('360 − θ', '360', 'c-ang') + X + PIR2,
      options: [tr('s3Val924sq'), tr('val462sq'), tr('s3Val1386sq')], right: 0,
      why: { 1: RULE, 2: RULE },
      lit: function (fig) {
        litMajor(fig);
        fig.majorA.set(fig.T.a0, fig.T.a1, '240°');
      },
      steps: function (fig) {
        return [
          [c('ang', '360° − θ'), [[c('ang', '360° − 120°'), fig.A.lbl], [EQ], [c('ang', '240°'), fig.majorA.lbl]]],
          [c('a', 'A'), [[fr('240', '360', 'c-ang'), fig.majorA.lbl], [X], [PIR2]]],
          ['', [[fr('2', '3', 'c-ang')], [X], [fr('22', '7', 'c-pi')], [X], [c('r', '21²'), fig.R]]],
          ['', [[fr('2', '3', 'c-ang')], [X], [c('pi', '1386')]]],
          ['', [[c('ans', tr('s3Val924sq'))]]]
        ];
      },
      found: {
        label: tr('s3Val924sq'),
        at: function (fig) { return pt(fig.C, 112, 270); },
        region: function (fig) { return fig.T.region; },
        say: keyed('s3P3Found')
      }
    }).then(handOver);
  }

  function sPractice4() {
    var RULE = [keyed('fbNotQuite'), keyed('s3MajorByDiff')];
    return practice({
      theta: 90, r: tr('s3LblR28'), major: true, majorLabel: '?',
      given: keyed('s3P4Given'),
      prompt: keyed('s3FindMajor'),
      tag: tr('s3TagRemember'),
      rule: c('a', tr('s3WordMajor')) + EQ + PIR2 + MINUS + c('a', tr('s3WordMinor')),
      options: [tr('s3Val1848sq'), tr('s3Val1232sq'), tr('val616sq')], right: 0,
      why: { 1: RULE, 2: RULE },
      lit: litMajor,
      steps: function (fig) {
        return [
          [c('a', tr('s3LblMajorSector')), [[tr('s3WordCircleCap')], [MINUS], [tr('s3LblMinorSector')]]],
          ['', [[c('pi', '2464'), fig.C.disc], [MINUS], [c('ang', '616'), fig.S.region]]],
          ['', [[c('ans', tr('s3Val1848sq'))]]]
        ];
      },
      found: {
        label: tr('s3Val1848sq'),
        at: function (fig) { return pt(fig.C, 112, 270); },
        region: function (fig) { return fig.T.region; },
        say: keyed('s3P4Found')
      }
    }).then(handOver);
  }


  /* ---- 23. Find the angle (slides 60-63) -------------------------------------------
     The formula worked backwards: the area is known, the angle is not. */


  /* ---- 24. A paper fan (slides 64-65) ----------------------------------------------
     The fan opens out from shut, fold by fold, to 135°. */
  async function sFan() {
    var sc = await stage('split');
    sc.classList.add('sa-scene--practice');
    sc.style.gridTemplateColumns = 'minmax(0, 1.3fr) minmax(0, 1fr)';
    var F = figure(sc, '-6 92 432 252');
    var C = { x: 210, y: 330, r: 230 };
    var g = svgEl('g', {}, F.svg);
    var N = 10;
    var folds = [];
    for (var i = 0; i < N; i++) folds.push(svgEl('path', { 'class': i % 2 ? 's-fan-fold' : 's-fan-paper' }, g));
    var ribs = [];
    for (var j = 0; j <= N; j++) ribs.push(svgEl('path', { 'class': 's-fan-rib' }, g));
    var edge = svgEl('path', { 'class': 's-fan-edge' }, g);
    var ang = svgEl('path', { 'class': 's-angle' }, g);
    /* the rib that is measured, drawn over the others in the radius ink */
    var mRib = svgEl('path', { 'class': 's-radar-line' }, g);
    svgEl('circle', { 'class': 's-fan-pin', cx: C.x, cy: C.y, r: 9 }, g);
    var aLbl = text(g, 210, 268, '135°', 'lbl lbl--angle');
    var A1 = 90 + 135 / 2;                         /* the measured rib's angle */
    var mid = pt(C, 128, A1), off = pt({ x: 0, y: 0 }, 22, A1 + 90);
    var rot = -A1;
    while (rot <= -90) rot += 180;
    while (rot > 90) rot -= 180;
    var rg = svgEl('g', { transform: 'rotate(' + r2(rot) + ' ' + r2(mid.x + off.x) + ' ' + r2(mid.y + off.y) + ')' }, g);
    var ribLbl = text(rg, mid.x + off.x, mid.y + off.y, tr('s3Lbl28cm'), 'lbl lbl--radius lbl--along');
    ribLbl.style.fontSize = '26px';
    aLbl.style.fontSize = '26px';
    var open = { s: 4 };
    function drawFan() {
      var s = open.s, a0 = 90 - s / 2;
      for (var i = 0; i < N; i++) folds[i].setAttribute('d', bandD(C, 26, C.r, a0 + s * i / N, a0 + s * (i + 1) / N));
      for (var j = 0; j <= N; j++) ribs[j].setAttribute('d', segD(C, pt(C, C.r - 4, a0 + s * j / N)));
      edge.setAttribute('d', arcD(C, C.r, a0, a0 + s));
      ang.setAttribute('d', arcD(C, 40, a0, a0 + s));
    }
    drawFan();
    mRib.setAttribute('d', segD(C, pt(C, C.r - 2, A1)));
    M.set([aLbl, ribLbl, ang, mRib], { opacity: 0 });
    M.set(g, { opacity: 0 });

    var panel = h('div', 'sa-panel sa-panel--practice', null, sc);
    var P = perchIn(panel);
    P.row.classList.add('sa-speak--above');
    P.bubble.classList.add('sa-bubble--sun');
    var slot = h('div', 'sa-qslot', null, panel);
    var given = ruleCard(sc, tr('s3TagRemember'), c('a', 'A') + EQ + fr('θ', '360', 'c-ang') + X + PIR2, 'sa-rule--small');
    M.set(given.el, { opacity: 0 });

    /* 1. The angle: the fan opens out to 135°, and the angle is marked. */
    await say(keyed('s3FanOpens'));
    await anim(M.to(g, { opacity: 1, duration: M.dur(0.3) }));
    Beats.pop();
    await anim(M.to(open, { s: 135, duration: M.dur(1.6), ease: 'power3.out', onUpdate: drawFan }));
    await angleIn({ arc: ang, lbl: aLbl });
    await wait(LOOK);

    /* 2. The rib: one rib picked out, and its length written along it. */
    await say(keyed('s3FanRib'));
    await anim(Beats.growLine(mRib, 0.8, 'power2.inOut'));
    await anim(fadeIn(ribLbl, { y: 0 }));
    await wait(LOOK);

    /* 3. The paper itself: the fan folds shut and opens again, so the
          paper it spreads is seen -- the area being asked about. */
    await hush();                /* the bird stays: it hops to the perch next */
    M.set([ang, aLbl, mRib, ribLbl], { opacity: 0 });
    await anim(M.to(open, { s: 12, duration: M.dur(0.8), ease: 'power2.in', onUpdate: drawFan }));
    Beats.pop();
    await anim(M.to(open, { s: 135, duration: M.dur(1.2), ease: 'back.out(1.2)', onUpdate: drawFan }));
    M.set([ang, aLbl, mRib, ribLbl], { opacity: 1 });
    folds.forEach(function (f) { f.classList.add('is-flash2'); });

    /* The question from the perch, the answers one by one, then the rule. */
    var Q = keyed('s3FanAsk');
    await anim(fadeIn(P.row, { y: 0 }));
    await perchSay(P, Q);
    var voice = bubbleVoice(P, Q);
    var RULE = [keyed('fbNotQuite'), keyed('s3SectorRule')];
    await askChoice([tr('s3Val924sq'), tr('s3Val2464sq'), tr('s3Val308sq')], 0, {
      host: slot, tiles: true, voice: voice, stagger: 0.35,
      onShown: function () { quiet(anim(cardIn(given.el))); },
      yes: keyed('fbThatsCorrect'),
      why: { 1: RULE, 2: RULE }
    });
    voice.stop();
    await wait(900);

    /* Answered: the question goes, and the solution is written out a piece
       at a time, each number off the figure pulsing there as it is used. */
    var gone = Array.prototype.slice.call(panel.children).concat([given.el]);
    await Promise.all([anim(fadeOut(gone)), perchOut()]);
    gone.forEach(function (x) { if (x.parentNode) x.parentNode.removeChild(x); });
    panel.className = 'sa-panel sa-panel--centre';
    var work = h('div', 'sa-work', null, panel);
    function pulse(el) {
      quiet(anim(M.fromTo(el, { scale: 1, transformOrigin: '50% 50%' },
        { scale: 1.35, duration: M.dur(0.25), ease: 'power2.out', yoyo: true, repeat: 1 })));
    }
    var STEPS = [
      [c('a', 'A'), [[fr('135', '360', 'c-ang'), aLbl], [X], [PIR2]]],
      ['', [[fr('3', '8', 'c-ang')], [X], [fr('22', '7', 'c-pi')], [X], [c('r', '28²'), ribLbl]]],
      ['', [[fr('3', '8', 'c-ang')], [X], [c('pi', '2464')]]],
      ['', [[c('ans', tr('s3Val924sq'))]]]
    ];
    var last = null;
    for (var i = 0; i < STEPS.length; i++) {
      var row = h('div', 'sa-work__row', null, work);
      var l = h('span', 'sa-work__l', STEPS[i][0], row);
      var eq = h('span', 'sa-work__eq', '=', row);
      var r = h('span', 'sa-work__r', null, row);
      var bits = STEPS[i][1].map(function (pc) {
        var sp = h('span', 'sa-work__bit', pc[0], r);
        M.set(sp, { opacity: 0 });
        return { el: sp, from: pc[1] };
      });
      M.set([l, eq], { opacity: 0 });
      await anim(M.fromTo([l, eq], { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: M.dur(0.3), ease: 'power2.out' }));
      for (var j = 0; j < bits.length; j++) {
        if (bits[j].from) pulse(bits[j].from);
        await anim(M.fromTo(bits[j].el, { opacity: 0, y: 8, scale: 0.85 },
          { opacity: 1, y: 0, scale: 1, duration: M.dur(0.32), ease: 'back.out(1.6)' }));
        await wait(260);
      }
      last = row;
      await wait(500);
    }
    last.classList.add('is-answer');
    Beats.sfx('correct');
    burstAt(last);
    await wait(600);

    /* What was found, said -- and set on the paper of the fan. */
    var found = text(g, 210, 190, tr('s3Val924sq'), 'lbl lbl--area s-found-lbl s-found-lbl--fan');
    await Promise.all([
      say(keyed('s3FanFound'), 'happy'),
      anim(popIn(found, { from: 0.4 }))
    ]);
    await wait(BEAT);
    await handOver();
  }


  /* ---- 25. A radar (slides 66-67) ---------------------------------------------------
     The beam sweeps once round the screen and settles on its 45° wedge. */
  async function sRadar() {
    var sc = await stage('split');
    sc.classList.add('sa-scene--practice');
    var F = figure(sc, '40 40 340 340');
    var C = { x: 210, y: 210, r: 150 };
    var a0 = 45, a1 = 90;                   /* the scanned wedge: 45° to 90° */
    var g = svgEl('g', {}, F.svg);
    var sea = svgEl('circle', { 'class': 's-sea', cx: C.x, cy: C.y, r: C.r }, g);
    var rings = [50, 100].map(function (r) {
      return svgEl('circle', { 'class': 's-sea-ring', cx: C.x, cy: C.y, r: r }, g);
    });
    var cross = svgEl('path', { 'class': 's-sea-ring', d: 'M60 210 H360 M210 60 V360' }, g);
    var wedge = svgEl('path', { 'class': 's-beam', d: wedgeD(C, C.r, a0, a1) }, g);
    var trail = svgEl('path', { 'class': 's-trail' }, g);
    var beam = svgEl('path', { 'class': 's-beam s-beam--sweep' }, g);
    var rUp = svgEl('path', { 'class': 's-radar-line', d: segD(C, pt(C, C.r, a1)) }, g);
    var rSide = svgEl('path', { 'class': 's-radar-line', d: segD(C, pt(C, C.r, a0)) }, g);
    var ang = svgEl('path', { 'class': 's-angle', d: arcD(C, 34, a0, a1) }, g);
    var dot = svgEl('circle', { 'class': 'centre__dot', cx: C.x, cy: C.y, r: 6.5 }, g);
    var lp = pt(C, 58, (a0 + a1) / 2);
    var aLbl = text(g, lp.x, lp.y, '45°', 'lbl lbl--angle');
    /* the range named along the radius it measures, on the side away from
       the wedge, turned to run with the line */
    var rg = svgEl('g', { transform: 'rotate(90 ' + (C.x - 20) + ' ' + (C.y - 75) + ')' }, g);
    var rLbl = text(rg, C.x - 20, C.y - 75, tr('s3Lbl28km'), 'lbl lbl--radius lbl--along');
    M.set([sea, rings[0], rings[1], cross, wedge, trail, beam, rUp, rSide, ang, dot, aLbl, rLbl], { opacity: 0 });

    var panel = h('div', 'sa-panel sa-panel--practice', null, sc);
    var P = perchIn(panel);
    P.row.classList.add('sa-speak--above');
    P.bubble.classList.add('sa-bubble--sun');
    var slot = h('div', 'sa-qslot', null, panel);
    var given = ruleCard(sc, tr('s3TagRemember'), c('a', 'A') + EQ + fr('θ', '360', 'c-ang') + X + PIR2, 'sa-rule--small');
    M.set(given.el, { opacity: 0 });

    /* 1. The range: the screen of the radar drawn, and its reach, 28 km,
          run out from the centre to the edge. */
    await say(keyed('s3RadarRange'));
    await anim(M.fromTo(sea, { opacity: 0, scale: 0.3, transformOrigin: '50% 50%' },
      { opacity: 1, scale: 1, duration: M.dur(0.7), ease: 'back.out(1.4)' }));
    await anim(M.to(rings.concat([cross]), { opacity: 1, duration: M.dur(0.4), stagger: M.gap(0.12) }));
    await anim(Beats.plotDot(dot, 0.35));
    await anim(Beats.growLine(rUp, 0.8, 'power2.inOut'));
    await anim(fadeIn(rLbl, { y: 0 }));
    await wait(LOOK);

    /* 2. The angle: the second radius, the 45° between them, and the wedge
          it scans. */
    await say(keyed('s3RadarScan'));
    await anim(Beats.growLine(rSide, 0.8, 'power2.inOut'));
    await anim(Beats.secFill(wedge, function (t) { return wedgeD(C, C.r, a1 - (a1 - a0) * t, a1); }, 0.8));
    await angleIn({ arc: ang, lbl: aLbl });
    await wait(LOOK);

    /* 3. The scan itself: the beam goes once round the screen, trailing
          light, and comes to rest on its wedge -- the area it covers. */
    await hush();                /* the bird stays: it hops to the perch next */
    var spin = { a: a1 };
    function drawBeam() {
      beam.setAttribute('d', wedgeD(C, C.r, spin.a - 45, spin.a));
      trail.setAttribute('d', wedgeD(C, C.r, spin.a, spin.a + 60));
    }
    drawBeam();
    M.set([beam, trail], { opacity: 1 });
    M.set(trail, { opacity: 0.35 });
    await anim(M.to(spin, { a: a1 - 360, duration: M.dur(2.6), ease: 'power1.inOut', onUpdate: drawBeam }));
    await anim(M.to([beam, trail], { opacity: 0, duration: M.dur(0.4) }));
    wedge.classList.add('is-flash2');

    /* The question from the perch, the answers one by one, then the rule. */
    var Q = keyed('s3RadarAsk');
    await anim(fadeIn(P.row, { y: 0 }));
    await perchSay(P, Q);
    var voice = bubbleVoice(P, Q);
    var RULE = [keyed('fbNotQuite'), keyed('s3SectorRule')];
    await askChoice([tr('s3Val308km'), tr('s3Val2464km'), tr('s3Val616km')], 0, {
      host: slot, tiles: true, voice: voice, stagger: 0.35,
      onShown: function () { quiet(anim(cardIn(given.el))); },
      yes: keyed('fbThatsCorrect'),
      why: { 1: RULE, 2: RULE }
    });
    voice.stop();
    await wait(900);

    /* Answered: the question goes, and the working is set out -- one step
       a line, the equals signs in a column. */
    var gone = Array.prototype.slice.call(panel.children).concat([given.el]);
    await Promise.all([anim(fadeOut(gone)), perchOut()]);
    gone.forEach(function (x) { if (x.parentNode) x.parentNode.removeChild(x); });
    panel.className = 'sa-panel sa-panel--centre';
    var work = h('div', 'sa-work', null, panel);
    /* The solution written a piece at a time: each line's terms arrive one
       after another, and a number that comes off the figure makes its label
       there pulse as it is written. */
    function pulse(el) {
      quiet(anim(M.fromTo(el, { scale: 1, transformOrigin: '50% 50%' },
        { scale: 1.35, duration: M.dur(0.25), ease: 'power2.out', yoyo: true, repeat: 1 })));
    }
    var STEPS = [
      [c('a', 'A'), [[fr('45', '360', 'c-ang'), aLbl], [X], [PIR2]]],
      ['', [[fr('1', '8', 'c-ang')], [X], [fr('22', '7', 'c-pi')], [X], [c('r', '28²'), rLbl]]],
      ['', [[fr('1', '8', 'c-ang')], [X], [c('pi', '2464')]]],
      ['', [[c('ans', tr('s3Val308km'))]]]
    ];
    var last = null;
    for (var i = 0; i < STEPS.length; i++) {
      var row = h('div', 'sa-work__row', null, work);
      var l = h('span', 'sa-work__l', STEPS[i][0], row);
      var eq = h('span', 'sa-work__eq', '=', row);
      var r = h('span', 'sa-work__r', null, row);
      var bits = STEPS[i][1].map(function (pc) {
        var sp = h('span', 'sa-work__bit', pc[0], r);
        M.set(sp, { opacity: 0 });
        return { el: sp, from: pc[1] };
      });
      M.set([l, eq], { opacity: 0 });
      await anim(M.fromTo([l, eq], { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: M.dur(0.3), ease: 'power2.out' }));
      for (var j = 0; j < bits.length; j++) {
        if (bits[j].from) pulse(bits[j].from);
        await anim(M.fromTo(bits[j].el, { opacity: 0, y: 8, scale: 0.85 },
          { opacity: 1, y: 0, scale: 1, duration: M.dur(0.32), ease: 'back.out(1.6)' }));
        await wait(260);
      }
      last = row;
      await wait(500);
    }
    last.classList.add('is-answer');
    Beats.sfx('correct');
    burstAt(last);
    await wait(600);

    /* What was found, said -- and set on the figure, in the wedge it
       measures. */
    var ap = pt(C, 108, (a0 + a1) / 2 - 7);
    var found = text(g, ap.x, ap.y, tr('s3Val308km'), 'lbl lbl--area s-found-lbl');
    wedge.classList.remove('is-flash2');
    wedge.classList.add('is-focus');
    await Promise.all([
      say(keyed('s3RadarFound'), 'happy'),
      anim(popIn(found, { from: 0.4 }))
    ]);
    await wait(BEAT);
    await handOver();
  }


  /* ---- 26. A sprinkler (slides 68-71) -------------------------------------------------
     The spray fans out over the lawn to 120°; then the part it misses. */


  /* ---- 27. The end ------------------------------------------------------------------- */
  async function sFinish() {
    /* The lesson summed up on one circle: drawn whole with nothing said;
       the minor sector lit and its formula set beside it; then the major
       sector lit and its formula; then both at rest, and the bird's last
       word. */
    var sc = await stage('split');
    var F = figure(sc);
    var C = circle(F.svg, 210, 210, 150);
    var a0 = 50, a1 = 150;
    var S = sector(C, a0, a1, 'minor');
    var T = sector(C, a1, a0 + 360, 'major', { radii: false });
    var A = angleMark(C, a0, a1, 'θ', { r: 34 });
    A.lbl.classList.add('lbl--big');
    var B = angleMark(C, a1, a0 + 360, '360° − θ', { r: 48, major: true, cls: 'lbl--major', gap: 26 });
    var rm = pt(C, 84, a1 + 11);
    var rl = text(C.top, rm.x, rm.y, 'r', 'lbl lbl--radius lbl--big');
    /* the rim as two arcs, so each sector's own edge can step back with it */
    var rimMinor = svgEl('path', { 'class': 'figure__rim', d: arcD(C, C.r, a0, a1) });
    var rimMajor = svgEl('path', { 'class': 'figure__rim', d: arcD(C, C.r, a1, a0 + 360) });
    C.g.insertBefore(rimMinor, C.rim.nextSibling);
    C.g.insertBefore(rimMajor, rimMinor);
    var panel = h('div', 'sa-panel sa-panel--centre', null, sc);
    var ra = ruleCard(panel, tr('s3RuleAreaMinor'), c('a', 'A') + EQ + fr('θ', '360', 'c-ang') + X + PIR2);
    var rb = ruleCard(panel, tr('s3RuleAreaMajor'), c('a', 'A') + EQ + fr('360° − θ', '360', 'c-ang') + X + PIR2);
    M.set([ra.el, rb.el], { opacity: 0 });

    function focus(onEls, offEls) {
      onEls.forEach(function (e) { e.style.transition = 'opacity .6s ease, filter .6s ease'; e.classList.remove('is-dim', 'is-blur'); });
      offEls.forEach(function (e) { e.style.transition = 'opacity .6s ease, filter .6s ease'; e.classList.add('is-dim', 'is-blur'); });
    }
    var minorEls = [S.region, rimMinor, A.arc, A.lbl];
    var majorEls = [T.region, rimMajor, B.arc, B.lbl];

    await leaveHeader();
    await anim(Beats.drawRim(C.rim, C.tip, { time: SLOW_PEN }));
    await anim(Beats.fillDisc(C.disc));
    await anim(Beats.plotDot(C.dot, 0.35));
    await radii(S, 0.75);
    await anim(fadeIn(rl, { y: 0 }));
    await Promise.all([sweep(S, 0.7), arcIn(S, 0.7)]);
    await Promise.all([sweep(T, 1.0), arcIn(T, 1.0)]);
    show([rimMinor, rimMajor]);
    M.set(C.rim, { opacity: 0 });
    await wait(SHORT);

    /* The minor sector, and its formula. */
    focus(minorEls, [T.region, rimMajor]);
    S.region.classList.add('is-lit');
    await angleIn(A);
    await wait(500);
    await anim(cardIn(ra.el));
    ra.el.classList.add('is-glow');
    await wait(1800);

    /* The major sector, and its formula. */
    ra.el.classList.remove('is-glow');
    S.region.classList.remove('is-lit');
    focus(majorEls, minorEls);
    T.region.classList.add('is-lit');
    await angleIn(B);
    await wait(500);
    await anim(cardIn(rb.el));
    rb.el.classList.add('is-glow');
    await wait(1800);

    /* Both at rest, and the last word. */
    T.region.classList.remove('is-lit');
    focus(minorEls.concat(majorEls), []);
    ra.el.classList.add('is-glow');
    await say(keyed('s3FinishBye'), 'celebrating');
    Beats.sfx('cheer');
    burstAt(ra.el);
    await wait(260);
    burstAt(rb.el);
    await wait(400);
    burstAt(dom.slotHeader);
    mascot.state('celebrating');
    await wait(900);
    /* The skill is done, and the lesson goes on: Next, as every skill ends,
       and the next skill's first beat wipes this one away. */
    mascot.settle();
    await handOver();
  }


  /* ======================================================================
   * Joined to the lesson -- see addSection in pages.js
   * ====================================================================== */

  /* This skill's stylesheet is scoped to body.sa-lesson (see the head of
     css/sector-area.css): on while its scenes play, off once reset() has
     put its board away, so it is never on under another skill. */
  function lessonOn() { document.body.classList.add('sa-lesson'); }
  function lessonOff() { document.body.classList.remove('sa-lesson'); }

  /* Every scene but the intro turns it on as it starts -- a jump from the
     level bar lands mid-skill with it off. The intro turns it on itself,
     once it has wiped the skill before away. */
  function own(play, first) {
    return function () {
      if (!first) lessonOn();
      return play();
    };
  }

  var SCENES = [
    { name: 'Sector intro',       play: own(sWelcome, true) },
    { name: 'Which is a sector?', play: own(sPickSector) },
    { name: 'Name the sectors',   play: own(sNameSectors) },
    { name: 'Terms intro',        play: own(sTermsIntro) },
    { name: 'Central angle term', play: own(sCentralTerm) },
    { name: 'Tap the area',       play: own(sAreaTap) },
    { name: 'Area for θ',         play: own(sAreaDerive) },
    { name: 'Apply intro',        play: own(sApplyIntro) },
    { name: 'Worked example',     play: own(sWorked) },
    { name: 'Practice 1',         play: own(sPractice1) },
    { name: 'Which is bigger?',   play: own(sCompare) },
    { name: 'Major intro',        play: own(sMajorIntro) },
    { name: 'Reflex angle',       play: own(sReflex) },
    { name: 'Major: which angle', play: own(sMajorAngle) },
    { name: 'Worked: major',      play: own(sWorkedMajor) },
    { name: 'Another way',        play: own(sAnotherWay) },
    { name: 'Major formulas',     play: own(sMajorRules) },
    { name: 'Practice 3',         play: own(sPractice3) },
    { name: 'Practice 4',         play: own(sPractice4) },
    { name: 'Paper fan',          play: own(sFan) },
    { name: 'Radar',              play: own(sRadar) },
    { name: 'Well done!',         play: own(sFinish) }
  ];

  /* Once, when the board exists: the shared board's pieces, the one bird,
     and the two typers pages.js speaks through -- one owner per box. The
     stage and the confetti layer are this skill's own (index.html); the
     gate is its own too, so its waits never answer the lesson's. */
  function build() {
    var d = K.dom();
    var gate = document.createElement('span');
    gate.hidden = true;
    d.frame.appendChild(gate);
    dom = {
      frame: d.frame, board: d.board, stage: $('saStage'),
      slotHero: d.slotHero, slotHeader: d.slotHeader, hopper: d.hopper,
      bubble: d.bubble, promptLine: d.promptLine, choices: d.choices, tray: d.tray,
      nextBtn: d.nextBtn, burst: $('saBurst'), gate: gate
    };
    mascot = K.mascot();
    sayBubble = K.typer('bubble');
    sayPrompt = K.typer('prompt');
  }

  /* Nothing of this skill's is in the shared figure. */
  function parts() { return []; }

  /* What it keeps outside the figure, faded with the rest of a wipe: the
     next skill's first beat. reset() then empties it. */
  function wipe() {
    if (!dom) return [];
    var kids = Array.prototype.slice.call(dom.stage.children);
    return kids.length ? [anim(fadeOut(kids))] : [];
  }

  /* Back to rest, with no animation -- the end of every wipe, and every
     replay or jump. The bird is taken home first if it is on a perch in
     the stage, so emptying the stage never takes the one bird with it --
     or if a perch it stood on has already been cleared away under it
     ("Tap the area" does, between its scenes). */
  function reset() {
    if (!dom) return;
    speaking++;
    told++;
    if (mascot && (!mascot.el.isConnected || dom.stage.contains(mascot.el))) {
      mascot.placeIn(dom.slotHero);
    }
    perch = null;
    held = null;
    carry = null;
    keptFig = null;
    parked = null;
    fullTurn = null;
    areaFig = null;
    dom.board.classList.remove('has-given');
    dom.stage.textContent = '';
    dom.burst.textContent = '';
    Array.prototype.forEach.call(dom.frame.querySelectorAll('.sa-fly'),
                                 function (f) { f.parentNode.removeChild(f); });
    lessonOff();
  }

  /* The board as scene i expects to find it. pages.js has already put it
     up with the bird away behind it, which is what every scene from the
     third on opens on. The first finds the board out and the bird on the
     field (its own first beat wipes and finds that itself); the second --
     "Which is a sector?" -- opens there too, and brings the board in. */
  function stageAt(i) {
    if (i <= 0) return;
    lessonOn();
    if (i === 1) {
      dom.board.classList.remove('show');
      dom.board.setAttribute('aria-hidden', 'true');
      mascot.el.classList.remove('is-away');
    }
  }

  Pages.addSection({
    name: 'Sector area',
    skill: 'Skill 3 · Area of a sector',
    scenes: SCENES,
    build: build,
    parts: parts,
    wipe: wipe,
    reset: reset,
    stage: stageAt
  });

  /* ---- the kit, handed over ----------------------------------------------
     Skill 2's formula and practice pages (js/arc-formula.js) are built
     with this skill's pieces -- the figure kit, the perch and its bubble,
     the dropdown blanks, the worked steps, the practice page -- in this
     skill's stage and under its stylesheet, so the two skills' later pages
     are one design. That file is loaded BEFORE this one (its scenes come
     earlier in the lesson) and reads everything here lazily, when a scene
     plays, by which time this object exists. State a scene needs to set
     is behind a function. Nothing of this skill's own scenes is handed
     over. */
  global.SectorArea = {
    BEAT: BEAT, SHORT: SHORT, LOOK: LOOK, PEN: PEN, SWEEP: SWEEP, SLOW_PEN: SLOW_PEN,
    X: X, EQ: EQ, MINUS: MINUS, DD: DD, PIR2: PIR2,
    dom: function () { return dom; },
    mascot: function () { return mascot; },
    held: function (v) { if (arguments.length) held = v; return held; },
    perch: function () { return perch; },
    lessonOn: lessonOn, lessonOff: lessonOff,
    wait: wait, anim: anim, quiet: quiet, tr: tr, keyed: keyed, lineOf: lineOf, voiceOf: voiceOf,
    shuffled: shuffled, praise: praise, oops: oops, svgEl: svgEl, h: h, fr: fr, c: c,
    r2: r2, pt: pt, ringD: ringD, arcD: arcD, wedgeD: wedgeD, bandD: bandD, segD: segD, fmt: fmt,
    fadeIn: fadeIn, popIn: popIn, fadeOut: fadeOut, cardIn: cardIn, settleFig: settleFig,
    figure: figure, text: text, circle: circle, drawCircle: drawCircle, sector: sector,
    radii: radii, sweep: sweep, arcIn: arcIn, show: show, angleMark: angleMark, angleIn: angleIn,
    pointer: pointer, pointTo: pointTo, pointerIn: pointerIn,
    clearPrompt: clearPrompt, speak: speak, mascotJumpIn: mascotJumpIn, mascotJumpOut: mascotJumpOut,
    perchIn: perchIn, perchSay: perchSay, perchOut: perchOut, say: say, bubbleSay: bubbleSay,
    sayTop: sayTop, sayAll: sayAll, voiceAlone: voiceAlone, hush: hush, leaveHeader: leaveHeader, handOver: handOver,
    ripple: ripple, burstAt: burstAt,
    waitPick: waitPick, until: until, clearChoices: clearChoices, askChoice: askChoice,
    dropdown: dropdown, stepRow: stepRow, stepIn: stepIn, stepDone: stepDone, ddIn: ddIn,
    noteCard: noteCard, ruleCard: ruleCard, lineIn: lineIn, clearStage: clearStage, stage: stage,
    bubbleVoice: bubbleVoice, writeSteps: writeSteps, fieldTalk: fieldTalk, keyWord: keyWord,
    flyNumber: flyNumber, dissolveTo: dissolveTo, magnifier: magnifier,
    boxLeader: boxLeader, figToScene: figToScene
  };
})(window);
