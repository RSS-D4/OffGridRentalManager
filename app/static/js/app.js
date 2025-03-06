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
                        <th>Rental Price</th>
                        <th>Delivery Fee</th>
                        <th>Rented At</th>
                        <th>Return Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="rentalsTableBody">
                    <tr><td colspan="8">Loading rentals...</td></tr>
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
                    tbody.innerHTML = '<tr><td colspan="8">No rentals found</td></tr>';
                    return;
                }
                tbody.innerHTML = rentals.map(rental => `
                    <tr>
                        <td>${rental.customer_name}</td>
                        <td>${rental.battery_name}</td>
                        <td>$${rental.rental_price.toFixed(2)}</td>
                        <td>$${rental.delivery_fee.toFixed(2)}</td>
                        <td>${new Date(rental.rented_at).toLocaleString()}</td>
                        <td>${rental.returned_at ? new Date(rental.returned_at).toLocaleString() : 'N/A'}</td>
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
                tbody.innerHTML = '<tr><td colspan="8">Error loading rentals</td></tr>';
            }
        });
}

async function newRental() {
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
            <div class="form-group">
                <label for="rental_price">Rental Price ($):</label>
                <input type="number" id="rental_price" name="rental_price" min="0" step="0.01" required value="0">
            </div>
            <div class="form-group">
                <label for="delivery_fee">Delivery Fee ($):</label>
                <input type="number" id="delivery_fee" name="delivery_fee" min="0" step="0.01" required value="0">
            </div>
            <button type="submit">Create Rental</button>
            <button type="button" onclick="loadBatteryRentals()">Cancel</button>
        </form>
    `;

    try {
        // Load customers
        const customersResponse = await fetch('/api/customers');
        const customers = await customersResponse.json();
        const customerSelect = document.getElementById('customer');
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = `${customer.first_name} ${customer.family_name} - ${customer.phone}`;
            customerSelect.appendChild(option);
        });

        // Load battery types
        const batteryTypesResponse = await fetch('/api/battery-types');
        const batteryTypes = await batteryTypesResponse.json();
        console.log('Available battery types:', batteryTypes);

        const batteryTypeSelect = document.getElementById('battery_type');
        batteryTypes.forEach(type => {
            if (type.type === 'charging' || type.available_units > 0) {
                const option = document.createElement('option');
                option.value = type.id;
                option.textContent = `${type.name}${type.type === 'battery' ? ` (${type.available_units} available)` : ''}`;
                batteryTypeSelect.appendChild(option);
            }
        });

        // Handle battery type selection
        const batteryUnitGroup = document.getElementById('batteryUnitGroup');
        const batterySelect = document.getElementById('battery');

        batteryTypeSelect.addEventListener('change', async () => {
            const selectedTypeId = batteryTypeSelect.value;
            console.log('Selected battery type ID:', selectedTypeId);

            if (!selectedTypeId) {
                batteryUnitGroup.style.display = 'none';
                return;
            }

            // Get the battery type details
            const selectedType = batteryTypes.find(t => t.id === parseInt(selectedTypeId));
            console.log('Selected battery type:', selectedType);

            if (selectedType && selectedType.type === 'battery') {
                try {
                    // Load available batteries for this type
                    const batteriesResponse = await fetch('/api/batteries');
                    const batteries = await batteriesResponse.json();
                    console.log('Available batteries:', batteries);

                    const availableBatteries = batteries.filter(b =>
                        b.type_id === parseInt(selectedTypeId) && b.status === 'available'
                    );
                    console.log('Filtered available batteries:', availableBatteries);

                    batterySelect.innerHTML = '<option value="">Select a battery unit</option>';
                    availableBatteries.forEach(battery => {
                        const option = document.createElement('option');
                        option.value = battery.id;
                        option.textContent = `Unit #${battery.unit_number}`;
                        batterySelect.appendChild(option);
                    });

                    batteryUnitGroup.style.display = 'block';
                    batterySelect.required = true;
                } catch (error) {
                    console.error('Error loading available batteries:', error);
                    alert('Error loading available batteries. Please try again.');
                }
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
                battery_id: form.battery_id.value ? parseInt(form.battery_id.value) : null,
                rental_price: parseFloat(form.rental_price.value),
                delivery_fee: parseFloat(form.delivery_fee.value)
            };

            try {
                console.log('Submitting rental:', formData);
                const response = await fetch('/api/rentals', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                console.log('Server response:', result);

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
    } catch (error) {
        console.error('Error initializing rental form:', error);
        alert('Error loading form data. Please try again.');
    }
}

function loadWaterSales() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Water Sales</h2>
        <button onclick="newWaterSale()" class="add-button">New Water Sale</button>
        <div id="waterSalesList">
            <table>
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Size</th>
                        <th>Price</th>
                        <th>Sold At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="waterSalesTableBody">
                    <tr><td colspan="5">Loading water sales...</td></tr>
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
                    tbody.innerHTML = '<tr><td colspan="5">No water sales found</td></tr>';
                    return;
                }
                tbody.innerHTML = sales.map(sale => `
                    <tr>
                        <td>${sale.customer_name}</td>
                        <td>${sale.size} liters</td>
                        <td>$${sale.price.toFixed(2)}</td>
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
                tbody.innerHTML = '<tr><td colspan="5">Error loading water sales</td></tr>';
            }
        });
}

function newWaterSale() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>New Water Sale</h2>
        <form id="newWaterSaleForm">
            <div class="form-group">
                <label for="customer">Select Customer:</label>
                <select id="customer" name="customer_id" required>
                    <option value="">Select a customer</option>
                </select>
            </div>
            <div class="form-group">
                <label for="size">Water Size (liters):</label>
                <input type="number" id="size" name="size" min="0.1" step="0.1" required>
            </div>
            <div class="form-group">
                <label for="price">Price ($):</label>
                <input type="number" id="price" name="price" min="0" step="0.01" required>
            </div>
            <button type="submit">Create Sale</button>
            <button type="button" onclick="loadWaterSales()">Cancel</button>
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
        })
        .catch(error => {
            console.error('Error loading customers:', error);
            alert('Error loading customers. Please try again.');
        });

    // Handle form submission
    const form = document.getElementById('newWaterSaleForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            customer_id: parseInt(form.customer_id.value),
            size: parseFloat(form.size.value),
            price: parseFloat(form.price.value)
        };

        try {
            console.log('Submitting water sale:', formData);
            const response = await fetch('/api/water-sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            console.log('Server response:', result);

            if (response.ok) {
                alert('Water sale created successfully!');
                loadWaterSales();
            } else {
                alert(`Failed to create water sale: ${result.error}`);
            }
        } catch (error) {
            console.error('Error creating water sale:', error);
            alert('Failed to create water sale. Please try again.');
        }
    });
}

function returnRental(rentalId) {
    if (!confirm('Are you sure you want to mark this rental as returned?')) {
        return;
    }

    fetch(`/api/rentals/${rentalId}/return`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(result => {
            if (result.error) {
                alert(`Failed to return rental: ${result.error}`);
            } else {
                alert('Rental returned successfully');
                loadBatteryRentals();
            }
        })
        .catch(error => {
            console.error('Error returning rental:', error);
            alert('Failed to return rental. Please try again.');
        });
}

function viewRental(rentalId) {
    // You can implement a detailed view for a specific rental if needed
    alert(`Viewing details for rental ${rentalId}`);
}

function viewWaterSale(saleId) {
    // You can implement a detailed view for a specific water sale if needed
    alert(`Viewing details for water sale ${saleId}`);
}

function loadInternetAccess() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Internet Access</h2>
        <button onclick="newInternetAccess()" class="add-button">New Internet Access</button>
        <div id="internetAccessList">
            <table>
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Purchased At</th>
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
            console.error('Error loading internet accessrecords:', error);
            const tbody = document.getElementById('internetAccessTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="4">Error loading internet access records</td></tr>';
            }
        });
}

function viewInternetAccess(accessId) {
    // You can implement a detailed view for a specific internet access record if needed
    alert(`Viewing details for internet access ${accessId}`);
}

function newInternetAccess() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>New Internet Access</h2>
        <form id="newInternetAccessForm">
            <div class="form-group">
                <label for="customer">Select Customer:</label>
                <select id="customer" name="customer_id" required>
                    <option value="">Select a customer</option>
                </select>
            </div>
            <button type="submit">Create Internet Access</button>
            <button type="button" onclick="loadInternetAccess()">Cancel</button>
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
        })
        .catch(error => {
            console.error('Error loading customers:', error);
            alert('Error loading customers. Please try again.');
        });

    // Handle form submission
    const form = document.getElementById('newInternetAccessForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            customer_id: parseInt(form.customer_id.value)
        };

        try {
            console.log('Submitting internet access:', formData);
            const response = await fetch('/api/internet-access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            console.log('Server response:', result);

            if (response.ok) {
                alert('Internet access created successfully!');
                loadInternetAccess();
            } else {
                alert(`Failed to create internet access: ${result.error}`);
            }
        } catch (error) {
            console.error('Error creating internet access:', error);
            alert('Failed to create internet access. Please try again.');
        }
    });
}

function manageBatteries() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Battery Management</h2>
        <button onclick="addBattery()" class="add-button">Add Battery/Service</button>
        <button onclick="loadBatteryRentals()" class="back-button">Back to Rentals</button>
        <div id="batteriesList">
            <table>
                <thead>
                    <tr>
                        <th>Brand</th>
                        <th>Type</th>
                        <th>Capacity</th>
                        <th>Unit #</th>
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
                        <td>${battery.type === 'battery' ? 'Battery' : 'Charging Service'}</td>
                        <td>${battery.capacity || 'N/A'}</td>
                        <td>${battery.unit_number}</td>
                        <td>${battery.status}</td>
                        <td>
                            <button onclick="updateBatteryStatus(${battery.id}, '${battery.status}')">Update Status</button>
                            <button onclick="deleteBattery(${battery.id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        })
        .catch(error => {
            console.error('Error loading batteries:', error);
            const tbody = document.getElementById('batteriesTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="6">Error loading batteries</td></tr>';
            }
        });
}

function updateBatteryStatus(batteryId, currentStatus) {
    const newStatus = prompt('Enter new status (available, maintenance):', currentStatus);
    if (newStatus === null || !['available', 'maintenance'].includes(newStatus)) {
        alert('Invalid status. Status must be "available" or "maintenance".');
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
    if (!confirm('Are you sure you want to delete this battery?')) {
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
                <label for="name">Battery/Service Name:</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="type">Type:</label>
                <select id="type" name="type" required>
                    <option value="">Select Type</option>
                    <option value="battery">Battery</option>
                    <option value="charging">Charging Service</option>
                </select>
            </div>
            <div class="form-group" id="capacityGroup">
                <label for="capacity">Capacity:</label>
                <input type="text" id="capacity" name="capacity" placeholder="E.g., 250 Wh, 3.2 kWh">
            </div>
            <div class="form-group" id="quantityGroup">
                <label for="quantity">Number of Units:</label>
                <input type="number" id="quantity" name="quantity" min="1" value="1">
            </div>
            <button type="submit">Add Battery/Service</button>
            <button type="button" onclick="manageBatteries()">Cancel</button>
        </form>
    `;

    // Add form event handlers
    const form = document.getElementById('addBatteryForm');
    const typeSelect = document.getElementById('type');
    const quantityGroup = document.getElementById('quantityGroup');
    const capacityGroup = document.getElementById('capacityGroup');

    typeSelect.addEventListener('change', () => {
        const isCharging = typeSelect.value === 'charging';
        quantityGroup.style.display = isCharging ? 'none' : 'block';
        capacityGroup.style.display = isCharging ? 'none' : 'block';
        if (isCharging) {
            document.getElementById('capacity').value = '';
            document.getElementById('quantity').value = '0';
        } else {
            document.getElementById('quantity').value = '1';
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            name: form.name.value,
            type: form.type.value,
            capacity: form.capacity.value || null,
            quantity: parseInt(form.quantity.value || 0)
        };

        try {
            console.log('Submitting battery/service:', formData);
            const response = await fetch('/api/battery-types', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            console.log('Server response:', result);

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

// Initialize charts
function createDashboardChart(data) {
    const ctx = document.getElementById('dashboardChart').getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Battery Rentals', 'Water Sales', 'Internet Access'],
            datasets: [{
                label: 'Last 30 Days',
                data: [data.rentals, data.water_sales, data.internet_accesses],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Event listener for navigation
document.addEventListener('DOMContentLoaded', function() {
    // Initial page load
    loadDashboard();

    // Navigation event delegation
    document.querySelector('nav').addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const page = e.target.dataset.page;

            // Highlight the active navigation item
            document.querySelectorAll('nav a').forEach(link => {
                link.classList.remove('active');
            });
            e.target.classList.add('active');

            // Load the selected page
            switch(page) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'customers':
                    loadCustomers();
                    break;
                case 'rentals':
                    loadBatteryRentals();
                    break;
                case 'water':
                    loadWaterSales();
                    break;
                case 'internet':
                    loadInternetAccess();
                    break;
                default:
                    loadDashboard();
            }
        }
    });
});