document.addEventListener('DOMContentLoaded', function() {
    // Function to handle order deletion
    const setupOrderDeletion = () => {
        const deleteForms = document.querySelectorAll('.delete-order-form');
        
        deleteForms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const orderId = this.dataset.orderId;
                const row = document.querySelector(`tr[data-order-id="${orderId}"]`);
                
                if (confirm('Are you sure you want to delete this order?')) {
                    fetch(`/orders/${orderId}/delete`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    })
                    .then(response => {
                        if (response.redirected) {
                            window.location.href = response.url;
                            return;
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data && data.message) {
                            // Add fade-out animation
                            row.classList.add('fade-out');
                            
                            // Remove the row after animation completes
                            setTimeout(() => {
                                row.remove();
                                
                                // Show no orders message if no orders left
                                const remainingRows = document.querySelectorAll('tbody tr').length;
                                if (remainingRows === 0) {
                                    const tbody = document.querySelector('tbody');
                                    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No orders found</td></tr>';
                                }
                            }, 500);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Failed to delete order. Please try again.');
                    });
                }
            });
        });
    };
    
    // Initialize
    setupOrderDeletion();
    
    // Setup quantity input handling for the order form
    if (document.getElementById('orderItems')) {
        document.getElementById('orderItems').addEventListener('change', updateTotalAmount);
        document.getElementById('orderItems').addEventListener('input', updateTotalAmount);
    }
}); 