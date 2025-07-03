document.addEventListener('DOMContentLoaded', function() {
    // Get success and message from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const message = urlParams.get('message');
    
    // Hide loader immediately since we're not making API calls
    document.getElementById('verificationLoader').style.display = 'none';
    
    if (!success || !message) {
        showVerificationResult('error', 'Lien invalide', 'Le lien de vérification est invalide ou incomplet.');
        return;
    }
    
    handleVerificationResult(success, message);
});

function handleVerificationResult(success, message) {
    let resultType, title;
    
    if (success === 'true') {
        resultType = 'success';
        title = 'Email vérifié !';
    } else if (success === 'false') {
        // Handle different error cases based on message
        if (message === 'email_already_verified') {
            resultType = 'warning';
            title = 'Déjà vérifié';
        } else {
            resultType = 'error';
            title = 'Erreur de vérification';
        }
    } else {
        resultType = 'error';
        title = 'Erreur de vérification';
    }

    showVerificationResult(resultType, title, message);
}

function showVerificationResult(type, title, message) {
    const resultDiv = document.getElementById('verificationResult');
    const iconDiv = document.getElementById('verificationIcon');
    const titleElement = document.getElementById('verificationTitle');
    const messageElement = document.getElementById('verificationMessage');
    const loginBtn = document.getElementById('loginRedirectBtn');
    const homeBtn = document.getElementById('homeRedirectBtn');
    
    // Set icon and colors based on result type
    iconDiv.className = `verification-icon ${type}`;
    
    // Set title and message
    titleElement.textContent = title;
    titleElement.className = `${type}-message`;
    messageElement.textContent = message;
    messageElement.className = `${type}-message`;
    
    // Show/hide buttons based on result type
    if (type === 'success' || type === 'warning') {
        loginBtn.style.display = 'inline-block';
        homeBtn.style.display = 'none';
    } else {
        loginBtn.style.display = 'none';
        homeBtn.style.display = 'inline-block';
    }
    
    // Show result
    resultDiv.style.display = 'flex';
}
