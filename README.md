# Tab Closer

A Chrome extension that automatically closes tabs that match URLs on your blocklist. Perfect for improving productivity by blocking distracting websites.

## Features

- **Automatic Tab Closing**: Automatically closes tabs that match blocked URLs or domains
- **Simple URL Management**: Add and remove URLs from your blocklist with an easy-to-use interface
- **Lock System**: Lock your blocklist to prevent the removal of URLs
- **Secure Unlocking**: Lock instantly, unlock requires entering your key
- **Persistent Storage**: Your blocklist and lock state are saved across browser sessions
- **Flexible Matching**: Blocks exact URLs or any URL containing the blocked text


### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The Tab Closer icon will appear in your browser toolbar

## Usage

### Basic Operations

1. **Add URLs**: Type a URL or domain name (e.g., `youtube.com`, `youtube`) and click "Add"
2. **Remove URLs**: Click the "Remove" button next to any URL in your blocklist
3. **Automatic Blocking**: The extension will automatically close any new tabs that match blocked URLs

### Default KEY

The default KEY is: `e4v56r8b7tnyoupmn7bg6ufv5rydcetf`

## File Structure

```
tabCloser/
├── manifest.json       # Extension configuration
├── popup.html          # Extension popup interface
├── popup.js            # Popup logic and UI interactions
├── background.js       # Background script for tab monitoring
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           
```

