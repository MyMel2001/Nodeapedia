const axios = require('axios');

async function getArticle(title) {
    try {
        const config = {
            headers: { 'User-Agent': 'Nodeapedia/1.0 (https://github.com/MyMel2001/Nodeapedia; sparksammy@example.com)' }
        };
        const response = await axios.get('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title), config);
        const fullContentResponse = await axios.get('https://en.wikipedia.org/api/rest_v1/page/html/' + encodeURIComponent(title), config);

        return {
            title: response.data.title,
            extract: response.data.extract,
            thumbnail: response.data.thumbnail ? response.data.thumbnail.source : null,
            content: fullContentResponse.data, // HTML content
            desktopUrl: response.data.content_urls.desktop.page
        };
    } catch (error) {
        console.error('Error fetching Wikipedia article:', error.message);
        throw error;
    }
}

async function searchArticles(query) {
    try {
        const response = await axios.get('https://en.wikipedia.org/w/api.php', {
            params: {
                action: 'query',
                list: 'search',
                srsearch: query,
                format: 'json',
                origin: '*'
            },
            headers: { 'User-Agent': 'Nodeapedia/1.0 (https://github.com/MyMel2001/Nodeapedia; sparksammy@example.com)' }
        });
        return response.data.query.search;
    } catch (error) {
        console.error('Error searching Wikipedia:', error.message);
        throw error;
    }
}

module.exports = {
    getArticle,
    searchArticles
};
