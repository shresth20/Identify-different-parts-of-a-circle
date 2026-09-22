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
     A run of dots lands in quick succession and the run IS the cadence, so
     this one cue keeps its own spacing rather than motion.js's 100ms gate.
       It is the click clip at a third of its volume and a touch off its own
     pitch each time, played round-robin through four voices: one <audio>
     restarted over and over clips its own tail, and identical clicks read as
     an interface rather than as beads being laid down. */
  var POP_GATE = 46;
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
   * Strokes -- the dash trick, shared by everything that draws a line
   * ----------------------------------------------------------------------
   * Written straight into a timeline the caller already owns. M.drawPath
   * does the same thing but makes -- and tracks -- a timeline of its own for
   * it, and a dozen of those nested inside a thirteenth is a dozen things
   * for Skip and Replay to reach into where one will do.
   *   Positions go through M.gap for the same reason durations go through
   * M.dur: a skipped scene must collapse the SPACING between strokes as well
   * as the strokes themselves.
   * ====================================================================== */
  function pathLength(p) {
    try { return p.getTotalLength ? p.getTotalLength() : 0; } catch (e) { return 0; }
  }

  function stroke(tl, path, at, seconds, ease) {
    var len = pathLength(path) || 1;
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
      if (!p || !p.style) return;
      p.style.strokeDasharray = '';
      p.style.strokeDashoffset = '';
    });
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
   * The circle
   * ====================================================================== */

  var RIM_TIME = 1.7;               /* seconds: the one stroke the learner   */
                                    /* is meant to WATCH being made          */
  var GLOW_WIDE  = 0.2;             /* the two highlight strokes' opacities  */
  var GLOW_TIGHT = 0.42;

  /* The outline, drawn from a point. A pen-dot pops in at twelve o'clock,
     the stroke unrolls clockwise out of it -- the rim's own path starts
     there, see index.html -- and the dot rides the tip the whole way round,
     then leaves as the circle closes.
       `glows` are the highlight: the same path at two wider weights, drawn
     in step with the rim so the line arrives already lit. They stay until
     unglowRim() takes them away. `glow: false` draws the plain circle. */
  function drawRim(rim, glows, tip, opts) {
    var o = opts || {};
    var lit = o.glow !== false && glows && glows.length;
    var len = pathLength(rim) || 1;
    var x0 = parseFloat(tip.getAttribute('cx')) || 0;
    var y0 = parseFloat(tip.getAttribute('cy')) || 0;
    var START = 0.3;                /* the pen lands before the stroke starts */

    M.set(rim, { opacity: 1 });
    M.set(tip, { opacity: 1, scale: 0, x: 0, y: 0, transformOrigin: 'center center' });

    var tl = M.timeline({
      revert: function () {
        undash([rim].concat(lit ? glows : []));
        M.set(tip, { clearProps: 'transform,opacity' });
      }
    });

    tl.to(tip, { scale: 1, duration: M.dur(0.26), ease: M.POP }, 0);

    stroke(tl, rim, START, RIM_TIME, 'power1.inOut');
    if (lit) {
      glows.forEach(function (g, i) {
        M.set(g, { opacity: i === 0 ? GLOW_WIDE : GLOW_TIGHT });
        stroke(tl, g, START, RIM_TIME, 'power1.inOut');
      });
    }

    /* The pen follows the front of the stroke: a proxy tween with the same
       length and the same ease, reading the point off the rim itself. */
    var pen = { t: 0 };
    tl.to(pen, {
      t: 1, duration: M.dur(RIM_TIME), ease: 'power1.inOut',
      onUpdate: function () {
        var p;
        try { p = rim.getPointAtLength(len * pen.t); } catch (e) { return; }
        M.set(tip, { x: p.x - x0, y: p.y - y0 });
      }
    }, M.gap(START));

    tl.to(tip, { scale: 0, opacity: 0, duration: M.dur(0.24), ease: 'power2.in' },
          M.gap(START + RIM_TIME));
    return tl;
  }

  /* The highlight coming off the rim, once the circumference has its name. */
  function unglowRim(glows) {
    var tl = M.timeline({ willChange: glows, willChangeValue: 'opacity' });
    tl.to(glows, { opacity: 0, duration: M.dur(0.55), ease: 'power2.inOut' });
    return tl;
  }

  /* And then the colour goes in. Slightly delayed off the rim so the two
     read as two acts -- outline, then fill -- rather than one. It grows from
     just inside the rim, so the colour looks like it is being poured into a
     shape that was already there. */
  function fillDisc(disc) {
    var tl = M.timeline({ willChange: disc, willChangeValue: 'transform, opacity' });
    tl.fromTo(disc,
      { opacity: 0, scale: 0.86, transformOrigin: 'center center' },
      { opacity: 1, scale: 1, duration: M.dur(0.55), ease: 'power2.out' });
    return tl;
  }

  /* ======================================================================
   * The centre
   * ====================================================================== */

  /* The centre, marked. plotPoint pops the dot in; the halo then takes over
     with its own CSS loop, which is where .is-calling comes in -- a loop that
     has to run for an unknown length of time belongs in CSS, not in a tween
     something would have to remember to kill.
       `call: false` plants the same dot as a piece of the diagram instead: no
     halo, no invitation, and not tappable. */
  function plantCentre(group, dot, opts) {
    var o = opts || {};
    var quiet = o.call === false;
    group.removeAttribute('hidden');
    group.classList.toggle('is-quiet', quiet);
    var tl = M.plotPoint(dot, null, { duration: quiet ? 0.28 : 0.34 });
    if (!quiet) tl.add(function () { group.classList.add('is-calling'); });
    return tl;
  }

  /* Tapped. The halo settles out of its loop (CSS again, on .is-found) and
     the dot takes one pulse -- once, not a heartbeat: a thing that pulses
     twice reads as a warning rather than as "yes, that one". */
  function confirmCentre(group, dot) {
    group.classList.remove('is-calling');
    group.classList.add('is-found');
    sfx('correct');
    return M.correct(dot);
  }

  /* Named, and done asking: the halo fades and the dot is left as a plain
     point on the diagram -- the same state a `call: false` plant lands in. */
  function quietCentre(group, glow) {
    var tl = M.timeline({
      revert: function () {
        group.classList.remove('is-calling', 'is-found');
        group.classList.add('is-quiet');
        /* Opacity only. Asking GSAP to clear the halo's transform makes it
           parse one, and on an SVG element that writes an inline
           transform-origin of 0 0 -- which is exactly the origin the CSS
           pulse must not be given (see .centre__glow in style.css). */
        M.set(glow, { clearProps: 'opacity' });
      }
    });
    tl.to(glow, { opacity: 0, duration: M.dur(0.42), ease: 'power2.inOut' });
    return tl;
  }

  /* ======================================================================
   * The callout
   * ====================================================================== */

  /* An arrow and the word it is pointing at. Three strokes of one pen, in the
     order a hand makes them: the shaft is drawn from the label's end in toward
     the thing being named, the head is put on its tip, and only then is the
     word itself set down -- a label that arrives with its arrow is a label the
     eye skips.
       The head starts while the shaft still has a few frames to run: a pen
     does not stop at the tip and start again, and that overlap is what makes
     the two read as one gesture rather than as two marks. */
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

  /* And taken away again, as one thing. The group is hidden and every inline
     write handed back when it ends, so the next aim starts clean. */
  function calloutOut(group, parts) {
    var tl = M.timeline({
      willChange: parts, willChangeValue: 'opacity',
      revert: function () {
        group.setAttribute('hidden', '');
        M.set(parts, { clearProps: 'opacity,transform' });
        undash(parts);
      }
    });
    tl.to(parts, { opacity: 0, duration: M.dur(0.3), ease: 'power2.in' });
    return tl;
  }

  /* ======================================================================
   * Points and lines
   * ====================================================================== */

  /* A point going onto the diagram. */
  function plotDot(dot) {
    M.set(dot, { opacity: 1 });
    var tl = M.plotPoint(dot, null, { duration: 0.3 });
    tl.call(pop, null, 0);
    return tl;
  }

  /* A segment, drawn from the start of its own path to its end. */
  function growLine(line, seconds) {
    M.set(line, { opacity: 1 });
    var tl = M.timeline({ revert: function () { undash([line]); } });
    stroke(tl, line, 0, seconds || 0.55, 'power2.out');
    return tl;
  }

  /* One half of the line lit up and named: a wide soft stroke under it
     breathes in and out once, and the word is set beneath it as the light
     is at its fullest. */
  function glowLine(glow, label) {
    M.set(label, { opacity: 0, scale: 0.7, transformOrigin: 'center center' });
    var tl = M.timeline({ willChange: [glow, label], willChangeValue: 'transform, opacity' });
    tl.fromTo(glow, { opacity: 0 },
      { opacity: 0.85, duration: M.dur(0.34), ease: 'power2.out' }, 0)
      .to(glow, { opacity: 0, duration: M.dur(0.75), ease: 'power2.inOut' }, M.gap(0.62))
      .to(label, {
        opacity: 1, scale: 1, duration: M.dur(0.36), ease: 'back.out(1.7)'
      }, M.gap(0.2));
    return tl;
  }

  /* Two radii become one diameter. The halves take the diameter's colour and
     weight together (a class -- the stylesheet transitions the stroke), the
     two names slide in to meet at the middle as they fade, and the whole
     line's name is set down where they meet. That is "two of these make one
     of that" made into a movement. */
  function becomeDiameter(o) {
    M.set(o.name, { opacity: 0, scale: 0.7, transformOrigin: 'center center' });
    var tl = M.timeline({ willChange: o.names.concat(o.name), willChangeValue: 'transform, opacity' });
    tl.call(function () {
      o.halves.forEach(function (h) { h.classList.add('is-dia'); });
    }, null, 0);
    tl.to(o.names[0], { x: o.meet, opacity: 0, duration: M.dur(0.5), ease: 'power2.inOut' }, M.gap(0.1));
    tl.to(o.names[1], { x: -o.meet, opacity: 0, duration: M.dur(0.5), ease: 'power2.inOut' }, M.gap(0.1));
    tl.to(o.name, { opacity: 1, scale: 1, duration: M.dur(0.42), ease: 'back.out(1.7)' }, M.gap(0.44));
    return tl;
  }

  /* Several lines, each with the points it runs between, laid down one after
     another: the two points land, then the line joins them -- the order the
     first one was taught in -- and the next starts as this one finishes. */
  var CHORD_STEP = 0.62;

  function drawChords(items) {
    var lines = items.map(function (it) { return it.line; });
    var tl = M.timeline({ revert: function () { undash(lines); } });
    var at = 0;
    items.forEach(function (it) {
      M.set(it.ends.concat(it.line), { opacity: 1 });
      it.ends.forEach(function (e, k) {
        tl.fromTo(e,
          { scale: 0, transformOrigin: 'center center' },
          { scale: 1, duration: M.dur(0.24), ease: M.POP }, M.gap(at + k * 0.1));
        tl.call(pop, null, M.gap(at + k * 0.1));
      });
      stroke(tl, it.line, at + 0.2, 0.46, 'power2.out');
      at += CHORD_STEP;
    });
    return tl;
  }

  /* ======================================================================
   * The activity -- name the parts
   * ====================================================================== */

  /* One part laid on the circle: its end points, then the line. */
  function plotPart(part) {
    return drawChords([part]);
  }

  /* The five boxes, one after another. For each: the point on the part it
     names pops in, the dashed leader draws itself out from the box's edge to
     that point, and the box itself arrives at the other end of it.
       A dashed line cannot be drawn with the dash trick -- the trick IS a
     dash pattern -- so each leader is drawn through a mask: a solid path
     over the same line, revealed with the trick, and the dashed one shows
     through wherever the mask has reached. */
  var BOX_STEP = 0.52;

  function boxesIn(boxes) {
    var masks = boxes.map(function (b) { return b.mask; });
    var tl = M.timeline({ revert: function () { undash(masks); } });
    var at = 0;
    boxes.forEach(function (b) {
      if (b.anchor) {
        M.set(b.anchor, { opacity: 1 });
        tl.fromTo(b.anchor,
          { scale: 0, transformOrigin: 'center center' },
          { scale: 1, duration: M.dur(0.24), ease: M.POP }, M.gap(at));
        tl.call(pop, null, M.gap(at));
      }
      M.set(b.leader, { opacity: 1 });
      stroke(tl, b.mask, at + 0.1, 0.42, 'power1.inOut');
      tl.fromTo(b.g,
        { opacity: 0, scale: 0.72, transformOrigin: 'center center' },
        { opacity: 1, scale: 1, duration: M.dur(0.4), ease: M.POP }, M.gap(at + 0.4));
      at += BOX_STEP;
    });
    return tl;
  }

  /* The names arriving in the tray under the circle. */
  function trayIn(tray, chips) {
    tray.removeAttribute('hidden');
    var tl = M.timeline({ willChange: chips, willChangeValue: 'transform, opacity' });
    tl.fromTo(chips,
      { opacity: 0, y: 14, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: M.dur(0.36), ease: M.POP,
        stagger: M.gap(0.08) });
    return tl;
  }
  function trayOut(tray, chips) {
    var tl = M.timeline({
      willChange: chips, willChangeValue: 'transform, opacity',
      revert: function () { tray.setAttribute('hidden', ''); }
    });
    if (chips.length) {
      tl.to(chips, {
        opacity: 0, y: 10, duration: M.dur(0.26), ease: 'power2.in',
        stagger: M.gap(0.03)
      });
    }
    return tl;
  }

  /* A name let go of somewhere that is not its box: back to the tray, of its
     own accord. */
  function chipHome(chip) {
    return M.to(chip, {
      x: 0, y: 0, scale: 1, duration: M.dur(0.36), ease: 'power3.out',
      overwrite: 'auto'
    });
  }

  /* A name dropped in the right box. It flies the rest of the way into the
     box and shrinks out as the word is set inside -- the chip becoming the
     label. dx/dy are how far the box's centre is from the chip's, measured
     by the caller on screen. */
  function chipDock(chip, dx, dy) {
    var x = gsap.getProperty(chip, 'x') || 0;
    var y = gsap.getProperty(chip, 'y') || 0;
    return M.to(chip, {
      x: x + dx, y: y + dy, scale: 0.55, opacity: 0,
      duration: M.dur(0.4), ease: 'power2.inOut', overwrite: 'auto',
      onComplete: function () {
        chip.classList.add('is-docked');
        M.set(chip, { clearProps: 'transform,opacity' });
      }
    });
  }

  /* The box, answered: the border turns green (a class -- a state it stays
     in), the word pops in, the tick lands beside it, and the box gives one
     short pulse. */
  function boxRight(box) {
    box.g.classList.remove('is-wrong', 'is-over');
    box.g.classList.add('is-right');
    sfx('correct');

    M.set(box.text, { opacity: 0, scale: 0.7, transformOrigin: 'center center' });
    M.set(box.badge, { opacity: 1, scale: 0, transformOrigin: 'center center' });
    var tl = M.timeline({
      willChange: [box.text, box.badge], willChangeValue: 'transform, opacity'
    });
    tl.to(box.rect, { scale: 1.05, transformOrigin: 'center center',
                      duration: M.dur(0.14), ease: 'power2.out' }, 0)
      .to(box.rect, { scale: 1, duration: M.dur(0.3), ease: M.POP }, M.gap(0.14))
      .to(box.text, { opacity: 1, scale: 1, duration: M.dur(0.36), ease: 'back.out(1.7)' }, M.gap(0.06))
      .to(box.badge, { scale: 1, duration: M.dur(0.34), ease: M.POP }, M.gap(0.16));
    return tl;
  }

  /* The box, refused: it turns red and shakes its head -- three cycles at a
     few pixels -- and holds the red for a beat before it is a plain box
     again. */
  var SHAKE = [-5, 5, -5, 5, -4, 4, 0];

  function boxWrong(box) {
    box.g.classList.remove('is-over');
    box.g.classList.add('is-wrong');
    sfx('wrong');

    var tl = M.timeline({
      willChange: box.g, willChangeValue: 'transform',
      revert: function () {
        box.g.classList.remove('is-wrong');
        M.set(box.g, { clearProps: 'transform' });
      }
    });
    var each = M.dur(0.3) / SHAKE.length;
    SHAKE.forEach(function (x, i) {
      tl.to(box.g, { x: x, duration: each,
                     ease: i === SHAKE.length - 1 ? 'power2.out' : 'none' });
    });
    /* a hold, so the red is read before it goes */
    tl.to({}, { duration: M.dur(0.5) });
    return tl;
  }

  /* ======================================================================
   * Clearing up
   * ====================================================================== */

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
     have to resize around the words a beat after opening.
       The origin is the tail, so the bubble grows out of the bird's head
     rather than out of its own middle. Measured rather than written down:
     the stylesheet places the tail at --bub-tail-x plus half of --bub-tail-w,
     both fractions of the box's own type size -- and that size is a clamp,
     so it is a different number of pixels on every screen. */
  var TAIL_X = 0.78 + 0.76 / 2;        /* in em, from .bubble in style.css */

  function tailOrigin(bubble) {
    var em = parseFloat(getComputedStyle(bubble).fontSize) || 16;
    return (em * TAIL_X) + 'px 100%';
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
    /* the circle */
    drawRim: drawRim,
    unglowRim: unglowRim,
    fillDisc: fillDisc,
    /* the centre */
    plantCentre: plantCentre,
    confirmCentre: confirmCentre,
    quietCentre: quietCentre,
    /* the callout */
    callout: callout,
    calloutOut: calloutOut,
    /* points and lines */
    plotDot: plotDot,
    growLine: growLine,
    glowLine: glowLine,
    becomeDiameter: becomeDiameter,
    drawChords: drawChords,
    /* the activity */
    plotPart: plotPart,
    boxesIn: boxesIn,
    trayIn: trayIn,
    trayOut: trayOut,
    chipHome: chipHome,
    chipDock: chipDock,
    boxRight: boxRight,
    boxWrong: boxWrong,
    /* clearing up */
    clearFigure: clearFigure,
    /* text boxes and controls */
    bubbleArm: bubbleArm,
    bubbleIn: bubbleIn,
    bubbleOut: bubbleOut,
    lineOut: lineOut,
    hopUp: hopUp,
    hopDown: hopDown,
    landOn: landOn,
    springOff: springOff,
    controlIn: controlIn,
    controlOut: controlOut,
    welcomeOut: welcomeOut
  };
})(window);
