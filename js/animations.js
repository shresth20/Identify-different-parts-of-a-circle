/* ==========================================================================
 * animations.js -- the beats this lesson is built out of, and its sound
 * --------------------------------------------------------------------------
 * Everything here returns a GSAP animation made through motion.js, so every
 * one of them is tracked: Skip lands them all on their last frame, and a
 * Replay kills them and hands back whatever they had written inline. Nothing
 * in this file decides WHEN it happens -- that is pages.js.
 *
 * Load order: js/motion.js -> js/flow.js -> js/animations.js
 * ========================================================================== */
(function (global) {
  'use strict';

  var M = global.Motion;

  /* ======================================================================
   * Sound
   * motion.js owns the mute flag and the "same cue twice is one cue" gate;
   * this is just the few lines that actually make a noise.
   * ====================================================================== */
  var CLIPS = {
    click:   'assets/audio/button-click.ogg',
    correct: 'assets/audio/correct-answer.ogg',
    wrong:   'assets/audio/incorrect-answer.ogg',
    cheer:   'assets/audio/confetti-sound.ogg'
  };
  var pool = Object.create(null);

  function sfx(key) {
    var src = CLIPS[key];
    if (!src || !M || !M.mayPlay(key)) return;
    var a = pool[key];
    if (!a) {
      a = pool[key] = new Audio(src);
      a.preload = 'auto';
    }
    try {
      a.currentTime = 0;
      /* Before the first gesture the browser refuses to play, and says so by
         rejecting. That is expected, not a fault. */
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) { /* no audio device; the lesson is not about the sound */ }
  }

  /* ======================================================================
   * The board
   * ====================================================================== */

  /* The board arriving. .show is the RESTING state -- opacity 1 in CSS -- so
     the board ends up visible even if the tween below never runs, which is
     the whole reason the entrance is a tween and not a keyframe.
       It grows from slightly small and slightly low, which is also what hides
     the mascot: the hero slot sits under the board on the --z ladder, so the
     board does not so much cover the bird as close over it. */
  function boardIn(board) {
    board.classList.add('is-animating');
    board.classList.add('show');
    board.setAttribute('aria-hidden', 'false');

    var tl = M.timeline({
      willChange: board, willChangeValue: 'transform, opacity',
      revert: function () {
        M.set(board, { clearProps: 'opacity,transform' });
        board.classList.remove('is-animating');
      }
    });
    tl.fromTo(board,
      { opacity: 0, scale: 0.965, y: 14 },
      { opacity: 1, scale: 1, y: 0, duration: M.dur(0.62), ease: 'power3.out' });
    return tl;
  }

  /* ======================================================================
   * The figure
   * ====================================================================== */

  /* The outline, drawn. The rim is rotated a quarter turn back in CSS, so the
     stroke unrolls from twelve o'clock and runs clockwise -- the way a hand
     draws one, rather than from three o'clock where an SVG circle's path
     happens to start.
       The duration is stated rather than left to motion.js's drawTime(),
     which caps at REVEAL: this is the one stroke in the scene the learner is
     meant to watch being made, so it is allowed to take its time. */
  function drawRim(rim) {
    return M.drawPath(rim, { duration: 1.05, ease: 'power1.inOut' });
  }

  /* And then the colour goes in. Slightly delayed off the rim so the two
     read as two acts -- outline, then fill -- rather than one. It grows from
     just inside the rim, so the colour looks like it is being poured into a
     shape that was already there. */
  function fillDisc(disc) {
    var tl = M.timeline({ willChange: disc, willChangeValue: 'transform, opacity' });
    tl.fromTo(disc,
      { opacity: 0, scale: 0.86 },
      { opacity: 1, scale: 1, duration: M.dur(0.55), ease: 'power2.out' });
    return tl;
  }

  /* The centre, marked. plotPoint pops the dot in; the halo then takes over
     with its own CSS loop, which is where .is-calling comes in -- a loop that
     has to run for an unknown length of time belongs in CSS, not in a tween
     something would have to remember to kill. */
  function plantCentre(group, dot) {
    group.removeAttribute('hidden');
    var tl = M.plotPoint(dot, null, { duration: 0.34 });
    tl.add(function () { group.classList.add('is-calling'); });
    return tl;
  }

  /* Tapped, and named. The halo settles out of its loop (CSS again, on
     .is-found) and the dot takes one pulse -- once, not a heartbeat: a thing
     that pulses twice reads as a warning rather than as "yes, that one". */
  function confirmCentre(group, dot) {
    group.classList.remove('is-calling');
    group.classList.add('is-found');
    sfx('correct');
    return M.correct(dot);
  }

  /* ======================================================================
   * The mascot's entrances
   * ====================================================================== */

  /* Up out of the board's surface and onto the header.
     The slot clips its own contents while .is-clipped is set, and the slot's
     bottom edge IS the line between the header band and the stage below it --
     so the bird starts fully below that line, invisible, and rises through
     it. The clip comes off only once it has landed, when there is nothing
     left outside the slot for it to have hidden. */
  function riseIntoHeader(mascot, slot) {
    slot.classList.add('is-clipped');
    mascot.placeIn(slot);
    /* Stated in full rather than as a bare yPercent: the bird has been
       through a Flip on its way here, and GSAP would add this offset to
       whatever that left behind rather than replacing it. */
    M.set(mascot.el, { x: 0, y: 0, scale: 1, rotation: 0, yPercent: 112 });

    var tl = M.timeline({
      willChange: mascot.el,
      revert: function () { slot.classList.remove('is-clipped'); }
    });
    tl.to(mascot.el, { yPercent: 0, duration: M.dur(0.55), ease: 'power3.out' })
      .add(function () { slot.classList.remove('is-clipped'); })
      /* A small settle once it is clear of the clip: the bird lands, rather
         than stopping. */
      .to(mascot.el, { scale: 1.04, duration: M.dur(0.12), ease: 'power2.out' })
      .to(mascot.el, { scale: 1, duration: M.dur(0.18), ease: 'power2.inOut' });
    return tl;
  }

  /* And back down the way it came. */
  function sinkFromHeader(mascot, slot) {
    var tl = M.timeline({
      willChange: mascot.el,
      revert: function () { slot.classList.remove('is-clipped'); }
    });
    tl.add(function () { slot.classList.add('is-clipped'); })
      .to(mascot.el, { yPercent: 112, duration: M.dur(0.42), ease: 'power2.in' });
    return tl;
  }

  /* ======================================================================
   * Text boxes and controls
   * ====================================================================== */

  /* Armed: on the page, laid out, measurable -- and invisible. This is the
     step that lets the first line be typed into a bubble that is the right
     size from the first frame. A box at display:none measures as zero, so a
     line laid out into a hidden bubble reserves nothing, and the bubble would
     have to resize around the words a beat after opening. */
  function bubbleArm(bubble) {
    bubble.removeAttribute('hidden');
    M.set(bubble, { opacity: 0, scale: 0.82, transformOrigin: '20% 100%' });
  }

  /* And opening. Scaled from its own tail rather than its centre, so it
     unfolds from the bird's beak instead of inflating. */
  function bubbleIn(bubble) {
    var tl = M.timeline({ willChange: bubble, willChangeValue: 'transform, opacity' });
    tl.to(bubble, {
      opacity: 1, scale: 1, transformOrigin: '20% 100%',
      duration: M.dur(0.34), ease: 'back.out(1.4)'
    });
    return tl;
  }
  function bubbleOut(bubble) {
    var tl = M.timeline({
      willChange: bubble, willChangeValue: 'transform, opacity',
      revert: function () {
        bubble.setAttribute('hidden', '');
        M.set(bubble, { clearProps: 'opacity,transform' });
      }
    });
    tl.to(bubble, {
      opacity: 0, scale: 0.9, transformOrigin: '20% 100%',
      duration: M.dur(0.24), ease: 'power2.in'
    });
    return tl;
  }

  /* A line in the board header, taken away. The words leave together rather
     than one at a time: reading is finished by now, and un-typing a sentence
     word by word would ask the eye to follow something it has already read.
     The caller empties the box afterwards -- see clearPrompt in pages.js. */
  function lineOut(line) {
    var tl = M.timeline({ willChange: line, willChangeValue: 'transform, opacity' });
    tl.to(line, {
      opacity: 0, y: -8, filter: 'blur(3px)',
      duration: M.dur(0.28), ease: 'power2.in'
    });
    return tl;
  }

  /* A control arriving in its corner, and leaving it. The transform is
     cleared on the way out so the stylesheet's own `translate: 0 var(--sink)`
     -- which is how the 3D press works -- is never outranked by a leftover
     inline value. */
  function controlIn(btn) {
    btn.removeAttribute('hidden');
    var tl = M.timeline({ willChange: btn, willChangeValue: 'transform, opacity' });
    tl.fromTo(btn,
      { opacity: 0, scale: 0.7, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: M.dur(0.38), ease: 'back.out(1.6)' });
    return tl;
  }
  function controlOut(btn) {
    var tl = M.timeline({
      willChange: btn, willChangeValue: 'transform, opacity',
      revert: function () {
        btn.setAttribute('hidden', '');
        /* Back to the stylesheet's own opacity: 0 and its own `translate`,
           which is what the 3D press writes to. An inline transform left
           here would outrank that rule from then on. */
        M.set(btn, { clearProps: 'transform,opacity' });
      }
    });
    tl.to(btn, { opacity: 0, scale: 0.8, duration: M.dur(0.2), ease: 'power2.in' });
    return tl;
  }

  /* The welcome screen standing aside. The title and the button leave, the
     backdrop goes with them, and the node is taken out of the tree so nothing
     on it can take a click through the lesson. */
  function welcomeOut(welcome, title, start) {
    var tl = M.timeline({
      willChange: [title, start], willChangeValue: 'transform, opacity',
      revert: function () { welcome.setAttribute('hidden', ''); }
    });
    start.classList.remove('in');           /* stop the pulse before it moves */
    tl.to([title, start], {
      opacity: 0, y: -14, scale: 0.94,
      duration: M.dur(0.3), ease: 'power2.in', stagger: M.gap(0.05)
    }, 0);
    tl.to(welcome, { opacity: 0, duration: M.dur(0.34), ease: 'power2.in' }, 0.08);
    return tl;
  }

  global.Beats = {
    sfx: sfx,
    boardIn: boardIn,
    drawRim: drawRim,
    fillDisc: fillDisc,
    plantCentre: plantCentre,
    confirmCentre: confirmCentre,
    riseIntoHeader: riseIntoHeader,
    sinkFromHeader: sinkFromHeader,
    bubbleArm: bubbleArm,
    bubbleIn: bubbleIn,
    bubbleOut: bubbleOut,
    lineOut: lineOut,
    controlIn: controlIn,
    controlOut: controlOut,
    welcomeOut: welcomeOut
  };
})(window);
