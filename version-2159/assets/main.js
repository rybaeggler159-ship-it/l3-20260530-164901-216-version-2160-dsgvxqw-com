(function() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      nav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (slides.length > 1) {
    setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  var input = document.querySelector('[data-filter-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var rankRows = Array.prototype.slice.call(document.querySelectorAll('.rank-row'));

  function matchCard(card, value) {
    var text = [
      card.textContent,
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-region')
    ].join(' ').toLowerCase();
    return text.indexOf(value) !== -1;
  }

  if (input) {
    input.addEventListener('input', function() {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function(card) {
        card.hidden = value && !matchCard(card, value);
      });
      rankRows.forEach(function(row) {
        row.hidden = value && row.textContent.toLowerCase().indexOf(value) === -1;
      });
    });
  }
}());
