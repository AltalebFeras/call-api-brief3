// Configuration file - Change this domain to match your API
const CONFIG = {
    API_DOMAIN: 'http://localhost:8000', // Change this to your actual domain
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
