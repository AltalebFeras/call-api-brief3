document.addEventListener('DOMContentLoaded', function() {
    // Check authentication with detailed logging
    const token = ApiClient.getToken();
    console.log('Token present:', !!token);
    console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null');
    
    if (!ApiClient.isAuthenticated()) {
        console.log('No token found, redirecting to login');
        window.location.href = 'index.html';
        return;
    }

    // Get list slug from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        showMessage('Slug de liste manquant', 'error');
        setTimeout(() => {
            window.location.href = 'lists.html';
        }, 2000);
        return;
    }

    // Set the list title immediately from slug
    displayFallbackListInfo(slug);
    
    // Load persons data which is the main data from the API
    loadListPersons(slug);
    initializeEventListeners();
});

function initializeEventListeners() {
    // Back button
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'lists.html';
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

async function logout() {
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.classList.add('loading');
    
    // Verify token before logout
    if (ApiClient.getToken()) {
        await ApiClient.post(CONFIG.API_ENDPOINTS.LOGOUT, {});
    }
    
    logoutBtn.classList.remove('loading');
    ApiClient.removeToken();
    showMessage('Déconnexion réussie', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

async function loadListPersons(slug) {
    console.log('Loading persons for slug:', slug);
    
    // Verify token before making request
    const token = ApiClient.getToken();
    if (!token) {
        console.error('No token available for API request');
        showMessage('Session expirée, veuillez vous reconnecter', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    console.log('Making request with token:', token.substring(0, 20) + '...');
    const result = await ApiClient.get(`${CONFIG.API_ENDPOINTS.LIST_PERSONS}/${slug}`);
    
    console.log('Persons API response:', result);
    
    if (result.success) {
        // According to your wiki, the API returns persons data directly in the data field
        displayPersons(result.data.data || result.data);
    } else {
        // Handle authentication errors specifically
        if (result.status === 401) {
            console.error('Authentication failed - removing token and redirecting');
            ApiClient.removeToken();
            showMessage('Session expirée, veuillez vous reconnecter', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
        
        if (result.status === 404) {
            if (result.data && result.data.message === "Liste non trouvée") {
                showMessage('Liste non trouvée', 'error');
                setTimeout(() => {
                    window.location.href = 'lists.html';
                }, 2000);
            } else {
                // "Aucune personne trouvée dans cette liste"
                displayPersons([]);
            }
        } else {
            console.error('API Error:', result);
            displayPersonsError();
        }
    }
}

function displayFallbackListInfo(slug) {
    const listTitle = document.getElementById('listTitle');
    const listInfoContainer = document.getElementById('listInfo');

    // Create a nice title from the slug
    const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    listTitle.textContent = title;

    listInfoContainer.innerHTML = `
        <div class="list-info-header">
            <h2>${escapeHtml(title)}</h2>
            <p>Liste ${escapeHtml(slug)}</p>
        </div>
        <div class="list-info-body">
            <div class="list-stats">
                <div class="stat-item">
                    <span class="stat-value" id="totalParticipants">-</span>
                    <span class="stat-label">Participants</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value" id="avgAge">-</span>
                    <span class="stat-label">Âge moyen</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value" id="avgFrenchLevel">-</span>
                    <span class="stat-label">Niveau FR moyen</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value" id="avgTechLevel">-</span>
                    <span class="stat-label">Niveau Tech moyen</span>
                </div>
            </div>
        </div>
    `;
}

function displayPersons(persons) {
    const personsContainer = document.getElementById('personsContainer');
    const personsCountEl = document.getElementById('personsCount');

    if (!persons || persons.length === 0) {
        personsContainer.innerHTML = `
            <div class="empty-persons">
                <div class="empty-icon">👥</div>
                <h3>Aucun participant</h3>
                <p>Cette liste ne contient aucun participant pour le moment.</p>
            </div>
        `;
        personsCountEl.textContent = '0';
        return;
    }

    // Update participants count
    personsCountEl.textContent = persons.length;

    // Update statistics
    updateStatistics(persons);

    // Display persons grid
    personsContainer.innerHTML = `
        <div class="persons-grid">
            ${persons.map(person => createPersonCard(person)).join('')}
        </div>
    `;
}

function updateStatistics(persons) {
    const totalParticipants = persons.length;
    const avgAge = (persons.reduce((sum, p) => sum + p.age, 0) / totalParticipants).toFixed(1);
    const avgFrenchLevel = (persons.reduce((sum, p) => sum + p.french_level, 0) / totalParticipants).toFixed(1);
    const avgTechLevel = (persons.reduce((sum, p) => sum + p.tech_level, 0) / totalParticipants).toFixed(1);

    document.getElementById('totalParticipants').textContent = totalParticipants;
    document.getElementById('avgAge').textContent = avgAge;
    document.getElementById('avgFrenchLevel').textContent = avgFrenchLevel;
    document.getElementById('avgTechLevel').textContent = avgTechLevel;
}

function createPersonCard(person) {
    return `
        <div class="person-card">
            <div class="person-header">
                <div class="person-name">
                    ${escapeHtml(person.first_name)} ${escapeHtml(person.last_name)}
                </div>
                <div class="person-age">${person.age} ans</div>
            </div>
            
            <div class="person-profile">
                ${escapeHtml(person.profile)}
            </div>
            
            <div class="person-details">
                <div class="person-detail">
                    <span class="person-detail-label">Niveau Français</span>
                    <div class="person-detail-value">
                        <div class="level-indicator">
                            <span>${person.french_level}/5</span>
                            <div class="level-dots">
                                ${createLevelDots(person.french_level)}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="person-detail">
                    <span class="person-detail-label">Niveau Technique</span>
                    <div class="person-detail-value">
                        <div class="level-indicator">
                            <span>${person.tech_level}/5</span>
                            <div class="level-dots">
                                ${createLevelDots(person.tech_level)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="person-badges">
                <span class="badge ${person.dwwm ? 'badge-dwwm' : 'badge-cda'}">
                    ${person.dwwm ? 'DWWM' : 'CDA'}
                </span>
                <span class="badge badge-gender">
                    ${escapeHtml(person.gender)}
                </span>
            </div>
        </div>
    `;
}

function createLevelDots(level) {
    let dots = '';
    for (let i = 1; i <= 5; i++) {
        dots += `<div class="level-dot ${i <= level ? 'filled' : ''}"></div>`;
    }
    return dots;
}

function displayPersonsError() {
    const personsContainer = document.getElementById('personsContainer');
    personsContainer.innerHTML = `
        <div class="empty-persons">
            <div class="empty-icon">⚠️</div>
            <h3>Erreur de chargement</h3>
            <p>Impossible de charger les participants de cette liste.</p>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
