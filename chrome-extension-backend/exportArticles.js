require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');
const Article = require('./models/article');
const sendGridMail = require('@sendgrid/mail');

if (!process.env.SENDGRID_API_KEY.startsWith("SG.")) {
  console.error('API key does not start with "SG.".');
  process.exit(1);
}

sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MongoDB URI is not defined in environment variables.');
  process.exit(1);
}

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    processUsers();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err);
  });

async function processUsers() {
  try {
    const users = await User.find({});
    for (const user of users) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Use user.googleId instead of user._id
      const articles = await Article.find({ userId: user.googleId, date: { $gte: sevenDaysAgo } });
      if (articles.length === 0) {
        console.log(`No articles found for user ${user.email} from the last 7 days.`);
        continue;
      }

      const emailContent = articles.map(article => `
        <h3>${article.title}</h3>
        <p>${article.url}</p>
        <p>${article.summary}</p>
      `).join('');

      const msg = {
        to: user.email,
        from: 'swiftie@taylortimes.news', // Replace with your email
        subject: 'Your Weekly Article Summaries',
        html: emailContent,
      };

      await sendGridMail.send(msg);
      console.log(`Email sent to ${user.email}`);
    }
    console.log('Finished processing all users.');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error processing users:', error);
    mongoose.disconnect();
  }
}
