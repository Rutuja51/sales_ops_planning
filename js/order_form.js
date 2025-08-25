document.addEventListener('DOMContentLoaded', function () {
    /*
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
                */
    const submit_btn_opt = JSON.parse(sessionStorage.getItem("orderNo"));
    // Form management for edit or create order
    const createBtn = document.getElementById("createOrderBtn");
    const editBtn = document.getElementById("editOrderBtn");
    // Material management
    const materialSelect = document.getElementById('materialSelect');
    const addMaterialBtn = document.getElementById('addMaterialBtn');
    const materialsContainer = document.getElementById('materialsContainer');

    /*addMaterialBtn.addEventListener('click', function() {
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
    });*/

    if(addMaterialBtn){
    addMaterialBtn.addEventListener('click', function () {
        const selectedMaterial = materialSelect.value;
        if (!selectedMaterial) return;

        createMaterialItem(selectedMaterial, "");
        materialSelect.value = "";
        validateMaterials();
    });
    }
    function validateMaterials() {
        const hasMaterials = materialsContainer.children.length > 0;
        document.getElementById('materialsContainer').classList.toggle('is-invalid', !hasMaterials);
    }

    //Resuing same form for update order
    if (submit_btn_opt && submit_btn_opt.edit) {
        let orderNo = submit_btn_opt.orderNo;
        let tableData = JSON.parse(localStorage.getItem('order_data')) || [];
        let order = tableData.find(order => order.order_id === orderNo);
        
        document.getElementById("customer").value = order.customer;
        document.getElementById("orderNumber").value = order.orderNumber;
        document.getElementById("quantity").value = order.quantity;
        document.getElementById("unit").value = order.unit;
        patchMaterials(order.materials);
        document.getElementById("resetBtn").style.display = "none";
        document.getElementById("createOrderBtn").style.display = "none";
    }
    else {
        document.getElementById("editOrderBtn").style.display = "none";
    }
    function patchMaterials(materials) {
        materialsContainer.innerHTML = ""; // clear existing
        materials.forEach(mat => {
            createMaterialItem(mat.name, mat.avv);
        });
        validateMaterials();
    }

    // for update order
    function createMaterialItem(name, avv = "") {
        // Check if material already exists
        const existingMaterial = document.querySelector(`.material-item[data-material="${name}"]`);
        if (existingMaterial) return;

        // Create wrapper
        const materialItem = document.createElement('div');
        materialItem.className = 'material-item';
        materialItem.dataset.material = name;

        materialItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <strong>${name}</strong>
                    <button type="button" class="btn-close" aria-label="Remove"></button>
                </div>
                <div class="mb-2">
                    <label for="avv-${name}" class="form-label">AVV (for ${name})</label>
                    <input type="text" class="form-control avv-input" id="avv-${name}" 
                        placeholder="Enter AVV for ${name}" value="${avv}">
                </div>
            `;

        // Remove functionality
        materialItem.querySelector('.btn-close').addEventListener('click', function () {
            materialItem.remove();
            validateMaterials();
        });

        materialsContainer.appendChild(materialItem);
    }

    // For generate unique orderId 
    function generateOrderId() {
        return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }

    // Form submission
    const orderForm = document.getElementById('orderForm');
    const resetBtn = document.getElementById('resetBtn');

    orderForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!orderForm.checkValidity()) {
            e.stopPropagation();
            orderForm.classList.add('was-validated');
            return;
        }

        // Collect form data
        let order_id=generateOrderId();
        console.log("order_id",order_id);
        const formData = {
            // date: document.getElementById('orderDate').value,
            //  timeSlots: document.getElementById('timeSlot').value.split(',').filter(Boolean),
            customer: document.getElementById('customer').value,
            orderNumber: document.getElementById('orderNumber').value || "",
            quantity: parseFloat(document.getElementById('quantity').value),
            unit: document.getElementById('unit').value,
            materials: [],
            "category": "",
            "date": "",
            "description": "",
            "order_id": order_id,
            "rescheduled": false,
            "time": "",
            "title": "",
            scheduled: false
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
        let order_list = JSON.parse(localStorage.getItem('order_data')) || [];
        if (submit_btn_opt && submit_btn_opt.edit) {
            order_list.forEach((val, ind) => {
                if (val.order_id === submit_btn_opt.orderNo) {
                    Object.assign(order_list[ind], formData);
                }
            });
        } else {
            order_list.push(formData);
        }
        // Save updated list
        localStorage.setItem('order_data', JSON.stringify(order_list));
        alert('Order data has been logged to console (check developer tools)');

        // Navigate after saving
        window.location.href = "order_list.html";

    });

    // Reset form
    resetBtn.addEventListener('click', function () {
        orderForm.reset();
        orderForm.classList.remove('was-validated');
        materialsContainer.innerHTML = '';

        /*
        // Reset time slot badges
        document.querySelectorAll('.time-slot-badge').forEach(badge => {
            badge.classList.remove('bg_primary', 'text-white');
            badge.classList.add('bg_primary', 'text-dark');
        });
        */

    });

});