// Handle add company form submission
document.addEventListener('DOMContentLoaded', function() {
    const addCompanyForm = document.querySelector('form');
    
    if (addCompanyForm) {
      addCompanyForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
          companyName: document.querySelector('input[name="name"]').value,
          companyAddress: document.querySelector('input[name="text"]').value,
          companyEmail: document.querySelector('input[name="email"]').value,
          companyMobile: document.querySelector('input[name="number"]').value,
          ownerName: document.querySelectorAll('input[name="name"]')[1].value,
          ownerAddress: document.querySelectorAll('input[name="text"]')[1].value,
          ownerEmail: document.querySelectorAll('input[name="email"]')[1].value,
          ownerMobile: document.querySelectorAll('input[name="number"]')[1].value,
          tradingLicense: document.querySelectorAll('input[name="text"]')[2].value,
          licenseRenewalDate: document.querySelectorAll('input[datepicker]')[0].value,
          startDate: document.querySelectorAll('input[datepicker]')[1].value,
          endDate: document.querySelectorAll('input[datepicker]')[2].value,
          website: document.querySelectorAll('input[name="text"]')[3].value,
          employees: document.querySelectorAll('input[name="number"]')[2].value,
          postalCode: document.querySelectorAll('input[name="number"]')[3].value
        };
        
        try {
          const response = await fetch('/api/companies', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });
          
          const data = await response.json();
          
          if (response.ok) {
            alert('Company added successfully!');
            window.location.href = '/dashboard';
          } else {
            alert(data.message || 'Failed to add company');
          }
        } catch (error) {
          console.error('Error adding company:', error);
          alert('An error occurred while adding the company');
        }
      });
    }
  });