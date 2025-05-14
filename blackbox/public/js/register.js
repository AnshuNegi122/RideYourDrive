document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;
    const errorMessage = document.getElementById("error-message");
    
    if (password !== confirmPassword) {
        errorMessage.style.display = "block";
        return;
    }
    
    errorMessage.style.display = "none";
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            window.location.href = '/login.html';
        } else {
            errorMessage.textContent = data.message || 'Registration failed';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Registration error:', error);
        errorMessage.textContent = 'An error occurred during registration';
        errorMessage.style.display = 'block';
    }
});
