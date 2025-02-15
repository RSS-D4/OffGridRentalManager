// Check if the browser is online or offline
function updateOnlineStatus() {
    const status = navigator.onLine ? 'online' : 'offline';
    console.log(`App is ${status}`);
    if (!navigator.onLine) {
        alert('You are currently offline. Some features may not be available.');
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Function to store data locally when offline
function storeDataLocally(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Function to retrieve locally stored data
function getLocalData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// Function to sync local data with server when back online
async function syncDataWithServer() {
    if (navigator.onLine) {
        const localCustomers = getLocalData('offlineCustomers');
        if (localCustomers) {
            for (const customer of localCustomers) {
                try {
                    await fetch('/api/customers', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(customer),
                    });
                } catch (error) {
                    console.error('Error syncing customer:', error);
                }
            }
            localStorage.removeItem('offlineCustomers');
        }

        // Sync other data types (rentals, water sales, internet access) similarly
    }
}

// Listen for online event to trigger sync
window.addEventListener('online', syncDataWithServer);

// Modify fetch requests to handle offline scenarios
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    if (!navigator.onLine) {
        const [resource, config] = args;
        if (resource === '/api/customers' && config.method === 'POST') {
            const customer = JSON.parse(config.body);
            const offlineCustomers = getLocalData('offlineCustomers') || [];
            offlineCustomers.push(customer);
            storeDataLocally('offlineCustomers', offlineCustomers);
            return new Response(JSON.stringify({ message: 'Customer stored locally' }), { status: 200 });
        }
        // Handle other API endpoints similarly for offline storage
    }
    return originalFetch.apply(this, args);
};
