(() => {
  "use strict";

  const records = Array.isArray(window.BENCHMARK_DATA) ? window.BENCHMARK_DATA : [];
  const categoryNames = {
    "1": "Agencia especializada dentro de una institución pública",
    "2": "Ventanilla única con operadores privados seleccionados",
    "3": "Fondo concursable administrado por terceros",
  };
  const mapPositions = {
    "Brasil": [176, 190],
    "Colombia": [148, 151],
    "Chile": [142, 235],
    "Jamaica": [126, 115],
    "Túnez": [327, 92],
    "Nepal": [470, 118],
    "Uruguay": [183, 232],
    "Argentina": [164, 252],
    "Perú": [145, 186],
    "Caribe / regional": [145, 120],
  };

  const state = {
    query: "",
    country: "",
    institution: "",
    category: "",
    problem: "",
    sort: "institution",
  };

  const el = (id) => document.getElementById(id);
  const explorerView = el("explorerView");
  const detailView = el("detailView");
  const resultsGrid = el("resultsGrid");
  const emptyState = el("emptyState");

  const escapeHTML = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const normalize = (value) => String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const unique = (values) => [...new Set(values.filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "es"));

  const institutions = unique(records.map((record) => record.institution));
  const countries = unique(records.map((record) => record.country));
  const problems = unique(records.map((record) => record.problem));

  function shortCategory(record) {
    return record.categoryTypes.map((number) => `Categoría ${number}`).join(" / ");
  }

  function populateFilters() {
    institutions.forEach((value) => el("institutionFilter").add(new Option(value, value)));
    Object.entries(categoryNames).forEach(([value, label]) => {
      el("categoryFilter").add(new Option(`Categoría ${value}: ${label}`, value));
    });
    problems.forEach((value) => el("problemFilter").add(new Option(value, value)));

    el("categoryGuide").innerHTML = Object.entries(categoryNames).map(([number, label]) => `
      <article>
        <strong>Categoría ${number}</strong>
        <span>${escapeHTML(label)}</span>
      </article>
    `).join("");
  }

  function renderStats() {
    el("institutionCount").textContent = institutions.length;
    el("recordCount").textContent = records.length;
    el("countryCount").textContent = countries.length;
  }

  function renderMap() {
    el("countryButtons").innerHTML = countries.map((country) => `
      <button class="country-button${state.country === country ? " active" : ""}" type="button" data-country="${escapeHTML(country)}">
        ${escapeHTML(country)}
      </button>
    `).join("");

    el("mapPoints").innerHTML = countries.map((country) => {
      const [x, y] = mapPositions[country] || [310, 150];
      const labelX = x > 430 ? x - 8 : x + 10;
      const anchor = x > 430 ? "end" : "start";
      return `
        <g class="map-point${state.country === country ? " active" : ""}" tabindex="0" role="button" data-country="${escapeHTML(country)}" aria-label="Filtrar por ${escapeHTML(country)}">
          <circle cx="${x}" cy="${y}" r="7"></circle>
          <text x="${labelX}" y="${y - 10}" text-anchor="${anchor}">${escapeHTML(country.replace(" / regional", ""))}</text>
        </g>
      `;
    }).join("");

    el("activeCountryLabel").textContent = state.country || "Todos";
  }

  function recordMatches(record) {
    const searchable = normalize([
      record.institution,
      record.country,
      record.program,
      record.category,
      record.mechanism,
      record.instrument,
      record.instrumentDescription,
      record.problem,
      record.problemDescription,
    ].join(" "));
    return (!state.query || searchable.includes(normalize(state.query)))
      && (!state.country || record.country === state.country)
      && (!state.institution || record.institution === state.institution)
      && (!state.category || record.categoryTypes.includes(state.category))
      && (!state.problem || record.problem === state.problem);
  }

  function sortedRecords(filtered) {
    const key = state.sort === "country" ? "country" : state.sort === "problem" ? "problem" : "institution";
    return [...filtered].sort((a, b) => {
      const primary = a[key].localeCompare(b[key], "es");
      return primary || a.program.localeCompare(b.program, "es");
    });
  }

  function cardTemplate(record) {
    return `
      <article class="result-card">
        <div class="card-meta">
          <span>${escapeHTML(record.country)}</span>
          <span class="category-badge">${escapeHTML(shortCategory(record))}</span>
        </div>
        <h3>${escapeHTML(record.institution)}</h3>
        <p class="program-name">${escapeHTML(record.program)}</p>
        <p class="problem-label">Problema que aborda</p>
        <p class="problem-name">${escapeHTML(record.problem)}</p>
        <button class="card-link" type="button" data-record="${record.id}">Ver ficha</button>
      </article>
    `;
  }

  function renderActiveFilters() {
    const chips = [];
    if (state.query) chips.push(["query", `Búsqueda: ${state.query}`]);
    if (state.country) chips.push(["country", state.country]);
    if (state.institution) chips.push(["institution", state.institution]);
    if (state.category) chips.push(["category", `Categoría ${state.category}`]);
    if (state.problem) chips.push(["problem", state.problem]);
    el("activeFilters").innerHTML = chips.map(([key, label]) => `
      <button class="filter-chip" type="button" data-clear="${key}">${escapeHTML(label)} <span aria-hidden="true">×</span></button>
    `).join("");
  }

  function renderResults() {
    const filtered = sortedRecords(records.filter(recordMatches));
    el("resultCount").textContent = filtered.length;
    resultsGrid.innerHTML = filtered.map(cardTemplate).join("");
    emptyState.hidden = filtered.length > 0;
    resultsGrid.hidden = filtered.length === 0;
    renderActiveFilters();
    renderMap();
  }

  function syncControls() {
    el("searchInput").value = state.query;
    el("institutionFilter").value = state.institution;
    el("categoryFilter").value = state.category;
    el("problemFilter").value = state.problem;
    el("sortSelect").value = state.sort;
  }

  function setCountry(country) {
    state.country = state.country === country ? "" : country;
    syncControls();
    renderResults();
  }

  function resetFilters() {
    Object.assign(state, { query: "", country: "", institution: "", category: "", problem: "" });
    syncControls();
    renderResults();
  }

  function showExplorer({ scroll = false } = {}) {
    explorerView.hidden = false;
    detailView.hidden = true;
    if (location.hash.startsWith("#registro-") || location.hash.startsWith("#institucion-")) {
      history.replaceState(null, "", location.pathname + location.search);
    }
    document.title = "Benchmark internacional | Apoyo a MIPYMES";
    if (scroll) document.querySelector(".discovery").scrollIntoView({ behavior: "smooth" });
  }

  function detailBreadcrumb(label, institution) {
    return `
      <button type="button" data-home>Inicio</button>
      ${institution ? `<span><button type="button" data-institution="${escapeHTML(institution)}">${escapeHTML(institution)}</button></span>` : ""}
      <span>${escapeHTML(label)}</span>
    `;
  }

  function openRecord(id, updateHash = true) {
    const record = records.find((item) => item.id === id);
    if (!record) return showExplorer();
    explorerView.hidden = true;
    detailView.hidden = false;
    if (updateHash) history.pushState(null, "", `#registro-${record.id}`);
    document.title = `${record.instrument} | Benchmark internacional`;
    el("breadcrumbs").innerHTML = detailBreadcrumb(record.program, record.institution);
    el("detailContent").innerHTML = `
      <article class="detail-hero">
        <div>
          <p class="eyebrow">${escapeHTML(record.institution)}</p>
          <h1>${escapeHTML(record.program)}</h1>
          <p>${escapeHTML(record.mechanism)}</p>
        </div>
        <div class="detail-facts">
          <div><strong>País o región</strong><span>${escapeHTML(record.country)}</span></div>
          <div><strong>Categoría principal</strong><span>${escapeHTML(shortCategory(record))}</span></div>
        </div>
      </article>
      <div class="detail-layout">
        <div>
          <article class="detail-card">
            <p class="kicker">Instrumento o herramienta</p>
            <h2>${escapeHTML(record.instrument)}</h2>
            <p>${escapeHTML(record.instrumentDescription)}</p>
          </article>
          <article class="detail-card">
            <p class="kicker">Justificación y mecanismo operativo</p>
            <h3>Cómo funciona</h3>
            <p>${escapeHTML(record.mechanism)}</p>
          </article>
        </div>
        <aside>
          <article class="detail-card problem-card">
            <p class="kicker">Problema que busca resolver</p>
            <h3>${escapeHTML(record.problem)}</h3>
            <p>${escapeHTML(record.problemDescription)}</p>
          </article>
          <article class="detail-card">
            <p class="kicker">Categoría principal de intervención</p>
            <h3>${escapeHTML(shortCategory(record))}</h3>
            <p>${escapeHTML(record.category)}</p>
          </article>
        </aside>
      </div>
      <button class="back-button" type="button" data-institution="${escapeHTML(record.institution)}">Ver todos los programas de esta institución</button>
    `;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openInstitution(name, updateHash = true) {
    const institutionRecords = records.filter((record) => record.institution === name);
    if (!institutionRecords.length) return showExplorer();
    const first = institutionRecords[0];
    explorerView.hidden = true;
    detailView.hidden = false;
    const encoded = encodeURIComponent(name);
    if (updateHash) history.pushState(null, "", `#institucion-${encoded}`);
    document.title = `${name} | Benchmark internacional`;
    el("breadcrumbs").innerHTML = detailBreadcrumb(name, "");
    el("detailContent").innerHTML = `
      <article class="detail-hero">
        <div>
          <p class="eyebrow">Institución</p>
          <h1>${escapeHTML(name)}</h1>
          <p>Programas e instrumentos registrados en la Hoja 5 del benchmark.</p>
        </div>
        <div class="detail-facts">
          <div><strong>País o región</strong><span>${escapeHTML(first.country)}</span></div>
          <div><strong>Registros</strong><span>${institutionRecords.length}</span></div>
        </div>
      </article>
      <div class="section-heading">
        <div>
          <p class="eyebrow">Programas e instrumentos</p>
          <h2>${institutionRecords.length} experiencias</h2>
        </div>
      </div>
      <div class="institution-programs">${institutionRecords.map(cardTemplate).join("")}</div>
      <button class="back-button" type="button" data-home>Volver a explorar</button>
    `;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleHash() {
    if (location.hash.startsWith("#registro-")) {
      openRecord(location.hash.replace("#registro-", ""), false);
    } else if (location.hash.startsWith("#institucion-")) {
      openInstitution(decodeURIComponent(location.hash.replace("#institucion-", "")), false);
    } else {
      showExplorer();
    }
  }

  document.addEventListener("click", (event) => {
    const recordButton = event.target.closest("[data-record]");
    if (recordButton) return openRecord(recordButton.dataset.record);
    const institutionButton = event.target.closest("[data-institution]");
    if (institutionButton) return openInstitution(institutionButton.dataset.institution);
    if (event.target.closest("[data-home]")) return showExplorer({ scroll: true });
    const countryButton = event.target.closest("[data-country]");
    if (countryButton) return setCountry(countryButton.dataset.country);
    const clearButton = event.target.closest("[data-clear]");
    if (clearButton) {
      state[clearButton.dataset.clear] = "";
      syncControls();
      renderResults();
    }
  });

  document.addEventListener("keydown", (event) => {
    const countryPoint = event.target.closest?.(".map-point[data-country]");
    if (countryPoint && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      setCountry(countryPoint.dataset.country);
    }
  });

  el("searchInput").addEventListener("input", (event) => { state.query = event.target.value; renderResults(); });
  el("institutionFilter").addEventListener("change", (event) => { state.institution = event.target.value; renderResults(); });
  el("categoryFilter").addEventListener("change", (event) => { state.category = event.target.value; renderResults(); });
  el("problemFilter").addEventListener("change", (event) => { state.problem = event.target.value; renderResults(); });
  el("sortSelect").addEventListener("change", (event) => { state.sort = event.target.value; renderResults(); });
  el("clearFilters").addEventListener("click", resetFilters);
  el("homeButton").addEventListener("click", () => showExplorer());
  el("exploreButton").addEventListener("click", () => showExplorer({ scroll: true }));
  window.addEventListener("hashchange", handleHash);

  populateFilters();
  renderStats();
  syncControls();
  renderResults();
  handleHash();
})();
