// ===========================
// Sign Language Interface JS
// ===========================

// State Management
const state = {
    currentLanguage: 'english',
    messages: [],
    darkMode: false,
    fontSize: 'medium',
    highContrast: false,
    isSigning: false, // To track avatar state
};

// DOM Elements
const elements = {
    // Navigation
    navButtons: document.querySelectorAll('.nav-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Input Area
    languageSelect: document.getElementById('language'),
    messageInput: document.getElementById('message-input'),
    sendButton: document.getElementById('send-btn'),
    charCount: document.querySelector('.char-count'),
    
    // Chat Area
    chatArea: document.getElementById('chat-area'),
    clearChatButton: document.getElementById('clear-chat'),
    
    // Settings
    darkModeToggle: document.getElementById('dark-mode-toggle'),
    fontSizeSelect: document.getElementById('font-size'),
    highContrastToggle: document.getElementById('high-contrast'),
    
    // Avatar
    avatarStatus: document.querySelector('.avatar-status span:last-child'),
    statusDot: document.querySelector('.status-dot'),
    avatarMessage: document.querySelector('.avatar-message')
};

// ===========================
// Initialization
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadPreferences();
    updateCharCount();
    // Avatar status is now simpler
    updateAvatarStatus('Ready', 'var(--success-color)');
});

// ===========================
// Event Listeners
// ===========================
function initializeEventListeners() {
    elements.navButtons.forEach(button => button.addEventListener('click', handleTabSwitch));
    elements.languageSelect.addEventListener('change', handleLanguageChange);
    elements.messageInput.addEventListener('input', updateCharCount);
    elements.messageInput.addEventListener('keydown', handleEnterKey);
    elements.sendButton.addEventListener('click', sendMessage);
    elements.clearChatButton.addEventListener('click', clearChat);
    elements.darkModeToggle.addEventListener('change', toggleDarkMode);
    elements.fontSizeSelect.addEventListener('change', changeFontSize);
    elements.highContrastToggle.addEventListener('change', toggleHighContrast);
}

// ===========================
// Tab Navigation
// ===========================
function handleTabSwitch(e) {
    const targetTab = e.currentTarget.dataset.tab;
    elements.navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === targetTab));
    elements.tabContents.forEach(content => content.classList.toggle('active', content.id === `${targetTab}-tab`));
    localStorage.setItem('activeTab', targetTab);
}

// ===========================
// Language Handling
// ===========================
function handleLanguageChange(e) {
    state.currentLanguage = e.target.value;
    elements.messageInput.placeholder = state.currentLanguage === 'hindi' 
        ? 'Apna message yahan type karein...' 
        : 'Type your message here...';
    showNotification(`Language switched to ${state.currentLanguage === 'hindi' ? 'Hindi (Hinglish)' : 'English'}`);
    localStorage.setItem('preferredLanguage', state.currentLanguage);
}

// ===========================
// Message Handling
// ===========================
function sendMessage() {
    const messageText = elements.messageInput.value.trim();
    if (messageText === '') {
        shakeElement(elements.messageInput);
        return;
    }
    if (messageText.length > 500) {
        showNotification('Message exceeds 500 character limit', 'error');
        return;
    }
    const message = {
        id: Date.now(),
        text: messageText,
        language: state.currentLanguage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'user'
    };
    state.messages.push(message);
    displayMessage(message);
    
    elements.messageInput.value = '';
    updateCharCount();
    
    // Simulate avatar response directly
    simulateAvatarResponse(messageText);

    localStorage.setItem('chatHistory', JSON.stringify(state.messages));
}

