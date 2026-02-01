/**
 * Admin Login Page Logic
 * Handles email/password authentication
 */
import { login } from '../../js/auth-helpers.js';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');

/**
 * Handle form submission
 */
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  // Clear previous errors
  errorMessage.style.display = 'none';
  errorMessage.textContent = '';
  
  // Disable form during submission
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';
  
  try {
    const result = await login(email, password);
    
    if (result.success) {
      // Redirect to dashboard
      window.location.href = 'dashboard.html';
    } else {
      // Show error
      errorMessage.textContent = result.error || 'Login failed. Please check your credentials.';
      errorMessage.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  } catch (error) {
    console.error('Login error:', error);
    errorMessage.textContent = 'An unexpected error occurred. Please try again.';
    errorMessage.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';
  }
});
