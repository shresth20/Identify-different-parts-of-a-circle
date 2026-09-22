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
    centre:  'This is the center of the circle!',

    /* level 2 -- said over the whole of the fan being built */
    equal:   'Centre is the fixed point inside a circle from which all ' +
             'points on the circle are at an equal distance.',

    /* level 3 */
    tapLine:  'Tap on the line segment.',
    radius:   'Radius is a line segment that joins the centre to any point ' +
              'on the circle. Every radius of a circle is equal.',
    manyRadii: 'A circle can have infinitely many radii, and all of them ' +
               'have the same length.',

    /* level 4 */
    drawLine: 'Let\u2019s draw a single line segment which passes through ' +
              'the centre.',
    diameter: 'Diameter is a line segment through the centre with both ends ' +
              'on the circle. It is twice the radius.'
  };

  /* ---- pacing -----------------------------------------------------------
     The two kinds of pause in the lesson. A BEAT is the gap between one line
     and the next -- long enough to finish reading, short enough not to feel
     like a hang. A HOLD is a deliberate stop the script asks for. */
  var BEAT  = 560;
  var SHORT = 280;
  var HOLD_MASCOT = 3000;    /* "the mascot will remove after 3 sec" */

  /* A definition is read more slowly than a prompt is. 64ms a character puts
     level 2's sentence at a shade under seven seconds, which is also how long
     the fan it describes takes to build -- so the two finish together without
     either being paced off the other. */
  var NARRATE = 64;

  /* ---- the figure's own coordinates -------------------------------------
     The three numbers the circle in index.html is drawn with. Everything this
     file builds into the SVG is measured from them, so the fan and the radius
     cannot drift away from the shape they belong to. */
  var CX = 210, CY = 210, RR = 158;
  var RIM_N = 32;                   /* points round the rim, in level 2   */
  var RAY_N = 12;                   /* radii round the circle, in level 3 */
  var RAY_FROM = -30;               /* degrees: the one the learner tapped */
  var SVG_NS = 'http://www.w3.org/2000/svg';

  /* The two points level 4's line is drawn between: three o'clock and nine.
     They are the rim points at index 8 and 24 of the fan above, which is why
     the handles in index.html sit exactly on two of the dots. */
  var END_A = { x: CX - RR, y: CY };
  var END_B = { x: CX + RR, y: CY };

  var dom = null;
  var mascot = null;
  var fan = { dots: [], spokes: [] };
  var rays = { lines: [], ends: [] };
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
      hopper:   $('hopper'),

      board:    $('board'),
      slotHeader: $('slotHeader'),
      promptLine: document.querySelector('.prompt__line'),

      slotSide: $('slotSide'),

      figure:   $('figure'),
      rim:      $('rim'),
      disc:     $('disc'),
      centre:   $('centre'),
      dot:      document.querySelector('.centre__dot'),
      centreHit: $('centreHit'),

      mark:      $('centreMark'),
      markArrow: $('markArrow'),
      markHead:  $('markHead'),
      markLabel: $('markLabel'),

      dots:     $('rimDots'),
      spokes:   $('spokes'),

      radius:      $('radius'),
      radiusLine:  $('radiusLine'),
      radiusEnd:   $('radiusEnd'),
      radiusHit:   $('radiusHit'),
      radiusLabel: $('radiusLabelText'),
      radii:       $('radii'),

      chord:        $('chord'),
      chordPreview: $('chordPreview'),
      diaLeft:      $('diaLeft'),
      diaRight:     $('diaRight'),
      handleA:      $('handleA'),
      handleB:      $('handleB'),
      hitA:         $('hitA'),
      hitB:         $('hitB'),
      diaRLeft:     $('diaRLeft'),
      diaRRight:    $('diaRRight'),
      diaName:      $('diaName'),

      diaMark:  $('diaMark'),
      diaArrow: $('diaArrow'),
      diaHead:  $('diaHead'),
      diaLabel: $('diaLabel'),

      drawGate: $('drawGate'),
      nextBtn:  $('nextBtn')
    };
  }

  /* ---- the fan, built once ----------------------------------------------
     Thirty-two points evenly round the rim and the radius that reaches each
     one. Built rather than written into index.html -- sixty-four elements is
     not markup anyone should have to read -- and built in ONE order, from
     twelve o'clock clockwise, because that is the order the beats lay them
     down in and the order a hand would draw them.
       Every spoke starts at the same pair of numbers the centre dot is drawn
     at, so the point they converge on is the point the dot covers, exactly. */
  function round2(n) { return Math.round(n * 100) / 100; }

  function buildFan(spokesG, dotsG) {
    var dots = [], spokes = [];
    for (var i = 0; i < RIM_N; i++) {
      var a = -Math.PI / 2 + (i / RIM_N) * Math.PI * 2;
      var x = round2(CX + Math.cos(a) * RR);
      var y = round2(CY + Math.sin(a) * RR);

      var spoke = document.createElementNS(SVG_NS, 'path');
      spoke.setAttribute('class', 'spoke');
      spoke.setAttribute('d', 'M' + CX + ' ' + CY + ' L' + x + ' ' + y);
      spokesG.appendChild(spoke);
      spokes.push(spoke);

      var dot = document.createElementNS(SVG_NS, 'circle');
      dot.setAttribute('class', 'rim-dot');
      dot.setAttribute('cx', x);
      dot.setAttribute('cy', y);
      dot.setAttribute('r', 5.4);
      dotsG.appendChild(dot);
      dots.push(dot);
    }
    return { dots: dots, spokes: spokes };
  }

  /* The rest of the radii, at even steps round from the one the learner taps
     in level 3. Index 0 of that ring IS that radius -- it is drawn in
     index.html because it is the one the level is about -- so the ring built
     here starts at 1 and the two together make the whole twelve.
       Lines first and points after, all of them, rather than in pairs: every
     point then paints over every line, including the ones drawn after it. */
  function buildRadii(group) {
    var lines = [], ends = [];
    for (var k = 1; k < RAY_N; k++) {
      var a = (RAY_FROM + k * (360 / RAY_N)) * Math.PI / 180;
      var x = round2(CX + Math.cos(a) * RR);
      var y = round2(CY + Math.sin(a) * RR);

      var line = document.createElementNS(SVG_NS, 'path');
      line.setAttribute('class', 'radius-ray');
      line.setAttribute('d', 'M' + CX + ' ' + CY + ' L' + x + ' ' + y);
      lines.push(line);

      var end = document.createElementNS(SVG_NS, 'circle');
      end.setAttribute('class', 'radius-end');
      end.setAttribute('cx', x);
      end.setAttribute('cy', y);
      end.setAttribute('r', 6.4);
      ends.push(end);
    }
    lines.forEach(function (el) { group.appendChild(el); });
    ends.forEach(function (el) { group.appendChild(el); });
    return { lines: lines, ends: ends };
  }

  /* ---- the figure, as a whole -------------------------------------------
     Every mark that can be on the circle at once, in one list: what a level
     hands back when it is over, and what a replay has to undo. */
  function figureParts() {
    return [dom.rim, dom.disc, dom.dots, dom.spokes, dom.radius, dom.radii,
            dom.chord, dom.centre, dom.mark, dom.diaMark];
  }

  /* Back to an empty stage. Every group hidden, every state class off, every
     inline write handed back -- and the dash patterns with them, because a
     stroke caught half drawn would otherwise start its next draw already
     half made. The figure's own transform goes too: a level that split the
     board left it standing a quarter of the stage to the left. */
  function resetFigure() {
    dom.centre.setAttribute('hidden', '');
    dom.centre.classList.remove('is-calling', 'is-found', 'is-quiet');
    dom.mark.setAttribute('hidden', '');
    dom.diaMark.setAttribute('hidden', '');
    dom.dots.setAttribute('hidden', '');
    dom.spokes.setAttribute('hidden', '');
    dom.radius.setAttribute('hidden', '');
    dom.radius.classList.remove('is-calling', 'is-found');
    dom.radii.setAttribute('hidden', '');

    dom.chord.setAttribute('hidden', '');
    dom.chord.classList.remove('is-guiding', 'is-drawing', 'is-drawn');
    dom.handleA.classList.remove('is-held');
    dom.handleB.classList.remove('is-held');
    dom.diaLeft.classList.remove('is-radius');
    dom.diaRight.classList.remove('is-radius');
    /* The rubber line keeps whatever the last stroke left in its `d`. */
    dom.chordPreview.setAttribute('d', 'M' + END_A.x + ' ' + END_A.y +
                                       ' L' + END_A.x + ' ' + END_A.y);

    var dashed = [dom.rim, dom.markArrow, dom.markHead, dom.radiusLine,
                  dom.diaArrow, dom.diaHead, dom.diaLeft, dom.diaRight]
                   .concat(fan.spokes, rays.lines);

    M.set(dashed.concat(
            [dom.figure, dom.disc, dom.centre, dom.dot, dom.mark, dom.markLabel,
             dom.dots, dom.spokes, dom.radius, dom.radiusEnd,
             dom.radiusLabel, dom.radii,
             dom.chord, dom.chordPreview, dom.handleA, dom.handleB,
             dom.diaRLeft, dom.diaRRight, dom.diaName,
             dom.diaMark, dom.diaLabel],
            fan.dots, rays.ends),
          { clearProps: 'opacity,transform,strokeWidth' });

    dashed.forEach(function (p) {
      p.style.strokeDasharray = '';
      p.style.strokeDashoffset = '';
    });
  }

  /* The ripple goes where the finger landed. A keyboard activation has no
     coordinates, so it gets the target's own centre instead. */
  function ripple(ev, el) {
    var r = el.getBoundingClientRect();
    M.tapRipple((ev && ev.clientX) || (r.left + r.width / 2),
                (ev && ev.clientY) || (r.top + r.height / 2));
  }

  /* A promise the scene may never get round to awaiting: a tap armed several
     beats before it is wanted, or one half of a two-part beat whose other
     half rejected first. Retiring a scene -- a replay, or the level bar
     jumping to another level -- rejects every wait it owns, and the ones
     nobody awaited would surface as unhandled rejections. CANCELLED is
     control flow, not a fault, so that noise is swallowed here. The promise
     is handed back untouched: whoever DOES await it still unwinds with the
     rest of the chain.
       Note the deliberate `.catch(...)` on the promise itself rather than on
     what it returns -- it is the original that has to be seen to be handled. */
  function quiet(p) {
    if (p && p.catch) p.catch(function () {});
    return p;
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

  /* ---- the mascot's jump on and off the board --------------------------
   * The bird does not appear in the header and it does not disappear from
   * it. It comes up from BEHIND the board, arcs over its top edge and drops
   * onto its spot beside the line; when the line is done it crouches,
   * springs off the spot and falls back down behind the same edge. Nothing
   * fades anywhere in either.
   *
   * Two elements share each arc, because one cannot do it. The bird's spot
   * is a cell inside the board, and nothing inside the board can hide behind
   * it -- a transform does not clip, and overflow:hidden on the board would
   * clip the figure with it. So the arc is cut at its apex:
   *
   *   arriving  rising out from behind the edge  the hopper, under the board
   *             dropping onto the spot           the in-board sprite
   *   leaving   crouch and spring off the spot   the in-board sprite
   *             falling back behind the edge     the hopper, under the board
   *
   * They swap at the apex, and only there, because that is the one point in
   * the arc where neither of them overlaps the board -- and so the one point
   * where "painted under the board" and "painted over it" look the same.
   * Same artwork (Mascot.mirror dresses the hopper from the bird's own
   * player), same size, same pixel, so the cut has nothing to give away.
   */

  /* The sprite cell carries transparent margin: the bird's feet sit about
     nine tenths of the way down it. Everything below is about the BIRD, not
     about the cell. */
  var FOOT = 0.90;
  var CLEAR = 8;      /* the feet pass this far above the board's top edge  */
  var PARK = 14;      /* how far below the edge the hopper waits, covered   */

  /* Where the top of the arc is.
       High enough that the whole of the BIRD is above the board's top edge,
     which is the one thing the apex has to be: swap with any part of it
     still over the board and the hopper's half is cut off by the board
     while the sprite's half is not, which is exactly the flicker the swap
     exists to hide.
       Which means, on a board this size, that the bird goes off the top of
     the screen -- the board is a 16:9 frame in a 100dvh shell, so the gap
     above it is a few dozen pixels and the bird is a couple of hundred tall.
     That is not a fault to be designed around, and it is what the reference
     game does: measured there, the apex lands 80-odd pixels above the top of
     the window and the frame at the peak of the arc shows a pair of feet
     over the board's edge and nothing else. The viewport clips both sprites
     at the same line -- the hopper is fixed, the bird is inside a board that
     cannot scroll -- so the swap stays invisible up there, and the read is
     of a bird that has really jumped rather than one that has risen politely
     to a mark. */
  function flightPlan(cell) {
    var b = dom.board.getBoundingClientRect();
    return {
      /* the cell's vertical CENTRE at the apex: centre, because that is what
         GSAP's transforms are about, so one number places both sprites */
      centre: b.top - CLEAR - (FOOT - 0.5) * cell.height,
      park: b.top + PARK
    };
  }

  /* The hopper is dressed and displayed for the length of one flight and no
     longer: it is a second copy of the character, and a second copy left
     standing over the next scene is the one way this trick can show. */
  function hopperOff() {
    dom.hopper.classList.remove('on');
    mascot.unmirror(dom.hopper);
  }
  function jumpDone() {
    hopperOff();
    M.set([mascot.el, dom.hopper], { clearProps: 'transform' });
  }

  /* Up from behind the board, and down onto the spot. */
  function mascotJumpIn(slot) {
    var el = mascot.el;
    /* Away FIRST, then re-parented: the bird is standing out on the field
       under the board, and moving it into the board while it is still
       visible would paint it on top of the board for a frame. */
    el.classList.add('is-away');
    el.hidden = false;
    mascot.placeIn(slot || dom.slotHeader);

    var cell = el.getBoundingClientRect();
    /* A spot with no box -- not laid out yet -- and a learner who has asked
       for less motion both get the bird, just not the trip. */
    if (!cell.width || M.reducedMotion()) {
      el.classList.remove('is-away');
      return Promise.resolve();
    }

    var plan = flightPlan(cell);
    M.set(dom.hopper, {
      left: cell.left, top: plan.park, width: cell.width, height: cell.height,
      y: 0
    });
    mascot.mirror(dom.hopper);            /* dressed BEFORE it is shown */
    dom.hopper.classList.add('on');

    return Flow.anim(Beats.hopUp(dom.hopper,
                                 plan.centre - (plan.park + cell.height / 2)))
      .then(function () {
        /* The spot is measured AGAIN here rather than taken from the box
           read before the jump: the line reserved its width while the bird
           was in the air, and the row is centred as a pair, so the spot has
           slid sideways underneath it. Starting the drop from the stale box
           puts the sprite somewhere other than where the hopper is standing,
           and the swap paints the bird in two places on consecutive frames
           -- exactly the flicker the swap exists to hide. */
        var at = el.getBoundingClientRect();
        var from = plan.centre - (at.top + at.height / 2);

        /* The start of the drop is written BEFORE the bird is shown, or a
           frame painted before the first sample catches it sitting at its
           destination. The hopper goes after that and not one statement
           sooner: its last painted frame has to still be on screen when the
           sprite takes over. */
        M.set(el, { y: from });
        el.classList.remove('is-away');
        hopperOff();

        return Flow.anim(Beats.landOn(el, from));
      })
      .then(jumpDone, function (err) { jumpDone(); throw err; });
  }

  /* Crouch, spring off the spot, and fall back behind the board. */
  function mascotJumpOut() {
    var el = mascot.el;
    if (el.hidden || el.classList.contains('is-away')) return Promise.resolve();

    var cell = el.getBoundingClientRect();
    if (!cell.width || M.reducedMotion()) {
      el.classList.add('is-away');
      return Promise.resolve();
    }

    var plan = flightPlan(cell);
    return Flow.anim(Beats.springOff(el,
                                     plan.centre - (cell.top + cell.height / 2)))
      .then(function () {
        /* Where the sprite ACTUALLY ended up, not where it was aimed: GSAP
           leaves the spring's last frame standing, so this is the bird's own
           painted box and the hopper takes over from exactly there. Read
           before anything hands that transform back. */
        var at = el.getBoundingClientRect();
        M.set(dom.hopper, {
          left: cell.left, top: cell.top, width: cell.width, height: cell.height,
          y: (at.top + at.height / 2) - (cell.top + cell.height / 2)
        });
        mascot.mirror(dom.hopper);
        dom.hopper.classList.add('on');
        el.classList.add('is-away');     /* the sprite goes only once the */
                                         /* hopper is up in its place     */
        return Flow.anim(Beats.hopDown(dom.hopper, plan.park - cell.top));
      })
      .then(jumpDone, function (err) { jumpDone(); throw err; });
  }

  /* Straight across the face of the board, from wherever the bird is standing
     to the mark it is wanted on. No hopper and no trip behind the board: both
     cells are INSIDE the board and both are painted on the header's rung, so
     there is nothing on the way for the bird to hide behind -- and an arc cut
     at an apex off the top of the board, which is what the flights above are
     made of, would read as two jumps with a pause in the middle rather than
     as one.
       Measured the way a Flip is: where the bird is, then the move, then
     where the new slot has put it, and the difference played as the arc. The
     two slots are different sizes, so the difference is a scale as well as a
     distance, and both are taken from the FEET -- the one point of the sprite
     that has to land where the slot says it stands. */
  function mascotHopTo(slot) {
    var el = mascot.el;
    /* Nothing to hop FROM: the bird is behind the board, where the previous
       level's exit jump left it. That is the ordinary arrival, up over the
       board's top edge. */
    if (!slot || el.hidden || el.classList.contains('is-away')) {
      return mascotJumpIn(slot);
    }

    var from = el.getBoundingClientRect();
    mascot.placeIn(slot);
    var to = el.getBoundingClientRect();
    /* A slot with no box -- not laid out yet -- and a learner who has asked
       for less motion both get the bird on its new mark, just not the trip. */
    if (!from.width || !to.width || M.reducedMotion()) return Promise.resolve();

    function done() { M.set(el, { clearProps: 'transform,transformOrigin' }); }

    return Flow.anim(Beats.hopAcross(el, {
      dx: (from.left + from.width / 2) - (to.left + to.width / 2),
      dy: (from.top + from.height * FOOT) - (to.top + to.height * FOOT),
      scale: from.height / to.height,
      lift: to.height * 0.42,
      foot: FOOT
    })).then(done, function (err) { done(); throw err; });
  }

  /* The bird comes up to say a line.
       The line is RESERVED before the jump starts. The prompt row is centred
     as a pair, so the bird's resting spot depends on how wide the finished
     line makes the row -- jump against an empty row and it aims at the
     middle of the header, then gets shoved sideways the moment the words
     take their space. Reserved first, it lands where the line will really
     put it. (The apex re-measures regardless, which is what covers a beat
     that cannot reserve first.)
       It starts talking on landing, not before: the hopper is showing
     whatever the bird is showing, and a bird chattering its way through the
     air is talking to the ceiling. */
  function arriveSaying(text) {
    var reveal = sayPrompt.reserve(text);
    return mascotJumpIn().then(function () {
      mascot.state('talking');
      return reveal();
    });
  }

  /* ---- the board's right half ------------------------------------------
     Levels 2 and 3 both end with the board split down the middle: the figure
     steps a quarter of the stage to the left, which centres the circle in the
     left half, and the bird comes up in the middle of the right one to say
     what the learner has just been shown.
       The bubble goes with it. One bubble serves the whole lesson -- it is
     re-parented between slots exactly as the bird is -- and .bubble--side is
     what hangs it off its right edge instead of its left, so a long sentence
     grows out over the empty half of the board rather than off the edge of
     it.
       How the bird gets there is left to mascotHopTo: from behind the board
     it rises over the top edge as it always does, and from a mark it is
     already standing on -- the header, at the end of level 3 -- it hops
     straight across. */
  function toSideSlot() {
    dom.slotSide.appendChild(dom.bubble);
    dom.bubble.classList.add('bubble--side');
    return mascotHopTo(dom.slotSide);
  }

  /* The box opened beside the bird, still empty.
       Three things happen on this screen and they happen in this order: the
     bird arrives, a box opens next to it, and the box then fills with words.
     Which is why opening and saying are two calls rather than one -- the
     board's header does it the other way round, words and box together,
     because there the box is a line of the board and not an object that
     arrives.
       The line is RESERVED first all the same, before the box is armed and
     long before a word of it is visible. Two reasons, and both are about the
     box being the right size from its first frame: a box that opens empty and
     then grows around the words reads as a glitch, and the mirrored bubble is
     anchored by a tail hanging off its RIGHT edge, so the very point it
     unfolds from is measured back from its own width.
       Hands back the function that then fills it. */
  function sideOpen(text, over) {
    var reveal = sayBubble.reserve(text, over);
    Beats.bubbleArm(dom.bubble);
    return Flow.anim(Beats.bubbleIn(dom.bubble)).then(function () {
      return reveal;
    });
  }

  /* Open it, and say the line into it a beat later. The beat is the point:
     it is the moment the box is read as having arrived, before anything is
     written in it. The bird starts talking with the words, not with the box
     -- a bird already talking to an empty box is talking to nothing. */
  /* A second line into a box that is already open. Nothing re-opens: the
     typer was built with the bubble as its box, so Flip eases the box from one
     line's size to the next's while the new words -- laid out, still invisible
     -- wait inside it. */
  function sideNext(text, over) {
    mascot.state('talking');
    return sayBubble(text, over);
  }

  function sideSay(text, over) {
    return sideOpen(text, over)
      .then(function (reveal) { return Flow.wait(SHORT).then(function () { return reveal; }); })
      .then(function (reveal) {
        mascot.state('talking');
        return reveal();
      });
  }

  /* The bubble back on the bird's own mark out in the field, shut and blank.
     Called between levels, so the next one that opens it is not opening a box
     that is still wearing the last one's shape. */
  function restoreBubble() {
    sayBubble.clear();
    dom.slotHero.appendChild(dom.bubble);
    dom.bubble.classList.remove('bubble--side');
    dom.bubble.setAttribute('hidden', '');
    M.set(dom.bubble, { clearProps: 'opacity,transform' });
  }

  /* ---- the line the learner draws ---------------------------------------
     Level 4 asks for a line to be DRAWN rather than tapped, which is the one
     thing in this lesson a click cannot say. Both ways of doing it are taken:

       drag      press one end, pull across, let go on or near the other
       two taps  tap one end, then tap the other -- which is also what a
                 keyboard does, with Enter or Space on each

     A drag never lands as a click on the element it finished over, so neither
     of those can be a Flow.once on the far end. Instead the stroke fires a
     click at a hidden element of its own (see #drawGate in index.html) and the
     scene waits on THAT -- so the wait is an ordinary Flow.once, cancelled
     with the rest of the chain when a scene is retired, and the listeners come
     off whichever way it ends.
       `live` rather than a flag per listener: a stroke can finish from four
     places, and every one of them must be able to say "that was the last
     thing this interaction does" in one line. */
  var SNAP = 48;         /* viewBox units: how near the far end counts as on it */
  var TAP_SLOP = 8;      /* px: a press that travelled less than this was a tap */

  function armStroke() {
    var svg = dom.figure;
    var ends = {
      a: { at: END_A, hit: dom.hitA, el: dom.handleA },
      b: { at: END_B, hit: dom.hitB, el: dom.handleB }
    };
    var picked = null;          /* 'a' | 'b' -- the end in hand, if any */
    var dragging = false;
    var origin = null;
    var live = true;

    /* Where the pointer is in the FIGURE's coordinates, which is the only
       space the rubber line can be drawn in. getScreenCTM carries the board's
       own scaling with it, so this holds at every board size. */
    function local(ev) {
      var m = svg.getScreenCTM && svg.getScreenCTM();
      if (!m) return null;
      var p = svg.createSVGPoint();
      p.x = ev.clientX;
      p.y = ev.clientY;
      return p.matrixTransform(m.inverse());
    }
    function other(k) { return k === 'a' ? 'b' : 'a'; }
    function within(p, at) {
      if (!p) return false;
      var dx = p.x - at.x, dy = p.y - at.y;
      return dx * dx + dy * dy <= SNAP * SNAP;
    }

    function hold(k) {
      picked = k;
      dom.handleA.classList.toggle('is-held', k === 'a');
      dom.handleB.classList.toggle('is-held', k === 'b');
    }
    function letGo() {
      picked = null;
      dom.handleA.classList.remove('is-held');
      dom.handleB.classList.remove('is-held');
    }
    function rubber(to) {
      var from = ends[picked].at;
      dom.chordPreview.setAttribute('d',
        'M' + from.x + ' ' + from.y + ' L' + round2(to.x) + ' ' + round2(to.y));
      dom.chord.classList.add('is-drawing');
    }
    function drop() {
      dragging = false;
      dom.chord.classList.remove('is-drawing');
    }

    function finish() {
      if (!live) return;
      live = false;
      dom.drawGate.dispatchEvent(new MouseEvent('click'));
    }

    function onDown(key) {
      return function (ev) {
        if (!live) return;
        ev.preventDefault();
        /* The far end, with one already in hand: that is the line, drawn in
           two taps. */
        if (picked && picked !== key) return finish();
        hold(key);
        dragging = true;
        origin = { x: ev.clientX, y: ev.clientY };
        var p = local(ev);
        if (p) rubber(p);
      };
    }
    function onKey(key) {
      return function (ev) {
        if (!live) return;
        if (ev.key !== 'Enter' && ev.key !== ' ' && ev.key !== 'Spacebar') return;
        ev.preventDefault();
        if (picked && picked !== key) return finish();
        hold(key);
      };
    }
    function onMove(ev) {
      if (!live || !dragging) return;
      var p = local(ev);
      if (p) rubber(p);
    }
    function onUp(ev) {
      if (!live || !dragging) return;
      if (within(local(ev), ends[other(picked)].at)) return finish();

      /* Not the far end. A press that never really moved was a tap, and the
         end it was made on stays in hand for the tap that completes the line;
         anything else was a drag given up on, and the line lets go. */
      var slip = Math.abs(ev.clientX - origin.x) +
                 Math.abs(ev.clientY - origin.y);
      if (slip > TAP_SLOP) letGo();
      drop();
    }

    var downA = onDown('a'), downB = onDown('b');
    var keyA = onKey('a'), keyB = onKey('b');

    function off() {
      dom.hitA.removeEventListener('pointerdown', downA);
      dom.hitB.removeEventListener('pointerdown', downB);
      dom.hitA.removeEventListener('keydown', keyA);
      dom.hitB.removeEventListener('keydown', keyB);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      live = false;
      drop();
      /* And the end that was in hand lets go of its lit halo. The class
         outlives the interaction otherwise -- .is-drawn turns the ends into
         plain points on the circle, and a lit one among them reads as still
         asking for something. */
      letGo();
    }

    dom.hitA.addEventListener('pointerdown', downA);
    dom.hitB.addEventListener('pointerdown', downB);
    dom.hitA.addEventListener('keydown', keyA);
    dom.hitB.addEventListener('keydown', keyB);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);

    return Flow.once(dom.drawGate).then(
      function (ev) { off(); return ev; },
      function (err) { off(); throw err; });
  }

  /* ---- the circle, drawn --------------------------------------------------
     Outline first, colour second, with a pause between them: two acts, not
     one. Every level opens with it, so it is written once. */
  function drawCircle() {
    return Flow.anim(Beats.drawRim(dom.rim))
      .then(function () { return Flow.wait(180); })
      .then(function () { return Flow.anim(Beats.fillDisc(dom.disc)); });
  }

  /* ---- a level, over ------------------------------------------------------
     The bird leaves and the board is wiped in the same beat. They have
     nothing to do with each other -- which is the point: what the learner
     reads is the board being cleared, not a list of things being undone. */
  function wipeBoard() {
    var gone = mascotJumpOut();
    var shut = Flow.anim(Beats.bubbleOut(dom.bubble));
    var line = Flow.anim(Beats.lineOut(dom.promptLine));
    var figure = Flow.anim(Beats.clearFigure(figureParts()));

    return Promise.all([gone, shut, line, figure]).then(function () {
      clearPrompt();
      restoreBubble();
      resetFigure();
    });
  }

  /* ======================================================================
   * The lesson
   * ====================================================================== */
  /* ======================================================================
   * The lesson, one scene per level
   * ----------------------------------------------------------------------
   * Every scene opens on the board the scene before it left behind, and
   * closes having wiped it again -- which is what makes a scene playable on
   * its own. The level bar leans on exactly that: stageFor() puts the board
   * into the state a scene expects to find, and the scene then plays itself
   * normally from its first beat, with nothing fast-forwarded and no beat
   * skipped.
   * ====================================================================== */

  /* ---- Scene 0 -- welcome ----------------------------------------------
     The bird is waving before a word is on screen, so the first thing that
     moves is the character rather than the interface. */
  function sceneWelcome() {
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
           standing, not a leap. Re-parent FIRST so Flip measures the move
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
      .then(function () { return handOver(dom.nextBtn); });
  }

  /* ======================================================================
   * Scene 1 -- Level 1: the centre
   * ====================================================================== */
  function sceneCentre() {
    /* Armed at the moment the dot becomes tappable, awaited several beats
       later -- see step 6. */
    var tapped = null;

    /* ---- 2. The board --------------------------------------------------
       The bubble goes first, then the board grows in over the bird. It does
       not need to be told to hide: the hero slot sits UNDER the board on the
       --z ladder, so the board closing over it is the exit. */
    return Flow.anim(Beats.bubbleOut(dom.bubble))
      .then(function () {
        sayBubble.clear();
        return Flow.anim(Beats.boardIn(dom.board));
      })

      /* ---- 3. The circle ------------------------------------------------- */
      .then(function () { return Flow.wait(SHORT); })
      .then(drawCircle)

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
        /* Both at once, as one beat: the bird springs off the header and the
           line blurs out under it. Started together, awaited together -- the
           jump is much the longer of the two, and the board is not the
           learner's until the bird is actually gone. */
        var gone = quiet(mascotJumpOut());
        return Flow.anim(Beats.lineOut(dom.promptLine)).then(function () {
          return gone;
        });
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
        tapped = quiet(Flow.once(dom.centreHit));
        return Flow.wait(BEAT);
      })
      .then(function () { return arriveSaying(LINES.tapDot); })
      .then(function () { mascot.settle(); })

      /* ---- 6. Tapped ------------------------------------------------------ */
      .then(function () { return tapped; })
      .then(function (ev) {
        ripple(ev, dom.centreHit);
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

        /* The arrow and the words are ONE statement, so they arrive together:
           the arrow reaches in to the dot while the bird says what the dot
           is. The line is started first only because sayInHeader measures the
           bird's spot before and after it reserves its width -- the arrow is
           drawn in the figure's own coordinates and has nothing to measure. */
        var said = sayInHeader(LINES.centre);
        var named = Flow.anim(Beats.callout(dom.mark, dom.markArrow,
                                            dom.markHead, dom.markLabel));
        return Promise.all([said, named]);
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(BEAT);
      })
      .then(function () { return handOver(dom.nextBtn); });
  }

  /* ======================================================================
   * Scene 2 -- Level 2: every point on the circle is the same distance out
   * ====================================================================== */
  function sceneEqual() {
    /* ---- 7. A clean board ---------------------------------------------- */
    return wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- 8. The circle again, and then it stands aside ------------------
         Drawn in the middle, where the last level left it, and only then
         moved: the learner has to see it is the SAME circle before it goes
         anywhere, or the move reads as a new figure arriving. */
      .then(drawCircle)
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.splitStage(dom.figure)); })

      /* ---- 9. And the bird comes up on the other half --------------------- */
      .then(toSideSlot)
      .then(function () { return Flow.wait(SHORT); })

      /* ---- 10. The points, the centre, and the distance to each one -------
         The sentence and the diagram run TOGETHER rather than one after the
         other -- that is what makes it a narration and not a caption. They
         are paced to finish together: thirty-two dots, the centre, and the
         fan come to a little under seven seconds, and so does the line at
         NARRATE (see the pacing block at the top of this file). */
      .then(function () { return sideOpen(LINES.equal, { perChar: NARRATE }); })
      /* A beat with the box open and empty, so it is read as having arrived
         before anything is written in it. The handle to fill it is carried
         through the wait -- a bare Flow.wait would resolve with nothing. */
      .then(function (reveal) {
        return Flow.wait(SHORT).then(function () { return reveal; });
      })
      .then(function (reveal) {
        mascot.state('talking');
        var said = reveal();

        var drawn = Flow.anim(Beats.popDots(dom.dots, fan.dots))
          .then(function () { return Flow.wait(240); })
          .then(function () {
            /* `call: false`: this centre is a piece of the diagram, not a
               target -- no halo, no invitation, and nothing to tap. */
            return Flow.anim(Beats.plantCentre(dom.centre, dom.dot,
                                               { call: false }));
          })
          .then(function () { return Flow.wait(320); })
          .then(function () {
            return Flow.anim(Beats.drawSpokes(dom.spokes, fan.spokes));
          });

        return Promise.all([said, drawn]);
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(BEAT);
      })
      .then(function () { return handOver(dom.nextBtn); });
  }

  /* ======================================================================
   * Scene 3 -- Level 3: the radius
   * ====================================================================== */
  function sceneRadius() {
    var tapped = null;

    /* ---- 11. A clean board, and the circle back in the middle ---------- */
    return wipeBoard()
      .then(function () { return Flow.wait(BEAT); })
      .then(drawCircle)

      /* ---- 12. The centre, a point on the rim, and the segment between ----
         In that order, because that is the order the definition is in: the
         centre, and a point on the circle, and the line that joins them. A
         segment drawn before its endpoint exists is a line that happens to
         stop somewhere. */
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Flow.anim(Beats.plantCentre(dom.centre, dom.dot, { call: false }));
      })
      .then(function () { return Flow.wait(220); })
      .then(function () {
        return Flow.anim(Beats.plotRimPoint(dom.radius, dom.radiusEnd));
      })
      .then(function () { return Flow.wait(180); })
      .then(function () {
        return Flow.anim(Beats.growRadius(dom.radius, dom.radiusLine));
      })

      /* ---- 13. Asked for, and tapped -------------------------------------
         Listening starts the moment the segment starts glowing, which is the
         moment it starts LOOKING tappable -- a good second before the bird
         gets to the header to ask for it. Armed only after the line, and the
         tap of anyone who did not wait to be told is swallowed. */
      .then(function () {
        tapped = quiet(Flow.once(dom.radiusHit));
        return Flow.wait(SHORT);
      })
      .then(function () { return arriveSaying(LINES.tapLine); })
      .then(function () { mascot.settle(); })
      .then(function () { return tapped; })
      .then(function (ev) {
        ripple(ev, dom.radiusHit);
        mascot.state('happy');
        var named = Flow.anim(Beats.confirmRadius(dom.radius, dom.radiusLine,
                                                  dom.radiusLabel));
        var cleared = Flow.anim(Beats.lineOut(dom.promptLine));
        return Promise.all([named, cleared]);
      })
      .then(clearPrompt)

      /* ---- 14. And what a radius is --------------------------------------
         The bird hops straight off the header onto its mark beside the
         circle, and the circle steps aside under it as it goes: the board is
         being re-set for the sentence, and two moves read as one re-set only
         if they happen together. One flight rather than a jump off the board
         and a second one back onto it -- the bird has just been talking to
         the learner from the header and it has nowhere to be in between. */
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        var flown = toSideSlot();
        var moved = Flow.anim(Beats.splitStage(dom.figure));
        return Promise.all([flown, moved]);
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return sideSay(LINES.radius, { perChar: NARRATE }); })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- 15. And there are as many of them as you like ------------------
         The second line goes into the box that is already open -- it eases
         from one sentence's shape to the next's rather than shutting and
         re-opening -- and the other eleven radii sweep out under it. The word
         on the first one goes as they start: it named that one segment, and
         with twelve on screen it would read as naming the group. */
      .then(function () {
        var said = sideNext(LINES.manyRadii, { perChar: NARRATE });
        var drawn = Flow.anim(Beats.fanRadii(dom.radii, rays.lines, rays.ends,
                                             dom.radiusLabel));
        return Promise.all([said, drawn]);
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(BEAT);
      })
      .then(function () { return handOver(dom.nextBtn); });
  }

  /* ======================================================================
   * Scene 4 -- Level 4: the diameter
   * ====================================================================== */
  function sceneDiameter() {
    /* ---- 16. A clean board, the circle, its rim and its centre ----------
       Every point on the rim goes down again here, and it is not decoration:
       the line the learner is about to draw runs between two of them, and a
       pair of ends with nothing else around them would read as the only two
       points there are. */
    return wipeBoard()
      .then(function () { return Flow.wait(BEAT); })
      .then(drawCircle)
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.popDots(dom.dots, fan.dots)); })
      .then(function () { return Flow.wait(220); })
      .then(function () {
        return Flow.anim(Beats.plantCentre(dom.centre, dom.dot, { call: false }));
      })

      /* ---- 17. Asked for, and shown ---------------------------------------
         The bird says what to draw and the board then shows it: a ghost of the
         line draws itself left to right, over and over, while the two ends it
         runs between breathe. Said first and shown second -- a demonstration
         running under a sentence is competing with it. */
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return arriveSaying(LINES.drawLine); })
      .then(function () {
        mascot.settle();
        return Flow.anim(Beats.guideChord(dom.chord,
                                          [dom.handleA, dom.handleB]));
      })

      /* ---- 18. Drawn ------------------------------------------------------
         Three things at once, and they are one event: the line is laid down
         for real, every other point on the rim is swept away under it, and the
         instruction leaves. What is left is the figure the next beat names. */
      .then(armStroke)
      .then(function () {
        mascot.state('happy');
        var laid = Flow.anim(Beats.settleChord(dom.chord,
                                               [dom.diaLeft, dom.diaRight]));
        var swept = Flow.anim(Beats.clearDots(dom.dots, fan.dots));
        var said = Flow.anim(Beats.lineOut(dom.promptLine));
        return Promise.all([laid, swept, said]);
      })
      .then(clearPrompt)
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Flow.anim(Beats.callout(dom.diaMark, dom.diaArrow,
                                       dom.diaHead, dom.diaLabel));
      })

      /* ---- 19. And what a diameter is -------------------------------------
         The callout has done its job -- the line has a name -- so it goes with
         the bird and the board splits under both of them, all in one beat. */
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        var gone = mascotJumpOut();
        var faded = Flow.anim(Beats.clearFigure([dom.diaMark]));
        var moved = Flow.anim(Beats.splitStage(dom.figure));
        return Promise.all([gone, faded, moved]);
      })
      .then(function () {
        dom.diaMark.setAttribute('hidden', '');
        M.set(dom.diaMark, { clearProps: 'opacity' });
        return toSideSlot();
      })
      .then(function () { return sideOpen(LINES.diameter, { perChar: NARRATE }); })
      .then(function (reveal) {
        return Flow.wait(SHORT).then(function () { return reveal; });
      })

      /* ---- 20. Two radii, end to end --------------------------------------
         The one beat in the section that is taught rather than shown, and it
         runs UNDER the sentence clause by clause: the centre is picked out on
         "through the centre", the two ends on "with both ends on the circle",
         and on "it is twice the radius" each half becomes a radius and is
         named. The two names then slide in to meet in the middle as they fade,
         and the whole line's name is set down where they meet -- which is that
         last clause made into a movement. */
      .then(function (reveal) {
        mascot.state('talking');
        var said = reveal();
        var taught = Flow.anim(Beats.halveDiameter({
          left: dom.diaLeft, right: dom.diaRight,
          rLeft: dom.diaRLeft, rRight: dom.diaRRight, name: dom.diaName,
          centre: dom.dot, ends: [dom.handleA, dom.handleB],
          /* how far each half's name travels to meet the other: from the
             middle of a half to the middle of the whole, which is half a
             radius in the figure's own units */
          meet: RR / 2
        }));
        return Promise.all([said, taught]);
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(BEAT);
      })
      .then(function () { return handOver(dom.nextBtn); })

      /* ---- and the section closes ---------------------------------------- */
      .then(wipeBoard);
  }

  /* The lesson in playing order. `name` is what the level bar shows and
     nothing else reads it. */
  var SCENES = [
    { name: 'Welcome',        play: sceneWelcome },
    { name: 'Centre',         play: sceneCentre  },
    { name: 'Equal distance', play: sceneEqual   },
    { name: 'Radius',         play: sceneRadius  },
    { name: 'Diameter',       play: sceneDiameter }
  ];

  /* Which scene is on screen, and whoever asked to be told when that
     changes. The level bar is the only listener; the lesson never asks. */
  var at = 0;
  var watchers = [];

  function announce() {
    var n = at;
    watchers.forEach(function (fn) {
      /* A listener's fault is not the lesson's. */
      try { fn(n, SCENES.length, SCENES[n].name); } catch (e) {}
    });
  }

  /* Every scene from `from` to the end of the lesson, one after the other. */
  function play(from) {
    var chain = Promise.resolve();
    for (var i = from || 0; i < SCENES.length; i++) {
      chain = chain.then(enter(i));
    }
    return chain;
  }
  function enter(i) {
    return function () {
      at = i;
      announce();
      return SCENES[i].play();
    };
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

    /* A replay can catch the bird mid-jump, which is the one state in the
       lesson that has a second element in it. Put the hopper away before
       anything else -- a fixed-position copy of the character stranded over
       the first frame of the new run is unmistakable. */
    hopperOff();
    mascot.el.hidden = false;
    mascot.el.classList.remove('is-away');
    dom.welcome.removeAttribute('hidden');
    dom.startBtn.setAttribute('hidden', '');
    dom.startBtn.classList.remove('in');
    dom.nextBtn.setAttribute('hidden', '');
    dom.bubble.setAttribute('hidden', '');

    dom.board.classList.remove('show', 'is-animating');
    dom.board.setAttribute('aria-hidden', 'true');

    /* The bubble may be parked on the board's right half, wearing the
       mirrored shape, half way through a sentence; the figure may be carrying
       three levels' worth of marks and standing a quarter of the stage to the
       left. Both go back to their first-frame state here. */
    restoreBubble();
    resetFigure();

    /* Named rather than 'all': the mascot's background-image and
       background-size are written straight to its style by the sprite
       player, not by GSAP, and a blanket clear is a tempting way to wipe
       them out one refactor from now. */
    M.set([dom.welcome, dom.title, dom.startBtn, dom.nextBtn, dom.bubble,
           dom.board, dom.promptLine, dom.slotHeader, mascot.el, dom.hopper],
          { clearProps: 'opacity,transform,filter' });
  }

  /* The board as the scene at `index` expects to FIND it, written straight
     in with no animation. rewind() has just put everything back to the first
     frame of the lesson, which is what scene 0 wants; every later scene wants
     a little more than that, and each one wants everything the scenes above
     it wanted too -- so the steps below fall through rather than branch.
       Nothing here plays a beat. The scene itself still runs from its own
     first beat, so jumping to a level looks like that level starting, not
     like the middle of one. */
  function stageFor(index) {
    if (index <= 0) return;

    /* Past the welcome: the screen is gone and the bird is already standing
       on its mark out on the field, idling. */
    dom.welcome.setAttribute('hidden', '');
    mascot.placeIn(dom.slotHero);
    mascot.idle();
    if (index <= 1) return;

    /* Levels 2 and 3 open by wiping a board that is already up -- with the
       bird behind it, which is where the previous level's exit jump left it.
       `is-away` is what tells wipeBoard's jump-out there is nothing to jump. */
    dom.board.classList.add('show');
    dom.board.setAttribute('aria-hidden', 'false');
    mascot.el.classList.add('is-away');
  }

  function init() {
    dom = collect();
    fan = buildFan(dom.spokes, dom.dots);
    rays = buildRadii(dom.radii);

    mascot = global.Mascot.create({ slot: dom.slotWelcome });

    sayTitle  = global.Typer.create($('titleType'));
    sayBubble = global.Typer.create($('bubbleType'), { box: dom.bubble });
    sayPrompt = global.Typer.create($('promptType'));

    return { dom: dom, mascot: mascot };
  }

  /* Start the lesson at a scene and play it through to the end. */
  function runFrom(index) {
    if (!dom) init();
    index = Math.max(0, Math.min(SCENES.length - 1, index | 0));

    /* Retire the previous run BEFORE cleaning up after it. Each tracked
       animation hands back whatever it had written inline as it is killed,
       so cleaning first would just have those writes land on top of it. */
    Flow.reset();
    rewind();
    stageFor(index);
    return Flow.run(function () { return play(index); });
  }

  function run() { return runFrom(0); }

  global.Pages = {
    LINES: LINES,
    init: init,
    run: run,
    runFrom: runFrom,
    rewind: rewind,
    levels: function () { return SCENES.map(function (s) { return s.name; }); },
    level: function () { return at; },
    onLevel: function (fn) {
      if (typeof fn === 'function') { watchers.push(fn); fn(at, SCENES.length, SCENES[at].name); }
    },
    mascot: function () { return mascot; },
    dom: function () { return dom; }
  };
})(window);
