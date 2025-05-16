// booking.js - Handles booking functionality

const Booking = {
  init() {
    this.setupBookingForm();
    this.setupDateInputs();
  },
  
  setupDateInputs() {
    const pickUpDateInput = document.getElementById("pickUpDate");
    const returnDateInput = document.getElementById("returnDate");
    
    if (pickUpDateInput && returnDateInput) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const formatDate = (date) => {
        return date.toISOString().split("T")[0];
      };
      
      pickUpDateInput.min = formatDate(today);
      returnDateInput.min = formatDate(tomorrow);
      
      // Set default values
      pickUpDateInput.value = formatDate(today);
      returnDateInput.value = formatDate(tomorrow);
      
      // Add event listeners for date changes
      pickUpDateInput.addEventListener("change", () => this.updateBookingSummary());
      returnDateInput.addEventListener("change", () => this.updateBookingSummary());
    }
  },
  
  setupBookingForm() {
    const bookingForm = document.getElementById("booking-form");
    if (!bookingForm) return;
    
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      // Get car ID
      const bookingModal = document.getElementById("booking-modal");
      const carId = bookingModal.getAttribute("data-car-id");
      
      // Get form data
      const bookingData = {
        carId: carId,
        pickupLocation: document.getElementById("pickUpLocation").value,
        dropoffLocation: document.getElementById("dropOffLocation").value,
        pickupDate: document.getElementById("pickUpDate").value,
        returnDate: document.getElementById("returnDate").value,
      };
      
      // Get verification data from session storage
      const verificationData = JSON.parse(sessionStorage.getItem("verificationData"));
      
      // Combine booking and verification data
      const completeBookingData = {
        ...bookingData,
        driverLicense: verificationData.driverLicense,
        panCard: verificationData.panCard,
        city: verificationData.city,
        state: verificationData.state,
        zipCode: verificationData.zipCode,
      };
      
      // Validate booking data
      if (!this.validateBookingForm(bookingData)) {
        return;
      }
      
      // Get user info
      const userInfo = Auth.getUserInfo();
      
      try {
        // Submit booking data to backend
        const bookingResponse = await fetch("http://localhost:5000/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
          },
          body: JSON.stringify(completeBookingData),
        });
        
        const bookingResult = await bookingResponse.json();
        
        if (bookingResponse.ok) {
          // Booking successful
          alert("Car booked successfully!");
          
          // Close booking modal
          UI.hideModal("booking-modal");
          
          // Clear session storage
          sessionStorage.removeItem("verificationData");
          
          // Redirect to bookings page or dashboard
          window.location.href = "dashboard.html#bookings";
        } else {
          // Booking failed
          alert(`Booking failed: ${bookingResult.message}`);
        }
      } catch (error) {
        console.error("Error during booking:", error);
        alert("An error occurred during booking. Please try again.");
      }
    });
  },
  
  validateBookingForm(data) {
    // Check for empty fields
    for (const [key, value] of Object.entries(data)) {
      if (!value.trim() && key !== "carId") {
        alert(
          `Please fill in all fields. ${key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())} is required.`
        );
        return false;
      }
    }
    
    // Validate dates
    const pickupDate = new Date(data.pickupDate);
    const returnDate = new Date(data.returnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (pickupDate < today) {
      alert("Pickup date cannot be in the past.");
      return false;
    }
    
    if (returnDate <= pickupDate) {
      alert("Return date must be after pickup date.");
      return false;
    }
    
    return true;
  },
  
  openBookingModal(carId) {
    // Check if booking modal exists
    const bookingModal = document.getElementById("booking-modal");
    
    if (bookingModal) {
      // Set car ID for booking
      bookingModal.setAttribute("data-car-id", carId);
      
      // Show booking modal
      UI.showModal("booking-modal");
      
      // Load car details
      this.loadCarDetails(carId);
    } else {
      // If no booking modal exists, we need to create one
      this.createAndAppendBookingModal(carId);
    }
  },
  
  async loadCarDetails(carId) {
    const summaryCarElement = document.getElementById("summary-car");
    const summaryRateElement = document.getElementById("summary-rate");
    const bookingModal = document.getElementById("booking-modal");
    
    if (!summaryCarElement || !summaryRateElement || !bookingModal) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/cars/${carId}`);
      const carData = await response.json();
      
      if (response.ok) {
        // Update car details in summary
        summaryCarElement.textContent = `${carData.brand} ${carData.model} (${carData.modelYear})`;
        summaryRateElement.textContent = `₹${carData.dailyRate}/day`;
        
        // Store daily rate as a data attribute for calculations
        bookingModal.setAttribute("data-daily-rate", carData.dailyRate);
        
        // Update booking summary
        this.updateBookingSummary();
      } else {
        summaryCarElement.textContent = "Error loading car details";
        summaryRateElement.textContent = "N/A";
      }
    } catch (error) {
      console.error("Error loading car details:", error);
      summaryCarElement.textContent = "Error loading car details";
      summaryRateElement.textContent = "N/A";
    }
  },
  
  updateBookingSummary() {
    const pickUpDateInput = document.getElementById("pickUpDate");
    const returnDateInput = document.getElementById("returnDate");
    const bookingModal = document.getElementById("booking-modal");
    const summaryDaysElement = document.getElementById("summary-days");
    const summarySubtotalElement = document.getElementById("summary-subtotal");
    const summaryTaxesElement = document.getElementById("summary-taxes");
    const summaryTotalElement = document.getElementById("summary-total");
    
    if (!pickUpDateInput || !returnDateInput || !bookingModal || 
        !summaryDaysElement || !summarySubtotalElement || 
        !summaryTaxesElement || !summaryTotalElement) return;
    
    const pickUpDate = new Date(pickUpDateInput.value);
    const returnDate = new Date(returnDateInput.value);
    const dailyRate = Number.parseFloat(bookingModal.getAttribute("data-daily-rate") || "0");
    
    // Calculate number of days
    const timeDiff = returnDate.getTime() - pickUpDate.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (days <= 0) {
      summaryDaysElement.textContent = "Invalid dates";
      summarySubtotalElement.textContent = "₹0";
      summaryTaxesElement.textContent = "₹0";
      summaryTotalElement.textContent = "₹0";
      return;
    }
    
    // Calculate costs
    const subtotal = days * dailyRate;
    const taxRate = 0.18; // 18% GST
    const taxes = subtotal * taxRate;
    const total = subtotal + taxes;
    
    // Update summary
    summaryDaysElement.textContent = `${days} day/${days > 1 ? "s" : ""}`;
    summarySubtotalElement.textContent = `₹${subtotal.toLocaleString()}`;
    summaryTaxesElement.textContent = `₹${taxes.toLocaleString()}`;
    summaryTotalElement.textContent = `₹${total.toLocaleString()}`;
    
    // Store total in data attribute for booking
    bookingModal.setAttribute("data-total-amount", total.toString());
  },
  
  createAndAppendBookingModal(carId) {
    // Create booking modal element
    const bookingModalDiv = document.createElement("div");
    bookingModalDiv.id = "booking-modal";
    bookingModalDiv.className = "fixed inset-0 bg-gray-300 bg-opacity-50 flex justify-center items-center z-50 hidden";
    bookingModalDiv.setAttribute("data-car-id", carId);
    
    // Fetch the booking modal HTML template
    fetch("booking-modal.html")
      .then((response) => response.text())
      .then((html) => {
        bookingModalDiv.innerHTML = html;
        document.body.appendChild(bookingModalDiv);
        
        // Show the modal
        UI.showModal("booking-modal");
        
        // Setup event listeners for the new modal
        UI.setupModalCloseButtons();
        
        // Initialize booking functionality
        this.setupBookingForm();
        this.setupDateInputs();
        this.loadCarDetails(carId);
      })
      .catch((error) => {
        console.error("Error loading booking modal template:", error);
        alert("Error loading booking form. Please try again.");
      });
  }
};
