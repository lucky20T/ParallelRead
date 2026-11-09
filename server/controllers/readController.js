const textParser = require('../utils/textParser');
const translationService = require('../services/translationService');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

exports.uploadAndProcess = async (req, res) => {
  try {
    const file = req.file;
    const targetLang = req.body.targetLang || 'Hindi';

    const rawText = req.body.rawText;

    let text = '';
    
    if (file) {
      const filename = file.originalname.toLowerCase();
      // Determine extraction method based on file extension
      if (filename.endsWith('.pdf')) {
        const { PDFParse } = require('pdf-parse');
        const parser = new PDFParse({ data: file.buffer });
        const result = await parser.getText();
        await parser.destroy();
        text = result.text;
      } else if (filename.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        text = result.value;
      } else if (filename.endsWith('.txt')) {
        text = file.buffer.toString('utf-8');
      } else {
        return res.status(400).json({ error: 'Unsupported file format. Please upload .txt, .pdf, or .docx' });
      }
    } else if (rawText) {
      text = rawText;
    } else {
      return res.status(400).json({ error: 'Please upload a file or provide raw text.' });
    }

    const sentences = textParser.splitIntoSentences(text);

    if (sentences.length === 0) {
      return res.status(400).json({ error: 'Could not extract any meaningful text from the file.' });
    }

    return res.status(200).json({ sentences });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
};

exports.translateBatch = async (req, res) => {
  try {
    const { sentences, targetLang, apiKey: bodyApiKey } = req.body;
    // Check header or request body for user's API key
    const authHeader = req.headers.authorization;
    const bearerKey = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const apiKey = bearerKey || req.headers['x-gemini-api-key'] || bodyApiKey;

    if (!sentences || !Array.isArray(sentences)) {
      return res.status(400).json({ error: 'Provide an array of sentences' });
    }

    const translations = await translationService.translateSentences(sentences, targetLang, apiKey);
    return res.status(200).json({ translations });

  } catch (error) {
    console.error('Translate error:', error);
    res.status(500).json({ error: error.message || 'Failed to translate' });
  }
};
