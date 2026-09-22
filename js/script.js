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

  function imageReady(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = img.onerror = function () { resolve(src); };
      img.src = src;
      if (img.complete) resolve(src);
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
      imageReady('assets/image/board.png'),
      imageReady('assets/image/bg.png'),
      global.Mascot.preload([
        'blinking', 'wave_start', 'waving', 'wave_stop',
        'talk_start', 'talking', 'talk_stop',
        'happy_start', 'happy', 'happy_stop',
        /* the activity's moods, a few minutes off but cheap to have ready */
        'confused_start', 'confused', 'confused_stop',
        'celebrate_start', 'celebrating', 'celebrate_stop'
      ])
    ];

    Promise.race([Promise.all(art), deadline(PRELOAD_DEADLINE)])
      .then(function () { global.Pages.run(); });

    /* Replaying is a genuine stop, not a rewind: Flow.reset kills everything
       the abandoned run still had in the air before the fresh one starts, so
       the two never write to the board at the same time. */
    global.replay = function () { return global.Pages.run(); };
    /* And the fast-forward the text reveal and every beat are already built
       against -- the scene plays itself out in a handful of frames and lands
       exactly where it would have. */
    global.skip = function () { return global.Flow.skip(); };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
