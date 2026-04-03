import { useState, useEffect } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import StockChart from './components/StockChart';
import StockStats from './components/StockStats';
import StockSelector from './components/StockSelector';
import PredictionsTable from './components/PredictionsTable';
import { StockData } from './types/stock';

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchStockData = async (symbol: string) => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stock-data?symbol=${symbol}`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }

      const data = await response.json();
      setStockData(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData(selectedSymbol);

    const interval = setInterval(() => {
      fetchStockData(selectedSymbol);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedSymbol]);

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  const handleRefresh = () => {
    fetchStockData(selectedSymbol);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg shadow-blue-500/50">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">AI Stock Predictor</h1>
                <p className="text-gray-400 mt-1">Real-time predictions powered by machine learning</p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-4">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </header>

        <div className="mb-8">
          <StockSelector selectedSymbol={selectedSymbol} onSelectSymbol={handleSymbolChange} />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-4 mb-8">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {loading && !stockData && (
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400">Loading stock data...</p>
            </div>
          </div>
        )}

        {stockData && (
          <div className="space-y-8 animate-fadeIn">
            <StockStats stock={stockData} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <StockChart prices={stockData.prices} predictions={stockData.predictions} />
              </div>

              <div>
                <PredictionsTable predictions={stockData.predictions} currentPrice={stockData.currentPrice} />
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
