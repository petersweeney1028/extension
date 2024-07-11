const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const MONGODB_URI = process.env.MONGODB_URI;

console.log('MongoDB URI:', process.env.MONGODB_URI); // Debug log all env variables

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

const User = require('./models/user');
const Article = require('./models/article');

// Routes
app.post('/save-article', async (req, res) => {
  const { userId, url, title, summary } = req.body;
  console.log('Received article:', { userId, url, title, summary });

  if (!url || !title) {
    return res.status(400).json({ error: 'URL and title are required' });
  }

  const article = new Article({ userId, url, title, summary });
  try {
    const savedArticle = await article.save();
    console.log('Article saved:', savedArticle);
    res.json(savedArticle);
  } catch (error) {
    console.error('Error saving article:', error);
    res.status(500).json({ error: 'Failed to save article' });
  }
});

app.get('/get-articles/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log('Fetching articles for user:', userId);

  try {
    const articles = await Article.find({ userId });
    console.log('Articles found:', articles);
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
