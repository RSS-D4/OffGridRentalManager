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
            console.log('Dashboard data:', data);
            
            // Always display the fallback stats first
            const recentActivity = document.getElementById('recentActivity');
            if (recentActivity) {
                recentActivity.innerHTML = `
                    <div class="stat-card">
                        <h4>Battery Rentals</h4>
                        <p class="stat-number">${data.rentals || 0}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Water Sales</h4>
                        <p class="stat-number">${data.water_sales || 0}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Internet Access</h4>
                        <p class="stat-number">${data.internet_accesses || 0}</p>
                    </div>
                `;
            }
            
            // Then try to create the chart as an enhancement
            try {
                // Try to create chart, but don't worry if it fails
                if (!createDashboardChart(data)) {
                    console.log('Using fallback dashboard display');
                }
            } catch (err) {
                console.error('Error creating chart:', err);
                // We already have the fallback display, so no need to show an error
            }
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
                        <td>${customer.first_name} ${customer.middle_name || ''} ${customer.last_name} ${customer.second_last_name || ''}</td>
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
            <!-- Name Information -->
            <div class="form-section">
                <h3>Personal Information</h3>
                <div class="form-group">
                    <label for="first_name">First Name:</label>
                    <input type="text" id="first_name" name="first_name" required>
                </div>
                <div class="form-group">
                    <label for="middle_name">Middle Name: (Optional)</label>
                    <input type="text" id="middle_name" name="middle_name">
                </div>
                <div class="form-group">
                    <label for="last_name">Last Name:</label>
                    <input type="text" id="last_name" name="last_name" required>
                </div>
                <div class="form-group">
                    <label for="second_last_name">Second Last Name: (Optional)</label>
                    <input type="text" id="second_last_name" name="second_last_name">
                </div>
            </div>

            <!-- Birth Information -->
            <div class="form-section">
                <h3>Birth Information</h3>
                <div class="form-group">
                    <label for="date_of_birth">Date of Birth: (MM/DD/YYYY)</label>
                    <input type="text" id="date_of_birth" name="date_of_birth" 
                           pattern="\\d{2}/\\d{2}/\\d{4}" 
                           placeholder="MM/DD/YYYY" required>
                </div>
                <div class="form-group">
                    <label for="birth_city">Birth City:</label>
                    <input type="text" id="birth_city" name="birth_city" required>
                </div>
            </div>

            <!-- Contact Information -->
            <div class="form-section">
                <h3>Contact Information</h3>
                <div class="form-group">
                    <label for="phone">Phone Number: (with country code, e.g., +1234567890)</label>
                    <input type="tel" id="phone" name="phone" 
                           pattern="\\+[0-9]{1,}" 
                           placeholder="+1234567890" required>
                </div>
                <div class="form-group">
                    <label for="email">Email Address: (Optional)</label>
                    <input type="email" id="email" name="email">
                </div>
            </div>

            <!-- Address Information -->
            <div class="form-section">
                <h3>Address Information</h3>
                <div class="form-group">
                    <label for="address_line1">Address Line 1:</label>
                    <input type="text" id="address_line1" name="address_line1" required>
                </div>
                <div class="form-group">
                    <label for="address_line2">Address Line 2: (Optional)</label>
                    <input type="text" id="address_line2" name="address_line2">
                </div>
                <div class="form-group">
                    <label for="city">City:</label>
                    <input type="text" id="city" name="city" required>
                </div>
                <div class="form-group">
                    <label for="country">Country:</label>
                    <input type="text" id="country" name="country" required>
                </div>
                <div class="form-group">
                    <label for="state_province">State/Province: (Optional)</label>
                    <input type="text" id="state_province" name="state_province">
                </div>
                <div class="form-group">
                    <label for="postal_code">Postal Code: (Optional)</label>
                    <input type="text" id="postal_code" name="postal_code">
                </div>
            </div>

            <!-- Security Information -->
            <div class="form-section">
                <h3>Security Information</h3>
                <div class="form-group">
                    <label for="pin">6-Digit PIN:</label>
                    <input type="password" id="pin" name="pin" 
                           pattern="[0-9]{6}" 
                           minlength="6" 
                           maxlength="6" 
                           required>
                </div>
            </div>

            <!-- ID Information -->
            <div class="form-section">
                <h3>Identification</h3>
                <div class="form-group">
                    <label for="id_type">ID Type: (Optional)</label>
                    <select id="id_type" name="id_type">
                        <option value="">Select ID Type</option>
                        <option value="passport">Passport</option>
                        <option value="national_id">National ID</option>
                        <option value="drivers_license">Driver's License</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="id_number">ID Number: (Optional)</label>
                    <input type="text" id="id_number" name="id_number">
                </div>
            </div>

            <!-- Photo Uploads -->
            <div class="form-section">
                <h3>Document Upload</h3>
                <div class="form-group">
                    <label for="selfie_photo">Selfie Photo: (Optional)</label>
                    <input type="file" id="selfie_photo" name="selfie_photo" accept="image/*">
                    <div id="selfie_preview" class="photo-preview"></div>
                </div>
                <div class="form-group">
                    <label for="id_photo">ID Photo: (Optional)</label>
                    <input type="file" id="id_photo" name="id_photo" accept="image/*">
                    <div id="id_preview" class="photo-preview"></div>
                </div>
                <div class="form-group">
                    <label for="bill_photo">Bill Photo: (Optional)</label>
                    <input type="file" id="bill_photo" name="bill_photo" accept="image/*">
                    <div id="bill_preview" class="photo-preview"></div>
                </div>
            </div>

            <div class="form-actions">
                <button type="submit">Add Customer</button>
                <button type="button" onclick="loadCustomers()">Cancel</button>
            </div>
        </form>
    `;

    // Add photo preview functionality
    ['selfie_photo', 'id_photo', 'bill_photo'].forEach(id => {
        const input = document.getElementById(id);
        // Fix the preview ID for id_photo
        const previewId = id.replace('_photo', '') + '_preview';
        console.log(`Looking for preview element with ID: ${previewId}`);
        const preview = document.getElementById(previewId);
        
        if (input && preview) {
            input.addEventListener('change', function(e) {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        preview.innerHTML = `<img src="${e.target.result}" class="preview-image" style="max-width: 100%; max-height: 200px;">`;
                        preview.style.display = 'flex';
                    };
                    reader.readAsDataURL(this.files[0]);
                    console.log(`File selected for ${id}: ${this.files[0].name}`);
                }
            });
        } else {
            console.error(`Failed to find input or preview element. Input: ${input}, Preview: ${preview}, PreviewId: ${previewId}`);
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
    fetch(`/api/customers/${customerId}/details`)
        .then(response => response.json())
        .then(customer => {
            const app = document.getElementById('app');
            app.innerHTML = `
                <h2>Customer Details</h2>
                <div class="customer-details">
                    <p><strong>Name:</strong> ${customer.first_name} ${customer.middle_name || ''} ${customer.last_name} ${customer.second_last_name || ''}</p>
                    <p><strong>Phone:</strong> ${customer.phone}</p>
                    <p><strong>Email:</strong> ${customer.email || 'N/A'}</p>
                    <p><strong>Address:</strong> ${customer.address_line1}${customer.address_line2 ? ', ' + customer.address_line2 : ''}</p>
                    <p><strong>City:</strong> ${customer.city}</p>
                    <p><strong>Country:</strong> ${customer.country}</p>
                    <p><strong>State/Province:</strong> ${customer.state_province || 'N/A'}</p>
                    <p><strong>Postal Code:</strong> ${customer.postal_code || 'N/A'}</p>
                    <p><strong>Date of Birth:</strong> ${customer.date_of_birth}</p>
                    <p><strong>City of Birth:</strong> ${customer.birth_city}</p>
                    <p><strong>ID Type:</strong> ${customer.id_type || 'N/A'}</p>
                    <p><strong>ID Number:</strong> ${customer.id_number || 'N/A'}</p>

                    <div class="photos-section">
                        <h3>Photos</h3>
                        ${customer.has_selfie ? `
                            <div class="photo-container">
                                <h4>Selfie Photo</h4>
                                <img src="/api/customers/${customer.id}/photos/selfie?cache=${Date.now()}" alt="Selfie Photo" class="customer-photo" style="max-width: 300px; height: auto;">
                            </div>
                        ` : '<div class="photo-container"><h4>No Selfie Photo</h4><p>No selfie photo uploaded</p></div>'}
                        ${customer.has_id_photo ? `
                            <div class="photo-container">
                                <h4>ID Photo</h4>
                                <img src="/api/customers/${customer.id}/photos/id?cache=${Date.now()}" alt="ID Photo" class="customer-photo" style="max-width: 300px; height: auto;">
                            </div>
                        ` : '<div class="photo-container"><h4>No ID Photo</h4><p>No ID photo uploaded</p></div>'}
                        ${customer.has_bill_photo ? `
                            <div class="photo-container">
                                <h4>Bill Photo</h4>
                                <img src="/api/customers/${customer.id}/photos/bill?cache=${Date.now()}" alt="Bill Photo" class="customer-photo" style="max-width: 300px; height: auto;">
                            </div>
                        ` : '<div class="photo-container"><h4>No Bill Photo</h4><p>No bill photo uploaded</p></div>'}
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
        const response = await fetch(`/api/customers/${customerId}/details`);
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
                    <label for="last_name">Last Name:</label>
                    <input type="text" id="last_name" name="last_name" value="${customer.last_name}" required>
                </div>
                <div class="form-group">
                    <label for="second_last_name">Second Last Name:</label>
                    <input type="text" id="second_last_name" name="second_last_name" value="${customer.second_last_name || ''}">
                </div>
                <div class="form-group">
                    <label for="phone">Phone:</label>
                    <input type="tel" id="phone" name="phone" value="${customer.phone}" required>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" value="${customer.email || ''}">
                </div>
                <div class="form-group">
                    <label for="address_line1">Address Line 1:</label>
                    <input type="text" id="address_line1" name="address_line1" value="${customer.address_line1}" required>
                </div>
                <div class="form-group">
                    <label for="address_line2">Address Line 2:</label>
                    <input type="text" id="address_line2" name="address_line2" value="${customer.address_line2 || ''}">
                </div>
                <div class="form-group">
                    <label for="city">City:</label>
                    <input type="text" id="city" name="city" value="${customer.city}" required>
                </div>
                <div class="form-group">
                    <label for="country">Country:</label>
                    <input type="text" id="country" name="country" value="${customer.country}" required>
                </div>
                <div class="form-group">
                    <label for="state_province">State/Province:</label>
                    <input type="text" id="state_province" name="state_province" value="${customer.state_province || ''}">
                </div>
                <div class="form-group">
                    <label for="postal_code">Postal Code:</label>
                    <input type="text" id="postal_code" name="postal_code" value="${customer.postal_code || ''}">
                </div>
                <div class="form-group">
                    <label for="pin">6-Digit PIN:</label>
                    <input type="password" id="pin" name="pin" pattern="[0-9]{6}" minlength="6" maxlength="6" required>
                </div>
                <div class="form-group">
                    <label for="date_of_birth">Date of Birth: (MM/DD/YYYY)</label>
                    <input type="text" id="date_of_birth" name="date_of_birth" 
                           pattern="\\d{2}/\\d{2}/\\d{4}" 
                           value="${customer.date_of_birth}" required>
                </div>
                <div class="form-group">
                    <label for="birth_city">Birth City:</label>
                    <input type="text" id="birth_city" name="birth_city" value="${customer.birth_city}" required>
                </div>
                <div class="form-group">
                    <label for="id_type">ID Type:</label>
                    <select id="id_type" name="id_type">
                        <option value="">Select ID Type</option>
                        <option value="passport" ${customer.id_type === 'passport' ? 'selected' : ''}>Passport</option>
                        <option value="national_id" ${customer.id_type === 'national_id' ? 'selected' : ''}>National ID</option>
                        <option value="drivers_license" ${customer.id_type === 'drivers_license' ? 'selected' : ''}>Driver's License</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="id_number">ID Number:</label>
                    <input type="text" id="id_number" name="id_number" value="${customer.id_number || ''}">
                </div>

                <!-- Photo Upload Fields -->
                <div class="form-group">
                    <label for="selfie_photo">Update Selfie Photo:</label>
                    <input type="file" id="selfie_photo" name="selfie_photo" accept="image/*">
                    <div id="selfie_preview" class="photo-preview">
                        ${customer.has_selfie ? 
                            `<img src="/api/customers/${customer.id}/photos/selfie?cache=${Date.now()}" class="preview-image" alt="Current selfie photo" style="max-width: 200px; height: auto; display: block; margin: 10px 0;">` : 
                            '<p>No current photo</p>'}
                    </div>
                </div>
                <div class="form-group">
                    <label for="id_photo">Update ID Photo:</label>
                    <input type="file" id="id_photo" name="id_photo" accept="image/*">
                    <div id="id_preview" class="photo-preview">
                        ${customer.has_id_photo ? 
                            `<img src="/api/customers/${customer.id}/photos/id?cache=${Date.now()}" class="preview-image" alt="Current ID photo" style="max-width: 200px; height: auto; display: block; margin: 10px 0;">` : 
                            '<p>No current photo</p>'}
                    </div>
                </div>
                <div class="form-group">
                    <label for="bill_photo">Update Bill Photo:</label>
                    <input type="file" id="bill_photo" name="bill_photo" accept="image/*">
                    <div id="bill_preview" class="photo-preview">
                        ${customer.has_bill_photo ? 
                            `<img src="/api/customers/${customer.id}/photos/bill?cache=${Date.now()}" class="preview-image" alt="Current bill photo" style="max-width: 200px; height: auto; display: block; margin: 10px 0;">` : 
                            '<p>No current photo</p>'}
                    </div>
                </div>

                <button type="submit">Update Customer</button>
                <button type="button" onclick="loadCustomers()">Cancel</button>
            </form>
        `;

        // Add photo preview functionality
        ['selfie_photo', 'id_photo', 'bill_photo'].forEach(id => {
            const input = document.getElementById(id);
            const previewId = id + '_preview';
            const preview = document.getElementById(previewId);
            if (input && preview) {
                input.addEventListener('change', function(e) {
                    if (this.files && this.files[0]) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            preview.innerHTML = `<img src="${e.target.result}" class="preview-image" style="max-width: 100%; max-height: 200px;">`;
                            preview.style.display = 'flex';
                        };
                        reader.readAsDataURL(this.files[0]);
                        console.log(`File selected for ${id}: ${this.files[0].name}`);
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
                <select id="battery" name="battery_id">
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
            option.textContent = `${customer.first_name} ${customer.last_name} - ${customer.phone}`;
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
                option.dataset.type = type.type;  // Store the type information
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
                batterySelect.required = false;
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

            // Get the selected battery type
            const batteryTypeId = parseInt(form.battery_type_id.value);
            const selectedType = batteryTypes.find(t => t.id === batteryTypeId);

            const formData = {
                customer_id: parseInt(form.customer_id.value),
                battery_type_id: batteryTypeId,
                rental_price: parseFloat(form.rental_price.value),
                delivery_fee: parseFloat(form.delivery_fee.value)
            };

            // Only include battery_id for physical battery rentals
            if (selectedType && selectedType.type === 'battery') {
                if (!form.battery_id.value) {
                    alert('Please select a battery unit');
                    return;
                }
                formData.battery_id = parseInt(form.battery_id.value);
            }

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
                option.textContent = `${customer.first_name} ${customer.last_name} - ${customer.phone}`;
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
            customer_id: parseInt(form.customer_id.value),            size: parseFloat(form.size.value),
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
    // You can implement a detailed view for a specific rental ifneeded
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
                        <th>WiFi Password</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="internetAccessTableBody">
                    <tr><td colspan="5">Loading internet access records...</td></tr>
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
                    tbody.innerHTML = '<tr><td colspan="5">No internet access records found</td></tr>';
                    return;
                }
                tbody.innerHTML = records.map(record => `
                    <tr>
                        <td>${record.customer_name}</td>
                        <td>${new Date(record.purchased_at).toLocaleString()}</td>
                        <td><code>${record.wifi_password}</code></td>
                        <td>${record.status}</td>
                        <td>
                            <button onclick="viewInternetAccess(${record.id})">View Details</button>
                        </td>
                    </tr>
                `).join('');
            }
        })
        .catch(error => {
            console.error('Error loading internet access records:', error);
            const tbody = document.getElementById('internetAccessTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="5">Error loading internet access records</td></tr>';
            }
        });
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
            <div class="form-group">
                <label for="duration_type">Duration:</label>
                <select id="duration_type" name="duration_type" required>
                    <option value="24h">24 Hours ($0.50)</option>
                    <option value="3d">3 Days ($1.40)</option>
                    <option value="1w">1 Week ($2.80)</option>
                    <option value="1m">1 Month ($8.40)</option>
                </select>
            </div>
            <button type="submit">Create Access</button>
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
                option.textContent = `${customer.first_name} ${customer.last_name} - ${customer.phone}`;
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
        
        // Determine price based on selected duration
        let price = 0.50;
        const durationType = form.duration_type.value;
        if (durationType === "24h") price = 0.50;
        else if (durationType === "3d") price = 1.40;
        else if (durationType === "1w") price = 2.80;
        else if (durationType === "1m") price = 8.40;
        
        const formData = {
            customer_id: parseInt(form.customer_id.value),
            duration_type: durationType,
            price: price
        };

        try {
            const response = await fetch('/api/internet-access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Internet access created successfully!\nWiFi Password: ${result.wifi_password}`);
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

