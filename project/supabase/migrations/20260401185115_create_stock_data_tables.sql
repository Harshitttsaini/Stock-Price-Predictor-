/*
  # Stock Prediction System Schema

  1. New Tables
    - `stocks`
      - `id` (uuid, primary key)
      - `symbol` (text, unique) - Stock ticker symbol (e.g., AAPL, GOOGL)
      - `name` (text) - Company name
      - `created_at` (timestamptz) - When the stock was added
    
    - `stock_prices`
      - `id` (uuid, primary key)
      - `stock_id` (uuid, foreign key to stocks)
      - `price` (numeric) - Stock price
      - `volume` (bigint) - Trading volume
      - `timestamp` (timestamptz) - Price timestamp
      - `created_at` (timestamptz) - Record creation time
    
    - `stock_predictions`
      - `id` (uuid, primary key)
      - `stock_id` (uuid, foreign key to stocks)
      - `predicted_price` (numeric) - Predicted price
      - `prediction_date` (timestamptz) - Date of prediction
      - `confidence` (numeric) - Confidence score (0-100)
      - `created_at` (timestamptz) - When prediction was made

  2. Security
    - Enable RLS on all tables
    - Allow public read access to stock data (this is public market data)
    - No insert/update/delete for anonymous users (data managed by edge functions)
*/

CREATE TABLE IF NOT EXISTS stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id uuid NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  price numeric NOT NULL,
  volume bigint DEFAULT 0,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id uuid NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  predicted_price numeric NOT NULL,
  prediction_date timestamptz NOT NULL,
  confidence numeric DEFAULT 75,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_prices_stock_id ON stock_prices(stock_id);
CREATE INDEX IF NOT EXISTS idx_stock_prices_timestamp ON stock_prices(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_stock_predictions_stock_id ON stock_predictions(stock_id);

ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to stocks"
  ON stocks FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to stock prices"
  ON stock_prices FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to stock predictions"
  ON stock_predictions FOR SELECT
  TO anon
  USING (true);