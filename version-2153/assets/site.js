(function () {
  var heroTimer = null;

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var button = document.querySelector('.menu-button');
    var menu = document.querySelector('.mobile-nav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    function restart() {
      if (heroTimer) {
        window.clearInterval(heroTimer);
      }
      heroTimer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    show(0);
    restart();
  }

  function initFilters() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll('[data-filter-block]'));
    blocks.forEach(function (block) {
      var search = block.querySelector('.js-card-filter');
      var region = block.querySelector('.js-region-filter');
      var type = block.querySelector('.js-type-filter');
      var year = block.querySelector('.js-year-filter');
      var cards = Array.prototype.slice.call(block.querySelectorAll('.movie-card'));
      var empty = block.querySelector('.empty-state');

      function valueOf(el) {
        return el ? String(el.value || '').trim().toLowerCase() : '';
      }

      function apply() {
        var q = valueOf(search);
        var r = valueOf(region);
        var t = valueOf(type);
        var y = valueOf(year);
        var visible = 0;

        cards.forEach(function (card) {
          var title = String(card.getAttribute('data-title') || '').toLowerCase();
          var cardRegion = String(card.getAttribute('data-region') || '').toLowerCase();
          var cardType = String(card.getAttribute('data-type') || '').toLowerCase();
          var cardYear = String(card.getAttribute('data-year') || '').toLowerCase();
          var ok = true;

          if (q && title.indexOf(q) === -1) {
            ok = false;
          }
          if (r && cardRegion !== r) {
            ok = false;
          }
          if (t && cardType !== t) {
            ok = false;
          }
          if (y && cardYear !== y) {
            ok = false;
          }

          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [search, region, type, year].forEach(function (el) {
        if (!el) {
          return;
        }
        el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', apply);
      });

      var params = new URLSearchParams(window.location.search);
      if (search && params.get('q')) {
        search.value = params.get('q');
      }
      apply();
    });
  }

  function initSearchForms() {
    Array.prototype.slice.call(document.querySelectorAll('.js-site-search')).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input');
        var query = input ? String(input.value || '').trim() : '';
        var target = form.getAttribute('action') || 'all.html';
        window.location.href = target + (query ? '?q=' + encodeURIComponent(query) : '');
      });
    });
  }

  function setupPlayer(videoId, playUrl) {
    var video = document.getElementById(videoId);
    if (!video || !playUrl) {
      return;
    }
    var wrap = video.closest('.player-wrap');
    var overlay = wrap ? wrap.querySelector('.play-overlay') : null;
    var hlsObject = null;
    var attached = false;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsObject = new window.Hls();
        hlsObject.loadSource(playUrl);
        hlsObject.attachMedia(video);
      } else {
        video.src = playUrl;
      }
    }

    function begin() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', begin);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsObject && hlsObject.destroy) {
        hlsObject.destroy();
      }
    });
  }

  window.MovieSite = {
    initPlayer: setupPlayer
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchForms();
  });
})();
