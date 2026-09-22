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

  /* ---- the pop a mark makes as it lands -------------------------------
     Thirty-two dots arrive in under two seconds, and the run of them IS the
     cadence -- so this one cue keeps its own spacing rather than motion.js's
     100ms gate, which exists to stop the same cue firing twice for one event
     and would swallow most of a deliberate run.
       It is the click clip at a third of its volume and a touch off its own
     pitch each time, played round-robin through four voices: one <audio>
     restarted thirty-two times clips its own tail, and thirty-two identical
     clicks read as an interface rather than as beads being laid down.
       Mute is still motion.js's -- that is a setting, not a gate. */
  var POP_GATE = 46;              /* ms: the floor under a run's own pace */
  var POP_VOICES = 4;
  var popPool = [];
  var popAt = 0;
  var popTurn = 0;

  function pop() {
    var now = (global.performance && performance.now()) || Date.now();
    if (M && M.isMuted && M.isMuted()) return;
    if (now - popAt < POP_GATE) return;
    popAt = now;

    if (popPool.length < POP_VOICES) {
      var fresh = new Audio(CLIPS.click);
      fresh.preload = 'auto';
      popPool.push(fresh);
    }
    var a = popPool[popTurn++ % popPool.length];
    try {
      a.volume = 0.3;
      a.playbackRate = 0.94 + Math.random() * 0.2;
      a.currentTime = 0;
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) { /* as above */ }
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

  /* The outline, drawn. The rim's own path starts at twelve o'clock and runs
     clockwise (see index.html), so the stroke unrolls the way a hand draws
     one without any rotation on the element.
       The duration is stated rather than left to motion.js's drawTime(),
     which caps at REVEAL: this is the one stroke in the scene the learner is
     meant to watch being made, so it is allowed to take its time. */
  function drawRim(rim) {
    /* Take the rim off its undrawn resting state (see .figure__rim) before
       the stroke starts, not as part of it: a stroke that fades in while it
       unrolls reads as a smudge rather than as a line being drawn. */
    M.set(rim, { opacity: 1 });
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
  /* `call: false` plants the same dot as a piece of the diagram instead: no
     halo, no invitation, and not tappable. That is level 2, where the centre
     is being SHOWN rather than looked for. */
  function plantCentre(group, dot, opts) {
    var o = opts || {};
    var quiet = o.call === false;
    group.removeAttribute('hidden');
    group.classList.toggle('is-quiet', quiet);
    var tl = M.plotPoint(dot, null, { duration: quiet ? 0.28 : 0.34 });
    if (!quiet) tl.add(function () { group.classList.add('is-calling'); });
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

  /* An arrow and the word it is pointing at. Three strokes of one pen, in the
     order a hand makes them: the shaft is drawn from the label's end in toward
     the thing being named, the head is put on its tip, and only then is the
     word itself set down -- a label that arrives with its arrow is a label the
     eye skips, which is why M.plotPoint holds one back too.
       The head starts while the shaft still has a few frames to run: a pen
     does not stop at the tip and start again, and that overlap is what makes
     the two read as one gesture rather than as two marks.
       One function for every callout in the section. Which arrow, which word
     and what it points at are the caller's. */
  function callout(group, arrow, head, label) {
    group.removeAttribute('hidden');
    M.set([arrow, head], { opacity: 1 });
    M.set(label, { opacity: 0, scale: 0.72, transformOrigin: '0% 60%' });

    var tl = M.timeline({
      willChange: label, willChangeValue: 'transform, opacity',
      revert: function () { undash([arrow, head]); }
    });
    stroke(tl, arrow, 0, 0.46, 'power2.inOut');
    stroke(tl, head, 0.38, 0.16, 'power2.out');
    tl.to(label, {
      opacity: 1, scale: 1,
      duration: M.dur(0.32), ease: 'back.out(1.7)'
    }, M.gap(0.5));
    return tl;
  }

  /* ======================================================================
   * Level 2 -- the split board and the fan
   * ====================================================================== */

  /* The dash trick, written straight into a timeline the caller already owns.
     M.drawPath does the same thing, but it makes -- and tracks -- a timeline
     of its own for it, and thirty-two of those nested inside a thirty-third
     is thirty-three things for Skip and Replay to reach into where one will
     do. So the stroke is inlined here and the owning timeline hands the dash
     pattern back for the lot in one revert (see undash).
       Positions go through M.gap for the same reason durations go through
     M.dur: a skipped scene must collapse the SPACING between the strokes as
     well as the strokes themselves, or the timeline still runs four seconds
     long with nothing moving in it. */
  function stroke(tl, path, at, seconds, ease) {
    var len = 0;
    try { len = path.getTotalLength ? path.getTotalLength() : 0; } catch (e) { len = 0; }
    if (!len) len = 1;
    path.style.strokeDasharray = len + ' ' + len;
    path.style.strokeDashoffset = len;
    tl.to(path, {
      strokeDashoffset: 0,
      duration: M.dur(seconds),
      ease: ease || 'power2.out'
    }, M.gap(at));
  }

  /* A finished stroke is a plain solid one, so the pattern comes off the
     moment the timeline ends -- however it ends. A run killed half way would
     otherwise carry its half-drawn dash into the next scene. */
  function undash(paths) {
    paths.forEach(function (p) {
      p.style.strokeDasharray = '';
      p.style.strokeDashoffset = '';
    });
  }

  /* The points on the rim, laid down one at a time all the way round. Each
     one pops in where it already sits -- POP is a nudge past the mark, not a
     bounce -- and each one ticks as it lands (see pop() above), so the run
     reads as beads being placed rather than as a group fading up.
       The pace is a shade under the pop gate on purpose: the ear hears an
     even run of ticks, and the few the gate swallows on a slow frame are the
     ones it would otherwise have doubled up. */
  var DOT_STEP = 0.058;             /* seconds between one dot and the next */

  function popDots(group, dots) {
    group.removeAttribute('hidden');
    M.set(dots, { opacity: 1 });

    var tl = M.timeline({
      revert: function () { M.set(dots, { clearProps: 'transform' }); }
    });
    dots.forEach(function (d, i) {
      var at = M.gap(i * DOT_STEP);
      tl.fromTo(d,
        { scale: 0, transformOrigin: 'center center' },
        { scale: 1, duration: M.dur(0.26), ease: M.POP }, at);
      tl.call(pop, null, at);
    });
    return tl;
  }

  /* The radii, drawn out of the centre one at a time -- and speeding up.
     The first few are the ones the learner is meant to WATCH being made, so
     they are drawn slowly and spaced well apart; from there the gap between
     one and the next decays by a fixed fraction each time down to a floor, so
     the fan closes in one continuous accelerating sweep rather than in two
     speeds with a seam between them.
       Each line's own draw takes a little longer than the gap in front of it,
     so once the sweep is up to speed there are always two or three lines in
     the air at once -- which is what makes the last quarter read as a single
     movement instead of as a very fast list. */
  var SPOKE_WATCH = 5;              /* the ones drawn at the learner's pace  */
  var SPOKE_GAP = 0.34;             /* and the gap between those             */
  var SPOKE_DECAY = 0.84;           /* each later gap, as a share of the one */
  var SPOKE_GAP_MIN = 0.045;        /* before it -- down to this floor       */

  function drawSpokes(group, lines) {
    group.removeAttribute('hidden');
    M.set(lines, { opacity: 1 });

    var tl = M.timeline({ revert: function () { undash(lines); } });
    var at = 0;
    var gap = SPOKE_GAP;

    lines.forEach(function (p, i) {
      stroke(tl, p, at, Math.min(0.44, Math.max(0.14, gap * 1.25)), 'power1.out');
      if (i >= SPOKE_WATCH - 1) gap = Math.max(SPOKE_GAP_MIN, gap * SPOKE_DECAY);
      at += gap;
    });
    return tl;
  }

  /* ======================================================================
   * Level 3 -- the radius
   * ====================================================================== */

  /* The point on the rim the radius will reach. It goes down FIRST, before
     the line that joins it to the centre: a radius is "the centre, and a
     point on the circle, and the distance between them", and the beat reads
     in that order or it reads as a line that happens to stop somewhere. */
  function plotRimPoint(group, dot) {
    group.removeAttribute('hidden');
    M.set(dot, { opacity: 1 });
    return M.plotPoint(dot, null, { duration: 0.3 });
  }

  /* And the segment, grown out of the centre toward it. The stroke starts at
     the centre because the path does (see #radiusLine), so it reaches the
     point rather than arriving from it -- which is the direction the sentence
     that follows will describe.
       When it lands, .is-calling takes over: the highlight starts running out
     along the line and the hit path underneath comes alive (see style.css and
     animations.css). Both are CSS, because neither has an end. */
  function growRadius(group, line) {
    group.removeAttribute('hidden');
    M.set(line, { opacity: 1 });
    var tl = M.timeline({ revert: function () { undash([line]); } });
    stroke(tl, line, 0, 0.52, 'power2.out');
    tl.add(function () { group.classList.add('is-calling'); });
    return tl;
  }

  /* Tapped, and named. The highlight stops -- .is-calling comes off, which
     takes the running dash and the glow with it -- the segment gives one
     pulse, and the word is set on it as the pulse settles.
       One pulse, not a heartbeat: a thing that pulses twice reads as a
     warning rather than as "yes, that one". The weight is handed back when
     the timeline ends, so the stylesheet's own 7 is never outranked by an
     inline value a killed run left behind. */
  function confirmRadius(group, line, label) {
    group.classList.remove('is-calling');
    group.classList.add('is-found');
    sfx('correct');

    M.set(label, { opacity: 0, scale: 0.7, transformOrigin: 'center center' });
    var tl = M.timeline({
      willChange: label, willChangeValue: 'transform, opacity',
      revert: function () { M.set(line, { clearProps: 'strokeWidth' }); }
    });
    tl.to(line, { strokeWidth: 10.5, duration: M.dur(0.16), ease: 'power2.out' }, 0)
      .to(line, { strokeWidth: 7, duration: M.dur(0.3), ease: 'power2.inOut' }, M.gap(0.16))
      .to(label, {
        opacity: 1, scale: 1,
        duration: M.dur(0.34), ease: 'back.out(1.7)'
      }, M.gap(0.2));
    return tl;
  }

  /* The rest of the radii. Every one of them is the same mark as the one the
     learner tapped -- same ink, same weight, same length -- because that is
     the whole of what the beat says. Each is drawn out of the centre and then
     lands its point, in one order round the circle, so the fan sweeps rather
     than fills in.
       The word on the first one goes first: it named that one segment, and it
     would read as naming the group. */
  var RAY_STEP = 0.34;

  function fanRadii(group, lines, ends, label) {
    group.removeAttribute('hidden');
    M.set(lines.concat(ends), { opacity: 1 });

    var tl = M.timeline({ revert: function () { undash(lines); } });
    if (label) {
      tl.to(label, { opacity: 0, duration: M.dur(0.3), ease: 'power2.in' }, 0);
    }

    var at = 0.26;
    lines.forEach(function (line, i) {
      stroke(tl, line, at, 0.36, 'power2.out');
      tl.fromTo(ends[i],
        { scale: 0, transformOrigin: 'center center' },
        { scale: 1, duration: M.dur(0.22), ease: M.POP }, M.gap(at + 0.28));
      tl.call(pop, null, M.gap(at + 0.28));
      at += RAY_STEP;
    });
    return tl;
  }

  /* ======================================================================
   * Level 4 -- the diameter
   * ====================================================================== */

  /* The two ends arrive, and the demonstration starts. .is-guiding is what
     runs the ghost line and the halos under the ends, and it is also what
     makes the ends draggable (see .handle__hit) -- one class, so a dead end
     can never look grabbable and a live one can never look inert. */
  function guideChord(group, handles) {
    group.removeAttribute('hidden');
    group.classList.remove('is-drawn', 'is-drawing');

    var tl = M.timeline({
      willChange: handles, willChangeValue: 'transform, opacity'
    });
    tl.fromTo(handles,
      { opacity: 0, scale: 0, transformOrigin: 'center center' },
      { opacity: 1, scale: 1, duration: M.dur(0.36), ease: M.POP,
        stagger: M.gap(0.14) });
    tl.add(function () { group.classList.add('is-guiding'); });
    return tl;
  }

  /* Drawn. The rubber line and the demonstration both stop, and the real one
     is laid down over the path the learner just took -- left half then right,
     which is one continuous sweep across the circle rather than two strokes,
     and the same direction they were shown. */
  function settleChord(group, halves) {
    group.classList.remove('is-guiding', 'is-drawing');
    group.classList.add('is-drawn');
    sfx('correct');

    M.set(halves, { opacity: 1 });
    var tl = M.timeline({ revert: function () { undash(halves); } });
    stroke(tl, halves[0], 0, 0.32, 'power2.out');
    stroke(tl, halves[1], 0.28, 0.32, 'power2.out');
    return tl;
  }

  /* The scaffolding goes. Every point on the rim except the two the line runs
     between -- those two are the line's own ends and stay. They leave close
     together rather than one at a time: this is clearing up after a step, not
     a step of its own. */
  function clearDots(group, dots) {
    var tl = M.timeline({
      willChange: dots, willChangeValue: 'transform, opacity',
      revert: function () {
        group.setAttribute('hidden', '');
        M.set(dots, { clearProps: 'opacity,transform' });
      }
    });
    tl.to(dots, {
      opacity: 0, scale: 0.4, transformOrigin: 'center center',
      duration: M.dur(0.32), ease: 'power2.in', stagger: M.gap(0.012)
    });
    return tl;
  }

  /* The last beat of the section, and the one that has to be taught rather
     than shown: a diameter is two radii laid end to end.
       It is one timeline with its beats written at stated seconds, because it
     is running underneath a sentence and each beat has to land on its own
     clause. The sentence is "Diameter is a line segment | through the centre |
     with both ends on the circle. | It is twice the radius." -- so the centre
     is picked out first, then the two ends, and only then do the halves turn
     into the radii they have been all along.
       The two names then slide in to meet at the middle as they fade, and the
     whole line's name is set down where they meet. That is the sentence's
     last clause made into a movement: two of these, put together, is one of
     that. */
  function halveDiameter(o) {
    var halves = [o.left, o.right];
    var names = [o.rLeft, o.rRight];

    M.set(names.concat(o.name), { opacity: 0 });
    M.set(names, { scale: 0.7, transformOrigin: 'center center' });
    M.set(o.name, { scale: 0.7, transformOrigin: 'center center' });

    var tl = M.timeline({
      revert: function () {
        halves.forEach(function (h) { h.classList.remove('is-radius'); });
      }
    });

    /* "through the centre" */
    tl.to(o.centre, {
      scale: 1.6, transformOrigin: 'center center',
      duration: M.dur(0.26), ease: 'power2.out'
    }, M.gap(1.5))
      .to(o.centre, { scale: 1, duration: M.dur(0.34), ease: 'power2.inOut' },
          M.gap(1.76));

    /* "with both ends on the circle" */
    tl.to(o.ends, {
      scale: 1.55, transformOrigin: 'center center',
      duration: M.dur(0.26), ease: 'power2.out', stagger: M.gap(0.12)
    }, M.gap(3.1))
      .to(o.ends, {
        scale: 1, duration: M.dur(0.34), ease: 'power2.inOut',
        stagger: M.gap(0.12)
      }, M.gap(3.36));

    /* "It is twice the radius" -- the halves become what they are, one after
       the other rather than together, so the eye is given each of them. */
    tl.call(function () { o.left.classList.add('is-radius'); }, null, M.gap(4.3));
    tl.to(o.rLeft, {
      opacity: 1, scale: 1, duration: M.dur(0.34), ease: 'back.out(1.7)'
    }, M.gap(4.42));

    tl.call(function () { o.right.classList.add('is-radius'); }, null, M.gap(4.74));
    tl.to(o.rRight, {
      opacity: 1, scale: 1, duration: M.dur(0.34), ease: 'back.out(1.7)'
    }, M.gap(4.86));

    /* And the two make one. */
    var MEET = 6.3;
    tl.call(function () {
      halves.forEach(function (h) { h.classList.remove('is-radius'); });
    }, null, M.gap(MEET));
    tl.to(o.rLeft, {
      x: o.meet, opacity: 0, duration: M.dur(0.44), ease: 'power2.inOut'
    }, M.gap(MEET));
    tl.to(o.rRight, {
      x: -o.meet, opacity: 0, duration: M.dur(0.44), ease: 'power2.inOut'
    }, M.gap(MEET));
    tl.to(o.name, {
      opacity: 1, scale: 1, duration: M.dur(0.4), ease: 'back.out(1.7)'
    }, M.gap(MEET + 0.3));

    return tl;
  }

  /* The board, split down the middle. The figure is letterboxed into the
     stage by its own viewBox, so the circle sits in the middle of the stage's
     width; a quarter of that width to the left puts it in the middle of the
     left half, and the bird's mark (see .slot--side) is the middle of the
     right one. Stated as a share of the element rather than in pixels, so it
     holds at every board size. */
  function splitStage(figure) {
    var tl = M.timeline({ willChange: figure, willChangeValue: 'transform' });
    tl.to(figure, { xPercent: -25, duration: M.dur(0.78), ease: 'power2.inOut' });
    return tl;
  }

  /* Everything on the figure, taken off it together. One fade rather than a
     reversal of each beat that put them there: this is the end of a level,
     not an undo, and it should read as the board being wiped.
     The caller puts the parts back to their resting states afterwards -- see
     resetFigure in pages.js. */
  function clearFigure(parts) {
    var tl = M.timeline({ willChange: parts, willChangeValue: 'opacity' });
    tl.to(parts, {
      opacity: 0, duration: M.dur(0.36), ease: 'power2.in', stagger: M.gap(0.04)
    });
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
  /* The origin is the tail, so the bubble grows out of the bird's head
     rather than out of its own middle.
       Measured rather than written down: the stylesheet places the tail at
     --bub-tail-x plus half of --bub-tail-w, both of which are fractions of
     the box's own type size -- and that type size is a clamp, so it is a
     different number of pixels on every screen. Reading the box's font-size
     back gives the same point the stylesheet drew the tail at, whatever the
     clamp settled on. A percentage would do instead, but it would drift with
     the length of the line, which is the one thing about this box that
     changes while it is open. */
  var TAIL_X = 0.78 + 0.76 / 2;        /* in em, from .bubble in style.css */

  /* The mirrored bubble hangs its tail off its RIGHT edge (see .bubble--side),
     so the same offset is measured back from the box's own width. Read live
     rather than written down: the box is only ever as wide as the line inside
     it. */
  function tailOrigin(bubble) {
    var em = parseFloat(getComputedStyle(bubble).fontSize) || 16;
    var x = em * TAIL_X;
    if (bubble.classList.contains('bubble--side')) {
      x = (bubble.getBoundingClientRect().width || x * 2) - x;
    }
    return x + 'px 100%';
  }

  function bubbleArm(bubble) {
    bubble.removeAttribute('hidden');
    M.set(bubble, { opacity: 0, scale: 0.78, transformOrigin: tailOrigin(bubble) });
  }

  /* And opening. Scaled from its own tail rather than its centre, so it
     unfolds from the bird's beak instead of inflating. */
  function bubbleIn(bubble) {
    var tl = M.timeline({ willChange: bubble, willChangeValue: 'transform, opacity' });
    tl.to(bubble, {
      opacity: 1, scale: 1, transformOrigin: tailOrigin(bubble),
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
      opacity: 0, scale: 0.9, transformOrigin: tailOrigin(bubble),
      duration: M.dur(0.24), ease: 'power2.in'
    });
    return tl;
  }

  /* ======================================================================
   * The mascot's jump
   * ----------------------------------------------------------------------
   * The bird arrives at the board header by springing up from behind the
   * board and dropping onto its spot, and leaves the same way in reverse.
   * Neither jump is one animation, because neither is one ELEMENT: each arc
   * is split at its apex between the in-board sprite and the hopper standing
   * in for it behind the board (see .hopper in style.css). What follows is
   * the four halves. Which element is handed which half, where the apex is,
   * and when the swap happens are pages.js's -- see mascotJumpIn there.
   *
   * None of the four hands its transform back when it ends. That is the
   * point of them: each one is holding the bird at the swap point, and the
   * element taking over is measured from where the last one actually left
   * it. pages.js clears the transforms once the bird is home or gone.
   * ====================================================================== */

  /* Out from behind the board's top edge, up to the apex. Slower than the
     drop that follows it: a jump loses speed on the way up. */
  function hopUp(hopper, y) {
    var tl = M.timeline({ willChange: hopper, willChangeValue: 'transform' });
    tl.to(hopper, { y: y, duration: M.dur(0.38), ease: 'power2.out' });
    return tl;
  }

  /* And back down behind it. Quicker than the rise it mirrors, for the same
     reason the rise is the slower of the two: a jump falls faster than it
     climbs. */
  function hopDown(hopper, y) {
    var tl = M.timeline({ willChange: hopper, willChangeValue: 'transform' });
    tl.to(hopper, { y: y, duration: M.dur(0.36), ease: 'power2.in' });
    return tl;
  }

  /* The apex down onto the header. The bird reaches its spot squashed and
     then recovers, which is what makes the landing read as weight rather
     than as a sprite being placed: a longer drop is given longer to fall. */
  function landOn(el, from) {
    var fall = Math.min(0.76, 0.32 + Math.abs(from) * 0.0005);
    var tl = M.timeline({ willChange: el, willChangeValue: 'transform' });
    tl.to(el, {
      y: 0, scaleX: 1.06, scaleY: 0.92,
      duration: M.dur(fall * 0.8), ease: 'power2.in'
    }).to(el, {
      scaleX: 1, scaleY: 1,
      duration: M.dur(fall * 0.2), ease: 'power2.out'
    });
    return tl;
  }

  /* The header up to the apex: a crouch, and then the spring out of it. The
     crouch is the same squash as the landing, played the other way round --
     it is where the jump gets its push from, and without it the bird just
     rises. */
  function springOff(el, y) {
    var dip = el.getBoundingClientRect().height * 0.06;
    var tl = M.timeline({ willChange: el, willChangeValue: 'transform' });
    tl.to(el, {
      y: dip, scaleX: 1.06, scaleY: 0.92,
      duration: M.dur(0.14), ease: 'power2.in'
    }).to(el, {
      y: y, scaleX: 1, scaleY: 1,
      duration: M.dur(0.42), ease: 'power2.out'
    });
    return tl;
  }

  /* One hop from one cell on the board to ANOTHER cell on the board, with no
     trip behind it. The jump on and off the board is cut at its apex and
     shared between two sprites because the bird has to disappear behind the
     board's edge on the way (see mascotJumpIn in pages.js); a bird going from
     the header to a mark further down the same board has nothing to hide
     behind, so this is one arc on one element and it never leaves the face of
     the board.
       Three moves, as every other jump here: the crouch it gets its push
     from, the flight, and the squash it lands in.
       x runs the whole way at an even rate and y is the two halves of a
     parabola laid over it -- a jump is a straight throw with gravity under
     it, and an arc drawn with one eased tween on both axes comes out as a
     swoop instead. The two cells are different sizes, so the flight carries a
     scale as well as a distance, and it is spent on the way UP: the bird is
     its new size by the time it starts to fall, which is the half of the arc
     the eye is on.
       o.dx/o.dy are where the bird is coming FROM, measured as an offset from
     where it now sits, and o.foot is how far down its cell the bird's feet
     are -- the origin everything here is about, so the squash compresses it
     onto its mark rather than about its own waist. */
  function hopAcross(el, o) {
    var scale = o.scale || 1;
    var dip = (el.getBoundingClientRect().height || 0) * scale * 0.06;
    /* Above whichever end is the higher of the two, by a share of the bird's
       own height -- so it is a hop of the same shape at every board size. */
    var apex = Math.min(o.dy, 0) - o.lift;
    var rise = 0.34, fall = 0.30;

    var tl = M.timeline({ willChange: el, willChangeValue: 'transform' });
    M.set(el, {
      x: o.dx, y: o.dy, scaleX: scale, scaleY: scale,
      transformOrigin: '50% ' + (o.foot * 100) + '%'
    });

    tl.to(el, {
      y: o.dy + dip, scaleX: scale * 1.06, scaleY: scale * 0.92,
      duration: M.dur(0.14), ease: 'power2.in'
    }).addLabel('off')
      /* across */
      .to(el, { x: 0, duration: M.dur(rise + fall), ease: 'none' }, 'off')
      /* and up, and down */
      .to(el, {
        y: apex, scaleX: 1, scaleY: 1,
        duration: M.dur(rise), ease: 'power2.out'
      }, 'off')
      .to(el, {
        y: 0, scaleX: 1.06, scaleY: 0.92,
        duration: M.dur(fall), ease: 'power2.in'
      })
      .to(el, { scaleX: 1, scaleY: 1, duration: M.dur(0.12), ease: 'power2.out' });
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
    /* overwrite: 'auto' because the control can be pressed while it is still
       arriving -- and it often is, since it appears exactly when the learner
       is waiting for it. Without this, controlIn's tween is still walking
       opacity up to 1 after this one has finished walking it down to 0, the
       last writer each frame wins, and the button is left standing on the
       board for the rest of the lesson with its `hidden` already restored. */
    tl.to(btn, {
      opacity: 0, scale: 0.8, duration: M.dur(0.2), ease: 'power2.in',
      overwrite: 'auto'
    });
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
    pop: pop,
    boardIn: boardIn,
    drawRim: drawRim,
    fillDisc: fillDisc,
    plantCentre: plantCentre,
    confirmCentre: confirmCentre,
    callout: callout,
    fanRadii: fanRadii,
    guideChord: guideChord,
    settleChord: settleChord,
    clearDots: clearDots,
    halveDiameter: halveDiameter,
    plotRimPoint: plotRimPoint,
    growRadius: growRadius,
    confirmRadius: confirmRadius,
    popDots: popDots,
    drawSpokes: drawSpokes,
    splitStage: splitStage,
    clearFigure: clearFigure,
    bubbleArm: bubbleArm,
    bubbleIn: bubbleIn,
    bubbleOut: bubbleOut,
    lineOut: lineOut,
    hopUp: hopUp,
    hopDown: hopDown,
    landOn: landOn,
    springOff: springOff,
    hopAcross: hopAcross,
    controlIn: controlIn,
    controlOut: controlOut,
    welcomeOut: welcomeOut
  };
})(window);
