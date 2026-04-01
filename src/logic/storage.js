const TX_KEY = 'fund_desk_transactions';
const PRICE_KEY = 'fund_desk_prices';
const NAV_KEY = 'fund_desk_initial_navs';

export function saveTransactions(txs) {
  localStorage.setItem(TX_KEY, JSON.stringify(txs));
}

export function loadTransactions() {
  const data = localStorage.getItem(TX_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePrices(prices) {
  localStorage.setItem(PRICE_KEY, JSON.stringify(prices));
}

export function loadPrices() {
  const data = localStorage.getItem(PRICE_KEY);
  return data ? JSON.parse(data) : {};
}

export function saveInitialNavs(navs) {
  localStorage.setItem(NAV_KEY, JSON.stringify(navs));
}

export function loadInitialNavs() {
    const data = localStorage.getItem(NAV_KEY);
    return data ? JSON.parse(data) : {
      'Tự doanh': 10000000000,
      'QTN': 10000000000,
      'QNV': 10000000000
    };
}

export function clearData() {
  localStorage.clear();
}
