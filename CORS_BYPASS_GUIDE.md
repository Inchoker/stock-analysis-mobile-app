# Custom Backend Proxy Setup Guide

## Why a Custom Backend?

While public CORS proxy services work for development and testing, they have limitations:
- Rate limiting
- Reliability issues
- Security concerns
- Potential downtime

## Option 1: Simple Express.js Proxy Server

Create a simple Node.js/Express server:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for your mobile app
app.use(cors({
  origin: ['http://localhost:19006', 'https://your-app-domain.com'],
  credentials: true
}));

app.use(express.json());

// Stock data proxy endpoint
app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { range = '1mo', interval = '1d' } = req.query;
    
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    const response = await axios.get(yahooUrl, {
      params: { range, interval },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
```

## Option 2: Serverless Functions (Vercel/Netlify)

### Vercel API Route:
```javascript
// api/stock.js
export default async function handler(req, res) {
  const { symbol, range = '1mo', interval = '1d' } = req.query;
  
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

## Option 3: Firebase Functions

```javascript
const functions = require('firebase-functions');
const axios = require('axios');

exports.getStockData = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  const { symbol, range, interval } = req.query;
  
  try {
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      { params: { range, interval } }
    );
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Integration with Your App

Update your stockService.ts to use your custom backend:

```typescript
const API_ENDPOINTS = {
  CUSTOM_BACKEND: 'https://your-backend.vercel.app/api/stock',
  // Keep proxy services as fallbacks
  YAHOO_PROXY_1: 'https://api.allorigins.win/get?url=',
  // ... other proxies
};
```