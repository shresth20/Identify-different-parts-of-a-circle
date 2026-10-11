/* ==========================================================================
 * script.js -- entry point
 * --------------------------------------------------------------------------
 * Builds the scene, waits for the artwork the first beats need, and starts
 * the lesson. Nothing here decides what happens: that is pages.js.
 *
 * The wait for artwork is bounded on purpose. A sprite sheet that has not
 * decoded shows one blank frame, and on a character that reads as a flicker
 * -- but a sheet that never arrives must not hold the lesson up forever, so
 * the preload races a deadline and the lesson starts either way.
 * ========================================================================== */
(function (global) {
  'use strict';

  var PRELOAD_DEADLINE = 2500;   /* ms -- start regardless after this */

  /* Fetched AND decoded: a big image that has only been downloaded can
     still paint blank for a frame the first time it is shown. The Image is
     kept so the decoded copy is not thrown away before it is used. */
  var kept = [];
  function imageReady(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      kept.push(img);
      function done() { resolve(src); }
      img.onload = function () {
        if (img.decode) img.decode().then(done, done); else done();
      };
      img.onerror = done;
      img.src = src;
    });
  }

  /* AVIF or WebP: the pick the stylesheet makes (the --art-* tokens in
     style.css), so what is preloaded here is what it paints. AVIF only
     where image-set() can offer it AND this browser decodes the file. */
  var AVIF_TEST = 'image-set(url("x.avif") type("image/avif"))';
  var AVIF_PROBE = 'data:image/avif;base64,' +
    'AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADrbWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAcGljdAAAAAAA' +
    'AAAAAAAAAAAAAAAOcGl0bQAAAAAAAQAAAB5pbG9jAAAAAEQAAAEAAQAAAAEAAAETAAAAFwAAAChpaW5mAAAAAAABAAAA' +
    'GmluZmUCAAAAAAEAAGF2MDFDb2xvcgAAAABqaXBycAAAAEtpcGNvAAAAFGlzcGUAAAAAAAAAAQAAAAEAAAAQcGl4aQAA' +
    'AAADCAgIAAAADGF2MUOBAAwAAAAAE2NvbHJuY2x4AAEADQAGgAAAABdpcG1hAAAAAAAAAAEAAQQBAoMEAAAAH21kYXQS' +
    'AAoFGAAGBCAyDBgACiiihAAAsBKamA==';
  function artFormat() {
    var css = global.CSS && global.CSS.supports &&
              global.CSS.supports('background-image', AVIF_TEST);
    if (!css) return Promise.resolve('webp');
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(img.naturalWidth > 0 ? 'avif' : 'webp'); };
      img.onerror = function () { resolve('webp'); };
      img.src = AVIF_PROBE;
    });
  }

  function deadline(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function boot() {
    if (!global.Motion || !global.Flow || !global.Typer ||
        !global.Mascot || !global.Beats || !global.Pages) {
      /* A missing script is a load-order fault, not a runtime condition --
         say so once, loudly, rather than failing beat by beat. */
      console.error('script.js: a module did not load. Check the <script> ' +
                    'order in index.html.');
      return;
    }

    global.Pages.init();

    /* Only what the opening beats actually touch. The rest of the 82
       animations on disk are never fetched. */
    var art = [
      artFormat().then(function (ext) {
        /* The protractor is an <image> in the picture, which has no
           fallback of its own: index.html names the AVIF. */
        var prot = document.getElementById('caProt');
        if (prot && ext !== 'avif') prot.setAttribute('href', 'assets/image/protractor.webp');
        return Promise.all(['welcome-page', 'board', 'bg'].map(function (name) {
          return imageReady('assets/image/' + name + '.' + ext);
        }));
      }),
      global.Mascot.preload([
        'blinking', 'wave_start', 'waving', 'wave_stop',
        'talk_start', 'talking', 'talk_stop',
        'happy_start', 'happy', 'happy_stop',
        /* the activity's moods, a few minutes off but cheap to have ready */
        'confused_start', 'confused', 'confused_stop',
        'celebrate_start', 'celebrating', 'celebrate_stop'
      ])
    ];

    /* Unless a run has already been started from the level bar while the
       art was still coming in: starting the lesson over on top of it would
       tear down a scene the learner is already watching. */
    Promise.race([Promise.all(art), deadline(PRELOAD_DEADLINE)])
      .then(function () { if (!global.Pages.started()) global.Pages.run(); });

    /* Replaying is a genuine stop, not a rewind: Flow.reset kills everything
       the abandoned run still had in the air before the fresh one starts, so
       the two never write to the board at the same time. */
    global.replay = function () { return global.Pages.run(); };
    /* And the fast-forward the text reveal and every beat are already built
       against -- the scene plays itself out in a handful of frames and lands
       exactly where it would have. */
    global.skip = function () { return global.Flow.skip(); };
  }

  /* The words are read in first (js/i18n.js): a scene asks for its lines
     by key, and the static ones in the markup are filled in before the
     lesson is shown. A locale that cannot be read still boots -- the keys
     show instead, to be fixed in that skill's locales sN/locales.json. */
  function start() {
    if (!global.I18n) { boot(); return; }
    global.I18n.load(function () {
      global.I18n.applyStatic();
      boot();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})(window);
