/* ==========================================================================
 * segments.js -- section 3: segments, minor and major
 * --------------------------------------------------------------------------
 * The third section of the lesson, registered with pages.js as a section
 * (see addSection there): two scenes on the same board, with the same
 * bird and the same clock, built from the kit pages.js hands over, the
 * beats in animations.js, and the two-point interaction arcs.js hands over
 * on window.Arcs. Nothing here waits on anything except through Flow, so
 * Skip, Replay and the level bar work on these scenes as they do on the
 * sections before.
 *
 *   Segments         a circle on the blank board; the inside of it lit and
 *                    named as the area; the learner puts two points on the
 *                    edge, a chord joins them, and the two regions it cuts
 *                    the area into are coloured, called segments, and then
 *                    named for their size
 *   Name the         a clean board; the circle made again, cut at the same
 *   segments         two points and coloured in two NEW colours; the two
 *                    names dragged into their boxes, then explained
 *
 * Where section 2 was about the LINE round the circle, this one is about
 * the space inside it, so what it colours are filled shapes rather than
 * strokes -- but they are cut by the same two points, kept as the same two
 * numbers (an angle and a span), and every mark on the circle is redrawn
 * from them, so nothing can drift away from anything else.
 *
 * Load order: js/pages.js -> js/arcs.js -> js/segments.js -> js/script.js
 * ========================================================================== */
