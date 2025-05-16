// verification.js - Handles user verification

const Verification = {
  init() {
    this.setupVerificationForm();
  },

  setupVerificationForm() {
    const verificationForm = document.getElementById("verification-form");
    if (!verificationForm) return;

    verificationForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Get form data
      const verificationData = {
        firstName: document.getElementById("grid-first-name").value,
        lastName: document.getElementById("grid-last-name").value,
        driverLicense: document.getElementById("grid-driving-license").value,
        panCard: document.getElementById("grid-pan-card").value,
        city: document.getElementById("grid-city").value,
        state: document.getElementById("grid-state").value,
        zipCode: document.getElementById("grid-zip").value,
      };

      // Validate form data
      if (!this.validateVerificationForm(verificationData)) {
        return;
      }

      // Get user info and car ID
      const userInfo = Auth.getUserInfo();
      const modal = document.getElementById("modal");
      const carId = modal.getAttribute("data-car-id");

      try {
        // Submit verification data to backend
        const verificationResponse = await fetch(
          "http://localhost:5000/api/users/verify",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userInfo.token}`,
            },
            body: JSON.stringify(verificationData),
          }
        );

        const verificationResult = await verificationResponse.json();

        if (verificationResponse.ok) {
          // Verification successful, proceed to booking
          alert("Verification successful! Proceeding to booking.");

          // Close verification modal
          UI.hideModal("modal");

          // Store verification data and open booking modal
          sessionStorage.setItem(
            "verificationData",
            JSON.stringify(verificationData)
          );
          Booking.openBookingModal(carId);
        } else {
          // Verification failed
          alert(`Verification failed: ${verificationResult.message}`);
        }
      } catch (error) {
        console.error("Error during verification:", error);
        alert("An error occurred during verification. Please try again.");
      }
    });
  },

  validateVerificationForm(data) {
    // Check for empty fields
    for (const [key, value] of Object.entries(data)) {
      if (!value.trim()) {
        alert(
          `Please fill in all fields. ${key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())} is required`
        );
        return false;
      }
    }

    // Validate driver's license (basic format check)
    const driverLicenseRegex = /^[A-Z0-9]{8,16}$/;
    if (!driverLicenseRegex.test(data.driverLicense)) {
      alert(
        "Please enter a valid driver's license number (8-16 alphanumeric characters)."
      );
      return false;
    }

    // Validate PAN card (Indian PAN format: AAAAA0000A)
    const panCardRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panCardRegex.test(data.panCard)) {
      alert("Please enter a valid PAN card number (format: AAAAA0000A).");
      return false;
    }

    // Validate ZIP code (5-6 digits)
    const zipCodeRegex = /^\d{5,6}$/;
    if (!zipCodeRegex.test(data.zipCode)) {
      alert("Please enter a valid ZIP code (5-6 digits).");
      return false;
    }

    return true;
  },

  async checkVerificationStatus() {
    const userInfo = Auth.getUserInfo();
    if (!userInfo) return false;

    try {
      const verificationResponse = await fetch(
        "http://localhost:5000/api/users/verify",
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      const verificationData = await verificationResponse.json();

      return {
        isVerified: verificationResponse.ok && verificationData.isVerified,
        data: verificationData.verificationData,
      };
    } catch (error) {
      console.error("Error checking verification status:", error);
      return { isVerified: false };
    }
  },
};
