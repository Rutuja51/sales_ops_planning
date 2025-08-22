document.addEventListener('DOMContentLoaded', function () {
    // Initialize variables
    const today = new Date();
    const currentYear = today.getFullYear();
    let events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
    const rescheduleModal = new bootstrap.Modal(document.getElementById('rescheduleModal'));

    // Main function to generate all weeks - FIXED
function generateAllWeeks() {
    const calendarContainer = document.getElementById('calendar-container');
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




    // Create a week table for specific category - FIXED to handle correct dates
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
                                data-desc="${event.description}">
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



    // Helper functions
    function isCurrentWeek(startDate, endDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize time
        return today >= startDate && today <= endDate;
    }

    function getDayName(dayIndex) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayIndex];
    }

    function formatTime(time) {
        const [hour, minute] = time.split(':');
        const hourNum = parseInt(hour);
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        const displayHour = hourNum % 12 || 12;
        return `${displayHour}:${minute} ${ampm}`;
    }

    function formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }


    function populateTimeSelects() {
        const timeSelects = [
            document.getElementById('event-time'),
            document.getElementById('reschedule-time')
        ];

        timeSelects.forEach(select => {
            select.innerHTML = '<option value="">Select time</option>';
            for (let hour = 8; hour <= 15; hour++) {
                const time = `${hour}:00`;
                const option = document.createElement('option');
                option.value = time;
                option.textContent = formatTime(time);
                select.appendChild(option);
            }
        });
    }

    function saveEvents() {
        console.log("events",events)
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

    function setupEventListeners() {
        // Available slot clicks
        document.querySelectorAll('.available-slot').forEach(slot => {
            slot.addEventListener('click', function () {
                document.getElementById('event-date').value = this.dataset.date;
                document.getElementById('event-time').value = this.dataset.time;
                document.getElementById('event-category').value = this.dataset.category;
                document.getElementById('event-title').focus();
                document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
            });
        });

        // Reschedule button clicks
        document.querySelectorAll('.reschedule-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const data = this.dataset;

                document.getElementById('original-date').value = data.date;
                document.getElementById('original-time').value = data.time;
                document.getElementById('original-category').value = data.category;
                document.getElementById('reschedule-date').value = data.date;
                document.getElementById('reschedule-category').value = data.category;

                const timeSelect = document.getElementById('reschedule-time');
                timeSelect.value = data.time;

                rescheduleModal.show();
            });
        });
    }

    // Form submission
    document.getElementById('schedule-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = {
            title: document.getElementById('event-title').value,
            description: document.getElementById('event-description').value,
            date: document.getElementById('event-date').value,
            time: document.getElementById('event-time').value,
            category: document.getElementById('event-category').value,
            rescheduled: false,
            order_id: ""
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

        events.push(formData);
        saveEvents();
        generateAllWeeks();

        this.reset();
        document.getElementById('event-date').value = formatDate(new Date());
        alert('Event scheduled successfully!');
    });

    // Reschedule confirmation
    document.getElementById('confirm-reschedule').addEventListener('click', function () {
        const originalData = {
            date: document.getElementById('original-date').value,
            time: document.getElementById('original-time').value,
            category: document.getElementById('original-category').value
        };

        const newData = {
            date: document.getElementById('reschedule-date').value,
            time: document.getElementById('reschedule-time').value,
            category: document.getElementById('reschedule-category').value
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
        events[eventIndex] = {
            ...events[eventIndex],
            date: newData.date,
            time: newData.time,
            category: newData.category,
            rescheduled: true,
        };

        saveEvents();
        generateAllWeeks();
        rescheduleModal.hide();
        alert('Event rescheduled successfully!');
    });

    // Initialize
    populateTimeSelects();
    document.getElementById('event-date').value = formatDate(new Date());
    generateAllWeeks();
});