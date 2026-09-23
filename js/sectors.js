/* ==========================================================================
 * sectors.js -- section 4: sectors, minor and major
 * --------------------------------------------------------------------------
 * The fourth section of the lesson, registered with pages.js as a section
 * (see addSection there): three scenes on the same board, with the same
 * bird and the same clock, built from the kit pages.js hands over, the
 * beats in animations.js, and the two-point interaction arcs.js hands over
 * on window.Arcs. Nothing here waits on anything except through Flow, so
 * Skip, Replay and the level bar work on these scenes as they do on the
 * sections before.
 *
 *   Sectors          a circle on the blank board, with its centre; the
 *                    learner puts two points on the edge, a radius is drawn
 *                    to each, and the two wedges they cut the area into are
 *                    coloured and called sectors; then the learner is asked
 *                    for each by the arc it lies under -- the smaller, then
 *                    the larger -- and each is named as it is found
 *   Name the         a clean board; the circle made again, cut at the same
 *   sectors          two points and coloured in two NEW colours; the two
 *                    names dragged into their boxes, then explained
 *   Sector summary   the whole idea drawn once more, with no bird
 *
 * Where section 3 cut the area with a chord, this one cuts it with two
 * radii, so the two regions are wedges that meet at the centre -- but they
 * are cut by the same two points, kept as the same two numbers (an angle
 * and a span), and every mark on the circle is redrawn from them, so
 * nothing can drift away from anything else.
 *
 * Load order: js/pages.js -> js/arcs.js -> js/segments.js -> js/sectors.js
 *             -> js/script.js
 * ========================================================================== */
