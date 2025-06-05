// Sample data - in a real application this would come from an API or database
const tableData = [
    {
        date: '2023-01-01',
        customer_name: 'John Doe Corporation with a very long name that might need horizontal scrolling',
        AVV: 'AVV-001',
        material_Type: 'Steel',
        quantity: 100,
        unit: 'kg',
        time_slot:"11-12",
        Order_no:"1234"
    },
    {
        date: '2023-01-02',
        customer_name: 'Jane Smith Industries',
        AVV: 'AVV-002',
        material_Type: 'Aluminum',
        quantity: 50,
        unit: 'kg',
        time_slot:"11-12",
        Order_no:"1234"
    },
    // Add more sample data here...
    // In a real application, you would have 100+ entries
];

// Generate 100 sample entries if needed
for (let i = 3; i <= 100; i++) {
    tableData.push({
        date: `2023-01-${i < 10 ? '0' + i : i}`,
        customer_name: `Customer ${i}`,
        AVV: `AVV-${i < 10 ? '00' + i : i < 100 ? '0' + i : i}`,
        material_Type: i % 2 === 0 ? 'Steel' : 'Aluminum',
        quantity: Math.floor(Math.random() * 100) + 1,
        unit: i % 3 === 0 ? 'kg' : i % 3 === 1 ? 'lb' : 'pieces',
        time_slot:"11-12",
        Order_no:i
    });
}

//OnLoad Function
document.addEventListener('DOMContentLoaded', function () {
 renderTable();
});

// Function to generate all table rows
function generateTableRows(data) {
    return data.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.date}</td>
            <!--<td><span class="text-truncate-150" title="${item.customer_name}">${item.customer_name}</span></td>-->
            <td><div class="scrollable-cell"><div class="scrollable-cell-content text-truncate-150">${item.customer_name}</div></div></td>
            <td>${item.AVV}</td>
            <td>${item.material_Type}</td>
            <td>${item.quantity}</td>
            <td>${item.unit}</td>
            <td>
                <button class="btn-icon view-btn" onclick="viewItem(${index})" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon edit-btn" onclick="editItem(${index})" title="Edit">
                    <i class="fas fa-edit"></i>
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
    let obj=tableData[index]
    console.log("obj",obj);
    showItemPopup(obj);

}


function editItem(index) {
    console.log('Edit item:', tableData[index]);
    alert(`Editing: ${JSON.stringify(tableData[index])}`);
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
      <div class="col-8 font-14">${item.date}</div>
    </div>
    <div class="row mt-2">
      <div class="col-4 font-500 font-16">Customer Name:</div>
      <div class="col-8 font-14">${item.customer_name}</div>
    </div>
    <div class="row mt-2">
      <div class="col-4 font-500 font-16">AVV:</div>
      <div class="col-8 font-14">${item.AVV}</div>
    </div>
    <div class="row mt-2">
      <div class="col-4 font-500 font-16">Material Type:</div>
      <div class="col-8 font-14">${item.material_Type}</div>
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
