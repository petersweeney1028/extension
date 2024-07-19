const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const OpenAI = require('openai'); // Import OpenAI class directly

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

console.log('MongoDB URI:', MONGO_URI);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err);
  });

const User = require('./models/user');
const Article = require('./models/article');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getArticleContent(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const paragraphs = $('p');
    let content = '';
    paragraphs.each((index, element) => {
      content += $(element).text();
    });
    return content;
  } catch (error) {
    console.error('Error fetching article content:', error);
    return '';
  }
}

async function summarizeArticle(content) {
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-002',
      prompt: `Summarize the following article:\n\n${content}`,
      max_tokens: 100,
    });
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error summarizing article:', error);
    return 'Summary not available';
  }
}

// Routes
app.post('/save-article', async (req, res) => {
  const { userId, url, title } = req.body;
  console.log('Received article:', { userId, url, title });

  if (!url || !title) {
    return res.status(400).json({ error: 'URL and title are required' });
  }

  const articleContent = await getArticleContent(url);
  if (!articleContent) {
    return res.status(500).json({ error: 'Failed to fetch article content' });
  }

  const summarizedContent = await summarizeArticle(articleContent);
  const article = new Article({ userId, url, title, summary: summarizedContent });
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

// Add a root route for verification
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
