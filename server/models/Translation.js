const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  original: {
    type: String,
    required: true
  },
  translated: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Translation', translationSchema);
