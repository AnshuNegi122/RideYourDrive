// Integration script for index.html

document.addEventListener("DOMContentLoaded", () => {
  // Update auth UI
  updateAuthUI()

  // Add event listeners to book now buttons
  setupBookNowButtons()

  // Setup modal close buttons
  setupModalCloseButtons()

  // Check if we need to fetch cars
  if (document.querySelector(".grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-3.gap-8")) {
    fetchCars()
  }
})

// Function to update UI based on authentication status
function updateAuthUI() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"))
  const loginLink = document.querySelector('header a[href="login.html"]')

  if (userInfo && userInfo.token && loginLink) {
    // User is logged in
    // Replace login link with user dropdown
    const headerNav = loginLink.parentElement
    loginLink.remove()

    // Create user dropdown
    const userDropdown = document.createElement("div")
    userDropdown.className = "relative"
    userDropdown.innerHTML = `
      <button id="userDropdownBtn" class="flex items-center space-x-1 text-white hover:text-gray-300">
        <span>${userInfo.name}</span>
        <i class="fas fa-chevron-down text-xs"></i>
      </button>
      <div id="userDropdownMenu" class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 hidden">
        <a href="profile.html" class="block px-4 py-2 text-sm text-white hover:bg-gray-700">My Profile</a>
        <a href="dashboard.html" class="block px-4 py-2 text-sm text-white hover:bg-gray-700">Dashboard</a>
        <a href="#" id="logoutBtn" class="block px-4 py-2 text-sm text-white hover:bg-gray-700">Logout</a>
      </div>
    `

    headerNav.appendChild(userDropdown)

    // Add event listeners for dropdown
    const dropdownBtn = document.getElementById("userDropdownBtn")
    const dropdownMenu = document.getElementById("userDropdownMenu")

    dropdownBtn.addEventListener("click", () => {
      dropdownMenu.classList.toggle("hidden")
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.add("hidden")
      }
    })

    // Add logout functionality
    document.getElementById("logoutBtn").addEventListener("click", (e) => {
      e.preventDefault()
      localStorage.removeItem("userInfo")
      window.location.reload()
    })
  }
}

// Function to set up Book Now buttons
function setupBookNowButtons() {
  const bookNowBtns = document.querySelectorAll(".openModalBtn")

  bookNowBtns.forEach((btn) => {
    btn.addEventListener("click", async function (e) {
      e.preventDefault()

      // Check if user is logged in
      const userInfo = JSON.parse(localStorage.getItem("userInfo"))

      if (!userInfo || !userInfo.token) {
        alert("Please login to book a car")
        window.location.href = "login.html"
        return
      }

      // Store car ID for later use
      const carId = this.getAttribute("data-car-id")

      try {
        // Check if user is already verified
        const verificationResponse = await fetch("http://localhost:5000/api/users/verify", {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        })

        const verificationData = await verificationResponse.json()

        if (verificationResponse.ok && verificationData.isVerified) {
          // User is already verified, proceed to booking
          openBookingModal(carId, verificationData.verificationData)
        } else {
          // User needs verification, show verification modal
          const verificationModal = document.getElementById("modal")
          verificationModal.setAttribute("data-car-id", carId)
          verificationModal.classList.remove("hidden")
          verificationModal.classList.add("visible")
        }
      } catch (error) {
        console.error("Error checking verification status:", error)

        // If error, show verification modal as fallback
        const verificationModal = document.getElementById("modal")
        verificationModal.setAttribute("data-car-id", carId)
        verificationModal.classList.remove("hidden")
        verificationModal.classList.add("visible")
      }
    })
  })
}

// Function to set up modal close buttons
function setupModalCloseButtons() {
  // Verification modal close buttons
  const closeModalBtns = document.querySelectorAll(".closeModalBtn")
  const modal = document.getElementById("modal")

  if (closeModalBtns && modal) {
    closeModalBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        modal.classList.remove("visible")
        modal.classList.add("hidden")
      })
    })

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("visible")
        modal.classList.add("hidden")
      }
    })
  }

  // Booking modal close buttons
  const closeBookingModalBtns = document.querySelectorAll(".closeBookingModalBtn")
  const bookingModal = document.getElementById("booking-modal")

  if (closeBookingModalBtns && bookingModal) {
    closeBookingModalBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        bookingModal.classList.remove("visible")
        bookingModal.classList.add("hidden")
      })
    })

    // Close booking modal when clicking outside
    bookingModal.addEventListener("click", (e) => {
      if (e.target === bookingModal) {
        bookingModal.classList.remove("visible")
        bookingModal.classList.add("hidden")
      }
    })
  }
}

