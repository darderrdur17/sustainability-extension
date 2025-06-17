// 🌱 EcoGuard Pro - Advanced Popup Controller
class EcoGuardPro {
  constructor() {
    this.currentTab = 'analysis';
    this.analysisInProgress = false;
    this.currentScore = null;
    this.userData = {
      level: 1,
      xp: 0,
      streak: 0,
      totalAnalyses: 0,
      achievements: []
    };
    this.init();
  }

  async init() {
    await this.loadUserData();
    this.setupEventListeners();
    this.updateUI();
    this.initializeTabs();
    this.loadDashboard();
    this.setupFloatingActionButton();
    
    // Auto-analyze if enabled
    const settings = await this.getSettings();
    if (settings.autoAnalyze) {
      setTimeout(() => this.performAnalysis(), 1000);
    }
  }

  // ==================== EVENT LISTENERS ====================
  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Main analyze button
    document.getElementById('checkButton').addEventListener('click', () => {
      this.performAnalysis();
    });

    // Settings events
    document.getElementById('test-openai').addEventListener('click', () => {
      this.testApiKey('openai');
    });

    document.getElementById('test-anthropic').addEventListener('click', () => {
      this.testApiKey('anthropic');
    });

    // Data management
    document.getElementById('export-data').addEventListener('click', () => {
      this.exportData();
    });

    document.getElementById('clear-data').addEventListener('click', () => {
      this.clearData();
    });

    // Quick actions
    document.getElementById('quick-analyze').addEventListener('click', () => {
      this.performQuickAnalysis();
    });

    document.getElementById('share-score').addEventListener('click', () => {
      this.shareScore();
    });

    document.getElementById('suggest-improvement').addEventListener('click', () => {
      this.suggestImprovements();
    });

