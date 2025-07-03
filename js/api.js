class ApiClient {
    static getToken() {
        return localStorage.getItem(CONFIG.TOKEN_KEY);
    }

    static setToken(token) {
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
    }

    static removeToken() {
        localStorage.removeItem(CONFIG.TOKEN_KEY);
    }

    static getAuthHeaders() {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    static showLoader() {
        let loader = document.getElementById('apiLoader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'apiLoader';
            loader.className = 'api-loader';
            loader.innerHTML = `
                <div class="loader-overlay">
                    <div class="loader-spinner"></div>
                    <div class="loader-text">Chargement...</div>
                </div>
            `;
            document.body.appendChild(loader);
        }
        loader.style.display = 'flex';
    }

    static hideLoader() {
        const loader = document.getElementById('apiLoader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    static async makeRequest(url, options = {}) {
        this.showLoader();
        
        try {
            const response = await fetch(url, {
                headers: this.getAuthHeaders(),
                ...options
            });

            const data = await response.json();
            
            // Update token if provided in response
            if (data.token) {
                this.setToken(data.token);
            }

            return {
                success: response.ok && data.success !== false,
                data: data,
                status: response.status
            };
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                data: { message: 'Erreur de connexion au serveur' },
                status: 0
            };
        } finally {
            this.hideLoader();
        }
    }

    static async get(endpoint) {
        return this.makeRequest(getApiUrl(endpoint), {
            method: 'GET'
        });
    }

    static async post(endpoint, data) {
        return this.makeRequest(getApiUrl(endpoint), {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static isAuthenticated() {
        return !!this.getToken();
    }
}

// Utility functions for UI feedback
function showMessage(message, type = 'info') {
    const container = document.getElementById('messageContainer');
    if (!container) return;

    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;

    container.innerHTML = '';
    container.appendChild(messageEl);

    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}

function showErrors(errors) {
    if (typeof errors === 'object') {
        const errorMessages = Object.values(errors).join(', ');
        showMessage(errorMessages, 'error');
    } else {
        showMessage(errors, 'error');
    }
}
