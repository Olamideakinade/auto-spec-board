const defaultVehicles = [
    {
        id: "v1",
        make: "Porsche",
        model: "911 GT3",
        year: 2023,
        bodyStyle: "Coupe",
        price: 223400,
        hp: 502,
        engine: "4.0L Naturally Aspirated Flat-6",
        transmission: "7-Speed PDK"
    },
    {
        id: "v2",
        make: "BMW",
        model: "M3 Competition",
        year: 2024,
        bodyStyle: "Sedan",
        price: 84300,
        hp: 503,
        engine: "3.0L Twin-Turbocharged I6",
        transmission: "8-Speed Automatic"
    },
    {
        id: "v3",
        make: "Rivian",
        model: "R1T Quad-Motor",
        year: 2024,
        bodyStyle: "Truck",
        price: 87000,
        hp: 835,
        engine: "Quad Electric Motors",
        transmission: "1-Speed Direct-Drive"
    },
    {
        id: "v4",
        make: "Chevrolet",
        model: "Corvette Z06",
        year: 2024,
        bodyStyle: "Coupe",
        price: 112700,
        hp: 670,
        engine: "5.5L Naturally Aspirated V8",
        transmission: "8-Speed Dual-Clutch"
    },
    {
        id: "v5",
        make: "Lucid",
        model: "Air Sapphire",
        year: 2024,
        bodyStyle: "Sedan",
        price: 249000,
        hp: 1234,
        engine: "Tri-Motor Electric",
        transmission: "1-Speed Direct-Drive"
    },
    {
        id: "v6",
        make: "Ferrari",
        model: "296 GTB",
        year: 2023,
        bodyStyle: "Coupe",
        price: 342200,
        hp: 819,
        engine: "3.0L Twin-Turbo V6 Hybrid",
        transmission: "8-Speed Dual-Clutch"
    }
];

let vehicles = [];
let currentFilter = "all";
let currentSearch = "";
let currentSort = "default";

const STORAGE_KEY = "autospec_board_vehicles_v12";

document.addEventListener("DOMContentLoaded", () => {
    loadVehicles();
    setupEventListeners();
    render();
});

function loadVehicles() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            vehicles = JSON.parse(stored);
        } else {
            vehicles = [...defaultVehicles];
            saveVehicles();
        }
    } catch (e) {
        console.error("Failed to load storage, falling back to defaults.", e);
        vehicles = [...defaultVehicles];
    }
}

function saveVehicles() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
    } catch (e) {
        console.error("Failed to persist state.", e);
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            currentSearch = e.target.value.toLowerCase().trim();
            render();
        });
    }

    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            filterButtons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            currentFilter = e.target.dataset.filter;
            render();
        });
    });

    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            currentSort = e.target.value;
            render();
        });
    }

    const addBtn = document.getElementById("btn-add-vehicle");
    const modal = document.getElementById("vehicle-modal");
    const closeBtn = document.getElementById("close-modal");
    const cancelBtn = document.getElementById("cancel-modal");

    if (addBtn && modal) {
        addBtn.addEventListener("click", () => modal.classList.add("open"));
    }
    if (closeBtn && modal) {
        closeBtn.addEventListener("click", () => modal.classList.remove("open"));
    }
    if (cancelBtn && modal) {
        cancelBtn.addEventListener("click", () => modal.classList.remove("open"));
    }

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("open");
        }
    });

    const form = document.getElementById("vehicle-form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const newVeh = {
                id: "v_" + Date.now(),
                make: document.getElementById("make").value.trim(),
                model: document.getElementById("model").value.trim(),
                year: parseInt(document.getElementById("year").value, 10),
                bodyStyle: document.getElementById("bodyStyle").value,
                price: parseFloat(document.getElementById("price").value),
                hp: parseInt(document.getElementById("hp").value, 10),
                engine: document.getElementById("engine").value.trim(),
                transmission: document.getElementById("transmission").value.trim()
            };

            vehicles.unshift(newVeh);
            saveVehicles();
            form.reset();
            modal.classList.remove("open");
            render();
        });
    }

    const exportJsonBtn = document.getElementById("btn-export-json");
    if (exportJsonBtn) {
        exportJsonBtn.addEventListener("click", () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vehicles, null, 2));
            const dlAnchor = document.createElement("a");
            dlAnchor.setAttribute("href", dataStr);
            dlAnchor.setAttribute("download", "auto-specs.json");
            document.body.appendChild(dlAnchor);
            dlAnchor.click();
            dlAnchor.remove();
        });
    }

    const resetBtn = document.getElementById("btn-reset");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (confirm("Reset board to default factory specifications?")) {
                vehicles = [...defaultVehicles];
                saveVehicles();
                render();
            }
        });
    }
}

function deleteVehicle(id) {
    if (confirm("Are you sure you want to remove this specification?")) {
        vehicles = vehicles.filter(v => v.id !== id);
        saveVehicles();
        render();
    }
}

function render() {
    const grid = document.getElementById("vehicle-grid");
    const countSpan = document.getElementById("vehicle-count");
    if (!grid) return;

    let filtered = vehicles.filter(v => {
        const matchesFilter = currentFilter === "all" || v.bodyStyle.toLowerCase() === currentFilter.toLowerCase();
        const searchStr = `${v.make} ${v.model} ${v.engine} ${v.transmission}`.toLowerCase();
        const matchesSearch = !currentSearch || searchStr.includes(currentSearch);
        return matchesFilter && matchesSearch;
    });

    if (currentSort === "hp-desc") {
        filtered.sort((a, b) => b.hp - a.hp);
    } else if (currentSort === "price-desc") {
        filtered.sort((a, b) => b.price - a.price);
    } else if (currentSort === "price-asc") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === "make-asc") {
        filtered.sort((a, b) => a.make.localeCompare(b.make));
    }

    if (countSpan) {
        countSpan.textContent = `${filtered.length} vehicle${filtered.length === 1 ? "" : "s"} found`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>No specifications match your query</h3>
                <p>Try refining your search parameters or filter options.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(v => `
        <article class="vehicle-card">
            <div class="card-header">
                <span class="badge badge-style">${v.bodyStyle}</span>
                <span class="vehicle-year">${v.year}</span>
            </div>
            <div class="card-body">
                <h2 class="vehicle-title">${v.make} <strong>${v.model}</strong></h2>
                <div class="spec-grid">
                    <div class="spec-item">
                        <span class="spec-label">Horsepower</span>
                        <span class="spec-value highlight-hp">${v.hp} HP</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">MSRP</span>
                        <span class="spec-value highlight-price">$${v.price.toLocaleString()}</span>
                    </div>
                </div>
                <div class="spec-details">
                    <div class="detail-row">
                        <span class="detail-label">Engine</span>
                        <span class="detail-val">${v.engine}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Transmission</span>
                        <span class="detail-val">${v.transmission}</span>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn-delete" onclick="deleteVehicle('${v.id}')" title="Remove Specification">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    <span>Remove</span>
                </button>
            </div>
        </article>
    `).join("");
}
