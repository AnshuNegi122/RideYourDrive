// Add company form submission
document.getElementById("add-company-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get all form fields
    const formData = {
      companyName: document.getElementById('companyName').value,
      companyAddress: document.getElementById('companyAddress').value,
      companyEmail: document.getElementById('companyEmail').value,
      companyMobile: document.getElementById('companyMobile').value,
      ownerName: document.getElementById('ownerName').value,
      ownerAddress: document.getElementById('ownerAddress').value,
      ownerEmail: document.getElementById('ownerEmail').value,
      ownerMobile: document.getElementById('ownerMobile').value,
      tradingLicense: document.getElementById('tradingLicense').value,
      licenseRenewalDate: document.getElementById('licenseRenewalDate').value,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      website: document.getElementById('website').value,
      numberOfEmployees: document.getElementById('numberOfEmployees').value,
      postalCode: document.getElementById('postalCode').value
    };


    // Get token from localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!userInfo || !userInfo.token) {
      alert('Please login first');
      window.location.href = 'login.html';
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Company registered successfully!');
        window.location.href = 'index.html';
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  });