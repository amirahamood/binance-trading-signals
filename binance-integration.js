// Binance API integration with authentication
const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

// Configuration object - in production, these would be set as environment variables
const config = {
  // These will be populated from environment variables in production
  apiKey: '', // Will be set from environment variable
  apiSecret: '', // Will be set from environment variable
  
  // Default settings
  recvWindow: 5000,
  useServerTime: true
};

// Function to load API keys from environment variables
function loadApiCredentials() {
  // In a browser environment with Netlify, we would access environment variables differently
  // This is a placeholder for the actual implementation
  if (typeof process !== 'undefined' && process.env) {
    config.apiKey = process.env.BINANCE_API_KEY || '';
    config.apiSecret = process.env.BINANCE_API_SECRET || '';
  } else if (typeof BINANCE_API_KEY !== 'undefined' && typeof BINANCE_API_SECRET !== 'undefined') {
    // For Netlify, we'll use context variables injected at build time
    config.apiKey = BINANCE_API_KEY || '';
    config.apiSecret = BINANCE_API_SECRET || '';
  }
  
  return config.apiKey && config.apiSecret;
}

// Function to create signature for authenticated requests
function createSignature(queryString, apiSecret) {
  // In a browser environment, we would need to use a serverless function for this
  // as we can't securely store the API secret in client-side code
  // This is a placeholder for the actual implementation
  console.log('Signature would be created server-side for:', queryString);
  return 'signature_placeholder';
}

// Function to make authenticated request to Binance API
async function makeAuthenticatedRequest(endpoint, params = {}) {
  if (!loadApiCredentials()) {
    console.error('API credentials not found');
    return null;
  }
  
  // In production, this would be handled by a serverless function
  // This is a placeholder for the actual implementation
  console.log(`Would make authenticated request to ${endpoint} with params:`, params);
  
  // For demo purposes, we'll make an unauthenticated request if possible
  // or return mock data if authentication is required
  try {
    // For endpoints that don't require authentication
    if (endpoint.startsWith('/ticker') || endpoint.startsWith('/klines')) {
      const url = new URL(`${BINANCE_API_BASE}${endpoint}`);
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } else {
      // For endpoints that require authentication, return mock data in demo mode
      console.log('This endpoint requires authentication, returning mock data');
      return getMockData(endpoint, params);
    }
  } catch (error) {
    console.error(`Error making request to ${endpoint}:`, error);
    return null;
  }
}

// Function to get mock data for authenticated endpoints
function getMockData(endpoint, params) {
  // Return appropriate mock data based on the endpoint
  if (endpoint === '/account') {
    return {
      makerCommission: 10,
      takerCommission: 10,
      buyerCommission: 0,
      sellerCommission: 0,
      canTrade: true,
      canWithdraw: true,
      canDeposit: true,
      updateTime: Date.now(),
      balances: [
        { asset: 'BTC', free: '0.00231456', locked: '0.00000000' },
        { asset: 'ETH', free: '0.05218461', locked: '0.00000000' },
        { asset: 'USDT', free: '124.52', locked: '0.00000000' }
      ]
    };
  }
  
  if (endpoint === '/myTrades') {
    return [
      {
        symbol: params.symbol || 'BTCUSDT',
        id: 28457,
        orderId: 100234,
        price: '59325.12',
        qty: '0.00231',
        quoteQty: '137.04',
        commission: '0.00000231',
        commissionAsset: 'BTC',
        time: Date.now() - 86400000, // 1 day ago
        isBuyer: true,
        isMaker: false,
        isBestMatch: true
      }
    ];
  }
  
  // Default mock data
  return { message: 'Mock data not available for this endpoint' };
}

