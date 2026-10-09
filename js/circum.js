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
 * Page 1 -- the formula. One question:
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
 *   green, the other pills fade back, the box turns green with "Correct!"
 *   and then the formula, and Next arrives. The bird stays beside its
 *   verdict until Next is PRESSED -- only then does it drop away with the
 *   box, the pills and the circle.
 *
 * Page 2 -- the semicircle's arc length. The same ask, on a new circle:
 *
 *   The board opens blank. A circle is drawn -- the outline only, no wash,
 *   at skill 1's own pace -- a small dot goes on its centre, and a thin
 *   dashed line grows out of the dot both ways to the rim and cuts the
 *   circle in two. The upper half is lit, and as it is the lower half of
 *   the rim goes soft behind a blur, so the eye is kept on the upper
 *   border. The bird comes up onto the header to say "This is the
 *   semicircle.", then springs away as the circle slides to the left half,
 *   and lands in the right pane to ask, from bubble-02, for the formula of
 *   the semicircle's arc length. Three formulas, one by one; a wrong press
 *   is refused with why, as on page 1. The right one shows, at once, the
 *   straight angle at the centre -- 180°, in the dashed line's own ink,
 *   the text's dark blue -- while the box turns green to say so, and Next
 *   arrives.
 *
 * Page 3 -- the quadrant's arc length. Two pills this time:
 *
 *   The board opens blank. A circle is outlined at skill 1's pace and a
 *   small dot goes on its centre. The vertical radius grows up out of the
 *   dot to twelve o'clock, then the horizontal one out to three, and the
 *   quarter between them is swept in -- tinted, with its own piece of the
 *   rim lit -- one-fourth of the whole circle. The right angle at the
 *   centre is drawn and "90°" lands inside it. The figure slides smoothly
 *   to the left half, and the bird comes up in the right pane to ask for
 *   the quarter's arc length. Two formulas arrive one by one, each with
 *   its fraction stood up as on paper; a wrong press is refused with why,
 *   and the right one lights the quarter once more and puts skill 1's
 *   small burst up off it while the box turns green to say so.
 *     Its words are the first in the game read by key (T('key'), js/
 *   i18n.js) from locales/locales.json, and each line is voiced by the
 *   same key (I18n.say) once a recording is there.
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
     the box's rows never split one -- nor start a row with "=". And a
     sentence long enough to wrap keeps its last two words together, so its
     last row is never one stray word. */
  var NB = ' ';
  function whole(s) { return s.replace(/ /g, NB); }
  function tie(s) { return s.replace(/ (\S+)$/, NB + '$1'); }
  /* Every page's lines are read by key at the moment its scene starts (the
     locale is in by then -- see start() in script.js), each line carrying
     its key so it can be voiced. The fractions are spelled with U+2044 in
     the locale and stood up by mathtext.js. */
  function T(key, repl) { return global.T ? global.T(key, repl) : key; }
  function said(key, text) { return { text: text, vo: key }; }
  function nope(key, f) {
    return [said('fbNotQuite', T('fbNotQuite')), said(key, tie(T(key, { f: whole(f) })))];
  }

  /* page 1 -- the circumference formula */
  function formulaLines() {
    var right = T('s2OptPiDiameter'), half = T('s2OptPiRadius'), area = T('s2OptPiRadiusSq');
    var wrong = {};
    wrong[half] = nope('s2CfWrongRadius', half);
    wrong[area] = nope('s2CfWrongArea', area);
    return {
      ask:     said('s2CfAsk', tie(T('s2CfAsk'))),
      options: [half, right, area],
      answer:  right,
      wrong:   wrong,
      /* the formula's row is kept whole, and "=" never starts a row */
      right:   [said('fbCorrect', T('fbCorrect')),
                said('s2CfRight', T('s2CfRight', { f: whole(right) }).replace(' =', NB + '='))]
    };
  }

  /* page 2 -- the semicircle's arc length */
  function semiLines() {
    /* The right one is written simplified -- π × radius, the ½ and the 2
       cancelled -- as the learner would write it (user, 2026-10-09). */
    var right = T('s2OptPiRadius'), full = T('s2Opt2PiRadius'), quarter = T('s2OptHalfPiRadius');
    var wrong = {};
    wrong[full] = nope('s2CsWrongWhole', full);
    wrong[quarter] = nope('s2CsWrongQuarter', quarter);
    return {
      is:      said('s2CsIs', T('s2CsIs')),
      ask:     said('s2CsAsk', tie(T('s2CsAsk'))),
      options: [right, full, quarter],
      answer:  right,
      wrong:   wrong,
      right:   [said('fbCorrect', T('fbCorrect')),
                said('s2CsRight', tie(T('s2CsRight', { f: whole(full) })))]
    };
  }

  /* page 3 -- the quadrant's arc length */
  function quadLines() {
    var half = T('p21OptHalf');
    var quarter = T('p21OptQuarter');
    var wrong = {};
    wrong[quarter] = [said('fbNotQuite', T('fbNotQuite')),
                      said('p21WrongQuarter', tie(T('p21WrongQuarter', { f: whole(quarter) })))];
    return {
      ask:     said('p21Ask', tie(T('p21Ask'))),
      options: [half, quarter],
      answer:  half,
      wrong:   wrong,
      right:   [said('fbCorrect', T('fbCorrect')), said('p21Right', tie(T('p21Right')))]
    };
  }

  /* ½ is spelled with the glyph in the locale, as data, and DRAWN as 1
     over 2 -- numerator, bar, denominator -- wherever it is shown: on the
     pills (buildChoices, pages.js) and in the box's sentences (typer.js),
     both written through mathtext.js. */

  var BEAT = K.BEAT, SHORT = K.SHORT;
  /* The circles here are drawn briskly -- the learner has watched one
     made slowly in skill 1 -- and the marks on them follow close behind
     (user, 2026-10-09: "increase the speed of the drawn circle"). */
  var DRAW_TIME  = 1.4,   DRAWN_HOLD = 500;
  var DOT_TIME   = 0.45,  DOT_HOLD   = 420;
  var LINE_TIME  = 0.9,   DIA_HOLD   = 700;
  var RADIUS_TIME = 0.8;   /* s: page 1's radius, out from the centre   */
  var SOFT = 0.55;         /* how much of the lower half is left to see once
                              it has gone behind its blur */
  var READ = 700;          /* ms a verdict's sentence stands, once typed,
                              before the next one takes the box */
  var SHIFT = -250;        /* the circle's slide to the left half -- the same
                              stand-aside every section uses, picture units */
  var R = 158;             /* the circle's radius, picture units          */
  var BURST_WAIT = 360;    /* ms from the right press to the burst -- skill
                              1's, from the name landing to its burst      */

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
    dom.cfCentre = $('cfCentre');
    dom.cfRadius = $('cfRadius');
    dom.cfRadLbl = $('cfRadLbl');
    dom.cfPane   = $('cfPane');
    dom.slotCf   = $('slotCf');
    dom.cfBubble = $('bubbleCf');
    dom.cfOpts   = $('cfOpts');

    dom.cs       = $('cs');
    dom.csRim    = $('csRim');
    dom.csLower  = $('csLower');
    dom.csTip    = $('csTip');
    dom.csDia    = $('csDia');
    dom.csDiaPen = $('csDiaPen');
    dom.csArc    = $('csArc');
    dom.csAngle  = $('csAngle');
    dom.csCentre = $('csCentre');
    dom.csDeg    = $('csDeg');

    dom.cq       = $('cq');
    dom.cqSector = $('cqSector');
    dom.cqRim    = $('cqRim');
    dom.cqTip    = $('cqTip');
    dom.cqArc    = $('cqArc');
    dom.cqRadV   = $('cqRadV');
    dom.cqRadH   = $('cqRadH');
    dom.cqAngle  = $('cqAngle');
    dom.cqCentre = $('cqCentre');
    dom.cqBurst  = $('cqBurst');

    /* fit: the box closes round each line's own rows, so the question and
       every verdict get a box their own size, eased from one to the next. */
    sayCf = global.Typer.create($('cfType'), { box: dom.cfBubble, fit: true });

    reset();
  }

  /* ======================================================================
   * bubble-02 -- this section's own beats
   * ====================================================================== */

  /* The pane emptied: the box shut, cleared and wearing no verdict, the
     pills gone -- so the next question asked from it is not asked from a
     box still wearing the last one's colour. */
  function emptyPane() {
    dom.cfBubble.classList.remove('is-ok', 'is-bad');
    sayCf.clear();
    dom.cfBubble.setAttribute('hidden', '');
    M.set(dom.cfBubble, { clearProps: 'opacity,transform,transformOrigin' });
    dom.cfOpts.textContent = '';
    opts = [];
    dom.cfPane.classList.remove('is-long');
  }
  /* And put away: emptied and shut. */
  function restorePane() {
    emptyPane();
    dom.cfPane.setAttribute('hidden', '');
  }

  /* The question taken away but the pane kept: the box shuts and the pills
     go while the bird stays where it stands, for a page that asks again
     from the same spot (the sector-fraction page, central.js). */
  function clearAsk() {
    saying++;                     /* no verdict owns the box any more */
    if (global.I18n) global.I18n.stop();
    return Promise.all([
      Flow.anim(Beats.bubbleOut(dom.cfBubble)),
      Flow.anim(optsOut(opts))
    ]).then(emptyPane);
  }

  /* The bird, already in the pane, saying its piece from bubble-02: the
     box opened if it is shut, each line typed in turn and read for a
     moment, and the bird settled at the end. `on(i, line)`, if given, is
     called as line i starts -- for a mark on the board that should land
     with the words naming it (the arc-length page, central.js). No verdict
     hue: the box keeps the question's own. */
  function explain(lines, on) {
    var mine = ++saying;
    function live() { return mine === saying; }
    dom.cfBubble.classList.remove('is-ok', 'is-bad');
    var arm = dom.cfBubble.hasAttribute('hidden');
    mascot.state('talking');
    return [].concat(lines).reduce(function (chain, line, i) {
      return chain
        .then(function () { if (i && live()) return Flow.wait(READ); })
        .then(function () {
          if (!live()) return;
          if (on) on(i, line);
          if (i === 0 && arm) {
            /* Ghost before live, and before the box is shown -- see the
               ask above for why. */
            Beats.bubbleArm(dom.cfBubble);
            var said = speak(line);
            Beats.bubbleIn(dom.cfBubble);
            return said;
          }
          return speak(line);
        });
    }, Promise.resolve()).then(function () {
      if (live()) mascot.settle();
    });
  }

  /* Whether the bird is standing in the pane now, and so can simply ask
     its next question there rather than having to come up to ask it. */
  function birdInPane() {
    var el = mascot.el;
    return el.parentNode === dom.slotCf && !el.hidden && !el.classList.contains('is-away');
  }

  /* The pane as a page that asks from it expects to FIND it, written
     straight in with no animation: open, with the bird standing in it --
     for a page staged from the level bar on a board the bird never left
     (see stage in central.js). */
  function seatBird() {
    dom.cfPane.removeAttribute('hidden');
    mascot.el.hidden = false;
    mascot.el.classList.remove('is-away');
    mascot.placeIn(dom.slotCf);
    mascot.idle();
  }

  /* A verdict said from the box, in its colour -- or in none, for the
     question itself. The box is already open: only the hue and the words
     change, and the bird holds the mood for as long as it is talking.
     `lines` is one sentence or several, said one at a time, each read for
     a moment and then replaced -- the box closing round each in turn.
       A newer verdict takes the box over: `saying` is bumped at the start,
     and an older chain that wakes up to find itself outvoted says nothing
     more and leaves the bird alone rather than settling it out from under
     the new line. `on(i, line)`, if given, is called as line i starts --
     for a mark on the board that should light with the words naming it
     (the wiper pages, practice.js). */
  function verdict(lines, mood, cls, on) {
    var mine = ++saying;
    function live() { return mine === saying; }
    dom.cfBubble.classList.remove('is-ok', 'is-bad');
    if (cls) dom.cfBubble.classList.add(cls);
    mascot.state(mood || 'talking');
    return [].concat(lines).reduce(function (chain, line, i) {
      return chain
        .then(function () { if (i && live()) return Flow.wait(READ); })
        .then(function () {
          if (!live()) return;
          if (on) on(i, line);
          return speak(line);
        });
    }, Promise.resolve()).then(function () {
      if (live()) mascot.settle();
    });
  }

  /* One line into the box: a plain string, or {text, vo} -- a line read by
     key (page 3), voiced by the same key as it is typed. A key with no
     recording yet is silence (I18n.say). */
  function speak(line) {
    if (typeof line === 'string') return sayCf(line);
    if (line.vo && global.I18n) K.quiet(global.I18n.say(line.vo));
    return sayCf(line.text);
  }

  /* The three formulas, one by one: the tray's own entrance with the
     stagger opened right up, so each pill is its own arrival. Hidden by
     hand first, or the row flashes complete for the frame before the
     tween's first. */
  function optsIn(list) {
    /* One size for the row: every pill as wide as the widest and as tall
       as the tallest, so a formula with a fraction stood up in it does
       not make its pill the odd one out (user, 2026-10-09). */
    var w = 0, h = 0, sum = 0;
    list.forEach(function (b) {
      var r = b.getBoundingClientRect();
      w = Math.max(w, r.width); h = Math.max(h, r.height); sum += r.width;
    });
    /* ...the width only while the row has the room: three pills as wide
       as the widest that would no longer stand in one row keep their own
       widths instead, which is better than a pill alone on a second row. */
    var row = dom.cfOpts.getBoundingClientRect();
    var cs = getComputedStyle(dom.cfOpts);
    var room = row.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
             - parseFloat(cs.columnGap || cs.gap || 0) * (list.length - 1);
    var same = w * list.length <= room;
    list.forEach(function (b) {
      if (same) b.style.minWidth = Math.ceil(w) + 'px';
      b.style.minHeight = Math.ceil(h) + 'px';
    });
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

  /* ---- page 2's own marks ------------------------------------------------
     The dashed diameter, grown out of the centre dot both ways at once. A
     dashed line cannot be drawn with the dash trick -- the trick IS a dash
     pattern -- so it shows through a mask (see #csDiaMask in index.html):
     a solid path over the same line, widened from nothing about the centre,
     and the dashes appear wherever the mask has reached. Scale is the one
     thing animated, and it is handed back when the timeline ends, however
     it ends -- a mask at rest is the whole line, uncovered. */
  function dashedFromCentre(line, pen, seconds) {
    M.set(line, { opacity: 1 });
    M.set(pen, { scaleX: 0, svgOrigin: K.CX + ' ' + K.CY });
    var tl = M.timeline({ revert: function () { M.set(pen, { clearProps: 'transform' }); } });
    tl.to(pen, { scaleX: 1, duration: M.dur(seconds), ease: 'sine.inOut' });
    return tl;
  }

  /* The lower half put out of focus once the upper half is lit: the sharp
     rim goes as its blurred lower half comes up in its place, one cross-
     fade. The upper half of the sharp rim is under the lit arc by then, so
     the only change the eye can see is below the diameter. */
  function softenLower(rim, lower) {
    var tl = M.timeline({ willChange: [rim, lower], willChangeValue: 'opacity' });
    tl.to(rim,   { opacity: 0,    duration: M.dur(0.6), ease: 'power2.inOut' }, 0)
      .to(lower, { opacity: SOFT, duration: M.dur(0.6), ease: 'power2.out' }, 0);
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
    var lines = formulaLines();
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle: the pen round the rim, the colour poured in ------- */
      .then(function () {
        dom.cf.removeAttribute('hidden');
        return Flow.anim(Beats.drawRim(dom.cfRim, dom.cfTip, { time: DRAW_TIME }));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.fillDisc(dom.cfDisc)); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the centre, a radius out of it, and its name: the formulas
         about to be asked for are written in it (user, 2026-10-09) ------- */
      .then(function () { return Flow.anim(Beats.plotDot(dom.cfCentre, DOT_TIME)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Flow.anim(Beats.growLine(dom.cfRadius, RADIUS_TIME, 'sine.inOut'));
      })
      .then(function () { return Flow.anim(Beats.labelIn(dom.cfRadLbl)); })
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
      .then(function () {
        return askFormula({
          ask: lines.ask, options: lines.options, answer: lines.answer,
          wrong: lines.wrong, right: lines.right
        });
      })
      .then(function () { return closeOut(dom.cf); });
  }

  /* ======================================================================
   * The ask, as both pages put it: the bird up in the pane, the question
   * from bubble-02, the formulas one by one, the press, and the verdict.
   *   spec: ask (the question), options, answer, wrong ({name: lines}),
   * right (lines), and `reveal` -- what the board shows the moment the
   * right formula is pressed, alongside the verdict -- if anything;
   * `onAsk`, a beat on the board played as the question is asked, and
   * `onRight(i)`, one as each sentence of the right verdict starts.
   * ====================================================================== */
  function askFormula(spec) {
    /* ---- the bird, and the question from bubble-02 -------------------------
       The pane opens first so the slot has a box to be measured by, the
       bird comes up onto it, and the box unfolds from its head with the
       question typing in -- the greeting's own entrance, on the board. A
       bird already standing in the pane -- a second question on the same
       board -- simply asks from where it is. */
    dom.cfPane.removeAttribute('hidden');
    /* A bird that has just finished a line on the header hops straight
       across to the pane -- one arc over the board (user, 2026-10-09). */
    var up = birdInPane() ? Promise.resolve()
           : K.birdOnHeader() ? K.mascotHopTo(dom.slotCf)
           : K.mascotJumpIn(dom.slotCf);
    return up
      .then(function () {
        mascot.state('talking');
        /* Ghost before live, and before the box is shown: the box has to be
           laid out and measurable when the line goes into it, or it would
           open at the wrong size and resize a beat later. */
        Beats.bubbleArm(dom.cfBubble);
        /* and, if the page asks for one, a beat on the board that shows
           what the question is about, played as the words arrive */
        if (spec.onAsk) K.quiet(spec.onAsk());
        var asked = speak(spec.ask);
        Beats.bubbleIn(dom.cfBubble);
        return asked;
      })
      .then(function () {
        mascot.settle();
        return Flow.wait(SHORT);
      })

      /* ---- the three formulas, one by one ----------------------------------
         Each pill keeps its formula as data (buildChoices, pages.js): the
         ½ on two of them is drawn stacked, so the element's own text is
         not the label. */
      .then(function () {
        opts = K.buildChoices(dom.cfOpts, K.shuffle(spec.options));
        return Flow.anim(optsIn(opts));
      })

      /* ---- the press. The box answers every try: red with the why for a
         wrong one -- those verdicts are waits the chain never awaits, so
         they go through quiet() -- and the right answer's verdict is the
         scene's own beat, said in green once the gate has fired. ---------- */
      .then(function () {
        return armChoices({
          answer: spec.answer,
          onWrong: function (name) {
            K.quiet(verdict(spec.wrong[name], 'confused', 'is-bad'));
          }
        });
      })
      /* The answer stands alone: the other pills -- spent, no longer
         controls -- step back to a faint 0.4 while the box says why, so the
         green one is what the eye is left on. */
      .then(function () {
        var right = opts.filter(function (b) { return b.dataset.name === spec.answer; })[0];
        return Promise.all([
          verdict(spec.right, 'happy', 'is-ok', spec.onRight),
          Flow.anim(M.focus(right, opts, { opacity: 0.4 })),
          spec.reveal ? spec.reveal() : null
        ]);
      })
      .then(function () { return Flow.wait(BEAT); });
  }

  /* ======================================================================
   * Next -- and only its PRESS sends the bird away. handOver waits on the
   * button, so everything after it is after the learner has pressed it:
   * the box shuts, the pills and the circle fade, and the bird drops back
   * behind the board, all at once. Then everything is handed back to its
   * built state and the header opens again over a clean board, which is
   * where whatever comes next begins.
   * ====================================================================== */
  function closeOut(group, also) {
    return K.handOver(dom.nextBtn)
      .then(function () {
        saying++;                     /* no verdict owns the box any more */
        if (global.I18n) global.I18n.stop();
        return Promise.all([
          Flow.anim(Beats.bubbleOut(dom.cfBubble)),
          Flow.anim(optsOut(opts)),
          K.mascotJumpOut(),
          Flow.anim(Beats.clearFigure([group])),
          /* and whatever else the page keeps up beside its figure */
          also ? also() : null
        ]);
      })
      .then(function () {
        restorePane();
        group.setAttribute('hidden', '');
        K.clearInline([group].concat(
          Array.prototype.slice.call(group.querySelectorAll('*'))));
        return Flow.anim(K.collapseHeader(false));
      });
  }

  /* ======================================================================
   * Page 2 -- the semicircle's arc length. A blank board, the circle
   * outlined at skill 1's pace, the small dot at its centre, the dashed
   * line grown out of the dot that cuts it in two, the upper half lit and
   * the lower half softened, and the half named from the header; then the
   * circle stands aside, the bird crosses to the pane and asks for the
   * formula, and the right answer shows the straight angle the semicircle
   * stands on: 180°.
   * ====================================================================== */
  function sceneSemicircle() {
    var lines = semiLines();
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle: the slow pen once round, and the ring left to
         stand -- an outline only, nothing poured in, so the rim is all
         there is to look at ---------------------------------------------- */
      .then(function () {
        dom.cs.removeAttribute('hidden');
        return Flow.anim(Beats.drawRim(dom.csRim, dom.csTip, { time: DRAW_TIME }));
      })
      .then(function () { return Flow.wait(DRAWN_HOLD); })

      /* ---- the small dot at the centre ------------------------------------ */
      .then(function () { return Flow.anim(Beats.plotDot(dom.csCentre, DOT_TIME)); })
      .then(function () { return Flow.wait(DOT_HOLD); })

      /* ---- cut in two: the dashed line out of the dot, both ways at once,
         to the rim ---------------------------------------------------------- */
      .then(function () {
        return Flow.anim(dashedFromCentre(dom.csDia, dom.csDiaPen, LINE_TIME));
      })
      .then(function () { return Flow.wait(DIA_HOLD); })

      /* ---- the upper half lit: swept over the top at the line's own pace,
         then the lower half put behind its blur as the lit half swells once,
         so what is left sharp is the half being talked about -------------- */
      .then(function () {
        return Flow.anim(Beats.growLine(dom.csArc, LINE_TIME, 'sine.inOut'));
      })
      .then(function () {
        return Promise.all([
          Flow.anim(softenLower(dom.csRim, dom.csLower)),
          Flow.anim(Beats.arcPulse([dom.csArc]))
        ]);
      })
      .then(function () { return Flow.wait(DIA_HOLD); })

      /* ---- named from the header ------------------------------------------ */
      .then(function () { return K.arriveSaying(lines.is); })
      .then(function () {
        mascot.settle();
        return Flow.wait(BEAT);
      })

      /* ---- the circle stands aside, and the bird crosses -------------------
         The line goes and the circle slides smoothly to the left half
         while the bird stays where it is; it then hops straight across
         from the header to the right pane to ask (askFormula), the header
         closing behind it. */
      .then(function () {
        return Promise.all([
          Flow.anim(Beats.lineOut(dom.promptLine)),
          Flow.anim(Beats.slideArcs(dom.cs, SHIFT))
        ]);
      })
      .then(function () {
        K.clearPrompt();
        return Flow.wait(SHORT);
      })
      .then(function () {
        dom.cfPane.classList.add('is-long');
        return askFormula({
          ask: lines.ask, options: lines.options, answer: lines.answer,
          wrong: lines.wrong, right: lines.right,
          reveal: showAngle
        });
      })
      .then(function () { return closeOut(dom.cs); });
  }

  /* The straight angle at the centre: the half-turn drawn over the dot
     that has been there since the circle was made, and its "180°" -- both
     in the dashed line's own ink, the text's dark blue. */
  function showAngle() {
    return Flow.anim(Beats.growLine(dom.csAngle, 0.6, 'power2.inOut'))
      .then(function () { return Flow.anim(Beats.labelIn(dom.csDeg)); });
  }

  /* ======================================================================
   * Page 3 -- the quadrant's arc length. A blank board, the circle outlined
   * at skill 1's pace, the small dot at its centre, the two radii grown out
   * of it -- up, then across -- and the quarter between them swept in with
   * its piece of the rim lit; the right angle and its "90°"; then the
   * figure stands aside and the bird asks from the pane. Two formulas, one
   * by one. The right one lights the quarter again and puts up skill 1's
   * burst off it.
   * ====================================================================== */

  /* The quarter at t of its sweep, 0 to 1: from the vertical radius,
     clockwise round to the horizontal one. */
  function quarterWedge(t) {
    var a = (-90 + 90 * t) * Math.PI / 180;
    var x = K.CX + R * Math.cos(a);
    var y = K.CY + R * Math.sin(a);
    return 'M' + K.CX + ' ' + K.CY + ' L' + K.CX + ' ' + (K.CY - R) +
           ' A' + R + ' ' + R + ' 0 0 1 ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' Z';
  }

  function sceneQuadrant() {
    var lines = quadLines();
    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle: the slow pen once round, an outline only ---------- */
      .then(function () {
        dom.cq.removeAttribute('hidden');
        return Flow.anim(Beats.drawRim(dom.cqRim, dom.cqTip, { time: DRAW_TIME }));
      })
      .then(function () { return Flow.wait(DRAWN_HOLD); })

      /* ---- the small dot at the centre ------------------------------------ */
      .then(function () { return Flow.anim(Beats.plotDot(dom.cqCentre, DOT_TIME)); })
      .then(function () { return Flow.wait(DOT_HOLD); })

      /* ---- the two radii out of the dot: up to twelve o'clock, then out to
         three -- each at the line's own slow pace, so the right angle is
         seen being made one arm at a time --------------------------------- */
      .then(function () {
        return Flow.anim(Beats.growLine(dom.cqRadV, LINE_TIME, 'sine.inOut'));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Flow.anim(Beats.growLine(dom.cqRadH, LINE_TIME, 'sine.inOut'));
      })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the quarter between them: tint swept round from one radius to
         the other with its piece of the rim lit at the same pace, then the
         lit piece swells once -- one-fourth of the whole circle ------------ */
      .then(function () {
        return Promise.all([
          Flow.anim(Beats.secFill(dom.cqSector, quarterWedge, LINE_TIME)),
          Flow.anim(Beats.growLine(dom.cqArc, LINE_TIME, 'power2.inOut'))
        ]);
      })
      .then(function () { return Flow.anim(Beats.arcPulse([dom.cqArc])); })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the right angle at the centre: the small square, which says
         90° on its own (user, 2026-10-09: the sign is enough) ----------- */
      .then(function () {
        return Flow.anim(Beats.growLine(dom.cqAngle, 0.5, 'power2.inOut'));
      })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- and the figure stands aside -------------------------------------
         As on page 1: there is no bird on the header, so it closes while
         the figure slides smoothly to the left half. */
      .then(function () {
        return Promise.all([
          Flow.anim(K.collapseHeader(true)),
          Flow.anim(Beats.slideArcs(dom.cq, SHIFT))
        ]);
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return askFormula({
          ask: lines.ask, options: lines.options, answer: lines.answer,
          wrong: lines.wrong, right: lines.right,
          reveal: celebrateQuarter
        });
      })
      .then(function () { return closeOut(dom.cq); });
  }

  /* The right formula pressed: the quarter's piece of the rim swells once
     more, and skill 1's small burst goes up off the middle of it -- in the
     figure's own units, inside the slid group, so it rises from the arc
     wherever the figure stands. */
  function celebrateQuarter() {
    var mid = -45 * Math.PI / 180;
    var x = K.CX + R * Math.cos(mid);
    var y = K.CY + R * Math.sin(mid);
    return Promise.all([
      Flow.anim(Beats.arcPulse([dom.cqArc])),
      Flow.wait(BURST_WAIT).then(function () {
        return Flow.anim(Beats.confetti(dom.cqBurst, x, y));
      })
    ]);
  }

  /* ======================================================================
   * The hooks the board's housekeeping calls -- see addSection in pages.js
   * ====================================================================== */

  /* What this section has on the figure: one group per page, each faded
     as a whole. */
  function parts() { return [dom.cf, dom.cs, dom.cq]; }

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
    dom.cs.setAttribute('hidden', '');
    dom.cq.setAttribute('hidden', '');
    dom.cqSector.setAttribute('d', '');
    dom.cqBurst.textContent = '';
    if (global.I18n) global.I18n.stop();
    restorePane();
  }

  /* The board as the scene expects to find it, written straight in. Both
     scenes open on a wiped board -- each one's first beat is the wipe --
     so there is nothing to stage. */
  function stage() {}

  Pages.addSection({
    name: 'Circumference formula',
    scenes: [
      { name: 'Circumference formula', play: sceneFormula },
      { name: 'Semicircle arc length', play: sceneSemicircle },
      { name: 'Quadrant arc length',   play: sceneQuadrant }
    ],
    build: build,
    parts: parts,
    wipe: wipe,
    reset: reset,
    stage: stage
  });

  /* What a section after this one might want: the question's own box, for
     later asks to speak through -- the whole ask (the bird up in the pane,
     the question, the pills, the verdict) and the close-out that takes it
     all away on Next, so a later page asks with the same voice. The pane
     stays this section's: its wipe and reset hooks put it away whoever
     spoke from it last. */
  global.Circum = {
    verdict: verdict,
    armChoices: armChoices,
    ask: askFormula,
    explain: explain,
    closeOut: closeOut,
    clearAsk: clearAsk,
    putAway: restorePane,
    seatBird: seatBird
  };
})(window);
