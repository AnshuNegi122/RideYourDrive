// Handle login form submission
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    
    if (loginForm) {
      loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            // Redirect to dashboard on successful login
            window.location.href = '/dashboard';
          } else {
            alert(data.message || 'Login failed');
          }
        } catch (error) {
          console.error('Login error:', error);
          alert('An error occurred during login');
        }
      });
    }
  });