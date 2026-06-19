(function () {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');

  if (header && toggle) {
    toggle.addEventListener('click', function () {
      const isOpen = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('.js-search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        return;
      }
      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
    });
  });

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let current = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startSlider() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const target = Number(dot.getAttribute('data-target-slide') || 0);
      showSlide(target);
      startSlider();
    });
  });

  if (slides.length) {
    showSlide(0);
    startSlider();
  }

  const filterInput = document.querySelector('.js-filter-input');
  const filterRegion = document.querySelector('.js-filter-region');
  const filterYear = document.querySelector('.js-filter-year');
  const cards = Array.from(document.querySelectorAll('.js-card'));
  const queryFromUrl = document.querySelector('.js-query-from-url');

  if (queryFromUrl) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query) {
      queryFromUrl.value = query;
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    const keyword = normalize(filterInput ? filterInput.value : '');
    const region = normalize(filterRegion ? filterRegion.value : '');
    const year = normalize(filterYear ? filterYear.value : '');

    cards.forEach(function (card) {
      const haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
      const cardRegion = normalize(card.getAttribute('data-region'));
      const cardYear = normalize(card.getAttribute('data-year'));
      const matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      const matchedRegion = !region || cardRegion === region;
      const matchedYear = !year || cardYear === year;
      card.classList.toggle('is-filtered', !(matchedKeyword && matchedRegion && matchedYear));
    });
  }

  [filterInput, filterRegion, filterYear].forEach(function (element) {
    if (element) {
      element.addEventListener('input', applyFilters);
      element.addEventListener('change', applyFilters);
    }
  });

  if (cards.length && (filterInput || filterRegion || filterYear)) {
    applyFilters();
  }
})();
