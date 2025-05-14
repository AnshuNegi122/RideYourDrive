document.getElementById("addCompanyForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const companyData = {
    companyName: document.querySelector('input[name="companyName"]').value,
    companyAddress: document.querySelector('input[name="companyAddress"]').value,
    companyEmail: document.querySelector('input[name="companyEmail"]').value,
    companyMobile: document.querySelector('input[name="companyMobile"]').value,
    ownerName: document.querySelector('input[name="ownerName"]').value,
    ownerEmail: document.querySelector('input[name="ownerEmail"]').value,
    ownerAddress: document.querySelector('input[name="ownerAddress"]').value,
    ownerMobile: document.querySelector('input[name="ownerMobile"]').value,
    tradingLicense: document.querySelector('input[name="tradingLicense"]').value,
    licenseRenewalDate: document.querySelector('input[name="licenseRenewalDate"]').value,
    startDate: document.querySelector('input[name="startDate"]').value,
    endDate: document.querySelector('input[name="endDate"]').value,
    website: document.querySelector('input[name="website"]').value,
    employees: document.querySelector('input[name="employees"]').value,
    postalCode: document.querySelector('input[name="postalCode"]').value,
  };
  
  localStorage.setItem('registeredCompany', JSON.stringify(companyData));

  try {
    const response = await fetch("http://localhost:5000/api/company", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Include JWT token
      },
      body: JSON.stringify(companyData),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Company added successfully!");
      window.location.href = "/dashboard.html"; // Redirect to dashboard
    } else {
      alert(data.message || "Failed to add company");
    }
  } catch (error) {
    console.error("Error adding company:", error);
    alert("An error occurred while adding the company");
  }
});
