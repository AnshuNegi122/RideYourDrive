// Function to fix car registration form submission
function fixCarRegistration() {
  const form = document.getElementById("add-car-form");

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Get all form fields
      const formData = {
        companyName: document.getElementById("companyName").value,
        registrationNumber: document.getElementById("registrationNumber").value,
        brand: document.getElementById("carBrand").value,
        model: document.getElementById("carModel").value,
        modelYear: document.getElementById("modelYear").value,
        color: document.getElementById("carColor").value,
        vehicleType: document.getElementById("vehicleType").value,
        numberOfSeats: document.getElementById("numberOfSeats").value,
        engineNumber: document.getElementById("engineNumber").value,
        chasisNumber: document.getElementById("chasisNumber").value,
        engineCapacity: document.getElementById("engineCapacity").value,
        engineType: document.getElementById("engineType").value,
        transmissionType: "Automatic", // Default value
        insurancePolicyType: document.getElementById("insurancePolicyType")
          .value,
        insurancePolicyNumber: document.getElementById("insurancePolicyNumber")
          .value,
        policyStartDate: document.getElementById("policyStartDate").value,
        policyEndDate: document.getElementById("policyEndDate").value,
        dailyRate: 2000, // Default value
        location: "Dehradun, Uttarakhand", // Default value
        images: [], // Populate from file input if needed
      };

      console.log("Form data being sent:", formData);

      // Get token from localStorage
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      if (!userInfo || !userInfo.token) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/cars", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Car added successfully!");
          window.location.href = "dashboard.html";
        } else {
          console.error("Error response:", data);
          alert(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
      }
    });
  }
}

fixCarRegistration()