(function (global) {
  'use strict';

  var M = global.Motion;
  var Flow = global.Flow;
  var Beats = global.Beats;
  var Pages = global.Pages;
  var A = global.Arcs;
  if (!Pages || !Pages.addSection || !A || !A.pickPoints) {
    console.error('sectors.js: load js/pages.js and js/arcs.js before js/sectors.js.');
    return;
  }
  var K = Pages.kit;

  /* ---- the script ------------------------------------------------------- */
  var LINES = {
    pick:   'Draw two radii on the circle.',
    divide: 'Radii divide the area of the circle into two regions.',
    each:   'Each region is called a sector.',

    tapMinor: 'Tap the region between the minor arc and the two radii.',
    tapMajor: 'Tap the region between the major arc and the two radii.',

    drag:  'Drag each name to the correct box.',
    major: 'Larger region of the circle is the major sector.',
    minor: 'Smaller region of the circle is the minor sector.'
  };

  var BEAT = K.BEAT, SHORT = K.SHORT, HOLD_ASK = K.HOLD_ASK;
  var CX = K.CX, CY = K.CY, RR = K.RR;
  var round2 = K.round2, el = K.el;
  var norm = A.norm, clamp = A.clamp, coin = A.coin, cue = A.cue;
  var P = A.P, arcD = A.arcD, place = A.place;

  /* ---- the two points, as angles ----------------------------------------
     The same two numbers arcs.js keeps, meaning the same thing: `a` is one
     point, and the minor sector lies under the arc that runs from it
     anticlockwise for `span` degrees to the other. `origin` is the point
     placed LAST, which is the end both wedges are swept from. */
  var sec = { a: 35, span: 110, origin: 'a' };
  var DEFAULT = { a: 35, span: 110 };
  var SUMMARY = { a: 35, span: 110 };

  var TILT = 40;          /* the activity: where the minor sector's middle is put */
  var MINOR_AT = 0.6;     /* how far out from the centre, as a share of the radius,
                             the smaller wedge is marked: about its visual middle */
  var MAJOR_AT = 0.52;    /* and the larger, which is wide enough anywhere        */
  var SEC_OUT = 12;       /* how far a wedge is drawn out of the circle when it
                             is picked: a slice lifted out of a pie              */

  function bisMinor() { return sec.a + sec.span / 2; }
  function bisMajor() { return sec.a + sec.span / 2 + 180; }

  /* ---- the elements ----------------------------------------------------- */
  var dom = null;         /* pages.js's, with this section's own on top     */
  var mascot = null;
  var boxes = [];         /* the two name boxes, while they are built       */
  var labels = {};        /* the two "Sector" words                         */
  var callouts = {};      /* minor, major: the named callouts               */
  var nudges = [];        /* the pointing hand                              */
  var chips = [];

  function $(id) { return document.getElementById(id); }

  function build() {
    dom = Object.create(K.dom());
    mascot = K.mascot();

    dom.secs      = $('secs');
    dom.secDefs   = $('secDefs');
    dom.secGlow   = $('secGlow');
    dom.secDisc   = $('secDisc');
    dom.secMinor  = $('secMinor');
    dom.secMajor  = $('secMajor');
    dom.radiusA   = $('secRadiusA');
    dom.radiusB   = $('secRadiusB');
    dom.secRim    = $('secRim');
    dom.secTip    = $('secTip');
    dom.secBand   = $('secBand');
    dom.secBoxes  = $('secBoxes');
    dom.secMarks  = $('secMarks');
    dom.secCentre = $('secCentre');
    dom.secCentreDot = dom.secCentre.querySelector('.centre__dot');
    dom.secGhost  = $('secGhost');
    dom.secNudges = $('secNudges');
    dom.pointA    = point($('secPointA'));
    dom.pointB    = point($('secPointB'));

    labels.minor = label('sec-label--minor');
    labels.major = label('sec-label--major');
    callouts.minor = callout('sec-callout--minor');
    callouts.major = callout('sec-callout--major');
    nudges = [A.hand(dom.secNudges)];
    reset();
  }

  /* A point on the circle: the dot, and the finger-sized hit area over it. */
  function point(g) {
    return { g: g, dot: g.querySelector('.arc-dot'), hit: g.querySelector('.arc-dot__hit') };
  }
  function label(cls) {
    var t = el('text', { 'class': 'figure-label sec-label ' + cls,
                         x: 0, y: 0, 'text-anchor': 'middle' });
    dom.secMarks.appendChild(t);
    return t;
  }
  /* A callout of the same make as the sections before: an arrow and the
     word at its tail, in a group that is hidden until it is aimed. */
  function callout(cls) {
    var g = el('g', { 'class': 'sec-callout ' + cls });
    g.setAttribute('hidden', '');
    var c = {
      g: g,
      arrow: el('path', { 'class': 'mark__arrow', d: '' }),
      head:  el('path', { 'class': 'mark__head', d: '' }),
      label: el('text', { 'class': 'figure-label mark__label', x: 0, y: 0 })
    };
    g.appendChild(c.arrow); g.appendChild(c.head); g.appendChild(c.label);
    dom.secMarks.appendChild(g);
    return c;
  }

  /* ---- drawing from the angles ------------------------------------------ */

  /* A wedge of the circle: from the centre out to the rim at `from`, round
     it for `sweep` degrees, and straight back to the centre. */
  function wedgeD(from, sweep, clockwise) {
    return 'M' + CX + ' ' + CY + ' L' + arcD(from, sweep, clockwise).slice(1) + ' Z';
  }

  /* One of the two wedges, `t` of the way through its sweep (0 to 1; whole
     when left out). Both are swept from the point placed LAST -- the
     smaller one way round to the first point, the larger the other way --
     so the two colours are seen to be the one area, cut at those two
     radii; at t = 1 either way round is the same shape. */
  function wedge(which, t) {
    var k = t == null ? 1 : t;
    var b = sec.a + sec.span;
    var minor = sec.span * k, major = (360 - sec.span) * k;
    if (sec.origin === 'b') {
      return which === 'minor' ? wedgeD(b, minor, true) : wedgeD(b, major, false);
    }
    return which === 'minor' ? wedgeD(sec.a, minor, false) : wedgeD(sec.a, major, true);
  }
  function wedgeFn(which) { return function (t) { return wedge(which, t); }; }

  /* Every mark that depends on the two points, rewritten from them: each
     wedge whole, a radius from the centre to each point, and the points. */
  function redraw() {
    var a = sec.a, b = sec.a + sec.span;
    var pA = P(a, RR), pB = P(b, RR);
    dom.secMinor.setAttribute('d', wedge('minor'));
    dom.secMajor.setAttribute('d', wedge('major'));
    dom.radiusA.setAttribute('d', 'M' + CX + ' ' + CY + ' L' + pA.x + ' ' + pA.y);
    dom.radiusB.setAttribute('d', 'M' + CX + ' ' + CY + ' L' + pB.x + ' ' + pB.y);
    place(dom.pointA, a);
    place(dom.pointB, b);
  }

  function dots() { return [dom.pointA.dot, dom.pointB.dot]; }
  function regions() { return [dom.secMinor, dom.secMajor]; }
  /* The two radii in the order they are drawn: to the point placed FIRST
     first, so the picture is made in the order the learner made it. */
  function radii() {
    return sec.origin === 'b' ? [dom.radiusA, dom.radiusB] : [dom.radiusB, dom.radiusA];
  }

  function sweepSpec() {
    return { minor: dom.secMinor, major: dom.secMajor, wedge: wedge, dots: dots() };
  }

  /* How far each wedge slides out along its own middle when the two are
     pulled apart: one {x, y} per wedge, minor first. */
  function apart(d) {
    return [bisMinor(), bisMajor()].map(function (deg) {
      var t = deg * Math.PI / 180;
      return { x: Math.cos(t) * d, y: -Math.sin(t) * d };
    });
  }

  /* Where a wedge is marked -- a word set on it, an arrow aimed at it, a
     leader run to it: on its middle line, as {deg, r}, a set way out from
     the centre, where the wedge has opened wide enough for a word. */
  function spot(which) {
    if (which === 'minor') return { deg: bisMinor(), r: RR * MINOR_AT };
    return { deg: bisMajor(), r: RR * MAJOR_AT };
  }

  function aimLabel(text, s, str) {
    var p = P(s.deg, s.r);
    text.setAttribute('x', p.x);
    text.setAttribute('y', p.y + 9);
    text.textContent = str;
  }

  /* A callout aimed INTO a wedge: the tip on the wedge's spot, the word
     outside the circle to whichever side the wedge is on, and the shaft
     running level out from under the word before it curves in over the
     rim to the tip -- the shape every callout in the lesson has. Kept
     inside the picture top and bottom, where the circle comes close to
     the edge. */
  var CALL_OUT = 62, CALL_LIFT = 22, CALL_BEND = 42;
  function aimCallout(c, s, str) {
    var t = s.deg * Math.PI / 180;
    var side = Math.cos(t) >= -0.001 ? 1 : -1;
    var up = Math.sin(t) >= 0 ? -1 : 1;
    var tip = P(s.deg, s.r);
    var from = { x: round2(CX + side * (RR + CALL_OUT)),
                 y: round2(clamp(tip.y + up * CALL_LIFT, 30, K.VB_H - 30)) };
    var bend = { x: round2(from.x - side * CALL_BEND), y: from.y };
    c.arrow.setAttribute('d', 'M' + from.x + ' ' + from.y +
                              ' Q' + bend.x + ' ' + bend.y + ' ' + tip.x + ' ' + tip.y);
    c.head.setAttribute('d', K.arrowHead(tip, bend));
    c.label.setAttribute('x', from.x + side * 8);
    c.label.setAttribute('y', from.y + 9);
    c.label.setAttribute('text-anchor', side > 0 ? 'start' : 'end');
    c.label.textContent = str || '';
  }
  function showCallout(c) {
    return Flow.anim(Beats.callout(c.g, c.arrow, c.head, c.label));
  }

  /* The two boxes, hung off the circle where the wedges are: each to the
     side its wedge is on, tied by its leader to the spot on that wedge its
     name would sit, and set a little above or below that spot so the
     leader has a corner in it. Built afresh each time, because where the
     wedges are depends on the two points the learner chose. The leader is
     reversed to run FROM the wedge, as the arcs' are, so its dashes start
     where it meets the wedge. */
  var BOX_IN = 30, BOX_OFF = 44;
  function buildBoxes() {
    clearBoxes();
    boxes = [{ name: 'Major sector', s: spot('major') },
             { name: 'Minor sector', s: spot('minor') }].map(function (b, i) {
      var t = b.s.deg * Math.PI / 180;
      var right = Math.cos(t) >= 0;
      var anchor = P(b.s.deg, b.s.r);
      var y = anchor.y - K.BOX_H / 2 + (Math.sin(t) >= 0 ? -BOX_OFF : BOX_OFF);
      var box = K.buildBox(dom.secBoxes, dom.secDefs, {
        name: b.name,
        x: right ? K.VB_W - BOX_IN - K.BOX_W : BOX_IN,
        y: round2(clamp(y, 16, K.VB_H - 16 - K.BOX_H)),
        anchor: anchor
      }, 'secLeaderMask' + i);
      box.leader.setAttribute('d', A.reversed(box.leader.getAttribute('d')));
      return box;
    });
  }
  function clearBoxes() {
    boxes = [];
    dom.secBoxes.textContent = '';
    ['secLeaderMask0', 'secLeaderMask1'].forEach(function (id) {
      var m = dom.secDefs.querySelector('#' + id);
      if (m) m.parentNode.removeChild(m);
    });
  }
  function boxFor(name) {
    for (var i = 0; i < boxes.length; i++) if (boxes[i].name === name) return boxes[i];
    return null;
  }

  /* ---- the circle, drawn, and cut --------------------------------------- */
  function drawCircle() {
    return Flow.anim(Beats.drawRim(dom.secRim, dom.secTip))
      .then(function () { return Flow.wait(160); })
      .then(function () { return Flow.anim(Beats.fillDisc(dom.secDisc)); });
  }

  /* The centre, planted as a piece of the diagram: the point the radii
     come from, and not a target. */
  function plantCentre() {
    return Flow.anim(Beats.plantCentre(dom.secCentre, dom.secCentreDot, { call: false }));
  }

  /* The two radii, drawn out from the centre one after the other. */
  function drawRadii() {
    var r = radii();
    return Flow.anim(Beats.growLine(r[0], 0.5))
      .then(function () { return Flow.wait(120); })
      .then(function () { return Flow.anim(Beats.growLine(r[1], 0.5)); });
  }

  /* The centre, the two points put on the circle where `sec` has them one
     after the other, a radius to each, and the two wedges coloured. */
  function cutCircle() {
    return plantCentre()
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.pointA.dot)); })
      .then(function () { return Flow.wait(200); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.pointB.dot)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(drawRadii)
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.secSweep(sweepSpec())); });
  }

  /* What arcs.js's two-point interaction works on here: this section's
     circle and marks, and its own state for the cut to be written into --
     the same shape arcs.js hands it for its own circle. */
  function pickCtx() {
    return {
      group: dom.secs, band: dom.secBand, ghost: dom.secGhost, nudges: dom.secNudges,
      hand: nudges[0], points: [dom.pointA, dom.pointB],
      done: function (cut) {
        sec.a = cut.a; sec.span = cut.span; sec.origin = cut.origin;
        redraw();
      }
    };
  }

  function at(ms, fn) { return Flow.wait(ms).then(fn); }

  /* ======================================================================
   * The interaction: one of the two regions, tapped
   * ----------------------------------------------------------------------
   * Both wedges go live -- the cursor becomes a hand over them, and the
   * one under it comes up to its lit shade -- and the first to be pressed
   * is the answer. Neither wedge can be the thing the scene waits on, so
   * whichever is pressed fires a click at the lesson's gate (see #gate in
   * index.html) and the scene waits on THAT, as askChoice does: an ordinary
   * Flow.once, cancelled with the rest of the chain when a scene is
   * retired, with the listeners coming off whichever way it ends.
   *   Keyboard: each wedge takes focus, and Enter or Space presses it.
   *   Hands back the index of the wedge that was pressed, in `list`.
   * ====================================================================== */
  function askRegion(list) {
    var picked = -1;
    var live = true;

    dom.secs.classList.add('is-asking');
    list.forEach(function (p) { p.setAttribute('tabindex', '0'); });

    function onPick(ev) {
      if (!live) return;
      live = false;
      var hit = ev.currentTarget;
      picked = list.indexOf(hit);
      K.ripple(ev, hit);
      dom.gate.dispatchEvent(new MouseEvent('click'));
    }
    function onKey(ev) {
      if (ev.key !== 'Enter' && ev.key !== ' ' && ev.key !== 'Spacebar') return;
      ev.preventDefault();
      onPick(ev);
    }
    function off() {
      live = false;
      list.forEach(function (p) {
        p.removeEventListener('click', onPick);
        p.removeEventListener('keydown', onKey);
        p.setAttribute('tabindex', '-1');
      });
      dom.secs.classList.remove('is-asking');
    }

    list.forEach(function (p) {
      p.addEventListener('click', onPick);
      p.addEventListener('keydown', onKey);
    });

    return Flow.once(dom.gate).then(
      function () { off(); return picked; },
      function (err) { off(); throw err; });
  }

  /* One wedge asked for, by the arc it lies under. The ask is armed before
     the line is said, as every tap in the lesson is. The tap is answered
     in a word: the right wedge is drawn out of the circle and set back,
     lit -- after the wrong one has shaken its head, if the wrong one was
     pressed -- and then it is named, with the other stood back. */
  function askFor(which, line) {
    var want  = which === 'minor' ? dom.secMinor : dom.secMajor;
    var other = which === 'minor' ? dom.secMajor : dom.secMinor;
    var away  = apart(SEC_OUT)[which === 'minor' ? 0 : 1];
    var answer = null;

    return Promise.resolve()
      .then(function () {
        answer = K.quiet(askRegion(regions()));
        return K.speak(line);
      })
      .then(function () { return answer; })
      .then(function (i) {
        var hit = regions()[i] || want;
        var right = hit === want;
        var shown = right
          ? Flow.anim(Beats.secRight(want, away))
          : Flow.anim(Beats.secWrong(hit)).then(function () {
              return Flow.anim(Beats.secRight(want, away));
            });
        var said = K.speak(right ? K.LINES.ackRight : K.LINES.ackWrong,
                           right ? 'happy' : 'confused');
        return Promise.all([shown, said]);
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        aimCallout(callouts[which], spot(which),
                   which === 'minor' ? 'Minor sector' : 'Major sector');
        return Promise.all([
          Flow.anim(Beats.segFocus([want], [other])),
          showCallout(callouts[which])
        ]);
      });
  }

  /* ======================================================================
   * Scene 1 -- sectors. A circle on the blank board, with its centre; two
   * points, a radius to each, and the two wedges they make -- coloured,
   * called sectors, and then each asked for and named.
   * ====================================================================== */
  function sceneSectors() {
    var picked = null;

    /* The board is blank and the bird is behind it, as the section before
       left them. The circle goes on first, with nobody speaking, and its
       centre with it: the radii the learner is about to be asked for have
       to have somewhere to come from. */
    return Flow.wait(BEAT)
      .then(function () {
        dom.secs.removeAttribute('hidden');
        return drawCircle();
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(plantCentre)
      .then(function () { return Flow.wait(SHORT); })

      /* ---- two points ----------------------------------------------------
         The edge breathes while a point is wanted, and the hand shows the
         way if nothing is placed. Listening starts as the bird lands,
         before its line is finished: a learner who does not wait to be
         told is not made to. */
      .then(function () {
        picked = K.quiet(A.pickPoints(pickCtx()));
        return K.arriveSaying(LINES.pick);
      })
      .then(function () {
        mascot.settle();
        return picked;
      })

      /* ---- the radii, and the two regions --------------------------------
         A line from the centre to each point, in the order the points were
         put down; then the colour, swept from one radius round to the
         other on each side. */
      .then(function () { return Flow.wait(SHORT); })
      .then(drawRadii)
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.secSweep(sweepSpec())); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- named as regions ----------------------------------------------
         "Radii": the two lines lit. "divide": the two wedges drawn apart
         along the cut, and held so until "two regions" puts them back. */
      .then(function () {
        dom.secMarks.removeAttribute('hidden');
        var text = LINES.divide;
        return Promise.all([
          K.speak(text),
          at(cue(text, 'Radii'), function () {
            return Flow.anim(Beats.linePulse(radii()));
          }),
          at(cue(text, 'divide'), function () {
            return Flow.anim(Beats.arcSplit(regions(), apart(9)));
          }),
          at(cue(text, 'two regions'), function () {
            return Flow.anim(Beats.arcJoin(regions()));
          })
        ]);
      })
      .then(function () { return Flow.wait(BEAT); })
      /* "Each region": the word on the smaller; "sector": on the larger. */
      .then(function () {
        var text = LINES.each;
        return Promise.all([
          K.speak(text),
          at(cue(text, 'Each'), function () {
            aimLabel(labels.minor, spot('minor'), 'Sector');
            return Flow.anim(Beats.labelIn(labels.minor));
          }),
          at(cue(text, 'sector'), function () {
            aimLabel(labels.major, spot('major'), 'Sector');
            return Flow.anim(Beats.labelIn(labels.major));
          })
        ]);
      })
      .then(function () { return Flow.wait(BEAT + SHORT); })

      /* ---- and each found, and named for its size ------------------------
         The two words come off, and the learner is asked for each wedge
         in turn by the arc it lies under: the smaller first, then the
         larger. Each is named as it is found, and both names are left
         standing until Next. */
      .then(function () { return Flow.anim(Beats.labelsOut([labels.minor, labels.major])); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return askFor('minor', LINES.tapMinor); })
      .then(function () { return Flow.wait(BEAT); })
      /* both back to full before the next is asked for: the question is
         put to the whole picture, not to the one left standing */
      .then(function () { return Flow.anim(Beats.segUnfocus(regions())); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return askFor('major', LINES.tapMajor); })
      .then(function () { return Flow.wait(BEAT); })
      /* Both back to full, both named: the picture the learner is about
         to be asked about, read as one thing. */
      .then(function () { return Flow.anim(Beats.segUnfocus(regions())); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return K.handOver(dom.nextBtn); });
  }

  /* ======================================================================
   * Scene 2 -- name the sectors. A clean board, and the circle made again
   * from nothing: drawn, its centre and its two points put back where the
   * learner cut it, a radius to each, and the two wedges coloured -- in
   * two NEW colours, so the names have to be given for the regions' sizes
   * and not for the colours the lesson used. Then two boxes, two names to
   * drag, and the explanation either way.
   * ====================================================================== */
  function sceneNameSectors() {
    var span = sec.span;            /* the learner's cut, kept across the wipe */
    var outcome = { right: true };

    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle again, cut where it was, in new colours ------------ */
      .then(function () {
        sec.a = norm(TILT - span / 2); sec.span = span; sec.origin = 'a';
        redraw();
        dom.secs.classList.add('is-quiz');
        dom.secs.removeAttribute('hidden');
        return drawCircle();
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(cutCircle)
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the two boxes, one at a time ------------------------------------ */
      .then(function () {
        buildBoxes();
        dom.secBoxes.removeAttribute('hidden');
        return Flow.anim(Beats.boxIn(boxFor('Major sector')));
      })
      .then(function () { return Flow.wait(320); })
      .then(function () { return Flow.anim(Beats.boxIn(boxFor('Minor sector'))); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the names, and the one instruction ------------------------------ */
      .then(function () {
        chips = K.chips(K.buildChips(dom.tray, coin('Minor sector', 'Major sector')));
        return Flow.anim(Beats.trayIn(dom.tray, chips));
      })
      .then(function () { return K.arriveSaying(LINES.drag); })
      .then(function () {
        mascot.settle();
        return Flow.wait(HOLD_ASK);
      })
      .then(function () {
        return Promise.all([K.mascotJumpOut(), Flow.anim(Beats.lineOut(dom.promptLine))]);
      })
      .then(function () {
        K.clearPrompt();
        return Flow.anim(K.collapseHeader(true));
      })
      .then(function () {
        /* two tries: a first wrong drop goes home to be tried again, a
           second is answered for the learner */
        return K.armQuiz({ boxes: boxes }, chips,
                         { group: dom.secBoxes, wrong: 'reveal', chances: 2 });
      })

      /* ---- answered, and explained -----------------------------------------
         Right or wrong, the lesson is the same one -- only the word in
         front of it changes. Each wedge is lit as it is named, the other
         stood back, and the box that names it pulses under the word. */
      .then(function (result) {
        outcome = result || outcome;
        return Flow.wait(SHORT);
      })
      .then(function () { return Flow.anim(K.collapseHeader(false)); })
      .then(function () {
        return K.arriveSaying(outcome.right ? K.LINES.ackRight : K.LINES.ackWrong,
                              outcome.right ? 'happy' : 'confused');
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        var text = LINES.major;
        return Promise.all([
          K.speak(text),
          at(cue(text, 'Larger'), function () {
            return Flow.anim(Beats.segFocus([dom.secMajor], [dom.secMinor]));
          }),
          at(cue(text, 'major sector'), function () {
            return Flow.anim(Beats.boxPulse(boxFor('Major sector')));
          })
        ]);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        var text = LINES.minor;
        return Promise.all([
          K.speak(text),
          at(cue(text, 'Smaller'), function () {
            return Flow.anim(Beats.segFocus([dom.secMinor], [dom.secMajor]));
          }),
          at(cue(text, 'minor sector'), function () {
            return Flow.anim(Beats.boxPulse(boxFor('Minor sector')));
          })
        ]);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return Flow.anim(Beats.segUnfocus(regions())); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return K.handOver(dom.nextBtn); });
  }

  /* ======================================================================
   * Scene 3 -- the summary. No bird: a clean board with both bands closed,
   * so the circle sits at its very centre, and the idea drawn once more
   * from the start -- circle, centre, two points, a radius to each, the
   * two wedges in their two colours, and their names.
   * ====================================================================== */
  function sceneSummary() {
    return K.wipeBoard()
      .then(function () { return Flow.anim(K.collapseHeader(true, 'is-bare')); })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        sec.a = SUMMARY.a; sec.span = SUMMARY.span; sec.origin = 'a';
        redraw();
        dom.secs.removeAttribute('hidden');
        dom.secMarks.removeAttribute('hidden');
        return drawCircle();
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(plantCentre)
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.pointA.dot)); })
      .then(function () { return Flow.wait(200); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.pointB.dot)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(drawRadii)
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the two regions, each coloured and called what it is ----------- */
      .then(function () { return Flow.anim(Beats.secFill(dom.secMinor, wedgeFn('minor'), 0.7)); })
      .then(function () {
        aimLabel(labels.minor, spot('minor'), 'Sector');
        return Flow.anim(Beats.labelIn(labels.minor));
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return Flow.anim(Beats.secFill(dom.secMajor, wedgeFn('major'), 1.0)); })
      .then(function () {
        aimLabel(labels.major, spot('major'), 'Sector');
        return Flow.anim(Beats.labelIn(labels.major));
      })
      .then(function () { return Flow.wait(BEAT + SHORT); })

      /* ---- and named ------------------------------------------------------- */
      .then(function () { return Flow.anim(Beats.labelsOut([labels.minor, labels.major])); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        aimCallout(callouts.minor, spot('minor'), 'Minor sector');
        return showCallout(callouts.minor);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        aimCallout(callouts.major, spot('major'), 'Major sector');
        return showCallout(callouts.major);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return K.handOver(dom.nextBtn); })

      /* ---- and the section closes ------------------------------------------ */
      .then(function () { return K.wipeBoard(); })
      .then(function () { return Flow.anim(K.collapseHeader(false, 'is-bare')); });
  }

  /* ======================================================================
   * The hooks the board's housekeeping calls -- see addSection in pages.js
   * ====================================================================== */

  /* What this section has on the figure: the one group, faded as a whole. */
  function parts() { return [dom.secs]; }

  /* Back to rest, with no animation. The inline writes inside the figure
     are pages.js's to clear -- resetFigure does it for every descendant of
     the picture right after this -- so this is about attributes, classes
     and the boxes. */
  function reset() {
    sec.a = DEFAULT.a; sec.span = DEFAULT.span; sec.origin = 'a';

    dom.secs.setAttribute('hidden', '');
    dom.secs.classList.remove('is-picking', 'is-asking', 'is-quiz');
    dom.secBoxes.classList.remove('is-live');
    [dom.secNudges, dom.secBoxes, dom.secMarks, dom.secCentre].forEach(function (g) {
      g.setAttribute('hidden', '');
    });
    Object.keys(callouts).forEach(function (k) { callouts[k].g.setAttribute('hidden', ''); });
    regions().forEach(function (p) {
      p.classList.remove('is-lit', 'is-wrong');
      p.setAttribute('tabindex', '-1');
    });
    dom.secGhost.setAttribute('r', 2);
    dom.secBand.setAttribute('tabindex', '-1');
    [dom.pointA, dom.pointB].forEach(function (p) {
      p.g.classList.remove('is-held', 'is-set');
      p.hit.setAttribute('tabindex', '-1');
    });
    clearBoxes();
    redraw();
  }

  /* The board as the scene at `local` expects to find it, written straight
     in. pages.js has already put the board up and the bird behind it. */
  function stage(local) {
    if (local <= 0) return;             /* opens on the wiped board, as left */

    /* the circle in the middle, cut and coloured, and the bird on the
       header, as the naming leaves them: the activity opens by wiping this */
    dom.secs.removeAttribute('hidden');
    dom.secCentre.removeAttribute('hidden');
    redraw();
    M.set([dom.secDisc, dom.secRim].concat(radii(), regions(), dots()), { opacity: 1 });
    mascot.placeIn(dom.slotHeader);
    mascot.el.classList.remove('is-away');
    mascot.idle();
    if (local === 1) return;

    /* turned and coloured for the activity, its two boxes filled: the
       summary opens by wiping this */
    sec.a = norm(TILT - sec.span / 2); sec.origin = 'a';
    redraw();
    dom.secs.classList.add('is-quiz');
    buildBoxes();
    dom.secBoxes.removeAttribute('hidden');
    boxes.forEach(function (b) {
      b.filled = true;
      b.text.textContent = b.name;
      b.g.classList.add('is-shown', 'is-right');
      b.leader.classList.add('is-shown');
      M.set([b.text, b.badge], { opacity: 1 });
    });
  }

  Pages.addSection({
    name: 'Sectors',
    scenes: [
      { name: 'Sectors',          play: sceneSectors     },
      { name: 'Name the sectors', play: sceneNameSectors },
      { name: 'Sector summary',   play: sceneSummary     }
    ],
    build: build,
    parts: parts,
    reset: reset,
    stage: stage
  });

  global.Sectors = { LINES: LINES, state: function () { return sec; } };
})(window);
