const express = require('express');
const path = require('path');
const wikipediaService = require('./services/wikipediaService');
const ragEngine = require('./utils/ragEngine');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 6107;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.redirect('/');

    try {
        const results = await wikipediaService.searchArticles(query);
        res.render('results', { query, results });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error searching Wikipedia');
    }
});

app.get('/article/:title', async (req, res) => {
    const title = req.params.title;
    const isReady = req.query.ready === 'true';

    if (!isReady) {
        return res.render('loading', { title });
    }

    try {
        const articleData = await ragEngine.processArticle(title);
        res.render('article', { article: articleData });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing article');
    }
});

app.listen(PORT, () => {
    console.log(`Nodeapedia running on http://localhost:${PORT}`);
});