function viewInternetAccess(accessId) {
    // You can implement a detailed view for a specific internet access record if needed
    alert(`Viewing details for internet access ${accessId}`);
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

    // Load batteries data
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
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
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
                case 'health':
                    loadHealthAccess();
                    break;
            }
        });
    });
});


// Add these new functions after your existing code...

function loadHealthAccess() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Health Access</h2>
        <button onclick="newHealthRecord()" class="add-button">New Health Record</button>
        <div id="healthRecordsList">
            <table>
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Visit Date</th>
                        <th>Symptoms</th>
                        <th>Treatments</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="healthRecordsTableBody">
                    <tr><td colspan="5">Loading health records...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    // Load health records
    fetch('/api/health-access')
        .then(response => response.json())
        .then(records => {
            const tbody = document.getElementById('healthRecordsTableBody');
            if (tbody) {
                if (records.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5">No health records found</td></tr>';
                    return;
                }
                tbody.innerHTML = records.map(record => `
                    <tr>
                        <td>${record.customer_name}</td>
                        <td>${new Date(record.visit_date).toLocaleString()}</td>
                        <td>${record.symptoms}</td>
                        <td>${record.treatments}</td>
                        <td>
                            <button onclick="viewHealthRecord(${record.id})">View Details</button>
                        </td>
                    </tr>
                `).join('');
            }
        })
        .catch(error => {
            console.error('Error loading health records:', error);
            const tbody = document.getElementById('healthRecordsTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="5">Error loading health records</td></tr>';
            }
        });
}

