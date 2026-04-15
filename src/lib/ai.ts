import { Market, ContextBrief } from './types';
import { crawlMarketContext } from './tinyfish';
import { getSpreadContext, formatSpreadForPrompt } from './spread';
import { enrichCryptoMarket, formatEnrichmentForPrompt } from './tokens';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Race a promise against a timeout (returns null on timeout)
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

/**
 * Generate an AI context brief for a given market.
 *
 * Pipeline:
 * 1. TinyFish Web Agent crawls real-time news and data (10s timeout)
 * 2. Tokens API enriches crypto markets with live price/risk data (5s timeout)
 * 3. Gemini synthesizes all data sources into a structured brief
 */
export async function generateContextBrief(market: Market): Promise<ContextBrief> {
  // Step 1 + 2: Fetch news context and crypto data in parallel with timeouts
  const isPolymarket = market.platform === 'polymarket' && market.conditionId;

  const [spreadContext, webContext, cryptoEnrichment] = await Promise.all([
    isPolymarket ? withTimeout(getSpreadContext(market.conditionId!), 8000) : Promise.resolve(null),
    !isPolymarket ? withTimeout(crawlMarketContext(market.title, market.category), 10000) : Promise.resolve(null),
    withTimeout(enrichCryptoMarket(market.title, market.category), 5000),
  ]);

  // Use Spread correlated news for Polymarket, TinyFish for others
  const spreadBlock = spreadContext ? formatSpreadForPrompt(spreadContext) : '';
  const webContextBlock = webContext && webContext.articles.length > 0
    ? `\n\nREAL-TIME WEB CONTEXT (crawled ${webContext.crawledAt}):\n${webContext.articles
        .map((a, i) => `[${i + 1}] ${a.title}${a.source ? ` (${a.source})` : ''}${a.publishedAt ? ` — ${a.publishedAt}` : ''}\n${a.content}`)
        .join('\n\n')}`
    : '';

  const hasLiveContext = !!(spreadBlock || webContextBlock);
  const newsBlock = spreadBlock || webContextBlock
    || '\n\n(No live web context available. Use only facts you are highly confident about. Do NOT guess election outcomes, officeholders, or event results you are unsure of.)';

  const cryptoBlock = cryptoEnrichment
    ? `\n\n${formatEnrichmentForPrompt(cryptoEnrichment)}`
    : '';

  // Step 3: Gemini synthesizes everything
  const today = new Date().toISOString().slice(0, 10);

  const confidenceWarning = hasLiveContext
    ? ''
    : `\nIMPORTANT: No live news data was available. Do NOT fabricate or assume facts about recent events, election results, who holds office, or outcomes you are uncertain about. Focus on structural factors, historical patterns, and the market data provided. If you are unsure who won a past election or what happened recently, say "based on market pricing" instead of guessing.`;

  const hasMarketData = market.volume > 0 || market.probability > 0;
  const yesProb = market.probability;
  const noProb = 1 - market.probability;
  const leadOutcome = yesProb >= 0.5 ? 'Yes' : 'No';
  const leadProb = yesProb >= 0.5 ? yesProb : noProb;
  const marketDataLine = hasMarketData
    ? `Yes: ${(yesProb * 100).toFixed(1)}% | No: ${(noProb * 100).toFixed(1)}% | Leading outcome: ${leadOutcome} at ${(leadProb * 100).toFixed(1)}% | Volume: $${market.volume.toLocaleString()} | Platform: ${market.platform}`
    : `Platform: ${market.platform} (No market data available — analyze based on the event itself)`;
  const statsLine = [
    market.endDate ? `Resolves: ${market.endDate}` : '',
    hasMarketData && market.priceChange24h ? `24h: ${market.priceChange24h > 0 ? '+' : ''}${market.priceChange24h}%` : '',
  ].filter(Boolean).join(' | ');

  const prompt = `Generate a prediction market context brief. Be concise, specific, analyst-grade.

Today's date: ${today}${confidenceWarning}

Market: ${market.title}
${marketDataLine}
${statsLine}${newsBlock}${cryptoBlock}

JSON response:
{"summary":"2-3 sentences analyzing this market/event. ${hasMarketData ? 'Explain WHY probability is here.' : 'Analyze the likely outcome based on available information.'} Do not assume or fabricate political outcomes.","keyFactors":[{"name":"Factor","sentiment":"bullish|bearish|neutral","detail":"One sentence"}],"historicalBaseRate":"One sentence on precedent.","upcomingCatalysts":["FUTURE event/date after ${today} that could move this market"]}

3-5 factors, 2-3 catalysts. All catalysts MUST be in the future (after ${today}). No hedging. Write like a research analyst.`;

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
          maxOutputTokens: 800,
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
