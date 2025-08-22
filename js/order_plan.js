document.addEventListener('DOMContentLoaded', function () {
    // Initialize variables
    const today = new Date();
    const currentYear = today.getFullYear();
    let events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
    const rescheduleModal = new bootstrap.Modal(document.getElementById('rescheduleModal'));

    // Main function to generate all weeks
    function generateAllWeeks() {
        const calendarContainer = document.getElementById('calendar-container');
        calendarContainer.innerHTML = '';

       // let weekStart = new Date(currentYear, 0, 1); // January 1st
        let weekStart = new Date(currentYear, 0, 1); // Start Jan 1, no adjustment

        // Move to previous Sunday (but ensure we don't go into previous year)
        /*const firstSunday = new Date(weekStart);
        firstSunday.setDate(weekStart.getDate() - weekStart.getDay());
        if (firstSunday.getFullYear() < currentYear) {
            firstSunday.setDate(1); // If adjustment goes to previous year, use Jan 1st
            firstSunday.setDate(1 - firstSunday.getDay()); // Try again
        }
        weekStart = firstSunday;*/

        for (let week = 1; week <= 52; week++) {
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
            weekHeader.innerHTML = `<h3>Week ${week} (${formatDate(weekStart)} to ${formatDate(weekEnd)})</h3>`;
            weekDiv.appendChild(weekHeader);

            // Create container for side-by-side tables
            const tablesContainer = document.createElement('div');
            tablesContainer.className = 'dual-tables';

            // Create and add inbound table
            const inboundTableDiv = document.createElement('div');
            inboundTableDiv.className = 'single-table';
            inboundTableDiv.appendChild(createWeekTable(weekStart, 'inbound'));
            tablesContainer.appendChild(inboundTableDiv);

            // Create and add outbound table
            const outboundTableDiv = document.createElement('div');
            outboundTableDiv.className = 'single-table';
            outboundTableDiv.appendChild(createWeekTable(weekStart, 'outbound'));
            tablesContainer.appendChild(outboundTableDiv);

            weekDiv.appendChild(tablesContainer);
            calendarContainer.appendChild(weekDiv);
            weekStart.setDate(weekStart.getDate() + 7);
        }

        setupEventListeners();
        scrollToCurrentWeek();
    }

    // Keep all other functions exactly the same as before

    // Create a week table for specific category
    // Update the createWeekTable function to exclude weekends
    function createWeekTable(weekStart, category) {
        const table = document.createElement('table');
        table.className = `table table-bordered ${category}-table`;

        // Create table header
        const thead = document.createElement('thead');

        // Category header row
        const categoryRow = document.createElement('tr');
        const categoryHeader = document.createElement('th');
        categoryHeader.colSpan = 6; // Changed from 8 to 6 (5 weekdays + time column)
        categoryHeader.className = 'category-header';
        categoryHeader.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Schedule`;
        categoryRow.appendChild(categoryHeader);
        thead.appendChild(categoryRow);

        // Day headers row (only weekdays)
        const dayHeaderRow = document.createElement('tr');
        dayHeaderRow.appendChild(document.createElement('th')).className = 'time-label';

        // Only create headers for Monday-Friday
        for (let i = 1; i <= 5; i++) { // Start from 1 (Monday) to 5 (Friday)
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + i + 1); // Skip Sunday (0)

            const dayHeader = document.createElement('th');
            dayHeader.className = 'day-header';
            dayHeader.innerHTML = `${getDayName(i)}<br><span>${formatDate(dayDate)}</span>`;
            dayHeaderRow.appendChild(dayHeader);
        }

        thead.appendChild(dayHeaderRow);
        table.appendChild(thead);

        // Create table body with time slots
        const tbody = document.createElement('tbody');

        for (let hour = 8; hour <= 15; hour++) {
            const time = `${hour}:00`;
            const row = document.createElement('tr');

            // Time label cell
            const timeLabelCell = document.createElement('td');
            timeLabelCell.className = 'time-label';
            timeLabelCell.textContent = formatTime(time);
            row.appendChild(timeLabelCell);

            // Day cells (only Monday-Friday)
            for (let day = 1; day <= 5; day++) { // Monday (1) to Friday (5)
                const dayDate = new Date(weekStart);
                dayDate.setDate(weekStart.getDate() + day + 1);
                const dateStr = formatDate(dayDate);

                const dayCell = document.createElement('td');
                dayCell.className = 'time-slot';

                // Find event for this slot and category
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
        return date.toISOString().split('T')[0];
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
            rescheduled: false
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
            rescheduled: true
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