import { H as Hls } from './video-player-dru42stk.js';

const players = Array.from(document.querySelectorAll('.js-player'));

players.forEach(function (video) {
  const stream = video.getAttribute('data-stream');
  const shell = video.closest('.player-card');
  const overlay = shell ? shell.querySelector('.js-play-overlay') : null;
  let ready = false;
  let hls = null;

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  function attachStream() {
    if (ready || !stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }

    ready = true;
  }

  function playVideo() {
    attachStream();
    hideOverlay();
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (!ready) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    hideOverlay();
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
});
