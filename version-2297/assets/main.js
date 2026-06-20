(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[type='search']");
        var query = input ? input.value.trim() : "";
        var action = form.getAttribute("action") || "search.html";
        var url = query ? action + "?q=" + encodeURIComponent(query) : action;
        window.location.href = url;
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length > 1) {
      var active = 0;
      var showSlide = function (index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          showSlide(i);
        });
      });
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    var input = document.querySelector("[data-filter-input]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty-state]");
    if (input && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
      }
      var applyFilter = function () {
        var query = normalize(input.value);
        var type = typeSelect ? normalize(typeSelect.value) : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardType = normalize(card.getAttribute("data-type"));
          var okQuery = !query || text.indexOf(query) !== -1;
          var okType = !type || cardType.indexOf(type) !== -1;
          var ok = okQuery && okType;
          card.classList.toggle("is-hidden-card", !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };
      input.addEventListener("input", applyFilter);
      if (typeSelect) {
        typeSelect.addEventListener("change", applyFilter);
      }
      applyFilter();
    }
  });

  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    if (!video || !streamUrl) {
      return;
    }
    var started = false;
    var start = function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.getAttribute("src")) {
          video.setAttribute("src", streamUrl);
        }
        video.play().catch(function () {});
        started = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!video.__hls) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          video.__hls = hls;
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.play().catch(function () {});
        }
        started = true;
        return;
      }
      if (!video.getAttribute("src")) {
        video.setAttribute("src", streamUrl);
      }
      video.play().catch(function () {});
      started = true;
    };
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
  };
})();
