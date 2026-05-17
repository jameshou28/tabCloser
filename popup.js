document.addEventListener('DOMContentLoaded', function () {

  // ─── HARDCODED PASSWORD ───────────────────────────────────
  // Change this value in the code to set your unlock password.
  const CORRECT_KEY = 'your-password-here';

  // ─── STATE ───────────────────────────────────────────────
  let currentMode = 'password'; // 'password' | 'time'
  let countdownInterval = null;

  // ─── DOM REFS ─────────────────────────────────────────────
  const urlInput        = document.getElementById('urlInput');
  const addBtn          = document.getElementById('addBtn');
  const urlList         = document.getElementById('urlList');
  const statusPill      = document.getElementById('statusPill');
  const lockSection     = document.getElementById('lockSection');
  const activeLockPanel = document.getElementById('activeLockPanel');

  const cardPassword    = document.getElementById('cardPassword');
  const cardTime        = document.getElementById('cardTime');
  const passwordConfig  = document.getElementById('passwordConfig');
  const timeConfig      = document.getElementById('timeConfig');
  const engageLockBtn   = document.getElementById('engageLockBtn');

  const passwordActivePanel = document.getElementById('passwordActivePanel');
  const timeActivePanel     = document.getElementById('timeActivePanel');
  const unlockKeyInput      = document.getElementById('unlockKeyInput');
  const unlockKeyBtn        = document.getElementById('unlockKeyBtn');
  const countdownDisplay    = document.getElementById('countdownDisplay');

  const lockHours   = document.getElementById('lockHours');
  const lockMinutes = document.getElementById('lockMinutes');
  const lockSeconds = document.getElementById('lockSeconds');

  // ─── INIT ─────────────────────────────────────────────────
  loadBlockedUrls();
  restoreLockState();

  // ─── MODE CARD CLICKS ─────────────────────────────────────
  cardPassword.addEventListener('click', function () { selectMode('password'); });
  cardTime.addEventListener('click',     function () { selectMode('time'); });

  function selectMode(mode) {
    currentMode = mode;

    cardPassword.classList.toggle('selected',       mode === 'password');
    cardPassword.classList.toggle('password-mode',  mode === 'password');
    cardTime.classList.toggle('selected',            mode === 'time');
    cardTime.classList.toggle('time-mode',           mode === 'time');

    passwordConfig.style.display = mode === 'password' ? 'block' : 'none';
    timeConfig.style.display     = mode === 'time'     ? 'block' : 'none';
  }

  // ─── URL MANAGEMENT ───────────────────────────────────────
  addBtn.addEventListener('click', addUrl);
  urlInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') addUrl();
  });

  function addUrl() {
    const url = urlInput.value.trim();
    if (!url) { notify('Enter a URL first', 'error'); return; }

    chrome.storage.sync.get(['blockedUrls'], function (result) {
      const blockedUrls = result.blockedUrls || [];
      if (blockedUrls.includes(url)) { notify('Already blocked', 'error'); return; }
      blockedUrls.push(url);
      chrome.storage.sync.set({ blockedUrls }, function () {
        urlInput.value = '';
        loadBlockedUrls();
        notify('URL added', 'success');
      });
    });
  }

  function removeUrl(url) {
    chrome.storage.sync.get(['blockedUrls'], function (result) {
      const updated = (result.blockedUrls || []).filter(u => u !== url);
      chrome.storage.sync.set({ blockedUrls: updated }, loadBlockedUrls);
    });
  }

  function loadBlockedUrls() {
    chrome.storage.sync.get(['blockedUrls', 'lockState'], function (result) {
      const blockedUrls = result.blockedUrls || [];
      const lockState   = result.lockState   || { type: 'none' };
      const locked      = lockState.type !== 'none';

      if (blockedUrls.length === 0) {
        urlList.innerHTML = '<div class="empty-state">No blocked URLs yet</div>';
        return;
      }

      urlList.innerHTML = '';
      blockedUrls.forEach(url => {
        const item = document.createElement('div');
        item.className = 'url-item';

        const text = document.createElement('span');
        text.className = 'url-text';
        text.textContent = url;

        const btn = document.createElement('button');
        btn.className = 'remove-btn';
        btn.textContent = 'remove';
        btn.disabled = locked;
        if (locked) btn.title = 'Unlock to remove';
        btn.addEventListener('click', function () { removeUrl(url); });

        item.appendChild(text);
        item.appendChild(btn);
        urlList.appendChild(item);
      });
    });
  }

  // ─── ENGAGE LOCK ──────────────────────────────────────────
  engageLockBtn.addEventListener('click', function () {
    if (currentMode === 'password') {
      engagePasswordLock();
    } else {
      engageTimeLock();
    }
  });

  function engagePasswordLock() {
    const lockState = { type: 'password' };
    chrome.storage.sync.set({ lockState }, function () {
      applyLockUI(lockState);
      notify('Password lock engaged', 'success');
    });
  }

  function engageTimeLock() {
    const h = parseInt(lockHours.value)   || 0;
    const m = parseInt(lockMinutes.value) || 0;
    const s = parseInt(lockSeconds.value) || 0;
    const totalSeconds = h * 3600 + m * 60 + s;

    if (totalSeconds <= 0) {
      notify('Set a duration greater than 0', 'error');
      return;
    }

    const unlockAt  = Date.now() + totalSeconds * 1000;
    const lockState = { type: 'time', unlockAt };

    chrome.storage.sync.set({ lockState }, function () {
      applyLockUI(lockState);
      notify('Time lock engaged', 'success');
    });
  }

  // ─── UNLOCK ───────────────────────────────────────────────
  unlockKeyBtn.addEventListener('click', attemptPasswordUnlock);
  unlockKeyInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') attemptPasswordUnlock();
  });

  function attemptPasswordUnlock() {
    if (unlockKeyInput.value === CORRECT_KEY) {
      const lockState = { type: 'none' };
      chrome.storage.sync.set({ lockState }, function () {
        unlockKeyInput.value = '';
        applyLockUI(lockState);
        notify('Unlocked', 'success');
      });
    } else {
      unlockKeyInput.value = '';
      notify('Incorrect key', 'error');
    }
  }

  // ─── RESTORE STATE ON OPEN ────────────────────────────────
  function restoreLockState() {
    chrome.storage.sync.get(['lockState'], function (result) {
      const lockState = result.lockState || { type: 'none' };

      if (lockState.type === 'time' && Date.now() >= lockState.unlockAt) {
        const cleared = { type: 'none' };
        chrome.storage.sync.set({ lockState: cleared }, function () {
          applyLockUI(cleared);
        });
        return;
      }

      applyLockUI(lockState);
    });
  }

  // ─── APPLY LOCK UI ────────────────────────────────────────
  function applyLockUI(lockState) {
    clearInterval(countdownInterval);

    const locked = lockState.type !== 'none';

    loadBlockedUrls();
    addBtn.disabled = locked;

    if (!locked) {
      lockSection.style.display     = 'block';
      activeLockPanel.style.display = 'none';
      setStatus('unlocked', 'Unlocked');
      return;
    }

    lockSection.style.display     = 'none';
    activeLockPanel.style.display = 'block';

    if (lockState.type === 'password') {
      passwordActivePanel.style.display = 'block';
      timeActivePanel.style.display     = 'none';
      setStatus('locked', 'Locked');
    }

    if (lockState.type === 'time') {
      passwordActivePanel.style.display = 'none';
      timeActivePanel.style.display     = 'block';
      setStatus('time-locked', 'Time Locked');
      startCountdown(lockState.unlockAt);
    }
  }

  function startCountdown(unlockAt) {
    function tick() {
      const remaining = Math.max(0, unlockAt - Date.now());
      countdownDisplay.textContent = formatDuration(remaining);

      if (remaining <= 0) {
        clearInterval(countdownInterval);
        const lockState = { type: 'none' };
        chrome.storage.sync.set({ lockState }, function () {
          applyLockUI(lockState);
          notify('Time lock expired', 'success');
        });
      }
    }

    tick();
    countdownInterval = setInterval(tick, 500);
  }

  // ─── HELPERS ──────────────────────────────────────────────
  function setStatus(type, label) {
    statusPill.className   = 'status-pill ' + type;
    statusPill.textContent = label;
  }

  function formatDuration(ms) {
    const total = Math.ceil(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function notify(msg, type) {
    const notif = document.getElementById('notif');
    notif.textContent = msg;
    notif.className   = 'notif show' + (type ? ' ' + type : '');
    setTimeout(() => { notif.className = 'notif'; }, 2200);
  }

});
