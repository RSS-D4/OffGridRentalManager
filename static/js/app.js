// ... (previous code remains unchanged)

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
                console.log('Sending update request with data:', customerData);
                const response = await fetch(`/api/customers/${customerId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(customerData),
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Update successful:', result);
                    loadCustomers();
                } else {
                    const errorData = await response.json();
                    console.error('Error updating customer:', errorData);
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

// Add new customer form
function loadAddCustomerForm() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Add New Customer</h2>
        <form id="addCustomerForm" enctype="multipart/form-data">
            <div class="form-group">
                <label for="name">Full Name:</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="phone">Phone Number:</label>
                <input type="tel" id="phone" name="phone" required>
            </div>
            <div class="form-group">
                <label for="address">Address:</label>
                <input type="text" id="address" name="address" required>
            </div>

            <!-- KYC Information -->
            <div class="form-group">
                <label for="date_of_birth">Date of Birth:</label>
                <input type="date" id="date_of_birth" name="date_of_birth">
            </div>
            <div class="form-group">
                <label for="id_type">ID Type:</label>
                <select id="id_type" name="id_type">
                    <option value="">Select ID Type</option>
                    <option value="passport">Passport</option>
                    <option value="national_id">National ID</option>
                    <option value="drivers_license">Driver's License</option>
                </select>
            </div>
            <div class="form-group">
                <label for="id_number">ID Number:</label>
                <input type="text" id="id_number" name="id_number">
            </div>

            <!-- Photo Uploads -->
            <div class="form-group">
                <label for="selfie_photo">Selfie Photo:</label>
                <input type="file" id="selfie_photo" name="selfie_photo" accept="image/*" capture="user">
                <div id="selfie_preview" class="photo-preview"></div>
            </div>
            <div class="form-group">
                <label for="id_photo">ID Photo:</label>
                <input type="file" id="id_photo" name="id_photo" accept="image/*">
                <div id="id_preview" class="photo-preview"></div>
            </div>
            <div class="form-group">
                <label for="bill_photo">Bill Photo:</label>
                <input type="file" id="bill_photo" name="bill_photo" accept="image/*">
                <div id="bill_preview" class="photo-preview"></div>
            </div>

            <button type="submit">Add Customer</button>
        </form>
    `;

    // Add photo preview functionality
    ['selfie_photo', 'id_photo', 'bill_photo'].forEach(id => {
        const input = document.getElementById(id);
        const preview = document.getElementById(id + '_preview');
        input.addEventListener('change', function(e) {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" class="preview-image">`;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    });

    // Handle form submission
    const form = document.getElementById('addCustomerForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                alert('Customer added successfully!');
                loadCustomers(); // Redirect to customers list
            } else {
                const errorData = await response.json();
                alert(`Failed to add customer: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error adding customer:', error);
            alert('Failed to add customer. Please try again.');
        }
    });
}

// Add navigation handler for the new form
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    nav.addEventListener('click', (e) => {
        if (e.target.matches('a')) {
            e.preventDefault();
            const page = e.target.dataset.page;
            switch (page) {
                case 'customers':
                    loadCustomers();
                    break;
                case 'add-customer':
                    loadAddCustomerForm();
                    break;
                // ... other cases remain unchanged
            }
        }
    });
});

// ... (rest of the code remains unchanged)