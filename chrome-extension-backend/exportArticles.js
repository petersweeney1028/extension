const mongoose = require('mongoose');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const User = require('./models/user');
const Article = require('./models/article');

const MONGO_URI = process.env.MONGO_URI;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(SENDGRID_API_KEY);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    exportArticles();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err);
  });

async function exportArticles() {
  try {
    const users = await User.find();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    for (const user of users) {
      const articles = await Article.find({
        userId: user._id,
        date: { $gte: oneWeekAgo }
      });

      if (articles.length === 0) {
        console.log(`No articles found for user ${user.email} from the last 7 days.`);
        continue;
      }

      const articlesHtml = articles.map(article => `
        <h3>${article.title}</h3>
        <p>${article.url}</p>
        <p>${article.summary}</p>
      `).join('');

      const msg = {
        to: user.email,
        from: 'swiftie@taylortimes.news',
        subject: 'Your Weekly Article Summary',
        html: `
          <h1>Here are the articles you saved in the last 7 days:</h1>
          ${articlesHtml}
        `,
      };

      await sgMail.send(msg);
      console.log(`Email sent to ${user.email}`);
    }

    console.log('Finished processing all users.');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error exporting articles:', error);
  }
}
