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
        transmission: "Single-Speed Direct-Drive"
    }
];

class VehicleManager {
    constructor(vehicles = defaultVehicles) {
        this.vehicles = [...vehicles];
    }

    getAll() {
        return this.vehicles;
    }

    add(vehicle) {
        if (!vehicle.id || !vehicle.make || !vehicle.model) {
            throw new Error("Invalid vehicle specification data.");
        }
        this.vehicles.push(vehicle);
        return this.vehicles;
    }

    remove(id) {
        this.vehicles = this.vehicles.filter(v => v.id !== id);
        return this.vehicles;
    }

    filterByMake(makeQuery) {
        if (!makeQuery) return this.vehicles;
        const q = makeQuery.toLowerCase();
        return this.vehicles.filter(v => v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q));
    }

    sortBy(criterion) {
        const sorted = [...this.vehicles];
        if (criterion === 'hp') {
            sorted.sort((a, b) => b.hp - a.hp);
        } else if (criterion === 'price') {
            sorted.sort((a, b) => a.price - b.price);
        } else if (criterion === 'make') {
            sorted.sort((a, b) => a.make.localeCompare(b.make));
        }
        return sorted;
    }
}

class TestSuite {
    constructor(manager) {
        this.manager = manager;
    }

    runUnitTests() {
        const results = [];
        
        // Test 1: Add vehicle
        try {
            const initialCount = this.manager.getAll().length;
            const testId = 'test_' + Date.now();
            this.manager.add({ id: testId, make: 'TestMake', model: 'TestModel', year: 2025, bodyStyle: 'Coupe', price: 100000, hp: 400, engine: 'V8', transmission: 'Manual' });
            const passed = this.manager.getAll().length === initialCount + 1;
            this.manager.remove(testId);
            results.push({ name: 'Vehicle Addition Unit Test', passed });
        } catch (e) {
            results.push({ name: 'Vehicle Addition Unit Test', passed: false, error: e.message });
        }

        // Test 2: Filter by make
        try {
            const filtered = this.manager.filterByMake('Porsche');
            const passed = filtered.length > 0 && filtered[0].make === 'Porsche';
            results.push({ name: 'Vehicle Filtering Unit Test', passed });
        } catch (e) {
            results.push({ name: 'Vehicle Filtering Unit Test', passed: false, error: e.message });
        }

        // Test 3: Sorting validation
        try {
            const sorted = this.manager.sortBy('hp');
            let passed = true;
            for (let i = 0; i < sorted.length - 1; i++) {
                if (sorted[i].hp < sorted[i+1].hp) {
                    passed = false;
                    break;
                }
            }
            results.push({ name: 'Vehicle Sorting Unit Test', passed });
        } catch (e) {
            results.push({ name: 'Vehicle Sorting Unit Test', passed: false, error: e.message });
        }

        return results;
    }

    runBenchmarks() {
        const benchmarks = [];

        // Benchmark 1: Sorting Performance
        const startSort = performance.now();
        for (let i = 0; i < 1000; i++) {
            this.manager.sortBy('hp');
        }
        const endSort = performance.now();
        benchmarks.push({ name: '1000x Sorting Benchmark', durationMs: (endSort - startSort).toFixed(2) });

        // Benchmark 2: Filtering Performance
        const startFilter = performance.now();
        for (let i = 0; i < 1000; i++) {
            this.manager.filterByMake('BMW');
        }
        const endFilter = performance.now();
        benchmarks.push({ name: '1000x Filtering Benchmark', durationMs: (endFilter - startFilter).toFixed(2) });

        return benchmarks;
    }
}

const vehicleManager = new VehicleManager();
const testSuite = new TestSuite(vehicleManager);

console.log("Auto Spec Board v1.3.0 Initialized with Test Suite.");