function displayMessage(message) {
    const placeholder = elements.chatArea.querySelector('.chat-placeholder');
    if (placeholder) placeholder.remove();

    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.type}`;
    messageEl.innerHTML = `
        <div class="message-header">
            <span>${message.type === 'user' ? 'You' : 'System'}</span>
            <span>${message.timestamp}</span>
        </div>
        <div class="message-content">${escapeHtml(message.text)}</div>
        ${message.language === 'hindi' ? `<div class="message-lang" style="font-size: 0.7rem; opacity: 0.7; text-align: right; margin-top: 5px;">[Hinglish]</div>` : ''}
    `;
    elements.chatArea.appendChild(messageEl);
    
    // CHANGE 3: Auto-clear chat history if it exceeds 25 messages
    // This removes the oldest message from the view
    while (elements.chatArea.querySelectorAll('.message').length > 25) {
        elements.chatArea.querySelector('.message:first-child').remove();
    }
    
    // Also trim the state array to keep it in sync
    while (state.messages.length > 25) {
        state.messages.shift();
    }

    elements.chatArea.scrollTop = elements.chatArea.scrollHeight;
}

function clearChat() {
    state.messages = [];
    elements.chatArea.innerHTML = `
        <div class="chat-placeholder">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" opacity="0.5">
                <path d="M10 15C10 12.2386 12.2386 10 15 10H25C27.7614 10 30 12.2386 30 15V20C30 22.7614 27.7614 25 25 25H15C12.2386 25 10 22.7614 10 20V15Z" stroke="currentColor" stroke-width="2"/>
                <circle cx="15" cy="17" r="1.5" fill="currentColor"/><circle cx="20" cy="17" r="1.5" fill="currentColor"/><circle cx="25" cy="17" r="1.5" fill="currentColor"/>
            </svg>
            <p>Your messages will appear here</p>
        </div>
    `;
    localStorage.removeItem('chatHistory');
    showNotification('Chat history cleared');
}

function handleEnterKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

// ===========================
// Avatar Simulation
// ===========================
function simulateAvatarResponse(text) {
    if (state.isSigning) return;
    state.isSigning = true;

    updateAvatarStatus('Processing', 'var(--warning-color)');
    
    setTimeout(() => {
        updateAvatarStatus('Signing...', 'var(--accent-color)');
        const systemMessage = {
            id: Date.now(),
            text: `Converting "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}" to sign language.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'system'
        };
        state.messages.push(systemMessage);
        displayMessage(systemMessage);
        
        // Simulate signing time
        setTimeout(() => {
            updateAvatarStatus('Ready', 'var(--success-color)');
            state.isSigning = false;
        }, 1500); // Reduced delay as there's no animation
    }, 500); // Reduced delay
}

function updateAvatarStatus(statusText, dotColor) {
    // Check if elements exist before updating (good practice)
    if (elements.avatarStatus) {
        elements.avatarStatus.textContent = statusText;
    }
    if (elements.statusDot) {
        elements.statusDot.style.backgroundColor = dotColor;
    }
}

// ===========================
// Settings Management
// ===========================
function toggleDarkMode() {
    state.darkMode = elements.darkModeToggle.checked;
    document.body.classList.toggle('dark-mode', state.darkMode);
    localStorage.setItem('darkMode', state.darkMode);
}

function changeFontSize() {
    state.fontSize = elements.fontSizeSelect.value;
    document.body.className = document.body.className.replace(/font-(small|medium|large)/g, '');
    document.body.classList.add(`font-${state.fontSize}`);
    localStorage.setItem('fontSize', state.fontSize);
}

function toggleHighContrast() {
    state.highContrast = elements.highContrastToggle.checked;
    document.body.classList.toggle('high-contrast', state.highContrast);
    localStorage.setItem('highContrast', state.highContrast);
}

// ===========================
// Preferences & Storage
// ===========================
function loadPreferences() {
    // Dark Mode
    state.darkMode = localStorage.getItem('darkMode') === 'true';
    elements.darkModeToggle.checked = state.darkMode;
    document.body.classList.toggle('dark-mode', state.darkMode);

    // Font Size
    state.fontSize = localStorage.getItem('fontSize') || 'medium';
    elements.fontSizeSelect.value = state.fontSize;
    document.body.classList.add(`font-${state.fontSize}`);

    // Language
    state.currentLanguage = localStorage.getItem('preferredLanguage') || 'english';
    elements.languageSelect.value = state.currentLanguage;
    handleLanguageChange({ target: { value: state.currentLanguage } });

    // High Contrast
    state.highContrast = localStorage.getItem('highContrast') === 'true';
    elements.highContrastToggle.checked = state.highContrast;
    document.body.classList.toggle('high-contrast', state.highContrast);

    // Chat History
    try {
        const savedMessages = JSON.parse(localStorage.getItem('chatHistory'));
        if (savedMessages && savedMessages.length) {
            // Ensure loaded history also respects the limit
            state.messages = savedMessages.slice(-25); 
            state.messages.forEach(displayMessage);
        }
    } catch (e) {
        console.error("Could not load chat history:", e);
    }

    // Active Tab
    const savedTab = localStorage.getItem('activeTab') || 'interface';
    const tabButton = document.querySelector(`[data-tab="${savedTab}"]`);
    if (tabButton) tabButton.click();
}

// ===========================
// Utility Functions
// ===========================
function updateCharCount() {
    const count = elements.messageInput.value.length;
    elements.charCount.textContent = `${count} / 500`;
    elements.charCount.style.color = count > 500 ? 'var(--error-color)' : 'var(--text-tertiary)';
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '12px 20px',
        borderRadius: '8px',
        backgroundColor: type === 'error' ? '#f56565' : (type === 'warning' ? '#ed8936' : '#667eea'),
        color: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '1000',
        transition: 'opacity 0.5s, transform 0.5s',
        opacity: '0',
    });

    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function shakeElement(element) {
    element.style.animation = 'shake 0.5s';
    setTimeout(() => element.style.animation = '', 500);
}

const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}`;
document.head.appendChild(styleSheet);