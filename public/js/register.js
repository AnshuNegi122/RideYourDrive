// Handle registration form submission
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
      registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        const errorMessage = document.getElementById('error-message');
        
        // Check if passwords match
        if (password !== confirmPassword) {
          errorMessage.style.display = 'block';
          return;
        }
        
        errorMessage.style.display = 'none';
        
        try {
          const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            alert('Registration successful! Please login.');
            window.location.href = '/login';
          } else {
            alert(data.message || 'Registration failed');
          }
        } catch (error) {
          console.error('Registration error:', error);
          alert('An error occurred during registration');
        }
      });
    }
  });