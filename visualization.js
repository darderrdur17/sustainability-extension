// 🌱 EcoGuard Pro - Visualization Module
class VisualizationManager {
  constructor() {
    this.animationFrameId = null;
    this.isAnimating = false;
  }

  // Animate score circle
  animateScoreCircle(score, element) {
    if (!element) return;
    
    const circle = element.querySelector('.score-arc');
    const numberElement = element.querySelector('.score-number');
    
    if (!circle || !numberElement) return;
    
    const circumference = 2 * Math.PI * 45; // radius = 45
    const offset = circumference - (score / 100) * circumference;
    
    // Set initial state
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference;
    
    // Animate the circle
    let currentScore = 0;
    const increment = score / 60; // 60 frames for 1 second animation
    
    const animate = () => {
      currentScore += increment;
      if (currentScore >= score) {
        currentScore = score;
      }
      
      const currentOffset = circumference - (currentScore / 100) * circumference;
      circle.style.strokeDashoffset = currentOffset;
      numberElement.textContent = Math.round(currentScore);
      
      // Update color based on score
      if (currentScore >= 80) {
        circle.style.stroke = '#10b981'; // Green
      } else if (currentScore >= 60) {
        circle.style.stroke = '#f59e0b'; // Yellow
      } else {
        circle.style.stroke = '#ef4444'; // Red
      }
      
      if (currentScore < score) {
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  // Animate breakdown bars
  animateBreakdownBars(scores) {
    const categories = ['env', 'social', 'gov'];
    const categoryKeys = ['environmental', 'social', 'governance'];
    
    categories.forEach((category, index) => {
      const bar = document.getElementById(`${category}-score`);
      const value = document.getElementById(`${category}-value`);
      
      if (bar && value) {
        const score = scores[categoryKeys[index]] || 0;
        const maxScore = 25;
        const percentage = (score / maxScore) * 100;
        
        // Animate width
        bar.style.width = '0%';
        bar.style.transition = 'width 1s ease-out';
        
        setTimeout(() => {
          bar.style.width = `${percentage}%`;
        }, 200 + index * 150); // Stagger animations
        
        // Animate value counter
        this.animateCounter(value, 0, score, 1000, '/25');
      }
    });
  }

  // Animate counter numbers
  animateCounter(element, start, end, duration, suffix = '') {
    if (!element) return;
    
    const startTime = performance.now();
    const range = end - start;
    
    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + range * easeOutQuart);
      
      element.textContent = current + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    
    requestAnimationFrame(updateCounter);
  }

  // Create particle effect for achievements
  createParticleEffect(element, color = '#10b981') {
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 15; i++) {
      this.createParticle(centerX, centerY, color);
    }
  }

  createParticle(x, y, color) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      width: 6px;
      height: 6px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      left: ${x}px;
      top: ${y}px;
    `;
    
    document.body.appendChild(particle);
    
    // Random direction and speed
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 100;
    const gravity = 300;
    const life = 1000 + Math.random() * 500;
    
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;
    let startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = elapsed / life;
      
      if (progress >= 1) {
        particle.remove();
        return;
      }
      
      // Update position
      vy += gravity * (elapsed / 1000);
      const newX = x + vx * (elapsed / 1000);
      const newY = y + vy * (elapsed / 1000);
      
      particle.style.left = newX + 'px';
      particle.style.top = newY + 'px';
      particle.style.opacity = 1 - progress;
      particle.style.transform = `scale(${1 - progress * 0.5})`;
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }

  // Create confetti effect for level ups
  createConfettiEffect() {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const x = Math.random() * window.innerWidth;
        this.createConfettiPiece(x, -10, color);
      }, i * 50);
    }
  }

  createConfettiPiece(x, y, color) {
    const piece = document.createElement('div');
    const shapes = ['◆', '▲', '●', '■', '★'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    piece.textContent = shape;
    piece.style.cssText = `
      position: fixed;
      color: ${color};
      font-size: ${8 + Math.random() * 8}px;
      pointer-events: none;
      z-index: 10000;
      left: ${x}px;
      top: ${y}px;
      user-select: none;
    `;
    
    document.body.appendChild(piece);
    
    // Animation properties
    const vx = (Math.random() - 0.5) * 100;
    const vy = 50 + Math.random() * 100;
    const gravity = 200;
    const rotation = Math.random() * 360;
    const rotationSpeed = (Math.random() - 0.5) * 360;
    const life = 3000 + Math.random() * 2000;
    
    let currentVy = vy;
    let currentRotation = rotation;
    let startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = elapsed / life;
      
      if (progress >= 1 || parseInt(piece.style.top) > window.innerHeight + 50) {
        piece.remove();
        return;
      }
      
      // Update position
      currentVy += gravity * (elapsed / 1000) * 0.016;
      currentRotation += rotationSpeed * (elapsed / 1000) * 0.016;
      
      const newX = x + vx * (elapsed / 1000);
      const newY = y + currentVy * (elapsed / 1000);
      
      piece.style.left = newX + 'px';
      piece.style.top = newY + 'px';
      piece.style.transform = `rotate(${currentRotation}deg)`;
      piece.style.opacity = Math.max(0, 1 - progress);
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }

  // Smooth scroll to element
  smoothScrollTo(element, duration = 500) {
    if (!element) return;
    
    const targetPosition = element.offsetTop;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Easing function
      const ease = progress * (2 - progress);
      
      window.scrollTo(0, startPosition + distance * ease);
      
      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };
    
    requestAnimationFrame(animation);
  }

  // Pulse animation for important elements
  pulseElement(element, color = '#10b981', duration = 1000) {
    if (!element) return;
    
    const originalBoxShadow = element.style.boxShadow;
    const pulseKeyframes = [
      { boxShadow: `0 0 0 0 ${color}40` },
      { boxShadow: `0 0 0 20px ${color}00` }
    ];
    
    const animation = element.animate(pulseKeyframes, {
      duration: duration,
      iterations: 1,
      easing: 'ease-out'
    });
    
    animation.onfinish = () => {
      element.style.boxShadow = originalBoxShadow;
    };
  }

  // Typewriter effect for text
  typewriterEffect(element, text, speed = 50) {
    if (!element) return;
    
    element.textContent = '';
    let i = 0;
    
    const type = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    };
    
    type();
  }

  // Shake animation for errors
  shakeElement(element, intensity = 5, duration = 500) {
    if (!element) return;
    
    const keyframes = [];
    const steps = 10;
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const amplitude = intensity * (1 - progress);
      const x = amplitude * Math.sin(progress * Math.PI * 4);
      keyframes.push({ transform: `translateX(${x}px)` });
    }
    
    element.animate(keyframes, {
      duration: duration,
      easing: 'ease-out'
    });
  }

  // Fade in animation
  fadeIn(element, duration = 300) {
    if (!element) return;
    
    element.style.opacity = '0';
    element.style.display = 'block';
    
    element.animate([
      { opacity: 0, transform: 'translateY(10px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      duration: duration,
      easing: 'ease-out',
      fill: 'forwards'
    });
  }

  // Slide up animation
  slideUp(element, duration = 300) {
    if (!element) return;
    
    element.animate([
      { transform: 'translateY(20px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 }
    ], {
      duration: duration,
      easing: 'ease-out',
      fill: 'forwards'
    });
  }

  // Cleanup animations
  cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Remove any particles or confetti
    document.querySelectorAll('[style*="z-index: 10000"]').forEach(el => {
      if (el.style.position === 'fixed' && el.style.pointerEvents === 'none') {
        el.remove();
      }
    });
  }
}

// Global visualization manager instance
window.visualizationManager = new VisualizationManager(); 