function openBookingModal(carId, verificationData) {
  // Store verification data in session storage for booking process
  sessionStorage.setItem("verificationData", JSON.stringify(verificationData));

  // Store car ID in session storage (if you need it on booking page)
  sessionStorage.setItem("carId", carId);

  // Redirect to booking.html
  window.location.href = "booking.html";
}


// Function to create and append booking modal if it doesn't exist
function createAndAppendBookingModal(carId) {
  // Create booking modal element
  const bookingModalDiv = document.createElement("div")
  bookingModalDiv.id = "booking-modal"
  bookingModalDiv.className = "fixed inset-0 bg-gray-300 bg-opacity-50 flex justify-center items-center z-50 hidden"
  bookingModalDiv.setAttribute("data-car-id", carId)

  // Fetch the booking modal HTML template
  fetch("booking-modal.html")
    .then((response) => response.text())
    .then((html) => {
      bookingModalDiv.innerHTML = html
      document.body.appendChild(bookingModalDiv)

      // Show the modal
      bookingModalDiv.classList.remove("hidden")
      bookingModalDiv.classList.add("visible")

      // Setup event listeners for the new modal
      setupModalCloseButtons()

      // Load scripts for booking functionality
      const bookingScriptTag = document.createElement("script")
      bookingScriptTag.src = "booking-modal.js"
      document.body.appendChild(bookingScriptTag)

      const summaryScriptTag = document.createElement("script")
      summaryScriptTag.src = "booking-summary.js"
      document.body.appendChild(summaryScriptTag)
    })
    .catch((error) => {
      console.error("Error loading booking modal template:", error)
      alert("Error loading booking form. Please try again.")
    })
}

// Fetch and display cars on the index page
async function fetchCars() {
  try {
    const response = await fetch("http://localhost:5000/api/cars")
    const data = await response.json()

    if (response.ok) {
      const carsContainer = document.querySelector(".grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-3.gap-8")

      // Clear existing content
      carsContainer.innerHTML = ""

      // Add cars to the container
      data.cars.forEach((car) => {
        const carCard = `
          <div class="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105">
            <img src="${car.images[0] || "img/car/default.jpg"}" alt="${car.brand} ${car.model}" class="w-full h-48 object-cover">
            <div class="p-6">
              <div class="flex items-center space-x-2 mb-2">
                <span class="bg-green-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded">${car.ratings || "4.5"}</span>
                <span class="text-gray-400 text-sm">(${car.numberOfReviews || "0"} reviews)</span>
              </div>
              <h3 class="text-xl font-semibold mb-1">${car.brand} ${car.model}</h3>
              <p class="text-gray-400 text-sm mb-4"><i class="fas fa-map-marker-alt"></i> ${car.location}</p>
              <div class="flex items-center space-x-4 text-gray-400 text-sm mb-4 border-t border-gray-700 pt-3">
                <div>
                  <div class="flex items-center space-x-1 p-3">
                    <span><i class="fas fa-tachometer-alt"></i> ${car.vehicleType}</span>
                  </div>
                  <div class="flex items-center space-x-1 p-3">
                    <span><i class="fas fa-cogs"></i> ${car.transmissionType || "Automatic"}</span>
                  </div>
                </div>
                <div>
                  <div class="flex items-center space-x-1 p-3">
                    <span><i class="fas fa-gas-pump"></i> ${car.engineType}</span>
                  </div>
                  <div class="flex items-center space-x-1 p-3">
                    <span><i class="fas fa-users"></i> ${car.numberOfSeats} seats</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-lg font-bold text-white">From <span class="text-green-400">Rs.${car.dailyRate}</span>/Day</span>
                <button data-car-id="${car._id}" class="bg-green-600 openModalBtn text-white px-4 py-2 rounded-md hover:bg-gray-700 hover:text-green-500 transition">Book Now</button>
              </div>
            </div>
          </div>
        `

        carsContainer.innerHTML += carCard
      })

      // Re-attach event listeners to the new buttons
      setupBookNowButtons()
    } else {
      console.error("Error fetching cars:", data.message)
    }
  } catch (error) {
    console.error("Error:", error)
  }
}
