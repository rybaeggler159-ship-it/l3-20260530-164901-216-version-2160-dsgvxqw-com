(function () {
  'use strict';

  var HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
  var hlsLoading = false;
  var hlsCallbacks = [];

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function getParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    hlsCallbacks.push(callback);

    if (hlsLoading) {
      return;
    }

    hlsLoading = true;
    var script = document.createElement('script');
    script.src = HLS_CDN;
    script.async = true;
    script.onload = function () {
      hlsLoading = false;
      hlsCallbacks.splice(0).forEach(function (fn) {
        fn();
      });
    };
    script.onerror = function () {
      hlsLoading = false;
      hlsCallbacks.splice(0).forEach(function (fn) {
        fn(true);
      });
    };
    document.head.appendChild(script);
  }

  function attachHls(video, source, done) {
    if (!source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      if (done) {
        done();
      }
      return;
    }

    loadHls(function (failed) {
      if (!failed && window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else {
        video.src = source;
      }

      if (done) {
        done();
      }
    });
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var playButton = qs('[data-play-button]', player);
      var source = player.getAttribute('data-src') || (video && video.getAttribute('data-src'));
      var prepared = false;

      if (!video || !source) {
        return;
      }

      function prepare(callback) {
        if (prepared) {
          if (callback) {
            callback();
          }
          return;
        }

        prepared = true;
        attachHls(video, source, callback);
      }

      function play() {
        prepare(function () {
          player.classList.add('is-playing');
          video.controls = true;
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
              player.classList.remove('is-playing');
            });
          }
        });
      }

      if (playButton) {
        playButton.addEventListener('click', play);
      }

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          player.classList.remove('is-playing');
        }
      });
    });
  }

  function initMobileMenu() {
    var toggle = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 6000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initHeaderSearch() {
    qsa('.global-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        var query = input ? input.value.trim() : '';
        if (!query) {
          event.preventDefault();
          return;
        }
      });
    });
  }

  function initPageFilter() {
    var grid = qs('[data-filter-grid]');
    var searchInput = qs('#page-search');
    var sortSelect = qs('#sort-select');
    if (!grid) {
      return;
    }

    function apply() {
      var term = normalize(searchInput ? searchInput.value : '');
      var cards = qsa('.movie-card', grid);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre
        ].join(' '));
        card.classList.toggle('hidden-by-filter', term && haystack.indexOf(term) === -1);
      });

      if (sortSelect) {
        var sort = sortSelect.value;
        var ordered = cards.slice().sort(function (a, b) {
          if (sort === 'rating') {
            return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
          }
          if (sort === 'views') {
            return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
          }
          if (sort === 'year') {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          }
          return 0;
        });
        ordered.forEach(function (card) {
          grid.appendChild(card);
        });
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', apply);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', apply);
    }
  }

  function uniqueValues(key) {
    var map = Object.create(null);
    (window.MOVIE_SEARCH_INDEX || []).forEach(function (movie) {
      if (movie[key]) {
        map[movie[key]] = true;
      }
    });
    return Object.keys(map).sort();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<a class="movie-card" href="detail/movie-' + movie.id4 + '.html" data-title="' + escapeHtml(movie.title) + '">',
      '  <figure>',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '  </figure>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><em>★ ' + movie.rating + '</em></div>',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p>' + escapeHtml(movie.one_line || '') + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</a>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function initGlobalSearchPage() {
    var results = qs('#search-results');
    var panel = qs('#search-panel');
    if (!results || !panel || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var input = qs('#global-search-input');
    var region = qs('#global-region-filter');
    var type = qs('#global-type-filter');
    var genre = qs('#global-genre-filter');
    var summary = qs('#search-summary');

    fillSelect(region, uniqueValues('region'));
    fillSelect(type, uniqueValues('type'));

    if (input) {
      input.value = getParam('q');
    }

    function render() {
      var term = normalize(input ? input.value : '');
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var genreValue = genre ? genre.value : '';
      var matches = (window.MOVIE_SEARCH_INDEX || []).filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genres.join(' '),
          movie.tags.join(' '),
          movie.one_line
        ].join(' '));
        if (term && haystack.indexOf(term) === -1) {
          return false;
        }
        if (regionValue && movie.region !== regionValue) {
          return false;
        }
        if (typeValue && movie.type !== typeValue) {
          return false;
        }
        if (genreValue && movie.genres.indexOf(genreValue) === -1) {
          return false;
        }
        return true;
      });

      var shown = matches.slice(0, 120);
      results.innerHTML = shown.length ? shown.map(movieCard).join('\n') : '<div class="no-results">没有找到匹配影片，请更换关键词。</div>';
      if (summary) {
        summary.textContent = '共找到 ' + matches.length + ' 部影片，当前展示 ' + shown.length + ' 部。';
      }
    }

    panel.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });

    [input, region, type, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', render);
        control.addEventListener('change', render);
      }
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initHeaderSearch();
    initPageFilter();
    initGlobalSearchPage();
    initPlayers();
  });
})();
