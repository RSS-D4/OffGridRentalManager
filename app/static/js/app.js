// Navigation and page loading functions
function loadDashboard() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Dashboard</h2>
        <div class="chart-container">
            <canvas id="dashboardChart"></canvas>
        </div>
        <div class="dashboard-stats">
            <h3>Recent Activity</h3>
            <div id="recentActivity"></div>
        </div>
    `;

    // Load dashboard data
    fetch('/api/dashboard/stats')
        .then(response => response.json())
        .then(data => {
            createDashboardChart(data);
        })
        .catch(error => {
            console.error('Error loading dashboard:', error);
            app.innerHTML += '<p class="error">Error loading dashboard data</p>';
        });
}

function loadCustomers() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Customer Management</h2>
        <button onclick="loadAddCustomerForm()" class="add-button">Add New Customer</button>
        <div id="customersList">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>City</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="customersTableBody">
                    <tr><td colspan="4">Loading customers...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    // Load customers data
    fetch('/api/customers')
        .then(response => response.json())
        .then(customers => {
            const tbody = document.getElementById('customersTableBody');
            if (tbody) {
                tbody.innerHTML = customers.map(customer => `
                    <tr>
                        <td>${customer.first_name} ${customer.middle_name || ''} ${customer.family_name}</td>
                        <td>${customer.phone}</td>
                        <td>${customer.city || 'N/A'}</td>
                        <td>
                            <button onclick="viewCustomerDetails(${customer.id})">View Details</button>
                            <button onclick="editCustomer(${customer.id})">Edit</button>
                        </td>
                    </tr>
                `).join('');
            }
        })
        .catch(error => {
            console.error('Error loading customers:', error);
            const tbody = document.getElementById('customersTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="4">Error loading customers</td></tr>';
            }
        });
}

function loadAddCustomerForm() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Add New Customer</h2>
        <form id="addCustomerForm" enctype="multipart/form-data">
            <div class="form-group">
                <label for="first_name">First Name:</label>
                <input type="text" id="first_name" name="first_name" required>
            </div>
            <div class="form-group">
                <label for="middle_name">Middle Name:</label>
                <input type="text" id="middle_name" name="middle_name">
            </div>
            <div class="form-group">
                <label for="family_name">Family Name:</label>
                <input type="text" id="family_name" name="family_name" required>
            </div>
            <div class="form-group">
                <label for="phone">Phone Number:</label>
                <input type="tel" id="phone" name="phone" required>
            </div>
            <div class="form-group">
                <label for="address">Address: (Optional)</label>
                <input type="text" id="address" name="address">
            </div>
            <div class="form-group">
                <label for="city">City:</label>
                <input type="text" id="city" name="city">
            </div>
            <div class="form-group">
                <label for="date_of_birth">Date of Birth:</label>
                <input type="date" id="date_of_birth" name="date_of_birth" required>
            </div>
            <div class="form-group">
                <label for="city_of_birth">City of Birth:</label>
                <input type="text" id="city_of_birth" name="city_of_birth" required>
            </div>
            <div class="form-group">
                <label for="id_type">ID Type:</label>
                <select id="id_type" name="id_type" required>
                    <option value="">Select ID Type</option>
                    <option value="passport">Passport</option>
                    <option value="national_id">National ID</option>
                    <option value="drivers_license">Driver's License</option>
                </select>
            </div>
            <div class="form-group">
                <label for="id_number">ID Number:</label>
                <input type="text" id="id_number" name="id_number" required>
            </div>

            <!-- Optional Photo Uploads -->
            <div class="form-group">
                <label for="selfie_photo">Selfie Photo (Optional):</label>
                <input type="file" id="selfie_photo" name="selfie_photo" accept="image/*">
                <div id="selfie_preview" class="photo-preview"></div>
            </div>
            <div class="form-group">
                <label for="id_photo">ID Photo (Optional):</label>
                <input type="file" id="id_photo" name="id_photo" accept="image/*">
                <div id="id_preview" class="photo-preview"></div>
            </div>
            <div class="form-group">
                <label for="bill_photo">Bill Photo (Optional):</label>
                <input type="file" id="bill_photo" name="bill_photo" accept="image/*">
                <div id="bill_preview" class="photo-preview"></div>
            </div>

            <button type="submit">Add Customer</button>
            <button type="button" onclick="loadCustomers()">Cancel</button>
        </form>
    `;

    // Add photo preview functionality
    ['selfie_photo', 'id_photo', 'bill_photo'].forEach(id => {
        const input = document.getElementById(id);
        const preview = document.getElementById(id + '_preview');
        if (input && preview) {
            input.addEventListener('change', function(e) {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        preview.innerHTML = `<img src="${e.target.result}" class="preview-image">`;
                    };
                    reader.readAsDataURL(this.files[0]);
                }
            });
        }
    });

    // Handle form submission
    const form = document.getElementById('addCustomerForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            try {
                const response = await fetch('/api/customers', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Customer added successfully!');
                    loadCustomers();
                } else {
                    alert(`Failed to add customer: ${result.error}`);
                }
            } catch (error) {
                console.error('Error adding customer:', error);
                alert('Failed to add customer. Please try again.');
            }
        });
    }
}

