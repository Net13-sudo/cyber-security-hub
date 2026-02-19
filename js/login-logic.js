// Load configuration first
const API_URL = window.SCORPION_CONFIG ? window.SCORPION_CONFIG.AUTH_API_URL : 'http://localhost:30011/api/auth';

// Get form elements
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const switchToLogin = document.getElementById('switchToLogin');
const switchToSignup = document.getElementById('switchToSignup');

// Form switching functionality
if (switchToLogin) {
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });
}

if (switchToSignup) {
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    });
}

// Signup Form Logic
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const terms = document.getElementById('terms').checked;
        
        // Basic validation
        if (!firstName || !lastName || !email || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (!terms) {
            showMessage('Please agree to the Terms & Conditions', 'error');
            return;
        }
        
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: `${firstName} ${lastName}`,
                    firstName,
                    lastName,
                    email, 
                    password 
                })
            });
            const data = await res.json();

            if (res.ok) {
                showMessage('Registration successful! Please check your email to verify your account.', 'success');
                // Optionally switch to login form
                setTimeout(() => {
                    signupForm.classList.add('hidden');
                    loginForm.classList.remove('hidden');
                }, 2000);
            } else {
                showMessage(data.error || 'Registration failed', 'error');
            }
        } catch (err) {
            showMessage('Network error. Please try again.', 'error');
        }
    });
}

// Login Form Logic
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                showMessage('Login successful! Redirecting...', 'success');
                
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('username', data.user.username || data.user.email);
                localStorage.setItem('userRole', data.user.role || 'user');

                setTimeout(() => {
                    window.location.href = data.user.role === 'admin' ? 'admin_dashboard.html' : 'security_command_homepage.html';
                }, 1500);
            } else {
                showMessage(data.error || 'Login failed', 'error');
            }
        } catch (err) {
            showMessage('Network error. Please try again.', 'error');
        }
    });
}

// Message display function
function showMessage(message, type) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message mt-4 p-3 rounded-lg text-sm ${
        type === 'success' 
            ? 'bg-green-900/50 text-green-300 border border-green-500/30' 
            : 'bg-red-900/50 text-red-300 border border-red-500/30'
    }`;
    messageDiv.textContent = message;
    
    // Insert message after the active form
    const activeForm = signupForm.classList.contains('hidden') ? loginForm : signupForm;
    activeForm.appendChild(messageDiv);
    
    // Auto-remove error messages after 5 seconds
    if (type === 'error') {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}
