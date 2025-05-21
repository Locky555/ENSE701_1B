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

const ReviewSchema = new mongoose.Schema({
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Review = mongoose.model('Review', ReviewSchema, 'Article_Reviews');

app.get('/api/articles/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/articles/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rating, comment } = req.body;

    if (!name || !rating || !comment) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const review = new Review({
      articleId: id,
      name,
      rating,
      comment,
    });

    await review.save();
    res.status(201).json({ message: 'Review saved successfully' });
  } catch (err) {
    console.error('Error saving review:', err);
    res.status(500).json({ error: 'Failed to save review' });
  }
});

app.get('/api/articles/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ articleId: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('Error in getting reviews:', err);
    res.status(500).json({ error: 'Failed to get any reviews (no reviews available)' });
  }
});

const ArticleSuggestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  authors: { type: String, required: true },
  journal: { type: String, required: true },
  year: { type: Number, required: true },
  doi: { type: String, required: true },
  description: { type: String, required: true},
  submitted: { type: Date, default: Date.now}
});
const ArticleSuggestion = mongoose.model('ArticleSuggestion', ArticleSuggestionSchema, 'Article_Suggestions');

app.post('/api/suggestions', async (req, res) => {
  try {
    const { title, authors, journal, year, doi, description } = req.body;

    if (!title || !authors || !description) {
      return res.status(400).json({ message: 'Please make sure title, year and a small description is filled in.' });
    }
    const suggestion = new ArticleSuggestion({
      title,
      authors,
      journal,
      year,
      doi,
      description
    });

    await suggestion.save();
    res.status(201).json({ message: 'Thank you for your article suggestion.' });
  } catch (err) {
    console.error('Error saving suggestion:', err);
    res.status(500).json({ message: 'Sorry, failed to submit suggestion' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

