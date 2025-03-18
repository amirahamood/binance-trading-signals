// Client-side code to interact with the serverless function
// Update the binance-integration.js file to use our serverless function

// Function to make authenticated request to Binance API via serverless function
async function makeAuthenticatedRequest(endpoint, params = {}) {
  try {
    // In production, this would point to your Netlify function URL
    const functionUrl = '/.netlify/functions/binance-auth';
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint,
        queryParams: params
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error making authenticated request to ${endpoint}:`, error);
    return null;
  }
}

// Update the script.js file to use real Binance data
async function fetchRealSignals() {
  const loadingIndicator = document.getElementById('loading');
  loadingIndicator.style.display = 'flex';
  
  const timeframe = document.getElementById('timeframe').value;
  currentSignals = [];
  
  try {
    // Get popular trading pairs from Binance
    const tradingPairs = await BinanceAPI.fetchTradingPairs();
    const popularPairs = tradingPairs
      .filter(pair => pair.quoteAsset === 'USDT' || pair.quoteAsset === 'BTC')
      .slice(0, 20)  // Limit to 20 pairs to avoid rate limiting
      .map(pair => pair.symbol);
    
    // Generate signals for each pair
    for (const pair of popularPairs) {
      const signal = await BinanceAPI.generateSignals(pair, timeframe);
      if (signal) {
        currentSignals.push(signal);
      }
    }
    
    // Sort by timestamp (newest first)
    currentSignals.sort((a, b) => b.timestamp - a.timestamp);
    
    // Apply filters and display
    filterSignals();
  } catch (error) {
    console.error('Error generating signals:', error);
    document.getElementById('signals-list').innerHTML = 
      '<p class="error-message">Error generating signals. Please try again.</p>';
  } finally {
    loadingIndicator.style.display = 'none';
  }
}

// Function to get account information (requires authentication)
async function getAccountInfo() {
  return await makeAuthenticatedRequest('/account');
}

// Function to get trade history for a symbol (requires authentication)
async function getTradeHistory(symbol) {
  return await makeAuthenticatedRequest('/myTrades', { symbol });
}
