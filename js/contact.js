
export function get_contact_data() {
    new Vue({
        el: '#primary-contact',
        data: {
            name: "Demo",
            jd: "Demo",
            country_code: "+49",
            contact_no: "1779169591",
            email: "abc@gmail.com"
        },
        mounted() {
            this.resetName();
        },
        // Optional methods can be added here
        methods: {
            resetName: function () {
                const vm = this;
                fetch('../json/contact.json')
                    .then(response => response.json())
                    .then(data => {
                        vm.name = data.contact_person.name;
                        vm.jd = data.contact_person.jd;
                        vm.country_code = data.contact_person.country_code;
                        vm.contact_no = data.contact_person.contact_no;
                        vm.email = data.contact_person.email;
                    })
                    .catch(error => {
                        console.error("Error fetching contact data:", error);
                    });

            }
        }
    });

}

/*
 $.ajax({
                    url: '../json/contact.json',
                    dataType: 'json', // Expected response type
                    method: 'GET', // Optional (default is 'GET')
                    success: function (response) {
                        // Handle successful response
                        data.push(response.contact_person);
                        this.name = data[0]["name"];
                        this.jd = data[0]["jd"];
                        this.country_code = data[0]["country_code"];
                        this.contact_no = data[0]["contact_no"];
                        this.email = data[0]["email"];
                    },
                    error: function (xhr, status, error) {
                        // Handle errors
                    }

                });
 */