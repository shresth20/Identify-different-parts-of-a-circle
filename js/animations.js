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

  /* The outline, drawn from a point. A pen-dot pops in at twelve o'clock,
     the stroke unrolls clockwise out of it -- the rim's own path starts
     there, see index.html -- and the dot rides the tip the whole way round,
     then leaves as the circle closes. One plain stroke: the line itself is
     what the learner is meant to watch being made, with nothing laid over
     or under it. */
  function drawRim(rim, tip) {
    var len = pathLength(rim) || 1;
    var x0 = parseFloat(tip.getAttribute('cx')) || 0;
    var y0 = parseFloat(tip.getAttribute('cy')) || 0;
    var START = 0.3;                /* the pen lands before the stroke starts */

    M.set(rim, { opacity: 1 });
    M.set(tip, { opacity: 1, scale: 0, x: 0, y: 0, transformOrigin: 'center center' });

    var tl = M.timeline({
      revert: function () {
        undash([rim]);
        M.set(tip, { clearProps: 'transform,opacity' });
      }
    });

    tl.to(tip, { scale: 1, duration: M.dur(0.26), ease: M.POP }, 0);

    stroke(tl, rim, START, RIM_TIME, 'power1.inOut');

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

  /* The arrow alone coming off a callout, its word left standing. Once there
     are several of a thing on the circle, an arrow at one of them says "this
     one"; the word on its own says "these". The group stays up and the word
     is taken off later with calloutOut, which clears the arrow's fade too. */
  function arrowOut(parts) {
    var tl = M.timeline({
      willChange: parts, willChangeValue: 'opacity',
      revert: function () { M.set(parts, { clearProps: 'opacity' }); }
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

  /* The radius, copied to the other side of the centre. A faint copy fades
     up ON the radius and lifts a little off it, is carried straight across
     by exactly one radius, and is set down; as it lands the real left half
     comes up solid beneath it, the copy is gone, and the point it now
     reaches lands on the rim. Three moves -- lift, carry, set down -- so it
     reads as a thing being picked up and placed, and the length never
     changes on the way: that is the whole of what the beat says.
       o.ghost is the copy, o.shift how far it travels (a negative radius),
     o.half the solid left half it becomes, o.end the point at its far end. */
  var GHOST = 0.45;                 /* the copy's opacity in the hand */
  var LIFT = 12;                    /* how far it rises off the line  */

  function copyRadius(o) {
    M.set(o.ghost, { opacity: 0, x: 0, y: 0 });
    var tl = M.timeline({
      willChange: [o.ghost, o.half], willChangeValue: 'transform, opacity',
      revert: function () { M.set(o.ghost, { clearProps: 'opacity,transform' }); }
    });
    /* lift */
    tl.to(o.ghost, { opacity: GHOST, y: -LIFT, duration: M.dur(0.42), ease: 'power2.out' }, 0);
    /* carry */
    tl.to(o.ghost, { x: o.shift, duration: M.dur(0.95), ease: 'power2.inOut' }, M.gap(0.6));
    /* set down */
    tl.to(o.ghost, { y: 0, duration: M.dur(0.3), ease: 'power2.in' }, M.gap(1.6));
    tl.to(o.half, { opacity: 1, duration: M.dur(0.3), ease: 'power2.out' }, M.gap(1.85));
    tl.to(o.ghost, { opacity: 0, duration: M.dur(0.3), ease: 'power2.in' }, M.gap(1.9));
    M.set(o.end, { opacity: 1, scale: 0, transformOrigin: 'center center' });
    tl.to(o.end, { scale: 1, duration: M.dur(0.26), ease: M.POP }, M.gap(1.9));
    tl.call(pop, null, M.gap(1.9));
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

  /* Two radii become one diameter. The halves take the diameter's colour
     together (a class -- the stylesheet transitions the stroke), the
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

  /* The rule, set down under the circle once the line has its name: it rises
     into place and settles, the same landing every label in the figure has,
     so it reads as one more thing named rather than as a caption. */
  function showRule(text, plate) {
    var els = [text];
    if (plate) {
      /* The plate is cut to the words at the moment they are shown, rather
         than sized by hand: the words are set in a web font, and a box
         guessed from the markup is the wrong size on the day the font
         changes. */
      var PX = 22, PY = 9, b;
      try { b = text.getBBox(); } catch (e) { b = null; }
      if (b && b.width) {
        plate.setAttribute('x', b.x - PX);
        plate.setAttribute('y', b.y - PY);
        plate.setAttribute('width', b.width + PX * 2);
        plate.setAttribute('height', b.height + PY * 2);
        plate.setAttribute('rx', (b.height + PY * 2) / 2);
        els.unshift(plate);
      }
    }
    M.set(els, { opacity: 0, y: 14, scale: 0.8, transformOrigin: 'center center' });
    var tl = M.timeline({ willChange: els, willChangeValue: 'transform, opacity' });
    tl.to(els, { opacity: 1, y: 0, scale: 1, duration: M.dur(0.48), ease: 'back.out(1.6)' });
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

  /* One box, arriving on the part it will name: the point on that part pops
     in, the dashed line draws itself out from the box's edge to that point,
     and the box lands at the other end of it. Slow enough to be followed --
     this is the beat that says WHICH box belongs to WHICH part, and it is
     the only time that is shown.
       A dashed line cannot be drawn with the dash trick -- the trick IS a
     dash pattern -- so the leader is drawn through a mask: a solid path over
     the same line, revealed with the trick, and the dashed one shows through
     wherever the mask has reached.
       It ends by handing the three of them to the stylesheet. From there
     their level is a class and not an inline value, which is what lets a box
     brighten under the hand later without a tween chasing it. */
  function boxIn(box) {
    var parts = [box.g, box.leader];
    var tl = M.timeline({ revert: function () { undash([box.mask]); } });

    M.set(box.leader, { opacity: 1 });
    stroke(tl, box.mask, 0.14, 0.52, 'power1.inOut');
    /* The leader ends on the line itself, with no point of its own: the
       part it runs to is already a mark on the board. */
    tl.fromTo(box.g,
      { opacity: 0, scale: 0.72, transformOrigin: 'center center' },
      { opacity: 1, scale: 1, duration: M.dur(0.44), ease: M.POP }, M.gap(0.52));
    tl.call(pop, null, M.gap(0.52));

    tl.call(function () {
      parts.forEach(function (e) { e.classList.add('is-shown'); });
      M.set(parts, { clearProps: 'opacity' });
    });
    return tl;
  }

  /* And the pair standing back. The box, its line and its point drop to the
     level the whole set rests at -- a class, so the stylesheet can lift one
     of them out of it again when the learner reaches for it -- and the marks
     the part is drawn with fade with them, which is what leaves the board
     clear for the next pair to arrive on. */
  var PART_DIM = 0.3;

  function dimPair(box, marks) {
    var tl = M.timeline({ willChange: marks, willChangeValue: 'opacity' });
    tl.call(function () {
      [box.g, box.leader].forEach(function (e) { e.classList.add('is-quiet'); });
    }, null, 0);
    tl.to(marks, {
      opacity: PART_DIM, duration: M.dur(0.55), ease: 'power2.inOut'
    }, 0);
    return tl;
  }

  /* Every part of the circle back to full, together: the drawing the learner
     is about to label, read as one thing again. The boxes and their lines
     are deliberately not in this -- they stay standing back. */
  function showParts(marks) {
    var tl = M.timeline({ willChange: marks, willChangeValue: 'opacity' });
    tl.to(marks, {
      opacity: 1, duration: M.dur(0.7), ease: 'power2.inOut', stagger: M.gap(0.05)
    });
    return tl;
  }

  /* What the learner has to reach for, arriving in the band under the
     circle and leaving it again: the five names in the last activity, and
     the two answers to the yes/no question before it. One pair of beats for
     both -- a row of pills is a row of pills. */
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

  /* An answer pressed. The colour each one takes is its own class -- a
     state it stays in -- so these two are only the movement that goes with
     it: one outward pulse for the right answer, a head-shake for the wrong
     one. `is-wrong` comes off first, so the button that was shaken can then
     be shown as the right one without wearing both. */
  function choiceRight(btn) {
    btn.classList.remove('is-wrong');
    btn.classList.add('is-right');
    sfx('correct');
    return M.correct(btn);
  }
  function choiceWrong(btn) {
    btn.classList.add('is-wrong');
    sfx('wrong');
    return M.incorrect(btn);
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


  /* ======================================================================
   * Section 2 -- arcs (the scenes are in arcs.js)
   * ----------------------------------------------------------------------
   * The second section draws its own circle (the #arcs group in index.html)
   * and does three things to it section 1 never does: slides it aside,
   * turns the marks on it, and recolours its rim as two pieces. The beats
   * for those are here, next to the ones they are made from.
   * ====================================================================== */

  /* The board leaving: boardIn played back. The bird standing on the field
     behind it is what the board shrinking away uncovers. `show` comes off
     at the END and not before, because the class is what keeps the board
     laid out while it is still on screen. */
  function boardOut(board) {
    board.classList.add('is-animating');
    var tl = M.timeline({
      willChange: board, willChangeValue: 'transform, opacity',
      revert: function () {
        board.classList.remove('show', 'is-animating');
        board.setAttribute('aria-hidden', 'true');
        M.set(board, { clearProps: 'opacity,transform' });
      }
    });
    tl.to(board, {
      opacity: 0, scale: 0.965, y: 14, duration: M.dur(0.5), ease: 'power2.in'
    });
    return tl;
  }

  /* The ghost point: the mark that rides the rim under the learner's
     finger before a point is placed. Grown by its RADIUS rather than
     scaled, because it is moving while it appears, and GSAP fixes an SVG
     element's origin where the element was when the tween began -- a
     scale on a dot that then moves swells it about the wrong spot. */
  function ghostIn(ghost) {
    return M.to(ghost, {
      attr: { r: 7 }, opacity: 1, duration: M.dur(0.18), ease: M.POP, overwrite: 'auto'
    });
  }
  function ghostOut(ghost) {
    return M.to(ghost, {
      attr: { r: 2 }, opacity: 0, duration: M.dur(0.16), ease: 'power2.in', overwrite: 'auto'
    });
  }

  /* The weight of a piece of the circumference: the same figure the
     stylesheet's --arc-weight declares. Every swell below returns to it. */
  var ARC_W = 7;

  /* A stroke swelling and settling, written into a timeline the caller
     owns. What lights an arc: the width is tweened rather than a glow laid
     under it, because an arc has no straight box for a filter region to be
     measured against. `w` is the weight it settles back to; swell is the
     arcs' own. */
  function swellTo(tl, paths, w, at) {
    tl.to(paths, { strokeWidth: w * 1.6, duration: M.dur(0.26), ease: 'power2.out' }, M.gap(at))
      .to(paths, { strokeWidth: w, duration: M.dur(0.5), ease: M.POP }, M.gap(at + 0.26));
  }
  function swell(tl, paths, at) { swellTo(tl, paths, ARC_W, at); }
  function unswell(paths) { M.set(paths, { clearProps: 'strokeWidth' }); }

  /* The circumference recoloured as two pieces, one after the other. Both
     arcs unroll from the point the learner placed LAST (see arcs.js): the
     smaller piece first, round to the first point; then the larger, the
     other way round to the same point -- so the two colours are seen to be
     the one line, cut at those two points. Each lands with the bead sound;
     the points pulse as the second arrives, and the coral rim under them
     goes.
       o.minor / o.major are the two paths, o.rim the rim under them,
     o.dots the two points. */
  var SWEEP_MINOR = 0.8, SWEEP_MAJOR = 1.1, SWEEP_GAP = 0.22;

  function arcSweep(o) {
    var second = SWEEP_MINOR + SWEEP_GAP;       /* when the larger piece sets off */
    var end = second + SWEEP_MAJOR;
    M.set([o.minor, o.major], { opacity: 1 });
    var tl = M.timeline({ revert: function () { undash([o.minor, o.major]); } });
    stroke(tl, o.minor, 0, SWEEP_MINOR, 'power2.inOut');
    tl.call(pop, null, M.gap(SWEEP_MINOR));
    stroke(tl, o.major, second, SWEEP_MAJOR, 'power2.inOut');
    tl.to(o.rim, { opacity: 0, duration: M.dur(0.3), ease: 'power2.out' }, M.gap(end - 0.2));
    tl.to(o.dots, { scale: 1.4, transformOrigin: 'center center',
                    duration: M.dur(0.16), ease: 'power2.out' }, M.gap(end - 0.06))
      .to(o.dots, { scale: 1, duration: M.dur(0.34), ease: M.POP }, M.gap(end + 0.1));
    tl.call(pop, null, M.gap(end));
    return tl;
  }

  /* One or more pieces, lit once. */
  function arcPulse(paths) {
    var tl = M.timeline({ revert: function () { unswell(paths); } });
    swell(tl, paths, 0);
    return tl;
  }

  /* The pieces pulled apart, and put back. Each slides a little way out
     along its own middle -- `away` is one {x, y} per path -- and the gap
     that opens between them is what "two pieces" means. */
  function arcSplit(paths, away) {
    var tl = M.timeline({ willChange: paths, willChangeValue: 'transform' });
    paths.forEach(function (p, i) {
      tl.to(p, { x: away[i].x, y: away[i].y, duration: M.dur(0.55), ease: 'power2.out' }, 0);
    });
    return tl;
  }
  function arcJoin(paths) {
    var tl = M.timeline({
      willChange: paths, willChangeValue: 'transform',
      revert: function () { M.set(paths, { clearProps: 'transform' }); }
    });
    tl.to(paths, { x: 0, y: 0, duration: M.dur(0.5), ease: 'power2.inOut' });
    return tl;
  }

  /* The piece the lesson is talking about, and the rest stood back: `on`
     comes up to full and swells once, `off` drops to a quarter. arcUnfocus
     brings everything back up together. Nothing here hands opacity back:
     a piece's resting opacity is nothing, and these are all pieces that are
     meant to stay on the board. */
  var ARC_DIM = 0.22;

  function arcFocus(on, off) {
    var tl = M.timeline({
      willChange: on.concat(off), willChangeValue: 'opacity',
      revert: function () { unswell(on); }
    });
    if (off.length) tl.to(off, { opacity: ARC_DIM, duration: M.dur(0.4), ease: 'power2.inOut' }, 0);
    if (on.length) {
      tl.to(on, { opacity: 1, duration: M.dur(0.3), ease: 'power2.out' }, 0);
      swell(tl, on, 0.1);
    }
    return tl;
  }
  function arcUnfocus(all) {
    var tl = M.timeline({ willChange: all, willChangeValue: 'opacity' });
    tl.to(all, { opacity: 1, duration: M.dur(0.4), ease: 'power2.inOut' });
    return tl;
  }

  /* A word set beside a piece -- "Arc" -- landing the way every label in
     the figure lands, and a set of them taken away together. */
  function labelIn(text) {
    M.set(text, { opacity: 0, scale: 0.72, transformOrigin: 'center center' });
    var tl = M.timeline({ willChange: text, willChangeValue: 'transform, opacity' });
    tl.to(text, { opacity: 1, scale: 1, duration: M.dur(0.36), ease: 'back.out(1.7)' });
    return tl;
  }
  function labelsOut(texts) {
    var tl = M.timeline({ willChange: texts, willChangeValue: 'opacity' });
    tl.to(texts, { opacity: 0, duration: M.dur(0.26), ease: 'power2.in' });
    return tl;
  }

  /* A dashed line drawn out: the mask trick the activity's leaders use
     (see boxIn). `mask` is the solid path inside the mask that uncovers
     the dashed one as it is stroked. */
  function dashedIn(line, mask, seconds) {
    M.set(line, { opacity: 1 });
    var tl = M.timeline({ revert: function () { undash([mask]); } });
    stroke(tl, mask, 0, seconds || 0.6, 'power1.inOut');
    return tl;
  }

  /* ---- the hand: a nudge that shows the gesture being asked for --------
     A flat pointing hand (drawn by arcs.js), faint, doing what the learner
     is being asked to do: pointing at a spot on the rim and pressing it, or
     carrying a point along the rim. The beats here own only the MOTION;
     where the hand is for a given moment is the caller's, through a `put`
     it hands over, because only the caller knows the circle. `gap` is how
     far the fingertip stands off the rim: at rest a little way out, at a
     touch all but on it.
       Both loops are endless, since nobody knows how long the learner will
     take, so their timings are the clock's and not M.dur's -- a skipped
     loop of zero length would spin -- and they are marked so Skip leaves
     them be. The scene stops one with nudgeStop the moment the learner
     moves. */
  var NUDGE_ON = 0.92;
  var NUDGE_REST = 16, NUDGE_TOUCH = 1.5;      /* picture units off the rim */
  var NUDGE_SWELL = 1.22;                      /* the tap's pulse, about the fingertip */

  /* Tap here. The hand fades in with its fingertip on the spot and pulses
     -- swells about the fingertip and settles, twice -- while the ripple
     round the finger spreads and fades each time, the way a tap on a
     screen is drawn; then it goes, and comes again after a pause.
     `put(scale)` places the hand at the spot at that size; `ripple(k,
     alpha)` draws the ripple at k times its size and that opacity. */
  function nudgeTap(hand, put, ripple) {
    var p = { s: 1 };
    var q = { k: 0.7, a: 0 };
    function move() { put(p.s); }
    function wave() { if (ripple) ripple(q.k, q.a); }
    move(); wave();
    var tl = M.timeline({
      revert: function () {
        M.set(hand, { clearProps: 'opacity' });
        q.a = 0; wave();
      }
    });
    if (M.reducedMotion()) {
      M.set(hand, { opacity: NUDGE_ON });
      q.k = 1; q.a = 0.8; wave();
      return tl;
    }
    tl.__motionEndless = true;
    tl.call(function () { p.s = 1; q.k = 0.7; q.a = 0; move(); wave(); }, null, 0);
    tl.to(hand, { opacity: NUDGE_ON, duration: 0.3, ease: 'power2.out' }, 0);
    [0.35, 1.05].forEach(function (at) {
      tl.to(p, { s: NUDGE_SWELL, duration: 0.22, ease: 'power2.out', onUpdate: move }, at)
        .to(p, { s: 1, duration: 0.36, ease: 'power2.inOut', onUpdate: move }, at + 0.22);
      tl.fromTo(q, { k: 0.7, a: 0.9 },
        { k: 1.15, a: 0, duration: 0.62, ease: 'power2.out', onUpdate: wave }, at);
    });
    tl.to(hand, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 1.85);
    tl.to({}, { duration: 0.7 });            /* the pause before it comes again */
    tl.repeat(-1);
    return tl;
  }

  /* Carry it there. The hand fades in over the point, presses down onto
     it, slides along the rim to its mark -- `put(t, gap)` places it, for t
     from 0 (the point) to 1 (the mark) -- lifts, and fades; then again. */
  function nudgeSlide(hand, put) {
    var p = { t: 0, g: NUDGE_REST };
    function move() { put(p.t, p.g, 1); }
    move();
    var tl = M.timeline({ revert: function () { M.set(hand, { clearProps: 'opacity' }); } });
    if (M.reducedMotion()) {
      p.t = 0.5; p.g = NUDGE_TOUCH; move();
      M.set(hand, { opacity: NUDGE_ON });
      return tl;
    }
    tl.__motionEndless = true;
    tl.call(function () { p.t = 0; p.g = NUDGE_REST; move(); }, null, 0);
    tl.to(hand, { opacity: NUDGE_ON, duration: 0.3, ease: 'power2.out' }, 0);
    tl.to(p, { g: NUDGE_TOUCH, duration: 0.24, ease: 'power2.in', onUpdate: move }, 0.2);
    tl.to(p, { t: 1, duration: 1.3, ease: 'power1.inOut', onUpdate: move }, 0.5);
    tl.to(p, { g: NUDGE_REST, duration: 0.24, ease: 'power2.out', onUpdate: move }, 1.85);
    tl.to(hand, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 1.9);
    tl.to({}, { duration: 0.65 });
    tl.repeat(-1);
    return tl;
  }

  /* And put away: the loop is stopped and the hand fades from wherever it
     was. */
  function nudgeStop(tl, hand) {
    if (tl) tl.kill();
    return M.to(hand, { opacity: 0, duration: M.dur(0.22), ease: 'power2.in', overwrite: 'auto' });
  }

  /* The turn: the two points, and the pieces between them, carried round
     the circle by `delta` degrees. The paths are rewritten each frame from
     the angles -- a circle turned is a circle, so what is SEEN to turn is
     the marks on it -- which is why this takes the state and the redraw
     rather than the elements. `state.a` is the angle the first point is
     at; the redraw draws everything from it. */
  function turnArcs(state, delta, redraw) {
    var a0 = state.a;
    var pen = { t: 0 };
    var tl = M.timeline();
    tl.to(pen, {
      t: 1, duration: M.dur(0.95), ease: 'power2.inOut',
      onUpdate: function () { state.a = a0 + delta * pen.t; redraw(); }
    });
    return tl;
  }

  /* The circle carried to one side of the board, or back: a slide of the
     whole group, so nothing in it moves relative to anything else. */
  function slideArcs(group, x) {
    var tl = M.timeline({ willChange: group, willChangeValue: 'transform' });
    tl.to(group, { x: x, duration: M.dur(0.8), ease: 'power2.inOut' });
    return tl;
  }

  /* A point caught by the place it belongs: one pop, and the bead sound. */
  function snapDot(dot) {
    pop();
    var tl = M.timeline({ revert: function () { M.set(dot, { clearProps: 'transform' }); } });
    tl.fromTo(dot, { scale: 1, transformOrigin: 'center center' },
      { scale: 1.45, duration: M.dur(0.14), ease: 'power2.out' })
      .to(dot, { scale: 1, duration: M.dur(0.36), ease: M.POP });
    return tl;
  }

  /* Both halves made: the pieces swell together, once, and the points with
     them. */
  function arcsEqual(paths, dots) {
    sfx('correct');
    var tl = M.timeline({
      revert: function () { unswell(paths); M.set(dots, { clearProps: 'transform' }); }
    });
    swell(tl, paths, 0);
    tl.fromTo(dots, { scale: 1, transformOrigin: 'center center' },
      { scale: 1.4, duration: M.dur(0.16), ease: 'power2.out' }, 0)
      .to(dots, { scale: 1, duration: M.dur(0.4), ease: M.POP }, M.gap(0.16));
    return tl;
  }

  /* A box lit as the name in it is said. Its own pulse rather than
     M.pulse: an SVG group has to be told to scale about its own middle. */
  function boxPulse(box) {
    var tl = M.timeline({ revert: function () { M.set(box.g, { clearProps: 'transform' }); } });
    tl.to(box.g, { scale: 1.06, transformOrigin: 'center center',
                   duration: M.dur(0.18), ease: 'power2.out' })
      .to(box.g, { scale: 1, duration: M.dur(0.4), ease: M.POP });
    return tl;
  }

  /* ======================================================================
   * Section 3 -- segments (the scenes are in segments.js)
   * ----------------------------------------------------------------------
   * The third section is about the AREA inside the circle rather than the
   * line round it: the inside is lit as one, a chord is drawn across it,
   * and the two regions the chord makes are coloured in and named. The
   * beats for that are here, next to the arcs' beats they rhyme with.
   * ====================================================================== */

  /* The space inside, lit. The rim stands back to a shadow of itself and a
     wash grows out from the centre until it reaches the rim: colour poured
     into the shape, as fillDisc pours it, but SEEN to spread from the
     middle -- the beat is about the inside, so the inside is what moves. */
  var RIM_DIM = 0.35;

  function areaIn(rim, area) {
    M.set(area, { opacity: 0, scale: 0.22, transformOrigin: 'center center' });
    var tl = M.timeline({ willChange: [rim, area], willChangeValue: 'transform, opacity' });
    tl.to(rim, { opacity: RIM_DIM, duration: M.dur(0.55), ease: 'power2.inOut' }, 0);
    tl.to(area, { opacity: 1, scale: 1, duration: M.dur(0.85), ease: 'power2.out' }, 0);
    return tl;
  }

  /* The area lit once more as it is spoken of: a deeper wash for a beat --
     a class, which the stylesheet transitions -- and then back. Nothing
     moves: a disc scaled up would bulge past the rim it sits inside. */
  function areaPulse(area) {
    var tl = M.timeline({ revert: function () { area.classList.remove('is-lit'); } });
    tl.call(function () { area.classList.add('is-lit'); }, null, 0);
    tl.call(function () { area.classList.remove('is-lit'); }, null, M.gap(0.6));
    return tl;
  }

  /* The rim taken to a level: back to full when the edge is asked for
     again, because the next thing the learner does is tap it; down to a
     shadow while the two regions are held apart, so the outline is not
     seen to bind pieces that have come loose from each other. */
  function rimTo(rim, alpha, seconds) {
    var tl = M.timeline({ willChange: rim, willChangeValue: 'opacity' });
    tl.to(rim, { opacity: alpha, duration: M.dur(seconds || 0.4), ease: 'power2.inOut' });
    return tl;
  }
  function rimFull(rim) { return rimTo(rim, 1, 0.4); }

  /* A region coloured in, from the chord outward. The region is shown
     through a circle centred on the chord's middle -- a clip path, placed
     by segments.js -- that is grown from nothing until it has taken the
     whole region in: the colour is seen to spread from the cut into the
     piece it belongs to, which is what says the chord MADE the piece.
     `reach` is how far the circle has to grow to cover the region; it is
     left wide open after, so a later scene finds the region whole. */
  var CLIP_OPEN = 400;

  function segFill(region, clip, reach, seconds) {
    clip.setAttribute('r', 0);
    M.set(region, { opacity: 1 });
    var tl = M.timeline({ revert: function () { clip.setAttribute('r', CLIP_OPEN); } });
    tl.to(clip, { attr: { r: reach }, duration: M.dur(seconds || 0.6), ease: 'power2.out' }, 0);
    tl.call(pop, null, 0);
    return tl;
  }

  /* Both regions, one after the other: the smaller first, then the larger,
     the wash that lit the whole inside going as the second arrives, and
     the two points pulsing as the picture is complete -- the same close
     arcSweep gives the two pieces of the rim.
       o.minor / o.major are the two regions, o.clips their clip circles
     and o.reach how far each has to grow, o.area the wash under them,
     o.dots the two points. */
  var SEG_FILL = 0.6, SEG_GAP = 0.16;

  function segReveal(o) {
    var second = SEG_FILL + SEG_GAP;              /* when the larger sets off */
    var end = second + SEG_FILL;
    o.clips.forEach(function (c) { c.setAttribute('r', 0); });
    M.set([o.minor, o.major].concat(o.dots), { opacity: 1 });
    var tl = M.timeline({
      revert: function () { o.clips.forEach(function (c) { c.setAttribute('r', CLIP_OPEN); }); }
    });
    tl.to(o.clips[0], { attr: { r: o.reach[0] }, duration: M.dur(SEG_FILL), ease: 'power2.out' }, 0);
    tl.call(pop, null, 0);
    tl.to(o.clips[1], { attr: { r: o.reach[1] }, duration: M.dur(SEG_FILL), ease: 'power2.out' }, M.gap(second));
    tl.call(pop, null, M.gap(second));
    if (o.area) tl.to(o.area, { opacity: 0, duration: M.dur(0.45), ease: 'power2.out' }, M.gap(second));
    tl.to(o.dots, { scale: 1.4, transformOrigin: 'center center',
                    duration: M.dur(0.16), ease: 'power2.out' }, M.gap(end - 0.06))
      .to(o.dots, { scale: 1, duration: M.dur(0.34), ease: M.POP }, M.gap(end + 0.1));
    tl.call(pop, null, M.gap(end));
    return tl;
  }

  /* A line lit once: the swell the arcs use, about the line's own weight
     -- the figure's --part-weight unless told otherwise. */
  var PART_W = 4;

  function linePulse(paths, w) {
    var tl = M.timeline({ revert: function () { unswell(paths); } });
    swellTo(tl, paths, w || PART_W, 0);
    return tl;
  }

  /* The region the lesson is talking about, and the other stood back: `on`
     comes up to full and takes a deeper fill (a class -- the stylesheet
     transitions it), `off` drops to a quarter. A region is a filled shape,
     not a stroke, so there is no width to swell; the colour deepening is
     its swell. segUnfocus brings both back, plain. */
  var SEG_DIM = 0.26;

  function segFocus(on, off) {
    var tl = M.timeline({ willChange: on.concat(off), willChangeValue: 'opacity' });
    tl.call(function () {
      on.forEach(function (p) { p.classList.add('is-lit'); });
      off.forEach(function (p) { p.classList.remove('is-lit'); });
    }, null, 0);
    if (off.length) tl.to(off, { opacity: SEG_DIM, duration: M.dur(0.4), ease: 'power2.inOut' }, 0);
    if (on.length) tl.to(on, { opacity: 1, duration: M.dur(0.3), ease: 'power2.out' }, 0);
    return tl;
  }
  function segUnfocus(all) {
    var tl = M.timeline({ willChange: all, willChangeValue: 'opacity' });
    tl.call(function () { all.forEach(function (p) { p.classList.remove('is-lit'); }); }, null, 0);
    tl.to(all, { opacity: 1, duration: M.dur(0.4), ease: 'power2.inOut' }, 0);
    return tl;
  }

  /* ======================================================================
   * Section 4 -- sectors (the scenes are in sectors.js)
   * ----------------------------------------------------------------------
   * The fourth section cuts the circle's area with two RADII rather than a
   * chord, so the two regions are wedges that meet at the centre. Each is
   * revealed by being swept out from one radius round to the other -- the
   * region between the two radii, seen to be exactly that -- and a wedge
   * that is picked out is drawn a little way out of the circle and set
   * back, as a slice is lifted out of a pie. The beats are here, next to
   * the segments' beats they rhyme with.
   * ====================================================================== */

  /* One wedge, swept out. `wedge(t)` hands back the path for the wedge at
     t of its full sweep, 0 to 1: sectors.js knows the circle, this knows
     only the clock. The path is rewritten each frame, as turnArcs rewrites
     the arcs, and however the beat ends the wedge is left whole. */
  function secFill(region, wedge, seconds) {
    var pen = { t: 0 };
    function draw() { region.setAttribute('d', wedge(pen.t)); }
    draw();
    M.set(region, { opacity: 1 });
    var tl = M.timeline({ revert: function () { pen.t = 1; draw(); } });
    tl.to(pen, { t: 1, duration: M.dur(seconds || 0.6), ease: 'power2.inOut', onUpdate: draw }, 0);
    tl.call(pop, null, 0);
    return tl;
  }

  /* Both wedges, one after the other: the smaller first, then the larger,
     each swept from the point the learner placed LAST round to the first
     -- the close arcSweep gives the two pieces of the rim -- and the two
     points pulsing as the picture is complete.
       o.minor / o.major are the two regions, o.wedge(which, t) the path
     for either at t of its sweep, o.dots the two points. */
  function secSweep(o) {
    var second = SWEEP_MINOR + SWEEP_GAP;         /* when the larger sets off */
    var end = second + SWEEP_MAJOR;
    var pen = { a: 0, b: 0 };
    function draw() {
      o.minor.setAttribute('d', o.wedge('minor', pen.a));
      o.major.setAttribute('d', o.wedge('major', pen.b));
    }
    draw();
    M.set([o.minor, o.major].concat(o.dots), { opacity: 1 });
    var tl = M.timeline({ revert: function () { pen.a = 1; pen.b = 1; draw(); } });
    tl.to(pen, { a: 1, duration: M.dur(SWEEP_MINOR), ease: 'power2.inOut', onUpdate: draw }, 0);
    tl.call(pop, null, 0);
    tl.to(pen, { b: 1, duration: M.dur(SWEEP_MAJOR), ease: 'power2.inOut', onUpdate: draw }, M.gap(second));
    tl.call(pop, null, M.gap(second));
    tl.to(o.dots, { scale: 1.4, transformOrigin: 'center center',
                    duration: M.dur(0.16), ease: 'power2.out' }, M.gap(end - 0.06))
      .to(o.dots, { scale: 1, duration: M.dur(0.34), ease: M.POP }, M.gap(end + 0.1));
    tl.call(pop, null, M.gap(end));
    return tl;
  }

  /* The wedge the learner pressed, and it was the one asked for: it is
     drawn out of the circle along its own middle -- `away` is that {x, y}
     -- and settles back, lit. A slice lifted out of a pie and put back:
     the region is shown to be one PIECE, with the two radii as its edges.
     The lit shade stays; segFocus and segUnfocus take it from there. */
  function secRight(region, away) {
    sfx('correct');
    var tl = M.timeline({
      willChange: region, willChangeValue: 'transform',
      revert: function () { M.set(region, { clearProps: 'transform' }); }
    });
    tl.call(function () { region.classList.add('is-lit'); }, null, 0);
    tl.to(region, { x: away.x, y: away.y, duration: M.dur(0.22), ease: 'power2.out' }, 0)
      .to(region, { x: 0, y: 0, duration: M.dur(0.5), ease: M.POP }, M.gap(0.34));
    return tl;
  }

  /* And the wrong one: it turns red (a class -- the stylesheet transitions
     the fill) and shakes its head, as a refused box does, and holds the
     red for a beat before it is a plain region again. */
  function secWrong(region) {
    sfx('wrong');
    region.classList.add('is-wrong');
    var tl = M.timeline({
      willChange: region, willChangeValue: 'transform',
      revert: function () {
        region.classList.remove('is-wrong');
        M.set(region, { clearProps: 'transform' });
      }
    });
    var each = M.dur(0.3) / SHAKE.length;
    SHAKE.forEach(function (x, i) {
      tl.to(region, { x: x, duration: each,
                      ease: i === SHAKE.length - 1 ? 'power2.out' : 'none' });
    });
    tl.to({}, { duration: M.dur(0.5) });
    return tl;
  }

  global.Beats = {
    sfx: sfx,
    pop: pop,
    boardIn: boardIn,
    boardOut: boardOut,
    /* the circle */
    drawRim: drawRim,
    fillDisc: fillDisc,
    /* the centre */
    plantCentre: plantCentre,
    confirmCentre: confirmCentre,
    quietCentre: quietCentre,
    /* the callout */
    callout: callout,
    calloutOut: calloutOut,
    arrowOut: arrowOut,
    /* points and lines */
    plotDot: plotDot,
    growLine: growLine,
    copyRadius: copyRadius,
    glowLine: glowLine,
    becomeDiameter: becomeDiameter,
    showRule: showRule,
    drawChords: drawChords,
    /* the activity */
    plotPart: plotPart,
    boxIn: boxIn,
    dimPair: dimPair,
    showParts: showParts,
    trayIn: trayIn,
    trayOut: trayOut,
    choiceRight: choiceRight,
    choiceWrong: choiceWrong,
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
    welcomeOut: welcomeOut,
    /* section 2 -- arcs */
    ghostIn: ghostIn,
    ghostOut: ghostOut,
    arcSweep: arcSweep,
    arcPulse: arcPulse,
    arcSplit: arcSplit,
    arcJoin: arcJoin,
    arcFocus: arcFocus,
    arcUnfocus: arcUnfocus,
    labelIn: labelIn,
    labelsOut: labelsOut,
    dashedIn: dashedIn,
    nudgeTap: nudgeTap,
    nudgeSlide: nudgeSlide,
    nudgeStop: nudgeStop,
    turnArcs: turnArcs,
    slideArcs: slideArcs,
    snapDot: snapDot,
    arcsEqual: arcsEqual,
    boxPulse: boxPulse,
    /* section 3 -- segments */
    areaIn: areaIn,
    areaPulse: areaPulse,
    rimTo: rimTo,
    rimFull: rimFull,
    segFill: segFill,
    segReveal: segReveal,
    linePulse: linePulse,
    segFocus: segFocus,
    segUnfocus: segUnfocus,
    /* section 4 -- sectors */
    secFill: secFill,
    secSweep: secSweep,
    secRight: secRight,
    secWrong: secWrong
  };
})(window);
