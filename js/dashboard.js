document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!ApiClient.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    loadUserProfile();
    initializeEventListeners();
});

async function loadUserProfile() {
    // Verify token before making request
    const token = ApiClient.getToken();
    if (!token) {
        console.error('No token available for profile request');
        showMessage('Session expirée, veuillez vous reconnecter', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    const result = await ApiClient.get(CONFIG.API_ENDPOINTS.PROFILE);
    
    if (result.success) {
        displayUserProfile(result.data.data);
    } else {
        if (result.status === 401) {
            console.error('Authentication failed for profile - this is more serious');
            // Only remove token for profile failures since profile is critical
            showMessage('Session expirée, reconnexion nécessaire', 'error');
            setTimeout(() => {
                if (confirm('Votre session a expiré. Voulez-vous vous reconnecter ?')) {
                    ApiClient.removeToken();
                    window.location.href = 'index.html';
                }
            }, 2000);
        } else {
            showMessage('Erreur lors du chargement du profil: ' + (result.data.message || 'Erreur inconnue'), 'error');
        }
    }
}

function displayUserProfile(userData) {
    document.getElementById('userEmail').textContent = userData.email;
    document.getElementById('userFirstName').textContent = userData.first_name;
    document.getElementById('userLastName').textContent = userData.last_name;
    
    const status = userData.is_verified ? 'Vérifié' : 'Non vérifié';
    document.getElementById('userStatus').textContent = status;
    document.getElementById('userStatus').className = userData.is_verified ? 'status-verified' : 'status-unverified';

    // Pre-fill edit form
    document.getElementById('editEmail').value = userData.email;
    document.getElementById('editFirstName').value = userData.first_name;
    document.getElementById('editLastName').value = userData.last_name;
}

function initializeEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Edit profile button
    document.getElementById('editProfileBtn').addEventListener('click', showEditForm);

    // Cancel edit button
    document.getElementById('cancelEditBtn').addEventListener('click', hideEditForm);

    // Edit profile form
    document.getElementById('editProfileForm').addEventListener('submit', updateProfile);

    // Delete account button
    document.getElementById('deleteAccountBtn').addEventListener('click', showDeleteModal);

    // Delete modal buttons
    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteAccount);
    document.getElementById('cancelDeleteBtn').addEventListener('click', hideDeleteModal);
}

async function logout() {
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.classList.add('loading');
    
    const result = await ApiClient.post(CONFIG.API_ENDPOINTS.LOGOUT, {});
    
    logoutBtn.classList.remove('loading');
    
    ApiClient.removeToken();
    showMessage('Déconnexion réussie', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function showEditForm() {
    document.getElementById('profileView').style.display = 'none';
    document.getElementById('profileEdit').style.display = 'block';
}

function hideEditForm() {
    document.getElementById('profileEdit').style.display = 'none';
    document.getElementById('profileView').style.display = 'block';
}

async function updateProfile(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    const result = await ApiClient.post(CONFIG.API_ENDPOINTS.EDIT_PROFILE, data);
    
    submitBtn.classList.remove('loading');
    
    if (result.success) {
        showMessage('Profil mis à jour avec succès', 'success');
        displayUserProfile(result.data.data);
        hideEditForm();
    } else {
        if (result.data.errors) {
            showErrors(result.data.errors);
        } else {
            showMessage(result.data.message || 'Erreur lors de la mise à jour', 'error');
        }
    }
}

function showDeleteModal() {
    document.getElementById('deleteModal').style.display = 'flex';
}

function hideDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

async function deleteAccount() {
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.classList.add('loading');
    
    const result = await ApiClient.post(CONFIG.API_ENDPOINTS.DELETE_ACCOUNT, {});
    
    confirmBtn.classList.remove('loading');
    
    if (result.success) {
        ApiClient.removeToken();
        showMessage('Compte supprimé avec succès', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } else {
        showMessage(result.data.message || 'Erreur lors de la suppression', 'error');
    }
    
    hideDeleteModal();
}
