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
        engine: "Quad-Motor Electric",
        transmission: "Single-Speed Direct-Drive"
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
        transmission: "Single-Speed Direct-Drive"
    },
    {
        id: "v6",
        make: "Lamborghini",
        model: "Huracán Sterrato",
        year: 2023,
        bodyStyle: "Coupe",
        price: 278000,
        hp: 602,
        engine: "5.2L Naturally Aspirated V10",
        transmission: "7-Speed Dual-Clutch"
    }
];

class VehicleManager {
    constructor() {
        this.vehicles = this.loadVehicles();
        this.initElements();
        this.bindEvents();
        this.render();
    }

    loadVehicles() {
        const stored = localStorage.getItem('auto_spec_vehicles');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse stored vehicles:', e);
            }
        }
        return defaultVehicles;
    }

    saveVehicles() {
        localStorage.setItem('auto_spec_vehicles', JSON.stringify(this.vehicles));
    }

    initElements() {
        this.vehicleGrid = document.getElementById('vehicle-grid');
        this.searchInput = document.getElementById('search-input');
        this.filterBody = document.getElementById('filter-body');
        this.sortSelect = document.getElementById('sort-select');
        this.emptyState = document.getElementById('empty-state');
        
        this.modal = document.getElementById('vehicle-modal');
        this.btnAddVehicle = document.getElementById('btn-add-vehicle');
        this.btnCloseModal = document.getElementById('btn-close-modal');
        this.btnCancel = document.getElementById('btn-cancel');
        this.vehicleForm = document.getElementById('vehicle-form');
        this.btnExport = document.getElementById('btn-export');
    }

    bindEvents() {
        this.searchInput.addEventListener('input', () => this.render());
        this.filterBody.addEventListener('change', () => this.render());
        this.sortSelect.addEventListener('change', () => this.render());

        this.btnAddVehicle.addEventListener('click', () => this.toggleModal(true));
        this.btnCloseModal.addEventListener('click', () => this.toggleModal(false));
        this.btnCancel.addEventListener('click', () => this.toggleModal(false));
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.toggleModal(false);
        });

        this.vehicleForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.btnExport.addEventListener('click', () => this.exportData());
    }

    toggleModal(show) {
        if (show) {
            this.modal.classList.remove('hidden');
            this.vehicleForm.reset();
        } else {
            this.modal.classList.add('hidden');
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const newVehicle = {
            id: 'v_' + Date.now(),
            make: document.getElementById('make').value.trim(),
            model: document.getElementById('model').value.trim(),
            year: parseInt(document.getElementById('year').value, 10),
            bodyStyle: document.getElementById('bodyStyle').value,
            price: parseFloat(document.getElementById('price').value),
            hp: parseInt(document.getElementById('hp').value, 10),
            engine: document.getElementById('engine').value.trim(),
            transmission: document.getElementById('transmission').value.trim()
        };

        this.vehicles.unshift(newVehicle);
        this.saveVehicles();
        this.toggleModal(false);
        this.render();
    }

    deleteVehicle(id) {
        if (confirm('Are you sure you want to remove this vehicle specification?')) {
            this.vehicles = this.vehicles.filter(v => v.id !== id);
            this.saveVehicles();
            this.render();
        }
    }

    exportData() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.vehicles, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `auto_specs_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    }

    getFilteredVehicles() {
        const query = this.searchInput.value.toLowerCase().trim();
        const bodyFilter = this.filterBody.value;
        const sortValue = this.sortSelect.value;

        let result = this.vehicles.filter(v => {
            const matchesSearch = 
                v.make.toLowerCase().includes(query) ||
                v.model.toLowerCase().includes(query) ||
                v.engine.toLowerCase().includes(query) ||
                v.transmission.toLowerCase().includes(query);
            const matchesBody = bodyFilter === '' || v.bodyStyle === bodyFilter;
            return matchesSearch && matchesBody;
        });

        if (sortValue === 'price-asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortValue === 'price-desc') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortValue === 'hp-desc') {
            result.sort((a, b) => b.hp - a.hp);
        } else if (sortValue === 'year-desc') {
            result.sort((a, b) => b.year - a.year);
        }

        return result;
    }

    render() {
        const filtered = this.getFilteredVehicles();
        this.vehicleGrid.innerHTML = '';

        if (filtered.length === 0) {
            this.emptyState.classList.remove('hidden');
            return;
        }

        this.emptyState.classList.add('hidden');

        filtered.forEach(v => {
            const card = document.createElement('div');
            card.className = 'vehicle-card';
            card.innerHTML = `
                <div class="card-header">
                    <div class="vehicle-title">
                        <h3>${v.year} ${v.make} ${v.model}</h3>
                        <p class="vehicle-subtitle">Vehicle Specification Record</p>
                    </div>
                    <span class="badge">${v.bodyStyle}</span>
                </div>
                <div class="card-specs">
                    <div class="spec-item">
                        <div class="spec-label">Horsepower</div>
                        <div class="spec-value">${v.hp} HP</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Transmission</div>
                        <div class="spec-value">${v.transmission}</div>
                    </div>
                </div>
                <div class="card-details">
                    <div><strong>Engine:</strong> ${v.engine}</div>
                </div>
                <div class="card-footer">
                    <div class="vehicle-price">${this.formatCurrency(v.price)}</div>
                    <button class="btn-danger-subtle" data-id="${v.id}">Remove</button>
                </div>
            `;
            
            const deleteBtn = card.querySelector('.btn-danger-subtle');
            deleteBtn.addEventListener('click', () => this.deleteVehicle(v.id));

            this.vehicleGrid.appendChild(card);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.vehicleManager = new VehicleManager();
});
