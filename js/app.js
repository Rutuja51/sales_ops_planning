
import { get_contact_data } from './contact.js';
import { renderTable } from './order.js';
//import { viewItem } from './order.js';
//import { editItem } from './order.js';
//import { deleteItem } from './order.js';

// Add active class to current page
document.addEventListener('DOMContentLoaded', function () {
  const navLinks = document.querySelectorAll('.nav-link');
  const currentPage = window.location.pathname.split('/').pop();
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop();
    if (currentPage === linkPage ||
      (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    }
  });
  

});

// Implementing navigation with javascript
document.getElementById('list_page').addEventListener('click', function () {
  fetch('../pages/order_list.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('contentArea').innerHTML = html;
      renderTable();
      /*document.getElementById('contentArea').addEventListener('click', function(e) {
        if (e.target.classList.contains('view-btn')) {
          const index = e.target.dataset.index;
          viewItem(index); // This will now work if order.js is properly loaded
        }
      });*/
      
    })
    .catch(err => {
      console.error('Failed to load page: ', err);
    });
});

document.getElementById('planning_page').addEventListener('click', function () {
  fetch('../pages/order_plan.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('contentArea').innerHTML = html;
    })
    .catch(err => {
      console.error('Failed to load page: ', err);
    });
});

document.getElementById('order_page').addEventListener('click', function () {
  fetch('../pages/order_form.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('contentArea').innerHTML = html;
    })
    .catch(err => {
      console.error('Failed to load page: ', err);
    });
});

document.getElementById('contact_page').addEventListener('click', function () {
  fetch('../pages/order_contact.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('contentArea').innerHTML = html;
      get_contact_data();
    })
    .catch(err => {
      console.error('Failed to load page: ', err);
    });
});

    
    //alert(`Viewing: ${JSON.stringify(tableData[index])}`);

