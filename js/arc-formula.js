/* ==========================================================================
 * arc-formula.js -- Skill 2, section 4: the arc-length formula, derived,
 * worked, asked, and summed up
 * --------------------------------------------------------------------------
 * The last section of the skill, built with SKILL 3's kit (js/sector-area.js
 * hands it over on window.SectorArea) in skill 3's stage and under its
 * stylesheet, so from here to the end of the skill the pages are the same
 * design as the area-of-a-sector lesson's: the perch and its warm bubble,
 * the dropdown blanks, the numbered working, the rule cards, the field
 * talks between the parts. Only what an arc-length page needs of its own
 * is here (and in css/arc-formula.css): the ARC is the thing, lit and
 * heavy, and no sector is ever coloured in -- this skill is about the
 * length along the rim, not the region inside it (user, 2026-10-09).
 *
 * This file is loaded BEFORE sector-area.js, because a section's scenes
 * join the lesson in load order and these come before skill 3's. Nothing
 * here touches the kit until a scene plays, by which time it exists.
 *
 *   Formula intro     a word on the field: now, the formula
 *   Whole-turn arc    θ walked round to 360°: the arc becomes the rim
 *   Tap the arc       the whole rim's length asked for: 2πr
 *   Arc length for θ  the rim cut into 360 arcs of 1°; one; ten; any; θ
 *   Apply intro       a word on the field: now, some problems
 *   Worked example    r = 7 cm, θ = 90°: s = 11 cm, a line at a time
 *   Practice          r = 21 cm, θ = 120°: 44 cm
 *   Find the angle    s = 22 cm, r = 21 cm: θ = 60°, the formula turned round
 *   Wiper             a blade of 42 cm through 60°: what the formula needs,
 *                     and how far the tip travels
 *   Clock             a hand of 14 cm for 45 minutes: through how many
 *                     degrees, and how far its tip travels
 *   Well done!        the two arcs and their two formulas
 *
 * Every word is read by key (I18n.t) from locales/locales.json, and each
 * spoken line is voiced by the same key once a recording is there.
 *
 * Load order: ... -> js/central.js -> js/arc-formula.js -> js/sector-area.js
 * ========================================================================== */
