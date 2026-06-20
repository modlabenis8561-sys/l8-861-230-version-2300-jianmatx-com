(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));

  if (filterButtons.length) {
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter') || 'all';
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

        filterButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-category') || ''
          ].join(' ');

          card.hidden = value !== 'all' && haystack.indexOf(value) === -1;
        });
      });
    });
  }

  var searchInput = document.querySelector('[data-search-input]');
  var resultLine = document.querySelector('[data-result-line]');
  var emptyState = document.querySelector('[data-empty-state]');

  function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
  }

  function runSearch() {
    if (!searchInput) {
      return;
    }

    var query = normalizeText(searchInput.value);
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-results] .movie-card'));
    var count = 0;

    cards.forEach(function (card) {
      var haystack = normalizeText([
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-category') || '',
        card.textContent || ''
      ].join(' '));
      var matched = !query || haystack.indexOf(query) !== -1;

      card.hidden = !matched;

      if (matched) {
        count += 1;
      }
    });

    if (resultLine) {
      resultLine.textContent = query ? '搜索结果：' + count + ' 部影片' : '精选影片';
    }

    if (emptyState) {
      emptyState.hidden = count !== 0;
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    searchInput.value = initial;
    searchInput.addEventListener('input', runSearch);
    runSearch();
  }
})();
