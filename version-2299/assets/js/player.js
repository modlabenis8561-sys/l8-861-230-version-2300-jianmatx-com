(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function init(wrapper) {
    var video = wrapper.querySelector("video");
    var playButton = wrapper.querySelector("[data-play]");
    var url = video ? video.getAttribute("data-video-url") : "";
    var started = false;
    var hlsInstance = null;

    if (!video || !url) {
      return;
    }

    function loadStream() {
      if (started) {
        return;
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          maxBufferLength: 30
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      loadStream();
      wrapper.classList.add("is-playing");
      video.controls = true;
      var result = video.play();

      if (result && typeof result.catch === "function") {
        result.catch(function () {
          wrapper.classList.remove("is-playing");
        });
      }
    }

    if (playButton) {
      playButton.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      wrapper.classList.add("is-playing");
    });

    video.addEventListener("ended", function () {
      wrapper.classList.remove("is-playing");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(init);
  });
})();
