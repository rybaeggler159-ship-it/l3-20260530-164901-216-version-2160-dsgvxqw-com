(function () {
  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var localSearch = document.querySelector('[data-local-search]');

  if (localSearch) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    localSearch.addEventListener('input', function () {
      var value = localSearch.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();

        card.style.display = text.indexOf(value) > -1 ? '' : 'none';
      });
    });
  }

  function getQuery() {
    return new URLSearchParams(window.location.search).get('q') || '';
  }

  var searchResults = document.querySelector('[data-search-results]');
  var searchInput = document.querySelector('[data-search-input]');

  if (searchResults && window.SITE_SEARCH_INDEX) {
    var query = getQuery().trim();

    if (searchInput) {
      searchInput.value = query;
    }

    if (query) {
      var lower = query.toLowerCase();
      var items = window.SITE_SEARCH_INDEX.filter(function (item) {
        return [item.title, item.genre, item.region, item.year, item.tags].join(' ').toLowerCase().indexOf(lower) > -1;
      }).slice(0, 120);

      searchResults.innerHTML = items.map(function (item) {
        return [
          '<article class="movie-card">',
          '<a class="movie-card-link" href="' + item.url + '">',
          '<div class="poster-wrap">',
          '<img src="' + item.poster + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '<span class="duration-badge">' + item.duration + '</span>',
          '</div>',
          '<div class="movie-card-body">',
          '<div class="movie-meta-line"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
          '<h2>' + escapeHtml(item.title) + '</h2>',
          '<p>' + escapeHtml(item.description) + '</p>',
          '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>',
          '</div>',
          '</a>',
          '</article>'
        ].join('');
      }).join('');
    }
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
})();
