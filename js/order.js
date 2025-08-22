// Sample data - in a real application this would come from an API or database
var tableData = JSON.parse(localStorage.getItem('order_data')) || [];

//OnLoad Function
document.addEventListener('DOMContentLoaded', function () {
    // clearing session storage for edit form
    sessionStorage.removeItem('orderNo');
    renderTable();
});

// Function to generate all table rows
function generateTableRows(data) {
    return data.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.orderNumber}</td>
            <!--<td><span class="text-truncate-150" title="${item.customer}">${item.customer}</span></td>-->
            <td><div class="scrollable-cell"><div class="scrollable-cell-content text-truncate-150">${item.customer}</div></div></td>
            <td>${item.materials[0].avv}</td>
            <td>${item.materials[0].name}</td>
            <td>${item.quantity}</td>
            <td>${item.unit}</td>
            <td>
                <button class="btn-icon view-btn" onclick="viewItem(${index})" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon edit-btn" onclick="editItem(${index})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon primary-btn" onclick="trackItem(${index})" title="Track">
                    <i class="fas fa-cogs"></i>
                </button>
                <button class="btn-icon delete-btn" onclick="deleteItem(${index})" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Action functions
/*export function viewItem(index) {
    console.log('View item:', tableData[index]);
    alert(`Viewing: ${JSON.stringify(tableData[index])}`);
}*/

window.viewItem = function (index) {
    let obj = tableData[index]
    console.log("obj", obj);
    showItemPopup(obj);

}


function editItem(index) {
    console.log('Edit item:', tableData[index]);
    let edit_obj = {
        "edit": true,
        "orderNo": tableData[index]['orderNumber']
    }
    sessionStorage.setItem("orderNo", JSON.stringify(edit_obj));
    window.location.href = "order_form.html";
}

function trackItem(index) {
    console.log('Track item:', tableData[index]);
    alert(`Tracking Form: ${JSON.stringify(tableData[index])}`);
}

function deleteItem(index) {
    if (confirm('Are you sure you want to delete this item?')) {
        tableData.splice(index, 1);
        renderTable();
    }
}

// Function to render the table
function renderTable() {
    document.getElementById('tableBody').innerHTML = generateTableRows(tableData);
}

function showItemPopup(item) {
    console.log('inside popup')
    // Get modal elements

    //const modalTitle = document.getElementById('modalTitle');
    //const modalBody = document.getElementById('modalBody');

    // Set dynamic content
    //modalTitle.textContent = 'Item Details';

    // Create HTML content - customize as needed
    document.getElementById('modalContent').innerHTML = `
    <div class="row">
      <div class="col-4 font-500 font-16">Date:</div>
      <div class="col-8 font-14">Not yet scheduled</div>
    </div>
    <div class="row">
      <div class="col-4 font-500 font-16">Time Slote:</div>
      <div class="col-8 font-14">Not yet scheduled</div>
    </div>
    <div class="row mt-2">
      <div class="col-4 font-500 font-16">order Number</div>
      <div class="col-8 font-14">${item.orderNumber}</div>
    </div>
    <div class="row mt-2">
      <div class="col-4 font-500 font-16">Customer Name:</div>
      <div class="col-8 font-14">${item.customer}</div>
    </div>
    <div class="row mt-2">
      <div class="col-4 font-500 font-16">Materials:</div>
      <div class="col-8 font-14">
        ${item.materials && item.materials.length > 0
            ? item.materials.map(m => `${m.name} (AVV: ${m.avv})`).join("<br>")
            : "-"}
      </div>
    <div class="row mt-2">
      <div class="col-4 font-500 font-16">Quantity:</div>
      <div class="col-8 font-14">${item.quantity} ${item.unit}</div>
    </div>
    
  `;
    //initialize model
    const modal = new bootstrap.Modal(document.getElementById('viewModal'));
    // Show the modal
    modal.show();
}
