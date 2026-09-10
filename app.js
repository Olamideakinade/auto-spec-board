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
        model: "R1T Gen 2",
        year: 2025,
        bodyStyle: "Truck",
        price: 79900,
        hp: 850,
        engine: "Quad-Motor Electric",
        transmission: "Direct Drive"
    },
    {
        id: "v4",
        make: "Chevrolet",
        model: "Corvette Z06",
        year: 2024,
        bodyStyle: "Coupe",
        price: 112700,
        hp: 670,
        engine: "5.5L Flat-Plane Crank V8",
        transmission: "8-Speed Dual-Clutch"
    }
];

class VehicleManager {
    constructor() {
        this.vehicles = this.loadVehicles();
        this.filterMake = '';
        this.filterBody = '';
        this.searchQuery = '';
        this.sortBy = 'make-asc';
        this.init();
    }

    loadVehicles() {
        const stored = localStorage.getItem('auto_spec_board_vehicles');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse stored vehicles:', e);
            }
        }
        return [...defaultVehicles];
    }

    saveVehicles() {
        localStorage.setItem('auto_spec_board_vehicles', JSON.stringify(this.vehicles));
        this.updateAnalytics();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.populateMakeFilter();
        this.render();
        this.updateAnalytics();
    }

    cacheDOM() {
        this.gridEl = document.getElementById('vehicle-grid');
        this.searchEl = document.getElementById('search-input');
        this.makeFilterEl = document.getElementById('make-filter');
        this.bodyFilterEl = document.getElementById('body-filter');
        this.sortEl = document.getElementById('sort-select');
        this.formEl = document.getElementById('vehicle-form');
        this.modalEl = document.getElementById('vehicle-modal');
        this.addBtn = document.getElementById('add-vehicle-btn');
        this.closeModalBtn = document.getElementById('close-modal-btn');
        this.exportBtn = document.getElementById('export-btn');
        this.importInput = document.getElementById('import-file');
        
        this.statCount = document.getElementById('stat-count');
        this.statAvgHp = document.getElementById('stat-avg-hp');
        this.statAvgPrice = document.getElementById('stat-avg-price');
    }

    bindEvents() {
        this.searchEl.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase().trim();
            this.render();
        });

        this.makeFilterEl.addEventListener('change', (e) => {
            this.filterMake = e.target.value;
            this.render();
        });

        this.bodyFilterEl.addEventListener('change', (e) => {
            this.filterBody = e.target.value;
            this.render();
        });

        this.sortEl.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.render();
        });

        this.addBtn.addEventListener('click', () => this.openModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        
        this.formEl.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        this.exportBtn.addEventListener('click', () => this.exportData());
        this.importInput.addEventListener('change', (e) => this.importData(e));

        // Keyboard shortcut: Ctrl+K / Cmd+K to focus search
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.searchEl.focus();
            }
        });
    }

    populateMakeFilter() {
        const makes = [...new Set(this.vehicles.map(v => v.make))].sort();
        this.makeFilterEl.innerHTML = '<option value="">All Makes</option>' +
            makes.map(m => `<option value="${m}">${m}</option>`).join('');
    }

    getFilteredAndSortedVehicles() {
        let result = this.vehicles.filter(v => {
            const matchesSearch = !this.searchQuery || 
                v.make.toLowerCase().includes(this.searchQuery) ||
                v.model.toLowerCase().includes(this.searchQuery) ||
                v.engine.toLowerCase().includes(this.searchQuery);
            
            const matchesMake = !this.filterMake || v.make === this.filterMake;
            const matchesBody = !this.filterBody || v.bodyStyle === this.filterBody;

            return matchesSearch && matchesMake && matchesBody;
        });

        result.sort((a, b) => {
            switch (this.sortBy) {
                case 'make-asc':
                    return a.make.localeName ? a.make.localeCompare(b.make) : a.make.localeCompare(b.make);
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'hp-desc':
                    return b.hp - a.hp;
                case 'year-desc':
                    return b.year - a.year;
                default:
                    return 0;
            }
        });

        return result;
    }

    render() {
        const list = this.getFilteredAndSortedVehicles();
        if (list.length === 0) {
            this.gridEl.innerHTML = `
                <div class="no-results">
                    <p>No specifications found matching your criteria.</p>
                </div>
            `;
            return;
        }

        this.gridEl.innerHTML = list.map(v => `
            <div class="spec-card" data-id="${v.id}">
                <div class="card-header">
                    <span class="vehicle-year">${v.year}</span>
                    <span class="vehicle-body">${v.bodyStyle}</span>
                </div>
                <h3 class="vehicle-title">${v.make} ${v.model}</h3>
                <div class="specs-grid">
                    <div class="spec-item">
                        <span class="spec-label">Price</span>
                        <span class="spec-value">$${v.price.toLocaleString()}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Power</span>
                        <span class="spec-value">${v.hp} HP</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Engine</span>
                        <span class="spec-value">${v.engine}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Transmission</span>
                        <span class="spec-value">${v.transmission}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-delete" onclick="vehicleManager.deleteVehicle('${v.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    updateAnalytics() {
        const count = this.vehicles.length;
        if (count === 0) {
            this.statCount.textContent = '0';
            this.statAvgHp.textContent = '0 HP';
            this.statAvgPrice.textContent = '$0';
            return;
        }
        const totalHp = this.vehicles.reduce((acc, v) => acc + v.hp, 0);
        const totalPrince = this.vehicles.reduce((acc, v) => acc + v.price, 0);

        this.statCount.textContent = count;
        this.statAvgHp.textContent = Math.round(totalHp / count) + ' HP';
        this.statAvgPrice.textContent = '$' + Math.round(totalPrince / count).toLocaleString();
    }

    openModal() {
        this.modalEl.classList.add('active');
    }

    closeModal() {
        this.modalEl.classList.remove('active');
        this.formEl.reset();
    }

    handleFormSubmit() {
        const newVehicle = {
            id: 'v_' + Date.now(),
            make: document.getElementById('form-make').value.trim(),
            model: document.getElementById('form-model').value.trim(),
            year: parseInt(document.getElementById('form-year').value, 10),
            bodyStyle: document.getElementById('form-body').value,
            price: parseFloat(document.getElementById('form-price').value),
            hp: parseInt(document.getElementById('form-hp').value, 10),
            engine: document.getElementById('form-engine').value.trim(),
            transmission: document.getElementById('form-trans').value.trim()
        };

        this.vehicles.unshift(newVehicle);
        this.saveVehicles();
        this.populateMakeFilter();
        this.render();
        this.closeModal();
    }

    deleteVehicle(id) {
        if (confirm('Are you sure you want to remove this vehicle specification?')) {
            this.vehicles = this.vehicles.filter(v => v.id !== id);
            this.saveVehicles();
            this.populateMakeFilter();
            this.render();
        }
    }

    exportData() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.vehicles, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "auto_spec_board_backup.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    this.vehicles = imported;
                    this.saveVehicles();
                    this.populateMakeFilter();
                    this.render();
                    alert('Specifications imported successfully.');
                } else {
                    alert('Invalid JSON structure.');
                }
            } catch (err) {
                alert('Failed to parse JSON file.');
            }
            event.target.value = '';
        };
        reader.readAsText(file);
    }
}

let vehicleManager;
document.addEventListener('DOMContentLoaded', () => {
    vehicleManager = new VehicleManager();
});
