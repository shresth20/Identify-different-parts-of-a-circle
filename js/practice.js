/* ==========================================================================
 * practice.js -- Skill 2, section 4: the arc length, worked and asked
 * --------------------------------------------------------------------------
 * The fourth section of the skill, on the same board, with the same bird
 * and the same clock: registered with pages.js as a section (see addSection
 * there), built from the kit pages.js hands over, the beats in
 * animations.js, the geometry arcs.js shares on window.Arcs, and the
 * question-and-verdict ask circum.js hands over on window.Circum. Nothing
 * here waits on anything except through Flow, so Skip, Replay and the
 * level bar work on these scenes exactly as they do on every other. To
 * split the section out later, this file, css/practice.css, the five
 * groups in the figure (#pa, #pb, #pc, #pw and #ck), #psPane, #pnPane and
 * #pnNote in index.html are the whole of it.
 *
 * Page 1 -- the arc length, worked. An activity in four steps:
 *
 *   The board opens blank. The circle is outlined, a dot goes on its
 *   centre, two radii are grown out of it a quarter turn apart, the
 *   quarter between them is tinted in with its piece of the rim lit, the
 *   right angle is drawn at the centre with "90°" inside it, and "7 cm"
 *   lands beside a radius. The figure slides to the left half -- the
 *   header stays open: the bird is coming up onto it -- and the bird
 *   arrives to say what to do. Each step is one line of working in the
 *   right half, left-aligned under the one before, with an empty box in
 *   it, and three values under the line to choose from, one by one:
 *
 *     1. "s = [ ]⁄360° × 2πr"               -- the central angle
 *     2. "s = 90°⁄360° × 2 × 22⁄7 × [ ]"    -- the radius
 *     3. a copy of line 2 that solves itself: the angle's fraction lit and
 *        turned into ¼, the 22⁄7 × 7 cm into 22 cm, the 2 × 22 cm into
 *        44 cm -- each a beat apart, the line closing up round every change
 *     4. "s = [ ]"                            -- the arc length
 *
 *   A wrong value is refused -- the pill shakes its head and stays red,
 *   the bird says why from the header, a sentence at a time, and the mark
 *   the step is about is lit on the figure: the angle and its "90°", the
 *   radii and their "7 cm", the arc. The right one pops into the box, the
 *   pills go, and the box dissolves round the number so the line reads as
 *   plain working. With "s = 11 cm" written, the bird says well done and
 *   what the arc length is, and Next arrives. Next pressed, the bird goes
 *   with its line, the working and the figure, all at once.
 *
 * Page 2 -- the arc length, asked. One question:
 *
 *   The board opens blank. The circle is outlined, a dot goes on its
 *   centre, two radii are grown out 120° apart astride twelve o'clock, the
 *   sector between them is tinted with its arc lit, the angle is drawn
 *   with "120°", and "21 cm" lands beside a radius. The header closes as
 *   the figure slides left, and the bird comes up in the right pane to
 *   ask, from bubble-02, for the arc length: three values, one by one. A
 *   wrong one is refused with why, a sentence at a time; the right one is
 *   confirmed the same way, the arc swelling once, and Next arrives.
 *
 * Page 3 -- the central angle, worked. The formula turned round:
 *
 *   The board opens blank. The circle is outlined, a dot goes on its
 *   centre, two radii are grown out 60° apart astride twelve o'clock, the
 *   sector between them is tinted with its arc lit and the angle drawn;
 *   then the labels land one by one -- "22 cm" over the arc, "21 cm"
 *   beside a radius, "θ = ?" in the sector. The figure slides left with
 *   the header open, the formula "s = θ⁄360° × 2πr" rises in on the
 *   right, and "Take π = 22⁄7" lands under the figure. A copy of the
 *   formula drops out of it and is rewritten before the learner's eyes:
 *   "s" becomes an empty box, "2πr" becomes "2 × 22⁄7 ×" another. Each
 *   box is a dropdown, made live one at a time: it opens with three
 *   values under it as the bird says what to choose; a wrong value is
 *   refused as on page 1, the mark it confuses lit on the figure; the
 *   right one lands and the box dissolves. With "22 cm = θ⁄360° × 2 ×
 *   22⁄7 × 21 cm" written, a copy drops under it and solves itself a
 *   move at a time -- the equation turned round so θ is on the left, the
 *   product gathered into 132 cm, both sides divided by it, the fraction
 *   simplified to 1⁄6, and 360° carried across -- to "θ = 360° × 1⁄6". A
 *   last copy turns "360° × 1⁄6" into a dropdown, the learner chooses 60°,
 *   the bird says well done and what the angle is, and Next arrives.
 *
 * Pages 4 and 5 -- the wiper. A story problem, asked twice:
 *
 *   The board opens blank. A windshield is outlined and its glass tinted
 *   in, a pivot goes on its bottom edge, a wiper blade is grown out of it
 *   to the upper left, and the blade sweeps 60° to the right: the glass it
 *   wipes is tinted behind it and its tip traces the arc. The angle is
 *   drawn at the pivot with "60°", and the labels land one by one, each
 *   lighting its mark: "Blade length = 42 cm" beside the blade and "The
 *   tip travels along this arc." over the arc. The header closes as the
 *   figure slides left, and the bird
 *   comes up in the right pane to ask what the formula needs -- the blade
 *   and the angle lit as it asks -- from three pairs, one by one; a wrong
 *   one is refused with why, and the right one is confirmed a sentence at
 *   a time, the blade lit as it is called the radius and the angle as it
 *   is called the central angle. Next pressed, the question goes but the
 *   figure and the bird stay, and on the page after the bird asks how much
 *   glass one sweep wipes -- the blade sweeping back and across once more
 *   with the arc lit -- from three lengths, one by one. The right one is
 *   worked in the box, the arc swelling, and Next arrives.
 *
 * Pages 6 and 7 -- the clock. A second story problem, asked twice:
 *
 *   The board opens blank. A clock face is drawn -- the rim, twelve
 *   ticks, the dot at the centre -- and the minute hand grows out of the
 *   centre to twelve. The hand turns 45 minutes round, three-quarters of
 *   the way, its start left as a dashed line and the rim it passes made
 *   bold in the arc's blue behind its tip; then the labels land one by
 *   one, each lighting its mark: "hand = 14 cm" beside the hand and "?"
 *   by the arc. The header closes as the
 *   figure slides left, and the bird asks from the pane how many degrees
 *   the hand turns through -- the hand turning again as it asks, with the
 *   angle drawn at the centre -- from three measures, one by one; the
 *   right one lands "270°" in the angle. Next pressed, the figure and the
 *   bird stay, and on the page after the bird asks how far the tip
 *   travels -- the hand turning once more with the arc lit -- from three
 *   lengths; the right one is worked in the box and takes the "?"'s
 *   place on the figure as "66 cm".
 *
 * Every word is read by key (T('key'), js/i18n.js) from locales/
 * locales.json, and each spoken line is voiced by the same key once a
 * recording is there.
 *
 * Load order: js/pages.js -> js/arcs.js -> ... -> js/circum.js -> js/practice.js
 * ========================================================================== */
