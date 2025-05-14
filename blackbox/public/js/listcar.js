
    document.addEventListener("DOMContentLoaded", async function () {
        // Fetch cars from the backend
        try {
            const response = await fetch('http://localhost:5000/api/car', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json' // Adjust headers if needed
                }
            });

            const data = await response.json();

            if (response.ok) {
                const carsList = document.getElementById('carsList');
                carsList.innerHTML = ''; // Clear existing content

                // Loop through the cars and create HTML for each
                data.cars.forEach(car => {
                    const carCard = `
                        <div class="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105">
                            <img src="${car.imageUrl || 'default-image-url.jpg'}" alt="${car.carBrand} ${car.carModel}" class="w-full h-48 object-cover">
                            <div class="p-6">
                                <div class="flex items-center space-x-2 mb-2">
                                    <span class="bg-green-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded">${car.rating || 'N/A'}</span>
                                    <span class="text-gray-400 text-sm">(${car.reviews || 0} reviews)</span>
                                </div>
                                <h3 class="text-xl font-semibold mb-1">${car.carBrand} ${car.carModel}</h3>
                                <p class="text-gray-400 text-sm mb-4"><i class="fas fa-map-marker-alt"></i> ${car.location || 'Unknown'}</p>
                                <div class="flex items-center space-x-4 text-gray-400 text-sm mb-4 border-t border-gray-700 pt-3">
                                    <div>
                                        <div class="flex items-center space-x-1 p-3">
                                            <span><i class="fas fa-tachometer-alt"></i> ${car.vehicleType || 'N/A'}</span>
                                        </div>
                                        <div class="flex items-center space-x-1 p-3">
                                            <span><i class="fas fa-cogs"></i> ${car.transmission || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="flex items-center space-x-1 p-3">
                                            <span><i class="fas fa-gas-pump"></i> ${car.fuelType || 'N/A'}</span>
                                        </div>
                                        <div class="flex items-center space-x-1 p-3">
                                            <span><i class="fas fa-users"></i> ${car.noOfSeats || 0} seats</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-lg font-bold text-white">From <span class="text-green-400">Rs.${car.price || 0}</span>/Day</span>
                                    <button class="bg-green-600 openModalBtn text-white px-4 py-2 rounded-md hover:bg-gray-700 hover:text-green-500 transition">Book Now</button>
                                </div>
                            </div>
                        </div>
                    `;
                    carsList.innerHTML += carCard; // Append the car card to the list
                });
            } else {
                console.error('Failed to fetch cars:', data.message);
                // Optionally display a message to the user
            }
        } catch (error) {
            console.error('Error fetching cars:', error);
        }
    });
