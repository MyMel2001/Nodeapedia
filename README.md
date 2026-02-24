# Nodeapedia 🌐🧠

**Nodeapedia** is an AI-powered Wikipedia reimagining. It takes traditional Wikipedia articles and enhances them using a Retrieval-Augmented Generation (RAG) engine. Instead of just reading a static entry, you get an AI-generated synthesis that is cross-referenced against live web search results to identify discrepancies, missing context, and interesting additional facts.

## 🚀 How It Works

1.  **Wikipedia Fetch**: Retrieves the core topic information from Wikipedia's REST API.
2.  **Web Verification**: Uses a **LibreY** instance to perform a privacy-respecting search for the latest information on the topic.
3.  **Content Scraping**: Scrapes the top web results to gather deep context (not just snippets).
4.  **AI Fact-Check**: A smaller LLM (e.g., `qwen3:4b`) compares the Wikipedia data with the web results to find inconsistencies.
5.  **Synthesis**: A larger LLM (e.g., `deepseek-r1:14b`) writes a concise, easy-to-read summary incorporating the fact-check findings.
6.  **Sources**: All original sources (Wikipedia + Web results) are provided to the user for transparency.

## 🛠 Self-Hosting Guide

Hosting your own instance of Nodeapedia requires a local LLM runner (Ollama) and a Node.js environment.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [Ollama](https://ollama.com/) (Running locally or on a reachable server)
*   Access to a [LibreY](https://github.com/the-marius/LibreY) instance (defaults to `search.sparksammy.com`)

### 1. Setup Models

Ensure you have the required models pulled in Ollama:

```bash
ollama pull gemma3:4b
ollama pull sparksammy/ministral-3-14b-unsloth:small-hotfixed
```

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/MyMel2001/Nodeapedia.git
cd Nodeapedia
npm install
```

### 3. Configuration

Create a `.env` file in the root directory (or copy `.env.example`):

```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434/v1
MODEL_FACT_CHECK=qwen3:4b
MODEL_SUMMARY=deepseek-r1:14b

# Search Configuration (LibreY)
LIBREY_BASE_URL=https://search.sparksammy.com

# Server Configuration
PORT=6107
NODE_ENV=development
```

### 4. Build and Run

Generate the CSS (if modified) and start the server:

```bash
# Build Tailwind CSS
npm run build:css

# Start the application
npm start
```

Your instance will be running at `http://localhost:6107`.

## 📜 License

This project is licensed under the SPL-R5 License.
