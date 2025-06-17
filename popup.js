function updatePopup(score, logic) {
  document.getElementById('score-label').innerText = `Score: ${score ?? "N/A"} / 100`;
  document.getElementById('logic').innerText = logic ?? "No details available.";

  if (score !== null && score !== undefined) {
    const bar = document.getElementById('score-bar');
    bar.style.width = `${score}%`;
    bar.style.backgroundColor = score >= 75 ? '#00a86b' : score >= 50 ? '#ffc107' : '#dc3545';
  }
}

function extractScore(text) {
  const patterns = [
    /overall\s+score[:\s]*(\d{1,3})\s*\/\s*100/i,
    /score[:\s]*(\d{1,3})\s*\/\s*100/i,
    /(\d{1,3})\s*\/\s*100/,
    /score[:\s]*(\d{1,3})/i,
    /(\d{1,3})\s*out\s*of\s*100/i
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return parseInt(m[1]);
  }
  return null;
}

// Toggle details
document.getElementById('toggle-details').addEventListener('click', () => {
  const sec = document.getElementById('details-section');
  const btn = document.getElementById('toggle-details');
  const visible = sec.style.display === 'block';
  sec.style.display = visible ? 'none' : 'block';
  btn.innerText = visible ? 'View Details' : 'Hide Details';
});

// Toggle settings
document.getElementById('toggle-settings').addEventListener('click', () => {
  const panel = document.getElementById('settings-panel');
  const visible = panel.style.display === 'block';
  panel.style.display = visible ? 'none' : 'block';
});

// Load saved API key on popup open
chrome.storage.sync.get(['openaiApiKey'], (result) => {
  if (result.openaiApiKey) {
    document.getElementById('api-key-input').value = result.openaiApiKey;
    showApiStatus('API key loaded', 'success');
  }
});

// Save API key
document.getElementById('save-api-key').addEventListener('click', () => {
  const apiKey = document.getElementById('api-key-input').value.trim();
  
  if (!apiKey) {
    showApiStatus('Please enter an API key', 'error');
    return;
  }
  
  if (!apiKey.startsWith('sk-')) {
    showApiStatus('Invalid API key format', 'error');
    return;
  }
  
  chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
    showApiStatus('API key saved successfully!', 'success');
    // Hide settings panel after saving
    setTimeout(() => {
      document.getElementById('settings-panel').style.display = 'none';
    }, 1500);
  });
});

function showApiStatus(message, type) {
  const status = document.getElementById('api-status');
  status.textContent = message;
  status.className = type;
  status.style.display = 'block';
}

// Main button
document.getElementById('checkButton').addEventListener('click', () => {
  updatePopup(null, 'Analyzing... This may take a moment.');
  showResearchStatus('🔍 Gathering page information...');
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'scrape' }, (resp) => {
      if (!resp?.pageText) {
        updatePopup(null, 'No content found on this page.');
        return;
      }
      
      // Format the enhanced data for AI analysis
      const formattedText = formatScrapedData(resp);
      
      // Show external research status if company detected
      if (resp.companyName) {
        showResearchStatus(`🌐 Researching ${resp.companyName} externally...`);
      }
      
      chrome.runtime.sendMessage(
        { 
          action: 'processText', 
          text: formattedText,
          companyName: resp.companyName 
        },
        (res) => {
          console.log('BG response:', res);
          hideResearchStatus();
          const resultText = res.result ?? 'No response';
          const score = extractScore(resultText);
          updatePopup(score, resultText);
          showSuggestedLinks(resp.relatedLinks);
        }
      );
    });
  });
});

function formatScrapedData(data) {
  let formatted = `COMPANY ANALYSIS REQUEST\n\n`;
  
  formatted += `Company: ${data.companyName || 'Unknown'}\n`;
  formatted += `Website: ${data.metaInfo?.domain || 'Unknown'}\n`;
  formatted += `Page Type: ${data.pageType || 'general'}\n\n`;
  
  if (data.materials && data.materials.length > 0) {
    formatted += `MATERIALS MENTIONED:\n${data.materials.join(', ')}\n\n`;
  }
  
  if (data.sustainabilityInfo && data.sustainabilityInfo.length > 0) {
    formatted += `SUSTAINABILITY CLAIMS:\n`;
    data.sustainabilityInfo.forEach(info => {
      formatted += `• ${info}\n`;
    });
    formatted += '\n';
  }
  
  if (data.relatedLinks && data.relatedLinks.length > 0) {
    formatted += `RELATED PAGES FOUND:\n`;
    data.relatedLinks.forEach(link => {
      formatted += `• ${link.type}: ${link.text}\n`;
    });
    formatted += '\n';
  }
  
  formatted += `MAIN CONTENT:\n${data.pageText}`;
  
  return formatted;
}

function showSuggestedLinks(relatedLinks) {
  const suggestionsSection = document.getElementById('suggestions-section');
  const suggestedLinksContainer = document.getElementById('suggested-links');
  
  if (!relatedLinks || relatedLinks.length === 0) {
    suggestionsSection.style.display = 'none';
    return;
  }
  
  suggestedLinksContainer.innerHTML = '';
  relatedLinks.forEach(link => {
    const linkElement = document.createElement('div');
    linkElement.className = 'suggested-link';
    linkElement.innerHTML = `
      <span class="link-type">${link.type}</span>: 
      <a href="${link.url}" target="_blank">${link.text}</a>
    `;
    suggestedLinksContainer.appendChild(linkElement);
  });
  
  suggestionsSection.style.display = 'block';
}

function showResearchStatus(message) {
  const statusDiv = document.getElementById('research-status');
  const statusText = document.getElementById('research-text');
  statusText.textContent = message;
  statusDiv.style.display = 'block';
}

function hideResearchStatus() {
  const statusDiv = document.getElementById('research-status');
  statusDiv.style.display = 'none';
}