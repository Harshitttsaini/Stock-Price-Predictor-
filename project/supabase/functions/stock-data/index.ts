import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface StockData {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  prices: Array<{ timestamp: string; price: number; volume: number }>;
  predictions: Array<{ date: string; price: number; confidence: number }>;
}

function generateStockPrice(basePrice: number, volatility: number, trend: number): number {
  const randomChange = (Math.random() - 0.5) * volatility;
  return basePrice + randomChange + trend;
}

function generateHistoricalData(symbol: string, basePrice: number): StockData {
  const now = new Date();
  const prices: Array<{ timestamp: string; price: number; volume: number }> = [];

  let currentPrice = basePrice;
  const volatility = basePrice * 0.02;
  const trend = (Math.random() - 0.5) * 0.5;

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    currentPrice = generateStockPrice(currentPrice, volatility, trend);
    const volume = Math.floor(Math.random() * 10000000) + 5000000;

    prices.push({
      timestamp: date.toISOString(),
      price: Number(currentPrice.toFixed(2)),
      volume: volume,
    });
  }

  const latestPrice = prices[prices.length - 1].price;
  const previousPrice = prices[prices.length - 2].price;
  const change = latestPrice - previousPrice;
  const changePercent = (change / previousPrice) * 100;

  const predictions: Array<{ date: string; price: number; confidence: number }> = [];
  const recentPrices = prices.slice(-10).map(p => p.price);
  const sma = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;

  let predictedPrice = sma;
  for (let i = 1; i <= 7; i++) {
    const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    predictedPrice = generateStockPrice(predictedPrice, volatility * 0.5, trend * 0.8);
    const confidence = Math.max(60, 95 - i * 5);

    predictions.push({
      date: date.toISOString(),
      price: Number(predictedPrice.toFixed(2)),
      confidence: confidence,
    });
  }

  const stockNames: { [key: string]: string } = {
    'AAPL': 'Apple Inc.',
    'GOOGL': 'Alphabet Inc.',
    'MSFT': 'Microsoft Corporation',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'META': 'Meta Platforms Inc.',
    'NVDA': 'NVIDIA Corporation',
  };

  return {
    symbol,
    name: stockNames[symbol] || symbol,
    currentPrice: latestPrice,
    change,
    changePercent,
    prices,
    predictions,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const symbol = url.searchParams.get('symbol')?.toUpperCase();

    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol parameter required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const basePrices: { [key: string]: number } = {
      'AAPL': 175,
      'GOOGL': 140,
      'MSFT': 380,
      'AMZN': 145,
      'TSLA': 245,
      'META': 485,
      'NVDA': 875,
    };

    const basePrice = basePrices[symbol] || 100;
    const stockData = generateHistoricalData(symbol, basePrice);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: existingStock } = await supabase
        .from('stocks')
        .select('id')
        .eq('symbol', symbol)
        .maybeSingle();

      let stockId = existingStock?.id;

      if (!stockId) {
        const { data: newStock } = await supabase
          .from('stocks')
          .insert({ symbol, name: stockData.name })
          .select('id')
          .single();
        stockId = newStock?.id;
      }

      if (stockId) {
        await supabase
          .from('stock_prices')
          .delete()
          .eq('stock_id', stockId);

        const priceInserts = stockData.prices.map(p => ({
          stock_id: stockId,
          price: p.price,
          volume: p.volume,
          timestamp: p.timestamp,
        }));

        await supabase.from('stock_prices').insert(priceInserts);

        await supabase
          .from('stock_predictions')
          .delete()
          .eq('stock_id', stockId);

        const predictionInserts = stockData.predictions.map(p => ({
          stock_id: stockId,
          predicted_price: p.price,
          prediction_date: p.date,
          confidence: p.confidence,
        }));

        await supabase.from('stock_predictions').insert(predictionInserts);
      }
    }

    return new Response(JSON.stringify(stockData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
