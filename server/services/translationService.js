const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Translation = require('../models/Translation');

// Fast in-memory cache fallback when MongoDB is not connected
const memoryCache = new Map();

const isDbConnected = () => mongoose.connection.readyState === 1;

const hashText = (text, targetLang) => {
  return crypto.createHash('sha256').update(`${text}_${targetLang}`).digest('hex');
};

exports.translateSentences = async (sentences, targetLang = 'Hindi', userApiKey = null) => {
  const finalResults = new Array(sentences.length).fill(null);
  const toTranslate = [];
  const toTranslateIndices = [];

  // 1. Check cache for each sentence (MongoDB or In-Memory)
  for (let i = 0; i < sentences.length; i++) {
    const text = sentences[i];
    const hash = hashText(text, targetLang);
    let cachedTranslation = null;

    if (isDbConnected()) {
      try {
        const cached = await Translation.findOne({ hash });
        if (cached) cachedTranslation = cached.translated;
      } catch (dbErr) {
        // Fallback to memory cache on DB query error
        cachedTranslation = memoryCache.get(hash);
      }
    } else {
      cachedTranslation = memoryCache.get(hash);
    }

    if (cachedTranslation) {
      finalResults[i] = cachedTranslation;
    } else {
      toTranslate.push(text);
      toTranslateIndices.push(i);
    }
  }

  // 2. Batch translate missing via Gemini
  if (toTranslate.length > 0) {
    const apiKey = (userApiKey && userApiKey.trim()) || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("No Gemini API key provided. Please click 'Set Gemini Key' in the top right to enter your key.");
    }
    const genAI = new GoogleGenerativeAI(apiKey.trim());

    try {
      console.log(`Translating batch of ${toTranslate.length} sentences via Gemini...`);

      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              translations: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: 'The translated sentences in the exact original order'
              }
            },
            required: ['translations']
          }
        }
      });

      const prompt = `You are an expert bilingual translator. Translate the following array of sentences into ${targetLang}. Return exactly a JSON object matching the schema. Important: The "translations" array MUST maintain exactly the same order and length as the input sentences.\n\nInput JSON:\n${JSON.stringify({ sentences: toTranslate })}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed = JSON.parse(responseText);
      const translatedSentences = parsed.translations;

      if (!translatedSentences || translatedSentences.length !== toTranslate.length) {
        throw new Error('Gemini returned mismatched translation length.');
      }

      // Save to cache and populate final results
      for (let i = 0; i < toTranslate.length; i++) {
        const originalText = toTranslate[i];
        const translatedText = translatedSentences[i];
        const idx = toTranslateIndices[i];

        finalResults[idx] = translatedText;

        const hash = hashText(originalText, targetLang);
        // Always save to memory cache
        memoryCache.set(hash, translatedText);

        // Async save to mongo if connected
        if (isDbConnected()) {
          Translation.create({
            hash,
            original: originalText,
            translated: translatedText,
            language: targetLang
          }).catch(err => {
            if (err.code !== 11000) console.error("Cache save error:", err);
          });
        }
      }

    } catch (error) {
      console.error('Translation error:', error);
      toTranslate.forEach((text, i) => {
        const idx = toTranslateIndices[i];
        finalResults[idx] = `[Translation Error]: ${text}`;
      });
    }
  }

  return finalResults;
};
