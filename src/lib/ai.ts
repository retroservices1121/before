import { Market, ContextBrief } from './types';
import { crawlMarketContext } from './tinyfish';
import { getSpreadContext, formatSpreadForPrompt } from './spread';
import { enrichCryptoMarket, formatEnrichmentForPrompt } from './tokens';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Generate an AI context brief for a given market.
 * 
 * Pipeline:
 * 1. TinyFish Web Agent crawls real-time news and data
 * 2. Tokens API enriches crypto markets with live price/risk data (optional)
 * 3. Gemini synthesizes all data sources into a structured brief
 */
export async function generateContextBrief(market: Market): Promise<ContextBrief> {
  // Step 1 + 2: Fetch news context and crypto data in parallel
  const isPolymarket = market.platform === 'polymarket' && market.conditionId;

  const [spreadContext, webContext, cryptoEnrichment] = await Promise.all([
    isPolymarket ? getSpreadContext(market.conditionId!) : Promise.resolve(null),
    !isPolymarket ? crawlMarketContext(market.title, market.category) : Promise.resolve(null),
    enrichCryptoMarket(market.title, market.category),
  ]);

  // Use Spread correlated news for Polymarket, TinyFish for others
  const spreadBlock = spreadContext ? formatSpreadForPrompt(spreadContext) : '';
  const webContextBlock = webContext && webContext.articles.length > 0
    ? `\n\nREAL-TIME WEB CONTEXT (crawled ${webContext.crawledAt}):\n${webContext.articles
        .map((a, i) => `[${i + 1}] ${a.title}${a.source ? ` (${a.source})` : ''}${a.publishedAt ? ` — ${a.publishedAt}` : ''}\n${a.content}`)
        .join('\n\n')}`
    : '';

  const newsBlock = spreadBlock || webContextBlock
    || '\n\n(No live web context available — generate brief from your knowledge of this topic.)';

  const cryptoBlock = cryptoEnrichment
    ? `\n\n${formatEnrichmentForPrompt(cryptoEnrichment)}`
    : '';

  // Step 3: Gemini synthesizes everything
  const prompt = `You are Before, an AI market intelligence engine for prediction markets. Generate a context brief for this market.

Market: ${market.title}
Description: ${market.description || 'N/A'}
Current probability: ${(market.probability * 100).toFixed(1)}%
24h price change: ${market.priceChange24h ? `${market.priceChange24h > 0 ? '+' : ''}${market.priceChange24h}%` : 'N/A'}
24h volume: $${market.volume24h ? market.volume24h.toLocaleString() : 'N/A'}
Total volume: $${market.volume.toLocaleString()}
Platform: ${market.platform}
Resolution date: ${market.endDate || 'TBD'}
Category: ${market.category || 'General'}${newsBlock}${cryptoBlock}

Respond with ONLY valid JSON (no markdown, no backticks) in this exact format:
{
  "summary": "2-3 sentences explaining WHY the probability is where it is right now. Reference recent events, data, or developments. If web context was provided, incorporate those specific details. If live crypto market data was provided, reference actual price action and trends. Be specific and informative.",
  "keyFactors": [
    {
      "name": "Short factor name",
      "sentiment": "bullish|bearish|neutral|pending",
      "detail": "One sentence explaining this factor"
    }
  ],
  "historicalBaseRate": "One sentence about historical precedent or base rate for this type of event.",
  "upcomingCatalysts": ["Upcoming event or date that could move this market"]
}

Include 3-5 key factors and 2-3 upcoming catalysts. Be concise and analyst-grade. Do not hedge excessively. Write like a research analyst, not a chatbot.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API error: ${response.status}`, errText);
      throw new Error(`Gemini API ${response.status}`);
    }

    const data = await response.json();

    // Extract text from Gemini response
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      marketId: market.id,
      summary: parsed.summary,
      keyFactors: parsed.keyFactors,
      historicalBaseRate: parsed.historicalBaseRate,
      upcomingCatalysts: parsed.upcomingCatalysts,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Context generation failed:', error);

    // Return a fallback brief so the UI doesn't break
    return {
      marketId: market.id,
      summary: `This market is currently trading at ${(market.probability * 100).toFixed(0)}% probability with $${market.volume.toLocaleString()} in total volume. ${market.priceChange24h ? `The price has moved ${market.priceChange24h > 0 ? '+' : ''}${market.priceChange24h}% in the last 24 hours.` : ''}`,
      keyFactors: [
        {
          name: 'Market volume',
          sentiment: market.volume > 5_000_000 ? 'bullish' : 'neutral',
          detail: `$${market.volume.toLocaleString()} in total volume indicates ${market.volume > 5_000_000 ? 'strong' : 'moderate'} market interest.`,
        },
      ],
      historicalBaseRate: 'Historical base rate data unavailable. Connect your Gemini API key for AI-generated context.',
      upcomingCatalysts: market.endDate ? [`Market resolves: ${market.endDate}`] : [],
      generatedAt: new Date().toISOString(),
    };
  }
}
