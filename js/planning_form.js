document.addEventListener('DOMContentLoaded', function () {
    const order_plan = JSON.parse(sessionStorage.getItem("orderNo_plan"));
    if (order_plan && order_plan.plan) {
        let orderNo = order_plan.orderNo;
        let tableData = JSON.parse(localStorage.getItem('order_data')) || [];
        var order = tableData.find(order => order.orderNumber === orderNo);
        document.getElementById("event-orderNumber").value = order.orderNumber;

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
            order_id: order.orderid,
            orderNumber: order.orderNo
        };

        let plan_details = {
            planData:formData
        }

        let order_data=JSON.parse(localStorage.getItem('order_data')) || [];
        order_data.map((data,ind)=>{
            if(data.order_id=== formData.order_id)
            {
                order_data[ind].date=formData.date;
                order_data[ind].time=formData.time;
            }
        })
        localStorage.setItem('order_data', JSON.stringify(order_data));
        sessionStorage.setItem("plan_details", JSON.stringify(plan_details));
        form();
        window.location.href = "order_plan.html";
        // Validate slot availability




    });
});
