// Booking Summary Calculator

document.addEventListener("DOMContentLoaded", () => {
    // Get DOM elements
    const bookingModal = document.getElementById("booking-modal")
    const pickUpDateInput = document.getElementById("pickUpDate")
    const returnDateInput = document.getElementById("returnDate")
  
    // Summary elements
    const summaryCarElement = document.getElementById("summary-car")
    const summaryRateElement = document.getElementById("summary-rate")
    const summaryDaysElement = document.getElementById("summary-days")
    const summarySubtotalElement = document.getElementById("summary-subtotal")
    const summaryTaxesElement = document.getElementById("summary-taxes")
    const summaryTotalElement = document.getElementById("summary-total")
  
    // Set minimum dates for date inputs
    if (pickUpDateInput && returnDateInput) {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
  
      const formatDate = (date) => {
        return date.toISOString().split("T")[0]
      }
  
      pickUpDateInput.min = formatDate(today)
      returnDateInput.min = formatDate(tomorrow)
  
      // Set default values
      pickUpDateInput.value = formatDate(today)
      returnDateInput.value = formatDate(tomorrow)
    }
  
    // Load car details when booking modal is shown
    if (bookingModal) {
      bookingModal.addEventListener("transitionend", () => {
        if (bookingModal.classList.contains("visible")) {
          loadCarDetails()
        }
      })
  
      // Also try to load when the DOM is ready
      if (bookingModal.classList.contains("visible")) {
        loadCarDetails()
      }
    }
  
    // Update booking summary when dates change
    if (pickUpDateInput && returnDateInput) {
      pickUpDateInput.addEventListener("change", updateBookingSummary)
      returnDateInput.addEventListener("change", updateBookingSummary)
    }
  
    // Function to load car details
    async function loadCarDetails() {
      
      const urlParams = new URLSearchParams(window.location.search);
      const carId = urlParams.get('carId');
  
      if (!carId) {
        console.error("No car ID found")
        return
      }
  
      try {
        const response = await fetch(`http://localhost:5000/api/cars/${carId}`)
        const carData = await response.json()
  
        if (response.ok) {
          // Update car details in summary
          summaryCarElement.textContent = `${carData.brand} ${carData.model} (${carData.modelYear})`
          summaryRateElement.textContent = `₹${carData.dailyRate}/day`
  
          // Store daily rate as a data attribute for calculations
          bookingModal.setAttribute("data-daily-rate", carData.dailyRate)
  
          // Update booking summary
          updateBookingSummary()
        } else {
          summaryCarElement.textContent = "Error loading car details"
          summaryRateElement.textContent = "N/A"
        }
      } catch (error) {
        console.error("Error loading car details:", error)
        summaryCarElement.textContent = "Error loading car details"
        summaryRateElement.textContent = "N/A"
      }
    }
  
    // Function to update booking summary
    function updateBookingSummary() {
      const pickUpDate = new Date(pickUpDateInput.value)
      const returnDate = new Date(returnDateInput.value)
      const dailyRate = Number.parseFloat(bookingModal.getAttribute("data-daily-rate") || "0")
      // const dailyRate = Number.parseFloat(bookingModal.getAttribute("data-daily-rate") || "0")
  
      // Calculate number of days
      const timeDiff = returnDate.getTime() - pickUpDate.getTime()
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24))
  
      if (days <= 0) {
        summaryDaysElement.textContent = "Invalid dates"
        summarySubtotalElement.textContent = "₹0"
        summaryTaxesElement.textContent = "₹0"
        summaryTotalElement.textContent = "₹0"
        return
      }
  
      // Calculate costs
      const subtotal = days * dailyRate
      const taxRate = 0.18 // 18% GST
      const taxes = subtotal * taxRate
      const total = subtotal + taxes
  
      // Update summary
      summaryDaysElement.textContent = `${days} day${days > 1 ? "s" : ""}`
      summarySubtotalElement.textContent = `₹${subtotal.toLocaleString()}`
      summaryTaxesElement.textContent = `₹${taxes.toLocaleString()}`
      summaryTotalElement.textContent = `₹${total.toLocaleString()}`
  
      // Store total in data attribute for booking
      bookingModal.setAttribute("data-total-amount", total.toString())
    }
  })
  