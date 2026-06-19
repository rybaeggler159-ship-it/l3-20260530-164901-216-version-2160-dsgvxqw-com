(function () {
    const mobileToggle = document.querySelector('[data-mobile-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        const setSlide = function (index) {
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
        };

        const start = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5200);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setSlide(Number(dot.dataset.heroDot || 0));
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                setSlide(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setSlide(current + 1);
                start();
            });
        }

        start();
    }

    const searchInput = document.querySelector('[data-search-input]');
    const typeFilter = document.querySelector('[data-type-filter]');
    const clearFilter = document.querySelector('[data-clear-filter]');
    const emptyState = document.querySelector('[data-empty-state]');

    if (searchInput || typeFilter) {
        const cards = Array.from(document.querySelectorAll('.movie-card'));

        const applyFilter = function () {
            const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            const selectedType = typeFilter ? typeFilter.value : '全部';
            let visible = 0;

            cards.forEach(function (card) {
                const searchText = (card.dataset.search || '').toLowerCase();
                const cardType = card.dataset.type || '';
                const matchKeyword = !keyword || searchText.indexOf(keyword) !== -1;
                const matchType = selectedType === '全部' || cardType === selectedType;
                const shouldShow = matchKeyword && matchType;
                card.style.display = shouldShow ? '' : 'none';

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('show', visible === 0);
            }
        };

        if (searchInput) {
            searchInput.addEventListener('input', applyFilter);
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', applyFilter);
        }

        if (clearFilter) {
            clearFilter.addEventListener('click', function () {
                if (searchInput) {
                    searchInput.value = '';
                }

                if (typeFilter) {
                    typeFilter.value = '全部';
                }

                applyFilter();
            });
        }
    }
})();

function startVideoPlayer(streamUrl) {
    const player = document.querySelector('[data-player]');

    if (!player) {
        return;
    }

    const video = player.querySelector('.movie-video');
    const mainButton = player.querySelector('[data-play-button]');
    const controlPlay = player.querySelector('[data-control-play]');
    const controlMute = player.querySelector('[data-control-mute]');
    const controlFullscreen = player.querySelector('[data-control-fullscreen]');
    let hlsInstance = null;
    let ready = false;

    const setReady = function () {
        ready = true;
    };

    const setFailed = function () {
        player.classList.remove('playing');
        if (mainButton) {
            mainButton.innerHTML = '<span>▶</span>';
        }
    };

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', setReady, { once: true });
    } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, setReady);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
                setFailed();
            }
        });
    } else {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', setReady, { once: true });
    }

    const playVideo = function () {
        const playPromise = video.play();

        player.classList.add('playing');

        if (controlPlay) {
            controlPlay.textContent = '暂停';
        }

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                setFailed();
            });
        }
    };

    const togglePlay = function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
            player.classList.remove('playing');

            if (controlPlay) {
                controlPlay.textContent = '播放';
            }
        }
    };

    if (mainButton) {
        mainButton.addEventListener('click', playVideo);
    }

    if (controlPlay) {
        controlPlay.addEventListener('click', togglePlay);
    }

    video.addEventListener('click', togglePlay);

    video.addEventListener('play', function () {
        player.classList.add('playing');

        if (controlPlay) {
            controlPlay.textContent = '暂停';
        }
    });

    video.addEventListener('pause', function () {
        if (!video.ended) {
            player.classList.remove('playing');
        }

        if (controlPlay) {
            controlPlay.textContent = '播放';
        }
    });

    video.addEventListener('ended', function () {
        player.classList.remove('playing');

        if (controlPlay) {
            controlPlay.textContent = '播放';
        }
    });

    if (controlMute) {
        controlMute.addEventListener('click', function () {
            video.muted = !video.muted;
            controlMute.textContent = video.muted ? '静音' : '音量';
        });
    }

    if (controlFullscreen) {
        controlFullscreen.addEventListener('click', function () {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (player.requestFullscreen) {
                player.requestFullscreen();
            }
        });
    }

    video.addEventListener('canplay', function () {
        ready = true;
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
