/* ==========================================================================
 * circum.js -- Skill 2, section 2: the circumference formula
 * --------------------------------------------------------------------------
 * The second section of the skill, on the same board, with the same bird
 * and the same clock: registered with pages.js as a section (see addSection
 * there), built from the kit pages.js hands over and the beats in
 * animations.js. Nothing here waits on anything except through Flow, so
 * Skip, Replay and the level bar work on this scene exactly as they do on
 * every other. To split the section out later, this file, css/circum.css
 * and the two blocks in index.html (#cf and #cfPane) are the whole of it.
 *
 * Page 1 -- the formula. One question:
 *
 *   The board opens blank. A circle is drawn -- the pen round the rim, the
 *   colour poured in -- and slides smoothly to the left half, where every
 *   stood-aside circle in the app goes. The bird comes up in the right
 *   pane and asks, from the message box over its head (bubble-02 -- drawn
 *   as the definition card on #bubbleAside, bubble-01, which is not
 *   touched): "Correct formula of
 *   Circumference is". Three formulas arrive under it, one by one, and one
 *   has to be pressed. A wrong one is refused -- the pill shakes its head
 *   and stays red, and the box turns red with it to say "Not quite!" and
 *   then, in the sentence that replaces it, WHY it is wrong -- and the
 *   learner tries again for as long as it takes. The right one turns
 *   green, the other pills fade back, the box turns green with "Correct!"
 *   and then the formula, and Next arrives. The bird stays beside its
 *   verdict until Next is PRESSED -- only then does it drop away with the
 *   box, the pills and the circle.
 *
 * Page 2 -- the semicircle's arc length. The same ask, on a new circle:
 *
 *   The board opens blank. A circle is drawn, the diameter cuts it in two,
 *   and the upper half is lit. The bird comes up onto the header to say
 *   "This is the semicircle.", then springs away as the circle slides to
 *   the left half, and lands in the right pane to ask, from bubble-02, for
 *   the formula of the semicircle's arc length. Three formulas, one by one;
 *   a wrong press is refused with why, as on page 1. The right one shows,
 *   at once, the straight angle at the centre -- 180° -- while the box
 *   turns green to say so, and Next arrives.
 *
 * Load order: js/pages.js -> ... -> js/arclen.js -> js/circum.js
 * ========================================================================== */
