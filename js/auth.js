document.addEventListener('DOMContentLoaded', function() {
    // Check if already authenticated
    if (ApiClient.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    const loginForm = document.getElementById('loginFormElement');
    const registerForm = document.getElementById('registerFormElement');

    // Login form handler
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        const result = await ApiClient.post(CONFIG.API_ENDPOINTS.LOGIN, data);
        
        if (result.success) {
            showMessage('Connexion réussie !', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showMessage(result.data.message || 'Erreur de connexion', 'error');
        }
    });

    // Register form handler
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        // Convert checkbox to boolean
        data.cgu_accepted = !!data.cgu_accepted;

        const result = await ApiClient.post(CONFIG.API_ENDPOINTS.REGISTER, data);
        
        if (result.success) {
            showMessage('Inscription réussie ! Vérifiez votre email.', 'success');
            this.reset();
            showLogin();
        } else {
            if (result.data.errors) {
                showErrors(result.data.errors);
            } else {
                showMessage(result.data.message || 'Erreur lors de l\'inscription', 'error');
            }
        }
    });
});

// Tab switching functions
function showLogin() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.remove('active');
}

function showRegister() {
    document.getElementById('registerForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    document.querySelectorAll('.tab-btn')[0].classList.remove('active');
}
