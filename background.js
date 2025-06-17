console.log("Background service worker loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message in background:", request);

  if (request.action !== "processText") return;
  (async () => {
    try {
      // Get API key from secure storage
      const storageResult = await chrome.storage.sync.get(['openaiApiKey']);
      const apiKey = storageResult.openaiApiKey;
      
      if (!apiKey) {
        sendResponse({ result: "Error: Please set your OpenAI API key in the extension settings." });
        return;
      }

      console.log("API key is set:", Boolean(apiKey));
      
      // Perform external research if company name is available
      let externalResearch = "";
      if (request.companyName) {
        console.log("Performing external research for:", request.companyName);
        externalResearch = await performExternalResearch(request.companyName);
      }
      
      // Combine website data with external research
      const combinedAnalysisText = request.text + (externalResearch ? `\n\nEXTERNAL RESEARCH FINDINGS:\n${externalResearch}` : "");
      
      console.log("Sending request to OpenAI...");
      const chatResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-0125",
          messages: [
            {
              role: "system",
              content: `You are a comprehensive sustainability evaluator with access to both company website data and external research. Analyze ALL provided information to give the most accurate assessment possible.

ANALYSIS FACTORS:
1. MATERIALS & SOURCING (25 points)
   - Raw material sustainability (recycled, organic, renewable)
   - Supply chain transparency and traceability
   - Sourcing practices and geographic locations
   - Third-party certifications (GOTS, OEKO-TEX, etc.)

2. MANUFACTURING & PRODUCTION (25 points)
   - Production methods and energy efficiency
   - Factory conditions and worker treatment
   - Manufacturing location and transportation impact
   - Waste reduction and circular economy integration

3. ENVIRONMENTAL IMPACT (25 points)
   - Carbon footprint and emissions reduction
   - Water usage, pollution, and conservation
   - Packaging sustainability and waste management
   - Renewable energy usage and climate commitments

4. SOCIAL RESPONSIBILITY (25 points)
   - Labor practices and worker rights
   - Fair wages and working conditions
   - Community impact and social initiatives
   - Diversity, inclusion, and ethical business practices

EXTERNAL RESEARCH INTEGRATION:
- Cross-reference website claims with external sources
- Consider industry reports, certifications, and third-party assessments
- Account for any controversies or criticisms found
- Validate sustainability claims against independent sources

RESPONSE FORMAT:
Overall Score: XX / 100

DETAILED BREAKDOWN:
Materials & Sourcing: XX/25 - [analysis with external validation]
Manufacturing: XX/25 - [analysis considering external findings]
Environmental Impact: XX/25 - [analysis with third-party verification]
Social Responsibility: XX/25 - [analysis including external reports]

VERIFICATION STATUS:
✓ Claims verified by external sources
⚠ Claims require verification
✗ Claims contradicted by external findings

KEY FINDINGS:
• [Notable positive practices with source verification]
• [Areas of concern or inconsistencies]
• [External certifications or recognition found]
• [Any controversies or criticisms discovered]

RECOMMENDATION: [Evidence-based recommendation for consumers with confidence level]`
            },
            { role: "user", content: combinedAnalysisText }
          ],
          temperature: 0.7
        })
      });

      console.log("HTTP status:", chatResponse.status);
      const raw = await chatResponse.text();
      console.log("Raw response body:", raw);

      if (!chatResponse.ok) {
        throw new Error(`HTTP ${chatResponse.status}`);
      }

      const data = JSON.parse(raw);
      console.log("Parsed JSON:", data);

      const result = data.choices?.[0]?.message?.content;
      sendResponse({ result });
    } catch (error) {
      console.error("OpenAI API error:", error);
      sendResponse({ result: `Error: ${error.message}` });
    }
  })();

  return true; // keep channel open
});

