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
 * split the section out later, this file, css/practice.css, the two groups
 * in the figure (#pa and #pb) and #psPane in index.html are the whole of it.
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
      { line: dom.psLine1, slot: dom.psSlot1, ask: said('p29Angle', T('p29Angle')),
        options: [deg90, cm7, deg180], answer: deg90, wrong: w1, mark: 'angle' },
      { line: dom.psLine2, slot: dom.psSlot2, ask: said('p29Radius', T('p29Radius')),
        options: [cm7, cm14, deg90], answer: cm7, wrong: w2, mark: 'radius' },
      { line: dom.psLine4, slot: dom.psSlot4, ask: said('askArcLen', T('askArcLen')),
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

  /* ---- the two figures --------------------------------------------------
     Degrees anticlockwise from three o'clock, as every angle in the app is:
     the sector runs from `a` anticlockwise for `span`. The length label
     sits beside one radius (`on`: the first, `a`, or the second, `b`),
     `rAt` out along it and `rOff` off it on the side away from the sector;
     the measure sits on the angle's middle line, `degR` out. Page 1 is a
     quarter from the horizontal radius up to the vertical one, "7 cm" on
     the vertical; page 2 is 120° astride twelve o'clock, "21 cm" on the
     right-hand radius. */
  var PA = { a: 0,  span: 90,  on: 'b', rAt: 86,  rOff: 42, degR: 74 };
  var PB = { a: 30, span: 120, on: 'a', rAt: 120, rOff: 26, degR: 72 };

  /* ---- the working ------------------------------------------------------
     The pauses that keep each thing its own, so the eye can follow a value
     into its box, and a change to the line it is made in. */
  var READ = 700;          /* ms a hint's first sentence stands before the second */
  var STEP_GAP = 500;      /* ms a landed value stands before the next line */
  var LIT_HOLD = 550;      /* ms the cells about to be simplified are lit */
  var SOLVE_HOLD = 650;    /* ms each simplification stands before the next */
  var COPY_TIME = 0.8;     /* s: the copy dropping down to its own line */

  /* ---- the elements ------------------------------------------------------ */
  var dom = null;          /* pages.js's, with this section's own on top */
  var mascot = null;
  var opts = [];           /* the pills under the working, while a step is open */
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

  /* One figure's marks, by id prefix. */
  function figure(p) {
    return {
      g: $(p), rim: $(p + 'Rim'), tip: $(p + 'Tip'), sector: $(p + 'Sector'), arc: $(p + 'Arc'),
      radA: $(p + 'RadA'), radB: $(p + 'RadB'), angle: $(p + 'Angle'), centre: $(p + 'Centre'),
      deg: $(p + 'Deg'), len: $(p + 'Len')
    };
  }

  function build() {
    dom = Object.create(K.dom());
    mascot = K.mascot();

    dom.pa = figure('pa');
    dom.pb = figure('pb');

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

    layoutFigure(PA, dom.pa);
    layoutFigure(PB, dom.pb);
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

    /* The measure, on the angle's middle line. */
    var d = P(mid, f.degR);
    g.deg.setAttribute('x', d.x);
    g.deg.setAttribute('y', round2(d.y + LABEL_DY));

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
     each end of the arc, the sector swept in with its arc lit, the angle
     with its measure, and the length beside a radius. Both pages open with
     this; only the numbers differ. */
  function drawFigure(f, g) {
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
      .then(function () { return Flow.anim(Beats.labelIn(g.deg)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.labelIn(g.len)); })
      .then(function () { return Flow.wait(BEAT); });
  }

  /* A figure put away once it has faded: hidden, and every inline write
     on it handed back. */
  function putAwayFigure(g) {
    g.g.setAttribute('hidden', '');
    K.clearInline([g.g].concat(all('*', g.g)));
  }

  /* ======================================================================
   * Page 1 -- the working. Its own beats.
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

  /* The copy: line 3 -- line 2, word for word -- comes out of line 2 and
     drops into its own place under it. Its offset is read off the layout
     as it is, in the pane's own pixels. */
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

  /* The three values, one by one: the tray's own entrance with the
     stagger opened right up, so each pill is its own arrival. Hidden by
     hand first, or the row flashes complete for the frame before the
     tween's first. */
  function optsIn(list) {
    M.set(list, { opacity: 0 });
    var tl = M.timeline({ willChange: list, willChangeValue: 'transform, opacity' });
    tl.fromTo(list,
      { opacity: 0, y: 14, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: M.dur(0.4), ease: M.POP, stagger: M.gap(0.3) });
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
  function emptyOpts() {
    dom.psOpts.textContent = '';
    opts = [];
  }

  /* The mark a step is about, lit on the figure when a wrong value is
     pressed: its lines swell twice and its label pops with them, so the
     eye is taken to the thing the step is asking for. Stroke width is the
     one thing a line has to swell (see animations.css on the pulse); it
     is handed back however the beat ends. */
  function marks() {
    var g = dom.pa;
    return {
      angle:  { lines: [g.angle],       w: LINE_W, label: g.deg },
      radius: { lines: [g.radA, g.radB], w: LINE_W, label: g.len },
      arc:    { lines: [g.arc],         w: ARC_W,  label: null }
    };
  }
  function spotlight(which) {
    var m = marks()[which];
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
        K.quiet(spotlight(spec.mark));
        return K.speak(lines[1], 'confused');
      });
  }

  /* A hint still standing when the right value is pressed goes at once:
     a line that says "Not quite!" over a value turning green would be
     saying the wrong thing. The next step's instruction then types into
     an empty row. */
  function dropHint() {
    hinting++;
    if (!hintUp) return;
    hintUp = false;
    K.quiet(Flow.anim(Beats.lineOut(dom.promptLine)).then(function () { K.clearPrompt(); }));
  }

  /* ---- the interaction: one press on one of three pills ------------------
     Real buttons (see buildChoices in pages.js), so Enter and Space work
     without a line of code. A wrong press is refused -- the pill shakes,
     turns red and is spent, and the bird says why -- and the learner tries
     again among the pills that are left. The right one turns green and the
     wait resolves with it.
       The wait is the lesson's gate (see #gate in index.html): an ordinary
     Flow.once, cancelled with the rest of the chain when the scene is
     retired, with the listeners coming off whichever way it ends. A skip
     answers the step for the learner -- the right pill is lit -- so the
     beats after this are about a board that says what they say it says. */
  function armChoices(spec) {
    var live = true;

    function onPick(ev) {
      if (!live) return;
      var btn = ev.currentTarget;
      if (btn.classList.contains('is-done')) return;
      K.ripple(ev, btn);
      if (btn.dataset.name === spec.answer) {
        live = false;
        dropHint();
        Beats.choiceRight(btn);
        dom.gate.dispatchEvent(new MouseEvent('click'));
        return;
      }
      /* Spent: a value shown wrong is left standing red, so the learner
         is choosing among the rest rather than pressing the same one. */
      btn.classList.add('is-done');
      Beats.choiceWrong(btn);
      K.quiet(refuse(spec, btn.dataset.name));
    }

    function off() {
      live = false;
      opts.forEach(function (b) {
        b.removeEventListener('click', onPick);
        b.classList.add('is-done');
      });
    }

    /* What a skip puts down for the learner: the right pill lit the way a
       pressed one is -- without firing the gate, which the skip has already
       answered. */
    function fillIn() {
      for (var i = 0; i < opts.length; i++) {
        if (opts[i].dataset.name === spec.answer &&
            !opts[i].classList.contains('is-right')) {
          opts[i].classList.add('is-right');
          return;
        }
      }
    }

    opts.forEach(function (b) { b.addEventListener('click', onPick); });

    return Flow.once(dom.gate, { auto: true }).then(
      function () { fillIn(); off(); },
      function (err) { off(); throw err; });
  }

  /* The right value, in: it pops into the box as the pills go; then the
     box dissolves -- its edge and its fill fade (the stylesheet
     transitions them) and its width is let go, Flip playing the line
     closing up round the plain number. The box is no longer a box: the
     line reads as working written out. */
  function land(spec) {
    var slot = spec.slot, v = slot.querySelector('.ps-slot__v');
    slot.classList.remove('is-live');
    global.MathText.write(v, spec.answer);
    var pop = M.timeline({ willChange: v, willChangeValue: 'transform, opacity' });
    pop.fromTo(v, { opacity: 0, scale: 0.5 },
               { opacity: 1, scale: 1, duration: M.dur(0.4), ease: 'back.out(1.7)' });
    return Promise.all([Flow.anim(pop), Flow.anim(optsOut(opts))])
      .then(function () {
        emptyOpts();
        return Flow.wait(220);
      })
      .then(function () {
        var moved = cells(spec.line);
        return Flow.anim(M.relayout(moved, function () {
          slot.classList.add('is-filled');
        }, { nested: true, scale: false, vars: { duration: M.dur(0.45), ease: M.INOUT } }));
      });
  }

  /* One asked step: the bird says what to do -- coming up onto the header
     for the first, from where it stands for the rest -- the line rises in
     with its empty box, the three values arrive, and the right one lands. */
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

  /* One simplification in line 3: the cells about to change are lit --
     their colour (a class, which the stylesheet transitions) and one small
     swell -- and read; they fade and shrink away; the cells are turned
     over -- the old ones out of the layout, the new one in -- and Flip
     plays the line closing up round the gap; then the new cell pops in,
     already in its colour. Every cell of the line is handed to Flip, since
     every term after the change is moved. */
  function collapse(line, olds, repl) {
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
        M.set(repl, { opacity: 0 });
        return Flow.anim(M.relayout(moved, function () {
          olds.forEach(function (c) { c.classList.add('is-gone'); });
          repl.classList.add('is-in');
        }, { nested: true, scale: false, vars: { duration: M.dur(0.5), ease: M.INOUT } }));
      })
      .then(function () {
        var pop = M.timeline({ willChange: repl, willChangeValue: 'transform, opacity' });
        pop.fromTo(repl, { opacity: 0, scale: 0.6, transformOrigin: 'center center' },
                   { opacity: 1, scale: 1, duration: M.dur(0.4), ease: 'back.out(1.7)' });
        pop.call(Beats.pop, null, 0);
        return Flow.anim(pop);
      });
  }

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

  /* The working away, once Next is pressed -- or a wipe catches it up:
     the lines that are standing, and any pills with them. */
  function linesOut() {
    var shown = [dom.psLine1, dom.psLine2, dom.psLine3, dom.psLine4]
      .filter(function (l) { return !l.hasAttribute('hidden'); });
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

  /* The working put away: every line hidden and plain again, every box
     empty and a box once more, every cell back to its word, every inline
     write cleared, the pills gone, the pane shut. */
  function restorePane() {
    hinting++;
    hintUp = false;
    dom.psPane.setAttribute('hidden', '');
    [dom.psLine1, dom.psLine2, dom.psLine3, dom.psLine4].forEach(function (l) {
      l.setAttribute('hidden', '');
    });
    all('.is-on, .is-gone, .is-in, .is-filled, .is-live', dom.psPane).forEach(function (el) {
      el.classList.remove('is-on', 'is-gone', 'is-in', 'is-filled', 'is-live');
    });
    all('.ps-slot__v', dom.psPane).forEach(function (v) { v.textContent = ''; });
    M.set([dom.psLines].concat(all('*', dom.psPane)),
          { clearProps: 'opacity,transform,transformOrigin' });
    emptyOpts();
  }

  /* ======================================================================
   * Page 1 -- the arc length, worked. A blank board, the figure made and
   * stood aside with the header open, the bird up to say what to do, and
   * four lines of working answered one value at a time.
   * ====================================================================== */
  function sceneSolve() {
    var S = solveSteps();
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the figure: the circle, its centre, the two radii, the quarter
         swept in with its arc, the right angle and "90°", and "7 cm" ----- */
      .then(function () {
        dom.pa.g.removeAttribute('hidden');
        return drawFigure(PA, dom.pa);
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
          Flow.anim(linesOut()),
          Flow.anim(Beats.clearFigure([dom.pa.g]))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        restorePane();
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
         swept in with its arc, the angle and "120°", and "21 cm" --------- */
      .then(function () {
        dom.pb.g.removeAttribute('hidden');
        return drawFigure(PB, dom.pb);
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
   * The hooks the board's housekeeping calls -- see addSection in pages.js
   * ====================================================================== */

  /* What this section has on the figure: one group per page, each faded
     as a whole. */
  function parts() { return [dom.pa.g, dom.pb.g]; }

  /* What this section keeps outside the figure: the working, if a wipe
     catches it up. The pane page 2 asks from is circum.js's, and its own
     hooks put it away. */
  function wipe() {
    var out = [];
    if (!dom.psPane.hasAttribute('hidden')) out.push(Flow.anim(linesOut()).then(restorePane));
    return out;
  }

  /* Back to rest, with no animation. The inline writes inside the figure
     are pages.js's to clear -- resetFigure does it for every descendant of
     the picture right after this -- so this is about attributes, classes
     and the words. */
  function reset() {
    dom.pa.g.setAttribute('hidden', '');
    dom.pb.g.setAttribute('hidden', '');
    restorePane();
    if (global.I18n) global.I18n.stop();
  }

  /* The board as the i-th scene expects to FIND it: both open on a wiped
     board -- each one's first beat is the wipe -- so there is nothing to
     stage. */
  function stage() {}

  Pages.addSection({
    name: 'Arc length practice',
    scenes: [
      { name: 'Find the arc length',   play: sceneSolve  },
      { name: 'Choose the arc length', play: sceneChoose }
    ],
    build: build,
    parts: parts,
    wipe: wipe,
    reset: reset,
    stage: stage
  });
})(window);
