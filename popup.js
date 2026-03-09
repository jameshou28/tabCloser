document.addEventListener('DOMContentLoaded', function() {
  const urlInput = document.getElementById('urlInput');
  const addBtn = document.getElementById('addBtn');
  const urlList = document.getElementById('urlList');
  const lockBtn = document.getElementById('lockBtn');
  
  let isLocked = false;
  const CORRECT_KEY = 'e4v56r8b7tnyoupmn7bg6ufv5rydcetf';
  
  // load and display blocked urls and lock state
  loadBlockedUrls();
  loadLockState();
  
  // add url to blocklist
  addBtn.addEventListener('click', addUrl);
  urlInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addUrl();
    }
  });
  
  // lock!
  lockBtn.addEventListener('click', handleLockClick);
  
  function addUrl() {
    const url = urlInput.value.trim();
    
    if (!url) {
      alert('Please enter a URL');
      return;
    }
    
    chrome.storage.sync.get(['blockedUrls'], function(result) {
      const blockedUrls = result.blockedUrls || [];
      
      // check if url already exists
      if (blockedUrls.includes(url)) {
        alert('This URL is already blocked');
        return;
      }
      
      // add url to blocklist
      blockedUrls.push(url);
      
      chrome.storage.sync.set({ blockedUrls: blockedUrls }, function() {
        urlInput.value = '';
        loadBlockedUrls();
      });
    });
  }
  
  function removeUrl(url) {
    if (isLocked) {
      alert('Cannot remove URLs while locked. Unlock to remove URLs.');
      return;
    }
    
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
      
      // add event listeners to remove buttons
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
  
  function handleLockClick() {
    if (isLocked) {
      // unlock attempt
      const enteredKey = prompt('Enter KEY to unlock:');
      if (enteredKey === CORRECT_KEY) {
        isLocked = false;
        updateLockUI();
        saveLockState();
      } else if (enteredKey !== null) {
        alert('Incorrect KEY!');
      }
    } else {
      // lock
      isLocked = true;
      updateLockUI();
      saveLockState();
    }
  }
  
  function updateLockUI() {
    if (isLocked) {
      lockBtn.textContent = '🔒';
      lockBtn.title = 'Locked - Click to unlock with KEY';
    } else {
      lockBtn.textContent = '🔓';
      lockBtn.title = 'Unlocked - Click to lock';
    }
  }
  
  function saveLockState() {
    chrome.storage.sync.set({ isLocked: isLocked });
  }
  
  function loadLockState() {
    chrome.storage.sync.get(['isLocked'], function(result) {
      isLocked = result.isLocked || false;
      updateLockUI();
    });
  }
});
