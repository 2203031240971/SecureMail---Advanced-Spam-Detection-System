// Content script for SecureMail Spam Detector Extension
// This script runs on all web pages to help identify and extract email content

(function() {
    'use strict';

    // Add visual indicators for detected emails
    let isHighlightMode = false;
    let highlightedElements = [];

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'highlightEmails') {
            toggleEmailHighlight();
            sendResponse({ success: true });
        } else if (request.action === 'extractEmails') {
            const emails = extractEmailsFromCurrentPage();
            sendResponse({ emails: emails });
        }
    });

    function toggleEmailHighlight() {
        if (isHighlightMode) {
            removeHighlights();
        } else {
            highlightEmails();
        }
        isHighlightMode = !isHighlightMode;
    }

    function highlightEmails() {
        // Clear previous highlights
        removeHighlights();
        
        // Common selectors for email elements
        const emailSelectors = [
            '[data-thread-id]', // Gmail
            '.ms-List-cell', // Outlook
            '.message',
            '.email-item',
            '.mail-item',
            '[role="listitem"]',
            '.conversation',
            '.thread'
        ];

        emailSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (looksLikeEmail(element)) {
                    highlightElement(element);
                }
            });
        });
    }

    function looksLikeEmail(element) {
        const text = element.textContent || '';
        const hasEmailPattern = /@/.test(text);
        const hasSubjectPattern = /subject:/i.test(text);
        const hasFromPattern = /from:/i.test(text);
        const hasEmailStructure = text.length > 50 && (hasEmailPattern || hasSubjectPattern || hasFromPattern);
        
        return hasEmailStructure;
    }

    function highlightElement(element) {
        // Create highlight overlay
        const highlight = document.createElement('div');
        highlight.style.cssText = `
            position: absolute;
            pointer-events: none;
            border: 2px solid #dc2626;
            border-radius: 4px;
            background: rgba(220, 38, 38, 0.1);
            z-index: 10000;
            transition: all 0.3s ease;
        `;
        
        const rect = element.getBoundingClientRect();
        highlight.style.left = (rect.left + window.scrollX) + 'px';
        highlight.style.top = (rect.top + window.scrollY) + 'px';
        highlight.style.width = rect.width + 'px';
        highlight.style.height = rect.height + 'px';
        
        document.body.appendChild(highlight);
        highlightedElements.push(highlight);
        
        // Add SecureMail badge
        const badge = document.createElement('div');
        badge.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background: #dc2626;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            font-family: system-ui, -apple-system, sans-serif;
            z-index: 10001;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        badge.textContent = 'SecureMail';
        highlight.appendChild(badge);
    }

    function removeHighlights() {
        highlightedElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        highlightedElements = [];
    }

    function extractEmailsFromCurrentPage() {
        const emails = [];
        const processed = new Set();

        // Gmail specific extraction
        if (window.location.hostname.includes('mail.google.com')) {
            emails.push(...extractGmailEmails());
        }
        // Outlook specific extraction
        else if (window.location.hostname.includes('outlook.')) {
            emails.push(...extractOutlookEmails());
        }
        // Generic email extraction
        else {
            emails.push(...extractGenericEmails());
        }

        // Remove duplicates
        return emails.filter(email => {
            const key = email.subject + email.sender;
            if (processed.has(key)) return false;
            processed.add(key);
            return true;
        });
    }

    function extractGmailEmails() {
        const emails = [];
        const emailElements = document.querySelectorAll('[data-thread-id], .zA');
        
        emailElements.forEach(element => {
            try {
                const subject = element.querySelector('.bog, .hP')?.textContent?.trim() || 'No Subject';
                const sender = element.querySelector('.go .gb')?.textContent?.trim() || 'Unknown Sender';
                const content = element.textContent?.trim() || '';
                
                if (content.length > 20) {
                    emails.push({
                        subject: subject,
                        sender: sender,
                        content: content.substring(0, 500),
                        source: 'Gmail'
                    });
                }
            } catch (e) {
                console.warn('Error extracting Gmail email:', e);
            }
        });
        
        return emails;
    }

    function extractOutlookEmails() {
        const emails = [];
        const emailElements = document.querySelectorAll('.ms-List-cell, [role="listitem"]');
        
        emailElements.forEach(element => {
            try {
                const subject = element.querySelector('[title], .subject')?.textContent?.trim() || 'No Subject';
                const sender = element.querySelector('.sender, .from')?.textContent?.trim() || 'Unknown Sender';
                const content = element.textContent?.trim() || '';
                
                if (content.length > 20) {
                    emails.push({
                        subject: subject,
                        sender: sender,
                        content: content.substring(0, 500),
                        source: 'Outlook'
                    });
                }
            } catch (e) {
                console.warn('Error extracting Outlook email:', e);
            }
        });
        
        return emails;
    }

    function extractGenericEmails() {
        const emails = [];
        const text = document.body.textContent;
        
        // Look for email patterns in the page text
        const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
        const emailAddresses = text.match(emailRegex) || [];
        
        // Try to find structured content that looks like emails
        const paragraphs = document.querySelectorAll('p, div, article, section');
        
        paragraphs.forEach((para, index) => {
            const content = para.textContent?.trim() || '';
            if (content.length > 50 && (content.includes('@') || content.toLowerCase().includes('subject:'))) {
                emails.push({
                    subject: `Content Block ${index + 1}`,
                    sender: 'Extracted from page',
                    content: content.substring(0, 500),
                    source: 'Generic'
                });
            }
        });
        
        return emails.slice(0, 10); // Limit results
    }

    // Add floating action button for quick access
    function addFloatingButton() {
        const button = document.createElement('div');
        button.id = 'securemail-fab';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 56px;
            height: 56px;
            background: #dc2626;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            transition: all 0.3s ease;
            opacity: 0.9;
        `;
        
        button.innerHTML = '🛡️';
        button.title = 'SecureMail Spam Detector';
        
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.opacity = '1';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.opacity = '0.9';
        });
        
        button.addEventListener('click', () => {
            toggleEmailHighlight();
        });
        
        document.body.appendChild(button);
    }

    // Initialize the extension
    function init() {
        // Only add floating button on email domains
        const hostname = window.location.hostname;
        if (hostname.includes('mail.') || hostname.includes('outlook.') || hostname.includes('yahoo.') || hostname.includes('gmail.')) {
            setTimeout(addFloatingButton, 2000); // Delay to ensure page is loaded
        }
    }

    // Wait for page to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
