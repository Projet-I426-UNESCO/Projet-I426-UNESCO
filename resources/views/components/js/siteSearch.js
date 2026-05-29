import { continentByCountry } from "./countries";

export function initSiteSearch({ unescos, markers, onUpdate }) {

  const searchInput = document.getElementById("siteSearchInput");

  const filterCategory = document.querySelector('[data-filter-group="category"]');
  const filterRegion = document.querySelector('[data-filter-group="region"]');
  const filterContinent = document.querySelector('[data-filter-group="continent"]');

  const filterCountry = document.querySelector('[data-filter-input="country"]');
  const filterDateFrom = document.querySelector('[data-filter-input="dateFrom"]');
  const filterDateTo = document.querySelector('[data-filter-input="dateTo"]');

  const resetBtn = document.querySelector('[data-filter-reset]');

  const normalize = (v) =>
    (v || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  let searchQuery = "";
  let activeFilter = "all";

  function getSelected(container) {
    if (!container) return [];
    return [...container.querySelectorAll("input:checked")].map(i => i.value);
  }

  function setupDynamicFilters(unescos) {
    const regions = [...new Set(unescos.map(u => u.region).filter(Boolean))].sort();
    const continents = [...new Set(
      unescos.flatMap(u => {
        const countries = Array.isArray(u.statesNames)
          ? u.statesNames
          : typeof u.statesNames === "string"
            ? u.statesNames.split(/[;,]/)
            : [];

        return countries
          .map(country => continentByCountry[country])
          .filter(Boolean);
      })
    )].sort();

    function render(container, values) {
      if (!container) return;

      container.innerHTML = values.map((v, i) => {
        const id = `${container.dataset.filterGroup}-${i}`;
        return `
          <label class="filter-option" for="${id}">
            <input id="${id}" type="checkbox" value="${normalize(v)}" />
            <span>${v}</span>
          </label>
        `;
      }).join("");
    }

    render(filterRegion, regions);
    render(filterContinent, continents);
  }

  function matchesSearch(item) {
    if (!searchQuery) return true;

    const text = [item.nameFr, item.nameEn, item.statesNames].join(" ");
    return normalize(text).includes(normalize(searchQuery));
  }

  function matchesAdvanced(item) {
    const cats = getSelected(filterCategory);
    const regions = getSelected(filterRegion);
    const continents = getSelected(filterContinent);

    if (cats.length && !cats.includes(normalize(item.category))) return false;
    if (regions.length && !regions.includes(normalize(item.region))) return false;

    const countries = Array.isArray(item.statesNames)
      ? item.statesNames
      : typeof item.statesNames === "string"
        ? item.statesNames.split(/[;,]/)
        : [];

    const itemContinents = countries
      .map(country => continentByCountry[country])
      .filter(Boolean);

    if (
      continents.length &&
      !itemContinents.some(c => continents.includes(normalize(c)))
    ) {
      return false;
    }

    const countryQuery = normalize(filterCountry?.value);
    if (countryQuery && !normalize(item.statesNames).includes(countryQuery)) return false;

    const from = parseInt(filterDateFrom?.value || "");
    const to = parseInt(filterDateTo?.value || "");
    const year = parseInt(item.dateInscribed || "");

    if (!isNaN(from) && year < from) return false;
    if (!isNaN(to) && year > to) return false;

    return true;
  }

  function matchesMarkerFilter(item) {
    const marker = markers?.find(m => m.unescoId === item.id);

    if (activeFilter === "visited") return marker?.isVisited;
    if (activeFilter === "marked") return marker?.isMarked;
    return true;
  }

  function apply() {
    const result = unescos.filter(u =>
      u.coordinates &&
      matchesSearch(u) &&
      matchesAdvanced(u) &&
      matchesMarkerFilter(u)
    );

    onUpdate(result);
  }

  function bindFilterListeners() {

    document
      .querySelectorAll('[data-filter-group] input[type="checkbox"]')
      .forEach(el => {
        el.addEventListener("change", apply);
      });

    document
      .querySelectorAll('[data-filter-input]')
      .forEach(el => {
        el.addEventListener("input", apply);
      });
  }

  function setFilter(mode) {
    activeFilter = mode;

    document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
    const map = { all: 0, marked: 1, visited: 2 };
    document.querySelectorAll(".filter-pill")[map[mode]].classList.add("active");

    apply();
  }

  setupDynamicFilters(unescos);
  bindFilterListeners();

  searchInput?.addEventListener("input", (e) => {
    searchQuery = e.target.value || "";
    apply();
  });

  resetBtn?.addEventListener("click", () => {
    document.querySelectorAll("input[type=checkbox]").forEach(i => i.checked = false);
    filterCountry.value = "";
    filterDateFrom.value = "";
    filterDateTo.value = "";
    apply();
  });

  window.setFilter = setFilter;
  apply();
}