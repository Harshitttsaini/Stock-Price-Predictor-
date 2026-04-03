export interface StockPrice {
  timestamp: string;
  price: number;
  volume: number;
}

export interface StockPrediction {
  date: string;
  price: number;
  confidence: number;
}

export interface StockData {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  prices: StockPrice[];
  predictions: StockPrediction[];
}
