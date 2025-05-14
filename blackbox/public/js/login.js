document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const logoutBtn = document.getElementById("logoutButton");
  const userNameEl = document.getElementById("userName");
  const userBtn = document.getElementById("userButton");
  const spinner = document.getElementById("spinner");

  // Show/Hide spinner
  function showSpinner() {
      if (spinner) spinner.style.display = "inline-block";
  }
  function hideSpinner() {
      if (spinner) spinner.style.display = "none";
  }

  // Update UI with user info
  function updateUserUI(userName) {
      if (userNameEl) userNameEl.textContent = userName;
      if (userBtn) userBtn.disabled = true;
  }

  // Handle login form submit
  if (loginForm) {
      loginForm.addEventListener("submit", async function (e) {
          e.preventDefault();

          const email = document.getElementById("email").value.trim();
          const password = document.getElementById("password").value;

          // Validate inputs
          if (!email || !password) {
              alert("Please enter both email and password.");
              return;
          }

          showSpinner();

          try {
              const response = await fetch('http://localhost:5000/api/auth/login', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ email, password })
              });

              const data = await response.json();

              if (response.ok) {
                  localStorage.setItem('token', data.token);
                  localStorage.setItem('userName', data.user.name);
                  updateUserUI(data.user.name);
                  alert('Login successful!');
                  window.location.href = 'http://127.0.0.1:5500/public/index.html';
              } else {
                  alert(data.message || 'Login failed');
              }
          } catch (error) {
              console.error('Login error:', error);
              alert('An error occurred during login');
          } finally {
              hideSpinner();
          }
      });
  }

  // Logout functionality
  if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
          localStorage.removeItem('token');
          localStorage.removeItem('userName');
          if (userNameEl) userNameEl.textContent = 'Login';
          if (userBtn) userBtn.disabled = false;
          alert('Logged out successfully!');
          window.location.href = '/index.html';
      });
  }

  // Check login state on page load
  const userName = localStorage.getItem('userName');
  if (userName) {
      updateUserUI(userName);
  }

  // Hide spinner on initial load
  hideSpinner();
});
