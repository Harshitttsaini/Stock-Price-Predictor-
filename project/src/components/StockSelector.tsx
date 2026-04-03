import { TrendingUp } from 'lucide-react';

interface StockSelectorProps {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

const STOCKS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'GOOGL', name: 'Google' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'NVDA', name: 'NVIDIA' },
];

export default function StockSelector({ selectedSymbol, onSelectSymbol }: StockSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {STOCKS.map((stock) => (
        <button
          key={stock.symbol}
          onClick={() => onSelectSymbol(stock.symbol)}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            selectedSymbol === stock.symbol
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50 scale-105'
              : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:scale-105'
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>{stock.symbol}</span>
          </div>
          <div className="text-xs opacity-75 mt-1">{stock.name}</div>
        </button>
      ))}
    </div>
  );
}
