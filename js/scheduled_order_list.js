// Sample data - in a real application this would come from an API or database
var order_data = JSON.parse(localStorage.getItem('order_data')) || [];
var tableData = [];
order_data.map(data => {
  if (data.scheduled || data.rescheduled)
    tableData.push(data)
});

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
            <td>${item.date}</td>
            <td>${item.time}</td>
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
                
                <button class="btn-icon delete-btn" onclick="reverseItem(${index})" title="Reverse Order">
                    <i class="fas fa-undo-alt"></i>
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



function reverseItem(index) {
  let obj = tableData[index];
  order_data.map((data, ind) => {
    if (data.order_id === obj.order_id) {
      order_data[ind].rescheduled = false;
      order_data[ind].scheduled = false;
    }
    localStorage.setItem('order_data', JSON.stringify(order_data));
  })
  let calender_events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
  calender_events.map((event, ind) => {
    if (event.order_id === obj.order_id) {
      calender_events.splice(ind, 1);
    }
    localStorage.setItem('calendarEvents', JSON.stringify(calender_events));
  })
  alert('Order is being reverse.');
  window.location.href = "order_list.html";
}

// Function to render the table
function renderTable() {
  document.getElementById('tableBody').innerHTML = generateTableRows(tableData);
}

function showItemPopup(item) {
  console.log('inside popup')
  document.getElementById('modalContent').innerHTML = `
    <div class="row">
      <div class="col-4 font-500 font-16">Date:</div>
      <div class="col-8 font-14">${item.date}</div>
    </div>
    <div class="row">
      <div class="col-4 font-500 font-16">Time Slote:</div>
      <div class="col-8 font-14">${item.time}</div>
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
