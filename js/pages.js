/* ==========================================================================
 * pages.js -- the lesson, beat by beat
 * --------------------------------------------------------------------------
 * One scene is one `await` chain. Everything it waits on -- a stretch of
 * time, an animation, a tap -- is taken out through Flow, so the whole chain
 * unwinds in one go if the scene is replayed, and collapses to a few frames
 * if Skip is pressed. Nothing in here sets a timeout of its own.
 *
 * Load order: motion.js -> flow.js -> typer.js -> mascot.js -> animations.js
 *             -> pages.js
 * ========================================================================== */
(function (global) {
  'use strict';

  var M = global.Motion;
  var Flow = global.Flow;
  var Beats = global.Beats;

  /* ---- the script -------------------------------------------------------
     Every word the learner reads, in one place. */
  var LINES = {
    title:   'Identify Different Parts of a Circle',
    hello:   'Hey there!',
    warmup:  'Let’s do a quick warm-up!',
    isCircle: 'This is a circle.',
    letsGo:  'Let’s identify different parts of the circle.',
    tapDot:  'Tap the dot!',
    centre:  'This is the center of the circle.'
  };

  /* ---- pacing -----------------------------------------------------------
     The two kinds of pause in the lesson. A BEAT is the gap between one line
     and the next -- long enough to finish reading, short enough not to feel
     like a hang. A HOLD is a deliberate stop the script asks for. */
  var BEAT  = 560;
  var SHORT = 280;
  var HOLD_MASCOT = 3000;    /* "the mascot will remove after 3 sec" */

  var dom = null;
  var mascot = null;
  var sayTitle, sayBubble, sayPrompt;

  function $(id) { return document.getElementById(id); }

  function collect() {
    return {
      welcome:  $('welcome'),
      title:    document.querySelector('.welcome__title'),
      startBtn: $('startBtn'),
      slotWelcome: $('slotWelcome'),

      frame:    $('frame'),
      slotHero: $('slotHero'),
      bubble:   $('bubble'),

      board:    $('board'),
      slotHeader: $('slotHeader'),
      promptLine: document.querySelector('.prompt__line'),

      rim:      $('rim'),
      disc:     $('disc'),
      centre:   $('centre'),
      dot:      document.querySelector('.centre__dot'),
      centreHit: $('centreHit'),

      nextBtn:  $('nextBtn')
    };
  }

  /* ---- controls ---------------------------------------------------------
     Next is the one control that both appears and is waited on, so the
     appearing, the waiting and the leaving are one function: a beat that
     hands over to the learner and takes the control away behind them. */
  function handOver(btn) {
    M.button3d(btn, { edge: 5 });
    Beats.controlIn(btn);
    return Flow.once(btn).then(function () {
      Beats.sfx('click');
      return Flow.anim(Beats.controlOut(btn));
    });
  }

  /* A line in the board header, said and then taken away again. Clearing
     BOTH halves of the box matters: a ghost left behind holds a stale width,
     which is the one way this text effect can still shift a layout. */
  function clearPrompt() {
    sayPrompt.clear();
    M.set(dom.promptLine, { clearProps: 'opacity,transform,filter' });
  }

  /* Say a line in the header, and carry the bird to where the new line
     leaves room for it.
       The prompt row is centred as a pair, so the bird's resting place is a
     function of how long the line beside it is -- and the ghost takes the
     whole line's width in a single frame, before one word of it is visible.
     Left alone that is a hard sideways jump of the bird on every line.
       So: note where the bird is, let the line lay itself out, note where the
     bird has ended up, and put it back where it was with a transform that
     then eases to nothing. The bird steps aside to make room instead of
     teleporting, and because it is a transform on the SLOT, the sprite
     player's own inline styles on the bird inside it are never touched.
       The line itself is not worth carrying: every word in it is still at
     opacity 0 while this happens, so its jump is invisible. */
  function sayInHeader(text) {
    var slot = dom.slotHeader;
    var before = slot.getBoundingClientRect().left;
    var reveal = sayPrompt.reserve(text);      /* the row takes its width now */
    var shift = before - slot.getBoundingClientRect().left;

    if (Math.abs(shift) > 0.5) {
      M.set(slot, { x: shift });
      M.to(slot, { x: 0, duration: M.dur(0.42), ease: 'power2.inOut' });
    }
    return reveal();
  }

  /* The bird arrives to a line that is already laid out but not yet said.
     Reserving the width BEFORE the jump is what lets it land on its mark:
     the row is centred as a pair, so a bird that jumped in while the row was
     still empty would land in the middle of the header and then be shoved
     sideways the moment the words took their space. */
  function arriveSaying(text) {
    var reveal = sayPrompt.reserve(text);
    return Flow.anim(Beats.riseIntoHeader(mascot, dom.slotHeader))
      .then(function () {
        mascot.state('talking');
        return reveal();
      });
  }

  /* ======================================================================
   * The lesson
   * ====================================================================== */
  function play() {
    /* Armed at the moment the dot becomes tappable, awaited several beats
       later -- see step 5. */
    var tapped = null;

    /* ---- 0. Welcome ----------------------------------------------------
       The bird is waving before a word is on screen, so the first thing that
       moves is the character rather than the interface. */
    mascot.placeIn(dom.slotWelcome);
    mascot.state('waving');

    return Flow.wait(SHORT)
      .then(function () { return sayTitle(LINES.title); })
      .then(function () {
        dom.startBtn.removeAttribute('hidden');
        /* One frame between display:none coming off and the class going on,
           or the browser has nothing to transition from. */
        return Flow.frame();
      })
      .then(function () {
        dom.startBtn.classList.add('in');
        M.button3d(dom.startBtn, { edge: 5 });
        return Flow.once(dom.startBtn);
      })
      .then(function () {
        Beats.sfx('click');

        /* ---- 1. "Hey there!" ------------------------------------------
           The welcome stands aside and the bird walks to its mark on the
           field in the same beat -- a step from where it was already
           standing, not a flight. Re-parent FIRST so Flip measures the move
           against a welcome screen that is still on screen; the fade then
           happens around a bird that is already travelling. */
        var walk = mascot.moveTo(dom.slotHero, {
          vars: { duration: 0.62, ease: 'power2.inOut' }
        });
        mascot.settle();                       /* wave_stop, then the idle */
        Beats.welcomeOut(dom.welcome, dom.title, dom.startBtn);
        return Flow.anim(walk);
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        mascot.state('talking');

        /* Ghost before live, and before the bubble is shown: the bubble has
           to be laid out and measurable when the line goes into it, or it
           would open at the wrong size and resize a beat later. */
        Beats.bubbleArm(dom.bubble);
        var said = sayBubble(LINES.hello);
        Beats.bubbleIn(dom.bubble);
        return said;
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        /* The second line is longer than the first, so the bubble changes
           shape. sayBubble was built with the bubble as its box, so Flip
           eases the box between the two sizes while the words -- already
           laid out, still invisible -- wait inside it. */
        return sayBubble(LINES.warmup);
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(SHORT);
      })
      .then(function () { return handOver(dom.nextBtn); })

      /* ---- 2. The board --------------------------------------------------
         The bubble goes first, then the board grows in over the bird. It does
         not need to be told to hide: the hero slot sits UNDER the board on
         the --z ladder, so the board closing over it is the exit. */
      .then(function () { return Flow.anim(Beats.bubbleOut(dom.bubble)); })
      .then(function () {
        sayBubble.clear();
        return Flow.anim(Beats.boardIn(dom.board));
      })

      /* ---- 3. The circle -------------------------------------------------
         Outline first, colour second, with a pause between them: two acts,
         not one. */
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.drawRim(dom.rim)); })
      .then(function () { return Flow.wait(180); })
      .then(function () { return Flow.anim(Beats.fillDisc(dom.disc)); })

      /* ---- 4. "This is a circle." ---------------------------------------- */
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return arriveSaying(LINES.isCircle); })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return sayInHeader(LINES.letsGo); })
      .then(function () {
        mascot.settle();
        /* The script's own hold: the line stays up to be read, and then the
           bird and the words leave together. */
        return Flow.wait(HOLD_MASCOT);
      })
      .then(function () {
        Beats.sinkFromHeader(mascot, dom.slotHeader);
        return Flow.anim(Beats.lineOut(dom.promptLine));
      })
      .then(clearPrompt)

      /* ---- 5. The centre, marked ----------------------------------------- */
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plantCentre(dom.centre, dom.dot)); })
      .then(function () {
        /* Listen from the instant the dot is planted and glowing, which is
           the instant it starts LOOKING tappable -- a good second before the
           bird gets back to the header to ask for it. Arming only after the
           line would swallow the tap of anyone who did not wait to be told,
           and they would have to tap again for no reason they could see. */
        tapped = Flow.once(dom.centreHit);
        return Flow.wait(BEAT);
      })
      .then(function () { return arriveSaying(LINES.tapDot); })
      .then(function () { mascot.settle(); })

      /* ---- 6. Tapped ------------------------------------------------------ */
      .then(function () { return tapped; })
      .then(function (ev) {
        /* The ripple goes where the finger landed. A keyboard activation has
           no coordinates, so it gets the dot's own centre instead. */
        var r = dom.centreHit.getBoundingClientRect();
        var x = (ev && ev.clientX) || (r.left + r.width / 2);
        var y = (ev && ev.clientY) || (r.top + r.height / 2);
        M.tapRipple(x, y);

        Beats.confirmCentre(dom.centre, dom.dot);
        mascot.state('happy');
        return Flow.anim(Beats.lineOut(dom.promptLine));
      })
      .then(function () {
        /* Undo what lineOut wrote, but do NOT clear the box first: an empty
           box would re-centre the bird and the next line would push it back
           out again, two shifts where the learner should see one. The typer
           replaces the line in place. */
        M.set(dom.promptLine, { clearProps: 'opacity,transform,filter' });
        return sayInHeader(LINES.centre);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { mascot.settle(); });
  }

  /* ======================================================================
   * Setting up and starting over
   * ====================================================================== */

  /* Back to the first frame of the lesson. Everything the last run left
     behind is undone here rather than at the end of the run, because a run
     that was replayed half way through never reached its end. */
  function rewind() {
    if (sayTitle)  sayTitle.clear();
    if (sayBubble) sayBubble.clear();
    if (sayPrompt) sayPrompt.clear();

    dom.welcome.removeAttribute('hidden');
    dom.startBtn.setAttribute('hidden', '');
    dom.startBtn.classList.remove('in');
    dom.nextBtn.setAttribute('hidden', '');
    dom.bubble.setAttribute('hidden', '');

    dom.board.classList.remove('show', 'is-animating');
    dom.board.setAttribute('aria-hidden', 'true');
    dom.centre.setAttribute('hidden', '');
    dom.centre.classList.remove('is-calling', 'is-found');

    /* Named rather than 'all': the mascot's background-image and
       background-size are written straight to its style by the sprite
       player, not by GSAP, and a blanket clear is a tempting way to wipe
       them out one refactor from now. */
    M.set([dom.welcome, dom.title, dom.startBtn, dom.nextBtn, dom.bubble,
           dom.board, dom.promptLine, dom.slotHeader, dom.rim, dom.disc,
           dom.dot, mascot.el],
          { clearProps: 'opacity,transform,filter' });
    /* And the dash pattern, in case the replay caught the rim mid-stroke:
       motion.js hands it back when it kills the draw, but a run that reached
       the end has already had it handed back, so this is the one that
       matters for a rim left solid. */
    dom.rim.style.strokeDasharray = '';
    dom.rim.style.strokeDashoffset = '';
  }

  function init() {
    dom = collect();

    mascot = global.Mascot.create({ slot: dom.slotWelcome });

    sayTitle  = global.Typer.create($('titleType'));
    sayBubble = global.Typer.create($('bubbleType'), { box: dom.bubble });
    sayPrompt = global.Typer.create($('promptType'));

    return { dom: dom, mascot: mascot };
  }

  function run() {
    if (!dom) init();
    /* Retire the previous run BEFORE cleaning up after it. Each tracked
       animation hands back whatever it had written inline as it is killed,
       so cleaning first would just have those writes land on top of it. */
    Flow.reset();
    rewind();
    return Flow.run(play);
  }

  global.Pages = {
    LINES: LINES,
    init: init,
    run: run,
    rewind: rewind,
    mascot: function () { return mascot; },
    dom: function () { return dom; }
  };
})(window);
