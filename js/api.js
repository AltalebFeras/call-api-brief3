class ApiClient {
    static getToken() {
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        console.log('Getting token from localStorage:', token ? 'Token found' : 'No token');
        return token;
    }

    static setToken(token) {
        console.log('Setting token in localStorage:', token ? token.substring(0, 20) + '...' : 'null');
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
    }

    static removeToken() {
        console.log('Removing token from localStorage');
        localStorage.removeItem(CONFIG.TOKEN_KEY);
    }

    static getAuthHeaders() {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('Added Authorization header with token');
        } else {
            console.warn('No token available for Authorization header');
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
            console.log('Making request to:', url, 'with options:', options);
            
            const headers = this.getAuthHeaders();
            console.log('Request headers:', headers);
            
            const response = await fetch(url, {
                headers: headers,
                ...options
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
                console.log('Response data:', data);
            } else {
                // Handle non-JSON responses (like HTML error pages)
                const text = await response.text();
                console.error('Non-JSON response received:', text);
                
                return {
                    success: false,
                    data: { 
                        message: response.status === 500 
                            ? 'Erreur interne du serveur. Veuillez vérifier la configuration de l\'API.' 
                            : `Erreur du serveur (${response.status}). Réponse non-JSON reçue.`
                    },
                    status: response.status
                };
            }
            
            // Handle authentication errors specifically
            if (response.status === 401) {
                console.error('Authentication failed - 401 response received');
                if (data && data.message) {
                    console.error('Auth error message:', data.message);
                }
                this.removeToken(); // Remove invalid token
            }
            
            // Update token if provided in response
            if (data && data.token) {
                console.log('Updating token from response');
                this.setToken(data.token);
            }

            return {
                success: response.ok && (data.success !== false),
                data: data || { message: 'Réponse vide du serveur' },
                status: response.status
            };
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                data: { 
                    message: error.name === 'TypeError' && error.message.includes('fetch')
                        ? 'Impossible de se connecter au serveur. Vérifiez que l\'API est démarrée et accessible.'
                        : 'Erreur de connexion au serveur: ' + error.message
                },
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
        const token = this.getToken();
        const isAuth = !!token;
        console.log('Is authenticated check:', isAuth);
        return isAuth;
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
