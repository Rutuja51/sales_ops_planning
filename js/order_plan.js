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
                
                // If editing an existing event, pre-fill the checkboxes
                if (order) {
                    if (order.begleitschein) {
                        document.getElementById('begleitschein-checkbox').checked = true;
                    }
                    if (order.entsorgungsnachweis) {
                        document.getElementById('entsorgungsnachweis-checkbox').checked = true;
                    }
                    if (order.lieferschein) {
                        document.getElementById('lieferschein-checkbox').checked = true;
                    }
                    
                    // Enable button if all checkboxes are checked
                    validateCheckboxes();
                }
            }
            
            // Add event listeners to checkboxes
            document.querySelectorAll('.document-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', validateCheckboxes);
            });
        });

        // Validate if all checkboxes are checked
        function validateCheckboxes() {
            const begleitschein = document.getElementById('begleitschein-checkbox').checked;
            const entsorgungsnachweis = document.getElementById('entsorgungsnachweis-checkbox').checked;
            const lieferschein = document.getElementById('lieferschein-checkbox').checked;
            
            const scheduleButton = document.getElementById('schedule-button');
            scheduleButton.disabled = !(begleitschein && entsorgungsnachweis && lieferschein);
        }

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

        // Setup schedule form
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
                
                // Get checkbox values
                const begleitschein = document.getElementById('begleitschein-checkbox').checked;
                const entsorgungsnachweis = document.getElementById('entsorgungsnachweis-checkbox').checked;
                const lieferschein = document.getElementById('lieferschein-checkbox').checked;
                
                const formData = {
                    title: document.getElementById('event-title').value,
                    description: document.getElementById('event-description').value,
                    date: document.getElementById('event-date').value,
                    time: document.getElementById('event-time').value,
                    category: document.getElementById('event-category').value,
                    rescheduled: false,
                    scheduled: true,
                    order_id: order_plan?.orderid,
                    orderNumber: order_plan?.orderNo,
                    begleitschein: begleitschein,
                    entsorgungsnachweis: entsorgungsnachweis,
                    lieferschein: lieferschein
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

                let order_list = JSON.parse(localStorage.getItem('order_data')) || []; 
                console.log('form,data', formData);
                
                // Update order data with document information
                order_list = order_list.map(data => {
                    if (data.order_id === formData.order_id) {
                        return {
                            ...data,
                            rescheduled: false,
                            scheduled: true,
                            date: formData.date,
                            time: formData.time,
                            begleitschein: formData.begleitschein,
                            entsorgungsnachweis: formData.entsorgungsnachweis,
                            lieferschein: formData.lieferschein
                        };
                    }
                    return data;
                });
                
                localStorage.setItem('order_data', JSON.stringify(order_list));
                events.push(formData);
                saveEvents();

                alert('Event scheduled successfully!');
                window.location.href = 'order_plan.html';
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
                // generateAllWeeks(); // This function would be in order_plan.js
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
            // setupRescheduleHandler(); // This function would be in order_plan.js
        });