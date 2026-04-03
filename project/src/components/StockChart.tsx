import { StockPrice, StockPrediction } from '../types/stock';

interface StockChartProps {
  prices: StockPrice[];
  predictions: StockPrediction[];
}

export default function StockChart({ prices, predictions }: StockChartProps) {
  const width = 800;
  const height = 400;
  const padding = 50;

  const allPrices = [...prices.map(p => p.price), ...predictions.map(p => p.price)];
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;

  const getX = (index: number, total: number) => {
    return padding + ((width - 2 * padding) * index) / (total - 1);
  };

  const getY = (price: number) => {
    return height - padding - ((price - minPrice) / priceRange) * (height - 2 * padding);
  };

  const historicalPath = prices
    .map((p, i) => {
      const x = getX(i, prices.length);
      const y = getY(p.price);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  const predictionPath = predictions
    .map((p, i) => {
      const x = getX(prices.length - 1 + i, prices.length + predictions.length - 1);
      const y = getY(p.price);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  const lastHistoricalX = getX(prices.length - 1, prices.length);
  const lastHistoricalY = getY(prices[prices.length - 1].price);
  const firstPredictionX = getX(prices.length - 1, prices.length + predictions.length - 1);
  const firstPredictionY = getY(predictions[0].price);

  const connectingPath = `M ${lastHistoricalX} ${lastHistoricalY} L ${firstPredictionX} ${firstPredictionY}`;

  const gradientPath = `${historicalPath} L ${getX(prices.length - 1, prices.length)} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-2xl">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path d={gradientPath} fill="url(#priceGradient)" />

        <path
          d={historicalPath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          className="transition-all duration-1000"
          style={{ filter: 'url(#glow)' }}
        />

        <path
          d={connectingPath}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2"
          strokeDasharray="5,5"
          opacity="0.6"
        />

        <path
          d={predictionPath}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="3"
          strokeDasharray="10,5"
          className="animate-pulse"
          style={{ filter: 'url(#glow)' }}
        />

        {prices.map((p, i) => (
          <circle
            key={`price-${i}`}
            cx={getX(i, prices.length)}
            cy={getY(p.price)}
            r="4"
            fill="#3b82f6"
            className="transition-all duration-300 hover:r-6"
          >
            <title>{`${new Date(p.timestamp).toLocaleDateString()}: $${p.price.toFixed(2)}`}</title>
          </circle>
        ))}

        {predictions.map((p, i) => (
          <circle
            key={`pred-${i}`}
            cx={getX(prices.length - 1 + i, prices.length + predictions.length - 1)}
            cy={getY(p.price)}
            r="4"
            fill="#8b5cf6"
            className="transition-all duration-300 hover:r-6"
          >
            <title>{`${new Date(p.date).toLocaleDateString()}: $${p.price.toFixed(2)} (${p.confidence}% confidence)`}</title>
          </circle>
        ))}

        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#475569"
          strokeWidth="2"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#475569"
          strokeWidth="2"
        />

        <text x={padding} y={height - 20} fill="#94a3b8" fontSize="12" textAnchor="start">
          Historical
        </text>
        <text x={width - padding} y={height - 20} fill="#a78bfa" fontSize="12" textAnchor="end">
          Predicted
        </text>

        <text x={padding - 10} y={padding} fill="#94a3b8" fontSize="12" textAnchor="end">
          ${maxPrice.toFixed(0)}
        </text>
        <text x={padding - 10} y={height - padding} fill="#94a3b8" fontSize="12" textAnchor="end">
          ${minPrice.toFixed(0)}
        </text>
      </svg>

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-12 h-1 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-400">Historical Data</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-1 bg-purple-500 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #8b5cf6, #8b5cf6 10px, transparent 10px, transparent 15px)' }}></div>
          <span className="text-sm text-gray-400">AI Predictions</span>
        </div>
      </div>
    </div>
  );
}
