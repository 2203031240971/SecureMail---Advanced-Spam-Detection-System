// Background service worker for SecureMail Spam Detector Extension

// Extension installation and updates
chrome.runtime.onInstalled.addListener((details) => {
    console.log('SecureMail Spam Detector Extension installed/updated');
    
    if (details.reason === 'install') {
        // Show welcome notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'SecureMail Spam Detector',
            message: 'Extension installed! Click the extension icon to start detecting spam emails.'
        });
        
        // Set default settings
        chrome.storage.sync.set({
            enableAutoScan: false,
            scanConfidence: 70,
            showNotifications: true,
            highlightSpam: true
        });
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
    try {
        // Check if we're on a supported page
        if (tab.url.includes('mail.') || tab.url.includes('outlook.') || tab.url.includes('gmail.')) {
            // Inject content script if not already present
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
            
            // Show popup
            chrome.action.setPopup({ popup: 'popup.html' });
        } else {
            // Show notification for unsupported pages
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'SecureMail Spam Detector',
                message: 'Navigate to an email provider (Gmail, Outlook, etc.) to use this extension.'
            });
        }
    } catch (error) {
        console.error('Error handling extension click:', error);
    }
});

// Context menu integration
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'analyzeText',
        title: 'Analyze with SecureMail',
        contexts: ['selection']
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'analyzeText' && info.selectionText) {
        try {
            // Analyze selected text
            const result = await analyzeTextForSpam(info.selectionText);
            
            // Show result notification
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: `SecureMail Analysis: ${result.result.toUpperCase()}`,
                message: `Confidence: ${result.confidence}% | Risk Score: ${result.riskScore}/100`
            });
        } catch (error) {
            console.error('Error analyzing selected text:', error);
        }
    }
});

// Message handling from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'analyzeEmail':
            analyzeEmailContent(request.data)
                .then(result => sendResponse({ success: true, result }))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true; // Keep message channel open for async response
            
        case 'getSettings':
            chrome.storage.sync.get(['enableAutoScan', 'scanConfidence', 'showNotifications', 'highlightSpam'])
                .then(settings => sendResponse({ success: true, settings }))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;
            
        case 'updateSettings':
            chrome.storage.sync.set(request.settings)
                .then(() => sendResponse({ success: true }))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;
            
        case 'showNotification':
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: request.title,
                message: request.message
            });
            sendResponse({ success: true });
            break;
    }
});

// Allow web app to open the extension popup
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    try {
        if (request && request.type === 'OPEN_EXTENSION_POPUP') {
            chrome.action.openPopup().then(() => {
                sendResponse({ success: true });
            }).catch((err) => {
                console.warn('openPopup failed, falling back to URL', err);
                // Fallback: return popup page URL so the app can open it in a new tab
                sendResponse({ success: false, reason: 'openPopup_failed', popupPath: 'popup.html' });
            });
            return true; // async response
        }
    } catch (e) {
        sendResponse({ success: false, error: String(e) });
    }
});

// Spam analysis function
async function analyzeEmailContent(emailData) {
    try {
        // This would normally call your SecureMail API
        // For demo purposes, using local analysis
        return await performLocalSpamAnalysis(emailData);
    } catch (error) {
        console.error('Error analyzing email:', error);
        throw error;
    }
}

async function analyzeTextForSpam(text) {
    return await performLocalSpamAnalysis({
        content: text,
        subject: 'Selected Text',
        sender: 'Unknown'
    });
}

