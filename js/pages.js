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
    hello:   'Hey there!',
    warmup:  'Let’s do a quick warm-up!',

    draw:           'Let’s draw a circle!',
    circumference:  'This is the circumference.',
    circumference2: 'Circumference is the distance all the way around a circle.',
    tapDot:         'Tap on the dot.',
    centre:         'This is the center.',
    radius:         'This is the radius.',
    radius2:        'Radius is the line segment from the center to any point of the circle.',
    twoRadius:      'This line segment is another radius. Same length!',
    diameter:       'This is the diameter.',
    /* the notes set beside the circle once it has its name */
    diameter2:      'Two radii joined in a straight line form a diameter.',
    diameter3:      'A diameter passes through the center of the circle and joins two points on the circle.',
    diameter4:      'A diameter is made up of two equal radii.',
    diameter5:      'Therefore, the length of a diameter is twice the length of a radius.',

    chord:     'This is a chord.',
    chordIs:   'Chord is a line segment joining any two points on the circumference of a circle.',
    chords:    'All these line segments are chords.',

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

  /* The circumference is the first thing the lesson teaches, and it is
     taken slowly, to the storyboard's own clock: the instruction is left
     to be read before the pen moves, the finished ring is left to be looked
     at before the colour goes in, and the rim is lit for a good while before
     it is named, and again after. Milliseconds, except the pen's trip round,
     which is a tween's seconds. */
  var DRAW_TIME   = 4;      /* s: the pen, once round -- slow on purpose    */
  var ASKED_HOLD  = 1200;   /* "Let's draw a circle!", then the pen         */
  var DRAWN_HOLD  = 2000;   /* the ring, closed, before it is filled        */
  var FILLED_HOLD = 1200;   /* the filled circle, before the rim is lit     */
  var LIT_HOLD    = 3000;   /* the rim lit, as the bird says what it is     */
  var NAME_HOLD   = 2000;   /* ...and still lit, before the name goes on it */
  var NAMED_HOLD  = 3000;   /* the name on the lit rim, before the light goes */
  /* How far the circle and its name step left so the bird can say what a
     circumference is beside them: section 2's slide, so the two sections'
     "stands aside" are the same place on the board. Picture units. */
  var ASIDE_X = -250;

  /* The centre, to the storyboard's clock as well: the circle is left on
     its own, then the dot goes on, then the dot starts to glow, then the
     bird asks for it -- each a CENTRE_HOLD after the last. The answer is
     said SAID_AFTER a tap, and the name goes on once it has been said, at
     NAME_PACE times a callout's ordinary speed. */
  var CENTRE_HOLD = 2000;
  var SAID_AFTER  = 1000;
  var NAME_PACE   = 2.2;

  /* The radius, the same way: the circle and its centre left alone, the
     point popped onto the rim and the line grown out to it both in slow
     motion, the line lit and named, and the named line looked at before
     the circle stands aside to say what a radius is. The bird starts back
     up ARRIVE_LEAD before its line is due, so the words land on time. */
  var RADIUS_HOLD = 2000;   /* the circle alone; the drawn line, unnamed   */
  var DOT_TIME    = 0.9;    /* s: the point on the rim, popping in         */
  var DOT_HOLD    = 1200;   /* the point, before the line sets out for it  */
  var LINE_TIME   = 1.8;    /* s: the line, from the centre to the point   */
  var SAID_HOLD   = 1200;   /* "This is the radius.", then its name        */
  var STAND_HOLD  = 3000;   /* the named radius, before it stands aside    */
  var ARRIVE_LEAD = 1000;

  /* The diameter: every step of the building -- the radius alone, lit,
     named, copied, joined -- a DIA_HOLD apart, and every note set beside
     the finished line left NOTE_HOLD to be read before the next. */
  var DIA_HOLD  = 2000;
  var NOTE_HOLD = 3000;

  /* The chord: the circle and its centre left a moment, then the two
     points, a PAIR_GAP apart, and the line between them -- each step a
     DIA_HOLD after the last, as the diameter's were. */
  var CHORD_HOLD = 1200;
  var PAIR_GAP   = 300;
  /* ...and then the four of them, on a circle with only its centre: the
     first in that same slow motion, the others a little quicker but still
     each its own drawing, MANY_GAP apart. */
  var MANY_GAP  = 1000;
  var NEXT_DOT  = 0.45;     /* s: a later chord's points, popping in       */
  var NEXT_LINE = 1.1;      /* s: and its line                             */

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
     written before the picture exists. The circumference, the radius and
     the diameter have none: each is already lit, and held lit, by the time
     its name goes on (see Beats.rimLight and Beats.lineLight), and a pulse
     over that light would fight it. */
  var CALLOUTS = {
    circumference: {
      text: 'Circumference',
      from: { x: 686, y: 50 }, bend: { x: 650, y: 50 }, tip: { x: 608, y: 81 },
      label: { x: 694, y: 58 }
    },
    /* The word stands off the circle altogether, below and to the right of
       the rim, and only the arrow crosses in to the dot: set on the disc it
       read as a word written ON the circle rather than as a name for its
       middle. The tip stops outside the halo at its widest. */
    centre: {
      text: 'Center',
      from: { x: 678, y: 326 }, bend: { x: 610, y: 318 }, tip: { x: 530, y: 240 },
      label: { x: 688, y: 338 },
      part: function () { return dom.dot; }
    },
    radius: {
      text: 'Radius',
      from: { x: 644, y: 130 }, bend: { x: 616, y: 152 }, tip: { x: 586, y: 196 },
      label: { x: 650, y: 122 }
    },
    /* Where the radius's name stood, since the diameter is the same line
       carried on through the centre, and kept clear of the names that go
       under its two halves later. */
    diameter: {
      text: 'Diameter',
      from: { x: 644, y: 130 }, bend: { x: 610, y: 150 }, tip: { x: 574, y: 196 },
      label: { x: 650, y: 122 }
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
  var chords = [];              /* [{ line, ends, glow }] -- see buildChords */
  var longChord = null;         /* the one through the centre  */
  var sweep = null;             /* { arm, ghosts, lines } -- see buildSweep */
  var quiz = { parts: {}, boxes: [] };
  var chips = [];
  var choiceBtns = [];          /* the two answers, while a question is up */
  var sayBubble, sayPrompt, sayAside, sayMore;

  function $(id) { return document.getElementById(id); }

  function collect() {
    return {
      welcome:  $('welcome'),
      title:    document.querySelector('.welcome__title'),
      startBtn: $('startBtn'),

      frame:    $('frame'),
      slotHero: $('slotHero'),
      bubble:   $('bubble'),
      hopper:   $('hopper'),

      board:    $('board'),
      slotHeader: $('slotHeader'),
      promptLine: document.querySelector('.prompt__line'),

      figure:    $('figure'),
      disc:      $('disc'),
      rimLight:  $('rimLight'),
      rim:       $('rim'),
      rimRun:    $('rimRun'),
      rimTip:    $('rimTip'),

      dia:         $('dia'),
      glowRight:   $('glowRight'),
      glowLeft:    $('glowLeft'),
      halfRight:   $('halfRight'),
      halfLeft:    $('halfLeft'),
      halfGhost:   $('halfGhost'),
      radSweep:    $('radSweep'),
      endRight:    $('endRight'),
      endLeft:     $('endLeft'),
      rLabelRight: $('rLabelRight'),
      rLabelLeft:  $('rLabelLeft'),
      glowDia:     $('glowDia'),
      diaJoin:     $('diaJoin'),
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

      /* the right half of the stage, for a line said beside the circle */
      aside:       $('aside'),
      slotAside:   $('slotAside'),
      bubbleAside: $('bubbleAside'),
      asideType:   $('asideType'),
      asideMore:   $('asideMore'),

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
     line first in document order so its points paint over it, and a light
     under the line for while it is being pointed at (see Beats.lineLight). */
  function buildChords(group) {
    return CHORDS.map(function (pair) {
      var glow = el('path', { 'class': 'line-glow line-glow--chord',
                              d: seg(pair[0], pair[1]) });
      group.appendChild(glow);
      var line = el('path', { 'class': 'chord-line', d: seg(pair[0], pair[1]) });
      group.appendChild(line);
      var ends = pair.map(function (p) {
        var dot = el('circle', { 'class': 'end-dot', cx: p.x, cy: p.y, r: 4.4 });
        group.appendChild(dot);
        return dot;
      });
      return { line: line, ends: ends, glow: glow };
    });
  }

  /* The chord that goes through the centre, built into the same group as
     the other four so it is faded and cleared with them -- but kept out of
     the `chords` list, because the beat that draws "all of these lines"
     must not draw this one. */
  function buildLongChord(group) {
    /* lit in the diameter's colour, which is the colour it is drawn in */
    var glow = el('path', { 'class': 'line-glow line-glow--dia',
                            d: seg(LONG_CHORD[0], LONG_CHORD[1]) });
    group.appendChild(glow);
    var line = el('path', { 'class': 'long-chord',
                            d: seg(LONG_CHORD[0], LONG_CHORD[1]) });
    group.appendChild(line);
    var ends = LONG_CHORD.map(function (p) {
      var dot = el('circle', { 'class': 'end-dot', cx: p.x, cy: p.y, r: 4.4 });
      group.appendChild(dot);
      return dot;
    });
    return { line: line, ends: ends, glow: glow };
  }

  /* The radius swept round the circle (see Beats.radiusSweep): an arm that
     is the radius once more, and a faint radius waiting at each point it
     passes on the way, SWEEP_STEP degrees apart. Each is a line and the
     point at its end, grouped so the beat shows the pair as one. Angles run
     clockwise on the screen from three o'clock, the way the arm turns; the
     arm goes in last so it is drawn over the radii it leaves. The lines are
     handed back on their own as well, for the pulse to light every one. */
  var SWEEP_STEP = 45;

  function buildSweep(group) {
    var lines = [];
    function radius(cls, deg) {
      var g = el('g', { 'class': cls });
      var p = onRim(-deg);
      var line = el('path', { 'class': 'rad-sweep__line', d: seg({ x: CX, y: CY }, p) });
      g.appendChild(line);
      g.appendChild(el('circle', { 'class': 'end-dot', cx: p.x, cy: p.y, r: 4.4 }));
      group.appendChild(g);
      lines.push(line);
      return g;
    }
    var ghosts = [];
    for (var deg = SWEEP_STEP; deg < 360; deg += SWEEP_STEP) {
      var g = radius('rad-sweep__ghost', deg);
      g.setAttribute('data-angle', deg);
      ghosts.push(g);
    }
    return { arm: radius('rad-sweep__arm', 0), ghosts: ghosts, lines: lines };
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

  /* `opts` goes on to Beats.callout: { pace } slows the whole gesture. */
  function aimCallout(spec, opts) {
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
    return Beats.callout(dom.mark, dom.markArrow, dom.markHead, dom.markLabel, opts);
  }
  function markParts() { return [dom.markArrow, dom.markHead, dom.markLabel]; }

  /* The speech card beside the slid circle, its bird kept level with the
     bottom of the rim while the card, the pane or the figure resizes.
     Which rim is a variable: every section's card stands beside that
     section's own circle (the arcs', say), so the anchor is whatever
     cardUp was handed, and this section's rim when it was handed nothing. */
  var messageObserver = null;
  var messageAnchor = null;

  function stopMessageAlign() {
    if (messageObserver) messageObserver.disconnect();
    messageObserver = null;
  }

  function alignMessageToCircle() {
    var pane = dom.aside.getBoundingClientRect();
    var circle = (messageAnchor || dom.rim).getBoundingClientRect();
    var slot = dom.slotAside.getBoundingClientRect();
    if (!pane.height || !circle.height || !slot.height) return;
    /* The sprite has transparent space below its feet. Align the visible
       bird, carrying its bubble with it, rather than the sprite cell. */
    var bottom = pane.bottom - circle.bottom - (1 - FOOT) * slot.height;
    dom.aside.style.setProperty('--message-bottom', round2(bottom) + 'px');
  }

  function alignMessageTo(anchor) {
    messageAnchor = anchor || null;
    alignMessageToCircle();
  }

  function watchMessageAlign() {
    stopMessageAlign();
    alignMessageToCircle();
    if (global.ResizeObserver) {
      messageObserver = new ResizeObserver(alignMessageToCircle);
      messageObserver.observe(dom.bubbleAside);
      messageObserver.observe(dom.aside);
      messageObserver.observe(dom.figure);
    }
  }

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
    Array.prototype.forEach.call(dom.figure.querySelectorAll('.is-lit'),
                                 function (l) { l.classList.remove('is-lit'); });
    /* a held pulse (Beats.pulseHold) has no timeline for a retire to kill */
    Array.prototype.forEach.call(dom.figure.querySelectorAll('.is-pulsing'),
                                 function (p) {
                                   p.classList.remove('is-pulsing');
                                   p.style.removeProperty('--pulse-times');
                                 });
    dom.quiz.classList.remove('is-live');
    [dom.halfLeft, dom.halfRight].forEach(function (h) { h.classList.remove('is-dia'); });
    quiz.boxes.forEach(emptyBox);
    restoreAside();
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
    /* Every hand-over is a page turned, and a page is what the level bar
       moves in: the stretch of lesson between one Next and the next.
         A jump that is seeking past this one steps over it -- the page it
       ends is behind the page that was asked for. The LAST one stepped over
       is where that page BEGINS, so the fast-forward ends there and the
       lesson is at full speed for the page the learner came to see. */
    /* This page exists: it has reached its own Next. Counted HERE rather
       than when the button is pressed, or the press that ends a scene's
       last page would invent one more page after it -- and said at once, so
       a page the bar has not seen before is on its list while it is still
       the page on screen. */
    note(at, page);
    announce();

    if (seek > 0) {
      seek--;
      turned();
      if (!seek) Flow.resume();
      return Promise.resolve();
    }

    /* Where a skip stops. Everything behind this beat has been fast-forwarded
       and landed, and from here the lesson is at full speed again: the button
       arrives the way it always does and is genuinely waited on. So Skip
       leaves the learner exactly where Next appears, not past it. */
    Flow.resume();

    M.button3d(btn, { edge: 5 });
    Beats.controlIn(btn);
    return Flow.once(btn).then(function () {
      Beats.sfx('click');
      turned();
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
       The prompt row is centred on the line's own width (see .prompt in
     style.css), so the bird's resting place is a function of how long the
     line beside it is -- and the ghost takes the
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
     springs, or the spot it is springing from would move under it.
       `keep` leaves the header open: for a bird stepping away only until
     its next line, where closing the band and opening it again would move
     the picture twice while the learner is meant to be watching it. */
  function mascotJumpOut(keep) {
    var el = mascot.el;
    if (el.hidden || el.classList.contains('is-away')) return Promise.resolve();
    var closes = el.parentNode === dom.slotHeader && !keep;
    var shut = function () { if (closes) Flow.anim(collapseHeader(true)); };

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

  /* Whether the bird is standing on the header now, and so can simply say
     its next line there rather than having to come up to say it. */
  function birdOnHeader() {
    var el = mascot.el;
    return el.parentNode === dom.slotHeader && !el.hidden &&
           !el.classList.contains('is-away');
  }

  /* The bubble back on the bird's own mark out in the field, shut and blank,
     so the next run that opens it is not opening a box still wearing the
     last one's shape. */
  function restoreBubble() {
    sayBubble.clear();
    dom.bubble.setAttribute('hidden', '');
    M.set(dom.bubble, { clearProps: 'opacity,transform' });
  }

  /* ---- the line said beside the circle -------------------------------------
     The aside is the right half of the stage (see .aside in arcs.css): where
     the bird stands, and says its line, while the circle has stepped left.
     Every explanation said there now goes up on the speech card -- see
     cardUp, below the note kit. */

  /* The aside put away, emptied and shut. Two sections stand the circle
     aside, and both hand the pane back through here -- see the kit. */
  function restoreAside() {
    stopMessageAlign();
    messageAnchor = null;
    dom.aside.style.removeProperty('--message-bottom');
    dom.aside.setAttribute('hidden', '');
    dom.aside.classList.remove('aside--message');
    dom.bubbleAside.classList.remove('msg-two');
    sayAside.clear();
    sayMore.clear();
    dom.asideMore.setAttribute('hidden', '');
    dom.bubbleAside.setAttribute('hidden', '');
    M.set(dom.bubbleAside, { clearProps: 'opacity,transform,transformOrigin' });
    M.set([dom.asideType, dom.asideMore], { clearProps: 'opacity,transform,filter' });
  }

  /* A note of two lines beside the circle, one under the other. Both are
     laid out at once, so the pane is its finished size from the first word
     and the second line, said later, pushes nothing up. The pane is opened
     if it is shut. Hands back the two reveals, for the scene to say each
     when it is due -- see tell. */
  function noteBeside(first, second) {
    var shut = dom.bubbleAside.hasAttribute('hidden');
    if (shut) Beats.bubbleArm(dom.bubbleAside);
    var one = sayAside.reserve(first);
    dom.asideMore.removeAttribute('hidden');
    var two = sayMore.reserve(second);
    if (shut) Beats.bubbleIn(dom.bubbleAside);
    return [one, two];
  }

  /* One reserved line said, with the bird talking for as long as it takes. */
  function tell(reveal) {
    mascot.state('talking');
    return reveal().then(function () { mascot.settle(); });
  }

  /* And the note taken off the pane, the way a header line leaves, so a new
     one can be set there. The pane itself stays open. */
  function clearBeside() {
    var lines = [dom.asideType, dom.asideMore];
    return Flow.anim(Beats.lineOut(lines)).then(function () {
      sayAside.clear();
      sayMore.clear();
      dom.asideMore.setAttribute('hidden', '');
      M.set(lines, { clearProps: 'opacity,transform,filter' });
    });
  }

  /* How far into a line being typed `word` lands: the typer paces by the
     character, so this is when to light whatever the word names. */
  function wordAt(text, word) {
    return Math.max(0, text.indexOf(word)) * global.Typer.TYPE_MS;
  }

  /* ---- the speech card ----------------------------------------------------
     The explanation said on the card the circumference built (see
     .aside--message in arcs.css), which every stood-aside explanation now
     wears: the pane dressed as the card, the bird brought up under it, and
     the part the card is about breathing -- Beats.pulseHold -- from the
     moment the card opens until cardAway eases it back. The name in the
     line is set heavier, in the rim's orange. */

  /* The key word (.wd--key, arcs.css): the first word of the line that
     says the part's name, tagged in the typed line AND in the invisible
     layout copy under it, so the type lands exactly where the ghost
     reserved. Run after reserve, before reveal. */
  function pillKey(name) {
    if (!name) return;
    var want = String(name).toLowerCase();
    ['.type-ghost', '.type .txt'].forEach(function (sel) {
      var words = dom.asideType.querySelectorAll(sel + ' .wd');
      for (var i = 0; i < words.length; i++) {
        if (words[i].textContent.trim().replace(/[.,!?]+$/, '')
                    .toLowerCase() === want) {
          words[i].classList.add('wd--key');
          break;
        }
      }
    });
  }

  /* The card put up: the pane dressed and the bird brought in as the name
     on the circle goes -- the card is about to say it better -- then the
     line (or the pair of lines, laid out together the way noteBeside lays
     them, so the card is its finished size from the first word) reserved,
     the pill put on, the marks set breathing, and the card popped. Hands
     back the reveals, one per line, for the scene to say in its own time,
     alongside whatever it wants to run with them.
       `anchor` is the circle the card stands beside -- another section
     passes its own (see the kit); left out, it is this section's rim. The
     callout faded here is this board's one shared #mark, whichever section
     aimed it; a section with marks of its own sends them in `also` when
     the card comes down. */
  function cardUp(lines, marks, key, anchor) {
    dom.aside.classList.add('aside--message');
    dom.aside.removeAttribute('hidden');
    alignMessageTo(anchor);
    return Promise.all([
      Flow.anim(Beats.calloutOut(dom.mark, markParts())),
      mascotJumpIn(dom.slotAside)
    ]).then(function () {
      return Flow.wait(M.reducedMotion() ? 0 : M.FAST * 1000);
    }).then(function () {
      var texts = [].concat(lines);
      Beats.bubbleArm(dom.bubbleAside);
      var reveals = [sayAside.reserve(texts[0])];
      if (texts.length > 1) {
        dom.bubbleAside.classList.add('msg-two');
        dom.asideMore.removeAttribute('hidden');
        reveals.push(sayMore.reserve(texts[1]));
      }
      pillKey(key);
      if (marks) Beats.pulseHold(marks);
      return Flow.anim(Beats.bubbleIn(dom.bubbleAside)).then(function () {
        watchMessageAlign();
        return reveals;
      });
    });
  }

  /* And taken down on Next, all at once: the marks caught mid-breath and
     eased back, the card shut, the bird away -- with whatever else the
     scene sends along (the swept radii, the figure's group). The pane
     itself is handed back by restoreAside, as ever. */
  function cardAway(marks, also) {
    stopMessageAlign();
    var jobs = [Flow.anim(Beats.bubbleOut(dom.bubbleAside)), mascotJumpOut()];
    if (marks) jobs.push(Flow.anim(Beats.pulseRelease(marks)));
    return Promise.all(jobs.concat(also || []));
  }

  /* ---- the circle, drawn --------------------------------------------------
     The outline, by a slow pen: the first circle of the lesson is the one
     the learner is meant to WATCH being made. The colour goes in as a beat
     of its own, after the ring has been left to stand (see sceneParts). */
  function drawCircle() {
    return Flow.anim(Beats.drawRim(dom.rim, dom.rimTip, { time: DRAW_TIME }));
  }

  /* The circle and whatever is on it -- its colour, its light, its centre,
     its radius, its name -- carried sideways as one, by section 2's own
     slide. They are not one group in the picture, because every other part
     of the lesson is drawn over the same circle and must never find it
     moved, so they are moved together instead; x is the only transform any
     of them is given here, which keeps GSAP's origin arithmetic out of it
     (the disc's fill-in scale has long since landed on 1). Sliding back to 0
     hands the transforms back as well, so the parts drawn next land on a
     circle that is exactly where they expect it. */
  function slideCircle(x) {
    var pieces = [dom.disc, dom.rimLight, dom.rim, dom.rimRun,
                  dom.dia, dom.chords, dom.centre, dom.mark];
    return Flow.anim(Beats.slideArcs(pieces, x)).then(function () {
      if (!x) M.set(pieces, { clearProps: 'transform' });
    });
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

  /* Idempotent. The bird's jump out already closes the header it leaves
     (see mascotJumpOut), and the scenes close it again behind that, in the
     same flush. A second move measured then would find the picture still
     wearing the first one's offset -- "was" and "now" equal -- and its
     reset would wipe that offset before it was ever painted: the picture
     snapping to its new size instead of easing there. So a header already
     where it was asked to be hands back the move that took it there. */
  var rowsMove = null;
  function collapseHeader(on, cls) {
    if (dom.board.classList.contains(cls || 'is-headless') === !!on) {
      return rowsMove && rowsMove.progress() < 1 ? rowsMove : null;
    }
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

    if (!was.scale || !now.scale || M.reducedMotion()) return (rowsMove = null);

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
    return (rowsMove = tl);
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
       Hands back the index of the button that was pressed -- or, if a skip
     answered it, `opts.answer`: the lesson takes the right one so the beats
     after this are talking about a board that says what they say it says. */
  function askChoice(buttons, opts) {
    var o = opts || {};
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

    return Flow.once(dom.gate, { auto: true }).then(
      function () {
        off();
        if (picked < 0) picked = (o.answer == null ? 0 : o.answer);
        return picked;
      },
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

    /* Every name still in the tray put into its own box, at once. This is
       the last-chance reveal above, minus the beat between each one: what a
       skip needs, which is a finished board rather than a half-built one for
       the explanation that follows to be about. */
    function fill() {
      q.boxes.forEach(function (b) {
        if (b.filled) return;
        for (var i = 0; i < names.length; i++) {
          if (names[i].dataset.name === b.name) { dock(b, names[i]); return; }
        }
      });
    }

    /* Hands back how it went: right only if no box was ever refused. */
    return Flow.once(dom.gate, { auto: true }).then(
      function () { live = false; fill(); off(); return { right: !failed }; },
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
     The title and a waving bird are painted into the welcome artwork, so
     the only live thing on it is Start. The real bird is already on its
     mark behind the screen, waving, and is revealed as the artwork fades --
     the painted bird hands over to the live one. */
  function sceneWelcome() {
    mascot.placeIn(dom.slotHero);
    mascot.state('waving');

    return Flow.wait(SHORT)
      .then(function () {
        dom.startBtn.removeAttribute('hidden');
        /* One frame between display:none coming off and the class going on,
           or the browser has nothing to transition from. */
        return Flow.frame();
      })
      .then(function () {
        dom.startBtn.classList.add('in');
        M.button3d(dom.startBtn, { edge: 5 });
        return Flow.once(dom.startBtn, { auto: true });
      })
      .then(function () {
        Beats.sfx('click');

        /* "Hey there!" -- the artwork stands aside over a bird that is
           already waving on its mark. */
        mascot.settle();                       /* wave_stop, then the idle */
        return Flow.anim(Beats.welcomeOut(dom.welcome, dom.title, dom.startBtn));
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
    var hit = false;              /* the centre dot has been tapped */

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
        return Flow.wait(ASKED_HOLD);
      })

      /* ---- 1. The circumference ------------------------------------------
         Drawn slowly from a point and left to stand, then filled. The rim
         is lit as the bird says what it is, and kept lit while the name is
         put on it and looked at; then the light goes out. */
      .then(drawCircle)
      .then(function () { return Flow.wait(DRAWN_HOLD); })
      .then(function () { return Flow.anim(Beats.fillDisc(dom.disc)); })
      .then(function () { return Flow.wait(FILLED_HOLD); })
      .then(function () {
        return Promise.all([Flow.anim(Beats.rimLight(dom.rim, dom.rimLight)),
                            speak(LINES.circumference),
                            Flow.wait(LIT_HOLD)]);
      })
      .then(function () { return Flow.wait(NAME_HOLD); })
      .then(function () { return Flow.anim(aimCallout(CALLOUTS.circumference)); })
      .then(function () { return Flow.wait(NAMED_HOLD); })
      .then(function () { return Flow.anim(Beats.rimUnlight(dom.rim, dom.rimLight)); })

      /* The circle stands aside, name and all, as it does in section 2: the
         bird leaves the header -- which closes behind it, and the stage takes
         the room -- the circle slides left, and the bird comes back up in
         the right half to say what a circumference IS. As it says it, a
         light runs once round the rim: the distance all the way around,
         travelled, taking exactly as long as the line does. */
      .then(function () {
        return Promise.all([mascotJumpOut(), Flow.anim(Beats.lineOut(dom.promptLine))]);
      })
      .then(function () {
        clearPrompt();
        return slideCircle(ASIDE_X);
      })
      /* The rim starts to pulse as the card opens, so the word in it and
         the line it names are read as one, and goes on pulsing until Next;
         the travelling light starts with the speech, in sync with it. */
      .then(function () {
        return cardUp(LINES.circumference2, dom.rim, 'Circumference');
      })
      .then(function (reveals) {
        mascot.state('talking');
        return Promise.all([
          reveals[0](),
          Flow.anim(Beats.rimRun(dom.rimRun,
            LINES.circumference2.length * global.Typer.TYPE_MS / 1000))
        ]);
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(BEAT);
      })
      /* Keep the message on screen until the learner is ready. */
      .then(function () { return handOver(dom.nextBtn); })
      /* Next clears the board down to the circle and nothing else: the
         rim settles out of its pulse, the message beside it goes and the
         bird leaves, all at once, and only then does the circle come back
         to the middle as the header opens again. The bird stays away -- it
         comes back up with the instruction, not before, so the centre is
         shown on a board with nothing else on it. */
      .then(function () { return cardAway(dom.rim); })
      .then(function () {
        restoreAside();
        return Promise.all([Flow.anim(collapseHeader(false)), slideCircle(0)]);
      })

      /* ---- 2. The centre --------------------------------------------------
         The circle alone, then the dot, then the dot glowing, then the
         instruction, a CENTRE_HOLD apart. Listening starts the moment the
         dot starts to glow, which is the moment it starts LOOKING tappable:
         a learner who taps it before being asked has answered, and is not
         made to sit through the question. The answer is taken the instant
         it is given -- the ripple, the halo settling, the chime -- however
         far the bird has got with its line. */
      .then(function () { return Flow.wait(CENTRE_HOLD); })
      .then(function () {
        return Flow.anim(Beats.plantCentre(dom.centre, dom.dot, { call: false }));
      })
      .then(function () { return Flow.wait(CENTRE_HOLD); })
      .then(function () {
        Beats.callCentre(dom.centre);
        var tap = quiet(Flow.once(dom.centreHit,
                                  { auto: true, before: function () { hit = true; } }));
        tapped = quiet(tap.then(function (ev) {
          ripple(ev, dom.centreHit);
          Beats.confirmCentre(dom.centre, dom.dot);
          return Flow.wait(SAID_AFTER);
        }));
        return Promise.race([tap, Flow.wait(CENTRE_HOLD)]);
      })
      .then(function () {
        if (hit) return;
        return arriveSaying(LINES.tapDot).then(function () { mascot.settle(); });
      })
      /* The answer said a second after the tap, and the name put on only
         once it has been said: the line, then the label, slowly. A learner
         who tapped before the bird came back is told by a bird coming up to
         say it. */
      .then(function () { return tapped; })
      .then(function () {
        if (birdOnHeader()) return speak(LINES.centre, 'happy');
        return arriveSaying(LINES.centre, 'happy').then(function () { mascot.settle(); });
      })
      .then(function () {
        return Flow.anim(aimCallout(CALLOUTS.centre, { pace: NAME_PACE }));
      })
      .then(function () { return Flow.wait(BEAT); })
      /* Stop: the centre stays found and named until Next is pressed. Next
         then clears the board down to the circle and its centre: the name
         comes off, the halo goes out, and the bird takes its line away with
         it. The header stays open behind the bird -- it is back within a few
         seconds, and closing the band would move the circle twice. */
      .then(function () { return handOver(dom.nextBtn); })
      .then(function () {
        return Promise.all([
          Flow.anim(Beats.calloutOut(dom.mark, markParts())),
          Flow.anim(Beats.quietCentre(dom.centre, dom.glow)),
          Flow.anim(Beats.lineOut(dom.promptLine)),
          mascotJumpOut(true)
        ]);
      })
      .then(function () {
        clearPrompt();
        return Flow.wait(RADIUS_HOLD);
      })

      /* ---- 3. The radius --------------------------------------------------
         A point on the rim, then the line out from the centre to it -- the
         order the definition is in -- both in slow motion, so the line is
         seen to be MADE from the one to the other. The bird comes back up in
         the pause after it, the line is lit as it is named and kept lit
         while its name is written, and then the light goes out. */
      .then(function () {
        dom.dia.removeAttribute('hidden');
        return Flow.anim(Beats.plotDot(dom.endRight, DOT_TIME));
      })
      .then(function () { return Flow.wait(DOT_HOLD); })
      .then(function () {
        return Flow.anim(Beats.growLine(dom.halfRight, LINE_TIME, 'sine.inOut'));
      })
      .then(function () {
        return Promise.all([
          Flow.wait(RADIUS_HOLD),
          Flow.wait(RADIUS_HOLD - ARRIVE_LEAD).then(function () { return mascotJumpIn(); })
        ]);
      })
      .then(function () {
        return Promise.all([Flow.anim(Beats.lineLight(dom.glowRight)),
                            speak(LINES.radius)]);
      })
      .then(function () { return Flow.wait(SAID_HOLD); })
      .then(function () {
        return Flow.anim(aimCallout(CALLOUTS.radius, { pace: NAME_PACE }));
      })
      .then(function () { return Flow.anim(Beats.lineUnlight(dom.glowRight)); })
      .then(function () { return Flow.wait(STAND_HOLD); })

      /* The circle stands aside, name and all, as it did for the
         circumference, and the bird comes back up in the right half under
         the same speech card to say what a radius IS -- the card's first
         word names it, so the name on the circle goes as the bird arrives.
         As it says it, a copy of the radius is swept once round the centre
         and leaves a faint radius at each point it passes: from the centre
         to ANY point on the circle, and every one the same line. */
      .then(function () {
        return Promise.all([mascotJumpOut(), Flow.anim(Beats.lineOut(dom.promptLine))]);
      })
      .then(function () {
        clearPrompt();
        return slideCircle(ASIDE_X);
      })
      /* As for the circumference: the radius pulses from the moment the
         card opens until Next -- and every radius the sweep leaves pulses
         with it, in step: all are started together, the left ones still
         unseen, so each is already breathing with the rest when the arm
         sets it down. */
      .then(function () {
        return cardUp(LINES.radius2,
                      [dom.halfRight].concat(sweep.lines), 'Radius');
      })
      .then(function (reveals) {
        mascot.state('talking');
        return Promise.all([
          reveals[0](),
          Flow.anim(Beats.radiusSweep(sweep.arm, sweep.ghosts, CX, CY,
            LINES.radius2.length * global.Typer.TYPE_MS / 1000))
        ]);
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(BEAT);
      })
      /* Stop: the message stays up until Next is pressed. Then the radii
         settle out of their pulse, and the swept ones, the message beside
         the circle and the bird all go, and the circle comes back to the
         middle as the header opens: the circle and its radius, with nothing
         written anywhere. The bird stays away until it has something to say. */
      .then(function () { return handOver(dom.nextBtn); })
      .then(function () {
        return cardAway([dom.halfRight].concat(sweep.lines),
                        [Flow.anim(Beats.marksOut(sweep.ghosts))]);
      })
      .then(function () {
        restoreAside();
        return Promise.all([Flow.anim(collapseHeader(false)), slideCircle(0)]);
      })

      /* ---- 4. The diameter ------------------------------------------------
         Built out of the radius, a DIA_HOLD at a time: the radius is lit and
         named again, then COPIED to the other side of the centre rather than
         a second line being drawn there -- a faint copy is lifted off it,
         carried across by exactly one radius and set down, and the left
         half comes up solid under it, so the learner sees the same length
         moved. The light passes to the copy as it is called a radius too;
         then the two are joined into one line in one colour, and that line
         is lit and named. */
      .then(function () { return Flow.wait(DIA_HOLD); })
      .then(function () { return Flow.anim(Beats.lineLight(dom.glowRight)); })
      .then(function () {
        return Promise.all([
          Flow.wait(DIA_HOLD),
          Flow.wait(DIA_HOLD - ARRIVE_LEAD).then(function () { return mascotJumpIn(); })
        ]);
      })
      .then(function () { return speak(LINES.radius); })
      .then(function () { return Flow.wait(DIA_HOLD); })
      .then(function () {
        return Flow.anim(Beats.copyRadius({
          ghost: dom.halfGhost, shift: -RR,
          half: dom.halfLeft, end: dom.endLeft
        }));
      })
      .then(function () {
        return Promise.all([Flow.anim(Beats.lineUnlight(dom.glowRight)),
                            Flow.anim(Beats.lineLight(dom.glowLeft)),
                            speak(LINES.twoRadius)]);
      })
      .then(function () { return Flow.wait(SAID_HOLD); })
      .then(function () {
        return Promise.all([
          Flow.anim(Beats.lineUnlight(dom.glowLeft)),
          Flow.anim(Beats.joinDiameter(dom.diaJoin, [dom.halfLeft, dom.halfRight]))
        ]);
      })
      .then(function () { return Flow.wait(DIA_HOLD); })
      .then(function () {
        return Promise.all([Flow.anim(Beats.lineLight(dom.glowDia)),
                            speak(LINES.diameter)]);
      })
      .then(function () { return Flow.wait(SAID_HOLD); })
      .then(function () {
        return Flow.anim(aimCallout(CALLOUTS.diameter, { pace: NAME_PACE }));
      })
      .then(function () { return Flow.anim(Beats.lineUnlight(dom.glowDia)); })
      .then(function () { return Flow.wait(SAID_HOLD); })

      /* The circle stands aside, name and all, and what a diameter is is
         said on the speech card: two lines, the second added under the
         first and each left to be read; then both give way to the two that
         make the rule, as the rule itself is written under the circle. The
         diameter breathes under the card the whole while, and each note
         still lights what it is talking about as the words for it arrive
         -- the centre, the two ends, the two halves. */
      .then(function () {
        return Promise.all([mascotJumpOut(), Flow.anim(Beats.lineOut(dom.promptLine))]);
      })
      .then(function () {
        clearPrompt();
        return slideCircle(ASIDE_X);
      })
      .then(function () {
        return cardUp([LINES.diameter2, LINES.diameter3], dom.diaJoin, 'diameter');
      })
      .then(function (lines) {
        Beats.partPulse([dom.endLeft, dom.endRight]);
        return tell(lines[0])
          .then(function () { return Flow.wait(NOTE_HOLD); })
          .then(function () {
            var text = LINES.diameter3;
            quiet(Flow.wait(wordAt(text, 'center')).then(function () {
              Beats.partPulse(dom.dot);
            }));
            quiet(Flow.wait(wordAt(text, 'two points')).then(function () {
              Beats.partPulse([dom.endLeft, dom.endRight]);
            }));
            return tell(lines[1]);
          });
      })
      .then(function () { return Flow.wait(NOTE_HOLD); })
      .then(clearBeside)
      .then(function () {
        var lines = noteBeside(LINES.diameter4, LINES.diameter5);
        pillKey('diameter');
        return Promise.all([
          tell(lines[0]),
          Flow.anim(Beats.glowLine(dom.glowLeft, dom.rLabelLeft)),
          Flow.anim(Beats.glowLine(dom.glowRight, dom.rLabelRight))
        ]).then(function () { return Flow.wait(NOTE_HOLD); })
          .then(function () {
            return Promise.all([tell(lines[1]),
                                Flow.anim(Beats.showRule(dom.diaRule, dom.diaPlate))]);
          });
      })
      .then(function () { return Flow.wait(BEAT); })
      /* Stop: the diameter, its card and its rule stay until Next. Then
         all of it goes -- the line with everything written about it -- and
         the circle comes back to the middle with only its centre, which is
         the board the chord is drawn on. The bird stays away. */
      .then(function () { return handOver(dom.nextBtn); })
      .then(function () {
        return cardAway(dom.diaJoin, [Flow.anim(Beats.clearFigure([dom.dia]))]);
      })
      .then(function () {
        restoreAside();
        clearDia();
        return Promise.all([Flow.anim(collapseHeader(false)), slideCircle(0)]);
      });
  }

  /* The radius and diameter's group put back to rest, with no animation:
     hidden, both halves back to the radius's colour, and every inline write
     handed back, so it is drawn from nothing the next time it is wanted. */
  function clearDia() {
    dom.dia.setAttribute('hidden', '');
    [dom.halfLeft, dom.halfRight].forEach(function (h) { h.classList.remove('is-dia'); });
    clearInline([dom.dia].concat(Array.prototype.slice.call(dom.dia.querySelectorAll('*'))));
  }

  /* ======================================================================
   * Scene 2 -- the chord. It opens on the circle and its centre alone (the
   * diameter's exit leaves the board that way, and stageFor writes it
   * straight in); a line between two points on the rim is drawn, lit and
   * named, and what a chord is goes up beside it. Then three more.
   * ====================================================================== */
  function sceneChord() {
    var first = chords[0];

    /* Two points on the rim, popped on one after the other, and the line
       between them grown slowly from the one to the other, each step left
       to be looked at. The bird comes back up in the pause before its line,
       the line is lit as it is named and kept lit while its name is
       written, and then the light goes out. */
    return Flow.wait(CHORD_HOLD)
      .then(function () {
        dom.chords.removeAttribute('hidden');
        return Flow.anim(Beats.plotDot(first.ends[0], DOT_TIME));
      })
      .then(function () { return Flow.wait(PAIR_GAP); })
      .then(function () { return Flow.anim(Beats.plotDot(first.ends[1], DOT_TIME)); })
      .then(function () { return Flow.wait(DIA_HOLD); })
      .then(function () {
        return Flow.anim(Beats.growLine(first.line, LINE_TIME, 'sine.inOut'));
      })
      .then(function () { return Flow.wait(DIA_HOLD); })
      .then(function () { return Flow.anim(Beats.lineLight(first.glow)); })
      .then(function () {
        return Promise.all([
          Flow.wait(DIA_HOLD),
          Flow.wait(DIA_HOLD - ARRIVE_LEAD).then(function () { return mascotJumpIn(); })
        ]);
      })
      .then(function () { return speak(LINES.chord); })
      .then(function () { return Flow.wait(SAID_AFTER); })
      .then(function () {
        return Flow.anim(aimCallout(CALLOUTS.chord, { pace: NAME_PACE }));
      })
      .then(function () { return Flow.anim(Beats.lineUnlight(first.glow)); })
      .then(function () { return Flow.wait(DIA_HOLD); })

      /* The circle stands aside, name and all, and the bird says what a
         chord IS from the speech card, the chord breathing under it from
         the moment the card opens; the two points are still lit as it says
         "any two points" and the rim as it says "circumference". */
      .then(function () {
        return Promise.all([mascotJumpOut(), Flow.anim(Beats.lineOut(dom.promptLine))]);
      })
      .then(function () {
        clearPrompt();
        return slideCircle(ASIDE_X);
      })
      .then(function () {
        return cardUp(LINES.chordIs, first.line, 'Chord');
      })
      .then(function (reveals) {
        var text = LINES.chordIs;
        quiet(Flow.wait(wordAt(text, 'two points')).then(function () {
          Beats.partPulse(first.ends);
        }));
        quiet(Flow.wait(wordAt(text, 'circumference')).then(function () {
          Beats.partPulse(dom.rim);
        }));
        return tell(reveals[0]);
      })
      .then(function () { return Flow.wait(BEAT); })
      /* Stop: one chord, named and said, until Next is pressed. Then it
         goes, with its card and everything beside it, and the circle comes
         back to the middle with only its centre: the board the rest of the
         chords are drawn on. The bird stays away. */
      .then(function () { return handOver(dom.nextBtn); })
      .then(function () {
        return cardAway(first.line, [Flow.anim(Beats.clearFigure([dom.chords]))]);
      })
      .then(function () {
        restoreAside();
        clearChords();
        return Promise.all([Flow.anim(collapseHeader(false)), slideCircle(0)]);
      })

      /* ---- Many chords ----------------------------------------------------
         And there are as many of them as you like: four, one after another,
         the first in slow motion. Then the circle steps aside and the bird
         says so beside it, and each chord is lit in turn as it is said --
         left lit, so by the end of the line every one of them is. */
      .then(function () { return Flow.wait(DIA_HOLD); })
      .then(function () { return drawChord(chords[0], true); })
      .then(function () {
        return chords.slice(1).reduce(function (chain, c) {
          return chain
            .then(function () { return Flow.wait(MANY_GAP); })
            .then(function () { return drawChord(c, false); });
        }, Promise.resolve());
      })
      .then(function () { return Flow.wait(DIA_HOLD); })
      .then(function () {
        return Promise.all([Flow.anim(collapseHeader(true)), slideCircle(ASIDE_X)]);
      })
      /* All four chords breathe as one under the card -- in step, the way
         the swept radii do -- while each one's light still arrives as it
         is said. */
      .then(function () {
        return cardUp(LINES.chords, chords.map(function (c) { return c.line; }));
      })
      .then(function (reveals) {
        var text = LINES.chords;
        var step = text.length * global.Typer.TYPE_MS / chords.length;
        chords.forEach(function (c, i) {
          quiet(Flow.wait(i * step).then(function () {
            return Flow.anim(Beats.lineLight(c.glow));
          }));
        });
        return tell(reveals[0]);
      })
      .then(function () { return Flow.wait(BEAT); })
      .then(function () { return handOver(dom.nextBtn); })

      /* ---- The one that goes through the centre --------------------------
         Everything comes off the circle -- the four chords and the card
         beside them -- and the circle comes back to the middle with its
         centre dot and the bird back on the header. One line is then drawn
         across it, through that dot, in the colour the lesson taught the
         diameter in. It is a diameter, and the question is whether it is a
         chord as well. */
      .then(function () {
        return cardAway(chords.map(function (c) { return c.line; }),
                        [Flow.anim(Beats.clearFigure([dom.chords]))]);
      })
      .then(function () {
        restoreAside();
        clearChords();
        return Promise.all([Flow.anim(collapseHeader(false)), slideCircle(0)]);
      })
      .then(function () { return mascotJumpIn(); })
      .then(function () { return Flow.wait(BEAT); })
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
      .then(function () { return askChoice(choiceBtns, { answer: 0 }); })

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
      /* The answers have been read; they go before the rule is said, so the
         last thing on the board is the line they were about. Taken out of
         the footer's layout as well as faded: the row is stretched across
         the whole band, and a spent one left lying there is a sheet of
         glass over the band the next scene fills. */
      .then(function () {
        return Flow.anim(Beats.trayOut(dom.choices, choiceBtns));
      })
      .then(function () { dom.choices.setAttribute('hidden', ''); })

      /* "The longest chord of a circle" -- said on the card, as every rule
         in this section now is, with the line it is about breathing under
         it and lit as it is said, and left so until Next. */
      .then(function () {
        return Promise.all([mascotJumpOut(), Flow.anim(Beats.lineOut(dom.promptLine))]);
      })
      .then(function () {
        clearPrompt();
        return slideCircle(ASIDE_X);
      })
      .then(function () {
        return cardUp(LINES.longest, longChord.line, 'diameter');
      })
      .then(function (reveals) {
        return Promise.all([Flow.anim(Beats.lineLight(longChord.glow)),
                            tell(reveals[0])]);
      })
      .then(function () { return Flow.wait(BEAT); })
      /* Stop. Then the card beside the circle and the bird go, the light
         goes out and the line settles out of its breath, and the circle
         comes back to the middle for the activity to wipe. */
      .then(function () { return handOver(dom.nextBtn); })
      .then(function () {
        return cardAway(longChord.line,
                        [Flow.anim(Beats.lineUnlight(longChord.glow))]);
      })
      .then(function () {
        restoreAside();
        return Promise.all([Flow.anim(collapseHeader(false)), slideCircle(0)]);
      });
  }

  /* One chord put on the circle the way the first was taught: its two
     points, then the line from the one to the other. `slow` draws it at the
     lesson's slow-motion pace; otherwise a little quicker. */
  function drawChord(c, slow) {
    var dot = slow ? DOT_TIME : NEXT_DOT;
    return Flow.anim(Beats.plotDot(c.ends[0], dot))
      .then(function () { return Flow.wait(PAIR_GAP); })
      .then(function () { return Flow.anim(Beats.plotDot(c.ends[1], dot)); })
      .then(function () { return Flow.wait(PAIR_GAP); })
      .then(function () {
        return Flow.anim(Beats.growLine(c.line, slow ? LINE_TIME : NEXT_LINE, 'sine.inOut'));
      });
  }

  /* The chords' group put back to rest after a fade, with no animation: the
     group's own fade handed back -- or a line drawn into it next would be
     drawn into a group still at nothing -- and every chord, point and light
     inside back to its resting state, which is invisible. */
  function clearChords() {
    chords.concat(longChord).forEach(function (c) { c.glow.classList.remove('is-lit'); });
    clearInline([dom.chords].concat(
      Array.prototype.slice.call(dom.chords.querySelectorAll('*'))));
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
       `lit` is the narrower list -- the marks the pulse is for. It takes
     the centre's dot rather than its group, because a highlight has to land
     on the mark the name is ABOUT, and a group carries a halo and a hit
     area as well. */
  function quizSteps() {
    return [
      { name: 'Circumference',
        marks: [dom.rim],
        lit: [dom.rim],
        draw: function () {
          return Flow.anim(Beats.drawRim(dom.rim, dom.rimTip));
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

     A section that opens a new skill says so with `skill`, its heading in
     the level bar's list; one without it carries on the skill before it.
     Its scenes are appended to the lesson's, so the level bar, Next, Skip
     and Replay all work on them without knowing they came from elsewhere. */
  var BASE_SCENES = SCENES.length;
  var sections = [];
  var skills = [{ first: 0, name: 'Skill 1 · Parts of a circle' }];

  function addSection(spec) {
    if (!spec || !spec.scenes) return;
    spec.first = SCENES.length;
    sections.push(spec);
    if (spec.skill) skills.push({ first: spec.first, name: spec.skill });
    spec.scenes.forEach(function (sc) { SCENES.push(sc); });
    if (dom && spec.build) spec.build(kit);
  }
  function sectionOf(index) {
    for (var i = sections.length - 1; i >= 0; i--) {
      if (index >= sections[i].first) return sections[i];
    }
    return null;
  }

  /* Where the lesson is, and whoever asked to be told when that changes.
     The level bar is the only listener; the lesson itself never asks.
       Two numbers, because a scene is not what the learner moves through:
     `at` is the scene, and `page` is which stretch of it is on screen --
     how many hand-overs are behind us within that scene. A scene can hold
     one page or six (the last activity is one page per name), which is why
     the bar counts pages and not scenes.
       `seen` is how many pages each scene turned out to have. It cannot be
     known in advance -- a scene that hands over inside a loop decides it as
     it plays -- so it is learned as the lesson is played, and the bar's
     list of places to jump to grows with it. */
  var at = 0;
  var page = 0;
  var seen = [];
  var seek = 0;              /* hand-overs a jump is still stepping over */
  var seekIn = -1;           /* and the scene those hand-overs are in     */
  var watchers = [];

  function note(scene, p) {
    if (!(seen[scene] > p + 1)) seen[scene] = p + 1;
  }

  function turned() {
    page++;
    announce();
  }

  function announce() {
    var where = {
      scene: at, scenes: SCENES.length, name: SCENES[at].name,
      page: page, pages: seen.slice()
    };
    watchers.forEach(function (fn) {
      /* A listener's fault is not the lesson's. */
      try { fn(where); } catch (e) {}
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
      page = 0;
      note(i, 0);
      /* A seek that outlived its own scene was asking for a page that scene
         does not have. It stops here, at the start of the next one, rather
         than eating its way through the rest of the lesson. */
      if (seek && i !== seekIn) { seek = 0; Flow.resume(); }
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
    if (sayBubble) sayBubble.clear();
    if (sayPrompt) sayPrompt.clear();
    speaking++;

    /* A replay can catch the bird mid-jump, which is the one state in the
       lesson that has a second element in it. Put the hopper away before
       anything else. */
    hopperOff();
    mascot.el.hidden = false;
    mascot.el.classList.remove('is-away');
    /* And whatever the bird was in the middle of -- a line the reset cut
       off before it could settle -- is let go: the next run starts it from
       the idle, rather than finding it still talking. */
    mascot.idle();
    rowsMove = null;
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

    /* The chord and the activity both open with the bird behind the board,
       which is where the previous scene's exit jump left it. `is-away` is
       what tells a jump-out there is nothing to jump. */
    mascot.el.classList.add('is-away');

    if (index === 2) {
      /* The chord opens on the filled circle and its centre, as a plain
         point, and on nothing else. */
      M.set([dom.rim, dom.disc], { opacity: 1 });
      dom.centre.removeAttribute('hidden');
      dom.centre.classList.add('is-quiet');
      return;
    }

    /* Past this lesson's own scenes, the section the scene belongs to
       writes the rest of its opening state over that. */
    if (index >= BASE_SCENES) {
      var s = sectionOf(index);
      if (s && s.stage) s.stage(index - s.first);
    }
  }

  /* Idempotent: the board and its one bird are built once. Called again --
     by script.js and by a runFrom that got there first -- it hands back what
     is already built rather than building a second bird over the first. */
  function init() {
    if (dom) return { dom: dom, mascot: mascot };
    dom = collect();
    chords = buildChords(dom.chords);
    longChord = buildLongChord(dom.chords);
    sweep = buildSweep(dom.radSweep);
    quiz = buildQuiz(dom.quiz);

    mascot = global.Mascot.create({ slot: dom.slotHero });

    sayBubble = global.Typer.create($('bubbleType'), { box: dom.bubble });
    sayPrompt = global.Typer.create($('promptType'));
    /* One typer for the aside, whichever section is speaking in it: a box
       with two typers bound to it has two owners, and the guard that stops
       an orphaned line writing over a newer one only works within one. */
    sayAside  = global.Typer.create($('asideType'), { box: dom.bubbleAside });
    /* ...and the line under it, with no box: the box is the first line's. */
    sayMore   = global.Typer.create($('asideMore'));

    sections.forEach(function (s) { if (s.build) s.build(kit); });

    return { dom: dom, mascot: mascot };
  }

  /* Start the lesson at a scene -- at one PAGE of that scene -- and play it
     through to the end.
       The pages of the scene before the one asked for are not cut: they are
     played at once. Every beat still runs, the taps they ask for are
     answered for the learner (Flow.once's `auto`), and the hand-overs
     between them are stepped over by handOver. The board the asked-for page
     opens on is therefore the board that page would really have opened on,
     and the page itself plays at full speed from its own first beat. */
  var started = false;        /* a run has begun -- see script.js */

  function runFrom(index, wanted) {
    if (!dom) init();
    started = true;
    index = Math.max(0, Math.min(SCENES.length - 1, index | 0));
    seek = Math.max(0, wanted | 0);
    seekIn = index;

    /* Retire the previous run BEFORE cleaning up after it. Each tracked
       animation hands back whatever it had written inline as it is killed,
       so cleaning first would just have those writes land on top of it. */
    Flow.reset();
    /* The board as the asked-for page finds it is WRITTEN, not animated:
       the rows' transition (see .board in style.css) is held off across
       the rewrite, and the layout forced while it is off -- moveRows' own
       hold -- or a jump between a closed header and an open one would play
       the rows easing between them as the page opened. */
    dom.board.style.transition = 'none';
    rewind();
    stageFor(index);
    void dom.board.offsetHeight;
    dom.board.style.transition = '';
    return Flow.run(function () {
      if (seek > 0) Flow.skip();
      return play(index);
    });
  }

  function run() { return runFrom(0, 0); }

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
    sayAside: function () { return sayAside; },
    restoreAside: restoreAside,
    /* the speech card every stood-aside explanation wears: a section
       passes its own circle as the anchor, and hands the pane back
       through restoreAside as ever */
    cardUp: cardUp, cardAway: cardAway, alignMessage: alignMessageTo,
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
    started: function () { return started; },
    levels: function () { return SCENES.map(function (s) { return s.name; }); },
    /* Where each skill starts, as {first: scene index, name}, in order. */
    skills: function () { return skills.slice(); },
    level: function () { return at; },
    page: function () { return page; },
    /* How many pages each scene has turned out to have, so far. */
    pages: function () { return seen.slice(); },
    onLevel: function (fn) {
      if (typeof fn !== 'function') return;
      watchers.push(fn);
      fn({ scene: at, scenes: SCENES.length, name: SCENES[at].name,
           page: page, pages: seen.slice() });
    },
    mascot: function () { return mascot; },
    dom: function () { return dom; }
  };
})(window);
