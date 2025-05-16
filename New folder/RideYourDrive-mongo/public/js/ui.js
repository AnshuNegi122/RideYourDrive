// ui.js - Handles UI-related functionality

const UI = {
  init() {
    this.setupModalCloseButtons();
  },
  
  setupBookNowButtons() {
    const bookNowBtns = document.querySelectorAll(".openModalBtn");
    
    bookNowBtns.forEach((btn) => {
      btn.addEventListener("click", async function (e) {
        e.preventDefault();
        
        // Check if user is logged in
        if (!Auth.isLoggedIn()) {
          alert("Please login to book a car");
          window.location.href = "login.html";
          return;
        }
        
        // Store car ID for later use
        const carId = this.getAttribute("data-car-id");
        
        // Check if user is already verified
        const verificationStatus = await Verification.checkVerificationStatus();
        
        if (verificationStatus.isVerified) {
          // User is already verified, proceed to booking
          Booking.openBookingModal(carId, verificationStatus.data);
        } else {
          // User needs verification, show verification modal
          const verificationModal = document.getElementById("modal");
          verificationModal.setAttribute("data-car-id", carId);
          UI.showModal("modal");
        }
      });
    });
  },
  
  setupModalCloseButtons() {
    // Verification modal close buttons
    const closeModalBtns = document.querySelectorAll(".closeModalBtn");
    const modal = document.getElementById("modal");
    
    if (closeModalBtns && modal) {
      closeModalBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          this.hideModal("modal");
        });
      });
      
      // Close modal when clicking outside
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.hideModal("modal");
        }
      });
    }
    
    // Booking modal close buttons
    const closeBookingModalBtns = document.querySelectorAll(".closeBookingModalBtn");
    const bookingModal = document.getElementById("booking-modal");
    
    if (closeBookingModalBtns && bookingModal) {
      closeBookingModalBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          this.hideModal("booking-modal");
        });
      });
      
      // Close booking modal when clicking outside
      bookingModal.addEventListener("click", (e) => {
        if (e.target === bookingModal) {
          this.hideModal("booking-modal");
        }
      });
    }
  },
  
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("visible");
    }
  },
  
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("visible");
      modal.classList.add("hidden");
    }
  }
};