(function (global) {
  'use strict';

  var M = global.Motion;
  var Flow = global.Flow;
  var Beats = global.Beats;
  var Pages = global.Pages;
  if (!Pages || !Pages.addSection) {
    console.error('circum.js: load js/pages.js before js/circum.js.');
    return;
  }
  var K = Pages.kit;

  /* ---- the script -------------------------------------------------------
     Every word of the section in one place. Each wrong answer is refused
     with the fact that makes it wrong -- a refusal that only says "no"
     teaches nothing. A verdict is said a sentence at a time, each one
     replacing the last: the call on its own first, then the reason.
       A formula is one thing to read, so its spaces are non-breaking and
     the box's rows never split one -- nor start a row with "=". And a
     sentence long enough to wrap keeps its last two words together, so its
     last row is never one stray word. */
  var NB = ' ';
  function whole(s) { return s.replace(/ /g, NB); }
  function tie(s) { return s.replace(/ (\S+)$/, NB + '$1'); }
  var LINES = {
    ask:   tie('Correct formula of Circumference is'),
    right: ['Correct!', 'Circumference' + NB + '= ' + whole('π × diameter.')],
    wrong: {
      'π × radius':    ['Not quite!', tie(whole('π × radius') + ' gives only half the circumference.')],
      'π × (radius)²': ['Not quite!', tie(whole('π × (radius)²') + ' is the area of a circle, not its circumference.')]
    },

    /* page 2 -- the semicircle's arc length */
    semiIs:    'This is the semicircle.',
    semiAsk:   tie('Choose the correct formula to find the arc length of this semicircle.'),
    semiRight: ['Correct!', tie('The arc length of the whole circle is ' + whole('2π × radius.'))],
    semiWrong: {
      '2π × radius':       ['Not quite!', tie(whole('2π × radius') + ' is the arc length of the whole circle, not half of it.')],
      '½ × π × (radius)²': ['Not quite!', tie(whole('½ × π × (radius)²') + ' is the area of a semicircle, not its arc length.')]
    }
  };

  var OPTIONS = ['π × radius', 'π × diameter', 'π × (radius)²'];
  var ANSWER  = 'π × diameter';

  var SEMI_OPTIONS = ['½ × 2π × radius', '2π × radius', '½ × π × (radius)²'];
  var SEMI_ANSWER  = '½ × 2π × radius';

  var BEAT = K.BEAT, SHORT = K.SHORT;
  var READ = 700;          /* ms a verdict's sentence stands, once typed,
                              before the next one takes the box */
  var SHIFT = -250;        /* the circle's slide to the left half -- the same
                              stand-aside every section uses, picture units */

  /* ---- the elements ------------------------------------------------------ */
  var dom = null;          /* pages.js's, with this section's own on top */
  var mascot = null;
  var sayCf = null;        /* the one typer bound to bubble-02           */
  var opts = [];           /* the three pills, while the question is up  */
  var saying = 0;          /* which verdict owns the box now             */

  function $(id) { return document.getElementById(id); }

  function build() {
    dom = Object.create(K.dom());
    mascot = K.mascot();

    dom.cf       = $('cf');
    dom.cfDisc   = $('cfDisc');
    dom.cfRim    = $('cfRim');
    dom.cfTip    = $('cfTip');
    dom.cfPane   = $('cfPane');
    dom.slotCf   = $('slotCf');
    dom.cfBubble = $('bubbleCf');
    dom.cfOpts   = $('cfOpts');

    dom.cs       = $('cs');
    dom.csDisc   = $('csDisc');
    dom.csRim    = $('csRim');
    dom.csTip    = $('csTip');
    dom.csDia    = $('csDia');
    dom.csArc    = $('csArc');
    dom.csAngle  = $('csAngle');
    dom.csCentre = $('csCentre');
    dom.csDeg    = $('csDeg');

    /* fit: the box closes round each line's own rows, so the question and
       every verdict get a box their own size, eased from one to the next. */
    sayCf = global.Typer.create($('cfType'), { box: dom.cfBubble, fit: true });

    reset();
  }

  /* ======================================================================
   * bubble-02 -- this section's own beats
   * ====================================================================== */

  /* The pane put away, emptied and shut, so the next run that opens it is
     not opening a box still wearing the last one's verdict. */
  function restorePane() {
    dom.cfBubble.classList.remove('is-ok', 'is-bad');
    sayCf.clear();
    dom.cfBubble.setAttribute('hidden', '');
    M.set(dom.cfBubble, { clearProps: 'opacity,transform,transformOrigin' });
    dom.cfOpts.textContent = '';
    opts = [];
    dom.cfPane.classList.remove('is-long');
    dom.cfPane.setAttribute('hidden', '');
  }

  /* A verdict said from the box, in its colour -- or in none, for the
     question itself. The box is already open: only the hue and the words
     change, and the bird holds the mood for as long as it is talking.
     `lines` is one sentence or several, said one at a time, each read for
     a moment and then replaced -- the box closing round each in turn.
       A newer verdict takes the box over: `saying` is bumped at the start,
     and an older chain that wakes up to find itself outvoted says nothing
     more and leaves the bird alone rather than settling it out from under
     the new line. */
  function verdict(lines, mood, cls) {
    var mine = ++saying;
    function live() { return mine === saying; }
    dom.cfBubble.classList.remove('is-ok', 'is-bad');
    if (cls) dom.cfBubble.classList.add(cls);
    mascot.state(mood || 'talking');
    return [].concat(lines).reduce(function (chain, line, i) {
      return chain
        .then(function () { if (i && live()) return Flow.wait(READ); })
        .then(function () { if (live()) return sayCf(line); });
    }, Promise.resolve()).then(function () {
      if (live()) mascot.settle();
    });
  }

  /* The three formulas, one by one: the tray's own entrance with the
     stagger opened right up, so each pill is its own arrival. Hidden by
     hand first, or the row flashes complete for the frame before the
     tween's first. */
  function optsIn(list) {
    M.set(list, { opacity: 0 });
    var tl = M.timeline({ willChange: list, willChangeValue: 'transform, opacity' });
    tl.fromTo(list,
      { opacity: 0, y: 14, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: M.dur(0.4), ease: M.POP,
        stagger: M.gap(0.3) });
    return tl;
  }

  /* And away again, a beat apart, once Next has been pressed. */
  function optsOut(list) {
    if (!list.length) return null;
    var tl = M.timeline({ willChange: list, willChangeValue: 'transform, opacity' });
    tl.to(list, {
      opacity: 0, y: 10, scale: 0.94, duration: M.dur(0.3), ease: 'power2.in',
      stagger: M.gap(0.08)
    });
    return tl;
  }

  /* ======================================================================
   * The interaction: one press on one of three pills
   * ----------------------------------------------------------------------
   * Real buttons (see buildChoices in pages.js), so Enter and Space work
   * without a line of code. A wrong press is refused -- the pill shakes,
   * turns red and is spent, `onWrong` is told which one so the box can say
   * why -- and the learner tries again among the pills that are left. The
   * right one turns green and the wait resolves.
   *
   * The wait is the lesson's gate (see #gate in index.html): an ordinary
   * Flow.once, cancelled with the rest of the chain when the scene is
   * retired, with the listeners coming off whichever way it ends. A skip
   * answers the question for the learner -- the right pill is lit -- so the
   * beats after this are about a board that says what they say it says.
   * ====================================================================== */
  function armChoices(spec) {
    var live = true;
    var misses = 0;

    function onPick(ev) {
      if (!live) return;
      var btn = ev.currentTarget;
      if (btn.classList.contains('is-done')) return;
      K.ripple(ev, btn);
      if (btn.dataset.name === spec.answer) {
        live = false;
        Beats.choiceRight(btn);
        dom.gate.dispatchEvent(new MouseEvent('click'));
        return;
      }
      misses++;
      /* Spent: a formula shown wrong is left standing red, so the learner
         is choosing among the rest rather than pressing the same one. */
      btn.classList.add('is-done');
      Beats.choiceWrong(btn);
      if (spec.onWrong) spec.onWrong(btn.dataset.name, misses);
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
      function () { fillIn(); off(); return { misses: misses }; },
      function (err) { off(); throw err; });
  }

  /* ======================================================================
   * The scene -- a blank board, the circle made and stood aside, the
   * question asked and answered, and the bird gone only on Next.
   * ====================================================================== */
  function sceneFormula() {
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle: the pen round the rim, the colour poured in ------- */
      .then(function () {
        dom.cf.removeAttribute('hidden');
        return Flow.anim(Beats.drawRim(dom.cfRim, dom.cfTip));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.fillDisc(dom.cfDisc)); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- and it stands aside ---------------------------------------------
         The header closes -- there is no bird on it -- and the stage takes
         the room as the circle slides smoothly to the left half, where
         every stood-aside circle in the app goes. */
      .then(function () {
        return Promise.all([
          Flow.anim(K.collapseHeader(true)),
          Flow.anim(Beats.slideArcs(dom.cf, SHIFT))
        ]);
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return askFormula({
          ask: LINES.ask, options: OPTIONS, answer: ANSWER,
          wrong: LINES.wrong, right: LINES.right
        });
      })
      .then(function () { return closeOut(dom.cf); });
  }

  /* ======================================================================
   * The ask, as both pages put it: the bird up in the pane, the question
   * from bubble-02, the formulas one by one, the press, and the verdict.
   *   spec: ask (the question), options, answer, wrong ({name: lines}),
   * right (lines), and `reveal` -- what the board shows the moment the
   * right formula is pressed, alongside the verdict -- if anything.
   * ====================================================================== */
  function askFormula(spec) {
    /* ---- the bird, and the question from bubble-02 -------------------------
       The pane opens first so the slot has a box to be measured by, the
       bird comes up onto it, and the box unfolds from its head with the
       question typing in -- the greeting's own entrance, on the board. */
    dom.cfPane.removeAttribute('hidden');
    return K.mascotJumpIn(dom.slotCf)
      .then(function () {
        mascot.state('talking');
        /* Ghost before live, and before the box is shown: the box has to be
           laid out and measurable when the line goes into it, or it would
           open at the wrong size and resize a beat later. */
        Beats.bubbleArm(dom.cfBubble);
        var said = sayCf(spec.ask);
        Beats.bubbleIn(dom.cfBubble);
        return said;
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(SHORT);
      })

      /* ---- the three formulas, one by one --------------------------------- */
      .then(function () {
        opts = K.buildChoices(dom.cfOpts, K.shuffle(spec.options));
        opts.forEach(function (b) { b.dataset.name = b.textContent; });
        return Flow.anim(optsIn(opts));
      })

      /* ---- the press. The box answers every try: red with the why for a
         wrong one -- those verdicts are waits the chain never awaits, so
         they go through quiet() -- and the right answer's verdict is the
         scene's own beat, said in green once the gate has fired. ---------- */
      .then(function () {
        return armChoices({
          answer: spec.answer,
          onWrong: function (name) {
            K.quiet(verdict(spec.wrong[name], 'confused', 'is-bad'));
          }
        });
      })
      /* The answer stands alone: the other pills -- spent, no longer
         controls -- step back to a faint 0.4 while the box says why, so the
         green one is what the eye is left on. */
      .then(function () {
        var right = opts.filter(function (b) { return b.dataset.name === spec.answer; })[0];
        return Promise.all([
          verdict(spec.right, 'happy', 'is-ok'),
          Flow.anim(M.focus(right, opts, { opacity: 0.4 })),
          spec.reveal ? spec.reveal() : null
        ]);
      })
      .then(function () { return Flow.wait(BEAT); });
  }

  /* ======================================================================
   * Next -- and only its PRESS sends the bird away. handOver waits on the
   * button, so everything after it is after the learner has pressed it:
   * the box shuts, the pills and the circle fade, and the bird drops back
   * behind the board, all at once. Then everything is handed back to its
   * built state and the header opens again over a clean board, which is
   * where whatever comes next begins.
   * ====================================================================== */
  function closeOut(group) {
    return K.handOver(dom.nextBtn)
      .then(function () {
        saying++;                     /* no verdict owns the box any more */
        return Promise.all([
          Flow.anim(Beats.bubbleOut(dom.cfBubble)),
          Flow.anim(optsOut(opts)),
          K.mascotJumpOut(),
          Flow.anim(Beats.clearFigure([group]))
        ]);
      })
      .then(function () {
        restorePane();
        group.setAttribute('hidden', '');
        K.clearInline([group].concat(
          Array.prototype.slice.call(group.querySelectorAll('*'))));
        return Flow.anim(K.collapseHeader(false));
      });
  }

  /* ======================================================================
   * Page 2 -- the semicircle's arc length. A blank board, the circle made
   * and cut in two by its diameter, the upper half lit and named from the
   * header; then the circle stands aside, the bird crosses to the pane and
   * asks for the formula, and the right answer shows the straight angle
   * the semicircle stands on: 180°.
   * ====================================================================== */
  function sceneSemicircle() {
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle: the pen round the rim, the colour poured in ------- */
      .then(function () {
        dom.cs.removeAttribute('hidden');
        return Flow.anim(Beats.drawRim(dom.csRim, dom.csTip));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.fillDisc(dom.csDisc)); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- cut in two: the diameter drawn across, edge to edge ------------ */
      .then(function () {
        return Flow.anim(Beats.growLine(dom.csDia, 0.7, 'power2.inOut'));
      })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- and the upper half lit: swept over the top, then swelling once */
      .then(function () {
        return Flow.anim(Beats.growLine(dom.csArc, 0.9, 'power2.inOut'));
      })
      .then(function () { return Flow.anim(Beats.arcPulse([dom.csArc])); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- named from the header ------------------------------------------ */
      .then(function () { return K.arriveSaying(LINES.semiIs); })
      .then(function () {
        mascot.settle();
        return Flow.wait(BEAT);
      })

      /* ---- the circle stands aside, and the bird crosses -------------------
         The bird springs off the header with its line -- the header closes
         behind it -- while the circle slides smoothly to the left half; it
         then comes up in the right pane to ask. */
      .then(function () {
        return Promise.all([
          K.mascotJumpOut(),
          Flow.anim(Beats.lineOut(dom.promptLine)),
          Flow.anim(Beats.slideArcs(dom.cs, SHIFT))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        return Flow.wait(SHORT);
      })
      .then(function () {
        dom.cfPane.classList.add('is-long');
        return askFormula({
          ask: LINES.semiAsk, options: SEMI_OPTIONS, answer: SEMI_ANSWER,
          wrong: LINES.semiWrong, right: LINES.semiRight,
          reveal: showAngle
        });
      })
      .then(function () { return closeOut(dom.cs); });
  }

  /* The straight angle at the centre: the dot, the half-turn drawn over
     it, and its "180°". */
  function showAngle() {
    return Flow.anim(Beats.plotDot(dom.csCentre))
      .then(function () {
        return Flow.anim(Beats.growLine(dom.csAngle, 0.6, 'power2.inOut'));
      })
      .then(function () { return Flow.anim(Beats.labelIn(dom.csDeg)); });
  }

  /* ======================================================================
   * The hooks the board's housekeeping calls -- see addSection in pages.js
   * ====================================================================== */

  /* What this section has on the figure: one group per page, each faded
     as a whole. */
  function parts() { return [dom.cf, dom.cs]; }

  /* And what it keeps outside the figure: the pane, if a wipe catches the
     question still up. */
  function wipe() {
    var out = [];
    if (!dom.cfPane.hasAttribute('hidden')) {
      if (!dom.cfBubble.hasAttribute('hidden')) {
        out.push(Flow.anim(Beats.bubbleOut(dom.cfBubble)));
      }
      var o = optsOut(opts);
      if (o) out.push(Flow.anim(o).then(function () { restorePane(); }));
      else restorePane();
    }
    return out;
  }

  /* Back to rest, with no animation. The inline writes inside the figure
     are pages.js's to clear -- resetFigure does it for every descendant of
     the picture right after this -- so this is about attributes, classes
     and the pane. */
  function reset() {
    saying++;
    dom.cf.setAttribute('hidden', '');
    dom.cs.setAttribute('hidden', '');
    restorePane();
  }

  /* The board as the scene expects to find it, written straight in. Both
     scenes open on a wiped board -- each one's first beat is the wipe --
     so there is nothing to stage. */
  function stage() {}

  Pages.addSection({
    name: 'Circumference formula',
    scenes: [
      { name: 'Circumference formula', play: sceneFormula },
      { name: 'Semicircle arc length', play: sceneSemicircle }
    ],
    build: build,
    parts: parts,
    wipe: wipe,
    reset: reset,
    stage: stage
  });

  /* What a section after this one might want: the question's own box, for
     later asks to speak through. */
  global.Circum = {
    LINES: LINES,
    verdict: verdict,
    armChoices: armChoices
  };
})(window);
