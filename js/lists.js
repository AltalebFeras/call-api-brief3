document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!ApiClient.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    loadUserLists();
    initializeEventListeners();
});

function initializeEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

async function logout() {
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.classList.add('loading');
    
    await ApiClient.post(CONFIG.API_ENDPOINTS.LOGOUT, {});
    
    logoutBtn.classList.remove('loading');
    ApiClient.removeToken();
    showMessage('Déconnexion réussie', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

async function loadUserLists() {
    console.log('Loading user lists from:', CONFIG.API_ENDPOINTS.MY_LISTS);
    const result = await ApiClient.get(CONFIG.API_ENDPOINTS.MY_LISTS);
    
    console.log('Lists API response:', result);
    
    if (result.success) {
        // Your controller returns data directly in 'data' field
        displayLists(result.data.data || result.data);
    } else {
        showMessage('Erreur lors du chargement des listes', 'error');
        if (result.status === 401) {
            ApiClient.removeToken();
            window.location.href = 'index.html';
        }
    }
}

function displayLists(lists) {
    const container = document.getElementById('listsContainer');
    const emptyState = document.getElementById('emptyState');

    if (!lists || lists.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    container.style.display = 'block';
    emptyState.style.display = 'none';

    container.innerHTML = lists.map(list => createListCard(list)).join('');

    // Add event listeners for list toggles
    lists.forEach(list => {
        const listId = list.id || list.slug;
        const listElement = document.getElementById(`list-${listId}`);
        if (listElement) {
            const header = listElement.querySelector('.list-header');
            const toggle = listElement.querySelector('.list-toggle');
            const content = listElement.querySelector('.list-content');

            header.addEventListener('click', () => {
                toggleList(list.slug, toggle, content);
            });
        }
    });
}

function createListCard(list) {
    // Use slug as fallback ID if no id property exists
    const listId = list.id || list.slug;
    
    return `
        <div class="list-card" id="list-${listId}">
            <div class="list-header">
                <div class="list-info">
                    <h3>${escapeHtml(list.name)}</h3>
                    <p>${escapeHtml(list.description || 'Aucune description')}</p>
                </div>
                <div class="list-actions">
                    <a href="list-detail.html?slug=${list.slug}" class="btn btn-primary btn-sm">
                        Voir détails
                    </a>
                    <button class="list-toggle">
                        ▼
                    </button>
                </div>
            </div>
            <div class="list-content">
                <div class="persons-container">
                    <div class="loading-state">
                        <div class="loading-spinner"></div>
                        <p>Chargement des participants...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function toggleList(slug, toggleBtn, contentElement) {
    const isExpanded = contentElement.classList.contains('expanded');

    if (isExpanded) {
        // Collapse
        contentElement.classList.remove('expanded');
        toggleBtn.classList.remove('expanded');
    } else {
        // Expand and load persons
        contentElement.classList.add('expanded');
        toggleBtn.classList.add('expanded');
        
        // Load persons if not already loaded
        const personsContainer = contentElement.querySelector('.persons-container');
        if (personsContainer.querySelector('.loading-state')) {
            await loadListPersons(slug, personsContainer);
        }
    }
}

async function loadListPersons(slug, container) {
    const result = await ApiClient.get(`${CONFIG.API_ENDPOINTS.LIST_DETAIL}/${slug}`);
    
    if (result.success) {
        displayPersons(result.data.persons, container);
    } else {
        container.innerHTML = `
            <div class="no-persons">
                Erreur lors du chargement des participants
            </div>
        `;
    }
}

function displayPersons(persons, container) {
    if (!persons || persons.length === 0) {
        container.innerHTML = `
            <div class="no-persons">
                Aucun participant dans cette liste
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="persons-grid">
            ${persons.map(person => createPersonCard(person)).join('')}
        </div>
    `;
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
            <div class="person-details">
                <div class="person-detail">
                    <span class="person-detail-label">Genre:</span>
                    <span class="person-detail-value">${escapeHtml(person.gender)}</span>
                </div>
                <div class="person-detail">
                    <span class="person-detail-label">Niveau FR:</span>
                    <span class="person-detail-value">${person.french_level}/5</span>
                </div>
                <div class="person-detail">
                    <span class="person-detail-label">Niveau Tech:</span>
                    <span class="person-detail-value">${person.tech_level}/5</span>
                </div>
                <div class="person-detail">
                    <span class="person-detail-label">Formation:</span>
                    <span class="person-detail-value">
                        ${person.dwwm ? 'DWWM' : 'CDA'}
                        ${person.dwwm ? '<span class="dwwm-badge">DWWM</span>' : ''}
                    </span>
                </div>
            </div>
            <div class="person-profile">
                ${escapeHtml(person.profile)}
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
