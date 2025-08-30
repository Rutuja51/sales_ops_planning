document.addEventListener('DOMContentLoaded', function () {
    const submit_btn_opt = JSON.parse(sessionStorage.getItem("orderNo"));

    const createBtn = document.getElementById("createOrderBtn");
    const editBtn = document.getElementById("editOrderBtn");

    // Material management
    const materialSelect = document.getElementById('materialSelect');
    const addMaterialBtn = document.getElementById('addMaterialBtn');
    const materialsContainer = document.getElementById('materialsContainer');
    const quantityInput = document.getElementById('quantity');

    if (addMaterialBtn) {
        addMaterialBtn.addEventListener('click', function () {
            const selectedMaterial = materialSelect.value;
            if (!selectedMaterial) return;

            createMaterialItem(selectedMaterial, "", "", "", "");
            materialSelect.value = "";
            validateMaterials();
        });
    }

    function validateMaterials() {
        const hasMaterials = materialsContainer.children.length > 0;
        document.getElementById('materialsContainer').classList.toggle('is-invalid', !hasMaterials);
    }

    // Function to calculate total quantity
    function calculateTotalQuantity() {
        let total = 0;
        document.querySelectorAll('.material-quantity').forEach(input => {
            const value = parseFloat(input.value) || 0;
            total += value;
        });
        quantityInput.value = total.toFixed(2);
    }

    // Editing existing order
    if (submit_btn_opt && submit_btn_opt.edit) {
        let orderNo = submit_btn_opt.orderNo;
        let tableData = JSON.parse(localStorage.getItem('order_data')) || [];
        let order = tableData.find(order => order.order_id === orderNo);

        document.getElementById("customer").value = order.customer;
        document.getElementById("orderNumber").value = order.orderNumber;
        document.getElementById("contactPerson").value = order.contactPerson || "";
        document.getElementById("deliveryAddress").value = order.deliveryAddress || "";
        document.getElementById("quantity").value = order.quantity;
        document.getElementById("unit").value = order.unit;
        
        // Set transport radio button
        if (order.transport === "yes") {
            document.getElementById("transportYes").checked = true;
        } else {
            document.getElementById("transportNo").checked = true;
        }
        
        // Set packing list radio button
        if (order.packingList === "yes") {
            document.getElementById("packingListYes").checked = true;
        } else {
            document.getElementById("packingListNo").checked = true;
        }
        
        document.getElementById("invoicingType").value = order.invoicingType || "";
        document.getElementById("comment").value = order.comment || "";
        
        patchMaterials(order.materials);

        document.getElementById("resetBtn").style.display = "none";
        document.getElementById("createOrderBtn").style.display = "none";
    } else {
        document.getElementById("editOrderBtn").style.display = "none";
    }

    function patchMaterials(materials) {
        materialsContainer.innerHTML = "";
        materials.forEach(mat => {
            createMaterialItem(
                mat.name, 
                mat.avv || "", 
                mat.quantity || "", 
                mat.price || "", 
                mat.note || ""
            );
        });
        validateMaterials();
        calculateTotalQuantity();
    }

    function createMaterialItem(name, avv = "", quantity = "", price = "", note = "") {
        const existingMaterial = document.querySelector(`.material-item[data-material="${name}"]`);
        if (existingMaterial) return;

        const materialItem = document.createElement('div');
        materialItem.className = 'material-item border p-3 mb-3';
        materialItem.dataset.material = name;

        materialItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <strong>${name}</strong>
                <button type="button" class="btn-close" aria-label="Remove"></button>
            </div>
            <div class="row mb-2">
                <div class="col-md-6">
                    <label for="avv-${name}" class="form-label">AVV \\ UN No.</label>
                    <input type="text" class="form-control avv-input" id="avv-${name}" 
                        placeholder="Enter AVV \\ UN No." value="${avv}">
                </div>
                <div class="col-md-6">
                    <label for="quantity-${name}" class="form-label">Material Quantity</label>
                    <input type="number" class="form-control material-quantity" id="quantity-${name}" 
                        placeholder="Enter quantity" min="0" step="0.01" value="${quantity}">
                </div>
            </div>
            <div class="row mb-2">
                <div class="col-md-6">
                    <label for="price-${name}" class="form-label">Material Price</label>
                    <input type="text" class="form-control material-price" id="price-${name}" 
                        placeholder="Enter price" value="${price}">
                </div>
                <div class="col-md-6">
                    <label for="note-${name}" class="form-label">Material Note</label>
                    <input type="text" class="form-control material-note" id="note-${name}" 
                        placeholder="Enter note" value="${note}">
                </div>
            </div>
        `;

        // Add event listener for quantity change to update total
        const quantityInput = materialItem.querySelector('.material-quantity');
        quantityInput.addEventListener('input', calculateTotalQuantity);

        materialItem.querySelector('.btn-close').addEventListener('click', function () {
            materialItem.remove();
            validateMaterials();
            calculateTotalQuantity();
        });

        materialsContainer.appendChild(materialItem);
    }

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

        let order_id = generateOrderId();

        // Get transport value
        const transportValue = document.querySelector('input[name="transport"]:checked').value;
        
        // Get packing list value
        const packingListValue = document.querySelector('input[name="packingList"]:checked').value;

        const formData = {
            customer: document.getElementById('customer').value,
            orderNumber: document.getElementById('orderNumber').value || "",
            contactPerson: document.getElementById('contactPerson').value || "",
            deliveryAddress: document.getElementById('deliveryAddress').value || "",
            quantity: parseFloat(document.getElementById('quantity').value),
            unit: document.getElementById('unit').value,
            transport: transportValue,
            packingList: packingListValue,
            invoicingType: document.getElementById('invoicingType').value || "",
            comment: document.getElementById('comment').value || "",
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

        document.querySelectorAll('.material-item').forEach(item => {
            const materialName = item.dataset.material;
            const avvValue = item.querySelector('.avv-input').value;
            const quantityValue = item.querySelector('.material-quantity').value;
            const priceValue = item.querySelector('.material-price').value;
            const noteValue = item.querySelector('.material-note').value;

            formData.materials.push({
                name: materialName,
                avv: avvValue || null,
                quantity: quantityValue || null,
                price: priceValue || null,
                note: noteValue || null
            });
        });

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

        localStorage.setItem('order_data', JSON.stringify(order_list));
        alert('Order is created');

        window.location.href = "order_list.html";
    });

    resetBtn.addEventListener('click', function () {
        orderForm.reset();
        orderForm.classList.remove('was-validated');
        materialsContainer.innerHTML = '';
        quantityInput.value = '';
        
        // Reset radio buttons to default
        document.getElementById("transportNo").checked = true;
        document.getElementById("packingListNo").checked = true;
    });
});