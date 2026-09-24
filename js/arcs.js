/* ==========================================================================
 * arcs.js -- section 2: arcs, major and minor, the semicircle
 * --------------------------------------------------------------------------
 * The second section of the lesson, registered with pages.js as a section
 * (see addSection there): five scenes on the same board, with the same bird
 * and the same clock, built from the kit pages.js hands over and the beats
 * in animations.js. Nothing here waits on anything except through Flow, so
 * Skip, Replay and the level bar work on these scenes exactly as they do on
 * the first section's.
 *
 *   Arcs           the bird on the field, then a circle; the learner puts
 *                  two points on it and the circumference is recoloured as
 *                  the two pieces they cut it into; the circle stands aside
 *                  and the bird names them
 *   Minor & major  the two pieces named for their size: the smaller, then
 *                  the larger, each lit and labelled as it is named
 *   Name the arcs  a clean board; the circle made again, cut at the same
 *                  two points and coloured in two NEW colours; the two
 *                  names dragged into their boxes, then explained
 *   Semicircle     the points moved until the pieces are equal, and the
 *                  half that makes named
 *   Arc summary    the whole idea drawn once more, with no bird
 *
 * The section draws its OWN circle -- the #arcs group in index.html -- and
 * everything in this file is measured from the same three numbers as the
 * one above it (CX, CY, RR in pages.js), so the two circles are the same
 * circle in the same place. The two points are kept as ANGLES, and every
 * mark on the circle is redrawn from them: a turn is a change to one
 * number, a point dragged is a change to one number, and nothing can drift
 * away from anything else.
 *
 * The two-point interaction, the pointing hand and the geometry here are
 * also what the section AFTER this one is built from: they are handed over
 * on window.Arcs at the end of the file (see segments.js).
 *
 * Load order: js/pages.js -> js/arcs.js -> js/segments.js -> js/script.js
 * ========================================================================== */
