(function () {
  var navButton = document.querySelector('[data-toggle-nav]');
  var nav = document.getElementById('mainNav');
  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showHero(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showHero(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showHero(current + 1);
      }, 5200);
    }
  }

  var input = document.querySelector('[data-search-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));

  function applySearch() {
    if (!cards.length) {
      return;
    }
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var yearBase = yearFilter && yearFilter.value ? parseInt(yearFilter.value, 10) : 0;

    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-type')
      ].join(' ').toLowerCase();
      var yearText = card.getAttribute('data-year') || '';
      var matchYear = yearText.match(/\d{4}/);
      var year = matchYear ? parseInt(matchYear[0], 10) : 0;
      var okKeyword = !keyword || text.indexOf(keyword) !== -1;
      var okYear = !yearBase || year >= yearBase;
      card.classList.toggle('is-filtered-out', !(okKeyword && okYear));
    });
  }

  if (input) {
    input.addEventListener('input', applySearch);
  }
  if (yearFilter) {
    yearFilter.addEventListener('change', applySearch);
  }
})();

function bindStreamPlayer(videoId, buttonId, coverId, mediaUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var cover = document.getElementById(coverId);
  var started = false;

  if (!video || !button || !cover || !mediaUrl) {
    return;
  }

  function attachMedia() {
    if (started) {
      return;
    }
    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = mediaUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(mediaUrl);
      hls.attachMedia(video);
    } else {
      video.src = mediaUrl;
    }
  }

  function playVideo() {
    attachMedia();
    cover.classList.add('is-hidden');
    video.controls = true;
    var playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  }

  button.addEventListener('click', playVideo);
  cover.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });
}
