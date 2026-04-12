const mongoose = require('mongoose');

const VocabularySchema = new mongoose.Schema({
  originalWord: { type: String, required: true },
  translatedWord: { type: String, required: true },
  contextSentence: { type: String, default: "" },
  language: { type: String, required: true },
  dateAdded: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate saves of the same word in the same language
VocabularySchema.index({ originalWord: 1, language: 1 }, { unique: true });

module.exports = mongoose.model('Vocabulary', VocabularySchema);