(function (global) {
  'use strict';

  var M = global.Motion;
  var Flow = global.Flow;
  var Beats = global.Beats;
  var Pages = global.Pages;
  var A = global.Arcs;
  if (!Pages || !Pages.addSection || !A || !A.pickPoints) {
    console.error('segments.js: load js/pages.js and js/arcs.js before js/segments.js.');
    return;
  }
  var K = Pages.kit;

  /* ---- the script -------------------------------------------------------
     Every line is read by key from locales/locales.json (s1Seg...), each
     with the recording filed under the same key. */
  function T(key) { return global.T ? global.T(key) : key; }
  var keyed = K.keyed;

  var BEAT = K.BEAT, SHORT = K.SHORT;
  var CX = K.CX, CY = K.CY, RR = K.RR;
  var round2 = K.round2, el = K.el;
  var norm = A.norm, clamp = A.clamp, coin = A.coin;
  var P = A.P, arcD = A.arcD, place = A.place;

  /* ---- the two points, as angles ----------------------------------------
     The same two numbers arcs.js keeps, meaning the same thing: `a` is one
     point, and the minor segment lies under the arc that runs from it
     anticlockwise for `span` degrees to the other. `origin` is the point
     placed LAST, which is the end the chord is drawn from. */
  var seg = { a: 250, span: 110, origin: 'a' };
  var DEFAULT = { a: 250, span: 110 };

  var TILT = -40;         /* the activity: where the minor segment's middle is put */
  var MAJOR_IN = 0.4;     /* how far out from the centre, as a share of the radius,
                             the larger region is marked: its own middle is too
                             close to the centre for a word to sit on */
  var CLIP_OPEN = 400;    /* a clip circle wide open; mirrors animations.js  */
  var APART = 18;         /* how far each region slides out, picture units   */

  function bisMinor() { return seg.a + seg.span / 2; }
  function bisMajor() { return seg.a + seg.span / 2 + 180; }
  /* how far the chord stands from the centre */
  function chordDist() { return RR * Math.cos(seg.span / 2 * Math.PI / 180); }

  /* ---- the elements ----------------------------------------------------- */
  var dom = null;         /* pages.js's, with this section's own on top     */
  var mascot = null;
  var boxes = [];         /* the two name boxes, while they are built       */
  var labels = {};        /* the two "Segment" words                        */
  var callouts = {};      /* minor, major: the named callouts               */
  var nudges = [];        /* the pointing hand                              */
  var chips = [];

  function $(id) { return document.getElementById(id); }

  function build() {
    dom = Object.create(K.dom());
    mascot = K.mascot();

    dom.segs      = $('segs');
    dom.segDefs   = $('segDefs');
    dom.segGlow   = $('segGlow');
    dom.segDisc   = $('segDisc');
    dom.segArea   = $('segArea');
    dom.segMinor  = $('segMinor');
    dom.segMajor  = $('segMajor');
    dom.segChord  = $('segChord');
    dom.segRim    = $('segRim');
    dom.segTip    = $('segTip');
    dom.segBand   = $('segBand');
    dom.segBoxes  = $('segBoxes');
    dom.segMarks  = $('segMarks');
    dom.segCentre = $('segCentre');
    dom.segCentreDot = dom.segCentre.querySelector('.centre__dot');
    dom.segGhost  = $('segGhost');
    dom.segNudges = $('segNudges');
    dom.clipMinor = $('segClipMinorC');
    dom.clipMajor = $('segClipMajorC');
    dom.pointA    = point($('segPointA'));
    dom.pointB    = point($('segPointB'));

    labels.minor = label('seg-label--minor');
    labels.major = label('seg-label--major');
    callouts.minor = callout('seg-callout--minor');
    callouts.major = callout('seg-callout--major');
    nudges = [A.hand(dom.segNudges)];
    reset();
  }

  /* A point on the circle: the dot, and the finger-sized hit area over it. */
  function point(g) {
    return { g: g, dot: g.querySelector('.arc-dot'), hit: g.querySelector('.arc-dot__hit') };
  }
  function label(cls) {
    var t = el('text', { 'class': 'figure-label seg-label ' + cls,
                         x: 0, y: 0, 'text-anchor': 'middle' });
    dom.segMarks.appendChild(t);
    return t;
  }
  /* A callout of the same make as the sections before: an arrow and the
     word at its tail, in a group that is hidden until it is aimed. */
  function callout(cls) {
    var g = el('g', { 'class': 'seg-callout ' + cls });
    g.setAttribute('hidden', '');
    var c = {
      g: g,
      arrow: el('path', { 'class': 'mark__arrow', d: '' }),
      head:  el('path', { 'class': 'mark__head', d: '' }),
      label: el('text', { 'class': 'figure-label mark__label', x: 0, y: 0 })
    };
    g.appendChild(c.arrow); g.appendChild(c.head); g.appendChild(c.label);
    dom.segMarks.appendChild(g);
    return c;
  }

  /* ---- drawing from the angles ------------------------------------------ */

  /* Every mark that depends on the two points, rewritten from them: each
     region is its arc and then straight back along the chord; the chord
     runs from the point placed last; the circles the colour spreads from
     sit on the chord's middle. */
  function redraw() {
    var a = seg.a, b = seg.a + seg.span;
    var pA = P(a, RR), pB = P(b, RR);
    dom.segMinor.setAttribute('d', arcD(a, seg.span, false) + ' Z');
    dom.segMajor.setAttribute('d', arcD(a, 360 - seg.span, true) + ' Z');
    var from = seg.origin === 'b' ? pB : pA;
    var to   = seg.origin === 'b' ? pA : pB;
    dom.segChord.setAttribute('d', 'M' + from.x + ' ' + from.y + ' L' + to.x + ' ' + to.y);
    var mid = { x: round2((pA.x + pB.x) / 2), y: round2((pA.y + pB.y) / 2) };
    [dom.clipMinor, dom.clipMajor].forEach(function (c) {
      c.setAttribute('cx', mid.x);
      c.setAttribute('cy', mid.y);
    });
    place(dom.pointA, a);
    place(dom.pointB, b);
  }

  function dots() { return [dom.pointA.dot, dom.pointB.dot]; }
  function regions() { return [dom.segMinor, dom.segMajor]; }

  /* How far each clip circle has to grow from the chord's middle to take
     in its region: for the smaller, the further of its corners and its
     top; for the larger, the far side of the circle. */
  function reach() {
    var half = seg.span / 2 * Math.PI / 180;
    var d = RR * Math.cos(half);
    return [Math.max(RR * Math.sin(half), RR - d) + 6, RR + d + 6];
  }
  function revealSpec() {
    return { minor: dom.segMinor, major: dom.segMajor,
             clips: [dom.clipMinor, dom.clipMajor], reach: reach(),
             area: dom.segArea, dots: dots() };
  }

  /* How far each region slides out along its own middle when the two are
     pulled apart: one {x, y} per region, minor first. */
  function apart(d) {
    return [bisMinor(), bisMajor()].map(function (deg) {
      var t = deg * Math.PI / 180;
      return { x: Math.cos(t) * d, y: -Math.sin(t) * d };
    });
  }

  /* Where a region is marked -- a word set on it, an arrow aimed at it, a
     leader run to it: on its middle line, as {deg, r}. The smaller one
     midway between its chord and its arc; the larger one a set way out
     from the centre on its far side, where there is room for a word. */
  function spot(which) {
    if (which === 'minor') return { deg: bisMinor(), r: (chordDist() + RR) / 2 };
    return { deg: bisMajor(), r: Math.max(RR * MAJOR_IN, (RR - chordDist()) / 2) };
  }

  /* How much room, side to side, a region has at a point on it: the width
     of the circle at that height, cut off at the chord if the chord
     crosses that height. What a word set there has to fit into. */
  function roomAt(p) {
    var dy = p.y - CY;
    var half = Math.sqrt(Math.max(0, RR * RR - dy * dy));
    var xl = CX - half, xr = CX + half;
    var pA = P(seg.a, RR), pB = P(seg.a + seg.span, RR);
    var lo = Math.min(pA.y, pB.y), hi = Math.max(pA.y, pB.y);
    if (p.y > lo && p.y < hi && hi - lo > 0.01) {
      var xc = pA.x + (pB.x - pA.x) * (p.y - pA.y) / (pB.y - pA.y);
      if (p.x >= xc) xl = Math.max(xl, xc); else xr = Math.min(xr, xc);
    }
    return xr - xl;
  }

  /* A word set on a region, at its spot -- and made to fit it. The smaller
     region can be a narrow sliver when the chord stands near upright, and
     a word wider than the sliver would lie across the chord and the rim.
     So the word is measured against the room the region has at that
     height: it is set smaller when it has to be, down to a size a learner
     can still read, and when even that would not fit it stands just
     outside the rim beside the region instead, as the arcs' words do. The
     stylesheet's size is the size it is otherwise. */
  var LABEL_SIZE = 24, LABEL_MIN = 16, LABEL_FIT = 0.84, LABEL_OUT = 36;
  function aimLabel(text, s, str) {
    var p = P(s.deg, s.r);
    text.style.fontSize = '';
    text.textContent = str;
    var size = LABEL_SIZE;
    var room = roomAt(p) * LABEL_FIT;
    var w = 0;
    try { w = text.getBBox().width; } catch (e) { w = 0; }
    if (room > 0 && w > room) {
      var fit = LABEL_SIZE * room / w;
      if (fit >= LABEL_MIN) {
        size = Math.floor(fit);
        text.style.fontSize = size + 'px';
      } else {
        p = P(s.deg, RR + LABEL_OUT);
      }
    }
    text.setAttribute('x', p.x);
    text.setAttribute('y', round2(p.y + size * 0.375));
  }

  /* A callout aimed at a region: the tip just inside the rim, on the
     region's middle line, and the word just outside the rim beside it --
     to whichever side the region is on -- so the arrow is a short hop
     across the edge and the word sits close to the shape it names. Kept
     inside the picture top and bottom. */
  var CALL_IN = 30, CALL_OUT = 24, CALL_SIDE = 26, CALL_BEND = 14;
  function aimCallout(c, s, str) {
    var t = s.deg * Math.PI / 180;
    var side = Math.cos(t) >= -0.001 ? 1 : -1;
    var tip = P(s.deg, Math.max(s.r, RR - CALL_IN));
    var rim = P(s.deg, RR + CALL_OUT);
    var from = { x: round2(rim.x + side * CALL_SIDE),
                 y: round2(clamp(rim.y, 30, K.VB_H - 30)) };
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

  /* The two boxes, hung off the circle where the regions are: each to the
     side its region is on, tied by its leader to the spot on that region
     its name would sit, and set a little above or below that spot so the
     leader has a corner in it. Built afresh each time, because where the
     regions are depends on the two points the learner chose. The leader
     is reversed to run FROM the region, as the arcs' are, so its dashes
     start where it meets the region. */
  var BOX_IN = 30, BOX_OFF = 44;
  function buildBoxes() {
    clearBoxes();
    boxes = [{ name: 's4p4Major',   s: spot('major') },
             { name: 's4p1Segment', s: spot('minor') }].map(function (b, i) {
      var t = b.s.deg * Math.PI / 180;
      var right = Math.cos(t) >= 0;
      var anchor = P(b.s.deg, b.s.r);
      var y = anchor.y - K.BOX_H / 2 + (Math.sin(t) >= 0 ? -BOX_OFF : BOX_OFF);
      var box = K.buildBox(dom.segBoxes, dom.segDefs, {
        name: b.name,
        x: right ? K.VB_W - BOX_IN - K.BOX_W : BOX_IN,
        y: round2(clamp(y, 16, K.VB_H - 16 - K.BOX_H)),
        anchor: anchor
      }, 'segLeaderMask' + i);
      box.leader.setAttribute('d', A.reversed(box.leader.getAttribute('d')));
      return box;
    });
  }
  function clearBoxes() {
    boxes = [];
    dom.segBoxes.textContent = '';
    ['segLeaderMask0', 'segLeaderMask1'].forEach(function (id) {
      var m = dom.segDefs.querySelector('#' + id);
      if (m) m.parentNode.removeChild(m);
    });
  }
  function boxFor(name) {
    for (var i = 0; i < boxes.length; i++) if (boxes[i].name === name) return boxes[i];
    return null;
  }

  /* ---- the circle, drawn, and cut --------------------------------------- */
  function drawCircle() {
    return Flow.anim(Beats.drawRim(dom.segRim, dom.segTip))
      .then(function () { return Flow.wait(160); })
      .then(function () { return Flow.anim(Beats.fillDisc(dom.segDisc)); });
  }

  /* The two points put on the circle where `seg` has them, one after the
     other, the chord drawn between them, and the two regions coloured. */
  function cutCircle() {
    return Flow.anim(Beats.plotDot(dom.pointA.dot))
      .then(function () { return Flow.wait(200); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.pointB.dot)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.growLine(dom.segChord, 0.6)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.segReveal(revealSpec())); });
  }

  /* What arcs.js's two-point interaction works on here: this section's
     circle and marks, and its own state for the cut to be written into --
     the same shape arcs.js hands it for its own circle. */
  function pickCtx() {
    return {
      group: dom.segs, band: dom.segBand, ghost: dom.segGhost, nudges: dom.segNudges,
      hand: nudges[0], points: [dom.pointA, dom.pointB],
      done: function (cut) {
        seg.a = cut.a; seg.span = cut.span; seg.origin = cut.origin;
        redraw();
      }
    };
  }

  /* ======================================================================
   * Scene 1 -- segments. A circle on the blank board; the space inside it
   * named; two points, the chord between them, and the two regions it
   * makes -- coloured, called segments, and then named for their size.
   * ====================================================================== */
  function sceneSegments() {
    var picked = null;

    /* The board is blank and the bird is behind it, as the section before
       left them. The circle goes on first, with nobody speaking: it is
       the thing the whole section is about. */
    return Flow.wait(BEAT)
      .then(function () {
        dom.segs.removeAttribute('hidden');
        return drawCircle();
      })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the area ------------------------------------------------------
         The bird lands first and speaks second, so the words start on the
         header's clock and the inside can be lit on the words that name
         it: the rim stands back and the wash spreads from the centre. */
      .then(function () { return K.mascotJumpIn(); })
      .then(function () {
        var text = T('s1SegArea');
        return Promise.all([
          K.speak(keyed('s1SegArea')),
          K.onWord(text, 'inside', function () {
            return Flow.anim(Beats.areaIn(dom.segRim, dom.segArea));
          })
        ]);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        var text = T('s1SegDivide');
        return Promise.all([
          K.speak(keyed('s1SegDivide')),
          K.onWord(text, 'two regions', function () {
            return Flow.anim(Beats.areaPulse(dom.segArea));
          })
        ]);
      })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- two points ----------------------------------------------------
         The edge comes back up, because it is what is asked for next, and
         breathes while a point is wanted. Listening starts before the line
         is finished: a learner who does not wait to be told is not made
         to. */
      .then(function () { return Flow.anim(Beats.rimFull(dom.segRim)); })
      .then(function () {
        picked = K.quiet(A.pickPoints(pickCtx()));
        return K.speak(keyed('s1SegPick'));
      })
      .then(function () { return picked; })

      /* ---- the chord, and the two regions --------------------------------
         The line first, from the point just put down; then the colour,
         spreading from the line into each side of it. */
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.growLine(dom.segChord, 0.6)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.segReveal(revealSpec())); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- named as regions ----------------------------------------------
         "Chord": the line lit. "divides": the two regions pulled apart
         along the cut, and everything else on the circle -- the chord, its
         two points, the rim and the wash behind -- fades away with it, so
         the two regions are seen on their own, as two separate pieces.
         Held so until "two regions" puts them back and the rest with them. */
      .then(function () {
        dom.segMarks.removeAttribute('hidden');
        var text = T('s1SegChord');
        var behind = [dom.segChord, dom.segRim, dom.segDisc, dom.segArea].concat(dots());
        var was = null;
        return Promise.all([
          K.speak(keyed('s1SegChord')),
          K.onWord(text, 'chord', function () {
            return Flow.anim(Beats.linePulse([dom.segChord]));
          }),
          K.onWord(text, 'divides', function () {
            was = behind.map(function (e) { return parseFloat(getComputedStyle(e).opacity); });
            return Flow.anim(Beats.arcSplit(regions(), apart(APART), behind));
          }),
          K.onWord(text, 'two regions', function () {
            return Flow.anim(Beats.arcJoin(regions())).then(function () {
              return Flow.anim(M.to(behind, {
                opacity: function (i) { return was ? was[i] : 1; },
                duration: M.dur(0.35), ease: 'power2.out'
              }));
            });
          })
        ]);
      })
      .then(function () { return Flow.wait(BEAT); })
      /* "region": the word on the smaller; "segment": on the larger. */
      .then(function () {
        var text = T('s1SegEach');
        return Promise.all([
          K.speak(keyed('s1SegEach')),
          K.onWord(text, 'region', function () {
            aimLabel(labels.minor, spot('minor'), T('s1LblSegment'));
            return Flow.anim(Beats.labelIn(labels.minor));
          }),
          K.onWord(text, 'segment', function () {
            aimLabel(labels.major, spot('major'), T('s1LblSegment'));
            return Flow.anim(Beats.labelIn(labels.major));
          })
        ]);
      })
      .then(function () { return Flow.wait(BEAT + SHORT); })

      /* ---- and for their size --------------------------------------------
         The two words come off and each region is named on its own: lit
         while the other stands back, with a callout putting its name on
         it -- the smaller first, then the larger -- and both names are
         left standing until Next. */
      .then(function () { return Flow.anim(Beats.labelsOut([labels.minor, labels.major])); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        var text = T('s1SegMinorIs');
        return Promise.all([
          K.speak(keyed('s1SegMinorIs')),
          K.onWord(text, 'smaller', function () {
            return Flow.anim(Beats.segFocus([dom.segMinor], [dom.segMajor]));
          }),
          K.onWord(text, 'minor segment', function () {
            aimCallout(callouts.minor, spot('minor'), T('s4p1Segment'));
            return showCallout(callouts.minor);
          })
        ]);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        var text = T('s1SegMajorIs');
        return Promise.all([
          K.speak(keyed('s1SegMajorIs')),
          /* the smaller region stands back with its name and arrow, so the
             larger one and its name are the only thing at full */
          K.onWord(text, 'larger', function () {
            return Flow.anim(Beats.segFocus([dom.segMajor], [dom.segMinor, callouts.minor.g]));
          }),
          K.onWord(text, 'major segment', function () {
            aimCallout(callouts.major, spot('major'), T('s4p4Major'));
            return showCallout(callouts.major);
          })
        ]);
      })
      .then(function () { return Flow.wait(BEAT); })
      /* Both back to full, both named: the picture the learner is about
         to be asked about, read as one thing. */
      .then(function () {
        return Flow.anim(Beats.segUnfocus(regions().concat([callouts.minor.g, callouts.major.g])));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return K.handOver(dom.nextBtn); });
  }

  /* ======================================================================
   * Scene 2 -- name the segments. A clean board, and the circle made again
   * from nothing: drawn, its two points put back where the learner cut it,
   * the chord between them, and the two regions coloured -- in two NEW
   * colours, so the names have to be given for the regions' sizes and not
   * for the colours the lesson used. Then two boxes, two names to drag,
   * and the explanation either way.
   * ====================================================================== */
  function sceneNameSegments() {
    var span = seg.span;            /* the learner's cut, kept across the wipe */

    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle again, cut where it was, in new colours ------------ */
      .then(function () {
        seg.a = norm(TILT - span / 2); seg.span = span; seg.origin = 'a';
        redraw();
        dom.segs.classList.add('is-quiz');
        dom.segs.removeAttribute('hidden');
        return drawCircle();
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(cutCircle)
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the two boxes, one at a time ------------------------------------ */
      .then(function () {
        buildBoxes();
        dom.segBoxes.removeAttribute('hidden');
        return Flow.anim(Beats.boxIn(boxFor('s4p4Major')));
      })
      .then(function () { return Flow.wait(320); })
      .then(function () { return Flow.anim(Beats.boxIn(boxFor('s4p1Segment'))); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the names, placed with the bird watching -------------------------
         See namePair in pages.js: the bird stays until both are in, a wrong
         drop is answered in one line, and the page turns itself. */
      .then(function () {
        var done = K.namePair({
          boxes: boxes, group: dom.segBoxes, names: coin('s4p1Segment', 's4p4Major'),
          ask: 'dragNames',
          wrong: { s4p1Segment: 'segWrongMinor', s4p4Major: 'segWrongMajor' }
        });
        chips = K.chips();
        return done;
      })

      /* ---- and the section closes: the next opens on a blank board ------- */
      .then(function () { return K.wipeBoard(); });
  }

  /* ======================================================================
   * The hooks the board's housekeeping calls -- see addSection in pages.js
   * ====================================================================== */

  /* What this section has on the figure: the one group, faded as a whole. */
  function parts() { return [dom.segs]; }

  /* Back to rest, with no animation. The inline writes inside the figure
     are pages.js's to clear -- resetFigure does it for every descendant of
     the picture right after this -- so this is about attributes, classes
     and the boxes. */
  function reset() {
    seg.a = DEFAULT.a; seg.span = DEFAULT.span; seg.origin = 'a';

    dom.segs.setAttribute('hidden', '');
    dom.segs.classList.remove('is-picking', 'is-quiz');
    dom.segBoxes.classList.remove('is-live');
    [dom.segNudges, dom.segBoxes, dom.segMarks, dom.segCentre].forEach(function (g) {
      g.setAttribute('hidden', '');
    });
    Object.keys(callouts).forEach(function (k) { callouts[k].g.setAttribute('hidden', ''); });
    Object.keys(labels).forEach(function (k) { labels[k].style.fontSize = ''; });
    regions().concat([dom.segArea]).forEach(function (p) { p.classList.remove('is-lit'); });
    [dom.clipMinor, dom.clipMajor].forEach(function (c) { c.setAttribute('r', CLIP_OPEN); });
    dom.segGhost.setAttribute('r', 2);
    dom.segBand.setAttribute('tabindex', '-1');
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
    dom.segs.removeAttribute('hidden');
    redraw();
    M.set([dom.segDisc, dom.segRim, dom.segChord].concat(regions(), dots()), { opacity: 1 });
    mascot.placeIn(dom.slotHeader);
    mascot.el.classList.remove('is-away');
    mascot.idle();
  }

  Pages.addSection({
    name: 'Segments',
    scenes: [
      { name: 'Segments',          play: sceneSegments     },
      { name: 'Name the segments', play: sceneNameSegments }
    ],
    build: build,
    parts: parts,
    reset: reset,
    stage: stage
  });

  global.Segments = { state: function () { return seg; } };
})(window);
