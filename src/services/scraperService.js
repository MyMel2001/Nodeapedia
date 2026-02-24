const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scraper service to fetch and extract text content from URLs.
 */
class ScraperService {
  /**
   * Fetches the content of a URL and extracts clean text.
   * @param {string} url - The URL to scrape.
   * @param {number} maxLength - Maximum characters to return.
   * @returns {Promise<string>} - The extracted text.
   */
  async scrape(url, maxLength = 2500) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Remove unwanted elements
      $('script, style, noscript, iframe, header, footer, nav, aside').remove();

      // Extract text content
      let text = $('body').text();

      // Clean up whitespace
      text = text
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, ' ')
        .trim();

      return text.substring(0, maxLength);
    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      return ''; // Return empty string on failure
    }
  }
}

module.exports = new ScraperService();