function newHealthRecord() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>New Health Record</h2>
        <form id="newHealthRecordForm">
            <div class="form-group">
                <label for="customer">Select Customer:</label>
                <select id="customer" name="customer_id" required>
                    <option value="">Select a customer</option>
                </select>
            </div>
            <div class="form-group">
                <label for="symptoms">Symptoms:</label>
                <textarea id="symptoms" name="symptoms" required
                    placeholder="Describe the symptoms..."
                    rows="4"></textarea>
            </div>
            <div class="form-group">
                <label for="treatments">Treatments Given:</label>
                <textarea id="treatments" name="treatments" required
                    placeholder="List the treatments provided..."
                    rows="4"></textarea>
            </div>
            <div class="form-group">
                <label for="notes">Additional Notes:</label>
                <textarea id="notes" name="notes"
                    placeholder="Any additional notes..."
                    rows="3"></textarea>
            </div>
            <button type="submit">Create Record</button>
            <button type="button" onclick="loadHealthAccess()">Cancel</button>
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
                option.textContent = `${customer.first_name} ${customer.last_name} - ${customer.phone}`;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading customers:', error);
            alert('Error loading customers. Please try again.');
        });

    // Handle form submission
    const form = document.getElementById('newHealthRecordForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            customer_id: parseInt(form.customer_id.value),
            symptoms: form.symptoms.value.trim(),
            treatments: form.treatments.value.trim(),
            notes: form.notes.value.trim()
        };

        try {
            const response = await fetch('/api/health-access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Health record created successfully!');
                loadHealthAccess();
            } else {
                alert(`Failed to create health record: ${result.error}`);
            }
        } catch (error) {
            console.error('Error creating health record:', error);
            alert('Failed to create health record. Please try again.');
        }
    });
}

function viewHealthRecord(recordId) {
    fetch(`/api/health-access/${recordId}`)
        .then(response => response.json())
        .then(record => {
            const app = document.getElementById('app');
            app.innerHTML = `
                <h2>Health Record Details</h2>
                <div class="record-details">
                    <p><strong>Customer:</strong> ${record.customer_name}</p>
                    <p><strong>Visit Date:</strong> ${new Date(record.visit_date).toLocaleString()}</p>
                    <p><strong>Symptoms:</strong></p>
                    <pre>${record.symptoms}</pre>
                    <p><strong>Treatments:</strong></p>
                    <pre>${record.treatments}</pre>
                    ${record.notes ? `
                        <p><strong>Additional Notes:</strong></p>
                        <pre>${record.notes}</pre>
                    ` : ''}
                </div>
                <button onclick="loadHealthAccess()">Back to Health Records</button>
            `;
        })
        .catch(error => {
            console.error('Error loading health record details:', error);
            alert('Failed to load health record details. Please try again.');
        });
}

// Update the existing event listener in your navigation code to include the health access page
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
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
                case 'health':
                    loadHealthAccess();
                    break;
            }
        });
    });

    // Load dashboard by default
    loadDashboard();
});

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