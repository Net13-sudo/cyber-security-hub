/**
 * Login & Signup Logic for Scorpion Security Hub
 * Handles the premium split-screen UI interaction and API communication
 */

document.addEventListener('DOMContentLoaded', () => {
    // API Configuration
    const API_URL = (window.SCORPION_CONFIG && window.SCORPION_CONFIG.AUTH_API_URL) || 'http://localhost:3001/api/auth';

    // Elements
    const signupSection = document.getElementById('signupSection');
    const loginSection = document.getElementById('loginSection');
    const switchToLogin = document.getElementById('switchToLogin');
    const switchToSignup = document.getElementById('switchToSignup');
    const authMessage = document.getElementById('authMessage');

    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    // Section Switching
    switchToLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        signupSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
        hideMessage();
    });

    switchToSignup?.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.classList.add('hidden');
        signupSection.classList.remove('hidden');
        hideMessage();
    });

    // Signup Submission
    signupForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessage();

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const terms = document.getElementById('terms').checked;

        if (!terms) {
            return showMessage('You must agree to the Terms & Conditions', 'error');
        }

        try {
            const btn = signupForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Creating account...';
            btn.disabled = true;

            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: `${firstName} ${lastName}`,
                    email,
                    password
                })
            });

            const data = await res.json();

            if (res.ok) {
                showMessage('Account created successfully! Switching to login...', 'success');
                setTimeout(() => {
                    signupSection.classList.add('hidden');
                    loginSection.classList.remove('hidden');
                }, 2000);
            } else {
                showMessage(data.error || 'Registration failed. Please try again.', 'error');
            }
        } catch (err) {
            console.error('Signup error:', err);
            showMessage('Connection error. Is the server running?', 'error');
        } finally {
            const btn = signupForm.querySelector('button[type="submit"]');
            btn.innerHTML = 'Create account';
            btn.disabled = false;
        }
    });

    // Login Submission
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessage();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        try {
            const btn = loginForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Signing in...';
            btn.disabled = true;

            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: email, password })
            });

            const data = await res.json();

            if (res.ok) {
                showMessage('Login successful! Redirecting...', 'success');
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('username', data.user.username);
                localStorage.setItem('userRole', data.user.role);

                setTimeout(() => {
                    if (data.user.role === 'admin') {
                        window.location.href = 'admin_dashboard.html';
                    } else {
                        window.location.href = '../index.html';
                    }
                }, 1500);
            } else {
                showMessage(data.error || 'Invalid credentials. Please try again.', 'error');
            }
        } catch (err) {
            console.error('Login error:', err);
            showMessage('Connection error. Is the server running?', 'error');
        } finally {
            const btn = loginForm.querySelector('button[type="submit"]');
            btn.innerHTML = 'Sign In';
            btn.disabled = false;
        }
    });

    // Helper Functions
    function showMessage(text, type) {
        if (!authMessage) return;
        authMessage.textContent = text;
        authMessage.classList.remove('hidden', 'bg-green-900/40', 'text-green-300', 'border-green-500/30', 'bg-red-900/40', 'text-red-300', 'border-red-500/30');

        if (type === 'success') {
            authMessage.classList.add('bg-green-900/40', 'text-green-300', 'border-green-500/30');
        } else {
            authMessage.classList.add('bg-red-900/40', 'text-red-300', 'border-red-500/30');
        }
        authMessage.classList.remove('hidden');
    }

    function hideMessage() {
        authMessage?.classList.add('hidden');
    }
});
