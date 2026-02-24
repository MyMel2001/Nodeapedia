const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const LIBREY_BASE_URL = process.env.LIBREY_BASE_URL || 'https://search.sparksammy.com';

/**
 * Helper to introduce a randomized delay.
 */
const delay = (min, max) => {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, ms));
};

async function searchWeb(query) {
    try {
        // Maintain randomized delay to be respectful to the instance
        await delay(2000, 6000);

        const searchUrl = `${LIBREY_BASE_URL}/search.php?q=${encodeURIComponent(query)}&p=0&t=0`;
        console.log(`Searching LibreY: ${searchUrl}`);

        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Nodeapedia/1.0 (https://github.com/MyMel2001/Nodeapedia)'
            }
        });

        const $ = cheerio.load(response.data);
        const results = [];

        // Find elements with class 'text-result-wrapper'
        $('.text-result-wrapper').each((i, el) => {
            if (results.length >= 5) return false;

            const wrapper = $(el);
            const linkEl = wrapper.find('a').first();
            const url = linkEl.attr('href');
            const title = linkEl.find('h2').text().trim() || linkEl.text().trim();
            const description = wrapper.find('span').text().trim();

            if (url && title) {
                results.push({
                    title,
                    description: description || 'No description available',
                    url
                });
            }
        });

        return results;
    } catch (error) {
        console.error('Error searching LibreY:', error.message);
        return [];
    }
}

module.exports = {
    searchWeb
};
