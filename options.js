// EcoGuard Pro - Options Page Script

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('save-openai-key').addEventListener('click', saveApiKey);
  document.getElementById('analysis-depth').addEventListener('change', saveSettings);
  document.getElementById('daily-reminders').addEventListener('change', saveSettings);
  document.getElementById('achievement-notifications').addEventListener('change', saveSettings);
}

async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get([
      'openaiApiKey',
      'analysisDepth',
      'dailyReminders',
      'achievementNotifications'
    ]);
    
    if (settings.openaiApiKey) {
      document.getElementById('openai-api-key').value = settings.openaiApiKey;
    }
    
    if (settings.analysisDepth) {
      document.getElementById('analysis-depth').value = settings.analysisDepth;
    }
    
    document.getElementById('daily-reminders').checked = settings.dailyReminders !== false;
    document.getElementById('achievement-notifications').checked = settings.achievementNotifications !== false;
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function saveApiKey() {
  const apiKey = document.getElementById('openai-api-key').value.trim();
  const statusDiv = document.getElementById('openai-status');
  
  if (!apiKey) {
    showStatus('Please enter an API key', 'error');
    return;
  }
  
  if (!apiKey.startsWith('sk-')) {
    showStatus('Invalid API key format', 'error');
    return;
  }
  
  try {
    await chrome.storage.sync.set({ openaiApiKey: apiKey });
    showStatus('API key saved successfully!', 'success');
  } catch (error) {
    showStatus('Error saving API key', 'error');
  }
}

async function saveSettings() {
  try {
    const settings = {
      analysisDepth: document.getElementById('analysis-depth').value,
      dailyReminders: document.getElementById('daily-reminders').checked,
      achievementNotifications: document.getElementById('achievement-notifications').checked
    };
    
    await chrome.storage.sync.set(settings);
    console.log('Settings saved successfully');
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

function showStatus(message, type) {
  const statusDiv = document.getElementById('openai-status');
  statusDiv.textContent = message;
  statusDiv.className = type;
  statusDiv.style.display = 'block';
  
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
} 
