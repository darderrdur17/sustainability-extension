console.log("Sustainability Companion content script running");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrape") {
    const scrapedData = performComprehensiveScrape();
    sendResponse(scrapedData);
  }
});

function performComprehensiveScrape() {
  const extractedCompanyName = extractCompanyName();
  console.log("Content script extracted company name:", extractedCompanyName);
  console.log("Current URL:", window.location.href);
  console.log("Current hostname:", window.location.hostname);
  
  const data = {
    pageText: document.body.innerText,
    companyName: extractedCompanyName,
    pageType: identifyPageType(),
    materials: extractMaterials(),
    sustainabilityInfo: extractSustainabilityInfo(),
    relatedLinks: findRelatedPages(),
    metaInfo: extractMetaInfo()
  };
  
  console.log("Complete scraped data:", data);
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
    '.logo',
    'h1'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      let name = element.getAttribute('alt') || 
                 element.getAttribute('content') || 
                 element.textContent;
      if (name && name.length > 0 && name.length < 100 && !isGibberish(name)) {
        return cleanCompanyName(name.trim());
      }
    }
  }
  
  // Try extracting from page title
  const title = document.title;
  if (title && !title.toLowerCase().includes('sustainability')) {
    const titleWords = title.split(/[-|•·]/).map(part => part.trim());
    for (const part of titleWords) {
      if (part.length > 2 && part.length < 50 && !isGibberish(part)) {
        return cleanCompanyName(part);
      }
    }
  }
  
  // Fallback to smart domain name extraction
  return extractCompanyFromDomain(window.location.hostname);
}

function extractCompanyFromDomain(hostname) {
  const domain = hostname.replace('www.', '').split('.')[0];
  
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
  if (knownCompanies[domain.toLowerCase()]) {
    return knownCompanies[domain.toLowerCase()];
  }
  
  // Try to intelligently split compound words
  return smartSplitCompanyName(domain);
}

function smartSplitCompanyName(domain) {
  // Handle common patterns like "marinabaysands" -> "Marina Bay Sands"
  
  // First, check if it's gibberish
  if (isGibberish(domain)) {
    return 'Company';
  }
  
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

function isGibberish(text) {
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
  
  // Check for too many consecutive consonants
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(text)) return true;
  
  return false;
}

function cleanCompanyName(name) {
  // Remove common unwanted text patterns
  return name
    .replace(/\s*-\s*(home|homepage|official site|website).*$/i, '')
    .replace(/\s*\|\s*.*$/, '') // Remove everything after pipe
    .replace(/\s*•\s*.*$/, '')  // Remove everything after bullet
    .replace(/\s*·\s*.*$/, '')  // Remove everything after middle dot
    .trim();
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
