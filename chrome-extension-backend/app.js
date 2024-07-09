const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

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
  const article = new Article({ userId, url, title, summary });
  await article.save();
  res.json(article);
});

app.get('/get-articles/:userId', async (req, res) => {
  const { userId } = req.params;
  const articles = await Article.find({ userId });
  res.json(articles);
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
