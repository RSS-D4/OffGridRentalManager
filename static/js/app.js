document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    if (!app) {
        console.error('App element not found');
        return;
    }

    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            loadPage(page);
        });
    });

    function loadPage(page) {
        switch (page) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'customers':
                loadCustomers();
                break;
            case 'rentals':
                loadRentals();
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

    async function loadDashboard() {
        try {
            const response = await fetch('/api/dashboard');
            const data = await response.json();
            app.innerHTML = `
                <h2>Dashboard</h2>
                <div class="chart-container">
                    <canvas id="dashboardChart"></canvas>
                </div>
            `;
            const chartElement = document.getElementById('dashboardChart');
            if (chartElement && typeof createDashboardChart === 'function') {
                createDashboardChart(data);
            } else {
                console.error('Dashboard chart element not found or createDashboardChart function not available');
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            app.innerHTML = '<p>Error loading dashboard. Please try again later.</p>';
        }
    }

    async function loadCustomers() {
        try {
            const response = await fetch('/api/customers');
            const customers = await response.json();
            let customersHTML = `
                <h2>Customers</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            customers.forEach(customer => {
                customersHTML += `
                    <tr>
                        <td>${customer.name}</td>
                        <td>${customer.phone}</td>
                        <td>${customer.address}</td>
                        <td>
                            <button onclick="editCustomer(${customer.id})">Edit</button>
                            <button onclick="deleteCustomer(${customer.id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
            customersHTML += `
                    </tbody>
                </table>
                <button onclick="showAddCustomerForm()">Add New Customer</button>
            `;
            app.innerHTML = customersHTML;
        } catch (error) {
            console.error('Error loading customers:', error);
            app.innerHTML = '<p>Error loading customers. Please try again later.</p>';
        }
    }

    function loadRentals() {
        app.innerHTML = '<h2>Battery Rentals</h2><p>Battery rental management coming soon.</p>';
    }

    function loadWaterSales() {
        app.innerHTML = '<h2>Water Sales</h2><p>Water sales management coming soon.</p>';
    }

    function loadInternetAccess() {
        app.innerHTML = '<h2>Internet Access</h2><p>Internet access management coming soon.</p>';
    }

    // Load dashboard by default
    loadDashboard();
});

function showAddCustomerForm() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Add New Customer</h2>
        <form id="addCustomerForm">
            <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="phone">Phone:</label>
                <input type="tel" id="phone" name="phone" required>
            </div>
            <div class="form-group">
                <label for="address">Address:</label>
                <input type="text" id="address" name="address" required>
            </div>
            <button type="submit">Add Customer</button>
        </form>
    `;

    const form = document.getElementById('addCustomerForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const customerData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customerData),
            });

            if (response.ok) {
                loadCustomers();
            } else {
                throw new Error('Failed to add customer');
            }
        } catch (error) {
            console.error('Error adding customer:', error);
            alert('Failed to add customer. Please try again.');
        }
    });
}

async function editCustomer(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}`);
        const customer = await response.json();

        const app = document.getElementById('app');
        app.innerHTML = `
            <h2>Edit Customer</h2>
            <form id="editCustomerForm">
                <div class="form-group">
                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name" value="${customer.name}" required>
                </div>
                <div class="form-group">
                    <label for="phone">Phone:</label>
                    <input type="tel" id="phone" name="phone" value="${customer.phone}" required>
                </div>
                <div class="form-group">
                    <label for="address">Address:</label>
                    <input type="text" id="address" name="address" value="${customer.address}" required>
                </div>
                <button type="submit">Update Customer</button>
            </form>
        `;

        const form = document.getElementById('editCustomerForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const customerData = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`/api/customers/${customerId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(customerData),
                });

                if (response.ok) {
                    loadCustomers();
                } else {
                    throw new Error('Failed to update customer');
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

async function deleteCustomer(customerId) {
    if (confirm('Are you sure you want to delete this customer?')) {
        try {
            const response = await fetch(`/api/customers/${customerId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                loadCustomers();
            } else {
                throw new Error('Failed to delete customer');
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('Failed to delete customer. Please try again.');
        }
    }
}
