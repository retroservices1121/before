import { MiniKitConfig } from '@coinbase/onchainkit/minikit';

const config: MiniKitConfig = {
  miniapp: {
    version: '1',
    name: 'before',
    subtitle: 'AI Intelligence for Prediction Markets',
    description:
      'Know before it matters. AI-powered context briefs for prediction markets on Polymarket, Limitless, Kalshi, and more.',
    iconUrl: 'https://b4enews.com/icon.png',
    splashImageUrl: 'https://b4enews.com/splash.png',
    splashBackgroundColor: '#0a0a0a',
    homeUrl: process.env.NEXT_PUBLIC_URL || 'https://mini.b4enews.com',
    webhookUrl: `${process.env.NEXT_PUBLIC_URL || 'https://mini.b4enews.com'}/api/webhook`,
    primaryCategory: 'utility',
    tags: ['prediction-markets', 'ai', 'analytics', 'intelligence', 'trading'],
    heroImageUrl: 'https://b4enews.com/hero.png',
    tagline: 'Know before it matters',
    ogTitle: 'before — AI Intelligence for Prediction Markets',
    ogDescription:
      'Real-time AI briefs explaining why prediction market odds are where they are.',
    ogImageUrl: 'https://b4enews.com/og.png',
  },
  // Fill after running account association tool
  accountAssociation: {
    header: '',
    payload: '',
    signature: '',
  },
};

export default config;
