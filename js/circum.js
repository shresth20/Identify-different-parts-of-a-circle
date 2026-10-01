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
 * Section 2 -- the formula. One scene, one question:
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
 *   green, the box turns green with "Correct!" and then the formula, and
 *   Next arrives. The bird stays beside its
 *   verdict until Next is PRESSED -- only then does it drop away with the
 *   box, the pills and the circle.
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
     the box's balanced rows never split one -- nor start a row with "=". */
  var NB = ' ';
  function whole(s) { return s.replace(/ /g, NB); }
  var LINES = {
    ask:   'Correct formula of Circumference is',
    right: ['Correct!', 'Circumference' + NB + '= ' + whole('π × diameter.')],
    wrong: {
      'π × radius':    ['Not quite!', whole('π × radius') + ' gives only half the circumference.'],
      'π × (radius)²': ['Not quite!', whole('π × (radius)²') + ' is the area of a circle, not its circumference.']
    }
  };

  var OPTIONS = ['π × radius', 'π × diameter', 'π × (radius)²'];
  var ANSWER  = 'π × diameter';

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

      /* ---- the bird, and the question from bubble-02 -------------------------
         The pane opens first so the slot has a box to be measured by, the
         bird comes up onto it, and the box unfolds from its head with the
         question typing in -- the greeting's own entrance, on the board. */
      .then(function () {
        dom.cfPane.removeAttribute('hidden');
        return K.mascotJumpIn(dom.slotCf);
      })
      .then(function () {
        mascot.state('talking');
        /* Ghost before live, and before the box is shown: the box has to be
           laid out and measurable when the line goes into it, or it would
           open at the wrong size and resize a beat later. */
        Beats.bubbleArm(dom.cfBubble);
        var said = sayCf(LINES.ask);
        Beats.bubbleIn(dom.cfBubble);
        return said;
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(SHORT);
      })

      /* ---- the three formulas, one by one --------------------------------- */
      .then(function () {
        opts = K.buildChoices(dom.cfOpts, K.shuffle(OPTIONS));
        opts.forEach(function (b) { b.dataset.name = b.textContent; });
        return Flow.anim(optsIn(opts));
      })

      /* ---- the press. The box answers every try: red with the why for a
         wrong one -- those verdicts are waits the chain never awaits, so
         they go through quiet() -- and the right answer's verdict is the
         scene's own beat, said in green once the gate has fired. ---------- */
      .then(function () {
        return armChoices({
          answer: ANSWER,
          onWrong: function (name) {
            K.quiet(verdict(LINES.wrong[name], 'confused', 'is-bad'));
          }
        });
      })
      .then(function () { return verdict(LINES.right, 'happy', 'is-ok'); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- Next -- and only its PRESS sends the bird away ------------------
         handOver waits on the button, so everything after this line is
         after the learner has pressed it: the box shuts, the pills and the
         circle fade, and the bird drops back behind the board, all at
         once. */
      .then(function () { return K.handOver(dom.nextBtn); })
      .then(function () {
        saying++;                     /* no verdict owns the box any more */
        return Promise.all([
          Flow.anim(Beats.bubbleOut(dom.cfBubble)),
          Flow.anim(optsOut(opts)),
          K.mascotJumpOut(),
          Flow.anim(Beats.clearFigure([dom.cf]))
        ]);
      })

      /* ---- and the section closes -------------------------------------------
         Everything handed back to its built state, and the header opens
         again over a clean board, which is where whatever comes next
         begins. */
      .then(function () {
        restorePane();
        dom.cf.setAttribute('hidden', '');
        K.clearInline([dom.cf].concat(
          Array.prototype.slice.call(dom.cf.querySelectorAll('*'))));
        return Flow.anim(K.collapseHeader(false));
      });
  }

  /* ======================================================================
   * The hooks the board's housekeeping calls -- see addSection in pages.js
   * ====================================================================== */

  /* What this section has on the figure: the one group, faded as a whole. */
  function parts() { return [dom.cf]; }

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
    restorePane();
  }

  /* The board as the scene expects to find it, written straight in. The
     one scene opens on a wiped board -- its own first beat is the wipe --
     so there is nothing to stage. */
  function stage() {}

  Pages.addSection({
    name: 'Circumference formula',
    scenes: [
      { name: 'Circumference formula', play: sceneFormula }
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
