(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var button = qs('[data-nav-toggle]');
    var nav = qs('[data-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    var hero = qs('[data-hero]');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }

    show(0);
    start();
  }

  function setupFilters() {
    var panel = qs('[data-filter-panel]');
    if (!panel) {
      return;
    }
    var input = qs('[data-search-input]', panel);
    var yearSelect = qs('[data-year-filter]', panel);
    var typeSelect = qs('[data-type-filter]', panel);
    var cards = qsa('[data-card]');
    var empty = qs('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function valueOf(el) {
      return el ? String(el.value || '').trim().toLowerCase() : '';
    }

    function apply() {
      var query = valueOf(input);
      var year = valueOf(yearSelect);
      var type = valueOf(typeSelect);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var ok = true;
        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (year && String(card.getAttribute('data-year')).toLowerCase() !== year) {
          ok = false;
        }
        if (type && String(card.getAttribute('data-type')).toLowerCase() !== type) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, yearSelect, typeSelect].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
    apply();
  }

  function mountPlayer(streamUrl) {
    var player = qs('[data-player]');
    if (!player) {
      return;
    }
    var video = qs('video', player);
    var overlay = qs('[data-player-overlay]', player);
    var button = qs('[data-play]', player);
    var loaded = false;
    var hls = null;

    function load() {
      if (!video || loaded) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        loaded = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        loaded = true;
        return;
      }
      video.src = streamUrl;
      loaded = true;
    }

    function play() {
      load();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  setupNavigation();
  setupHero();
  setupFilters();
  window.StaticMovieSite = {
    mountPlayer: mountPlayer
  };
})();