(function (global) {
  'use strict';

  var M = global.Motion;
  var Flow = global.Flow;
  var Beats = global.Beats;
  var Pages = global.Pages;
  if (!Pages || !Pages.addSection) {
    console.error('arcs.js: load js/pages.js before js/arcs.js.');
    return;
  }
  var K = Pages.kit;

  /* ---- the script ------------------------------------------------------- */
  var LINES = {
    intro: 'Let’s explore more parts of the circle.',
    pick:  'Tap any two points on the circle.',
    arcs:  'Circumference is divided into two pieces, each piece is called an arc.',

    minorIs: 'The smaller piece is called the minor arc.',
    majorIs: 'The larger piece is called the major arc.',

    drag:  'Drag each name to the correct box.',
    major: 'Larger piece of the circle is the major arc.',
    minor: 'Smaller piece of the circle is the minor arc.',

    equal: 'Move both points to make the arcs equal.',
    which: 'What is this arc called?',
    semi:  'A semicircle is half of a circle.',
    semi2: 'A diameter divides a circle into two semicircles.'
  };

  var BEAT = K.BEAT, SHORT = K.SHORT, HOLD_ASK = K.HOLD_ASK;
  var CX = K.CX, CY = K.CY, RR = K.RR;
  var round2 = K.round2, el = K.el;

  /* ---- the two points, as angles ----------------------------------------
     Degrees anticlockwise from three o'clock, as pages.js's onRim has them.
     `a` is one point; the minor arc runs from it anticlockwise for `span`
     degrees to the other. `origin` says which of the two both pieces are
     DRAWN from -- 'a' or 'b' -- which matters only for the beat that strokes
     them: the two colours set off from the point the learner placed last
     and meet at the first. */
  var arc = { a: 25, span: 100, origin: 'a' };
  var DEFAULT = { a: 25, span: 100 };
  var SUMMARY = { a: 20, span: 100 };

  var MIN_SPAN = 105;     /* the least the learner may cut off, in degrees:
                             long enough to be plainly a piece of the circle */
  var MAX_SPAN = 150;     /* and the most: the smaller piece must LOOK smaller */
  var NUDGE_AFTER = 2000; /* ms with nothing placed before the hand shows the way */
  var NUDGE_FIRST = 60;   /* where the hand taps for the first point           */
  var NUDGE_NEXT = 125;   /* and, on from the first, for the second            */
  var TILT = 12;          /* the activity: where the minor arc's middle is put */
  var UP = 90;            /* the semicircle: straight up                   */
  var SHIFT = -250;       /* the circle's slide to the left half, picture units */
  var SNAP = 7;           /* degrees: a point this close to its mark is caught */
  var BAND = 46;          /* picture units either side of the rim that count as ON it */
  var ARC_W = 7;          /* --arc-weight in arcs.css                      */

  function norm(d)    { d = d % 360; return d < 0 ? d + 360 : d; }   /* [0, 360)    */
  function norm180(d) { d = norm(d); return d > 180 ? d - 360 : d; } /* (-180, 180] */
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function coin(a, b) { return Math.random() < 0.5 ? [a, b] : [b, a]; }

  /* A point `r` from the centre, `deg` degrees round. */
  function P(deg, r) {
    var t = deg * Math.PI / 180;
    return { x: round2(CX + Math.cos(t) * r), y: round2(CY - Math.sin(t) * r) };
  }

  /* A piece of the rim: from `from`, `sweep` degrees round, anticlockwise
     unless told otherwise. Our angles grow anticlockwise on screen, and an
     SVG arc's sweep flag of 1 means clockwise on screen, so the flag is the
     direction and the large-arc flag is whether the piece is more than a
     half. */
  function arcD(from, sweep, clockwise) {
    var to = clockwise ? from - sweep : from + sweep;
    var s = P(from, RR), e = P(to, RR);
    return 'M' + s.x + ' ' + s.y +
           ' A' + RR + ' ' + RR + ' 0 ' + (sweep > 180 ? 1 : 0) + ' ' + (clockwise ? 1 : 0) +
           ' ' + e.x + ' ' + e.y;
  }

  function bisMinor() { return arc.a + arc.span / 2; }
  function bisMajor() { return arc.a + arc.span / 2 + 180; }

  /* ---- the elements ----------------------------------------------------- */
  var dom = null;         /* pages.js's, with this section's own on top     */
  var mascot = null;
  var sayAside = null;    /* the typer bound to the line in the aside       */
  var boxes = [];         /* the two name boxes, while they are built       */
  var labels = {};        /* the two "Arc" words                            */
  var callouts = {};      /* minor, major: named callouts; arrow: an arrow alone */
  var nudges = [];        /* the two pointing hands                         */
  var chips = [];
  var choiceBtns = [];

  function $(id) { return document.getElementById(id); }

  function build() {
    /* Everything pages.js collected, readable as before, with this
       section's own elements added on a layer of its own. */
    dom = Object.create(K.dom());
    mascot = K.mascot();

    dom.arcs       = $('arcs');
    dom.arcDefs    = $('arcDefs');
    dom.arcRim     = $('arcRim');
    dom.arcTip     = $('arcTip');
    dom.arcBand    = $('arcBand');
    dom.arcDia     = $('arcDia');
    dom.arcMajor   = $('arcMajor');
    dom.arcMinor   = $('arcMinor');
    dom.arcBoxes   = $('arcBoxes');
    dom.arcNudges  = $('arcNudges');
    dom.arcMarks   = $('arcMarks');
    dom.arcCentre  = $('arcCentre');
    dom.arcCentreDot = dom.arcCentre.querySelector('.centre__dot');
    dom.arcGhost   = $('arcGhost');
    dom.pointA     = point($('arcPointA'));
    dom.pointB     = point($('arcPointB'));
    dom.aside      = $('aside');
    dom.slotAside  = $('slotAside');
    dom.bubbleAside = $('bubbleAside');

    /* The mask the dashed diameter is drawn through: the same line, solid
       and wider, and the whole picture as its region -- a level line's own
       box has no height for a mask to be measured against. */
    var mask = el('mask', { id: 'arcDiaMask', maskUnits: 'userSpaceOnUse',
                            x: 0, y: 0, width: K.VB_W, height: K.VB_H });
    dom.arcDiaMask = el('path', { 'class': 'arc-dia-mask', d: dom.arcDia.getAttribute('d') });
    mask.appendChild(dom.arcDiaMask);
    dom.arcDefs.appendChild(mask);

    labels.minor = label('arc-label--minor');
    labels.major = label('arc-label--major');
    callouts.minor = callout('arc-callout--minor');
    callouts.major = callout('arc-callout--major');
    callouts.arrow = callout('');
    nudges = [hand(), hand()];

    sayAside = global.Typer.create($('asideType'), { box: dom.bubbleAside });
    reset();
  }

  /* A point on the circle: the dot, and the finger-sized hit area over it. */
  function point(g) {
    return { g: g, dot: g.querySelector('.arc-dot'), hit: g.querySelector('.arc-dot__hit') };
  }
  function label(cls) {
    var t = el('text', { 'class': 'figure-label arc-label ' + cls,
                         x: 0, y: 0, 'text-anchor': 'middle' });
    dom.arcMarks.appendChild(t);
    return t;
  }
  /* A callout of the same make as section 1's one: an arrow and the word
     at its tail, in a group that is hidden until it is aimed. */
  function callout(cls) {
    var g = el('g', { 'class': 'arc-callout ' + cls });
    g.setAttribute('hidden', '');
    var c = {
      g: g,
      arrow: el('path', { 'class': 'mark__arrow', d: '' }),
      head:  el('path', { 'class': 'mark__head', d: '' }),
      label: el('text', { 'class': 'figure-label mark__label', x: 0, y: 0 })
    };
    g.appendChild(c.arrow); g.appendChild(c.head); g.appendChild(c.label);
    dom.arcMarks.appendChild(g);
    return c;
  }

  /* A pointing hand, drawn in line as the tap icon on a phone is: the
     index finger up with its tip at the origin, three fingers curled
     beside it, the thumb to the other side, the palm below -- one stroke
     and no fill -- and a thin ring round the fingertip that the tap nudge
     sends outward. Placed as one group, in `parent`: this section's own
     group of hands unless a later section asks for a hand of its own. */
  var HAND_D =
    'M-3.5 26 C-5 24 -7 23 -9.5 23.5 C-13 24.5 -14 28 -12 31 L-6 39 C-3 44 3 47 9 47 ' +
    'C18 47 24.5 41 24.5 31 L24.5 18.5 A3.5 3.5 0 0 0 17.5 18.5 L17.5 22 ' +
    'M17.5 22 L17.5 16 A3.5 3.5 0 0 0 10.5 16 L10.5 22 ' +
    'M10.5 22 L10.5 13.5 A3.5 3.5 0 0 0 3.5 13.5 L3.5 22 ' +
    'M3.5 22 L3.5 3.5 A3.5 3.5 0 0 0 -3.5 3.5 L-3.5 26';
  var RING_R = 17;               /* the ring's resting radius, in the hand's units */
  var HAND_SCALE = 1.4;          /* the hand is about 66 picture units tall */

  function hand(parent) {
    var g = el('g', { 'class': 'arc-nudge' });
    g.appendChild(el('circle', { 'class': 'arc-nudge__ring', cx: 0, cy: 0, r: RING_R }));
    g.appendChild(el('path', { 'class': 'arc-nudge__hand', d: HAND_D }));
    (parent || dom.arcNudges).appendChild(g);
    return g;
  }

  /* The hand set with its fingertip on the rim at `deg`, `gap` units
     outside the piece's edge, and upright -- a finger coming down onto a
     spot on a screen, whichever way round the circle the spot is. `scale`
     is the pulse's, about the fingertip, so a hand that swells stays on
     the same spot. Written as one transform attribute, and never through
     GSAP, so the placement and the pop on a point next to it can never
     fight over the same matrix. */
  function handAt(h, deg, gap, scale) {
    var q = P(deg, RR + ARC_W / 2 + gap);
    h.setAttribute('transform',
      'translate(' + q.x + ' ' + q.y + ') scale(' + round2(HAND_SCALE * (scale || 1)) + ')');
  }
  /* The ring round a hand's fingertip at `k` times its resting size and
     `alpha` opacity: what the tap nudge sends outward. */
  function rippleAt(h, k, alpha) {
    var ring = h.querySelector('.arc-nudge__ring');
    if (!ring) return;
    ring.setAttribute('r', round2(RING_R * k));
    ring.style.opacity = alpha;
  }

  /* ---- drawing from the angles ------------------------------------------ */

  function place(pt, deg) {
    var p = P(deg, RR);
    [pt.dot, pt.hit].forEach(function (c) {
      c.setAttribute('cx', p.x);
      c.setAttribute('cy', p.y);
    });
  }

  /* Every mark that depends on the two points, rewritten from them. */
  function redraw() {
    var b = arc.a + arc.span;
    if (arc.origin === 'b') {
      dom.arcMinor.setAttribute('d', arcD(b, arc.span, true));
      dom.arcMajor.setAttribute('d', arcD(b, 360 - arc.span, false));
    } else {
      dom.arcMinor.setAttribute('d', arcD(arc.a, arc.span, false));
      dom.arcMajor.setAttribute('d', arcD(arc.a, 360 - arc.span, true));
    }
    place(dom.pointA, arc.a);
    place(dom.pointB, b);
  }

  function dots() { return [dom.pointA.dot, dom.pointB.dot]; }
  function pieces() { return [dom.arcMinor, dom.arcMajor]; }

  /* How far each piece slides out along its own middle when the two are
     pulled apart: one {x, y} per piece, minor first. */
  function apart(d) {
    return [bisMinor(), bisMajor()].map(function (deg) {
      var t = deg * Math.PI / 180;
      return { x: Math.cos(t) * d, y: -Math.sin(t) * d };
    });
  }

  /* The marks on the circle turned until the minor arc's middle is at
     `target` degrees -- the shorter way round. Where it comes to rest the
     angle is brought back into one turn: a turn is a change to the number,
     and a few turns can carry it past 360 -- the same place on the circle,
     but the scenes that measure the points against three and nine o'clock
     need the number itself to be there too. */
  function turnTo(target) {
    var delta = norm180(target - bisMinor());
    if (Math.abs(delta) < 0.5) { settle(); return Promise.resolve(); }
    return Flow.anim(Beats.turnArcs(arc, delta, redraw)).then(settle);
  }
  function settle() {
    arc.a = norm(arc.a);
    redraw();
  }

  /* A word set just outside a piece, at its middle. */
  var LABEL_OUT = 34;
  function aimLabel(text, deg, str) {
    var p = P(deg, RR + LABEL_OUT);
    text.setAttribute('x', p.x);
    text.setAttribute('y', p.y + 9);
    text.textContent = str;
  }

  /* A callout aimed at a piece: the tip just outside the rim at `deg`, the
     word off to whichever side the piece is on, and the shaft running
     level out from under the word before it curves in to the tip -- the
     shape section 1's callouts have. Kept inside the picture top and
     bottom, where the circle comes close to the edge. */
  var CALL_TIP = 14, CALL_REACH = 96, CALL_LIFT = 22, CALL_BEND = 42;
  function aimCallout(c, deg, str) {
    var t = deg * Math.PI / 180;
    var side = Math.cos(t) >= -0.001 ? 1 : -1;
    var up = Math.sin(t) >= 0 ? -1 : 1;
    var tip = P(deg, RR + CALL_TIP);
    var from = { x: round2(tip.x + side * CALL_REACH),
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
  function hideCallout(c) {
    return Flow.anim(Beats.calloutOut(c.g, [c.arrow, c.head, c.label]));
  }

  /* The two boxes, hung off the circle where the pieces are: each to the
     side its piece is on, tied by its leader to the outer edge of the
     middle of that piece, and set a little above or below that point so
     the leader has a corner in it. Built afresh each time, because where
     the pieces are depends on the two points the learner chose.
       The leader is rewritten to run FROM the piece: its dash pattern then
     starts with a dash at the piece's edge, and the line is seen to touch
     the piece whatever its length leaves at the far end. The mask it is
     drawn through keeps the other direction, so it still draws out from
     the box. */
  var BOX_IN = 30, BOX_OFF = 44, ANCHOR_OUT = ARC_W / 2 - 0.5;
  function buildBoxes() {
    clearBoxes();
    boxes = [{ name: 'Major arc', deg: bisMajor() },
             { name: 'Minor arc', deg: bisMinor() }].map(function (s, i) {
      var t = s.deg * Math.PI / 180;
      var right = Math.cos(t) >= 0;
      var anchor = P(s.deg, RR + ANCHOR_OUT);
      var y = anchor.y - K.BOX_H / 2 + (Math.sin(t) >= 0 ? -BOX_OFF : BOX_OFF);
      var box = K.buildBox(dom.arcBoxes, dom.arcDefs, {
        name: s.name,
        x: right ? K.VB_W - BOX_IN - K.BOX_W : BOX_IN,
        y: round2(clamp(y, 16, K.VB_H - 16 - K.BOX_H)),
        anchor: anchor
      }, 'arcLeaderMask' + i);
      box.leader.setAttribute('d', reversed(box.leader.getAttribute('d')));
      return box;
    });
  }
  /* A polyline path, the other way round. */
  function reversed(d) {
    var n = d.replace(/[ML]/g, ' ').trim().split(/\s+/);
    var out = [];
    for (var i = n.length - 2; i >= 0; i -= 2) out.push(n[i] + ' ' + n[i + 1]);
    return 'M' + out.join(' L');
  }
  function clearBoxes() {
    boxes = [];
    dom.arcBoxes.textContent = '';
    ['arcLeaderMask0', 'arcLeaderMask1'].forEach(function (id) {
      var m = dom.arcDefs.querySelector('#' + id);
      if (m) m.parentNode.removeChild(m);
    });
  }
  function boxFor(name) {
    for (var i = 0; i < boxes.length; i++) if (boxes[i].name === name) return boxes[i];
    return null;
  }

  /* Where on the picture a point on the screen is. Measured through the
     matrix of the group the circle is drawn in, so it is right whether the
     circle is standing in the middle or has slid aside, and whatever size
     the board is. */
  function toPicture(group, x, y) {
    var pt = dom.figure.createSVGPoint();
    pt.x = x; pt.y = y;
    var m = group.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()) : { x: CX, y: CY };
  }
  function polar(group, ev) {
    var p = toPicture(group, ev.clientX, ev.clientY);
    var dx = p.x - CX, dy = CY - p.y;
    return { deg: Math.atan2(dy, dx) * 180 / Math.PI, dist: Math.sqrt(dx * dx + dy * dy) };
  }

  /* What the two-point interaction below works on, here: this section's
     own circle and the marks on it, and its own state for the cut to be
     written into. A later section hands over the same shape for ITS
     circle -- see segments.js -- which is why the interaction takes this
     rather than reaching for the elements itself. */
  function pickCtx() {
    return {
      group: dom.arcs, band: dom.arcBand, ghost: dom.arcGhost, nudges: dom.arcNudges,
      hand: nudges[0], points: [dom.pointA, dom.pointB],
      done: function (cut) {
        arc.a = cut.a; arc.span = cut.span; arc.origin = cut.origin;
        redraw();
      }
    };
  }

  /* ---- the circle, drawn ------------------------------------------------
     The rim only. The lesson's circle is filled once it is drawn; this one is
     left as an open ring, because the section is about the line itself. */
  function drawCircle() {
    return Flow.anim(Beats.drawRim(dom.arcRim, dom.arcTip));
  }

  /* The two points put on the circle where `arc` has them, one after the
     other, and the circumference between them coloured as two pieces. */
  function cutCircle() {
    return Flow.anim(Beats.plotDot(dom.pointA.dot))
      .then(function () { return Flow.wait(200); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.pointB.dot)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Flow.anim(Beats.arcSweep({
          minor: dom.arcMinor, major: dom.arcMajor, rim: dom.arcRim, dots: dots()
        }));
      });
  }

  /* ---- the bird in the aside -------------------------------------------- */
  function sayBeside(text) {
    /* the order the welcome uses: armed and laid out, then opened */
    mascot.state('talking');
    Beats.bubbleArm(dom.bubbleAside);
    var said = sayAside(text);
    Beats.bubbleIn(dom.bubbleAside);
    return said;
  }

  /* When a phrase of a line is due under the typer's clock. The reveal is
     paced per character from the moment it starts, so the moment a phrase
     begins is its offset into the line times the pace -- which is what
     lets a mark on the circle land on the word that names it. */
  function cue(text, phrase) {
    var i = text.indexOf(phrase);
    return i < 0 ? 0 : i * global.Typer.TYPE_MS;
  }
  function at(ms, fn) { return Flow.wait(ms).then(fn); }

  /* ======================================================================
   * The interaction: two points on the circle
   * ----------------------------------------------------------------------
   * The rim is the target, and it is a thin one, so the finger is not
   * asked to hit it. A press anywhere in a band either side of the rim is
   * taken as a press ON the rim, at the nearest point of it, and what
   * shows that is the ghost: a faint point sitting on the rim exactly
   * where the press would land, sliding along the rim under the finger --
   * or under a hovering mouse -- so the learner is choosing a PLACE on the
   * circle rather than aiming at a line. Letting go puts the point down
   * where the ghost is; a finger may slide along the rim before it does.
   *
   * After the first point, the ghost is kept a clear distance from it and
   * from the point opposite: the two have to cut off a piece small enough
   * to be plainly the smaller, and long enough to be plainly a piece, and
   * the scenes after turn on that. Rather than refuse a bad second point,
   * the ghost simply will not go there -- it stops at the nearest allowed
   * spot -- so there is nothing to get wrong.
   *
   * While a point is wanted the rim breathes (a class the stylesheet
   * animates), and if nothing has been placed for a couple of seconds and
   * nothing is under way, a faint hand taps a spot on the rim to show what
   * to do. It goes the moment the learner reaches for the rim, and comes
   * back if they let go of it without placing anything.
   *
   * Keyboard: the band takes focus, the arrows walk the ghost round the
   * rim, and Enter or Space puts the point down.
   *
   * `c` is the circle it works on -- the group, the band and the ghost on
   * it, the group its hand lives in and the hand itself, the two points as
   * [first, second] -- and `c.done`, which is handed the cut the two
   * points make, as {a, span, origin} (the shape `arc` keeps), the moment
   * the second is down. This section's own is pickCtx(); the section
   * after it hands over the same shape for its circle.
   *
   * Resolves once both points are down. Waits on the lesson's gate, so a
   * retired scene cancels it.
   * ====================================================================== */
  function pickPoints(c) {
    var svg = dom.figure;
    var group = c.group, band = c.band, ghost = c.ghost, hand = c.hand;
    var picked = [];
    var ghostOn = false;
    var ghostAt = 90;
    var press = null;               /* { id } -- the finger down, if any */
    var live = true;
    var nudge = null;               /* the hand's loop, while it is showing */
    var idle = 0;                   /* which wait for the hand is the current one */

    group.classList.add('is-picking');
    band.setAttribute('tabindex', '0');

    /* ---- the hand ---- */
    function armHand() {
      var mine = ++idle;
      Flow.wait(NUDGE_AFTER).then(function () {
        if (!live || mine !== idle || ghostOn || press || nudge) return;
        var spot = picked.length ? picked[0] + NUDGE_NEXT : NUDGE_FIRST;
        c.nudges.removeAttribute('hidden');
        nudge = Beats.nudgeTap(hand,
          function (scale) { handAt(hand, spot, 2, scale); },
          function (k, alpha) { rippleAt(hand, k, alpha); });
      }, function () { /* the scene was retired: nothing to show */ });
    }
    function restHand() {
      idle++;
      if (!nudge) return;
      Beats.nudgeStop(nudge, hand);
      nudge = null;
    }

    function nearRim(q) { return Math.abs(q.dist - RR) <= BAND; }

    /* Where the ghost may go, given what has been placed. */
    function allowed(deg) {
      if (!picked.length) return deg;
      var d = norm(deg - picked[0]);
      if (d >= MIN_SPAN && d <= MAX_SPAN) return deg;
      if (d >= 360 - MAX_SPAN && d <= 360 - MIN_SPAN) return deg;
      /* outside both stretches: the nearest edge of either */
      var best = MIN_SPAN, gap = 361;
      [MIN_SPAN, MAX_SPAN, 360 - MAX_SPAN, 360 - MIN_SPAN].forEach(function (e) {
        var g = Math.abs(norm180(d - e));
        if (g < gap) { gap = g; best = e; }
      });
      return picked[0] + best;
    }

    function showGhost(deg) {
      ghostAt = deg;
      var p = P(deg, RR);
      ghost.setAttribute('cx', p.x);
      ghost.setAttribute('cy', p.y);
      if (!ghostOn) {
        ghostOn = true;
        Beats.ghostIn(ghost);
        restHand();
      }
    }
    function hideGhost() {
      if (!ghostOn) return;
      ghostOn = false;
      Beats.ghostOut(ghost);
      armHand();
    }

    function onMove(ev) {
      if (!live) return;
      /* a finger shows the ghost only while it is down; a mouse whenever it is near */
      if (ev.pointerType === 'touch' && !press) return;
      if (press && ev.pointerId !== press.id) return;
      var q = polar(group, ev);
      if (nearRim(q)) showGhost(allowed(q.deg)); else hideGhost();
    }
    function onDown(ev) {
      if (!live || press) return;
      var q = polar(group, ev);
      if (!nearRim(q)) return;
      press = { id: ev.pointerId };
      showGhost(allowed(q.deg));
    }
    function onUp(ev) {
      if (!live || !press || ev.pointerId !== press.id) return;
      press = null;
      var q = polar(group, ev);
      if (!nearRim(q)) { hideGhost(); return; }
      put(allowed(q.deg), ev);
      if (ev.pointerType === 'touch') hideGhost();
    }
    function onCancel(ev) {
      if (!press || ev.pointerId !== press.id) return;
      press = null;
      hideGhost();
    }
    function onKey(ev) {
      if (!live) return;
      var step = ev.shiftKey ? 15 : 5;
      var k = ev.key;
      if (k === 'ArrowLeft' || k === 'ArrowUp') {
        ev.preventDefault(); showGhost(allowed(ghostAt + step));
      } else if (k === 'ArrowRight' || k === 'ArrowDown') {
        ev.preventDefault(); showGhost(allowed(ghostAt - step));
      } else if (k === 'Enter' || k === ' ' || k === 'Spacebar') {
        ev.preventDefault();
        if (!ghostOn) showGhost(allowed(ghostAt)); else put(ghostAt, null);
      }
    }
    function onFocus() { if (!ghostOn) showGhost(allowed(ghostAt)); }
    function onBlur() { if (!press) hideGhost(); }

    function put(deg, ev) {
      var pt = c.points[picked.length ? 1 : 0];
      picked.push(deg);
      place(pt, deg);
      K.ripple(ev, pt.dot);
      Beats.plotDot(pt.dot);
      restHand();
      if (picked.length < 2) {
        /* the ghost, if it is out, steps clear of the point just placed;
           if it is not, the hand is given its couple of seconds again */
        if (ghostOn) showGhost(allowed(ghostAt)); else armHand();
        return;
      }
      hideGhost();
      finish();
    }
    function finish() {
      if (!live) return;
      live = false;
      /* the minor arc runs anticlockwise from `a`: whichever of the two
         that makes `a`, the pieces are drawn from the point placed LAST */
      var d = norm(picked[1] - picked[0]);
      var cut = d <= 180
        ? { a: norm(picked[0]), span: d,       origin: 'b' }
        : { a: norm(picked[1]), span: 360 - d, origin: 'a' };
      c.done(cut);
      dom.gate.dispatchEvent(new MouseEvent('click'));
    }
    function off() {
      live = false;
      restHand();
      svg.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onCancel);
      band.removeEventListener('keydown', onKey);
      band.removeEventListener('focus', onFocus);
      band.removeEventListener('blur', onBlur);
      band.setAttribute('tabindex', '-1');
      group.classList.remove('is-picking');
      hideGhost();
      idle++;                       /* and no hand after the ghost has gone */
      press = null;
    }

    svg.addEventListener('pointerdown', onDown);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onCancel);
    band.addEventListener('keydown', onKey);
    band.addEventListener('focus', onFocus);
    band.addEventListener('blur', onBlur);
    armHand();

    return Flow.once(dom.gate).then(
      function () { off(); },
      function (err) { off(); throw err; });
  }

  /* ======================================================================
   * The interaction: the points moved until the pieces are equal
   * ----------------------------------------------------------------------
   * Each point slides along the rim under the finger, and no further than
   * the mark it is heading for: the right-hand point between where it is
   * and three o'clock, the left-hand one between where it is and nine. The
   * two pieces are redrawn under them as they go, so the smaller piece is
   * SEEN to grow. Within a few degrees of its mark a point is caught by it
   * -- one pop, and it stays -- and when both have been caught the two
   * pieces are halves.
   *
   * Once `ready` settles -- the instruction has been read -- a faint hand
   * on each point shows it being carried to its mark, over and over, until
   * that point is taken hold of.
   *
   * Keyboard: each point's hit area takes focus; the arrows walk it, down
   * being towards its mark.
   * ====================================================================== */
  function slidePoints(ready) {
    var live = true;
    var held = null;                /* { s, id } -- the point under a finger */
    var b0 = arc.a + arc.span;
    var pts = [
      { p: dom.pointA, hand: nudges[0], target: 0, from: arc.a,
        get: function () { return arc.a; },
        set: function (v) { var b = arc.a + arc.span; arc.a = v; arc.span = b - v; } },
      { p: dom.pointB, hand: nudges[1], target: 180, from: b0,
        get: function () { return arc.a + arc.span; },
        set: function (v) { arc.span = v - arc.a; } }
    ];
    pts.forEach(function (s) {
      s.lo = Math.min(s.target, s.from);
      s.hi = Math.max(s.target, s.from);
      s.done = false;
      s.moved = false;
      s.nudge = null;
    });

    dom.arcs.classList.add('is-sliding');
    pts.forEach(function (s) { s.p.hit.setAttribute('tabindex', '0'); });

    /* ---- the hands ---- */
    function showHands() {
      if (!live) return;
      dom.arcNudges.removeAttribute('hidden');
      pts.forEach(function (s) {
        if (s.done || s.moved || s.nudge) return;
        s.nudge = Beats.nudgeSlide(s.hand, function (t, gap) {
          handAt(s.hand, s.from + (s.target - s.from) * t, gap);
        });
      });
    }
    function restHand(s) {
      if (!s.nudge) return;
      Beats.nudgeStop(s.nudge, s.hand);
      s.nudge = null;
    }
    (ready || Promise.resolve()).then(showHands, function () { /* retired */ });

    function ptOf(node) {
      for (var i = 0; i < pts.length; i++) if (pts[i].p.hit === node) return pts[i];
      return null;
    }
    /* The angle under the finger, brought into the point's own stretch:
       outside it, the nearer end. */
    function angleFor(s, ev) {
      var deg = polar(dom.arcs, ev).deg;
      if (deg < s.lo || deg > s.hi) {
        var toLo = Math.abs(norm180(deg - s.lo)), toHi = Math.abs(norm180(deg - s.hi));
        deg = toLo <= toHi ? s.lo : s.hi;
      }
      return deg;
    }
    function moveTo(s, deg) {
      if (s.done) return;
      var v = clamp(deg, s.lo, s.hi);
      if (Math.abs(v - s.target) <= SNAP) v = s.target;
      if (!s.moved && Math.abs(v - s.from) > 0.5) {
        s.moved = true;
        restHand(s);
      }
      s.set(v);
      redraw();
      if (v === s.target) {
        s.done = true;
        s.p.g.classList.remove('is-held');
        s.p.g.classList.add('is-set');
        Beats.snapDot(s.p.dot);
        if (held && held.s === s) held = null;
        if (pts.every(function (x) { return x.done; })) finish();
      }
    }

    function onDown(ev) {
      if (!live || held) return;
      var s = ptOf(ev.currentTarget);
      if (!s || s.done) return;
      ev.preventDefault();
      held = { s: s, id: ev.pointerId };
      s.p.g.classList.add('is-held');
      restHand(s);                  /* taken hold of: the hand has done its job */
      if (ev.currentTarget.setPointerCapture) {
        try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) { /* fine */ }
      }
    }
    function onMove(ev) {
      if (!live || !held || ev.pointerId !== held.id) return;
      moveTo(held.s, angleFor(held.s, ev));
    }
    function onUp(ev) {
      if (!held || ev.pointerId !== held.id) return;
      held.s.p.g.classList.remove('is-held');
      held = null;
    }
    function onKey(ev) {
      var s = ptOf(ev.currentTarget);
      if (!live || !s || s.done) return;
      var k = ev.key, toward = 0;
      if (k === 'ArrowDown') toward = 1;
      else if (k === 'ArrowUp') toward = -1;
      else if (k === 'ArrowRight') toward = s.target === 0 ? 1 : -1;
      else if (k === 'ArrowLeft') toward = s.target === 0 ? -1 : 1;
      if (!toward) return;
      ev.preventDefault();
      var step = (ev.shiftKey ? 15 : 4) * toward * (s.target === 0 ? -1 : 1);
      moveTo(s, s.get() + step);
    }
    function finish() {
      if (!live) return;
      live = false;
      dom.gate.dispatchEvent(new MouseEvent('click'));
    }
    function off() {
      live = false;
      pts.forEach(function (s) {
        restHand(s);
        s.p.hit.removeEventListener('pointerdown', onDown);
        s.p.hit.removeEventListener('keydown', onKey);
        s.p.hit.setAttribute('tabindex', '-1');
        s.p.g.classList.remove('is-held');
      });
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      dom.arcs.classList.remove('is-sliding');
      held = null;
    }

    pts.forEach(function (s) {
      s.p.hit.addEventListener('pointerdown', onDown);
      s.p.hit.addEventListener('keydown', onKey);
    });
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);

    return Flow.once(dom.gate).then(
      function () { off(); },
      function (err) { off(); throw err; });
  }

  /* ======================================================================
   * Scene 1 -- arcs. The bird on the field, a circle, two points, the two
   * pieces they make -- and the bird beside the circle to name them.
   * ====================================================================== */
  function sceneArcs() {
    var picked = null;

    /* The board goes, and the bird is found standing on the field behind
       it: put there while the board still covered it, idling, with nothing
       to say yet -- so what the board shrinking away uncovers is a
       character who was there all along. */
    mascot.placeIn(dom.slotHero);
    mascot.el.classList.remove('is-away');
    mascot.idle();

    return Flow.anim(Beats.boardOut(dom.board))
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        mascot.state('talking');
        Beats.bubbleArm(dom.bubble);
        var said = K.sayBubble(LINES.intro);
        Beats.bubbleIn(dom.bubble);
        return said;
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(BEAT + SHORT);
      })

      /* ---- the board, and a circle on it ---------------------------------
         The bubble goes, the board grows in over the bird -- the hero slot
         sits under it -- and the circle is drawn on the empty board. */
      .then(function () { return Flow.anim(Beats.bubbleOut(dom.bubble)); })
      .then(function () {
        K.clearBubble();
        return Flow.anim(Beats.boardIn(dom.board));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        dom.arcs.removeAttribute('hidden');
        return drawCircle();
      })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- two points ------------------------------------------------------
         Listening starts as the bird lands, before its line is finished: a
         learner who does not wait to be told is not made to. */
      .then(function () {
        picked = K.quiet(pickPoints(pickCtx()));
        return K.arriveSaying(LINES.pick);
      })
      .then(function () {
        mascot.settle();
        return picked;
      })

      /* ---- the circumference, in two colours ------------------------------ */
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Flow.anim(Beats.arcSweep({
          minor: dom.arcMinor, major: dom.arcMajor, rim: dom.arcRim, dots: dots()
        }));
      })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle stands aside; the bird comes round to name the pieces --
         The bird drops behind the board and the header closes; the circle
         slides to the left half as the stage takes the room; the bird comes
         back up over the board's edge and lands in the right half, and its
         line is said with the pieces acting it out under the words. */
      .then(function () {
        return Promise.all([K.mascotJumpOut(), Flow.anim(Beats.lineOut(dom.promptLine))]);
      })
      .then(function () {
        K.clearPrompt();
        return Promise.all([
          Flow.anim(K.collapseHeader(true)),
          Flow.anim(Beats.slideArcs(dom.arcs, SHIFT))
        ]);
      })
      .then(function () {
        dom.aside.removeAttribute('hidden');
        return K.mascotJumpIn(dom.slotAside);
      })
      .then(function () {
        dom.arcMarks.removeAttribute('hidden');
        var text = LINES.arcs;
        var said = sayBeside(text);
        return Promise.all([
          said,
          /* "Circumference": the whole rim, lit as one */
          at(cue(text, 'Circumference'), function () {
            return Flow.anim(Beats.arcPulse(pieces()));
          }),
          /* "divided into two pieces": pulled apart at the two points */
          at(cue(text, 'divided'), function () {
            return Flow.anim(Beats.arcSplit(pieces(), apart(10)));
          }),
          /* "each piece is called an arc": back together, and each named */
          at(cue(text, 'each'), function () {
            return Flow.anim(Beats.arcJoin(pieces())).then(function () {
              aimLabel(labels.minor, bisMinor(), 'Arc');
              return Flow.anim(Beats.labelIn(labels.minor));
            });
          }),
          at(cue(text, 'an arc'), function () {
            aimLabel(labels.major, bisMajor(), 'Arc');
            return Flow.anim(Beats.labelIn(labels.major));
          })
        ]);
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(SHORT);
      })
      .then(function () { return K.handOver(dom.nextBtn); });
  }

  /* ======================================================================
   * Scene 2 -- minor and major. The bird and its line go and the circle
   * comes back to the middle; the bird comes up onto the header and names
   * the two pieces for their size -- the smaller one first, lit while the
   * other stands back and a callout puts its name on it, then the larger
   * the same way -- and both names are left standing.
   * ====================================================================== */
  function sceneMinorMajor() {
    return Promise.all([
        Flow.anim(Beats.bubbleOut(dom.bubbleAside)),
        Flow.anim(Beats.labelsOut([labels.minor, labels.major])),
        K.mascotJumpOut()
      ])
      .then(function () {
        sayAside.clear();
        dom.aside.setAttribute('hidden', '');
        M.set([labels.minor, labels.major], { clearProps: 'opacity,transform' });
        return Promise.all([
          Flow.anim(K.collapseHeader(false)),
          Flow.anim(Beats.slideArcs(dom.arcs, 0))
        ]);
      })
      .then(function () { return Flow.wait(SHORT); })
      /* The bird lands first and speaks second, so the words start on the
         header's clock and the pieces can be lit on the very words that
         name them. */
      .then(function () { return K.mascotJumpIn(); })

      /* ---- the smaller piece ------------------------------------------------ */
      .then(function () {
        dom.arcMarks.removeAttribute('hidden');
        var text = LINES.minorIs;
        return Promise.all([
          K.speak(text),
          at(cue(text, 'smaller'), function () {
            return Flow.anim(Beats.arcFocus([dom.arcMinor], [dom.arcMajor]));
          }),
          at(cue(text, 'minor arc'), function () {
            aimCallout(callouts.minor, bisMinor(), 'Minor arc');
            return showCallout(callouts.minor);
          })
        ]);
      })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the larger piece ------------------------------------------------- */
      .then(function () {
        var text = LINES.majorIs;
        return Promise.all([
          K.speak(text),
          at(cue(text, 'larger'), function () {
            return Flow.anim(Beats.arcFocus([dom.arcMajor], [dom.arcMinor]));
          }),
          at(cue(text, 'major arc'), function () {
            aimCallout(callouts.major, bisMajor(), 'Major arc');
            return showCallout(callouts.major);
          })
        ]);
      })
      .then(function () { return Flow.wait(BEAT); })
      /* Both back to full, both named: the picture the learner is about
         to be asked about, read as one thing. */
      .then(function () { return Flow.anim(Beats.arcUnfocus(pieces())); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return K.handOver(dom.nextBtn); });
  }

  /* ======================================================================
   * Scene 3 -- name the arcs. A clean board, and the circle made again from
   * nothing: drawn, its two points put back where the learner cut it, and
   * the two pieces coloured -- in two NEW colours, so the names have to be
   * given for the pieces' sizes and not for the colours the lesson used.
   * Then two boxes, two names to drag, and the explanation either way.
   * ====================================================================== */
  function sceneNameArcs() {
    var span = arc.span;            /* the learner's cut, kept across the wipe */
    var outcome = { right: true };

    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle again, cut where it was, in new colours ------------ */
      .then(function () {
        arc.a = norm(TILT - span / 2); arc.span = span; arc.origin = 'a';
        redraw();
        dom.arcs.classList.add('is-quiz');
        dom.arcs.removeAttribute('hidden');
        return drawCircle();
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(cutCircle)
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the two boxes, one at a time ------------------------------------ */
      .then(function () {
        buildBoxes();
        dom.arcBoxes.removeAttribute('hidden');
        return Flow.anim(Beats.boxIn(boxFor('Major arc')));
      })
      .then(function () { return Flow.wait(320); })
      .then(function () { return Flow.anim(Beats.boxIn(boxFor('Minor arc'))); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the names, and the one instruction ------------------------------ */
      .then(function () {
        chips = K.chips(K.buildChips(dom.tray, coin('Minor arc', 'Major arc')));
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
                         { group: dom.arcBoxes, wrong: 'reveal', chances: 2 });
      })

      /* ---- answered, and explained -----------------------------------------
         Right or wrong, the lesson is the same one -- only the word in
         front of it changes. Each piece is lit as it is named, the other
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
            return Flow.anim(Beats.arcFocus([dom.arcMajor], [dom.arcMinor]));
          }),
          at(cue(text, 'major arc'), function () {
            return Flow.anim(Beats.boxPulse(boxFor('Major arc')));
          })
        ]);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        var text = LINES.minor;
        return Promise.all([
          K.speak(text),
          at(cue(text, 'Smaller'), function () {
            return Flow.anim(Beats.arcFocus([dom.arcMinor], [dom.arcMajor]));
          }),
          at(cue(text, 'minor arc'), function () {
            return Flow.anim(Beats.boxPulse(boxFor('Minor arc')));
          })
        ]);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return Flow.anim(Beats.arcUnfocus(pieces())); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return K.handOver(dom.nextBtn); });
  }

  /* ======================================================================
   * Scene 4 -- the semicircle. The boxes go and the pieces take back the
   * colours they were taught in; the smaller piece is turned to the top, a
   * dashed diameter shows where half would be, and the learner moves the
   * two points down to it. Then the question.
   * ====================================================================== */
  function sceneSemicircle() {
    var armed = null;               /* the points, being moved            */
    var picked = null;              /* the answer, once one is pressed    */
    var options = ['Circumference', 'Semicircle'];
    var answer = 1;

    return Promise.all([
        Flow.anim(Beats.clearFigure([dom.arcBoxes])),
        chips.length ? Flow.anim(Beats.trayOut(dom.tray, chips)) : Promise.resolve()
      ])
      .then(function () {
        dom.arcBoxes.setAttribute('hidden', '');
        K.clearInline([dom.arcBoxes]);
        clearBoxes();
        dom.tray.setAttribute('hidden', '');
        dom.tray.textContent = '';
        chips = K.chips([]);
        /* the activity's colours come off: a transition the stylesheet
           plays on the strokes, over the pause */
        dom.arcs.classList.remove('is-quiz');
        return Flow.wait(BEAT);
      })

      /* ---- the smaller piece turned to the top ----------------------------- */
      .then(function () { return turnTo(UP); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the diameter, dashed: where half would be ----------------------- */
      .then(function () { return Flow.anim(Beats.dashedIn(dom.arcDia, dom.arcDiaMask, 0.7)); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the ask ----------------------------------------------------------
         Armed before the line, as every tap in the lesson is; the hands
         that show the move wait for the words to finish. */
      .then(function () {
        var said = K.speak(LINES.equal);
        armed = K.quiet(slidePoints(said));
        return said;
      })
      .then(function () { return armed; })
      .then(function () { return Flow.anim(Beats.arcsEqual(pieces(), dots())); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the question -----------------------------------------------------
         The two answers arrive first, then the arrow picks out the upper
         half and the rest stands back, and only then is it asked -- so
         there is no doubt which arc "this arc" is. Listening starts the
         moment the answers are on the board, as every tap in the lesson
         does: a learner who presses one while the question is still being
         asked has answered, not missed. */
      .then(function () {
        choiceBtns = K.choices(K.buildChoices(dom.choices, options));
        return Flow.anim(Beats.trayIn(dom.choices, choiceBtns));
      })
      .then(function () {
        picked = K.quiet(K.askChoice(choiceBtns));
        dom.arcMarks.removeAttribute('hidden');
        aimCallout(callouts.arrow, 58, '');
        return Promise.all([
          showCallout(callouts.arrow),
          Flow.anim(Beats.arcFocus([dom.arcMinor], [dom.arcMajor, dom.arcDia]))
        ]);
      })
      .then(function () { return K.speak(LINES.which); })
      .then(function () { return picked; })

      /* ---- answered: one chance, and the definition either way ------------- */
      .then(function (i) {
        var right = i === answer;
        var marked = right
          ? Flow.anim(Beats.choiceRight(choiceBtns[answer]))
          : Flow.anim(Beats.choiceWrong(choiceBtns[i])).then(function () {
              return Flow.anim(Beats.choiceRight(choiceBtns[answer]));
            });
        var said = K.speak(right ? K.LINES.ackRight : K.LINES.ackWrong,
                           right ? 'happy' : 'confused');
        return Promise.all([marked, said]);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        var text = LINES.semi;
        return Promise.all([
          K.speak(text),
          at(cue(text, 'half'), function () { return Flow.anim(Beats.arcPulse([dom.arcMinor])); })
        ]);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        var text = LINES.semi2;
        return Promise.all([
          K.speak(text),
          at(cue(text, 'diameter'), function () { return Flow.anim(Beats.arcUnfocus([dom.arcDia])); }),
          at(cue(text, 'two'), function () {
            return Flow.anim(Beats.arcUnfocus([dom.arcMajor])).then(function () {
              return Flow.anim(Beats.arcPulse(pieces()));
            });
          })
        ]);
      })
      .then(function () { return Flow.wait(BEAT); })
      /* The answers have been read and the arrow has done its pointing:
         both go before Next, so the last thing on the board is the circle
         in its two halves. */
      .then(function () {
        return Promise.all([
          Flow.anim(Beats.trayOut(dom.choices, choiceBtns)),
          hideCallout(callouts.arrow)
        ]);
      })
      .then(function () {
        dom.choices.setAttribute('hidden', '');
        return Flow.wait(SHORT);
      })
      .then(function () { return K.handOver(dom.nextBtn); });
  }

  /* ======================================================================
   * Scene 5 -- the summary. No bird: a clean board with both bands closed,
   * so the circle sits at its very centre, and the idea drawn once more
   * from the start -- circle, centre, two points, the two pieces, and
   * their names.
   * ====================================================================== */
  function sceneSummary() {
    return K.wipeBoard()
      .then(function () { return Flow.anim(K.collapseHeader(true, 'is-bare')); })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        arc.a = SUMMARY.a; arc.span = SUMMARY.span; arc.origin = 'a';
        redraw();
        dom.arcs.removeAttribute('hidden');
        dom.arcMarks.removeAttribute('hidden');
        return drawCircle();
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        return Flow.anim(Beats.plantCentre(dom.arcCentre, dom.arcCentreDot, { call: false }));
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.pointA.dot)); })
      .then(function () { return Flow.wait(200); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.pointB.dot)); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the two pieces, each drawn and called what it is --------------- */
      .then(function () { return Flow.anim(Beats.growLine(dom.arcMinor, 0.8)); })
      .then(function () {
        aimLabel(labels.minor, bisMinor(), 'Arc');
        return Flow.anim(Beats.labelIn(labels.minor));
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return Flow.anim(Beats.growLine(dom.arcMajor, 1.1)); })
      .then(function () {
        aimLabel(labels.major, bisMajor(), 'Arc');
        return Promise.all([
          Flow.anim(Beats.labelIn(labels.major)),
          /* the coral rim under the two colours has nothing left to show */
          Flow.anim(M.to(dom.arcRim, { opacity: 0, duration: M.dur(0.3), ease: 'power2.out' }))
        ]);
      })
      .then(function () { return Flow.wait(BEAT + SHORT); })

      /* ---- and named ------------------------------------------------------- */
      .then(function () { return Flow.anim(Beats.labelsOut([labels.minor, labels.major])); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        aimCallout(callouts.minor, bisMinor(), 'Minor arc');
        return showCallout(callouts.minor);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        aimCallout(callouts.major, bisMajor(), 'Major arc');
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
  function parts() { return [dom.arcs]; }

  /* And what it keeps outside the figure: the line in the aside. */
  function wipe() {
    var out = [];
    if (!dom.bubbleAside.hasAttribute('hidden')) {
      out.push(Flow.anim(Beats.bubbleOut(dom.bubbleAside)));
    }
    return out;
  }

  /* Back to rest, with no animation. The inline writes inside the figure
     are pages.js's to clear -- resetFigure does it for every descendant of
     the picture right after this -- so this is about attributes, classes,
     the boxes, and the aside. */
  function reset() {
    arc.a = DEFAULT.a; arc.span = DEFAULT.span; arc.origin = 'a';

    dom.arcs.setAttribute('hidden', '');
    dom.arcs.classList.remove('is-picking', 'is-sliding', 'is-quiz');
    dom.arcBoxes.classList.remove('is-live');
    [dom.arcNudges, dom.arcBoxes, dom.arcMarks, dom.arcCentre].forEach(function (g) {
      g.setAttribute('hidden', '');
    });
    Object.keys(callouts).forEach(function (k) { callouts[k].g.setAttribute('hidden', ''); });
    dom.arcGhost.setAttribute('r', 2);
    dom.arcBand.setAttribute('tabindex', '-1');
    [dom.pointA, dom.pointB].forEach(function (p) {
      p.g.classList.remove('is-held', 'is-set');
      p.hit.setAttribute('tabindex', '-1');
    });
    clearBoxes();
    redraw();

    dom.aside.setAttribute('hidden', '');
    sayAside.clear();
    dom.bubbleAside.setAttribute('hidden', '');
    M.set(dom.bubbleAside, { clearProps: 'opacity,transform' });
  }

  /* The board as the scene at `local` expects to find it, written straight
     in. pages.js has already put the board up and the bird behind it. */
  function stage(local) {
    if (local <= 0) return;             /* opens on the wiped board, as left */

    dom.arcs.removeAttribute('hidden');
    M.set([dom.arcMinor, dom.arcMajor].concat(dots()), { opacity: 1 });
    redraw();

    if (local === 1) {
      /* the circle aside, the bird beside it, its line already said */
      dom.board.classList.add('is-headless');
      M.set(dom.arcs, { x: SHIFT });
      dom.aside.removeAttribute('hidden');
      mascot.placeIn(dom.slotAside);
      mascot.el.classList.remove('is-away');
      mascot.idle();
      return;
    }

    /* the circle in the middle and the bird on the header, as the naming
       leaves them: the activity opens by wiping this */
    mascot.placeIn(dom.slotHeader);
    mascot.el.classList.remove('is-away');
    mascot.idle();
    if (local === 2) return;

    /* turned and coloured for the activity, its two boxes filled */
    arc.a = norm(TILT - arc.span / 2);
    redraw();
    if (local === 3) {
      dom.arcs.classList.add('is-quiz');
      buildBoxes();
      dom.arcBoxes.removeAttribute('hidden');
      boxes.forEach(function (b) {
        b.filled = true;
        b.text.textContent = b.name;
        b.g.classList.add('is-shown', 'is-right');
        b.leader.classList.add('is-shown');
        M.set([b.text, b.badge], { opacity: 1 });
      });
      return;
    }

    /* the summary wipes first; leave the two halves standing for it to
       take away, with the bird behind the board as pages.js left it */
    mascot.el.classList.add('is-away');
    arc.a = 0; arc.span = 180;
    redraw();
    M.set(dom.arcDia, { opacity: 1 });
  }

  Pages.addSection({
    name: 'Arcs',
    scenes: [
      { name: 'Arcs',          play: sceneArcs       },
      { name: 'Minor & major', play: sceneMinorMajor },
      { name: 'Name the arcs', play: sceneNameArcs   },
      { name: 'Semicircle',    play: sceneSemicircle },
      { name: 'Arc summary',   play: sceneSummary    }
    ],
    build: build,
    parts: parts,
    wipe: wipe,
    reset: reset,
    stage: stage
  });

  /* What the section after this one is built from -- see segments.js: the
     geometry the circle is measured in, the marks that go on it, and the
     two-point interaction. None of it is this section's state; that stays
     behind state(). */
  global.Arcs = {
    LINES: LINES,
    state: function () { return arc; },
    MIN_SPAN: MIN_SPAN, MAX_SPAN: MAX_SPAN,
    norm: norm, norm180: norm180, clamp: clamp, coin: coin,
    P: P, arcD: arcD, place: place, reversed: reversed,
    hand: hand, handAt: handAt, rippleAt: rippleAt,
    pickPoints: pickPoints,
    cue: cue
  };
})(window);
