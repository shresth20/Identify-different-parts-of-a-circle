/* ==========================================================================
 * quiz.js -- section 5: the quiz
 * --------------------------------------------------------------------------
 * The last section of the lesson, registered with pages.js as a section
 * (see addSection there): two scenes on the same board, with the same bird
 * and the same clock, built from the kit pages.js hands over and the beats
 * in animations.js. It teaches nothing new: it asks for everything the
 * four sections before it taught, on circles of its own. Nothing here
 * waits on anything except through Flow, so Skip, Replay and the level bar
 * work on these scenes as they do on the sections before.
 *
 *   Tap the name     three circles in a row, each with one part picked
 *                    out and a name under it -- and only one of the names
 *                    is right. Each circle is drawn where it stands; then
 *                    the names arrive, and the bird comes up to ask and
 *                    goes again. Two chances, and then the right name is
 *                    shown -- not explained.
 *   Drag the names   one circle with every part on it -- points, chord,
 *                    radii, the two pieces of the rim -- and six names in
 *                    the tray. The circle stands aside; each part in turn
 *                    is lit while the rest stand back, a box is hung off
 *                    it level with the circle, and the bird asks for its
 *                    name and leaves. A wrong name is shaken off; the
 *                    right one is met with a small burst. Next, and the
 *                    next part, until all six are named.
 *
 * The bird is on the header only while it has something to say. The rest
 * of the time the header is closed and the picture has the room -- see
 * collapseHeader in pages.js -- because a board with an empty band across
 * its top is a board a fifth of which is doing nothing.
 *
 * Every mark here is a mark from an earlier section -- the same classes,
 * the same beats -- put on a circle of its own, and every one is measured
 * from that circle's own centre and radius, so nothing can drift.
 *
 * Load order: js/pages.js -> ... -> js/quiz.js -> js/script.js
 * ========================================================================== */
