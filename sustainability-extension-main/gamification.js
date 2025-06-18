// 🌱 EcoGuard Pro - Gamification Module
class GamificationManager {
  constructor() {
    this.achievements = [
      {
        id: 'first_analysis',
        name: 'First Steps',
        description: 'Complete your first sustainability analysis',
        icon: '🌱',
        xp: 50,
        condition: (data) => data.totalAnalyses >= 1
      },
      {
        id: 'streak_3',
        name: 'Getting Started',
        description: 'Maintain a 3-day analysis streak',
        icon: '🔥',
        xp: 100,
        condition: (data) => data.streak >= 3
      },
      {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day analysis streak',
        icon: '⚡',
        xp: 200,
        condition: (data) => data.streak >= 7
      },
      {
        id: 'streak_30',
        name: 'Monthly Master',
        description: 'Maintain a 30-day analysis streak',
        icon: '👑',
        xp: 500,
        condition: (data) => data.streak >= 30
      },
      {
        id: 'analyses_10',
        name: 'Explorer',
        description: 'Complete 10 sustainability analyses',
        icon: '🔍',
        xp: 150,
        condition: (data) => data.totalAnalyses >= 10
      },
      {
        id: 'analyses_50',
        name: 'Researcher',
        description: 'Complete 50 sustainability analyses',
        icon: '📊',
        xp: 300,
        condition: (data) => data.totalAnalyses >= 50
      },
      {
        id: 'analyses_100',
        name: 'Expert Analyst',
        description: 'Complete 100 sustainability analyses',
        icon: '🏆',
        xp: 500,
        condition: (data) => data.totalAnalyses >= 100
      },
      {
        id: 'high_scorer',
        name: 'High Standards',
        description: 'Find a company with 90+ sustainability score',
        icon: '🌟',
        xp: 200,
        condition: (data) => data.highestScore >= 90
      },
      {
        id: 'eco_warrior',
        name: 'Eco Warrior',
        description: 'Reach level 5',
        icon: '⚔️',
        xp: 250,
        condition: (data) => data.level >= 5
      },
      {
        id: 'sustainability_master',
        name: 'Sustainability Master',
        description: 'Reach level 10',
        icon: '🧙‍♂️',
        xp: 1000,
        condition: (data) => data.level >= 10
      },
      {
        id: 'carbon_conscious',
        name: 'Carbon Conscious',
        description: 'Track carbon impact for 30 days',
        icon: '🌍',
        xp: 300,
        condition: (data) => data.carbonTrackingDays >= 30
      },
      {
        id: 'comparison_king',
        name: 'Comparison King',
        description: 'Compare 5 different companies',
        icon: '⚖️',
        xp: 200,
        condition: (data) => data.companiesCompared >= 5
      }
    ];

    this.levels = [
      { level: 1, name: 'Eco Novice', xpRequired: 0, color: '#10b981', badge: '🌱' },
      { level: 2, name: 'Green Learner', xpRequired: 100, color: '#059669', badge: '📚' },
      { level: 3, name: 'Sustainability Seeker', xpRequired: 300, color: '#047857', badge: '🔍' },
      { level: 4, name: 'Eco Warrior', xpRequired: 600, color: '#065f46', badge: '⚔️' },
      { level: 5, name: 'Planet Guardian', xpRequired: 1000, color: '#064e3b', badge: '🛡️' },
      { level: 6, name: 'Green Champion', xpRequired: 1500, color: '#0f766e', badge: '🏆' },
      { level: 7, name: 'Sustainability Expert', xpRequired: 2200, color: '#0d9488', badge: '🎓' },
      { level: 8, name: 'Eco Master', xpRequired: 3000, color: '#14b8a6', badge: '🧙‍♂️' },
      { level: 9, name: 'Planet Savior', xpRequired: 4000, color: '#5eead4', badge: '🌟' },
      { level: 10, name: 'Sustainability Legend', xpRequired: 5500, color: '#f0fdfa', badge: '👑' }
    ];

    this.notifications = [];
  }

  checkAchievements(userData) {
    const newAchievements = [];
    
    this.achievements.forEach(achievement => {
      if (!userData.achievements.includes(achievement.id) && achievement.condition(userData)) {
        userData.achievements.push(achievement.id);
        userData.xp += achievement.xp;
        newAchievements.push(achievement);
      }
    });

    return newAchievements;
  }

  calculateLevel(xp) {
    let currentLevel = this.levels[0];
    
    for (let i = this.levels.length - 1; i >= 0; i--) {
      if (xp >= this.levels[i].xpRequired) {
        currentLevel = this.levels[i];
        break;
      }
    }
    
    return currentLevel;
  }

  getNextLevel(currentLevel) {
    const currentIndex = this.levels.findIndex(l => l.level === currentLevel);
    return currentIndex < this.levels.length - 1 ? this.levels[currentIndex + 1] : null;
  }

