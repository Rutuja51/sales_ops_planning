// Add active class to current page
        document.addEventListener('DOMContentLoaded', function() {
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

document.getElementById('list_page').addEventListener('click', function() {
    fetch('../pages/order_list.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('contentArea').innerHTML = html;
      })
      .catch(err => {
        console.error('Failed to load page: ', err);
      });
  });

document.getElementById('planning_page').addEventListener('click', function() {
    fetch('../pages/order_plan.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('contentArea').innerHTML = html;
      })
      .catch(err => {
        console.error('Failed to load page: ', err);
      });
  });

document.getElementById('order_page').addEventListener('click', function() {
    fetch('../pages/order_form.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('contentArea').innerHTML = html;
      })
      .catch(err => {
        console.error('Failed to load page: ', err);
      });
  });

document.getElementById('contact_page').addEventListener('click', function() {
    fetch('../pages/order_contact.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('contentArea').innerHTML = html;
      })
      .catch(err => {
        console.error('Failed to load page: ', err);
      });
  });


/*$('#about_page').click(function() {
    console.log('hi');
  $('#contentArea').load('README.md');
});*/