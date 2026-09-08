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
        model: "R1T Dual-Motor",
        year: 2024,
        bodyStyle: "Truck",
        price: 73000,
        hp: 533,
        engine: "Dual-Motor Electric",
        transmission: "Single-Speed Direct-Drive"
    },
    {
        id: "v4",
        make: "Audi",
        model: "RS6 Avant",
        year: 2023,
        bodyStyle: "Wagon",
        price: 125800,
        hp: 591,
        engine: "4.0L Twin-Turbo V8",
        transmission: "8-Speed Tiptronic"
    }
];

let state = {
    vehicles: [],
    comparison: [],
    search: "",
    bodyStyle: "",
    sortBy: "price-asc"
};

const STORAGE_KEY = "autospecboard_data_v1";

function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            state.vehicles = JSON.parse(saved);
        } catch (e) {
            state.vehicles = defaultVehicles;
        }
    } else {
        state.vehicles = defaultVehicles;
        persist();
    }

    setupEventListeners();
    render();
}

function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.vehicles));
}

function setupEventListeners() {
    document.getElementById("search-input").addEventListener("input", (e) => {
        state.search = e.target.value.toLowerCase();
        renderVehicleGrid();
    });

    document.getElementById("body-style-filter").addEventListener("change", (e) => {
        state.bodyStyle = e.target.value;
        renderVehicleGrid();
    });

    document.getElementById("sort-select").addEventListener("change", (e) => {
        state.sortBy = e.target.value;
        renderVehicleGrid();
    });

    document.getElementById("btn-add-vehicle").addEventListener("click", () => {
        document.getElementById("modal-vehicle").classList.remove("hidden");
    });

    document.getElementById("modal-close").addEventListener("click", () => {
        document.getElementById("modal-vehicle").classList.add("hidden");
    });

    document.getElementById("vehicle-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const newVehicle = {
            id: "v_" + Date.now(),
            make: document.getElementById("input-make").value,
            model: document.getElementById("input-model").value,
            year: parseInt(document.getElementById("input-year").value),
            bodyStyle: document.getElementById("input-body").value,
            price: parseFloat(document.getElementById("input-price").value),
            hp: parseInt(document.getElementById("input-hp").value),
            engine: document.getElementById("input-engine").value,
            transmission: document.getElementById("input-transmission").value
        };

        state.vehicles.unshift(newVehicle);
        persist();
        document.getElementById("vehicle-form").reset();
        document.getElementById("modal-vehicle").classList.add("hidden");
        render();
    });

    document.getElementById("btn-compare").addEventListener("click", () => {
        openMatrixModal();
    });

    document.getElementById("matrix-close").addEventListener("click", () => {
        document.getElementById("modal-matrix").classList.add("hidden");
    });

    document.getElementById("btn-export").addEventListener("click", () => {
        exportDataset();
    });
}

function render() {
    renderVehicleGrid();
    renderComparisonTray();
}

function getFilteredAndSortedVehicles() {
    return state.vehicles
        .filter(v => {
            const matchesSearch = `${v.make} ${v.model} ${v.engine}`.toLowerCase().includes(state.search);
            const matchesBody = state.bodyStyle === "" || v.bodyStyle === state.bodyStyle;
            return matchesSearch && matchesBody;
        })
        .sort((a, b) => {
            if (state.sortBy === "price-asc") return a.price - b.price;
            if (state.sortBy === "price-desc") return b.price - a.price;
            if (state.sortBy === "hp-desc") return b.hp - a.hp;
            if (state.sortBy === "year-desc") return b.year - a.year;
            return 0;
        });
}

function renderVehicleGrid() {
    const grid = document.getElementById("vehicle-grid");
    const filtered = getFilteredAndSortedVehicles();

    if (filtered.length === 0) {
        grid.innerHTML = `<p class="placeholder-text">No vehicles found matching criteria.</p>`;
        return;
    }

    grid.innerHTML = filtered.map(v => {
        const isCompared = state.comparison.includes(v.id);
        return `
            <div class="vehicle-card">
                <div class="vehicle-card-header">
                    <div class="vehicle-title">
                        <h3>${v.make} ${v.model}</h3>
                        <span>${v.year} &bull; ${v.bodyStyle}</span>
                    </div>
                    <div class="vehicle-price">$${v.price.toLocaleString()}</div>
                </div>
                <div class="vehicle-specs">
                    <div class="spec-item"><strong>${v.hp} HP</strong> Horsepower</div>
                    <div class="spec-item"><strong>${v.engine}</strong> Engine</div>
                </div>
                <button class="btn ${isCompared ? 'btn-secondary' : 'btn-primary'} btn-full" onclick="toggleComparison('${v.id}')">
                    ${isCompared ? 'Remove from Compare' : 'Add to Compare'}
                </button>
            </div>
        `;
    }).join("");
}

function toggleComparison(id) {
    const index = state.comparison.indexOf(id);
    if (index > -1) {
        state.comparison.splice(index, 1);
    } else {
        if (state.comparison.length >= 4) {
            alert("You can compare a maximum of 4 vehicles simultaneously.");
            return;
        }
        state.comparison.push(id);
    }
    render();
}

function renderComparisonTray() {
    const tray = document.getElementById("comparison-tray");
    const countSpan = document.getElementById("comparison-count");
    const compareBtn = document.getElementById("btn-compare");

    countSpan.textContent = `${state.comparison.length} / 4`;
    compareBtn.disabled = state.comparison.length === 0;

    if (state.comparison.length === 0) {
        tray.innerHTML = `<p class="placeholder-text">Select up to 4 vehicles to compare specs.</p>`;
        return;
    }

    tray.innerHTML = state.comparison.map(id => {
        const v = state.vehicles.find(item => item.id === id);
        if (!v) return "";
        return `
            <div class="comparison-chip">
                <span>${v.make} ${v.model}</span>
                <button class="chip-remove" onclick="toggleComparison('${v.id}')">&times;</button>
            </div>
        `;
    }).join("");
}

function openMatrixModal() {
    const modalBody = document.getElementById("matrix-body");
    const selectedVehicles = state.comparison.map(id => state.vehicles.find(v => v.id === id)).filter(Boolean);

    if (selectedVehicles.length === 0) return;

    const attributes = [
        { label: "Price", key: "price", format: val => `$${val.toLocaleString()}` },
        { label: "Year", key: "year", format: val => val },
        { label: "Body Style", key: "bodyStyle", format: val => val },
        { label: "Horsepower", key: "hp", format: val => `${val} HP` },
        { label: "Engine", key: "engine", format: val => val },
        { label: "Transmission", key: "transmission", format: val => val }
    ];

    let html = `<table class="matrix-table"><thead><tr><th>Specification</th>`;
    selectedVehicles.forEach(v => {
        html += `<th>${v.make} ${v.model}</th>`;
    });
    html += `</tr></thead><tbody>`;

    attributes.forEach(attr => {
        html += `<tr><td>${attr.label}</td>`;
        selectedVehicles.forEach(v => {
            html += `<td>${attr.format(v[attr.key])}</td>`;
        });
        html += `</tr>`;
    });

    html += `</tbody></table>`;
    modalBody.innerHTML = html;

    document.getElementById("modal-matrix").classList.remove("hidden");
}

function exportDataset() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.vehicles, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "autospecboard_inventory.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

document.addEventListener("DOMContentLoaded", init);
