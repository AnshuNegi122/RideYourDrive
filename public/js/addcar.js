// Handle add car form submission
document.addEventListener('DOMContentLoaded', function() {
    const addCarForm = document.querySelector('form');
    
    if (addCarForm) {
      addCarForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
          companyName: document.querySelector('input[name="name"]').value,
          registrationNo: document.querySelector('input[name="text"]').value,
          carBrand: document.querySelectorAll('input[name="text"]')[1].value,
          carModel: document.querySelector('input[name="number"]').value,
          modelYear: document.querySelector('input[name="number"]').value,
          carColor: document.querySelectorAll('input[name="text"]')[2].value,
          vehicleType: document.querySelectorAll('input[name="text"]')[3].value,
          seats: document.querySelectorAll('input[name="number"]')[1].value,
          engineNo: document.querySelectorAll('input[name="number"]')[2].value,
          chasisNo: document.querySelectorAll('input[name="number"]')[3].value,
          engineCapacity: document.querySelectorAll('input[name="text"]')[4].value,
          engineType: document.querySelectorAll('input[name="text"]')[5].value,
          insurancePolicyType: document.querySelectorAll('input[name="text"]')[6].value,
          insurancePolicyNumber: document.querySelectorAll('input[name="text"]')[7].value,
          policyStartDate: document.querySelectorAll('input[datepicker]')[0].value,
          policyEndDate: document.querySelectorAll('input[datepicker]')[1].value
        };
        
        try {
          const response = await fetch('/api/cars', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });
          
          const data = await response.json();
          
          if (response.ok) {
            alert('Car added successfully!');
            window.location.href = '/dashboard';
          } else {
            alert(data.message || 'Failed to add car');
          }
        } catch (error) {
          console.error('Error adding car:', error);
          alert('An error occurred while adding the car');
        }
      });
    }
  });