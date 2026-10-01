/* ==========================================================================
 * arclen.js -- Skill 2: length of an arc of a sector
 * --------------------------------------------------------------------------
 * The second skill of the app, on the same board, with the same bird and
 * the same clock as the first: it is registered with pages.js as a section
 * (see addSection there), built from the kit pages.js hands over, the beats
 * in animations.js and the geometry arcs.js shares on window.Arcs. Nothing
 * here waits on anything except through Flow, so Skip, Replay and the level
 * bar work on these scenes exactly as they do on the first skill's. To
 * split the skills apart later, this file, css/arclen.css and the two
 * blocks in index.html (#arclen and #alAsk) are the whole of it.
 *
 * Section 1 -- identify the arcs. One scene, two rounds:
 *
 *   A circle is drawn, two points go on it, and the circumference is
 *   coloured as the two pieces they cut it into. The circle slides left,
 *   the smaller piece is lit while the larger stands back, and a sentence
 *   with an empty slot in it stands up on the right: "This is the ___ of
 *   the circle." Three names arrive under the sentence, one by one, and the
 *   right one has to be dragged into the slot. A wrong name is refused -- the
 *   slot shakes it off -- and the bird comes up onto the header to say why
 *   it is wrong, and STAYS there until the right name is in; then it says
 *   so, says what the piece is, and drops back behind the board as Next
 *   arrives. The second round is the same question about the larger piece,
 *   with two names.
 *
 * The section draws its OWN circle -- the #arclen group in index.html --
 * measured from the same three numbers as every other (CX, CY, RR in
 * pages.js), and the cut is FIXED: nothing on this circle is picked by the
 * learner, so the two points are two constants and everything on the
 * circle is redrawn from them.
 *
 * Load order: js/pages.js -> js/arcs.js -> ... -> js/quiz.js -> js/arclen.js
 * ========================================================================== */
