// Verification and Car Booking System

// document.addEventListener("DOMContentLoaded", () => {
//     // Get DOM elements
//     const modal = document.getElementById("modal")
//     const verificationForm = document.getElementById("verification-form")
//     const closeModalBtns = document.querySelectorAll(".closeModalBtn")
//     const bookNowBtns = document.querySelectorAll(".openModalBtn")
  
//     // Add event listeners to all "Book Now" buttons
//     bookNowBtns.forEach((btn) => {
//       btn.addEventListener("click", function (e) {
//         e.preventDefault()
  
//         // Check if user is logged in
//         const userInfo = JSON.parse(localStorage.getItem("userInfo"))
  
//         if (!userInfo || !userInfo.token) {
//           alert("Please login to book a car")
//           window.location.href = "login.html"
//           return
//         }
  
//         // Store car ID in the modal for later use
//         const carId = this.getAttribute("data-car-id")
//         modal.setAttribute("data-car-id", carId)
  
//         // Show the verification modal
//         modal.classList.remove("hidden")
//         modal.classList.add("visible")
//       })
//     })
  
//     // Close modal when clicking close buttons
//     closeModalBtns.forEach((btn) => {
//       btn.addEventListener("click", () => {
//         modal.classList.remove("visible")
//         modal.classList.add("hidden")
//       })
//     })
  
//     // Close modal when clicking outside the modal content
//     modal.addEventListener("click", (e) => {
//       if (e.target === modal) {
//         modal.classList.remove("visible")
//         modal.classList.add("hidden")
//       }
//     })
  
//     // Handle verification form submission
//     verificationForm.addEventListener("submit", async (e) => {
//       e.preventDefault()
  
//       // Get form data
//       const verificationData = {
//         firstName: document.getElementById("grid-first-name").value,
//         lastName: document.getElementById("grid-last-name").value,
//         driverLicense: document.getElementById('grid-driving-license').value,
//         panCard: document.getElementById('grid-pan-card').value,
//         city: document.getElementById("grid-city").value,
//         state: document.getElementById("grid-state").value,
//         zipCode: document.getElementById("grid-zip").value,
//       }
  
//       // Validate form data
//       if (!validateVerificationForm(verificationData)) {
//         return
//       }
  
//       // Get user info and car ID
//       const userInfo = JSON.parse(localStorage.getItem("userInfo"))
//       const carId = modal.getAttribute("data-car-id")
  
//       try {
//         // Submit verification data to backend
//         const verificationResponse = await fetch("http://localhost:5000/api/users/verify", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${userInfo.token}`,
//           },
//           body: JSON.stringify(verificationData),
//         })
  
//         const verificationResult = await verificationResponse.json()
  
//         if (verificationResponse.ok) {
//           // Verification successful, proceed to booking
//           alert("Verification successful! Proceeding to booking.")
  
//           // Close verification modal
//           modal.classList.remove("visible")
//           modal.classList.add("hidden")
  
//           // Open booking modal or redirect to booking page
//           openBookingModal(carId, verificationData)
//         } else {
//           // Verification failed
//           alert(`Verification failed: ${verificationResult.message}`)
//         }
//       } catch (error) {
//         console.error("Error during verification:", error)
//         alert("An error occurred during verification. Please try again.")
//       }
//     })
  
//     // Function to validate the verification form
//     function validateVerificationForm(data) {
//       // Check for empty fields
//       for (const [key, value] of Object.entries(data)) {
//         if (!value.trim()) {
//           alert(
//             `Please fill in all fields. ${key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())} is required.`,
//           )
//           return false
//         }
//       }
  
//       // Validate driver's license (basic format check)
//       const driverLicenseRegex = /^[A-Z0-9]{8,16}$/
//       if (!driverLicenseRegex.test(data.driverLicense)) {
//         alert("Please enter a valid driver's license number (8-16 alphanumeric characters).")
//         return false
//       }
  
//       // Validate PAN card (Indian PAN format: AAAAA0000A)
//       const panCardRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
//       if (!panCardRegex.test(data.panCard)) {
//         alert("Please enter a valid PAN card number (format: AAAAA0000A).")
//         return false
//       }
  
//       // Validate ZIP code (5-6 digits)
//       const zipCodeRegex = /^\d{5,6}$/
//       if (!zipCodeRegex.test(data.zipCode)) {
//         alert("Please enter a valid ZIP code (5-6 digits).")
//         return false
//       }
  
//       return true
//     }
  
//     // Function to open the booking modal or redirect to booking page
//     function openBookingModal(carId, verificationData) {
//       // Store verification data in session storage for booking process
//       sessionStorage.setItem("verificationData", JSON.stringify(verificationData))
  
//       // Check if booking modal exists
//       const bookingModal = document.getElementById("booking-modal")
  
//       if (bookingModal) {
//         // Set car ID for booking
//         bookingModal.setAttribute("data-car-id", carId)
  
