const wikipediaService = require('../services/wikipediaService');
const searchService = require('../services/searchService');
const scraperService = require('../services/scraperService');
const ollamaService = require('../services/ollamaService');
const { marked } = require('marked');
const DOMPurify = require('isomorphic-dompurify');
require('dotenv').config();

const MODEL_FACT_CHECK = process.env.MODEL_FACT_CHECK || 'qwen3:4b';
const MODEL_SUMMARY = process.env.MODEL_SUMMARY || 'deepseek-r1:14b';

async function processArticle(title) {
    console.log(`Processing article: ${title}`);

    // 1. Fetch Wikipedia article
    const article = await wikipediaService.getArticle(title);

    // 2. Search for related content via DuckDuckGo
    const searchResults = await searchService.searchWeb(title);

    // 3. Scrape the top 3 results in parallel
    const topResults = searchResults.slice(0, 3);
    const enrichedResults = await Promise.all(topResults.map(async (res) => {
        const scrapedText = await scraperService.scrape(res.url);
        return {
            ...res,
            content: scrapedText || res.description // Fallback to snippet if scraping fails
        };
    }));

    const searchContext = enrichedResults.length > 0
        ? enrichedResults.map(r => `${r.title} (${r.url}):\n${r.content}`).join('\n\n---\n\n')
        : "No web search results available due to rate limiting or search error.";

    const sources = enrichedResults.map(r => ({ title: r.title, url: r.url }));

    // 4. Fact-checking with smaller model
    const factCheckPrompt = [
        {
            role: 'system',
            content: 'You are a fact-checker. Compare the Wikipedia extract with the provided search results from the web. Identify any discrepancies, missing information, or interesting additional context. If no search results are provided, simply state that you couldn\'t verify the information against the web today.'
        },
        {
            role: 'user',
            content: `Wikipedia Extract:\n${article.extract}\n\nWeb Search Results:\n${searchContext}\n\nIdentify discrepancies and additional context:`
        }
    ];

    let factCheckResults = "Fact check unavailable.";
    try {
        factCheckResults = await ollamaService.chat(MODEL_FACT_CHECK, factCheckPrompt);
    } catch (e) {
        console.warn("Fact check failed:", e.message);
    }

    // 5. Summarization with larger model
    const summaryPrompt = [
        {
            role: 'system',
            content: 'You are an expert summarizer. Provide a concise summary of the topic based on the Wikipedia content and the fact-check findings.'
        },
        {
            role: 'user',
            content: `Topic: ${title}\nWikipedia Extract: ${article.extract}\nFact Check Results: ${factCheckResults}\n\nSummary:`
        }
    ];

    let aiSummary = "AI Summary unavailable.";
    try {
        aiSummary = await ollamaService.chat(MODEL_SUMMARY, summaryPrompt);
    } catch (e) {
        console.warn("Summary generation failed:", e.message);
    }

    // 6. Parse Markdown and Sanitize HTML
    const sanitizedSummary = DOMPurify.sanitize(marked.parse(aiSummary));
    const sanitizedFactCheck = DOMPurify.sanitize(marked.parse(factCheckResults));

    return {
        ...article,
        factCheck: sanitizedFactCheck,
        aiSummary: sanitizedSummary,
        sources: sources
    };
}

module.exports = {
    processArticle
};
