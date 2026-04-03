import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { StockData } from '../types/stock';

interface StockStatsProps {
  stock: StockData;
}

export default function StockStats({ stock }: StockStatsProps) {
  const isPositive = stock.change >= 0;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-5xl font-bold text-white mb-2">
            ${stock.currentPrice.toFixed(2)}
          </h1>
          <p className="text-xl text-gray-400">{stock.name}</p>
          <p className="text-lg text-gray-500">{stock.symbol}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isPositive ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
          {isPositive ? (
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          ) : (
            <TrendingDown className="w-6 h-6 text-red-400" />
          )}
          <span className={`text-xl font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Next Day Prediction</span>
          </div>
          <p className="text-2xl font-bold text-white">
            ${stock.predictions[0]?.price.toFixed(2) || 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {stock.predictions[0]?.confidence.toFixed(0)}% confidence
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">7-Day Forecast</span>
          </div>
          <p className="text-2xl font-bold text-white">
            ${stock.predictions[stock.predictions.length - 1]?.price.toFixed(2) || 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {((stock.predictions[stock.predictions.length - 1]?.price - stock.currentPrice) / stock.currentPrice * 100).toFixed(2)}% change expected
          </p>
        </div>
      </div>
    </div>
  );
}
