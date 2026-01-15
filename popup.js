document.addEventListener('DOMContentLoaded', function() {
  const urlInput = document.getElementById('urlInput');
  const addBtn = document.getElementById('addBtn');
  const urlList = document.getElementById('urlList');
  
  // Load and display blocked URLs
  loadBlockedUrls();
  
  // Add URL to blocklist
  addBtn.addEventListener('click', addUrl);
  urlInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addUrl();
    }
  });
  
  function addUrl() {
    const url = urlInput.value.trim();
    
    if (!url) {
      alert('Please enter a URL');
      return;
    }
    
    chrome.storage.sync.get(['blockedUrls'], function(result) {
      const blockedUrls = result.blockedUrls || [];
      
      // Check if URL already exists
      if (blockedUrls.includes(url)) {
        alert('This URL is already blocked');
        return;
      }
      
      // Add URL to blocklist
      blockedUrls.push(url);
      
      chrome.storage.sync.set({ blockedUrls: blockedUrls }, function() {
        urlInput.value = '';
        loadBlockedUrls();
      });
    });
  }
  
  function removeUrl(url) {
    chrome.storage.sync.get(['blockedUrls'], function(result) {
      const blockedUrls = result.blockedUrls || [];
      const updatedUrls = blockedUrls.filter(u => u !== url);
      
      chrome.storage.sync.set({ blockedUrls: updatedUrls }, function() {
        loadBlockedUrls();
      });
    });
  }
  
  function loadBlockedUrls() {
    chrome.storage.sync.get(['blockedUrls'], function(result) {
      const blockedUrls = result.blockedUrls || [];
      
      if (blockedUrls.length === 0) {
        urlList.innerHTML = '<div class="empty-state">No blocked URLs yet</div>';
        return;
      }
      
      urlList.innerHTML = '';
      
      blockedUrls.forEach(url => {
        const urlItem = document.createElement('div');
        urlItem.className = 'url-item';
        
        urlItem.innerHTML = `
          <span class="url-text">${escapeHtml(url)}</span>
          <button class="remove-btn" data-url="${escapeHtml(url)}">Remove</button>
        `;
        
        urlList.appendChild(urlItem);
      });
      
      // Add event listeners to remove buttons
      document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          removeUrl(this.getAttribute('data-url'));
        });
      });
    });
  }
  
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