(function (global) {
  'use strict';

  var M = global.Motion;
  var Flow = global.Flow;
  var Beats = global.Beats;
  var Pages = global.Pages;
  var K = Pages && Pages.kit;
  var AL = global.ArcLen;
  if (!Pages || !Pages.addSection || !K || !AL || !AL.fieldTalk) {
    console.error('arc-formula.js: load it after js/pages.js and js/arclen.js.');
    return;
  }

  /* Skill 3's kit, read when the board is built (every script is in by
     then) and never before. */
  var S = null;
  function D() { return S.dom(); }
  function bird() { return S.mascot(); }

  var BEAT = 560, SHORT = 280, LOOK = 1100;
  var PEN = 1.5;             /* s: the pen once round a circle               */
  var SLOW_PEN = 1.6;
  var ARC_W = 6.5;           /* the lit arc's weight (css/arc-formula.css)   */

  function wait(ms) { return Flow.wait(ms); }
  function anim(a) { return Flow.anim(a); }
  function quiet(p) { if (p && p.catch) p.catch(function () {}); return p; }
  function tr(key, repl) { return global.I18n ? global.I18n.t(key, repl) : key; }
  function keyed(key, repl) { return repl ? { text: tr(key, repl), vo: key } : K.keyed(key); }
  function fr(n, d, cls) { return S.fr(n, d, cls); }
  function c(cls, s) { return S.c(cls, s); }
  function pt(C, r, deg) { return S.pt(C, r, deg); }
  function r2(n) { return Math.round(n * 100) / 100; }

  /* The words of the formula, in their inks: s and the circumference in
     the sector-lesson's inks, the angle in its magenta. */
  function TWO_PI_R() { return c('pi', '2πr'); }
  function SS() { return c('a', 's'); }
  function RULE() { return SS() + S.EQ + fr('θ', '360', 'c-ang') + S.X + TWO_PI_R(); }

  /* ---- handed from one page to the next ------------------------------------ */
  var fullTurn = null;       /* the whole-turn figure, for "Tap the arc"      */
  var arcFig = null;         /* ...and then for the derivation                 */

  /* ======================================================================
   * The figures of this section
   * ====================================================================== */

  /* An arc drawn with its radius and angle written on it: a circle, two
     radii, the piece of rim between them lit, the angle at the centre --
     and NO region coloured in. `spec`: theta, at (the start angle), r (the
     words for the radius), label (the angle's, else theta°), s (a length
     over the arc, if the arc is what is given). */
  function arcFigure(host, spec) {
    var F = S.figure(host, '34 34 352 352');
    F.svg.classList.add('af-fig');
    var C = S.circle(F.svg, 210, 210, 150);
    var a0 = spec.at == null ? 90 - spec.theta / 2 : spec.at, a1 = a0 + spec.theta;
    var Sec = S.sector(C, a0, a1, 'minor');
    var A = S.angleMark(C, a0, a1, spec.label || (spec.theta + '°'), { r: spec.theta > 100 ? 26 : 34 });
    /* The radius named where it is, as a textbook names it: along the
       second radius, centred on it, just off the line on the side away
       from the arc, and turned to run with the line -- never upside
       down. The turn is on a group of its own, so the label's own fade can
       never undo it. */
    var rot = -a1;
    while (rot <= -90) rot += 180;
    while (rot > 90) rot -= 180;
    var Rg = S.svgEl('g', {}, C.top);
    var R = S.text(Rg, 0, 0, spec.r, 'lbl lbl--radius lbl--along');
    function placeR() {
      var len = 0;
      try { len = R.getComputedTextLength(); } catch (e) {}
      var room = C.r - 34;
      if (len > room) {
        var fs = Math.max(13, 19 * room / len);
        R.style.fontSize = fs + 'px';
        len = len * fs / 19;
      }
      var rc = Math.max(22 + len / 2, C.r - 14 - len / 2);
      var m = pt(C, rc, a1), off = pt({ x: 0, y: 0 }, 17, a1 + 90);
      var x = m.x + off.x, y = m.y + off.y;
      R.setAttribute('x', r2(x));
      R.setAttribute('y', r2(y));
      Rg.setAttribute('transform', 'rotate(' + r2(rot) + ' ' + r2(x) + ' ' + r2(y) + ')');
    }
    placeR();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeR);
    /* A length written over the arc, when the arc is what is given. */
    var sLbl = null;
    if (spec.s) {
      var sp = pt(C, C.r + 26, (a0 + a1) / 2);
      sLbl = S.text(C.top, sp.x, sp.y, spec.s, 'lbl lbl--area af-arc-lbl');
      M.set(sLbl, { opacity: 0 });
    }
    return {
      F: F, C: C, S: Sec, A: A, R: R, sLbl: sLbl, a0: a0, a1: a1,
      /* where a found length is set: just outside the arc's middle */
      foundAt: function () { return pt(C, C.r + 26, (a0 + a1) / 2); },
      draw: function (slow) {
        return S.drawCircle(C, slow ? PEN : 1.1)
          .then(function () { return S.radii(Sec, 0.6); })
          .then(function () { return S.arcIn(Sec, 0.9); })
          .then(function () { return anim(Beats.linePulse([Sec.arc], ARC_W)); })
          .then(function () { return S.angleIn(A); })
          .then(function () { placeR(); return anim(S.fadeIn(R, { y: 0 })); })
          .then(function () { return sLbl ? anim(S.popIn(sLbl, { from: 0.5 })) : null; });
      }
    };
  }

  /* A tap-the-answer practice page, as skill 3's practice() is: the arc on
     the left, the bird on its perch asking from a warm bubble, the answers
     as tiles under it and the formula to remember under the figure; the
     right answer brings the working, a line at a time, and the length is
     set on the arc. */
  function arcPractice(spec) {
    return S.stage('split').then(async function (sc) {
      var fig = arcFigure(sc, spec);
      var panel = S.h('div', 'sa-panel sa-panel--practice', null, sc);
      var P = S.perchIn(panel);
      P.row.classList.add('sa-speak--above');
      P.bubble.classList.add('sa-bubble--sun');
      var slot = S.h('div', 'sa-qslot', null, panel);
      sc.classList.add('sa-scene--practice');
      var given = S.ruleCard(sc, tr('s3TagRemember'), RULE(), 'sa-rule--small');
      M.set(given.el, { opacity: 0 });

      await S.leaveHeader();
      await fig.draw();
      if (spec.given) {
        D().board.classList.add('has-given');
        await S.sayTop(spec.given);
      }
      await anim(S.fadeIn(P.row, { y: 0 }));
      await S.perchSay(P, spec.prompt);
      var voice = S.bubbleVoice(P, spec.prompt);
      await S.askChoice(spec.options, spec.right, {
        host: slot, tiles: true, voice: voice,
        onWrong: spec.onWrong ? function (i) { spec.onWrong(i, fig); } : null, stagger: 0.35,
        onShown: function () { quiet(anim(S.cardIn(given.el))); },
        yes: keyed('fbThatsCorrect'), why: spec.why
      });
      await wait(900);

      /* Answered: the question goes, and the working takes its place. */
      voice.stop();
      var gone = Array.prototype.slice.call(panel.children);
      if (spec.steps) gone.push(given.el);
      await Promise.all([anim(S.fadeOut(gone)), S.perchOut()]);
      gone.forEach(function (g) { if (g.parentNode) g.parentNode.removeChild(g); });
      if (spec.steps) {
        panel.className = 'sa-panel sa-panel--centre';
        if (spec.head) {
          var hd0 = S.h('div', 'sa-wk__head', spec.head, panel);
          await anim(S.cardIn(hd0));
          await wait(SHORT);
        }
        await S.writeSteps(panel, spec.steps(fig));
        await wait(600);
        if (spec.found) {
          if (spec.given) {
            await anim(Beats.lineOut(D().promptLine));
            S.clearPrompt();
            D().board.classList.remove('has-given');
          }
          var fp = fig.foundAt();
          var fl = S.text(fig.C.top, fp.x, fp.y, spec.found.label, 'lbl lbl--area s-found-lbl af-arc-lbl');
          fig.S.arc.classList.add('is-lit');
          await Promise.all([S.say(spec.found.say, 'happy'), anim(S.popIn(fl, { from: 0.4 }))]);
        }
      } else {
        await S.noteCard(panel, spec.note).shown;
      }
      await wait(BEAT);
    });
  }

  /* ======================================================================
   * The scenes
   * ====================================================================== */

  /* ---- 0. A word on the field: now, the formula ------------------------- */
  function sFormulaIntro() {
    return AL.fieldTalk(['s2FormulaIntro']);
  }

  /* ---- 1. The whole turn ---------------------------------------------------
     One circle in the middle of the board; two radii, the arc between
     them lit, the angle marked θ. What if the angle went all the way
     round? One radius is walked round like a clock's second hand --
     clockwise, in ticks of 6° -- and the arc grows with it until it is the
     whole rim. */
  async function sWholeTurn() {
    var sc = await S.stage('solo');
    var F = S.figure(sc);
    F.svg.classList.add('af-fig');
    var C = S.circle(F.svg, 210, 210, 150);
    var a0 = 60, a1 = 130;             /* θ = 70°: a general angle, not a right one */
    var Sec = S.sector(C, a0, a1, 'minor');
    var ends = [pt(C, 150, a0), pt(C, 150, a1)].map(function (p) {
      return S.svgEl('circle', { 'class': 's-dot', cx: r2(p.x), cy: r2(p.y), r: 5.5 }, C.top);
    });
    var A = S.angleMark(C, a0, a1, 'θ', { r: 38, gap: 22 });
    A.lbl.classList.add('lbl--big');

    await anim(Beats.drawRim(C.rim, C.tip, { time: SLOW_PEN }));
    await anim(Beats.fillDisc(C.disc));
    await anim(Beats.plotDot(C.dot, 0.35));
    await wait(SHORT);
    await S.radii(Sec, 0.75);
    await anim(S.popIn(ends, { stagger: 0.15 }));
    await wait(SHORT);
    await S.arcIn(Sec, 0.8);
    await anim(Beats.linePulse([Sec.arc], ARC_W));
    await wait(SHORT);
    await S.angleIn(A);
    await wait(SHORT);

    /* What if the angle went all the way round? */
    await S.say(keyed('s3Central360Q'));
    await wait(BEAT);
    await S.say(keyed('s3FindOut'));
    await wait(SHORT);
    A.lbl.classList.remove('lbl--big');
    A.set(a0, a1, 'θ = ' + (a1 - a0) + '°');
    await anim(S.popIn(A.lbl, { from: 0.7 }));
    await S.say(keyed('s3CentralHere', { deg: a1 - a0 }));
    await wait(SHORT);
    var hand = { a: a0 };
    function place() {
      var cur = hand.a;
      var deg = Math.round(a1 - cur);
      Sec.set(cur, a1);
      var p = pt(C, C.r, cur);
      ends[0].setAttribute('cx', r2(p.x));
      ends[0].setAttribute('cy', r2(p.y));
      A.set(cur, a1, 'θ = ' + deg + '°');
    }
    place();
    var STEP = 6;
    var tl = M.timeline();
    for (var at = a0 - STEP; at >= a1 - 360 - 0.01; at -= STEP) {
      tl.to(hand, { a: at, duration: M.dur(0.075), ease: 'back.out(3)', onUpdate: place });
      tl.call(Beats.pop);
      tl.to({}, { duration: M.dur(0.045) });
    }
    await anim(tl);
    hand.a = a1 - 360;
    place();

    /* The full turn: the arc is the whole rim, lit twice and left at rest. */
    Beats.sfx('correct');
    [Sec.arc, A.arc, A.lbl].forEach(function (el) { el.classList.add('is-flash2'); });
    await anim(Beats.linePulse([Sec.arc], ARC_W));
    S.burstAt(F.svg);
    await S.say(keyed('s2WholeFull'), 'happy');
    await wait(SHORT);
    Sec.arc.classList.remove('is-flash2');
    void Sec.arc.getBoundingClientRect();
    Sec.arc.classList.add('is-flash2');
    await S.say(keyed('s2WholeArc'), 'happy');
    await wait(BEAT);
    fullTurn = { sc: sc, wrap: F.wrap, svg: F.svg, C: C, S: Sec, A: A, at: a1 };
    await S.handOver();
  }

  /* ---- 2. Tap the arc length of the whole circle ----------------------------
     The full-turn circle of the scene before -- the same element -- stays
     on the board and glides to the left as its page becomes a picture and
     a panel; its radius is named r. The bird comes onto a perch in the
     panel and asks, in a warm bubble, which of three tiles is the whole
     rim's length. */
  async function sArcTap() {
    var H = fullTurn;
    fullTurn = null;
    var sc, C, Sec, svg, wrap, panel, at;
    if (H && H.sc.isConnected) {
      sc = H.sc; C = H.C; Sec = H.S; svg = H.svg; wrap = H.wrap; at = H.at;
      [Sec.arc, H.A.arc, H.A.lbl].forEach(function (el) { el.classList.remove('is-focus', 'is-flash2'); });
      var r0 = svg.getBoundingClientRect();
      sc.className = 'sa-scene sa-scene--split';
      panel = S.h('div', 'sa-panel', null, sc);
      var r1 = svg.getBoundingClientRect();
      var k = Math.min(r0.width, r0.height) / Math.min(r1.width, r1.height);
      M.set(wrap, { x: (r0.left + r0.width / 2) - (r1.left + r1.width / 2),
                    y: (r0.top + r0.height / 2) - (r1.top + r1.height / 2),
                    scale: k, transformOrigin: '50% 50%' });
      await Promise.all([S.leaveHeader(),
        anim(M.to(wrap, { x: 0, y: 0, scale: 1, duration: M.dur(0.9), ease: 'power3.inOut' }))]);
    } else {
      /* Reached straight from the level bar: the full-turn circle, whole. */
      sc = await S.stage('split');
      var F = S.figure(sc);
      F.svg.classList.add('af-fig');
      svg = F.svg; wrap = F.wrap;
      C = S.circle(svg, 210, 210, 150);
      at = 130;
      Sec = S.sector(C, at - 360, at, 'minor');
      var A0 = S.angleMark(C, at - 360, at, 'θ = 360°', { r: 38, gap: 22 });
      S.show([C.rim, C.disc, C.dot, Sec.arc, Sec.ra, Sec.rb, A0.arc, A0.lbl]);
      panel = S.h('div', 'sa-panel', null, sc);
      M.set(wrap, { xPercent: 0 });
      S.held(null);
      await S.leaveHeader();
    }

    /* The radius, named. */
    var m = pt(C, 84, at + 9);
    var rl = S.text(C.top, m.x, m.y, 'r', 'lbl lbl--radius lbl--big');
    await anim(S.popIn(rl, { from: 0.5 }));
    await wait(SHORT);

    /* The question, from a perch, in a bubble of its own warm colour. */
    var P = S.perchIn(panel);
    P.row.classList.add('sa-speak--above');
    P.bubble.classList.add('sa-bubble--sun');
    await anim(S.fadeIn(P.row, { y: 0 }));
    var over = S.text(C.top, C.x, C.y - C.r - 22, tr('s2ArcOver'), 'lbl s-over-lbl');
    await anim(S.fadeIn(over, { y: 6 }));
    await wait(SHORT);
    var QUESTION = keyed('s2ArcAsk');
    await S.perchSay(P, QUESTION);
    var voice = S.bubbleVoice(P, QUESTION);
    await S.askChoice([tr('p27OptPiR'), tr('p27Opt2PiR'), tr('p27OptPiR2')], 1, {
      host: S.h('div', 'sa-qslot sa-qslot--big', null, panel),
      tiles: true,
      voice: voice,
      yes: [keyed('fbThatsCorrect'), keyed('p27Right')],
      why: {
        0: [keyed('fbNotQuite'), keyed('p27WrongPiR')],
        2: [keyed('fbNotQuite'), keyed('p27WrongPiR2')]
      }
    });
    await wait(900);

    /* Answered: the question goes -- bubble, bird and tiles -- and the
       answer is set in its place, on one line, as a result. */
    voice.stop();
    var gone = Array.prototype.slice.call(panel.children);
    await Promise.all([anim(S.fadeOut(gone)), S.perchOut()]);
    gone.forEach(function (g) { if (g.parentNode) g.parentNode.removeChild(g); });
    var res = S.h('div', 'sa-result sa-result--two',
      '<span class="sa-result__tick" aria-hidden="true"></span>' +
      '<span class="sa-result__lines"><span class="sa-result__txt">' + tr('s2LblCircumOfCircle') + ' ' + S.EQ + ' ' + TWO_PI_R() + '</span>' +
      '<span class="sa-result__sub">' + S.EQ + ' ' + tr('s2ResArcAngle') + '&nbsp;' + c('ang', '360°') + '</span></span>', panel);
    panel.classList.add('sa-panel--centre');
    quiet(anim(M.fromTo(rl, { scale: 1, transformOrigin: '50% 50%' },
      { scale: 1.4, duration: M.dur(0.3), ease: 'power2.out', yoyo: true, repeat: 3 })));
    await anim(S.cardIn(res));
    await wait(BEAT);
    arcFig = { sc: sc, svg: svg, wrap: wrap, C: C, S: Sec, at: at, panel: panel, over: over };
    await S.handOver();
  }

  /* ---- 3. From the whole rim to any angle ------------------------------------
     The same circle again, still a full turn. Beside it the length is
     worked down from 360° to 1°: the 360 of "1 × 360" is lifted out of its
     line and flown down under the 1 as the arc closes to a hair of 1°;
     then the 1 becomes 10, in place, as the arc opens to 10°; then the
     learner says what the length is for any angle θ. */
  async function sArcDerive() {
    var H = arcFig;
    arcFig = null;
    var sc, C, Sec, svg, panel, at;
    if (H && H.sc.isConnected) {
      sc = H.sc; C = H.C; Sec = H.S; svg = H.svg; panel = H.panel; at = H.at;
      var olds = Array.prototype.slice.call(panel.children).concat(H.over ? [H.over] : []);
      await anim(S.fadeOut(olds));
      Array.prototype.slice.call(panel.children).forEach(function (o) { panel.removeChild(o); });
      panel.classList.remove('sa-panel--centre');
      if (H.over && H.over.parentNode) H.over.parentNode.removeChild(H.over);
    } else {
      sc = await S.stage('split');
      var F = S.figure(sc);
      F.svg.classList.add('af-fig');
      S.held(null);
      M.set(F.wrap, { xPercent: 0 });
      svg = F.svg;
      C = S.circle(svg, 210, 210, 150);
      at = 130;
      Sec = S.sector(C, at - 360, at, 'minor');
      var m0 = pt(C, 84, at + 9);
      S.show([C.rim, C.disc, C.dot, Sec.arc, Sec.ra, Sec.rb,
              S.text(C.top, m0.x, m0.y, 'r', 'lbl lbl--radius lbl--big')]);
      panel = S.h('div', 'sa-panel', null, sc);
    }
    /* The angle mark is re-made, so it is this scene's to move. */
    Array.prototype.forEach.call(C.marks.querySelectorAll('*'), function (n) { n.parentNode.removeChild(n); });
    var A = S.angleMark(C, at - 360, at, 'θ = 360°', { r: 38, gap: 22 });
    S.show([A.arc, A.lbl]);
    var deg = { v: 360 };
    function turnTo(v) {
      deg.v = v;
      Sec.set(at - v, at);
      A.set(at - v, at, 'θ = ' + Math.round(v) + '°');
      if (v < 60) {
        var q = pt(C, 52, at - v - 50);
        A.lbl.setAttribute('x', r2(q.x));
        A.lbl.setAttribute('y', r2(q.y));
        A.lbl.setAttribute('text-anchor', 'start');
      } else {
        A.lbl.setAttribute('text-anchor', 'middle');
      }
    }

    /* ---- the derivation, step by step: every step a card in the deck,
       the one being worked at full strength, the ones before it stepped
       back, the oldest folding away once there are more than four. */
    var deck = S.h('div', 'sa-derive', null, panel);
    var steps = [];
    var MAX_SHOWN = 4;
    async function addStep(cap, bits) {
      steps.forEach(function (st) { st.classList.add('is-past'); });
      var st = S.h('div', 'sa-dstep', '<span class="sa-dstep__n">' + (steps.length + 1) + '</span>' +
        '<div class="sa-dstep__body"><p class="sa-dstep__cap">' + cap + '</p><p class="sa-dstep__eq"></p></div>', deck);
      var eq = st.querySelector('.sa-dstep__eq');
      var keys = {};
      var els = bits.map(function (bt) {
        var sp = S.h('span', 'sa-dstep__bit', bt[0], eq);
        if (bt[1]) keys[bt[1]] = sp;
        M.set(sp, { opacity: 0 });
        return sp;
      });
      steps.push(st);
      var fold = null;
      var shown = steps.filter(function (x) { return !x.__gone; });
      if (shown.length > MAX_SHOWN) {
        var old = shown[0];
        old.__gone = true;
        fold = anim(M.to(old, { opacity: 0, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0,
                                duration: M.dur(0.5), ease: 'power2.inOut',
                                onComplete: function () { old.style.display = 'none'; } }));
      }
      await Promise.all([fold, anim(M.fromTo(st, { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: M.dur(0.5), ease: 'power3.out' }))]);
      return { el: st, keys: keys, bits: els };
    }
    async function writeBits(step, skip) {
      for (var i = 0; i < step.bits.length; i++) {
        if (skip && skip.indexOf(step.bits[i]) >= 0) continue;
        await anim(M.fromTo(step.bits[i], { opacity: 0, y: 8, scale: 0.88 },
          { opacity: 1, y: 0, scale: 1, duration: M.dur(0.34), ease: 'back.out(1.6)' }));
        await wait(200);
      }
    }
    var X = S.X, EQ = S.EQ, DD = S.DD;

    /* ---- 1. The whole circle ---------------------------------------------- */
    await S.say(keyed('s3DeriveWhole'));
    var s1 = await addStep(tr('s3DeriveWhole'), [[SS()], [EQ], [TWO_PI_R()]]);
    await writeBits(s1);
    Sec.arc.classList.add('is-flash2');
    await wait(LOOK);

    /* ---- 2. 360 arcs of 1° ---------------------------------------------------
       The rim is cut into its 360 one-degree arcs: fine ticks swept round
       from the fixed radius, and the whole of it lit as one. */
    var defs = svg.querySelector('defs') || S.svgEl('defs', {}, svg);
    var clip = S.svgEl('clipPath', { id: 'afTicks' }, defs);
    var clipD = S.svgEl('path', { d: '' }, clip);
    var ticks = S.svgEl('g', { 'clip-path': 'url(#afTicks)', 'class': 's-spokes' }, C.over);
    var dd0 = '';
    for (var k = 0; k < 360; k++) dd0 += S.segD(pt(C, C.r - 12, k), pt(C, C.r + 6, k)) + ' ';
    S.svgEl('path', { 'class': 's-fine', d: dd0 }, ticks);
    await S.say(keyed('s2DeriveCut'));
    var s2 = await addStep(tr('s2DeriveMadeOf'),
      [['<span class="c-ang" data-fly>360</span>', 'n360'], [X], [tr('s2DeriveOneDeg')], [EQ], [TWO_PI_R()]]);
    await Promise.all([
      anim(Beats.secFill(clipD, function (t) { return S.wedgeD(C, C.r + 10, at - 360 * t, at); }, 2.2)),
      writeBits(s2)
    ]);
    await S.say(keyed('s2DeriveTogether'));
    await wait(SHORT);

    /* ---- 3. One arc of 1° ------------------------------------------------------
       The 360 is carried down to divide, and the arc closes to 1°. */
    await S.say(keyed('s2DeriveOne'));
    var s3 = await addStep(tr('s2StepArcAngle', { a: '<span class="c-val"><span data-k="c1">1</span>°</span>' }),
      [[SS()], [EQ], [TWO_PI_R()], ['<span class="op">÷</span>'], ['<span class="c-ang">360</span>', 'to360'],
       [EQ], ['<span class="frac c-ang"><span class="frac__n c-val"><span data-k="n1">1</span></span><span class="frac__d">360</span></span>'],
       [X], [TWO_PI_R()]]);
    var tail = s3.bits.slice(5);
    await writeBits(s3, [s3.keys.to360].concat(tail));
    await Promise.all([
      S.flyNumber(s2.keys.n360, s3.keys.to360, 1.1).then(function () {
        M.set(s3.keys.to360, { opacity: 1 });
        Beats.pop();
        return anim(M.fromTo(s3.keys.to360, { scale: 1.35 }, { scale: 1, duration: M.dur(0.35), ease: M.POP }));
      }),
      anim(M.to(ticks, { opacity: 0, duration: M.dur(0.9), delay: M.dur(0.3) })),
      anim(M.to(deg, { v: 1, duration: M.dur(1.4), ease: 'power2.inOut', onUpdate: function () { turnTo(deg.v); } }))
    ]);
    turnTo(1);
    for (var t2 = 0; t2 < tail.length; t2++) {
      await anim(M.fromTo(tail[t2], { opacity: 0, y: 8, scale: 0.88 },
        { opacity: 1, y: 0, scale: 1, duration: M.dur(0.34), ease: 'back.out(1.6)' }));
      await wait(200);
    }
    await wait(SHORT);

    /* 1° is a hair at this size: a glass over the spot where the two radii
       meet the rim shows the little arc between them. */
    var LK = 6;
    var lens = S.magnifier(svg, pt(C, 142, at - 0.5), pt(C, 76, at + 82), LK, function (mp, gl) {
      var Cm = mp(C);
      S.svgEl('circle', { 'class': 's-lens__disc', cx: r2(Cm.x), cy: r2(Cm.y), r: r2(C.r * LK) }, gl);
      S.svgEl('circle', { 'class': 's-lens__edge', cx: r2(Cm.x), cy: r2(Cm.y), r: r2(C.r * LK) }, gl);
      [at - 1, at].forEach(function (a2) {
        S.svgEl('path', { 'class': 's-lens__radius', d: S.segD(Cm, mp(pt(C, C.r, a2))) }, gl);
      });
      var w0 = mp(pt(C, C.r, at - 1)), w1 = mp(pt(C, C.r, at));
      S.svgEl('path', { 'class': 's-lens__arc',
        d: 'M' + r2(w0.x) + ' ' + r2(w0.y) + ' A' + r2(C.r * LK) + ' ' + r2(C.r * LK) + ' 0 0 0 ' + r2(w1.x) + ' ' + r2(w1.y) }, gl);
      var m0 = mp(pt(C, 137, at - 1)), m1 = mp(pt(C, 137, at));
      S.svgEl('path', { 'class': 's-lens__angle',
        d: 'M' + r2(m0.x) + ' ' + r2(m0.y) + ' A' + r2(137 * LK) + ' ' + r2(137 * LK) + ' 0 0 0 ' + r2(m1.x) + ' ' + r2(m1.y) }, gl);
      var lp = mp(pt(C, 138.5, at + 1.9));
      var tt = S.text(gl, lp.x, lp.y, '1°', 'lbl lbl--angle s-lens__lbl');
      M.set(tt, { opacity: 1 });
    });
    await S.say(keyed('s3DeriveZoom'));
    await lens.show();
    await wait(2400);
    await lens.hide();
    await wait(SHORT);

    /* ---- 3, continued: from 1° to 10°, on the same card ----------------------- */
    await wait(2500);
    var gone = s3.bits.slice(2, 6);
    await anim(M.to(gone, { opacity: 0, filter: 'blur(4px)', duration: M.dur(0.4), ease: 'power2.in' }));
    var FlipK = global.Flip;
    var state = FlipK && !Flow.isFast() ? FlipK.getState(s3.bits) : null;
    gone.forEach(function (g) { g.style.display = 'none'; });
    if (state) await anim(FlipK.from(state, { duration: M.dur(0.45), ease: 'power2.inOut' }));
    await S.say(keyed('s2DeriveTen'));
    var zeros = [s3.el.querySelector('[data-k="c1"]'), s3.el.querySelector('[data-k="n1"]')].map(function (one) {
      var z = document.createElement('span');
      z.textContent = '0';
      one.parentNode.insertBefore(z, one.nextSibling);
      M.set(z, { opacity: 0, filter: 'blur(6px)' });
      return z;
    });
    await Promise.all([
      anim(M.to(zeros, { opacity: 1, filter: 'blur(0px)', duration: M.dur(0.7), ease: 'power2.out', stagger: M.gap(0.15) })),
      anim(M.to(deg, { v: 10, duration: M.dur(1.2), ease: 'power2.inOut', onUpdate: function () { turnTo(deg.v); } }))
    ]);
    turnTo(10);
    Beats.pop();
    await wait(LOOK);

    /* A few more angles, chosen at random: each one dissolves into the card
       and the arc turns to it, so the learner sees that only the number on
       top changes. */
    var c1 = s3.el.querySelector('[data-k="c1"]'), n1 = s3.el.querySelector('[data-k="n1"]');
    zeros.forEach(function (z) { z.parentNode.removeChild(z); });
    c1.textContent = '10';
    n1.textContent = '10';
    A.lbl.classList.add('is-val');
    var pool = [25, 40, 55, 80, 100, 120, 135, 150, 170, 200, 225, 250, 280, 300];
    var picks = [];
    while (picks.length < 5) {
      var v = pool[Math.floor(Math.random() * pool.length)];
      if (picks.indexOf(v) < 0) picks.push(v);
    }
    await S.say(keyed('s3DeriveMore'));
    for (var pi = 0; pi < picks.length; pi++) {
      var val = picks[pi];
      await anim(M.to([c1, n1], { opacity: 0, filter: 'blur(5px)', duration: M.dur(0.25), ease: 'power2.in' }));
      c1.textContent = val;
      n1.textContent = val;
      await Promise.all([
        anim(M.to([c1, n1], { opacity: 1, filter: 'blur(0px)', duration: M.dur(0.35), ease: 'power2.out' })),
        anim(M.to(deg, { v: val, duration: M.dur(0.9), ease: 'power2.inOut', onUpdate: function () { turnTo(deg.v); } }))
      ]);
      turnTo(val);
      Beats.pop();
      await wait(1100);
    }
    await S.say(keyed('s2DeriveOnlyTop'));
    await wait(SHORT);
    A.lbl.classList.remove('is-val');

    /* ---- 5. Any angle θ ---------------------------------------------------------- */
    await anim(M.to(deg, { v: 75, duration: M.dur(1.1), ease: 'power2.inOut', onUpdate: function () { turnTo(deg.v); } }));
    A.set(at - 75, at, 'θ');
    await S.say(keyed('s2DeriveAskTheta'));
    var s5 = await addStep(tr('s2StepArcAngle', { a: '<span class="c-val">θ</span>' }),
      [[SS()], [EQ], [DD, 'blank']]);
    await writeBits(s5);
    var Dd = S.dropdown(S.ddIn(s5.el), [fr('θ', '360', 'c-ang') + X + S.PIR2,
                                        fr('θ', '180', 'c-ang') + X + TWO_PI_R(),
                                        fr('θ', '360', 'c-ang') + X + TWO_PI_R()], 2, { up: true });
    await Dd.ask({
      yes: [keyed('fbThatsCorrect'), keyed('s2DeriveRight')],
      why: {
        0: [keyed('fbNotQuite'), keyed('s2DeriveWrongPiR2')],
        1: [keyed('fbNotQuite'), keyed('s3DeriveWrong180')]
      }
    });
    await wait(LOOK);

    /* ---- The formula, on its own ------------------------------------------------- */
    await anim(M.to(deck, { opacity: 0, y: -12, duration: M.dur(0.45), ease: 'power2.in' }));
    deck.parentNode.removeChild(deck);
    panel.classList.add('sa-panel--centre');
    var rule = S.ruleCard(panel, tr('s2RuleArcTheta'), RULE());
    rule.el.classList.add('sa-rule--hero');
    await rule.shown;
    rule.el.classList.add('is-glow');
    Sec.arc.classList.add('is-lit');
    S.burstAt(rule.el);
    Beats.sfx('correct');
    await wait(LOOK);

    /* ---- Try it --------------------------------------------------------------------
       The end of the moving radius becomes a handle; dragged, the arc
       follows the finger and a line of its own under the formula reads the
       angle and its fraction. */
    var tryLine = S.h('p', 'sa-try', '<span class="sa-try__tag">' + tr('s3TryIt') + '</span>' +
      '<span class="sa-try__eq"><span class="c-val" data-k="tdeg">θ</span><span class="op">→</span>' +
      SS() + EQ + '<span class="frac c-ang"><span class="frac__n c-val" data-k="tnum">θ</span><span class="frac__d">360</span></span>' +
      X + TWO_PI_R() + '</span>', panel);
    var tDeg = tryLine.querySelector('[data-k="tdeg"]'), tNum = tryLine.querySelector('[data-k="tnum"]');
    M.set(tryLine, { opacity: 0 });
    var hd = S.svgEl('g', { 'class': 's-handle', tabindex: 0, role: 'slider',
      'aria-label': tr('s3A11yHandle'),
      'aria-valuemin': 1, 'aria-valuemax': 359 }, C.top);
    S.svgEl('circle', { 'class': 's-handle__halo', cx: 0, cy: 0, r: 22 }, hd);
    S.svgEl('circle', { 'class': 's-handle__ring', cx: 0, cy: 0, r: 12 }, hd);
    S.svgEl('circle', { 'class': 's-handle__dot', cx: 0, cy: 0, r: 5 }, hd);
    S.svgEl('circle', { cx: 0, cy: 0, r: 28, fill: 'transparent' }, hd);
    function placeHandle() {
      var q = pt(C, C.r, at - deg.v);
      hd.setAttribute('transform', 'translate(' + r2(q.x) + ' ' + r2(q.y) + ')');
      hd.setAttribute('aria-valuenow', Math.round(deg.v));
    }
    function setDeg(v) {
      turnTo(v);
      placeHandle();
      var n = Math.round(v);
      tDeg.textContent = 'θ = ' + n + '°';
      tNum.textContent = n;
      A.lbl.classList.add('is-val');
    }
    placeHandle();
    M.set(hd, { opacity: 0 });
    var grabbing = false, travelled = 0;
    var explored = S.until(function () { setDeg(120); });
    function angleOf(ev) {
      var q = svg.createSVGPoint();
      q.x = ev.clientX; q.y = ev.clientY;
      q = q.matrixTransform(svg.getScreenCTM().inverse());
      var a2 = Math.atan2(C.y - q.y, q.x - C.x) * 180 / Math.PI;
      var v = ((at - a2) % 360 + 360) % 360;
      if (deg.v > 300 && v < 60) v = 359;
      if (deg.v < 60 && v > 300) v = 1;
      return Math.max(1, Math.min(359, v));
    }
    hd.addEventListener('pointerdown', function (ev) {
      if (!hd.__live) return;
      grabbing = true;
      hd.classList.add('is-held');
      try { hd.setPointerCapture(ev.pointerId); } catch (e) {}
      ev.preventDefault();
    });
    hd.addEventListener('pointermove', function (ev) {
      if (!grabbing) return;
      var v = angleOf(ev);
      travelled += Math.abs(v - deg.v);
      setDeg(v);
    });
    function letGo() {
      if (!grabbing) return;
      grabbing = false;
      hd.classList.remove('is-held');
      explored.check(travelled >= 40);
    }
    hd.addEventListener('pointerup', letGo);
    hd.addEventListener('pointercancel', letGo);
    hd.addEventListener('keydown', function (ev) {
      if (!hd.__live) return;
      var step = ev.key === 'ArrowUp' || ev.key === 'ArrowLeft' ? 1 :
                 ev.key === 'ArrowDown' || ev.key === 'ArrowRight' ? -1 : 0;
      if (!step) return;
      ev.preventDefault();
      setDeg(Math.max(1, Math.min(359, deg.v + step * 5)));
      travelled += 5;
      explored.check(travelled >= 40);
    });
    rule.el.classList.remove('is-glow');
    A.set(at - deg.v, at, 'θ');
    hd.__live = true;
    await Promise.all([anim(S.fadeIn(tryLine, { y: 10 })), anim(S.popIn(hd))]);
    await S.say(keyed('s3DeriveDrag'));
    await explored.done;
    hd.__live = false;
    hd.classList.add('is-done');
    await wait(600);
    await S.say(keyed('s3DeriveWorks'), 'happy');
    await wait(BEAT);
    await S.handOver();
  }

  /* ---- 4. A word on the field: now, some problems --------------------------- */
  function sApplyIntro() {
    return S.fieldTalk(keyed('s2ApplyYay'), null, keyed('s3ApplySolve'));
  }

  /* ---- a worked page's shared pieces ------------------------------------------- */
  function pulse(el) {
    quiet(anim(M.fromTo(el, { scale: 1, transformOrigin: '50% 50%' },
      { scale: 1.35, duration: M.dur(0.28), ease: 'power2.out', yoyo: true, repeat: 1 })));
  }
  /* a line of the working written a piece at a time */
  function bitsRow(list, n, parts) {
    var r = S.stepRow(list, n, parts.map(function (x) { return '<span class="sa-work__bit">' + x + '</span>'; }).join(''));
    r.__bits = Array.prototype.slice.call(r.querySelectorAll('.sa-work__bit'));
    M.set(r.__bits, { opacity: 0 });
    return r;
  }
  async function writeRow(r) {
    await S.stepIn(r);
    for (var i = 0; i < r.__bits.length; i++) {
      await anim(M.fromTo(r.__bits[i], { opacity: 0, y: 8, scale: 0.88 },
        { opacity: 1, y: 0, scale: 1, duration: M.dur(0.32), ease: 'back.out(1.6)' }));
      await wait(220);
    }
    S.stepDone(r);
  }
  function formulaHead(col) {
    var head = S.h('div', 'sa-wk__head',
      '<p class="sa-wk__formula"><b>' + tr('s3Formula') + '</b> ' + RULE() + '</p>', col);
    var formula = head.querySelector('.sa-wk__formula');
    M.set(formula, { opacity: 0 });
    return formula;
  }

  /* ---- 5. A worked example: r = 7 cm, θ = 90° ---------------------------------
     The working on the right, one line at a time, and each line the
     learner completes before the next is written: the angle over 360, the
     radius, the sum simplified, the length. */
  async function sWorked() {
    var X = S.X, EQ = S.EQ, DD = S.DD;
    var sc = await S.stage('work');
    var col = S.h('div', 'sa-wk sa-wk--align', null, sc);
    var fig = arcFigure(sc, { theta: 90, at: 0, r: tr('s2LblR7') });
    var formula = formulaHead(col);
    var list = S.h('div', 'steps', null, col);

    var s1 = S.stepRow(list, 1, SS() + EQ + DD + X + TWO_PI_R());
    var s2 = S.stepRow(list, 2, SS() + EQ + fr('90', '360', 'c-ang') + X + c('pi', '2') + X + fr('22', '7', 'c-pi') + X + DD);
    var s3 = bitsRow(list, 3, [SS(), EQ, fr('1', '4', 'c-ang'), X, c('pi', '2'), X, c('pi', '22')]);
    var s4 = bitsRow(list, 4, [SS(), EQ, fr('1', '4', 'c-ang'), X, c('pi', '44')]);
    var s5 = S.stepRow(list, 5, SS() + EQ + DD);
    var d1 = S.dropdown(S.ddIn(s1), [fr('90', '360', 'c-ang'), fr('360', '90', 'c-ang'), fr('90', '180', 'c-ang')], 0);
    var d2 = S.dropdown(S.ddIn(s2), [c('r', '7'), c('r', '14'), c('ang', '90°')], 0);
    var d5 = S.dropdown(S.ddIn(s5), [tr('val11cm'), tr('val44cm'), tr('val22cm')], 0, { up: true });

    /* The figure first, with nothing said; then the problem. */
    await S.leaveHeader();
    await fig.draw();
    await wait(SHORT);
    await S.say(keyed('s2WkFind'));
    pulse(fig.R);
    await wait(SHORT);
    pulse(fig.A.lbl);
    await wait(LOOK);
    await anim(S.fadeIn(formula, { y: 6 }));
    await wait(LOOK);

    /* 1. θ into the formula. */
    await S.stepIn(s1);
    await S.say(keyed('s2WkPutTheta'));
    pulse(fig.A.lbl);
    await d1.ask({
      yes: [keyed('fbThatsCorrect'), keyed('s2WkThetaRight')],
      why: {
        1: [keyed('fbNotQuite'), keyed('s3WkThetaWrongFlip')],
        2: [keyed('fbNotQuite'), keyed('s3FullTurn360')]
      }
    });
    S.stepDone(s1);

    /* 2. r into the formula, with π = 22/7 said first. */
    await S.stepIn(s2);
    await S.say(keyed('s2WkPutR'));
    pulse(fig.R);
    await d2.ask({
      yes: [keyed('fbThatsCorrect'), keyed('s2WkRRight')],
      why: {
        1: [keyed('fbNotQuite'), keyed('p29Wrong14')],
        2: [keyed('fbNotQuite'), keyed('p29Wrong90')]
      }
    });
    S.stepDone(s2);

    /* 3-4. The simplification, shown rather than only said. */
    await S.say(keyed('s2WkSimplify'));
    await writeRow(s3);
    await wait(SHORT);
    await S.say(keyed('s2WkProduct'));
    await writeRow(s4);
    await wait(SHORT);

    /* 5. The answer. */
    await S.stepIn(s5);
    await S.say(keyed('s2FindArcLen'));
    await d5.ask({
      yes: keyed('fbThatsCorrect'),
      why: {
        1: [keyed('fbNotQuite'), keyed('p29Wrong44')],
        2: [keyed('fbNotQuite'), keyed('p29Wrong22')]
      }
    });
    S.stepDone(s5);
    S.burstAt(s5);

    /* What was found, said -- and set on the arc. */
    fig.S.arc.classList.add('is-lit');
    var fp = fig.foundAt();
    var fl = S.text(fig.C.top, fp.x, fp.y, tr('val11cm'), 'lbl lbl--area s-found-lbl af-arc-lbl');
    await Promise.all([S.say(keyed('s2WkFound'), 'happy'), anim(S.popIn(fl, { from: 0.4 }))]);
    await wait(BEAT);
    await S.handOver();
  }

  /* ---- 6. Practice: r = 21 cm, θ = 120° ------------------------------------------ */
  function sPractice() {
    var X = S.X;
    return arcPractice({
      theta: 120, at: 30, r: tr('s3LblR21'),
      prompt: keyed('s2PrAskArc'),
      options: [tr('val44cm'), tr('val66cm'), tr('val132cm')], right: 0,
      why: {
        1: [keyed('fbNotQuite'), keyed('p30Wrong66')],
        2: [keyed('fbNotQuite'), keyed('p30Wrong132')]
      },
      /* a wrong answer shown on the figure: half the rim, or all of it */
      onWrong: function (i, fig) {
        var C = fig.C;
        var ring = S.svgEl('path', { 'class': 's-arc s-arc--minor af-ghost-arc',
          d: S.arcD(C, C.r, fig.a0, fig.a0 + (i === 1 ? 180 : 360)) }, C.over);
        quiet(anim(M.fromTo(ring, { opacity: 0 }, { opacity: 0.8, duration: M.dur(0.35), yoyo: true, repeat: 3,
          onComplete: function () { if (ring.parentNode) ring.parentNode.removeChild(ring); } })));
      },
      head: '<p class="sa-wk__formula"><b>' + tr('s3Formula') + '</b> ' + RULE() + '</p>',
      steps: function (fig) {
        return [
          [SS(), [[fr('120', '360', 'c-ang'), fig.A.lbl], [X], [TWO_PI_R()]]],
          ['', [[fr('1', '3', 'c-ang')], [X], [c('pi', '2')], [X], [fr('22', '7', 'c-pi')], [X], [c('r', '21'), fig.R]],
           keyed('s2P1PutPiR')],
          ['', [[fr('1', '3', 'c-ang')], [X], [c('pi', '132')]], keyed('s2P1Cancel')],
          ['', [[c('ans', tr('val44cm'))]]]
        ];
      },
      found: { label: tr('val44cm'), say: keyed('s2P1Found') }
    }).then(S.handOver);
  }

  /* ---- 7. The angle found from the arc: s = 22 cm, r = 21 cm ----------------------
     The formula turned round: the length is known, the angle is not. */
  async function sAngle() {
    var X = S.X, EQ = S.EQ, DD = S.DD;
    var sc = await S.stage('work');
    var col = S.h('div', 'sa-wk sa-wk--align', null, sc);
    var fig = arcFigure(sc, { theta: 60, at: 60, r: tr('s3LblR21'), label: 'θ = ?', s: tr('val22cm') });
    fig.A.lbl.classList.add('lbl--num');
    var formula = formulaHead(col);
    var list = S.h('div', 'steps', null, col);

    var s1 = S.stepRow(list, 1, DD + EQ + fr('θ', '360', 'c-ang') + X + TWO_PI_R());
    var s2 = S.stepRow(list, 2, c('a', '22') + EQ + fr('θ', '360', 'c-ang') + X + c('pi', '2') + X + fr('22', '7', 'c-pi') + X + DD);
    var s3 = bitsRow(list, 3, [c('a', '22'), EQ, fr('θ', '360', 'c-ang'), X, c('pi', '132')]);
    var s4 = bitsRow(list, 4, [fr('θ', '360', 'c-ang'), EQ, fr('22', '132', 'c-pi'), EQ, fr('1', '6', 'c-ang')]);
    var s5 = S.stepRow(list, 5, c('ang', 'θ') + EQ + c('ang', '360°') + X + fr('1', '6', 'c-ang') + EQ + DD);
    var d1 = S.dropdown(S.ddIn(s1), [c('a', '22 cm'), c('r', '21 cm'), c('r', '42 cm')], 0);
    var d2 = S.dropdown(S.ddIn(s2), [c('r', '21'), c('a', '22'), c('r', '42')], 0);
    var d5 = S.dropdown(S.ddIn(s5), [tr('val60'), tr('val30'), tr('val6')], 0, { up: true });

    await S.leaveHeader();
    await fig.draw();
    await wait(SHORT);
    await S.say(keyed('s2AnFind'));
    pulse(fig.sLbl);
    await wait(SHORT);
    pulse(fig.R);
    await wait(LOOK);
    await anim(S.fadeIn(formula, { y: 6 }));
    await wait(LOOK);

    /* 1. s into the formula. */
    await S.stepIn(s1);
    await S.say(keyed('s2AnPutS'));
    pulse(fig.sLbl);
    await d1.ask({
      yes: [keyed('fbThatsCorrect'), keyed('s2AnSRight')],
      why: {
        1: [keyed('fbNotQuite'), keyed('p31WrongS21')],
        2: [keyed('fbNotQuite'), keyed('p31WrongS42')]
      }
    });
    S.stepDone(s1);

    /* 2. r into the formula. */
    await S.stepIn(s2);
    await S.say(keyed('s3WkPutR'));
    pulse(fig.R);
    await d2.ask({
      yes: [keyed('fbThatsCorrect'), keyed('s2AnRRight')],
      why: {
        1: [keyed('fbNotQuite'), keyed('p31WrongR22')],
        2: [keyed('fbNotQuite'), keyed('p31WrongR42')]
      }
    });
    S.stepDone(s2);

    /* 3-4. The product gathered, and the equation turned round. */
    await S.say(keyed('s2AnSimplify'));
    await writeRow(s3);
    await wait(SHORT);
    await S.say(keyed('s2AnTurn'));
    await writeRow(s4);
    await wait(SHORT);

    /* 5. The angle. */
    await S.stepIn(s5);
    await S.say(keyed('p31Solve'));
    await d5.ask({
      yes: keyed('fbThatsCorrect'),
      why: {
        1: [keyed('fbNotQuite'), keyed('p31Wrong30')],
        2: [keyed('fbNotQuite'), keyed('p31Wrong6')]
      }
    });
    S.stepDone(s5);
    S.burstAt(s5);

    /* What was found, said -- and set in the angle. */
    fig.A.lbl.classList.remove('lbl--num');
    fig.A.set(fig.a0, fig.a1, tr('val60'));
    fig.A.arc.classList.add('is-flash2');
    await Promise.all([S.say(keyed('s2AnFound'), 'happy'), anim(S.popIn(fig.A.lbl, { from: 0.6 }))]);
    await wait(BEAT);
    await S.handOver();
  }

  /* ---- a story page's second question, from the same perch ----------------------
     The tiles of the first question go, the bubble takes back its own
     colour, and the bird -- still on its perch -- asks again. */
  async function askAgain(P, slot, question) {
    var old = Array.prototype.slice.call(slot.children);
    if (old.length) {
      await anim(S.fadeOut(old));
      old.forEach(function (o) { if (o.parentNode) o.parentNode.removeChild(o); });
    }
    P.bubble.classList.remove('is-yes', 'is-no');
    await S.speak(question);
  }

  /* The working of a story page, written out under the figure's panel once
     the question is answered: the tiles and the bird go, and the steps are
     set a piece at a time, each number off the figure pulsing as it is
     written. */
  async function storyWork(panel, given, steps) {
    var gone = Array.prototype.slice.call(panel.children).concat([given.el]);
    await Promise.all([anim(S.fadeOut(gone)), S.perchOut()]);
    gone.forEach(function (x) { if (x.parentNode) x.parentNode.removeChild(x); });
    panel.className = 'sa-panel sa-panel--centre';
    var last = await S.writeSteps(panel, steps);
    await wait(600);
    return last;
  }

  /* ---- 8. The wiper: a blade of 42 cm sweeping 60° --------------------------------
     The windshield drawn, the blade grown out of its pivot and swept
     across, its tip tracing the arc; what the formula needs, then how far
     the tip travels. */
  async function sWiper() {
    var X = S.X;
    var sc = await S.stage('split');
    sc.classList.add('sa-scene--practice');
    sc.style.gridTemplateColumns = 'minmax(0, 1.3fr) minmax(0, 1fr)';
    var F = S.figure(sc, '0 0 440 300');
    F.svg.classList.add('af-fig');
    var C = { x: 220, y: 268, r: 190 };
    var a0 = 60, a1 = 120;                 /* the sweep: from upper left to upper right */
    var g = S.svgEl('g', {}, F.svg);
    var glass = S.svgEl('path', { 'class': 'af-glass',
      d: 'M58 268 L92 42 Q98 14 126 14 L314 14 Q342 14 348 42 L382 268 Z' }, g);
    var trace = S.svgEl('path', { 'class': 'af-trace' }, g);
    var blade = S.svgEl('path', { 'class': 'af-blade' }, g);
    var tip = S.svgEl('circle', { 'class': 'af-tip', r: 6 }, g);
    var ang = S.svgEl('path', { 'class': 's-angle', d: S.arcD(C, 36, a0, a1) }, g);
    S.svgEl('circle', { 'class': 'af-pivot', cx: C.x, cy: C.y, r: 7 }, g);
    var lp = pt(C, 60, 90);
    var aLbl = S.text(g, lp.x, lp.y, tr('val60'), 'lbl lbl--angle');
    /* the blade's length written along it, at rest on the right */
    var mid = pt(C, 112, a0), off = pt({ x: 0, y: 0 }, 18, a0 - 90);
    var rg = S.svgEl('g', { transform: 'rotate(' + r2(-a0) + ' ' + r2(mid.x + off.x) + ' ' + r2(mid.y + off.y) + ')' }, g);
    var bLbl = S.text(rg, mid.x + off.x, mid.y + off.y, tr('val42cm'), 'lbl lbl--radius lbl--along');
    var sw = { a: a1 };
    function drawBlade() {
      var p = pt(C, C.r, sw.a);
      blade.setAttribute('d', S.segD(C, p));
      tip.setAttribute('cx', r2(p.x));
      tip.setAttribute('cy', r2(p.y));
      trace.setAttribute('d', sw.a < a1 - 0.5 ? S.arcD(C, C.r, sw.a, a1) : 'M' + r2(p.x) + ' ' + r2(p.y));
    }
    drawBlade();
    M.set([glass, trace, blade, tip, ang, aLbl, bLbl], { opacity: 0 });

    var panel = S.h('div', 'sa-panel sa-panel--practice', null, sc);
    var P = S.perchIn(panel);
    P.row.classList.add('sa-speak--above');
    P.bubble.classList.add('sa-bubble--sun');
    var slot = S.h('div', 'sa-qslot', null, panel);
    var given = S.ruleCard(sc, tr('s3TagRemember'), RULE(), 'sa-rule--small');
    M.set(given.el, { opacity: 0 });

    /* 1. The blade: the windshield, the blade grown out of its pivot, and
          its length written along it. */
    await S.say(keyed('p32Blade1'));
    await anim(M.fromTo(glass, { opacity: 0, scale: 0.92, transformOrigin: '50% 100%' },
      { opacity: 1, scale: 1, duration: M.dur(0.6), ease: 'back.out(1.3)' }));
    M.set([blade, tip], { opacity: 1 });
    await anim(Beats.growLine(blade, 0.8, 'power2.inOut'));
    await anim(S.fadeIn(bLbl, { y: 0 }));
    await wait(LOOK);

    /* 2. The sweep: the blade across to the right, the tip tracing the arc,
          and the angle at the pivot. */
    await S.say(keyed('p32Blade2'));
    M.set(trace, { opacity: 1 });
    Beats.pop();
    await anim(M.to(sw, { a: a0, duration: M.dur(1.5), ease: 'power2.inOut', onUpdate: drawBlade }));
    await S.angleIn({ arc: ang, lbl: aLbl });
    await wait(LOOK);

    /* 3. What the formula needs, then how far the tip goes: both from the
          perch. */
    await S.leaveHeader();
    trace.classList.add('is-flash2');
    var Q1 = keyed('p32Ask');
    await anim(S.fadeIn(P.row, { y: 0 }));
    await S.perchSay(P, Q1);
    var voice1 = S.bubbleVoice(P, Q1);
    await S.askChoice([tr('p32OptRadiusAngle'), tr('p32OptChordAngle'), tr('p32OptDiameterArea')], 0, {
      host: slot, tiles: true, voice: voice1, stagger: 0.35,
      onShown: function () { quiet(anim(S.cardIn(given.el))); },
      yes: [keyed('fbThatsCorrect'), keyed('p32Right1'), keyed('p32Right2')],
      why: {
        1: [keyed('fbNotQuite'), keyed('p32WrongChord')],
        2: [keyed('fbNotQuite'), keyed('p32WrongDiameter')]
      }
    });
    voice1.stop();
    pulse(bLbl);
    await wait(500);
    pulse(aLbl);
    await wait(900);

    trace.classList.remove('is-flash2');
    void trace.getBoundingClientRect();
    trace.classList.add('is-flash2');
    var Q2 = keyed('s2WiperAsk');
    await askAgain(P, slot, Q2);
    var voice2 = S.bubbleVoice(P, Q2);
    var RULE_NO = [keyed('fbNotQuite'), keyed('s2ArcRule')];
    await S.askChoice([tr('val44cm'), tr('val42cm'), tr('val48cm')], 0, {
      host: slot, tiles: true, voice: voice2, stagger: 0.35,
      yes: keyed('fbThatsCorrect'),
      why: {
        1: [keyed('fbNotQuite'), keyed('p33Wrong42')],
        2: [keyed('fbNotQuite'), keyed('p33Wrong48')]
      }
    });
    voice2.stop();
    await wait(900);

    /* Answered: the working, a piece at a time. */
    await storyWork(panel, given, [
      [SS(), [[fr('60', '360', 'c-ang'), aLbl], [X], [TWO_PI_R()]]],
      ['', [[fr('1', '6', 'c-ang')], [X], [c('pi', '2')], [X], [fr('22', '7', 'c-pi')], [X], [c('r', '42'), bLbl]]],
      ['', [[fr('1', '6', 'c-ang')], [X], [c('pi', '264')]]],
      ['', [[c('ans', tr('val44cm'))]]]
    ]);

    /* What was found, said -- and set on the arc the tip traced. */
    var fp = pt(C, C.r + 24, 90);
    var found = S.text(g, fp.x, fp.y, tr('val44cm'), 'lbl lbl--area s-found-lbl af-arc-lbl');
    trace.classList.remove('is-flash2');
    trace.classList.add('is-lit');
    await Promise.all([S.say(keyed('p33Right2'), 'happy'), anim(S.popIn(found, { from: 0.4 }))]);
    await wait(BEAT);
    await S.handOver();
  }

  /* ---- 9. The clock: a hand of 14 cm for 45 minutes ---------------------------------
     A clock face drawn, the minute hand grown out to twelve and turned
     three-quarters of the way round, the rim it passes lit behind its
     tip; through how many degrees, then how far the tip travels. */
  async function sClock() {
    var X = S.X;
    var sc = await S.stage('split');
    sc.classList.add('sa-scene--practice');
    var F = S.figure(sc, '34 34 352 352');
    F.svg.classList.add('af-fig');
    var C = { x: 210, y: 210, r: 150 };
    var START = 90, END = START - 270;      /* twelve o'clock round to nine */
    var g = S.svgEl('g', {}, F.svg);
    var face = S.svgEl('circle', { 'class': 'figure__disc', cx: C.x, cy: C.y, r: C.r }, g);
    var rim = S.svgEl('path', { 'class': 'figure__rim', d: S.ringD(C.x, C.y, C.r) }, g);
    var rimTip = S.svgEl('circle', { 'class': 'rim-tip', cx: C.x, cy: C.y - C.r, r: 7 }, g);
    var ticks = S.svgEl('g', {}, g);
    for (var i = 0; i < 12; i++) {
      S.svgEl('path', { 'class': 'af-tick' + (i % 3 ? '' : ' af-tick--big'),
        d: S.segD(pt(C, C.r - (i % 3 ? 12 : 20), i * 30), pt(C, C.r - 4, i * 30)) }, ticks);
    }
    var trace = S.svgEl('path', { 'class': 'af-trace' }, g);
    var start = S.svgEl('path', { 'class': 'af-hand-start', d: S.segD(C, pt(C, C.r - 26, START)) }, g);
    var ang = S.svgEl('path', { 'class': 's-angle', d: S.arcD(C, 34, END, START) }, g);
    var hand = S.svgEl('path', { 'class': 'af-hand' }, g);
    var tip = S.svgEl('circle', { 'class': 'af-tip', r: 6 }, g);
    S.svgEl('circle', { 'class': 'centre__dot', cx: C.x, cy: C.y, r: 6.5 }, g);
    var lp = pt(C, 60, 315);
    var aLbl = S.text(g, lp.x, lp.y, tr('val270'), 'lbl lbl--angle');
    /* the hand's length along it, where it comes to rest */
    var mid = pt(C, 78, END), off = pt({ x: 0, y: 0 }, 18, END + 90);
    var hLbl = S.text(g, mid.x + off.x, mid.y + off.y, tr('p34Hand'), 'lbl lbl--radius lbl--along');
    var turn = { a: START };
    function drawHand() {
      var p = pt(C, C.r - 26, turn.a);
      hand.setAttribute('d', S.segD(C, p));
      tip.setAttribute('cx', r2(p.x));
      tip.setAttribute('cy', r2(p.y));
      trace.setAttribute('d', turn.a < START - 0.5 ? S.arcD(C, C.r, turn.a, START) : 'M' + r2(p.x) + ' ' + r2(p.y));
    }
    drawHand();
    M.set([face, rim, trace, start, ang, hand, tip, aLbl, hLbl], { opacity: 0 });
    M.set(ticks.children, { opacity: 0 });

    var panel = S.h('div', 'sa-panel sa-panel--practice', null, sc);
    var P = S.perchIn(panel);
    P.row.classList.add('sa-speak--above');
    P.bubble.classList.add('sa-bubble--sun');
    var slot = S.h('div', 'sa-qslot', null, panel);
    var given = S.ruleCard(sc, tr('s3TagRemember'), RULE(), 'sa-rule--small');
    M.set(given.el, { opacity: 0 });

    /* 1. The clock: the rim drawn, the ticks, and the hand grown out to
          twelve with its length along it. */
    await anim(Beats.drawRim(rim, rimTip, { time: 1.1 }));
    await anim(Beats.fillDisc(face));
    await anim(M.to(ticks.children, { opacity: 1, duration: M.dur(0.25), stagger: M.gap(0.04) }));
    await S.say(keyed('p34Hand1'));
    M.set([hand, tip], { opacity: 1 });
    await anim(Beats.growLine(hand, 0.7, 'power2.inOut'));
    await wait(LOOK);

    /* 2. The turn: three-quarters of the way round, the start left as a
          dashed line and the rim lit behind the tip. */
    await S.say(keyed('p34Hand2'));
    M.set([trace, start], { opacity: 1 });
    Beats.pop();
    await anim(M.to(turn, { a: END, duration: M.dur(2.0), ease: 'power2.inOut', onUpdate: drawHand }));
    await anim(S.fadeIn(hLbl, { y: 0 }));
    await wait(LOOK);

    /* 3. Through how many degrees? From the perch. */
    await S.leaveHeader();
    var Q1 = keyed('p34Ask');
    await anim(S.fadeIn(P.row, { y: 0 }));
    await S.perchSay(P, Q1);
    var voice1 = S.bubbleVoice(P, Q1);
    await S.askChoice([tr('val270'), tr('val180'), tr('val45')], 0, {
      host: slot, tiles: true, voice: voice1, stagger: 0.35,
      onShown: function () { quiet(anim(S.cardIn(given.el))); },
      yes: [keyed('fbThatsCorrect'), keyed('p34Right')],
      why: {
        1: [keyed('fbNotQuite'), keyed('p34Wrong180')],
        2: [keyed('fbNotQuite'), keyed('p34Wrong45')]
      }
    });
    voice1.stop();
    await S.angleIn({ arc: ang, lbl: aLbl });
    await wait(900);

    /* 4. How far does the tip travel? */
    trace.classList.add('is-flash2');
    var Q2 = keyed('p35Ask');
    await askAgain(P, slot, Q2);
    var voice2 = S.bubbleVoice(P, Q2);
    await S.askChoice([tr('val66cm'), tr('val88cm'), tr('val44cm')], 0, {
      host: slot, tiles: true, voice: voice2, stagger: 0.35,
      yes: keyed('fbThatsCorrect'),
      why: {
        1: [keyed('fbNotQuite'), keyed('p35Wrong88')],
        2: [keyed('fbNotQuite'), keyed('p35Wrong44')]
      }
    });
    voice2.stop();
    await wait(900);

    await storyWork(panel, given, [
      [SS(), [[fr('270', '360', 'c-ang'), aLbl], [X], [TWO_PI_R()]]],
      ['', [[fr('3', '4', 'c-ang')], [X], [c('pi', '2')], [X], [fr('22', '7', 'c-pi')], [X], [c('r', '14'), hLbl]]],
      ['', [[fr('3', '4', 'c-ang')], [X], [c('pi', '88')]]],
      ['', [[c('ans', tr('val66cm'))]]]
    ]);

    var fp = pt(C, C.r + 26, 315);
    var found = S.text(g, fp.x, fp.y, tr('val66cm'), 'lbl lbl--area s-found-lbl af-arc-lbl');
    trace.classList.remove('is-flash2');
    trace.classList.add('is-lit');
    await Promise.all([S.say(keyed('p35Right2'), 'happy'), anim(S.popIn(found, { from: 0.4 }))]);
    await wait(BEAT);
    await S.handOver();
  }

  /* ---- 10. The end --------------------------------------------------------------
     The skill summed up on one circle: drawn whole with nothing said; the
     minor arc lit and its formula set beside it; then the major arc lit
     and its formula; then both at rest, and the bird's last word. */
  async function sFinish() {
    var X = S.X, EQ = S.EQ;
    var sc = await S.stage('split');
    var F = S.figure(sc);
    F.svg.classList.add('af-fig');
    var C = S.circle(F.svg, 210, 210, 150);
    var a0 = 50, a1 = 150;
    var Sec = S.sector(C, a0, a1, 'minor');
    var T = S.sector(C, a1, a0 + 360, 'major', { radii: false });
    var A = S.angleMark(C, a0, a1, 'θ', { r: 34 });
    A.lbl.classList.add('lbl--big');
    var B = S.angleMark(C, a1, a0 + 360, '360° − θ', { r: 48, major: true, cls: 'lbl--major', gap: 26 });
    var rm = pt(C, 84, a1 + 11);
    var rl = S.text(C.top, rm.x, rm.y, 'r', 'lbl lbl--radius lbl--big');
    var panel = S.h('div', 'sa-panel sa-panel--centre', null, sc);
    var ra = S.ruleCard(panel, tr('s2RuleMinorArc'), RULE());
    var rb = S.ruleCard(panel, tr('s2RuleMajorArc'), SS() + EQ + fr('360° − θ', '360', 'c-ang') + X + TWO_PI_R());
    M.set([ra.el, rb.el], { opacity: 0 });

    function focus(onEls, offEls) {
      onEls.forEach(function (e) { e.style.transition = 'opacity .6s ease, filter .6s ease'; e.classList.remove('is-dim', 'is-blur'); });
      offEls.forEach(function (e) { e.style.transition = 'opacity .6s ease, filter .6s ease'; e.classList.add('is-dim', 'is-blur'); });
    }
    var minorEls = [Sec.arc, A.arc, A.lbl];
    var majorEls = [T.arc, B.arc, B.lbl];

    await S.leaveHeader();
    await anim(Beats.drawRim(C.rim, C.tip, { time: SLOW_PEN }));
    await anim(Beats.fillDisc(C.disc));
    await anim(Beats.plotDot(C.dot, 0.35));
    await S.radii(Sec, 0.75);
    await anim(S.fadeIn(rl, { y: 0 }));
    await S.arcIn(Sec, 0.7);
    await S.arcIn(T, 1.0);
    await wait(SHORT);

    /* The minor arc, and its formula. */
    focus(minorEls, [T.arc]);
    Sec.arc.classList.add('is-lit');
    await S.angleIn(A);
    await wait(500);
    await anim(S.cardIn(ra.el));
    ra.el.classList.add('is-glow');
    await wait(1800);

    /* The major arc, and its formula. */
    ra.el.classList.remove('is-glow');
    Sec.arc.classList.remove('is-lit');
    focus(majorEls, minorEls);
    T.arc.classList.add('is-lit');
    await S.angleIn(B);
    await wait(500);
    await anim(S.cardIn(rb.el));
    rb.el.classList.add('is-glow');
    await wait(1800);

    /* Both at rest, and the last word. */
    T.arc.classList.remove('is-lit');
    focus(minorEls.concat(majorEls), []);
    ra.el.classList.add('is-glow');
    await S.say(keyed('s2FinishBye'), 'celebrating');
    Beats.sfx('cheer');
    S.burstAt(ra.el);
    await wait(260);
    S.burstAt(rb.el);
    await wait(400);
    S.burstAt(D().slotHeader);
    bird().state('celebrating');
    await wait(900);
    bird().settle();
    await S.handOver();
  }

  /* ======================================================================
   * Joined to the lesson -- see addSection in pages.js
   * ====================================================================== */

  /* Every scene but the first turns skill 3's stylesheet on as it starts
     -- a jump from the level bar lands mid-section with it off. The first
     is a word on the field, which needs nothing of it. */
  function own(play, first) {
    return function () {
      if (!first) S.lessonOn();
      return play();
    };
  }

  /* Once, when the board exists: the kit is in by now. Everything it
     builds is its own, and built after this. */
  function build() {
    S = global.SectorArea;
    if (!S) console.error('arc-formula.js: js/sector-area.js did not hand over its kit.');
  }

  /* Nothing of this section's is in the shared figure, and what it keeps
     outside it -- in #saStage -- skill 3's own hooks fade and clear, since
     the stage is one. */
  function parts() { return []; }
  function wipe() { return []; }
  function reset() {
    fullTurn = null;
    arcFig = null;
  }
  function stage(i) {
    if (i > 0 && S) S.lessonOn();
  }

  Pages.addSection({
    name: 'Arc length formula',
    scenes: [
      { name: 'Formula intro',     play: own(sFormulaIntro, true) },
      { name: 'Whole-turn arc',    play: own(sWholeTurn) },
      { name: 'Tap the arc length', play: own(sArcTap) },
      { name: 'Arc length for θ',  play: own(sArcDerive) },
      { name: 'Apply intro',       play: own(sApplyIntro) },
      { name: 'Worked example',    play: own(sWorked) },
      { name: 'Practice',          play: own(sPractice) },
      { name: 'Find the angle',    play: own(sAngle) },
      { name: 'Wiper',             play: own(sWiper) },
      { name: 'Clock',             play: own(sClock) },
      { name: 'Well done!',        play: own(sFinish) }
    ],
    build: build,
    parts: parts,
    wipe: wipe,
    reset: reset,
    stage: stage
  });
})(window);