(function (global) {
  'use strict';

  var M = global.Motion;
  var Flow = global.Flow;
  var Beats = global.Beats;
  var Pages = global.Pages;
  if (!Pages || !Pages.addSection) {
    console.error('quiz.js: load js/pages.js before js/quiz.js.');
    return;
  }
  var K = Pages.kit;

  /* ---- the script ------------------------------------------------------- */
  var LINES = {
    tap:  'Tap the correct name.',
    drag: 'Drag the correct name into the box.'
  };

  var BEAT = K.BEAT, SHORT = K.SHORT;
  var HOLD_TELL = 2500;   /* ms the instruction stands, once said, before the
                             bird takes it and itself away                  */
  var CX = K.CX, CY = K.CY, RR = K.RR;
  var round2 = K.round2, el = K.el;

  var ARC_W = 7;          /* --arc-weight in arcs.css                        */
  var CLIP_OPEN = 400;    /* a clip circle wide open; mirrors animations.js  */

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ---- a circle, and everything measured from it -------------------------
     The three numbers a circle is drawn with, and the marks that are
     written from them: a point on it, a piece of its rim, a region cut off
     by a chord, the rim itself from twelve o'clock and clockwise -- the
     shapes arcs.js and segments.js draw on the lesson's circle, here for
     a circle of any size in any place, because the first activity draws
     three small ones. Angles are degrees anticlockwise from three
     o'clock, as everywhere in the lesson. */
  function circleAt(cx, cy, r) {
    function pt(deg, rad) {
      var t = deg * Math.PI / 180;
      var d = rad == null ? r : rad;
      return { x: round2(cx + Math.cos(t) * d), y: round2(cy - Math.sin(t) * d) };
    }
    /* our angles grow anticlockwise on screen, and an SVG arc's sweep flag
       of 1 means clockwise on screen, so the flag is the direction */
    function arc(from, sweep, clockwise) {
      var to = clockwise ? from - sweep : from + sweep;
      var s = pt(from), e = pt(to);
      return 'M' + s.x + ' ' + s.y +
             ' A' + r + ' ' + r + ' 0 ' + (sweep > 180 ? 1 : 0) + ' ' + (clockwise ? 1 : 0) +
             ' ' + e.x + ' ' + e.y;
    }
    function seg(a, span, minor) {
      return (minor ? arc(a, span, false) : arc(a, 360 - span, true)) + ' Z';
    }
    function wedge(from, sweep, clockwise) {
      return 'M' + cx + ' ' + cy + ' L' + arc(from, sweep, clockwise).slice(1) + ' Z';
    }
    function chordMid(a, span) {
      var p = pt(a), q = pt(a + span);
      return { x: round2((p.x + q.x) / 2), y: round2((p.y + q.y) / 2) };
    }
    /* how far a clip circle on the chord's middle has to grow to take in
       the region on either side of it: for the smaller, the further of
       its corners and its top; for the larger, the far side */
    function reach(span) {
      var half = span / 2 * Math.PI / 180;
      var d = r * Math.cos(half);
      return [Math.max(r * Math.sin(half), r - d) + 6, r + d + 6];
    }
    return {
      cx: cx, cy: cy, r: r, pt: pt, arc: arc, seg: seg, wedge: wedge,
      chordMid: chordMid, reach: reach,
      chordDist: function (span) { return r * Math.cos(span / 2 * Math.PI / 180); },
      rim: 'M' + cx + ' ' + (cy - r) +
           ' A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r) +
           ' A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy - r)
    };
  }
  function lineD(p, q) { return 'M' + p.x + ' ' + p.y + ' L' + q.x + ' ' + q.y; }

  /* The lesson's circle: the one in index.html, measured the same way. */
  var MAIN = circleAt(CX, CY, RR);

  /* ======================================================================
   * The first activity -- three circles, one right name
   * ----------------------------------------------------------------------
   * Three parts, one circle each: the smaller segment, the smaller arc,
   * the larger segment -- each cut by its own two points, kept as an
   * angle and a span as every section keeps them. The three stand in a
   * row that fills the picture, each drawn where it stands and at the
   * size it stays. Under each goes a name; ONE of the three is the name
   * of the part above it, and the other two are near misses: the same
   * size, the wrong kind of part. Which circle carries the right name is
   * drawn fresh each run.
   * ====================================================================== */
  var SMALL_R = 138;                        /* a circle in the row           */
  var ROW_Y = 176;                          /* the row's centre line         */
  var SLOT_X = [188, 500, 812];             /* where the three stand         */
  var CARD_RIM = 1.1;                       /* seconds: the pen, quicker than
                                               the lesson's -- see drawRim  */
  var CARDS = [
    { part: 'Minor segment', a: 80,  span: 110, wrong: ['Minor sector', 'Minor arc'] },
    { part: 'Minor arc',     a: 40,  span: 100, wrong: ['Minor sector', 'Minor segment'] },
    { part: 'Major segment', a: 355, span: 100, wrong: ['Major sector', 'Major arc'] }
  ];
  /* the names: a pill the Start button's shape, standing on its wall */
  var OPT_W = 230, OPT_H = 50, OPT_EDGE = 5;
  var OPT_Y = ROW_Y + SMALL_R + 22;
  var CHANCES = 2;

  /* ======================================================================
   * The second activity -- one circle, every part, six names
   * ----------------------------------------------------------------------
   * Two points on the rim, a chord between them and a radius to each, so
   * the one circle carries both arcs, both segments and both sectors. The
   * smaller of everything is at the top. Each part is asked for at a
   * spot on it -- where its box's leader lands -- given as {deg, r} from
   * the centre, a little off the part's own middle line so the leaders
   * to the right do not all leave from the same place.
   * ====================================================================== */
  var qz = { a: 35, span: 110 };
  var DEFAULT = { a: 35, span: 110 };
  var SHIFT = -250;                         /* the circle's slide to the left,
                                               at the lesson's own size       */
  var ANCHOR_OUT = ARC_W / 2 - 0.5;         /* a leader's end, on an arc      */
  /* With the header closed the stage is taller than the picture, and a
     circle of the lesson's size sits in the middle of it with empty bands
     above and below. So while the bird is away the circle GROWS into that
     room -- up to this much, keeping this margin from the stage's edges --
     and comes back to the lesson's size when the header opens for the
     bird. The room is measured, not assumed: the stage is a different
     height with the tray open and closed, and on every screen.
       The margin is generous and the ceiling low on purpose: the tray of
     names runs along the bottom of the board and the circle is read
     against it, so a circle grown to the last unit of the stage reads as
     crowding the words it is waiting for rather than as a bigger
     picture. */
  var GROW_MAX = 1.2, GROW_PAD = 44;
  var FIGURE_GROW = 1.08;                   /* --figure-grow in style.css: the
                                               figure's box over the stage's */
  var PARTS = [
    { name: 'Minor arc',     kind: 'arc', which: 'minor', deg: 68  },
    { name: 'Major arc',     kind: 'arc', which: 'major', deg: 300 },
    { name: 'Minor segment', kind: 'seg', which: 'minor', deg: 75  },
    { name: 'Major segment', kind: 'seg', which: 'major', deg: 290 },
    { name: 'Minor sector',  kind: 'sec', which: 'minor', deg: 65  },
    { name: 'Major sector',  kind: 'sec', which: 'major', deg: 300 }
  ];
  /* the one box: the boxes' make, a size up, level with the circle and a
     set way out from its edge -- never nearer the stage's edge than
     BOX_IN */
  var QBOX_W = 240, QBOX_H = 52, BOX_IN = 30, LEAD_GAP = 190;

  /* ---- the elements ----------------------------------------------------- */
  var dom = null;         /* pages.js's, with this section's own on top     */
  var mascot = null;
  var cards = [];         /* the three circles -- see buildCard             */
  var opts = [];          /* the three names under them                     */
  var deal = null;        /* { labels, answer }: this run's names           */
  var box = null;         /* the one box of the second activity, while built */
  var chips = [];
  /* Where the second activity's circle stands and how big it is: what is
     WANTED (`lay`: aside or centred, and its scale) and what is on screen
     this frame (`cur`: the group's x and scale), which layoutTo tweens
     from the one to the other. */
  var lay = { aside: false, fit: 1 };
  var cur = { x: 0, fit: 1 };

  function $(id) { return document.getElementById(id); }

  function build() {
    dom = Object.create(K.dom());
    mascot = K.mascot();

    dom.qz        = $('qz');
    dom.qzDefs    = $('qzDefs');
    dom.qzCards   = $('qzCards');
    dom.qzOpts    = $('qzOpts');
    dom.qzCircle  = $('qzCircle');
    dom.qzDisc    = $('qzDisc');
    dom.qzSegMajor = $('qzSegMajor');
    dom.qzSegMinor = $('qzSegMinor');
    dom.qzSecMajor = $('qzSecMajor');
    dom.qzSecMinor = $('qzSecMinor');
    dom.qzChord   = $('qzChord');
    dom.qzRadiusA = $('qzRadiusA');
    dom.qzRadiusB = $('qzRadiusB');
    dom.qzRim     = $('qzRim');
    dom.qzTip     = $('qzTip');
    dom.qzArcMajor = $('qzArcMajor');
    dom.qzArcMinor = $('qzArcMinor');
    dom.qzCentre  = $('qzCentre');
    dom.qzCentreDot = $('qzCentreDot');
    dom.qzPointA  = $('qzPointA');
    dom.qzPointB  = $('qzPointB');
    dom.qzClipMinor = $('qzClipMinorC');
    dom.qzClipMajor = $('qzClipMajorC');
    dom.qzBoxes   = $('qzBoxes');
    dom.qzBurst   = $('qzBurst');
    dom.boardStage = $('boardStage');

    cards = CARDS.map(buildCard);
    opts = SLOT_X.map(buildOpt);
    reset();
  }

  /* ---- the three circles ------------------------------------------------ */

  /* One circle of the row, built where it stands, with the one part it
     shows: a chord and the region it cuts off, or the piece of the rim
     between its two points. The same marks the lesson drew, on a smaller
     circle: the same classes, so the same colours and weights. */
  function buildCard(spec, i) {
    var c = circleAt(SLOT_X[i], ROW_Y, SMALL_R);
    var g = el('g', { 'class': 'qz-card' });
    var card = { spec: spec, g: g, geo: c, dots: [] };
    var a = spec.a, span = spec.span;
    var pA = c.pt(a), pB = c.pt(a + span);
    var isArc = spec.part === 'Minor arc';

    /* No disc under an arc: the part is a piece of the rim, and an open
       ring keeps the eye on the line -- the way the arcs section draws its
       own circle. The segments keep theirs, since a region needs a shape
       to be cut from. */
    card.disc = null;
    if (!isArc) {
      g.classList.add('qz-card--area');     /* faint rim, deeper wash: style.css */
      card.disc = el('circle', { 'class': 'figure__disc', cx: c.cx, cy: c.cy, r: c.r });
      g.appendChild(card.disc);

      var minor = spec.part === 'Minor segment';
      var mid = c.chordMid(a, span);
      var clip = el('clipPath', { id: 'qzCardClip' + i });
      card.clip = el('circle', { cx: mid.x, cy: mid.y, r: CLIP_OPEN });
      clip.appendChild(card.clip);
      dom.qzDefs.appendChild(clip);
      card.reach = c.reach(span)[minor ? 0 : 1];
      card.region = el('path', { 'class': 'qz-region qz-region--' + (minor ? 'minor' : 'major'),
                                 d: c.seg(a, span, minor), 'clip-path': 'url(#qzCardClip' + i + ')' });
      g.appendChild(card.region);
      card.chord = el('path', { 'class': 'chord-line', d: lineD(pA, pB) });
      g.appendChild(card.chord);
    }

    card.rim = el('path', { 'class': 'figure__rim', d: c.rim });
    g.appendChild(card.rim);
    card.tip = el('circle', { 'class': 'rim-tip', cx: c.cx, cy: c.cy - c.r, r: 7 });
    g.appendChild(card.tip);

    if (isArc) {
      card.arc = el('path', { 'class': 'arc-piece arc-piece--minor', d: c.arc(a, span, false) });
      g.appendChild(card.arc);
    }

    card.dots = [pA, pB].map(function (p) {
      var d = el('circle', { 'class': 'arc-dot', cx: p.x, cy: p.y, r: 6.5 });
      g.appendChild(d);
      return d;
    });

    dom.qzCards.appendChild(g);
    return card;
  }

  /* Every mark of a card that is on the board once it is drawn. */
  function cardMarks(c) {
    var list = (c.disc ? [c.disc] : []).concat([c.rim], c.dots);
    return c.arc ? list.concat([c.arc]) : list.concat([c.chord, c.region]);
  }

  /* A name under a circle: the Start button's pill, drawn in the picture
     -- a wall, the face standing on it, and the word. What it says is
     written when the names are dealt. */
  function buildOpt(sx) {
    var x = sx - OPT_W / 2, y = OPT_Y;
    var g = el('g', { 'class': 'qz-opt', role: 'button', tabindex: -1 });
    var wall = el('rect', { 'class': 'qz-opt__wall', x: x, y: y + OPT_EDGE,
                            width: OPT_W, height: OPT_H, rx: OPT_H / 2 });
    var face = el('rect', { 'class': 'qz-opt__face', x: x, y: y,
                            width: OPT_W, height: OPT_H, rx: OPT_H / 2 });
    var text = el('text', { 'class': 'figure-label qz-opt__text',
                            x: sx, y: y + OPT_H / 2 + 9, 'text-anchor': 'middle' });
    g.appendChild(wall);
    g.appendChild(face);
    g.appendChild(text);
    dom.qzOpts.appendChild(g);
    return { g: g, wall: wall, face: face, text: text };
  }

  /* The names dealt: one circle gets the name of its part, the other two
     get a near miss each -- and no two names alike, so a wrong name is
     never the right name of the circle beside it. */
  function dealLabels() {
    var answer = Math.floor(Math.random() * CARDS.length);
    var labels = [];
    var used = [CARDS[answer].part];
    labels[answer] = CARDS[answer].part;
    CARDS.forEach(function (c, i) {
      if (i === answer) return;
      var pool = c.wrong.filter(function (w) { return used.indexOf(w) < 0; });
      labels[i] = pool[Math.floor(Math.random() * pool.length)];
      used.push(labels[i]);
    });
    return { labels: labels, answer: answer };
  }
  function writeLabels() {
    opts.forEach(function (o, i) {
      o.text.textContent = deal.labels[i];
      o.g.setAttribute('aria-label', deal.labels[i]);
    });
  }

  /* One circle made, where it stands: the rim from a point, the colour,
     the two points, and then the part -- the piece of rim between the
     points, or the chord and the region it cuts off, coloured from the
     chord out. */
  function drawCard(c) {
    var made = Flow.anim(Beats.drawRim(c.rim, c.tip, { time: CARD_RIM }))
      .then(function () { return Flow.wait(120); })
      .then(function () { return c.disc ? Flow.anim(Beats.fillDisc(c.disc)) : null; })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(c.dots[0])); })
      .then(function () { return Flow.wait(160); })
      .then(function () { return Flow.anim(Beats.plotDot(c.dots[1])); })
      .then(function () { return Flow.wait(SHORT); });
    if (c.arc) {
      return made.then(function () { return Flow.anim(Beats.growLine(c.arc, 0.6)); });
    }
    return made
      .then(function () { return Flow.anim(Beats.growLine(c.chord, 0.5)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.segFill(c.region, c.clip, c.reach, 0.55)); });
  }

  /* ---- the room the picture has ------------------------------------------
     The stage, in the picture's own units: how wide and how tall the
     board's middle band is right now, measured against the scale the
     picture is drawn at. Read straight after the header is opened or
     closed -- the toggle lays the board out at once, and only the move is
     played out over time -- so it is the room the picture is ABOUT to
     have. The stage itself is measured rather than the figure: the figure
     carries the move as a transform, and its box would be the old one. */
  function room() {
    var r = dom.boardStage.getBoundingClientRect();
    if (!r.width || !r.height) return { w: K.VB_W, h: K.VB_H };
    var s = Math.min(r.width * FIGURE_GROW / K.VB_W, r.height * FIGURE_GROW / K.VB_H);
    return { w: r.width / s, h: r.height / s };
  }

  /* How big the second activity's circle may be: the lesson's own size
     while the header is open for the bird, and as big as the stage's
     height allows while it is closed. */
  function fitFor(open) {
    if (open) return 1;
    return clamp((room().h - 2 * GROW_PAD) / (2 * RR), 1, GROW_MAX);
  }
  /* Where its centre goes when it stands aside: the lesson's own place, or
     -- grown -- as far left as it can go without touching the edge. */
  function cxFor(F) {
    var left = CX - room().w / 2;
    return Math.max(CX + SHIFT, left + GROW_PAD + F * RR);
  }
  function xFor(l) { return l.aside ? round2(cxFor(l.fit) - CX) : 0; }

  /* The circle as `cur` has it: slid by x and scaled about its own centre,
     so it grows in place; the box kept its set distance from the circle's
     edge; and the leader re-aimed at the spot on the circle, which has
     moved with it. */
  var roomW = K.VB_W;     /* the stage's width in the picture's units, as last measured */

  function paint() {
    /* Written as one matrix rather than through GSAP's x/scale: GSAP
       resolves an SVG origin through the element's own transform, so a
       group both slid and scaled would scale about a point that drifts
       with the slide. This is the scale about (CX, CY), then the slide,
       and nothing else ever writes this group's transform. */
    var F = Math.round(cur.fit * 10000) / 10000;
    dom.qzCircle.setAttribute('transform',
      'matrix(' + F + ' 0 0 ' + F + ' ' +
      round2(CX - CX * F + cur.x) + ' ' + round2(CY - CY * F) + ')');
    if (box) { placeBox(); aimLeader(); }
  }

  /* The circle carried to `l` -- aside or centred, at its scale -- as one
     smooth move, the leader following it frame by frame. However the move
     ends, the circle is left where it was going. */
  function layoutTo(l, seconds) {
    lay.aside = !!l.aside; lay.fit = l.fit;
    roomW = room().w;
    var tl = M.timeline({
      revert: function () { cur.x = xFor(lay); cur.fit = lay.fit; paint(); }
    });
    tl.to(cur, { x: xFor(lay), fit: lay.fit, duration: M.dur(seconds || 0.66),
                 ease: 'power2.inOut', onUpdate: paint });
    return tl;
  }

  /* The header opened or closed, and the circle -- if it is on the board
     -- shrunk or grown to suit, as ONE move: the two tweens run together
     on the same clock, so the shapes are seen to take the room the header
     gives up, or to make room for the bird. `aside` moves the circle at
     the same time when given. */
  function header(open, aside) {
    var figure = K.collapseHeader(!open);
    var circle = null;
    if (!dom.qzCircle.hasAttribute('hidden')) {
      circle = layoutTo({ aside: aside == null ? lay.aside : aside, fit: fitFor(open) }, 0.66);
    }
    return Promise.all([Flow.anim(figure), Flow.anim(circle)]);
  }

  /* ---- the bird, briefly ------------------------------------------------
     The bird comes up to say the one instruction and, once it has stood
     for a moment, takes it and itself away again and the header closes
     behind it -- the picture growing into the room that makes: the board
     is the learner's, and a character watching over an activity is one
     more thing to read. The caller opens the header before this is
     called, so the picture has already made room.
       Hands back the promise of the whole trip and two controls on it:
     `cut(keep)` ends the hold now -- the bird leaves at once, or, with
     `keep`, stays where it is because it has more to say -- and `gone()`
     says whether it has already started to leave. */
  function tell(text) {
    var release = null;
    var keep = false, gone = false;
    var early = new Promise(function (resolve) { release = resolve; });
    var done = K.arriveSaying(text)
      .then(function () {
        mascot.settle();
        return Promise.race([Flow.wait(HOLD_TELL), early]);
      })
      .then(function () {
        if (keep) return;
        gone = true;
        return Promise.all([K.mascotJumpOut(), Flow.anim(Beats.lineOut(dom.promptLine))])
          .then(function () {
            K.clearPrompt();
            return header(false);
          });
      });
    return {
      done: K.quiet(done),
      cut: function (stay) { keep = !!stay; release(); },
      gone: function () { return gone; }
    };
  }

  /* ======================================================================
   * The interaction: one of three names, tapped
   * ----------------------------------------------------------------------
   * All three go live -- the cursor becomes a hand over them, a press
   * sinks the one under it onto its wall -- and the first to be pressed
   * is the answer. None of them can be the thing the scene waits on, so
   * whichever is pressed fires a click at the lesson's gate (see #gate in
   * index.html) and the scene waits on THAT, as every choice in the
   * lesson does: an ordinary Flow.once, cancelled with the rest of the
   * chain when a scene is retired, with the listeners coming off
   * whichever way it ends.
   *   Keyboard: each name takes focus, and Enter or Space presses it.
   *   Hands back the index of the name that was pressed, in `list`.
   * ====================================================================== */
  function askOption(list) {
    var picked = -1;
    var live = true;

    dom.qz.classList.add('is-asking');
    list.forEach(function (g) { g.setAttribute('tabindex', '0'); });

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
    /* the press: down onto the wall under the finger, and up again as it
       lifts or leaves -- the same give every raised control in the game
       has, done here with a class the stylesheet spells out */
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
        g.setAttribute('tabindex', '-1');
      });
      dom.qz.classList.remove('is-asking');
    }

    list.forEach(function (g) {
      g.addEventListener('click', onPick);
      g.addEventListener('keydown', onKey);
      g.addEventListener('pointerdown', onDown);
      g.addEventListener('pointerup', onUp);
      g.addEventListener('pointerleave', onUp);
      g.addEventListener('pointercancel', onUp);
    });

    return Flow.once(dom.gate).then(
      function () { off(); return picked; },
      function (err) { off(); throw err; });
  }

  /* Asked until it is answered, or until the chances are spent: a wrong
     name shakes its head and the question stays open; the last wrong one
     shakes and the question closes, for the lesson to show the answer.
     Hands back whether the right name was FOUND -- by the learner, on any
     try -- or had to be shown. */
  function askUntil(answer) {
    var list = opts.map(function (o) { return o.g; });
    var misses = 0;
    function round() {
      return askOption(list).then(function (i) {
        if (i === answer) return { found: true };
        misses++;
        var shaken = Flow.anim(Beats.optWrong(list[i]));
        if (misses >= CHANCES) return shaken.then(function () { return { found: false }; });
        return shaken.then(round);
      });
    }
    return round();
  }

  /* ======================================================================
   * Scene 1 -- tap the name. The blank board with its header closed, so
   * the picture has the whole of it; three circles made one after another
   * where they stand; three names under them; the bird up to ask and
   * gone again; and the answer. Two chances, then the answer is shown.
   * ====================================================================== */
  function sceneTap() {
    var outcome = null;
    var told = null;
    deal = dealLabels();

    /* The board is blank and the bird is behind it, as the section before
       left them. Nobody is speaking, so the header closes first and the
       row is drawn into the room that makes. */
    return Flow.wait(SHORT)
      .then(function () { return header(false); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        dom.qz.removeAttribute('hidden');
        dom.qzCards.removeAttribute('hidden');
        return cards.reduce(function (chain, c) {
          return chain
            .then(function () { return drawCard(c); })
            .then(function () { return Flow.wait(SHORT); });
        }, Promise.resolve());
      })

      /* ---- the names, and the question --------------------------------------
         The names land under the circles one after another. Then the
         header opens for the bird, which asks and goes; the ask is armed
         as the bird lands, before its line is finished, as every tap in
         the lesson is. */
      .then(function () {
        writeLabels();
        dom.qzOpts.removeAttribute('hidden');
        return Flow.anim(Beats.optsIn(opts.map(function (o) { return o.g; })));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return header(true); })
      .then(function () {
        outcome = K.quiet(askUntil(deal.answer));
        told = tell(LINES.tap);
        return outcome;
      })

      /* ---- answered ----------------------------------------------------------
         Found or shown, the right name goes green, and the bird says
         which it was, in a word, and nothing more -- the explaining was
         the four sections before this one. If it is still up it says so
         from where it stands; if it has gone it comes back to say it. */
      .then(function (res) {
        var found = !!(res && res.found);
        var ack = found ? K.LINES.ackRight : K.LINES.ackWrong;
        var mood = found ? 'happy' : 'confused';
        var said;
        if (told.gone()) {
          said = told.done
            .then(function () { return header(true); })
            .then(function () { return K.arriveSaying(ack, mood); });
        } else {
          told.cut(true);
          said = told.done.then(function () { return K.speak(ack, mood); });
        }
        return Promise.all([Flow.anim(Beats.optRight(opts[deal.answer].g)), said]);
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(BEAT);
      })
      .then(function () { return K.handOver(dom.nextBtn); });
  }

  /* ======================================================================
   * The second activity's circle, drawn from the angles
   * ====================================================================== */

  /* One of the two wedges, `t` of the way through its sweep (0 to 1;
     whole when left out): sectors.js's shape, on this circle. */
  function wedge(which, t) {
    var k = t == null ? 1 : t;
    return which === 'minor' ? MAIN.wedge(qz.a, qz.span * k, false)
                             : MAIN.wedge(qz.a, (360 - qz.span) * k, true);
  }
  function wedgeFn(which) { return function (t) { return wedge(which, t); }; }

  /* Every mark that depends on the two points, rewritten from them: the
     two pieces of the rim, the two segments and the circles their colour
     spreads from, the two wedges, the chord, a radius to each point, and
     the points. */
  function redraw() {
    var a = qz.a, b = qz.a + qz.span;
    var pA = MAIN.pt(a), pB = MAIN.pt(b), o = { x: CX, y: CY };
    dom.qzArcMinor.setAttribute('d', MAIN.arc(a, qz.span, false));
    dom.qzArcMajor.setAttribute('d', MAIN.arc(a, 360 - qz.span, true));
    dom.qzSegMinor.setAttribute('d', MAIN.seg(a, qz.span, true));
    dom.qzSegMajor.setAttribute('d', MAIN.seg(a, qz.span, false));
    dom.qzSecMinor.setAttribute('d', wedge('minor'));
    dom.qzSecMajor.setAttribute('d', wedge('major'));
    dom.qzChord.setAttribute('d', lineD(pA, pB));
    dom.qzRadiusA.setAttribute('d', lineD(o, pA));
    dom.qzRadiusB.setAttribute('d', lineD(o, pB));
    var mid = MAIN.chordMid(a, qz.span);
    [dom.qzClipMinor, dom.qzClipMajor].forEach(function (c) {
      c.setAttribute('cx', mid.x);
      c.setAttribute('cy', mid.y);
    });
    dom.qzPointA.setAttribute('cx', pA.x); dom.qzPointA.setAttribute('cy', pA.y);
    dom.qzPointB.setAttribute('cx', pB.x); dom.qzPointB.setAttribute('cy', pB.y);
  }

  function dots() { return [dom.qzPointA, dom.qzPointB]; }
  function regions() { return [dom.qzSegMinor, dom.qzSegMajor, dom.qzSecMinor, dom.qzSecMajor]; }
  /* Every line on the circle: what stands back when one part is asked
     for. The points are not among them -- they are the ends of every
     part, so they stay. */
  function lines() {
    return [dom.qzArcMinor, dom.qzArcMajor, dom.qzChord,
            dom.qzRadiusA, dom.qzRadiusB, dom.qzCentreDot];
  }

  /* What a part is made of: the lines that come up to full when it is
     asked for. An arc is its piece of the rim; a segment is that piece
     and the chord; a sector is that piece, the two radii and the centre
     they meet at. Its region, if it has one, is coloured in on top. */
  function arcOf(part) { return part.which === 'minor' ? dom.qzArcMinor : dom.qzArcMajor; }
  function onFor(part) {
    var arc = arcOf(part);
    if (part.kind === 'arc') return [arc];
    if (part.kind === 'seg') return [arc, dom.qzChord];
    return [arc, dom.qzRadiusA, dom.qzRadiusB, dom.qzCentreDot];
  }
  function regionOf(part) {
    if (part.kind === 'seg') return part.which === 'minor' ? dom.qzSegMinor : dom.qzSegMajor;
    if (part.kind === 'sec') return part.which === 'minor' ? dom.qzSecMinor : dom.qzSecMajor;
    return null;
  }

  /* Where a part is asked for -- where its leader lands -- as {deg, r}:
     on the outer edge of an arc; midway between chord and rim for the
     smaller segment and well inside for the larger; on a wedge's middle
     for a sector, where it has opened wide. */
  function spot(part) {
    var r, d = MAIN.chordDist(qz.span);
    if (part.kind === 'arc') r = RR + ANCHOR_OUT;
    else if (part.kind === 'seg') r = part.which === 'minor' ? (d + RR) / 2 : RR * 0.42;
    else r = part.which === 'minor' ? RR * 0.6 : RR * 0.5;
    return { deg: part.deg, r: r };
  }

  /* The region a part has, coloured in the way its section colours it: a
     segment from the chord outward through its clip circle, a sector
     swept from one radius round to the other. */
  function fillIn(part) {
    var region = regionOf(part);
    if (!region) return Promise.resolve();
    if (part.kind === 'seg') {
      var minor = part.which === 'minor';
      var clip = minor ? dom.qzClipMinor : dom.qzClipMajor;
      return Flow.anim(Beats.segFill(region, clip, MAIN.reach(qz.span)[minor ? 0 : 1], 0.6));
    }
    return Flow.anim(Beats.secFill(region, wedgeFn(part.which), 0.7));
  }

  /* ---- the one box ------------------------------------------------------
     A box of the boxes' make (see buildBox in pages.js), a size up, hung
     off the circle LEVEL with it -- its middle on the circle's centre
     line, a set way out from the circle's edge, whichever part it asks
     about, so the eye finds it in the same place every time -- and tied
     to the spot on the part by a leader that leaves the spot level, bends
     once, and arrives at the box level: one smooth curve rather than the
     sections' cornered polyline, because here the leader crosses the
     circle's own lines and a corner among them would read as one more
     line on the figure. Written to run FROM the part, so its dashes start
     where it touches the part and it draws out of the part toward the
     box. Built afresh for each part, because where the spot is depends on
     the part; and when the circle grows or shrinks the box goes with it,
     carried by the group it is built in (see paint). */

  /* Where the box's left edge is for the circle as it stands now. */
  function boxX() {
    var edge = CX + cur.x + cur.fit * RR;
    var most = CX + roomW / 2 - BOX_IN - QBOX_W;
    return round2(Math.min(edge + LEAD_GAP, most));
  }
  /* The box carried to that place, and what hangs off it told where it
     now is: the leader's end and the burst's spot. */
  function placeBox() {
    var bx = boxX();
    M.set(box.slot, { x: bx - box.x0 });
    box.end = { x: bx - 4, y: CY };
    box.centre = { x: bx + QBOX_W / 2, y: CY };
  }
  /* The leader, from the spot on the part -- where it is on screen, with
     the circle slid and scaled as it is -- to the box's edge. */
  function leaderD(anchor, end) {
    var dx = end.x - anchor.x;
    return 'M' + anchor.x + ' ' + anchor.y +
           ' C' + round2(anchor.x + dx * 0.42) + ' ' + anchor.y +
           ' ' + round2(end.x - dx * 0.3) + ' ' + end.y +
           ' ' + end.x + ' ' + end.y;
  }
  function aimLeader() {
    var s = spot(box.part);
    var p = MAIN.pt(s.deg, s.r);
    var anchor = { x: round2((p.x - CX) * cur.fit + CX + cur.x),
                   y: round2((p.y - CY) * cur.fit + CY) };
    var d = leaderD(anchor, box.end);
    box.leader.setAttribute('d', d);
    box.mask.setAttribute('d', d);
  }

  function buildDropBox(part) {
    clearBox();
    roomW = room().w;
    var bx = boxX();
    var by = round2(CY - QBOX_H / 2);

    var mask = el('mask', { id: 'qzLeaderMask', maskUnits: 'userSpaceOnUse',
                            x: 0, y: 0, width: K.VB_W, height: K.VB_H });
    var maskPath = el('path', { 'class': 'q-leader-mask', d: '' });
    mask.appendChild(maskPath);
    dom.qzDefs.appendChild(mask);
    var leader = el('path', { 'class': 'q-leader', d: '', mask: 'url(#qzLeaderMask)' });
    dom.qzBoxes.appendChild(leader);

    /* the group the box is carried in: built where the box is now, and
       moved by exactly the difference after -- so the beats that shake
       and pulse the box itself never meet this transform */
    var slot = el('g', { 'class': 'qz-slot' });
    dom.qzBoxes.appendChild(slot);

    var g = el('g', { 'class': 'q-box', 'data-name': part.name, tabindex: 0, role: 'button' });
    var rect = el('rect', { 'class': 'q-box__rect', x: bx, y: by,
                            width: QBOX_W, height: QBOX_H, rx: QBOX_H / 2 });
    var badge = el('g', { 'class': 'q-badge' });
    var bcx = bx + 28;
    badge.appendChild(el('circle', { 'class': 'q-badge__ring', cx: bcx, cy: CY, r: 11 }));
    badge.appendChild(el('path', { 'class': 'q-badge__tick',
      d: 'M' + (bcx - 6) + ' ' + CY + ' L' + (bcx - 1.5) + ' ' + (CY + 4.5) +
         ' L' + (bcx + 6.5) + ' ' + (CY - 4.5) }));
    var text = el('text', { 'class': 'figure-label q-box__text',
                            x: bx + QBOX_W / 2 + 10, y: CY + 8.5, 'text-anchor': 'middle' });
    g.appendChild(rect);
    g.appendChild(badge);
    g.appendChild(text);
    slot.appendChild(g);

    box = { name: part.name, part: part, g: g, rect: rect, badge: badge, text: text,
            leader: leader, mask: maskPath, slot: slot, x0: bx, filled: false,
            end: { x: bx - 4, y: CY }, centre: { x: bx + QBOX_W / 2, y: CY } };
    K.emptyBox(box);
    aimLeader();
    return box;
  }
  function clearBox() {
    box = null;
    dom.qzBoxes.textContent = '';
    var m = dom.qzDefs.querySelector('#qzLeaderMask');
    if (m) m.parentNode.removeChild(m);
  }

  /* ---- the circle, drawn ------------------------------------------------ */
  function drawCircle() {
    return Flow.anim(Beats.drawRim(dom.qzRim, dom.qzTip))
      .then(function () { return Flow.wait(160); })
      .then(function () { return Flow.anim(Beats.fillDisc(dom.qzDisc)); });
  }

  /* Every part put on it, one after the other, in the order the lesson
     taught them: the centre, the two points, the chord between them, a
     radius to each, and the rim recoloured as its two pieces. No region
     is coloured: that is done for each part as it is asked for. */
  function drawParts() {
    return Flow.anim(Beats.plantCentre(dom.qzCentre, dom.qzCentreDot, { call: false }))
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.qzPointA)); })
      .then(function () { return Flow.wait(200); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.qzPointB)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.growLine(dom.qzChord, 0.6)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.growLine(dom.qzRadiusA, 0.5)); })
      .then(function () { return Flow.wait(120); })
      .then(function () { return Flow.anim(Beats.growLine(dom.qzRadiusB, 0.5)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Flow.anim(Beats.arcSweep({
          minor: dom.qzArcMinor, major: dom.qzArcMajor, rim: dom.qzRim, dots: dots()
        }));
      });
  }

  /* ======================================================================
   * One part asked for
   * ----------------------------------------------------------------------
   * The header opens and the bird comes up to ask; while it does, the
   * part comes up and the rest stand back, its region, if it has one, is
   * coloured in, the leader draws out of it to the box, and the box
   * lands. The drag is live from that moment. The bird says its line,
   * stands a moment and goes, and the header closes behind it, so the
   * picture has the board while the learner works. A wrong name is
   * shaken off and goes home, for as many tries as it takes; the right
   * one flies into the box, the box goes green, and a small burst goes up
   * off it. Then Next, and the box and the colour are taken away for the
   * next part.
   * ====================================================================== */
  function askPart(part) {
    var on = onFor(part);
    var off = lines().filter(function (e) { return on.indexOf(e) < 0; });
    var arcs = on.filter(function (e) { return e === dom.qzArcMinor || e === dom.qzArcMajor; });
    var region = regionOf(part);
    var told = null;

    return header(true)
      .then(function () {
        told = tell(LINES.drag);
        return Flow.anim(Beats.quizFocus(on, off, arcs));
      })
      .then(function () { return fillIn(part); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        buildDropBox(part);
        dom.qzBoxes.removeAttribute('hidden');
        return Flow.anim(Beats.boxIn(box));
      })
      .then(function () {
        return K.armQuiz({ boxes: [box] }, chips, { group: dom.qzBoxes });
      })
      .then(function () {
        told.cut(false);
        /* the burst goes up as the name lands in the box, not as it leaves
           the tray */
        return Flow.wait(360);
      })
      .then(function () {
        return Flow.anim(Beats.confetti(dom.qzBurst, box.centre.x, box.centre.y));
      })
      .then(function () { return told.done; })
      .then(function () { return K.handOver(dom.nextBtn); })

      /* ---- and cleared for the next -------------------------------------- */
      .then(function () {
        var gone = [Flow.anim(Beats.clearFigure([box.g, box.leader]))];
        if (region) gone.push(Flow.anim(Beats.fillOut(region)));
        return Promise.all(gone);
      })
      .then(function () {
        K.clearInline([box.g, box.leader]);
        clearBox();
        dom.qzBoxes.setAttribute('hidden', '');
        return Flow.wait(SHORT);
      });
  }

  /* ======================================================================
   * Scene 2 -- drag the names. A clean board with its header closed; one
   * circle made with every part on it; six names in the tray; the circle
   * stands aside, and each part is asked for in turn. Then the whole
   * picture back, and the bird up to say the lesson is done.
   * ====================================================================== */
  function sceneDrag() {
    var names = PARTS.map(function (p) { return p.name; });
    var order = K.shuffle(names).map(function (n) {
      return PARTS.filter(function (p) { return p.name === n; })[0];
    });

    return K.wipeBoard()
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return header(false); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the circle, and every part on it ----------------------------- */
      .then(function () {
        qz.a = DEFAULT.a; qz.span = DEFAULT.span;
        redraw();
        dom.qz.removeAttribute('hidden');
        dom.qzCircle.removeAttribute('hidden');
        return drawCircle();
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(drawParts)
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the six names -------------------------------------------------- */
      .then(function () {
        dom.tray.classList.add('tray--six', 'tray--slots');
        chips = K.chips(K.buildChips(dom.tray, K.shuffle(names)));
        return Flow.anim(Beats.trayIn(dom.tray, chips));
      })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the circle stands aside, and each part is asked for ----------
         At the lesson's own size still: the bird is about to come up for
         the first part, and the circle grows only once it has gone. */
      .then(function () { return Flow.anim(layoutTo({ aside: true, fit: 1 }, 0.8)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return order.reduce(function (chain, part) {
          return chain.then(function () { return askPart(part); });
        }, Promise.resolve());
      })

      /* ---- all six named ----------------------------------------------------
         Every line back to full as the emptied tray goes; then the header
         opens once more for the bird, the circle coming back to the middle
         at the lesson's own size as it does, for the last word of the
         lesson. */
      .then(function () {
        return Promise.all([
          Flow.anim(Beats.quizUnfocus(lines())),
          Flow.anim(Beats.trayOut(dom.tray, chips))
        ]);
      })
      .then(function () {
        dom.tray.setAttribute('hidden', '');
        dom.tray.textContent = '';
        dom.tray.classList.remove('tray--six', 'tray--slots');
        chips = K.chips([]);
        return Flow.wait(SHORT);
      })
      .then(function () { return header(true, false); })
      .then(function () {
        Beats.sfx('cheer');
        return K.arriveSaying(K.LINES.done);
      })
      .then(function () {
        mascot.state('celebrating');
        return Flow.wait(1400);
      })
      .then(function () { mascot.settle(); });
  }

  /* ======================================================================
   * The hooks the board's housekeeping calls -- see addSection in pages.js
   * ====================================================================== */

  /* What this section has on the figure: the one group, faded as a whole. */
  function parts() { return [dom.qz]; }

  /* Back to rest, with no animation. The inline writes inside the figure
     are pages.js's to clear -- resetFigure does it for every descendant of
     the picture right after this -- so this is about attributes, classes,
     the box, and the two things done to the tray. */
  function reset() {
    qz.a = DEFAULT.a; qz.span = DEFAULT.span;
    lay.aside = false; lay.fit = 1;
    cur.x = 0; cur.fit = 1;
    dom.qzCircle.removeAttribute('transform');

    dom.qz.setAttribute('hidden', '');
    dom.qz.classList.remove('is-asking');
    [dom.qzCards, dom.qzOpts, dom.qzCircle, dom.qzBoxes, dom.qzCentre].forEach(function (g) {
      g.setAttribute('hidden', '');
    });
    dom.qzBoxes.classList.remove('is-live');
    opts.forEach(function (o) {
      o.g.classList.remove('is-shown', 'is-right', 'is-wrong', 'is-down');
      o.g.setAttribute('tabindex', '-1');
    });
    cards.forEach(function (c) { if (c.clip) c.clip.setAttribute('r', CLIP_OPEN); });
    [dom.qzClipMinor, dom.qzClipMajor].forEach(function (c) { c.setAttribute('r', CLIP_OPEN); });
    regions().forEach(function (r) { r.classList.remove('is-lit'); });
    dom.qzBurst.textContent = '';
    dom.tray.classList.remove('tray--six', 'tray--slots');
    clearBox();
    redraw();
  }

  /* The board as the scene at `local` expects to find it, written straight
     in. pages.js has already put the board up and the bird behind it. */
  function stage(local) {
    if (local <= 0) return;             /* opens on the blank board, as left */

    /* the three circles in their places, named, the right name found, and
       the bird on the header: the second activity opens by wiping this */
    deal = dealLabels();
    writeLabels();
    dom.qz.removeAttribute('hidden');
    dom.qzCards.removeAttribute('hidden');
    dom.qzOpts.removeAttribute('hidden');
    cards.forEach(function (c) { M.set(cardMarks(c), { opacity: 1 }); });
    opts.forEach(function (o) { o.g.classList.add('is-shown'); });
    opts[deal.answer].g.classList.add('is-right');
    mascot.placeIn(dom.slotHeader);
    mascot.el.classList.remove('is-away');
    mascot.idle();
  }

  Pages.addSection({
    name: 'Quiz',
    scenes: [
      { name: 'Tap the name',   play: sceneTap  },
      { name: 'Drag the names', play: sceneDrag }
    ],
    build: build,
    parts: parts,
    reset: reset,
    stage: stage
  });

  global.Quiz = {
    LINES: LINES,
    PARTS: PARTS,
    state: function () { return { deal: deal, cut: qz, box: box }; }
  };
})(window);
