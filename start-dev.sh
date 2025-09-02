#!/bin/bash
# VoyageIntel Development Server with API Key
export OPENAI_API_KEY=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
export PORT=3000

echo "🚢 Starting VoyageIntel MaritimeAI Assistant..."
echo "📡 OpenAI API Key: Configured"
echo "🌐 Server will start on: http://localhost:3000"
echo ""

npm run dev
