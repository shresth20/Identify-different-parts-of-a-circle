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
 * css/central.css and the one group in index.html (#ca) with #clPane are
 * the whole of it.
 *
 * ONE circle for the whole section. The learner makes the angle on page 1,
 * and every page after it works on that very figure -- the protractor is
 * laid on it, its fraction is asked about, its parts are named -- so
 * nothing is drawn twice and every number on the later pages is the
 * learner's own (user, 2026-10-09).
 *
 * Page 0 -- a word on the field: what has been revised, and what comes
 *   next -- some terms and their notations.
 *
 * Page 1 -- the central angle. The learner makes one:
 *
 *   The board opens blank. A circle is drawn quickly -- the outline only
 *   -- and a small dot goes on its centre. The bird comes up onto the
 *   header and asks for two points on the circle: the rim glows once, the
 *   ghost rides it under the finger, and the second point is kept clearly
 *   apart from the first (never nearer than MIN_SPAN, never past
 *   MAX_SPAN, so the two always cut off a minor sector). The angle is
 *   caught to the nearest 5°, so the protractor on the next page reads
 *   a round number. Both down, the bird springs away and the picture is
 *   finished without it: a radius grown out of the centre to each point,
 *   in the order they were placed, then the angle between the two radii
 *   drawn at the centre and "θ" set inside it. The bird comes back up to
 *   say what it is -- the central angle for the minor sector -- and the
 *   angle is lit while it says so. Next pressed, the bird goes and the
 *   header closes, but the figure STAYS for the page after.
 *
 * Page 2 -- measuring it. The same figure, read off a protractor:
 *
 *   The protractor is laid on the circle -- its centre hole on the dot --
 *   and swung round until its 0° line lies along the first radius, so the
 *   second radius crosses its inner scale at the angle. The piece of the
 *   rim between the two points is picked out, "r" is set beside a radius
 *   (both are radii; one label says so). The figure slides to the left
 *   half and the bird comes up in the right pane to ask, from bubble-02,
 *   for the angle: three readings, one by one, all near the true one. A
 *   wrong one is refused with where to look; the right one shows the
 *   measure -- "θ" gives way to "θ = 0°", which counts up to the angle
 *   while the angle is swept again under it, and the arc swells once --
 *   and Next arrives. Next pressed, the question goes and the protractor
 *   is lifted off, but the figure and the bird STAY for the page after.
 *
 * Page 3 -- the sector's share. The same board, one more question:
 *
 *   From where it stands the bird asks what fraction of the whole circle
 *   the sector is. Three fractions built from the angle just read, each
 *   stood up as on paper with its degree signs; a wrong one is refused
 *   with why. Next pressed, the question goes but the figure and the bird
 *   stay once more.
 *
 * Page 4 -- the three named. The same board, and the bird explains:
 *
 *   "θ = 80°" gives way to "θ", and the bird says, a sentence at a time,
 *   what s, r and θ are: as each is named, the mark it names takes a
 *   colour of its own -- the arc blue with an "s" set beside it, the
 *   radii green, the angle pink -- and the same words in the same colour
 *   land in a legend under the bird, where the answers usually stand.
 *   Then the bird goes with its box, the legend moves to the middle of
 *   the right half, left-aligned beside the figure, and Next arrives.
 *   Next pressed, the legend and the figure go together and the header
 *   opens again over a clean board.
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
  var AL = global.ArcLen;
  if (!Pages || !Pages.addSection || !A || !A.pickPoints || !C || !C.ask || !AL || !AL.fieldTalk) {
    console.error('central.js: load js/pages.js, js/arcs.js, js/arclen.js and js/circum.js before js/central.js.');
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
  var NB = ' ';
  function tie(s) { return s.replace(/ (\S+)$/, NB + '$1'); }
  function nope(key) { return [said('fbNotQuite', T('fbNotQuite')), said(key, tie(T(key)))]; }

  /* Page 2's. The readings are the learner's own angle and two near it,
     all on the protractor's 5° marks; each wrong one is refused with
     where on the protractor to look. */
  function measureLines() {
    var deg = cut.span;
    var right = T('valDeg', { deg: deg });
    var near = T('valDeg', { deg: deg + 5 });
    var far = T('valDeg', { deg: deg + 10 });
    var wrong = {};
    wrong[near] = nope('s2MeWrong');
    wrong[far] = nope('s2MeWrong');
    return {
      ask:     said('p23Ask', tie(T('p23Ask'))),
      options: [right, near, far],
      answer:  right,
      wrong:   wrong,
      right:   [said('fbCorrect', T('fbCorrect')), said('p23Right', tie(T('p23Right')))]
    };
  }

  /* Page 3's. The fractions are spelled with U+2044 in the locale and
     stood up by mathtext.js, degree signs and all, on the pills -- the
     angle on top is the one just read. */
  function fractionLines() {
    var deg = cut.span;
    var whole = T('p24Opt360', { deg: deg });
    var quarter = T('p24Opt90', { deg: deg });
    var half = T('p24Opt180', { deg: deg });
    var wrong = {};
    wrong[quarter] = nope('p24Wrong90');
    wrong[half] = nope('p24Wrong180');
    return {
      ask:     said('p24Ask', tie(T('p24Ask'))),
      options: [whole, quarter, half],
      answer:  whole,
      wrong:   wrong,
      right:   [said('fbCorrect', T('fbCorrect')), said('p24Right', tie(T('p24Right')))]
    };
  }

  /* Page 4's: the three sentences, each with the mark it names. */
  function nameLines() {
    return [
      { which: 's',  say: said('p25S',     tie(T('p25S'))) },
      { which: 'r',  say: said('p25R',     tie(T('p25R'))) },
      { which: 'th', say: said('p25Theta', tie(T('p25Theta'))) }
    ];
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
     spots down (see fillIn in arcs.js), and they fall inside this stretch.
     The angle is caught to the nearest SNAP degrees, so the protractor
     reads a round number on the page after. */
  var MIN_SPAN = 50, MAX_SPAN = 150;
  var SNAP = 5;
  var DRAW_TIME = 1.2;     /* s: the pen once round -- quickly (user, 2026-10-09) */
  var RADIUS_TIME = 0.6;   /* s: a radius, from the centre to its point */

  /* ---- the angle ---------------------------------------------------------
     The mark at the centre, as the semicircle and quadrant pages draw
     theirs, and where "θ" sits on its middle line. */
  var ANGLE_R = 42;
  var THETA_R = 70;
  var ANGLE_TIME = 0.6;    /* s: the angle, from one radius round to the other */
  var LINE_W = 3.4;        /* the radii's and the angle's weight (central.css) */
  var ARC_W = 3.4;         /* the arc's weight, as the radii's               */

  /* The cut, as arcs.js hands it over: `a` is one point, and the minor
     sector lies under the arc that runs from it anticlockwise for `span`
     degrees to the other; `origin` is the point placed LAST. At rest it is
     what a skip would put down. */
  var DEFAULT = { a: 60, span: 125, origin: 'b' };
  var cut = { a: DEFAULT.a, span: DEFAULT.span, origin: DEFAULT.origin };

  /* ---- page 2: the protractor ---------------------------------------------
     The image's own geometry (assets/image/protractor.png, 2000 x 1104, its
     body transparent), so it can be laid with its centre hole on the
     circle's centre and its 0-180 line along the first radius. `r` is the
     outer arc's radius in the image's pixels; PROT_R is what that is drawn
     at, in picture units. The protractor rises past the top of the
     picture's box, into the room the box has above it while the header is
     closed. */
  var PROT = { w: 2000, h: 1104, cx: 999, cy: 999, r: 998 };
  var PROT_R = 235;
  var PROT_TIME = 1.1;     /* s: the protractor laid on and swung into line */
  var PROT_OUT = 0.4;      /* s: and lifted off again                     */
  var PROT_ALPHA = 0.9;    /* how solid it is: the marks under it still show */
  var R_AT = 118;          /* how far out along the second radius "r" is set */
  var R_OFF = 17;          /* and how far off the line, outside the sector   */
  var ARC_TIME = 0.8;      /* s: the arc, from one point to the other        */
  var COUNT_TIME = 1.0;    /* s: 0° to the angle, with the angle swept under it */
  var S_OUT = 24;          /* how far outside the rim "s" sits, on the arc's middle line */
  var LEGEND_TIME = 0.6;   /* s: the legend's move to the middle of the pane */
  var HOT_TIMES = 3;       /* the angle's beats while it is being named      */

  /* ---- the elements ------------------------------------------------------ */
  var dom = null;          /* pages.js's, with this section's own on top */
  var mascot = null;
  var hand = null;         /* the pointing hand, for page 1's pick */

  function $(id) { return document.getElementById(id); }

  /* A point on the circle: the dot, and the finger-sized hit area over it. */
  function point(g) {
    return { g: g, dot: g.querySelector('.arc-dot'), hit: g.querySelector('.arc-dot__hit') };
  }

  function build() {
    dom = Object.create(K.dom());
    mascot = K.mascot();

    dom.ca        = $('ca');
    dom.caProt    = $('caProt');
    dom.caRim     = $('caRim');
    dom.caTip     = $('caTip');
    dom.caBand    = $('caBand');
    dom.caArc     = $('caArc');
    dom.caRadA    = $('caRadA');
    dom.caRadB    = $('caRadB');
    dom.caAngle   = $('caAngle');
    dom.caCentre  = $('caCentre');
    dom.caTheta   = $('caTheta');
    dom.caR       = $('caR');
    dom.caS       = $('caS');
    dom.caMeasure = $('caMeasure');
    dom.caGhost   = $('caGhost');
    dom.caPointA  = point($('caPointA'));
    dom.caPointB  = point($('caPointB'));
    dom.caNudges  = $('caNudges');
    hand = A.hand(dom.caNudges);

    dom.clPane    = $('clPane');
    dom.clLegend  = $('clLegend');
    dom.clItems   = { s: $('clS'), r: $('clR'), th: $('clTh') };

    layoutProtractor();
    reset();
  }

  /* ---- drawing from the angles ------------------------------------------ */

  /* A radius: from the centre out to a point `p`. */
  function radiusD(p) { return 'M' + CX + ' ' + CY + ' L' + p.x + ' ' + p.y; }

  /* An arc `r` out, from one point round to another anticlockwise on
     screen -- the way our angles grow -- and never more than a half-turn,
     which is all a minor sector's angle can be. */
  function arcD(from, to, r) {
    return 'M' + from.x + ' ' + from.y + ' A' + r + ' ' + r + ' 0 0 0 ' + to.x + ' ' + to.y;
  }

  /* The two radii in the order they are drawn: to the point placed FIRST
     first, so the picture is made in the order the learner made it. */
  function radii() {
    return cut.origin === 'b' ? [dom.caRadA, dom.caRadB] : [dom.caRadB, dom.caRadA];
  }
  /* The dot at the far end of the minor arc -- at a + span -- whichever
     of the two it is. */
  function farDot() {
    return cut.origin === 'b' ? dom.caPointB : dom.caPointA;
  }

  /* Every mark that depends on the cut, rewritten from it: a radius to
     each point, the piece of the rim between them, the angle at the
     centre, and where "θ", the measure, "r" and "s" sit. */
  function redraw() {
    var a = cut.a, b = cut.a + cut.span, mid = cut.a + cut.span / 2;
    var pA = P(a, RR), pB = P(b, RR);
    dom.caRadA.setAttribute('d', radiusD(pA));
    dom.caRadB.setAttribute('d', radiusD(pB));
    dom.caArc.setAttribute('d', arcD(pA, pB, RR));
    dom.caAngle.setAttribute('d', arcD(P(a, ANGLE_R), P(b, ANGLE_R), ANGLE_R));

    /* "θ" on the angle's middle line. */
    var th = P(mid, THETA_R);
    dom.caTheta.setAttribute('x', th.x);
    dom.caTheta.setAttribute('y', round2(th.y + LABEL_DY));

    /* The measure that takes its place -- "θ = 80°" -- centred on the same
       line, a little further out: far enough out that it stands between
       the two radii, never past the rim. */
    var half = cut.span / 2 * Math.PI / 180;
    var need = 54 / Math.max(0.2, Math.tan(half));
    var dist = Math.min(RR - 22, Math.max(THETA_R + 18, need));
    var m = P(mid, dist);
    dom.caMeasure.setAttribute('x', m.x);
    dom.caMeasure.setAttribute('y', round2(m.y + LABEL_DY));

    /* "r" beside the second radius, R_AT out along it and R_OFF off it on
       the side AWAY from the sector, so it never meets the measure. */
    var t = b * Math.PI / 180;
    var r0 = P(b, R_AT);
    var nx = Math.sin(t), ny = Math.cos(t);
    var bx = Math.cos(mid * Math.PI / 180), by = -Math.sin(mid * Math.PI / 180);
    if (nx * bx + ny * by > 0) { nx = -nx; ny = -ny; }
    dom.caR.setAttribute('x', round2(r0.x + nx * R_OFF));
    dom.caR.setAttribute('y', round2(r0.y + ny * R_OFF + 6));

    /* "s" just outside the rim, on the arc's middle line. */
    var sp = P(mid, RR + S_OUT);
    dom.caS.setAttribute('x', sp.x);
    dom.caS.setAttribute('y', round2(sp.y + LABEL_DY));
  }

  /* The learner's cut, caught to the protractor's marks: the span is
     rounded to SNAP degrees and the far point is moved to match, so the
     dot, the radius and the reading agree. */
  function catchCut(c) {
    cut.a = A.norm(c.a);
    cut.span = Math.max(MIN_SPAN, Math.min(MAX_SPAN, Math.round(c.span / SNAP) * SNAP));
    cut.origin = c.origin;
    A.place(farDot(), cut.a + cut.span);
    A.place(cut.origin === 'b' ? dom.caPointA : dom.caPointB, cut.a);
    redraw();
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
      done: catchCut
    };
  }

  /* The protractor, scaled so its outer arc is PROT_R out, and set so its
     centre hole falls on the circle's centre. Where it is turned to is
     the page's (see protractorIn). */
  function layoutProtractor() {
    var s = PROT_R / PROT.r;
    dom.caProt.setAttribute('width', round2(PROT.w * s));
    dom.caProt.setAttribute('height', round2(PROT.h * s));
    dom.caProt.setAttribute('x', round2(CX - PROT.cx * s));
    dom.caProt.setAttribute('y', round2(CY - PROT.cy * s));
  }

  /* The marks a page finds already made, shown at once: for a page
     staged from the level bar. */
  function showMade(els) { M.set(els, { opacity: 1 }); }
  function dots() { return [dom.caPointA.dot, dom.caPointB.dot]; }

  /* ======================================================================
   * This section's own beats
   * ====================================================================== */

  /* The protractor laid on the circle and swung into line: it comes up
     from a little under its size about the circle's centre, level, and
     turns as it settles until its 0° line lies along the first radius --
     one movement, as a hand sets a protractor down and squares it up. Its
     turn is the SVG's, clockwise on screen, so a radius `a` degrees
     anticlockwise from three o'clock is reached by turning -a. */
  function protractorIn(img) {
    M.set(img, { opacity: 0, scale: 0.92, rotation: 0, svgOrigin: CX + ' ' + CY });
    dom.ca.classList.add('is-prot');
    var tl = M.timeline({ willChange: img, willChangeValue: 'transform, opacity' });
    tl.to(img, { opacity: PROT_ALPHA, scale: 1, duration: M.dur(0.5), ease: M.OUT }, 0)
      .to(img, { rotation: -cut.a, duration: M.dur(PROT_TIME), ease: 'power2.inOut' }, M.gap(0.25));
    return tl;
  }

  /* And lifted off again, once the angle has been read: it goes as it
     came, a little smaller and gone, about the circle's centre. */
  function protractorOut(img) {
    var tl = M.timeline({
      willChange: img, willChangeValue: 'transform, opacity',
      revert: function () { dom.ca.classList.remove('is-prot'); }
    });
    tl.to(img, { opacity: 0, scale: 0.92, svgOrigin: CX + ' ' + CY,
                 duration: M.dur(PROT_OUT), ease: M.IN });
    return tl;
  }

  /* The angle lit while the bird names it: the mark swells and settles,
     and "θ" with it, HOT_TIMES over -- said and shown as one thing. */
  function hotAngle() {
    var tl = M.timeline({
      willChange: [dom.caAngle, dom.caTheta], willChangeValue: 'transform',
      revert: function () { M.set(dom.caAngle, { clearProps: 'strokeWidth' }); }
    });
    dom.caAngle.classList.add('is-hot');
    dom.caTheta.classList.add('is-hot');
    for (var i = 0; i < HOT_TIMES; i++) {
      var at = i * 0.8;
      tl.to(dom.caAngle, { strokeWidth: LINE_W * 1.9, duration: M.dur(0.28), ease: 'power2.out' }, M.gap(at))
        .to(dom.caAngle, { strokeWidth: LINE_W, duration: M.dur(0.5), ease: M.POP }, M.gap(at + 0.28))
        .to(dom.caTheta, { scale: 1.32, transformOrigin: 'center center',
                           duration: M.dur(0.28), ease: 'power2.out' }, M.gap(at))
        .to(dom.caTheta, { scale: 1, duration: M.dur(0.5), ease: M.POP }, M.gap(at + 0.28));
    }
    tl.call(function () {
      dom.caAngle.classList.remove('is-hot');
      dom.caTheta.classList.remove('is-hot');
    });
    return tl;
  }

  /* The right reading pressed: "θ" and the angle step back together, and
     in their place the measure comes up reading 0° and counts to the angle
     while the angle is swept again under it, at the same pace, from the
     first radius round to the second -- the number and the turn seen to be
     one thing. Then the arc swells once. The count is written through the
     locale each frame, so the line reads as the locale spells it; however
     the beat ends, it is left reading the measure. */
  function showMeasure() {
    var deg = { n: 0 };
    function write() {
      dom.caMeasure.textContent = T('lblThetaIs', { deg: Math.round(deg.n) });
    }
    var out = M.timeline({ willChange: [dom.caTheta, dom.caAngle], willChangeValue: 'opacity' });
    out.to([dom.caTheta, dom.caAngle], { opacity: 0, duration: M.dur(0.2), ease: M.IN });
    return Flow.anim(out)
      .then(function () {
        write();
        M.set(dom.caMeasure, { opacity: 0 });
        var tl = M.timeline({
          willChange: dom.caMeasure, willChangeValue: 'opacity',
          revert: function () { deg.n = cut.span; write(); }
        });
        tl.to(dom.caMeasure, { opacity: 1, duration: M.dur(0.3), ease: M.OUT }, 0)
          .to(deg, { n: cut.span, duration: M.dur(COUNT_TIME), ease: 'power2.inOut',
                     onUpdate: write }, 0);
        return Promise.all([
          Flow.anim(tl),
          Flow.anim(Beats.growLine(dom.caAngle, COUNT_TIME, 'power2.inOut'))
        ]);
      })
      .then(function () { return Flow.anim(Beats.linePulse([dom.caArc], ARC_W)); });
  }

  /* ======================================================================
   * Page 0 -- a word on the field: the arc revised, and the terms to come.
   * ====================================================================== */
  function sceneTermsIntro() {
    return AL.fieldTalk(['s2TermsRevised', 's2TermsNow']);
  }

  /* ======================================================================
   * Page 1 -- the central angle. A blank board, the circle and its centre,
   * two points from the learner, a radius to each, the angle between them
   * and its "θ", and the bird up to name it -- the angle lit as it does.
   * ====================================================================== */
  function sceneCentral() {
    var picked = null;
    return K.wipeBoard()
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the circle: the pen once round, quickly, an outline only, and
         the small dot at its centre -- the point the radii will come from */
      .then(function () {
        dom.ca.removeAttribute('hidden');
        return Flow.anim(Beats.drawRim(dom.caRim, dom.caTip, { time: DRAW_TIME }));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.caCentre)); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- two points -----------------------------------------------------
         The rim glows once while a point is wanted, and the hand shows
         the way if nothing is placed. Listening starts as the bird lands,
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

      /* ---- named from the header, the angle lit as the words arrive ------ */
      .then(function () {
        return K.arriveSaying(said('p22Central', T('p22Central')), 'talking', function () {
          return Flow.anim(hotAngle());
        });
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(BEAT);
      })

      /* ---- Next -- and only its PRESS sends the bird away, with its line.
         The header closes behind it -- the protractor needs the room --
         and the figure STAYS: the page after reads this very angle. ----- */
      .then(function () { return K.handOver(dom.nextBtn); })
      .then(function () {
        if (global.I18n) global.I18n.stop();
        return Promise.all([
          K.mascotJumpOut(),
          Flow.anim(Beats.lineOut(dom.promptLine))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        return Flow.wait(SHORT);
      });
  }

  /* ======================================================================
   * Page 2 -- measuring the angle. The board as page 1 left it: the
   * figure with its radii and "θ", the header closed. The protractor is
   * laid on and swung into line, the piece of the rim between the points
   * is picked out and "r" set beside a radius; then the figure stands
   * aside and the bird asks for the reading from the pane. Three readings,
   * one by one. The right one counts the measure up as the angle is swept
   * again.
   * ====================================================================== */
  function sceneMeasure() {
    var lines = measureLines();
    return Flow.wait(BEAT)

      /* ---- the protractor laid on, and turned to the first radius -------- */
      .then(function () { return Flow.anim(protractorIn(dom.caProt)); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the piece of the rim between the points, picked out ------------ */
      .then(function () {
        return Flow.anim(Beats.growLine(dom.caArc, ARC_TIME, 'power2.inOut'));
      })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- "r" beside a radius: both are radii, and one label says so ---- */
      .then(function () { return Flow.anim(Beats.labelIn(dom.caR)); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the figure stands aside, and the bird asks from the pane ------- */
      .then(function () { return Flow.anim(Beats.slideArcs(dom.ca, SHIFT)); })
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
          Flow.anim(protractorOut(dom.caProt))
        ]);
      });
  }

  /* ======================================================================
   * Page 3 -- the sector's share of the circle. The board as page 2 left
   * it -- the figure stood aside with its angle read, the bird in the
   * pane -- and one more question from the same spot. Three fractions,
   * each built from the angle just read and stood up as on paper; a wrong
   * one is refused with why.
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
    var tl = M.timeline({ willChange: [dom.caMeasure, dom.caTheta], willChangeValue: 'opacity' });
    tl.to(dom.caMeasure, { opacity: 0, duration: M.dur(0.3), ease: M.IN }, 0)
      .to(dom.caTheta, { opacity: 1, duration: M.dur(0.4), ease: M.OUT }, M.gap(0.15));
    return tl;
  }

  /* One of the three, named: its mark takes its colour (a class -- the
     stylesheet transitions it) and swells once, "s" lands beside the arc
     when it is the arc's turn, and the legend line comes up under the
     bird. Fired as the sentence starts, so the mark lands with the words;
     nothing here is awaited by the chain, so it all goes through quiet(). */
  function nameBeat(which) {
    dom.ca.classList.add('is-' + which);
    K.quiet(Flow.anim(legendIn(dom.clItems[which])));
    if (which === 's') {
      K.quiet(Flow.anim(Beats.labelIn(dom.caS)));
      K.quiet(Flow.anim(Beats.linePulse([dom.caArc], ARC_W)));
    } else if (which === 'r') {
      K.quiet(Flow.anim(Beats.linePulse([dom.caRadA, dom.caRadB], LINE_W)));
    } else {
      K.quiet(Flow.anim(Beats.linePulse([dom.caAngle], LINE_W)));
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
          Flow.anim(Beats.clearFigure([dom.ca]))
        ]);
      })
      .then(function () {
        restoreLegend();
        dom.ca.setAttribute('hidden', '');
        dom.ca.classList.remove('is-s', 'is-r', 'is-th', 'is-prot');
        K.clearInline([dom.ca].concat(
          Array.prototype.slice.call(dom.ca.querySelectorAll('*'))));
        return Flow.anim(K.collapseHeader(false));
      });
  }

  /* ======================================================================
   * The hooks the board's housekeeping calls -- see addSection in pages.js
   * ====================================================================== */

  /* What this section has on the figure: the one group, faded as a whole. */
  function parts() { return [dom.ca]; }

  /* What this section keeps outside the figure: the legend, if a wipe
     catches it up. The pane the questions are asked from is circum.js's,
     and its own hooks put it away. */
  function wipe() {
    var out = [];
    if (!dom.clPane.hasAttribute('hidden')) out.push(Flow.anim(legendOut()).then(restoreLegend));
    return out;
  }

  /* Back to rest, with no animation. The inline writes inside the figure
     are pages.js's to clear -- resetFigure does it for every descendant of
     the picture right after this -- so this is about attributes, classes
     and the words. */
  function reset() {
    dom.ca.setAttribute('hidden', '');
    dom.ca.classList.remove('is-picking', 'is-s', 'is-r', 'is-th', 'is-prot');
    dom.caAngle.classList.remove('is-hot');
    dom.caTheta.classList.remove('is-hot');
    dom.caNudges.setAttribute('hidden', '');
    cut.a = DEFAULT.a; cut.span = DEFAULT.span; cut.origin = DEFAULT.origin;
    A.place(dom.caPointA, cut.a);
    A.place(dom.caPointB, cut.a + cut.span);
    redraw();
    dom.caMeasure.textContent = '';
    restoreLegend();
    if (global.I18n) global.I18n.stop();
  }

  /* The board as the i-th scene expects to FIND it, written straight in.
     The field page and the central angle open on a wiped board -- each
     one's first beat is the wipe -- so there is nothing to stage. The
     protractor page opens on the central angle's board less the bird: the
     figure drawn and its angle marked, the header closed. The two after
     open on the protractor page's board less the protractor: the figure
     stood aside with every mark on it and its angle read, the header
     closed, the pane open and the bird standing in it. */
  function stage(i) {
    if (i < 2) return;
    dom.board.classList.add('is-headless');
    dom.ca.removeAttribute('hidden');
    showMade([dom.caRim, dom.caCentre, dom.caRadA, dom.caRadB, dom.caAngle, dom.caTheta].concat(dots()));
    if (i === 2) return;
    showMade([dom.caArc, dom.caR, dom.caMeasure]);
    M.set(dom.caTheta, { opacity: 0 });
    dom.caMeasure.textContent = T('lblThetaIs', { deg: cut.span });
    M.set(dom.ca, { x: SHIFT });
    C.seatBird();
  }

  Pages.addSection({
    name: 'Central angle',
    scenes: [
      { name: 'Terms intro',       play: sceneTermsIntro },
      { name: 'Central angle',     play: sceneCentral  },
      { name: 'Measure the angle', play: sceneMeasure  },
      { name: 'Sector fraction',   play: sceneFraction },
      { name: 'Arc, radius, angle', play: sceneNames   }
    ],
    build: build,
    parts: parts,
    wipe: wipe,
    reset: reset,
    stage: stage
  });

  /* The learner's own angle, for the pages after this section. */
  global.Central = {
    cut: function () { return cut; }
  };
})(window);
