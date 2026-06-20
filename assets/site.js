(function () {
  'use strict';

  var scriptUrl = document.currentScript ? document.currentScript.src : '';
  var assetBase = scriptUrl ? new URL('.', scriptUrl).href : './assets/';
  var hlsPromise = null;

  function createFallbackImage(title) {
    var safeTitle = String(title || '日本高清影视').replace(/[<>&]/g, '');
    var lines = safeTitle.length > 16 ? safeTitle.slice(0, 16) + '…' : safeTitle;
    var svg = '' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">' +
      '<defs>' +
      '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#0f172a"/>' +
      '<stop offset="0.52" stop-color="#164e63"/>' +
      '<stop offset="1" stop-color="#1d4ed8"/>' +
      '</linearGradient>' +
      '<radialGradient id="glow" cx="30%" cy="20%" r="70%">' +
      '<stop offset="0" stop-color="#22d3ee" stop-opacity="0.46"/>' +
      '<stop offset="1" stop-color="#020617" stop-opacity="0"/>' +
      '</radialGradient>' +
      '</defs>' +
      '<rect width="900" height="1200" fill="url(#bg)"/>' +
      '<rect width="900" height="1200" fill="url(#glow)"/>' +
      '<rect x="70" y="76" width="760" height="1048" rx="54" fill="rgba(2,6,23,0.36)" stroke="rgba(255,255,255,0.22)"/>' +
      '<text x="450" y="520" text-anchor="middle" font-family="Arial, Microsoft YaHei, sans-serif" font-size="64" font-weight="800" fill="#ffffff">' + escapeSvg(lines) + '</text>' +
      '<text x="450" y="610" text-anchor="middle" font-family="Arial, Microsoft YaHei, sans-serif" font-size="34" fill="#a5f3fc">日本高清影视</text>' +
      '<text x="450" y="980" text-anchor="middle" font-family="Arial, Microsoft YaHei, sans-serif" font-size="28" fill="#cbd5e1">HD MOVIE</text>' +
      '</svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  function escapeSvg(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function installImageFallbacks(scope) {
    var images = (scope || document).querySelectorAll('img[data-title]');
    images.forEach(function (img) {
      if (img.dataset.fallbackReady === 'true') {
        return;
      }
      img.dataset.fallbackReady = 'true';
      img.addEventListener('error', function () {
        if (img.dataset.fallbackApplied === 'true') {
          return;
        }
        img.dataset.fallbackApplied = 'true';
        img.src = createFallbackImage(img.dataset.title || img.alt || '日本高清影视');
      });
    });
  }

  function setupMobileNav() {
    var button = document.querySelector('.mobile-nav-toggle');
    var menu = document.getElementById('mobileNav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('open');
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot || 0));
        play();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function setupCategoryFilters() {
    var scopes = document.querySelectorAll('[data-filter-scope]');
    scopes.forEach(function (scope) {
      var textInput = scope.querySelector('[data-filter-text]');
      var typeInput = scope.querySelector('[data-filter-type]');
      var yearInput = scope.querySelector('[data-filter-year]');
      var resetButton = scope.querySelector('[data-filter-reset]');
      var section = scope.nextElementSibling;
      var cards = section ? Array.prototype.slice.call(section.querySelectorAll('[data-movie-card]')) : [];
      var count = section ? section.querySelector('[data-filter-count]') : null;

      function apply() {
        var keyword = textInput ? textInput.value.trim().toLowerCase() : '';
        var type = typeInput ? typeInput.value : '';
        var year = yearInput ? yearInput.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(' ').toLowerCase();
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (type && card.dataset.type !== type) {
            matched = false;
          }
          if (year && card.dataset.year !== year) {
            matched = false;
          }
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = visible + ' 部';
        }
      }

      [textInput, typeInput, yearInput].forEach(function (input) {
        if (input) {
          input.addEventListener('input', apply);
          input.addEventListener('change', apply);
        }
      });
      if (resetButton) {
        resetButton.addEventListener('click', function () {
          if (textInput) {
            textInput.value = '';
          }
          if (typeInput) {
            typeInput.value = '';
          }
          if (yearInput) {
            yearInput.value = '';
          }
          apply();
        });
      }
      apply();
    });
  }

  function getHls() {
    if (!hlsPromise) {
      hlsPromise = import(assetBase + 'hls-vendor-dru42stk.js').then(function (module) {
        return module.H;
      });
    }
    return hlsPromise;
  }

  function setupPlayers() {
    var players = document.querySelectorAll('[data-player]');
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.player-play');
      var status = shell.querySelector('[data-player-status]');
      var src = shell.dataset.src;
      var initialized = false;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      async function start() {
        if (!video || !src) {
          setStatus('未找到播放源');
          return;
        }
        shell.classList.add('playing');
        video.setAttribute('controls', 'controls');

        try {
          if (!initialized) {
            initialized = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
              video.src = src;
              setStatus('使用浏览器原生 HLS 播放');
            } else {
              var Hls = await getHls();
              if (Hls && Hls.isSupported()) {
                var hls = new Hls({
                  enableWorker: true,
                  lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                shell._hlsInstance = hls;
                setStatus('HLS 播放源已加载');
              } else {
                video.src = src;
                setStatus('尝试直接播放 HLS 源');
              }
            }
          }
          var playResult = video.play();
          if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
              setStatus('播放已就绪，请再次点击视频播放');
            });
          }
        } catch (error) {
          shell.classList.remove('playing');
          setStatus('播放器初始化失败，请检查网络或浏览器支持');
          console.error(error);
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!initialized) {
            start();
          }
        });
      }
    });
  }

  function renderSearchCard(movie, rootPrefix) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<a class="movie-card compact" href="' + rootPrefix + movie.link + '" data-movie-card>' +
      '<span class="movie-cover">' +
      '<img src="' + rootPrefix + movie.cover + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy" data-title="' + escapeHtml(movie.title) + '">' +
      '<span class="movie-badge">' + escapeHtml(movie.type) + '</span>' +
      '<span class="movie-score">' + escapeHtml(movie.score) + '</span>' +
      '</span>' +
      '<span class="movie-card-body">' +
      '<strong>' + escapeHtml(movie.title) + '</strong>' +
      '<span class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</span>' +
      '<span class="movie-desc">' + escapeHtml(movie.one_line || movie.summary || '') + '</span>' +
      '<span class="movie-tags">' + tags + '</span>' +
      '</span>' +
      '</a>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page) {
      return;
    }
    var rootPrefix = page.dataset.rootPrefix || './';
    var jsonPath = page.dataset.moviesJson || (rootPrefix + 'data/movies.json');
    var input = page.querySelector('[data-search-input]');
    var typeSelect = page.querySelector('[data-search-type]');
    var sortSelect = page.querySelector('[data-search-sort]');
    var resetButton = page.querySelector('[data-search-reset]');
    var results = page.querySelector('[data-search-results]');
    var count = page.querySelector('[data-search-count]');
    var movies = [];

    function normalized(movie) {
      return [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.one_line,
        movie.summary,
        movie.category_name
      ].join(' ').toLowerCase();
    }

    function apply() {
      if (!results || !movies.length) {
        return;
      }
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var sort = sortSelect ? sortSelect.value : 'hot';
      var matched = movies.filter(function (movie) {
        if (type && movie.type !== type) {
          return false;
        }
        if (keyword && normalized(movie).indexOf(keyword) === -1) {
          return false;
        }
        return true;
      });

      matched.sort(function (a, b) {
        if (sort === 'score') {
          return Number(b.score) - Number(a.score) || Number(b.views) - Number(a.views);
        }
        if (sort === 'new') {
          return Number(b.year) - Number(a.year) || Number(a.id) - Number(b.id);
        }
        if (sort === 'id') {
          return Number(a.id) - Number(b.id);
        }
        return Number(b.views) - Number(a.views) || Number(b.score) - Number(a.score);
      });

      var limited = matched.slice(0, 120);
      results.innerHTML = limited.map(function (movie) {
        return renderSearchCard(movie, rootPrefix);
      }).join('');
      installImageFallbacks(results);
      if (count) {
        count.textContent = '共找到 ' + matched.length + ' 部，当前显示 ' + limited.length + ' 部';
      }
    }

    fetch(jsonPath)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        movies = Array.isArray(data) ? data : [];
        apply();
      })
      .catch(function () {
        if (count) {
          count.textContent = '数据文件加载失败，已显示默认推荐';
        }
      });

    [input, typeSelect, sortSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });
    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (sortSelect) {
          sortSelect.value = 'hot';
        }
        apply();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    installImageFallbacks(document);
    setupMobileNav();
    setupHero();
    setupCategoryFilters();
    setupPlayers();
    setupSearchPage();
  });
}());
