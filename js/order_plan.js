// Initialize variables
let events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
let currentYear = new Date().getFullYear();


document.addEventListener('DOMContentLoaded', function (){
    const order_plan = JSON.parse(sessionStorage.getItem("orderNo_plan"));
    if (order_plan && order_plan.plan) {
        let orderNo = order_plan.orderNo;
        let tableData = JSON.parse(localStorage.getItem('order_data')) || [];
        let order = tableData.find(order => order.orderNumber === orderNo);
        document.getElementById("event-order-No").value = orderNo;
    }
});


// Helper functions
function formatTime(time) {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minute} ${ampm}`;
}

function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function isCurrentWeek(startDate, endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize time
    return today >= startDate && today <= endDate;
}

function getDayName(dayIndex) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
}

function populateTimeSelects() {
    const timeSelects = [
        document.getElementById('event-time'),
        document.getElementById('reschedule-time')
    ];

    timeSelects.forEach(select => {
        if (select) {
            select.innerHTML = '<option value="">Select time</option>';
            for (let hour = 8; hour <= 15; hour++) {
                const time = `${hour}:00`;
                const option = document.createElement('option');
                option.value = time;
                option.textContent = formatTime(time);
                select.appendChild(option);
            }
        }
    });
}

function saveEvents() {
   
    localStorage.setItem('calendarEvents', JSON.stringify(events));
}

function scrollToCurrentWeek() {
    setTimeout(() => {
        const currentWeek = document.getElementById('current-week');
        if (currentWeek) {
            currentWeek.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

// Main function to generate all weeks
function generateAllWeeks() {
    const calendarContainer = document.getElementById('calendar-container');
    if (!calendarContainer) return;
    
    calendarContainer.innerHTML = '';

    const yearStart = new Date(currentYear, 0, 1);   // Jan 1
    const yearEnd   = new Date(currentYear, 11, 31); // Dec 31

    // Always start at Jan 1, no shifting to Monday
    let weekStart = new Date(yearStart);

    let week = 1;
    while (weekStart <= yearEnd) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const weekDiv = document.createElement('div');
        weekDiv.className = 'week-container';

        if (isCurrentWeek(weekStart, weekEnd)) {
            weekDiv.id = 'current-week';
            weekDiv.classList.add('current-week');
        }

        const weekHeader = document.createElement('div');
        weekHeader.className = 'week-header';
        const displayEnd = weekEnd > yearEnd ? yearEnd : weekEnd;
        weekHeader.innerHTML = `<h3>Week ${week} (${formatDate(weekStart)} to ${formatDate(displayEnd)})</h3>`;
        weekDiv.appendChild(weekHeader);

        const tablesContainer = document.createElement('div');
        tablesContainer.className = 'dual-tables';

        const inboundTableDiv = document.createElement('div');
        inboundTableDiv.className = 'single-table';
        inboundTableDiv.appendChild(createWeekTable(weekStart, 'inbound'));
        tablesContainer.appendChild(inboundTableDiv);

        const outboundTableDiv = document.createElement('div');
        outboundTableDiv.className = 'single-table';
        outboundTableDiv.appendChild(createWeekTable(weekStart, 'outbound'));
        tablesContainer.appendChild(outboundTableDiv);

        weekDiv.appendChild(tablesContainer);
        calendarContainer.appendChild(weekDiv);

        weekStart.setDate(weekStart.getDate() + 7); // jump to next week
        week++;
    }

    setupEventListeners();
    scrollToCurrentWeek();
}

// Create a week table for specific category
function createWeekTable(weekStart, category) {
    const table = document.createElement('table');
    table.className = `table table-bordered ${category}-table`;

    const thead = document.createElement('thead');

    // Category header row
    const categoryRow = document.createElement('tr');
    const categoryHeader = document.createElement('th');
    categoryHeader.colSpan = 6; // time + Mon..Fri
    categoryHeader.className = 'category-header';
    categoryHeader.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Schedule`;
    categoryRow.appendChild(categoryHeader);
    thead.appendChild(categoryRow);

    // Day headers row (Mon–Fri)
    const dayHeaderRow = document.createElement('tr');
    dayHeaderRow.appendChild(document.createElement('th')).className = 'time-label';

    for (let i = 1; i <= 5; i++) { // 1=Mon ... 5=Fri
        const d = new Date(weekStart);
        // Align with Mon=1 .. Fri=5 relative to this week
        d.setDate(weekStart.getDate() - (weekStart.getDay() === 0 ? 6 : weekStart.getDay() - 1) + (i - 1));

        const dayHeader = document.createElement('th');
        dayHeader.className = 'day-header';

        if (d.getFullYear() === currentYear) {
            dayHeader.innerHTML = `${getDayName(i)}<br><span>${formatDate(d)}</span>`;
        } else {
            dayHeader.innerHTML = `${getDayName(i)}<br><span></span>`;
        }

        dayHeaderRow.appendChild(dayHeader);
    }
    thead.appendChild(dayHeaderRow);
    table.appendChild(thead);

    // Body with time slots
    const tbody = document.createElement('tbody');
    for (let hour = 8; hour <= 15; hour++) {
        const time = `${hour}:00`;
        const row = document.createElement('tr');

        const timeLabelCell = document.createElement('td');
        timeLabelCell.className = 'time-label';
        timeLabelCell.textContent = formatTime(time);
        row.appendChild(timeLabelCell);

        for (let i = 1; i <= 5; i++) {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() - (weekStart.getDay() === 0 ? 6 : weekStart.getDay() - 1) + (i - 1));

            const dayCell = document.createElement('td');
            dayCell.className = 'time-slot';

            if (d.getFullYear() !== currentYear) {
                dayCell.classList.add('bg-light');
                row.appendChild(dayCell);
                continue;
            }

            const dateStr = formatDate(d);

            const event = events.find(e =>
                e.date === dateStr &&
                e.time === time &&
                e.category === category 
            );

            if (event) {
                dayCell.classList.add('booked-slot');
                dayCell.innerHTML = `
                    <div class="slot-content">
                        ${event.rescheduled ? '<div class="rescheduled-flag"></div>' : ''}
                        <div>${event.title}</div>
                        <button class="btn btn-sm btn-outline-primary reschedule-btn" 
                                data-date="${dateStr}" 
                                data-time="${time}"
                                data-category="${category}"
                                data-title="${event.title}"
                                data-desc="${event.description}"
                                data-order-number="${event.orderNumber || ''}"
                                data-order-id="${event.order_id || ''}">
                            Reschedule
                        </button>
                    </div>
                `;
            } else {
                dayCell.classList.add('available-slot');
                dayCell.dataset.date = dateStr;
                dayCell.dataset.time = time;
                dayCell.dataset.category = category;
                dayCell.innerHTML = `
                    <div class="slot-content">
                        <div class="available-flag"></div>
                    </div>
                `;
            }

            row.appendChild(dayCell);
        }
        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    return table;
}

