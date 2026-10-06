/* ==========================================================================
 * central.js -- Skill 2, section 3: the central angle
 * --------------------------------------------------------------------------
 * The third section of the skill, on the same board, with the same bird and
 * the same clock: registered with pages.js as a section (see addSection
 * there), built from the kit pages.js hands over, the beats in
 * animations.js, the two-point interaction arcs.js hands over on
 * window.Arcs, and the question-and-verdict ask circum.js hands over on
 * window.Circum. Nothing here waits on anything except through Flow, so
 * Skip, Replay and the level bar work on these scenes exactly as they do
 * on every other. To split the section out later, this file,
 * css/central.css and the two groups in index.html (#ca and #cm) are the
 * whole of it.
 *
 * Page 1 -- the central angle. The learner makes one:
 *
 *   The board opens blank. A circle is drawn -- the outline only -- and a
 *   small dot goes on its centre. The bird comes up onto the header and
 *   asks for two points on the circle: the rim breathes, the ghost rides
 *   it under the finger, and the second point is kept clearly apart from
 *   the first (never nearer than MIN_SPAN, never past MAX_SPAN, so the two
 *   always cut off a minor sector). Both down, the bird springs away and
 *   the picture is finished without it: a radius grown out of the centre
 *   to each point, in the order they were placed, then the angle between
 *   the two radii drawn at the centre and "θ" set inside it. The bird
 *   comes back up to say what it is -- the central angle for the minor
 *   sector -- and Next arrives.
 *
 * Page 2 -- measuring one. A fixed angle, read off a protractor:
 *
 *   The board opens blank, and the header closes: the protractor needs
 *   the room above the circle. The circle is outlined, a dot goes on its
 *   centre, and the protractor is laid on -- its centre hole on the dot,
 *   its 0-180 line level through it. Two red points go on the rim
 *   where the protractor's inner scale reads 0° and 80°, the piece of the
 *   rim between them is picked out in the skill's ink, a dashed line runs
 *   from each point to the centre -- "r" beside one of them: both are
 *   radii, and one label says so -- and the angle between them is drawn
 *   with its "θ". The figure slides to the left half and the bird comes up in
 *   the right pane to ask, from bubble-02, for the angle: three readings,
 *   one by one. A wrong one is refused with why; the right one shows the
 *   measure -- "θ" gives way to "θ = 0°", which counts up to 80° while
 *   the angle is swept again under it, and the arc swells once -- and
 *   Next arrives. Next pressed, the question goes and the protractor is
 *   lifted off, but the figure and the bird STAY for the page after.
 *
 * Page 3 -- the sector's share. The same board, one more question:
 *
 *   From where it stands the bird asks what fraction of the whole circle
 *   the sector is. Three fractions, each stood up as on paper with its
 *   degree signs; a wrong one is refused with why. Next pressed, the
 *   question goes but the figure and the bird stay once more. Jumped to
 *   from the level bar, the page stages page 2's board for itself (see
 *   stage).
 *
 * Page 4 -- the three named. The same board, and the bird explains:
 *
 *   "θ = 80°" gives way to "θ", and the bird says, a sentence at a time,
 *   what s, r and θ are: as each is named, the mark it names takes a
 *   colour of its own -- the arc teal with an "s" set beside it, the
 *   radii gold, the angle violet -- and the same words in the same colour
 *   land in a legend under the bird, where the answers usually stand.
 *   Then the bird goes with its box, the legend moves to the middle of
 *   the right half, left-aligned beside the figure, and Next arrives.
 *
 * Page 5 -- the angle explored. An activity:
 *
 *   The board opens blank. The circle is outlined, a dot goes on its
 *   centre, one radius is grown out to three o'clock, a second is grown
 *   out to 60° with a red handle on its end -- the one point on the page,
 *   so there is no mistaking which end moves -- and the
 *   sector between them is tinted in with the angle drawn at the centre
 *   and "θ = 60°" read beside the circle. The bird comes up onto the
 *   header to say what to do -- drag the point and watch θ -- and
 *   springs away, the header closing behind it, leaving the board to the
 *   learner. The handle follows the finger round the circle with no
 *   tween at all; the radius, the sector, the angle and the reading are
 *   rewritten from its angle every frame, and it stops at nothing and at
 *   the whole turn, where the sector is the whole disc and the reading
 *   says 360° -- the one thing the page is for. Next arrives two seconds
 *   after the handle has been carried and let go of, and the handle stays
 *   live until it is pressed.
 *
 * Page 6 -- the whole turn. One question:
 *
 *   The board opens blank. The circle is outlined, a dot goes on its
 *   centre and one radius is grown out to three o'clock, "r" set on it
 *   (user, 2026-10-06). A copy of it is
 *   turned once right round the centre, leaving the 360° angle drawn
 *   behind it; an arrowhead lands on the angle's end and "360°" beside
 *   it. The header closes as the figure slides to the left half, and the
 *   bird comes up in the right pane to ask, from bubble-02, for the arc
 *   length of a 360° central angle: three formulas, one by one. A wrong
 *   one is refused with why, a sentence at a time; the right one says so
 *   in green, the whole rim swelling once, and Next arrives. Next pressed,
 *   the bird goes with the box, the pills and the circle, and the header
 *   opens again over a clean board.
 *
 * Page 7 -- the arc-length formula. Explained, not asked:
 *
 *   The board opens blank. The circle is outlined in the middle of the
 *   board, a dot goes on its centre, and the figure is finished before a
 *   word is said: two radii grown out of the centre, the piece of rim
 *   between their ends, and the angle between them at the centre -- each
 *   already in the colour its letter will wear, and none of them labelled
 *   yet. The figure slides to the left half as the header closes, and in
 *   the right half "Arc length = Angle⁄360° × circumference" is written
 *   in, a term at a time, the fraction stood up as on paper. A copy of
 *   the line drops out of it to stand under it. Then three steps, one at
 *   a time and each a beat apart, every step the same shape: in the copy
 *   the word fades, the line closes up round the gap and the letter lands
 *   in its place in its mark's colour; then the mark on the figure glows
 *   -- a pulse of solid light in its own colour, twice -- while its label
 *   pops in beside it and the letter in the formula swells once with it,
 *   so the two are seen to be one thing. "Arc length" becomes s, with the
 *   arc; "Angle" becomes θ, with the angle; "circumference" becomes 2πr,
 *   with the radii and their "r". With "s = θ⁄360° × 2πr" written under
 *   the words, Next arrives. Next pressed, the formula and the figure go
 *   together and the header opens again over a clean board.
 *
 * Every word is read by key (T('key'), js/i18n.js) from locales/
 * locales.json, and each spoken line is voiced by the same key once a
 * recording is there.
 *
 * Load order: js/pages.js -> js/arcs.js -> ... -> js/circum.js -> js/central.js
 * ========================================================================== */
