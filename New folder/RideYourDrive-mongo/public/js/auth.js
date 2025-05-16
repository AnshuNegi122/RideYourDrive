// auth.js - Handles authentication functionality

const Auth = {
  init() {
    this.updateAuthUI();
  },
  
  updateAuthUI() {
    const userInfo = this.getUserInfo();
    const loginLink = document.querySelector('header a[href="login.html"]');
    
    if (userInfo && userInfo.token && loginLink) {
      // User is logged in
      // Replace login link with user dropdown
      const headerNav = loginLink.parentElement;
      loginLink.remove();
      
      // Create user dropdown
      const userDropdown = document.createElement("div");
      userDropdown.className = "relative";
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
      `;
      
      headerNav.appendChild(userDropdown);
      
      // Add event listeners for dropdown
      const dropdownBtn = document.getElementById("userDropdownBtn");
      const dropdownMenu = document.getElementById("userDropdownMenu");
      
      dropdownBtn.addEventListener("click", () => {
        dropdownMenu.classList.toggle("hidden");
      });
      
      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
          dropdownMenu.classList.add("hidden");
        }
      });
      
      // Add logout functionality
      document.getElementById("logoutBtn").addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("userInfo");
        window.location.reload();
      });
    }
  },
  
  isLoggedIn() {
    const userInfo = this.getUserInfo();
    return userInfo && userInfo.token;
  },
  
  getUserInfo() {
    return JSON.parse(localStorage.getItem("userInfo"));
  }
};
