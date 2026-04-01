/**
 * Logic to fetch real-time and historical market data from Vietnam stock market sources.
 * Using a CORS proxy to ensure it works from the browser.
 */

export async function fetchVnStockPrices(tickers) {
  if (!tickers || tickers.length === 0) return {};

  const tickerList = tickers.join(',');
  const targetUrl = `https://price-api.ssi.com.vn/api/v2/Incremental/StockData?Lookup=${tickerList}`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    const result = JSON.parse(data.contents);
    
    const prices = {};
    if (result && result.data) {
      result.data.forEach(item => {
        if (item.l) {
          prices[item.s] = item.l * 1000;
        }
      });
    }
    return prices;
  } catch (error) {
    console.error('Error fetching prices from VNStock:', error);
    return {};
  }
}

/**
 * Fetch historical VNINDEX price for benchmarking (YTD, MTD, etc.)
 */
export async function fetchHistoricalIndex(symbol = 'VNINDEX', dateStr) {
  // VNDIRECT API for historical prices
  const targetUrl = `https://finfo-api.vndirect.com.vn/v4/stock_prices?symbols=${symbol}&from=${dateStr}&to=${dateStr}`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    const data = await response.json();
    const result = JSON.parse(data.contents);
    
    if (result && result.data && result.data.length > 0) {
      return result.data[0].adClose || result.data[0].close;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching historical ${symbol}:`, error);
    return null;
  }
}
