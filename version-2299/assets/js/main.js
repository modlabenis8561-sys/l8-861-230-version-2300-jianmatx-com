(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function updateCards(scope) {
    var input = scope.querySelector("[data-search-input]");
    var activeButton = scope.querySelector("[data-filter-button].active");
    var keyword = normalize(input ? input.value : "");
    var filter = activeButton ? activeButton.getAttribute("data-filter-value") : "all";
    var cards = scope.querySelectorAll("[data-movie-card]");

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search-text"));
      var group = card.getAttribute("data-filter-group") || "";
      var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
      var filterMatched = filter === "all" || group === filter;
      card.classList.toggle("is-hidden", !(keywordMatched && filterMatched));
    });
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
      var inputs = scope.querySelectorAll("[data-search-input]");
      var buttons = scope.querySelectorAll("[data-filter-button]");

      inputs.forEach(function (input) {
        input.addEventListener("input", function () {
          updateCards(scope);
        });
      });

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          updateCards(scope);
        });
      });

      updateCards(scope);
    });

    document.querySelectorAll("[data-search-input][data-search-target]").forEach(function (input) {
      var target = document.getElementById(input.getAttribute("data-search-target"));

      if (!target) {
        return;
      }

      input.addEventListener("input", function () {
        var keyword = normalize(input.value);
        var cards = target.querySelectorAll("[data-movie-card]");

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search-text"));
          card.classList.toggle("is-hidden", keyword && text.indexOf(keyword) === -1);
        });
      });
    });
  });
})();
