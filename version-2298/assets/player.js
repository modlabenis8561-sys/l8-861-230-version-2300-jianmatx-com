(function () {
  var configElement = document.getElementById('player-config');
  var video = document.getElementById('movie-player');
  var layer = document.querySelector('[data-play-layer]');
  var wrap = document.querySelector('[data-player-wrap]');

  if (!configElement || !video) {
    return;
  }

  var config = {};

  try {
    config = JSON.parse(configElement.textContent || '{}');
  } catch (error) {
    config = {};
  }

  var source = config.src || '';
  var ready = false;
  var hlsInstance = null;

  function bindSource() {
    if (ready || !source) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function startPlay() {
    bindSource();

    if (wrap) {
      wrap.classList.add('is-playing');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (layer) {
    layer.addEventListener('click', startPlay);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-play-trigger]')).forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();

      var playerSection = document.getElementById('player');

      if (playerSection && typeof playerSection.scrollIntoView === 'function') {
        playerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      startPlay();
    });
  });

  video.addEventListener('play', function () {
    if (wrap) {
      wrap.classList.add('is-playing');
    }
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlay();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