  getXpProgress(xp, level) {
    const currentLevelData = this.levels.find(l => l.level === level);
    const nextLevelData = this.getNextLevel(level);
    
    if (!nextLevelData) {
      return 100; // Max level reached
    }
    
    const currentLevelXp = currentLevelData.xpRequired;
    const nextLevelXp = nextLevelData.xpRequired;
    const xpInCurrentLevel = xp - currentLevelXp;
    const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
    
    return Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100);
  }

  showAchievementNotification(achievement) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-content">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-text">
          <div class="achievement-title">Achievement Unlocked!</div>
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-xp">+${achievement.xp} XP</div>
        </div>
      </div>
    `;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
      z-index: 10000;
      transform: translateX(400px);
      transition: transform 0.5s ease;
      min-width: 300px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    const contentStyle = `
      .achievement-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .achievement-icon {
        font-size: 2rem;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
      }
      .achievement-title {
        font-size: 0.75rem;
        opacity: 0.9;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 2px;
      }
      .achievement-name {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 2px;
      }
      .achievement-xp {
        font-size: 0.875rem;
        opacity: 0.9;
        font-weight: 500;
      }
    `;

    // Add styles to head
    const style = document.createElement('style');
    style.textContent = contentStyle;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Play achievement sound (if available)
    this.playAchievementSound();

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 500);
    }, 5000);

    // Add click to dismiss
    notification.addEventListener('click', () => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    });
  }

  showLevelUpNotification(oldLevel, newLevel) {
    const levelData = this.levels.find(l => l.level === newLevel);
    
    const notification = document.createElement('div');
    notification.className = 'level-up-notification';
    notification.innerHTML = `
      <div class="level-up-content">
        <div class="level-up-icon">🎉</div>
        <div class="level-up-text">
          <div class="level-up-title">LEVEL UP!</div>
          <div class="level-up-name">${levelData.name}</div>
          <div class="level-up-badge">${levelData.badge}</div>
        </div>
      </div>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(245, 158, 11, 0.4);
      z-index: 10001;
      transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      text-align: center;
      min-width: 280px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    const levelUpStyle = `
      .level-up-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      .level-up-icon {
        font-size: 3rem;
        animation: bounce 1s infinite;
      }
      .level-up-title {
        font-size: 1.25rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .level-up-name {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 4px 0;
      }
      .level-up-badge {
        font-size: 2rem;
        margin-top: 8px;
      }
      @keyframes bounce {
        0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
        40%, 43% { transform: translateY(-20px); }
        70% { transform: translateY(-10px); }
        90% { transform: translateY(-5px); }
      }
    `;

    const style = document.createElement('style');
    style.textContent = levelUpStyle;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 100);

    // Play level up sound
    this.playLevelUpSound();

    // Auto-remove after 4 seconds
    setTimeout(() => {
      notification.style.transform = 'translate(-50%, -50%) scale(0)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 600);
    }, 4000);

    // Click to dismiss
    notification.addEventListener('click', () => {
      notification.style.transform = 'translate(-50%, -50%) scale(0)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 600);
    });
  }

  playAchievementSound() {
    try {
      // Create a simple achievement sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Achievement sound failed:', error);
    }
  }

  playLevelUpSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Play ascending notes
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, index) => {
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.15);
      });
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.8);
    } catch (error) {
      console.log('Level up sound failed:', error);
    }
  }

  updateUserData(userData, analysisResult) {
    const oldLevel = userData.level;
    
    // Add base XP for analysis
    userData.xp += 10;
    
    // Bonus XP based on score
    if (analysisResult.overallScore) {
      if (analysisResult.overallScore >= 90) userData.xp += 20;
      else if (analysisResult.overallScore >= 80) userData.xp += 15;
      else if (analysisResult.overallScore >= 70) userData.xp += 10;
      else userData.xp += 5;
      
      // Track highest score
      userData.highestScore = Math.max(userData.highestScore || 0, analysisResult.overallScore);
    }
    
    // Update total analyses
    userData.totalAnalyses++;
    
    // Update streak
    this.updateStreak(userData);
    
    // Calculate new level
    const newLevelData = this.calculateLevel(userData.xp);
    userData.level = newLevelData.level;
    
    // Check for achievements
    const newAchievements = this.checkAchievements(userData);
    
    // Show notifications
    if (newLevelData.level > oldLevel) {
      setTimeout(() => this.showLevelUpNotification(oldLevel, newLevelData.level), 500);
    }
    
    newAchievements.forEach((achievement, index) => {
      setTimeout(() => this.showAchievementNotification(achievement), 1000 + index * 1500);
    });
    
    return userData;
  }

  updateStreak(userData) {
    const today = new Date().toDateString();
    const lastAnalysis = localStorage.getItem('lastAnalysisDate');
    
    if (lastAnalysis === today) {
      // Same day, no streak change
      return;
    }
    
    if (this.isConsecutiveDay(lastAnalysis, today)) {
      userData.streak = (userData.streak || 0) + 1;
    } else {
      userData.streak = 1;
    }
    
    localStorage.setItem('lastAnalysisDate', today);
  }

  isConsecutiveDay(lastDate, currentDate) {
    if (!lastDate) return false;
    
    const last = new Date(lastDate);
    const current = new Date(currentDate);
    const diffTime = current - last;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1;
  }

  getDailyChallenge() {
    const challenges = [
      { text: 'Analyze 3 different company websites', xp: 50, type: 'analysis_count' },
      { text: 'Find a company with 80+ sustainability score', xp: 75, type: 'high_score' },
      { text: 'Analyze companies from 2 different industries', xp: 60, type: 'industry_variety' },
      { text: 'Complete 5 analyses today', xp: 100, type: 'daily_volume' }
    ];
    
    // Return a challenge based on the day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return challenges[dayOfYear % challenges.length];
  }

  getAchievementProgress(userData) {
    return this.achievements.map(achievement => {
      const unlocked = userData.achievements.includes(achievement.id);
      let progress = 0;
      
      if (!unlocked) {
        // Calculate progress for locked achievements
        if (achievement.id.includes('analyses_')) {
          const target = parseInt(achievement.id.split('_')[1]);
          progress = Math.min(100, (userData.totalAnalyses / target) * 100);
        } else if (achievement.id.includes('streak_')) {
          const target = parseInt(achievement.id.split('_')[1]);
          progress = Math.min(100, (userData.streak / target) * 100);
        }
      } else {
        progress = 100;
      }
      
      return {
        ...achievement,
        unlocked,
        progress: Math.round(progress)
      };
    });
  }
}

// Global gamification manager instance
window.gamificationManager = new GamificationManager(); 