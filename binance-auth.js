// Netlify serverless function to handle authenticated Binance API requests
const crypto = require('crypto');
const axios = require('axios');

// Base URL for Binance API
const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

// Handler for the serverless function
exports.handler = async function(event, context) {
  // Set CORS headers to allow requests from your domain
  const headers = {
    'Access-Control-Allow-Origin': '*', // In production, restrict this to your domain
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Parse the request body
    const params = JSON.parse(event.body || '{}');
    const { endpoint, queryParams = {} } = params;

    if (!endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Endpoint is required' })
      };
    }

    // Get API keys from environment variables
    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_API_SECRET;

    if (!apiKey || !apiSecret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API credentials not configured' })
      };
    }

    // Add timestamp for API request
    const timestamp = Date.now();
    const recvWindow = 5000; // 5 seconds

    // Combine all parameters for signature
    const allParams = {
      ...queryParams,
      timestamp,
      recvWindow
    };

    // Create query string
    const queryString = Object.keys(allParams)
      .map(key => `${key}=${allParams[key]}`)
      .join('&');

    // Create signature
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');

    // Add signature to parameters
    const fullQueryString = `${queryString}&signature=${signature}`;

    // Make the authenticated request to Binance
    const url = `${BINANCE_API_BASE}${endpoint}?${fullQueryString}`;
    
    const response = await axios({
      method: 'GET', // Most Binance API endpoints use GET
      url,
      headers: {
        'X-MBX-APIKEY': apiKey
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Error processing request:', error);
    
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        details: error.response?.data || 'Unknown error'
      })
    };
  }
};
