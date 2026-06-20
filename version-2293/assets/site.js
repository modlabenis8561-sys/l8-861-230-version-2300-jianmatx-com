(function () {
  'use strict';

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initMobileMenu() {
    var button = $('.menu-toggle');
    var panel = $('.mobile-panel');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initImageFallbacks() {
    $all('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
      }, { once: true });
    });
  }

  function renderSearchResults(input, box, query) {
    var movies = window.SITE_MOVIES || [];
    var q = normalize(query);

    if (!q) {
      box.classList.remove('is-open');
      box.innerHTML = '';
      return;
    }

    var results = movies.filter(function (movie) {
      return normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' ')).indexOf(q) !== -1;
    }).slice(0, 12);

    if (!results.length) {
      box.innerHTML = '<div class="search-result-item"><div></div><div><div class="search-result-title">未找到匹配影片</div><div class="search-result-meta">可尝试搜索地区、年份、题材或关键词</div></div></div>';
      box.classList.add('is-open');
      return;
    }

    box.innerHTML = results.map(function (movie) {
      return [
        '<a class="search-result-item" href="' + movie.url + '">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '海报" loading="lazy">',
        '<div>',
        '<div class="search-result-title">' + escapeHtml(movie.title) + '</div>',
        '<div class="search-result-meta">' + escapeHtml(movie.region + ' · ' + movie.type + ' · ' + movie.year + ' · ' + movie.genre) + '</div>',
        '</div>',
        '</a>'
      ].join('');
    }).join('');
    box.classList.add('is-open');
  }

  function initGlobalSearch() {
    var input = $('#globalSearch');
    var box = $('#globalSearchResults');

    if (!input || !box) {
      return;
    }

    input.addEventListener('input', function () {
      renderSearchResults(input, box, input.value);
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && input.value.trim()) {
        window.location.href = 'all.html?q=' + encodeURIComponent(input.value.trim());
      }
    });

    document.addEventListener('click', function (event) {
      if (!box.contains(event.target) && event.target !== input) {
        box.classList.remove('is-open');
      }
    });
  }

  function initHeroSlider() {
    var slides = $all('.hero-slide');
    var dots = $all('.hero-dot');

    if (!slides.length) {
      return;
    }

    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function initFilters() {
    var filterRoot = $('.js-filter-root');

    if (!filterRoot) {
      return;
    }

    var input = $('.js-filter-input', filterRoot);
    var year = $('.js-filter-year', filterRoot);
    var type = $('.js-filter-type', filterRoot);
    var cards = $all('.movie-card', filterRoot);
    var empty = $('.empty-state', filterRoot);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && input) {
      input.value = initialQuery;
    }

    function apply() {
      var q = normalize(input ? input.value : '');
      var y = year ? year.value : '';
      var t = type ? type.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matchQuery = !q || normalize(card.getAttribute('data-search')).indexOf(q) !== -1;
        var matchYear = !y || card.getAttribute('data-year') === y;
        var matchType = !t || card.getAttribute('data-type') === t;
        var show = matchQuery && matchYear && matchType;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, type].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });

    apply();
  }

  function loadHlsScript(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.defer = true;
    script.dataset.hlsLoader = 'true';
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function initPlayers() {
    $all('.js-player').forEach(function (player) {
      var video = $('video', player);
      var overlay = $('.player-overlay', player);
      var source = player.getAttribute('data-src');
      var started = false;

      if (!video || !source) {
        return;
      }

      function play() {
        if (started) {
          video.play();
          return;
        }

        started = true;

        function startPlayback() {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
              video.play().catch(function () {});
            }, { once: true });
          } else {
            video.src = source;
            video.play().catch(function () {});
          }
        }

        if (window.Hls && window.Hls.isSupported()) {
          startPlayback();
        } else {
          loadHlsScript(startPlayback);
        }

        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initImageFallbacks();
    initGlobalSearch();
    initHeroSlider();
    initFilters();
    initPlayers();
  });
})();
