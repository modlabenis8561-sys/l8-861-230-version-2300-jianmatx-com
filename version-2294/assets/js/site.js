const ready = (callback) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
};

ready(() => {
  initNavigation();
  initHeroSlider();
  initSearchAndSort();
  initPlayers();
});

function initNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

function initHeroSlider() {
  const slider = document.querySelector('[data-hero-slider]');

  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll('.hero-slide'));
  const dots = Array.from(slider.querySelectorAll('.hero-dot'));
  const prev = slider.querySelector('.hero-prev');
  const next = slider.querySelector('.hero-next');
  let index = 0;
  let timer = null;

  const show = (target) => {
    if (!slides.length) {
      return;
    }

    index = (target + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(index + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  prev?.addEventListener('click', () => {
    show(index - 1);
    start();
  });

  next?.addEventListener('click', () => {
    show(index + 1);
    start();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.slide || 0));
      start();
    });
  });

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  start();
}

function initSearchAndSort() {
  const list = document.querySelector('[data-card-list]');

  if (!list) {
    return;
  }

  const cards = Array.from(list.querySelectorAll('[data-search]'));
  const localInput = document.querySelector('[data-local-search]');
  const searchInput = document.querySelector('[data-search-input]');
  const summary = document.querySelector('[data-search-summary]');
  const empty = document.querySelector('[data-empty-state]');
  const sort = document.querySelector('[data-sort-cards]');
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
  }

  const input = searchInput || localInput;

  const filterCards = () => {
    const query = (input?.value || '').trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const text = (card.dataset.search || '').toLowerCase();
      const matched = !query || text.includes(query);
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (summary) {
      summary.textContent = query ? `找到 ${visible} 部与“${query}”相关的影片` : `显示全部 ${cards.length} 部影片`;
    }

    if (empty) {
      empty.hidden = visible !== 0;
    }
  };

  const sortCards = () => {
    if (!sort) {
      return;
    }

    const value = sort.value;
    const sorted = [...cards];

    if (value === 'year-desc') {
      sorted.sort((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0));
    }

    if (value === 'year-asc') {
      sorted.sort((a, b) => Number(a.dataset.year || 0) - Number(b.dataset.year || 0));
    }

    if (value === 'title') {
      sorted.sort((a, b) => (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN'));
    }

    if (value === 'default') {
      sorted.sort((a, b) => cards.indexOf(a) - cards.indexOf(b));
    }

    sorted.forEach((card) => list.appendChild(card));
  };

  input?.addEventListener('input', filterCards);
  sort?.addEventListener('change', () => {
    sortCards();
    filterCards();
  });

  filterCards();
}

async function initPlayers() {
  const videos = Array.from(document.querySelectorAll('video.hls-player'));

  if (!videos.length) {
    return;
  }

  let Hls = null;

  try {
    const module = await import('./video-player-bbsaiqh1.js');
    Hls = module.H;
  } catch (error) {
    Hls = null;
  }

  videos.forEach((video) => {
    const source = video.dataset.src;
    const stage = video.closest('.video-stage');
    const button = stage?.querySelector('.player-cta');

    if (!source) {
      return;
    }

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    }

    const play = () => {
      const request = video.paused ? video.play() : video.pause();
      if (request && typeof request.catch === 'function') {
        request.catch(() => {});
      }
    };

    button?.addEventListener('click', (event) => {
      event.preventDefault();
      play();
    });

    video.addEventListener('play', () => stage?.classList.add('is-playing'));
    video.addEventListener('pause', () => stage?.classList.remove('is-playing'));
    video.addEventListener('ended', () => stage?.classList.remove('is-playing'));
  });
}
