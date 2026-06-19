(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
                document.body.classList.toggle("menu-open", mobileNav.classList.contains("is-open"));
            });
        }

        document.querySelectorAll("[data-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-dot]"));
            if (!slides.length) {
                return;
            }
            var index = 0;
            var show = function (next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            };
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-slide-dot")) || 0);
                });
            });
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        });

        document.querySelectorAll("[data-global-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (value) {
                    event.preventDefault();
                    window.location.href = "./library.html?q=" + encodeURIComponent(value);
                }
            });
        });

        var query = new URLSearchParams(window.location.search).get("q") || "";
        document.querySelectorAll("[data-search-input]").forEach(function (input) {
            if (query) {
                input.value = query;
            }
        });

        var activeFilter = "all";
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

        var applyFilters = function () {
            var terms = searchInputs.map(function (input) {
                return input.value.trim().toLowerCase();
            }).filter(Boolean).join(" ");
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                var type = card.getAttribute("data-type") || "";
                var year = card.getAttribute("data-year") || "";
                var matchText = !terms || terms.split(/\s+/).every(function (term) {
                    return text.indexOf(term) !== -1;
                });
                var matchFilter = activeFilter === "all" || type === activeFilter || year === activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
                card.classList.toggle("is-hidden", !(matchText && matchFilter));
            });
        };

        searchInputs.forEach(function (input) {
            input.addEventListener("input", applyFilters);
        });

        document.querySelectorAll("[data-filter-button]").forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-filter-button") || "all";
                document.querySelectorAll("[data-filter-button]").forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                applyFilters();
            });
        });

        if (query && cards.length) {
            applyFilters();
        }

        document.querySelectorAll("[data-player]").forEach(function (shell) {
            var video = shell.querySelector("video");
            var cover = shell.querySelector("[data-player-cover]");
            var stream = shell.getAttribute("data-stream");
            var started = false;
            var hlsInstance = null;

            var start = function () {
                if (!video || !stream) {
                    return;
                }
                shell.classList.add("is-playing");
                if (started) {
                    video.play();
                    return;
                }
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    video.play();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play();
                    });
                    return;
                }
                video.src = stream;
                video.play();
            };

            if (cover) {
                cover.addEventListener("click", start);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!started) {
                        start();
                    }
                });
                video.addEventListener("play", function () {
                    shell.classList.add("is-playing");
                });
                video.addEventListener("emptied", function () {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                    }
                });
            }
        });
    });
})();
