# SecureMail Spam Detector Extension

A powerful browser extension that detects spam emails directly on web pages using SecureMail's advanced AI detection system.

## 🚀 Features

- **Real-time Spam Detection** - Analyze emails on Gmail, Outlook, and other email providers
- **Visual Indicators** - Highlight suspicious emails with color-coded badges
- **Detailed Analysis** - Get confidence scores, risk assessments, and threat categorization
- **Context Menu Integration** - Right-click any text to analyze for spam
- **Mobile-Friendly Design** - Responsive interface that works on all devices
- **SecureMail Integration** - Connects to your SecureMail spam detection API

## 📦 Installation

### Method 1: Developer Mode (Recommended for testing)

1. **Download the Extension**
   - Download all files from the `extension/` folder
   - Or download the complete project and navigate to the `extension/` directory

2. **Open Chrome Extensions**
   - Open Google Chrome
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `extension/` folder
   - The SecureMail extension will appear in your extensions list

4. **Pin the Extension** (Optional)
   - Click the extensions icon (puzzle piece) in Chrome toolbar
   - Pin SecureMail Spam Detector for easy access

### Method 2: Chrome Web Store (Future)
- This extension can be published to the Chrome Web Store for wider distribution

## 🎯 How to Use

### Basic Usage

1. **Navigate to Email Provider**
   - Go to Gmail, Outlook, Yahoo Mail, or any email service
   - The extension badge will show a red dot when active

2. **Scan Emails**
   - Click the SecureMail extension icon
   - Click "Scan for Spam" to analyze visible emails
   - View results with confidence scores and risk assessments

3. **Quick Analysis**
   - Select any text on any webpage
   - Right-click and choose "Analyze with SecureMail"
   - Get instant spam detection results

### Advanced Features

- **Visual Highlighting**: Click the floating shield button on email pages to highlight detected emails
- **Bulk Analysis**: Scan multiple emails at once with detailed breakdown
- **Copy Results**: Export analysis results to clipboard for reporting

## 🔧 Configuration

The extension includes settings for:
- Auto-scan sensitivity levels
- Notification preferences  
- Visual highlight options
- API endpoint configuration

## 🌐 Supported Email Providers

- ✅ Gmail (mail.google.com)
- ✅ Outlook (outlook.live.com, outlook.office.com)
- ✅ Yahoo Mail (mail.yahoo.com)
- ✅ Generic email interfaces
- ✅ Web-based email clients

## 🔐 Privacy & Security

- **No Data Collection**: The extension only analyzes content you explicitly request
- **Local Processing**: Basic analysis runs locally for privacy
- **Secure API**: Advanced analysis uses encrypted connections to SecureMail servers
- **No Storage**: Email content is not stored or transmitted without user action

## 🛠️ Technical Details

### Architecture
- **Manifest V3**: Latest Chrome extension format
- **Content Scripts**: Inject analysis capabilities into web pages
- **Background Service Worker**: Handle API calls and notifications
- **Popup Interface**: User-friendly control panel

### API Integration
The extension connects to your SecureMail API endpoint:
```javascript
// Default endpoint (update in background.js)
const API_ENDPOINT = 'https://your-securemail-api.com/analyze';
```

### Permissions
- `activeTab`: Analyze content on current tab
- `storage`: Save user preferences
- `notifications`: Show analysis results

## 📋 Development

### File Structure
```
extension/
├── manifest.json          # Extension configuration
├── popup.html            # Main interface
├── popup.css             # Styling
├── popup.js              # Interface logic
├── content.js            # Page analysis
├── content.css           # Visual enhancements
├── background.js         # Service worker
├── icons/               # Extension icons
└── README.md            # This file
```

### Building from Source
1. Clone the SecureMail project
2. Navigate to `extension/` directory
3. Add your API endpoint to `background.js`
4. Load as unpacked extension in Chrome

### Customization
- Update API endpoints in `background.js`
- Modify styling in `popup.css` and `content.css`
- Adjust detection rules in spam analysis functions

## 🚀 Deployment Options

1. **Internal Distribution**: Load unpacked for team use
2. **Chrome Web Store**: Publish for public distribution
3. **Enterprise**: Deploy via Chrome Enterprise policies
4. **Self-hosted**: Package as .crx file for custom distribution

## 🆘 Support

For issues or questions:
- Check the console for error messages (`Ctrl+Shift+I`)
- Verify extension permissions are granted
- Ensure you're on a supported email provider
- Contact SecureMail support team

## 📄 License

This extension is part of the SecureMail spam detection system.
Created by Santosh RachaKonda.

---

**Version**: 1.0.0  
**Compatible with**: Chrome 88+, Edge 88+, Firefox 89+ (with modifications)  
**Last Updated**: 2025
