// Verification and Car Booking System

document.addEventListener("DOMContentLoaded", () => {
    // Get DOM elements
    const modal = document.getElementById("modal")
    const verificationForm = document.getElementById("verification-form")
    const closeModalBtns = document.querySelectorAll(".closeModalBtn")
    const bookNowBtns = document.querySelectorAll(".openModalBtn")
  
    // Add event listeners to all "Book Now" buttons
    bookNowBtns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault()
  
        // Check if user is logged in
        const userInfo = JSON.parse(localStorage.getItem("userInfo"))
  
        if (!userInfo || !userInfo.token) {
          alert("Please login to book a car")
          window.location.href = "login.html"
          return
        }
  
        // Store car ID in the modal for later use
        const carId = this.getAttribute("data-car-id")
        modal.setAttribute("data-car-id", carId)
  
        // Show the verification modal
        modal.classList.remove("hidden")
        modal.classList.add("visible")
      })
    })
  
    // Close modal when clicking close buttons
    closeModalBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        modal.classList.remove("visible")
        modal.classList.add("hidden")
      })
    })
  
    // Close modal when clicking outside the modal content
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("visible")
        modal.classList.add("hidden")
      }
    })
  
    // Handle verification form submission
    verificationForm.addEventListener("submit", async (e) => {
      e.preventDefault()
  
      // Get form data
      const verificationData = {
        firstName: document.getElementById("grid-first-name").value,
        lastName: document.getElementById("grid-last-name").value,
        driverLicense: document.getElementById('grid-driving-license').value,
        panCard: document.getElementById('grid-pan-card').value,
        city: document.getElementById("grid-city").value,
        state: document.getElementById("grid-state").value,
        zipCode: document.getElementById("grid-zip").value,
      }
  
      // Validate form data
      if (!validateVerificationForm(verificationData)) {
        return
      }
  
      // Get user info and car ID
      const userInfo = JSON.parse(localStorage.getItem("userInfo"))
      const carId = modal.getAttribute("data-car-id")
  
      try {
        // Submit verification data to backend
        const verificationResponse = await fetch("http://localhost:5000/api/users/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
          },
          body: JSON.stringify(verificationData),
        })
  
        const verificationResult = await verificationResponse.json()
  
        if (verificationResponse.ok) {
          // Verification successful, proceed to booking
          alert("Verification successful! Proceeding to booking.")
  
          // Close verification modal
          modal.classList.remove("visible")
          modal.classList.add("hidden")
  
          // Open booking modal or redirect to booking page
          openBookingModal(carId, verificationData)
        } else {
          // Verification failed
          alert(`Verification failed: ${verificationResult.message}`)
        }
      } catch (error) {
        console.error("Error during verification:", error)
        alert("An error occurred during verification. Please try again.")
      }
    })
  
    // Function to validate the verification form
    function validateVerificationForm(data) {
      // Check for empty fields
      for (const [key, value] of Object.entries(data)) {
        if (!value.trim()) {
          alert(
            `Please fill in all fields. ${key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())} is required.`,
          )
          return false
        }
      }
  
      // Validate driver's license (basic format check)
      const driverLicenseRegex = /^[A-Z0-9]{8,16}$/
      if (!driverLicenseRegex.test(data.driverLicense)) {
        alert("Please enter a valid driver's license number (8-16 alphanumeric characters).")
        return false
      }
  
      // Validate PAN card (Indian PAN format: AAAAA0000A)
      const panCardRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
      if (!panCardRegex.test(data.panCard)) {
        alert("Please enter a valid PAN card number (format: AAAAA0000A).")
        return false
      }
  
      // Validate ZIP code (5-6 digits)
      const zipCodeRegex = /^\d{5,6}$/
      if (!zipCodeRegex.test(data.zipCode)) {
        alert("Please enter a valid ZIP code (5-6 digits).")
        return false
      }
  
      return true
    }
  
    // Function to open the booking modal or redirect to booking page
    function openBookingModal(carId, verificationData) {
      // Store verification data in session storage for booking process
      sessionStorage.setItem("verificationData", JSON.stringify(verificationData))
  
      // Check if booking modal exists
      const bookingModal = document.getElementById("booking-modal")
  
      if (bookingModal) {
        // Set car ID for booking
        bookingModal.setAttribute("data-car-id", carId)
  
        // Show booking modal
        bookingModal.classList.remove("hidden")
        bookingModal.classList.add("visible")
  
        // Pre-fill any relevant fields from verification data
        const cityField = bookingModal.querySelector('input[name="city"]')
        if (cityField) cityField.value = verificationData.city
  
        const stateField = bookingModal.querySelector('input[name="state"]')
        if (stateField) stateField.value = verificationData.state
      } else {
        // If no booking modal exists, redirect to booking page with car ID
        window.location.href = `booking.html?carId=${carId}`
      }
    }
  })
  