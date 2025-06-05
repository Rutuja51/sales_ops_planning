document.addEventListener('DOMContentLoaded', function () {
 get_contact_data();
});
function get_contact_data() {
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