//         // Show booking modal
//         bookingModal.classList.remove("hidden")
//         bookingModal.classList.add("visible")
  
//         // Pre-fill any relevant fields from verification data
//         const cityField = bookingModal.querySelector('input[name="city"]')
//         if (cityField) cityField.value = verificationData.city
  
//         const stateField = bookingModal.querySelector('input[name="state"]')
//         if (stateField) stateField.value = verificationData.state
//       } else {
//         // If no booking modal exists, redirect to booking page with car ID
//         window.location.href = `booking.html?carId=${carId}`
//       }
//     }
//   })
  

// verification.js - Create this file in your frontend directory

document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const modal = document.getElementById('verification-modal');
  const verificationForm = document.getElementById('verification-form');
  const closeModalBtns = document.querySelectorAll('.closeModalBtn');
  const bookNowBtns = document.querySelectorAll('.openModalBtn');

  // Add event listeners to all "Book Now" buttons
  bookNowBtns.forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      
      // Check if user is logged in
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      
      if (!userInfo || !userInfo.token) {
        alert('Please login to book a car');
        window.location.href = 'login.html';
        return;
      }
      
      // Store car ID for later use
      const carId = this.getAttribute('data-car-id');
      
      try {
        // Check if user is already verified
        const response = await fetch('http://localhost:5000/api/users/verification-status', {
          headers: {
            'Authorization': `Bearer ${userInfo.token}`
          }
        });
        
        const data = await response.json();
        
        if (response.ok && data.isVerified) {
          // User is already verified, proceed to booking
          proceedToBooking(carId);
        } else {
          // User needs verification, show verification modal
          showVerificationModal(carId);
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
        // If error, show verification modal as fallback
        showVerificationModal(carId);
      }
    });
  });
  
  // Function to show verification modal
  function showVerificationModal(carId) {
    if (!modal) {
      console.error('Verification modal not found in the DOM');
      return;
    }
    
    // Store car ID in the modal
    modal.setAttribute('data-car-id', carId);
    
    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('visible');
  }
  
  // Function to proceed to booking
  function proceedToBooking(carId) {
    // Redirect to booking page or show booking modal
    window.location.href = `booking.html?carId=${carId}`;
  }
  
  // Close modal when clicking close buttons
  if (closeModalBtns) {
    closeModalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.remove('visible');
        modal.classList.add('hidden');
      });
    });
  }
  
  // Close modal when clicking outside the modal content
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('visible');
        modal.classList.add('hidden');
      }
    });
  }
  
  // Handle verification form submission
  if (verificationForm) {
    verificationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Get form data
      const formData = {
        firstName: document.getElementById('grid-first-name').value,
        lastName: document.getElementById('grid-last-name').value,
        driverLicense: document.querySelector('input[placeholder="Enter Driving License"]').value,
        panCard: document.querySelector('input[placeholder="Enter Pan Card"]').value,
        city: document.getElementById('grid-city').value,
        state: document.getElementById('grid-state').value,
        zipCode: document.getElementById('grid-zip').value
      };
      
      // Validate form data
      if (!validateVerificationForm(formData)) {
        return;
      }
      
      // Get user info and car ID
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const carId = modal.getAttribute('data-car-id');
      
      try {
        // Submit verification data to backend
        const response = await fetch('http://localhost:5000/api/users/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}`
          },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Verification successful
          alert('Verification successful! You can now book cars.');
          
          // Close verification modal
          modal.classList.remove('visible');
          modal.classList.add('hidden');
          
          // Proceed to booking
          proceedToBooking(carId);
        } else {
          alert(`Verification failed: ${data.message}`);
        }
      } catch (error) {
        console.error('Error during verification:', error);
        alert('An error occurred during verification. Please try again.');
      }
    });
  }
  
  // Function to validate the verification form
  function validateVerificationForm(data) {
    // Check for empty fields
    for (const [key, value] of Object.entries(data)) {
      if (!value.trim()) {
        alert(`Please fill in all fields. ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required.`);
        return false;
      }
    }
    
    // Validate driver's license (basic format check)
    const driverLicenseRegex = /^[A-Z0-9]{8,16}$/;
    if (!driverLicenseRegex.test(data.driverLicense)) {
      alert('Please enter a valid driver\'s license number (8-16 alphanumeric characters).');
      return false;
    }
    
    // Validate PAN card (Indian PAN format: AAAAA0000A)
    const panCardRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panCardRegex.test(data.panCard)) {
      alert('Please enter a valid PAN card number (format: AAAAA0000A).');
      return false;
    }
    
    // Validate ZIP code (5-6 digits)
    const zipCodeRegex = /^\d{5,6}$/;
    if (!zipCodeRegex.test(data.zipCode)) {
      alert('Please enter a valid ZIP code (5-6 digits).');
      return false;
    }
    
    return true;
  }
});