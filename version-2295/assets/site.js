(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            mainNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-search-input]');
        var yearFilter = scope.querySelector('[data-year-filter]');
        var typeFilter = scope.querySelector('[data-type-filter]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var noResult = scope.querySelector('[data-no-result]');

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var year = yearFilter ? yearFilter.value : '';
            var type = typeFilter ? typeFilter.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var searchText = card.getAttribute('data-search') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var cardType = card.getAttribute('data-type') || '';
                var matchesQuery = !query || searchText.indexOf(query) !== -1;
                var matchesYear = !year || cardYear === year;
                var matchesType = !type || cardType.indexOf(type) !== -1;
                var show = matchesQuery && matchesYear && matchesType;

                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (noResult) {
                noResult.hidden = visible !== 0;
            }
        }

        [input, yearFilter, typeFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });

    var video = document.querySelector('[data-player]');
    var playButton = document.querySelector('[data-play-button]');

    if (video) {
        var src = video.getAttribute('data-src');
        var shell = video.closest('.video-shell');

        function attachSource() {
            if (!src) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(src);
                hls.attachMedia(video);
                window.__movieHls = hls;
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else {
                video.src = src;
            }
        }

        function setPlayingState() {
            if (shell) {
                shell.classList.toggle('is-playing', !video.paused && !video.ended);
            }
        }

        function playVideo() {
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        }

        attachSource();

        if (playButton) {
            playButton.addEventListener('click', function () {
                playVideo();
            });
        }

        video.addEventListener('play', setPlayingState);
        video.addEventListener('pause', setPlayingState);
        video.addEventListener('ended', setPlayingState);
    }
})();