function setupEventListeners() {
    // Available slot clicks (only on calendar page)
    document.querySelectorAll('.available-slot').forEach(slot => {
        slot.addEventListener('click', function () {
            // Redirect to schedule page with parameters
            const params = new URLSearchParams({
                date: this.dataset.date,
                time: this.dataset.time,
                category: this.dataset.category
            });
            window.location.href = `schedule.html?${params.toString()}`;
        });
    });

    // Reschedule button clicks
    document.querySelectorAll('.reschedule-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const data = this.dataset;
            let order_plan = JSON.parse(sessionStorage.getItem("orderNo_plan"));
            console.log("data",data);
            document.getElementById('original-date').value = data.date;
            document.getElementById('original-time').value = data.time;
            document.getElementById('original-category').value = data.category;
            document.getElementById('reschedule-date').value = data.date;
            document.getElementById('reschedule-category').value = data.category;
            //document.getElementById('event-order-No-reschedule').value = data.orderNumber;
            document.getElementById('event-order-No-reschedule').value = data.orderNumber || '';
           // document.getElementById('event-order-id-reschedule').value = data.orderId || '';
            const timeSelect = document.getElementById('reschedule-time');
            timeSelect.value = data.time;
            
            const rescheduleModal = new bootstrap.Modal(document.getElementById('rescheduleModal'));
            rescheduleModal.show();
        });
    });
}

