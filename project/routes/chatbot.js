const express = require('express');
const router = express.Router();
const chatbotService = require('../services/chatbotService');

// Main chatbot endpoint
router.post('/analyze', async (req, res) => {
  try {
    const { message, data, context = {} } = req.body;
    
    const response = await chatbotService.processMessage(message, data, context);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Intent recognition
router.post('/intent', async (req, res) => {
  try {
    const { message } = req.body;
    
    const intent = await chatbotService.recognizeIntent(message);
    res.json({ intent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;