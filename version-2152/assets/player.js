(function () {
  function setupPlayer() {
    var frame = document.querySelector('[data-player]');

    if (!frame) {
      return;
    }

    var video = frame.querySelector('video[data-stream]');
    var button = frame.querySelector('[data-play-button]');
    var message = frame.querySelector('[data-player-message]');

    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var ready = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function hideButton() {
      if (button) {
        button.classList.add('is-hidden');
      }
    }

    function showButton() {
      if (button && video.paused) {
        button.classList.remove('is-hidden');
      }
    }

    function attachStream() {
      if (ready || !stream) {
        return;
      }

      ready = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('视频暂时无法加载');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        setMessage('视频暂时无法加载');
      }
    }

    function playVideo() {
      attachStream();
      video.setAttribute('controls', 'controls');
      hideButton();

      var action = video.play();

      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          showButton();
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', hideButton);
    video.addEventListener('pause', showButton);
    video.addEventListener('error', function () {
      setMessage('视频暂时无法加载');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupPlayer);
  } else {
    setupPlayer();
  }
})();
