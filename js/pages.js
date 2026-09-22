/* ==========================================================================
 * pages.js -- the lesson, beat by beat
 * --------------------------------------------------------------------------
 * One scene is one `await` chain. Everything it waits on -- a stretch of
 * time, an animation, a tap -- is taken out through Flow, so the whole chain
 * unwinds in one go if the scene is replayed, and collapses to a few frames
 * if Skip is pressed. Nothing in here sets a timeout of its own.
 *
 * Section 1 is one continuous flow on one board. The bird comes up onto the
 * header once and stays there for the whole of the teaching, changing its
 * line as each part of the circle is drawn and named; the Next control marks
 * the three places the learner takes over the pace. Those three places are
 * also the scene boundaries below, which is what the level bar leans on.
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
     Every word the learner reads, in one place. Short sentences and plain
     words: the audience is grade 7. */
  var LINES = {
    title:   'Identify Different Parts of a Circle',
    hello:   'Hey there!',
    warmup:  'Let’s do a quick warm-up!',

    draw:           'Let’s draw a circle!',
    circumference:  'This is the circumference.',
    circumference2: 'It is the line all the way around the circle.',
    tapDot:         'Tap the dot in the middle!',
    centre:         'This is the center.',
    radius:         'This is the radius.',
    radius2:        'It goes from the center to the edge.',
    longer:         'Let’s make the line longer.',
    oneRadius:      'This side is a radius…',
    twoRadius:      '…and this side is a radius too.',
    diameter:       'Together they make a diameter!',
    diameter2:      'A diameter goes right through the center.',

    notCentre: 'This line does not go through the center.',
    chord:     'This is a chord.',
    chords:    'All of these lines are chords.',

    drag:  'Drag each name to the correct box.',
    right: function (name) { return 'Correct! That is the ' + name.toLowerCase() + '.'; },
    wrong: 'Oops! Not this box. Try again.',
    done:  'Great job! You know all the parts of a circle!'
  };

  /* ---- pacing -----------------------------------------------------------
     The two kinds of pause in the lesson. A BEAT is the gap between one line
     and the next -- long enough to finish reading, short enough not to feel
     like a hang. SHORT is the gap between two marks of one drawing. */
  var BEAT  = 560;
  var SHORT = 280;

  /* ---- the figure's own coordinates -------------------------------------
     The three numbers the circle in index.html is drawn with. Everything this
     file builds into the SVG is measured from them, so nothing can drift away
     from the shape it belongs to. */
  var CX = 500, CY = 210, RR = 158;
  var SVG_NS = 'http://www.w3.org/2000/svg';

  function round2(n) { return Math.round(n * 100) / 100; }

  /* A point on the rim, `deg` degrees anticlockwise from three o'clock. */
  function onRim(deg) {
    var a = deg * Math.PI / 180;
    return { x: round2(CX + Math.cos(a) * RR), y: round2(CY - Math.sin(a) * RR) };
  }
  function midpoint(a, b) {
    return { x: round2((a.x + b.x) / 2), y: round2((a.y + b.y) / 2) };
  }

  /* The chords. The first is the one that is taught: level, below the
     centre, so it is plainly a line that does NOT go through the middle.
     The other three are the ones that follow it -- two up top, one lower
     still and parallel to the first -- placed so none of them crosses
     another, which keeps the picture four lines rather than a tangle. */
  var CHORD_Y = 300;
  var CHORD_DX = round2(Math.sqrt(RR * RR - (CHORD_Y - CY) * (CHORD_Y - CY)));
  var CHORDS = [
    [{ x: CX - CHORD_DX, y: CHORD_Y }, { x: CX + CHORD_DX, y: CHORD_Y }],
    [onRim(100), onRim(170)],
    [onRim(20),  onRim(75)],
    [onRim(-55), onRim(-125)]
  ];

  /* Where the one callout is aimed for each part it names: the arrow runs
     from `from` through `bend` to `tip`, and the word sits at `label`. Every
     one comes in from the right, clear of the circle, and every tip stops a
     little short of the thing it points at. */
  var CALLOUTS = {
    circumference: {
      text: 'Circumference',
      from: { x: 686, y: 50 }, bend: { x: 650, y: 50 }, tip: { x: 608, y: 81 },
      label: { x: 694, y: 58 }
    },
    centre: {
      text: 'Center',
      from: { x: 604, y: 300 }, bend: { x: 566, y: 282 }, tip: { x: 528, y: 238 },
      label: { x: 614, y: 326 }
    },
    radius: {
      text: 'Radius',
      from: { x: 644, y: 130 }, bend: { x: 616, y: 152 }, tip: { x: 586, y: 196 },
      label: { x: 650, y: 122 }
    },
    chord: {
      text: 'Chord',
      from: { x: 658, y: 354 }, bend: { x: 626, y: 338 }, tip: { x: 588, y: 312 },
      label: { x: 664, y: 372 }
    }
  };

  /* The activity. Three lines go on the circle (the centre dot is the same
     one the lesson uses), and five boxes hang off it -- three on the left,
     two on the right -- each tied by a dashed leader to a point on the part
     it is for. The centre's leader has no point of its own: it stops just
     short of the dot, which is the point. */
  var BOX_W = 250, BOX_H = 48, BOX_R = 14;
  var RADIUS_END = onRim(40);
  var QUIZ_PARTS = {
    radius:   { cls: 'q-radius',
                from: { x: CX, y: CY }, to: RADIUS_END, ends: [RADIUS_END] },
    diameter: { cls: 'q-diameter',
                from: { x: CX - RR, y: CY }, to: { x: CX + RR, y: CY },
                ends: [{ x: CX - RR, y: CY }, { x: CX + RR, y: CY }] },
    chord:    { cls: 'q-chord',
                from: CHORDS[0][0], to: CHORDS[0][1], ends: CHORDS[0] }
  };
  var QUIZ_BOXES = [
    { name: 'Circumference', x: 30,  y: 56,  anchor: onRim(135) },
    { name: 'Radius',        x: 720, y: 84,  anchor: midpoint({ x: CX, y: CY }, RADIUS_END) },
    { name: 'Diameter',      x: 30,  y: 222, anchor: { x: 415, y: CY } },
    { name: 'Center',        x: 720, y: 292, anchor: null },
    { name: 'Chord',         x: 30,  y: 330, anchor: { x: 440, y: CHORD_Y } }
  ];
  var CENTRE_GAP = 16;          /* how short of the dot the centre's leader stops */

  var dom = null;
  var mascot = null;
  var chords = [];              /* [{ line, ends }] -- see buildChords */
  var quiz = { parts: {}, boxes: [] };
  var chips = [];
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

      figure:    $('figure'),
      disc:      $('disc'),
      glowWide:  $('rimGlowWide'),
      glowTight: $('rimGlowTight'),
      rim:       $('rim'),
      rimTip:    $('rimTip'),

      dia:         $('dia'),
      glowRight:   $('glowRight'),
      glowLeft:    $('glowLeft'),
      halfRight:   $('halfRight'),
      halfLeft:    $('halfLeft'),
      endRight:    $('endRight'),
      endLeft:     $('endLeft'),
      rLabelRight: $('rLabelRight'),
      rLabelLeft:  $('rLabelLeft'),
      diaName:     $('diaName'),

      chords:   $('chords'),
      quiz:     $('quiz'),

      centre:    $('centre'),
      glow:      document.querySelector('.centre__glow'),
      dot:       document.querySelector('.centre__dot'),
      centreHit: $('centreHit'),

      mark:      $('mark'),
      markArrow: $('markArrow'),
      markHead:  $('markHead'),
      markLabel: $('markLabel'),

      tray:     $('tray'),
      gate:     $('gate'),
      nextBtn:  $('nextBtn')
    };
  }

  /* ---- building into the SVG ------------------------------------------- */

  function el(tag, attrs) {
    var e = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    }
    return e;
  }
  function seg(a, b) {
    return 'M' + round2(a.x) + ' ' + round2(a.y) + ' L' + round2(b.x) + ' ' + round2(b.y);
  }

  /* The four chords: each a line and the two points it runs between, the
     line first in document order so its points paint over it. */
  function buildChords(group) {
    return CHORDS.map(function (pair) {
      var line = el('path', { 'class': 'chord-line', d: seg(pair[0], pair[1]) });
      group.appendChild(line);
      var ends = pair.map(function (p) {
        var dot = el('circle', { 'class': 'end-dot', cx: p.x, cy: p.y, r: 6.4 });
        group.appendChild(dot);
        return dot;
      });
      return { line: line, ends: ends };
    });
  }

  /* The activity's picture: the three lines, then the five boxes with their
     leaders. Each leader is a dashed path shown through a mask of its own --
     see boxesIn in animations.js for why -- and the mask has to be given the
     whole picture as its region: left to its default it would be sized off
     the line's own box, and a level line's box has no height. */
  function buildQuiz(group) {
    var defs = el('defs');
    group.appendChild(defs);

    var parts = {};
    Object.keys(QUIZ_PARTS).forEach(function (k) {
      var s = QUIZ_PARTS[k];
      var line = el('path', { 'class': 'q-part ' + s.cls, d: seg(s.from, s.to) });
      group.appendChild(line);
      var ends = s.ends.map(function (p) {
        var dot = el('circle', { 'class': 'end-dot', cx: p.x, cy: p.y, r: 6.4 });
        group.appendChild(dot);
        return dot;
      });
      parts[k] = { line: line, ends: ends };
    });

    var boxes = QUIZ_BOXES.map(function (b, i) {
      var left = b.x < CX;
      var cy = b.y + BOX_H / 2;
      var edge = { x: left ? b.x + BOX_W : b.x, y: cy };
      var target = b.anchor;
      if (!target) {
        var dx = CX - edge.x, dy = CY - edge.y;
        var L = Math.sqrt(dx * dx + dy * dy) || 1;
        target = { x: CX - dx / L * CENTRE_GAP, y: CY - dy / L * CENTRE_GAP };
      }
      var d = seg(edge, target);

      var maskId = 'leaderMask' + i;
      var mask = el('mask', { id: maskId, maskUnits: 'userSpaceOnUse',
                              x: 0, y: 0, width: 1000, height: 420 });
      var maskPath = el('path', { 'class': 'q-leader-mask', d: d });
      mask.appendChild(maskPath);
      defs.appendChild(mask);

      var leader = el('path', { 'class': 'q-leader', d: d, mask: 'url(#' + maskId + ')' });
      group.appendChild(leader);

      var anchor = null;
      if (b.anchor) {
        anchor = el('circle', { 'class': 'q-anchor', cx: b.anchor.x, cy: b.anchor.y, r: 4.6 });
        group.appendChild(anchor);
      }

      var g = el('g', { 'class': 'q-box', 'data-name': b.name, tabindex: 0, role: 'button' });
      var rect = el('rect', { 'class': 'q-box__rect', x: b.x, y: b.y,
                              width: BOX_W, height: BOX_H, rx: BOX_R });
      var badge = el('g', { 'class': 'q-badge' });
      badge.appendChild(el('circle', { 'class': 'q-badge__ring', cx: b.x + 26, cy: cy, r: 11 }));
      badge.appendChild(el('path', { 'class': 'q-badge__tick',
        d: 'M' + (b.x + 20) + ' ' + cy + ' L' + (b.x + 24.5) + ' ' + (cy + 4.5) +
           ' L' + (b.x + 32) + ' ' + (cy - 4.5) }));
      var text = el('text', { 'class': 'figure-label q-box__text',
                              x: b.x + BOX_W / 2 + 10, y: cy + 8, 'text-anchor': 'middle' });
      g.appendChild(rect);
      g.appendChild(badge);
      g.appendChild(text);
      group.appendChild(g);

      var box = { name: b.name, g: g, rect: rect, badge: badge, text: text,
                  leader: leader, mask: maskPath, anchor: anchor, filled: false };
      emptyBox(box);
      return box;
    });

    return { parts: parts, boxes: boxes };
  }

  function emptyBox(box) {
    box.filled = false;
    box.text.textContent = '';
    box.g.classList.remove('is-right', 'is-wrong', 'is-over');
    box.g.setAttribute('aria-label', 'Empty box. Drop a name here.');
  }

  /* The five names, as buttons in the tray. Buttons, so a keyboard can pick
     one up; the drag is on top of that. */
  function buildChips(tray, names) {
    tray.textContent = '';
    return names.map(function (name) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = name;
      b.dataset.name = name;
      b.setAttribute('aria-label', name + '. Drag it to a box, or press to pick it up.');
      tray.appendChild(b);
      return b;
    });
  }

  /* A fresh order every time, and never the order the boxes are in. */
  function shuffle(list) {
    var a = list.slice();
    for (var tries = 0; tries < 8; tries++) {
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      if (a.join() !== list.join()) break;
    }
    return a;
  }

  /* ---- the callout, aimed ------------------------------------------------
     The arrow's shaft is a curve from the label in toward the part; the head
     is worked out from the curve's own direction at the tip, so the barbs
     sit square on the shaft whichever way it comes in. */
  var HEAD = 15;
  var SPREAD = 28 * Math.PI / 180;

  function arrowHead(tip, from) {
    var dx = tip.x - from.x, dy = tip.y - from.y;
    var back = Math.atan2(-dy, -dx);
    function barb(sign) {
      var a = back + sign * SPREAD;
      return round2(tip.x + Math.cos(a) * HEAD) + ' ' + round2(tip.y + Math.sin(a) * HEAD);
    }
    return 'M' + barb(1) + ' L' + round2(tip.x) + ' ' + round2(tip.y) + ' L' + barb(-1);
  }

  function aimCallout(spec) {
    dom.markArrow.setAttribute('d',
      'M' + spec.from.x + ' ' + spec.from.y +
      ' Q' + spec.bend.x + ' ' + spec.bend.y + ' ' + spec.tip.x + ' ' + spec.tip.y);
    dom.markHead.setAttribute('d', arrowHead(spec.tip, spec.bend));
    dom.markLabel.setAttribute('x', spec.label.x);
    dom.markLabel.setAttribute('y', spec.label.y);
    dom.markLabel.textContent = spec.text;
    return Beats.callout(dom.mark, dom.markArrow, dom.markHead, dom.markLabel);
  }
  function markParts() { return [dom.markArrow, dom.markHead, dom.markLabel]; }

  /* ---- the figure, as a whole -------------------------------------------
     Every mark that can be on the circle at once, in one list: what a scene
     hands back when it is over, and what a replay has to undo. */
  function figureParts() {
    return [dom.rim, dom.disc, dom.glowWide, dom.glowTight, dom.rimTip,
            dom.dia, dom.chords, dom.quiz, dom.centre, dom.mark];
  }

  /* Back to an empty stage. Every group hidden, every state class off, every
     inline write handed back -- and the dash patterns with them, because a
     stroke caught half drawn would otherwise start its next draw already
     half made. Everything inside the picture, rather than a list kept by
     hand: a list is the kind of thing that is one element short. */
  function resetFigure() {
    [dom.dia, dom.chords, dom.quiz, dom.centre, dom.mark].forEach(function (g) {
      g.setAttribute('hidden', '');
    });
    dom.centre.classList.remove('is-calling', 'is-found', 'is-quiet');
    dom.quiz.classList.remove('is-live');
    [dom.halfLeft, dom.halfRight].forEach(function (h) { h.classList.remove('is-dia'); });
    quiz.boxes.forEach(emptyBox);

    clearInline([dom.figure].concat(
      Array.prototype.slice.call(dom.figure.querySelectorAll('*'))));
  }

  /* Every inline write GSAP may have left on these, handed back -- and the
     dash patterns with them.
       The centre's halo is the one exception, and it is cleared of its
     opacity only: its pulse is a CSS scale about its own box, and the first
     time GSAP is asked about an SVG element's transform it writes an inline
     transform-origin of 0 0 that would outrank that for good (see
     .centre__glow in style.css). */
  function clearInline(els) {
    var rest = els.filter(function (e) { return e !== dom.glow; });
    M.set(rest, { clearProps: 'opacity,transform,strokeWidth' });
    if (els.indexOf(dom.glow) >= 0) M.set(dom.glow, { clearProps: 'opacity' });
    els.forEach(function (p) {
      if (!p.style) return;
      p.style.strokeDasharray = '';
      p.style.strokeDashoffset = '';
    });
  }

  function resetTray() {
    dom.tray.setAttribute('hidden', '');
    dom.tray.textContent = '';
    chips = [];
  }

  /* The ripple goes where the finger landed. A keyboard activation has no
     coordinates, so it gets the target's own centre instead. */
  function ripple(ev, el) {
    var r = el.getBoundingClientRect();
    M.tapRipple((ev && ev.clientX) || (r.left + r.width / 2),
                (ev && ev.clientY) || (r.top + r.height / 2));
  }

  /* A promise the scene may never get round to awaiting: a tap armed a beat
     before it is wanted, or a line the bird says from inside an event
     handler. Retiring a scene rejects every wait it owns, and the ones nobody
     awaited would surface as unhandled rejections. CANCELLED is control flow,
     not a fault, so that noise is swallowed here. The promise is handed back
     untouched: whoever DOES await it still unwinds with the rest of the
     chain. */
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
     player's own inline styles on the bird inside it are never touched. */
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

  /* The bird, already on the header, saying its next line. The line it was
     saying blurs out, the new one is laid out in its place -- the bird steps
     aside by exactly the difference -- and the bird talks it in, then settles
     back to its idle.
       `mood` is the state the bird holds while it speaks -- 'happy' after a
     right answer, 'confused' after a wrong one -- and the plain talking loop
     otherwise. A newer line taking the box over stops the older one settling
     the bird out from under it. */
  var speaking = 0;

  function speak(text, mood) {
    var mine = ++speaking;
    var has = dom.promptLine.textContent.trim().length > 0;
    var gone = has ? Flow.anim(Beats.lineOut(dom.promptLine)) : Promise.resolve();
    return gone.then(function () {
      if (mine !== speaking) return;
      /* Undo what lineOut wrote, but do NOT clear the box first: an empty
         box would re-centre the bird and the next line would push it back
         out again, two shifts where the learner should see one. The typer
         replaces the line in place. */
      M.set(dom.promptLine, { clearProps: 'opacity,transform,filter' });
      mascot.state(mood || 'talking');
      return sayInHeader(text);
    }).then(function () {
      if (mine === speaking) mascot.settle();
    });
  }

  /* ---- the mascot's jump on and off the board --------------------------
   * The bird does not appear in the header and it does not disappear from
   * it. It comes up from BEHIND the board, arcs over its top edge and drops
   * onto its spot beside the line; when it is done it crouches, springs off
   * the spot and falls back down behind the same edge. Nothing fades
   * anywhere in either.
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

  /* Where the top of the arc is: high enough that the whole of the BIRD is
     above the board's top edge, which is the one thing the apex has to be.
     On a board this size that puts the bird off the top of the screen, and
     that is what the reference game does too -- the viewport clips both
     sprites at the same line, so the swap stays invisible up there. */
  function flightPlan(cell) {
    var b = dom.board.getBoundingClientRect();
    return {
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
           slid sideways underneath it. */
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
           painted box and the hopper takes over from exactly there. */
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

  /* The bird comes up to say a line.
       The line is RESERVED before the jump starts. The prompt row is centred
     as a pair, so the bird's resting spot depends on how wide the finished
     line makes the row -- jump against an empty row and it aims at the
     middle of the header, then gets shoved sideways the moment the words
     take their space. Reserved first, it lands where the line will really
     put it.
       It starts talking on landing, not before: the hopper is showing
     whatever the bird is showing, and a bird chattering its way through the
     air is talking to the ceiling. */
  function arriveSaying(text) {
    speaking++;
    var reveal = sayPrompt.reserve(text);
    return mascotJumpIn().then(function () {
      mascot.state('talking');
      return reveal();
    });
  }

  /* The bubble back on the bird's own mark out in the field, shut and blank,
     so the next run that opens it is not opening a box still wearing the
     last one's shape. */
  function restoreBubble() {
    sayBubble.clear();
    dom.bubble.setAttribute('hidden', '');
    M.set(dom.bubble, { clearProps: 'opacity,transform' });
  }

  /* ---- the circle, drawn --------------------------------------------------
     Outline first, colour second, with a pause between them: two acts, not
     one. `glow` lights the outline as it is drawn -- the first time, when the
     circumference is about to be named. */
  function drawCircle(glow) {
    return Flow.anim(Beats.drawRim(dom.rim, [dom.glowWide, dom.glowTight],
                                   dom.rimTip, { glow: glow }))
      .then(function () { return Flow.wait(160); })
      .then(function () { return Flow.anim(Beats.fillDisc(dom.disc)); });
  }

  /* ---- a scene, over ------------------------------------------------------
     The bird leaves and the board is wiped in the same beat. They have
     nothing to do with each other -- which is the point: what the learner
     reads is the board being cleared, not a list of things being undone. */
  function wipeBoard() {
    var gone = mascotJumpOut();
    var shut = Flow.anim(Beats.bubbleOut(dom.bubble));
    var line = Flow.anim(Beats.lineOut(dom.promptLine));
    var figure = Flow.anim(Beats.clearFigure(figureParts()));
    var tray = dom.tray.hasAttribute('hidden')
      ? Promise.resolve()
      : Flow.anim(Beats.trayOut(dom.tray, chips));

    return Promise.all([gone, shut, line, figure, tray]).then(function () {
      clearPrompt();
      restoreBubble();
      resetFigure();
      resetTray();
    });
  }

  /* ---- the activity's interaction -----------------------------------------
     Five names, five boxes, and two ways to put one in the other:

       drag   press a name, carry it over a box, let go
       tap    tap a name to pick it up, then tap the box -- which is also
              what a keyboard does, with Enter or Space on each

     Neither finishes on one element, so neither can be a Flow.once on a box.
     Instead the fifth right answer fires a click at a hidden element of its
     own (see #gate in index.html) and the scene waits on THAT -- an ordinary
     Flow.once, cancelled with the rest of the chain when a scene is retired,
     and the listeners come off whichever way it ends.
       The bird comments from inside the handlers. Those lines are waits the
     chain never awaits, so they go through quiet(). */
  var TAP_SLOP = 8;      /* px: a press that travelled less than this was a tap */
  var DROP_SLACK = 10;   /* px: how far outside a box still counts as on it     */

  function armQuiz(q, names) {
    var live = true;
    var picked = null;          /* the chip in hand, in tap mode */
    var drag = null;            /* the press in progress, if any */
    var placed = 0;

    q.g = dom.quiz;
    q.g.classList.add('is-live');

    function boxAt(x, y) {
      for (var i = 0; i < q.boxes.length; i++) {
        var b = q.boxes[i];
        if (b.filled) continue;
        var r = b.rect.getBoundingClientRect();
        if (x >= r.left - DROP_SLACK && x <= r.right + DROP_SLACK &&
            y >= r.top - DROP_SLACK && y <= r.bottom + DROP_SLACK) return b;
      }
      return null;
    }
    function hover(box) {
      q.boxes.forEach(function (b) { b.g.classList.toggle('is-over', b === box); });
    }
    function pick(chip) {
      if (picked) picked.classList.remove('is-picked');
      picked = chip;
      if (chip) chip.classList.add('is-picked');
    }
    function home(chip) {
      chip.classList.remove('is-lifted');
      Beats.chipHome(chip);
    }

    function attempt(box, chip) {
      hover(null);
      if (!box || box.filled) return home(chip);
      if (box.name === chip.dataset.name) return right(box, chip);
      return wrong(box, chip);
    }
    function right(box, chip) {
      box.filled = true;
      placed++;
      pick(null);
      chip.classList.remove('is-lifted');

      var c = chip.getBoundingClientRect();
      var r = box.rect.getBoundingClientRect();
      Beats.chipDock(chip,
        (r.left + r.width / 2) - (c.left + c.width / 2),
        (r.top + r.height / 2) - (c.top + c.height / 2));

      box.text.textContent = box.name;
      box.g.setAttribute('aria-label', box.name + '. Correct.');
      Beats.boxRight(box);

      if (placed >= q.boxes.length) return finish();
      quiet(speak(LINES.right(box.name), 'happy'));
    }
    function wrong(box, chip) {
      Beats.boxWrong(box);
      home(chip);
      pick(null);
      quiet(speak(LINES.wrong, 'confused'));
    }
    function finish() {
      if (!live) return;
      live = false;
      dom.gate.dispatchEvent(new MouseEvent('click'));
    }

    /* ---- the chips ---- */
    function onDown(ev) {
      if (!live || drag) return;
      var chip = ev.currentTarget;
      if (chip.classList.contains('is-docked')) return;
      ev.preventDefault();
      drag = {
        chip: chip, id: ev.pointerId, ox: ev.clientX, oy: ev.clientY, moved: false,
        x0: gsap.getProperty(chip, 'x') || 0, y0: gsap.getProperty(chip, 'y') || 0
      };
      if (chip.setPointerCapture) {
        try { chip.setPointerCapture(ev.pointerId); } catch (e) { /* fine */ }
      }
      chip.classList.add('is-lifted');
      M.to(chip, { scale: 1.06, duration: M.dur(0.12), ease: 'power2.out', overwrite: 'auto' });
    }
    function onMove(ev) {
      if (!drag || ev.pointerId !== drag.id) return;
      var dx = ev.clientX - drag.ox, dy = ev.clientY - drag.oy;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) > TAP_SLOP) drag.moved = true;
      if (!drag.moved) return;
      M.set(drag.chip, { x: drag.x0 + dx, y: drag.y0 + dy });
      hover(boxAt(ev.clientX, ev.clientY));
    }
    function onUp(ev) {
      if (!drag || ev.pointerId !== drag.id) return;
      var d = drag;
      drag = null;
      if (!d.moved) {
        /* A tap: the name is picked up, or put down again. */
        d.chip.classList.remove('is-lifted');
        M.to(d.chip, { scale: 1, duration: M.dur(0.15), ease: 'power2.out', overwrite: 'auto' });
        pick(picked === d.chip ? null : d.chip);
        return;
      }
      attempt(boxAt(ev.clientX, ev.clientY), d.chip);
    }
    function onCancel(ev) {
      if (!drag || ev.pointerId !== drag.id) return;
      var d = drag;
      drag = null;
      hover(null);
      home(d.chip);
    }
    function onChipKey(ev) {
      if (!live) return;
      if (ev.key !== 'Enter' && ev.key !== ' ' && ev.key !== 'Spacebar') return;
      ev.preventDefault();
      var chip = ev.currentTarget;
      if (chip.classList.contains('is-docked')) return;
      pick(picked === chip ? null : chip);
    }

    /* ---- the boxes, in tap mode ---- */
    function boxOf(ev) {
      var g = ev.currentTarget;
      for (var i = 0; i < q.boxes.length; i++) if (q.boxes[i].g === g) return q.boxes[i];
      return null;
    }
    function onBoxUp(ev) {
      if (!live || drag || !picked) return;
      var box = boxOf(ev);
      if (box) attempt(box, picked);
    }
    function onBoxKey(ev) {
      if (!live || !picked) return;
      if (ev.key !== 'Enter' && ev.key !== ' ' && ev.key !== 'Spacebar') return;
      ev.preventDefault();
      var box = boxOf(ev);
      if (box) attempt(box, picked);
    }

    function off() {
      live = false;
      names.forEach(function (c) {
        c.removeEventListener('pointerdown', onDown);
        c.removeEventListener('keydown', onChipKey);
      });
      q.boxes.forEach(function (b) {
        b.g.removeEventListener('pointerup', onBoxUp);
        b.g.removeEventListener('keydown', onBoxKey);
      });
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onCancel);
      q.g.classList.remove('is-live');
      hover(null);
      pick(null);
      drag = null;
    }

    names.forEach(function (c) {
      c.addEventListener('pointerdown', onDown);
      c.addEventListener('keydown', onChipKey);
    });
    q.boxes.forEach(function (b) {
      b.g.addEventListener('pointerup', onBoxUp);
      b.g.addEventListener('keydown', onBoxKey);
    });
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onCancel);

    return Flow.once(dom.gate).then(
      function (ev) { off(); return ev; },
      function (err) { off(); throw err; });
  }

  /* ======================================================================
   * The lesson, one scene per stretch between two Next presses
   * ----------------------------------------------------------------------
   * Every scene opens on the board the scene before it left behind, and
   * that is what makes a scene playable on its own: the level bar's
   * stageFor() puts the board into the state a scene expects to find, and
   * the scene then plays itself normally from its first beat.
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

        /* "Hey there!" -- the welcome stands aside and the bird walks to its
           mark on the field in the same beat: a step from where it was
           already standing, not a leap. Re-parent FIRST so Flip measures the
           move against a welcome screen that is still on screen. */
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
   * Scene 1 -- the circle and its parts: circumference, centre, radius,
   * diameter. One board, one bird on the header, one continuous drawing.
   * ====================================================================== */
  function sceneParts() {
    var tapped = null;

    /* The bubble goes first, then the board grows in over the bird -- the
       hero slot sits UNDER the board, so the board closing over it is the
       exit -- and the bird comes back up over the board's edge to talk. */
    return Flow.anim(Beats.bubbleOut(dom.bubble))
      .then(function () {
        sayBubble.clear();
        return Flow.anim(Beats.boardIn(dom.board));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return arriveSaying(LINES.draw); })
      .then(function () {
        mascot.settle();
        return Flow.wait(SHORT);
      })

      /* ---- 1. The circumference ------------------------------------------
         Drawn from a point, lit as it goes, and named while it is still lit:
         the arrow reaches in to the rim as the bird says what it is. */
      .then(function () { return drawCircle(true); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Promise.all([speak(LINES.circumference),
                            Flow.anim(aimCallout(CALLOUTS.circumference))]);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return speak(LINES.circumference2); })
      .then(function () { return Flow.wait(BEAT); })
      /* The light comes off the rim and the name goes with it: the eye is
         being handed on to the middle of the circle. */
      .then(function () {
        return Promise.all([
          Flow.anim(Beats.unglowRim([dom.glowWide, dom.glowTight])),
          Flow.anim(Beats.calloutOut(dom.mark, markParts()))
        ]);
      })

      /* ---- 2. The centre --------------------------------------------------
         Listening starts the instant the dot is planted and glowing, which
         is the instant it starts LOOKING tappable -- before the bird has
         asked for it. Arming only after the line would swallow the tap of
         anyone who did not wait to be told. */
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plantCentre(dom.centre, dom.dot)); })
      .then(function () {
        tapped = quiet(Flow.once(dom.centreHit));
        return speak(LINES.tapDot);
      })
      .then(function () { return tapped; })
      .then(function (ev) {
        ripple(ev, dom.centreHit);
        Beats.confirmCentre(dom.centre, dom.dot);
        return Promise.all([speak(LINES.centre, 'happy'),
                            Flow.anim(aimCallout(CALLOUTS.centre))]);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        return Promise.all([
          Flow.anim(Beats.calloutOut(dom.mark, markParts())),
          Flow.anim(Beats.quietCentre(dom.centre, dom.glow))
        ]);
      })

      /* ---- 3. The radius --------------------------------------------------
         A point on the rim, then the line out from the centre to it: the
         order the definition is in. */
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        dom.dia.removeAttribute('hidden');
        return Flow.anim(Beats.plotDot(dom.endRight));
      })
      .then(function () { return Flow.wait(160); })
      .then(function () { return Flow.anim(Beats.growLine(dom.halfRight, 0.6)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Promise.all([speak(LINES.radius),
                            Flow.anim(aimCallout(CALLOUTS.radius))]);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return speak(LINES.radius2); })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return Flow.anim(Beats.calloutOut(dom.mark, markParts())); })

      /* ---- 4. The diameter ------------------------------------------------
         The same line grows out the other side of the centre. Each half is
         then lit and named on its own -- one radius, and another -- and the
         pair becomes one line with one name. */
      .then(function () {
        var said = speak(LINES.longer);
        var grown = Flow.wait(SHORT)
          .then(function () { return Flow.anim(Beats.growLine(dom.halfLeft, 0.7)); })
          .then(function () { return Flow.anim(Beats.plotDot(dom.endLeft)); });
        return Promise.all([said, grown]);
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Promise.all([speak(LINES.oneRadius),
                            Flow.anim(Beats.glowLine(dom.glowRight, dom.rLabelRight))]);
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Promise.all([speak(LINES.twoRadius),
                            Flow.anim(Beats.glowLine(dom.glowLeft, dom.rLabelLeft))]);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        return Promise.all([speak(LINES.diameter), Flow.anim(Beats.becomeDiameter({
          halves: [dom.halfLeft, dom.halfRight],
          names: [dom.rLabelLeft, dom.rLabelRight],
          name: dom.diaName,
          /* how far each half's name travels to meet the other: from the
             middle of a half to the middle of the whole */
          meet: RR / 2
        }))]);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return speak(LINES.diameter2); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return handOver(dom.nextBtn); });
  }

  /* ======================================================================
   * Scene 2 -- the chord. The names and lines go, the circle stays, and a
   * line that misses the centre is drawn and named; then three more.
   * ====================================================================== */
  function sceneChord() {
    return Flow.anim(Beats.clearFigure([dom.dia, dom.centre]))
      .then(function () {
        [dom.dia, dom.centre].forEach(function (g) { g.setAttribute('hidden', ''); });
        [dom.halfLeft, dom.halfRight].forEach(function (h) { h.classList.remove('is-dia'); });
        dom.centre.classList.remove('is-calling', 'is-found', 'is-quiet');
        clearInline([dom.dia, dom.centre]
          .concat(Array.prototype.slice.call(dom.dia.querySelectorAll('*')))
          .concat(Array.prototype.slice.call(dom.centre.querySelectorAll('*'))));
        return Flow.wait(BEAT);
      })

      /* The centre goes back on as a plain point -- not a target -- so "does
         not go through the centre" is something the learner can SEE. Then
         the two points, then the line between them. */
      .then(function () {
        return Flow.anim(Beats.plantCentre(dom.centre, dom.dot, { call: false }));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        dom.chords.removeAttribute('hidden');
        return Flow.anim(Beats.plotDot(chords[0].ends[0]));
      })
      .then(function () { return Flow.wait(120); })
      .then(function () { return Flow.anim(Beats.plotDot(chords[0].ends[1])); })
      .then(function () { return Flow.wait(160); })
      .then(function () { return Flow.anim(Beats.growLine(chords[0].line, 0.7)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return speak(LINES.notCentre); })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () {
        return Promise.all([speak(LINES.chord),
                            Flow.anim(aimCallout(CALLOUTS.chord))]);
      })
      .then(function () { return Flow.wait(BEAT); })

      /* And there are as many of them as you like. The name stays on the
         first one while the others are drawn under the sentence. */
      .then(function () {
        return Promise.all([speak(LINES.chords),
                            Flow.anim(Beats.drawChords(chords.slice(1)))]);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return handOver(dom.nextBtn); });
  }

  /* ======================================================================
   * Scene 3 -- name the parts. A clean board, the circle again, the parts
   * laid on it one by one, five empty boxes round it, and five names to
   * drag into them.
   * ====================================================================== */
  function sceneQuiz() {
    return wipeBoard()
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return drawCircle(false); })
      .then(function () { return Flow.wait(SHORT); })

      /* The parts, in the order they were taught. */
      .then(function () {
        dom.quiz.removeAttribute('hidden');
        return Flow.anim(Beats.plantCentre(dom.centre, dom.dot, { call: false }));
      })
      .then(function () { return Flow.wait(200); })
      .then(function () { return Flow.anim(Beats.plotPart(quiz.parts.radius)); })
      .then(function () { return Flow.wait(200); })
      .then(function () { return Flow.anim(Beats.plotPart(quiz.parts.diameter)); })
      .then(function () { return Flow.wait(200); })
      .then(function () { return Flow.anim(Beats.plotPart(quiz.parts.chord)); })
      .then(function () { return Flow.wait(SHORT); })

      /* The boxes, each tied to its part; then the names to fill them. */
      .then(function () { return Flow.anim(Beats.boxesIn(quiz.boxes)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        chips = buildChips(dom.tray, shuffle(quiz.boxes.map(function (b) { return b.name; })));
        return Flow.anim(Beats.trayIn(dom.tray, chips));
      })
      .then(function () { return arriveSaying(LINES.drag); })
      .then(function () {
        mascot.settle();
        return armQuiz(quiz, chips);
      })

      /* All five in. */
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        Beats.sfx('cheer');
        return speak(LINES.done, 'celebrating');
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return handOver(dom.nextBtn); })

      /* ---- and the section closes ---------------------------------------- */
      .then(wipeBoard);
  }

  /* The lesson in playing order. `name` is what the level bar shows and
     nothing else reads it. */
  var SCENES = [
    { name: 'Welcome',        play: sceneWelcome },
    { name: 'Circle parts',   play: sceneParts   },
    { name: 'Chord',          play: sceneChord   },
    { name: 'Name the parts', play: sceneQuiz    }
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
    speaking++;

    /* A replay can catch the bird mid-jump, which is the one state in the
       lesson that has a second element in it. Put the hopper away before
       anything else. */
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

    restoreBubble();
    resetFigure();
    resetTray();

    /* Named rather than 'all': the mascot's background-image and
       background-size are written straight to its style by the sprite
       player, not by GSAP, and a blanket clear is a tempting way to wipe
       them out one refactor from now. */
    M.set([dom.welcome, dom.title, dom.startBtn, dom.nextBtn, dom.bubble,
           dom.board, dom.promptLine, dom.slotHeader, mascot.el, dom.hopper],
          { clearProps: 'opacity,transform,filter' });
  }

  /* The board as the scene at `index` expects to FIND it, written straight
     in with no animation. Nothing here plays a beat: the scene itself still
     runs from its own first beat, so jumping to a level looks like that
     level starting, not like the middle of one. */
  function stageFor(index) {
    if (index <= 0) return;

    /* Past the welcome: the screen is gone and the bird is already standing
       on its mark out on the field, idling. */
    dom.welcome.setAttribute('hidden', '');
    mascot.placeIn(dom.slotHero);
    mascot.idle();
    if (index <= 1) return;

    dom.board.classList.add('show');
    dom.board.setAttribute('aria-hidden', 'false');

    if (index === 2) {
      /* The chord opens on the circle, with the bird still on the header
         from the scene before. */
      M.set([dom.rim, dom.disc], { opacity: 1 });
      mascot.placeIn(dom.slotHeader);
      return;
    }

    /* The activity opens by wiping a board with the bird behind it, which
       is where the previous scene's exit jump left it. `is-away` is what
       tells wipeBoard's jump-out there is nothing to jump. */
    mascot.el.classList.add('is-away');
  }

  function init() {
    dom = collect();
    chords = buildChords(dom.chords);
    quiz = buildQuiz(dom.quiz);

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