// Local spam analysis (demo implementation)
async function performLocalSpamAnalysis(emailData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const content = (emailData.content || '').toLowerCase();
    const subject = (emailData.subject || '').toLowerCase();
    const sender = (emailData.sender || '').toLowerCase();
    
    // Spam detection rules
    const spamKeywords = [
        'win', 'prize', 'congratulations', 'urgent', 'act now', 'limited time',
        'free money', 'lottery', 'claim', 'click here', 'guarantee', 'winner',
        'debt', 'refinance', 'mortgage', 'viagra', 'pharmacy', 'casino'
    ];
    
    const suspiciousKeywords = [
        'offer', 'deal', 'discount', 'sale', 'promotion', 'marketing',
        'unsubscribe', 'newsletter', 'advertisement'
    ];
    
    const phishingKeywords = [
        'verify account', 'suspended', 'security alert', 'update payment',
        'confirm identity', 'login required', 'expires today'
    ];
    
    let spamScore = 0;
    let suspiciousScore = 0;
    let phishingScore = 0;
    let flags = [];
    
    // Check for spam keywords
    spamKeywords.forEach(keyword => {
        if (content.includes(keyword) || subject.includes(keyword)) {
            spamScore += 15;
            flags.push(`Spam keyword: ${keyword}`);
        }
    });
    
    // Check for suspicious keywords
    suspiciousKeywords.forEach(keyword => {
        if (content.includes(keyword) || subject.includes(keyword)) {
            suspiciousScore += 8;
        }
    });
    
    // Check for phishing keywords
    phishingKeywords.forEach(keyword => {
        if (content.includes(keyword) || subject.includes(keyword)) {
            phishingScore += 20;
            flags.push(`Phishing indicator: ${keyword}`);
        }
    });
    
    // Check sender reputation
    if (sender.includes('noreply') && content.includes('click')) {
        suspiciousScore += 10;
        flags.push('No-reply sender with links');
    }
    
    if (sender.includes('fake') || sender.includes('scam') || sender.includes('spam')) {
        spamScore += 25;
        flags.push('Suspicious sender domain');
    }
    
    // Check for excessive capitalization
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.3 && content.length > 50) {
        spamScore += 10;
        flags.push('Excessive capitalization');
    }
    
    // Check for multiple exclamation marks
    if ((content.match(/!/g) || []).length > 3) {
        spamScore += 5;
        flags.push('Excessive punctuation');
    }
    
    // Calculate final scores
    const totalSpamScore = spamScore + phishingScore;
    const totalScore = totalSpamScore + suspiciousScore;
    
    let result, confidence, category;
    
    if (totalSpamScore >= 35) {
        result = 'spam';
        confidence = Math.min(85 + Math.random() * 14, 99);
        category = phishingScore > spamScore ? 'phishing' : 'scam';
    } else if (totalScore >= 20) {
        result = 'suspicious';
        confidence = Math.min(60 + Math.random() * 25, 84);
        category = 'promotional';
    } else {
        result = 'clean';
        confidence = Math.min(75 + Math.random() * 20, 95);
        category = 'legitimate';
    }
    
    return {
        result,
        confidence: Math.round(confidence),
        riskScore: Math.min(Math.round(totalScore * 2.5), 100),
        category,
        flags: flags.slice(0, 5) // Limit flags
    };
}

// Badge management
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        updateBadgeForTab(tab);
    } catch (error) {
        console.error('Error updating badge:', error);
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        updateBadgeForTab(tab);
    }
});

function updateBadgeForTab(tab) {
    if (!tab.url) return;
    
    const hostname = new URL(tab.url).hostname;
    
    if (hostname.includes('mail.') || hostname.includes('outlook.') || hostname.includes('gmail.')) {
        chrome.action.setBadgeText({ text: '●', tabId: tab.id });
        chrome.action.setBadgeBackgroundColor({ color: '#dc2626', tabId: tab.id });
        chrome.action.setTitle({ title: 'SecureMail Spam Detector - Click to scan emails', tabId: tab.id });
    } else {
        chrome.action.setBadgeText({ text: '', tabId: tab.id });
        chrome.action.setTitle({ title: 'SecureMail Spam Detector - Navigate to email provider', tabId: tab.id });
    }
}

// Cleanup on extension shutdown
chrome.runtime.onSuspend.addListener(() => {
    console.log('SecureMail Spam Detector Extension suspending...');
});