function viewCustomerDetails(customerId) {
    fetch(`/api/customers/${customerId}`)
        .then(response => response.json())
        .then(customer => {
            const app = document.getElementById('app');
            app.innerHTML = `
                <h2>Customer Details</h2>
                <div class="customer-details">
                    <p><strong>Name:</strong> ${customer.first_name} ${customer.middle_name || ''} ${customer.family_name}</p>
                    <p><strong>Phone:</strong> ${customer.phone}</p>
                    <p><strong>Address:</strong> ${customer.address || 'N/A'}</p>
                    <p><strong>City:</strong> ${customer.city || 'N/A'}</p>
                    <p><strong>Date of Birth:</strong> ${customer.date_of_birth}</p>
                    <p><strong>City of Birth:</strong> ${customer.city_of_birth}</p>
                    <p><strong>ID Type:</strong> ${customer.id_type}</p>
                    <p><strong>ID Number:</strong> ${customer.id_number}</p>

                    <div class="photos-section">
                        <h3>Photos</h3>
                        ${customer.has_selfie ? `
                            <div class="photo-container">
                                <h4>Selfie Photo</h4>
                                <img src="/api/customers/${customer.id}/photos/selfie" alt="Selfie Photo" class="customer-photo">
                            </div>
                        ` : ''}
                        ${customer.has_id_photo ? `
                            <div class="photo-container">
                                <h4>ID Photo</h4>
                                <img src="/api/customers/${customer.id}/photos/id" alt="ID Photo" class="customer-photo">
                            </div>
                        ` : ''}
                        ${customer.has_bill_photo ? `
                            <div class="photo-container">
                                <h4>Bill Photo</h4>
                                <img src="/api/customers/${customer.id}/photos/bill" alt="Bill Photo" class="customer-photo">
                            </div>
                        ` : ''}
                    </div>
                </div>
                <button onclick="loadCustomers()">Back to Customers</button>
                <button onclick="editCustomer(${customer.id})">Edit Customer</button>
            `;
        })
        .catch(error => {
            console.error('Error loading customer details:', error);
            alert('Failed to load customer details. Please try again.');
        });
}

