// EcoGuard Pro - Side Panel Script

document.addEventListener('DOMContentLoaded', async () => {
  await loadRecentAnalyses();
  setupEventListeners();
  updateCurrentScore();
});

function setupEventListeners() {
  document.getElementById('side-analyze').addEventListener('click', quickAnalyze);
  document.getElementById('side-open-popup').addEventListener('click', openFullDashboard);
}

async function updateCurrentScore() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const storage = await chrome.storage.local.get(`analysis_${tab.url}`);
    const analysis = storage[`analysis_${tab.url}`];
    
    if (analysis && analysis.overallScore) {
      document.getElementById('side-current-score').textContent = analysis.overallScore;
    } else {
      document.getElementById('side-current-score').textContent = '--';
    }
  } catch (error) {
    console.error('Error updating current score:', error);
  }
}

async function loadRecentAnalyses() {
  try {
    const storage = await chrome.storage.local.get(null);
    const analyses = Object.entries(storage)
      .filter(([key]) => key.startsWith('analysis_'))
      .map(([key, value]) => ({
        url: key.replace('analysis_', ''),
        ...value
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 3);
    
    const listElement = document.getElementById('side-recent-list');
    
    if (analyses.length === 0) {
      listElement.innerHTML = '<p>No recent analyses</p>';
      return;
    }
    
    listElement.innerHTML = analyses
      .map(analysis => `
        <div class="recent-item" style="margin-bottom: 8px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
          <div style="font-weight: 600; font-size: 14px;">${getHostname(analysis.url)}</div>
          <div style="font-size: 12px; color: #666;">Score: ${analysis.overallScore || 'N/A'}</div>
        </div>
      `)
      .join('');
  } catch (error) {
    console.error('Error loading recent analyses:', error);
  }
}

async function quickAnalyze() {
  const button = document.getElementById('side-analyze');
  button.textContent = 'Analyzing...';
  button.disabled = true;
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send message to background script to start analysis
    chrome.runtime.sendMessage({
      action: 'analyzeWebsite',
      url: tab.url
    });
    
    // Update UI after a short delay
    setTimeout(() => {
      updateCurrentScore();
      button.textContent = 'Quick Analyze';
      button.disabled = false;
    }, 2000);
    
  } catch (error) {
    console.error('Error during quick analysis:', error);
    button.textContent = 'Quick Analyze';
    button.disabled = false;
  }
}

async function openFullDashboard() {
  try {
    // Open the popup in a new tab for a full dashboard experience
    chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
  } catch (error) {
    console.error('Error opening full dashboard:', error);
  }
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
} 
