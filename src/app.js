const express = require('express');
const path = require('path');
const wikipediaService = require('./services/wikipediaService');
const ragEngine = require('./utils/ragEngine');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 6107;

// In-memory store for background jobs
const jobs = new Map();

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

    // If it's a direct browser request without 'ready', show loading page
    if (!isReady) {
        return res.render('loading', { title });
    }

    // If 'ready' is true, the browser expects the final data
    // We check if we have a completed job for this title
    const job = jobs.get(title);
    if (job && job.status === 'completed') {
        const data = job.data;
        // Clean up job after successful retrieval to save memory
        jobs.delete(title);
        return res.render('article', { article: data });
    }

    // If no job exists or not ready, redirect back to loading
    res.redirect(`/article/${encodeURIComponent(title)}`);
});

// Start a background job
app.post('/api/job/:title', (req, res) => {
    const title = req.params.title;

    // If already processing, don't start again
    if (jobs.has(title)) {
        return res.json({ status: jobs.get(title).status });
    }

    // Start background processing
    jobs.set(title, { status: 'processing', data: null });

    ragEngine.processArticle(title)
        .then(data => {
            jobs.set(title, { status: 'completed', data });
        })
        .catch(err => {
            console.error(`Job failed for ${title}:`, err);
            jobs.set(title, { status: 'failed', error: err.message });
        });

    res.json({ status: 'processing' });
});

// Check job status
app.get('/api/job/:title', (req, res) => {
    const title = req.params.title;
    const job = jobs.get(title);

    if (!job) {
        return res.status(404).json({ status: 'not_found' });
    }

    res.json({ status: job.status });
});

app.listen(PORT, () => {
    console.log(`Nodeapedia running on http://localhost:${PORT}`);
});