(function (global) {
  'use strict';

  var M = global.Motion;
  var Flow = global.Flow;
  var Beats = global.Beats;
  var Pages = global.Pages;
  var A = global.Arcs;
  if (!Pages || !Pages.addSection || !A) {
    console.error('arclen.js: load js/pages.js and js/arcs.js before js/arclen.js.');
    return;
  }
  var K = Pages.kit;

  /* ---- the script -------------------------------------------------------
     Every word of the section in one place. The two wrong-answer notes are
     the definitions the learner will meet later in this skill, said early:
     a refusal that only says "no" teaches nothing. */
  var LINES = {
    tryAgain: 'Try again!',

    minorIs:  'The minor arc is the smaller arc of the circle.',
    majorIs:  'The major arc is the larger arc of the circle.',

    sectorNo:  'A sector is the region enclosed by two radii and an arc.',
    segmentNo: 'A segment is the region enclosed by a chord and an arc.',
    minorNo:   ['A minor arc is the smaller arc.',
                'But this is the larger piece of the circle.']
  };

  var BEAT = K.BEAT, SHORT = K.SHORT;
  var RR = K.RR;
  var P = A.P, arcD = A.arcD;

  /* ---- the cut, as two constants ----------------------------------------
     Degrees anticlockwise from three o'clock, as every angle in the app is.
     The minor arc runs from `a` anticlockwise for `span` degrees -- here a
     piece of the upper rim, plainly smaller than the rest, the way the
     learner left the lesson's own circles. */
  var ARC = { a: 25, span: 110 };
  var SHIFT = -250;        /* the circle's slide to the left half, picture units */
  var DROP_SLACK = 12;     /* px: how far outside the slot still counts as on it */

  /* ---- the two rounds ----------------------------------------------------
     One shape for both: which piece is lit and which stands back, the names
     under the sentence, the right one, what the bird says for it, and what
     it says for each wrong one. */
  function rounds() {
    return [
      { on: [dom.alMinor], off: [dom.alMajor],
        options: ['Minor arc', 'Sector', 'Segment'],
        answer: 'Minor arc',
        right: LINES.minorIs,
        wrong: { 'Sector': LINES.sectorNo, 'Segment': LINES.segmentNo } },
      { on: [dom.alMajor], off: [dom.alMinor],
        options: ['Major arc', 'Minor arc'],
        answer: 'Major arc',
        right: LINES.majorIs,
        wrong: { 'Minor arc': LINES.minorNo } }
    ];
  }

  /* ---- the elements ------------------------------------------------------ */
  var dom = null;          /* pages.js's, with this skill's own on top */
  var mascot = null;
  var chips = [];
  var up = false;          /* the bird is standing on the header       */
  var saying = 0;          /* which feedback owns the header line now  */

  function $(id) { return document.getElementById(id); }

  function build() {
    dom = Object.create(K.dom());
    mascot = K.mascot();

    dom.al         = $('arclen');
    dom.alRim      = $('alRim');
    dom.alTip      = $('alTip');
    dom.alMinor    = $('alMinor');
    dom.alMajor    = $('alMajor');
    dom.alDotA     = $('alDotA');
    dom.alDotB     = $('alDotB');
    dom.alAsk      = $('alAsk');
    dom.alLine     = $('alLine');
    dom.alSlot     = $('alSlot');
    dom.alSlotText = $('alSlotText');
    dom.alOpts     = $('alOpts');

    reset();
  }

  function dots() { return [dom.alDotA, dom.alDotB]; }
  function pieces() { return [dom.alMinor, dom.alMajor]; }

  /* Every mark that depends on the cut, rewritten from it. */
  function redraw() {
    dom.alMinor.setAttribute('d', arcD(ARC.a, ARC.span, false));
    dom.alMajor.setAttribute('d', arcD(ARC.a, 360 - ARC.span, true));
    [{ dot: dom.alDotA, deg: ARC.a },
     { dot: dom.alDotB, deg: ARC.a + ARC.span }].forEach(function (s) {
      var p = P(s.deg, RR);
      s.dot.setAttribute('cx', p.x);
      s.dot.setAttribute('cy', p.y);
    });
  }

  /* ======================================================================
   * The card and the slot -- this section's own beats
   * ====================================================================== */

  /* The sentence stands up: the line rises into place and the slot pops a
     touch behind it, the way every box in the app arrives. */
  function askIn() {
    dom.alAsk.removeAttribute('hidden');
    var tl = M.timeline({
      willChange: [dom.alLine, dom.alSlot], willChangeValue: 'transform, opacity'
    });
    tl.fromTo(dom.alLine, { opacity: 0, y: 16 },
              { opacity: 1, y: 0, duration: M.dur(0.5), ease: 'power2.out' }, 0)
      .fromTo(dom.alSlot, { scale: 0.8, transformOrigin: 'center center' },
              { scale: 1, duration: M.dur(0.45), ease: M.POP }, M.gap(0.18));
    return tl;
  }

  /* And taken away again, with whatever is written in it and whatever
     names are still standing under it. */
  function askOut() {
    var tl = M.timeline({
      willChange: [dom.alLine, dom.alOpts], willChangeValue: 'transform, opacity',
      revert: function () { dom.alAsk.setAttribute('hidden', ''); }
    });
    tl.to([dom.alLine, dom.alOpts],
          { opacity: 0, y: 10, duration: M.dur(0.3), ease: 'power2.in' });
    return tl;
  }

  /* The slot and the row of names back to the state they are built in:
     empty, dashed, not a control, and carrying none of GSAP's writes. */
  function clearSlot() {
    dom.alSlot.classList.remove('is-over', 'is-right', 'is-wrong');
    dom.alSlotText.textContent = '';
    dom.alSlot.setAttribute('tabindex', '-1');
    dom.alSlot.setAttribute('aria-label', 'Empty slot. Drop a name here.');
    dom.alAsk.classList.remove('is-live');
    dom.alOpts.textContent = '';
    chips = [];
    M.set([dom.alLine, dom.alOpts, dom.alSlot, dom.alSlotText],
          { clearProps: 'opacity,transform' });
  }

  /* The names, one by one: the tray's own entrance with the stagger opened
     right up, so each pill is its own arrival. Hidden by hand first, or
     the row flashes complete for the frame before the tween's first. */
  function chipsIn(list) {
    M.set(list, { opacity: 0 });
    var tl = M.timeline({ willChange: list, willChangeValue: 'transform, opacity' });
    tl.fromTo(list,
      { opacity: 0, y: 14, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: M.dur(0.4), ease: M.POP,
        stagger: M.gap(0.3) });
    return tl;
  }

  /* And the names NOT chosen, away again: once the right one is in the
     slot and the bird has said so, the question is spent and the leftover
     pills are the one thing on the board with nothing left to do. They
     leave the way they came, a beat apart. */
  function chipsOut(list) {
    if (!list.length) return null;
    var tl = M.timeline({ willChange: list, willChangeValue: 'transform, opacity' });
    tl.to(list, {
      opacity: 0, y: 10, scale: 0.94, duration: M.dur(0.3), ease: 'power2.in',
      stagger: M.gap(0.08)
    });
    return tl;
  }

  /* The slot, refused: it turns red and shakes its head, holds the red for
     a beat, and is a plain slot again -- boxWrong (animations.js), for the
     one box this skill keeps in HTML. */
  var SHAKE = [-5, 5, -5, 5, -4, 4, 0];

  function slotWrong() {
    var s = dom.alSlot;
    s.classList.remove('is-over');
    s.classList.add('is-wrong');
    Beats.sfx('wrong');
    var tl = M.timeline({
      willChange: s, willChangeValue: 'transform',
      revert: function () {
        s.classList.remove('is-wrong');
        M.set(s, { clearProps: 'transform' });
      }
    });
    var each = M.dur(0.3) / SHAKE.length;
    SHAKE.forEach(function (x, i) {
      tl.to(s, { x: x, duration: each,
                 ease: i === SHAKE.length - 1 ? 'power2.out' : 'none' });
    });
    tl.to({}, { duration: M.dur(0.5) });        /* the red, read before it goes */
    return tl;
  }

  /* The slot, answered: it turns green, the word pops in, and the slot
     gives one short pulse -- boxRight, for the same box. */
  function slotRight(name) {
    var s = dom.alSlot, t = dom.alSlotText;
    s.classList.remove('is-over', 'is-wrong');
    s.classList.add('is-right');
    t.textContent = name;
    s.setAttribute('aria-label', name + '. Correct.');
    Beats.sfx('correct');

    M.set(t, { opacity: 0, scale: 0.7, transformOrigin: 'center center' });
    var tl = M.timeline({ willChange: [s, t], willChangeValue: 'transform, opacity' });
    tl.to(s, { scale: 1.06, transformOrigin: 'center center',
               duration: M.dur(0.14), ease: 'power2.out' }, 0)
      .to(s, { scale: 1, duration: M.dur(0.3), ease: M.POP }, M.gap(0.14))
      .to(t, { opacity: 1, scale: 1, duration: M.dur(0.36), ease: 'back.out(1.7)' }, M.gap(0.1));
    return tl;
  }

  /* ---- the bird's verdicts ------------------------------------------------
     Said on the header: the word ("Try again!" / "Correct!") and then the
     why -- one sentence or several, each said in turn. The bird comes UP
     for the first verdict and stays for every one after -- a wrong drop
     never sends it away -- and only the round itself sends it back down,
     after the right answer's why.
       A newer verdict takes the header over: `saying` is bumped at the
     start, and an older chain that wakes up to find itself outvoted stops
     between its lines rather than talking over the new one. */
  function verdict(word, why, mood) {
    var mine = ++saying;
    var opening;
    if (up) {
      opening = K.speak(word, mood);
    } else {
      up = true;
      opening = K.arriveSaying(word, mood).then(function () { mascot.settle(); });
    }
    return [].concat(why).reduce(function (chain, line) {
      return chain
        .then(function () { if (mine === saying) return Flow.wait(SHORT); })
        .then(function () { if (mine === saying) return K.speak(line, mood); });
    }, opening);
  }

  /* ======================================================================
   * The interaction: one name into one slot
   * ----------------------------------------------------------------------
   * The names under the sentence and the slot in it, with the three ways
   * the app always offers: drag a name over the slot and let go, tap a name and
   * then tap the slot, or pick both up with the keyboard. A wrong name is
   * refused -- the slot shakes, the name goes home, `onWrong` is told which
   * one so the bird can say why -- and the learner tries again for as long
   * as it takes. The right one flies in, the word is set in the slot, and
   * the wait resolves.
   *
   * The wait is the lesson's gate (see #gate in index.html): an ordinary
   * Flow.once, cancelled with the rest of the chain when the scene is
   * retired, with the listeners coming off whichever way it ends. A skip
   * answers the round for the learner -- the right name is docked -- so the
   * beats after this are about a board that says what they say it says.
   * ====================================================================== */
  function armSlot(spec) {
    var names = chips;
    var live = true;
    var filled = false;
    var misses = 0;
    var picked = null;            /* the name in hand, in tap mode  */
    var drag = null;              /* the press in progress, if any  */

    dom.alAsk.classList.add('is-live');
    dom.alSlot.setAttribute('tabindex', '0');

    function overSlot(x, y) {
      if (filled) return false;
      var r = dom.alSlot.getBoundingClientRect();
      return x >= r.left - DROP_SLACK && x <= r.right + DROP_SLACK &&
             y >= r.top - DROP_SLACK && y <= r.bottom + DROP_SLACK;
    }
    function hover(on) {
      dom.alSlot.classList.toggle('is-over', !!on && !filled);
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

    function attempt(chip) {
      hover(false);
      if (filled) return home(chip);
      if (chip.dataset.name === spec.answer) return right(chip);
      return wrong(chip);
    }
    /* The name into the slot: the flight, the word set inside, the pulse. */
    function dock(chip) {
      filled = true;
      pick(null);
      chip.classList.remove('is-lifted');

      var c = chip.getBoundingClientRect();
      var r = dom.alSlot.getBoundingClientRect();
      Beats.chipDock(chip,
        (r.left + r.width / 2) - (c.left + c.width / 2),
        (r.top + r.height / 2) - (c.top + c.height / 2));
      slotRight(spec.answer);
    }
    function right(chip) {
      dock(chip);
      dom.gate.dispatchEvent(new MouseEvent('click'));
    }
    function wrong(chip) {
      misses++;
      pick(null);
      slotWrong();
      home(chip);
      if (spec.onWrong) spec.onWrong(chip.dataset.name, misses);
    }

    /* ---- the names ---- */
    function onDown(ev) {
      if (!live || drag || filled) return;
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
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) > K.TAP_SLOP) drag.moved = true;
      if (!drag.moved) return;
      M.set(drag.chip, { x: drag.x0 + dx, y: drag.y0 + dy });
      hover(overSlot(ev.clientX, ev.clientY));
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
      if (overSlot(ev.clientX, ev.clientY)) attempt(d.chip);
      else { hover(false); home(d.chip); }
    }
    function onCancel(ev) {
      if (!drag || ev.pointerId !== drag.id) return;
      var d = drag;
      drag = null;
      hover(false);
      home(d.chip);
    }
    function onChipKey(ev) {
      if (!live || filled) return;
      if (ev.key !== 'Enter' && ev.key !== ' ' && ev.key !== 'Spacebar') return;
      ev.preventDefault();
      var chip = ev.currentTarget;
      if (chip.classList.contains('is-docked')) return;
      pick(picked === chip ? null : chip);
    }

    /* ---- the slot, in tap mode ---- */
    function onSlotUp() {
      if (!live || drag || !picked || filled) return;
      attempt(picked);
    }
    function onSlotKey(ev) {
      if (!live || !picked || filled) return;
      if (ev.key !== 'Enter' && ev.key !== ' ' && ev.key !== 'Spacebar') return;
      ev.preventDefault();
      attempt(picked);
    }
    function onSlotEnter() { if (live && !drag && picked) hover(true); }
    function onSlotLeave() { if (!drag) hover(false); }

    function off() {
      live = false;
      names.forEach(function (c) {
        c.removeEventListener('pointerdown', onDown);
        c.removeEventListener('keydown', onChipKey);
      });
      dom.alSlot.removeEventListener('pointerup', onSlotUp);
      dom.alSlot.removeEventListener('keydown', onSlotKey);
      dom.alSlot.removeEventListener('pointerenter', onSlotEnter);
      dom.alSlot.removeEventListener('pointerleave', onSlotLeave);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onCancel);
      dom.alAsk.classList.remove('is-live');
      dom.alSlot.setAttribute('tabindex', '-1');
      hover(false);
      pick(null);
      drag = null;
    }

    names.forEach(function (c) {
      c.addEventListener('pointerdown', onDown);
      c.addEventListener('keydown', onChipKey);
    });
    dom.alSlot.addEventListener('pointerup', onSlotUp);
    dom.alSlot.addEventListener('keydown', onSlotKey);
    dom.alSlot.addEventListener('pointerenter', onSlotEnter);
    dom.alSlot.addEventListener('pointerleave', onSlotLeave);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onCancel);

    /* What a skip puts down for the learner: the right name, docked the way
       a hand-dropped one is -- without firing the gate, which the skip has
       already answered. */
    function fillIn() {
      if (filled) return;
      for (var i = 0; i < names.length; i++) {
        if (names[i].dataset.name === spec.answer) { dock(names[i]); return; }
      }
    }

    return Flow.once(dom.gate, { auto: true }).then(
      function () { fillIn(); off(); return { misses: misses }; },
      function (err) { off(); throw err; });
  }

  /* ======================================================================
   * One round: a piece lit, the sentence up, the names in, the drop, the
   * verdicts, and Next.
   * ====================================================================== */
  function askRound(spec) {
    return Flow.anim(Beats.arcFocus(spec.on, spec.off))
      .then(function () { return Flow.wait(SHORT); })

      /* ---- the sentence, then the names, one by one ---------------------- */
      .then(function () { return Flow.anim(askIn()); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        chips = K.buildChips(dom.alOpts, K.shuffle(spec.options));
        return Flow.anim(chipsIn(chips));
      })

      /* ---- the drop. The bird answers every try from the header: up for
         the first wrong one and standing there until the right name is in.
         Those verdicts are waits the chain never awaits, so they go through
         quiet(); the right answer's is the scene's own beat. ---------------- */
      .then(function () {
        return armSlot({
          answer: spec.answer,
          onWrong: function (name) {
            K.quiet(verdict(LINES.tryAgain, spec.wrong[name], 'confused'));
          }
        });
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return verdict(K.LINES.ackRight, spec.right, 'happy');
      })
      /* ---- the question is answered: the names not chosen go, smoothly,
         leaving the sentence with the right one in its slot. ---------------- */
      .then(function () {
        var rest = chips.filter(function (c) {
          return !c.classList.contains('is-docked');
        });
        return Flow.anim(chipsOut(rest));
      })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the bird's job is done: it drops back behind the board, its
         line goes with it, and Next arrives. ------------------------------- */
      .then(function () {
        up = false;
        return Promise.all([K.mascotJumpOut(),
                            Flow.anim(Beats.lineOut(dom.promptLine))]);
      })
      .then(function () {
        K.clearPrompt();
        return K.handOver(dom.nextBtn);
      });
  }

  /* The sentence and the names taken away between rounds, and after the
     last: the line fades with whatever is in its slot and the names under
     it, and everything is handed back to its built state. */
  function askAway() {
    return Flow.anim(askOut()).then(clearSlot);
  }

  /* ======================================================================
   * Scene 1 -- identify the arcs. The circle made, cut and coloured; the
   * smaller piece asked for, then the larger.
   * ====================================================================== */
  function sceneIdentify() {
    var all = rounds();

    return K.wipeBoard()
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle, its two points, and the two pieces ----------------- */
      .then(function () {
        redraw();
        dom.al.removeAttribute('hidden');
        return Flow.anim(Beats.drawRim(dom.alRim, dom.alTip));
      })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.alDotA)); })
      .then(function () { return Flow.wait(200); })
      .then(function () { return Flow.anim(Beats.plotDot(dom.alDotB)); })
      .then(function () { return Flow.wait(SHORT); })
      .then(function () {
        return Flow.anim(Beats.arcSweep({
          minor: dom.alMinor, major: dom.alMajor, rim: dom.alRim, dots: dots()
        }));
      })
      .then(function () { return Flow.wait(BEAT); })

      /* ---- the circle stands aside ----------------------------------------
         The header closes -- there is no bird on it yet -- and the stage
         takes the room as the circle slides to the left half, where every
         stood-aside circle in the app goes. */
      .then(function () {
        return Promise.all([
          Flow.anim(K.collapseHeader(true)),
          Flow.anim(Beats.slideArcs(dom.al, SHIFT))
        ]);
      })
      .then(function () { return Flow.wait(SHORT); })

      /* ---- round 1: the smaller piece -------------------------------------- */
      .then(function () { return askRound(all[0]); })

      /* ---- round 2: the larger piece ----------------------------------------
         The sentence and the names go, the light crosses to the other
         piece, and the same question is asked again. */
      .then(askAway)
      .then(function () { return Flow.wait(SHORT); })
      .then(function () { return askRound(all[1]); })

      /* ---- and the section closes -------------------------------------------
         Everything this scene stood up goes together -- the sentence, the
         names, the circle -- and the header opens again over a clean board,
         which is where the next section begins. */
      .then(function () {
        return Promise.all([
          askAway(),
          Flow.anim(Beats.clearFigure([dom.al]))
        ]);
      })
      .then(function () {
        dom.al.setAttribute('hidden', '');
        K.clearInline([dom.al].concat(
          Array.prototype.slice.call(dom.al.querySelectorAll('*'))));
        return Flow.anim(K.collapseHeader(false));
      });
  }

  /* ======================================================================
   * The hooks the board's housekeeping calls -- see addSection in pages.js
   * ====================================================================== */

  /* What this skill has on the figure: the one group, faded as a whole. */
  function parts() { return [dom.al]; }

  /* And what it keeps outside the figure: the sentence in the stage. */
  function wipe() {
    var out = [];
    if (!dom.alAsk.hasAttribute('hidden')) out.push(Flow.anim(askOut()));
    return out;
  }

  /* Back to rest, with no animation. The inline writes inside the figure
     are pages.js's to clear -- resetFigure does it for every descendant of
     the picture right after this -- so this is about attributes, classes
     and the sentence. */
  function reset() {
    up = false;
    saying++;
    dom.al.setAttribute('hidden', '');
    clearSlot();
    dom.alAsk.setAttribute('hidden', '');
    redraw();
  }

  /* The board as the scene expects to find it, written straight in. The
     one scene opens on a wiped board -- its own first beat is the wipe --
     so there is nothing to stage. */
  function stage() {}

  Pages.addSection({
    name: 'Arc length',
    scenes: [
      { name: 'Identify the arcs', play: sceneIdentify }
    ],
    build: build,
    parts: parts,
    wipe: wipe,
    reset: reset,
    stage: stage
  });

  /* What the sections after this one are built from: the cut this section
     teaches on, and the sentence-and-slot ask, which later sections of the
     skill will put their own words through. */
  global.ArcLen = {
    LINES: LINES,
    state: function () { return ARC; },
    askIn: askIn,
    askOut: askOut,
    armSlot: armSlot
  };
})(window);
