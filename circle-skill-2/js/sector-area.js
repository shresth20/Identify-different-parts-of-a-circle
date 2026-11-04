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

  /* praiseWellDone, not p29WellDone: the same words, and the one of the two
     that is recorded (assets/VO-skill 1) */
  var PRAISE = ['fbCorrect', 'praiseWellDone', 's3ThatsRight', 's3GreatJob'];
  /* no "Try again" / "Almost!" (user, 2026-10-12): the pool is "Not quite!"
     and "Oops! Try once more." */
  var OOPS   = ['s3OopsTryAgain', 's3OopsOnceMore'];

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
  /* A line set among lines already drawn to the rim goes under them all, so
     the points they end in (.pt-end and kin) stay on top of it (user,
     2026-10-13: a point is never crossed by a line). */
  function underPoints(el) {
    var first = el.parentNode.querySelector(':scope > .pt-end, :scope > .pt-start, :scope > .pt-ends');
    if (first && first !== el) el.parentNode.insertBefore(el, first);
    return el;
  }

  function sector(C, a0, a1, kind, o) {
    o = o || {};
    var S = { C: C, kind: kind || 'minor' };
    S.region = svgEl('path', { 'class': 's-region s-region--' + S.kind, d: '' }, C.under);
    S.arc = underPoints(svgEl('path', { 'class': 's-arc s-arc--' + S.kind, d: '' }, C.over));
    if (o.radii !== false) {
      S.ra = svgEl('path', { 'class': 's-radius pt-end', d: '' }, C.over);
      S.rb = svgEl('path', { 'class': 's-radius pt-end', d: '' }, C.over);
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
      return Promise.all([perch ? perch.typer(said.text, timed(said)) : sayInHeader(said), heard]);
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
    var reveal = sayPrompt.reserve(line);
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
    return Promise.all([sayBubble(line), heard]);
  }
  function sayTop(text) {
    var line = lineOf(text);
    var reveal = sayPrompt.reserve(line);
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
    /* a bird that is away (a jump from the level bar) comes up onto the
       header first, so the voice is never heard from nobody */
    var up = birdOnHeader() || perch ? Promise.resolve() : mascotJumpIn();
    return up.then(hush).then(function () {
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

  /* A verdict on an answer given beside the figure -- the bird on its perch
     -- is heard and not written (user, 2026-10-29): the question stays in
     the bubble as it was asked, the voice says "Not quite! ..." or "That's
     correct! ..." over it, and the bird acts the mood while it does. A
     newer answer cuts an older run off, as sayAll's do. A line not yet
     recorded holds for the time it would take to say, so whatever waits on
     the verdict keeps its place. */
  function heardOnly(lines, mood) {
    var mine = ++told;
    return [].concat(lines).reduce(function (chain, text, i) {
      return chain.then(function () {
        if (mine !== told) return;
        return (i ? wait(SHORT) : Promise.resolve()).then(function () {
          if (mine !== told) return;
          var line = lineOf(text);
          var from = Date.now();
          mascot.state(mood || 'talking');
          return voiceOf(line).then(function (played) {
            if (played || mine !== told || Flow.isFast()) return;
            return wait(Math.max(VO_MIN, line.text.length * VO_PACE) - (Date.now() - from));
          });
        });
      });
    }, Promise.resolve()).then(function () { if (mine === told) mascot.settle(); });
  }
  /* Where an answer's verdict goes (user, 2026-10-30, game-wide): from
     the bird's bubble on the right it is heard only, the question left
     standing in it; from the header it is written AND heard. */
  function answered(lines, mood) {
    return perch && perch.open ? heardOnly(lines, mood) : sayAll(lines, mood);
  }

  /* The last choice left is the answer (user, 2026-10-29): once every wrong
     one has been tried the learner is not asked to press the one that is
     left -- it is put in for them, and the bird says so first ("Arc is the
     correct answer.") and then why, without the praise a found answer gets.
     `opening` is the page's own line naming the answer; a page that names
     none gets the general one.
       Every wrong pick is answered IN FULL first, the last one too: it
     stays shown red while the voice says why, nothing is live until it
     has, and only then is it taken back -- and the learner asked again,
     or the answer put in (user, 2026-10-29). */
  var PRAISED = ['fbCorrect', 'fbThatsCorrect', 'praiseWellDone', 'praiseAwesome',
                 's3ThatsRight', 's3GreatJob'];
  function autoLines(opening, yes) {
    var why = [].concat(yes || []).filter(function (l) {
      return !(l && typeof l === 'object' && PRAISED.indexOf(l.vo) >= 0);
    });
    return [opening || keyed('fbAutoRight')].concat(why);
  }
  function allTried(list, good) {
    return list.every(function (x) { return x === good || x.__out; });
  }
  var AUTO_AFTER = 500;     /* ms: the last wrong pick taken back before the answer goes in */

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

  /* Where a page's confetti goes up when the page has a picture: ON the
     picture, from the middle of its circle (user, 2026-10-11 -- "it has to
     burst on the figure", not beside it). The picture the element is or
     holds (a sector card) if it has one; else every picture showing (the
     two circles of "Which is bigger?"). Empty on a page with none showing. */
  var FIGS = 'svg.sa-fig, svg.sa-card__fig, svg.sa-cmp__fig';
  function shown(el) {
    var b = el.getBoundingClientRect();
    if (!b.width || !b.height) return false;
    for (var e = el; e && e !== dom.stage && e.nodeType === 1; e = e.parentNode) {
      var cs = getComputedStyle(e);
      if (cs.visibility === 'hidden' || +cs.opacity < 0.05) return false;
    }
    return true;
  }
  function figureMiddles(el) {
    var own = el.matches && el.matches(FIGS) ? el : el.querySelector && el.querySelector(FIGS);
    var figs = own ? [own] :
      Array.prototype.slice.call(dom.stage.querySelectorAll(FIGS)).filter(shown);
    return figs.map(function (svg) {
      var disc = Array.prototype.filter.call(svg.querySelectorAll('.figure__disc'), shown)[0];
      var q = (disc || svg).getBoundingClientRect();
      return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
    });
  }

  /* A burst of confetti from an element on the board -- on the page's
     picture when it has one. */
  function burstAt(el) {
    if (!el) return;
    var f = dom.frame.getBoundingClientRect();
    var mids = figureMiddles(el);
    if (mids.length) {
      mids.forEach(function (m) {
        quiet(anim(Beats.confetti(dom.burst, m.x - f.left, m.y - f.top)));
      });
      return;
    }
    var r = el.getBoundingClientRect();
    /* no picture: beside the element, not on it -- the numbers in it stay
       readable */
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

  /* The moving end of a sector's radius as a handle: pressed and dragged
     round -- or turned with the arrow keys -- it hands the angle, 1° to
     359°, to `turn`, which redraws whatever reads it (the figure, the
     working, the caption). The other radius stays at `at`; `deg.v` is the
     angle it starts from. `done` settles once the learner has turned it
     far enough to have seen the change (at once under Skip, at `auto` under
     autoplay); `away()` then fades it off the figure. */
  function angleHandle(svg, C, at, deg, turn, auto) {
    var hd = svgEl('g', { 'class': 's-handle', tabindex: 0, role: 'slider',
      'aria-label': tr('s3A11yHandle'),
      'aria-valuemin': 1, 'aria-valuemax': 359 }, C.top);
    svgEl('circle', { 'class': 's-handle__halo', cx: 0, cy: 0, r: 22 }, hd);
    svgEl('circle', { 'class': 's-handle__ring', cx: 0, cy: 0, r: 12 }, hd);
    svgEl('circle', { 'class': 's-handle__dot', cx: 0, cy: 0, r: 5 }, hd);
    svgEl('circle', { cx: 0, cy: 0, r: 28, fill: 'transparent' }, hd);
    function place() {
      var q = pt(C, C.r, at - deg.v);
      hd.setAttribute('transform', 'translate(' + r2(q.x) + ' ' + r2(q.y) + ')');
      hd.setAttribute('aria-valuenow', Math.round(deg.v));
    }
    function set(v) { turn(v); place(); }
    place();
    M.set(hd, { opacity: 0 });
    var live = true, grabbing = false, travelled = 0;
    var explored = until(function () { set(auto); });
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
      if (!live) return;
      grabbing = true;
      hd.classList.add('is-held');
      try { hd.setPointerCapture(ev.pointerId); } catch (e) {}
      ev.preventDefault();
    });
    hd.addEventListener('pointermove', function (ev) {
      if (!grabbing) return;
      var v = angleOf(ev);
      travelled += Math.abs(v - deg.v);
      set(v);
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
      if (!live) return;
      var step = ev.key === 'ArrowUp' || ev.key === 'ArrowLeft' ? 1 :
                 ev.key === 'ArrowDown' || ev.key === 'ArrowRight' ? -1 : 0;
      if (!step) return;
      ev.preventDefault();
      set(Math.max(1, Math.min(359, deg.v + step * 5)));
      travelled += 5;
      explored.check(travelled >= 40);
    });
    return {
      el: hd,
      shown: anim(popIn(hd)),
      done: explored.done.then(function () {
        live = false;
        grabbing = false;
        hd.classList.remove('is-held');
        hd.classList.add('is-done');
      }),
      away: function () {
        return anim(fadeOut(hd)).then(function () { if (hd.parentNode) hd.parentNode.removeChild(hd); });
      }
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

  /* A wrong pick taken back once it has been answered: the red let go and
     the pick eased down to the faint it is left at (`to`, the opacity
     `cls` holds it at), and then that class put on to keep it there. */
  function stepBack(el, cls, to) {
    el.classList.remove('is-wrong');
    return anim(M.to(el, { opacity: to, duration: M.dur(0.3), ease: 'power2.inOut' }))
      .then(function () {
        el.classList.add(cls);
        M.set(el, { clearProps: 'opacity' });
      });
  }

  /* Three (or two) pills -- the first lesson's own .choice, wherever they
     stand; resolves once the right one is pressed. */
  /* `o.host` puts the pills on the page itself, in a row under the
     question, rather than in the footer. */
  function askChoice(labels, right, o) {
    o = o || {};
    var box = o.host ? h('div', 'sa-mcq' + (o.tiles ? ' sa-mcq--tiles' : ''), null, o.host) : dom.choices;
    box.textContent = '';
    box.classList.remove('is-hearing');     /* the footer, left mid-answer */
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

    var tell = o.voice || answered;
    function loop() {
      var live = btns.filter(function (b) { return !b.__out; });
      return waitPick(live, good).then(function (b) {
        if (b === good) {
          btns.forEach(function (x) { x.classList.add('is-done'); });
          quiet(anim(Beats.choiceRight(good)));
          burstAt(good);
          return tell(o.yes || praise(), 'happy');
        }
        b.__out = true;
        var why = o.why && o.why[btns.indexOf(b)];
        if (o.onWrong) o.onWrong(btns.indexOf(b));
        /* answered in full first (see autoLines): red, and nothing live,
           while the voice says why -- then it steps back */
        box.classList.add('is-hearing');
        return Promise.all([anim(Beats.choiceWrong(b)), tell(why || o.no || oops(), 'confused')])
          .then(function () {
            box.classList.remove('is-hearing');
            return stepBack(b, 'is-out', 0.6);
          }, function (err) { box.classList.remove('is-hearing'); throw err; })
          .then(function () {
            if (!allTried(btns, good)) return loop();
            /* only the answer left: put in for the learner, not asked for */
            return wait(AUTO_AFTER).then(function () {
              btns.forEach(function (x) { x.classList.add('is-done'); });
              good.classList.add('is-right');
              quiet(anim(M.correct(good)));
              return tell(autoLines(o.auto, o.yes), 'happy');
            });
          });
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
     it (or over it, `up`); a wrong one shows red in the slot while it is answered,
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
    /* Each choice's words in a span of their own, so a struck-out one can
       be struck through their middle (sector-area.css); what goes into the
       box is the words alone. */
    var items = opts.map(function (t) {
      var b = h('button', 'dd__opt', '<span class="dd__opt-t"><span>' + t + '</span></span>', menu);
      b.type = 'button';
      b.setAttribute('role', 'option');
      b.__html = t;
      /* a choice that is one fraction and nothing else: struck, its line
         would lie on the fraction's own bar, so it is only faded */
      var f = b.querySelector('.frac');
      if (f && f.textContent === b.textContent) b.classList.add('is-frac');
      return b;
    });
    if (!o.keepOrder) shuffled(items.length).forEach(function (i) { menu.appendChild(items[i]); });
    var tick = svgEl('svg', { 'class': 'dd__tick', viewBox: '0 0 24 24', 'aria-hidden': 'true' }, dd);
    svgEl('circle', { cx: 12, cy: 12, r: 10.5 }, tick);
    svgEl('path', { d: 'M7 12.5 10.5 16 17 8.5' }, tick);
    var val = face.querySelector('.dd__val');
    var caret = face.querySelector('.dd__caret');
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
    /* `auto`: put in for the learner once every wrong choice is tried --
       the same green and tick, but no chime: it was not found. */
    function win(auto) {
      open(false);
      dd.classList.remove('is-asking', 'is-wrong');
      val.innerHTML = good.__html;
      dd.classList.add('is-right');
      face.disabled = true;
      if (!auto) Beats.sfx('correct');
      quiet(anim(M.correct(face)));
      return anim(M.fromTo(tick, { opacity: 0, scale: 0, transformOrigin: 'center center' },
        { opacity: 1, scale: 1, duration: M.dur(0.4), ease: M.POP }));
    }

    return {
      el: dd,
      /* Ask, and wait for the right answer. Resolves { auto }: true when
         the answer was put in for the learner (see autoLines). `q.auto`
         is the page's line naming the answer; with `q.yes === false` the
         page says its verdict itself, either way. */
      ask: function (q) {
        q = q || {};
        dd.classList.add('is-asking');
        function loop() {
          var live = [face].concat(items.filter(function (i) { return !i.__out; }));
          return waitPick(live, good).then(function (b) {
            if (b === face) { open(menu.hidden); return loop(); }
            if (b === good) {
              return win().then(function () {
                /* q.burst: the page's own confetti in place of the
                   burst beside the box (a page that throws it elsewhere) */
                if (typeof q.burst === 'function') q.burst(); else burstAt(face);
                if (q.yes !== false) return answered(q.yes || praise(), 'happy');
              }).then(function () { return { auto: false }; });
            }
            open(false);
            b.__out = true;
            b.classList.add('is-out');
            val.innerHTML = b.__html;
            /* The pick stays in the box, red and not live, until what is
               said about it is over (see autoLines). q.onWrong(i): the
               page answers the wrong pick itself (the options' index i),
               as a page with its own bird lines does, and returns the
               saying of it. */
            dd.classList.remove('is-asking');
            dd.classList.add('is-wrong');
            face.disabled = true;
            Beats.sfx('wrong');
            var why = q.why && q.why[items.indexOf(b)];
            var heard = q.onWrong ? q.onWrong(items.indexOf(b))
                                  : answered(why || q.no || oops(), 'confused');
            return Promise.all([anim(M.incorrect(face)), heard])
              .then(function () {
                /* ...and then it goes: the word first, and then the red,
                   the box left empty -- with its caret back, eased in, only
                   if the box is to be asked again. (A pick in the box, wrong
                   or right, has no caret: sector-area.css.) */
                return anim(M.to(val, { opacity: 0, duration: M.dur(0.24), ease: 'power2.in' }));
              })
              .then(function () {
                var again = !allTried(items, good);
                M.set(caret, { opacity: 0 });
                dd.classList.remove('is-wrong');
                val.innerHTML = '';
                M.set(val, { clearProps: 'opacity' });
                if (again) {
                  face.disabled = false;
                  quiet(anim(M.to(caret, { opacity: 1, duration: M.dur(0.24), ease: 'power2.out',
                                           clearProps: 'opacity' })));
                  dd.classList.add('is-asking');
                  return loop();
                }
                /* Only the answer left: put in, unasked, with what it is. */
                return wait(AUTO_AFTER).then(function () { return win(true); }).then(function () {
                  M.set(caret, { clearProps: 'opacity' });
                  if (q.yes !== false) return answered(autoLines(q.auto, q.yes), 'happy');
                }).then(function () { return { auto: true }; });
              });
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

  /* A line said, and the moments in it, by its words: at[word] settles as
     the voice reaches that word (or when the line is over, if it never
     does), at.done when the line is. The words are listened for BEFORE the
     line starts -- onWord only hears a line that begins after it is asked. */
  function sayWith(line, words, mood) {
    var at = {};
    words.forEach(function (w) { at[w] = K.onWord(line.text, w, function () {}); });
    var said = say(line, mood);
    words.forEach(function (w) { at[w] = Promise.race([at[w], said]); });
    at.done = said;
    return at;
  }

  /* Bits of a written row worked out where they stand (user, 2026-10-11:
     "show the simplification in the same line"). r.__bits[from .. upto)
     slide together into their middle and are gone as `meet` settles; as
     `to` settles the result -- one bit or several, `htmls` -- comes up on
     that spot and settles into its place, and whatever follows in the row
     glides to where the new width puts it rather than jumping there. */
  async function morphBits(r, from, upto, htmls, meet, to) {
    var bits = r.__bits.slice(from, upto);
    var body = bits[0].parentNode;
    var follow = [];
    for (var n = bits[bits.length - 1].nextElementSibling; n; n = n.nextElementSibling) follow.push(n);
    var a = bits[0].getBoundingClientRect(), b = bits[bits.length - 1].getBoundingClientRect();
    var scale = a.width / (bits[0].offsetWidth || a.width) || 1;
    var mid = (a.left + b.right) / 2;
    var shifts = bits.map(function (el) {
      var q = el.getBoundingClientRect();
      return (mid - (q.left + q.right) / 2) / scale;
    });
    var outs = htmls.map(function (x) { return h('span', 'sa-work__bit', x); });

    await meet;
    var tl = M.timeline({ willChange: bits, willChangeValue: 'transform, opacity' });
    bits.forEach(function (el, i) {
      tl.to(el, { x: shifts[i], scale: 0.6, opacity: 0, transformOrigin: '50% 50%',
                  duration: M.dur(0.42), ease: M.IN }, 0);
    });
    await anim(tl);

    /* The worked-out bits leave the row and the result takes their place,
       set off by as much as puts it over the spot where they met; what
       follows is held where it stood. */
    var was = follow.map(function (el) { return el.getBoundingClientRect().left; });
    M.set(bits, { display: 'none' });
    var ref = bits[bits.length - 1].nextSibling;
    outs.forEach(function (o) { body.insertBefore(o, ref); });
    var p = outs[0].getBoundingClientRect(), q = outs[outs.length - 1].getBoundingClientRect();
    M.set(outs, { x: (mid - (p.left + q.right) / 2) / scale, scale: 0.5, opacity: 0, transformOrigin: '50% 50%' });
    follow.forEach(function (el, i) {
      M.set(el, { x: (was[i] - el.getBoundingClientRect().left) / scale });
    });

    await to;
    var pop = M.timeline({ willChange: outs.concat(follow), willChangeValue: 'transform, opacity' });
    pop.to(outs, { opacity: 1, scale: 1, duration: M.dur(0.34), ease: 'back.out(1.8)', stagger: M.gap(0.06) }, 0)
       .to(outs, { x: 0, duration: M.dur(0.45), ease: 'power2.out' }, M.dur(0.2));
    if (follow.length) pop.to(follow, { x: 0, duration: M.dur(0.45), ease: 'power2.out' }, M.dur(0.2));
    await anim(pop);
    r.__bits = r.__bits.slice(0, from).concat(outs, r.__bits.slice(upto));
  }

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

  /* A tap-the-answer practice page: the figure on the left, the given and
     the formula on the right; the right answer brings the working. */
  /* The question asked from a perch, as the "Tap the area" page asks it:
     the bird in the panel, the question in a warm bubble above it. Every
     answer is HEARD, not written (heardOnly): the question stays in the
     bubble, unchanged and uncoloured, for as long as it is being answered
     (user, 2026-10-29 -- the bubble used to turn red or green and say the
     verdict in place of the question). Returns the voice to hand to
     askChoice; `stop` is kept for the pages that call it once the question
     is done, though nothing is left to stop. */
  function bubbleVoice(P, question) {
    P.bubble.classList.remove('is-no', 'is-yes');
    var voice = function (lines, mood) { return heardOnly(lines, mood); };
    voice.stop = function () {};
    return voice;
  }

  /* A solution written a piece at a time, as on the radar and fan screens:
     one step a line with the equals signs in a column, each line's terms
     arriving one after another, and any number taken off the figure making
     its label there pulse as it is written. `steps` is a list of
     [left side, [[term, figure label to pulse?], ...]]. A step may instead
     be { merge: [from, upto], into: [term, ...] }: no new line, but the
     terms from..upto of the line above worked out where they stand -- lifted
     once so the eye is on them, then put together into their result
     (morphBits). A line's fourth item, if given, is run as the line starts
     -- the figure lighting the part that line works out. Resolves to the
     last line, which is the answer. */
  async function writeSteps(host, steps) {
    var work = h('div', 'sa-work', null, host);
    function pulse(el) {
      quiet(anim(M.fromTo(el, { scale: 1, transformOrigin: '50% 50%' },
        { scale: 1.35, duration: M.dur(0.25), ease: 'power2.out', yoyo: true, repeat: 1 })));
    }
    var last = null;
    for (var i = 0; i < steps.length; i++) {
      if (steps[i].merge) {
        var m = steps[i].merge;
        await anim(M.fromTo(last.__bits.slice(m[0], m[1]), { y: 0 },
          { y: -6, duration: M.dur(0.24), ease: 'power2.out', yoyo: true, repeat: 1 }));
        await wait(250);
        await morphBits(last, m[0], m[1], steps[i].into, null, null);
        await wait(500);
        continue;
      }
      if (steps[i][2]) await say(steps[i][2]);
      if (steps[i][3]) quiet(Promise.resolve(steps[i][3]()));
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
      row.__bits = bits.map(function (b) { return b.el; });
      last = row;
      await wait(500);
    }
    last.classList.add('is-answer');
    Beats.sfx('correct');
    burstAt(last);
    return last;
  }

  /* ======================================================================
   * The scenes -- one per stretch of the storyboard
   * ====================================================================== */

  /* ---- 0. Intro ------------------------------------------------------------
     The skill before this one is cleared away, the board goes, and the bird
     -- on its mark out on the field, as on the lesson's welcome -- says
     hello to this skill in its bubble (the lesson's own welcome screen is
     skill 1's, shown once). The board comes back in with the next scene. */

  /* ---- 1. Which one is a sector? -----------------------------------------
     The board opens on three cards, each with one part of a circle already
     drawn and lit: a segment (cut by a chord), a sector (cut by two radii),
     an arc (cut by two points). They come in finished, together -- drawing
     them one by one was too slow (user, 2026-10-29) -- and the bird then
     asks which one shows a sector, so the learner meets the word beside the
     two things it is not. */
  var SLOW_PEN = 1.6;          /* s: a circle drawn in slow motion             */

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

/* picture units of air round the pill, for its pulse */

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

  /* ---- 4. The central angle ------------------------------------------------
     The first of the terms. One circle in the middle of the board, drawn
     slowly; two radii; the two sectors they make, each in its colour; and
     the angle between the radii marked θ. The bird names it, and for three
     seconds the major sector -- region and edge -- steps back so the minor
     sector and its angle are all there is to look at; then the circle is
     whole again. */
/* θ the whole turn stops at: 70 + 29 ticks of 6 */

  /* ---- 5. Tap the area of the circle -----------------------------------------
     The full-turn circle of the scene before -- the same element -- stays
     on the board and glides to the left as its page becomes a picture and
     a panel; its radius is named r. The bird comes onto a perch in the
     panel and asks, in a warm bubble, which of four tiles is the circle's
     area. */
  var fullTurn = null;

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

  /* ---- 11. A worked example (slides 28-34) ----------------------------------
     The working on the left, one line at a time, and each line the learner
     completes before the next is written: the angle over 360, the radius
     squared, the sum simplified, the area. */

  /* ---- 12-13. Practice: minor sectors (slides 35-38) -------------------------- */

  /* ---- 14. Which covers more (slide 39) ----------------------------------------
     Two circles drawn to scale -- one twice the other's radius -- each with
     a minor sector, and the surprise that the two are the same size. */

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
  /* A parked figure the new screen did not ask for goes, quietly. */
  function dropParked() {
    if (!parked) return;
    var w = parked;
    parked = null;
    keptFig = null;
    quiet(anim(fadeOut(w)).then(function () { if (w.parentNode) w.parentNode.removeChild(w); }));
  }

  /* ---- 16. Its angle (slides 42-43) -------------------------------------------- */

  /* ---- 17. Which angle for the major area (slide 44) ---------------------------- */

  /* ---- 18. A worked major sector (slides 45-50) --------------------------------- */

  /* ---- 19. Another way (slides 51-54) ---------------------------------------------
     The same sector, by subtraction: the whole circle, less the minor
     sector, is the major sector. */

  /* ---- 20. Two rules for the major sector (slide 55) ------------------------------ */

  /* ---- 21-22. Practice: major sectors (slides 56-59) ------------------------------- */

  /* ---- 23. Find the angle (slides 60-63) -------------------------------------------
     The formula worked backwards: the area is known, the angle is not. */

  /* ---- 24. A paper fan (slides 64-65) ----------------------------------------------
     The fan opens out from shut, fold by fold, to 135°. */

  /* ---- 25. A radar (slides 66-67) ---------------------------------------------------
     The beam sweeps once round the screen and settles on its 45° wedge. */

  /* ---- 26. A sprinkler (slides 68-71) -------------------------------------------------
     The spray fans out over the lawn to 120°; then the part it misses. */

  /* ---- 27. The end ------------------------------------------------------------------- */

  /* ======================================================================
   * Joined to the lesson -- see addSection in pages.js
   * ====================================================================== */

  /* This skill's stylesheet is scoped to body.sa-lesson (see the head of
     css/sector-area.css): on while its scenes play, off once reset() has
     put its board away, so it is never on under another skill. */
  function lessonOn() { document.body.classList.add('sa-lesson'); }
  function lessonOff() { document.body.classList.remove('sa-lesson'); }

  /* skill 3's scenes: not played in this folder, which loads this file
     for its kit (window.SectorArea, below) only */
  var SCENES = [];

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
    n: 3,                 /* the skill this section is part of (pages.js) */
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
    r2: r2, pt: pt, ringD: ringD, arcD: arcD, wedgeD: wedgeD, bandD: bandD, segD: segD,
    fadeIn: fadeIn, popIn: popIn, fadeOut: fadeOut, cardIn: cardIn, settleFig: settleFig,
    figure: figure, text: text, circle: circle, drawCircle: drawCircle, sector: sector, underPoints: underPoints,
    radii: radii, sweep: sweep, arcIn: arcIn, show: show, angleMark: angleMark, angleIn: angleIn,
    clearPrompt: clearPrompt, speak: speak, mascotJumpIn: mascotJumpIn, mascotJumpOut: mascotJumpOut,
    perchIn: perchIn, perchSay: perchSay, perchOut: perchOut, say: say, bubbleSay: bubbleSay,
    sayTop: sayTop, sayAll: sayAll, sayWith: sayWith, morphBits: morphBits, voiceAlone: voiceAlone, hush: hush, leaveHeader: leaveHeader, handOver: handOver,
    ripple: ripple, burstAt: burstAt,
    waitPick: waitPick, until: until, angleHandle: angleHandle, clearChoices: clearChoices, askChoice: askChoice,
    dropdown: dropdown, stepRow: stepRow, stepIn: stepIn, stepDone: stepDone, ddIn: ddIn,
    noteCard: noteCard, ruleCard: ruleCard, lineIn: lineIn, clearStage: clearStage, stage: stage,
    bubbleVoice: bubbleVoice, writeSteps: writeSteps, fieldTalk: fieldTalk, keyWord: keyWord,
    answered: answered, heardOnly: heardOnly, autoLines: autoLines,
    flyNumber: flyNumber, magnifier: magnifier,
    boxLeader: boxLeader, figToScene: figToScene
  };
})(window);
