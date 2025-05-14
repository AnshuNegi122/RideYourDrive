document.getElementById("addCarForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const carData = {
    companyName: document.querySelector('input[name="companyName"]').value, // Assuming you have a way to get the company ID
    registrationNo: document.querySelector('input[name="registrationNo"]').value,
    carBrand: document.querySelector('input[name="carBrand"]').value,
    carModel: document.querySelector('input[name="carModel"]').value,
    modelYear: document.querySelector('input[name="modelYear"]').value,
    carColor: document.querySelector('input[name="carColor"]').value,
    vehicleType: document.querySelector('input[name="vehicleType"]').value,
    noOfSeats: document.querySelector('input[name="noOfSeats"]').value,
    engineNo: document.querySelector('input[name="engineNo"]').value,
    chasisNo: document.querySelector('input[name="chasisNo"]').value,
    engineCapacity: document.querySelector('input[name="engineCapacity"]').value,
    engineType: document.querySelector('input[name="engineType"]').value,
    insurancePolicyType: document.querySelector('input[name="insurancePolicyType"]').value,
    insurancePolicyNumber: document.querySelector('input[name="insurancePolicyNumber"]').value,
    policyStartDate: document.querySelector('input[name="policyStartDate"]').value,
    policyEndDate: document.querySelector('input[name="policyEndDate"]').value,
  };

  try {
    const response = await fetch("http://localhost:5000/api/car", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Include JWT token
      },
      body: JSON.stringify(carData),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Car added successfully!");
      window.location.href = "/dashboard.html"; // Redirect to dashboard
    } else {
      alert(data.message || "Failed to add car");
    }
  } catch (error) {
    console.error("Error adding car:", error);
    alert("An error occurred while adding the car");
  }
});
