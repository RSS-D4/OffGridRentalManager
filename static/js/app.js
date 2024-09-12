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

    // Placeholder functions for other pages
    function loadCustomers() {
        app.innerHTML = '<h2>Customers</h2><p>Customer management coming soon.</p>';
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
