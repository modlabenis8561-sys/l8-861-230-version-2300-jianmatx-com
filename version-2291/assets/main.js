function setupMobileNav() {
  const button = document.querySelector("[data-menu-button]");
  const nav = document.querySelector("[data-mobile-nav]");

  if (!button || !nav) {
    return;
  }

  button.addEventListener("click", function () {
    nav.classList.toggle("open");
  });
}

function setupHero() {
  const hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const prev = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let current = 0;
  let timer = null;

  function activate(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      activate(current + 1);
    }, 5000);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (prev) {
    prev.addEventListener("click", function () {
      activate(current - 1);
      stop();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      activate(current + 1);
      stop();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      activate(index);
      stop();
    });
  });

  if (slides.length > 1) {
    start();
  }
}

function setupSearchAndFilter() {
  const input = document.querySelector("[data-search-input]");
  const buttons = Array.from(document.querySelectorAll("[data-filter-btn]"));
  const cards = Array.from(document.querySelectorAll("[data-movie-card]"));

  if (!cards.length) {
    return;
  }

  let filterValue = "all";

  function apply() {
    const query = input ? input.value.trim().toLowerCase() : "";

    cards.forEach(function (card) {
      const text = (card.getAttribute("data-search-text") || "").toLowerCase();
      const kind = card.getAttribute("data-kind") || "";
      const year = card.getAttribute("data-year") || "";
      const matchesQuery = !query || text.indexOf(query) !== -1;
      const matchesFilter = filterValue === "all" || kind === filterValue || year === filterValue || text.indexOf(filterValue.toLowerCase()) !== -1;

      card.classList.toggle("hidden-by-filter", !(matchesQuery && matchesFilter));
    });
  }

  if (input) {
    input.addEventListener("input", apply);
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterValue = button.getAttribute("data-filter") || "all";

      buttons.forEach(function (item) {
        item.classList.toggle("active", item === button);
      });

      apply();
    });
  });
}

function initializePlayer(videoUrl) {
  const video = document.getElementById("movieVideo");
  const cover = document.getElementById("playCover");

  if (!video || !videoUrl) {
    return;
  }

  let attached = false;
  let hlsInstance = null;
  let waitingForManifest = false;

  function attach() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });

      hlsInstance.loadSource(videoUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (waitingForManifest) {
          video.play().catch(function () {});
        }
      });
      return;
    }

    video.src = videoUrl;
  }

  function play() {
    attach();

    if (cover) {
      cover.classList.add("is-hidden");
    }

    const result = video.play();

    if (result && typeof result.catch === "function") {
      waitingForManifest = true;
      result.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", play);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener("play", function () {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  });

  video.addEventListener("ended", function () {
    if (cover) {
      cover.classList.remove("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setupMobileNav();
  setupHero();
  setupSearchAndFilter();
});
