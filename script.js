// Update script.js to use the client integration for Binance API

// Include the client integration code
document.write('<script src="netlify/functions/client-integration.js"></script>');

// Sample trading pairs for initial display
const samplePairs = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT',
    'XRPUSDT', 'DOTUSDT', 'SOLUSDT', 'LTCUSDT', 'LINKUSDT',
    'MATICUSDT', 'AVAXUSDT', 'UNIUSDT', 'ETCUSDT', 'BCHUSDT'
];

// Store generated signals
let currentSignals = [];

// Function to format date and time
function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Function to create a signal card
function createSignalCard(signal) {
    return `
        <div class="signal-card" data-pair="${signal.asset}" data-type="${signal.type}">
            <div class="signal-header">
                <span class="asset-name">${signal.asset}</span>
                <span class="signal-type ${signal.type}">${signal.type.toUpperCase()}</span>
            </div>
            <div class="signal-details">
                <div class="detail-item">
                    <span class="detail-label">Entry</span>
                    <span class="detail-value">${formatPrice(signal.entry)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Take Profit</span>
                    <span class="detail-value">${formatPrice(signal.takeProfit)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Stop Loss</span>
                    <span class="detail-value">${formatPrice(signal.stopLoss)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Risk/Reward</span>
                    <span class="detail-value">${calculateRiskReward(signal)}</span>
                </div>
            </div>
            <div class="signal-reason">
                <span class="detail-label">Reason</span>
                <p>${signal.reason}</p>
            </div>
            <div class="timestamp">
                ${formatDateTime(signal.timestamp)}
            </div>
        </div>
    `;
}

// Format price based on value (more decimal places for lower values)
function formatPrice(price) {
    if (price < 0.1) {
        return price.toFixed(8);
    } else if (price < 1) {
        return price.toFixed(6);
    } else if (price < 100) {
        return price.toFixed(4);
    } else if (price < 10000) {
        return price.toFixed(2);
    } else {
        return price.toFixed(0);
    }
}

// Calculate risk/reward ratio
function calculateRiskReward(signal) {
    const reward = Math.abs(signal.takeProfit - signal.entry);
    const risk = Math.abs(signal.entry - signal.stopLoss);
    const ratio = (reward / risk).toFixed(2);
    return `1:${ratio}`;
}

// Function to display signals
function displaySignals(signals) {
    const signalsContainer = document.getElementById('signals-list');
    signalsContainer.innerHTML = '';
    
    if (signals.length === 0) {
        signalsContainer.innerHTML = '<p class="no-signals">No signals match your filters</p>';
        return;
    }
    
    signals.forEach(signal => {
        signalsContainer.innerHTML += createSignalCard(signal);
    });
}

// Function to filter signals
function filterSignals() {
    const assetFilter = document.getElementById('asset-filter').value;
    const typeFilter = document.getElementById('signal-type').value;
    
    let filteredSignals = [...currentSignals];
    
    if (assetFilter !== 'all') {
        filteredSignals = filteredSignals.filter(signal => signal.asset.endsWith(assetFilter));
    }
    
    if (typeFilter !== 'all') {
        filteredSignals = filteredSignals.filter(signal => signal.type === typeFilter);
    }
    
    displaySignals(filteredSignals);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're in production or development
    const isProduction = window.location.hostname !== 'localhost' && 
                         window.location.hostname !== '127.0.0.1';
    
    // Use the appropriate function based on environment
    const generateSignalsFunction = isProduction ? fetchRealSignals : generateSampleSignals;
    
    // Generate initial signals
    generateSignalsFunction();
    
    // Add event listeners to filters
    document.getElementById('asset-filter').addEventListener('change', filterSignals);
    document.getElementById('signal-type').addEventListener('change', filterSignals);
    document.getElementById('timeframe').addEventListener('change', generateSignalsFunction);
    
    // Add event listener to refresh button
    document.getElementById('refresh-btn').addEventListener('click', generateSignalsFunction);
});

// Function to generate signals for sample pairs (for development/demo)
async function generateSampleSignals() {
    const loadingIndicator = document.getElementById('loading');
    loadingIndicator.style.display = 'flex';
    
    const timeframe = document.getElementById('timeframe').value;
    currentSignals = [];
    
    try {
        // For demo purposes, we'll generate signals for sample pairs
        for (const pair of samplePairs) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Generate random signal (in production, this would use real data)
            const signal = generateRandomSignal(pair, timeframe);
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

// Function to generate a random signal for demo purposes
function generateRandomSignal(pair, timeframe) {
    // Only generate signals for ~60% of pairs to make it more realistic
    if (Math.random() > 0.6) return null;
    
    const now = new Date();
    const isLong = Math.random() > 0.5;
    
    // Generate a realistic price based on the pair
    let basePrice;
    if (pair.includes('BTC')) {
        basePrice = 60000 + (Math.random() * 10000 - 5000);
    } else if (pair.includes('ETH')) {
        basePrice = 3000 + (Math.random() * 600 - 300);
    } else if (pair.includes('BNB')) {
        basePrice = 500 + (Math.random() * 100 - 50);
    } else if (pair.includes('SOL')) {
        basePrice = 120 + (Math.random() * 24 - 12);
    } else if (pair.includes('DOGE')) {
        basePrice = 0.12 + (Math.random() * 0.024 - 0.012);
    } else if (pair.includes('XRP')) {
        basePrice = 0.5 + (Math.random() * 0.1 - 0.05);
    } else {
        basePrice = 10 + (Math.random() * 90);
    }
    
    // Calculate take profit and stop loss based on signal type
    let takeProfit, stopLoss;
    if (isLong) {
        takeProfit = basePrice * (1 + (Math.random() * 0.03 + 0.01)); // 1-4% above
        stopLoss = basePrice * (1 - (Math.random() * 0.015 + 0.005)); // 0.5-2% below
    } else {
        takeProfit = basePrice * (1 - (Math.random() * 0.03 + 0.01)); // 1-4% below
        stopLoss = basePrice * (1 + (Math.random() * 0.015 + 0.005)); // 0.5-2% above
    }
    
    // Generate a realistic reason based on signal type and timeframe
    const reasons = {
        buy: [
            `Bullish engulfing pattern on ${timeframe} chart`,
            `Price broke above key resistance level`,
            `RSI oversold with bullish divergence`,
            `Golden cross (50 MA crossed above 200 MA)`,
            `Double bottom pattern confirmed`,
            `Support level held with increasing volume`
        ],
        sell: [
            `Bearish engulfing pattern on ${timeframe} chart`,
            `Price broke below key support level`,
            `RSI overbought with bearish divergence`,
            `Death cross (50 MA crossed below 200 MA)`,
            `Double top pattern confirmed`,
            `Resistance level held with increasing volume`
        ]
    };
    
    const reasonIndex = Math.floor(Math.random() * reasons[isLong ? 'buy' : 'sell'].length);
    
    return {
        id: Math.floor(Math.random() * 10000),
        asset: pair,
        type: isLong ? 'buy' : 'sell',
        entry: basePrice,
        takeProfit: takeProfit,
        stopLoss: stopLoss,
        reason: reasons[isLong ? 'buy' : 'sell'][reasonIndex],
        timestamp: now.getTime()
    };
}