(function (global) {
  'use strict';

  var M = global.Motion;
  var Flow = global.Flow;
  var Beats = global.Beats;
  var Pages = global.Pages;
  var A = global.Arcs;
  var C = global.Circum;
  if (!Pages || !Pages.addSection || !A || !A.pickPoints || !C || !C.ask) {
    console.error('central.js: load js/pages.js, js/arcs.js and js/circum.js before js/central.js.');
    return;
  }
  var K = Pages.kit;

  /* ---- the script -------------------------------------------------------
     Read by key at the moment a scene starts (the locale is in by then --
     see start() in script.js), each line carrying its key so it can be
     voiced. A sentence long enough to wrap keeps its last two words
     together, so its last row is never one stray word. Each wrong reading
     is refused with what makes it wrong -- where on the protractor to
     look -- rather than with the answer. */
  function T(key, repl) { return global.T ? global.T(key, repl) : key; }
  function said(key, text) { return { text: text, vo: key }; }
  var NB = ' ';
  function tie(s) { return s.replace(/ (\S+)$/, NB + '$1'); }

  function measureLines() {
    var right = T('p23Opt80'), near = T('p23Opt85'), square = T('p23Opt90');
    var wrong = {};
    wrong[near]   = [said('fbNotQuite', T('fbNotQuite')), said('p23Wrong85', tie(T('p23Wrong85')))];
    wrong[square] = [said('fbNotQuite', T('fbNotQuite')), said('p23Wrong90', tie(T('p23Wrong90')))];
    return {
      ask:     said('p23Ask', tie(T('p23Ask'))),
      options: [right, near, square],
      answer:  right,
      wrong:   wrong,
      right:   [said('fbCorrect', T('fbCorrect')), said('p23Right', tie(T('p23Right')))]
    };
  }

  /* Page 3's. The fractions are spelled with U+2044 in the locale and
     stood up by mathtext.js, degree signs and all, on the pills and in
     the right answer's sentence alike. */
  function fractionLines() {
    var whole = T('p24Opt360'), quarter = T('p24Opt90'), half = T('p24Opt180');
    var wrong = {};
    wrong[quarter] = [said('fbNotQuite', T('fbNotQuite')), said('p24Wrong90',  tie(T('p24Wrong90')))];
    wrong[half]    = [said('fbNotQuite', T('fbNotQuite')), said('p24Wrong180', tie(T('p24Wrong180')))];
    return {
      ask:     said('p24Ask', tie(T('p24Ask'))),
      options: [whole, quarter, half],
      answer:  whole,
      wrong:   wrong,
      right:   [said('fbCorrect', T('fbCorrect')), said('p24Right', tie(T('p24Right')))]
    };
  }

  /* Page 4's: what the three letters stand for, said one at a time, and
     the legend line that lands with each. */
  function nameLines() {
    return [
      { say: said('p25S',     tie(T('p25S'))),     which: 's'  },
      { say: said('p25R',     tie(T('p25R'))),     which: 'r'  },
      { say: said('p25Theta', tie(T('p25Theta'))), which: 'th' }
    ];
  }

  /* Page 6's. Each wrong formula is refused with what it really is. */
  function fullTurnLines() {
    var whole = T('p27Opt2PiR'), area = T('p27OptPiR2'), half = T('p27OptPiR');
    var wrong = {};
    wrong[area] = [said('fbNotQuite', T('fbNotQuite')), said('p27WrongPiR2', tie(T('p27WrongPiR2')))];
    wrong[half] = [said('fbNotQuite', T('fbNotQuite')), said('p27WrongPiR',  tie(T('p27WrongPiR')))];
    return {
      ask:     said('p27Ask', tie(T('p27Ask'))),
      options: [whole, area, half],
      answer:  whole,
      wrong:   wrong,
      right:   [said('fbCorrect', T('fbCorrect')), said('p27Right', tie(T('p27Right')))]
    };
  }

  var BEAT = K.BEAT, SHORT = K.SHORT;
  var CX = K.CX, CY = K.CY, RR = K.RR;
  var round2 = K.round2;
  var P = A.P;             /* a point round the lesson's circle: P(deg, r) */

  var SHIFT = -250;        /* the figure's slide to the left half -- the same
                              stand-aside every section uses, picture units */
  var LABEL_DY = 9;        /* a label's baseline, below the point it is centred on */

  /* ---- page 1: the learner's angle ---------------------------------------
     How far apart the two points must be, in degrees: far enough that the
     angle between the radii is plainly an angle, and never past a point
     where what they cut off stops being the smaller piece -- it is the
     minor sector's angle the bird names. A skip puts the hand's own two
     spots down (see fillIn in arcs.js), and they fall inside this stretch. */
  var MIN_SPAN = 50, MAX_SPAN = 150;
  var RADIUS_TIME = 0.6;   /* s: a radius, from the centre to its point */

  /* ---- both pages' angle ---------------------------------------------------
     The mark at the centre, as the semicircle and quadrant pages draw
     theirs, and where "θ" sits on its middle line. */
  var ANGLE_R = 42;
  var THETA_R = 70;
  var ANGLE_TIME = 0.6;    /* s: the angle, from one radius round to the other */

  /* The cut, as arcs.js hands it over: `a` is one point, and the minor
     sector lies under the arc that runs from it anticlockwise for `span`
     degrees to the other; `origin` is the point placed LAST. At rest it is
     what a skip would put down. */
  var DEFAULT = { a: 60, span: 125, origin: 'b' };
  var cut = { a: DEFAULT.a, span: DEFAULT.span, origin: DEFAULT.origin };

  /* ---- page 2: the angle on the protractor --------------------------------
     The lesson's own circle, where it always stands. The protractor rises
     half as tall again above the centre, past the top of the picture's
     own box -- the box is wider than the stage is, so with the header
     closed it is fitted by its width and has a band of room above it,
     which is what the protractor's crown stands in. The two points sit
     where the protractor's inner scale reads 0 and 80. */
  var CM = { x: CX, y: CY, r: RR };
  var CM_A = 0, CM_B = 80;
  var R_ON = CM_B;         /* which dashed line carries the "r": the upper
                              one, clear of "θ = 80°", which reaches out along
                              the angle's middle line (user, 2026-10-06: one
                              label, not one per line) */
  var R_AT = 133;          /* how far out along it the "r" is set: short of
                              the point */
  var R_OFF = 16;          /* and how far off the line, into the sector */
  var ARC_W = 3.4;         /* the arc's weight, as the radii's (central.css) */
  var THETA_HALF = 7.5;    /* half the width of "θ" at the labels' size: where
                              "θ = 80°" starts, so its θ stands where "θ" stood.
                              Measured off the glyph itself once it can be
                              (see alignMeasure); this is the fallback. */
  var DOT_POP = 0.5;       /* s: each red point, popping in */
  var ARC_TIME = 0.8;      /* s: the arc, from one point to the other */
  var DASH_TIME = 0.6;     /* s: a dashed line, from its point to the centre */
  var MEASURE = 80;        /* what the angle reads, in degrees */
  var COUNT_TIME = 1.0;    /* s: 0° to 80°, with the angle swept under it */
  var DASH_W = 2.2;        /* the dashed radii's weight (central.css) */
  var S_OUT = 24;          /* how far outside the rim "s" sits, on the arc's middle line */
  var LEGEND_TIME = 0.6;   /* s: the legend's move to the middle of the pane */

  /* The protractor: the image's own geometry (assets/image/protractor.png,
     2000 x 1104, its body transparent), so it can be laid with its centre
     hole on the circle's centre and its 0-180 line level through it. `r`
     is the outer arc's radius in the image's pixels; PROT_R is what that
     is drawn at, in picture units. */
  var PROT = { w: 2000, h: 1104, cx: 999, cy: 999, r: 998 };
  var PROT_R = 235;
  var PROT_TIME = 0.7;     /* s: the protractor laid on */
  var PROT_OUT = 0.4;      /* s: and lifted off again */

  /* ---- page 5: the angle explored ----------------------------------------
     One radius fixed at three o'clock, the other carried round by the
     handle on its end from CE_START, and the angle between them read as
     it changes -- from nothing to the whole turn, where the handle stops:
     the circle holds 360°, and the stop is what says so. */
  var CE_START = 60;         /* where the movable radius stands when the page opens */
  var CE_SKIP_TO = 135;      /* and where a skip carries it */
  var CE_STEP = 5;           /* degrees an arrow key turns it; shift for three times that */
  var CE_MOVED = 3;          /* degrees of turn that count as having moved it */
  var CE_SETTLE = 2000;      /* ms after it is let go of before Next arrives (user, 2026-10-06) */
  var CE_NUDGE_AFTER = 2500; /* ms untouched before the hand shows the way */
  var CE_NUDGE_SWEEP = 70;   /* degrees the hand carries the handle in its nudge */

  /* ---- page 6: the whole turn ---------------------------------------------
     The arm turns once round from three o'clock and the angle is drawn
     behind it, stopping CZ_END short of the whole turn so the arrowhead
     -- its tip at CZ_TIP -- has room on the end without covering the
     radius it comes home to. "360°" sits outside the angle, up and to the
     right of the centre. */
  var CZ_TURN = 1.6;       /* s: the arm, once round */
  var CZ_END = 340;        /* degrees: where the angle's line stops */
  var CZ_TIP = 354;        /* and where the arrowhead's tip is */
  var CZ_HEAD_L = 12;      /* the arrowhead's length, picture units */
  var CZ_HEAD_W = 7;       /* and half its width */
  var CZ_LABEL_AT = 42;    /* degrees: the direction "360°" is set in */
  var CZ_LABEL_R = 82;     /* and how far out from the centre */
  var CZ_R_AT = 104;       /* how far out along the radius its "r" is set */
  var CZ_R_OFF = 15;       /* and how far above the line */
  var CZ_RIM_W = 2.6;      /* the rim's own weight (.figure__rim), which
                              its swell settles back to */

  /* ---- page 7: the arc-length formula -------------------------------------
     The figure's two points, the same 80° page 2 read, turned a little
     off the horizontal so neither radius lies on the slide's path; the
     weights each mark settles back to after its swell; and the pauses
     that keep each step its own, so the eye can follow a letter to its
     mark and back. */
  var CV_A = 15, CV_B = 95;    /* the points, degrees anticlockwise from three o'clock */
  var CV_R_AT = 100;           /* how far out along the lower radius "r" is set */
  var CV_R_OFF = 16;           /* and how far off it, outside the sector */
  var CV_ARC_W = 5;            /* the arc's weight (.cv-arc) */
  var CV_LINE_W = 3.4;         /* the radii's and the angle's (.ca-radius, .ca-angle) */
  var FF_TERM_GAP = 0.4;       /* s between the terms of the first line arriving */
  var FF_DROP = 0.8;           /* s: the copy dropping down to the second line */
  var FF_STEP = 1000;          /* ms a finished step is left to be read */
  var FF_HOLD = 450;           /* ms between the letter landing and its mark lighting */
  var GLOW_PEAK = 0.85;        /* the glow at the top of a breath */
  var GLOW_DIP = 0.3;          /* and between the two breaths */
  var GLOW_LABEL_AT = 250;     /* ms into the glow that the label pops in */

  /* ---- the elements ------------------------------------------------------ */
  var dom = null;          /* pages.js's, with this section's own on top */
  var mascot = null;
  var hand = null;         /* the pointing hand, for page 1's pick */
  var handE = null;        /* and page 5's, which carries the handle */
  var ce = { theta: 0 };   /* page 5: where the movable radius stands, degrees */

  function $(id) { return document.getElementById(id); }

  /* A formula line's cells by the term they stand for: s, th, c. */
  function keyed(line) {
    var out = {};
    Array.prototype.forEach.call(line.querySelectorAll('[data-k]'), function (el) {
      out[el.getAttribute('data-k')] = el;
    });
    return out;
  }

  /* A point on the circle: the dot, and the finger-sized hit area over it. */
  function point(g) {
    return { g: g, dot: g.querySelector('.arc-dot'), hit: g.querySelector('.arc-dot__hit') };
  }

  function build() {
    dom = Object.create(K.dom());
    mascot = K.mascot();

    dom.ca        = $('ca');
    dom.caRim     = $('caRim');
    dom.caTip     = $('caTip');
    dom.caBand    = $('caBand');
    dom.caRadA    = $('caRadA');
    dom.caRadB    = $('caRadB');
    dom.caAngle   = $('caAngle');
    dom.caCentre  = $('caCentre');
    dom.caTheta   = $('caTheta');
    dom.caGhost   = $('caGhost');
    dom.caPointA  = point($('caPointA'));
    dom.caPointB  = point($('caPointB'));
    dom.caNudges  = $('caNudges');
    hand = A.hand(dom.caNudges);

    dom.cm        = $('cm');
    dom.cmProt    = $('cmProt');
    dom.cmRim     = $('cmRim');
    dom.cmTip     = $('cmTip');
    dom.cmArc     = $('cmArc');
    dom.cmRadA    = $('cmRadA');
    dom.cmRadAPen = $('cmRadAPen');
    dom.cmRadB    = $('cmRadB');
    dom.cmRadBPen = $('cmRadBPen');
    dom.cmAngle   = $('cmAngle');
    dom.cmCentre  = $('cmCentre');
    dom.cmDotA    = $('cmDotA');
    dom.cmDotB    = $('cmDotB');
    dom.cmR       = $('cmR');
    dom.cmTheta   = $('cmTheta');
    dom.cmMeasure = $('cmMeasure');
    dom.cmS       = $('cmS');
    dom.clPane    = $('clPane');
    dom.clLegend  = $('clLegend');
    dom.clItems   = { s: $('clS'), r: $('clR'), th: $('clTh') };

    dom.ce        = $('ce');
    dom.ceSector  = $('ceSector');
    dom.ceRim     = $('ceRim');
    dom.ceTip     = $('ceTip');
    dom.ceFixed   = $('ceFixed');
    dom.ceRadius  = $('ceRadius');
    dom.ceAngle   = $('ceAngle');
    dom.ceCentre  = $('ceCentre');
    dom.ceHandle  = point($('ceHandle'));
    dom.ceReadout = $('ceReadout');
    dom.ceNudges  = $('ceNudges');
    handE = A.hand(dom.ceNudges);

    dom.cz        = $('cz');
    dom.czRim     = $('czRim');
    dom.czTip     = $('czTip');
    dom.czRadius  = $('czRadius');
    dom.czArm     = $('czArm');
    dom.czAngle   = $('czAngle');
    dom.czHead    = $('czHead');
    dom.czCentre  = $('czCentre');
    dom.czDeg     = $('czDeg');
    dom.czR       = $('czR');

    dom.cv        = $('cv');
    dom.cvRim     = $('cvRim');
    dom.cvTip     = $('cvTip');
    dom.cvArc     = $('cvArc');
    dom.cvRadA    = $('cvRadA');
    dom.cvRadB    = $('cvRadB');
    dom.cvAngle   = $('cvAngle');
    dom.cvCentre  = $('cvCentre');
    dom.cvS       = $('cvS');
    dom.cvTheta   = $('cvTheta');
    dom.cvR       = $('cvR');
    dom.cvGlow    = { s: $('cvArcGlow'), th: $('cvAngleGlow'), r: [$('cvRadAGlow'), $('cvRadBGlow')] };
    dom.ffPane    = $('ffPane');
    dom.ffLine1   = $('ffLine1');
    dom.ffLine2   = $('ffLine2');
    /* the first line's terms, and the second line's cells that are turned over */
    dom.ffTerms1  = Array.prototype.slice.call(dom.ffLine1.children);
    dom.ffKeys2   = keyed(dom.ffLine2);

    layoutMeasure();
    layoutFullTurn();
    layoutFormula();
    reset();
  }

  /* ---- drawing from the angles ------------------------------------------ */

  /* A radius: from the centre `c` out to a point `p`. */
  function radiusD(c, p) { return 'M' + c.x + ' ' + c.y + ' L' + p.x + ' ' + p.y; }

  /* An arc `r` out, from one point round to another anticlockwise on
     screen -- the way our angles grow -- and never more than a half-turn,
     which is all a minor sector's angle can be. */
  function arcD(from, to, r) {
    return 'M' + from.x + ' ' + from.y + ' A' + r + ' ' + r + ' 0 0 0 ' + to.x + ' ' + to.y;
  }

  /* Page 1's marks, rewritten from the learner's cut: a radius to each
     point, the angle between them at the centre, and "θ" on the angle's
     middle line. */
  function redrawAngle() {
    var a = cut.a, b = cut.a + cut.span;
    var c = { x: CX, y: CY };
    dom.caRadA.setAttribute('d', radiusD(c, P(a, RR)));
    dom.caRadB.setAttribute('d', radiusD(c, P(b, RR)));
    dom.caAngle.setAttribute('d', arcD(P(a, ANGLE_R), P(b, ANGLE_R), ANGLE_R));
    var t = P(a + cut.span / 2, THETA_R);
    dom.caTheta.setAttribute('x', t.x);
    dom.caTheta.setAttribute('y', round2(t.y + LABEL_DY));
  }

  /* The two radii in the order they are drawn: to the point placed FIRST
     first, so the picture is made in the order the learner made it. */
  function radii() {
    return cut.origin === 'b' ? [dom.caRadA, dom.caRadB] : [dom.caRadB, dom.caRadA];
  }

  /* What arcs.js's two-point interaction works on here: this section's
     circle and marks, and its own state for the cut to be written into --
     the shape arcs.js hands it for its own circle (see pickCtx there) --
     with this page's own stretch between the points. */
  function pickCtx() {
    return {
      group: dom.ca, band: dom.caBand, ghost: dom.caGhost, nudges: dom.caNudges,
      hand: hand, points: [dom.caPointA, dom.caPointB],
      minSpan: MIN_SPAN, maxSpan: MAX_SPAN,
      done: function (c) {
        cut.a = c.a; cut.span = c.span; cut.origin = c.origin;
        redrawAngle();
      }
    };
  }

  /* A point round page 2's circle, `deg` degrees anticlockwise from three
     o'clock and `r` out. */
  function pt(deg, r) {
    var t = deg * Math.PI / 180;
    return { x: round2(CM.x + Math.cos(t) * r), y: round2(CM.y - Math.sin(t) * r) };
  }

  /* Page 2's picture, written once: everything on it is fixed, so it is
     laid out from the numbers above when the board is built. */
  function layoutMeasure() {
    var c = CM;
    var top = { x: c.x, y: round2(c.y - c.r) }, foot = { x: c.x, y: round2(c.y + c.r) };
    /* The rim starts at twelve and runs clockwise, as every rim in the
       game does, so the pen draws it the way a hand would. */
    dom.cmRim.setAttribute('d',
      'M' + top.x + ' ' + top.y + ' A' + c.r + ' ' + c.r + ' 0 0 1 ' + foot.x + ' ' + foot.y +
      ' A' + c.r + ' ' + c.r + ' 0 0 1 ' + top.x + ' ' + top.y);
    dom.cmTip.setAttribute('cx', top.x);
    dom.cmTip.setAttribute('cy', top.y);
    dom.cmCentre.setAttribute('cx', c.x);
    dom.cmCentre.setAttribute('cy', c.y);

    var pA = pt(CM_A, c.r), pB = pt(CM_B, c.r);
    dom.cmDotA.setAttribute('cx', pA.x); dom.cmDotA.setAttribute('cy', pA.y);
    dom.cmDotB.setAttribute('cx', pB.x); dom.cmDotB.setAttribute('cy', pB.y);
    dom.cmArc.setAttribute('d', arcD(pA, pB, c.r));

    /* Each dashed line runs FROM its point to the centre, and the solid
       pen in its mask runs the same way, so that is the way it is drawn. */
    var toCentre = function (p) { return 'M' + p.x + ' ' + p.y + ' L' + c.x + ' ' + c.y; };
    dom.cmRadA.setAttribute('d', toCentre(pA));
    dom.cmRadAPen.setAttribute('d', toCentre(pA));
    dom.cmRadB.setAttribute('d', toCentre(pB));
    dom.cmRadBPen.setAttribute('d', toCentre(pB));

    dom.cmAngle.setAttribute('d', arcD(pt(CM_A, ANGLE_R), pt(CM_B, ANGLE_R), ANGLE_R));

    /* "r" beside the one dashed line that carries it: R_AT out along it,
       R_OFF off it on the side the sector is -- whichever normal leans
       toward the angle's middle line -- with the letter's own box centred
       on that spot. */
    var mid = (CM_A + CM_B) / 2;
    var bx = Math.cos(mid * Math.PI / 180), by = -Math.sin(mid * Math.PI / 180);
    var t = R_ON * Math.PI / 180;
    var m = pt(R_ON, R_AT);
    var nx = Math.sin(t), ny = Math.cos(t);
    if (nx * bx + ny * by < 0) { nx = -nx; ny = -ny; }
    dom.cmR.setAttribute('x', round2(m.x + nx * R_OFF));
    dom.cmR.setAttribute('y', round2(m.y + ny * R_OFF + 6));

    /* "θ" on the angle's middle line, and the measure that takes its
       place: begun THETA_HALF to the left of where "θ" is centred, so the
       θ in "θ = 80°" stands exactly where "θ" stood and only " = 80°" is
       new. */
    var th = pt(mid, THETA_R);
    dom.cmTheta.setAttribute('x', th.x);
    dom.cmTheta.setAttribute('y', round2(th.y + LABEL_DY));
    dom.cmMeasure.setAttribute('x', round2(th.x - THETA_HALF));
    dom.cmMeasure.setAttribute('y', round2(th.y + LABEL_DY));

    /* "s" just outside the rim, on the arc's middle line. */
    var sp = pt(mid, c.r + S_OUT);
    dom.cmS.setAttribute('x', sp.x);
    dom.cmS.setAttribute('y', round2(sp.y + LABEL_DY));

    /* The protractor, scaled so its outer arc is PROT_R out, and set so
       its centre hole falls on the circle's centre. */
    var s = PROT_R / PROT.r;
    dom.cmProt.setAttribute('width', round2(PROT.w * s));
    dom.cmProt.setAttribute('height', round2(PROT.h * s));
    dom.cmProt.setAttribute('x', round2(c.x - PROT.cx * s));
    dom.cmProt.setAttribute('y', round2(c.y - PROT.cy * s));
  }

  /* The measure's start set off the glyph itself: "θ" is centred on its
     spot, so "θ = 80°" begins half the glyph's advance to the left of it.
     Only measurable once the group is shown -- a hidden text has no
     length -- so it is called as the page opens; the constant stands
     until then. */
  function alignMeasure() {
    var w = 0;
    try { w = dom.cmTheta.getComputedTextLength(); } catch (e) {}
    if (!(w > 0)) return;
    var x = parseFloat(dom.cmTheta.getAttribute('x')) || 0;
    dom.cmMeasure.setAttribute('x', round2(x - w / 2));
  }

  /* ======================================================================
   * This section's own beats
   * ====================================================================== */

  /* The protractor laid on the circle: it comes up from a little under its
     size, about the circle's centre, as a thing set down on the board. */
  function protractorIn(img) {
    M.set(img, { opacity: 0, scale: 0.92, svgOrigin: CM.x + ' ' + CM.y });
    var tl = M.timeline({ willChange: img, willChangeValue: 'transform, opacity' });
    tl.to(img, { opacity: 1, scale: 1, duration: M.dur(PROT_TIME), ease: M.OUT });
    return tl;
  }

  /* And lifted off again, once the angle has been read: it goes as it
     came, a little smaller and gone, about the circle's centre. */
  function protractorOut(img) {
    var tl = M.timeline({ willChange: img, willChangeValue: 'transform, opacity' });
    tl.to(img, { opacity: 0, scale: 0.92, svgOrigin: CM.x + ' ' + CM.y,
                 duration: M.dur(PROT_OUT), ease: M.IN });
    return tl;
  }

  /* The right reading pressed: "θ" and the angle step back together, and
     in their place the measure comes up reading 0° and counts to 80° while
     the angle is swept again under it, at the same pace, from the 0° line
     round to the 80° one -- the number and the turn seen to be one thing.
     Then the arc swells once. The count is written through the
     locale each frame, so the line reads as the locale spells it; however
     the beat ends, it is left reading the measure. */
  function showMeasure() {
    var deg = { n: 0 };
    function write() {
      dom.cmMeasure.textContent = T('lblThetaIs', { deg: Math.round(deg.n) });
    }
    var out = M.timeline({ willChange: [dom.cmTheta, dom.cmAngle], willChangeValue: 'opacity' });
    out.to([dom.cmTheta, dom.cmAngle], { opacity: 0, duration: M.dur(0.2), ease: M.IN });
    return Flow.anim(out)
      .then(function () {
        write();
        M.set(dom.cmMeasure, { opacity: 0 });
        var tl = M.timeline({
          willChange: dom.cmMeasure, willChangeValue: 'opacity',
          revert: function () { deg.n = MEASURE; write(); }
        });
        tl.to(dom.cmMeasure, { opacity: 1, duration: M.dur(0.3), ease: M.OUT }, 0)
          .to(deg, { n: MEASURE, duration: M.dur(COUNT_TIME), ease: 'power2.inOut',
                     onUpdate: write }, 0);
        return Promise.all([
          Flow.anim(tl),
          Flow.anim(Beats.growLine(dom.cmAngle, COUNT_TIME, 'power2.inOut'))
        ]);
      })
      .then(function () { return Flow.anim(Beats.linePulse([dom.cmArc], ARC_W)); });
  }

  /* ======================================================================
   * Page 1 -- the central angle. A blank board, the circle and its centre,
   * two points from the learner, a radius to each, the angle between them
   * and its "θ", and the bird up to name it.
   * ====================================================================== */
  function sceneCentral() {
    var picked = null;
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle: the pen once round, an outline only, and the
         small dot at its centre -- the point the radii will come from ---- */
      .then(function () {
        dom.ca.removeAttribute('hidden');
        return Flow.anim(Beats.drawRim(dom.caRim, dom.caTip));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.caCentre)); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- two points -----------------------------------------------------
         The rim breathes while a point is wanted, and the hand shows the
         way if nothing is placed. Listening starts as the bird lands,
         before its line is finished: a learner who does not wait to be
         told is not made to. */
      .then(function () {
        picked = K.quiet(A.pickPoints(pickCtx()));
        return K.arriveSaying(said('p22Pick', T('p22Pick')));
      })
      .then(function () {
        mascot.settle();
        return picked;
      })

      /* ---- the bird steps away, and the picture is finished without it --
         The header stays open: the bird is back within a few seconds, and
         closing the band and opening it again would move the circle twice
         while the learner is meant to be watching it. */
      .then(function () {
        return Promise.all([
          K.mascotJumpOut(true),
          Flow.anim(Beats.lineOut(dom.promptLine))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        return Flow.wait(SHORT);
      })

      /* ---- a radius to each point, in the order they were put down ------- */
      .then(function () {
        return Flow.anim(Beats.growLine(radii()[0], RADIUS_TIME, 'sine.inOut'));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Flow.anim(Beats.growLine(radii()[1], RADIUS_TIME, 'sine.inOut'));
      })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the angle between them, and its "θ" --------------------------- */
      .then(function () {
        return Flow.anim(Beats.growLine(dom.caAngle, ANGLE_TIME, 'power2.inOut'));
      })
      .then(function () { return Flow.anim(Beats.labelIn(dom.caTheta)); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- named from the header ------------------------------------------ */
      .then(function () { return K.arriveSaying(said('p22Central', T('p22Central'))); })
      .then(function () {
        mascot.settle();
        return Flow.wait(BEAT);
      })

      /* ---- Next -- and only its PRESS sends the bird away, with its line
         and the picture, all at once. The header is left open: the next
         page opens over a clean board, as every page of this skill does. */
      .then(function () { return K.handOver(dom.nextBtn); })
      .then(function () {
        if (global.I18n) global.I18n.stop();
        return Promise.all([
          K.mascotJumpOut(true),
          Flow.anim(Beats.lineOut(dom.promptLine)),
          Flow.anim(Beats.clearFigure([dom.ca]))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        dom.ca.setAttribute('hidden', '');
        K.clearInline([dom.ca].concat(
          Array.prototype.slice.call(dom.ca.querySelectorAll('*'))));
      });
  }

  /* ======================================================================
   * Page 2 -- measuring the angle. A blank board with its header closed,
   * the smaller circle and its centre, the protractor laid on, the two
   * points at 0° and 80°, the arc between them, the dashed radii and the
   * "r", the angle with its "θ"; then the figure stands aside and
   * the bird asks for the reading from the pane. Three readings, one by
   * one. The right one counts the measure up as the angle is swept again.
   * ====================================================================== */
  function sceneMeasure() {
    var lines = measureLines();
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the header closes: the protractor needs the room above the
         circle, and no bird stands on the header this page -------------- */
      .then(function () { return Flow.anim(K.collapseHeader(true)); })

      /* ---- the circle: the pen once round, an outline only, and the small
         dot at its centre ---------------------------------------------- */
      .then(function () {
        dom.cm.removeAttribute('hidden');
        alignMeasure();
        return Flow.anim(Beats.drawRim(dom.cmRim, dom.cmTip));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.cmCentre)); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the protractor laid on ----------------------------------------- */
      .then(function () { return Flow.anim(protractorIn(dom.cmProt)); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- two points on the rim: at 0°, then at 80° --------------------- */
      .then(function () { return Flow.anim(Beats.plotDot(dom.cmDotA, DOT_POP)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.cmDotB, DOT_POP)); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the piece of the rim between them, picked out ------------------ */
      .then(function () {
        return Flow.anim(Beats.growLine(dom.cmArc, ARC_TIME, 'power2.inOut'));
      })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- a dashed line from each point to the centre, and the "r" ------ */
      .then(function () {
        return Flow.anim(Beats.dashedIn(dom.cmRadA, dom.cmRadAPen, DASH_TIME));
      })
      .then(function () { return Flow.wait(120); })
      .then(function () {
        return Flow.anim(Beats.dashedIn(dom.cmRadB, dom.cmRadBPen, DASH_TIME));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.cmR)); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the angle between them, and its "θ" --------------------------- */
      .then(function () {
        return Flow.anim(Beats.growLine(dom.cmAngle, ANGLE_TIME, 'power2.inOut'));
      })
      .then(function () { return Flow.anim(Beats.labelIn(dom.cmTheta)); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the figure stands aside, and the bird asks from the pane ------- */
      .then(function () { return Flow.anim(Beats.slideArcs(dom.cm, SHIFT)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return C.ask({
          ask: lines.ask, options: lines.options, answer: lines.answer,
          wrong: lines.wrong, right: lines.right,
          reveal: showMeasure
        });
      })

      /* ---- Next -- and only its PRESS takes the question away: the box
         shuts and the pills go, the protractor is lifted off, and the
         figure and the bird STAY. The page after asks about this sector
         from the same spot. --------------------------------------------- */
      .then(function () { return K.handOver(dom.nextBtn); })
      .then(function () {
        return Promise.all([
          C.clearAsk(),
          Flow.anim(protractorOut(dom.cmProt))
        ]);
      });
  }

  /* ======================================================================
   * Page 3 -- the sector's share of the circle. The board as page 2 left
   * it -- the figure stood aside with its angle read, the bird in the
   * pane -- and one more question from the same spot. Three fractions,
   * each stood up as on paper; a wrong one is refused with why, and the
   * right one closes the board down as every ask does.
   * ====================================================================== */
  function sceneFraction() {
    var lines = fractionLines();
    return Flow.wait(BEAT)
      .then(function () {
        return C.ask({
          ask: lines.ask, options: lines.options, answer: lines.answer,
          wrong: lines.wrong, right: lines.right
        });
      })
      /* Next pressed: the question goes, the figure and the bird stay --
         the page after names the parts of this very figure. */
      .then(function () { return K.handOver(dom.nextBtn); })
      .then(function () { return C.clearAsk(); });
  }

  /* ======================================================================
   * Page 4 -- the three named. The board as page 3 left it, the measure
   * giving way to "θ", and the bird explaining what s, r and θ are: each
   * mark takes its own colour as it is named, and the legend line in that
   * colour lands under the bird. Then the bird goes, the legend takes the
   * middle of the pane, and Next arrives.
   * ====================================================================== */

  /* "θ = 80°" steps back and "θ" returns in its place. */
  function measureToTheta() {
    var tl = M.timeline({ willChange: [dom.cmMeasure, dom.cmTheta], willChangeValue: 'opacity' });
    tl.to(dom.cmMeasure, { opacity: 0, duration: M.dur(0.3), ease: M.IN }, 0)
      .to(dom.cmTheta, { opacity: 1, duration: M.dur(0.4), ease: M.OUT }, M.gap(0.15));
    return tl;
  }

  /* One of the three, named: its mark takes its colour (a class -- the
     stylesheet transitions it) and swells once, "s" lands beside the arc
     when it is the arc's turn, and the legend line comes up under the
     bird. Fired as the sentence starts, so the mark lands with the words;
     nothing here is awaited by the chain, so it all goes through quiet(). */
  function nameBeat(which) {
    dom.cm.classList.add('is-' + which);
    K.quiet(Flow.anim(legendIn(dom.clItems[which])));
    if (which === 's') {
      K.quiet(Flow.anim(Beats.labelIn(dom.cmS)));
      K.quiet(Flow.anim(Beats.linePulse([dom.cmArc], ARC_W)));
    } else if (which === 'r') {
      K.quiet(Flow.anim(Beats.linePulse([dom.cmRadA, dom.cmRadB], DASH_W)));
    } else {
      K.quiet(Flow.anim(Beats.linePulse([dom.cmAngle], ARC_W)));
    }
  }

  /* A legend line arriving: the control's own entrance (M.enter), written
     out here because a line's resting state is UNSEEN -- enter hands its
     opacity back when it is done, and the line would vanish again. */
  function legendIn(item) {
    M.set(item, { opacity: 0, y: 8 });
    var tl = M.timeline({ willChange: item, willChangeValue: 'transform, opacity' });
    tl.to(item, { opacity: 1, y: 0, duration: M.dur(0.3), ease: M.OUT });
    return tl;
  }

  /* The legend carried from under the bird to the middle of the pane, and
     grown a size on the way: the class changes the layout and the type
     size, Flip plays the difference -- the move as a translate, the
     growth as a scale that lands on the crisp larger type. */
  function legendCentre() {
    return M.relayout(dom.clLegend, function () {
      dom.clPane.classList.add('is-centred');
    }, { vars: { duration: M.dur(LEGEND_TIME), ease: M.INOUT } });
  }
  function legendOut() {
    var items = [dom.clItems.s, dom.clItems.r, dom.clItems.th];
    var tl = M.timeline({ willChange: items, willChangeValue: 'transform, opacity' });
    tl.to(items, { opacity: 0, y: 8, duration: M.dur(0.26), ease: M.IN, stagger: M.gap(0.05) });
    return tl;
  }
  /* The legend put away: emptied of every inline write, and shut. */
  function restoreLegend() {
    dom.clPane.classList.remove('is-centred');
    dom.clPane.setAttribute('hidden', '');
    M.set([dom.clLegend, dom.clItems.s, dom.clItems.r, dom.clItems.th],
          { clearProps: 'opacity,transform' });
  }

  function sceneNames() {
    var lines = nameLines();
    return Flow.wait(BEAT)
      .then(function () { return Flow.anim(measureToTheta()); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the three, named one at a time from the box, each lighting
         its mark and landing its line in the legend ------------------- */
      .then(function () {
        dom.clPane.removeAttribute('hidden');
        return C.explain(lines.map(function (l) { return l.say; }), function (i) {
          nameBeat(lines[i].which);
        });
      })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the bird goes with its box, and the legend takes the middle
         of the pane, beside the figure -------------------------------- */
      .then(function () {
        return Promise.all([C.clearAsk(), K.mascotJumpOut()]);
      })
      .then(function () {
        C.putAway();
        return Flow.anim(legendCentre());
      })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- Next -- and only its PRESS clears the board: the legend and
         the figure go together, and the header opens again over a clean
         board, where the page after begins. ---------------------------- */
      .then(function () { return K.handOver(dom.nextBtn); })
      .then(function () {
        return Promise.all([
          Flow.anim(legendOut()),
          Flow.anim(Beats.clearFigure([dom.cm]))
        ]);
      })
      .then(function () {
        restoreLegend();
        dom.cm.setAttribute('hidden', '');
        dom.cm.classList.remove('is-s', 'is-r', 'is-th');
        K.clearInline([dom.cm].concat(
          Array.prototype.slice.call(dom.cm.querySelectorAll('*'))));
        return Flow.anim(K.collapseHeader(false));
      });
  }

  /* ======================================================================
   * Page 5 -- the angle explored
   * ----------------------------------------------------------------------
   * One radius fixed at three o'clock, the other carried round the circle
   * by the handle on its end, and the angle between them drawn and read
   * as it changes. The handle follows the finger with no tween at all --
   * what moves is the angle, taken from where the finger is round the
   * centre and carried on from where it was, so a finger that strays off
   * the rim still turns the radius smoothly -- and it stops at nothing
   * and at the whole turn: at 360° the sector is the whole disc and the
   * reading says so, which is the one thing the page is for.
   * ====================================================================== */

  /* A point on the screen, in the picture's own units, through whatever
     transform the figure and the group are wearing. */
  function toPicture(group, x, y) {
    var pt = dom.figure.createSVGPoint();
    pt.x = x; pt.y = y;
    var m = group.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()) : { x: CX, y: CY };
  }

  /* The sector from the fixed radius anticlockwise round to `deg`; at the
     whole turn, the whole disc -- an arc whose ends meet draws nothing, so
     that is two half-turns. */
  function wedgeTo(deg) {
    var c = CX + ' ' + CY;
    var p0 = P(0, RR);
    if (deg >= 359.99) {
      var h = P(180, RR);
      return 'M' + c + ' L' + p0.x + ' ' + p0.y +
             ' A' + RR + ' ' + RR + ' 0 0 0 ' + h.x + ' ' + h.y +
             ' A' + RR + ' ' + RR + ' 0 0 0 ' + p0.x + ' ' + p0.y + ' Z';
    }
    var p = P(deg, RR);
    return 'M' + c + ' L' + p0.x + ' ' + p0.y +
           ' A' + RR + ' ' + RR + ' 0 ' + (deg > 180 ? 1 : 0) + ' 0 ' + p.x + ' ' + p.y + ' Z';
  }
  /* And the angle mark, `r` out, over the same turn. */
  function angleTo(deg, r) {
    var p0 = P(0, r);
    if (deg <= 0.01) return 'M' + p0.x + ' ' + p0.y;
    if (deg >= 359.99) {
      var h = P(180, r);
      return 'M' + p0.x + ' ' + p0.y +
             ' A' + r + ' ' + r + ' 0 0 0 ' + h.x + ' ' + h.y +
             ' A' + r + ' ' + r + ' 0 0 0 ' + p0.x + ' ' + p0.y;
    }
    var p = P(deg, r);
    return 'M' + p0.x + ' ' + p0.y +
           ' A' + r + ' ' + r + ' 0 ' + (deg > 180 ? 1 : 0) + ' 0 ' + p.x + ' ' + p.y;
  }

  /* Every mark that depends on the handle, rewritten from its angle: the
     radius, the sector, the angle, the handle itself and the reading. */
  function redrawExplore() {
    var t = ce.theta;
    dom.ceRadius.setAttribute('d', radiusD({ x: CX, y: CY }, P(t, RR)));
    dom.ceSector.setAttribute('d', wedgeTo(t));
    dom.ceAngle.setAttribute('d', angleTo(t, ANGLE_R));
    A.place(dom.ceHandle, t);
    var deg = Math.round(t);
    dom.ceReadout.textContent = T('lblThetaIs', { deg: deg });
    dom.ceHandle.hit.setAttribute('aria-valuenow', deg);
  }

  /* The interaction. The handle is live until the scene takes it back
     (off, once Next is pressed): a learner with the board to themselves
     may go on turning it. Resolves -- through the lesson's gate, so a
     retired scene cancels it -- once the handle has been carried and let
     go of and CE_SETTLE has passed, with `off` for the scene to call when
     it is done; a skip carries the handle to CE_SKIP_TO for the learner.
     If nothing happens for a while the hand shows the gesture: a finger
     on the handle, carried a little way round. */
  function explore() {
    var live = true;
    var held = null;            /* { id, last }: the finger, and where round the centre it last was */
    var moved = false;          /* carried CE_MOVED or more from where it started */
    var waiting = false;        /* let go of: the pause before Next is running, or has run */
    var atEnd = ce.theta <= 0 || ce.theta >= 360;
    var nudge = null;
    var idle = 0;

    dom.ce.classList.add('is-live');
    dom.ceHandle.hit.setAttribute('tabindex', '0');

    function armHand() {
      var mine = ++idle;
      Flow.wait(CE_NUDGE_AFTER).then(function () {
        if (!live || mine !== idle || held || moved || nudge) return;
        dom.ceNudges.removeAttribute('hidden');
        var from = ce.theta;
        nudge = Beats.nudgeSlide(handE, function (t, gap) {
          A.handAt(handE, from + CE_NUDGE_SWEEP * t, gap);
        });
      }, function () { /* the scene was retired: nothing to show */ });
    }
    function restHand() {
      idle++;
      if (!nudge) return;
      Beats.nudgeStop(nudge, handE);
      nudge = null;
    }

    /* Where the finger is round the centre, in degrees anticlockwise from
       three o'clock. */
    function angleOf(ev) {
      var q = toPicture(dom.ce, ev.clientX, ev.clientY);
      return Math.atan2(CY - q.y, q.x - CX) * 180 / Math.PI;
    }
    function setTheta(v) {
      v = Math.max(0, Math.min(360, v));
      ce.theta = v;
      redrawExplore();
      if (!moved && Math.abs(v - CE_START) >= CE_MOVED) { moved = true; restHand(); }
      /* caught at the ends -- nothing, and the whole turn -- once each arrival */
      var end = v <= 0 || v >= 360;
      if (end && !atEnd) Beats.snapDot(dom.ceHandle.dot);
      atEnd = end;
    }
    /* Carried and let go of: the pause, then Next -- once. */
    function letGo() {
      if (!live || !moved || waiting) return;
      waiting = true;
      Flow.wait(CE_SETTLE).then(function () {
        if (!live) return;
        dom.gate.dispatchEvent(new MouseEvent('click'));
      }, function () { /* retired */ });
    }

    function onDown(ev) {
      if (!live || held) return;
      ev.preventDefault();
      held = { id: ev.pointerId, last: angleOf(ev) };
      dom.ceHandle.g.classList.add('is-held');
      restHand();                 /* taken hold of: the hand has done its job */
      if (ev.currentTarget.setPointerCapture) {
        try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) { /* fine */ }
      }
    }
    function onMove(ev) {
      if (!live || !held || ev.pointerId !== held.id) return;
      var a = angleOf(ev);
      setTheta(ce.theta + A.norm180(a - held.last));
      held.last = a;
    }
    function onUp(ev) {
      if (!held || ev.pointerId !== held.id) return;
      held = null;
      dom.ceHandle.g.classList.remove('is-held');
      letGo();
    }
    function onKey(ev) {
      if (!live) return;
      var k = ev.key, dir = 0;
      if (k === 'ArrowLeft' || k === 'ArrowUp') dir = 1;
      else if (k === 'ArrowRight' || k === 'ArrowDown') dir = -1;
      if (!dir) return;
      ev.preventDefault();
      restHand();
      setTheta(ce.theta + dir * (ev.shiftKey ? CE_STEP * 3 : CE_STEP));
      letGo();
    }
    function off() {
      live = false;
      restHand();
      dom.ceHandle.hit.removeEventListener('pointerdown', onDown);
      dom.ceHandle.hit.removeEventListener('keydown', onKey);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      dom.ceHandle.hit.setAttribute('tabindex', '-1');
      dom.ceHandle.g.classList.remove('is-held');
      dom.ce.classList.remove('is-live');
      held = null;
    }
    /* What a skip puts down for the learner: the handle carried to a spot
       well round the circle. */
    function fillIn() {
      if (!moved) setTheta(CE_SKIP_TO);
    }

    dom.ceHandle.hit.addEventListener('pointerdown', onDown);
    dom.ceHandle.hit.addEventListener('keydown', onKey);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
    armHand();

    return Flow.once(dom.gate, { auto: true }).then(
      function () { fillIn(); return { off: off }; },
      function (err) { off(); throw err; });
  }

  /* The scene: a blank board, the circle and its centre, the fixed radius
     and the one that moves with its handle, the sector between them and
     the reading; the
     bird up to say what to do and gone again; and the board the learner's
     until Next.
       The activity is armed before the bird speaks, as every activity in
     the lesson is: a learner who does not wait to be told is not made to,
     and one who moves the handle while the bird is still talking has
     Next waiting for them the moment it has gone. */
  function sceneExplore() {
    var act = null;
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle: the pen once round, an outline only, and the small
         dot at its centre ---------------------------------------------- */
      .then(function () {
        ce.theta = CE_START;
        redrawExplore();
        dom.ce.removeAttribute('hidden');
        return Flow.anim(Beats.drawRim(dom.ceRim, dom.ceTip));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.ceCentre)); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the fixed radius, out to three o'clock. No point on its end:
         the one red point on the page is the one that moves (user,
         2026-10-06). ------------------------------------------------------ */
      .then(function () {
        return Flow.anim(Beats.growLine(dom.ceFixed, RADIUS_TIME, 'sine.inOut'));
      })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the one that moves, out to where it starts, its handle on the
         end; then the sector tinted in from the fixed radius round to it,
         the angle drawn with it, and the reading set beside the circle -- */
      .then(function () {
        return Flow.anim(Beats.growLine(dom.ceRadius, RADIUS_TIME, 'sine.inOut'));
      })
      .then(function () { return Flow.anim(Beats.plotDot(dom.ceHandle.dot, DOT_POP)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Promise.all([
          Flow.anim(Beats.secFill(dom.ceSector,
                                  function (t) { return wedgeTo(CE_START * t); }, ANGLE_TIME)),
          Flow.anim(Beats.growLine(dom.ceAngle, ANGLE_TIME, 'power2.inOut'))
        ]);
      })
      .then(function () { return Flow.anim(Beats.labelIn(dom.ceReadout)); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the activity, armed as the bird lands; the instruction, left
         to be read; and the bird gone, the header closing behind it, so
         the board is the learner's -------------------------------------- */
      .then(function () {
        act = K.quiet(explore());
        return K.arriveSaying(said('p26Guide', T('p26Guide')));
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(K.HOLD_ASK);
      })
      .then(function () {
        return Promise.all([
          K.mascotJumpOut(),
          Flow.anim(Beats.lineOut(dom.promptLine))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        return act;
      })

      /* ---- Next, once the handle has been carried and let go of -- and
         the handle live until Next is PRESSED. Then the board is cleared
         and the header opened again over it, as every page ends. ------- */
      .then(function (a) {
        return K.handOver(dom.nextBtn).then(
          function () { a.off(); },
          function (err) { a.off(); throw err; });
      })
      .then(function () { return Flow.anim(Beats.clearFigure([dom.ce])); })
      .then(function () {
        dom.ce.setAttribute('hidden', '');
        K.clearInline([dom.ce].concat(
          Array.prototype.slice.call(dom.ce.querySelectorAll('*'))));
        return Flow.anim(K.collapseHeader(false));
      });
  }

  /* ======================================================================
   * Page 6 -- the whole turn. A blank board, the circle and its centre, a
   * radius, a copy of it turned once round leaving the 360° angle behind,
   * and the bird in the pane to ask for that angle's arc length.
   * ====================================================================== */

  /* The arrowhead on the end of the angle, and "360°", written once: both
     are fixed, so they are laid out when the board is built. The head
     points the way the angle grows -- anticlockwise on screen, along the
     tangent at its tip. */
  function layoutFullTurn() {
    var t = CZ_TIP * Math.PI / 180;
    var tip = P(CZ_TIP, ANGLE_R);
    var dx = -Math.sin(t), dy = -Math.cos(t);        /* the way it travels */
    var bx = tip.x - dx * CZ_HEAD_L, by = tip.y - dy * CZ_HEAD_L;
    var nx = -dy * CZ_HEAD_W, ny = dx * CZ_HEAD_W;   /* across it */
    dom.czHead.setAttribute('d',
      'M' + tip.x + ' ' + tip.y +
      ' L' + round2(bx + nx) + ' ' + round2(by + ny) +
      ' L' + round2(bx - nx) + ' ' + round2(by - ny) + ' Z');
    var r = P(0, CZ_R_AT);
    dom.czR.setAttribute('x', r.x);
    dom.czR.setAttribute('y', round2(r.y - CZ_R_OFF));
    var l = P(CZ_LABEL_AT, CZ_LABEL_R);
    dom.czDeg.setAttribute('x', l.x);
    dom.czDeg.setAttribute('y', round2(l.y + LABEL_DY));
    dom.czAngle.setAttribute('d', angleTo(CZ_END, ANGLE_R));
  }

  /* The arm -- a copy of the radius, lying on it -- turned once round the
     centre, anticlockwise, and the angle drawn behind it from the same
     turn, so the line is seen to be made by the turning. The arm is turned
     by a rotate() written straight to its transform attribute, as
     radiusSweep turns its own (animations.js): one angle about one fixed
     point, on a group that is about to slide. Home again, it lies on the
     radius and is put away; however the timeline ends, the angle is left
     whole and the arm is gone. */
  function fullTurn() {
    var turn = { a: 0 };
    function place() {
      dom.czArm.setAttribute('transform',
        'rotate(' + (-turn.a).toFixed(2) + ' ' + CX + ' ' + CY + ')');
      dom.czAngle.setAttribute('d', angleTo(Math.min(turn.a, CZ_END), ANGLE_R));
    }
    var tl = M.timeline({
      revert: function () {
        dom.czArm.removeAttribute('transform');
        M.set(dom.czArm, { opacity: 0 });
        dom.czAngle.setAttribute('d', angleTo(CZ_END, ANGLE_R));
      }
    });
    place();
    tl.set([dom.czArm, dom.czAngle], { opacity: 1 }, 0)
      .to(turn, { a: 360, duration: M.dur(CZ_TURN), ease: 'sine.inOut', onUpdate: place }, 0)
      .set(dom.czArm, { opacity: 0 }, M.gap(CZ_TURN));
    return tl;
  }

  /* The right formula pressed: the whole rim swells once -- the arc of a
     360° angle is all of it. */
  function showWhole() {
    return Flow.anim(Beats.linePulse([dom.czRim], CZ_RIM_W));
  }

  function sceneFullTurn() {
    var lines = fullTurnLines();
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle: the pen once round, an outline only, and the small
         dot at its centre ---------------------------------------------- */
      .then(function () {
        dom.cz.removeAttribute('hidden');
        return Flow.anim(Beats.drawRim(dom.czRim, dom.czTip));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.czCentre)); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- a radius, out to three o'clock, and its "r" ------------------ */
      .then(function () {
        return Flow.anim(Beats.growLine(dom.czRadius, RADIUS_TIME, 'sine.inOut'));
      })
      .then(function () { return Flow.anim(Beats.labelIn(dom.czR)); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- turned once right round: the 360° angle, its arrowhead and
         its label ------------------------------------------------------- */
      .then(function () { return Flow.anim(fullTurn()); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.czHead)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.czDeg)); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the figure stands aside -- the header closing, as no bird
         stands on it this page -- and the bird asks from the pane ------ */
      .then(function () {
        return Promise.all([
          Flow.anim(K.collapseHeader(true)),
          Flow.anim(Beats.slideArcs(dom.cz, SHIFT))
        ]);
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return C.ask({
          ask: lines.ask, options: lines.options, answer: lines.answer,
          wrong: lines.wrong, right: lines.right,
          reveal: showWhole
        });
      })

      /* ---- Next -- and only its PRESS sends the bird away, with the box,
         the pills and the circle; the header opens again over a clean
         board (closeOut, circum.js). ----------------------------------- */
      .then(function () { return C.closeOut(dom.cz); });
  }

  /* ======================================================================
   * Page 7 -- the arc-length formula. A blank board, the figure made and
   * stood aside, the formula written in words beside it and copied under
   * itself, and each word in turn turned into its letter in the copy as
   * its mark lights on the figure and takes its label.
   * ====================================================================== */

  /* The figure's marks, written once: everything on it is fixed. Each
     glow is given the very path it lies under. */
  function layoutFormula() {
    var c = { x: CX, y: CY };
    var pA = P(CV_A, RR), pB = P(CV_B, RR);
    var arc = arcD(pA, pB, RR);
    var ra = radiusD(c, pA), rb = radiusD(c, pB);
    var ang = arcD(P(CV_A, ANGLE_R), P(CV_B, ANGLE_R), ANGLE_R);
    dom.cvArc.setAttribute('d', arc);     dom.cvGlow.s.setAttribute('d', arc);
    dom.cvRadA.setAttribute('d', ra);     dom.cvGlow.r[0].setAttribute('d', ra);
    dom.cvRadB.setAttribute('d', rb);     dom.cvGlow.r[1].setAttribute('d', rb);
    dom.cvAngle.setAttribute('d', ang);   dom.cvGlow.th.setAttribute('d', ang);

    var mid = (CV_A + CV_B) / 2;
    var th = P(mid, THETA_R);
    dom.cvTheta.setAttribute('x', th.x);
    dom.cvTheta.setAttribute('y', round2(th.y + LABEL_DY));
    var sp = P(mid, RR + S_OUT);
    dom.cvS.setAttribute('x', sp.x);
    dom.cvS.setAttribute('y', round2(sp.y + LABEL_DY));
    /* "r" beside the lower radius, on the side away from the sector, so
       it is clear of "θ" -- the normal that leans AWAY from the angle's
       middle line. */
    var t = CV_A * Math.PI / 180, m = P(CV_A, CV_R_AT);
    var bx = Math.cos(mid * Math.PI / 180), by = -Math.sin(mid * Math.PI / 180);
    var nx = Math.sin(t), ny = Math.cos(t);
    if (nx * bx + ny * by > 0) { nx = -nx; ny = -ny; }
    dom.cvR.setAttribute('x', round2(m.x + nx * CV_R_OFF));
    dom.cvR.setAttribute('y', round2(m.y + ny * CV_R_OFF + 6));
  }

  /* The three marks, by the key of the cell that names each: what glows,
     what swells and to what weight, and the label that lands. */
  function marks() {
    return {
      s:  { glow: [dom.cvGlow.s],  lines: [dom.cvArc],               w: CV_ARC_W,  label: dom.cvS },
      th: { glow: [dom.cvGlow.th], lines: [dom.cvAngle],             w: CV_LINE_W, label: dom.cvTheta },
      c:  { glow: dom.cvGlow.r,    lines: [dom.cvRadA, dom.cvRadB],  w: CV_LINE_W, label: dom.cvR }
    };
  }

  /* The first line written in, a term at a time, each rising into place. */
  function line1In() {
    var terms = dom.ffTerms1;
    M.set(terms, { opacity: 0 });
    var tl = M.timeline({ willChange: terms, willChangeValue: 'transform, opacity' });
    tl.fromTo(terms, { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: M.dur(0.45), ease: M.OUT, stagger: M.gap(FF_TERM_GAP) });
    return tl;
  }

  /* The copy: the second line -- the first, word for word -- comes out of
     the first and drops into its own place under it. Its offset is read
     off the layout as it is, in the pane's own pixels. */
  function lineCopy() {
    var line = dom.ffLine2;
    var dy = line.offsetTop - dom.ffLine1.offsetTop;
    M.set(line, { opacity: 0.5, y: -dy });
    var tl = M.timeline({ willChange: line, willChangeValue: 'transform, opacity' });
    tl.to(line, { opacity: 1, y: 0, duration: M.dur(FF_DROP), ease: M.INOUT });
    return tl;
  }

  /* A word in the second line turned into its letter: the word fades and
     shrinks away; the cell is turned over -- the word out of the layout,
     the letter in -- and Flip plays the line closing up round the gap,
     the fraction's bar eased to its new width; then the letter pops in,
     already in its colour. Every term after the one turned is moved, so
     the whole line is handed to Flip. */
  function termSwap(cell) {
    var word = cell.querySelector('.ff-word'), sym = cell.querySelector('.ff-sym');
    var line = dom.ffLine2;
    var bar = line.querySelector('.ff-bar');
    var out = M.timeline({ willChange: word, willChangeValue: 'transform, opacity' });
    out.to(word, { opacity: 0, scale: 0.8, duration: M.dur(0.3), ease: M.IN });
    return Flow.anim(out).then(function () {
      var moved = Array.prototype.slice.call(line.querySelectorAll('.ff-t, .ff-n, .ff-d'));
      var w0 = bar.getBoundingClientRect().width;
      M.set(sym, { opacity: 0 });
      var flip = M.relayout(moved, function () {
        cell.classList.add('is-sym');
      }, { nested: true, scale: false, vars: { duration: M.dur(0.55), ease: M.INOUT } });
      var w1 = bar.getBoundingClientRect().width;
      var barTl = null;
      if (w0 > 0 && w1 > 0 && Math.abs(w0 - w1) > 0.5) {
        barTl = M.timeline({
          willChange: bar, willChangeValue: 'transform',
          revert: function () { M.set(bar, { clearProps: 'transform' }); }
        });
        barTl.fromTo(bar, { scaleX: w0 / w1, transformOrigin: '50% 50%' },
                     { scaleX: 1, duration: M.dur(0.55), ease: M.INOUT });
      }
      return Promise.all([Flow.anim(flip), Flow.anim(barTl)]);
    }).then(function () {
      var pop = M.timeline({ willChange: sym, willChangeValue: 'transform, opacity' });
      pop.fromTo(sym, { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' },
        { opacity: 1, scale: 1, duration: M.dur(0.4), ease: 'back.out(1.7)' });
      return Flow.anim(pop);
    });
  }

  /* A mark lit: its glow breathes twice -- up to its peak, down to a dip,
     up again and out -- while the mark's own line swells once with the
     first breath (linePulse, alongside). However the timeline ends, the
     glow is left out. */
  function markGlow(glow) {
    M.set(glow, { opacity: 0 });
    var tl = M.timeline({
      willChange: glow, willChangeValue: 'opacity',
      revert: function () { M.set(glow, { opacity: 0 }); }
    });
    tl.to(glow, { opacity: GLOW_PEAK, duration: M.dur(0.3),  ease: 'power2.out' }, 0)
      .to(glow, { opacity: GLOW_DIP,  duration: M.dur(0.4),  ease: 'sine.inOut' }, M.gap(0.3))
      .to(glow, { opacity: GLOW_PEAK, duration: M.dur(0.4),  ease: 'sine.inOut' }, M.gap(0.7))
      .to(glow, { opacity: 0,         duration: M.dur(0.55), ease: 'power2.in' },  M.gap(1.1));
    return tl;
  }

  /* The letter in the formula swelling once, as its mark lights: the
     same breath, so the two read as one thing. */
  function symSwell(el) {
    var tl = M.timeline({
      willChange: el, willChangeValue: 'transform',
      revert: function () { M.set(el, { clearProps: 'transform,transformOrigin' }); }
    });
    tl.fromTo(el, { scale: 1, transformOrigin: '50% 50%' },
              { scale: 1.22, duration: M.dur(0.26), ease: 'power2.out' })
      .to(el, { scale: 1, duration: M.dur(0.5), ease: M.POP });
    return tl;
  }

  /* One step, the same shape three times: the word turned into its
     letter in the second line; a breath; then the mark lit on the figure
     -- glow, swell, label -- with the letter swelling in time with it;
     and the finished step left to be read. */
  function formulaStep(key, mark) {
    var cell = dom.ffKeys2[key];
    return termSwap(cell)
      .then(function () { return Flow.wait(FF_HOLD); })
      .then(function () {
        var sym = cell.querySelector('.ff-sym');
        return Promise.all([
          Flow.anim(markGlow(mark.glow)),
          Flow.anim(Beats.linePulse(mark.lines, mark.w)),
          Flow.wait(GLOW_LABEL_AT).then(function () {
            return Promise.all([
              Flow.anim(Beats.labelIn(mark.label)),
              Flow.anim(symSwell(sym))
            ]);
          })
        ]);
      })
      .then(function () { return Flow.wait(FF_STEP); });
  }

  /* Both lines away, once Next is pressed. */
  function formulaOut() {
    var lines = [dom.ffLine1, dom.ffLine2];
    var tl = M.timeline({ willChange: lines, willChangeValue: 'transform, opacity' });
    tl.to(lines, { opacity: 0, y: 8, duration: M.dur(0.3), ease: M.IN, stagger: M.gap(0.08) });
    return tl;
  }
  /* The formula put away: every cell back to its word, every inline write
     cleared, the pane shut. */
  function restoreFormula() {
    dom.ffPane.setAttribute('hidden', '');
    Array.prototype.forEach.call(dom.ffPane.querySelectorAll('.is-sym'), function (el) {
      el.classList.remove('is-sym');
    });
    M.set([dom.ffLine1, dom.ffLine2].concat(
      Array.prototype.slice.call(dom.ffPane.querySelectorAll('*'))),
      { clearProps: 'opacity,transform,transformOrigin' });
  }

  function sceneFormula() {
    var mk = marks();
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle, in the middle of the board: the pen once round,
         an outline only, and the small dot at its centre ----------------- */
      .then(function () {
        dom.cv.removeAttribute('hidden');
        return Flow.anim(Beats.drawRim(dom.cvRim, dom.cvTip));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.cvCentre)); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the figure finished, nothing on it named: a radius to each
         point, the piece of rim between them, the angle between them --- */
      .then(function () {
        return Flow.anim(Beats.growLine(dom.cvRadA, RADIUS_TIME, 'sine.inOut'));
      })
      .then(function () { return Flow.wait(120); })
      .then(function () {
        return Flow.anim(Beats.growLine(dom.cvRadB, RADIUS_TIME, 'sine.inOut'));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Flow.anim(Beats.growLine(dom.cvArc, ARC_TIME, 'power2.inOut'));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Flow.anim(Beats.growLine(dom.cvAngle, ANGLE_TIME, 'power2.inOut'));
      })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- it stands aside, the header closing: no bird this page ------ */
      .then(function () {
        return Promise.all([
          Flow.anim(K.collapseHeader(true)),
          Flow.anim(Beats.slideArcs(dom.cv, SHIFT))
        ]);
      })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the formula in words, a term at a time; then its copy ------- */
      .then(function () {
        dom.ffPane.removeAttribute('hidden');
        return Flow.anim(line1In());
      })
      .then(function () { return Flow.wait(FF_STEP); })
      .then(function () { return Flow.anim(lineCopy()); })
      .then(function () { return Flow.wait(FF_STEP); })

      /* ---- the three steps: Arc length -> s with the arc, Angle -> θ with
         the angle, circumference -> 2πr with the radii and their "r" ---- */
      .then(function () { return formulaStep('s',  mk.s);  })
      .then(function () { return formulaStep('th', mk.th); })
      .then(function () { return formulaStep('c',  mk.c);  })

      /* ---- Next -- and only its PRESS clears the board: the formula and
         the figure go together, and the header opens again over a clean
         board. --------------------------------------------------------- */
      .then(function () { return K.handOver(dom.nextBtn); })
      .then(function () {
        return Promise.all([
          Flow.anim(formulaOut()),
          Flow.anim(Beats.clearFigure([dom.cv]))
        ]);
      })
      .then(function () {
        restoreFormula();
        dom.cv.setAttribute('hidden', '');
        K.clearInline([dom.cv].concat(
          Array.prototype.slice.call(dom.cv.querySelectorAll('*'))));
        return Flow.anim(K.collapseHeader(false));
      });
  }

  /* ======================================================================
   * The hooks the board's housekeeping calls -- see addSection in pages.js
   * ====================================================================== */

  /* What this section has on the figure: one group per page, each faded
     as a whole. */
  function parts() { return [dom.ca, dom.cm, dom.ce, dom.cz, dom.cv]; }

  /* What this section keeps outside the figure: the legend and the
     formula, if a wipe catches either up. The pane the questions are
     asked from is circum.js's, and its own hooks put it away. */
  function wipe() {
    var out = [];
    if (!dom.clPane.hasAttribute('hidden')) out.push(Flow.anim(legendOut()).then(restoreLegend));
    if (!dom.ffPane.hasAttribute('hidden')) out.push(Flow.anim(formulaOut()).then(restoreFormula));
    return out;
  }

  /* Back to rest, with no animation. The inline writes inside the figure
     are pages.js's to clear -- resetFigure does it for every descendant of
     the picture right after this -- so this is about attributes, classes
     and the words. */
  function reset() {
    dom.ca.setAttribute('hidden', '');
    dom.ca.classList.remove('is-picking');
    dom.caNudges.setAttribute('hidden', '');
    cut.a = DEFAULT.a; cut.span = DEFAULT.span; cut.origin = DEFAULT.origin;
    redrawAngle();
    dom.cm.setAttribute('hidden', '');
    dom.cm.classList.remove('is-s', 'is-r', 'is-th');
    dom.cmMeasure.textContent = '';
    restoreLegend();
    dom.ce.setAttribute('hidden', '');
    dom.ce.classList.remove('is-live');
    dom.ceHandle.g.classList.remove('is-held');
    dom.ceHandle.hit.setAttribute('tabindex', '-1');
    dom.ceNudges.setAttribute('hidden', '');
    ce.theta = CE_START;
    redrawExplore();
    dom.cz.setAttribute('hidden', '');
    dom.czArm.removeAttribute('transform');
    dom.czAngle.setAttribute('d', angleTo(CZ_END, ANGLE_R));
    dom.cv.setAttribute('hidden', '');
    restoreFormula();
    if (global.I18n) global.I18n.stop();
  }

  /* The board as the i-th scene expects to FIND it, written straight in.
     Five of the seven open on a wiped board -- each one's first beat is
     the wipe -- so there is nothing to stage. Pages 3 and 4 open on page
     2's board less the protractor: the figure stood aside with every mark
     on it and its angle read, the header closed, the pane open and the
     bird standing in it. */
  function stage(i) {
    if (i !== 2 && i !== 3) return;
    dom.board.classList.add('is-headless');
    dom.cm.removeAttribute('hidden');
    alignMeasure();
    M.set([dom.cmRim, dom.cmCentre, dom.cmDotA, dom.cmDotB, dom.cmArc,
           dom.cmRadA, dom.cmRadB, dom.cmAngle, dom.cmR, dom.cmMeasure], { opacity: 1 });
    dom.cmMeasure.textContent = T('lblThetaIs', { deg: MEASURE });
    M.set(dom.cm, { x: SHIFT });
    C.seatBird();
  }

  Pages.addSection({
    name: 'Central angle',
    scenes: [
      { name: 'Central angle',     play: sceneCentral  },
      { name: 'Measure the angle', play: sceneMeasure  },
      { name: 'Sector fraction',    play: sceneFraction },
      { name: 'Arc, radius, angle', play: sceneNames    },
      { name: 'Explore the angle',  play: sceneExplore  },
      { name: 'Whole-turn arc',     play: sceneFullTurn },
      { name: 'Arc length formula', play: sceneFormula  }
    ],
    build: build,
    parts: parts,
    wipe: wipe,
    reset: reset,
    stage: stage
  });
})(window);
