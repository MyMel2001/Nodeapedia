const searchService = require('./src/services/searchService');

async function testLibreY() {
    const query = 'Node.js';
    console.log(`Testing LibreY search for: ${query}`);

    try {
        const results = await searchService.searchWeb(query);
        console.log('--- Results ---');
        console.log(`Found ${results.length} results.`);

        results.forEach((r, i) => {
            console.log(`[${i + 1}] ${r.title}`);
            console.log(`    URL: ${r.url}`);
            console.log(`    Desc: ${r.description.substring(0, 100)}...`);
            console.log('');
        });

        if (results.length === 0) {
            console.log('No results found. This might mean the CSS selectors in searchService.js need adjustment for your LibreY instance.');
        }
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testLibreY();
