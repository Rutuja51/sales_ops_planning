document.addEventListener('DOMContentLoaded', function() {
            // Generate time slots
            const timeSlotContainer = document.getElementById('timeSlotContainer');
            const timeSlots = [];
            
            for (let hour = 8; hour <= 15; hour++) {
                const time = `${hour.toString().padStart(2, '0')}:00`;
                timeSlots.push(time);
                
                const badge = document.createElement('span');
                badge.className = 'badge bg-light text-dark time-slot-badge';
                badge.textContent = time;
                badge.dataset.time = time;
                
                badge.addEventListener('click', function() {
                    this.classList.toggle('bg-light');
                    this.classList.toggle('bg_primary');
                    this.classList.toggle('text-white');
                    
                    updateSelectedTimeSlots();
                });
                
                timeSlotContainer.appendChild(badge);
            }
            
            function updateSelectedTimeSlots() {
                const selectedBadges = document.querySelectorAll('.time-slot-badge.bg_primary');
                const selectedTimes = Array.from(selectedBadges).map(badge => badge.dataset.time);
                document.getElementById('timeSlot').value = selectedTimes.join(',');
            }
            
            // Material management
            const materialSelect = document.getElementById('materialSelect');
            const addMaterialBtn = document.getElementById('addMaterialBtn');
            const materialsContainer = document.getElementById('materialsContainer');
            
            addMaterialBtn.addEventListener('click', function() {
                const selectedMaterial = materialSelect.value;
                if (!selectedMaterial) return;
                
                // Check if material already exists
                const existingMaterial = document.querySelector(`.material-item[data-material="${selectedMaterial}"]`);
                if (existingMaterial) {
                    alert('This material has already been added.');
                    return;
                }
                
                // Create material item
                const materialItem = document.createElement('div');
                materialItem.className = 'material-item';
                materialItem.dataset.material = selectedMaterial;
                
                materialItem.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <strong>${selectedMaterial}</strong>
                        <button type="button" class="btn-close" aria-label="Remove"></button>
                    </div>
                    <div class="mb-2">
                        <label for="avv-${selectedMaterial}" class="form-label">AVV (for ${selectedMaterial})</label>
                        <input type="text" class="form-control avv-input" id="avv-${selectedMaterial}" 
                               placeholder="Enter AVV for ${selectedMaterial}">
                    </div>
                `;
                
                // Add remove functionality
                materialItem.querySelector('.btn-close').addEventListener('click', function() {
                    materialItem.remove();
                    validateMaterials();
                });
                
                materialsContainer.appendChild(materialItem);
                materialSelect.value = '';
                
                validateMaterials();
            });
            
            function validateMaterials() {
                const hasMaterials = materialsContainer.children.length > 0;
                document.getElementById('materialsContainer').classList.toggle('is-invalid', !hasMaterials);
            }
            
            // Form submission
            const orderForm = document.getElementById('orderForm');
            const resetBtn = document.getElementById('resetBtn');
            
            orderForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                if (!orderForm.checkValidity()) {
                    e.stopPropagation();
                    orderForm.classList.add('was-validated');
                    return;
                }
                
                // Collect form data
                const formData = {
                    date: document.getElementById('orderDate').value,
                    timeSlots: document.getElementById('timeSlot').value.split(',').filter(Boolean),
                    customer: document.getElementById('customer').value,
                    orderNumber: document.getElementById('orderNumber').value || null,
                    quantity: parseFloat(document.getElementById('quantity').value),
                    unit: document.getElementById('unit').value,
                    materials: []
                };
                
                // Collect materials data
                document.querySelectorAll('.material-item').forEach(item => {
                    const materialName = item.dataset.material;
                    const avvValue = item.querySelector('.avv-input').value;
                    
                    formData.materials.push({
                        name: materialName,
                        avv: avvValue || null
                    });
                });
                
                // Display in console
                console.log('Order Data:', formData);
                
                // Here you would typically send the data to a server
                alert('Order data has been logged to console (check developer tools)');
            });
            
            // Reset form
            resetBtn.addEventListener('click', function() {
                orderForm.reset();
                orderForm.classList.remove('was-validated');
                materialsContainer.innerHTML = '';
                
                // Reset time slot badges
                document.querySelectorAll('.time-slot-badge').forEach(badge => {
                    badge.classList.remove('bg_primary', 'text-white');
                    badge.classList.add('bg_primary', 'text-dark');
                });
            });
        });