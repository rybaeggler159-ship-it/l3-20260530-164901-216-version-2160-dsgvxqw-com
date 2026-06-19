(function () {
  function rootPrefix() {
    var path = window.location.pathname.replace(/\\/g, "/");
    if (path.indexOf("/movies/") !== -1 || path.indexOf("/categories/") !== -1) {
      return "../";
    }
    return "./";
  }

  function escapeText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderSearch(query) {
    var results = document.getElementById("site-search-results");
    if (!results) {
      return;
    }
    var keyword = String(query || "").trim().toLowerCase();
    if (!keyword) {
      results.innerHTML = '<p class="empty-state is-visible">输入影片名称、地区或题材</p>';
      return;
    }
    var list = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];
    var matched = list.filter(function (movie) {
      return String(movie.text || "").toLowerCase().indexOf(keyword) !== -1;
    }).slice(0, 12);
    if (!matched.length) {
      results.innerHTML = '<p class="empty-state is-visible">没有找到匹配影片</p>';
      return;
    }
    var prefix = rootPrefix();
    results.innerHTML = matched.map(function (movie) {
      return [
        '<a class="search-result" href="' + prefix + escapeText(movie.url) + '">',
        '<img src="' + prefix + escapeText(movie.image) + '" alt="' + escapeText(movie.title) + '">',
        '<span>',
        '<strong>' + escapeText(movie.title) + '</strong>',
        '<span>' + escapeText(movie.region) + ' · ' + escapeText(movie.genre) + ' · ' + escapeText(movie.year) + '</span>',
        '</span>',
        '</a>'
      ].join("");
    }).join("");
  }

  function setupSearch() {
    var panel = document.querySelector("[data-search-panel]");
    var input = document.getElementById("site-search-input");
    var openButtons = document.querySelectorAll("[data-search-open]");
    var closeButtons = document.querySelectorAll("[data-search-close]");
    openButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (!panel) {
          return;
        }
        panel.classList.add("is-open");
        renderSearch(input ? input.value : "");
        window.setTimeout(function () {
          if (input) {
            input.focus();
          }
        }, 30);
      });
    });
    closeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (panel) {
          panel.classList.remove("is-open");
        }
      });
    });
    if (panel) {
      panel.addEventListener("click", function (event) {
        if (event.target === panel) {
          panel.classList.remove("is-open");
        }
      });
    }
    if (input) {
      input.addEventListener("input", function () {
        renderSearch(input.value);
      });
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    start();
  }

  function setupListFilter() {
    var inputs = document.querySelectorAll("[data-list-filter]");
    inputs.forEach(function (input) {
      var scope = input.closest(".list-section") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty-state]");
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = String(card.getAttribute("data-search") || "").toLowerCase();
          var match = !query || text.indexOf(query) !== -1;
          card.hidden = !match;
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupSearch();
    setupMenu();
    setupHero();
    setupListFilter();
  });
})();