// Function to fetch current price data from Binance
async function fetchBinancePrice(symbol) {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/ticker/price?symbol=${symbol}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.price;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

// Function to fetch 24hr ticker data for a symbol
async function fetch24hrData(symbol) {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/ticker/24hr?symbol=${symbol}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching 24hr data for ${symbol}:`, error);
    return null;
  }
}

// Function to fetch available trading pairs from Binance
async function fetchTradingPairs() {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/exchangeInfo`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.symbols.map(symbol => ({
      symbol: symbol.symbol,
      baseAsset: symbol.baseAsset,
      quoteAsset: symbol.quoteAsset
    }));
  } catch (error) {
    console.error('Error fetching trading pairs:', error);
    return [];
  }
}

// Function to fetch historical klines (candlestick) data
async function fetchKlines(symbol, interval, limit = 100) {
  try {
    const response = await fetch(
      `${BINANCE_API_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching klines for ${symbol}:`, error);
    return [];
  }
}

// Function to generate trading signals based on technical analysis
async function generateSignals(symbol, interval) {
  try {
    // Fetch historical kline data
    const klineData = await fetchKlines(symbol, interval, 100);
    
    if (!klineData || klineData.length < 20) {
      return null;
    }
    
    // Extract closing prices
    const closePrices = klineData.map(candle => parseFloat(candle[4]));
    
    // Calculate simple moving averages
    const sma20 = calculateSMA(closePrices, 20);
    const sma50 = calculateSMA(closePrices, 50);
    
    // Get latest price
    const currentPrice = closePrices[closePrices.length - 1];
    
    // Simple crossover strategy
    const previousSMA20 = calculateSMA(closePrices.slice(0, -1), 20);
    const previousSMA50 = calculateSMA(closePrices.slice(0, -1), 50);
    
    let signalType = null;
    let reason = '';
    let takeProfit = null;
    let stopLoss = null;
    
    // Buy signal: SMA20 crosses above SMA50
    if (previousSMA20 <= previousSMA50 && sma20 > sma50) {
      signalType = 'buy';
      reason = 'SMA20 crossed above SMA50';
      // Set take profit at 2% above entry
      takeProfit = currentPrice * 1.02;
      // Set stop loss at 1% below entry
      stopLoss = currentPrice * 0.99;
    }
    // Sell signal: SMA20 crosses below SMA50
    else if (previousSMA20 >= previousSMA50 && sma20 < sma50) {
      signalType = 'sell';
      reason = 'SMA20 crossed below SMA50';
      // Set take profit at 2% below entry
      takeProfit = currentPrice * 0.98;
      // Set stop loss at 1% above entry
      stopLoss = currentPrice * 1.01;
    }
    
    if (signalType) {
      return {
        type: signalType,
        entry: currentPrice,
        takeProfit: parseFloat(takeProfit.toFixed(8)),
        stopLoss: parseFloat(stopLoss.toFixed(8)),
        reason: reason,
        timestamp: Date.now(),
        asset: symbol
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error generating signals for ${symbol}:`, error);
    return null;
  }
}

// Helper function to calculate Simple Moving Average
function calculateSMA(prices, period) {
  if (prices.length < period) {
    return null;
  }
  
  const slice = prices.slice(prices.length - period);
  const sum = slice.reduce((total, price) => total + price, 0);
  return sum / period;
}

// Function to format Binance pairs for display
function formatPair(symbol) {
  // Common quote assets in Binance
  const quoteAssets = ['USDT', 'BTC', 'ETH', 'BNB', 'BUSD'];
  
  // Try to split the symbol into base and quote
  for (const quote of quoteAssets) {
    if (symbol.endsWith(quote)) {
      const base = symbol.substring(0, symbol.length - quote.length);
      return `${base}/${quote}`;
    }
  }
  
  return symbol;
}

// Export functions for use in main application
window.BinanceAPI = {
  fetchPrice: fetchBinancePrice,
  fetch24hrData: fetch24hrData,
  fetchTradingPairs: fetchTradingPairs,
  fetchKlines: fetchKlines,
  generateSignals: generateSignals,
  formatPair: formatPair,
  makeAuthenticatedRequest: makeAuthenticatedRequest,
  loadApiCredentials: loadApiCredentials
};
