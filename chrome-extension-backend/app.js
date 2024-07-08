const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

const User = require('./models/user');
const Article = require('./models/article');

// Routes
app.post('/save-article', async (req, res) => {
  const { userId, url, title, summary } = req.body;
  const article = new Article({ userId, url, title, summary });
  await article.save();
  res.json(article);
});

app.get('/get-articles/:userId', async (req, res) => {
  const { userId } = req.params;
  const articles = await Article.find({ userId });
  res.json(articles);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
