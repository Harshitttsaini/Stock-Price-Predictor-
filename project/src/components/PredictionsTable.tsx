import { Calendar, TrendingUp, Target } from 'lucide-react';
import { StockPrediction } from '../types/stock';

interface PredictionsTableProps {
  predictions: StockPrediction[];
  currentPrice: number;
}

export default function PredictionsTable({ predictions, currentPrice }: PredictionsTableProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Target className="w-6 h-6 text-purple-400" />
        7-Day Price Predictions
      </h2>

      <div className="space-y-3">
        {predictions.map((prediction, index) => {
          const change = prediction.price - currentPrice;
          const changePercent = (change / currentPrice) * 100;
          const isPositive = change >= 0;

          return (
            <div
              key={index}
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:scale-102"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300 font-medium">
                      {new Date(prediction.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ${prediction.price.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    <TrendingUp className={`w-4 h-4 ${isPositive ? '' : 'rotate-180'}`} />
                    <span className="font-semibold">
                      {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000"
                        style={{ width: `${prediction.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-400 w-12">
                      {prediction.confidence.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
