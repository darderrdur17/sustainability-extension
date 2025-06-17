console.log("Sustainability Companion content script running");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrape") {
    const scrapedData = performComprehensiveScrape();
    sendResponse(scrapedData);
  }
});

function performComprehensiveScrape() {
  const data = {
    pageText: document.body.innerText,
    companyName: extractCompanyName(),
    pageType: identifyPageType(),
    materials: extractMaterials(),
    sustainabilityInfo: extractSustainabilityInfo(),
    relatedLinks: findRelatedPages(),
    metaInfo: extractMetaInfo()
  };
  
  console.log("Scraped data:", data);
  return data;
}

function extractCompanyName() {
  // Try multiple methods to find company name
  const selectors = [
    'meta[property="og:site_name"]',
    'meta[name="application-name"]',
    '.logo img[alt]',
    '.brand img[alt]',
    'header .logo',
    'h1',
    'title'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      let name = element.getAttribute('alt') || 
                 element.getAttribute('content') || 
                 element.textContent;
      if (name && name.length > 0 && name.length < 100) {
        return name.trim();
      }
    }
  }
  
  // Fallback to domain name
  return window.location.hostname.replace('www.', '').split('.')[0];
}

function identifyPageType() {
  const url = window.location.href.toLowerCase();
  const title = document.title.toLowerCase();
  const content = document.body.innerText.toLowerCase();
  
  if (url.includes('sustainability') || url.includes('environment') || 
      title.includes('sustainability') || content.includes('sustainability')) {
    return 'sustainability';
  }
  if (url.includes('about') || title.includes('about')) {
    return 'about';
  }
  if (url.includes('product') || title.includes('product')) {
    return 'product';
  }
  return 'general';
}

function extractMaterials() {
  const materialKeywords = [
    'organic cotton', 'recycled polyester', 'hemp', 'bamboo', 'linen',
    'wool', 'cashmere', 'silk', 'leather', 'synthetic', 'polyester',
    'nylon', 'spandex', 'elastane', 'modal', 'tencel', 'lyocell'
  ];
  
  const text = document.body.innerText.toLowerCase();
  const foundMaterials = [];
  
  materialKeywords.forEach(material => {
    if (text.includes(material)) {
      foundMaterials.push(material);
    }
  });
  
  return foundMaterials;
}

function extractSustainabilityInfo() {
  const sustainabilityKeywords = [
    'carbon neutral', 'renewable energy', 'fair trade', 'organic',
    'recycled', 'sustainable', 'eco-friendly', 'zero waste',
    'circular economy', 'supply chain', 'transparency',
    'certifications', 'B-Corp', 'climate positive'
  ];
  
  const text = document.body.innerText.toLowerCase();
  const info = [];
  
  sustainabilityKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      // Extract sentence containing the keyword
      const sentences = document.body.innerText.split(/[.!?]+/);
      const relevantSentence = sentences.find(sentence => 
        sentence.toLowerCase().includes(keyword)
      );
      if (relevantSentence) {
        info.push(relevantSentence.trim());
      }
    }
  });
  
  return info;
}

function findRelatedPages() {
  const relatedPages = [];
  const links = document.querySelectorAll('a[href]');
  
  const targetPages = [
    { keywords: ['sustainability', 'environment', 'green'], type: 'sustainability' },
    { keywords: ['about', 'company', 'story'], type: 'about' },
    { keywords: ['responsibility', 'impact', 'social'], type: 'responsibility' },
    { keywords: ['materials', 'sourcing', 'supply'], type: 'sourcing' }
  ];
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    const text = link.textContent.toLowerCase();
    
    if (href) {
      targetPages.forEach(page => {
        if (page.keywords.some(keyword => 
          text.includes(keyword) || href.toLowerCase().includes(keyword)
        )) {
          relatedPages.push({
            type: page.type,
            url: new URL(href, window.location.href).href,
            text: link.textContent.trim()
          });
        }
      });
    }
  });
  
  return relatedPages;
}

function extractMetaInfo() {
  return {
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
    domain: window.location.hostname,
    url: window.location.href
  };
}