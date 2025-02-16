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
        <button onclick="newRental()" class="add-button">New Rental</button>
        <div id="rentalsList">
            <table>
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Battery Type</th>
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
                        <td>${rental.battery_type}</td>
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
                        loadBatteryRentals();
                        break;
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