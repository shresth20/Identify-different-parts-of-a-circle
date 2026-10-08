/* ==========================================================================
 * segarea.js -- Skill 4: area of a segment of a circle
 * --------------------------------------------------------------------------
 * The fourth skill of the app, on the same board, with the same bird and
 * the same clock as the others: registered with pages.js as a section (see
 * addSection there), built from the kit pages.js hands over, the beats in
 * animations.js and the question-and-verdict ask circum.js hands over on
 * window.Circum. Nothing here waits on anything except through Flow, so
 * Skip, Replay and the level bar work on these scenes exactly as they do
 * on every other. To split the skill out later, this file, css/segarea.css
 * and the two groups in index.html (#sa and #sb) are the whole of it.
 *
 * Section 1 -- the segment, and the sector's area. Two pages:
 *
 *   Page 1 -- tap the segment. The board opens blank with its header
 *   closed. Three cards stand up in a row, one after the other, and a
 *   circle is drawn on each where it stands: the same chord and the same
 *   two radii on all three, but a different region shaded -- the minor
 *   sector (two radii and the arc), the triangle (two radii and the
 *   chord) and the minor segment (the chord and the arc, with the radii
 *   and the centre faded back to say they are not part of it). The bird
 *   comes up onto the header and asks for the SEGMENT. A wrong card is
 *   refused -- it shakes its head in red, its name appears under its
 *   circle, and the bird says what it is and what to look for -- and the
 *   learner tries again among the cards that are left. The right card
 *   turns green, takes a tick, and every card is named; the bird says why,
 *   and Next arrives.
 *
 *   Page 2 -- the area of a sector. The board opens blank. A circle is
 *   drawn and coloured; the centre dot goes on; the two radii grow out of
 *   it one after the other; the angle between them is drawn with its "θ";
 *   and the sector between them is swept in with its piece of the rim lit.
 *   The figure slides to the left half, the bird comes up in the right
 *   pane and asks, from bubble-02, for the area of a sector. Three
 *   formulas, one by one; a wrong press is refused with why, and the
 *   right one lights the sector once more while the box turns green.
 *
 *   Page 3 -- make a segment. The board opens blank. A circle is drawn
 *   and coloured and its centre dot goes on; the bird comes up to ask for
 *   two points on the circle (skill 2's own two-point pick, arcs.js). The
 *   chord joins them; then, word by word with the bird's three lines, the
 *   two radii grow out to the points with the angle and its "θ", the three
 *   lines are swelled as they are named, and the region between the chord
 *   and the arc is coloured in and its arc lit as it is called a segment.
 *   Then the picture turns so one radius lies at 0°, the other point
 *   takes a handle, the reading "θ = …°" stands beside the circle, and
 *   the board is the learner's: the point is dragged round the rim and
 *   the chord, the arc, the segment and the angle follow it. Two seconds
 *   after it is let go, Next.
 *
 *   Page 4 -- two segments. The board opens blank. A circle is drawn and
 *   coloured, two points go on its rim, and the bird comes up: "One
 *   chord, two segments." -- the chord grows as it is named, and the two
 *   regions it makes are coloured in from it, each with its own piece of
 *   the rim lit, and named. "Together they make the whole circle." -- the
 *   two are drawn a little apart and settle back into one disc. Next.
 *
 *   Page 5 -- sector minus triangle. One circle, built up a sentence at
 *   a time with every mark landing on the word that names it: the circle
 *   and its centre, two points, a radius to each, the sector between them
 *   coloured in with its arc lit; the chord, and the triangle the radii
 *   and chord make coloured in over the sector; then the triangle is
 *   taken away -- it slides out of the circle and the sector's colour
 *   draws back to the chord -- and what is left is the minor segment.
 *
 *   Page 6 -- the summary. Three small circles in a row, "−" and "=" between
 *   them -- the sector, the triangle, the segment -- each built where it
 *   stands and named; then the bird comes up: "The segment is what the
 *   triangle leaves behind.", and then the same as areas: "Area of the
 *   sector − Area of the triangle = Area of a minor segment." Next.
 *
 *   Page 7 -- the triangle's area at 90°. The board opens blank. A circle
 *   is drawn and coloured, the centre dot goes on, and the figure is built
 *   a mark at a time: one radius with its "r", the other with its "r", the
 *   right-angle mark with "90°", the chord, and the triangle coloured in
 *   between them. The figure slides to the left half, the bird comes up
 *   in the right pane and asks, from bubble-02, for the triangle's area.
 *   Three answers, one by one; a wrong press is refused with why, and the
 *   right one lights the triangle's two legs while the box turns green.
 *
 *   Page 8 -- the segment, worked. The same figure with r = 14 cm, built
 *   the same way, with its arc and its segment coloured in; it stands
 *   aside with the header open, and the bird comes up to work the area in
 *   three lines of working on the right: the sector, the triangle, the
 *   segment -- each line rising in with an empty box that drops open as a
 *   menu of three values, a wrong value refused from the header with why,
 *   the right one landing in the line. Then the check: the segment must
 *   be smaller than the sector it was cut from.
 *
 *   Page 9 -- the segment, asked. The same figure with r = 7 cm; it stands
 *   aside with the header closed and the bird asks from the pane for the
 *   area of the minor segment. Three values, one by one; a wrong press is
 *   refused with what it really is, and the right one lights the segment
 *   while the box turns green and the working is said in a sentence.
 *
 *   Page 10 -- the segment from its parts. The same figure; the bird asks
 *   from the pane for the segment given the sector and the triangle.
 *
 *   Page 11 -- the major segment. One circle, two points and the chord;
 *   then, word by word with the bird's two lines, the bigger piece is
 *   coloured in from the chord with its arc lit, drawn back to the major
 *   sector as the radii grow, and the triangle slides in from outside and
 *   is put back on.
 *
 *   Page 12 -- its recap: three small circles, "+" and "=" between them --
 *   the major sector, the triangle, the major segment -- and the bird's
 *   two lines: the sum, and the shortcut, πr² less the minor segment.
 *
 *   Pages 13 and 14 -- the major segment, worked and asked, as pages 8 and
 *   9 are: three lines of working with dropdowns, then the question from
 *   the pane with r = 7 cm.
 *
 *   Pages 15 and 16 -- two stories. A pipe on its side with water in it,
 *   and a round flower bed cut by a path: the bird tells each from the
 *   header, the figure drawn as the words name its parts, then springs
 *   to the pane to ask -- the water's cross-section, the bed's smaller
 *   piece. Three values each; a wrong press is refused with why.
 *
 * Every word is read by key (T('key'), js/i18n.js) from
 * locales/locales.json, and each line is voiced by the same key once a
 * recording is there.
 *
 * Load order: js/pages.js -> js/arcs.js -> ... -> js/circum.js -> ... -> js/segarea.js
 * ========================================================================== */
