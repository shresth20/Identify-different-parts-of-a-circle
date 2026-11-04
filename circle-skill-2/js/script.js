/* ==========================================================================
 * script.js -- entry point
 * --------------------------------------------------------------------------
 * Builds the scene, fetches everything the lesson will show or play behind
 * the welcome screen's loading bar (js/loader.js), and starts the lesson.
 * Nothing here decides what happens: that is pages.js.
 *
 * The welcome scene starts at once -- the bird is already waving behind
 * the artwork -- but Start is only offered once the loader is done, so no
 * line ever waits on its clip and no sprite sheet paints blank. A file that
 * never arrives is given up on by the loader, never by the lesson.
 * ========================================================================== */
(function (global) {
  'use strict';

  /* Fetched AND decoded: a big image that has only been downloaded can
     still paint blank for a frame the first time it is shown. The Image is
     kept so the decoded copy is not thrown away before it is used. */
  var kept = [];
  function imageReady(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      kept.push(img);
      function done() { resolve(true); }
      img.onload = function () {
        if (img.decode) img.decode().then(done, done); else done();
      };
      img.onerror = function () { resolve(false); };
      img.src = src;
    });
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

    var tasks = [];
    function add(name, weight, run, queued) {
      tasks.push({ name: name, weight: weight, run: run, queued: !!queued });
    }
    /* The artwork, decoded as well as fetched. */
    ['assets/image/welcome-page.webp', 'assets/image/board.webp',
     'assets/image/bg.webp', 'assets/image/protractor.webp'].forEach(function (src) {
      add(src, 3, function () { return imageReady(src); });
    });
    /* Every sheet the bird is played from -- the big ones, so weighted up. */
    Object.keys(global.Mascot.SHEETS).forEach(function (clip) {
      add('sheet ' + clip, 8, function () { return global.Mascot.preload([clip]); });
    });
    /* Every face the stylesheets declare, used yet or not. */
    if (document.fonts && document.fonts.forEach) {
      document.fonts.forEach(function (face) {
        add('font ' + face.family + ' ' + face.weight, 2, function () {
          return face.load().then(function () { return true; }, function () { return false; });
        });
      });
    }
    /* The chimes, then every voice clip, a few at a time. */
    var A = global.GameAudio;
    var sounds = (global.Beats.sounds ? global.Beats.sounds() : [])
      .concat(global.I18n && global.I18n.clips ? global.I18n.clips() : []);
    if (A) sounds.forEach(function (url) {
      add(url, 1, function () { return A.load(url); }, true);
    });

    if (global.Loader) global.Loader.run(tasks);
    else Promise.all(tasks.map(function (t) { return t.run(); }));

    /* The welcome scene holds Start back until the loader is done (see
       sceneWelcome). Unless a run has already been started from the level
       bar: starting the lesson over on top of it would tear down a scene
       the learner is already watching. */
    if (!global.Pages.started()) global.Pages.run();

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
