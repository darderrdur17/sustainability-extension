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

    // Comparison management
    document.getElementById('add-comparison').addEventListener('click', () => {
      this.addCurrentCompanyToComparison();
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
      const analysisResult = this.processAIResponse(aiResponse, response);
      
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

  processAIResponse(response, scrapedData) {
    const result = response.result || '';
    
    // Debug: Log the raw AI response
    console.log('Raw AI Response:', result);
    
    // Extract overall score
    const overallScore = this.extractScore(result);
    console.log('Extracted Overall Score:', overallScore);
    
    // Extract breakdown scores
    const breakdownScores = this.extractBreakdownScores(result);
    console.log('Extracted Breakdown Scores:', breakdownScores);
    
    // Extract key findings
    const keyFindings = this.extractKeyFindings(result);
    console.log('Extracted Key Findings:', keyFindings);
    
    // Extract improvements
    const improvements = this.extractImprovements(result);
    console.log('Extracted Improvements:', improvements);
    
    // Extract certifications
    const certifications = this.extractCertifications(result);
    console.log('Extracted Certifications:', certifications);
    
    // Calculate confidence level
    const confidence = this.calculateConfidence(result, overallScore);
    console.log('Calculated Confidence:', confidence);

    // Fallback if parsing fails
    if (!keyFindings.length) {
      keyFindings.push('Analysis completed - detailed findings may require additional processing');
    }
    
    if (!improvements.length) {
      improvements.push('Consider implementing comprehensive sustainability reporting');
      improvements.push('Explore opportunities for renewable energy adoption');
      improvements.push('Enhance supply chain transparency and monitoring');
    }

    const extractedCompanyName = scrapedData?.companyName || this.extractCompanyNameFromDomain(window.location.hostname);
    console.log('Final company name:', extractedCompanyName);
    console.log('Scraped company name:', scrapedData?.companyName);
    console.log('Domain:', window.location.hostname);

    return {
      overallScore: overallScore || 0,
      breakdownScores,
      keyFindings,
      improvements,
      certifications,
      confidence,
      companyName: extractedCompanyName,
      domain: window.location.hostname,
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
    const categories = ['environmental', 'social', 'governance', 'materials'];
    const scores = {};
    
    categories.forEach(category => {
      // Try multiple patterns to extract scores
      const patterns = [
        new RegExp(`${category}[:\\s]*?(\\d{1,2})\\s*\/\\s*25`, 'i'),
        new RegExp(`${category}[:\\s]*?(\\d{1,2})\\s*out\\s*of\\s*25`, 'i'),
        new RegExp(`${category}[:\\s]*?(\\d{1,2})\\s*points?`, 'i')
      ];
      
      let score = 0;
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          score = parseInt(match[1]);
          break;
        }
      }
      
      scores[category] = Math.min(Math.max(score, 0), 25); // Ensure 0-25 range
    });
    
    return scores;
  }

  extractKeyFindings(text) {
    const findings = [];
    
    // Try to find key findings section
    const patterns = [
      /key findings?[:\s]*([\s\S]*?)(?=improvement|recommendation|certifications?|confidence|$)/i,
      /findings?[:\s]*([\s\S]*?)(?=improvement|recommendation|certifications?|confidence|$)/i,
      /notable[:\s]*([\s\S]*?)(?=improvement|recommendation|certifications?|confidence|$)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const findingsText = match[1];
        
        // Extract bullet points
        const bullets = findingsText.match(/[•\-\*]\s*([^\n\r•\-\*]+)/g);
        
        if (bullets) {
          bullets.forEach(bullet => {
            const clean = bullet.replace(/[•\-\*]\s*/, '').trim();
            if (clean.length > 10 && !clean.includes('[') && !clean.includes('Finding')) {
              findings.push(clean);
            }
          });
        }
        
        // If no bullets found, try to extract sentences
        if (findings.length === 0) {
          const sentences = findingsText.split(/[.!?]+/).filter(s => s.trim().length > 20);
          findings.push(...sentences.slice(0, 3).map(s => s.trim()));
        }
        
        break;
      }
    }
    
    return findings.slice(0, 5); // Limit to top 5
  }

  extractImprovements(text) {
    const improvements = [];
    
    // Try to find improvements section
    const patterns = [
      /improvements?\s+needed[:\s]*([\s\S]*?)(?=certifications?|confidence|$)/i,
      /recommendations?[:\s]*([\s\S]*?)(?=certifications?|confidence|$)/i,
      /suggestions?[:\s]*([\s\S]*?)(?=certifications?|confidence|$)/i,
      /improvements?[:\s]*([\s\S]*?)(?=certifications?|confidence|$)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const improvementText = match[1];
        
        // Extract bullet points
        const bullets = improvementText.match(/[•\-\*]\s*([^\n\r•\-\*]+)/g);
        
        if (bullets) {
          bullets.forEach(bullet => {
            const clean = bullet.replace(/[•\-\*]\s*/, '').trim();
            if (clean.length > 10 && !clean.includes('[') && !clean.includes('Improvement')) {
              improvements.push(clean);
            }
          });
        }
        
        // If no bullets found, try to extract sentences
        if (improvements.length === 0) {
          const sentences = improvementText.split(/[.!?]+/).filter(s => s.trim().length > 20);
          improvements.push(...sentences.slice(0, 3).map(s => s.trim()));
        }
        
        break;
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
    
    // Display company information
    if (result.companyName) {
      const companyInfo = document.getElementById('company-info');
      companyInfo.innerHTML = `
        <div class="company-header">
          <h3>${result.companyName}</h3>
          <span class="analyzed-domain">${result.domain || window.location.hostname}</span>
        </div>
      `;
      companyInfo.style.display = 'block';
    }
    
    // Update quick stats
    document.getElementById('current-score').textContent = result.overallScore || '--';
    document.getElementById('carbon-impact').textContent = this.calculateCarbonImpact(result.overallScore);
    document.getElementById('industry-rank').textContent = this.calculateIndustryRank(result.overallScore);
    
    // Display main score
    this.updateScoreDisplay(result);
    
    // Display detailed analysis
    this.updateDetailedAnalysis(result);
    
    // Store current analysis data
    this.currentScore = result.overallScore;
    this.currentCompanyName = result.companyName;
    this.currentBreakdownScores = result.breakdownScores;
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
    const categoryMapping = {
      'environmental': 'env',
      'social': 'social',
      'governance': 'gov',
      'materials': 'materials'
    };
    
    Object.entries(scores).forEach(([category, score]) => {
      const mappedCategory = categoryMapping[category] || category;
      const scoreElement = document.getElementById(`${mappedCategory}-score`);
      const valueElement = document.getElementById(`${mappedCategory}-value`);
      
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
  // Weekly Analysis Trend chart
  const trendCtx = document.getElementById('trend-chart').getContext('2d');
  new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Score',
        data: [65, 59, 80, 81, 56, 55, 70],
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      }]
    },
    options: { responsive: true }
  });

  // Category Breakdown chart
  const categoryCtx = document.getElementById('category-chart').getContext('2d');
  new Chart(categoryCtx, {
    type: 'pie',
    data: {
      labels: ['Energy', 'Transport', 'Waste', 'Water'],
      datasets: [{
        label: 'Category Breakdown',
        data: [300, 50, 100, 80],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)'
        ]
      }]
    },
    options: { responsive: true }
  });
}


  loadCarbonTracker() {
    // Implementation would calculate and display carbon impact
    document.getElementById('daily-carbon').textContent = '2.1 kg';
    document.getElementById('weekly-carbon').textContent = '14.7 kg';
    document.getElementById('monthly-carbon').textContent = '58.2 kg';
  }

  // ==================== COMPARISON ====================
  async loadComparison() {
    // Load saved comparisons
    const savedComparisons = await chrome.storage.local.get(['comparisons']);
    const comparisons = savedComparisons.comparisons || [];
    
    this.displayComparisons(comparisons);
    this.loadIndustryBenchmarks();
  }

  displayComparisons(comparisons) {
    const comparisonGrid = document.getElementById('comparison-grid');
    
    if (comparisons.length === 0) {
      comparisonGrid.innerHTML = `
        <div class="empty-comparison">
          <i class="fas fa-balance-scale"></i>
          <h3>No Comparisons Yet</h3>
          <p>Add companies to compare their sustainability scores</p>
          <button class="add-comparison-btn" onclick="ecoGuardInstance.addCurrentCompanyToComparison()">
            <i class="fas fa-plus"></i> Add Current Company
          </button>
        </div>
      `;
      return;
    }
    
    comparisonGrid.innerHTML = comparisons.map((company, index) => `
      <div class="comparison-card">
        <div class="comparison-header">
          <h4>${company.name}</h4>
          <button class="remove-btn" onclick="ecoGuardInstance.removeFromComparison(${index})">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="comparison-score">
          <div class="score-circle-small">
            <span class="score-number-small">${company.score || '--'}</span>
          </div>
        </div>
        <div class="comparison-breakdown">
          <div class="mini-breakdown">
            <div class="mini-bar env" style="width: ${(company.scores?.environmental || 0) * 4}%"></div>
            <div class="mini-bar social" style="width: ${(company.scores?.social || 0) * 4}%"></div>
            <div class="mini-bar gov" style="width: ${(company.scores?.governance || 0) * 4}%"></div>
            <div class="mini-bar materials" style="width: ${(company.scores?.materials || 0) * 4}%"></div>
          </div>
        </div>
        <div class="comparison-details">
          <span class="comparison-domain">${company.domain}</span>
          <span class="comparison-date">${new Date(company.timestamp).toLocaleDateString()}</span>
        </div>
      </div>
    `).join('');
  }

  async addCurrentCompanyToComparison() {
    if (!this.currentScore) {
      alert('Please analyze a company first before adding to comparison');
      return;
    }
    
    const companyData = {
      name: this.currentCompanyName || 'Unknown Company',
      domain: window.location.hostname,
      score: this.currentScore,
      scores: this.currentBreakdownScores,
      timestamp: new Date().toISOString()
    };
    
    const savedComparisons = await chrome.storage.local.get(['comparisons']);
    const comparisons = savedComparisons.comparisons || [];
    
    // Check if company already exists
    const existingIndex = comparisons.findIndex(c => c.domain === companyData.domain);
    if (existingIndex !== -1) {
      comparisons[existingIndex] = companyData; // Update existing
    } else {
      comparisons.push(companyData); // Add new
    }
    
    // Limit to 5 comparisons
    if (comparisons.length > 5) {
      comparisons.shift();
    }
    
    await chrome.storage.local.set({ comparisons });
    this.loadComparison();
    
    // Show success message
    this.showSuccessMessage('Company added to comparison!');
  }

  async removeFromComparison(index) {
    const savedComparisons = await chrome.storage.local.get(['comparisons']);
    const comparisons = savedComparisons.comparisons || [];
    
    comparisons.splice(index, 1);
    await chrome.storage.local.set({ comparisons });
    this.loadComparison();
  }

  loadIndustryBenchmarks() {
    // Mock industry benchmark data
    const benchmarkData = {
      'Technology': { avg: 72, top: 95, companies: ['Apple', 'Microsoft', 'Google'] },
      'Fashion': { avg: 45, top: 85, companies: ['Patagonia', 'Adidas', 'Nike'] },
      'Automotive': { avg: 68, top: 92, companies: ['Tesla', 'BMW', 'Toyota'] },
      'Retail': { avg: 52, top: 78, companies: ['Walmart', 'Target', 'Amazon'] },
      'Finance': { avg: 58, top: 81, companies: ['JPMorgan', 'Goldman Sachs', 'Morgan Stanley'] }
    };
    
    const benchmarkChart = document.getElementById('benchmark-chart');
    if (benchmarkChart) {
      this.renderBenchmarkChart(benchmarkData);
    }
  }

  renderBenchmarkChart(data) {
    // This would integrate with Chart.js to show industry benchmarks
    const benchmarkContainer = document.getElementById('benchmark-chart').parentElement;
    benchmarkContainer.innerHTML = `
      <h4>Industry Benchmarks</h4>
      <div class="benchmark-grid">
        ${Object.entries(data).map(([industry, stats]) => `
          <div class="benchmark-item">
            <h5>${industry}</h5>
            <div class="benchmark-stats">
              <div class="benchmark-stat">
                <span class="stat-label">Average</span>
                <span class="stat-value">${stats.avg}</span>
              </div>
              <div class="benchmark-stat">
                <span class="stat-label">Top Score</span>
                <span class="stat-value">${stats.top}</span>
              </div>
            </div>
            <div class="benchmark-leaders">
              <small>Leaders: ${stats.companies.join(', ')}</small>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  showSuccessMessage(message) {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--success-color);
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // ==================== HISTORY ====================
  async loadHistory() {
    const history = await chrome.storage.local.get(['analysisHistory']);
    const analysisHistory = history.analysisHistory || [];
    
    // Update total analyses
    document.getElementById('total-analyses').textContent = `${analysisHistory.length} analyses`;
    
    // Calculate and display average score
    if (analysisHistory.length > 0) {
      const avgScore = Math.round(
        analysisHistory.reduce((sum, item) => sum + (item.score || 0), 0) / analysisHistory.length
      );
      document.getElementById('avg-score').textContent = `Avg: ${avgScore}`;
    } else {
      document.getElementById('avg-score').textContent = 'Avg: --';
    }
    
    // Display history items
    this.displayHistoryItems(analysisHistory);
  }

  displayHistoryItems(analysisHistory) {
    const historyList = document.getElementById('history-list');
    
    if (analysisHistory.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <h3>No analyses yet</h3>
          <p>Start analyzing websites to build your sustainability history!</p>
        </div>
      `;
      return;
    }
    
    historyList.innerHTML = analysisHistory.map(item => {
      const date = new Date(item.timestamp);
      const scoreColor = this.getScoreColor(item.score || 0);
      
      return `
        <div class="history-item" data-id="${item.id}">
          <div class="history-header">
            <div class="company-info">
              <h4>${item.companyName || item.domain || 'Unknown Company'}</h4>
              <span class="history-domain">${item.domain || 'Unknown Domain'}</span>
            </div>
            <div class="history-score" style="color: ${scoreColor}">
              ${item.score || '--'}/100
            </div>
          </div>
          <div class="history-meta">
            <span class="history-date">
              <i class="fas fa-calendar"></i>
              ${date.toLocaleDateString()}
            </span>
            <span class="history-time">
              ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
            <span class="confidence-indicator ${(item.confidence || '').toLowerCase()}">
              <i class="fas fa-shield-alt"></i>
              ${item.confidence || 'Unknown'} Confidence
            </span>
          </div>
          <div class="breakdown-mini">
            ${this.renderMiniBreakdown(item.breakdownScores)}
          </div>
        </div>
      `;
    }).join('');
    
    // Add click listeners for history items
    historyList.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        this.showHistoryDetails(id, analysisHistory);
      });
    });
  }

  renderMiniBreakdown(breakdownScores) {
    if (!breakdownScores) return '';
    
    return `
      <div class="mini-breakdown">
        <div class="mini-bar env" style="width: ${(breakdownScores.environmental || 0) * 4}%"></div>
        <div class="mini-bar social" style="width: ${(breakdownScores.social || 0) * 4}%"></div>
        <div class="mini-bar gov" style="width: ${(breakdownScores.governance || 0) * 4}%"></div>
        <div class="mini-bar materials" style="width: ${(breakdownScores.materials || 0) * 4}%"></div>
      </div>
    `;
  }

  getScoreColor(score) {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#ef4444';
    return '#6b7280';
  }

  showHistoryDetails(id, analysisHistory) {
    const item = analysisHistory.find(h => h.id == id);
    if (!item) return;
    
    // Switch to analysis tab and display the historical result
    this.switchTab('analysis');
    this.displayAnalysisResults({
      overallScore: item.score,
      breakdownScores: item.breakdownScores,
      confidence: item.confidence,
      keyFindings: item.keyFindings || ['Historical analysis data'],
      improvements: item.improvements || ['No improvements recorded'],
      certifications: item.certifications || []
    });
  }

  async saveAnalysisToHistory(result, pageData) {
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      domain: pageData.metaInfo?.domain || window.location.hostname,
      companyName: pageData.companyName || this.extractCompanyNameFromDomain(pageData.metaInfo?.domain),
      url: pageData.metaInfo?.url || window.location.href,
      title: pageData.metaInfo?.title || document.title,
      score: result.overallScore,
      breakdownScores: result.breakdownScores,
      confidence: result.confidence,
      keyFindings: result.keyFindings,
      improvements: result.improvements,
      certifications: result.certifications,
      pageType: pageData.pageType
    };
    
    const history = await chrome.storage.local.get(['analysisHistory']);
    const analysisHistory = history.analysisHistory || [];
    analysisHistory.unshift(historyItem);
    
    // Keep only last 100 analyses
    if (analysisHistory.length > 100) {
      analysisHistory.splice(100);
    }
    
    await chrome.storage.local.set({ analysisHistory });
    console.log('Analysis saved to history:', historyItem);
  }

  extractCompanyNameFromDomain(domain) {
    if (!domain) return 'Unknown Company';
    
    // Remove www. and common TLDs to get company name
    const name = domain.replace('www.', '').split('.')[0];
    
    // Known company domain mappings
    const knownCompanies = {
      'marinabaysands': 'Marina Bay Sands',
      'tesla': 'Tesla',
      'apple': 'Apple',
      'microsoft': 'Microsoft',
      'google': 'Google',
      'amazon': 'Amazon',
      'patagonia': 'Patagonia',
      'nike': 'Nike',
      'adidas': 'Adidas',
      'unilever': 'Unilever',
      'bmw': 'BMW',
      'toyota': 'Toyota',
      'walmart': 'Walmart',
      'target': 'Target',
      'starbucks': 'Starbucks',
      'mcdonalds': 'McDonald\'s',
      'cocacola': 'Coca-Cola',
      'pepsi': 'Pepsi',
      'facebook': 'Meta',
      'instagram': 'Instagram',
      'linkedin': 'LinkedIn',
      'twitter': 'Twitter',
      'youtube': 'YouTube'
    };
    
    // Check if it's a known company
    if (knownCompanies[name.toLowerCase()]) {
      return knownCompanies[name.toLowerCase()];
    }
    
    // Check if the name looks like gibberish
    if (this.isGibberishText(name)) {
      return 'Company'; // Fallback to generic name
    }
    
    // Try intelligent word splitting for compound names
    return this.smartSplitCompanyName(name);
  }

  smartSplitCompanyName(domain) {
    // List of common words that might be in company names
    const commonWords = [
      'bay', 'sands', 'hotel', 'resort', 'group', 'company', 'corp', 'inc',
      'tech', 'technologies', 'systems', 'solutions', 'services', 'international',
      'global', 'worldwide', 'enterprises', 'industries', 'partners', 'ventures',
      'capital', 'investments', 'financial', 'bank', 'insurance', 'media',
      'entertainment', 'studios', 'productions', 'communications', 'networks'
    ];
    
    let result = domain;
    
    // Try to find and split known words
    for (const word of commonWords) {
      if (result.toLowerCase().includes(word)) {
        const regex = new RegExp(`(${word})`, 'gi');
        result = result.replace(regex, ' $1 ');
      }
    }
    
    // Handle camelCase or common patterns
    result = result
      .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase
      .replace(/([a-z])(\d)/g, '$1 $2')   // letter followed by number
      .replace(/(\d)([a-z])/g, '$1 $2')   // number followed by letter
      .split(/[\s\-_]+/)                  // split on spaces, hyphens, underscores
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    return result.trim() || 'Company';
  }

  isGibberishText(text) {
    if (!text || text.length < 3) return true;
    
    // Check for common gibberish patterns
    const vowels = (text.match(/[aeiou]/gi) || []).length;
    const consonants = (text.match(/[bcdfghjklmnpqrstvwxyz]/gi) || []).length;
    
    // If too many consonants relative to vowels, likely gibberish
    if (consonants > vowels * 3 && text.length > 8) return true;
    
    // Check for too many repeated patterns
    if (/(.{2,})\1{2,}/.test(text)) return true;
    
    // Check for random character sequences
    if (text.length > 15 && vowels < 2) return true;
    
    return false;
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
  window.ecoGuardInstance = new EcoGuardPro();
  
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