// main.js - Entry point for the application

document.addEventListener("DOMContentLoaded", () => {
  // Initialize all modules
  Auth.init();
  UI.init();
  Verification.init();
  Booking.init();
  
  // Set up event listeners for book now buttons
  UI.setupBookNowButtons();
  
  // Check if we need to fetch cars for the index page
  if (document.getElementById("cars-grid")) {
    fetchCars();
  }
});

// Function to fetch and display cars on the index page
async function fetchCars() {
  try {
    const response = await fetch("http://localhost:5000/api/cars");
    const data = await response.json();
    
    if (response.ok) {
      const carsContainer = document.querySelector(".grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-8");      ;
      
      // Clear existing content
      carsContainer.innerHTML = "";
      
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
        `;
        
        carsContainer.innerHTML += carCard;
      });
      
      // Re-attach event listeners to the new buttons
      UI.setupBookNowButtons();
    } else {
      console.error("Error fetching cars:", data.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
