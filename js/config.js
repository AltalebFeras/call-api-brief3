// Configuration file - Change this domain to match your API
const CONFIG = {
    // API_DOMAIN: "https://localhost:8000",
    // API_DOMAIN: "http://193.134.250.16",
    API_DOMAIN: "",
    API_ENDPOINTS: {
    HOME: "/api/home",
    REGISTER: "/api/register",
    LOGIN: "/api/login",
    LOGOUT: "/api/logout",
    PROFILE: "/api/user/show/me",
    EDIT_PROFILE: "/api/user/edit/me",
    DELETE_ACCOUNT: "/api/user/delete/me",
    VERIFY_EMAIL: "/api/verify-email",
    MY_LISTS: "/api/lists/show/me", // This matches your controller route: /api/list + s/show/me
    LIST_DETAIL: "/api/list/show",  // This will be used as: /api/list/show/{slug}
    LIST_PERSONS: "/api/list/show", // Same endpoint as LIST_DETAIL since it returns persons
  },
  TOKEN_KEY: "auth_token",
};

// Helper function to get full API URL
function getApiUrl(endpoint) {
    const url = CONFIG.API_DOMAIN + endpoint;
    console.log('Generated API URL:', url); // Debug logging
    return url;
}