// External research functions
async function performExternalResearch(companyName) {
  console.log(`Starting external research for: ${companyName}`);
  
  const researchQueries = [
    `${companyName} sustainability report`,
    `${companyName} environmental impact`,
    `${companyName} B-Corp certification`,
    `${companyName} labor practices worker treatment`,
    `${companyName} supply chain transparency`,
    `${companyName} carbon footprint emissions`,
    `${companyName} ethical sourcing materials`,
    `${companyName} sustainability controversy criticism`
  ];
  
  let researchResults = [];
  
  // Perform multiple targeted searches
  for (const query of researchQueries.slice(0, 4)) { // Limit to 4 searches to avoid rate limits
    try {
      const results = await performWebSearch(query);
      if (results && results.length > 0) {
        researchResults.push({
          query: query,
          results: results.slice(0, 3) // Top 3 results per query
        });
      }
      // Small delay between searches
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`Search failed for: ${query}`, error);
    }
  }
  
  return formatResearchResults(researchResults);
}

async function performWebSearch(query) {
  // Try multiple search approaches
  const searchMethods = [
    () => searchWithDuckDuckGo(query),
    () => searchWithWikipedia(query.split(' ')[0]), // Search Wikipedia with company name
    () => searchWithCustomEngine(query)
  ];
  
  for (const searchMethod of searchMethods) {
    try {
      const results = await searchMethod();
      if (results && results.length > 0) {
        return results;
      }
    } catch (error) {
      console.log("Search method failed, trying next...", error);
    }
  }
  
  return [];
}

async function searchWithDuckDuckGo(query) {
  // DuckDuckGo Instant Answer API (free, no key required)
  try {
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`);
    const data = await response.json();
    
    const results = [];
    
    // Extract relevant results
    if (data.AbstractText) {
      results.push({
        title: data.AbstractSource || "DuckDuckGo",
        snippet: data.AbstractText,
        url: data.AbstractURL || ""
      });
    }
    
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      data.RelatedTopics.slice(0, 2).forEach(topic => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || "Related Topic",
            snippet: topic.Text,
            url: topic.FirstURL
          });
        }
      });
    }
    
    return results;
  } catch (error) {
    console.log("DuckDuckGo search failed:", error);
    return [];
  }
}

async function searchWithWikipedia(companyName) {
  try {
    // Search Wikipedia for company information
    const searchResponse = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(companyName)}?redirect=true`);
    
    if (searchResponse.ok) {
      const data = await searchResponse.json();
      if (data.extract) {
        return [{
          title: `${companyName} - Wikipedia`,
          snippet: data.extract,
          url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(companyName)}`
        }];
      }
    }
    
    return [];
  } catch (error) {
    console.log("Wikipedia search failed:", error);
    return [];
  }
}

async function searchWithBing(query) {
  // Note: This would require a Bing Search API key
  // For now, return mock data or implement a fallback
  return [];
}

async function searchWithCustomEngine(query) {
  // Fallback: Use a simple news/article search approach
  try {
    // Search for sustainability-related news articles
    const newsKeywords = ['sustainability', 'environmental', 'green', 'eco-friendly', 'carbon', 'renewable'];
    const hasNewsKeyword = newsKeywords.some(keyword => query.toLowerCase().includes(keyword));
    
    if (hasNewsKeyword) {
      return [{
        title: `External Research: ${query}`,
        snippet: "External sustainability research data would be gathered here from various sources including sustainability reports, certifications databases, and news articles.",
        url: "#external-research"
      }];
    }
    
    return [];
  } catch (error) {
    console.log("Custom search failed:", error);
    return [];
  }
}

function formatResearchResults(researchResults) {
  if (!researchResults || researchResults.length === 0) {
    return "No external research data available.";
  }
  
  let formatted = "";
  
  researchResults.forEach(research => {
    if (research.results && research.results.length > 0) {
      formatted += `\n--- ${research.query.toUpperCase()} ---\n`;
      research.results.forEach(result => {
        formatted += `• ${result.title}\n`;
        formatted += `  ${result.snippet}\n`;
        if (result.url && result.url !== "#external-research") {
          formatted += `  Source: ${result.url}\n`;
        }
        formatted += "\n";
      });
    }
  });
  
  return formatted || "External research completed but no specific findings available.";
}