// Schedule form handling (only on schedule.html)
function setupScheduleForm() {
    const form = document.getElementById('schedule-form');
    if (!form) return;
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');
    const time = urlParams.get('time');
    const category = urlParams.get('category');
    
    // Pre-fill form if parameters exist
    if (date) document.getElementById('event-date').value = date;
    if (time) document.getElementById('event-time').value = time;
    if (category) document.getElementById('event-category').value = category;
    
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const order_plan = JSON.parse(sessionStorage.getItem("orderNo_plan"));
        const formData = {
            title: document.getElementById('event-title').value,
            description: document.getElementById('event-description').value,
            date: document.getElementById('event-date').value,
            time: document.getElementById('event-time').value,
            category: document.getElementById('event-category').value,
            rescheduled: false,
            scheduled:true,
            order_id: order_plan?.orderid,
            orderNumber: order_plan?.orderNo
        };

        // Validate slot availability
        const isSlotTaken = events.some(e =>
            e.date === formData.date &&
            e.time === formData.time &&
            e.category === formData.category
        );

        if (isSlotTaken) {
            alert('This time slot is already booked. Please choose another time.');
            return;
        }

        let order_list = JSON.parse(localStorage.getItem('order_data')); 
        console.log('form,data',formData)
        order_list.map((data,ind)=>{
                if(data.order_id===formData.order_id){
                
                order_list[ind].rescheduled=false;
                order_list[ind].scheduled=true;

            }    
        });
        localStorage.setItem('order_data', JSON.stringify(order_list));
        events.push(formData);
        saveEvents();

        alert('Event scheduled successfully!');
        window.location.href = 'order_plan.html';
    });
}

// Reschedule confirmation
function setupRescheduleHandler() {
    const confirmBtn = document.getElementById('confirm-reschedule');
    if (!confirmBtn) return;
    let order_plan = JSON.parse(sessionStorage.getItem("orderNo_plan"));
    confirmBtn.addEventListener('click', function () {
        const originalData = {
            date: document.getElementById('original-date').value,
            time: document.getElementById('original-time').value,
            category: document.getElementById('original-category').value,
            orderNumber: document.getElementById('event-order-No-reschedule').value,
            orderId: order_plan.orderid
        };

        const newData = {
            date: document.getElementById('reschedule-date').value,
            time: document.getElementById('reschedule-time').value,
            category: document.getElementById('reschedule-category').value,
            orderNumber: document.getElementById('event-order-No-reschedule').value,
           orderId: order_plan.orderid
        };

        // Find the event to reschedule
        const eventIndex = events.findIndex(e =>
            e.date === originalData.date &&
            e.time === originalData.time &&
            e.category === originalData.category
        );

        if (eventIndex === -1) {
            alert('Event not found!');
            return;
        }

        // Check if new slot is available
        const isNewSlotTaken = events.some(e =>
            e.date === newData.date &&
            e.time === newData.time &&
            e.category === newData.category &&
            !(e.date === originalData.date && e.time === originalData.time && e.category === originalData.category)
        );

        if (isNewSlotTaken) {
            alert('The selected time slot is already booked. Please choose another time.');
            return;
        }

        // Update event
        console.log("newData",newData)
        events[eventIndex] = {
            ...events[eventIndex],
            date: newData.date,
            time: newData.time,
            category: newData.category,
            rescheduled: true,
            orderNumber: document.getElementById('event-order-No-reschedule').value
        };

        let order_list = JSON.parse(localStorage.getItem('order_data'));

        console.log('order',order_list)
        console.log('events',events)
        
        
        order_list.map((data,ind)=>{
            events.map((event_data,ind1)=>{
                if(data.order_id===event_data.order_id){
                order_list[ind].orderNumber=event_data.orderNumber;
                order_list[ind].rescheduled=true;
                order_list[ind].scheduled=true;
                order_list[ind].date=newData.date;
                order_list[ind].time=newData.time;


            }
            })   
        });
        

        localStorage.setItem('order_data', JSON.stringify(order_list));
        saveEvents();
        
        const rescheduleModal = bootstrap.Modal.getInstance(document.getElementById('rescheduleModal'));
        rescheduleModal.hide();
        
        generateAllWeeks();
        alert('Event rescheduled successfully!');
    });
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', function () {
    // Clear session storage for edit form
    sessionStorage.removeItem('orderNo');
    
    // Initialize based on which page we're on
    if (document.getElementById('calendar-container')) {
        // Calendar page
        populateTimeSelects();
        generateAllWeeks();
    } else if (document.getElementById('schedule-form')) {
        // Schedule form page
        populateTimeSelects();
        setupScheduleForm();
        
        // Set default date if not provided in URL
        if (!document.getElementById('event-date').value) {
            document.getElementById('event-date').value = formatDate(new Date());
        }
    }
    
    // Setup reschedule handler if modal exists
    setupRescheduleHandler();
});