function createDashboardChart(data) {
    try {
        // Check if Chart class is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not available');
            return false;
        }
        
        // Check if canvas context is available
        const canvas = document.getElementById('dashboardChart');
        if (!canvas) {
            console.error('Canvas element not found');
            return false;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Canvas context is not available');
            return false;
        }
        
        // Make sure data values are numbers, not strings
        const rentals = parseInt(data.rentals || 0, 10);
        const waterSales = parseInt(data.water_sales || 0, 10);
        const internetAccesses = parseInt(data.internet_accesses || 0, 10);
        
        // Create the chart
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Battery Rentals', 'Water Sales', 'Internet Access'],
                datasets: [{
                    label: '# of Transactions',
                    data: [rentals, waterSales, internetAccesses],
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
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
        
        return true;
    } catch (error) {
        console.error('Error creating chart:', error);
        return false;
    }
}