(function (global) {
  'use strict';

  var M = global.Motion;
  var Flow = global.Flow;
  var Beats = global.Beats;
  var Pages = global.Pages;
  var A = global.Arcs;
  var C = global.Circum;
  if (!Pages || !Pages.addSection || !A || !A.P || !C || !C.ask) {
    console.error('practice.js: load js/pages.js, js/arcs.js and js/circum.js before js/practice.js.');
    return;
  }
  var K = Pages.kit;

  /* ---- the script -------------------------------------------------------
     Read by key at the moment a scene starts (the locale is in by then --
     see start() in script.js), each line carrying its key so it can be
     voiced. A sentence long enough to wrap keeps its last two words
     together, so its last row is never one stray word. Each wrong value
     is refused with what it really is and where on the figure to look --
     the mark it names is lit at the same moment -- rather than with the
     answer. */
  function T(key, repl) { return global.T ? global.T(key, repl) : key; }
  function said(key, text) { return { text: text, vo: key }; }
  var NB = ' ';
  function tie(s) { return s.replace(/ (\S+)$/, NB + '$1'); }
  function hint(key) { return [said('fbNotQuite', T('fbNotQuite')), said(key, tie(T(key)))]; }

  /* Page 1's four steps -- three of them asked. Each: the line and the box
     in it, what the bird says, the three values, the right one, why each
     wrong one is wrong, and the mark on the figure to light for it. */
  function solveSteps() {
    var deg90 = T('val90'), deg180 = T('val180');
    var cm7 = T('val7cm'), cm14 = T('val14cm');
    var cm11 = T('val11cm'), cm22 = T('val22cm'), cm44 = T('val44cm');
    var w1 = {}; w1[cm7] = hint('p29Wrong7');  w1[deg180] = hint('p29Wrong180');
    var w2 = {}; w2[cm14] = hint('p29Wrong14'); w2[deg90] = hint('p29Wrong90');
    var w4 = {}; w4[cm44] = hint('p29Wrong44'); w4[cm22] = hint('p29Wrong22');
    return [
      { line: dom.psLine1, slot: dom.psSlot1, g: dom.pa, ask: said('p29Angle', T('p29Angle')),
        options: [deg90, cm7, deg180], answer: deg90, wrong: w1, mark: 'angle' },
      { line: dom.psLine2, slot: dom.psSlot2, g: dom.pa, ask: said('p29Radius', T('p29Radius')),
        options: [cm7, cm14, deg90], answer: cm7, wrong: w2, mark: 'radius' },
      { line: dom.psLine4, slot: dom.psSlot4, g: dom.pa, ask: said('askArcLen', T('askArcLen')),
        options: [cm11, cm22, cm44], answer: cm11, wrong: w4, mark: 'arc' }
    ];
  }

  /* Page 2's. Each wrong length is refused with what it really is. */
  function chooseLines() {
    var right = T('val44cm'), half = T('val66cm'), whole = T('val132cm');
    var wrong = {};
    wrong[half]  = [said('fbNotQuite', T('fbNotQuite')), said('p30Wrong66',  tie(T('p30Wrong66')))];
    wrong[whole] = [said('fbNotQuite', T('fbNotQuite')), said('p30Wrong132', tie(T('p30Wrong132')))];
    return {
      ask:     said('askArcLen', tie(T('askArcLen'))),
      options: [right, half, whole],
      answer:  right,
      wrong:   wrong,
      right:   [said('fbCorrect', T('fbCorrect')), said('p30Right', tie(T('p30Right')))]
    };
  }

  /* Page 3's three dropdowns: the arc length, the radius, and the angle at
     the end. Each as page 1's steps are, with the menu the values drop
     from. */
  function angleSteps() {
    var cm22 = T('val22cm'), cm21 = T('val21cm'), cm42 = T('val42cm');
    var deg60 = T('val60'), deg30 = T('val30'), deg6 = T('val6');
    var ws = {}; ws[cm21] = hint('p31WrongS21'); ws[cm42] = hint('p31WrongS42');
    var wr = {}; wr[cm22] = hint('p31WrongR22'); wr[cm42] = hint('p31WrongR42');
    var wt = {}; wt[deg6] = hint('p31Wrong6');   wt[deg30] = hint('p31Wrong30');
    return [
      { line: dom.pnLine2, slot: dom.pnSlotS, menu: dom.pnMenuS, g: dom.pc,
        ask: said('askArcLen', T('askArcLen')),
        options: [cm22, cm21, cm42], answer: cm22, wrong: ws, mark: 'arc' },
      { line: dom.pnLine2, slot: dom.pnSlotR, menu: dom.pnMenuR, g: dom.pc,
        ask: said('p29Radius', T('p29Radius')),
        options: [cm21, cm22, cm42], answer: cm21, wrong: wr, mark: 'radius' },
      { line: dom.pnLine4, slot: dom.pnSlotTh, menu: dom.pnMenuTh, g: dom.pc,
        ask: said('p29Angle', T('p29Angle')),
        options: [deg60, deg30, deg6], answer: deg60, wrong: wt, mark: 'angle' }
    ];
  }

  /* The wiper's two questions. The first asks for the two things the
     formula needs -- three pairs of names, two wrong for a reason the
     figure shows; the second for the arc the tip travels. A formula said
     in the box keeps its spaces, so it is never broken across two rows. */
  function whole(s) { return s.replace(/ /g, NB); }
  function wiperNeedsLines() {
    var right = T('p32OptRadiusAngle'), chord = T('p32OptChordAngle'), dia = T('p32OptDiameterArea');
    var wrong = {};
    wrong[chord] = [said('fbNotQuite', T('fbNotQuite')), said('p32WrongChord',    tie(T('p32WrongChord')))];
    wrong[dia]   = [said('fbNotQuite', T('fbNotQuite')), said('p32WrongDiameter', tie(T('p32WrongDiameter')))];
    return {
      ask:     said('p32Ask', tie(T('p32Ask'))),
      options: [right, chord, dia],
      answer:  right,
      wrong:   wrong,
      right:   [said('fbCorrect', T('fbCorrect')),
                said('p32Right1', tie(T('p32Right1'))),
                said('p32Right2', tie(T('p32Right2')))]
    };
  }
  function wiperArcLines() {
    var right = T('val44cm'), blade = T('val42cm'), more = T('val48cm');
    var wrong = {};
    wrong[blade] = [said('fbNotQuite', T('fbNotQuite')), said('p33Wrong42', tie(T('p33Wrong42')))];
    wrong[more]  = [said('fbNotQuite', T('fbNotQuite')), said('p33Wrong48', tie(T('p33Wrong48')))];
    return {
      ask:     said('p33Ask', tie(T('p33Ask'))),
      options: [right, blade, more],
      answer:  right,
      wrong:   wrong,
      right:   [said('fbCorrect', T('fbCorrect')),
                said('p33Right1', whole(T('p33Right1'))),
                said('p33Right2', tie(T('p33Right2')))]
    };
  }

  /* The clock's two questions: the degrees 45 minutes turn the hand
     through, and the distance its tip travels. */
  function clockTurnLines() {
    var right = T('val270'), half = T('val180'), mins = T('val45');
    var wrong = {};
    wrong[half] = [said('fbNotQuite', T('fbNotQuite')), said('p34Wrong180', tie(T('p34Wrong180')))];
    wrong[mins] = [said('fbNotQuite', T('fbNotQuite')), said('p34Wrong45',  tie(T('p34Wrong45')))];
    return {
      ask:     said('p34Ask', tie(T('p34Ask'))),
      options: [right, half, mins],
      answer:  right,
      wrong:   wrong,
      right:   [said('fbCorrect', T('fbCorrect')), said('p34Right', tie(T('p34Right')))]
    };
  }
  function clockArcLines() {
    var right = T('val66cm'), full = T('val88cm'), half = T('val44cm');
    var wrong = {};
    wrong[full] = [said('fbNotQuite', T('fbNotQuite')), said('p35Wrong88', tie(T('p35Wrong88')))];
    wrong[half] = [said('fbNotQuite', T('fbNotQuite')), said('p35Wrong44', tie(T('p35Wrong44')))];
    return {
      ask:     said('p35Ask', tie(T('p35Ask'))),
      options: [right, full, half],
      answer:  right,
      wrong:   wrong,
      right:   [said('fbCorrect', T('fbCorrect')),
                said('p35Right1', whole(T('p35Right1'))),
                said('p35Right2', tie(T('p35Right2')))]
    };
  }

  var BEAT = K.BEAT, SHORT = K.SHORT;
  var CX = K.CX, CY = K.CY, RR = K.RR;
  var round2 = K.round2;
  var P = A.P;             /* a point round the lesson's circle: P(deg, r) */

  var SHIFT = -250;        /* the figure's slide to the left half -- the same
                              stand-aside every section uses, picture units */
  var LABEL_DY = 9;        /* a label's baseline, below the point it is centred on */
  var ANGLE_R = 42;        /* the mark at the centre, as every angle page draws it */
  var RADIUS_TIME = 0.6;   /* s: a radius, from the centre to the rim */
  var ARC_TIME = 0.8;      /* s: the sector swept in, its arc lit with it */
  var ANGLE_TIME = 0.6;    /* s: the angle, from one radius round to the other */
  var LINE_W = 3.4;        /* the radii's and the angle's weight (practice.css) */
  var ARC_W = 5;           /* the lit arc's weight (practice.css) */

  /* ---- the three figures ------------------------------------------------
     Degrees anticlockwise from three o'clock, as every angle in the app is:
     the sector runs from `a` anticlockwise for `span`. The length label
     sits beside one radius (`on`: the first, `a`, or the second, `b`),
     `rAt` out along it and `rOff` off it on the side away from the sector;
     the measure sits on the angle's middle line, `degR` out; an arc's own
     label, if the page has one, sits `arcOut` outside the rim on that same
     line. Page 1 is a quarter from the horizontal radius up to the
     vertical one, "7 cm" on the vertical; page 2 is 120° astride twelve
     o'clock, "21 cm" on the right-hand radius; page 3 is 60° astride
     twelve o'clock -- drawn at its true size, so the figure is honest --
     with "22 cm" over the arc and "21 cm" on the right-hand radius. */
  var PA = { a: 0,  span: 90,  on: 'b', rAt: 86,  rOff: 42, degR: 74 };
  var PB = { a: 30, span: 120, on: 'a', rAt: 120, rOff: 26, degR: 72 };
  var PC = { a: 60, span: 60,  on: 'a', rAt: 110, rOff: 36, degR: 108, arcOut: 26 };

  /* ---- the wiper (pages 4 and 5) ------------------------------------------
     Not the lesson's circle: a windshield with its wiper's pivot on its
     bottom edge, and the sector the blade sweeps -- 60° astride twelve
     o'clock, from the blade's start at PW_START round to PW.a -- drawn big,
     since it is the only thing on the glass. The blade is drawn at its
     start and turned to its end with a rotate() written straight to its
     transform, as the whole-turn page turns its arm (central.js). The
     labels: "60°" on the angle's middle line, the blade's length beside
     the blade on the side away from the sector, and the tip's note over
     the arc. */
  var PW = { cx: 500, cy: 357, r: 190, a: 60, span: 60 };
  var PW_START = PW.a + PW.span;   /* where the blade starts: the left edge */
  var GLASS_TIME = 1.2;            /* s: the windshield outlined */
  var SWEEP_TIME = 1.4;            /* s: the blade, once across */
  var BACK_TIME = 0.55;            /* s: and back to its start, when asked again */
  var PW_DEG_R = 88;               /* "60°", out along the angle's middle line */
  var PW_LEN_AT = 95;              /* the blade's label, out along the blade's
                                      START position -- which stays drawn, and
                                      is the one the bird is describing... */
  var PW_LEN_OFF = 18;             /* ...and off it, away from the sector */
  var PW_LEN_W = 150;              /* and the width its rows may take */
  var PW_TIP_OUT = 22;             /* the tip's note, outside the arc */
  var LABEL_GAP = 26;              /* a wrapped label's row spacing: the whole
                                      figure keeps inside the left half of the
                                      picture once it has slid, so a long
                                      label is wrapped to fit beside it */
  var SVG_NS = 'http://www.w3.org/2000/svg';

  /* ---- the clock (pages 6 and 7) ------------------------------------------
     A clock face a little bigger than the lesson's circle (user,
     2026-10-07): the minute hand starts at
     twelve and turns CK.turn degrees clockwise -- 45 minutes -- its tip
     tracing the rim it passes. Angles are anticlockwise from three
     o'clock as everywhere, so the hand's position after a turn of `a` is
     CK.start - a. The hand is drawn at twelve and turned with a rotate()
     written to its transform, as the wiper's blade is. */
  var CK = { cx: 500, cy: 210, r: 165, start: 90, turn: 270 };
  var CK_TICKS = 12;               /* the hour marks */
  var CK_TICK_IN = 15;             /* how far in from the rim a tick reaches */
  var CK_TURN_TIME = 2.0;          /* s: the hand, 45 minutes round */
  var CK_BACK_TIME = 0.6;          /* s: and back to twelve, when asked again */
  var CK_LEN_AT = 82;              /* "hand = 14 cm": centred on the hand's
                                      middle, so it clears both the rim at
                                      the tip and the dashed start at the
                                      centre... */
  var CK_LEN_UP = 22;              /* ...and above it, once the hand has turned */
  var CK_LEN_RIDE = { x: 0, y: -52 }; /* and where it lands first, beside the
                                      hand at twelve: it rides down to its
                                      place as the hand turns */
  /* The bird's lines are said as the thing they describe is drawn: a
     drawing that starts with the bird's jump begins JUMP after the bird
     sets off, so it begins as the bird lands and the words start; one
     that starts with a line said from the header begins LEAD in. */
  var JUMP = 900;
  var LEAD = 300;
  var CK_Q_AT = 20;                /* "?": the direction it sits in -- up by
                                      one o'clock, clear of "270°"... */
  var CK_Q_R = 110;                /* ...and how far out: inside the rim, with
                                      room for "66 cm" to take its place */
  var CK_DEG_AT = -45;             /* "270°": on the angle's middle line... */
  var CK_DEG_R = 76;               /* ...and how far out */

  /* ---- the working ------------------------------------------------------
     The pauses that keep each thing its own, so the eye can follow a value
     into its box, and a change to the line it is made in. */
  var READ = 700;          /* ms a hint's first sentence stands before the second */
  var STEP_GAP = 500;      /* ms a landed value stands before the next line */
  var LIT_HOLD = 550;      /* ms the cells about to be simplified are lit */
  var SOLVE_HOLD = 650;    /* ms each simplification stands before the next */
  var COPY_TIME = 0.8;     /* s: the copy dropping down to its own line */
  var TURN_TIME = 0.75;    /* s: the equation turned round, every cell gliding */
  var MENU_GAP = 0.25;     /* s between the values dropping out of a box */

  /* ---- the elements ------------------------------------------------------ */
  var dom = null;          /* pages.js's, with this section's own on top */
  var mascot = null;
  var opts = [];           /* the pills a step is offering, while it is open */
  var hinting = 0;         /* which hint owns the header now */
  var hintUp = false;      /* a hint is standing in the header */

  function $(id) { return document.getElementById(id); }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* A line's cells by the name each carries (data-k). */
  function keyed(line) {
    var out = {};
    all('[data-k]', line).forEach(function (el) { out[el.getAttribute('data-k')] = el; });
    return out;
  }

  /* One figure's marks, by id prefix. A page without an arc label has
     none. */
  function figure(p) {
    return {
      g: $(p), rim: $(p + 'Rim'), tip: $(p + 'Tip'), sector: $(p + 'Sector'), arc: $(p + 'Arc'),
      radA: $(p + 'RadA'), radB: $(p + 'RadB'), angle: $(p + 'Angle'), centre: $(p + 'Centre'),
      deg: $(p + 'Deg'), len: $(p + 'Len'), arcLen: $(p + 'ArcLen')
    };
  }

  function build() {
    dom = Object.create(K.dom());
    mascot = K.mascot();

    dom.pa = figure('pa');
    dom.pb = figure('pb');
    dom.pc = figure('pc');
    /* the wiper: its own marks, with the blade standing in for the
       second radius wherever the marks are lit (see marks) */
    dom.pw = {
      g: $('pw'), glass: $('pwGlass'), glassEdge: $('pwGlassEdge'),
      sector: $('pwSector'), arc: $('pwArc'), radA: $('pwRadA'), angle: $('pwAngle'),
      blade: $('pwBlade'), bladeLine: $('pwBladeLine'), tip: $('pwTip'),
      centre: $('pwCentre'), deg: $('pwDeg'), len: $('pwLen'), arcLen: $('pwArcLen')
    };
    dom.pw.radB = dom.pw.bladeLine;
    /* the clock */
    dom.ck = {
      g: $('ck'), rim: $('ckRim'), tip: $('ckTip'), ticksG: $('ckTicks'), ticks: [],
      arc: $('ckArc'), start: $('ckStart'), angle: $('ckAngle'),
      hand: $('ckHand'), handLine: $('ckHandLine'), handTip: $('ckHandTip'),
      centre: $('ckCentre'), len: $('ckLen'), q: $('ckQ'), deg: $('ckDeg'),
      ans: $('ckAns')
    };
    dom.cfPane = $('cfPane');

    /* page 1's working */
    dom.psPane  = $('psPane');
    dom.psLines = $('psLines');
    dom.psLine1 = $('psLine1');
    dom.psLine2 = $('psLine2');
    dom.psLine3 = $('psLine3');
    dom.psLine4 = $('psLine4');
    dom.psSlot1 = $('psSlot1');
    dom.psSlot2 = $('psSlot2');
    dom.psSlot4 = $('psSlot4');
    dom.psOpts  = $('psOpts');
    dom.psKeys  = keyed(dom.psLine3);
    dom.psAll   = [dom.psLine1, dom.psLine2, dom.psLine3, dom.psLine4];

    /* page 3's working, and the note under its figure */
    dom.pnPane   = $('pnPane');
    dom.pnLines  = $('pnLines');
    dom.pnLine1  = $('pnLine1');
    dom.pnLine2  = $('pnLine2');
    dom.pnLine3  = $('pnLine3');
    dom.pnLine4  = $('pnLine4');
    dom.pnSlotS  = $('pnSlotS');
    dom.pnSlotR  = $('pnSlotR');
    dom.pnSlotTh = $('pnSlotTh');
    dom.pnMenuS  = $('pnMenuS');
    dom.pnMenuR  = $('pnMenuR');
    dom.pnMenuTh = $('pnMenuTh');
    dom.pnKeys2  = keyed(dom.pnLine2);
    dom.pnKeys3  = keyed(dom.pnLine3);
    dom.pnKeys4  = keyed(dom.pnLine4);
    dom.pnAll    = [dom.pnLine1, dom.pnLine2, dom.pnLine3, dom.pnLine4];
    /* line 3 is turned round as it is solved: the order it is built in
       is kept, to be put back */
    dom.pnOrder3 = Array.prototype.slice.call(dom.pnLine3.children);
    dom.pnNote   = $('pnNote');
    dom.pnNoteT  = $('pnNoteText');
    /* the note carries a fraction, stood up as every fraction is */
    if (global.MathText) global.MathText.write(dom.pnNoteT, T('p31Pi'));

    layoutFigure(PA, dom.pa);
    layoutFigure(PB, dom.pb);
    layoutFigure(PC, dom.pc);
    layoutWiper();
    layoutClock();
    reset();
  }

  /* ---- drawing from the angles ------------------------------------------ */

  /* A radius: from the centre out to a point. */
  function radiusD(p) { return 'M' + CX + ' ' + CY + ' L' + p.x + ' ' + p.y; }

  /* An arc `r` out, from one point round to another anticlockwise on
     screen -- the way our angles grow -- and never more than a half-turn. */
  function arcD(from, to, r) {
    return 'M' + from.x + ' ' + from.y + ' A' + r + ' ' + r + ' 0 0 0 ' + to.x + ' ' + to.y;
  }

  /* The sector from `a` anticlockwise through `span` degrees. */
  function wedgeD(a, span) {
    var p0 = P(a, RR), p1 = P(a + span, RR);
    return 'M' + CX + ' ' + CY + ' L' + p0.x + ' ' + p0.y +
           ' A' + RR + ' ' + RR + ' 0 ' + (span > 180 ? 1 : 0) + ' 0 ' + p1.x + ' ' + p1.y + ' Z';
  }

  /* And the same sector at t of its sweep, 0 to 1 -- what secFill
     (animations.js) rewrites each frame. */
  function wedgeAt(f) {
    return function (t) { return wedgeD(f.a, f.span * t); };
  }

  /* A figure's marks, written once: everything on it is fixed, so it is
     laid out from the numbers above when the board is built. */
  function layoutFigure(f, g) {
    var a = f.a, b = f.a + f.span, mid = f.a + f.span / 2;
    var pA = P(a, RR), pB = P(b, RR);
    g.radA.setAttribute('d', radiusD(pA));
    g.radB.setAttribute('d', radiusD(pB));
    g.arc.setAttribute('d', arcD(pA, pB, RR));
    g.angle.setAttribute('d', arcD(P(a, ANGLE_R), P(b, ANGLE_R), ANGLE_R));
    g.sector.setAttribute('d', wedgeD(a, f.span));

    /* The measure, on the angle's middle line; and the arc's own label,
       if the page has one, outside the rim on the same line. */
    var d = P(mid, f.degR);
    g.deg.setAttribute('x', d.x);
    g.deg.setAttribute('y', round2(d.y + LABEL_DY));
    if (g.arcLen) {
      var s = P(mid, RR + (f.arcOut || 24));
      g.arcLen.setAttribute('x', s.x);
      g.arcLen.setAttribute('y', round2(s.y + LABEL_DY));
    }

    /* The length beside its radius: rAt out along it, rOff off it on the
       side AWAY from the sector -- whichever normal leans away from the
       angle's middle line -- with the label's own box centred on that
       spot. */
    var on = f.on === 'b' ? b : a;
    var t = on * Math.PI / 180;
    var m = P(on, f.rAt);
    var bx = Math.cos(mid * Math.PI / 180), by = -Math.sin(mid * Math.PI / 180);
    var nx = Math.sin(t), ny = Math.cos(t);
    if (nx * bx + ny * by > 0) { nx = -nx; ny = -ny; }
    g.len.setAttribute('x', round2(m.x + nx * f.rOff));
    g.len.setAttribute('y', round2(m.y + ny * f.rOff + LABEL_DY));
  }

  /* The figure made, mark by mark: the circle and its centre, a radius to
     each end of the arc, the sector swept in with its arc lit, the angle,
     and then the labels, one by one, in the order the page names them.
     Every page opens with this; only the numbers and the labels differ. */
  function drawFigure(f, g, labels) {
    return Flow.anim(Beats.drawRim(g.rim, g.tip))
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(g.centre)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.growLine(g.radA, RADIUS_TIME, 'sine.inOut')); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.growLine(g.radB, RADIUS_TIME, 'sine.inOut')); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Promise.all([
          Flow.anim(Beats.secFill(g.sector, wedgeAt(f), ARC_TIME)),
          Flow.anim(Beats.growLine(g.arc, ARC_TIME, 'power2.inOut'))
        ]);
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.growLine(g.angle, ANGLE_TIME, 'power2.inOut')); })
      .then(function () {
        return labels.reduce(function (chain, label) {
          return chain
            .then(function () { return Flow.anim(Beats.labelIn(label)); })
            .then(function () { return Flow.wait(SHORT); });
        }, Promise.resolve());
      })
      .then(function () { return Flow.wait(BEAT - SHORT); });
  }

  /* A figure put away once it has faded: hidden, and every inline write
     on it handed back. */
  function putAwayFigure(g) {
    g.g.setAttribute('hidden', '');
    K.clearInline([g.g].concat(all('*', g.g)));
  }

  /* ---- the wiper's drawing ------------------------------------------------- */

  /* A point round the pivot, `deg` degrees anticlockwise from three
     o'clock and `r` out. */
  function pwPt(deg, r) {
    var t = deg * Math.PI / 180;
    return { x: round2(PW.cx + Math.cos(t) * r), y: round2(PW.cy - Math.sin(t) * r) };
  }
  function pwRadiusD(deg) {
    var p = pwPt(deg, PW.r);
    return 'M' + PW.cx + ' ' + PW.cy + ' L' + p.x + ' ' + p.y;
  }
  /* The glass wiped so far: from the blade, at `a`, anticlockwise round to
     its start. Nothing, until it has moved. */
  function pwWedgeD(a) {
    var span = PW_START - a;
    if (span < 0.01) return '';
    var p0 = pwPt(a, PW.r), p1 = pwPt(PW_START, PW.r);
    return 'M' + PW.cx + ' ' + PW.cy + ' L' + p0.x + ' ' + p0.y +
           ' A' + PW.r + ' ' + PW.r + ' 0 0 0 ' + p1.x + ' ' + p1.y + ' Z';
  }
  function pwArcD(a) {
    if (PW_START - a < 0.01) return '';
    return arcD(pwPt(a, PW.r), pwPt(PW_START, PW.r), PW.r);
  }

  /* The blade turned to `a` -- and, while it is wiping, the sector and
     the arc rewritten up to it. */
  function placeBlade(a, wiping) {
    dom.pw.blade.setAttribute('transform',
      'rotate(' + (PW_START - a).toFixed(2) + ' ' + PW.cx + ' ' + PW.cy + ')');
    if (!wiping) return;
    var lo = Math.max(PW.a, Math.min(a, PW_START));
    dom.pw.sector.setAttribute('d', pwWedgeD(lo));
    dom.pw.arc.setAttribute('d', pwArcD(lo));
  }

  /* The wiper's fixed marks, written once. */
  function layoutWiper() {
    var g = dom.pw;
    g.radA.setAttribute('d', pwRadiusD(PW_START));
    g.bladeLine.setAttribute('d', pwRadiusD(PW_START));
    var tip = pwPt(PW_START, PW.r);
    g.tip.setAttribute('cx', tip.x);
    g.tip.setAttribute('cy', tip.y);
    g.angle.setAttribute('d', arcD(pwPt(PW.a, ANGLE_R), pwPt(PW_START, ANGLE_R), ANGLE_R));
    g.centre.setAttribute('cx', PW.cx);
    g.centre.setAttribute('cy', PW.cy);
    var mid = PW.a + PW.span / 2;
    var d = pwPt(mid, PW_DEG_R);
    g.deg.setAttribute('x', d.x);
    g.deg.setAttribute('y', round2(d.y + LABEL_DY));
    /* the blade's label: out along the blade's START position, off it on
       the side away from the sector -- whichever normal leans away from
       the angle's middle line -- its rows ending at that spot */
    var mid = PW.a + PW.span / 2;
    var t = PW_START * Math.PI / 180, m = pwPt(PW_START, PW_LEN_AT);
    var bx = Math.cos(mid * Math.PI / 180), by = -Math.sin(mid * Math.PI / 180);
    var nx = Math.sin(t), ny = Math.cos(t);
    if (nx * bx + ny * by > 0) { nx = -nx; ny = -ny; }
    g.lenAt = { x: round2(m.x + nx * PW_LEN_OFF), y: round2(m.y + ny * PW_LEN_OFF + LABEL_DY) };
    g.len.setAttribute('x', g.lenAt.x);
    g.len.setAttribute('y', g.lenAt.y);
    var s = pwPt(mid, PW.r + PW_TIP_OUT);
    g.arcLen.setAttribute('x', s.x);
    g.arcLen.setAttribute('y', round2(s.y + LABEL_DY));
    placeBlade(PW_START, true);
  }

  /* A label wrapped into rows no wider than `maxW`, each a tspan at `x`,
     the first at `y` and the rest `gap` under one another: a word is
     added to the row and the row measured; one that runs over is taken
     down to the next. Measurable only once the group is shown;
     unmeasurable, it stays one row. */
  function wrapText(el, text, maxW, x, y, gap) {
    el.textContent = '';
    var rows = [], row = null;
    function next(word) {
      row = document.createElementNS(SVG_NS, 'tspan');
      row.setAttribute('x', x);
      row.setAttribute('y', y + gap * rows.length);
      row.textContent = word;
      el.appendChild(row);
      rows.push(row);
    }
    text.split(' ').forEach(function (word) {
      if (!row) return next(word);
      var was = row.textContent;
      row.textContent = was + ' ' + word;
      var w = 0;
      try { w = row.getComputedTextLength(); } catch (e) {}
      if (w > maxW) { row.textContent = was; next(word); }
    });
  }
  /* The wiper's one long label: the blade's length, in rows beside the
     blade. */
  function wrapBladeLabel() {
    var g = dom.pw;
    wrapText(g.len, T('p32Blade'), PW_LEN_W, g.lenAt.x, g.lenAt.y, LABEL_GAP);
  }

  /* The blade turned from one angle to another: the sector and the arc
     grow behind it while it is wiping (the first sweep), and stay whole
     when it is only shown sweeping again. However the beat ends, the
     blade is left at `to`. */
  function sweep(from, to, seconds, ease, wiping) {
    var turn = { a: from };
    function put() { placeBlade(turn.a, wiping); }
    var tl = M.timeline({ revert: function () { turn.a = to; put(); } });
    put();
    tl.set(dom.pw.blade, { opacity: 1 }, 0)
      .to(turn, { a: to, duration: M.dur(seconds), ease: ease || 'sine.inOut', onUpdate: put }, 0);
    return tl;
  }

  /* The glass, tinted in once its edge is drawn. */
  function glassIn() {
    var tl = M.timeline({ willChange: dom.pw.glass, willChangeValue: 'opacity' });
    tl.to(dom.pw.glass, { opacity: 1, duration: M.dur(0.5), ease: M.OUT });
    return tl;
  }

  /* Asked how much one sweep wipes: the blade goes back to its start and
     sweeps across once more, the arc swelling as the tip travels it. */
  function resweep() {
    var g = dom.pw;
    return Flow.anim(sweep(PW.a, PW_START, BACK_TIME, 'power2.inOut', false))
      .then(function () {
        return Promise.all([
          Flow.anim(sweep(PW_START, PW.a, SWEEP_TIME * 0.8, 'sine.inOut', false)),
          Flow.anim(Beats.linePulse([g.arc], ARC_W))
        ]);
      });
  }

  /* ---- the clock's drawing --------------------------------------------------- */

  function ckPt(deg, r) {
    var t = deg * Math.PI / 180;
    return { x: round2(CK.cx + Math.cos(t) * r), y: round2(CK.cy - Math.sin(t) * r) };
  }
  /* The arc the tip has traced: from twelve, clockwise, `a` degrees round,
     `r` out. Nothing, until the hand has moved. */
  function ckArcD(a, r) {
    if (a < 0.01) return '';
    var p0 = ckPt(CK.start, r), p1 = ckPt(CK.start - a, r);
    return 'M' + p0.x + ' ' + p0.y + ' A' + r + ' ' + r + ' 0 ' + (a > 180 ? 1 : 0) + ' 1 ' +
           p1.x + ' ' + p1.y;
  }
  /* The hand turned `a` degrees clockwise from twelve -- and, as asked,
     the rim it has passed and the angle it has turned through rewritten
     up to it. */
  function placeHand(a, arc, angle) {
    dom.ck.hand.setAttribute('transform',
      'rotate(' + a.toFixed(2) + ' ' + CK.cx + ' ' + CK.cy + ')');
    if (arc) dom.ck.arc.setAttribute('d', ckArcD(a, CK.r));
    if (angle) dom.ck.angle.setAttribute('d', ckArcD(a, ANGLE_R));
  }

  /* The clock's fixed marks, written once; the ticks made here too. */
  function layoutClock() {
    var g = dom.ck;
    var top = ckPt(CK.start, CK.r), foot = ckPt(CK.start - 180, CK.r);
    g.rim.setAttribute('d',
      'M' + top.x + ' ' + top.y + ' A' + CK.r + ' ' + CK.r + ' 0 0 1 ' + foot.x + ' ' + foot.y +
      ' A' + CK.r + ' ' + CK.r + ' 0 0 1 ' + top.x + ' ' + top.y);
    g.tip.setAttribute('cx', top.x);
    g.tip.setAttribute('cy', top.y);
    g.ticksG.textContent = '';
    g.ticks = [];
    for (var i = 0; i < CK_TICKS; i++) {
      var deg = 360 * i / CK_TICKS;
      var o = ckPt(deg, CK.r), n = ckPt(deg, CK.r - CK_TICK_IN);
      var line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('class', 'ck-tick');
      line.setAttribute('x1', o.x); line.setAttribute('y1', o.y);
      line.setAttribute('x2', n.x); line.setAttribute('y2', n.y);
      g.ticksG.appendChild(line);
      g.ticks.push(line);
    }
    var handD = 'M' + CK.cx + ' ' + CK.cy + ' L' + top.x + ' ' + top.y;
    g.handLine.setAttribute('d', handD);
    g.start.setAttribute('d', handD);
    g.handTip.setAttribute('cx', top.x);
    g.handTip.setAttribute('cy', top.y);
    g.centre.setAttribute('cx', CK.cx);
    g.centre.setAttribute('cy', CK.cy);
    /* "hand = 14 cm" above the hand where it ends, at nine */
    var end = ckPt(CK.start - CK.turn, CK_LEN_AT);
    g.len.setAttribute('x', end.x);
    g.len.setAttribute('y', round2(end.y - CK_LEN_UP + LABEL_DY));
    var q = ckPt(CK_Q_AT, CK_Q_R);
    g.q.setAttribute('x', q.x);   g.q.setAttribute('y', round2(q.y + LABEL_DY));
    g.ans.setAttribute('x', q.x); g.ans.setAttribute('y', round2(q.y + LABEL_DY));
    var d = ckPt(CK_DEG_AT, CK_DEG_R);
    g.deg.setAttribute('x', d.x);
    g.deg.setAttribute('y', round2(d.y + LABEL_DY));
    placeHand(0, true, true);
  }

  /* The twelve ticks, in, one quickly after another round the face. */
  function ticksIn() {
    var list = dom.ck.ticks;
    M.set(list, { opacity: 0 });
    var tl = M.timeline({ willChange: list, willChangeValue: 'opacity' });
    tl.to(list, { opacity: 1, duration: M.dur(0.25), ease: M.OUT, stagger: M.gap(0.05) });
    return tl;
  }

  /* The hand turned from one angle to another, clockwise from twelve: the
     arc grows behind its tip while it is tracing, the angle at the centre
     while it is being measured. However the beat ends, the hand is left
     at `to`. */
  function turnHand(from, to, seconds, ease, arc, angle, ride) {
    var turn = { a: from };
    function put() { placeHand(turn.a, arc, angle); }
    var tl = M.timeline({
      revert: function () {
        turn.a = to; put();
        if (ride) M.set(ride, { x: 0, y: 0 });
      }
    });
    put();
    tl.set(dom.ck.hand, { opacity: 1 }, 0)
      .to(turn, { a: to, duration: M.dur(seconds), ease: ease || 'sine.inOut', onUpdate: put }, 0);
    /* a label carried with the hand to where it rests, from wherever it
       stood -- "hand = 14 cm", from beside the hand at twelve */
    if (ride) tl.to(ride, { x: 0, y: 0, duration: M.dur(seconds), ease: ease || 'sine.inOut' }, 0);
    return tl;
  }

  /* Asked how many degrees: the hand goes back to twelve and turns the 45
     minutes again, the angle drawn at the centre as it goes. */
  function reTurnWithAngle() {
    return Flow.anim(turnHand(CK.turn, 0, CK_BACK_TIME, 'power2.inOut', false, false))
      .then(function () {
        M.set(dom.ck.angle, { opacity: 1 });
        return Flow.anim(turnHand(0, CK.turn, CK_TURN_TIME * 0.8, 'sine.inOut', false, true));
      });
  }
  /* Asked how far the tip travels: the hand goes back and round once
     more, the arc swelling as the tip travels it and "?" pulsing. */
  function reTurnWithArc() {
    var g = dom.ck;
    return Flow.anim(turnHand(CK.turn, 0, CK_BACK_TIME, 'power2.inOut', false, false))
      .then(function () {
        var q = M.timeline({ revert: function () { M.set(g.q, { clearProps: 'transform' }); } });
        q.to(g.q, { scale: 1.3, transformOrigin: 'center center', duration: M.dur(0.26), ease: 'power2.out' })
         .to(g.q, { scale: 1, duration: M.dur(0.5), ease: M.POP });
        return Promise.all([
          Flow.anim(turnHand(0, CK.turn, CK_TURN_TIME * 0.8, 'sine.inOut', false, false)),
          Flow.anim(Beats.linePulse([g.arc], CK_ARC_W)),
          Flow.anim(q)
        ]);
      });
  }
  /* The right length pressed: "?" gives way to "66 cm" in its place, and
     the arc swells once. */
  function showClockAnswer() {
    var g = dom.ck;
    var out = M.timeline({ willChange: g.q, willChangeValue: 'transform, opacity' });
    out.to(g.q, { opacity: 0, scale: 0.6, transformOrigin: 'center center',
                  duration: M.dur(0.25), ease: M.IN });
    return Flow.anim(out)
      .then(function () {
        return Promise.all([
          Flow.anim(Beats.labelIn(g.ans)),
          Flow.anim(Beats.linePulse([g.arc], CK_ARC_W))
        ]);
      });
  }
  /* The right measure pressed: "270°" lands in the angle, which swells. */
  function showClockAngle() {
    var g = dom.ck;
    return Promise.all([
      Flow.anim(Beats.labelIn(g.deg)),
      Flow.anim(Beats.linePulse([g.angle], LINE_W))
    ]);
  }
  var CK_ARC_W = 7;                /* the traced rim's weight (practice.css) */

  /* ======================================================================
   * The working -- the beats pages 1 and 3 share
   * ====================================================================== */

  /* A line of working arriving under the one before: it rises into place.
     Its resting state is UNSEEN (practice.css), so this is a plain
     timeline that leaves it standing, not M.enter, which would hand the
     opacity back and lose the line. */
  function lineIn(line) {
    line.removeAttribute('hidden');
    M.set(line, { opacity: 0, y: 14 });
    var tl = M.timeline({ willChange: line, willChangeValue: 'transform, opacity' });
    tl.to(line, { opacity: 1, y: 0, duration: M.dur(0.45), ease: M.OUT });
    return Flow.anim(tl);
  }

  /* The copy: a line that is the one above it, word for word, comes out
     of that line and drops into its own place under it. Its offset is
     read off the layout as it is, in the pane's own pixels. */
  function lineCopy(line, from) {
    line.removeAttribute('hidden');
    var dy = line.offsetTop - from.offsetTop;
    M.set(line, { opacity: 0.5, y: -dy });
    var tl = M.timeline({ willChange: line, willChangeValue: 'transform, opacity' });
    tl.to(line, { opacity: 1, y: 0, duration: M.dur(COPY_TIME), ease: M.INOUT });
    return Flow.anim(tl);
  }

  /* Every cell of a line Flip is handed when the line changes shape: the
     terms, the halves of each fraction, and the value inside a box. */
  function cells(line) { return all('.ps-t, .ps-n, .ps-d, .ps-slot__v', line); }

  /* Three values, one by one: the tray's own entrance with the stagger
     opened right up, so each pill is its own arrival. Hidden by hand
     first, or the row flashes complete for the frame before the tween's
     first. `gap` is the stagger -- a row under the line takes the ask's
     own; a menu dropping out of a box is a touch quicker. */
  function optsIn(list, gap) {
    M.set(list, { opacity: 0 });
    var tl = M.timeline({ willChange: list, willChangeValue: 'transform, opacity' });
    tl.fromTo(list,
      { opacity: 0, y: 14, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: M.dur(0.4), ease: M.POP, stagger: M.gap(gap || 0.3) });
    return tl;
  }
  /* And away again, a beat apart, once the value is in. */
  function optsOut(list) {
    if (!list.length) return null;
    var tl = M.timeline({ willChange: list, willChangeValue: 'transform, opacity' });
    tl.to(list, { opacity: 0, y: 10, scale: 0.94, duration: M.dur(0.3), ease: M.IN,
                  stagger: M.gap(0.08) });
    return tl;
  }
  function emptyOpts(host) {
    host.textContent = '';
    opts = [];
  }

  /* The mark a step is about, lit on the figure when a wrong value is
     pressed: its lines swell twice and its label pops with them, so the
     eye is taken to the thing the step is asking for. Stroke width is the
     one thing a line has to swell (see animations.css on the pulse); it
     is handed back however the beat ends. */
  function marks(g) {
    return {
      angle:  { lines: [g.angle],        w: LINE_W, label: g.deg },
      radius: { lines: [g.radA, g.radB], w: LINE_W, label: g.len },
      arc:    { lines: [g.arc],          w: ARC_W,  label: g.arcLen }
    };
  }
  function spotlight(g, which) {
    var m = marks(g)[which];
    if (!m) return Promise.resolve();
    var tl = M.timeline({
      revert: function () {
        M.set(m.lines, { clearProps: 'strokeWidth' });
        if (m.label) M.set(m.label, { clearProps: 'transform' });
      }
    });
    [0, 0.8].forEach(function (at) {
      tl.to(m.lines, { strokeWidth: m.w * 1.9, duration: M.dur(0.26), ease: 'power2.out' }, M.gap(at))
        .to(m.lines, { strokeWidth: m.w, duration: M.dur(0.5), ease: M.POP }, M.gap(at + 0.26));
      if (m.label) {
        tl.to(m.label, { scale: 1.3, transformOrigin: 'center center',
                         duration: M.dur(0.26), ease: 'power2.out' }, M.gap(at))
          .to(m.label, { scale: 1, duration: M.dur(0.5), ease: M.POP }, M.gap(at + 0.26));
      }
    });
    return Flow.anim(tl);
  }

  /* A wrong value, refused from the header: "Not quite!" and then, as the
     mark lights on the figure, why -- each sentence said in turn, the
     bird confused for both. A newer hint, or the right value, takes the
     header over: `hinting` is bumped, and an older chain that wakes up to
     find itself outvoted stops between its lines. */
  function refuse(spec, name) {
    var lines = spec.wrong[name];
    if (!lines) return Promise.resolve();
    var mine = ++hinting;
    function live() { return mine === hinting; }
    hintUp = true;
    return K.speak(lines[0], 'confused')
      .then(function () { if (live()) return Flow.wait(READ); })
      .then(function () {
        if (!live()) return;
        K.quiet(spotlight(spec.g, spec.mark));
        return K.speak(lines[1], 'confused');
      });
  }

  /* A hint still standing when the right value is pressed goes at once:
     a line that says "Not quite!" over a value turning green would be
     saying the wrong thing. The next instruction then types into an
     empty row. */
  function dropHint() {
    hinting++;
    if (!hintUp) return;
    hintUp = false;
    K.quiet(Flow.anim(Beats.lineOut(dom.promptLine)).then(function () { K.clearPrompt(); }));
  }

  /* What every pill does when it is pressed, whichever row or menu it
     stands in: the right one turns green and fires the gate; a wrong one
     shakes, turns red, is spent, and is explained. `done()` is the
     caller's, for anything of its own that stops with a right press. */
  function pressed(spec, btn, ev, done) {
    if (btn.classList.contains('is-done')) return;
    K.ripple(ev, btn);
    if (btn.dataset.name === spec.answer) {
      done();
      dropHint();
      Beats.choiceRight(btn);
      dom.gate.dispatchEvent(new MouseEvent('click'));
      return;
    }
    /* Spent: a value shown wrong is left standing red, so the learner is
       choosing among the rest rather than pressing the same one. */
    btn.classList.add('is-done');
    Beats.choiceWrong(btn);
    K.quiet(refuse(spec, btn.dataset.name));
  }

  /* What a skip puts down for the learner: the right pill lit the way a
     pressed one is -- without firing the gate, which the skip has already
     answered. */
  function fillIn(spec) {
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].dataset.name === spec.answer &&
          !opts[i].classList.contains('is-right')) {
        opts[i].classList.add('is-right');
        return;
      }
    }
  }
  /* Every pill a control no longer. */
  function spend(onPick) {
    opts.forEach(function (b) {
      b.removeEventListener('click', onPick);
      b.classList.add('is-done');
    });
  }

  /* ---- the interaction, page 1: one press on one of three pills --------
     Real buttons (see buildChoices in pages.js), so Enter and Space work
     without a line of code. A wrong press is refused -- the pill shakes,
     turns red and is spent, and the bird says why -- and the learner tries
     again among the pills that are left. The right one turns green and the
     wait resolves.
       The wait is the lesson's gate (see #gate in index.html): an ordinary
     Flow.once, cancelled with the rest of the chain when the scene is
     retired, with the listeners coming off whichever way it ends. A skip
     answers the step for the learner -- the right pill is lit -- so the
     beats after this are about a board that says what they say it says. */
  function armChoices(spec) {
    var live = true;
    function onPick(ev) {
      if (!live) return;
      pressed(spec, ev.currentTarget, ev, function () { live = false; });
    }
    function off() { live = false; spend(onPick); }
    opts.forEach(function (b) { b.addEventListener('click', onPick); });
    return Flow.once(dom.gate, { auto: true }).then(
      function () { fillIn(spec); off(); },
      function (err) { off(); throw err; });
  }

  /* ---- the interaction, page 3: a dropdown ---------------------------------
     The box is a button. Live, it wears a chevron and breathes, and its
     menu drops open under it at once with the three values, one by one --
     a dropdown that has to be found is a step the page does not need. A
     press on the box closes the menu and opens it again; a value is
     pressed as a pill is (see pressed). The menu is built the first time
     it opens and kept while it is closed, so a value shown wrong stays
     spent. Resolves as armChoices does, through the gate. */
  function armDrop(spec) {
    var slot = spec.slot, menu = spec.menu, cell = slot.parentNode;
    var live = true, open = false;

    function onPick(ev) {
      if (!live) return;
      pressed(spec, ev.currentTarget, ev, function () { live = false; });
    }
    function show() {
      if (open || !live) return;
      open = true;
      slot.setAttribute('aria-expanded', 'true');
      menu.removeAttribute('hidden');
      if (!opts.length) {
        opts = K.buildChoices(menu, K.shuffle(spec.options));
        opts.forEach(function (b) { b.addEventListener('click', onPick); });
      }
      alignMenu(menu, cell);
      K.quiet(Flow.anim(menuIn(menu, opts)));
    }
    function hide() {
      if (!open) return;
      open = false;
      slot.setAttribute('aria-expanded', 'false');
      K.quiet(Flow.anim(menuOut(menu, opts)).then(function () {
        if (!open) menu.setAttribute('hidden', '');
      }));
    }
    function onSlot(ev) {
      if (!live) return;
      K.ripple(ev, slot);
      if (open) hide(); else show();
    }
    function off() {
      live = false;
      slot.removeEventListener('click', onSlot);
      slot.classList.remove('is-live');
      slot.setAttribute('tabindex', '-1');
      slot.setAttribute('aria-expanded', 'false');
      spend(onPick);
    }

    slot.classList.add('is-live');
    slot.setAttribute('tabindex', '0');
    slot.addEventListener('click', onSlot);
    show();

    return Flow.once(dom.gate, { auto: true }).then(
      function () { fillIn(spec); off(); },
      function (err) { off(); throw err; });
  }

  /* A menu hangs under its box's left edge, unless that would carry it
     past the pane's edge -- the box at the end of a line -- in which case
     it hangs under the right edge instead. Measured each time it opens. */
  function alignMenu(menu, cell) {
    var pane = dom.pnPane.getBoundingClientRect();
    var at = cell.getBoundingClientRect();
    var w = menu.getBoundingClientRect().width;
    menu.classList.toggle('is-right', at.left + w > pane.right - 4);
  }

  /* The menu dropping open: the card comes down a little as it fades up,
     and the values drop in under one another. */
  function menuIn(menu, list) {
    M.set(list, { opacity: 0 });
    var tl = M.timeline({ willChange: [menu].concat(list), willChangeValue: 'transform, opacity' });
    tl.fromTo(menu, { opacity: 0, y: -8, scale: 0.96, transformOrigin: '50% 0' },
              { opacity: 1, y: 0, scale: 1, duration: M.dur(0.25), ease: M.OUT }, 0)
      .fromTo(list, { opacity: 0, y: 10, scale: 0.9 },
              { opacity: 1, y: 0, scale: 1, duration: M.dur(0.35), ease: M.POP,
                stagger: M.gap(MENU_GAP) }, M.gap(0.1));
    return tl;
  }
  /* And closing: the values go a beat apart, the card after them. */
  function menuOut(menu, list) {
    var tl = M.timeline({ willChange: [menu].concat(list), willChangeValue: 'transform, opacity' });
    if (list.length) {
      tl.to(list, { opacity: 0, y: 6, scale: 0.94, duration: M.dur(0.2), ease: M.IN,
                    stagger: M.gap(0.05) }, 0);
    }
    tl.to(menu, { opacity: 0, y: -6, scale: 0.97, duration: M.dur(0.2), ease: M.IN },
          M.gap(list.length ? 0.12 : 0));
    return tl;
  }

  /* The right value, in: it pops into the box as the pills go -- the row
     under the line, or the menu under the box; then the box dissolves --
     its edge and its fill fade (the stylesheet transitions them) and its
     width is let go, Flip playing the line closing up round the plain
     number. The box is no longer a box: the line reads as working written
     out. */
  function land(spec) {
    var slot = spec.slot, v = slot.querySelector('.ps-slot__v');
    var host = spec.menu || dom.psOpts;
    slot.classList.remove('is-live');
    global.MathText.write(v, spec.answer);
    var pop = M.timeline({ willChange: v, willChangeValue: 'transform, opacity' });
    pop.fromTo(v, { opacity: 0, scale: 0.5 },
               { opacity: 1, scale: 1, duration: M.dur(0.4), ease: 'back.out(1.7)' });
    var gone = spec.menu ? menuOut(spec.menu, opts) : optsOut(opts);
    return Promise.all([Flow.anim(pop), Flow.anim(gone)])
      .then(function () {
        if (spec.menu) spec.menu.setAttribute('hidden', '');
        emptyOpts(host);
        return Flow.wait(220);
      })
      .then(function () {
        var moved = cells(spec.line);
        return Flow.anim(M.relayout(moved, function () {
          slot.classList.add('is-filled');
        }, { nested: true, scale: false, vars: { duration: M.dur(0.45), ease: M.INOUT } }));
      });
  }

  /* One asked step of page 1: the bird says what to do -- coming up onto
     the header for the first, from where it stands for the rest -- the
     line rises in with its empty box, the three values arrive, and the
     right one lands. */
  function step(spec, first) {
    return (first
      ? K.arriveSaying(spec.ask).then(function () { mascot.settle(); })
      : K.speak(spec.ask))
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        spec.slot.classList.add('is-live');
        return lineIn(spec.line);
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        opts = K.buildChoices(dom.psOpts, K.shuffle(spec.options));
        return Flow.anim(optsIn(opts));
      })
      .then(function () { return armChoices(spec); })
      .then(function () { return land(spec); })
      .then(function () { return Flow.wait(STEP_GAP); });
  }

  /* One dropdown of page 3: the bird says what to choose, the box comes
     alive and its menu drops open, and the right value lands. The line
     is already standing: the scene put it there. */
  function dropStep(spec, first) {
    return (first
      ? K.arriveSaying(spec.ask).then(function () { mascot.settle(); })
      : K.speak(spec.ask))
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return armDrop(spec); })
      .then(function () { return land(spec); })
      .then(function () { return Flow.wait(STEP_GAP); });
  }

  /* One change to a line: the cells about to change are lit -- their
     colour (a class, which the stylesheet transitions) and one small
     swell -- and read; they fade and shrink away; the cells are turned
     over -- the old ones out of the layout, the new in -- and Flip plays
     the line closing up round the gap; then the new cells pop in, already
     in their colours. Every cell of the line is handed to Flip, since
     every term after the change is moved. `repls` is one cell or several,
     each already standing where it will show (index.html). */
  function collapse(line, olds, repls) {
    var news = [].concat(repls);
    olds.forEach(function (c) { c.classList.add('is-on'); });
    var lit = M.timeline({
      willChange: olds, willChangeValue: 'transform',
      revert: function () { M.set(olds, { clearProps: 'transform' }); }
    });
    lit.to(olds, { scale: 1.12, transformOrigin: 'center center', duration: M.dur(0.22), ease: 'power2.out' })
       .to(olds, { scale: 1, duration: M.dur(0.45), ease: M.POP });
    return Flow.anim(lit)
      .then(function () { return Flow.wait(LIT_HOLD); })
      .then(function () {
        var out = M.timeline({ willChange: olds, willChangeValue: 'transform, opacity' });
        out.to(olds, { opacity: 0, scale: 0.8, transformOrigin: 'center center',
                       duration: M.dur(0.3), ease: M.IN, stagger: M.gap(0.04) });
        return Flow.anim(out);
      })
      .then(function () {
        var moved = cells(line);
        M.set(news, { opacity: 0 });
        return Flow.anim(M.relayout(moved, function () {
          olds.forEach(function (c) { c.classList.add('is-gone'); });
          news.forEach(function (c) { c.classList.add('is-in'); });
        }, { nested: true, scale: false, vars: { duration: M.dur(0.5), ease: M.INOUT } }));
      })
      .then(function () {
        var pop = M.timeline({ willChange: news, willChangeValue: 'transform, opacity' });
        pop.fromTo(news, { opacity: 0, scale: 0.6, transformOrigin: 'center center' },
                   { opacity: 1, scale: 1, duration: M.dur(0.4), ease: 'back.out(1.7)',
                     stagger: M.gap(0.06) });
        pop.call(Beats.pop, null, 0);
        return Flow.anim(pop);
      });
  }

  /* A line turned round: its cells put in a new order -- `keys`, every
     cell of the line by name -- and Flip gliding each from where it
     stood to where it now stands, so the equation is seen to be turned,
     not rewritten. */
  function reorder(line, keyed_, keys) {
    var moved = cells(line);
    return Flow.anim(M.relayout(moved, function () {
      keys.forEach(function (k) { line.appendChild(keyed_[k]); });
    }, { nested: true, scale: false, vars: { duration: M.dur(TURN_TIME), ease: M.INOUT } }));
  }

  /* The working away, once Next is pressed -- or a wipe catches it up:
     the lines that are standing, and any pills with them. */
  function linesOut(lines) {
    var shown = lines.filter(function (l) { return !l.hasAttribute('hidden'); });
    var tl = M.timeline({ willChange: shown.concat(opts), willChangeValue: 'transform, opacity' });
    if (shown.length) {
      tl.to(shown, { opacity: 0, y: 8, duration: M.dur(0.3), ease: M.IN, stagger: M.gap(0.06) }, 0);
    }
    if (opts.length) {
      tl.to(opts, { opacity: 0, y: 10, scale: 0.94, duration: M.dur(0.3), ease: M.IN,
                    stagger: M.gap(0.08) }, 0);
    }
    return tl;
  }

  /* A pane's working put away: every line hidden and plain again, every
     box empty and a box once more, every cell back to its word, every
     menu shut and emptied, every inline write cleared, the pills gone,
     the pane shut. */
  function restorePane(pane, lines) {
    hinting++;
    hintUp = false;
    pane.setAttribute('hidden', '');
    lines.forEach(function (l) { l.setAttribute('hidden', ''); });
    all('.is-on, .is-gone, .is-in, .is-filled, .is-live, .is-right', pane).forEach(function (el) {
      el.classList.remove('is-on', 'is-gone', 'is-in', 'is-filled', 'is-live', 'is-right');
    });
    all('.ps-slot__v', pane).forEach(function (v) { v.textContent = ''; });
    all('.ps-drop', pane).forEach(function (b) {
      b.setAttribute('tabindex', '-1');
      b.setAttribute('aria-expanded', 'false');
    });
    all('.ps-menu', pane).forEach(function (m) {
      m.textContent = '';
      m.setAttribute('hidden', '');
      m.classList.remove('is-right');
    });
    M.set(all('*', pane), { clearProps: 'opacity,transform,transformOrigin' });
    if (pane === dom.pnPane) {
      dom.pnOrder3.forEach(function (c) { dom.pnLine3.appendChild(c); });
    }
    all('.ps-opts', pane).forEach(function (o) { o.textContent = ''; });
    opts = [];
  }
  function restoreAll() {
    restorePane(dom.psPane, dom.psAll);
    restorePane(dom.pnPane, dom.pnAll);
    restoreNote();
  }

  /* ---- the note under page 3's figure: "Take π = 22⁄7" -------------------
     Its resting state is unseen; it rises into place when the value is
     wanted, is pulsed once as the value is written into the formula, and
     goes with the working. */
  function noteIn() {
    dom.pnNote.removeAttribute('hidden');
    M.set(dom.pnNoteT, { opacity: 0, y: 10 });
    var tl = M.timeline({ willChange: dom.pnNoteT, willChangeValue: 'transform, opacity' });
    tl.to(dom.pnNoteT, { opacity: 1, y: 0, duration: M.dur(0.45), ease: M.OUT });
    return Flow.anim(tl);
  }
  function notePulse() {
    var tl = M.timeline({
      willChange: dom.pnNoteT, willChangeValue: 'transform',
      revert: function () { M.set(dom.pnNoteT, { clearProps: 'transform' }); }
    });
    tl.to(dom.pnNoteT, { scale: 1.12, transformOrigin: 'center center', duration: M.dur(0.22), ease: 'power2.out' })
      .to(dom.pnNoteT, { scale: 1, duration: M.dur(0.45), ease: M.POP });
    return tl;
  }
  function noteOut() {
    if (dom.pnNote.hasAttribute('hidden')) return null;
    var tl = M.timeline({ willChange: dom.pnNoteT, willChangeValue: 'transform, opacity' });
    tl.to(dom.pnNoteT, { opacity: 0, y: 8, duration: M.dur(0.3), ease: M.IN });
    return tl;
  }
  function restoreNote() {
    dom.pnNote.setAttribute('hidden', '');
    M.set(dom.pnNoteT, { clearProps: 'opacity,transform,transformOrigin' });
  }

  /* ======================================================================
   * Page 1 -- the arc length, worked. A blank board, the figure made and
   * stood aside with the header open, the bird up to say what to do, and
   * four lines of working answered one value at a time.
   * ====================================================================== */

  /* Step 3: line 2 copied under itself, and the copy solved a term at a
     time -- the angle's fraction to ¼, the 22⁄7 × 7 cm to 22 cm, the
     2 × 22 cm to 44 cm -- each left standing a moment before the next. */
  function solve() {
    var k = dom.psKeys, line = dom.psLine3;
    return K.speak(said('p29Simplify', T('p29Simplify')))
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return lineCopy(line, dom.psLine2); })
      .then(function () { return Flow.wait(SOLVE_HOLD); })
      .then(function () { return collapse(line, [k.frac], k.quarter); })
      .then(function () { return Flow.wait(SOLVE_HOLD); })
      .then(function () { return collapse(line, [k.pi, k.x3, k.r], k.twentytwo); })
      .then(function () { return Flow.wait(SOLVE_HOLD); })
      .then(function () { return collapse(line, [k.two, k.x2, k.twentytwo], k.circ); })
      .then(function () { return Flow.wait(BEAT); });
  }

  function sceneSolve() {
    var S = solveSteps();
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the figure: the circle, its centre, the two radii, the quarter
         swept in with its arc, the right angle, "90°" and "7 cm" --------- */
      .then(function () {
        dom.pa.g.removeAttribute('hidden');
        return drawFigure(PA, dom.pa, [dom.pa.deg, dom.pa.len]);
      })

      /* ---- it stands aside. The header stays open: the bird is about to
         come up onto it, and it stays there for the whole page ------------ */
      .then(function () { return Flow.anim(Beats.slideArcs(dom.pa.g, SHIFT)); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the four steps, one line each ------------------------------- */
      .then(function () {
        dom.psPane.removeAttribute('hidden');
        return step(S[0], true);
      })
      .then(function () { return step(S[1], false); })
      .then(solve)
      .then(function () { return step(S[2], false); })

      /* ---- well done, and what the arc length is ----------------------- */
      .then(function () { return K.speak(said('p29WellDone', T('p29WellDone')), 'happy'); })
      .then(function () { return Flow.wait(READ); })
      .then(function () { return K.speak(said('p29Result', tie(T('p29Result'))), 'happy'); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- Next -- and only its PRESS sends the bird away, with its line,
         the working and the figure, all at once. The header is left open:
         the next page opens over a clean board, as every page of this
         skill does. ------------------------------------------------------ */
      .then(function () { return K.handOver(dom.nextBtn); })
      .then(function () {
        hinting++;
        if (global.I18n) global.I18n.stop();
        return Promise.all([
          K.mascotJumpOut(true),
          Flow.anim(Beats.lineOut(dom.promptLine)),
          Flow.anim(linesOut(dom.psAll)),
          Flow.anim(Beats.clearFigure([dom.pa.g]))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        restorePane(dom.psPane, dom.psAll);
        putAwayFigure(dom.pa);
      });
  }

  /* ======================================================================
   * Page 2 -- the arc length, asked. A blank board, the figure made and
   * stood aside with the header closed, and the bird up in the pane to
   * ask for the arc length. Three values, one by one.
   * ====================================================================== */

  /* The right length pressed: the arc swells once -- that is the length. */
  function showArc() {
    return Flow.anim(Beats.linePulse([dom.pb.arc], ARC_W));
  }

  function sceneChoose() {
    var lines = chooseLines();
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the figure: the circle, its centre, the two radii, the sector
         swept in with its arc, the angle, "120°" and "21 cm" ------------- */
      .then(function () {
        dom.pb.g.removeAttribute('hidden');
        return drawFigure(PB, dom.pb, [dom.pb.deg, dom.pb.len]);
      })

      /* ---- it stands aside, the header closing: no bird stands on it this
         page, it asks from the pane ---------------------------------------- */
      .then(function () {
        return Promise.all([
          Flow.anim(K.collapseHeader(true)),
          Flow.anim(Beats.slideArcs(dom.pb.g, SHIFT))
        ]);
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return C.ask({
          ask: lines.ask, options: lines.options, answer: lines.answer,
          wrong: lines.wrong, right: lines.right,
          reveal: showArc
        });
      })

      /* ---- Next -- and only its PRESS sends the bird away, with the box,
         the pills and the figure; the header opens again over a clean
         board (closeOut, circum.js). ----------------------------------- */
      .then(function () { return C.closeOut(dom.pb.g); });
  }

  /* ======================================================================
   * Page 3 -- the central angle, worked. A blank board, the figure made
   * and stood aside with the header open, the formula and the value of π
   * beside it, and the formula rewritten line by line -- two values chosen
   * from dropdowns, the equation solved for θ before the learner's eyes,
   * and θ chosen at the end.
   * ====================================================================== */

  /* Line 2 made out of line 1: the copy drops down, "s" becomes an empty
     box, and "2πr" becomes "2 × 22⁄7 ×" and another -- π's value, written
     in from the note under the figure, which is pulsed as it goes. */
  function substitute() {
    var k = dom.pnKeys2, line = dom.pnLine2;
    return lineCopy(line, dom.pnLine1)
      .then(function () { return Flow.wait(SOLVE_HOLD); })
      .then(function () { return collapse(line, [k.s0], [k.slotS]); })
      .then(function () { return Flow.wait(SOLVE_HOLD); })
      .then(function () {
        K.quiet(Flow.anim(notePulse()));
        return collapse(line, [k.c0], [k.two, k.x2, k.pi, k.x3, k.slotR]);
      })
      .then(function () { return Flow.wait(SHORT); });
  }

  /* Line 3: line 2 copied under itself, and the copy solved for θ a move
     at a time -- turned round so θ is on the left, the product gathered
     into 132 cm, both sides divided by it, the fraction simplified, and
     360° carried across -- each left standing a moment before the next. */
  function solveAngle() {
    var k = dom.pnKeys3, line = dom.pnLine3;
    return K.speak(said('p31Solve', T('p31Solve')))
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return lineCopy(line, dom.pnLine2); })
      .then(function () { return Flow.wait(SOLVE_HOLD); })
      /* turned round: θ's side to the left of "=", 22 cm to the right --
         and the cells still to come put where they will show */
      .then(function () {
        return reorder(line, k, ['th', 'x1', 'two', 'x2', 'pi', 'x3', 'r', 'circ',
                                 'thetaL', 'eq', 's', 'ratio', 'sixth', 'deg360', 'x4', 'sixthR']);
      })
      .then(function () { return Flow.wait(SOLVE_HOLD); })
      /* 2 × 22⁄7 × 21 cm is 132 cm */
      .then(function () { return collapse(line, [k.two, k.x2, k.pi, k.x3, k.r], [k.circ]); })
      .then(function () { return Flow.wait(SOLVE_HOLD); })
      /* both sides divided by 132 cm */
      .then(function () { return collapse(line, [k.x1, k.circ, k.s], [k.ratio]); })
      .then(function () { return Flow.wait(SOLVE_HOLD); })
      /* 22⁄132 is 1⁄6 */
      .then(function () { return collapse(line, [k.ratio], [k.sixth]); })
      .then(function () { return Flow.wait(SOLVE_HOLD); })
      /* and 360° carried across */
      .then(function () { return collapse(line, [k.th, k.sixth], [k.thetaL, k.deg360, k.x4, k.sixthR]); })
      .then(function () { return Flow.wait(BEAT); });
  }

  /* Line 4: line 3's last form copied under it, and "360° × 1⁄6" turned
     into the box θ is chosen into. */
  function askTheta() {
    var k = dom.pnKeys4, line = dom.pnLine4;
    return lineCopy(line, dom.pnLine3)
      .then(function () { return Flow.wait(SOLVE_HOLD); })
      .then(function () { return collapse(line, [k.deg360, k.x4, k.sixth], [k.slotTh]); })
      .then(function () { return Flow.wait(SHORT); });
  }

  function sceneAngle() {
    var S = angleSteps();
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the figure: the circle, its centre, the two radii, the sector
         swept in with its arc, the angle; then "22 cm" over the arc,
         "21 cm" beside a radius, and "θ = ?" in the sector, one by one -- */
      .then(function () {
        dom.pc.g.removeAttribute('hidden');
        return drawFigure(PC, dom.pc, [dom.pc.arcLen, dom.pc.len, dom.pc.deg]);
      })

      /* ---- it stands aside. The header stays open: the bird comes up
         onto it for the first dropdown and stays for the page ------------ */
      .then(function () { return Flow.anim(Beats.slideArcs(dom.pc.g, SHIFT)); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the formula, and the value of π under the figure ------------ */
      .then(function () {
        dom.pnPane.removeAttribute('hidden');
        return lineIn(dom.pnLine1);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(noteIn)
      .then(function () { return Flow.wait(BEAT); })

      /* ---- line 2: the copy, rewritten with two boxes; then the boxes,
         one dropdown at a time ------------------------------------------- */
      .then(substitute)
      .then(function () { return dropStep(S[0], true); })
      .then(function () { return dropStep(S[1], false); })

      /* ---- line 3: solved for θ; line 4: θ chosen --------------------- */
      .then(solveAngle)
      .then(askTheta)
      .then(function () { return dropStep(S[2], false); })

      /* ---- well done, and what the angle is ---------------------------- */
      .then(function () { return K.speak(said('p29WellDone', T('p29WellDone')), 'happy'); })
      .then(function () { return Flow.wait(READ); })
      .then(function () { return K.speak(said('p31Result', tie(T('p31Result'))), 'happy'); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- Next -- and only its PRESS sends the bird away, with its line,
         the working, the note and the figure, all at once. The header is
         left open. -------------------------------------------------------- */
      .then(function () { return K.handOver(dom.nextBtn); })
      .then(function () {
        hinting++;
        if (global.I18n) global.I18n.stop();
        return Promise.all([
          K.mascotJumpOut(true),
          Flow.anim(Beats.lineOut(dom.promptLine)),
          Flow.anim(linesOut(dom.pnAll)),
          Flow.anim(noteOut()),
          Flow.anim(Beats.clearFigure([dom.pc.g]))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        restorePane(dom.pnPane, dom.pnAll);
        restoreNote();
        putAwayFigure(dom.pc);
      });
  }

  /* ======================================================================
   * Page 4 -- the wiper: what the formula needs. A blank board, the
   * windshield made, and the bird up on the header telling the problem in
   * two sentences, each as the thing it names is drawn -- the blade with
   * its length, then the sweep with its angle; the remaining labels, and
   * the bird off the header as the figure stands aside; then the bird up
   * in the pane to ask what the formula needs, the blade and the angle
   * lit as it asks. Three pairs, one by one.
   * ====================================================================== */
  function sceneWiperNeeds() {
    var q = wiperNeedsLines(), g = dom.pw;
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the windshield: its edge drawn, its glass tinted in ---------- */
      .then(function () {
        g.g.removeAttribute('hidden');
        wrapBladeLabel();
        placeBlade(PW_START, true);
        return Flow.anim(Beats.growLine(g.glassEdge, GLASS_TIME, 'sine.inOut'));
      })
      .then(function () { return Flow.anim(glassIn()); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- "A wiper blade is 42 cm long.": the bird comes up onto the
         header, and as it says so the pivot goes on, the blade is grown
         out of it to its start, and its length lands beside it --------- */
      .then(function () {
        return Promise.all([
          K.arriveSaying(said('p32Blade1', T('p32Blade1'))),
          Flow.wait(JUMP)
            .then(function () { return Flow.anim(Beats.plotDot(g.centre)); })
            .then(function () { return Flow.wait(SHORT); })
            .then(function () { return Flow.anim(Beats.growLine(g.radA, RADIUS_TIME, 'sine.inOut')); })
            .then(function () { return Flow.wait(SHORT); })
            .then(function () {
              K.quiet(Flow.anim(Beats.linePulse([g.radA], LINE_W)));
              return Flow.anim(Beats.labelIn(g.len));
            })
        ]);
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(BEAT);
      })

      /* ---- "And sweeps through 60°.": as it is said, the blade across,
         the glass it wipes tinted behind it and its tip tracing the arc;
         then the angle at the pivot and its measure --------------------- */
      .then(function () {
        return Promise.all([
          K.speak(said('p32Blade2', T('p32Blade2'))),
          Flow.wait(LEAD)
            .then(function () {
              M.set([g.sector, g.arc], { opacity: 1 });
              return Flow.anim(sweep(PW_START, PW.a, SWEEP_TIME, 'sine.inOut', true));
            })
            .then(function () { return Flow.wait(SHORT); })
            .then(function () { return Flow.anim(Beats.growLine(g.angle, ANGLE_TIME, 'power2.inOut')); })
            .then(function () { return Flow.anim(Beats.labelIn(g.deg)); })
        ]);
      })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the tip's note over the arc ----------------------------------- */
      .then(function () {
        K.quiet(Flow.anim(Beats.linePulse([g.arc], ARC_W)));
        return Flow.anim(Beats.labelIn(g.arcLen));
      })
      .then(function () { return Flow.wait(BEAT * 2); })

      /* ---- the bird springs off the header with its line -- the header
         closes behind it -- as the figure slides left; it comes up again
         in the pane to ask ------------------------------------------------ */
      .then(function () {
        return Promise.all([
          K.mascotJumpOut(),
          Flow.anim(Beats.lineOut(dom.promptLine)),
          Flow.anim(Beats.slideArcs(g.g, SHIFT))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        return Flow.wait(SHORT);
      })
      .then(function () {
        dom.cfPane.classList.add('is-long');
        return C.ask({
          ask: q.ask, options: q.options, answer: q.answer,
          wrong: q.wrong, right: q.right,
          /* what the question is about: the blade, then the angle */
          onAsk: function () {
            return spotlight(g, 'radius').then(function () { return spotlight(g, 'angle'); });
          },
          /* and each named in the verdict, lit as it is named */
          onRight: function (i) {
            if (i === 1) K.quiet(spotlight(g, 'radius'));
            if (i === 2) K.quiet(spotlight(g, 'angle'));
          }
        });
      })

      /* ---- Next -- and only its PRESS takes the question away: the box
         shuts and the pills go, and the figure and the bird STAY. The page
         after asks about this sweep from the same spot. ------------------ */
      .then(function () { return K.handOver(dom.nextBtn); })
      .then(function () { return C.clearAsk(); });
  }

  /* ======================================================================
   * Page 5 -- the wiper: the arc length. The board as page 4 left it, and
   * one more question from the same spot: the blade sweeps across again
   * as it is asked, with the arc lit. Three lengths, one by one; the right
   * one is worked in the box.
   * ====================================================================== */
  function sceneWiperArc() {
    var q = wiperArcLines(), g = dom.pw;
    return Flow.wait(BEAT)
      .then(function () {
        return C.ask({
          ask: q.ask, options: q.options, answer: q.answer,
          wrong: q.wrong, right: q.right,
          onAsk: resweep,
          reveal: function () { return spotlight(g, 'arc'); }
        });
      })
      /* Next pressed: the bird goes with the box, the pills and the
         figure, and the header opens again over a clean board. */
      .then(function () { return C.closeOut(g.g); });
  }

  /* ======================================================================
   * Page 6 -- the clock: the turn. A blank board, the clock face made,
   * and the bird up on the header telling the problem in two sentences,
   * each as the thing it names is drawn -- the hand with its length, then
   * the 45 minutes it turns through, the label riding with it; then the
   * bird off the header as the figure stands aside, and up in the pane
   * to ask how many degrees
   * that is, the hand turning again with the angle drawn as it asks.
   * Three measures, one by one.
   * ====================================================================== */
  function sceneClockTurn() {
    var q = clockTurnLines(), g = dom.ck;
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the face: the rim, the twelve ticks, the dot at the centre -- */
      .then(function () {
        g.g.removeAttribute('hidden');
        placeHand(0, true, true);
        return Flow.anim(Beats.drawRim(g.rim, g.tip));
      })
      .then(function () { return Flow.anim(ticksIn()); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(g.centre)); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- "The minute hand is 14 cm long.": the bird comes up onto the
         header, and as it says so the hand is grown out of the centre to
         twelve and its length lands beside it ---------------------------- */
      .then(function () {
        return Promise.all([
          K.arriveSaying(said('p34Hand1', T('p34Hand1'))),
          Flow.wait(JUMP)
            .then(function () {
              /* the hand is a group, faded as one: shown now, with its tip
                 held back until the line has reached the rim */
              M.set(g.handTip, { opacity: 0 });
              M.set(g.hand, { opacity: 1 });
              return Flow.anim(Beats.growLine(g.handLine, RADIUS_TIME, 'sine.inOut'));
            })
            .then(function () { return Flow.anim(Beats.plotDot(g.handTip, 0.4)); })
            .then(function () { return Flow.wait(SHORT); })
            .then(function () {
              M.set(g.len, { x: CK_LEN_RIDE.x, y: CK_LEN_RIDE.y });
              K.quiet(Flow.anim(Beats.linePulse([g.handLine], LINE_W)));
              return Flow.anim(Beats.labelIn(g.len));
            })
        ]);
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(BEAT);
      })

      /* ---- "The tip travels for 45 minutes.": as it is said, the hand
         turns three-quarters round -- its start left dashed behind it, the
         rim it passes made bold, its label riding with it -- and "?" lands
         by the arc ----------------------------------------------------------- */
      .then(function () {
        return Promise.all([
          K.speak(said('p34Hand2', T('p34Hand2'))),
          Flow.wait(LEAD)
            .then(function () {
              M.set([g.start, g.arc], { opacity: 1 });
              return Flow.anim(turnHand(0, CK.turn, CK_TURN_TIME, 'sine.inOut', true, false, g.len));
            })
            .then(function () { return Flow.wait(SHORT); })
            .then(function () {
              K.quiet(Flow.anim(Beats.linePulse([g.arc], CK_ARC_W)));
              return Flow.anim(Beats.labelIn(g.q));
            })
        ]);
      })
      .then(function () { return Flow.wait(BEAT * 2); })

      /* ---- the bird springs off the header with its line -- the header
         closes behind it -- as the figure slides left; it comes up again
         in the pane to ask ------------------------------------------------ */
      .then(function () {
        return Promise.all([
          K.mascotJumpOut(),
          Flow.anim(Beats.lineOut(dom.promptLine)),
          Flow.anim(Beats.slideArcs(g.g, SHIFT))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        return Flow.wait(SHORT);
      })
      .then(function () {
        return C.ask({
          ask: q.ask, options: q.options, answer: q.answer,
          wrong: q.wrong, right: q.right,
          onAsk: reTurnWithAngle,
          reveal: showClockAngle
        });
      })

      /* ---- Next -- and only its PRESS takes the question away: the box
         shuts and the pills go, and the figure and the bird STAY. ------- */
      .then(function () { return K.handOver(dom.nextBtn); })
      .then(function () { return C.clearAsk(); });
  }

  /* ======================================================================
   * Page 7 -- the clock: the distance. The board as page 6 left it, and
   * one more question from the same spot: the hand turns round again as
   * it is asked, with the arc lit. Three lengths, one by one; the right
   * one is worked in the box and takes the "?"'s place on the figure.
   * ====================================================================== */
  function sceneClockArc() {
    var q = clockArcLines(), g = dom.ck;
    return Flow.wait(BEAT)
      .then(function () {
        return C.ask({
          ask: q.ask, options: q.options, answer: q.answer,
          wrong: q.wrong, right: q.right,
          onAsk: reTurnWithArc,
          reveal: showClockAnswer
        });
      })
      .then(function () { return C.closeOut(g.g); });
  }

  /* ======================================================================
   * The hooks the board's housekeeping calls -- see addSection in pages.js
   * ====================================================================== */

  /* What this section has on the figure: one group per page, each faded
     as a whole. */
  function parts() { return [dom.pa.g, dom.pb.g, dom.pc.g, dom.pw.g, dom.ck.g]; }

  /* What this section keeps outside the figure: the working and the
     note, if a wipe catches them up. The pane page 2 asks from is
     circum.js's, and its own hooks put it away. */
  function wipe() {
    var out = [];
    if (!dom.psPane.hasAttribute('hidden')) {
      out.push(Flow.anim(linesOut(dom.psAll)).then(function () {
        restorePane(dom.psPane, dom.psAll);
      }));
    }
    if (!dom.pnPane.hasAttribute('hidden')) {
      out.push(Flow.anim(linesOut(dom.pnAll)).then(function () {
        restorePane(dom.pnPane, dom.pnAll);
      }));
    }
    if (!dom.pnNote.hasAttribute('hidden')) out.push(Flow.anim(noteOut()).then(restoreNote));
    return out;
  }

  /* Back to rest, with no animation. The inline writes inside the figure
     are pages.js's to clear -- resetFigure does it for every descendant of
     the picture right after this -- so this is about attributes, classes
     and the words. */
  function reset() {
    dom.pa.g.setAttribute('hidden', '');
    dom.pb.g.setAttribute('hidden', '');
    dom.pc.g.setAttribute('hidden', '');
    dom.pw.g.setAttribute('hidden', '');
    placeBlade(PW_START, true);
    dom.ck.g.setAttribute('hidden', '');
    placeHand(0, true, true);
    restoreAll();
    if (global.I18n) global.I18n.stop();
  }

  /* The board as the i-th scene expects to FIND it, written straight in.
     Five of the seven open on a wiped board -- each one's first beat is
     the wipe -- so there is nothing to stage. The wiper's and the clock's
     second pages open on their first pages' boards: the figure finished
     and stood aside, the header closed, the pane open and the bird
     standing in it. */
  function stage(i) {
    if (i === 4) {
      var w = dom.pw;
      dom.board.classList.add('is-headless');
      w.g.removeAttribute('hidden');
      wrapBladeLabel();
      placeBlade(PW.a, true);
      M.set([w.glassEdge, w.glass, w.centre, w.radA, w.blade, w.sector, w.arc,
             w.angle, w.deg, w.len, w.arcLen], { opacity: 1 });
      M.set(w.g, { x: SHIFT });
      C.seatBird();
    }
    /* the clock's second page opens on its first page's board: the hand
       turned, the arc traced, the angle drawn and measured */
    if (i === 6) {
      var c = dom.ck;
      dom.board.classList.add('is-headless');
      c.g.removeAttribute('hidden');
      placeHand(CK.turn, true, true);
      M.set([c.rim, c.centre, c.start, c.hand, c.arc, c.angle, c.len, c.q, c.deg]
              .concat(c.ticks), { opacity: 1 });
      M.set(c.g, { x: SHIFT });
      C.seatBird();
    }
  }

  Pages.addSection({
    name: 'Arc length practice',
    scenes: [
      { name: 'Find the arc length',    play: sceneSolve  },
      { name: 'Choose the arc length',  play: sceneChoose },
      { name: 'Find the central angle', play: sceneAngle  },
      { name: 'Wiper: what is needed',  play: sceneWiperNeeds },
      { name: 'Wiper: arc length',      play: sceneWiperArc },
      { name: 'Clock: the turn',        play: sceneClockTurn },
      { name: 'Clock: the distance',    play: sceneClockArc }
    ],
    build: build,
    parts: parts,
    wipe: wipe,
    reset: reset,
    stage: stage
  });
})(window);
