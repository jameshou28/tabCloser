# Tab Closer Chrome Extension

A Chrome extension that automatically closes tabs when they match URLs on your blocklist.

## Features

- Automatically closes tabs that match URLs on your blocklist
- Manage your blocklist through a simple popup interface
- Supports both exact URL matches and partial matches
- Data is synced across your Chrome browsers

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `tabCloser` directory
5. The extension will now appear in your Chrome toolbar

## Usage

1. Click the Tab Closer icon in your Chrome toolbar
2. Enter a URL or domain name you want to block (e.g., `facebook.com`, `youtube.com`)
3. Click "Add" to add it to your blocklist
4. The extension will automatically close any tabs that navigate to blocked URLs
5. You can remove URLs from your blocklist by clicking the "Remove" button

## How it Works

The extension monitors tab updates and creations. When a tab navigates to a URL, it checks if the URL matches any entry in your blocklist. If there's a match, the tab is automatically closed.

## File Structure

- `manifest.json` - Extension configuration and permissions
- `background.js` - Service worker that monitors tabs and closes blocked ones
- `popup.html` - Popup interface for managing the blocklist
- `popup.js` - JavaScript logic for the popup interface
- `icon*.png` - Extension icons (optional)

## Permissions

- `storage` - To save your blocklist
- `tabs` - To monitor and close tabs

## Notes

- URLs are matched case-insensitively
- Both exact matches and partial matches work (e.g., blocking `facebook.com` will also block `www.facebook.com`)
- Your blocklist is synced across all Chrome browsers where you're signed in
