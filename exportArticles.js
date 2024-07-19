// exportArticles.js

const mongoose = require('mongoose');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const Article = require('./models/article');
const User = require('./models/user');

const MONGO_URI = process.env.MONGO_URI;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(SENDGRID_API_KEY);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err);
  });

async function fetchArticles() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    const articles = await Article.find({ date: { $gte: sevenDaysAgo } });
    return articles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

function formatArticlesToHTML(articles) {
  let htmlContent = '<h1>Articles from the Last 7 Days</h1><ul>';

  articles.forEach(article => {
    htmlContent += `<li>
      <h2>${article.title}</h2>
      <p><a href="${article.url}">${article.url}</a></p>
      <p>${article.summary}</p>
    </li>`;
  });

  htmlContent += '</ul>';
  return htmlContent;
}

async function sendEmail(to, subject, htmlContent) {
  const msg = {
    to,
    from: 'your-email@example.com', // Replace with your verified sender email
    subject,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

async function main() {
  const articles = await fetchArticles();
  if (articles.length === 0) {
    console.log('No articles found from the last 7 days.');
    return;
  }

  const htmlContent = formatArticlesToHTML(articles);

  // Fetch the user email. You can modify this to fetch the user dynamically if needed.
  const user = await User.findOne({ googleId: 'your-user-id' }); // Replace with actual user ID or logic to fetch user
  if (!user) {
    console.error('User not found');
    return;
  }

  await sendEmail(user.email, 'Your Article Summary for the Last 7 Days', htmlContent);
}

main()
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error('Error in main function:', err);
    mongoose.disconnect();
  });
