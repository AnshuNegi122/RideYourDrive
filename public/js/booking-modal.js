// Booking Modal Implementation

document.addEventListener("DOMContentLoaded", () => {
    // Get DOM elements
    const bookingModal = document.getElementById("booking-modal")
    const bookingForm = document.getElementById("booking-form")
    const closeBookingModalBtns = document.querySelectorAll(".closeBookingModalBtn")
  
    // Close booking modal when clicking close buttons
    if (closeBookingModalBtns) {
      closeBookingModalBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          bookingModal.classList.remove("visible")
          bookingModal.classList.add("hidden")
        })
      })
    }
  
    // Close booking modal when clicking outside the modal content
    if (bookingModal) {
      bookingModal.addEventListener("click", (e) => {
        if (e.target === bookingModal) {
          bookingModal.classList.remove("visible")
          bookingModal.classList.add("hidden")
        }
      })
    }
  
    // Handle booking form submission
    if (bookingForm) {
      bookingForm.addEventListener("submit", async (e) => {
        e.preventDefault()
  
        // Get car ID from modal
        const urlParams = new URLSearchParams(window.location.search);
        const carId = urlParams.get('carId');
  
        // Get form data
        const bookingData = {
          carId: carId,
          pickupLocation: document.getElementById("pickUpLocation").value,
          dropoffLocation: document.getElementById("dropOffLocation").value,
          pickupDate: document.getElementById("pickUpDate").value,
          returnDate: document.getElementById("returnDate").value,
        }
  
        // Get verification data from session storage
        const verificationData = JSON.parse(sessionStorage.getItem("verificationData"))
  
        // Combine booking and verification data
        const completeBookingData = {
          ...bookingData,
          driverLicense: verificationData.driverLicense,
          panCard: verificationData.panCard,
          city: verificationData.city,
          state: verificationData.state,
          zipCode: verificationData.zipCode,
        }
  
        // Validate booking data
        if (!validateBookingForm(bookingData)) {
          return
        }
  
        // Get user info
        const userInfo = JSON.parse(localStorage.getItem("userInfo"))
  
        try {
          // Submit booking data to backend
          const bookingResponse = await fetch("http://localhost:5000/api/bookings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userInfo.token}`,
            },
            body: JSON.stringify(completeBookingData),
          })
  
          const bookingResult = await bookingResponse.json()
  
          if (bookingResponse.ok) {
            // Booking successful
            alert("Car booked successfully!")
  
            // Close booking modal
            bookingModal.classList.remove("visible")
            bookingModal.classList.add("hidden")
  
            // Clear session storage
            sessionStorage.removeItem("verificationData")
  
            // Redirect to bookings page or dashboard
            window.location.href = "dashboard.html#bookings"
          } else {
            // Booking failed
            alert(`Booking failed: ${bookingResult.message}`)
          }
        } catch (error) {
          console.error("Error during booking:", error)
          alert("An error occurred during booking. Please try again.")
        }
      })
    }
  
    // Function to validate the booking form
    function validateBookingForm(data) {
      // Check for empty fields
      for (const [key, value] of Object.entries(data)) {
        if (!value.trim() && key !== "carId") {
          alert(
            `Please fill in all fields. ${key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())} is required.`,
          )
          return false
        }
      }
  
      // Validate dates
      const pickupDate = new Date(data.pickupDate)
      const returnDate = new Date(data.returnDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
  
      if (pickupDate < today) {
        alert("Pickup date cannot be in the past.")
        return false
      }
  
      if (returnDate <= pickupDate) {
        alert("Return date must be after pickup date.")
        return false
      }
  
      return true
    }
  })
  