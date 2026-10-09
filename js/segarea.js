/* ==========================================================================
 * segarea.js -- Skill 4: area of a segment of a circle
 * --------------------------------------------------------------------------
 * The fourth skill of the app, on the same board, with the same bird and
 * the same clock as the others: registered with pages.js as a section (see
 * addSection there) and built from two kits. The pages that TEACH -- the
 * cards, the segment made, the sector cut and its triangle taken out, the
 * recaps, the major segment -- are drawn on the lesson's own figure with
 * the kit pages.js hands over and the beats in animations.js. Every page
 * that ASKS is built with skill 3's kit (window.SectorArea, js/sector-
 * area.js), in skill 3's stage and under its stylesheet, so a problem here
 * is asked and worked exactly as one there: the figure drawn on the left,
 * the bird on a perch in the panel asking from its bubble, the answers as
 * the lesson's pills under it, a wrong press refused in red with why and
 * the question asked again, the right one in green, and then the working
 * written out a term at a time -- or, on a worked example, filled in by
 * the learner through dropdown blanks in the steps. Nothing here waits on
 * anything except through Flow, so Skip, Replay and the level bar work on
 * these scenes exactly as they do on every other.
 *
 *   0  Segment intro         the bird on the field: hello, and a warm-up
 *   1  Tap the segment       three cards -- sector, triangle, segment --
 *                            each region glowing; the segment is asked for
 *   2  Area of a sector      the sector recalled: tap its area's formula
 *   3  Make a segment        a quick circle, two points, the chord; the two
 *                            regions coloured and named -- the minor and the
 *                            major segment -- then the radii and the angle θ
 *   4  Sector minus triangle the sector, the chord, the triangle; the cut
 *                            along the chord, and the triangle lifted out of
 *                            the circle: what is left is the segment
 *   5  Segment recap         sector − triangle = segment, in three pictures
 *   6  Apply intro           on the field: what was learnt, and what is next
 *   7  Triangle at 90°       tap the triangle's area
 *   8  Segment worked        r = 14 cm: three steps with dropdown blanks
 *   9  Segment asked         r = 7 cm: tap the answer, see the working
 *  10  Segment from parts    the sector and the triangle given as areas
 *  11  Major segment         the major sector with the triangle put back on
 *  12  Major segment recap   major sector + triangle = major segment
 *  13  Major segment worked  r = 14 cm, with blanks
 *  14  Major segment asked   r = 7 cm
 *  15  Pipe: the water       a story: the water's cross-section
 *  16  Flower bed: the path  a story: the smaller piece
 *
 * Every word is read by key (T('key'), js/i18n.js) from
 * locales/locales.json, and each line is voiced by the same key once a
 * recording is there.
 *
 * Load order: js/pages.js -> js/arcs.js -> ... -> js/sector-area.js -> js/segarea.js
 * ========================================================================== */
