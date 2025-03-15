// server.js
const express = require('express');
const axios = require('axios');
const app = express();
const API_KEY = 'AIzaSyD3G3ajbnEuy12rh_5Nd410oTMQEOArQXs';

app.use(express.json());

app.post('/translate', async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    
    // Validate required parameters
    if (!text) {
      return res.status(400).json({ error: 'Missing required parameter: text' });
    }
    
    if (!targetLang) {
      return res.status(400).json({ error: 'Missing required parameter: targetLang' });
    }
    
    console.log(`[Server] Translation request: "${text}" to ${targetLang}`);
    
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
      { q: text, target: targetLang }
    );
    
    // Add error handling for the Google API response
    if (!response.data || !response.data.data || !response.data.data.translations) {
      console.error('[Server] Unexpected response format from Google API:', response.data);
      return res.status(500).json({ 
        error: 'Invalid response from translation service',
        [text]: text // Return original text as fallback
      });
    }
    
    console.log('[Server] Google API response:', JSON.stringify(response.data, null, 2));
    
    // Extract and format the translation result
    const translatedText = response.data.data?.translations?.[0]?.translatedText;
    console.log(`[Server] Translated text: "${text}" => "${translatedText}"`);
    
    // Create response object with the text as key and translation as value
    // If translation failed, return the original text as fallback
    const result = {
      [text]: translatedText || text
    };
    
    console.log('[Server] Sending response:', result);
    res.json(result);
  } catch (error) {
    console.error('[Server] Translation API error:', error.message);
    console.error('[Server] Error details:', error.response?.data);
    
    // Send a more informative error response and include the original text as fallback
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || 'No additional details available',
      [req.body.text]: req.body.text // Return original text as fallback
    });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));