(function (global) {
  'use strict';

  var M = global.Motion;
  var Flow = global.Flow;
  var Beats = global.Beats;
  var Pages = global.Pages;
  var C = global.Circum;
  var A = global.Arcs;
  if (!Pages || !Pages.addSection || !C || !C.ask || !A || !A.pickPoints) {
    console.error('segarea.js: load js/pages.js, js/arcs.js and js/circum.js before js/segarea.js.');
    return;
  }
  var K = Pages.kit;

  /* ---- the script -------------------------------------------------------
     Read by key at the moment a scene starts (the locale is in by then --
     see start() in script.js), each line carrying its key so it can be
     voiced. A sentence long enough to wrap keeps its last two words
     together, so its last row is never one stray word. */
  function T(key, repl) { return global.T ? global.T(key, repl) : key; }
  function said(key, text) { return { text: text, vo: key }; }
  var NB = ' ';
  function tie(s) { return s.replace(/ (\S+)$/, NB + '$1'); }

  /* Page 1's: the question, the three names, and what the bird says for a
     wrong card -- what it IS, then what to look for -- and for the right
     one. */
  function segmentLines() {
    return {
      ask:   said('s4p1Ask', tie(T('s4p1Ask'))),
      names: { sector: 's4p1Sector', triangle: 's4p1Triangle', segment: 's4p1Segment' },
      wrong: {
        sector:   [said('s4p1WrongSector',   T('s4p1WrongSector')),
                   said('s4p1Look', tie(T('s4p1Look')))],
        triangle: [said('s4p1WrongTriangle', T('s4p1WrongTriangle')),
                   said('s4p1Look', tie(T('s4p1Look')))]
      },
      right: [said('fbCorrect', T('fbCorrect')), said('s4p1Right', tie(T('s4p1Right')))]
    };
  }

  /* Page 2's. The fractions are spelled with U+2044 in the locale and
     stood up by mathtext.js on the pills and in the box alike. Each wrong
     formula is refused with what it really is. */
  function areaLines() {
    var half = T('s4p2Opt180'), right = T('s4p2Opt360'), arc = T('s4p2OptArc');
    var wrong = {};
    wrong[half] = [said('fbNotQuite', T('fbNotQuite')), said('s4p2Wrong180', tie(T('s4p2Wrong180')))];
    wrong[arc]  = [said('fbNotQuite', T('fbNotQuite')), said('s4p2WrongArc', tie(T('s4p2WrongArc')))];
    return {
      ask:     said('s4p2Ask', tie(T('s4p2Ask'))),
      options: [half, right, arc],
      answer:  right,
      wrong:   wrong,
      right:   [said('fbCorrect', T('fbCorrect')), said('s4p2Right', tie(T('s4p2Right')))]
    };
  }

  /* Page 3's: the pick, the three lines the picture is finished to, and
     the one that hands the board over. */
  function chordLines() {
    return {
      pick:    said('s4p3Pick',    T('s4p3Pick')),
      join:    said('s4p3Join',    tie(T('s4p3Join'))),
      three:   said('s4p3Three',   T('s4p3Three')),
      segment: said('s4p3Segment', tie(T('s4p3Segment'))),
      explore: said('s4p3Explore', tie(T('s4p3Explore')))
    };
  }
  /* Page 5's: eight sentences, one per step. */
  function stepLines() {
    return {
      start:    said('s4p5Start',    tie(T('s4p5Start'))),
      points:   said('s4p5Points',   tie(T('s4p5Points'))),
      radii:    said('s4p5Radii',    tie(T('s4p5Radii'))),
      sector:   said('s4p5Sector',   tie(T('s4p5Sector'))),
      chord:    said('s4p5Chord',    tie(T('s4p5Chord'))),
      triangle: said('s4p5Triangle', tie(T('s4p5Triangle'))),
      remove:   said('s4p5Remove',   tie(T('s4p5Remove'))),
      left:     said('s4p5Left',     tie(T('s4p5Left')))
    };
  }
  /* Page 6's two: the idea in words, then as areas. */
  function summaryLines() {
    return {
      idea:    said('s4p6Summary', tie(T('s4p6Summary'))),
      formula: said('s4p6Formula', tie(T('s4p6Formula')))
    };
  }

  /* Page 7's. Each wrong answer is refused with the fact that makes it
     wrong; a formula keeps its spaces unbreakable so it never splits
     across the box's rows. */
  function whole(t) { return t.replace(/ /g, NB); }
  /* every product in a sentence held together: "½ × base × height" */
  function glue(t) { return t.replace(/ × /g, NB + '×' + NB); }
  function rightLines() {
    var half = T('s4p7OptHalfRR'), one = T('s4p7OptHalfR'), square = T('s4p7OptRR');
    var wrong = {};
    wrong[one]    = [said('fbNotQuite', T('fbNotQuite')),
                     said('s4p7WrongHalfR', tie(glue(T('s4p7WrongHalfR', { f: whole(one) }))))];
    wrong[square] = [said('fbNotQuite', T('fbNotQuite')),
                     said('s4p7WrongRR', tie(glue(T('s4p7WrongRR', { f: whole(square) }))))];
    return {
      ask:     said('s4p7Ask', tie(T('s4p7Ask'))),
      options: [half, one, square],
      answer:  half,
      wrong:   wrong,
      right:   [said('fbCorrect', T('fbCorrect')),
                said('s4p7Right', tie(glue(T('s4p7Right', { f: whole(half) }))))]
    };
  }

  /* Page 8's three steps. Each: the line and the box in it, what the bird
     says, the three values, the right one, why each wrong one is wrong,
     and the mark on the figure to light for it. */
  function hint(key) { return [said('fbNotQuite', T('fbNotQuite')), said(key, tie(T(key)))]; }
  /* what a step lights on its figure when a wrong value is pressed */
  function lightSeg(which) { return function () { return spotlight(which); }; }
  function lightMajor(which) { return function () { return spotlightOn(majorMarks(which)); }; }
  function workedSteps() {
    var v154 = T('val154sq'), v616 = T('val616sq'), v77 = T('val77sq');
    var v98 = T('val98sq'), v196 = T('val196sq'), v49 = T('val49sq');
    var v56 = T('val56sq'), v252 = T('val252sq'), v46 = T('val46sq');
    var w1 = {}; w1[v616] = hint('s4p8Wrong616'); w1[v77]  = hint('s4p8Wrong77');
    var w2 = {}; w2[v196] = hint('s4p8Wrong196'); w2[v49]  = hint('s4p8Wrong49');
    var w3 = {}; w3[v252] = hint('s4p8Wrong252'); w3[v46]  = hint('s4p8Wrong46');
    return [
      { line: dom.swLine1, slot: dom.swSlot1, menu: dom.swMenu1, light: lightSeg('sector'),
        ask: said('s4p8AskSector', T('s4p8AskSector')),
        options: [v154, v616, v77], answer: v154, wrong: w1 },
      { line: dom.swLine2, slot: dom.swSlot2, menu: dom.swMenu2, light: lightSeg('triangle'),
        ask: said('s4p8AskTriangle', T('s4p8AskTriangle')),
        options: [v98, v196, v49], answer: v98, wrong: w2 },
      { line: dom.swLine3, slot: dom.swSlot3, menu: dom.swMenu3, light: lightSeg('segment'),
        ask: said('s4p8AskSegment', T('s4p8AskSegment')),
        options: [v56, v252, v46], answer: v56, wrong: w3 }
    ];
  }
  function workedClose() {
    return {
      done:  said('p29WellDone', T('p29WellDone')),
      check: said('s4p8Check', tie(T('s4p8Check')))
    };
  }

  /* Page 9's. Each wrong value is refused with what it really is. */
  function askedLines() {
    var right = T('val14sq'), sector = T('val38sq'), tri = T('val24sq');
    var wrong = {};
    wrong[sector] = [said('fbNotQuite', T('fbNotQuite')), said('s4p9Wrong38', tie(T('s4p9Wrong38')))];
    wrong[tri]    = [said('fbNotQuite', T('fbNotQuite')), said('s4p9Wrong24', tie(T('s4p9Wrong24')))];
    return {
      ask:     said('s4p9Ask', tie(T('s4p9Ask'))),
      options: [right, sector, tri],
      answer:  right,
      wrong:   wrong,
      right:   [said('fbCorrect', T('fbCorrect')), said('s4p9Right', tie(T('s4p9Right')))]
    };
  }

  /* Page 10's: the segment from its two parts. */
  function partsLines() {
    var right = T('val56sq'), add = T('val252sq'), off = T('val58sq');
    var wrong = {};
    wrong[add] = [said('fbNotQuite', T('fbNotQuite')), said('s4p8Wrong252', tie(T('s4p8Wrong252')))];
    wrong[off] = [said('fbNotQuite', T('fbNotQuite')), said('s4p10Wrong58', tie(T('s4p10Wrong58')))];
    return {
      ask:     said('s4p10Ask', tie(T('s4p10Ask'))),
      options: [right, add, off],
      answer:  right,
      wrong:   wrong,
      right:   [said('fbCorrect', T('fbCorrect')), said('s4p10Right', tie(T('s4p10Right')))]
    };
  }

  /* Page 11's two, and page 12's two. */
  function majorLines() {
    return {
      big:  said('s4p11Big',  tie(T('s4p11Big'))),
      back: said('s4p11Back', tie(T('s4p11Back')))
    };
  }
  function majorSumLines() {
    return {
      sum: said('s4p12Sum1', tie(T('s4p12Sum1'))),
      or:  said('s4p12Sum2', tie(T('s4p12Sum2')))
    };
  }

  /* Page 13's three steps, and its close. */
  function majorSteps() {
    var v462 = T('val462sq'), v154 = T('val154sq'), v616 = T('val616sq');
    var v98 = T('val98sq'), v196 = T('val196sq'), v49 = T('val49sq');
    var v560 = T('val560sq'), v364 = T('val364sq');
    var w1 = {}; w1[v154] = hint('s4p13Wrong154'); w1[v616] = hint('s4p13Wrong616');
    var w2 = {}; w2[v196] = hint('s4p8Wrong196');  w2[v49]  = hint('s4p8Wrong49');
    var w3 = {}; w3[v364] = hint('s4p13Wrong364'); w3[v462] = hint('s4p13Wrong462');
    return [
      { line: dom.sxLine1, slot: dom.sxSlot1, menu: dom.sxMenu1, light: lightMajor('msector'),
        ask: said('s4p13AskSector', T('s4p13AskSector')),
        options: [v462, v154, v616], answer: v462, wrong: w1 },
      { line: dom.sxLine2, slot: dom.sxSlot2, menu: dom.sxMenu2, light: lightMajor('triangle'),
        ask: said('s4p8AskTriangle', T('s4p8AskTriangle')),
        options: [v98, v196, v49], answer: v98, wrong: w2 },
      { line: dom.sxLine3, slot: dom.sxSlot3, menu: dom.sxMenu3, light: lightMajor('msegment'),
        ask: said('s4p13AskSegment', T('s4p13AskSegment')),
        options: [v560, v364, v462], answer: v560, wrong: w3 }
    ];
  }
  function majorClose() {
    return {
      done:  said('p29WellDone', T('p29WellDone')),
      check: said('s4p13Check', tie(T('s4p13Check')))
    };
  }

  /* Page 14's. Each wrong value is refused with what it really is. */
  function majorAskedLines() {
    var right = T('val140sq'), small = T('val14sq'), whole = T('val154sq');
    var wrong = {};
    wrong[small] = [said('fbNotQuite', T('fbNotQuite')), said('s4p14Wrong14',  tie(T('s4p14Wrong14')))];
    wrong[whole] = [said('fbNotQuite', T('fbNotQuite')), said('s4p14Wrong154', tie(T('s4p14Wrong154')))];
    return {
      ask:     said('s4p14Ask', tie(T('s4p14Ask'))),
      options: [right, small, whole],
      answer:  right,
      wrong:   wrong,
      right:   [said('fbCorrect', T('fbCorrect')), said('s4p14Right', tie(T('s4p14Right')))]
    };
  }

  /* Page 15's: the pipe. */
  function pipeLines() {
    var right = T('val56sq'), v156 = T('val156sq'), v256 = T('val256sq');
    var wrong = {};
    wrong[v156] = [said('fbNotQuite', T('fbNotQuite')), said('s4p15Wrong156', tie(T('s4p15Wrong156')))];
    wrong[v256] = [said('fbNotQuite', T('fbNotQuite')), said('s4p15Wrong256', tie(T('s4p15Wrong256')))];
    return {
      pipe:     said('s4p15Pipe',     tie(T('s4p15Pipe'))),
      subtends: said('s4p15Subtends', tie(T('s4p15Subtends'))),
      ask:      said('s4p15Ask', tie(T('s4p15Ask'))),
      options:  [right, v156, v256],
      answer:   right,
      wrong:    wrong,
      right:    [said('fbCorrect', T('fbCorrect')), said('s4p15Right', tie(T('s4p15Right')))]
    };
  }
  /* Page 16's: the flower bed. */
  function bedLines() {
    var right = T('val126m'), v252 = T('val252m'), v58 = T('val58m');
    var wrong = {};
    wrong[v252] = [said('fbNotQuite', T('fbNotQuite')), said('s4p16Wrong252', tie(T('s4p16Wrong252')))];
    wrong[v58]  = [said('fbNotQuite', T('fbNotQuite')), said('s4p16Wrong58',  tie(T('s4p16Wrong58')))];
    return {
      bed:      said('s4p16Bed',      tie(T('s4p16Bed'))),
      subtends: said('s4p16Subtends', tie(T('s4p16Subtends'))),
      ask:      said('s4p16Ask', tie(T('s4p16Ask'))),
      options:  [right, v252, v58],
      answer:   right,
      wrong:    wrong,
      right:    [said('fbCorrect', T('fbCorrect')), said('s4p16Right', tie(T('s4p16Right')))]
    };
  }

  /* Page 4's two. */
  function twoLines() {
    return {
      one:      said('s4p4One',      T('s4p4One')),
      together: said('s4p4Together', tie(T('s4p4Together')))
    };
  }

  var BEAT = K.BEAT, SHORT = K.SHORT;
  var CX = K.CX, CY = K.CY, RR = K.RR;
  var round2 = K.round2, el = K.el;
  var SHIFT = -250;        /* the figure's slide to the left half -- the same
                              stand-aside every section uses, picture units */
  var READ = 900;          /* ms a verdict's sentence stands, once typed,
                              before the next one takes the header        */
  var LABEL_DY = 9;        /* a label's baseline, below the point it is centred on */

  /* ---- page 1: the three cards --------------------------------------------
     A row across the picture, each card a little taller than it is wide,
     its circle in the upper part and room for a name under it. One cut for
     all three circles -- the chord's two points, degrees anticlockwise from
     three o'clock as every angle in the app is -- so the three regions are
     plainly three readings of ONE picture. */
  var CARD_W = 270, CARD_H = 320, CARD_RX = 28, CARD_Y = 50;
  var CARD_X = [195, 500, 805];             /* where the three stand        */
  var CARD_R = 92, CARD_CY = 182;           /* the circle in a card         */
  var LABEL_Y = 338;                        /* the name's baseline          */
  var BADGE_R = 22;                         /* the tick on the right card   */
  var CUT = { a: 35, span: 110 };           /* the chord, above the centre  */
  var CARD_RIM = 1.0;                       /* s: the pen, quicker than the
                                               lesson's -- three in a row   */
  var LINE_TIME = 0.6;                      /* s: a radius or the chord     */
  var FILL_TIME = 0.8;                      /* s: a region swept in         */
  var GHOST = 0.28;                         /* the faded marks' opacity     */
  var KINDS = ['sector', 'triangle', 'segment'];
  var ANSWER = 'segment';

  /* ---- page 2: the sector -------------------------------------------------
     The lesson's own circle; the sector in its upper right, as the
     storyboard draws it. The angle is marked at the centre as skill 2
     marks its angles, and "θ" sits on the angle's middle line. */
  var SB = { a: 20, span: 95 };
  var ANGLE_R = 42, THETA_R = 70;
  var DOT_TIME = 0.5;                       /* s: the centre dot            */
  var RADIUS_TIME = 0.8;                    /* s: a radius out to the rim   */
  var ANGLE_TIME = 0.6;                     /* s: the angle, round          */
  var SWEEP_TIME = 1.0;                     /* s: the sector swept in       */
  var ARC_W = 7;                            /* --sa-arc-weight (segarea.css) */

  /* ---- speaking to the picture ---------------------------------------------
     The typer reveals a line a word at a time at a steady pace, so the
     moment any word of it starts is known in advance: a beat on the board
     can be started on its word (see sayWith). The line before it blurs
     out first (Beats.lineOut) and a bird that has a jump to make lands
     before it speaks; both are allowed for. */
  var TYPE_MS = global.Typer ? global.Typer.TYPE_MS : 72;
  var LINE_OUT = 280;                       /* ms: the old line, blurring out */
  var JUMP = 900;                           /* ms: the bird, up onto the header */

  /* ---- page 3: the chord and the segment ----------------------------------
     The learner's two points are kept as skill 2 keeps them: `a` is one
     point, and the minor arc runs from it anticlockwise for `span` degrees
     to the other; `origin` is the point placed LAST, which is the end the
     chord is drawn from. The pick is held to a stretch where the smaller
     piece is plainly a segment and not a sliver. */
  var SC_MIN = 60, SC_MAX = 150;
  var SC_DEFAULT = { a: 35, span: 110, origin: 'b' };   /* what a skip puts down */
  var cut = { a: SC_DEFAULT.a, span: SC_DEFAULT.span, origin: SC_DEFAULT.origin };
  var CHORD_TIME = 0.8;                     /* s: the chord, point to point   */
  var TURN_TIME = 0.9;                      /* s: the picture turned to 0°    */
  /* The exploring: one point fixed at 0°, the other carried round by its
     handle -- as far as the whole way round, short of the fixed point,
     so the segment is seen to grow past the semicircle into the larger
     piece -- and the reading beside the circle. */
  var SPAN_MIN = 10, SPAN_MAX = 350;
  var SC_SKIP_TO = 120;                     /* where a skip carries the handle */
  var SC_STEP = 5;                          /* degrees an arrow key turns it   */
  var SC_MOVED = 3;                         /* degrees that count as having moved it */
  var SC_SETTLE = 2000;                     /* ms after it is let go before Next */
  var SC_NUDGE_AFTER = 2500;                /* ms untouched before the hand shows the way */
  var SC_NUDGE_SWEEP = 60;                  /* degrees the hand carries it in its nudge */
  var CLIP_OPEN = 400;                      /* a clip circle wide open; mirrors animations.js */

  /* ---- page 4: the two segments --------------------------------------------
     A fixed cut, the smaller piece in the upper right as the storyboard
     draws it; the two names, the smaller's outside the rim on the arc's
     middle line, the larger's inside, well in from the centre. */
  var SD = { a: 355, span: 105 };
  var SD_LABEL_OUT = 78;                    /* the smaller's name: past the rim */
  var SD_LABEL_IN = 0.58;                   /* the larger's: this share of r in  */
  var APART = 10;                           /* how far each piece slides out    */

  /* ---- pages 5 and 6: sector minus triangle --------------------------------
     The quarter in the upper right, as the storyboard draws it: one radius
     out to three o'clock, the other up to twelve. The same cut on the one
     big circle of page 5 and on the three small ones of page 6, so the
     summary recaps exactly what was watched. */
  var SE = { a: 0, span: 90 };
  var AWAY = 1.6;                           /* how far the triangle slides, in radii */
  var REMOVE_TIME = 0.9;                    /* s: the triangle out, the colour drawn back */
  var SF_X = [170, 500, 830];               /* the three small circles          */
  var SF_CY = 185, SF_R = 108;
  var SF_SIGN_X = [335, 665], SF_SIGN_Y = 202;
  var SF_LABEL_Y = 348;
  var SF_RIM = 0.8;                         /* s: a small circle's pen          */

  /* ---- page 7: the triangle at 90° -----------------------------------------
     The same quarter as pages 5 and 6 -- one radius out to three o'clock,
     the other up to twelve -- so the triangle is the one the learner has
     just watched being taken away. The right-angle mark is a small square
     in the corner at the centre; the two "r"s sit beside their radii,
     outside the triangle, and "90°" inside it. */
  var SG_MARK = 24;                         /* the right-angle square's side */
  var SG_R_OFF = 22;                        /* an "r", off its radius        */
  var SG_DEG = { x: 556, y: 166 };          /* "90°", inside the triangle    */

  /* ---- pages 8 and 9: the segment, worked and asked -------------------------
     The same quarter once more, with its arc lit and the segment coloured
     in, the right angle marked in pink with "90°" beside it, and the
     radius's length under the level radius. The working stands in the
     right pane as skill 2's does (the .ps-* lines, css/practice.css). */
  var SH_DEG = { x: 568, y: 186 };          /* "90°", beside the right angle */
  var SH_LEN_DY = 30;                       /* the length, under the radius  */
  var STEP_GAP = 500;                       /* ms a landed value stands      */
  var HINT_READ = 700;                      /* ms "Not quite!" stands before the why */
  var MENU_GAP = 0.25;                      /* s between the values dropping out of a box */

  /* ---- pages 11 to 14: the major segment ----------------------------------
     The other piece of the same cut: the major arc runs from the upright
     radius anticlockwise for 270° round to the level one. On page 11 the
     triangle comes back in from outside the circle, along the chord's
     middle line, and is put down between the radii. */
  var MJ = { a: 90, span: 270 };
  var TRI_IN = 1.5;                         /* how far out the triangle starts, in radii */
  var PUT_TIME = 0.9;                       /* s: the triangle sliding in; the colour drawn back */

  /* ---- pages 15 and 16: the stories ----------------------------------------
     The pipe lies on its side, so its water is the segment at the BOTTOM:
     the two radii run down to the ends of the water's surface, 90° apart.
     The bed is the quarter of pages 8 and 13. The pipe's length is set
     along its radius, outside the sector; "water" sits in the water. */
  var PIPE = { a: 225, span: 90 };
  var PIPE_LEN_OFF = 22;                    /* "14 cm", off its radius      */
  var PIPE_DEG_R = 72;                      /* "90°", down from the centre  */
  var PIPE_WORD_R = 137;                    /* "water", in the water        */

  /* ---- a circle, and everything measured from it -------------------------
     The three numbers a circle is drawn with, and the marks written from
     them: a point on it, a piece of its rim, the wedge two radii cut, the
     triangle two radii and a chord make, the segment a chord cuts off --
     the shapes the lesson drew on its own circle, here for a circle of any
     size in any place, because page 1 draws three small ones. */
  function circleAt(cx, cy, r) {
    function pt(deg, rad) {
      var t = deg * Math.PI / 180;
      var d = rad == null ? r : rad;
      return { x: round2(cx + Math.cos(t) * d), y: round2(cy - Math.sin(t) * d) };
    }
    /* a piece of the rim, anticlockwise from `from` for `sweep` degrees */
    function arc(from, sweep, rad) {
      var d = rad == null ? r : rad;
      var s = pt(from, d), e = pt(from + sweep, d);
      return 'M' + s.x + ' ' + s.y +
             ' A' + d + ' ' + d + ' 0 ' + (sweep > 180 ? 1 : 0) + ' 0 ' + e.x + ' ' + e.y;
    }
    /* the wedge, `t` of the way round its sweep (whole when left out) */
    function wedge(a, span, t) {
      var k = t == null ? 1 : t;
      return 'M' + cx + ' ' + cy + ' L' + arc(a, span * k).slice(1) + ' Z';
    }
    /* the triangle, its far side drawn `t` of the way along the chord */
    function tri(a, span, t) {
      var k = t == null ? 1 : t;
      var p = pt(a), q = pt(a + span);
      var m = { x: round2(p.x + (q.x - p.x) * k), y: round2(p.y + (q.y - p.y) * k) };
      return 'M' + cx + ' ' + cy + ' L' + p.x + ' ' + p.y + ' L' + m.x + ' ' + m.y + ' Z';
    }
    function seg(a, span) { return arc(a, span) + ' Z'; }
    function chordMid(a, span) {
      var p = pt(a), q = pt(a + span);
      return { x: round2((p.x + q.x) / 2), y: round2((p.y + q.y) / 2) };
    }
    /* how far a clip circle on the chord's middle has to grow to take in
       the smaller segment: the further of its corners and its top */
    function reach(span) {
      var half = span / 2 * Math.PI / 180;
      var d = r * Math.cos(half);
      return Math.max(r * Math.sin(half), r - d) + 6;
    }
    return {
      cx: cx, cy: cy, r: r, pt: pt, arc: arc, wedge: wedge, tri: tri, seg: seg,
      chordMid: chordMid, reach: reach,
      rim: 'M' + cx + ' ' + (cy - r) +
           ' A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r) +
           ' A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy - r)
    };
  }
  function lineD(p, q) { return 'M' + p.x + ' ' + p.y + ' L' + q.x + ' ' + q.y; }

  /* The lesson's circle: the one in index.html, measured the same way. */
  var MAIN = circleAt(CX, CY, RR);

  /* ---- the elements ------------------------------------------------------ */
  var dom = null;          /* pages.js's, with this skill's own on top */
  var mascot = null;
  var cards = [];          /* page 1's three, in the order they stand */
  var saying = 0;          /* which verdict owns the header line now  */
  var figs = [];           /* page 6's three small circles            */
  var kfigs = [];          /* page 12's three                         */
  var dropOpts = [];       /* page 8's values, while a menu is open   */
  var hinting = 0;         /* which hint owns the header now          */
  var hintUp = false;      /* a hint is standing in the header        */
  var hand = null;         /* the pointing hand, for page 3's pick    */
  var handE = null;        /* and the one that carries its handle     */

  function $(id) { return document.getElementById(id); }

  function build() {
    dom = Object.create(K.dom());
    mascot = K.mascot();

    dom.sa       = $('sa');
    dom.saDefs   = $('saDefs');
    dom.saCards  = $('saCards');

    dom.sb       = $('sb');
    dom.sbDisc   = $('sbDisc');
    dom.sbSector = $('sbSector');
    dom.sbRim    = $('sbRim');
    dom.sbTip    = $('sbTip');
    dom.sbArc    = $('sbArc');
    dom.sbRadA   = $('sbRadA');
    dom.sbRadB   = $('sbRadB');
    dom.sbAngle  = $('sbAngle');
    dom.sbCentre = $('sbCentre');
    dom.sbTheta  = $('sbTheta');

    dom.sc        = $('sc');
    dom.scGlow    = $('scGlow');
    dom.scDisc    = $('scDisc');
    dom.scSeg     = $('scSeg');
    dom.scClip    = $('scClipC');
    dom.scRim     = $('scRim');
    dom.scTip     = $('scTip');
    dom.scBand    = $('scBand');
    dom.scRadA    = $('scRadA');
    dom.scRadB    = $('scRadB');
    dom.scChord   = $('scChord');
    dom.scArc     = $('scArc');
    dom.scAngle   = $('scAngle');
    dom.scCentre  = $('scCentre');
    dom.scTheta   = $('scTheta');
    dom.scReadout = $('scReadout');
    dom.scGhost   = $('scGhost');
    dom.scPointA  = point($('scPointA'));
    dom.scPointB  = point($('scPointB'));
    dom.scNudges  = $('scNudges');
    hand  = A.hand(dom.scNudges);
    handE = A.hand(dom.scNudges);

    dom.sd         = $('sd');
    dom.sdDisc     = $('sdDisc');
    dom.sdMinor    = $('sdMinor');
    dom.sdMajor    = $('sdMajor');
    dom.sdClipMinor = $('sdClipMinorC');
    dom.sdClipMajor = $('sdClipMajorC');
    dom.sdRim      = $('sdRim');
    dom.sdTip      = $('sdTip');
    dom.sdArcMinor = $('sdArcMinor');
    dom.sdArcMajor = $('sdArcMajor');
    dom.sdChord    = $('sdChord');
    dom.sdCentre   = $('sdCentre');
    dom.sdDotA     = $('sdDotA');
    dom.sdDotB     = $('sdDotB');
    dom.sdLblMinor = $('sdLblMinor');
    dom.sdLblMajor = $('sdLblMajor');
    layoutTwo();

    dom.se       = $('se');
    dom.seDisc   = $('seDisc');
    dom.seSector = $('seSector');
    dom.seTri    = $('seTri');
    dom.seRim    = $('seRim');
    dom.seTip    = $('seTip');
    dom.seArc    = $('seArc');
    dom.seRadA   = $('seRadA');
    dom.seRadB   = $('seRadB');
    dom.seChord  = $('seChord');
    dom.seCentre = $('seCentre');
    dom.seDotA   = $('seDotA');
    dom.seDotB   = $('seDotB');
    layoutStep();

    dom.sf       = $('sf');
    dom.sfFigs   = $('sfFigs');
    dom.sfMinus  = $('sfMinus');
    dom.sfEquals = $('sfEquals');
    dom.sfLabels = [$('sfLblSector'), $('sfLblTriangle'), $('sfLblSegment')];

    dom.sg       = $('sg');
    dom.sgDisc   = $('sgDisc');
    dom.sgTri    = $('sgTri');
    dom.sgRim    = $('sgRim');
    dom.sgTip    = $('sgTip');
    dom.sgRadA   = $('sgRadA');
    dom.sgRadB   = $('sgRadB');
    dom.sgChord  = $('sgChord');
    dom.sgMark   = $('sgMark');
    dom.sgCentre = $('sgCentre');
    dom.sgRA     = $('sgRA');
    dom.sgRB     = $('sgRB');
    dom.sgDeg    = $('sgDeg');
    layoutRight();

    dom.sh       = $('sh');
    dom.shDisc   = $('shDisc');
    dom.shSeg    = $('shSeg');
    dom.shRim    = $('shRim');
    dom.shTip    = $('shTip');
    dom.shArc    = $('shArc');
    dom.shRadA   = $('shRadA');
    dom.shRadB   = $('shRadB');
    dom.shChord  = $('shChord');
    dom.shMark   = $('shMark');
    dom.shCentre = $('shCentre');
    dom.shDotA   = $('shDotA');
    dom.shDotB   = $('shDotB');
    dom.shLen    = $('shLen');
    dom.shDeg    = $('shDeg');
    layoutSeg();

    dom.swPane  = $('swPane');
    dom.swLine1 = $('swLine1');
    dom.swLine2 = $('swLine2');
    dom.swLine3 = $('swLine3');
    dom.swSlot1 = $('swSlot1');
    dom.swSlot2 = $('swSlot2');
    dom.swSlot3 = $('swSlot3');
    dom.swMenu1 = $('swMenu1');
    dom.swMenu2 = $('swMenu2');
    dom.swMenu3 = $('swMenu3');
    dom.swAll   = [dom.swLine1, dom.swLine2, dom.swLine3];

    dom.si         = $('si');
    dom.siDisc     = $('siDisc');
    dom.siMajor    = $('siMajor');
    dom.siMinor    = $('siMinor');
    dom.siClip     = $('siClipMajorC');
    dom.siRim      = $('siRim');
    dom.siTip      = $('siTip');
    dom.siArcMajor = $('siArcMajor');
    dom.siArcMinor = $('siArcMinor');
    dom.siRadA     = $('siRadA');
    dom.siRadB     = $('siRadB');
    dom.siChord    = $('siChord');
    dom.siMark     = $('siMark');
    dom.siCentre   = $('siCentre');
    dom.siDotA     = $('siDotA');
    dom.siDotB     = $('siDotB');
    dom.siLen      = $('siLen');
    dom.siDeg      = $('siDeg');
    layoutMajor();

    dom.sj         = $('sj');
    dom.sjDisc     = $('sjDisc');
    dom.sjMajor    = $('sjMajor');
    dom.sjClip     = $('sjClipC');
    dom.sjTri      = $('sjTri');
    dom.sjRim      = $('sjRim');
    dom.sjTip      = $('sjTip');
    dom.sjArcMajor = $('sjArcMajor');
    dom.sjArcMinor = $('sjArcMinor');
    dom.sjRadA     = $('sjRadA');
    dom.sjRadB     = $('sjRadB');
    dom.sjChord    = $('sjChord');
    dom.sjCentre   = $('sjCentre');
    dom.sjDotA     = $('sjDotA');
    dom.sjDotB     = $('sjDotB');
    layoutMajorAnim();

    dom.sk       = $('sk');
    dom.skFigs   = $('skFigs');
    dom.skPlus   = $('skPlus');
    dom.skEquals = $('skEquals');
    dom.skLabels = [$('skLblSector'), $('skLblTriangle'), $('skLblSegment')];
    kfigs = ['msector', 'triangle', 'msegment'].map(function (k, i) { return buildFig(k, i, dom.skFigs); });

    dom.sxPane  = $('sxPane');
    dom.sxLine1 = $('sxLine1');
    dom.sxLine2 = $('sxLine2');
    dom.sxLine3 = $('sxLine3');
    dom.sxSlot1 = $('sxSlot1');
    dom.sxSlot2 = $('sxSlot2');
    dom.sxSlot3 = $('sxSlot3');
    dom.sxMenu1 = $('sxMenu1');
    dom.sxMenu2 = $('sxMenu2');
    dom.sxMenu3 = $('sxMenu3');
    dom.sxAll   = [dom.sxLine1, dom.sxLine2, dom.sxLine3];

    dom.sl       = $('sl');
    dom.slSeg    = $('slSeg');
    dom.slRim    = $('slRim');
    dom.slTip    = $('slTip');
    dom.slArc    = $('slArc');
    dom.slRadA   = $('slRadA');
    dom.slRadB   = $('slRadB');
    dom.slChord  = $('slChord');
    dom.slMark   = $('slMark');
    dom.slCentre = $('slCentre');
    dom.slLenG   = $('slLenG');
    dom.slLen    = $('slLen');
    dom.slDeg    = $('slDeg');
    dom.slWord   = $('slWord');
    layoutPipe();

    dom.sm       = $('sm');
    dom.smDisc   = $('smDisc');
    dom.smSeg    = $('smSeg');
    dom.smRim    = $('smRim');
    dom.smTip    = $('smTip');
    dom.smArc    = $('smArc');
    dom.smRadA   = $('smRadA');
    dom.smRadB   = $('smRadB');
    dom.smChord  = $('smChord');
    dom.smMark   = $('smMark');
    dom.smCentre = $('smCentre');
    dom.smLen    = $('smLen');
    dom.smDeg    = $('smDeg');
    layoutBed();
    figs = ['sector', 'triangle', 'segment'].map(buildFig);

    reset();
  }

  /* A point on the circle: the dot, and the finger-sized hit area over it. */
  function point(g) {
    return { g: g, dot: g.querySelector('.arc-dot'), hit: g.querySelector('.arc-dot__hit') };
  }

  /* ======================================================================
   * Page 1 -- the cards
   * ====================================================================== */

  /* One card, built where it stands, with the one region it shows. The
     same marks on all three -- the ring, the two points, the chord, the
     two radii, the centre -- and a different one of them faded back on
     each, so the eye reads the shaded region's EDGES: the sector's chord
     is a ghost, the segment's radii and centre are ghosts. */
  function buildCard(kind, i) {
    var c = circleAt(CARD_X[i], CARD_CY, CARD_R);
    var o = { x: c.cx, y: c.cy };
    var pA = c.pt(CUT.a), pB = c.pt(CUT.a + CUT.span);
    var g = el('g', { 'class': 'sa-card sa-card--' + kind, role: 'button', tabindex: -1,
                      'aria-label': T('a11yShaded') });
    var card = { kind: kind, g: g, geo: c, i: i, named: false };

    card.face = el('rect', { 'class': 'sa-card__face', x: CARD_X[i] - CARD_W / 2, y: CARD_Y,
                             width: CARD_W, height: CARD_H, rx: CARD_RX });
    g.appendChild(card.face);

    card.disc = el('circle', { 'class': 'sa-disc', cx: c.cx, cy: c.cy, r: c.r });
    g.appendChild(card.disc);

    /* The region. A segment's is coloured from the chord outward through
       a clip circle on the chord's middle (segFill, animations.js); the
       sector's and the triangle's are swept from one radius round to the
       other (secFill), so they are written as they go. */
    if (kind === 'segment') {
      var mid = c.chordMid(CUT.a, CUT.span);
      var clip = el('clipPath', { id: 'saClip' + i });
      card.clip = el('circle', { cx: mid.x, cy: mid.y, r: 400 });
      clip.appendChild(card.clip);
      dom.saDefs.appendChild(clip);
      card.reach = c.reach(CUT.span);
      card.region = el('path', { 'class': 'sa-region', d: c.seg(CUT.a, CUT.span),
                                 'clip-path': 'url(#saClip' + i + ')' });
    } else {
      card.region = el('path', { 'class': 'sa-region', d: '' });
    }
    g.appendChild(card.region);

    card.radA = el('path', { 'class': 'sa-radius' + (kind === 'segment' ? ' is-ghost' : ''), d: lineD(o, pA) });
    card.radB = el('path', { 'class': 'sa-radius' + (kind === 'segment' ? ' is-ghost' : ''), d: lineD(o, pB) });
    g.appendChild(card.radA);
    g.appendChild(card.radB);
    card.chord = el('path', { 'class': 'sa-chord' + (kind === 'sector' ? ' is-ghost' : ''), d: lineD(pA, pB) });
    g.appendChild(card.chord);

    card.rim = el('path', { 'class': 'sa-rim', d: c.rim });
    g.appendChild(card.rim);
    card.tip = el('circle', { 'class': 'rim-tip', cx: c.cx, cy: c.cy - c.r, r: 7 });
    g.appendChild(card.tip);

    card.arc = null;
    if (kind !== 'triangle') {
      card.arc = el('path', { 'class': 'sa-arc', d: c.arc(CUT.a, CUT.span) });
      g.appendChild(card.arc);
    }

    card.centre = el('circle', { 'class': 'sa-centre' + (kind === 'segment' ? ' is-ghost' : ''),
                                 cx: c.cx, cy: c.cy, r: 7 });
    g.appendChild(card.centre);

    card.dots = [pA, pB].map(function (p) {
      var d = el('circle', { 'class': 'sa-dot', cx: p.x, cy: p.y, r: 7 });
      g.appendChild(d);
      return d;
    });

    /* the name, under the circle: written now, shown when it is earned */
    card.label = el('text', { 'class': 'figure-label sa-label', x: CARD_X[i], y: LABEL_Y,
                              'text-anchor': 'middle' });
    g.appendChild(card.label);

    /* the tick, on the card's top-right corner, for the right one */
    var bx = CARD_X[i] + CARD_W / 2 - 4, by = CARD_Y + 4;
    card.badge = el('g', { 'class': 'sa-badge', 'aria-hidden': 'true' });
    card.badge.appendChild(el('circle', { 'class': 'sa-badge__disc', cx: bx, cy: by, r: BADGE_R }));
    card.badge.appendChild(el('path', { 'class': 'sa-badge__tick',
      d: 'M' + (bx - 9) + ' ' + (by + 1) + ' L' + (bx - 3) + ' ' + (by + 7) + ' L' + (bx + 9) + ' ' + (by - 7) }));
    g.appendChild(card.badge);

    dom.saCards.appendChild(g);
    return card;
  }

  /* The three, in a fresh order each run, built where they stand. */
  function makeCards(order, names) {
    putAwayCards();
    cards = order.map(buildCard);
    cards.forEach(function (c) { c.label.textContent = T(names[c.kind]); });
  }
  function putAwayCards() {
    dom.saCards.textContent = '';
    dom.saDefs.textContent = '';
    dom.sa.classList.remove('is-asking');
    cards = [];
  }

  /* ---- the beats ----------------------------------------------------------- */

  /* A card stands up: the plate pops in where it belongs, the way every
     box in the app arrives. The group rests at nothing (segarea.css) and
     is left at full once it is up; the wipe takes it down again. */
  function cardIn(c) {
    M.set(c.g, { opacity: 0, scale: 0.9, transformOrigin: 'center center' });
    var tl = M.timeline({ willChange: c.g, willChangeValue: 'transform, opacity' });
    tl.to(c.g, { opacity: 1, scale: 1, duration: M.dur(0.45), ease: M.POP });
    tl.call(Beats.pop, null, 0);
    return tl;
  }

  /* The colour inside the ring. */
  function discIn(disc) {
    var tl = M.timeline({ willChange: disc, willChangeValue: 'opacity' });
    tl.to(disc, { opacity: 1, duration: M.dur(0.4), ease: 'power2.out' });
    return tl;
  }

  /* The marks that are NOT part of the region, faded in as ghosts: there,
     so the picture is the same picture, but plainly not what is shaded. */
  function ghostsIn(list) {
    var tl = M.timeline({ willChange: list, willChangeValue: 'opacity' });
    tl.to(list, { opacity: GHOST, duration: M.dur(0.45), ease: 'power2.out', stagger: M.gap(0.08) });
    return tl;
  }

  function grow(line, seconds) {
    return Flow.anim(Beats.growLine(line, seconds || LINE_TIME, 'power2.inOut'));
  }

  /* One card made: the plate, the ring from the top, the colour, the two
     points, and then its region -- its edges first, then the shade swept
     in between them, then the centre, then the ghosts. */
  function drawCard(c) {
    var g = c.geo;
    var made = Flow.anim(cardIn(c))
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.drawRim(c.rim, c.tip, { time: CARD_RIM })); })
      .then(function () { return Flow.wait(120); })
      .then(function () { return Flow.anim(discIn(c.disc)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(c.dots[0])); })
      .then(function () { return Flow.wait(160); })
      .then(function () { return Flow.anim(Beats.plotDot(c.dots[1])); })
      .then(function () { return Flow.wait(SHORT); });

    if (c.kind === 'sector') {
      return made
        .then(function () { return grow(c.radA); })
        .then(function () { return Flow.wait(160); })
        .then(function () { return grow(c.radB); })
        .then(function () { return Flow.wait(SHORT); })
        .then(function () {
          return Promise.all([
            Flow.anim(Beats.secFill(c.region, function (t) { return g.wedge(CUT.a, CUT.span, t); }, FILL_TIME)),
            Flow.anim(Beats.growLine(c.arc, FILL_TIME, 'power2.inOut'))
          ]);
        })
        .then(function () { return Flow.anim(Beats.plotDot(c.centre, 0.4)); })
        .then(function () { return Flow.anim(ghostsIn([c.chord])); });
    }
    if (c.kind === 'triangle') {
      return made
        .then(function () { return grow(c.radA); })
        .then(function () { return Flow.wait(160); })
        .then(function () { return grow(c.radB); })
        .then(function () { return Flow.wait(160); })
        .then(function () { return grow(c.chord); })
        .then(function () { return Flow.wait(SHORT); })
        .then(function () {
          return Flow.anim(Beats.secFill(c.region, function (t) { return g.tri(CUT.a, CUT.span, t); }, FILL_TIME));
        })
        .then(function () { return Flow.anim(Beats.plotDot(c.centre, 0.4)); });
    }
    return made
      .then(function () { return grow(c.chord); })
      .then(function () { return Flow.wait(160); })
      .then(function () { return grow(c.arc); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.segFill(c.region, c.clip, c.reach, FILL_TIME)); })
      .then(function () { return Flow.anim(ghostsIn([c.radA, c.radB, c.centre])); });
  }

  /* A name, under its circle. */
  function nameIn(c) {
    if (c.named) return null;
    c.named = true;
    return Beats.labelIn(c.label);
  }

  /* A card refused: it turns red (a class -- the stylesheet transitions
     the plate) and shakes its head, as a refused box does, holds the red
     for a beat, and is a plain card again -- spent, with its name under
     its circle so the learner knows what it WAS. */
  var SHAKE = [-5, 5, -5, 5, -4, 4, 0];

  function cardWrong(c) {
    var g = c.g;
    g.classList.add('is-wrong');
    Beats.sfx('wrong');
    var tl = M.timeline({
      willChange: g, willChangeValue: 'transform',
      revert: function () {
        g.classList.remove('is-wrong');
        M.set(g, { clearProps: 'transform' });
      }
    });
    var each = M.dur(0.3) / SHAKE.length;
    SHAKE.forEach(function (x, i) {
      tl.to(g, { x: x, duration: each, ease: i === SHAKE.length - 1 ? 'power2.out' : 'none' });
    });
    var name = nameIn(c);
    if (name) tl.add(name, M.gap(0.1));
    tl.to({}, { duration: M.dur(0.5) });        /* the red, read before it goes */
    return tl;
  }

  /* The right card: green, one outward pulse, the tick popping onto its
     corner, and its name under its circle. The green is a state it stays
     in. */
  function cardRight(c) {
    var g = c.g;
    g.classList.remove('is-wrong');
    g.classList.add('is-right');
    Beats.sfx('correct');
    M.set(c.badge, { opacity: 0, scale: 0, transformOrigin: 'center center' });
    var tl = M.timeline({
      willChange: [g, c.badge], willChangeValue: 'transform, opacity',
      revert: function () { M.set(g, { clearProps: 'transform' }); }
    });
    tl.to(g, { scale: 1.04, transformOrigin: 'center center',
               duration: M.dur(0.14), ease: 'power2.out' }, 0)
      .to(g, { scale: 1, duration: M.dur(0.4), ease: M.POP }, M.gap(0.14))
      .to(c.badge, { opacity: 1, scale: 1, duration: M.dur(0.4), ease: 'back.out(2)' }, M.gap(0.1));
    var name = nameIn(c);
    if (name) tl.add(name, M.gap(0.2));
    return tl;
  }

  /* Every name not yet shown, one after the other: once the segment has
     been found all three regions are named, so the three readings of the
     one picture stand side by side. */
  function namesIn() {
    var list = cards.filter(function (c) { return !c.named; });
    if (!list.length) return null;
    var tl = M.timeline();
    list.forEach(function (c, i) {
      var name = nameIn(c);
      if (name) tl.add(name, M.gap(i * 0.18));
    });
    return tl;
  }

  /* ---- the bird's verdicts ------------------------------------------------
     Said from the header, where the bird already stands: one sentence or
     several, each typed in turn and read for a moment before the next
     takes its place. A newer verdict takes the header over: `saying` is
     bumped at the start, and an older chain that wakes up to find itself
     outvoted stops between its lines rather than talking over the new
     one. */
  function verdict(lines, mood) {
    var mine = ++saying;
    function live() { return mine === saying; }
    return [].concat(lines).reduce(function (chain, line, i) {
      return chain
        .then(function () { if (i && live()) return Flow.wait(READ); })
        .then(function () { if (live()) return K.speak(line, mood); });
    }, Promise.resolve());
  }

  /* ======================================================================
   * The interaction: one of three cards, tapped
   * ----------------------------------------------------------------------
   * All three go live -- the cursor becomes a hand over them, a press
   * sinks the one under it a touch -- and a press is an answer. A wrong
   * card is refused and spent, `onWrong` is told which so the bird can say
   * why, and the learner tries again among the cards that are left. The
   * right one fires a click at the lesson's gate (see #gate in index.html)
   * and the scene waits on THAT, as every choice in the lesson does: an
   * ordinary Flow.once, cancelled with the rest of the chain when a scene
   * is retired, with the listeners coming off whichever way it ends. A
   * skip answers it with the right card.
   *   Keyboard: each card takes focus, and Enter or Space presses it.
   * ====================================================================== */
  function armCards(spec) {
    var live = true;
    var misses = 0;
    var list = cards.map(function (c) { return c.g; });

    dom.sa.classList.add('is-asking');
    list.forEach(function (g) { g.setAttribute('tabindex', '0'); });

    function cardOf(g) {
      for (var i = 0; i < cards.length; i++) if (cards[i].g === g) return cards[i];
      return null;
    }
    function onPick(ev) {
      if (!live) return;
      var g = ev.currentTarget;
      var c = cardOf(g);
      if (!c || g.classList.contains('is-done')) return;
      K.ripple(ev, g);
      g.classList.add('is-done');
      if (c.kind === spec.answer) {
        live = false;
        dom.gate.dispatchEvent(new MouseEvent('click'));
        return;
      }
      misses++;
      K.quiet(Flow.anim(cardWrong(c)));
      if (spec.onWrong) spec.onWrong(c, misses);
    }
    function onKey(ev) {
      if (ev.key !== 'Enter' && ev.key !== ' ' && ev.key !== 'Spacebar') return;
      ev.preventDefault();
      onPick(ev);
    }
    /* the press: down a touch under the finger, and up again as it lifts
       or leaves -- a class the stylesheet spells out */
    function onDown(ev) { if (live) ev.currentTarget.classList.add('is-down'); }
    function onUp(ev) { ev.currentTarget.classList.remove('is-down'); }
    function off() {
      live = false;
      list.forEach(function (g) {
        g.removeEventListener('click', onPick);
        g.removeEventListener('keydown', onKey);
        g.removeEventListener('pointerdown', onDown);
        g.removeEventListener('pointerup', onUp);
        g.removeEventListener('pointerleave', onUp);
        g.removeEventListener('pointercancel', onUp);
        g.classList.remove('is-down');
        g.classList.add('is-done');
        g.setAttribute('tabindex', '-1');
      });
      dom.sa.classList.remove('is-asking');
    }

    list.forEach(function (g) {
      g.addEventListener('click', onPick);
      g.addEventListener('keydown', onKey);
      g.addEventListener('pointerdown', onDown);
      g.addEventListener('pointerup', onUp);
      g.addEventListener('pointerleave', onUp);
      g.addEventListener('pointercancel', onUp);
    });

    return Flow.once(dom.gate, { auto: true }).then(
      function () { off(); return { misses: misses }; },
      function (err) { off(); throw err; });
  }

  function answerCard() {
    return cards.filter(function (c) { return c.kind === ANSWER; })[0];
  }

  /* ======================================================================
   * Page 1 -- tap the segment. A blank board with its header closed, so
   * the row has the whole of it; three cards made one after another where
   * they stand; the bird up to ask; the taps, each answered from the
   * header; the right card named with the rest; and Next.
   * ====================================================================== */
  function sceneSegment() {
    var lines = segmentLines();
    var outcome = null;

    return K.wipeBoard()
      .then(function () { return Flow.wait(SHORT); })

      /* ---- nobody is speaking yet, so the header closes and the row is
         drawn into the room that makes ------------------------------------- */
      .then(function () { return Flow.anim(K.collapseHeader(true)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        makeCards(K.shuffle(KINDS), lines.names);
        dom.sa.removeAttribute('hidden');
        return cards.reduce(function (chain, c) {
          return chain
            .then(function () { return drawCard(c); })
            .then(function () { return Flow.wait(SHORT); });
        }, Promise.resolve());
      })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the question ------------------------------------------------------
         The cards go live as the bird sets off, before its line is
         finished, as every tap in the lesson is; the header opens for it
         (mascotJumpIn, pages.js). The bird STAYS on the header: every
         verdict is said from there. */
      .then(function () {
        outcome = K.quiet(armCards({
          answer: ANSWER,
          onWrong: function (c) {
            K.quiet(verdict(lines.wrong[c.kind], 'confused'));
          }
        }));
        return K.arriveSaying(lines.ask);
      })
      .then(function () {
        mascot.settle();
        return outcome;
      })

      /* ---- the segment found: the card goes green with its tick, the bird
         says so and why, and every card is named --------------------------- */
      .then(function () {
        return Promise.all([
          Flow.anim(cardRight(answerCard())),
          verdict(lines.right, 'happy')
            .then(function () { return Flow.anim(namesIn()); })
        ]);
      })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- Next -- and only its PRESS sends the bird away, with its line
         and the cards; the header closes behind the bird (mascotJumpOut)
         and opens again over a clean board, which is where the next page
         begins. -------------------------------------------------------------- */
      .then(function () { return K.handOver(dom.nextBtn); })
      .then(function () {
        saying++;
        if (global.I18n) global.I18n.stop();
        return Promise.all([
          K.mascotJumpOut(),
          Flow.anim(Beats.lineOut(dom.promptLine)),
          Flow.anim(Beats.clearFigure([dom.sa]))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        dom.sa.setAttribute('hidden', '');
        K.clearInline([dom.sa].concat(
          Array.prototype.slice.call(dom.sa.querySelectorAll('*'))));
        putAwayCards();
        return Flow.anim(K.collapseHeader(false));
      });
  }

  /* ======================================================================
   * Page 2 -- the area of a sector. A blank board, the circle made and
   * coloured, the centre, the two radii, the angle with its "θ", the
   * sector swept in with its arc; then the figure stands aside and the
   * bird asks from the pane. Three formulas, one by one.
   * ====================================================================== */

  /* Every mark that depends on the two radii, written from them. */
  function redrawSector() {
    var a = SB.a, b = SB.a + SB.span;
    var o = { x: CX, y: CY };
    dom.sbSector.setAttribute('d', MAIN.wedge(a, SB.span));
    dom.sbArc.setAttribute('d', MAIN.arc(a, SB.span));
    dom.sbRadA.setAttribute('d', lineD(o, MAIN.pt(a)));
    dom.sbRadB.setAttribute('d', lineD(o, MAIN.pt(b)));
    dom.sbAngle.setAttribute('d', MAIN.arc(a, SB.span, ANGLE_R));
    var th = MAIN.pt(a + SB.span / 2, THETA_R);
    dom.sbTheta.setAttribute('x', th.x);
    dom.sbTheta.setAttribute('y', th.y + LABEL_DY);
  }
  function sectorWedge(t) { return MAIN.wedge(SB.a, SB.span, t); }

  /* The right formula pressed: the sector's edges swell once -- the arc
     and both radii -- that is the region the formula measures. */
  function showSector() {
    return Promise.all([
      Flow.anim(Beats.linePulse([dom.sbArc], ARC_W)),
      Flow.anim(Beats.linePulse([dom.sbRadA, dom.sbRadB]))
    ]);
  }

  function sceneSectorArea() {
    var lines = areaLines();
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle: the pen round the rim, the colour poured in ------- */
      .then(function () {
        redrawSector();
        dom.sb.removeAttribute('hidden');
        return Flow.anim(Beats.drawRim(dom.sbRim, dom.sbTip));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.fillDisc(dom.sbDisc)); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the centre dot -------------------------------------------------- */
      .then(function () { return Flow.anim(Beats.plotDot(dom.sbCentre, DOT_TIME)); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the two radii out of it, one after the other ------------------- */
      .then(function () { return grow(dom.sbRadA, RADIUS_TIME); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return grow(dom.sbRadB, RADIUS_TIME); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the angle between them, and its "θ" ---------------------------- */
      .then(function () { return grow(dom.sbAngle, ANGLE_TIME); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.sbTheta)); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the sector swept in from one radius round to the other, its
         piece of the rim lit at the same pace, then the lit piece swells
         once ------------------------------------------------------------------ */
      .then(function () {
        return Promise.all([
          Flow.anim(Beats.secFill(dom.sbSector, sectorWedge, SWEEP_TIME)),
          Flow.anim(Beats.growLine(dom.sbArc, SWEEP_TIME, 'power2.inOut'))
        ]);
      })
      .then(function () { return Flow.anim(Beats.arcPulse([dom.sbArc])); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- and the figure stands aside -------------------------------------
         There is no bird on the header, so it closes while the figure
         slides smoothly to the left half, where every stood-aside circle
         in the app goes. */
      .then(function () {
        return Promise.all([
          Flow.anim(K.collapseHeader(true)),
          Flow.anim(Beats.slideArcs(dom.sb, SHIFT))
        ]);
      })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the bird up in the pane, the question from bubble-02, the three
         formulas one by one, the press, and the verdict (circum.js) ------- */
      .then(function () {
        return C.ask({
          ask: lines.ask, options: lines.options, answer: lines.answer,
          wrong: lines.wrong, right: lines.right,
          reveal: showSector
        });
      })

      /* ---- Next -- and only its PRESS sends the bird away, with the box,
         the pills and the figure; the header opens again over a clean
         board (closeOut, circum.js). ----------------------------------- */
      .then(function () { return C.closeOut(dom.sb); });
  }

  /* ======================================================================
   * Speaking to the picture
   * ----------------------------------------------------------------------
   * A line said from the header with beats on its words: `cues` is a list
   * of {word, run}, and each run is started the moment its word starts to
   * type, so the mark and the word that names it land together. With
   * `arrive` the bird comes up to say it, and the beats allow for the
   * jump. The promise is the line's AND every beat's.
   * ====================================================================== */
  function wordAt(text, word) {
    var i = text.indexOf(word);
    return (i < 0 ? 0 : i) * TYPE_MS;
  }
  function sayWith(line, cues, opts) {
    var o = opts || {};
    var text = line.text || String(line);
    var lead;
    var said;
    if (o.arrive) {
      lead = JUMP;
      said = K.arriveSaying(line, o.mood);
    } else {
      lead = dom.promptLine.textContent.trim().length ? LINE_OUT : 0;
      said = K.speak(line, o.mood);
    }
    var beats = (cues || []).map(function (c) {
      return Flow.wait(lead + wordAt(text, c.word)).then(c.run);
    });
    return Promise.all([said].concat(beats));
  }

  /* ======================================================================
   * Page 3 -- make a segment
   * ====================================================================== */

  /* Every mark that depends on the two points, rewritten from them: a
     radius to each, the chord from the point placed last, the arc and
     the region between them, the angle at the centre with its "θ", the
     circle the region's colour spreads from, the two points, and the
     reading. */
  function redrawChord() {
    var a = cut.a, b = cut.a + cut.span;
    var o = { x: CX, y: CY };
    var pA = MAIN.pt(a), pB = MAIN.pt(b);
    dom.scRadA.setAttribute('d', lineD(o, pA));
    dom.scRadB.setAttribute('d', lineD(o, pB));
    dom.scChord.setAttribute('d', cut.origin === 'a' ? lineD(pA, pB) : lineD(pB, pA));
    dom.scArc.setAttribute('d', MAIN.arc(a, cut.span));
    dom.scSeg.setAttribute('d', MAIN.seg(a, cut.span));
    dom.scAngle.setAttribute('d', MAIN.arc(a, cut.span, ANGLE_R));
    var th = MAIN.pt(a + cut.span / 2, THETA_R);
    dom.scTheta.setAttribute('x', th.x);
    dom.scTheta.setAttribute('y', round2(th.y + LABEL_DY));
    var mid = MAIN.chordMid(a, cut.span);
    dom.scClip.setAttribute('cx', mid.x);
    dom.scClip.setAttribute('cy', mid.y);
    A.place(dom.scPointA, a);
    A.place(dom.scPointB, b);
    var deg = Math.round(cut.span);
    dom.scReadout.textContent = T('lblThetaIs', { deg: deg });
    dom.scPointB.hit.setAttribute('aria-valuenow', deg);
  }

  /* The two radii in the order they are drawn: to the point placed FIRST
     first, so the picture is made in the order the learner made it. */
  function radii() {
    return cut.origin === 'b' ? [dom.scRadA, dom.scRadB] : [dom.scRadB, dom.scRadA];
  }

  /* What arcs.js's two-point interaction works on here: this page's circle
     and marks, and its own state for the cut to be written into. */
  function pickCtx() {
    return {
      group: dom.sc, band: dom.scBand, ghost: dom.scGhost, nudges: dom.scNudges,
      hand: hand, points: [dom.scPointA, dom.scPointB],
      minSpan: SC_MIN, maxSpan: SC_MAX,
      done: function (c) {
        cut.a = c.a; cut.span = c.span; cut.origin = c.origin;
        redrawChord();
      }
    };
  }

  /* The picture turned so the first point lies at 0° -- three o'clock --
     and the other, above it, is the one that will move. Every mark is
     rewritten from the turning angle each frame: a circle turned is a
     circle, so what is SEEN to turn is the marks on it. The shorter way
     round. However the timeline ends, the picture is left at 0°. */
  function turnToZero() {
    var turn = { a: cut.a };
    var delta = A.norm180(-cut.a);
    function draw() { cut.a = A.norm(turn.a); redrawChord(); }
    var tl = M.timeline({ revert: function () { turn.a = 0; cut.a = 0; redrawChord(); } });
    if (Math.abs(delta) < 0.5) return tl;
    tl.to(turn, { a: cut.a + delta, duration: M.dur(TURN_TIME), ease: 'power2.inOut', onUpdate: draw });
    return tl;
  }

  /* A point on the screen, in the picture's own units. */
  function toPicture(group, x, y) {
    var pt = dom.figure.createSVGPoint();
    pt.x = x; pt.y = y;
    var m = group.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()) : { x: CX, y: CY };
  }

  /* ---- the interaction -------------------------------------------------
     The handle on the moving point is live until the scene takes it back
     (off, once Next is pressed): a learner with the board to themselves
     may go on turning it. The angle is carried by the finger's turn about
     the centre, between SPAN_MIN and SPAN_MAX -- caught at either end with
     a snap -- and every mark follows. Resolves, through the lesson's gate,
     once the handle has been carried and let go of and SC_SETTLE has
     passed; a skip carries it to SC_SKIP_TO. If nothing happens for a
     while the hand shows the gesture. */
  function explore() {
    var live = true;
    var held = null;
    var moved = false;
    var waiting = false;
    var atEnd = false;
    var nudge = null;
    var idle = 0;
    var start = cut.span;
    var hit = dom.scPointB.hit;

    dom.sc.classList.add('is-live');
    hit.setAttribute('tabindex', '0');

    function armHand() {
      var mine = ++idle;
      Flow.wait(SC_NUDGE_AFTER).then(function () {
        if (!live || mine !== idle || held || moved || nudge) return;
        dom.scNudges.removeAttribute('hidden');
        var from = cut.span;
        nudge = Beats.nudgeSlide(handE, function (t, gap) {
          A.handAt(handE, from + SC_NUDGE_SWEEP * t, gap);
        });
      }, function () { /* the scene was retired: nothing to show */ });
    }
    function restHand() {
      idle++;
      if (!nudge) return;
      Beats.nudgeStop(nudge, handE);
      nudge = null;
    }
    function angleOf(ev) {
      var q = toPicture(dom.sc, ev.clientX, ev.clientY);
      return Math.atan2(CY - q.y, q.x - CX) * 180 / Math.PI;
    }
    function setSpan(v) {
      v = Math.max(SPAN_MIN, Math.min(SPAN_MAX, v));
      cut.span = v;
      redrawChord();
      if (!moved && Math.abs(v - start) >= SC_MOVED) { moved = true; restHand(); }
      var end = v <= SPAN_MIN || v >= SPAN_MAX;
      if (end && !atEnd) Beats.snapDot(dom.scPointB.dot);
      atEnd = end;
    }
    function letGo() {
      if (!live || !moved || waiting) return;
      waiting = true;
      Flow.wait(SC_SETTLE).then(function () {
        if (!live) return;
        dom.gate.dispatchEvent(new MouseEvent('click'));
      }, function () { /* retired */ });
    }
    function onDown(ev) {
      if (!live || held) return;
      ev.preventDefault();
      held = { id: ev.pointerId, last: angleOf(ev) };
      dom.scPointB.g.classList.add('is-held');
      restHand();
      if (ev.currentTarget.setPointerCapture) {
        try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) { /* fine */ }
      }
    }
    function onMove(ev) {
      if (!live || !held || ev.pointerId !== held.id) return;
      var a = angleOf(ev);
      setSpan(cut.span + A.norm180(a - held.last));
      held.last = a;
    }
    function onUp(ev) {
      if (!held || ev.pointerId !== held.id) return;
      held = null;
      dom.scPointB.g.classList.remove('is-held');
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
      setSpan(cut.span + dir * (ev.shiftKey ? SC_STEP * 3 : SC_STEP));
      letGo();
    }
    function off() {
      live = false;
      restHand();
      hit.removeEventListener('pointerdown', onDown);
      hit.removeEventListener('keydown', onKey);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      hit.setAttribute('tabindex', '-1');
      dom.scPointB.g.classList.remove('is-held');
      dom.sc.classList.remove('is-live');
      held = null;
    }
    function fillIn() {
      if (!moved) setSpan(SC_SKIP_TO);
    }

    hit.addEventListener('pointerdown', onDown);
    hit.addEventListener('keydown', onKey);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
    armHand();

    return Flow.once(dom.gate, { auto: true }).then(
      function () { fillIn(); return { off: off }; },
      function (err) { off(); throw err; });
  }

  /* The scene. */
  function sceneChord() {
    var lines = chordLines();
    var picked = null;
    var act = null;

    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle: the pen round the rim, the colour poured in, and
         the small dot at its centre ------------------------------------- */
      .then(function () {
        cut.a = SC_DEFAULT.a; cut.span = SC_DEFAULT.span; cut.origin = SC_DEFAULT.origin;
        redrawChord();
        dom.sc.removeAttribute('hidden');
        return Flow.anim(Beats.drawRim(dom.scRim, dom.scTip));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.fillDisc(dom.scDisc)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.scCentre, DOT_TIME)); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- two points: the rim breathes while a point is wanted, and the
         hand shows the way if nothing is placed. Listening starts as the
         bird lands, before its line is finished. --------------------------- */
      .then(function () {
        picked = K.quiet(A.pickPoints(pickCtx()));
        return K.arriveSaying(lines.pick);
      })
      .then(function () {
        mascot.settle();
        return picked;
      })

      /* ---- the chord joins them, from the point placed last; the bird
         keeps its place on the header but its line goes ------------------ */
      .then(function () { return Flow.anim(Beats.lineOut(dom.promptLine)); })
      .then(function () {
        K.clearPrompt();
        return Flow.anim(Beats.growLine(dom.scChord, CHORD_TIME, 'sine.inOut'));
      })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- "Now join both points to the centre as well." -- the radii
         grow as it is said, one after the other, and the angle with its
         "θ" lands on the last words ------------------------------------- */
      .then(function () {
        return sayWith(lines.join, [
          { word: 'join', run: function () {
            return grow(radii()[0], RADIUS_TIME)
              .then(function () { return Flow.wait(120); })
              .then(function () { return grow(radii()[1], RADIUS_TIME); });
          } },
          { word: 'as', run: function () {
            return grow(dom.scAngle, ANGLE_TIME)
              .then(function () { return Flow.anim(Beats.labelIn(dom.scTheta)); });
          } }
        ]);
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(BEAT);
      })

      /* ---- "Two radii and a chord." -- each swells on its word ---------- */
      .then(function () {
        return sayWith(lines.three, [
          { word: 'Two',   run: function () { return Flow.anim(Beats.linePulse([dom.scRadA, dom.scRadB])); } },
          { word: 'chord', run: function () { return Flow.anim(Beats.linePulse([dom.scChord])); } }
        ]);
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(BEAT);
      })

      /* ---- "The region trapped between the chord and the arc is a
         segment." -- the region is coloured in from the chord as it is
         named, its arc lit on "arc", and the whole edge swells once on
         "segment" ------------------------------------------------------------ */
      .then(function () {
        return sayWith(lines.segment, [
          { word: 'region', run: function () {
            return Flow.anim(Beats.segFill(dom.scSeg, dom.scClip, MAIN.reach(cut.span), FILL_TIME));
          } },
          { word: 'arc', run: function () {
            return Flow.anim(Beats.growLine(dom.scArc, FILL_TIME, 'power2.inOut'));
          } },
          { word: 'segment', run: function () {
            return Promise.all([
              Flow.anim(Beats.linePulse([dom.scArc], ARC_W)),
              Flow.anim(Beats.linePulse([dom.scChord]))
            ]);
          } }
        ]);
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(BEAT);
      })

      /* ---- the picture turns so one radius lies at 0°, and the reading
         stands beside the circle; the bird says what to do, the handle
         goes live as it does, and the bird leaves -- the header closing
         behind it -- so the board is the learner's ------------------------ */
      .then(function () { return Flow.anim(turnToZero()); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.scReadout)); })
      .then(function () {
        act = K.quiet(explore());
        return K.speak(lines.explore);
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
         and the header opened again over it. ----------------------------- */
      .then(function (a) {
        return K.handOver(dom.nextBtn).then(
          function () { a.off(); },
          function (err) { a.off(); throw err; });
      })
      .then(function () { return Flow.anim(Beats.clearFigure([dom.sc])); })
      .then(function () {
        dom.sc.setAttribute('hidden', '');
        dom.scNudges.setAttribute('hidden', '');
        K.clearInline([dom.sc].concat(
          Array.prototype.slice.call(dom.sc.querySelectorAll('*'))));
        return Flow.anim(K.collapseHeader(false));
      });
  }

  /* ======================================================================
   * Page 4 -- two segments
   * ====================================================================== */

  /* The picture, written once: everything on it is fixed. */
  function layoutTwo() {
    var a = SD.a, b = SD.a + SD.span;
    var pA = MAIN.pt(a), pB = MAIN.pt(b);
    dom.sdChord.setAttribute('d', lineD(pA, pB));
    dom.sdArcMinor.setAttribute('d', MAIN.arc(a, SD.span));
    dom.sdArcMajor.setAttribute('d', MAIN.arc(b, 360 - SD.span));
    dom.sdMinor.setAttribute('d', MAIN.seg(a, SD.span));
    dom.sdMajor.setAttribute('d', MAIN.arc(b, 360 - SD.span) + ' Z');
    var mid = MAIN.chordMid(a, SD.span);
    [dom.sdClipMinor, dom.sdClipMajor].forEach(function (c) {
      c.setAttribute('cx', mid.x);
      c.setAttribute('cy', mid.y);
    });
    dom.sdDotA.setAttribute('cx', pA.x); dom.sdDotA.setAttribute('cy', pA.y);
    dom.sdDotB.setAttribute('cx', pB.x); dom.sdDotB.setAttribute('cy', pB.y);
    var lm = MAIN.pt(a + SD.span / 2, RR + SD_LABEL_OUT);
    dom.sdLblMinor.setAttribute('x', lm.x);
    dom.sdLblMinor.setAttribute('y', round2(lm.y + LABEL_DY));
    var lM = MAIN.pt(a + SD.span / 2 + 180, RR * SD_LABEL_IN);
    dom.sdLblMajor.setAttribute('x', lM.x);
    dom.sdLblMajor.setAttribute('y', round2(lM.y + LABEL_DY));
  }

  /* How far each clip circle has to grow: the smaller region's own reach,
     and the far side of the circle for the larger. */
  function twoReach() {
    var half = SD.span / 2 * Math.PI / 180;
    var d = RR * Math.cos(half);
    return [MAIN.reach(SD.span), RR + d + 6];
  }

  /* The two pieces drawn a little apart along their own middle lines --
     each region with its piece of the rim -- and back together: "together
     they make the whole circle". */
  function piecesApart(apart) {
    var t = (SD.a + SD.span / 2) * Math.PI / 180;
    var dx = round2(Math.cos(t) * APART), dy = round2(-Math.sin(t) * APART);
    var minor = [dom.sdMinor, dom.sdArcMinor], major = [dom.sdMajor, dom.sdArcMajor];
    var tl = M.timeline({
      willChange: minor.concat(major), willChangeValue: 'transform',
      revert: apart ? null : function () { M.set(minor.concat(major), { clearProps: 'transform' }); }
    });
    if (apart) {
      tl.to(minor, { x: dx, y: dy, duration: M.dur(0.45), ease: 'power2.out' }, 0)
        .to(major, { x: -dx, y: -dy, duration: M.dur(0.45), ease: 'power2.out' }, 0);
    } else {
      tl.to(minor.concat(major), { x: 0, y: 0, duration: M.dur(0.55), ease: M.POP }, 0);
    }
    return tl;
  }

  function sceneTwo() {
    var lines = twoLines();
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle, its colour, and two points on its rim ------------ */
      .then(function () {
        dom.sd.removeAttribute('hidden');
        return Flow.anim(Beats.drawRim(dom.sdRim, dom.sdTip));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.fillDisc(dom.sdDisc)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.sdDotA)); })
      .then(function () { return Flow.wait(200); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.sdDotB)); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- "One chord, two segments." -- the bird comes up; the chord
         grows on its word, and on "two" the regions are coloured in from
         it, each with its piece of the rim, and named ------------------- */
      .then(function () {
        return sayWith(lines.one, [
          { word: 'chord', run: function () {
            return Flow.anim(Beats.growLine(dom.sdChord, CHORD_TIME, 'sine.inOut'));
          } },
          { word: 'two', run: function () {
            return Promise.all([
              Flow.anim(Beats.segReveal({
                minor: dom.sdMinor, major: dom.sdMajor,
                clips: [dom.sdClipMinor, dom.sdClipMajor], reach: twoReach(),
                area: null, dots: [dom.sdDotA, dom.sdDotB]
              })),
              Flow.anim(Beats.growLine(dom.sdArcMinor, 0.7, 'power2.inOut')),
              Flow.wait(380).then(function () {
                return Promise.all([
                  Flow.anim(Beats.growLine(dom.sdArcMajor, 1.0, 'power2.inOut')),
                  /* the two pieces of the rim are the whole rim: the plain
                     one under them goes, so each piece carries its own edge
                     when the two are drawn apart */
                  Flow.anim(Beats.rimTo(dom.sdRim, 0, 0.8))
                ]);
              })
            ]).then(function () {
              return Flow.anim(Beats.labelIn(dom.sdLblMinor));
            }).then(function () {
              return Flow.anim(Beats.labelIn(dom.sdLblMajor));
            });
          } }
        ], { arrive: true });
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(BEAT);
      })

      /* ---- "Together they make the whole circle." -- the two pieces step
         apart on the first word and close back into one disc on "whole" -- */
      .then(function () {
        return sayWith(lines.together, [
          { word: 'Together', run: function () { return Flow.anim(piecesApart(true)); } },
          { word: 'whole',    run: function () { return Flow.anim(piecesApart(false)); } }
        ]);
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(BEAT);
      })

      /* ---- Next -- and only its PRESS sends the bird away, with its line
         and the picture. The header is left open for the next page. ------ */
      .then(function () { return K.handOver(dom.nextBtn); })
      .then(function () {
        if (global.I18n) global.I18n.stop();
        return Promise.all([
          K.mascotJumpOut(true),
          Flow.anim(Beats.lineOut(dom.promptLine)),
          Flow.anim(Beats.clearFigure([dom.sd]))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        dom.sd.setAttribute('hidden', '');
        K.clearInline([dom.sd].concat(
          Array.prototype.slice.call(dom.sd.querySelectorAll('*'))));
      });
  }

  /* ======================================================================
   * Page 5 -- sector minus triangle
   * ====================================================================== */

  /* The picture, written once: everything on it is fixed. */
  function layoutStep() {
    var a = SE.a, b = SE.a + SE.span;
    var o = { x: CX, y: CY };
    var pA = MAIN.pt(a), pB = MAIN.pt(b);
    dom.seSector.setAttribute('d', MAIN.wedge(a, SE.span));
    dom.seTri.setAttribute('d', MAIN.tri(a, SE.span));
    dom.seArc.setAttribute('d', MAIN.arc(a, SE.span));
    dom.seRadA.setAttribute('d', lineD(o, pA));
    dom.seRadB.setAttribute('d', lineD(o, pB));
    dom.seChord.setAttribute('d', lineD(pA, pB));
    dom.seDotA.setAttribute('cx', pA.x); dom.seDotA.setAttribute('cy', pA.y);
    dom.seDotB.setAttribute('cx', pB.x); dom.seDotB.setAttribute('cy', pB.y);
  }

  /* The triangle taken away. Two things at once, on one clock: the green
     triangle slides out of the circle -- through the centre and on, the
     way the chord's middle looks from it -- and fades as it goes; and the
     sector's colour is drawn back from the centre to the chord, its apex
     carried up the triangle's middle line until the tan region is the
     segment and nothing more. The radii go with the triangle: they were
     its two sides. However the timeline ends, the picture is left with
     the segment alone. */
  function removeTriangle() {
    var c = { x: CX, y: CY };
    var m = MAIN.chordMid(SE.a, SE.span);
    var dx = c.x - m.x, dy = c.y - m.y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var far = RR * AWAY;
    var apex = { t: 0 };
    function draw() {
      var p = { x: round2(c.x + (m.x - c.x) * apex.t), y: round2(c.y + (m.y - c.y) * apex.t) };
      dom.seSector.setAttribute('d', 'M' + p.x + ' ' + p.y + ' L' + MAIN.arc(SE.a, SE.span).slice(1) + ' Z');
    }
    var radii = [dom.seRadA, dom.seRadB];
    var tl = M.timeline({
      willChange: [dom.seTri].concat(radii), willChangeValue: 'transform, opacity',
      revert: function () {
        apex.t = 1; draw();
        M.set(dom.seTri, { opacity: 0, clearProps: 'transform' });
        M.set(radii, { opacity: 0 });
      }
    });
    tl.to(dom.seTri, { x: round2(dx / len * far), y: round2(dy / len * far),
                       duration: M.dur(REMOVE_TIME), ease: 'power2.in' }, 0)
      .to(dom.seTri, { opacity: 0, duration: M.dur(0.5), ease: 'power2.in' }, M.gap(REMOVE_TIME - 0.5))
      .to(radii, { opacity: 0, duration: M.dur(0.5), ease: 'power2.in' }, M.gap(0.2))
      .to(apex, { t: 1, duration: M.dur(REMOVE_TIME), ease: 'power2.inOut', onUpdate: draw }, 0);
    tl.call(Beats.pop, null, 0);
    return tl;
  }

  function sceneStep() {
    var L = stepLines();
    var made = null;
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        layoutStep();
        dom.se.removeAttribute('hidden');
      })

      /* ---- "Let's start with a circle and its centre." -- the bird comes
         up; the pen goes round on "circle" and the colour follows, the dot
         lands on "centre" once the ring is closed ------------------------ */
      .then(function () {
        return sayWith(L.start, [
          { word: 'circle', run: function () {
            made = Flow.anim(Beats.drawRim(dom.seRim, dom.seTip))
              .then(function () { return Flow.anim(Beats.fillDisc(dom.seDisc)); });
            return made;
          } },
          { word: 'centre', run: function () {
            return (made || Promise.resolve()).then(function () {
              return Flow.anim(Beats.plotDot(dom.seCentre, DOT_TIME));
            });
          } }
        ], { arrive: true });
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "Mark two points on the circle." -- one on "two", one on
         "points" ------------------------------------------------------------ */
      .then(function () {
        return sayWith(L.points, [
          { word: 'two',    run: function () { return Flow.anim(Beats.plotDot(dom.seDotA)); } },
          { word: 'points', run: function () { return Flow.anim(Beats.plotDot(dom.seDotB)); } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "Join each point to the centre with a radius." -- the radii
         grow out one after the other from "Join" ------------------------- */
      .then(function () {
        return sayWith(L.radii, [
          { word: 'Join', run: function () {
            return grow(dom.seRadA, RADIUS_TIME)
              .then(function () { return Flow.wait(120); })
              .then(function () { return grow(dom.seRadB, RADIUS_TIME); });
          } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "The two radii and the arc enclose a minor sector." -- the
         radii swell on their word, the arc lights on its, and the sector
         is swept in on "enclose" ------------------------------------------- */
      .then(function () {
        return sayWith(L.sector, [
          { word: 'radii',   run: function () { return Flow.anim(Beats.linePulse([dom.seRadA, dom.seRadB])); } },
          { word: 'arc',     run: function () { return Flow.anim(Beats.growLine(dom.seArc, 0.7, 'power2.inOut')); } },
          { word: 'enclose', run: function () {
            return Flow.anim(Beats.secFill(dom.seSector, function (t) { return MAIN.wedge(SE.a, SE.span, t); }, FILL_TIME));
          } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "Now join the two points with a chord." ------------------------ */
      .then(function () {
        return sayWith(L.chord, [
          { word: 'join', run: function () { return grow(dom.seChord, CHORD_TIME); } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "The two radii and the chord make a triangle." -- each side
         swells on its word, and the triangle is coloured in over the
         sector on "make" ------------------------------------------------------ */
      .then(function () {
        return sayWith(L.triangle, [
          { word: 'radii', run: function () { return Flow.anim(Beats.linePulse([dom.seRadA, dom.seRadB])); } },
          { word: 'chord', run: function () { return Flow.anim(Beats.linePulse([dom.seChord])); } },
          { word: 'make',  run: function () {
            return Flow.anim(Beats.secFill(dom.seTri, function (t) { return MAIN.tri(SE.a, SE.span, t); }, 0.7));
          } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "Take the triangle away from the sector." -- on "away" the
         triangle slides out of the circle and the sector's colour draws
         back to the chord --------------------------------------------------- */
      .then(function () {
        return sayWith(L.remove, [
          { word: 'away', run: function () { return Flow.anim(removeTriangle()); } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "What is left is the minor segment." -- its edge swells once -- */
      .then(function () {
        return sayWith(L.left, [
          { word: 'segment', run: function () {
            return Promise.all([
              Flow.anim(Beats.linePulse([dom.seArc], ARC_W)),
              Flow.anim(Beats.linePulse([dom.seChord]))
            ]);
          } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- Next -- and only its PRESS sends the bird away, with its line
         and the picture. The header is left open for the next page. ------ */
      .then(function () { return K.handOver(dom.nextBtn); })
      .then(function () {
        if (global.I18n) global.I18n.stop();
        return Promise.all([
          K.mascotJumpOut(true),
          Flow.anim(Beats.lineOut(dom.promptLine)),
          Flow.anim(Beats.clearFigure([dom.se]))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        dom.se.setAttribute('hidden', '');
        K.clearInline([dom.se].concat(
          Array.prototype.slice.call(dom.se.querySelectorAll('*'))));
        layoutStep();
      });
  }

  /* ======================================================================
   * Page 6 -- the summary: sector − triangle = segment
   * ====================================================================== */

  /* One small circle, built where it stands, with the one region it shows
     -- the marks pages 5 and 11 drew, on a smaller circle. The kinds:
     sector, triangle, segment (page 6) and msector, msegment (page 12);
     `host` is the group it goes into. */
  function buildFig(kind, i, host) {
    var c = circleAt(SF_X[i], SF_CY, SF_R);
    var o = { x: c.cx, y: c.cy };
    var pA = c.pt(SE.a), pB = c.pt(SE.a + SE.span);
    var major = kind === 'msector' || kind === 'msegment';
    var g = el('g', { 'class': 'sf-fig sf-fig--' + kind });
    var f = { kind: kind, g: g, geo: c };
    f.disc = el('circle', { 'class': 'sa-disc', cx: c.cx, cy: c.cy, r: c.r });
    g.appendChild(f.disc);
    var regionClass = kind === 'triangle' ? 'se-tri' : (major ? 'sa-region sa-region--major' : 'sa-region');
    var regionD = kind === 'segment' ? c.seg(SE.a, SE.span)
                : kind === 'msegment' ? c.arc(MJ.a, MJ.span) + ' Z' : '';
    f.region = el('path', { 'class': regionClass, d: regionD });
    g.appendChild(f.region);
    f.radA = f.radB = f.chord = f.arc = f.arcMinor = null;
    if (kind === 'sector' || kind === 'triangle' || kind === 'msector') {
      f.radA = el('path', { 'class': 'sa-radius', d: lineD(o, pA) });
      f.radB = el('path', { 'class': 'sa-radius', d: lineD(o, pB) });
      g.appendChild(f.radA); g.appendChild(f.radB);
    }
    if (kind === 'triangle' || kind === 'segment' || kind === 'msegment') {
      f.chord = el('path', { 'class': 'sa-chord', d: lineD(pA, pB) });
      g.appendChild(f.chord);
    }
    f.rim = el('path', { 'class': 'sa-rim', d: c.rim });
    g.appendChild(f.rim);
    f.tip = el('circle', { 'class': 'rim-tip', cx: c.cx, cy: c.cy - c.r, r: 7 });
    g.appendChild(f.tip);
    if (kind === 'sector' || kind === 'segment') {
      f.arc = el('path', { 'class': 'sa-arc', d: c.arc(SE.a, SE.span) });
      g.appendChild(f.arc);
    }
    if (major) {
      f.arc = el('path', { 'class': 'sa-arc sa-arc--major', d: c.arc(MJ.a, MJ.span) });
      g.appendChild(f.arc);
    }
    if (kind === 'msegment') {
      f.arcMinor = el('path', { 'class': 'sa-arc sa-arc--blue', d: c.arc(SE.a, SE.span) });
      g.appendChild(f.arcMinor);
    }
    f.centre = el('circle', { 'class': 'sa-centre', cx: c.cx, cy: c.cy, r: 5 });
    g.appendChild(f.centre);
    (host || dom.sfFigs).appendChild(g);
    return f;
  }

  /* One small circle made: the ring, the colour, the centre, and then its
     region -- edges first, then the shade. */
  function drawFig(f) {
    var g = f.geo;
    var made = Flow.anim(Beats.drawRim(f.rim, f.tip, { time: SF_RIM }))
      .then(function () { return Flow.wait(100); })
      .then(function () { return Flow.anim(discIn(f.disc)); })
      .then(function () { return Flow.anim(Beats.plotDot(f.centre, 0.3)); })
      .then(function () { return Flow.wait(SHORT); });
    if (f.kind === 'sector' || f.kind === 'msector') {
      var cut = f.kind === 'sector' ? SE : MJ;
      return made
        .then(function () { return grow(f.radA, 0.4); })
        .then(function () { return grow(f.radB, 0.4); })
        .then(function () {
          return Promise.all([
            Flow.anim(Beats.secFill(f.region, function (t) { return g.wedge(cut.a, cut.span, t); }, 0.7)),
            Flow.anim(Beats.growLine(f.arc, 0.7, 'power2.inOut'))
          ]);
        });
    }
    if (f.kind === 'triangle') {
      return made
        .then(function () { return grow(f.radA, 0.4); })
        .then(function () { return grow(f.radB, 0.4); })
        .then(function () { return grow(f.chord, 0.45); })
        .then(function () {
          return Flow.anim(Beats.secFill(f.region, function (t) { return g.tri(SE.a, SE.span, t); }, 0.55));
        });
    }
    return made
      .then(function () { return grow(f.chord, 0.45); })
      .then(function () {
        return Promise.all([
          grow(f.arc, 0.6),
          f.arcMinor ? grow(f.arcMinor, 0.4) : null
        ]);
      })
      .then(function () { return Flow.anim(discIn(f.region)); });
  }

  /* The edges of a small circle's region, swelled once as it is named. */
  function pulseFig(f) {
    var lines = [f.radA, f.radB, f.chord].filter(Boolean);
    return Promise.all([
      lines.length ? Flow.anim(Beats.linePulse(lines)) : null,
      f.arc ? Flow.anim(Beats.linePulse([f.arc], ARC_W)) : null
    ]);
  }

  function sceneSummary() {
    var lines = summaryLines();
    return K.wipeBoard()
      .then(function () { return Flow.wait(SHORT); })

      /* ---- nobody is speaking yet: the header closes and the row is
         drawn into the room that makes -- the sector, "−", the triangle,
         "=", the segment, each named as it is finished -------------------- */
      .then(function () { return Flow.anim(K.collapseHeader(true)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        dom.sf.removeAttribute('hidden');
        return drawFig(figs[0]);
      })
      .then(function () { return Flow.anim(Beats.labelIn(dom.sfLabels[0])); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.sfMinus)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return drawFig(figs[1]); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.sfLabels[1])); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.sfEquals)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return drawFig(figs[2]); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.sfLabels[2])); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- "The segment is what the triangle leaves behind." -- the bird
         comes up (the header opens for it); the segment's edge swells on
         its word and the triangle's on its ------------------------------- */
      .then(function () {
        return sayWith(lines.idea, [
          { word: 'segment',  run: function () { return pulseFig(figs[2]); } },
          { word: 'triangle', run: function () { return pulseFig(figs[1]); } }
        ], { arrive: true });
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "Area of the sector − Area of the triangle = Area of a minor
         segment." -- each figure's edges swell as its name is read ------- */
      .then(function () {
        return sayWith(lines.formula, [
          { word: 'sector',   run: function () { return pulseFig(figs[0]); } },
          { word: 'triangle', run: function () { return pulseFig(figs[1]); } },
          { word: 'segment',  run: function () { return pulseFig(figs[2]); } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- Next -- and only its PRESS sends the bird away, with its line
         and the row; the header closes behind the bird and opens again
         over a clean board ---------------------------------------------- */
      .then(function () { return K.handOver(dom.nextBtn); })
      .then(function () {
        if (global.I18n) global.I18n.stop();
        return Promise.all([
          K.mascotJumpOut(),
          Flow.anim(Beats.lineOut(dom.promptLine)),
          Flow.anim(Beats.clearFigure([dom.sf]))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        dom.sf.setAttribute('hidden', '');
        K.clearInline([dom.sf].concat(
          Array.prototype.slice.call(dom.sf.querySelectorAll('*'))));
        return Flow.anim(K.collapseHeader(false));
      });
  }

  /* ======================================================================
   * Page 7 -- the triangle's area at 90°
   * ====================================================================== */

  /* The picture, written once: everything on it is fixed. */
  function layoutRight() {
    var a = SE.a, b = SE.a + SE.span;
    var o = { x: CX, y: CY };
    var pA = MAIN.pt(a), pB = MAIN.pt(b);
    dom.sgRadA.setAttribute('d', lineD(o, pA));
    dom.sgRadB.setAttribute('d', lineD(o, pB));
    dom.sgChord.setAttribute('d', lineD(pB, pA));
    dom.sgTri.setAttribute('d', MAIN.tri(a, SE.span));
    /* the square in the corner: out along one radius, across, and down
       onto the other -- drawn the way a pencil would */
    var k = SG_MARK;
    dom.sgMark.setAttribute('d',
      'M' + (CX + k) + ' ' + CY + ' L' + (CX + k) + ' ' + (CY - k) + ' L' + CX + ' ' + (CY - k));
    /* "r" under the level radius, and left of the upright one */
    dom.sgRA.setAttribute('x', round2((CX + pA.x) / 2));
    dom.sgRA.setAttribute('y', round2(CY + SG_R_OFF + LABEL_DY + 6));
    dom.sgRB.setAttribute('x', round2(CX - SG_R_OFF - 4));
    dom.sgRB.setAttribute('y', round2((CY + pB.y) / 2 + LABEL_DY));
    dom.sgDeg.setAttribute('x', SG_DEG.x);
    dom.sgDeg.setAttribute('y', SG_DEG.y);
  }

  /* The right answer pressed: the triangle's two legs swell -- they are
     its base and its height -- and its colour deepens once and settles. */
  function showLegs() {
    var tl = M.timeline({ willChange: dom.sgTri, willChangeValue: 'opacity' });
    tl.to(dom.sgTri, { opacity: 0.55, duration: M.dur(0.18), ease: 'power2.out' })
      .to(dom.sgTri, { opacity: 1, duration: M.dur(0.4), ease: 'power2.out' });
    return Promise.all([
      Flow.anim(Beats.linePulse([dom.sgRadA, dom.sgRadB])),
      Flow.anim(Beats.labelIn(dom.sgRA)),
      Flow.anim(Beats.labelIn(dom.sgRB)),
      Flow.anim(tl)
    ]);
  }

  function sceneRight() {
    var lines = rightLines();
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle: the pen round the rim, the colour poured in, and
         the centre dot ----------------------------------------------------- */
      .then(function () {
        layoutRight();
        dom.sg.removeAttribute('hidden');
        return Flow.anim(Beats.drawRim(dom.sgRim, dom.sgTip));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.fillDisc(dom.sgDisc)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.sgCentre, DOT_TIME)); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- one radius out to three o'clock, and its "r" ------------------- */
      .then(function () { return grow(dom.sgRadA, RADIUS_TIME); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.sgRA)); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the other up to twelve, and its "r" ----------------------------- */
      .then(function () { return grow(dom.sgRadB, RADIUS_TIME); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.sgRB)); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the right angle between them, and "90°" ------------------------ */
      .then(function () { return grow(dom.sgMark, 0.5); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.sgDeg)); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the chord across, and the triangle the three lines make,
         coloured in from one radius to the other ---------------------------- */
      .then(function () { return grow(dom.sgChord, CHORD_TIME); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Flow.anim(Beats.secFill(dom.sgTri, function (t) { return MAIN.tri(SE.a, SE.span, t); }, FILL_TIME));
      })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- and the figure stands aside -------------------------------------
         There is no bird on the header, so it closes while the figure
         slides smoothly to the left half. */
      .then(function () {
        return Promise.all([
          Flow.anim(K.collapseHeader(true)),
          Flow.anim(Beats.slideArcs(dom.sg, SHIFT))
        ]);
      })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the bird up in the pane, the question from bubble-02, the three
         answers one by one, the press, and the verdict (circum.js) ------- */
      .then(function () {
        return C.ask({
          ask: lines.ask, options: lines.options, answer: lines.answer,
          wrong: lines.wrong, right: lines.right,
          reveal: showLegs
        });
      })

      /* ---- Next -- and only its PRESS sends the bird away, with the box,
         the pills and the figure; the header opens again over a clean
         board (closeOut, circum.js). ----------------------------------- */
      .then(function () { return C.closeOut(dom.sg); })
      .then(layoutRight);
  }

  /* ======================================================================
   * Pages 8 and 9 -- the figure they share
   * ====================================================================== */

  /* The picture, written once: everything on it is fixed but the length,
     which each page writes as it opens. */
  function layoutSeg() {
    var a = SE.a, b = SE.a + SE.span;
    var o = { x: CX, y: CY };
    var pA = MAIN.pt(a), pB = MAIN.pt(b);
    dom.shSeg.setAttribute('d', MAIN.seg(a, SE.span));
    dom.shArc.setAttribute('d', MAIN.arc(a, SE.span));
    dom.shRadA.setAttribute('d', lineD(o, pA));
    dom.shRadB.setAttribute('d', lineD(o, pB));
    dom.shChord.setAttribute('d', lineD(pB, pA));
    var k = SG_MARK;
    dom.shMark.setAttribute('d',
      'M' + (CX + k) + ' ' + CY + ' L' + (CX + k) + ' ' + (CY - k) + ' L' + CX + ' ' + (CY - k));
    dom.shDotA.setAttribute('cx', pA.x); dom.shDotA.setAttribute('cy', pA.y);
    dom.shDotB.setAttribute('cx', pB.x); dom.shDotB.setAttribute('cy', pB.y);
    dom.shLen.setAttribute('x', round2((CX + pA.x) / 2));
    dom.shLen.setAttribute('y', round2(CY + SH_LEN_DY + LABEL_DY));
    dom.shDeg.setAttribute('x', SH_DEG.x);
    dom.shDeg.setAttribute('y', SH_DEG.y);
  }

  /* The figure made, a mark at a time: the circle and its centre, the
     level radius with its length, the upright radius, the right angle
     with its "90°", the chord, and the arc lit as the segment is
     coloured in between chord and arc. `lenKey` is the length's key. */
  function drawSeg(lenKey) {
    layoutSeg();
    dom.shLen.textContent = T(lenKey);
    dom.sh.removeAttribute('hidden');
    return Flow.anim(Beats.drawRim(dom.shRim, dom.shTip))
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.fillDisc(dom.shDisc)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.shCentre, DOT_TIME)); })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.shDotA)); })
      .then(function () { return grow(dom.shRadA, RADIUS_TIME); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.shLen)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.shDotB)); })
      .then(function () { return grow(dom.shRadB, RADIUS_TIME); })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return grow(dom.shMark, 0.5); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.shDeg)); })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return grow(dom.shChord, CHORD_TIME); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Promise.all([
          Flow.anim(Beats.growLine(dom.shArc, FILL_TIME, 'power2.inOut')),
          Flow.anim(discIn(dom.shSeg))
        ]);
      })
      .then(function () { return Flow.anim(Beats.arcPulse([dom.shArc])); })
      .then(function () { return Flow.wait(BEAT); });
  }

  /* The region a step is about, lit on the figure: its edges swell twice,
     so the eye is taken to the thing the step is asking for. */
  function segMarks(which) {
    if (which === 'sector')   return { lines: [dom.shRadA, dom.shRadB], arcs: [dom.shArc] };
    if (which === 'triangle') return { lines: [dom.shRadA, dom.shRadB, dom.shChord], arcs: [] };
    return { lines: [dom.shChord], arcs: [dom.shArc] };
  }
  function spotlight(which) { return spotlightOn(segMarks(which)); }
  function spotlightOn(m) {
    var tl = M.timeline({
      revert: function () { M.set(m.lines.concat(m.arcs), { clearProps: 'strokeWidth' }); }
    });
    [0, 0.8].forEach(function (at) {
      if (m.lines.length) {
        tl.to(m.lines, { strokeWidth: 4 * 1.9, duration: M.dur(0.26), ease: 'power2.out' }, M.gap(at))
          .to(m.lines, { strokeWidth: 4, duration: M.dur(0.5), ease: M.POP }, M.gap(at + 0.26));
      }
      if (m.arcs.length) {
        tl.to(m.arcs, { strokeWidth: ARC_W * 1.6, duration: M.dur(0.26), ease: 'power2.out' }, M.gap(at))
          .to(m.arcs, { strokeWidth: ARC_W, duration: M.dur(0.5), ease: M.POP }, M.gap(at + 0.26));
      }
    });
    return Flow.anim(tl);
  }

  /* ======================================================================
   * Page 8 -- the segment, worked: three lines, three dropdowns
   * ----------------------------------------------------------------------
   * Skill 2's worked pages' own kit (practice.js), on this skill's pane:
   * a line rises in with an empty box; the box is a button that drops
   * its menu of three values open at once; a wrong value is refused --
   * the pill shakes, turns red and is spent, and the bird says why from
   * the header as the region it names lights on the figure -- and the
   * right one lands in the line, the box dissolving round it.
   * ====================================================================== */
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function cells(line) { return all('.ps-t, .ps-n, .ps-d, .ps-slot__v', line); }

  function lineIn(line) {
    line.removeAttribute('hidden');
    M.set(line, { opacity: 0, y: 14 });
    var tl = M.timeline({ willChange: line, willChangeValue: 'transform, opacity' });
    tl.to(line, { opacity: 1, y: 0, duration: M.dur(0.45), ease: M.OUT });
    return Flow.anim(tl);
  }

  /* The menu dropping open: the card comes down a little as it fades up,
     and the values drop in under one another. And closing: the values go
     a beat apart, the card after them. */
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

  /* A menu hangs under its box's left edge, unless that would carry it
     past the pane's edge -- the box at the end of a line -- in which case
     it hangs under the right edge instead. */
  function alignMenu(menu, cell) {
    var pane = menu.closest('.ps-pane').getBoundingClientRect();
    var at = cell.getBoundingClientRect();
    var w = menu.getBoundingClientRect().width;
    menu.classList.toggle('is-right', at.left + w > pane.right - 4);
  }

  /* A wrong value, refused from the header: "Not quite!" and then, as the
     region lights on the figure, why. A newer hint, or the right value,
     takes the header over. */
  function refuse(spec, name) {
    var lines = spec.wrong[name];
    if (!lines) return Promise.resolve();
    var mine = ++hinting;
    function live() { return mine === hinting; }
    hintUp = true;
    return K.speak(lines[0], 'confused')
      .then(function () { if (live()) return Flow.wait(HINT_READ); })
      .then(function () {
        if (!live()) return;
        K.quiet(spec.light());
        return K.speak(lines[1], 'confused');
      });
  }
  /* A hint still standing when the right value is pressed goes at once. */
  function dropHint() {
    hinting++;
    if (!hintUp) return;
    hintUp = false;
    K.quiet(Flow.anim(Beats.lineOut(dom.promptLine)).then(function () { K.clearPrompt(); }));
  }

  /* What a value does when it is pressed: the right one turns green and
     fires the gate; a wrong one shakes, turns red, is spent, and is
     explained. */
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
    btn.classList.add('is-done');
    Beats.choiceWrong(btn);
    K.quiet(refuse(spec, btn.dataset.name));
  }
  function fillInDrop(spec) {
    for (var i = 0; i < dropOpts.length; i++) {
      if (dropOpts[i].dataset.name === spec.answer &&
          !dropOpts[i].classList.contains('is-right')) {
        dropOpts[i].classList.add('is-right');
        return;
      }
    }
  }

  /* The dropdown: the box live with its chevron, its menu open at once; a
     press on the box closes and reopens it; a value pressed as above.
     Resolves through the lesson's gate; a skip lights the right value. */
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
      if (!dropOpts.length) {
        dropOpts = K.buildChoices(menu, K.shuffle(spec.options));
        dropOpts.forEach(function (b) { b.addEventListener('click', onPick); });
      }
      alignMenu(menu, cell);
      K.quiet(Flow.anim(menuIn(menu, dropOpts)));
    }
    function hide() {
      if (!open) return;
      open = false;
      slot.setAttribute('aria-expanded', 'false');
      K.quiet(Flow.anim(menuOut(menu, dropOpts)).then(function () {
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
      dropOpts.forEach(function (b) {
        b.removeEventListener('click', onPick);
        b.classList.add('is-done');
      });
    }

    slot.classList.add('is-live');
    slot.setAttribute('tabindex', '0');
    slot.addEventListener('click', onSlot);
    show();

    return Flow.once(dom.gate, { auto: true }).then(
      function () { fillInDrop(spec); off(); },
      function (err) { off(); throw err; });
  }

  /* The right value, in: it pops into the box as the menu goes; then the
     box dissolves and Flip plays the line closing up round the number. */
  function land(spec) {
    var slot = spec.slot, v = slot.querySelector('.ps-slot__v');
    slot.classList.remove('is-live');
    global.MathText.write(v, spec.answer);
    var pop = M.timeline({ willChange: v, willChangeValue: 'transform, opacity' });
    pop.fromTo(v, { opacity: 0, scale: 0.5 },
               { opacity: 1, scale: 1, duration: M.dur(0.4), ease: 'back.out(1.7)' });
    return Promise.all([Flow.anim(pop), Flow.anim(menuOut(spec.menu, dropOpts))])
      .then(function () {
        spec.menu.setAttribute('hidden', '');
        spec.menu.textContent = '';
        dropOpts = [];
        return Flow.wait(220);
      })
      .then(function () {
        var moved = cells(spec.line);
        return Flow.anim(M.relayout(moved, function () {
          slot.classList.add('is-filled');
        }, { nested: true, scale: false, vars: { duration: M.dur(0.45), ease: M.INOUT } }));
      });
  }

  /* One step: the bird says what to choose -- coming up onto the header
     for the first, from where it stands for the rest -- the line rises in
     with its box, the menu drops open, and the right value lands. */
  function dropStep(spec, first) {
    return (first
      ? K.arriveSaying(spec.ask).then(function () { mascot.settle(); })
      : K.speak(spec.ask))
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return lineIn(spec.line); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return armDrop(spec); })
      .then(function () { return land(spec); })
      .then(function () { return Flow.wait(STEP_GAP); });
  }

  /* The working away, once Next is pressed -- or a wipe catches it up. */
  function linesOut(lines) {
    var shown = lines.filter(function (l) { return !l.hasAttribute('hidden'); });
    var tl = M.timeline({ willChange: shown.concat(dropOpts), willChangeValue: 'transform, opacity' });
    if (shown.length) {
      tl.to(shown, { opacity: 0, y: 8, duration: M.dur(0.3), ease: M.IN, stagger: M.gap(0.06) }, 0);
    }
    if (dropOpts.length) {
      tl.to(dropOpts, { opacity: 0, y: 10, scale: 0.94, duration: M.dur(0.3), ease: M.IN,
                        stagger: M.gap(0.08) }, 0);
    }
    return tl;
  }

  /* The pane's working put away: every line hidden and plain again, every
     box empty and a box once more, every menu shut and emptied. */
  function restoreWorked(pane, lines) {
    hinting++;
    hintUp = false;
    pane.setAttribute('hidden', '');
    lines.forEach(function (l) { l.setAttribute('hidden', ''); });
    all('.is-filled, .is-live, .is-right', pane).forEach(function (el) {
      el.classList.remove('is-filled', 'is-live', 'is-right');
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
    dropOpts = [];
  }

  function sceneWorked() {
    var S = workedSteps();
    var end = workedClose();
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the figure, r = 14 cm ------------------------------------------- */
      .then(function () { return drawSeg('val14cm'); })

      /* ---- it stands aside. The header stays open: the bird comes up onto
         it for the first step and stays for the page ---------------------- */
      .then(function () { return Flow.anim(Beats.slideArcs(dom.sh, SHIFT)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { dom.swPane.removeAttribute('hidden'); })

      /* ---- the sector, the triangle, the segment -- one line each ------- */
      .then(function () { return dropStep(S[0], true); })
      .then(function () { return dropStep(S[1], false); })
      .then(function () { return dropStep(S[2], false); })

      /* ---- well done, and the check -------------------------------------- */
      .then(function () { return K.speak(end.done, 'happy'); })
      .then(function () { return Flow.wait(HINT_READ); })
      .then(function () {
        return sayWith(end.check, [
          { word: 'smaller', run: function () { return spotlight('segment'); } },
          { word: 'sector',  run: function () { return spotlight('sector'); } }
        ], { mood: 'happy' });
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- Next -- and only its PRESS sends the bird away, with its line,
         the working and the figure, all at once. The header is left open. */
      .then(function () { return K.handOver(dom.nextBtn); })
      .then(function () {
        hinting++;
        if (global.I18n) global.I18n.stop();
        return Promise.all([
          K.mascotJumpOut(true),
          Flow.anim(Beats.lineOut(dom.promptLine)),
          Flow.anim(linesOut(dom.swAll)),
          Flow.anim(Beats.clearFigure([dom.sh]))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        restoreWorked(dom.swPane, dom.swAll);
        dom.sh.setAttribute('hidden', '');
        K.clearInline([dom.sh].concat(
          Array.prototype.slice.call(dom.sh.querySelectorAll('*'))));
        layoutSeg();
      });
  }

  /* ======================================================================
   * Page 9 -- the segment, asked
   * ====================================================================== */
  function sceneAsked() {
    var lines = askedLines();
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the figure, r = 7 cm -------------------------------------------- */
      .then(function () { return drawSeg('val7cm'); })

      /* ---- it stands aside, the header closing: no bird stands on it this
         page, it asks from the pane ---------------------------------------- */
      .then(function () {
        return Promise.all([
          Flow.anim(K.collapseHeader(true)),
          Flow.anim(Beats.slideArcs(dom.sh, SHIFT))
        ]);
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return C.ask({
          ask: lines.ask, options: lines.options, answer: lines.answer,
          wrong: lines.wrong, right: lines.right,
          reveal: function () { return spotlight('segment'); }
        });
      })
      .then(function () { return C.closeOut(dom.sh); })
      .then(layoutSeg);
  }

  /* ======================================================================
   * Page 10 -- the segment from its parts
   * ====================================================================== */
  function sceneFromParts() {
    var lines = partsLines();
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return drawSeg('val14cm'); })
      .then(function () {
        return Promise.all([
          Flow.anim(K.collapseHeader(true)),
          Flow.anim(Beats.slideArcs(dom.sh, SHIFT))
        ]);
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return C.ask({
          ask: lines.ask, options: lines.options, answer: lines.answer,
          wrong: lines.wrong, right: lines.right,
          reveal: function () { return spotlight('segment'); }
        });
      })
      .then(function () { return C.closeOut(dom.sh); })
      .then(layoutSeg);
  }

  /* ======================================================================
   * Pages 13 and 14 -- the major figure they share
   * ====================================================================== */

  /* How far a clip circle on the chord's middle has to grow to take in the
     larger piece: the far side of the circle. */
  function majorReach() {
    return RR + RR * Math.cos(SE.span / 2 * Math.PI / 180) + 6;
  }

  /* The picture, written once: everything on it is fixed but the length. */
  function layoutMajor() {
    var a = SE.a, b = SE.a + SE.span;
    var o = { x: CX, y: CY };
    var pA = MAIN.pt(a), pB = MAIN.pt(b);
    dom.siMajor.setAttribute('d', MAIN.arc(MJ.a, MJ.span) + ' Z');
    dom.siMinor.setAttribute('d', MAIN.seg(a, SE.span));
    dom.siArcMajor.setAttribute('d', MAIN.arc(MJ.a, MJ.span));
    dom.siArcMinor.setAttribute('d', MAIN.arc(a, SE.span));
    dom.siRadA.setAttribute('d', lineD(o, pA));
    dom.siRadB.setAttribute('d', lineD(o, pB));
    dom.siChord.setAttribute('d', lineD(pB, pA));
    var k = SG_MARK;
    dom.siMark.setAttribute('d',
      'M' + (CX + k) + ' ' + CY + ' L' + (CX + k) + ' ' + (CY - k) + ' L' + CX + ' ' + (CY - k));
    dom.siDotA.setAttribute('cx', pA.x); dom.siDotA.setAttribute('cy', pA.y);
    dom.siDotB.setAttribute('cx', pB.x); dom.siDotB.setAttribute('cy', pB.y);
    dom.siLen.setAttribute('x', round2((CX + pA.x) / 2));
    dom.siLen.setAttribute('y', round2(CY + SH_LEN_DY + LABEL_DY));
    dom.siDeg.setAttribute('x', SH_DEG.x);
    dom.siDeg.setAttribute('y', SH_DEG.y);
    var mid = MAIN.chordMid(a, SE.span);
    dom.siClip.setAttribute('cx', mid.x);
    dom.siClip.setAttribute('cy', mid.y);
  }

  /* The figure made as page 8's is, and then the other piece: the small
     arc lit in blue over its pale segment, and the major arc swept round
     as the major segment is coloured in from the chord. */
  function drawMajor(lenKey) {
    layoutMajor();
    dom.siLen.textContent = T(lenKey);
    dom.si.removeAttribute('hidden');
    return Flow.anim(Beats.drawRim(dom.siRim, dom.siTip))
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.fillDisc(dom.siDisc)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.siCentre, DOT_TIME)); })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.siDotA)); })
      .then(function () { return grow(dom.siRadA, RADIUS_TIME); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.siLen)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.siDotB)); })
      .then(function () { return grow(dom.siRadB, RADIUS_TIME); })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return grow(dom.siMark, 0.5); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.siDeg)); })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return grow(dom.siChord, CHORD_TIME); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Promise.all([
          Flow.anim(Beats.growLine(dom.siArcMinor, 0.6, 'power2.inOut')),
          Flow.anim(discIn(dom.siMinor))
        ]);
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Promise.all([
          Flow.anim(Beats.growLine(dom.siArcMajor, 1.1, 'power2.inOut')),
          Flow.anim(Beats.segFill(dom.siMajor, dom.siClip, majorReach(), 1.0))
        ]);
      })
      .then(function () { return Flow.anim(Beats.arcPulse([dom.siArcMajor])); })
      .then(function () { return Flow.wait(BEAT); });
  }

  /* The region a step is about, on the major figure. */
  function majorMarks(which) {
    if (which === 'msector')  return { lines: [dom.siRadA, dom.siRadB], arcs: [dom.siArcMajor] };
    if (which === 'triangle') return { lines: [dom.siRadA, dom.siRadB, dom.siChord], arcs: [] };
    if (which === 'minor')    return { lines: [dom.siChord], arcs: [dom.siArcMinor] };
    if (which === 'whole')    return { lines: [dom.siRim], arcs: [] };
    return { lines: [dom.siChord], arcs: [dom.siArcMajor] };
  }

  /* ======================================================================
   * Page 11 -- the major segment: the sector with the triangle put back
   * ====================================================================== */

  /* The picture, written once. */
  function layoutMajorAnim() {
    var a = SE.a, b = SE.a + SE.span;
    var o = { x: CX, y: CY };
    var pA = MAIN.pt(a), pB = MAIN.pt(b);
    dom.sjMajor.setAttribute('d', MAIN.arc(MJ.a, MJ.span) + ' Z');
    dom.sjTri.setAttribute('d', MAIN.tri(a, SE.span));
    dom.sjArcMajor.setAttribute('d', MAIN.arc(MJ.a, MJ.span));
    dom.sjArcMinor.setAttribute('d', MAIN.arc(a, SE.span));
    dom.sjRadA.setAttribute('d', lineD(o, pA));
    dom.sjRadB.setAttribute('d', lineD(o, pB));
    dom.sjChord.setAttribute('d', lineD(pB, pA));
    dom.sjDotA.setAttribute('cx', pA.x); dom.sjDotA.setAttribute('cy', pA.y);
    dom.sjDotB.setAttribute('cx', pB.x); dom.sjDotB.setAttribute('cy', pB.y);
    var mid = MAIN.chordMid(a, SE.span);
    dom.sjClip.setAttribute('cx', mid.x);
    dom.sjClip.setAttribute('cy', mid.y);
  }

  /* The bigger piece drawn back to the major sector: its apex carried
     from the chord's middle to the centre, so what was the segment is
     seen to become the sector with the triangle's room left empty. */
  function drawBack() {
    var c = { x: CX, y: CY };
    var m = MAIN.chordMid(SE.a, SE.span);
    var apex = { t: 0 };
    function draw() {
      var p = { x: round2(m.x + (c.x - m.x) * apex.t), y: round2(m.y + (c.y - m.y) * apex.t) };
      dom.sjMajor.setAttribute('d', 'M' + p.x + ' ' + p.y + ' L' + MAIN.arc(MJ.a, MJ.span).slice(1) + ' Z');
    }
    var tl = M.timeline({ revert: function () { apex.t = 1; draw(); } });
    tl.to(apex, { t: 1, duration: M.dur(PUT_TIME), ease: 'power2.inOut', onUpdate: draw });
    return tl;
  }

  /* The triangle put back on: it comes in from outside the circle, along
     the chord's middle line, and settles into its room between the radii
     with a pop. However the timeline ends, it is in place. */
  function putBack() {
    var c = { x: CX, y: CY };
    var m = MAIN.chordMid(SE.a, SE.span);
    var dx = m.x - c.x, dy = m.y - c.y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var far = RR * TRI_IN;
    M.set(dom.sjTri, { x: round2(dx / len * far), y: round2(dy / len * far), opacity: 0 });
    var tl = M.timeline({
      willChange: dom.sjTri, willChangeValue: 'transform, opacity',
      revert: function () { M.set(dom.sjTri, { opacity: 1, clearProps: 'transform' }); }
    });
    tl.to(dom.sjTri, { opacity: 1, duration: M.dur(0.3), ease: 'power2.out' }, 0)
      .to(dom.sjTri, { x: 0, y: 0, duration: M.dur(PUT_TIME), ease: 'power2.out' }, 0)
      .to(dom.sjTri, { scale: 1.05, transformOrigin: 'center center', duration: M.dur(0.14), ease: 'power2.out' }, M.gap(PUT_TIME))
      .to(dom.sjTri, { scale: 1, duration: M.dur(0.4), ease: M.POP }, M.gap(PUT_TIME + 0.14));
    tl.call(Beats.pop, null, M.gap(PUT_TIME));
    return tl;
  }

  function sceneMajor() {
    var L = majorLines();
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle, its centre, two points, and the chord ------------- */
      .then(function () {
        layoutMajorAnim();
        dom.sj.removeAttribute('hidden');
        return Flow.anim(Beats.drawRim(dom.sjRim, dom.sjTip));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.fillDisc(dom.sjDisc)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.sjCentre, DOT_TIME)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.sjDotA)); })
      .then(function () { return Flow.wait(160); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.sjDotB)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return grow(dom.sjChord, CHORD_TIME); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- "Now the bigger piece: the major segment." -- the bird comes
         up; the bigger piece is coloured in from the chord on "bigger",
         and its arc lights on "major" ------------------------------------- */
      .then(function () {
        return sayWith(L.big, [
          { word: 'bigger', run: function () {
            return Flow.anim(Beats.segFill(dom.sjMajor, dom.sjClip, majorReach(), FILL_TIME));
          } },
          { word: 'major', run: function () {
            return Flow.anim(Beats.growLine(dom.sjArcMajor, 1.0, 'power2.inOut'))
              .then(function () { return Flow.anim(Beats.arcPulse([dom.sjArcMajor])); });
          } }
        ], { arrive: true });
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "It is the major sector with the triangle put back on." -- on
         "major" the radii grow and the colour draws back to the sector,
         leaving the triangle's room; on "triangle" the triangle comes in
         from outside and settles into it; on "back" its three sides swell */
      .then(function () {
        return sayWith(L.back, [
          { word: 'major', run: function () {
            return Promise.all([
              grow(dom.sjRadA, PUT_TIME),
              grow(dom.sjRadB, PUT_TIME),
              Flow.anim(drawBack())
            ]);
          } },
          { word: 'triangle', run: function () { return Flow.anim(putBack()); } },
          { word: 'back', run: function () {
            return Flow.anim(Beats.linePulse([dom.sjRadA, dom.sjRadB, dom.sjChord]));
          } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- Next -- and only its PRESS sends the bird away, with its line
         and the picture. The header is left open for the next page. ------ */
      .then(function () { return K.handOver(dom.nextBtn); })
      .then(function () {
        if (global.I18n) global.I18n.stop();
        return Promise.all([
          K.mascotJumpOut(true),
          Flow.anim(Beats.lineOut(dom.promptLine)),
          Flow.anim(Beats.clearFigure([dom.sj]))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        dom.sj.setAttribute('hidden', '');
        K.clearInline([dom.sj].concat(
          Array.prototype.slice.call(dom.sj.querySelectorAll('*'))));
        layoutMajorAnim();
      });
  }

  /* ======================================================================
   * Page 12 -- the recap: major sector + triangle = major segment
   * ====================================================================== */
  function sceneMajorSummary() {
    var L = majorSumLines();
    return K.wipeBoard()
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(K.collapseHeader(true)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        dom.sk.removeAttribute('hidden');
        return drawFig(kfigs[0]);
      })
      .then(function () { return Flow.anim(Beats.labelIn(dom.skLabels[0])); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.skPlus)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return drawFig(kfigs[1]); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.skLabels[1])); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.skEquals)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return drawFig(kfigs[2]); })
      .then(function () { return Flow.anim(Beats.labelIn(dom.skLabels[2])); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- "Major segment = major sector + triangle." -- each figure
         swells on its name ---------------------------------------------- */
      .then(function () {
        return sayWith(L.sum, [
          { word: 'Major',    run: function () { return pulseFig(kfigs[2]); } },
          { word: 'sector',   run: function () { return pulseFig(kfigs[0]); } },
          { word: 'triangle', run: function () { return pulseFig(kfigs[1]); } }
        ], { arrive: true });
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "Or simply πr² − minor segment." -- the whole rim swells on
         πr², the small blue piece on "minor" ------------------------------ */
      .then(function () {
        return sayWith(L.or, [
          { word: 'πr²',   run: function () { return Flow.anim(Beats.linePulse([kfigs[2].rim], 3.4)); } },
          { word: 'minor', run: function () {
            return Promise.all([
              Flow.anim(Beats.linePulse([kfigs[2].arcMinor], ARC_W)),
              Flow.anim(Beats.linePulse([kfigs[2].chord]))
            ]);
          } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      .then(function () { return K.handOver(dom.nextBtn); })
      .then(function () {
        if (global.I18n) global.I18n.stop();
        return Promise.all([
          K.mascotJumpOut(),
          Flow.anim(Beats.lineOut(dom.promptLine)),
          Flow.anim(Beats.clearFigure([dom.sk]))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        dom.sk.setAttribute('hidden', '');
        K.clearInline([dom.sk].concat(
          Array.prototype.slice.call(dom.sk.querySelectorAll('*'))));
        return Flow.anim(K.collapseHeader(false));
      });
  }

  /* ======================================================================
   * Page 13 -- the major segment, worked
   * ====================================================================== */
  function sceneMajorWorked() {
    var S = majorSteps();
    var end = majorClose();
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return drawMajor('val14cm'); })
      .then(function () { return Flow.anim(Beats.slideArcs(dom.si, SHIFT)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { dom.sxPane.removeAttribute('hidden'); })
      .then(function () { return dropStep(S[0], true); })
      .then(function () { return dropStep(S[1], false); })
      .then(function () { return dropStep(S[2], false); })
      .then(function () { return K.speak(end.done, 'happy'); })
      .then(function () { return Flow.wait(HINT_READ); })

      /* ---- "Check it both ways: 56 + 560 = 616 = πr². The two segments
         tile the whole circle." -- the small piece on 56, the big one on
         560, the whole rim on 616 ----------------------------------------- */
      .then(function () {
        return sayWith(end.check, [
          { word: '56',  run: function () { return spotlightOn(majorMarks('minor')); } },
          { word: '560', run: function () { return spotlightOn(majorMarks('msegment')); } },
          { word: '616', run: function () { return spotlightOn(majorMarks('whole')); } }
        ], { mood: 'happy' });
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      .then(function () { return K.handOver(dom.nextBtn); })
      .then(function () {
        hinting++;
        if (global.I18n) global.I18n.stop();
        return Promise.all([
          K.mascotJumpOut(true),
          Flow.anim(Beats.lineOut(dom.promptLine)),
          Flow.anim(linesOut(dom.sxAll)),
          Flow.anim(Beats.clearFigure([dom.si]))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        restoreWorked(dom.sxPane, dom.sxAll);
        dom.si.setAttribute('hidden', '');
        K.clearInline([dom.si].concat(
          Array.prototype.slice.call(dom.si.querySelectorAll('*'))));
        layoutMajor();
      });
  }

  /* ======================================================================
   * Page 14 -- the major segment, asked
   * ====================================================================== */
  function sceneMajorAsked() {
    var lines = majorAskedLines();
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return drawMajor('val7cm'); })
      .then(function () {
        return Promise.all([
          Flow.anim(K.collapseHeader(true)),
          Flow.anim(Beats.slideArcs(dom.si, SHIFT))
        ]);
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return C.ask({
          ask: lines.ask, options: lines.options, answer: lines.answer,
          wrong: lines.wrong, right: lines.right,
          reveal: function () { return spotlightOn(majorMarks('msegment')); }
        });
      })
      .then(function () { return C.closeOut(dom.si); })
      .then(layoutMajor);
  }

  /* ======================================================================
   * Pages 15 and 16 -- two stories
   * ====================================================================== */

  /* The right-angle mark at the centre between the radii at `a` and `b`:
     a small square with its sides along the two radii. */
  function markD(a, b) {
    var c = { x: CX, y: CY };
    var p = MAIN.pt(a, SG_MARK), q = MAIN.pt(b, SG_MARK);
    var m = { x: round2(p.x + q.x - c.x), y: round2(p.y + q.y - c.y) };
    return 'M' + p.x + ' ' + p.y + ' L' + m.x + ' ' + m.y + ' L' + q.x + ' ' + q.y;
  }

  /* The pipe, written once. */
  function layoutPipe() {
    var a = PIPE.a, b = PIPE.a + PIPE.span, mid = a + PIPE.span / 2;
    var o = { x: CX, y: CY };
    var pA = MAIN.pt(a), pB = MAIN.pt(b);
    dom.slSeg.setAttribute('d', MAIN.seg(a, PIPE.span));
    dom.slArc.setAttribute('d', MAIN.arc(a, PIPE.span));
    dom.slRadA.setAttribute('d', lineD(o, pA));
    dom.slRadB.setAttribute('d', lineD(o, pB));
    dom.slChord.setAttribute('d', lineD(pA, pB));
    dom.slMark.setAttribute('d', markD(a, b));
    /* the length along the left radius, outside the sector, reading up
       the line: the text is set at the radius's middle and turned with
       it by the group round it, so the pop on the text itself is left
       alone */
    var lm = MAIN.pt(a, RR / 2);
    var off = MAIN.pt(a - 90, PIPE_LEN_OFF);
    var lx = round2(lm.x + off.x - CX), ly = round2(lm.y + off.y - CY + LABEL_DY);
    dom.slLen.setAttribute('x', lx);
    dom.slLen.setAttribute('y', ly);
    dom.slLenG.setAttribute('transform', 'rotate(-45 ' + lx + ' ' + ly + ')');
    var d = MAIN.pt(mid, PIPE_DEG_R);
    dom.slDeg.setAttribute('x', d.x);
    dom.slDeg.setAttribute('y', round2(d.y + LABEL_DY));
    var w = MAIN.pt(mid, PIPE_WORD_R);
    dom.slWord.setAttribute('x', w.x);
    dom.slWord.setAttribute('y', round2(w.y + LABEL_DY));
  }

  /* The bed, written once: the quarter, as page 8's figure. */
  function layoutBed() {
    var a = SE.a, b = SE.a + SE.span;
    var o = { x: CX, y: CY };
    var pA = MAIN.pt(a), pB = MAIN.pt(b);
    dom.smSeg.setAttribute('d', MAIN.seg(a, SE.span));
    dom.smArc.setAttribute('d', MAIN.arc(a, SE.span));
    dom.smRadA.setAttribute('d', lineD(o, pA));
    dom.smRadB.setAttribute('d', lineD(o, pB));
    dom.smChord.setAttribute('d', lineD(pB, pA));
    dom.smMark.setAttribute('d', markD(a, b));
    dom.smLen.setAttribute('x', round2((CX + pA.x) / 2));
    dom.smLen.setAttribute('y', round2(CY + SH_LEN_DY + LABEL_DY));
    dom.smDeg.setAttribute('x', SH_DEG.x);
    dom.smDeg.setAttribute('y', SH_DEG.y);
  }

  /* The bird springs off the header with its line -- the header closes
     behind it -- as the figure slides left; then it comes up in the pane
     to ask (circum.js). */
  function askFromPane(group, spec) {
    return Promise.all([
      K.mascotJumpOut(),
      Flow.anim(Beats.lineOut(dom.promptLine)),
      Flow.anim(Beats.slideArcs(group, SHIFT))
    ])
      .then(function () {
        K.clearPrompt();
        return Flow.wait(SHORT);
      })
      .then(function () { return C.ask(spec); })
      .then(function () { return C.closeOut(group); });
  }

  /* Page 15 -- the pipe. "A pipe of radius 14 cm lies on its side with
     water in it.": the pipe is drawn on its word, its centre and one
     radius with the length follow, and the water -- its surface, its
     colour, its arc, its name -- comes on "water". "The water surface
     subtends 90° at the centre.": the surface swells on its word, the
     other radius grows on "subtends", and the right angle with its "90°"
     lands after it. Then the question from the pane. */
  function scenePipe() {
    var L = pipeLines();
    var made = null;
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        layoutPipe();
        dom.sl.removeAttribute('hidden');
      })
      .then(function () {
        return sayWith(L.pipe, [
          { word: 'pipe', run: function () {
            made = Flow.anim(Beats.drawRim(dom.slRim, dom.slTip))
              .then(function () { return Flow.wait(SHORT); })
              .then(function () { return Flow.anim(Beats.plotDot(dom.slCentre, DOT_TIME)); })
              .then(function () { return Flow.wait(SHORT); })
              .then(function () { return grow(dom.slRadA, RADIUS_TIME); })
              .then(function () { return Flow.anim(Beats.labelIn(dom.slLen)); });
            return made;
          } },
          { word: 'water', run: function () {
            return (made || Promise.resolve())
              .then(function () { return grow(dom.slChord, CHORD_TIME); })
              .then(function () {
                return Promise.all([
                  Flow.anim(discIn(dom.slSeg)),
                  Flow.anim(Beats.growLine(dom.slArc, 0.8, 'power2.inOut'))
                ]);
              })
              .then(function () { return Flow.anim(Beats.labelIn(dom.slWord)); });
          } }
        ], { arrive: true });
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })
      .then(function () {
        return sayWith(L.subtends, [
          { word: 'surface',  run: function () { return Flow.anim(Beats.linePulse([dom.slChord])); } },
          { word: 'subtends', run: function () {
            return grow(dom.slRadB, RADIUS_TIME)
              .then(function () { return grow(dom.slMark, 0.5); })
              .then(function () { return Flow.anim(Beats.labelIn(dom.slDeg)); });
          } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })
      .then(function () {
        return askFromPane(dom.sl, {
          ask: L.ask, options: L.options, answer: L.answer,
          wrong: L.wrong, right: L.right,
          reveal: function () { return spotlightOn({ lines: [dom.slChord], arcs: [dom.slArc] }); }
        });
      })
      .then(layoutPipe);
  }

  /* Page 16 -- the flower bed. "A round flower bed of radius 21 m is cut
     by a straight path.": the bed is drawn and coloured on "round", its
     centre and one radius with the length follow, and the path is laid
     on "cut". "The path subtends 90° at the centre.": the path swells,
     the other radius grows on "subtends", and the right angle with its
     "90°" lands after it. The smaller piece is coloured in as the
     question is asked. */
  function sceneBed() {
    var L = bedLines();
    var made = null;
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        layoutBed();
        dom.sm.removeAttribute('hidden');
      })
      .then(function () {
        return sayWith(L.bed, [
          { word: 'round', run: function () {
            made = Flow.anim(Beats.drawRim(dom.smRim, dom.smTip))
              .then(function () { return Flow.wait(SHORT); })
              .then(function () { return Flow.anim(Beats.fillDisc(dom.smDisc)); })
              .then(function () { return Flow.wait(SHORT); })
              .then(function () { return Flow.anim(Beats.plotDot(dom.smCentre, DOT_TIME)); })
              .then(function () { return Flow.wait(SHORT); })
              .then(function () { return grow(dom.smRadA, RADIUS_TIME); })
              .then(function () { return Flow.anim(Beats.labelIn(dom.smLen)); });
            return made;
          } },
          { word: 'cut', run: function () {
            return (made || Promise.resolve())
              .then(function () { return grow(dom.smChord, CHORD_TIME); });
          } }
        ], { arrive: true });
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })
      .then(function () {
        return sayWith(L.subtends, [
          { word: 'path',     run: function () { return Flow.anim(Beats.linePulse([dom.smChord])); } },
          { word: 'subtends', run: function () {
            return grow(dom.smRadB, RADIUS_TIME)
              .then(function () { return grow(dom.smMark, 0.5); })
              .then(function () { return Flow.anim(Beats.labelIn(dom.smDeg)); });
          } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })
      .then(function () {
        return askFromPane(dom.sm, {
          ask: L.ask, options: L.options, answer: L.answer,
          wrong: L.wrong, right: L.right,
          /* what the question is about: the smaller piece, coloured in
             with its arc lit as the words arrive */
          onAsk: function () {
            return Promise.all([
              Flow.anim(discIn(dom.smSeg)),
              Flow.anim(Beats.growLine(dom.smArc, 0.8, 'power2.inOut'))
            ]).then(function () { return Flow.anim(Beats.arcPulse([dom.smArc])); });
          },
          reveal: function () { return spotlightOn({ lines: [dom.smChord], arcs: [dom.smArc] }); }
        });
      })
      .then(layoutBed);
  }

  /* ======================================================================
   * The hooks the board's housekeeping calls -- see addSection in pages.js
   * ====================================================================== */

  /* What this skill has on the figure: one group per page, each faded as
     a whole. */
  function parts() {
    return [dom.sa, dom.sb, dom.sc, dom.sd, dom.se, dom.sf, dom.sg, dom.sh,
            dom.si, dom.sj, dom.sk, dom.sl, dom.sm];
  }

  /* And what it keeps outside the figure: the worked pane, if a wipe
     catches the working still up. The pane the asks speak from is
     circum.js's, and its hooks put it away. */
  function wipe() {
    var out = [];
    if (!dom.swPane.hasAttribute('hidden')) {
      out.push(Flow.anim(linesOut(dom.swAll)).then(function () { restoreWorked(dom.swPane, dom.swAll); }));
    }
    if (!dom.sxPane.hasAttribute('hidden')) {
      out.push(Flow.anim(linesOut(dom.sxAll)).then(function () { restoreWorked(dom.sxPane, dom.sxAll); }));
    }
    return out;
  }

  /* Back to rest, with no animation. The inline writes inside the figure
     are pages.js's to clear -- resetFigure does it for every descendant of
     the picture right after this -- so this is about attributes, classes
     and the cards, which are built afresh each run. */
  function reset() {
    saying++;
    dom.sa.setAttribute('hidden', '');
    dom.sb.setAttribute('hidden', '');
    putAwayCards();
    dom.sbSector.setAttribute('d', '');
    dom.sc.setAttribute('hidden', '');
    dom.sc.classList.remove('is-picking', 'is-live');
    dom.scNudges.setAttribute('hidden', '');
    dom.scClip.setAttribute('r', CLIP_OPEN);
    dom.scPointB.g.classList.remove('is-held');
    dom.scPointB.hit.setAttribute('tabindex', '-1');
    dom.scBand.setAttribute('tabindex', '-1');
    cut.a = SC_DEFAULT.a; cut.span = SC_DEFAULT.span; cut.origin = SC_DEFAULT.origin;
    redrawChord();
    dom.sd.setAttribute('hidden', '');
    dom.sdClipMinor.setAttribute('r', CLIP_OPEN);
    dom.sdClipMajor.setAttribute('r', CLIP_OPEN);
    dom.se.setAttribute('hidden', '');
    layoutStep();
    dom.sf.setAttribute('hidden', '');
    dom.sg.setAttribute('hidden', '');
    layoutRight();
    dom.sh.setAttribute('hidden', '');
    layoutSeg();
    restoreWorked(dom.swPane, dom.swAll);
    dom.si.setAttribute('hidden', '');
    layoutMajor();
    dom.sj.setAttribute('hidden', '');
    layoutMajorAnim();
    dom.sk.setAttribute('hidden', '');
    restoreWorked(dom.sxPane, dom.sxAll);
    dom.sl.setAttribute('hidden', '');
    layoutPipe();
    dom.sm.setAttribute('hidden', '');
    layoutBed();
    if (global.I18n) global.I18n.stop();
  }

  /* The board as a scene expects to find it, written straight in. Every
     scene opens on a wiped board -- each one's first beat is the wipe --
     so there is nothing to stage. */
  function stage() {}

  Pages.addSection({
    name: 'Segment area',
    skill: 'Skill 4 · Area of a segment',
    scenes: [
      { name: 'Tap the segment',  play: sceneSegment },
      { name: 'Area of a sector', play: sceneSectorArea },
      { name: 'Make a segment',   play: sceneChord },
      { name: 'Two segments',     play: sceneTwo },
      { name: 'Sector minus triangle', play: sceneStep },
      { name: 'Segment recap',    play: sceneSummary },
      { name: 'Triangle at 90°',  play: sceneRight },
      { name: 'Segment worked',   play: sceneWorked },
      { name: 'Segment asked',    play: sceneAsked },
      { name: 'Segment from parts',   play: sceneFromParts },
      { name: 'Major segment',        play: sceneMajor },
      { name: 'Major segment recap',  play: sceneMajorSummary },
      { name: 'Major segment worked', play: sceneMajorWorked },
      { name: 'Major segment asked',  play: sceneMajorAsked },
      { name: 'Pipe: the water',      play: scenePipe },
      { name: 'Flower bed: the path', play: sceneBed }
    ],
    build: build,
    parts: parts,
    wipe: wipe,
    reset: reset,
    stage: stage
  });

  /* What the sections after this one are built from: the cut the cards
     are drawn with, the sector page 2 shows, and the geometry helper. */
  global.SegArea = {
    CUT: CUT,
    SB: SB,
    circleAt: circleAt
  };
})(window);