(function (global) {
  'use strict';

  var M = global.Motion;
  var Flow = global.Flow;
  var Beats = global.Beats;
  var Pages = global.Pages;
  var A = global.Arcs;
  var SA = global.SectorArea;
  if (!Pages || !Pages.addSection || !A || !A.pickPoints || !SA || !SA.stage) {
    console.error('segarea.js: load js/pages.js, js/arcs.js and js/sector-area.js before js/segarea.js.');
    return;
  }
  var K = Pages.kit;

  /* ---- the script -------------------------------------------------------
     Read by key at the moment a scene starts (the locale is in by then --
     see start() in script.js), each line carrying its key so it can be
     voiced. A sentence long enough to wrap keeps its last two words
     together, so its last row is never one stray word. */
  function T(key, repl) { return global.T ? global.T(key, repl) : key; }
  var NB = ' ';
  function tie(s) { return s.replace(/ (\S+)$/, NB + '$1'); }
  function L(key, repl) { return { text: tie(T(key, repl)), vo: key }; }
  var keyed = K.keyed;
  /* a wrong answer's two lines: the verdict, then why */
  function hint(key) { return [keyed('fbNotQuite'), keyed(key)]; }

  /* ---- pacing ------------------------------------------------------------ */
  var BEAT = K.BEAT, SHORT = K.SHORT;
  var LOOK = SA.LOOK;                       /* ms: a picture looked at        */
  var READ = 900;                           /* ms a verdict's sentence stands */
  var TALK_GAP = 1400;                      /* ms between two bubble lines    */
  var PEN_QUICK = 1.0;                      /* s: a circle drawn quickly      */
  var DOT_TIME = 0.5;                       /* s: the centre dot              */
  var RADIUS_TIME = 0.8;                    /* s: a radius out to the rim     */
  var ANGLE_TIME = 0.6;                     /* s: the angle, round            */
  var CHORD_TIME = 0.6;                     /* s: the chord, point to point   */
  var FILL_TIME = 0.8;                      /* s: a region swept in           */
  var LINE_TIME = 0.6;                      /* s: a radius or the chord, on a card */

  /* ---- the lesson's circle ---------------------------------------------- */
  var CX = K.CX, CY = K.CY, RR = K.RR;
  var round2 = K.round2, el = K.el;
  var LABEL_DY = 9;                         /* a label's baseline, below the point it is centred on */
  var ANGLE_R = 42, THETA_R = 64;           /* the angle's arc, and where "θ" sits */
  var ARC_W = 7;                            /* --sa-arc-weight (segarea.css)  */
  var CLIP_OPEN = 400;                      /* a clip circle wide open; mirrors animations.js */

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
  var GHOST = 0.28;                         /* the faded marks' opacity     */
  var DOT_R = 4.5, CENTRE_R = 5;            /* the points and the centre: small, so the region is what is read */
  var KINDS = ['sector', 'triangle', 'segment'];
  var ANSWER = 'segment';

  /* ---- page 3: the segment made -------------------------------------------
     The learner's two points are kept as skill 2 keeps them: `a` is one
     point, and the minor arc runs from it anticlockwise for `span` degrees
     to the other; `origin` is the point placed LAST, which is the end the
     chord is drawn from. The pick is held to a stretch where the smaller
     piece is plainly a segment and not a sliver. */
  var SC_MIN = 60, SC_MAX = 150;
  var SC_DEFAULT = { a: 35, span: 110, origin: 'b' };   /* what a skip puts down */
  var cut = { a: SC_DEFAULT.a, span: SC_DEFAULT.span, origin: SC_DEFAULT.origin };
  var SC_LABEL_OUT = 70;                    /* the smaller's name: past the rim */
  var SC_LABEL_IN = 0.56;                   /* the larger's: this share of r in  */
  var MAJOR_REST = 0.35;                    /* the larger piece, stepped back once the radii are in */

  /* ---- pages 4, 5, 11 and 12: the sector and the triangle -----------------
     The quarter in the upper right, as the storyboard draws it: one radius
     out to three o'clock, the other up to twelve. The same cut on the one
     big circle and on the three small ones, so a recap recaps exactly what
     was watched. The cut piece is set down beside the circle, to its lower
     left, where it is plainly out of the circle and still in the picture. */
  var SE = { a: 0, span: 90 };
  var MJ = { a: 90, span: 270 };
  var PIECE_AWAY = { x: -330, y: 100 };     /* where the triangle rests, out of the circle */
  var CUT_TIME = 0.7;                       /* s: the dashed cut along the chord */
  var REMOVE_TIME = 1.0;                    /* s: the piece out; the colour drawn back */
  var PUT_TIME = 0.9;                       /* s: the piece back in           */
  var SF_X = [170, 500, 830];               /* the three small circles        */
  var SF_CY = 185, SF_R = 108;
  var SF_RIM = 0.8;                         /* s: a small circle's pen        */
  var SF_ANGLE_R = 22;                      /* a small circle's angle mark    */

  /* ---- the problems ---------------------------------------------------------
     Drawn in skill 3's stage, in its own units: a circle of this size in
     the middle of a 352 by 352 picture, as skill 3's practice figures are. */
  var FIG = { cx: 210, cy: 210, r: 150 };
  var h = SA.h, fr = SA.fr, c = SA.c, svgEl = SA.svgEl;
  var X = SA.X, EQ = SA.EQ, MINUS = SA.MINUS;
  var PLUS = '<span class="op">+</span>';

  /* ---- a circle, and everything measured from it -------------------------
     The three numbers a circle is drawn with, and the marks written from
     them: a point on it, a piece of its rim, the wedge two radii cut, the
     triangle two radii and a chord make, the segment a chord cuts off --
     for a circle of any size in any place, because the cards draw three
     small ones and the problems draw theirs in another picture. */
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
    /* ...and the larger: the far side of the circle */
    function reachMajor(span) {
      return r + r * Math.cos(span / 2 * Math.PI / 180) + 6;
    }
    return {
      cx: cx, cy: cy, r: r, pt: pt, arc: arc, wedge: wedge, tri: tri, seg: seg,
      chordMid: chordMid, reach: reach, reachMajor: reachMajor,
      rim: 'M' + cx + ' ' + (cy - r) +
           ' A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r) +
           ' A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy - r)
    };
  }
  function lineD(p, q) { return 'M' + p.x + ' ' + p.y + ' L' + q.x + ' ' + q.y; }
  function lerp(p, q, t) { return { x: round2(p.x + (q.x - p.x) * t), y: round2(p.y + (q.y - p.y) * t) }; }

  /* The lesson's circle: the one in index.html, measured the same way. */
  var MAIN = circleAt(CX, CY, RR);

  /* ---- the elements ------------------------------------------------------ */
  var dom = null;          /* pages.js's, with this skill's own on top */
  var mascot = null;
  var cards = [];          /* page 1's three, in the order they stand */
  var saying = 0;          /* which verdict owns the header line now  */
  var figs = [];           /* page 5's three small circles            */
  var kfigs = [];          /* page 12's three                         */
  var hand = null;         /* the pointing hand, for page 3's pick    */

  function $(id) { return document.getElementById(id); }

  function build() {
    dom = Object.create(K.dom());
    mascot = K.mascot();

    dom.sa      = $('sa');
    dom.saDefs  = $('saDefs');
    dom.saCards = $('saCards');

    dom.sc          = $('sc');
    dom.scGlow      = $('scGlow');
    dom.scDisc      = $('scDisc');
    dom.scSeg       = $('scSeg');
    dom.scMajor     = $('scMajor');
    dom.scClip      = $('scClipC');
    dom.scClipMajor = $('scClipMajorC');
    dom.scRim       = $('scRim');
    dom.scTip       = $('scTip');
    dom.scBand      = $('scBand');
    dom.scRadA      = $('scRadA');
    dom.scRadB      = $('scRadB');
    dom.scChord     = $('scChord');
    dom.scArc       = $('scArc');
    dom.scArcMajor  = $('scArcMajor');
    dom.scAngle     = $('scAngle');
    dom.scCentre    = $('scCentre');
    dom.scTheta     = $('scTheta');
    dom.scLblMinor  = $('scLblMinor');
    dom.scLblMajor  = $('scLblMajor');
    dom.scGhost     = $('scGhost');
    dom.scPointA    = point($('scPointA'));
    dom.scPointB    = point($('scPointB'));
    dom.scNudges    = $('scNudges');
    hand = A.hand(dom.scNudges);

    dom.se           = $('se');
    dom.seDisc       = $('seDisc');
    dom.seSector     = $('seSector');
    dom.sePiece      = $('sePiece');
    dom.seTri        = $('seTri');
    dom.seRadA       = $('seRadA');
    dom.seRadB       = $('seRadB');
    dom.sePieceChord = $('sePieceChord');
    dom.seAngle      = $('seAngle');
    dom.seTheta      = $('seTheta');
    dom.seRim        = $('seRim');
    dom.seTip        = $('seTip');
    dom.seArc        = $('seArc');
    dom.seChord      = $('seChord');
    dom.seCut        = $('seCut');
    dom.seCutPen     = $('seCutPen');
    dom.seCentre     = $('seCentre');
    dom.seDotA       = $('seDotA');
    dom.seDotB       = $('seDotB');
    dom.seLblSeg     = $('seLblSeg');
    dom.seLblTri     = $('seLblTri');
    layoutStep();

    dom.sf       = $('sf');
    dom.sfFigs   = $('sfFigs');
    dom.sfMinus  = $('sfMinus');
    dom.sfEquals = $('sfEquals');
    dom.sfLabels = [$('sfLblSector'), $('sfLblTriangle'), $('sfLblSegment')];
    figs = KINDS.map(function (k, i) { return buildFig(k, i, dom.sfFigs); });

    dom.sj         = $('sj');
    dom.sjDisc     = $('sjDisc');
    dom.sjMajor    = $('sjMajor');
    dom.sjClip     = $('sjClipC');
    dom.sjPiece    = $('sjPiece');
    dom.sjTri      = $('sjTri');
    dom.sjTriA     = $('sjTriA');
    dom.sjTriB     = $('sjTriB');
    dom.sjTriC     = $('sjTriC');
    dom.sjAngle    = $('sjAngle');
    dom.sjTheta    = $('sjTheta');
    dom.sjRim      = $('sjRim');
    dom.sjTip      = $('sjTip');
    dom.sjArcMajor = $('sjArcMajor');
    dom.sjRadA     = $('sjRadA');
    dom.sjRadB     = $('sjRadB');
    dom.sjChord    = $('sjChord');
    dom.sjCentre   = $('sjCentre');
    dom.sjDotA     = $('sjDotA');
    dom.sjDotB     = $('sjDotB');
    dom.sjLbl      = $('sjLbl');
    layoutMajor();

    dom.sk       = $('sk');
    dom.skFigs   = $('skFigs');
    dom.skPlus   = $('skPlus');
    dom.skEquals = $('skEquals');
    dom.skLabels = [$('skLblSector'), $('skLblTriangle'), $('skLblSegment')];
    kfigs = ['msector', 'triangle', 'msegment'].map(function (k, i) { return buildFig(k, i, dom.skFigs); });

    reset();
  }

  /* A point on the circle: the dot, and the finger-sized hit area over it. */
  function point(g) {
    return { g: g, dot: g.querySelector('.arc-dot'), hit: g.querySelector('.arc-dot__hit') };
  }

  /* ---- small beats shared by the pages ------------------------------------ */
  function grow(line, seconds) {
    return Flow.anim(Beats.growLine(line, seconds || LINE_TIME, 'power2.inOut'));
  }
  /* The colour inside a shape, faded up. */
  function discIn(shape) {
    var tl = M.timeline({ willChange: shape, willChangeValue: 'opacity' });
    tl.to(shape, { opacity: 1, duration: M.dur(0.4), ease: 'power2.out' });
    return tl;
  }
  /* A region's edge swelled once: its lines, and its arc. */
  function pulseEdge(lines, arcs) {
    return Promise.all([
      lines && lines.length ? Flow.anim(Beats.linePulse(lines)) : null,
      arcs && arcs.length ? Flow.anim(Beats.linePulse(arcs, ARC_W)) : null
    ]);
  }

  /* ======================================================================
   * Speaking to the picture
   * ----------------------------------------------------------------------
   * A line said from the header with beats on its words: `cues` is a list
   * of {word, run}, and each run is started the moment its word is heard
   * -- pages.js's onWord: counted from the moment the line's first word
   * goes on (after the old line is cleared, or the bird has landed), on
   * the recording's word cues (locales.json) when the line has a clip
   * and at the Typer's pace when it has none -- so the mark and the word
   * that names it land together. With `arrive` the bird comes up to say
   * it. The promise is the line's AND every beat's.
   * ====================================================================== */
  function sayWith(line, cues, opts) {
    var o = opts || {};
    var text = line.text || String(line);
    var beats = (cues || []).map(function (cue) {
      return K.onWord(text, cue.word, cue.run);
    });
    var said = o.arrive ? K.arriveSaying(line, o.mood) : K.speak(line, o.mood);
    return Promise.all([said].concat(beats));
  }
  /* The bird's verdicts, said from the header where it already stands:
     one sentence or several, each typed in turn and read for a moment
     before the next takes its place. A newer verdict takes the header
     over: an older chain that wakes up to find itself outvoted stops
     between its lines rather than talking over the new one. */
  function verdict(lines, mood) {
    var mine = ++saying;
    function live() { return mine === saying; }
    return [].concat(lines).reduce(function (chain, line, i) {
      return chain
        .then(function () { if (i && live()) return Flow.wait(READ); })
        .then(function () { if (live()) return K.speak(line, mood); });
    }, Promise.resolve());
  }

  /* The page's last beat on the lesson's figure: Next, and only its PRESS
     sends the bird away with its line and the picture. `keepHeader` leaves
     the header open for the next page; otherwise it closes behind the bird
     and is opened again over a clean board. */
  function closePage(group, keepHeader) {
    return K.handOver(dom.nextBtn)
      .then(function () {
        saying++;
        if (global.I18n) global.I18n.stop();
        return Promise.all([
          K.mascotJumpOut(keepHeader),
          Flow.anim(Beats.lineOut(dom.promptLine)),
          Flow.anim(Beats.clearFigure([group]))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        group.setAttribute('hidden', '');
        K.clearInline([group].concat(Array.prototype.slice.call(group.querySelectorAll('*'))));
        if (!keepHeader) return Flow.anim(K.collapseHeader(false));
      });
  }

  /* ======================================================================
   * Pages 0 and 6 -- a word on the field
   * ----------------------------------------------------------------------
   * The board goes, and the bird -- standing on the field again, as it did
   * before the lesson began -- says its lines in its own bubble, one after
   * the other; then Next, and the board grows back in for what comes next.
   * The same beat skill 2 opens with (arclen.js).
   * ====================================================================== */
  function fieldTalk(keys) {
    var all = [].concat(keys);
    return K.wipeBoard()
      .then(function () {
        mascot.el.hidden = false;
        mascot.placeIn(dom.slotHero);
        mascot.el.classList.remove('is-away');
        mascot.idle();
        if (dom.board.classList.contains('show')) return Flow.anim(Beats.boardOut(dom.board));
      })
      /* A header an earlier page closed is opened again while the board is
         out of sight: the page after this one opens on an open one. */
      .then(function () {
        return Promise.all([Flow.anim(K.collapseHeader(false)),
                            Flow.anim(K.collapseHeader(false, 'is-bare'))]);
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return all.reduce(function (chain, key, i) {
          return chain.then(function () {
            return (i ? Flow.wait(TALK_GAP) : Promise.resolve()).then(function () {
              mascot.state('talking');
              var line = keyed(key);
              K.quiet(K.hear(line.vo));
              if (i) return K.sayBubble(line.text);
              /* Ghost before live, and before the bubble is shown: the
                 bubble has to be laid out and measurable when the line
                 goes into it, or it would open at the wrong size. */
              Beats.bubbleArm(dom.bubble);
              var said = K.sayBubble(line.text);
              Beats.bubbleIn(dom.bubble);
              return said;
            }).then(function () { mascot.settle(); });
          });
        }, Promise.resolve());
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return K.handOver(dom.nextBtn); })
      /* The bubble goes and the board grows back in over the bird. */
      .then(function () { return Flow.anim(Beats.bubbleOut(dom.bubble)); })
      .then(function () {
        K.clearBubble();
        return Flow.anim(Beats.boardIn(dom.board));
      })
      /* The board has closed over the bird: it is away now, so the next
         page's wipe has nothing to spring off the field, and its next
         jump in comes up from behind the board as ever. */
      .then(function () {
        mascot.el.classList.add('is-away');
        return Flow.wait(SHORT);
      });
  }

  function sceneIntro() { return fieldTalk(['s4IntroHey', 's4IntroWarmup']); }
  function sceneApplyIntro() { return fieldTalk(['s4ApplyLearnt', 's4ApplySolve']); }

  /* ======================================================================
   * Page 1 -- the cards
   * ====================================================================== */

  /* One card, built where it stands, with the one region it shows. The
     same marks on all three -- the ring, the two points, the chord, the
     two radii, the centre -- and a different one of them faded back on
     each, so the eye reads the shaded region's EDGES: the sector's chord
     is a ghost, the segment's radii and centre are ghosts. */
  function buildCard(kind, i) {
    var geo = circleAt(CARD_X[i], CARD_CY, CARD_R);
    var o = { x: geo.cx, y: geo.cy };
    var pA = geo.pt(CUT.a), pB = geo.pt(CUT.a + CUT.span);
    var g = el('g', { 'class': 'sa-card sa-card--' + kind, role: 'button', tabindex: -1,
                      'aria-label': T('a11yShaded') });
    var card = { kind: kind, g: g, geo: geo, i: i, named: false };

    card.face = el('rect', { 'class': 'sa-card__face', x: CARD_X[i] - CARD_W / 2, y: CARD_Y,
                             width: CARD_W, height: CARD_H, rx: CARD_RX });
    g.appendChild(card.face);

    card.disc = el('circle', { 'class': 'sa-disc', cx: geo.cx, cy: geo.cy, r: geo.r });
    g.appendChild(card.disc);

    /* The region. A segment's is coloured from the chord outward through
       a clip circle on the chord's middle (segFill, animations.js); the
       sector's and the triangle's are swept from one radius round to the
       other (secFill), so they are written as they go. */
    if (kind === 'segment') {
      var mid = geo.chordMid(CUT.a, CUT.span);
      var clip = el('clipPath', { id: 'saClip' + i });
      card.clip = el('circle', { cx: mid.x, cy: mid.y, r: CLIP_OPEN });
      clip.appendChild(card.clip);
      dom.saDefs.appendChild(clip);
      card.reach = geo.reach(CUT.span);
      card.region = el('path', { 'class': 'sa-region', d: geo.seg(CUT.a, CUT.span),
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

    card.rim = el('path', { 'class': 'sa-rim', d: geo.rim });
    g.appendChild(card.rim);
    card.tip = el('circle', { 'class': 'rim-tip', cx: geo.cx, cy: geo.cy - geo.r, r: 7 });
    g.appendChild(card.tip);

    card.arc = null;
    if (kind !== 'triangle') {
      card.arc = el('path', { 'class': 'sa-arc', d: geo.arc(CUT.a, CUT.span) });
      g.appendChild(card.arc);
    }

    card.centre = el('circle', { 'class': 'sa-centre' + (kind === 'segment' ? ' is-ghost' : ''),
                                 cx: geo.cx, cy: geo.cy, r: CENTRE_R });
    g.appendChild(card.centre);

    card.dots = [pA, pB].map(function (p) {
      var d = el('circle', { 'class': 'sa-dot', cx: p.x, cy: p.y, r: DOT_R });
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
    cards.forEach(function (card) { card.label.textContent = T(names[card.kind]); });
  }
  function putAwayCards() {
    dom.saCards.textContent = '';
    dom.saDefs.textContent = '';
    dom.sa.classList.remove('is-asking');
    cards = [];
  }

  /* A card stands up: the plate pops in where it belongs, the way every
     box in the app arrives. The group rests at nothing (segarea.css) and
     is left at full once it is up; the wipe takes it down again. */
  function cardIn(card) {
    M.set(card.g, { opacity: 0, scale: 0.9, transformOrigin: 'center center' });
    var tl = M.timeline({ willChange: card.g, willChangeValue: 'transform, opacity' });
    tl.to(card.g, { opacity: 1, scale: 1, duration: M.dur(0.45), ease: M.POP });
    tl.call(Beats.pop, null, 0);
    return tl;
  }

  /* The marks that are NOT part of the region, faded in as ghosts: there,
     so the picture is the same picture, but plainly not what is shaded. */
  function ghostsIn(list) {
    var tl = M.timeline({ willChange: list, willChangeValue: 'opacity' });
    tl.to(list, { opacity: GHOST, duration: M.dur(0.45), ease: 'power2.out', stagger: M.gap(0.08) });
    return tl;
  }

  /* The region, lit: it breathes a halo in the colour of the edge that
     makes it (segarea.css) until the card is answered. A segment's clip
     is taken off first -- it was only there for the colour to spread
     through, and a halo seen through it would be cut at its edge. */
  function lightRegion(card) {
    card.region.removeAttribute('clip-path');
    card.region.classList.add('is-glow');
  }

  /* One card made: the plate, the ring from the top, the colour, the two
     points, and then its region -- its edges first, then the shade swept
     in between them, then the centre, then the ghosts -- and the region
     lit. */
  function drawCard(card) {
    var geo = card.geo;
    var made = Flow.anim(cardIn(card))
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.drawRim(card.rim, card.tip, { time: CARD_RIM })); })
      .then(function () { return Flow.wait(120); })
      .then(function () { return Flow.anim(discIn(card.disc)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(card.dots[0])); })
      .then(function () { return Flow.wait(160); })
      .then(function () { return Flow.anim(Beats.plotDot(card.dots[1])); })
      .then(function () { return Flow.wait(SHORT); });

    var region;
    if (card.kind === 'sector') {
      region = made
        .then(function () { return grow(card.radA); })
        .then(function () { return Flow.wait(160); })
        .then(function () { return grow(card.radB); })
        .then(function () { return Flow.wait(SHORT); })
        .then(function () {
          return Promise.all([
            Flow.anim(Beats.secFill(card.region, function (t) { return geo.wedge(CUT.a, CUT.span, t); }, FILL_TIME)),
            Flow.anim(Beats.growLine(card.arc, FILL_TIME, 'power2.inOut'))
          ]);
        })
        .then(function () { return Flow.anim(Beats.plotDot(card.centre, 0.4)); })
        .then(function () { return Flow.anim(ghostsIn([card.chord])); });
    } else if (card.kind === 'triangle') {
      region = made
        .then(function () { return grow(card.radA); })
        .then(function () { return Flow.wait(160); })
        .then(function () { return grow(card.radB); })
        .then(function () { return Flow.wait(160); })
        .then(function () { return grow(card.chord); })
        .then(function () { return Flow.wait(SHORT); })
        .then(function () {
          return Flow.anim(Beats.secFill(card.region, function (t) { return geo.tri(CUT.a, CUT.span, t); }, FILL_TIME));
        })
        .then(function () { return Flow.anim(Beats.plotDot(card.centre, 0.4)); });
    } else {
      region = made
        .then(function () { return grow(card.chord); })
        .then(function () { return Flow.wait(160); })
        .then(function () { return grow(card.arc); })
        .then(function () { return Flow.wait(SHORT); })
        .then(function () { return Flow.anim(Beats.segFill(card.region, card.clip, card.reach, FILL_TIME)); })
        .then(function () { return Flow.anim(ghostsIn([card.radA, card.radB, card.centre])); });
    }
    return region.then(function () { lightRegion(card); });
  }

  /* A name, under its circle. */
  function nameIn(card) {
    if (card.named) return null;
    card.named = true;
    return Beats.labelIn(card.label);
  }

  /* A card refused: it turns red (a class -- the stylesheet transitions
     the plate) and shakes its head, as a refused box does, holds the red
     for a beat, and is a plain card again -- spent, with its name under
     its circle so the learner knows what it WAS. */
  var SHAKE = [-5, 5, -5, 5, -4, 4, 0];

  function cardWrong(card) {
    var g = card.g;
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
    var name = nameIn(card);
    if (name) tl.add(name, M.gap(0.1));
    tl.to({}, { duration: M.dur(0.5) });        /* the red, read before it goes */
    return tl;
  }

  /* The right card: green, one outward pulse, the tick popping onto its
     corner, and its name under its circle. The green is a state it stays
     in. */
  function cardRight(card) {
    var g = card.g;
    g.classList.remove('is-wrong');
    g.classList.add('is-right');
    Beats.sfx('correct');
    M.set(card.badge, { opacity: 0, scale: 0, transformOrigin: 'center center' });
    var tl = M.timeline({
      willChange: [g, card.badge], willChangeValue: 'transform, opacity',
      revert: function () { M.set(g, { clearProps: 'transform' }); }
    });
    tl.to(g, { scale: 1.04, transformOrigin: 'center center',
               duration: M.dur(0.14), ease: 'power2.out' }, 0)
      .to(g, { scale: 1, duration: M.dur(0.4), ease: M.POP }, M.gap(0.14))
      .to(card.badge, { opacity: 1, scale: 1, duration: M.dur(0.4), ease: 'back.out(2)' }, M.gap(0.1));
    var name = nameIn(card);
    if (name) tl.add(name, M.gap(0.2));
    return tl;
  }

  /* Every name not yet shown, one after the other: once the segment has
     been found all three regions are named, so the three readings of the
     one picture stand side by side. */
  function namesIn() {
    var list = cards.filter(function (card) { return !card.named; });
    if (!list.length) return null;
    var tl = M.timeline();
    list.forEach(function (card, i) {
      var name = nameIn(card);
      if (name) tl.add(name, M.gap(i * 0.18));
    });
    return tl;
  }

  /* The interaction: one of three cards, tapped. All three go live -- the
     cursor becomes a hand over them, a press sinks the one under it a
     touch -- and a press is an answer. A wrong card is refused and spent,
     `onWrong` is told which so the bird can say why, and the learner
     tries again among the cards that are left. The right one fires a
     click at the lesson's gate and the scene waits on THAT, as every
     choice in the lesson does: an ordinary Flow.once, cancelled with the
     rest of the chain when a scene is retired. A skip answers it with the
     right card. Keyboard: each card takes focus, and Enter or Space
     presses it. */
  function armCards(spec) {
    var live = true;
    var misses = 0;
    var list = cards.map(function (card) { return card.g; });

    dom.sa.classList.add('is-asking');
    list.forEach(function (g) { g.setAttribute('tabindex', '0'); });

    function cardOf(g) {
      for (var i = 0; i < cards.length; i++) if (cards[i].g === g) return cards[i];
      return null;
    }
    function onPick(ev) {
      if (!live) return;
      var g = ev.currentTarget;
      var card = cardOf(g);
      if (!card || g.classList.contains('is-done')) return;
      K.ripple(ev, g);
      g.classList.add('is-done');
      if (card.kind === spec.answer) {
        live = false;
        dom.gate.dispatchEvent(new MouseEvent('click'));
        return;
      }
      misses++;
      K.quiet(Flow.anim(cardWrong(card)));
      if (spec.onWrong) spec.onWrong(card, misses);
    }
    function onKey(ev) {
      if (ev.key !== 'Enter' && ev.key !== ' ' && ev.key !== 'Spacebar') return;
      ev.preventDefault();
      onPick(ev);
    }
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
    return cards.filter(function (card) { return card.kind === ANSWER; })[0];
  }

  /* The scene. A blank board with its header closed, so the row has the
     whole of it; three cards made one after another where they stand,
     each region lit; the bird up to ask; the taps, each answered from the
     header; the right card named with the rest; and Next. */
  function sceneSegment() {
    var names = { sector: 's4p1Sector', triangle: 's4p1Triangle', segment: 's4p1Segment' };
    var wrong = {
      sector:   [keyed('s4p1WrongSector'), L('s4p1Look')],
      triangle: [keyed('s4p1WrongTriangle'), L('s4p1Look')]
    };
    var outcome = null;

    return K.wipeBoard()
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(K.collapseHeader(true)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        makeCards(K.shuffle(KINDS), names);
        dom.sa.removeAttribute('hidden');
        return cards.reduce(function (chain, card) {
          return chain
            .then(function () { return drawCard(card); })
            .then(function () { return Flow.wait(SHORT); });
        }, Promise.resolve());
      })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the question: the cards go live as the bird sets off, before
         its line is finished; the header opens for it, and the bird STAYS
         on it -- every verdict is said from there ------------------------ */
      .then(function () {
        outcome = K.quiet(armCards({
          answer: ANSWER,
          onWrong: function (card) { K.quiet(verdict(wrong[card.kind], 'confused')); }
        }));
        return K.arriveSaying(L('s4p1Ask'));
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
          verdict([keyed('fbCorrect'), L('s4p1Right')], 'happy')
            .then(function () { return Flow.anim(namesIn()); })
        ]);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return closePage(dom.sa, false); })
      .then(putAwayCards);
  }

  /* ======================================================================
   * Page 3 -- make a segment
   * ----------------------------------------------------------------------
   * A circle drawn quickly, its colour and its centre; the bird asks for
   * two points (skill 2's own two-point pick, arcs.js); the chord joins
   * them, and the two regions it makes are coloured in from it, each with
   * its piece of the rim lit in its own colour. Each is named on the words
   * that define it -- the minor segment, then the major -- the names go,
   * and the two points are joined to the centre: the radii grow as the
   * larger piece steps back, and the angle between them at the centre is
   * marked θ. Next.
   * ====================================================================== */

  /* Every mark that depends on the two points, rewritten from them. */
  function redrawChord() {
    var a = cut.a, b = cut.a + cut.span;
    var o = { x: CX, y: CY };
    var pA = MAIN.pt(a), pB = MAIN.pt(b);
    dom.scRadA.setAttribute('d', lineD(o, pA));
    dom.scRadB.setAttribute('d', lineD(o, pB));
    dom.scChord.setAttribute('d', cut.origin === 'a' ? lineD(pA, pB) : lineD(pB, pA));
    dom.scArc.setAttribute('d', MAIN.arc(a, cut.span));
    dom.scArcMajor.setAttribute('d', MAIN.arc(b, 360 - cut.span));
    dom.scSeg.setAttribute('d', MAIN.seg(a, cut.span));
    dom.scMajor.setAttribute('d', MAIN.arc(b, 360 - cut.span) + ' Z');
    dom.scAngle.setAttribute('d', MAIN.arc(a, cut.span, ANGLE_R));
    var th = MAIN.pt(a + cut.span / 2, THETA_R);
    dom.scTheta.setAttribute('x', th.x);
    dom.scTheta.setAttribute('y', round2(th.y + LABEL_DY));
    var mid = MAIN.chordMid(a, cut.span);
    [dom.scClip, dom.scClipMajor].forEach(function (clip) {
      clip.setAttribute('cx', mid.x);
      clip.setAttribute('cy', mid.y);
    });
    A.place(dom.scPointA, a);
    A.place(dom.scPointB, b);
    /* the smaller piece's name just past the rim on its middle line --
       kept inside the picture, whichever way the cut faces -- and the
       larger's inside, well in from the centre on the far side */
    var lm = MAIN.pt(a + cut.span / 2, RR + SC_LABEL_OUT);
    dom.scLblMinor.setAttribute('x', Math.max(90, Math.min(K.VB_W - 90, lm.x)));
    dom.scLblMinor.setAttribute('y', round2(Math.max(26, Math.min(K.VB_H - 12, lm.y + LABEL_DY))));
    var lM = MAIN.pt(a + cut.span / 2 + 180, RR * SC_LABEL_IN);
    dom.scLblMajor.setAttribute('x', lM.x);
    dom.scLblMajor.setAttribute('y', round2(lM.y + LABEL_DY));
  }

  /* How far each clip circle has to grow: the smaller piece's own reach,
     and the far side of the circle for the larger. */
  function scReach() {
    return [MAIN.reach(cut.span), MAIN.reachMajor(cut.span)];
  }

  /* The two radii in the order they are drawn: to the point placed FIRST
     first, so the picture is made in the order the learner made it. */
  function radiiInOrder() {
    return cut.origin === 'b' ? [dom.scRadA, dom.scRadB] : [dom.scRadB, dom.scRadA];
  }

  /* What arcs.js's two-point interaction works on here: this page's circle
     and marks, and its own state for the cut to be written into. */
  function pickCtx() {
    return {
      group: dom.sc, band: dom.scBand, ghost: dom.scGhost, nudges: dom.scNudges,
      hand: hand, points: [dom.scPointA, dom.scPointB],
      minSpan: SC_MIN, maxSpan: SC_MAX,
      done: function (chosen) {
        cut.a = chosen.a; cut.span = chosen.span; cut.origin = chosen.origin;
        redrawChord();
      }
    };
  }

  function sceneChord() {
    var picked = null;

    return K.wipeBoard()
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the circle, quickly: the pen round the rim, the colour poured
         in, and the small dot at its centre --------------------------------- */
      .then(function () {
        cut.a = SC_DEFAULT.a; cut.span = SC_DEFAULT.span; cut.origin = SC_DEFAULT.origin;
        redrawChord();
        dom.sc.removeAttribute('hidden');
        return Flow.anim(Beats.drawRim(dom.scRim, dom.scTip, { time: PEN_QUICK }));
      })
      .then(function () { return Flow.wait(120); })
      .then(function () { return Flow.anim(Beats.fillDisc(dom.scDisc)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.scCentre, DOT_TIME)); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- "Tap any two points on the circle." -- the rim breathes while
         a point is wanted, and the hand shows the way if nothing is placed.
         Listening starts as the bird lands, before its line is finished. */
      .then(function () {
        picked = K.quiet(A.pickPoints(pickCtx()));
        return K.arriveSaying(L('s4p3Pick'));
      })
      .then(function () {
        mascot.settle();
        return picked;
      })

      /* ---- the chord joins them, from the point placed last; the bird
         keeps its place on the header but its line goes; then the two
         regions are coloured in from the chord, each with its piece of
         the rim -- the smaller in orange, the larger in lavender ---------- */
      .then(function () { return Flow.anim(Beats.lineOut(dom.promptLine)); })
      .then(function () {
        K.clearPrompt();
        return Flow.anim(Beats.growLine(dom.scChord, CHORD_TIME, 'sine.inOut'));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Promise.all([
          Flow.anim(Beats.segReveal({
            minor: dom.scSeg, major: dom.scMajor,
            clips: [dom.scClip, dom.scClipMajor], reach: scReach(),
            area: null, dots: [dom.scPointA.dot, dom.scPointB.dot]
          })),
          Flow.anim(Beats.growLine(dom.scArc, 0.6, 'power2.inOut')),
          Flow.wait(300).then(function () {
            return Flow.anim(Beats.growLine(dom.scArcMajor, 0.9, 'power2.inOut'));
          })
        ]);
      })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- "The region between the chord and the minor arc is the minor
         segment." -- the chord swells on its word, the arc on its, and the
         name lands on the region as it is said ---------------------------- */
      .then(function () {
        return sayWith(L('s4p3MinorDef'), [
          { word: 'chord',         run: function () { return pulseEdge([dom.scChord], []); } },
          { word: 'minor arc',     run: function () { return pulseEdge([], [dom.scArc]); } },
          { word: 'minor segment', run: function () { return Flow.anim(Beats.labelIn(dom.scLblMinor)); } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(SHORT); })

      /* ---- "The region between the chord and the major arc is the major
         segment." -- the same for the larger piece ------------------------ */
      .then(function () {
        return sayWith(L('s4p3MajorDef'), [
          { word: 'major arc',     run: function () { return pulseEdge([], [dom.scArcMajor]); } },
          { word: 'major segment', run: function () { return Flow.anim(Beats.labelIn(dom.scLblMajor)); } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- the names go; "Now join both points to the centre." -- the
         radii grow out one after the other, and the larger piece steps
         back so the smaller one and the sector it sits in are what is
         looked at ---------------------------------------------------------- */
      .then(function () { return Flow.anim(Beats.labelsOut([dom.scLblMinor, dom.scLblMajor])); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return sayWith(L('s4p3Join'), [
          { word: 'join', run: function () {
            var r = radiiInOrder();
            K.quiet(Flow.anim(M.to([dom.scMajor, dom.scArcMajor],
              { opacity: MAJOR_REST, duration: M.dur(0.6), ease: 'power2.inOut' })));
            return grow(r[0], RADIUS_TIME)
              .then(function () { return Flow.wait(120); })
              .then(function () { return grow(r[1], RADIUS_TIME); });
          } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(SHORT); })

      /* ---- "The angle between the two radii at the centre is θ." -- the
         angle is drawn on its word, and its "θ" lands after it ------------ */
      .then(function () {
        return sayWith(L('s4p3Theta'), [
          { word: 'angle', run: function () {
            return grow(dom.scAngle, ANGLE_TIME)
              .then(function () { return Flow.anim(Beats.labelIn(dom.scTheta)); });
          } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })
      .then(function () { return closePage(dom.sc, true); })
      .then(function () { dom.scNudges.setAttribute('hidden', ''); });
  }

  /* ======================================================================
   * Page 4 -- sector minus triangle
   * ----------------------------------------------------------------------
   * One circle, built up a sentence at a time with every mark landing on
   * the word that names it: the circle and its centre, two points, a
   * radius to each with the angle θ between them, the sector between them
   * coloured in with its arc lit; the chord, and the triangle the radii
   * and chord make coloured in over the sector. Then the cut: a dashed
   * line runs along the chord, and the triangle -- with its two sides and
   * its angle, as one piece -- is lifted out of the circle and set down
   * beside it, while the sector's colour draws back to the chord. What is
   * left in the circle is the minor segment, and both pieces are named.
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
    dom.sePieceChord.setAttribute('d', lineD(pA, pB));
    dom.seCut.setAttribute('d', lineD(pA, pB));
    dom.seCutPen.setAttribute('d', lineD(pA, pB));
    dom.seAngle.setAttribute('d', MAIN.arc(a, SE.span, ANGLE_R));
    var th = MAIN.pt(a + SE.span / 2, THETA_R);
    dom.seTheta.setAttribute('x', th.x);
    dom.seTheta.setAttribute('y', round2(th.y + LABEL_DY));
    dom.seDotA.setAttribute('cx', pA.x); dom.seDotA.setAttribute('cy', pA.y);
    dom.seDotB.setAttribute('cx', pB.x); dom.seDotB.setAttribute('cy', pB.y);
    /* the segment's name past the rim on the arc's middle line; the
       triangle's under the piece where it comes to rest */
    var ls = MAIN.pt(a + SE.span / 2, RR + 58);
    dom.seLblSeg.setAttribute('x', ls.x);
    dom.seLblSeg.setAttribute('y', round2(ls.y + LABEL_DY));
    dom.seLblTri.setAttribute('x', round2((CX + pA.x) / 2 + PIECE_AWAY.x));
    dom.seLblTri.setAttribute('y', round2(CY + PIECE_AWAY.y + 40));
  }

  /* The cut: the dashed line runs along the chord as the chord swells. */
  function cutAlong() {
    Beats.pop();
    return Promise.all([
      Flow.anim(Beats.dashedIn(dom.seCut, dom.seCutPen, CUT_TIME)),
      pulseEdge([dom.seChord], [])
    ]);
  }

  /* The triangle taken away, as one piece, on one clock: it is lifted (a
     shadow comes under it), carried out of the circle to its resting
     place and set down with a pop; the cut line goes with it; and the
     sector's colour is drawn back from the centre to the chord, its apex
     carried up the triangle's middle line, until the tan region is the
     segment and nothing more. However the timeline ends, the picture is
     left with the piece out and the segment alone. */
  function removeTriangle() {
    var centre = { x: CX, y: CY };
    var mid = MAIN.chordMid(SE.a, SE.span);
    var apex = { t: 0 };
    function draw() {
      var p = lerp(centre, mid, apex.t);
      dom.seSector.setAttribute('d', 'M' + p.x + ' ' + p.y + ' L' + MAIN.arc(SE.a, SE.span).slice(1) + ' Z');
    }
    var piece = dom.sePiece;
    var LIFT = 0.2;
    M.set(dom.sePieceChord, { opacity: 1 });
    var tl = M.timeline({
      willChange: piece, willChangeValue: 'transform',
      revert: function () {
        apex.t = 1; draw();
        piece.classList.remove('is-lifted');
        M.set(piece, { x: PIECE_AWAY.x, y: PIECE_AWAY.y, scale: 1 });
        M.set(dom.seCut, { opacity: 0 });
      }
    });
    tl.call(function () { piece.classList.add('is-lifted'); }, null, 0)
      .to(piece, { scale: 1.04, transformOrigin: '50% 50%', duration: M.dur(LIFT), ease: 'power2.out' }, 0)
      .to(piece, { x: PIECE_AWAY.x, y: PIECE_AWAY.y, duration: M.dur(REMOVE_TIME), ease: 'power2.inOut' }, M.gap(LIFT))
      .to(dom.seCut, { opacity: 0, duration: M.dur(0.3), ease: 'power2.in' }, M.gap(LIFT))
      .to(apex, { t: 1, duration: M.dur(REMOVE_TIME), ease: 'power2.inOut', onUpdate: draw }, M.gap(LIFT))
      .to(piece, { scale: 1, duration: M.dur(0.35), ease: M.POP }, M.gap(LIFT + REMOVE_TIME - 0.1))
      .call(function () { piece.classList.remove('is-lifted'); }, null, M.gap(LIFT + REMOVE_TIME));
    tl.call(Beats.pop, null, M.gap(LIFT + REMOVE_TIME));
    return tl;
  }

  function sceneStep() {
    var made = null;
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        layoutStep();
        dom.se.removeAttribute('hidden');
      })

      /* ---- "Let's begin with a circle and its centre." -- the bird comes
         up; the pen goes round on "circle" and the colour follows, the dot
         lands on "centre" once the ring is closed ------------------------ */
      .then(function () {
        return sayWith(L('s4p5Start'), [
          { word: 'circle', run: function () {
            made = Flow.anim(Beats.drawRim(dom.seRim, dom.seTip, { time: PEN_QUICK }))
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
        return sayWith(L('s4p5Points'), [
          { word: 'two',    run: function () { return Flow.anim(Beats.plotDot(dom.seDotA)); } },
          { word: 'points', run: function () { return Flow.anim(Beats.plotDot(dom.seDotB)); } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "Join each point to the centre." -- the radii
         grow out one after the other from "Join", and the angle between
         them is marked θ after them ---------------------------------------- */
      .then(function () {
        return sayWith(L('s4p5Radii'), [
          { word: 'Join', run: function () {
            return grow(dom.seRadA, RADIUS_TIME)
              .then(function () { return Flow.wait(120); })
              .then(function () { return grow(dom.seRadB, RADIUS_TIME); })
              .then(function () { return grow(dom.seAngle, ANGLE_TIME); })
              .then(function () { return Flow.anim(Beats.labelIn(dom.seTheta)); });
          } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "The two radii and the minor arc form a minor sector." -- the
         radii swell on their word, the arc lights on its, and the sector
         is swept in on "form" ------------------------------------------- */
      .then(function () {
        return sayWith(L('s4p5Sector'), [
          { word: 'radii',   run: function () { return pulseEdge([dom.seRadA, dom.seRadB], []); } },
          { word: 'arc',     run: function () { return Flow.anim(Beats.growLine(dom.seArc, 0.7, 'power2.inOut')); } },
          { word: 'form', run: function () {
            return Flow.anim(Beats.secFill(dom.seSector, function (t) { return MAIN.wedge(SE.a, SE.span, t); }, FILL_TIME));
          } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "Now join the two points with a chord." ------------------------ */
      .then(function () {
        return sayWith(L('s4p5Chord'), [
          { word: 'join', run: function () { return grow(dom.seChord, CHORD_TIME); } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "The two radii and the chord form a triangle." -- each side
         swells on its word, and the triangle is coloured in over the
         sector on "form" ------------------------------------------------------ */
      .then(function () {
        return sayWith(L('s4p5Triangle'), [
          { word: 'radii', run: function () { return pulseEdge([dom.seRadA, dom.seRadB], []); } },
          { word: 'chord', run: function () { return pulseEdge([dom.seChord], []); } },
          { word: 'form',  run: function () {
            return Flow.anim(Beats.secFill(dom.seTri, function (t) { return MAIN.tri(SE.a, SE.span, t); }, 0.7));
          } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "Let's cut along the chord." -- the dashed cut runs along it -- */
      .then(function () {
        return sayWith(L('s4p5Cut'), [
          { word: 'cut', run: cutAlong }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "Remove the triangle from the sector." -- on "Remove" the
         piece is lifted out of the circle and set down beside it, and the
         sector's colour draws back to the chord --------------------------- */
      .then(function () {
        return sayWith(L('s4p5Remove'), [
          { word: 'Remove', run: function () { return Flow.anim(removeTriangle()); } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "The region left is the minor segment." -- its edge swells once,
         and the two pieces are named ----------------------------------------- */
      .then(function () {
        return sayWith(L('s4p5Left'), [
          { word: 'segment', run: function () {
            return pulseEdge([dom.seChord], [dom.seArc])
              .then(function () { return Flow.anim(Beats.labelIn(dom.seLblSeg)); })
              .then(function () { return Flow.anim(Beats.labelIn(dom.seLblTri)); });
          } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })
      .then(function () { return closePage(dom.se, true); })
      .then(function () { dom.sePiece.classList.remove('is-lifted'); layoutStep(); });
  }

  /* ======================================================================
   * Pages 5 and 12 -- the recaps: three small circles in a row
   * ====================================================================== */

  /* One small circle, built where it stands, with the one region it shows
     -- the marks the big pages drew, on a smaller circle, with the angle θ
     on the pieces that have one. The kinds: sector, triangle, segment
     (page 5) and msector, msegment (page 12); `host` is the group it goes
     into. */
  function buildFig(kind, i, host) {
    var geo = circleAt(SF_X[i], SF_CY, SF_R);
    var o = { x: geo.cx, y: geo.cy };
    var pA = geo.pt(SE.a), pB = geo.pt(SE.a + SE.span);
    var major = kind === 'msector' || kind === 'msegment';
    var g = el('g', { 'class': 'sf-fig sf-fig--' + kind });
    var f = { kind: kind, g: g, geo: geo };
    f.disc = el('circle', { 'class': 'sa-disc', cx: geo.cx, cy: geo.cy, r: geo.r });
    g.appendChild(f.disc);
    var regionClass = kind === 'triangle' ? 'se-tri' : (major ? 'sa-region sa-region--major' : 'sa-region');
    var regionD = kind === 'segment' ? geo.seg(SE.a, SE.span)
                : kind === 'msegment' ? geo.arc(MJ.a, MJ.span) + ' Z' : '';
    f.region = el('path', { 'class': regionClass, d: regionD });
    g.appendChild(f.region);
    f.radA = f.radB = f.chord = f.arc = f.arcMinor = f.angle = f.theta = null;
    if (kind === 'sector' || kind === 'triangle' || kind === 'msector') {
      f.radA = el('path', { 'class': 'sa-radius', d: lineD(o, pA) });
      f.radB = el('path', { 'class': 'sa-radius', d: lineD(o, pB) });
      g.appendChild(f.radA); g.appendChild(f.radB);
      /* the angle at the centre: θ on the minor pieces and the triangle,
         the reflex angle on the major sector */
      var span = major ? MJ : SE;
      f.angle = el('path', { 'class': 's4-angle', d: geo.arc(span.a, span.span, SF_ANGLE_R) });
      var tp = geo.pt(span.a + span.span / 2, major ? 54 : 42);
      f.theta = el('text', { 'class': 'figure-label s4-theta s4-theta--small', x: tp.x,
                             y: round2(tp.y + 6), 'text-anchor': 'middle' });
      f.theta.textContent = major ? T('s4LblReflex') : T('lblTheta');
      g.appendChild(f.angle); g.appendChild(f.theta);
    }
    if (kind === 'triangle' || kind === 'segment' || kind === 'msegment') {
      f.chord = el('path', { 'class': 'sa-chord', d: lineD(pA, pB) });
      g.appendChild(f.chord);
    }
    f.rim = el('path', { 'class': 'sa-rim', d: geo.rim });
    g.appendChild(f.rim);
    f.tip = el('circle', { 'class': 'rim-tip', cx: geo.cx, cy: geo.cy - geo.r, r: 7 });
    g.appendChild(f.tip);
    if (kind === 'sector' || kind === 'segment') {
      f.arc = el('path', { 'class': 'sa-arc', d: geo.arc(SE.a, SE.span) });
      g.appendChild(f.arc);
    }
    if (major) {
      f.arc = el('path', { 'class': 'sa-arc sa-arc--major', d: geo.arc(MJ.a, MJ.span) });
      g.appendChild(f.arc);
    }
    if (kind === 'msegment') {
      f.arcMinor = el('path', { 'class': 'sa-arc sa-arc--blue', d: geo.arc(SE.a, SE.span) });
      g.appendChild(f.arcMinor);
    }
    f.centre = el('circle', { 'class': 'sa-centre', cx: geo.cx, cy: geo.cy, r: 5 });
    g.appendChild(f.centre);
    host.appendChild(g);
    return f;
  }

  /* One small circle made: the ring, the colour, the centre, and then its
     region -- edges first, the angle, then the shade. */
  function drawFig(f) {
    var geo = f.geo;
    var made = Flow.anim(Beats.drawRim(f.rim, f.tip, { time: SF_RIM }))
      .then(function () { return Flow.wait(100); })
      .then(function () { return Flow.anim(discIn(f.disc)); })
      .then(function () { return Flow.anim(Beats.plotDot(f.centre, 0.3)); })
      .then(function () { return Flow.wait(SHORT); });
    function angle() {
      if (!f.angle) return Promise.resolve();
      return grow(f.angle, 0.35).then(function () { return Flow.anim(Beats.labelIn(f.theta)); });
    }
    if (f.kind === 'sector' || f.kind === 'msector') {
      var span = f.kind === 'sector' ? SE : MJ;
      return made
        .then(function () { return grow(f.radA, 0.4); })
        .then(function () { return grow(f.radB, 0.4); })
        .then(angle)
        .then(function () {
          return Promise.all([
            Flow.anim(Beats.secFill(f.region, function (t) { return geo.wedge(span.a, span.span, t); }, 0.7)),
            Flow.anim(Beats.growLine(f.arc, 0.7, 'power2.inOut'))
          ]);
        });
    }
    if (f.kind === 'triangle') {
      return made
        .then(function () { return grow(f.radA, 0.4); })
        .then(function () { return grow(f.radB, 0.4); })
        .then(angle)
        .then(function () { return grow(f.chord, 0.45); })
        .then(function () {
          return Flow.anim(Beats.secFill(f.region, function (t) { return geo.tri(SE.a, SE.span, t); }, 0.55));
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
    return pulseEdge([f.radA, f.radB, f.chord].filter(Boolean), f.arc ? [f.arc] : []);
  }

  /* A row of three drawn into a board with its header closed: each
     figure made where it stands and named, the signs between them. */
  function drawRow(group, list, signs, labels) {
    return K.wipeBoard()
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(K.collapseHeader(true)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        group.removeAttribute('hidden');
        return list.reduce(function (chain, f, i) {
          return chain
            .then(function () { if (i) return Flow.anim(Beats.labelIn(signs[i - 1])).then(function () { return Flow.wait(SHORT); }); })
            .then(function () { return drawFig(f); })
            .then(function () { return Flow.anim(Beats.labelIn(labels[i])); })
            .then(function () { return Flow.wait(SHORT); });
        }, Promise.resolve());
      })
      .then(function () { return Flow.wait(SHORT); });
  }

  /* Page 5: "So, the minor segment is the part left after removing the
     triangle.", and the
     same as areas -- "Area of the minor segment = Area of the sector −
     Area of the triangle." -- each figure's edges swelling as its name is
     read. */
  function sceneSummary() {
    return drawRow(dom.sf, figs, [dom.sfMinus, dom.sfEquals], dom.sfLabels)
      .then(function () {
        return sayWith(L('s4p6Summary'), [
          { word: 'segment',  run: function () { return pulseFig(figs[2]); } },
          { word: 'triangle', run: function () { return pulseFig(figs[1]); } }
        ], { arrive: true });
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })
      .then(function () {
        return sayWith(L('s4p6Formula'), [
          { word: 'minor segment', run: function () { return pulseFig(figs[2]); } },
          { word: 'sector',        run: function () { return pulseFig(figs[0]); } },
          { word: 'triangle',      run: function () { return pulseFig(figs[1]); } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })
      .then(function () { return closePage(dom.sf, false); });
  }

  /* Page 12: "Major segment = major sector + triangle.", and the shortcut,
     "Or simply πr² − minor segment." */
  function sceneMajorSummary() {
    return drawRow(dom.sk, kfigs, [dom.skPlus, dom.skEquals], dom.skLabels)
      .then(function () {
        return sayWith(L('s4p12Sum1'), [
          { word: 'Major',    run: function () { return pulseFig(kfigs[2]); } },
          { word: 'sector',   run: function () { return pulseFig(kfigs[0]); } },
          { word: 'triangle', run: function () { return pulseFig(kfigs[1]); } }
        ], { arrive: true });
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })
      .then(function () {
        return sayWith(L('s4p12Sum2'), [
          { word: 'πr²',   run: function () { return Flow.anim(Beats.linePulse([kfigs[2].rim], 3.4)); } },
          { word: 'minor', run: function () { return pulseEdge([kfigs[2].chord], [kfigs[2].arcMinor]); } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })
      .then(function () { return closePage(dom.sk, false); });
  }

  /* ======================================================================
   * Page 11 -- the major segment: the major sector with the triangle put
   * back on
   * ----------------------------------------------------------------------
   * The circle, its centre, two points and the chord; the bigger piece
   * coloured in from the chord with its arc lit and named. Then how its
   * area is found, with the same piece as page 4: the radii grow and the
   * colour draws back to the major sector, leaving the triangle's room
   * empty; the triangle -- with its sides and its angle θ -- waits outside
   * the circle where page 4 set it down, and is put back into its room
   * with a pop; and the two become one region, the major segment.
   * ====================================================================== */

  /* The picture, written once. */
  function layoutMajor() {
    var a = SE.a, b = SE.a + SE.span;
    var o = { x: CX, y: CY };
    var pA = MAIN.pt(a), pB = MAIN.pt(b);
    dom.sjMajor.setAttribute('d', MAIN.arc(MJ.a, MJ.span) + ' Z');
    dom.sjTri.setAttribute('d', MAIN.tri(a, SE.span));
    dom.sjTriA.setAttribute('d', lineD(o, pA));
    dom.sjTriB.setAttribute('d', lineD(o, pB));
    dom.sjTriC.setAttribute('d', lineD(pA, pB));
    dom.sjAngle.setAttribute('d', MAIN.arc(a, SE.span, ANGLE_R));
    var th = MAIN.pt(a + SE.span / 2, THETA_R);
    dom.sjTheta.setAttribute('x', th.x);
    dom.sjTheta.setAttribute('y', round2(th.y + LABEL_DY));
    dom.sjArcMajor.setAttribute('d', MAIN.arc(MJ.a, MJ.span));
    dom.sjRadA.setAttribute('d', lineD(o, pA));
    dom.sjRadB.setAttribute('d', lineD(o, pB));
    dom.sjChord.setAttribute('d', lineD(pB, pA));
    dom.sjDotA.setAttribute('cx', pA.x); dom.sjDotA.setAttribute('cy', pA.y);
    dom.sjDotB.setAttribute('cx', pB.x); dom.sjDotB.setAttribute('cy', pB.y);
    var mid = MAIN.chordMid(a, SE.span);
    dom.sjClip.setAttribute('cx', mid.x);
    dom.sjClip.setAttribute('cy', mid.y);
    /* the name inside the bigger piece, on the far side from the chord */
    var lm = MAIN.pt(a + SE.span / 2 + 180, RR * 0.5);
    dom.sjLbl.setAttribute('x', lm.x);
    dom.sjLbl.setAttribute('y', round2(lm.y + LABEL_DY));
  }

  /* The bigger piece drawn back to the major sector: its apex carried
     from the chord's middle to the centre, so what was the segment is
     seen to become the sector with the triangle's room left empty. */
  function drawBack() {
    var centre = { x: CX, y: CY };
    var mid = MAIN.chordMid(SE.a, SE.span);
    var apex = { t: 0 };
    function draw() {
      var p = lerp(mid, centre, apex.t);
      dom.sjMajor.setAttribute('d', 'M' + p.x + ' ' + p.y + ' L' + MAIN.arc(MJ.a, MJ.span).slice(1) + ' Z');
    }
    var tl = M.timeline({ revert: function () { apex.t = 1; draw(); } });
    tl.to(apex, { t: 1, duration: M.dur(PUT_TIME), ease: 'power2.inOut', onUpdate: draw });
    return tl;
  }

  /* The piece, waiting outside the circle where page 4 set it down: it
     fades up there, whole. */
  function pieceWaiting() {
    var piece = dom.sjPiece;
    M.set(piece, { x: PIECE_AWAY.x, y: PIECE_AWAY.y });
    M.set([dom.sjTri, dom.sjTriA, dom.sjTriB, dom.sjTriC, dom.sjAngle, dom.sjTheta], { opacity: 1 });
    M.set(piece, { opacity: 0, scale: 0.9, transformOrigin: '50% 50%' });
    var tl = M.timeline({ willChange: piece, willChangeValue: 'transform, opacity' });
    tl.to(piece, { opacity: 1, scale: 1, duration: M.dur(0.45), ease: M.POP });
    tl.call(Beats.pop, null, 0);
    return tl;
  }

  /* The triangle put back on: lifted, carried into the circle and set
     down in its room between the radii with a pop. However the timeline
     ends, it is in place. */
  function putBack() {
    var piece = dom.sjPiece;
    var LIFT = 0.2;
    var tl = M.timeline({
      willChange: piece, willChangeValue: 'transform',
      revert: function () {
        piece.classList.remove('is-lifted');
        M.set(piece, { x: 0, y: 0, scale: 1, opacity: 1 });
      }
    });
    tl.call(function () { piece.classList.add('is-lifted'); }, null, 0)
      .to(piece, { scale: 1.04, transformOrigin: '50% 50%', duration: M.dur(LIFT), ease: 'power2.out' }, 0)
      .to(piece, { x: 0, y: 0, duration: M.dur(PUT_TIME), ease: 'power2.inOut' }, M.gap(LIFT))
      .to(piece, { scale: 1, duration: M.dur(0.35), ease: M.POP }, M.gap(LIFT + PUT_TIME - 0.1))
      .call(function () { piece.classList.remove('is-lifted'); }, null, M.gap(LIFT + PUT_TIME));
    tl.call(Beats.pop, null, M.gap(LIFT + PUT_TIME));
    return tl;
  }

  /* The two pieces become one: the triangle takes the larger piece's
     colour (a class -- the stylesheet eases the fill), and the lines
     between them -- the radii, both the piece's and the circle's, and the
     piece's angle -- fade, so the chord and the major arc are the only
     edges left. */
  function merge() {
    dom.sjTri.classList.add('is-merged');
    var gone = [dom.sjTriA, dom.sjTriB, dom.sjAngle, dom.sjTheta, dom.sjRadA, dom.sjRadB];
    var tl = M.timeline({
      willChange: gone, willChangeValue: 'opacity',
      revert: function () { M.set(gone, { opacity: 0 }); }
    });
    tl.to(gone, { opacity: 0, duration: M.dur(0.5), ease: 'power2.inOut' }, 0);
    return tl;
  }

  function sceneMajor() {
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle, its centre, two points, and the chord ------------- */
      .then(function () {
        layoutMajor();
        dom.sj.removeAttribute('hidden');
        M.set(dom.sjPiece, { opacity: 0, x: PIECE_AWAY.x, y: PIECE_AWAY.y });
        return Flow.anim(Beats.drawRim(dom.sjRim, dom.sjTip, { time: PEN_QUICK }));
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

      /* ---- "Now, let's look at the larger piece: the major segment." -- the
         bird comes up; the bigger piece is coloured in from the chord on "larger",
         its arc lights on "major", and it is named -------------------------- */
      .then(function () {
        return sayWith(L('s4p11Big'), [
          { word: 'larger', run: function () {
            return Flow.anim(Beats.segFill(dom.sjMajor, dom.sjClip, MAIN.reachMajor(SE.span), FILL_TIME));
          } },
          { word: 'major', run: function () {
            return Flow.anim(Beats.growLine(dom.sjArcMajor, 1.0, 'power2.inOut'))
              .then(function () { return Flow.anim(Beats.arcPulse([dom.sjArcMajor])); })
              .then(function () { return Flow.anim(Beats.labelIn(dom.sjLbl)); });
          } }
        ], { arrive: true });
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "Let's see how to find its area." -- the name goes; the radii
         grow and the colour draws back to the major sector, leaving the
         triangle's room empty ------------------------------------------------ */
      .then(function () {
        return sayWith(L('s4p11How'), [
          { word: 'see', run: function () {
            return Flow.anim(Beats.labelsOut([dom.sjLbl])).then(function () {
              return Promise.all([
                grow(dom.sjRadA, PUT_TIME),
                grow(dom.sjRadB, PUT_TIME),
                Flow.anim(drawBack())
              ]);
            });
          } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "Here is the triangle with central angle θ." -- the piece
         comes up outside the circle, where it was set down -------------- */
      .then(function () {
        return sayWith(L('s4p11Tri'), [
          { word: 'triangle', run: function () { return Flow.anim(pieceWaiting()); } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "Add the triangle to the major sector." -- on "Add" the
         piece is carried into its room and set down ---------------------- */
      .then(function () {
        return sayWith(L('s4p11Back'), [
          { word: 'Add', run: function () { return Flow.anim(putBack()); } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })

      /* ---- "Together, they form the major segment." -- the two become one
         region on "form", and its edge swells as it is named ------------- */
      .then(function () {
        return sayWith(L('s4p11Together'), [
          { word: 'form',    run: function () { return Flow.anim(merge()); } },
          { word: 'segment', run: function () {
            return pulseEdge([dom.sjChord], [dom.sjArcMajor])
              .then(function () { return Flow.anim(Beats.labelIn(dom.sjLbl)); });
          } }
        ]);
      })
      .then(function () { mascot.settle(); return Flow.wait(BEAT); })
      .then(function () { return closePage(dom.sj, true); })
      .then(function () {
        dom.sjTri.classList.remove('is-merged');
        dom.sjPiece.classList.remove('is-lifted');
        layoutMajor();
      });
  }

  /* ======================================================================
   * The problems -- asked and worked as skill 3's are
   * ----------------------------------------------------------------------
   * Everything from here is built in skill 3's stage with skill 3's kit.
   * A page opens with the board wiped, skill 3's layer on and the header
   * open; the figure is drawn in the middle and glides to the left as the
   * first thing is put up beside it.
   * ====================================================================== */
  function openStage(kind) {
    return K.wipeBoard()
      .then(function () {
        SA.lessonOn();
        return Flow.anim(K.collapseHeader(false));
      })
      .then(function () { return SA.stage(kind); });
  }

  /* A keyed formula -- "(θ⁄360) × πr²", "½ × r × r" -- set in the markup
     skill 3 sets its own in: each fraction stood up, the operators in the
     softer ink. The string stays the string (keyed, shuffled, compared);
     only its drawing changes. */
  function fx(text) {
    var G = global.MathText ? global.MathText.GLYPHS : {};
    return String(text)
      .replace(/\(([^()⁄]+)⁄([^()⁄]+)\)|([A-Za-zθ\d°]+)⁄([\d°]+)/g, function (m, n1, d1, n2, d2) {
        return fr(n1 || n2, d1 || d2);
      })
      .replace(/[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/g, function (g) { return G[g] ? fr(G[g][0], G[g][1]) : g; })
      .replace(/ × /g, X).replace(/ − /g, MINUS).replace(/ \+ /g, PLUS);
  }

  /* A length written along a radius, just off it on the side away from
     the piece it bounds, turned to run with the line -- never upside
     down -- as skill 3 names its radius. `side` is +1 for the radius the
     piece ends at, -1 for the one it starts at. */
  function alongRadius(C, geo, deg, side, s) {
    var m = geo.pt(deg, FIG.r * 0.5);
    var t = (deg + side * 90) * Math.PI / 180;
    var x = round2(m.x + Math.cos(t) * 20), y = round2(m.y - Math.sin(t) * 20);
    /* a length runs with its line; a lone letter stands upright, since a
       turned "r" reads as a hook */
    var rot = String(s).length > 2 ? -deg : 0;
    while (rot <= -90) rot += 180;
    while (rot > 90) rot -= 180;
    var g = svgEl('g', { transform: 'rotate(' + round2(rot) + ' ' + x + ' ' + y + ')' }, C.top);
    return SA.text(g, x, y, s, 'lbl lbl--radius lbl--along');
  }

  /* ---- the figure every segment problem is asked about --------------------
     Skill 3's circle (its wash, rim and centre, its amber radii, its
     magenta angle) with this skill's marks on it: the chord, the segment
     coloured in under its arc, and the length of the radius. `o`: theta
     and at (the cut), r (the length's words), deg (the angle's words),
     major (the larger piece is the one coloured, the smaller in blue
     beside it), tri (the triangle coloured too), plain (no segment at
     all: the triangle page), r2 (a second length, on the other radius),
     kind ('pipe', 'bed': the stories' colours). Everything is built; what
     is shown, and when, is the page's -- draw() is the usual order. */
  function segFigure(host, o) {
    o = o || {};
    var F = SA.figure(host, '34 34 352 352');
    var C = SA.circle(F.svg, FIG.cx, FIG.cy, FIG.r);
    var geo = circleAt(FIG.cx, FIG.cy, FIG.r);
    var a0 = o.at == null ? 0 : o.at, th = o.theta || 90, a1 = a0 + th;
    var pA = geo.pt(a0), pB = geo.pt(a1), centre = { x: geo.cx, y: geo.cy };
    var g = { F: F, C: C, geo: geo, a0: a0, a1: a1, th: th, pA: pA, pB: pB, kind: o.kind };
    if (o.kind === 'pipe') { C.rim.classList.add('sq-pipe'); C.disc.classList.add('sq-none'); }
    if (o.kind === 'bed')  { C.rim.classList.add('sq-bed');  C.disc.classList.add('sq-bed-wash'); }

    g.seg = g.minor = g.arcMinor = g.tri = null;
    if (!o.plain) {
      if (o.major) {
        g.minor = svgEl('path', { 'class': 'sa-region sa-region--blue', d: geo.seg(a0, th) }, C.under);
        g.seg = svgEl('path', { 'class': 'sa-region sa-region--major', d: geo.arc(a1, 360 - th) + ' Z' }, C.under);
      } else {
        g.seg = svgEl('path', { 'class': 'sa-region' + (o.kind === 'pipe' ? ' sa-region--water' : ''),
                                d: geo.seg(a0, th) }, C.under);
      }
    }
    if (o.tri) g.tri = svgEl('path', { 'class': 'se-tri', d: geo.tri(a0, th) }, C.under);
    g.ra = svgEl('path', { 'class': 's-radius', d: lineD(centre, pA) }, C.over);
    g.rb = svgEl('path', { 'class': 's-radius', d: lineD(centre, pB) }, C.over);
    g.chord = svgEl('path', { 'class': 'sa-chord' +
      (o.kind === 'pipe' ? ' sq-surface' : o.kind === 'bed' ? ' sq-path' : ''), d: lineD(pB, pA) }, C.over);
    if (!o.plain) {
      if (o.major) g.arcMinor = svgEl('path', { 'class': 'sa-arc sa-arc--blue', d: geo.arc(a0, th) }, C.over);
      g.arc = svgEl('path', { 'class': 'sa-arc' + (o.major ? ' sa-arc--major' : o.kind === 'pipe' ? ' sa-arc--blue' : ''),
                              d: o.major ? geo.arc(a1, 360 - th) : geo.arc(a0, th) }, C.over);
    }
    g.A = SA.angleMark(C, a0, a1, o.deg || (th + '°'), { r: 34 });
    g.R = alongRadius(C, geo, a0, -1, o.r);
    g.R2 = o.r2 ? alongRadius(C, geo, a1, 1, o.r2) : null;

    /* the usual order: the circle, the radii with their lengths, the
       angle, the chord, the triangle if it is wanted, the segment under
       its arc, lit once */
    g.draw = async function () {
      await SA.drawCircle(C, 1.1);
      await Flow.wait(SHORT);
      await grow(g.ra, 0.6);
      await Flow.anim(SA.fadeIn(g.R, { y: 0 }));
      await Flow.wait(120);
      await grow(g.rb, 0.6);
      if (g.R2) await Flow.anim(SA.fadeIn(g.R2, { y: 0 }));
      await SA.angleIn(g.A);
      await Flow.wait(SHORT);
      await grow(g.chord, 0.6);
      if (g.tri) {
        await Flow.anim(Beats.secFill(g.tri, function (t) { return geo.tri(a0, th, t); }, 0.6));
      }
      if (g.minor) {
        await Promise.all([grow(g.arcMinor, 0.5), Flow.anim(discIn(g.minor))]);
        await Flow.wait(160);
      }
      if (g.seg) {
        await Promise.all([grow(g.arc, o.major ? 1.0 : 0.7), Flow.anim(discIn(g.seg))]);
        await Flow.anim(Beats.arcPulse([g.arc]));
      }
      await Flow.wait(SHORT);
      return g;
    };
    return g;
  }

  /* The sector of skill 3, for the page that recalls its area: its minor
     sector swept in between two radii, the angle θ, the radius r. */
  function sectorFigure(host) {
    var F = SA.figure(host, '34 34 352 352');
    var C = SA.circle(F.svg, FIG.cx, FIG.cy, FIG.r);
    var geo = circleAt(FIG.cx, FIG.cy, FIG.r);
    var a0 = 20, a1 = 115;
    var S = SA.sector(C, a0, a1, 'minor');
    var Ang = SA.angleMark(C, a0, a1, T('lblTheta'), { r: 34 });
    var R = alongRadius(C, geo, a1, 1, T('lblR'));
    return {
      F: F, C: C, S: S, A: Ang, R: R,
      draw: async function () {
        await SA.drawCircle(C, 1.1);
        await SA.radii(S, 0.6);
        await Promise.all([SA.sweep(S, 0.9), SA.arcIn(S, 0.9)]);
        await SA.angleIn(Ang);
        await Flow.anim(SA.fadeIn(R, { y: 0 }));
        await Flow.wait(SHORT);
      }
    };
  }

  /* What was found, set on the figure and said. */
  async function foundOn(fig, found) {
    if (!found) return;
    var fp = found.at(fig);
    var fl = SA.text(fig.C.top, fp.x, fp.y, found.label, 'lbl lbl--area s-found-lbl');
    if (found.region) found.region(fig).classList.add('is-focus');
    await Promise.all([SA.say(found.say, 'happy'), Flow.anim(SA.popIn(fl, { from: 0.4 }))]);
  }

  /* The bird on its perch in the panel with the question in its bubble,
     and the answers under it. Every answer is said in that bubble -- red
     for a wrong one, and then the question again; green for the right
     one. `reveal`, if given, is run on the figure as the right answer is
     praised. Returns the panel, with the bubble, bird and answers gone. */
  async function askInPanel(sc, fig, spec) {
    var panel = h('div', 'sa-panel sa-panel--practice', null, sc);
    var P = SA.perchIn(panel);
    P.row.classList.add('sa-speak--above');
    P.bubble.classList.add('sa-bubble--sun');
    var slot = h('div', 'sa-qslot' + (spec.big ? ' sa-qslot--big' : ''), null, panel);
    var given = null;
    if (spec.rule) {
      given = SA.ruleCard(sc, spec.tag || T('s3TagRemember'), spec.rule, 'sa-rule--small');
      M.set(given.el, { opacity: 0 });
    }
    if (spec.onAsk) await spec.onAsk(fig);
    await Flow.anim(SA.fadeIn(P.row, { y: 0 }));
    await SA.perchSay(P, spec.prompt);
    var inBubble = SA.bubbleVoice(P, spec.prompt);
    var voice = function (lines, mood) {
      if (mood === 'happy' && spec.reveal) K.quiet(spec.reveal(fig));
      return inBubble(lines, mood);
    };
    voice.stop = inBubble.stop;
    await SA.askChoice(spec.options, spec.right, {
      host: slot, tiles: true, voice: voice, stagger: 0.35,
      onWrong: spec.onWrong ? function (i) { spec.onWrong(i, fig); } : null,
      onShown: given ? function () { K.quiet(Flow.anim(SA.cardIn(given.el))); } : null,
      yes: spec.yes || keyed('fbThatsCorrect'), why: spec.why
    });
    await Flow.wait(900);
    voice.stop();
    /* Answered: the question goes -- bubble, bird and answers, and the
       rule with them -- and the panel is the page's for what comes next. */
    var gone = Array.prototype.slice.call(panel.children);
    if (given) gone.push(given.el);
    await Promise.all([Flow.anim(SA.fadeOut(gone)), SA.perchOut()]);
    gone.forEach(function (x) { if (x.parentNode) x.parentNode.removeChild(x); });
    panel.className = 'sa-panel sa-panel--centre';
    return panel;
  }

  /* ---- a formula tapped ----------------------------------------------------
     The figure drawn in the middle and glided left; the question from the
     perch; the formulas as the lesson's pills, one ink, set large; the
     right one praised and explained; then the formula set out on its own
     as the page's result, lit, and Next. */
  async function formulaTap(spec) {
    var sc = await openStage('split');
    var fig = spec.figure(sc);
    await SA.leaveHeader();
    await fig.draw();
    var panel = await askInPanel(sc, fig, {
      prompt: spec.prompt, options: spec.options, right: spec.right, big: true,
      yes: spec.yes, why: spec.why, reveal: spec.reveal
    });
    var res = SA.ruleCard(panel, spec.tag, spec.result);
    await res.shown;
    res.el.classList.add('is-glow');
    await Flow.wait(BEAT);
    await SA.handOver();
  }

  /* ---- a practice question ------------------------------------------------
     As skill 3's practice pages: the figure, what is given across the top
     if the question gives something, the question from the perch, the
     answers under it with the rule to remember beside the figure; then
     the working written out a term at a time, each number off the figure
     pulsing there as it is used, and what was found set on the figure
     and said. */
  async function practice(spec) {
    var sc = await openStage('split');
    sc.classList.add('sa-scene--practice');
    var fig = spec.figure(sc);
    await SA.leaveHeader();
    await fig.draw();
    if (spec.given) {
      SA.dom().board.classList.add('has-given');
      await SA.sayTop(spec.given);
    }
    var panel = await askInPanel(sc, fig, spec);
    if (spec.lit) spec.lit(fig);
    await SA.writeSteps(panel, spec.steps(fig));
    await Flow.wait(600);
    if (spec.given) {
      await Flow.anim(Beats.lineOut(SA.dom().promptLine));
      SA.clearPrompt();
      SA.dom().board.classList.remove('has-given');
    }
    await foundOn(fig, spec.found);
    await Flow.wait(BEAT);
    await SA.handOver();
  }

  /* ---- a worked example ----------------------------------------------------
     As skill 3's: the figure on the left, the formula set out above the
     steps on the right, and each step a line the learner completes
     through a dropdown blank before the next is written -- the bird
     saying what to find at each -- then what was found on the figure. */
  async function worked(spec) {
    var sc = await openStage('work');
    var col = h('div', 'sa-wk sa-wk--align ' + (spec.cls || 'sa-wk--s4'), null, sc);
    var fig = spec.figure(sc);
    var head = h('div', 'sa-wk__head',
      '<p class="sa-wk__formula"><b>' + T('s3Formula') + '</b> ' + spec.formula + '</p>', col);
    var formula = head.querySelector('.sa-wk__formula');
    M.set(formula, { opacity: 0 });
    var list = h('div', 'steps', null, col);
    spec.steps.forEach(function (s, i) {
      s.row = SA.stepRow(list, i + 1, s.html);
      s.dd = SA.dropdown(SA.ddIn(s.row), s.options, 0, { up: !!s.up });
    });

    await SA.leaveHeader();
    await fig.draw();
    await Flow.wait(SHORT);
    await SA.say(spec.find);
    await Flow.wait(SHORT);
    await Flow.anim(SA.fadeIn(formula, { y: 6 }));
    await Flow.wait(LOOK);
    for (var i = 0; i < spec.steps.length; i++) {
      var s = spec.steps[i];
      await SA.stepIn(s.row);
      await SA.say(s.ask);
      if (s.light) K.quiet(s.light(fig));
      await s.dd.ask({ yes: keyed('fbThatsCorrect'), why: s.why });
      SA.stepDone(s.row);
      await Flow.wait(SHORT);
    }
    SA.burstAt(spec.steps[spec.steps.length - 1].row);
    await foundOn(fig, spec.found);
    if (spec.check) {
      await Flow.wait(BEAT);
      await SA.say(spec.check, 'happy');
    }
    await Flow.wait(BEAT);
    await SA.handOver();
  }

  /* ---- a story --------------------------------------------------------------
     As skill 3's fan and radar: the bird tells it from the header, the
     figure drawn as the words name its parts; then the question from the
     perch, the answers, the rule; then the working and what was found. */
  async function story(spec) {
    var sc = await openStage('split');
    sc.classList.add('sa-scene--practice');
    var fig = spec.figure(sc);
    for (var i = 0; i < spec.tell.length; i++) {
      await SA.say(spec.tell[i].line);
      await spec.tell[i].draw(fig);
      await Flow.wait(LOOK);
    }
    /* the story's last line goes, the bird stays: it hops straight from
       the header down onto its perch to ask (perchSay) */
    await SA.hush();
    var panel = await askInPanel(sc, fig, spec);
    await SA.writeSteps(panel, spec.steps(fig));
    await Flow.wait(600);
    await foundOn(fig, spec.found);
    await Flow.wait(BEAT);
    await SA.handOver();
  }

  /* The region a step is about, lit on a problem figure: its edges swell
     twice, so the eye is taken to the thing the step is asking for. */
  function spotlight(lines, arcs) {
    var tl = M.timeline({
      revert: function () { M.set(lines.concat(arcs), { clearProps: 'strokeWidth' }); }
    });
    [0, 0.8].forEach(function (at) {
      if (lines.length) {
        tl.to(lines, { strokeWidth: 4 * 1.9, duration: M.dur(0.26), ease: 'power2.out' }, M.gap(at))
          .to(lines, { strokeWidth: 4, duration: M.dur(0.5), ease: M.POP }, M.gap(at + 0.26));
      }
      if (arcs.length) {
        tl.to(arcs, { strokeWidth: ARC_W * 1.6, duration: M.dur(0.26), ease: 'power2.out' }, M.gap(at))
          .to(arcs, { strokeWidth: ARC_W, duration: M.dur(0.5), ease: M.POP }, M.gap(at + 0.26));
      }
    });
    return Flow.anim(tl);
  }
  function litSector(fig)   { return spotlight([fig.ra, fig.rb], [fig.arc]); }
  function litTriangle(fig) { return spotlight([fig.ra, fig.rb, fig.chord], []); }
  function litSegment(fig)  { return spotlight([fig.chord], [fig.arc]); }

  /* A number pulsed on the figure as it is used in the working. */
  function pulse(elm) {
    return Flow.anim(M.fromTo(elm, { scale: 1, transformOrigin: '50% 50%' },
      { scale: 1.35, duration: M.dur(0.28), ease: 'power2.out', yoyo: true, repeat: 1 }));
  }

  /* The words of the working, in the inks skill 3 writes them in. */
  var ANG = function (n, d) { return fr(n, d, 'c-ang'); };
  var PI = function (n, d) { return fr(n, d, 'c-pi'); };
  var HALF = function () { return fr('1', '2'); };
  function word(key) { return c('a', T(key)); }
  var RULE_MINOR = function () { return word('s4WordSegment') + EQ + word('s4WordSector') + MINUS + word('s4WordTriangle'); };
  var RULE_MAJOR = function () { return word('s4WordMajorSegment') + EQ + word('s4WordMajorSector') + PLUS + word('s4WordTriangle'); };

  /* ---- where what was found is set on each figure --------------------------- */
  function atMinor(fig) { return fig.geo.pt(fig.a0 + fig.th / 2, 126); }
  function atMajor(fig) { return fig.geo.pt(fig.a0 + fig.th / 2 + 180, 62); }

  /* ======================================================================
   * Page 2 -- the area of a sector, recalled
   * ====================================================================== */
  function sceneSectorArea() {
    var half = T('s4p2Opt180'), right = T('s4p2Opt360'), arc = T('s4p2OptArc');
    return formulaTap({
      figure: sectorFigure,
      prompt: keyed('s4p2Ask'),
      options: [fx(half), fx(right), fx(arc)], right: 1,
      yes: [keyed('fbThatsCorrect'), keyed('s4p2Right')],
      why: { 0: hint('s4p2Wrong180'), 2: hint('s4p2WrongArc') },
      reveal: function (fig) {
        fig.S.region.classList.add('is-lit');
        return Promise.all([
          Flow.anim(Beats.linePulse([fig.S.ra, fig.S.rb])),
          Flow.anim(Beats.linePulse([fig.S.arc], 5))
        ]);
      },
      tag: T('s4TagSector'), result: fx(right)
    });
  }

  /* ======================================================================
   * Page 7 -- the triangle's area at 90°
   * ====================================================================== */
  function sceneRight() {
    var half = T('s4p7OptHalfRR'), one = T('s4p7OptHalfR'), square = T('s4p7OptRR');
    return formulaTap({
      figure: function (host) {
        return segFigure(host, { theta: 90, deg: T('p21Deg'), r: T('lblR'), r2: T('lblR'), tri: true, plain: true });
      },
      prompt: keyed('s4p7Ask'),
      options: [fx(half), fx(one), fx(square)], right: 0,
      yes: [keyed('fbThatsCorrect'), { text: T('s4p7Right', { f: half }), vo: 's4p7Right' }],
      why: {
        1: [keyed('fbNotQuite'), { text: T('s4p7WrongHalfR', { f: one }), vo: 's4p7WrongHalfR' }],
        2: [keyed('fbNotQuite'), { text: T('s4p7WrongRR', { f: square }), vo: 's4p7WrongRR' }]
      },
      /* the right answer: the two legs swell -- they are the base and the
         height -- and the triangle lights */
      reveal: function (fig) {
        fig.tri.classList.add('is-lit');
        return Promise.all([
          Flow.anim(Beats.linePulse([fig.ra, fig.rb])),
          pulse(fig.R), pulse(fig.R2)
        ]);
      },
      tag: T('s4TagTriangle'), result: fx(half)
    });
  }

  /* ======================================================================
   * Pages 8 and 13 -- the segment and the major segment, worked
   * ====================================================================== */
  function sceneWorked() {
    return worked({
      figure: function (host) { return segFigure(host, { theta: 90, deg: T('p21Deg'), r: T('val14cm') }); },
      formula: RULE_MINOR(),
      find: keyed('s4p8Find'),
      steps: [
        { html: word('s4WordSector') + EQ + ANG('90', '360') + X + PI('22', '7') + X + c('r', '14²') + EQ + SA.DD,
          ask: keyed('s4p8AskSector'), light: litSector,
          options: [T('val154sq'), T('val616sq'), T('val77sq')],
          why: { 1: hint('s4p8Wrong616'), 2: hint('s4p8Wrong77') } },
        { html: word('s4WordTriangle') + EQ + HALF() + X + c('r', '14') + X + c('r', '14') + EQ + SA.DD,
          ask: keyed('s4p8AskTriangle'), light: litTriangle,
          options: [T('val98sq'), T('val196sq'), T('val49sq')],
          why: { 1: hint('s4p8Wrong196'), 2: hint('s4p8Wrong49') } },
        { html: word('s4WordSegment') + EQ + c('pi', '154') + MINUS + c('pi', '98') + EQ + SA.DD,
          ask: keyed('s4p8AskSegment'), light: litSegment, up: true,
          options: [T('val56sq'), T('val252sq'), T('val46sq')],
          why: { 1: hint('s4p8Wrong252'), 2: hint('s4p8Wrong46') } }
      ],
      found: { label: T('val56sq'), at: atMinor, region: function (fig) { return fig.seg; }, say: keyed('s4p8Found') },
      check: keyed('s4p8Check')
    });
  }

  function sceneMajorWorked() {
    return worked({
      cls: 'sa-wk--s4major',
      figure: function (host) { return segFigure(host, { theta: 90, deg: T('p21Deg'), r: T('val14cm'), major: true }); },
      formula: RULE_MAJOR(),
      find: keyed('s4p13Find'),
      steps: [
        { html: word('s4WordMajorSector') + EQ + ANG('270', '360') + X + PI('22', '7') + X + c('r', '14²') + EQ + SA.DD,
          ask: keyed('s4p13AskSector'),
          light: function (fig) { return spotlight([fig.ra, fig.rb], [fig.arc]); },
          options: [T('val462sq'), T('val154sq'), T('val616sq')],
          why: { 1: hint('s4p13Wrong154'), 2: hint('s4p13Wrong616') } },
        { html: word('s4WordTriangle') + EQ + HALF() + X + c('r', '14') + X + c('r', '14') + EQ + SA.DD,
          ask: keyed('s4p8AskTriangle'), light: litTriangle,
          options: [T('val98sq'), T('val196sq'), T('val49sq')],
          why: { 1: hint('s4p8Wrong196'), 2: hint('s4p8Wrong49') } },
        { html: word('s4WordMajorSegment') + EQ + c('pi', '462') + PLUS + c('pi', '98') + EQ + SA.DD,
          ask: keyed('s4p13AskSegment'), light: litSegment, up: true,
          options: [T('val560sq'), T('val364sq'), T('val462sq')],
          why: { 1: hint('s4p13Wrong364'), 2: hint('s4p13Wrong462') } }
      ],
      found: { label: T('val560sq'), at: atMajor, region: function (fig) { return fig.seg; }, say: keyed('s4p13Found') },
      check: keyed('s4p13Check')
    });
  }

  /* ======================================================================
   * Pages 9, 10 and 14 -- asked
   * ====================================================================== */
  function sceneAsked() {
    return practice({
      figure: function (host) { return segFigure(host, { theta: 90, deg: T('p21Deg'), r: T('val7cm') }); },
      prompt: keyed('s4p9Ask'),
      rule: RULE_MINOR(),
      options: [T('val14sq'), T('val38sq'), T('val24sq')], right: 0,
      why: { 1: hint('s4p9Wrong38'), 2: hint('s4p9Wrong24') },
      onWrong: function (i, fig) { K.quiet(i === 1 ? litSector(fig) : litTriangle(fig)); },
      steps: function (fig) {
        return [
          [word('s4WordSector'), [[ANG('90', '360'), fig.A.lbl], [X], [PI('22', '7')], [X], [c('r', '7²'), fig.R], [EQ], [c('pi', '38.5')]]],
          [word('s4WordTriangle'), [[HALF()], [X], [c('r', '7'), fig.R], [X], [c('r', '7')], [EQ], [c('pi', '24.5')]]],
          [word('s4WordSegment'), [[c('pi', '38.5')], [MINUS], [c('pi', '24.5')], [EQ], [c('ans', T('val14sq'))]]]
        ];
      },
      found: { label: T('val14sq'), at: atMinor, region: function (fig) { return fig.seg; }, say: keyed('s4p9Found') }
    });
  }

  function sceneFromParts() {
    return practice({
      figure: function (host) { return segFigure(host, { theta: 90, deg: T('p21Deg'), r: T('lblR') }); },
      given: keyed('s4p10Given'),
      prompt: keyed('s4p10Ask'),
      rule: RULE_MINOR(),
      options: [T('val56sq'), T('val252sq'), T('val58sq')], right: 0,
      why: { 1: hint('s4p8Wrong252'), 2: hint('s4p10Wrong58') },
      steps: function (fig) {
        return [
          [word('s4WordSegment'), [[word('s4WordSector')], [MINUS], [word('s4WordTriangle')]]],
          ['', [[c('pi', '154'), fig.seg], [MINUS], [c('pi', '98')]]],
          ['', [[c('ans', T('val56sq'))]]]
        ];
      },
      found: { label: T('val56sq'), at: atMinor, region: function (fig) { return fig.seg; }, say: keyed('s4p10Found') }
    });
  }

  function sceneMajorAsked() {
    return practice({
      figure: function (host) { return segFigure(host, { theta: 90, deg: T('p21Deg'), r: T('val7cm'), major: true }); },
      prompt: keyed('s4p14Ask'),
      rule: RULE_MAJOR(),
      options: [T('val140sq'), T('val14sq'), T('val154sq')], right: 0,
      why: { 1: hint('s4p14Wrong14'), 2: hint('s4p14Wrong154') },
      onWrong: function (i, fig) { K.quiet(i === 1 ? spotlight([fig.chord], [fig.arcMinor]) : spotlight([fig.C.rim], [])); },
      steps: function (fig) {
        return [
          [word('s4WordMajorSector'), [[ANG('270', '360'), fig.A.lbl], [X], [PI('22', '7')], [X], [c('r', '7²'), fig.R], [EQ], [c('pi', '115.5')]]],
          [word('s4WordTriangle'), [[HALF()], [X], [c('r', '7'), fig.R], [X], [c('r', '7')], [EQ], [c('pi', '24.5')]]],
          [word('s4WordMajorSegment'), [[c('pi', '115.5')], [PLUS], [c('pi', '24.5')], [EQ], [c('ans', T('val140sq'))]]]
        ];
      },
      found: { label: T('val140sq'), at: atMajor, region: function (fig) { return fig.seg; }, say: keyed('s4p14Found') }
    });
  }

  /* ======================================================================
   * Pages 15 and 16 -- two stories
   * ====================================================================== */

  /* The pipe lies on its side, so its water is the segment at the BOTTOM:
     the two radii run down to the ends of the water's surface, 90° apart.
     "A pipe of radius 14 cm lies on its side with water in it.": the pipe
     is drawn, its centre and one radius with the length, and the water --
     its surface, its colour, its arc, its name. "The water surface
     subtends 90° at the centre.": the surface swells, the other radius
     grows, and the right angle with its "90°" lands after it. */
  function scenePipe() {
    return story({
      figure: function (host) {
        var fig = segFigure(host, { theta: 90, at: 225, deg: T('p21Deg'), r: T('val14cm'), kind: 'pipe' });
        var w = fig.geo.pt(270, 120);
        fig.word = SA.text(fig.C.top, w.x, w.y, T('s4p15Water'), 'lbl sq-water-word');
        return fig;
      },
      tell: [
        { line: keyed('s4p15Pipe'), draw: async function (fig) {
          await Flow.anim(Beats.drawRim(fig.C.rim, fig.C.tip, { time: 1.1 }));
          await Flow.anim(Beats.plotDot(fig.C.dot, 0.45));
          await Flow.wait(SHORT);
          await grow(fig.ra, 0.6);
          await Flow.anim(SA.fadeIn(fig.R, { y: 0 }));
          await Flow.wait(SHORT);
          await grow(fig.chord, 0.6);
          await Promise.all([grow(fig.arc, 0.8), Flow.anim(discIn(fig.seg))]);
          await Flow.anim(SA.fadeIn(fig.word, { y: 4 }));
        } },
        { line: keyed('s4p15Subtends'), draw: async function (fig) {
          await pulseEdge([fig.chord], []);
          await grow(fig.rb, 0.6);
          await SA.angleIn(fig.A);
        } }
      ],
      prompt: keyed('s4p15Ask'),
      rule: RULE_MINOR(),
      options: [T('val56sq'), T('val156sq'), T('val256sq')], right: 0,
      why: { 1: hint('s4p15Wrong156'), 2: hint('s4p15Wrong256') },
      reveal: litSegment,
      steps: function (fig) {
        return [
          [word('s4WordSector'), [[ANG('90', '360'), fig.A.lbl], [X], [PI('22', '7')], [X], [c('r', '14²'), fig.R], [EQ], [c('pi', '154')]]],
          [word('s4WordTriangle'), [[HALF()], [X], [c('r', '14'), fig.R], [X], [c('r', '14')], [EQ], [c('pi', '98')]]],
          [word('s4WordWater'), [[c('pi', '154')], [MINUS], [c('pi', '98')], [EQ], [c('ans', T('val56sq'))]]]
        ];
      },
      found: { label: T('val56sq'), at: function (fig) { return fig.geo.pt(270, 80); },
               region: function (fig) { return fig.seg; }, say: keyed('s4p15Found') }
    });
  }

  /* "A round flower bed of radius 21 m is cut by a straight path.": the
     bed is drawn and coloured, its centre and one radius with the length,
     and the path laid across. "The path subtends 90° at the centre.": the
     path swells, the other radius grows, and the right angle with its
     "90°" lands after it. The smaller piece is coloured in as the
     question is asked. */
  function sceneBed() {
    return story({
      figure: function (host) {
        return segFigure(host, { theta: 90, deg: T('p21Deg'), r: T('val21m'), kind: 'bed' });
      },
      tell: [
        { line: keyed('s4p16Bed'), draw: async function (fig) {
          await SA.drawCircle(fig.C, 1.1);
          await Flow.wait(SHORT);
          await grow(fig.ra, 0.6);
          await Flow.anim(SA.fadeIn(fig.R, { y: 0 }));
          await Flow.wait(SHORT);
          await grow(fig.chord, 0.6);
        } },
        { line: keyed('s4p16Subtends'), draw: async function (fig) {
          await pulseEdge([fig.chord], []);
          await grow(fig.rb, 0.6);
          await SA.angleIn(fig.A);
        } }
      ],
      /* what the question is about: the smaller piece, coloured in with
         its arc lit as the question arrives */
      onAsk: function (fig) {
        return Promise.all([grow(fig.arc, 0.8), Flow.anim(discIn(fig.seg))])
          .then(function () { return Flow.anim(Beats.arcPulse([fig.arc])); });
      },
      prompt: keyed('s4p16Ask'),
      rule: RULE_MINOR(),
      options: [T('val126m'), T('val252m'), T('val58m')], right: 0,
      why: { 1: hint('s4p16Wrong252'), 2: hint('s4p16Wrong58') },
      reveal: litSegment,
      steps: function (fig) {
        return [
          [word('s4WordSector'), [[ANG('90', '360'), fig.A.lbl], [X], [PI('22', '7')], [X], [c('r', '21²'), fig.R], [EQ], [c('pi', '346.5')]]],
          [word('s4WordTriangle'), [[HALF()], [X], [c('r', '21'), fig.R], [X], [c('r', '21')], [EQ], [c('pi', '220.5')]]],
          [word('s4WordPiece'), [[c('pi', '346.5')], [MINUS], [c('pi', '220.5')], [EQ], [c('ans', T('val126m'))]]]
        ];
      },
      found: { label: T('val126m'), at: atMinor, region: function (fig) { return fig.seg; }, say: keyed('s4p16Found') }
    });
  }

  /* ======================================================================
   * The hooks the board's housekeeping calls -- see addSection in pages.js
   * ====================================================================== */

  /* What this skill has on the figure: one group per page, each faded as
     a whole. The problems live in skill 3's stage, and its hooks put them
     away. */
  function parts() {
    return [dom.sa, dom.sc, dom.se, dom.sf, dom.sj, dom.sk];
  }

  /* Nothing of its own outside the figure. */
  function wipe() { return []; }

  /* Back to rest, with no animation. The inline writes inside the figure
     are pages.js's to clear -- resetFigure does it for every descendant of
     the picture right after this -- so this is about attributes, classes
     and the cards, which are built afresh each run. */
  function reset() {
    saying++;
    [dom.sa, dom.sc, dom.se, dom.sf, dom.sj, dom.sk].forEach(function (g) { g.setAttribute('hidden', ''); });
    putAwayCards();
    dom.sc.classList.remove('is-picking');
    dom.scNudges.setAttribute('hidden', '');
    dom.scClip.setAttribute('r', CLIP_OPEN);
    dom.scClipMajor.setAttribute('r', CLIP_OPEN);
    dom.scBand.setAttribute('tabindex', '-1');
    cut.a = SC_DEFAULT.a; cut.span = SC_DEFAULT.span; cut.origin = SC_DEFAULT.origin;
    redrawChord();
    dom.sePiece.classList.remove('is-lifted');
    layoutStep();
    dom.sjClip.setAttribute('r', CLIP_OPEN);
    dom.sjTri.classList.remove('is-merged');
    dom.sjPiece.classList.remove('is-lifted');
    layoutMajor();
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
      { name: 'Segment intro',         play: sceneIntro },
      { name: 'Tap the segment',       play: sceneSegment },
      { name: 'Area of a sector',      play: sceneSectorArea },
      { name: 'Make a segment',        play: sceneChord },
      { name: 'Sector minus triangle', play: sceneStep },
      { name: 'Segment recap',         play: sceneSummary },
      { name: 'Apply intro',           play: sceneApplyIntro },
      { name: 'Triangle at 90°',       play: sceneRight },
      { name: 'Segment worked',        play: sceneWorked },
      { name: 'Segment asked',         play: sceneAsked },
      { name: 'Segment from parts',    play: sceneFromParts },
      { name: 'Major segment',         play: sceneMajor },
      { name: 'Major segment recap',   play: sceneMajorSummary },
      { name: 'Major segment worked',  play: sceneMajorWorked },
      { name: 'Major segment asked',   play: sceneMajorAsked },
      { name: 'Pipe: the water',       play: scenePipe },
      { name: 'Flower bed: the path',  play: sceneBed }
    ],
    build: build,
    parts: parts,
    wipe: wipe,
    reset: reset,
    stage: stage
  });

  /* What the sections after this one are built from: the cut the cards
     are drawn with, and the geometry helper. */
  global.SegArea = {
    CUT: CUT,
    circleAt: circleAt
  };
})(window);
