(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('image-empty');
            image.removeAttribute('alt');
        }, { once: true });
    });

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        start();
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var grid = panel.parentElement.querySelector('[data-card-grid]');
        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var search = panel.querySelector('[data-search-input]');
        var year = panel.querySelector('[data-year-filter]');
        var region = panel.querySelector('[data-region-filter]');
        var category = panel.querySelector('[data-category-filter]');
        var viewButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-view]'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && search) {
            search.value = query;
        }

        function normalized(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var q = normalized(search ? search.value : '');
            var selectedYear = year ? year.value : '';
            var selectedRegion = region ? region.value : '';
            var selectedCategory = category ? category.value : '';

            cards.forEach(function (card) {
                var text = normalized([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchQuery = !q || text.indexOf(q) !== -1;
                var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
                var matchRegion = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
                var matchCategory = !selectedCategory || card.getAttribute('data-category') === selectedCategory;
                card.style.display = matchQuery && matchYear && matchRegion && matchCategory ? '' : 'none';
            });
        }

        [search, year, region, category].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        viewButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                var view = button.getAttribute('data-view');
                viewButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                grid.classList.toggle('list-view', view === 'list');
            });
        });

        applyFilter();
    });

    document.querySelectorAll('.player').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.play-cover');
        var stream = player.getAttribute('data-hls');
        var instance = null;
        var ready = false;

        if (!video || !button || !stream) {
            return;
        }

        function attach() {
            if (ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                ready = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                instance = new window.Hls();
                instance.loadSource(stream);
                instance.attachMedia(video);
                ready = true;
                return;
            }

            video.src = stream;
            ready = true;
        }

        function playVideo() {
            attach();
            button.classList.add('hidden');
            var playAction = video.play();

            if (playAction && typeof playAction.catch === 'function') {
                playAction.catch(function () {
                    button.classList.remove('hidden');
                });
            }
        }

        button.addEventListener('click', playVideo);
        video.addEventListener('play', function () {
            button.classList.add('hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended && video.currentTime === 0) {
                button.classList.remove('hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (instance && typeof instance.destroy === 'function') {
                instance.destroy();
            }
        });
    });
}());
