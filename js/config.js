// Configuration file - Change this domain to match your API
const CONFIG = {
    // API_DOMAIN: 'https://localhost:8000', 
    API_DOMAIN: 'http://193.134.250.16',
    API_ENDPOINTS: {
        HOME: '/api/home',
        REGISTER: '/api/register',
        LOGIN: '/api/login',
        LOGOUT: '/api/logout',
        PROFILE: '/api/user/show/me',
        EDIT_PROFILE: '/api/user/edit/me',
        DELETE_ACCOUNT: '/api/user/delete/me',
        VERIFY_EMAIL: '/api/verify-email'
    },
    TOKEN_KEY: 'auth_token'
};

// Helper function to get full API URL
function getApiUrl(endpoint) {
    return CONFIG.API_DOMAIN + endpoint;
}