    // Settings persistence
    ['openai-key', 'anthropic-key', 'daily-reminder', 'achievement-notifications', 'analysis-depth', 'auto-analyze'].forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', () => this.saveSettings());
      }
    });
  }

  setupFloatingActionButton() {
    const fab = document.getElementById('quick-fab');
    const fabMenu = document.getElementById('fab-menu');
    let menuOpen = false;

    fab.addEventListener('click', () => {
      menuOpen = !menuOpen;
      fabMenu.classList.toggle('active', menuOpen);
      fab.style.transform = menuOpen ? 'rotate(45deg)' : 'rotate(0deg)';
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!fab.contains(e.target) && !fabMenu.contains(e.target) && menuOpen) {
        menuOpen = false;
        fabMenu.classList.remove('active');
        fab.style.transform = 'rotate(0deg)';
      }
    });
  }

  // ==================== TAB MANAGEMENT ====================
  initializeTabs() {
    this.switchTab('analysis');
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-tab`);
    });

    this.currentTab = tabName;

    // Load tab-specific content
    switch (tabName) {
      case 'dashboard':
        this.loadDashboard();
        break;
      case 'compare':
        this.loadComparison();
        break;
      case 'history':
        this.loadHistory();
        break;
      case 'settings':
        this.loadSettings();
        break;
    }
  }

  // ==================== ANALYSIS ENGINE ====================
  async performAnalysis() {
    if (this.analysisInProgress) return;
    
    this.analysisInProgress = true;
    this.showAnalysisProgress();

    try {
      // Get current tab info
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Extract page content
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'scrape' });
      
      if (!response?.pageText) {
        this.showError('No content found on this page');
        return;
      }

      // Update progress
      this.updateProgress(25, '🔍 Analyzing page content...');

      // Format data for AI analysis
      const analysisData = this.formatAnalysisData(response);
      
      // Update progress
      this.updateProgress(50, '🤖 Running AI analysis...');

      // Send to background for AI processing
      const aiResponse = await this.sendToBackground({
        action: 'processText',
        data: analysisData,
        depth: await this.getAnalysisDepth()
      });

      // Update progress
      this.updateProgress(75, '📊 Calculating sustainability score...');

      // Process AI response
      const analysisResult = this.processAIResponse(aiResponse);
      
      // Update progress
      this.updateProgress(100, '✅ Analysis complete!');

      // Display results
      setTimeout(() => {
        this.displayAnalysisResults(analysisResult);
        this.updateUserProgress();
        this.saveAnalysisToHistory(analysisResult, response);
      }, 500);

    } catch (error) {
      console.error('Analysis error:', error);
      this.showError(`Analysis failed: ${error.message}`);
    } finally {
      this.analysisInProgress = false;
    }
  }

  async performQuickAnalysis() {
    // Quick 30-second analysis
    const originalDepth = await this.getAnalysisDepth();
    await this.setAnalysisDepth('quick');
    await this.performAnalysis();
    await this.setAnalysisDepth(originalDepth);
  }

  formatAnalysisData(scrapedData) {
    return {
      companyName: scrapedData.companyName,
      domain: scrapedData.metaInfo?.domain,
      pageType: scrapedData.pageType,
      content: scrapedData.pageText,
      materials: scrapedData.materials,
      sustainabilityInfo: scrapedData.sustainabilityInfo,
      relatedLinks: scrapedData.relatedLinks,
      timestamp: new Date().toISOString()
    };
  }

  processAIResponse(response) {
    const result = response.result || '';
    
    // Extract overall score
    const overallScore = this.extractScore(result);
    
    // Extract breakdown scores
    const breakdownScores = this.extractBreakdownScores(result);
    
    // Extract key findings
    const keyFindings = this.extractKeyFindings(result);
    
    // Extract improvements
    const improvements = this.extractImprovements(result);
    
    // Extract certifications
    const certifications = this.extractCertifications(result);
    
    // Calculate confidence level
    const confidence = this.calculateConfidence(result, overallScore);

    return {
      overallScore,
      breakdownScores,
      keyFindings,
      improvements,
      certifications,
      confidence,
      rawResponse: result,
      timestamp: new Date().toISOString()
    };
  }

  extractScore(text) {
  const patterns = [
    /overall\s+score[:\s]*(\d{1,3})\s*\/\s*100/i,
    /score[:\s]*(\d{1,3})\s*\/\s*100/i,
    /(\d{1,3})\s*\/\s*100/,
    /score[:\s]*(\d{1,3})/i,
    /(\d{1,3})\s*out\s*of\s*100/i
  ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const score = parseInt(match[1]);
        return score >= 0 && score <= 100 ? score : null;
      }
  }
  return null;
}

  extractBreakdownScores(text) {
    const categories = ['environmental', 'social', 'governance'];
    const scores = {};
    
    categories.forEach(category => {
      const pattern = new RegExp(`${category}[^\\d]*?(\\d{1,2})\\s*\/\\s*25`, 'i');
      const match = text.match(pattern);
      scores[category] = match ? parseInt(match[1]) : 0;
    });
    
    return scores;
  }

  extractKeyFindings(text) {
    const findings = [];
    const sections = text.split(/key findings?|notable practices?/i);
    
    if (sections.length > 1) {
      const findingsText = sections[1].split(/improvement|recommendation/i)[0];
      const bullets = findingsText.match(/[•\-\*]\s*([^\n\r•\-\*]+)/g);
      
      if (bullets) {
        bullets.forEach(bullet => {
          const clean = bullet.replace(/[•\-\*]\s*/, '').trim();
          if (clean.length > 10) findings.push(clean);
        });
      }
    }
    
    return findings.slice(0, 5); // Limit to top 5
  }

  extractImprovements(text) {
    const improvements = [];
    const sections = text.split(/improvement|recommendation|suggestion/i);
    
    if (sections.length > 1) {
      const improvementText = sections[1];
      const bullets = improvementText.match(/[•\-\*]\s*([^\n\r•\-\*]+)/g);
      
      if (bullets) {
        bullets.forEach(bullet => {
          const clean = bullet.replace(/[•\-\*]\s*/, '').trim();
          if (clean.length > 10) improvements.push(clean);
        });
      }
    }
    
    return improvements.slice(0, 5); // Limit to top 5
  }

  extractCertifications(text) {
    const certKeywords = [
      'B-Corp', 'LEED', 'Fair Trade', 'Organic', 'FSC', 'Cradle to Cradle',
      'Carbon Neutral', 'ENERGY STAR', 'Rainforest Alliance', 'GOTS'
    ];
    
    const found = [];
    certKeywords.forEach(cert => {
      if (text.toLowerCase().includes(cert.toLowerCase())) {
        found.push(cert);
      }
    });
    
    return found;
  }

  calculateConfidence(text, score) {
    let confidence = 'Medium';
    
    if (text.includes('verified') || text.includes('certified') || score !== null) {
      confidence = 'High';
    } else if (text.includes('unclear') || text.includes('limited')) {
      confidence = 'Low';
    }
    
    return confidence;
  }

  // ==================== UI UPDATES ====================
  showAnalysisProgress() {
    document.getElementById('analysis-status').style.display = 'block';
    document.getElementById('score-display').style.display = 'none';
    document.getElementById('detailed-analysis').style.display = 'none';
  }

  updateProgress(percentage, message) {
    document.getElementById('status-text').textContent = message;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
  }

  displayAnalysisResults(result) {
    document.getElementById('analysis-status').style.display = 'none';
    
    // Update quick stats
    document.getElementById('current-score').textContent = result.overallScore || '--';
    document.getElementById('carbon-impact').textContent = this.calculateCarbonImpact(result.overallScore);
    document.getElementById('industry-rank').textContent = this.calculateIndustryRank(result.overallScore);
    
    // Display main score
    this.updateScoreDisplay(result);
    
    // Display detailed analysis
    this.updateDetailedAnalysis(result);
    
    // Store current score
    this.currentScore = result.overallScore;
  }

  updateScoreDisplay(result) {
    const scoreDisplay = document.getElementById('score-display');
    const scoreNumber = document.getElementById('score-number');
    const scoreArc = document.getElementById('score-arc');
    
    scoreDisplay.style.display = 'block';
    scoreNumber.textContent = result.overallScore || '--';
    
    if (result.overallScore) {
      // Animate score arc
      const percentage = result.overallScore / 100;
      const offset = 283 - (283 * percentage);
      scoreArc.style.strokeDashoffset = offset;
      
      // Set arc color based on score
      if (result.overallScore >= 80) {
        scoreArc.style.stroke = '#10b981'; // Green
      } else if (result.overallScore >= 60) {
        scoreArc.style.stroke = '#f59e0b'; // Yellow
      } else {
        scoreArc.style.stroke = '#ef4444'; // Red
      }
    }
    
    // Update breakdown scores
    this.updateBreakdownScores(result.breakdownScores);
  }

  updateBreakdownScores(scores) {
    Object.entries(scores).forEach(([category, score]) => {
      const scoreElement = document.getElementById(`${category === 'environmental' ? 'env' : category}-score`);
      const valueElement = document.getElementById(`${category === 'environmental' ? 'env' : category}-value`);
      
      if (scoreElement && valueElement) {
        scoreElement.style.width = `${(score / 25) * 100}%`;
        valueElement.textContent = `${score}/25`;
      }
    });
  }

  updateDetailedAnalysis(result) {
    const detailedAnalysis = document.getElementById('detailed-analysis');
    
    // Update confidence badge
    document.getElementById('confidence-text').textContent = `${result.confidence} Confidence`;
    
    // Update key findings
    const findingsList = document.getElementById('key-findings-list');
    findingsList.innerHTML = result.keyFindings.map(finding => 
      `<li>${finding}</li>`
    ).join('');
    
    // Update improvements
    const improvementList = document.getElementById('improvement-list');
    improvementList.innerHTML = result.improvements.map(improvement => 
      `<li>${improvement}</li>`
    ).join('');
    
    // Update certifications
    const certificationsList = document.getElementById('certifications-list');
    certificationsList.innerHTML = result.certifications.map(cert => 
      `<span class="cert-badge">${cert}</span>`
    ).join('');
    
    detailedAnalysis.style.display = 'block';
  }

  calculateCarbonImpact(score) {
    if (!score) return '--';
    
    // Rough calculation based on score
    const impact = Math.max(0, 100 - score) * 0.5;
    return `${impact.toFixed(1)} kg CO₂`;
  }

  calculateIndustryRank(score) {
    if (!score) return '--';
    
    if (score >= 90) return 'Top 5%';
    if (score >= 80) return 'Top 15%';
    if (score >= 70) return 'Top 30%';
    if (score >= 60) return 'Top 50%';
    return 'Bottom 50%';
  }

  showError(message) {
    document.getElementById('analysis-status').style.display = 'none';
    // You could implement a toast notification system here
    alert(message);
  }

  // ==================== USER PROGRESS & GAMIFICATION ====================
  async loadUserData() {
    const data = await chrome.storage.local.get(['userData']);
    if (data.userData) {
      this.userData = { ...this.userData, ...data.userData };
    }
    this.updateUserLevel();
  }

  async saveUserData() {
    await chrome.storage.local.set({ userData: this.userData });
  }

  updateUserProgress() {
    this.userData.totalAnalyses++;
    this.userData.xp += 10; // Base XP per analysis
    
    // Bonus XP for high scores
    if (this.currentScore) {
      if (this.currentScore >= 80) this.userData.xp += 15;
      else if (this.currentScore >= 60) this.userData.xp += 10;
      else this.userData.xp += 5;
    }
    
    // Check for level up
    const newLevel = Math.floor(this.userData.xp / 100) + 1;
    if (newLevel > this.userData.level) {
      this.userData.level = newLevel;
      this.showLevelUpNotification();
    }
    
    // Update streak
    const today = new Date().toDateString();
    const lastAnalysis = localStorage.getItem('lastAnalysisDate');
    
    if (lastAnalysis === today) {
      // Same day, no streak change
    } else if (this.isConsecutiveDay(lastAnalysis, today)) {
      this.userData.streak++;
    } else {
      this.userData.streak = 1;
    }
    
    localStorage.setItem('lastAnalysisDate', today);
    
    this.checkAchievements();
    this.updateUserLevel();
    this.saveUserData();
  }

  updateUserLevel() {
    const levels = ['Eco Novice', 'Green Learner', 'Sustainability Seeker', 'Eco Warrior', 'Planet Guardian', 'Sustainability Master'];
    const levelIndex = Math.min(this.userData.level - 1, levels.length - 1);
    
    document.getElementById('user-level').textContent = levels[levelIndex];
    
    const xpProgress = (this.userData.xp % 100) / 100;
    document.getElementById('xp-fill').style.width = `${xpProgress * 100}%`;
    
    document.getElementById('streak-count').textContent = this.userData.streak;
  }

  checkAchievements() {
    const achievements = [
      { id: 'first_analysis', name: 'First Steps', icon: '🌱', condition: () => this.userData.totalAnalyses >= 1 },
      { id: 'analysis_streak_7', name: '7-Day Streak', icon: '🔥', condition: () => this.userData.streak >= 7 },
      { id: 'eco_warrior', name: 'Eco Warrior', icon: '⚔️', condition: () => this.userData.level >= 4 },
      { id: 'analysis_master', name: 'Analysis Master', icon: '🏆', condition: () => this.userData.totalAnalyses >= 100 }
    ];
    
    achievements.forEach(achievement => {
      if (!this.userData.achievements.includes(achievement.id) && achievement.condition()) {
        this.userData.achievements.push(achievement.id);
        this.showAchievementNotification(achievement);
      }
    });
  }

  showLevelUpNotification() {
    // Implement level up notification
    console.log('Level up!', this.userData.level);
  }

  showAchievementNotification(achievement) {
    // Implement achievement notification
    console.log('Achievement unlocked:', achievement.name);
  }

  isConsecutiveDay(lastDate, currentDate) {
    if (!lastDate) return false;
    
    const last = new Date(lastDate);
    const current = new Date(currentDate);
    const diffTime = current - last;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1;
  }

  // ==================== DASHBOARD ====================
  loadDashboard() {
    this.loadAchievements();
    this.loadCharts();
    this.loadCarbonTracker();
  }

  loadAchievements() {
    const achievementGrid = document.getElementById('achievement-grid');
    const allAchievements = [
      { id: 'first_analysis', name: 'First Steps', icon: '🌱' },
      { id: 'analysis_streak_7', name: '7-Day Streak', icon: '🔥' },
      { id: 'eco_warrior', name: 'Eco Warrior', icon: '⚔️' },
      { id: 'analysis_master', name: 'Analysis Master', icon: '🏆' }
    ];
    
    achievementGrid.innerHTML = allAchievements.map(achievement => {
      const unlocked = this.userData.achievements.includes(achievement.id);
      return `
        <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
          <span class="achievement-icon">${achievement.icon}</span>
          <span class="achievement-name">${achievement.name}</span>
        </div>
      `;
    }).join('');
  }

  loadCharts() {
    // Implementation would go here for Chart.js integration
    // This is a placeholder for the hackathon demo
  }

  loadCarbonTracker() {
    // Implementation would calculate and display carbon impact
    document.getElementById('daily-carbon').textContent = '2.1 kg';
    document.getElementById('weekly-carbon').textContent = '14.7 kg';
    document.getElementById('monthly-carbon').textContent = '58.2 kg';
  }

  // ==================== COMPARISON ====================
  loadComparison() {
    // Implementation for company comparison feature
  }

  // ==================== HISTORY ====================
  loadHistory() {
    // Implementation for analysis history
    document.getElementById('total-analyses').textContent = `${this.userData.totalAnalyses} analyses`;
    // Calculate and display average score
  }

  async saveAnalysisToHistory(result, pageData) {
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      domain: pageData.metaInfo?.domain,
      companyName: pageData.companyName,
      score: result.overallScore,
      breakdownScores: result.breakdownScores,
      confidence: result.confidence
    };
    
    const history = await chrome.storage.local.get(['analysisHistory']);
    const analysisHistory = history.analysisHistory || [];
    analysisHistory.unshift(historyItem);
    
    // Keep only last 100 analyses
    if (analysisHistory.length > 100) {
      analysisHistory.splice(100);
    }
    
    await chrome.storage.local.set({ analysisHistory });
  }

  // ==================== SETTINGS ====================
  loadSettings() {
    this.loadApiKeys();
    this.loadPreferences();
  }

  async loadApiKeys() {
    const keys = await chrome.storage.sync.get(['openaiApiKey', 'anthropicApiKey']);
    
    if (keys.openaiApiKey) {
      document.getElementById('openai-key').value = keys.openaiApiKey;
    }
    
    if (keys.anthropicApiKey) {
      document.getElementById('anthropic-key').value = keys.anthropicApiKey;
    }
  }

  async loadPreferences() {
    const settings = await this.getSettings();
    
    document.getElementById('daily-reminder').checked = settings.dailyReminder !== false;
    document.getElementById('achievement-notifications').checked = settings.achievementNotifications !== false;
    document.getElementById('analysis-depth').value = settings.analysisDepth || 'standard';
    document.getElementById('auto-analyze').checked = settings.autoAnalyze !== false;
  }

  async saveSettings() {
    const settings = {
      openaiApiKey: document.getElementById('openai-key').value,
      anthropicApiKey: document.getElementById('anthropic-key').value,
      dailyReminder: document.getElementById('daily-reminder').checked,
      achievementNotifications: document.getElementById('achievement-notifications').checked,
      analysisDepth: document.getElementById('analysis-depth').value,
      autoAnalyze: document.getElementById('auto-analyze').checked
    };
    
    await chrome.storage.sync.set(settings);
  }

  async getSettings() {
    return await chrome.storage.sync.get([
      'openaiApiKey', 'anthropicApiKey', 'dailyReminder', 
      'achievementNotifications', 'analysisDepth', 'autoAnalyze'
    ]);
  }

  async getAnalysisDepth() {
    const settings = await this.getSettings();
    return settings.analysisDepth || 'standard';
  }

  async setAnalysisDepth(depth) {
    await chrome.storage.sync.set({ analysisDepth: depth });
  }

  async testApiKey(provider) {
    const key = document.getElementById(`${provider}-key`).value;
    if (!key) {
      alert('Please enter an API key first');
    return;
  }
  
    // Implementation would test the API key
    alert(`${provider} API key test would be implemented here`);
  }

  // ==================== DATA MANAGEMENT ====================
  async exportData() {
    const data = {
      userData: this.userData,
      settings: await this.getSettings(),
      history: await chrome.storage.local.get(['analysisHistory'])
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecoguard-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  async clearData() {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      return;
    }
    
    await chrome.storage.local.clear();
    this.userData = {
      level: 1,
      xp: 0,
      streak: 0,
      totalAnalyses: 0,
      achievements: []
    };
    
    this.updateUserLevel();
    alert('All data cleared successfully');
  }

  // ==================== QUICK ACTIONS ====================
  shareScore() {
    if (!this.currentScore) {
      alert('Please run an analysis first');
      return;
    }
    
    const shareText = `I just analyzed a website's sustainability with EcoGuard Pro and got a score of ${this.currentScore}/100! 🌱 #SustainabilityMatters #EcoGuardPro`;
    
    if (navigator.share) {
      navigator.share({
        title: 'EcoGuard Pro Analysis',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Score copied to clipboard!');
    }
  }

  suggestImprovements() {
    // Implementation would provide AI-powered improvement suggestions
    alert('AI-powered improvement suggestions would be shown here');
  }

  // ==================== BACKGROUND COMMUNICATION ====================
  async sendToBackground(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, resolve);
    });
  }

  updateUI() {
    this.updateUserLevel();
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const ecoGuard = new EcoGuardPro();
  
  // Initialize dashboard and gamification managers when needed
  if (window.dashboardManager) {
    window.dashboardManager.init();
  }
  
  if (window.gamificationManager) {
    console.log('Gamification system loaded');
  }
  
  if (window.visualizationManager) {
    console.log('Visualization system loaded');
  }
});