const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb+srv://mondoENSEuser:ENSEGroup4@cluster0.5lkna8o.mongodb.net/ENSE?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Mongoose model
const ArticleSchema = new mongoose.Schema({
  title: String,
  authors: String,
  year: Number,
  sePractice: String,
  claim: String,
  evidence: String,
  type: String,
  participants: String,
});

const Article = mongoose.model('Article', ArticleSchema, 'SE_Articles');

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Route for homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Route for submission page
app.get('/submit.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'submit.html'));
});

app.get('/api/articles', async (req, res) => {
  try {
    const { search, sePractice } = req.query;

    let query = {};

    // If search text is provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { authors: searchRegex },
        { sePractice: searchRegex },
        { claim: searchRegex },
        { evidence: searchRegex },
      ];
    }

    // If SE practice filter is selected
    if (sePractice) {
      query.sePractice = sePractice;
    }

    const articles = await Article.find(query);
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});



// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

