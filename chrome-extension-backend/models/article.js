const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  url: { type: String, required: true },
  title: { type: String, required: true },
  summary: { type: String },
  date: { type: Date, default: Date.now },
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