async function editCustomer(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}`);
        const customer = await response.json();

        const app = document.getElementById('app');
        app.innerHTML = `
            <h2>Edit Customer</h2>
            <form id="editCustomerForm" enctype="multipart/form-data">
                <div class="form-group">
                    <label for="first_name">First Name:</label>
                    <input type="text" id="first_name" name="first_name" value="${customer.first_name}" required>
                </div>
                <div class="form-group">
                    <label for="middle_name">Middle Name:</label>
                    <input type="text" id="middle_name" name="middle_name" value="${customer.middle_name || ''}">
                </div>
                <div class="form-group">
                    <label for="family_name">Family Name:</label>
                    <input type="text" id="family_name" name="family_name" value="${customer.family_name}" required>
                </div>
                <div class="form-group">
                    <label for="phone">Phone:</label>
                    <input type="tel" id="phone" name="phone" value="${customer.phone}" required>
                </div>
                <div class="form-group">
                    <label for="address">Address:</label>
                    <input type="text" id="address" name="address" value="${customer.address || ''}">
                </div>
                <div class="form-group">
                    <label for="city">City:</label>
                    <input type="text" id="city" name="city" value="${customer.city || ''}">
                </div>
                <div class="form-group">
                    <label for="date_of_birth">Date of Birth:</label>
                    <input type="date" id="date_of_birth" name="date_of_birth" value="${customer.date_of_birth}" required>
                </div>
                <div class="form-group">
                    <label for="city_of_birth">City of Birth:</label>
                    <input type="text" id="city_of_birth" name="city_of_birth" value="${customer.city_of_birth}" required>
                </div>
                <div class="form-group">
                    <label for="id_type">ID Type:</label>
                    <select id="id_type" name="id_type" required>
                        <option value="passport" ${customer.id_type === 'passport' ? 'selected' : ''}>Passport</option>
                        <option value="national_id" ${customer.id_type === 'national_id' ? 'selected' : ''}>National ID</option>
                        <option value="drivers_license" ${customer.id_type === 'drivers_license' ? 'selected' : ''}>Driver's License</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="id_number">ID Number:</label>
                    <input type="text" id="id_number" name="id_number" value="${customer.id_number}" required>
                </div>

                <!-- Photo Upload Fields -->
                <div class="form-group">
                    <label for="selfie_photo">Update Selfie Photo:</label>
                    <input type="file" id="selfie_photo" name="selfie_photo" accept="image/*">
                    <div id="selfie_preview" class="photo-preview"></div>
                </div>
                <div class="form-group">
                    <label for="id_photo">Update ID Photo:</label>
                    <input type="file" id="id_photo" name="id_photo" accept="image/*">
                    <div id="id_preview" class="photo-preview"></div>
                </div>
                <div class="form-group">
                    <label for="bill_photo">Update Bill Photo:</label>
                    <input type="file" id="bill_photo" name="bill_photo" accept="image/*">
                    <div id="bill_preview" class="photo-preview"></div>
                </div>

                <button type="submit">Update Customer</button>
                <button type="button" onclick="loadCustomers()">Cancel</button>
            </form>
        `;

        // Add photo preview functionality
        ['selfie_photo', 'id_photo', 'bill_photo'].forEach(id => {
            const input = document.getElementById(id);
            const preview = document.getElementById(id + '_preview');
            if (input && preview) {
                input.addEventListener('change', function(e) {
                    if (this.files && this.files[0]) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            preview.innerHTML = `<img src="${e.target.result}" class="preview-image">`;
                        };
                        reader.readAsDataURL(this.files[0]);
                    }
                });
            }
        });

        const form = document.getElementById('editCustomerForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            try {
                const response = await fetch(`/api/customers/${customerId}`, {
                    method: 'PUT',
                    body: formData
                });

                if (response.ok) {
                    alert('Customer updated successfully!');
                    loadCustomers();
                } else {
                    const errorData = await response.json();
                    alert(`Failed to update customer: ${errorData.error}`);
                }
            } catch (error) {
                console.error('Error updating customer:', error);
                alert('Failed to update customer. Please try again.');
            }
        });
    } catch (error) {
        console.error('Error fetching customer details:', error);
        alert('Failed to load customer details. Please try again.');
    }
}

function loadBatteryRentals() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Battery Rentals</h2>
        <div class="button-group">
            <button onclick="newRental()" class="add-button">New Rental</button>
            <button onclick="manageBatteries()" class="manage-button">Manage Batteries</button>
        </div>
        <div id="rentalsList">
            <table>
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Battery/Service</th>
                        <th>Rented At</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="rentalsTableBody">
                    <tr><td colspan="5">Loading rentals...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    // Load rentals data
    fetch('/api/rentals')
        .then(response => response.json())
        .then(rentals => {
            const tbody = document.getElementById('rentalsTableBody');
            if (tbody) {
                if (rentals.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5">No rentals found</td></tr>';
                    return;
                }
                tbody.innerHTML = rentals.map(rental => `
                    <tr>
                        <td>${rental.customer_name}</td>
                        <td>${rental.battery_name}</td>
                        <td>${new Date(rental.rented_at).toLocaleString()}</td>
                        <td>${rental.returned_at ? 'Returned' : 'Active'}</td>
                        <td>
                            <button onclick="viewRental(${rental.id})">View</button>
                            ${!rental.returned_at ? `<button onclick="returnRental(${rental.id})">Return</button>` : ''}
                        </td>
                    </tr>
                `).join('');
            }
        })
        .catch(error => {
            console.error('Error loading rentals:', error);
            const tbody = document.getElementById('rentalsTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="5">Error loading rentals</td></tr>';
            }
        });
}

function newRental() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>New Battery Rental</h2>
        <form id="newRentalForm">
            <div class="form-group">
                <label for="customer">Select Customer:</label>
                <select id="customer" name="customer_id" required>
                    <option value="">Select a customer</option>
                </select>
            </div>
            <div class="form-group">
                <label for="battery_type">Select Battery/Service:</label>
                <select id="battery_type" name="battery_type_id" required>
                    <option value="">Select a battery or service</option>
                </select>
            </div>
            <div class="form-group" id="batteryUnitGroup" style="display: none;">
                <label for="battery">Select Battery Unit:</label>
                <select id="battery" name="battery_id" required>
                    <option value="">Select a battery unit</option>
                </select>
            </div>
            <button type="submit">Create Rental</button>
            <button type="button" onclick="loadBatteryRentals()">Cancel</button>
        </form>
    `;

    // Load customers
    fetch('/api/customers')
        .then(response => response.json())
        .then(customers => {
            const select = document.getElementById('customer');
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = `${customer.first_name} ${customer.family_name} - ${customer.phone}`;
                select.appendChild(option);
            });
        });

    // Load battery types
    fetch('/api/battery-types')
        .then(response => response.json())
        .then(batteryTypes => {
            const select = document.getElementById('battery_type');
            batteryTypes.forEach(type => {
                if (type.type === 'charging' || type.available_units > 0) {
                    const option = document.createElement('option');
                    option.value = type.id;
                    option.textContent = `${type.name}${type.type === 'battery' ? ` (${type.available_units} available)` : ''}`;
                    select.appendChild(option);
                }
            });
        });

    // Handle battery type selection
    const batteryTypeSelect = document.getElementById('battery_type');
    const batteryUnitGroup = document.getElementById('batteryUnitGroup');
    const batterySelect = document.getElementById('battery');

    batteryTypeSelect.addEventListener('change', async () => {
        const selectedTypeId = batteryTypeSelect.value;
        if (!selectedTypeId) {
            batteryUnitGroup.style.display = 'none';
            return;
        }

        // Get the battery type details
        const response = await fetch('/api/battery-types');
        const types = await response.json();
        const selectedType = types.find(t => t.id === parseInt(selectedTypeId));

        if (selectedType && selectedType.type === 'battery') {
            // Load available batteries for this type
            const batteriesResponse = await fetch('/api/batteries');
            const batteries = await batteriesResponse.json(); //Corrected this line
            const availableBatteries = batteries.filter(b => 
                b.type_id === parseInt(selectedTypeId) && b.status === 'available'
            );

            batterySelect.innerHTML = '<option value="">Select a battery unit</option>';
            availableBatteries.forEach(battery => {
                const option = document.createElement('option');
                option.value = battery.id;
                option.textContent = `Unit #${battery.unit_number}`;
                batterySelect.appendChild(option);
            });

            batteryUnitGroup.style.display = 'block';
            batterySelect.required = true;
        } else {
            batteryUnitGroup.style.display = 'none';
            batterySelect.required = false;
            batterySelect.value = '';
        }
    });

    // Handle form submission
    const form = document.getElementById('newRentalForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            customer_id: parseInt(form.customer_id.value),
            battery_id: form.battery_id.value ? parseInt(form.battery_id.value) : null
        };

        try {
            const response = await fetch('/api/rentals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Rental created successfully!');
                loadBatteryRentals();
            } else {
                alert(`Failed to create rental: ${result.error}`);
            }
        } catch (error) {
            console.error('Error creating rental:', error);
            alert('Failed to create rental. Please try again.');
        }
    });
}

