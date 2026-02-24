const axios = require('axios');
require('dotenv').config();

const baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';

async function chat(model, messages, temperature = 0.7) {
    try {
        const response = await axios.post(`${baseURL}/chat/completions`, {
            model: model,
            messages: messages,
            temperature: temperature
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error(`Error calling Ollama with model ${model}:`, error.message);
        throw new Error(`Ollama service error: ${error.message}`);
    }
}

module.exports = {
    chat
};
