const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  copies: { type: Number, required: true, default: 1 },
  available: { type: Number, required: true, default: 1 },
  image: { type: String }
});

module.exports = mongoose.model('Book', bookSchema);