function manageBatteries() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Battery Management</h2>
        <button onclick="addBattery()" class="add-button">Add New Battery/Service</button>
        <div id="batteriesList">
            <table>
                <thead>
                    <tr>
                        <th>Brand</th>
                        <th>Type</th>
                        <th>Capacity</th>
                        <th>Unit Number</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="batteriesTableBody">
                    <tr><td colspan="6">Loading batteries...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    loadBatteries();
}

function loadBatteries() {
    fetch('/api/batteries')
        .then(response => response.json())
        .then(batteries => {
            const tbody = document.getElementById('batteriesTableBody');
            if (tbody) {
                if (batteries.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6">No batteries found</td></tr>';
                    return;
                }
                tbody.innerHTML = batteries.map(battery => `
                    <tr>
                        <td>${battery.type_name}</td>
                        <td>${battery.type}</td>
                        <td>${battery.capacity || 'N/A'}</td>
                        <td>${battery.unit_number}</td>
                        <td>${battery.status}</td>
                        <td>
                            <button onclick="updateBatteryStatus(${battery.id}, '${battery.status}')">Update Status</button>
                            <button onclick="deleteBattery(${battery.id})" class="delete-button">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        });
}

function updateBatteryStatus(batteryId, currentStatus) {
    const newStatus = prompt('Enter new status (available, maintenance):', currentStatus);
    if (newStatus === null) return;

    if (!['available', 'maintenance'].includes(newStatus)) {
        alert('Invalid status. Please use "available" or "maintenance"');
        return;
    }

    fetch(`/api/batteries/${batteryId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            alert(`Failed to update status: ${result.error}`);
        } else {
            loadBatteries();
        }
    })
    .catch(error => {
        console.error('Error updating battery status:', error);
        alert('Failed to update status. Please try again.');
    });
}

function deleteBattery(batteryId) {
    if (!confirm('Are you sure you want to delete this battery? This action cannot be undone.')) {
        return;
    }

    fetch(`/api/batteries/${batteryId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            alert(`Failed to delete battery: ${result.error}`);
        } else {
            loadBatteries();
        }
    })
    .catch(error => {
        console.error('Error deleting battery:', error);
        alert('Failed to delete battery. Please try again.');
    });
}

function addBattery() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Add New Battery/Service</h2>
        <form id="addBatteryForm">
            <div class="form-group">
                <label for="name">Brand:</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="type">Type:</label>
                <select id="type" name="type" required>
                    <option value="battery">Battery</option>
                    <option value="charging">Charging Service</option>
                </select>
            </div>
            <div class="form-group" id="capacityGroup">
                <label for="capacity">Capacity (e.g., "250 Wh" or "2.4 kWh"):</label>
                <input type="text" id="capacity" name="capacity">
            </div>
            <div class="form-group" id="quantityGroup">
                <label for="quantity">Number of Units:</label>
                <input type="number" id="quantity" name="quantity" min="0" value="0">
            </div>
            <button type="submit">Add Battery/Service</button>
            <button type="button" onclick="manageBatteries()">Cancel</button>
        </form>
    `;

    const form = document.getElementById('addBatteryForm');
    const typeSelect = document.getElementById('type');
    const quantityGroup = document.getElementById('quantityGroup');
    const capacityGroup = document.getElementById('capacityGroup');

    typeSelect.addEventListener('change', () => {
        const isCharging = typeSelect.value === 'charging';
        quantityGroup.style.display = isCharging ? 'none' : 'block';
        document.getElementById('quantity').required = !isCharging;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            name: form.name.value,
            type: form.type.value,
            capacity: form.capacity.value || null,
            quantity: form.type.value === 'battery' ? parseInt(form.quantity.value) : 0
        };

        try {
            const response = await fetch('/api/battery-types', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Battery/Service added successfully!');
                manageBatteries();
            } else {
                alert(`Failed to add battery/service: ${result.error}`);
            }
        } catch (error) {
            console.error('Error adding battery/service:', error);
            alert('Failed to add battery/service. Please try again.');
        }
    });
}

function updateBatteryQuantity(batteryId, currentQuantity) {
    const newQuantity = prompt('Enter new quantity:', currentQuantity);
    if (newQuantity === null) return;

    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 0) {
        alert('Please enter a valid number (0 or greater)');
        return;
    }

    fetch(`/api/batteries/${batteryId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            alert(`Failed to update quantity: ${result.error}`);
        } else {
            loadBatteries();
        }
    })
    .catch(error => {
        console.error('Error updating battery quantity:', error);
        alert('Failed to update quantity. Please try again.');
    });
}

function loadWaterSales() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Water Sales</h2>
        <button onclick="newWaterSale()" class="add-button">New Sale</button>
        <div id="waterSalesList">
            <table>
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Size (L)</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="waterSalesTableBody">
                    <tr><td colspan="4">Loading water sales...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    // Load water sales data
    fetch('/api/water-sales')
        .then(response => response.json())
        .then(sales => {
            const tbody = document.getElementById('waterSalesTableBody');
            if (tbody) {
                if (sales.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4">No water sales found</td></tr>';
                    return;
                }
                tbody.innerHTML = sales.map(sale => `
                    <tr>
                        <td>${sale.customer_name}</td>
                        <td>${sale.size}</td>
                        <td>${new Date(sale.sold_at).toLocaleString()}</td>
                        <td>
                            <button onclick="viewWaterSale(${sale.id})">View</button>
                        </td>
                    </tr>
                `).join('');
            }
        })
        .catch(error => {
            console.error('Error loading water sales:', error);
            const tbody = document.getElementById('waterSalesTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="4">Error loading water sales</td></tr>';
            }
        });
}

function loadInternetAccess() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Internet Access</h2>
        <button onclick="newInternetAccess()" class="add-button">New Access</button>
        <div id="internetAccessList">
            <table>
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Purchase Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="internetAccessTableBody">
                    <tr><td colspan="4">Loading internet access records...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    // Load internet access data
    fetch('/api/internet-access')
        .then(response => response.json())
        .then(records => {
            const tbody = document.getElementById('internetAccessTableBody');
            if (tbody) {
                if (records.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4">No internet access records found</td></tr>';
                    return;
                }
                tbody.innerHTML = records.map(record => `
                    <tr>
                        <td>${record.customer_name}</td>
                        <td>${new Date(record.purchased_at).toLocaleString()}</td>
                        <td>${record.status}</td>
                        <td>
                            <button onclick="viewInternetAccess(${record.id})">View</button>
                        </td>
                    </tr>
                `).join('');
            }
        })
        .catch(error => {
            console.error('Error loading internet access records:', error);
            const tbody = document.getElementById('internetAccessTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="4">Error loading internet access records</td></tr>';
            }
        });
}

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
    // Set up navigation
    const nav = document.querySelector('nav');
    if (nav) {
        nav.addEventListener('click', (e) => {
            if (e.target.matches('a')) {
                e.preventDefault();
                const page = e.target.dataset.page;
                switch (page) {
                    case 'dashboard':
                        loadDashboard();
                        break;
                    case 'customers':
                        loadCustomers();
                        break;
                    case 'rentals':
                        loadBatteryRentals();                        break;
                    case 'water':
                        loadWaterSales();
                        break;
                    case 'internet':
                        loadInternetAccess();
                        break;
                }
            }
        });
    }

    // Load dashboard by default
    loadDashboard();
});