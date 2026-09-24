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
 * the places the learner takes over the pace: once after each part is
 * named -- circumference, centre, radius, diameter, chord -- so its label
 * can be studied for as long as it takes, and once at the end of each scene.
 * Only the end-of-scene ones are the scene boundaries below, which is what
 * the level bar leans on.
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
    longer:         'Let’s copy the radius to the other side.',
    oneRadius:      'This side is a radius…',
    twoRadius:      '…and the copy is a radius too. Same length!',
    diameter:       'Together they make a diameter!',
    diameter2:      'A diameter goes right through the center.',
    diameter3:      'So a diameter is two times the radius!',

    notCentre: 'This line does not go through the center.',
    chord:     'This is a chord.',
    chords:    'All of these lines are chords.',

    /* the yes/no question that closes the chord scene */
    lookNew:  'Now look at this line.',
    isChord:  'Is this a chord?',
    ackRight: 'Correct!',
    ackWrong: 'Not quite!',
    longest:  'A diameter is the longest chord of a circle.',

    /* The activity says nothing while it is being done: the bird is off the
       board by then, and the boxes answer for themselves in green and red. */
    drag:  'Drag each name to the correct box.',
    done:  'Great job! You know all the parts of a circle!'
  };

  /* ---- pacing -----------------------------------------------------------
     The two kinds of pause in the lesson. A BEAT is the gap between one line
     and the next -- long enough to finish reading, short enough not to feel
     like a hang. SHORT is the gap between two marks of one drawing. */
  var BEAT  = 560;
  var SHORT = 280;
  /* How long the instruction stands before the bird takes it away and leaves
     the learner to the activity. */
  var HOLD_ASK = 2000;

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

  /* And the one the scene ends by asking about: a chord that DOES go
     through the centre, which makes it a diameter. Tilted rather than level,
     so it is plainly a new line and not the horizontal diameter from the
     scene before, and so that it crosses the centre dot at an angle where
     the crossing can be seen. */
  var LONG_CHORD = [onRim(25), onRim(205)];

  /* Where the one callout is aimed for each part it names: the arrow runs
     from `from` through `bend` to `tip`, and the word sits at `label`. Every
     one comes in from the right, clear of the circle, and every tip stops a
     little short of the thing it points at.
       `part` is the mark on the board the name belongs to. Naming a part
     lights that part -- see aimCallout -- so the word, the arrow and the
     thing itself are one event; it is a function because these specs are
     written before the picture exists. */
  var CALLOUTS = {
    circumference: {
      text: 'Circumference',
      from: { x: 686, y: 50 }, bend: { x: 650, y: 50 }, tip: { x: 608, y: 81 },
      label: { x: 694, y: 58 },
      part: function () { return dom.rim; }
    },
    centre: {
      text: 'Center',
      from: { x: 604, y: 300 }, bend: { x: 566, y: 282 }, tip: { x: 528, y: 238 },
      label: { x: 614, y: 326 },
      part: function () { return dom.dot; }
    },
    radius: {
      text: 'Radius',
      from: { x: 644, y: 130 }, bend: { x: 616, y: 152 }, tip: { x: 586, y: 196 },
      label: { x: 650, y: 122 },
      part: function () { return [dom.halfRight, dom.endRight]; }
    },
    chord: {
      text: 'Chord',
      from: { x: 658, y: 354 }, bend: { x: 626, y: 338 }, tip: { x: 588, y: 312 },
      label: { x: 664, y: 372 },
      part: function () { return chords[0] && chords[0].line; }
    }
  };

  /* The activity. Three lines go on the circle (the centre dot is the same
     one the lesson uses), and five boxes hang off it -- three on the left,
     two on the right -- each tied by a dashed leader to a point on the part
     it is for. The centre's leader has no point of its own: it stops just
     short of the dot, which is the point. */
  /* A box is the same object as a name in the tray, waiting to be filled:
     the same proportions and the same fully rounded ends, so a name that
     lands in one looks like it was always that shape. */
  var BOX_W = 210, BOX_H = 42;
  var BOX_R = BOX_H / 2;
  /* How far the dashed line runs level out of a box before it turns for the
     part it names. The leg that touches the box is straight and the corner
     is sharp, so the eye is handed along the line rather than asked to
     follow a diagonal into a rounded edge. */
  var LEAD_STUB = 48;
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
  var longChord = null;         /* the one through the centre  */
  var quiz = { parts: {}, boxes: [] };
  var chips = [];
  var choiceBtns = [];          /* the two answers, while a question is up */
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
      rim:       $('rim'),
      rimTip:    $('rimTip'),

      dia:         $('dia'),
      glowRight:   $('glowRight'),
      glowLeft:    $('glowLeft'),
      halfRight:   $('halfRight'),
      halfLeft:    $('halfLeft'),
      halfGhost:   $('halfGhost'),
      endRight:    $('endRight'),
      endLeft:     $('endLeft'),
      rLabelRight: $('rLabelRight'),
      rLabelLeft:  $('rLabelLeft'),
      diaName:     $('diaName'),
      diaRule:     $('diaRule'),
      diaPlate:    $('diaPlate'),

      chords:   $('chords'),
      quiz:     $('quiz'),
      choices:  $('choices'),

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
        var dot = el('circle', { 'class': 'end-dot', cx: p.x, cy: p.y, r: 4.4 });
        group.appendChild(dot);
        return dot;
      });
      return { line: line, ends: ends };
    });
  }

  /* The chord that goes through the centre, built into the same group as
     the other four so it is faded and cleared with them -- but kept out of
     the `chords` list, because the beat that draws "all of these lines"
     must not draw this one. */
  function buildLongChord(group) {
    var line = el('path', { 'class': 'long-chord',
                            d: seg(LONG_CHORD[0], LONG_CHORD[1]) });
    group.appendChild(line);
    var ends = LONG_CHORD.map(function (p) {
      var dot = el('circle', { 'class': 'end-dot', cx: p.x, cy: p.y, r: 4.4 });
      group.appendChild(dot);
      return dot;
    });
    return { line: line, ends: ends };
  }

  /* The activity's picture: the three lines, then the five boxes with their
     leaders. Each leader is a dashed path shown through a mask of its own --
     see boxIn in animations.js for why -- and the mask has to be given the
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
        var dot = el('circle', { 'class': 'end-dot', cx: p.x, cy: p.y, r: 4.4 });
        group.appendChild(dot);
        return dot;
      });
      parts[k] = { line: line, ends: ends };
    });

    var boxes = QUIZ_BOXES.map(function (b, i) {
      return buildBox(group, defs, b, 'leaderMask' + i);
    });

    return { parts: parts, boxes: boxes };
  }

  /* One box, with the dashed leader that ties it to the part it is for:
     the pill, the tick that lands in it when it is answered, and the word
     that is set inside. `b` is { name, x, y, anchor }: where the box sits
     and the point on the circle its leader runs to (or null, for the
     centre). Its own function so a later section can hang boxes of the
     same make off its own figure -- see arcs.js. */
  function buildBox(group, defs, b, maskId) {
    var left = b.x < CX;
    var cy = b.y + BOX_H / 2;
    var edge = { x: left ? b.x + BOX_W : b.x, y: cy };
    var turn = { x: edge.x + (left ? LEAD_STUB : -LEAD_STUB), y: cy };
    var target = b.anchor;
    if (!target) {
      /* The centre's line has no point of its own to stop on: it is aimed
         at the dot and stopped just short of it, which is what makes the
         dot the thing it is pointing at. Aimed from the CORNER, not from
         the box, or the last leg would not be the one that is drawn. */
      var dx = CX - turn.x, dy = CY - turn.y;
      var L = Math.sqrt(dx * dx + dy * dy) || 1;
      target = { x: CX - dx / L * CENTRE_GAP, y: CY - dy / L * CENTRE_GAP };
    }
    var d = 'M' + round2(edge.x) + ' ' + round2(edge.y) +
            ' L' + round2(turn.x) + ' ' + round2(turn.y) +
            ' L' + round2(target.x) + ' ' + round2(target.y);

    var mask = el('mask', { id: maskId, maskUnits: 'userSpaceOnUse',
                            x: 0, y: 0, width: 1000, height: 420 });
    var maskPath = el('path', { 'class': 'q-leader-mask', d: d });
    mask.appendChild(maskPath);
    defs.appendChild(mask);

    var leader = el('path', { 'class': 'q-leader', d: d, mask: 'url(#' + maskId + ')' });
    group.appendChild(leader);

    var g = el('g', { 'class': 'q-box', 'data-name': b.name, tabindex: 0, role: 'button' });
    var rect = el('rect', { 'class': 'q-box__rect', x: b.x, y: b.y,
                            width: BOX_W, height: BOX_H, rx: BOX_R });
    var badge = el('g', { 'class': 'q-badge' });
    badge.appendChild(el('circle', { 'class': 'q-badge__ring', cx: b.x + 24, cy: cy, r: 10 }));
    badge.appendChild(el('path', { 'class': 'q-badge__tick',
      d: 'M' + (b.x + 18.5) + ' ' + cy + ' L' + (b.x + 22.5) + ' ' + (cy + 4) +
         ' L' + (b.x + 29.5) + ' ' + (cy - 4) }));
    var text = el('text', { 'class': 'figure-label q-box__text',
                            x: b.x + BOX_W / 2 + 9, y: cy + 7.5, 'text-anchor': 'middle' });
    g.appendChild(rect);
    g.appendChild(badge);
    g.appendChild(text);
    group.appendChild(g);

    var box = { name: b.name, g: g, rect: rect, badge: badge, text: text,
                leader: leader, mask: maskPath, filled: false };
    emptyBox(box);
    return box;
  }

  /* A box back to the state it is built in: empty, unanswered, and not yet
     on the board at all. `is-shown` and `is-quiet` are how the activity's
     three levels of attention are held -- off the board, on it, and standing
     back -- so they come off here with everything else. */
  function emptyBox(box) {
    box.filled = false;
    box.text.textContent = '';
    [box.g, box.leader].forEach(function (e) {
      e.classList.remove('is-right', 'is-wrong', 'is-over', 'is-shown', 'is-quiet');
    });
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

  /* The answers to a yes/no question, as buttons in the same band the names
     use. Real buttons, so Enter and Space work without a line of code. */
  function buildChoices(host, labels) {
    host.textContent = '';
    return labels.map(function (text) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice';
      b.textContent = text;
      host.appendChild(b);
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
    /* The part itself, lit under the arrow. Not waited on: the pulse runs
       for about as long as the line being spoken over it, and the scene is
       paced by the speech. It is a tracked timeline all the same, so a skip
       or a replay takes the highlight off with everything else. */
    if (spec.part) Beats.partPulse(spec.part());
    return Beats.callout(dom.mark, dom.markArrow, dom.markHead, dom.markLabel);
  }
  function markParts() { return [dom.markArrow, dom.markHead, dom.markLabel]; }

  /* ---- the figure, as a whole -------------------------------------------
     Every mark that can be on the circle at once, in one list: what a scene
     hands back when it is over, and what a replay has to undo. */
  function figureParts() {
    var own = [dom.rim, dom.disc, dom.rimTip,
               dom.dia, dom.chords, dom.quiz, dom.centre, dom.mark];
    return sections.reduce(function (all, s) {
      return s.parts ? all.concat(s.parts()) : all;
    }, own);
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
    sections.forEach(function (s) { if (s.reset) s.reset(); });

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

  /* The band under the circle, emptied: both the names and the answers,
     because a replay can catch either of them standing there. */
  function resetFooter() {
    dom.tray.setAttribute('hidden', '');
    dom.tray.textContent = '';
    chips = [];
    dom.choices.setAttribute('hidden', '');
    dom.choices.textContent = '';
    choiceBtns = [];
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

  /* Up from behind the board, and down onto the spot.
       The header is the bird's: it opens as the bird comes back to it and
     closes as the bird leaves it (see mascotJumpOut), so no scene has to
     remember to give the picture the room. A jump to any other spot leaves
     the header as it is. */
  function mascotJumpIn(slot) {
    var el = mascot.el;
    slot = slot || dom.slotHeader;
    if (slot === dom.slotHeader) Flow.anim(openHeader());
    /* Away FIRST, then re-parented: the bird is standing out on the field
       under the board, and moving it into the board while it is still
       visible would paint it on top of the board for a frame. */
    el.classList.add('is-away');
    el.hidden = false;
    mascot.placeIn(slot);

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

  /* Crouch, spring off the spot, and fall back behind the board. Leaving
     the header closes it behind the bird -- once the bird is gone, not as it
     springs, or the spot it is springing from would move under it. */
  function mascotJumpOut() {
    var el = mascot.el;
    if (el.hidden || el.classList.contains('is-away')) return Promise.resolve();
    var fromHeader = el.parentNode === dom.slotHeader;
    var shut = function () { if (fromHeader) Flow.anim(collapseHeader(true)); };

    var cell = el.getBoundingClientRect();
    if (!cell.width || M.reducedMotion()) {
      el.classList.add('is-away');
      shut();
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
      .then(function () { jumpDone(); shut(); },
            function (err) { jumpDone(); throw err; });
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
  function arriveSaying(text, mood) {
    speaking++;
    var reveal = sayPrompt.reserve(text);
    return mascotJumpIn().then(function () {
      mascot.state(mood || 'talking');
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
     one. */
  function drawCircle() {
    return Flow.anim(Beats.drawRim(dom.rim, dom.rimTip))
      .then(function () { return Flow.wait(160); })
      .then(function () { return Flow.anim(Beats.fillDisc(dom.disc)); });
  }

  /* ---- the board's top band, taken away and given back -------------------
     With the bird gone and the line cleared there is nothing in the header,
     and an empty band is a fifth of the board's height spent on nothing. So
     the row is closed and the stage below takes the room: a real layout
     change, which is what makes it responsive -- the picture is re-measured
     against the space it now has, at whatever size the board happens to be.
       The MOVE, though, is a transform and nothing else. The figure's box is
     measured before and after, and the difference is played as one uniform
     scale about its own centre, so no frame of it costs a layout.
       Uniform, and that matters: the picture is letterboxed inside its box by
     its own viewBox, so what has to be interpolated is the scale of the
     PICTURE -- min(box/viewBox) on each axis -- and not the box's own width
     and height, which change by different amounts and would squash it.
       `cls` is which band to close: the header by default, or `is-bare`
     for both (see style.css), which a section with nothing in the footer
     either uses to give the picture the whole board. */
  var VB_W = 1000, VB_H = 420;

  function pictureAt(rect) {
    return {
      scale: Math.min(rect.width / VB_W, rect.height / VB_H),
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  function collapseHeader(on, cls) {
    return moveRows(function () {
      dom.board.classList.toggle(cls || 'is-headless', !!on);
    });
  }

  /* The header open again, whichever way it was closed. The bird's jump in
     calls this before it aims, so a header the bird is coming back to is
     never a closed one -- see mascotJumpIn. */
  function openHeader() {
    if (!dom.board.classList.contains('is-headless') &&
        !dom.board.classList.contains('is-bare')) return null;
    return moveRows(function () {
      dom.board.classList.remove('is-headless', 'is-bare');
    });
  }

  /* `change` rewrites the board's row classes; the picture's move between
     the two layouts is played as one transform. */
  function moveRows(change) {
    var was = pictureAt(dom.figure.getBoundingClientRect());
    /* The stylesheet transitions the board's rows for the footer's sake
       (see .board in style.css). This move is played as a transform instead,
       so the rows have to land at once: the transition is held off across
       the change, and the measurement forces the layout while it is off. */
    dom.board.style.transition = 'none';
    change();
    var now = pictureAt(dom.figure.getBoundingClientRect());
    dom.board.style.transition = '';

    if (!was.scale || !now.scale || M.reducedMotion()) return null;

    M.set(dom.figure, {
      scale: was.scale / now.scale,
      x: was.x - now.x,
      y: was.y - now.y,
      transformOrigin: 'center center'
    });
    var tl = M.timeline({ willChange: dom.figure, willChangeValue: 'transform' });
    tl.to(dom.figure, {
      scale: 1, x: 0, y: 0, duration: M.dur(0.66), ease: 'power2.inOut'
    });
    return tl;
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

    /* Whichever of the two rows is standing in the footer goes with it --
       ordinarily neither, since a scene takes its own away when it is done
       with it, but the level bar can leave either one up. */
    var footer = [];
    if (!dom.tray.hasAttribute('hidden')) {
      footer.push(Flow.anim(Beats.trayOut(dom.tray, chips)));
    }
    if (!dom.choices.hasAttribute('hidden')) {
      footer.push(Flow.anim(Beats.trayOut(dom.choices, choiceBtns)));
    }

    /* And whatever a later section keeps outside the figure -- see the
       `wipe` hook in addSection. */
    var extra = sections.reduce(function (all, s) {
      return s.wipe ? all.concat(s.wipe()) : all;
    }, []);

    return Promise.all([gone, shut, line, figure].concat(footer, extra)).then(function () {
      clearPrompt();
      restoreBubble();
      resetFigure();
      resetFooter();
    });
  }

  /* ---- waiting on an answer ----------------------------------------------
     Two buttons, one answer. Neither button can be the thing the scene
     waits on -- the wait has to be one promise, not one per option -- so
     whichever is pressed fires a click at the hidden element the lesson
     keeps for exactly this (see #gate in index.html) and the scene waits on
     THAT: an ordinary Flow.once, cancelled with the rest of the chain when
     a scene is retired, with the listeners coming off whichever way it
     ends.
       Hands back the index of the button that was pressed. */
  function askChoice(buttons) {
    var picked = -1;
    var live = true;

    function onPick(ev) {
      if (!live) return;
      live = false;
      var btn = ev.currentTarget;
      picked = buttons.indexOf(btn);
      ripple(ev, btn);
      dom.gate.dispatchEvent(new MouseEvent('click'));
    }
    function off() {
      live = false;
      buttons.forEach(function (b) {
        b.removeEventListener('click', onPick);
        /* Spent: the question has an answer, and neither option is a
           control any more -- including for a keyboard. */
        b.classList.add('is-done');
      });
    }

    buttons.forEach(function (b) { b.addEventListener('click', onPick); });

    return Flow.once(dom.gate).then(
      function () { off(); return picked; },
      function (err) { off(); throw err; });
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

  function armQuiz(q, names, opts) {
    var o = opts || {};
    var failed = false;         /* any box refused, this round */
    var misses = 0;             /* how many times                */
    var live = true;
    var picked = null;          /* the chip in hand, in tap mode */
    var drag = null;            /* the press in progress, if any */
    var placed = 0;

    q.g = o.group || dom.quiz;
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
    /* The box under the hand, and only that one, comes up out of the quiet
       level the whole set rests at -- with the line that ties it to the
       circle, because what the learner is checking is which part this box
       is for. */
    function hover(box) {
      q.boxes.forEach(function (b) {
        var on = (b === box);
        [b.g, b.leader].forEach(function (e) { e.classList.toggle('is-over', on); });
      });
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
      dock(box, chip);
      if (placed >= q.boxes.length) finish();
    }
    /* A name into its box: the flight, the word set inside, the tick. */
    function dock(box, chip) {
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
      /* A name in its box is that part named, so the part itself is lit --
         the same pulse the lesson gave it when it was taught. */
      if (box.lit) Beats.partPulse(box.lit, { times: 2 });
    }
    function boxFor(name) {
      for (var i = 0; i < q.boxes.length; i++) {
        if (q.boxes[i].name === name) return q.boxes[i];
      }
      return null;
    }
    function wrong(box, chip) {
      failed = true;
      misses++;
      pick(null);
      /* Refused: the box shakes its head and the name goes home to be tried
         again -- for as long as the caller allows. `chances` is how many
         wrong drops it takes, in reveal mode, before the lesson steps in. */
      if (o.wrong !== 'reveal' || misses < (o.chances || 1)) {
        Beats.boxWrong(box);
        home(chip);
        return;
      }
      /* The last chance spent. The refused box shakes its head, and then
         the lesson answers for the learner: the name in hand flies on to the
         box it belongs in, and whatever is still in the tray follows it into
         the boxes that are left -- so the board ends up right whichever way
         it was answered, and the explanation that follows is about a right
         board. Nothing is live in between: a drop mid-flight would be an
         answer to a question already spent. */
      live = false;
      chip.classList.remove('is-lifted');
      quiet(Flow.anim(Beats.boxWrong(box))
        .then(function () {
          var rest = names.filter(function (c) {
            return !c.classList.contains('is-docked');
          });
          /* the one in hand first, then the others, each a beat apart */
          rest.sort(function (x, y) { return x === chip ? -1 : y === chip ? 1 : 0; });
          return rest.reduce(function (chain, c) {
            return chain.then(function () {
              var target = boxFor(c.dataset.name);
              if (target && !target.filled) dock(target, c);
              return Flow.wait(420);
            });
          }, Promise.resolve());
        })
        .then(done));
    }
    function finish() {
      if (!live) return;
      live = false;
      done();
    }
    function done() {
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
    /* A plain hover, with nothing in the hand. During a drag the chip holds
       the pointer, so neither of these fires and the drag's own reckoning
       of which box it is over is the only one running. */
    function onBoxEnter(ev) {
      if (!live || drag) return;
      hover(boxOf(ev));
    }
    function onBoxLeave() {
      if (!live || drag) return;
      hover(null);
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
        b.g.removeEventListener('pointerenter', onBoxEnter);
        b.g.removeEventListener('pointerleave', onBoxLeave);
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
      b.g.addEventListener('pointerenter', onBoxEnter);
      b.g.addEventListener('pointerleave', onBoxLeave);
    });
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onCancel);

    /* Hands back how it went: right only if no box was ever refused. */
    return Flow.once(dom.gate).then(
      function () { off(); return { right: !failed }; },
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
         Drawn from a point, and named as soon as it closes: the arrow
         reaches in to the rim as the bird says what it is. */
      .then(drawCircle)
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Promise.all([speak(LINES.circumference),
                            Flow.anim(aimCallout(CALLOUTS.circumference))]);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return speak(LINES.circumference2); })
      .then(function () { return Flow.wait(BEAT); })
      /* Stop here. The name stays on the rim until the learner presses
         Next: the first label of the lesson is the one to be looked at for
         as long as it takes, not read on a timer. */
      .then(function () { return handOver(dom.nextBtn); })
      /* The name comes off the rim: the eye is being handed on to the
         middle of the circle. */
      .then(function () {
        return Flow.anim(Beats.calloutOut(dom.mark, markParts()));
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
      /* Stop: the centre stays found and named until Next is pressed. */
      .then(function () { return handOver(dom.nextBtn); })
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
      /* Stop: the radius keeps its name until Next is pressed. */
      .then(function () { return handOver(dom.nextBtn); })
      .then(function () { return Flow.anim(Beats.calloutOut(dom.mark, markParts())); })

      /* ---- 4. The diameter ------------------------------------------------
         The radius is COPIED to the other side of the centre rather than a
         second line being drawn there: a faint copy is lifted off it,
         carried across by exactly one radius and set down, and the left
         half comes up solid under it. The learner sees the same length
         moved, so there is nothing to wonder about the left side. Each half
         is then lit and named on its own -- one radius, and its copy -- and
         the pair becomes one line with one name. */
      .then(function () {
        var said = speak(LINES.longer);
        var copied = Flow.wait(SHORT)
          .then(function () {
            return Flow.anim(Beats.copyRadius({
              ghost: dom.halfGhost, shift: -RR,
              half: dom.halfLeft, end: dom.endLeft
            }));
          });
        return Promise.all([said, copied]);
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
      /* The diameter has no callout of its own -- the merge IS its naming --
         so the pulse every other part gets from aimCallout is asked for
         here, on the line the two halves have just become. */
      .then(function () {
        Beats.partPulse([dom.halfLeft, dom.halfRight, dom.endLeft, dom.endRight]);
        return speak(LINES.diameter2);
      })
      .then(function () { return Flow.wait(BEAT); })
      /* The rule the merge has just acted out, written under the circle in
         the lines' own colours as it is said. */
      .then(function () {
        return Promise.all([speak(LINES.diameter3),
                            Flow.anim(Beats.showRule(dom.diaRule, dom.diaPlate))]);
      })
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
      /* Stop: one chord, named, until Next is pressed. The rest are drawn
         only after the learner has had a good look at this one. */
      .then(function () { return handOver(dom.nextBtn); })

      /* And there are as many of them as you like. The word stays while the
         others are drawn under the sentence, but the arrow goes: pointed at
         the first chord, it would say that one alone is the chord. */
      .then(function () {
        return Promise.all([speak(LINES.chords),
                            Flow.anim(Beats.arrowOut([dom.markArrow, dom.markHead],
                                                     dom.markLabel, 'Chords')),
                            Flow.anim(Beats.drawChords(chords.slice(1)))]);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return handOver(dom.nextBtn); })

      /* ---- The one that goes through the centre --------------------------
         Everything comes off the circle -- all four chords and the name on
         the first of them -- and the circle is left standing with its
         centre dot. One line is then drawn across it, through that dot, in
         the lavender the lesson taught the diameter in. It is a diameter,
         and the question is whether it is a chord as well. */
      .then(function () {
        return Promise.all([
          Flow.anim(Beats.clearFigure([dom.chords])),
          Flow.anim(Beats.calloutOut(dom.mark, markParts()))
        ]);
      })
      .then(function () {
        /* The group's own fade has to be handed back before anything new is
           drawn INSIDE it, or the new line is drawn into a group that is
           still at zero. The four chords underneath go back to their own
           resting state, which is invisible, so nothing of them returns. */
        clearInline([dom.chords].concat(
          Array.prototype.slice.call(dom.chords.querySelectorAll('*'))));
        return Flow.wait(BEAT);
      })
      .then(function () { return Flow.anim(Beats.plotDot(longChord.ends[0])); })
      .then(function () { return Flow.wait(120); })
      .then(function () { return Flow.anim(Beats.plotDot(longChord.ends[1])); })
      .then(function () { return Flow.wait(160); })
      .then(function () { return Flow.anim(Beats.growLine(longChord.line, 0.7)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return speak(LINES.lookNew); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- Asked, and answered -------------------------------------------
         The question goes up first and the two answers arrive under it, so
         there is nothing to press before there is something to think
         about. */
      .then(function () { return speak(LINES.isChord); })
      .then(function () {
        choiceBtns = buildChoices(dom.choices, ['Yes', 'No']);
        return Flow.anim(Beats.trayIn(dom.choices, choiceBtns));
      })
      .then(function () { return askChoice(choiceBtns); })

      /* Right or wrong, the lesson is the same one -- so only the word in
         front of it changes. A wrong answer is shaken and then the right
         one is lit beside it, because being told "no" without being shown
         "this one" teaches nothing. */
      .then(function (picked) {
        var right = picked === 0;               /* 'Yes' is the answer */
        var marked = right
          ? Flow.anim(Beats.choiceRight(choiceBtns[0]))
          : Flow.anim(Beats.choiceWrong(choiceBtns[1])).then(function () {
              return Flow.anim(Beats.choiceRight(choiceBtns[0]));
            });
        var said = speak(right ? LINES.ackRight : LINES.ackWrong,
                         right ? 'happy' : 'confused');
        return Promise.all([marked, said]);
      })
      .then(function () { return Flow.wait(BEAT); })
      /* "The longest chord of all" -- said of the line across the middle, so
         that line is lit as it is said. */
      .then(function () {
        Beats.partPulse([longChord.line].concat(longChord.ends));
        return speak(LINES.longest);
      })
      .then(function () { return Flow.wait(BEAT); })
      /* The answers have been read; they go before Next arrives, so the
         last thing on the board is the line they were about. Taken out of
         the footer's layout as well as faded: the row is stretched across
         the whole band, and a spent one left lying there is a sheet of
         glass over the band the next scene fills. */
      .then(function () {
        return Flow.anim(Beats.trayOut(dom.choices, choiceBtns));
      })
      .then(function () { dom.choices.setAttribute('hidden', ''); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return handOver(dom.nextBtn); });
  }

  /* ======================================================================
   * Scene 3 -- name the parts. A clean board, the circle again, the parts
   * laid on it one by one, five empty boxes round it, and five names to
   * drag into them.
   * ====================================================================== */
  function boxOf(name) {
    for (var i = 0; i < quiz.boxes.length; i++) {
      if (quiz.boxes[i].name === name) return quiz.boxes[i];
    }
    return null;
  }

  /* The five parts of the circle, each with the box that will name it, in
     the order the lesson taught them. One entry is one pair: what draws the
     part, and which marks on the board that part is made of.
       `lit` is the narrower list -- the marks the pulse is for. It leaves
     out the wash inside the rim and takes the centre's dot rather than its
     group, because a highlight has to land on the mark the name is ABOUT,
     and a group carries a halo and a hit area as well. */
  function quizSteps() {
    return [
      { name: 'Circumference',
        marks: [dom.rim, dom.disc],
        lit: [dom.rim],
        draw: function () {
          return Flow.anim(Beats.drawRim(dom.rim, dom.rimTip))
            .then(function () { return Flow.wait(140); })
            .then(function () { return Flow.anim(Beats.fillDisc(dom.disc)); });
        } },
      { name: 'Center',
        marks: [dom.centre],
        lit: [dom.dot],
        draw: function () {
          return Flow.anim(Beats.plantCentre(dom.centre, dom.dot, { call: false }));
        } },
      { name: 'Radius',   part: 'radius' },
      { name: 'Diameter', part: 'diameter' },
      { name: 'Chord',    part: 'chord' }
    ].map(function (s) {
      if (!s.part) return s;
      var p = quiz.parts[s.part];
      s.marks = [p.line].concat(p.ends);
      s.lit = s.marks;
      s.draw = function () { return Flow.anim(Beats.plotPart(p)); };
      return s;
    });
  }

  /* One pair, introduced. The part is drawn, the box that will name it
     arrives on the end of a line reaching back to it, and then the three of
     them step back together -- so the next pair arrives on a board that is
     quiet again and the learner is never watching two things at once. */
  function introPair(step) {
    var box = boxOf(step.name);
    /* The box learns which marks it names now, while the pair is being
       introduced, so that dropping the right name into it later lights the
       part -- see dock() in armQuiz. A box from another section has no
       `lit`, and nothing lights. */
    if (box) box.lit = step.lit;
    return step.draw()
      .then(function () { return Flow.wait(240); })
      .then(function () { return Flow.anim(Beats.boxIn(box)); })
      .then(function () { return Flow.wait(320); })
      .then(function () { return Flow.anim(Beats.dimPair(box, step.marks)); })
      .then(function () { return Flow.wait(160); });
  }

  function sceneQuiz() {
    var marks = [];

    return wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- The picture, built a pair at a time ---------------------------- */
      .then(function () {
        dom.quiz.removeAttribute('hidden');
        var steps = quizSteps();
        marks = steps.reduce(function (all, s) { return all.concat(s.marks); }, []);
        return steps.reduce(function (chain, s) {
          return chain.then(function () { return introPair(s); });
        }, Promise.resolve());
      })

      /* ---- And the whole of it, back ---------------------------------------
         Every part comes up to full together: the circle the learner is
         about to label is read as one drawing again. The boxes and the lines
         tying them to it stay standing back, because they are the question
         and not the picture -- each one comes up on its own, under the hand,
         once the learner reaches for it. */
      .then(function () { return Flow.anim(Beats.showParts(marks)); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- The names, and the one instruction ----------------------------- */
      .then(function () {
        chips = buildChips(dom.tray, shuffle(quiz.boxes.map(function (b) { return b.name; })));
        return Flow.anim(Beats.trayIn(dom.tray, chips));
      })
      .then(function () { return arriveSaying(LINES.drag); })
      .then(function () {
        mascot.settle();
        /* The line stands for a moment after it is finished, and then the
           bird takes it and itself away: the board is the learner's now, and
           a character watching over an activity is one more thing to read. */
        return Flow.wait(HOLD_ASK);
      })
      .then(function () {
        var gone = mascotJumpOut();
        var line = Flow.anim(Beats.lineOut(dom.promptLine));
        return Promise.all([gone, line]);
      })
      .then(function () {
        clearPrompt();
        return Flow.anim(collapseHeader(true));
      })
      .then(function () { return armQuiz(quiz, chips); })

      /* ---- All five in ---------------------------------------------------- */
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(collapseHeader(false)); })
      .then(function () {
        Beats.sfx('cheer');
        return arriveSaying(LINES.done);
      })
      .then(function () {
        mascot.state('celebrating');
        return Flow.wait(1400);
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(SHORT);
      })
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

  /* The lessons after this one, each in a file of its own (see arcs.js).
     A section brings its scenes and a handful of hooks the board's own
     housekeeping calls into:

       build(kit)    once, when the board exists: put its marks on the figure
       parts()       what it has on the figure, for wipeBoard to fade
       wipe()        promises for whatever it keeps OUTSIDE the figure
       reset()       back to rest, with no animation
       stage(i)      the board as its i-th scene expects to find it

     Its scenes are appended to the lesson's, so the level bar, Next, Skip
     and Replay all work on them without knowing they came from elsewhere. */
  var BASE_SCENES = SCENES.length;
  var sections = [];

  function addSection(spec) {
    if (!spec || !spec.scenes) return;
    spec.first = SCENES.length;
    sections.push(spec);
    spec.scenes.forEach(function (sc) { SCENES.push(sc); });
    if (dom && spec.build) spec.build(kit);
  }
  function sectionOf(index) {
    for (var i = sections.length - 1; i >= 0; i--) {
      if (index >= sections[i].first) return sections[i];
    }
    return null;
  }

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

    dom.board.classList.remove('show', 'is-animating', 'is-headless', 'is-bare');
    dom.board.setAttribute('aria-hidden', 'true');

    restoreBubble();
    resetFigure();
    resetFooter();

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

    /* Past this lesson's own scenes, the section the scene belongs to
       writes the rest of its opening state over that. */
    if (index >= BASE_SCENES) {
      var s = sectionOf(index);
      if (s && s.stage) s.stage(index - s.first);
    }
  }

  function init() {
    dom = collect();
    chords = buildChords(dom.chords);
    longChord = buildLongChord(dom.chords);
    quiz = buildQuiz(dom.quiz);

    mascot = global.Mascot.create({ slot: dom.slotWelcome });

    sayTitle  = global.Typer.create($('titleType'));
    sayBubble = global.Typer.create($('bubbleType'), { box: dom.bubble });
    sayPrompt = global.Typer.create($('promptType'));

    sections.forEach(function (s) { if (s.build) s.build(kit); });

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

  /* What a later section needs from this file to speak with the same
     voice: the board's housekeeping, the bird's moves, the words and the
     pauses, the figure's own geometry. Values that are not known until
     init() has run are handed over as functions. */
  var kit = {
    LINES: LINES, BEAT: BEAT, SHORT: SHORT, HOLD_ASK: HOLD_ASK, TAP_SLOP: TAP_SLOP,
    CX: CX, CY: CY, RR: RR, VB_W: VB_W, VB_H: VB_H, BOX_W: BOX_W, BOX_H: BOX_H,
    dom: function () { return dom; },
    mascot: function () { return mascot; },
    el: el, seg: seg, round2: round2, onRim: onRim, arrowHead: arrowHead,
    buildBox: buildBox, emptyBox: emptyBox,
    buildChips: buildChips, buildChoices: buildChoices, shuffle: shuffle,
    /* the two rows in the footer are the board's, so the board can take
       them away in a wipe: a section that fills one says so here */
    chips: function (list) { if (list) chips = list; return chips; },
    choices: function (list) { if (list) choiceBtns = list; return choiceBtns; },
    handOver: handOver, speak: speak, arriveSaying: arriveSaying,
    clearPrompt: clearPrompt, mascotJumpIn: mascotJumpIn, mascotJumpOut: mascotJumpOut,
    sayBubble: function (text) { return sayBubble(text); },
    clearBubble: function () { sayBubble.clear(); },
    restoreBubble: restoreBubble,
    wipeBoard: wipeBoard, collapseHeader: collapseHeader, resetFooter: resetFooter,
    askChoice: askChoice, armQuiz: armQuiz,
    ripple: ripple, quiet: quiet, clearInline: clearInline
  };

  global.Pages = {
    LINES: LINES,
    init: init,
    addSection: addSection,
    kit: kit,
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
