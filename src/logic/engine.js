import { format, addDays, isBefore, parseISO, subDays, differenceInDays } from 'date-fns';

export const PAR_VALUE = 10000;
export const DIVIDEND_TAX_RATE = 0.05;
export const MARGIN_INTEREST_RATE = 0.09; // 9% per year

/**
 * Core engine to derive portfolio state from transactions and market prices.
 */
export function derivePortfolioState(transactions, marketPrices, initialNavMap = {}, targetDateStr = null) {
  const targetDate = targetDateStr ? parseISO(targetDateStr) : new Date();
  
  // Sort transactions by trade date
  const sortedTx = [...transactions].sort((a, b) => 
    parseISO(a.tradeDate).getTime() - parseISO(b.tradeDate).getTime()
  );

  const portfolios = {}; 

  sortedTx.forEach(tx => {
    const txDate = parseISO(tx.tradeDate);
    if (isBefore(targetDate, txDate) && targetDateStr) return;

    if (!portfolios[tx.portfolio]) {
      portfolios[tx.portfolio] = {
        name: tx.portfolio,
        holdings: {},
        netCash: initialNavMap[tx.portfolio] || 0,
        totalInvested: initialNavMap[tx.portfolio] || 0, // Track capital flow
        marginInterestAccrued: 0,
        lastUpdateDate: txDate,
        realizedPnL: 0
      };
    }

    const p = portfolios[tx.portfolio];
    
    // Calculate margin interest from last transaction date to current tx date
    const daysGap = differenceInDays(txDate, p.lastUpdateDate);
    if (daysGap > 0 && p.netCash < 0) {
      const dailyInterest = Math.abs(p.netCash) * (MARGIN_INTEREST_RATE / 365) * daysGap;
      p.marginInterestAccrued += dailyInterest;
    }
    p.lastUpdateDate = txDate;

    const ticker = tx.ticker;
    if (ticker && !p.holdings[ticker]) {
      p.holdings[ticker] = { qty: 0, avgPrice: 0, totalCost: 0, dividendShares: 0, realizedPnL: 0 };
    }
    const h = ticker ? p.holdings[ticker] : null;

    switch (tx.type) {
      case 'DEPOSIT':
        p.netCash += (tx.price || 0);
        p.totalInvested += (tx.price || 0); // Include in performance base
        break;
      
      case 'WITHDRAW':
        p.netCash -= (tx.price || 0);
        p.totalInvested -= (tx.price || 0); // Reflect withdrawal
        break;

      case 'BUY':
        const buyValue = tx.qty * tx.price;
        const totalBuyCost = buyValue + (tx.fee || 0);
        h.avgPrice = (h.totalCost + totalBuyCost) / (h.qty + tx.qty);
        h.qty += tx.qty;
        h.totalCost += totalBuyCost;
        p.netCash -= (totalBuyCost + (tx.tax || 0));
        break;

      case 'SELL':
        const sellValue = tx.qty * tx.price;
        const costOfSold = tx.qty * h.avgPrice;
        
        let divTax = 0;
        if (h.dividendShares > 0) {
          const soldDivShares = Math.min(tx.qty, h.dividendShares);
          divTax = soldDivShares * PAR_VALUE * DIVIDEND_TAX_RATE;
          h.dividendShares -= soldDivShares;
        }

        const netSellProceeds = sellValue - (tx.fee || 0) - (tx.tax || 0) - divTax;
        const gain = netSellProceeds - costOfSold;

        h.qty -= tx.qty;
        h.totalCost -= costOfSold;
        h.realizedPnL += gain;
        p.realizedPnL += gain;
        p.netCash += netSellProceeds;
        break;

      case 'DIV_CASH':
        const eligibilityDate = subDays(txDate, 1);
        const qtyAtT = getQtyAtDate(sortedTx, tx.portfolio, ticker, eligibilityDate);
        const totalCashDiv = qtyAtT * tx.price;
        const netCashDiv = totalCashDiv * (1 - DIVIDEND_TAX_RATE);
        p.netCash += netCashDiv;
        h.totalCost -= (qtyAtT * tx.price);
        if (h.qty > 0) h.avgPrice = h.totalCost / h.qty;
        break;

      case 'DIV_STOCK':
        h.qty += tx.qty;
        h.dividendShares += tx.qty;
        if (h.qty > 0) h.avgPrice = h.totalCost / h.qty;
        break;
    }
  });

  // Final margin interest calculation up to today
  Object.values(portfolios).forEach(p => {
    const finalDaysGap = differenceInDays(targetDate, p.lastUpdateDate);
    if (finalDaysGap > 0 && p.netCash < 0) {
      const dailyInterest = Math.abs(p.netCash) * (MARGIN_INTEREST_RATE / 365) * finalDaysGap;
      p.marginInterestAccrued += dailyInterest;
    }
    
    p.equityValue = 0;
    p.bondValue = 0;
    p.warrantValue = 0;
    
    Object.keys(p.holdings).forEach(ticker => {
      const h = p.holdings[ticker];
      const mktPrice = marketPrices[ticker] || 0;
      h.marketPrice = mktPrice;
      h.marketValue = h.qty * mktPrice;
      h.unrealizedPnL = h.marketValue - h.totalCost;
      h.isOpen = h.qty > 0;
      if (h.isOpen) {
        p.equityValue += h.marketValue;
      }
    });

    p.cashAvailable = p.netCash > 0 ? p.netCash : 0;
    p.marginDebt = p.netCash < 0 ? Math.abs(p.netCash) : 0;
    p.nav = p.equityValue + p.netCash + p.bondValue + p.warrantValue - p.marginInterestAccrued;
    
    Object.values(p.holdings).forEach(h => {
      h.weight = p.nav > 0 ? (h.marketValue / p.nav) * 100 : 0;
    });

    p.weights = {
      equity: p.nav > 0 ? (p.equityValue / p.nav) * 100 : 0,
      bond: p.nav > 0 ? (p.bondValue / p.nav) * 100 : 0,
      cash: p.nav > 0 ? (p.cashAvailable / p.nav) * 100 : 0,
      margin: p.nav > 0 ? (p.marginDebt / p.nav) * 100 : 0,
    };
  });

  return portfolios;
}

function getQtyAtDate(sortedTx, portfolio, ticker, date) {
  let qty = 0;
  for (const tx of sortedTx) {
    if (isBefore(date, parseISO(tx.tradeDate))) break;
    if (tx.portfolio === portfolio && tx.ticker === ticker) {
      if (tx.type === 'BUY') qty += tx.qty;
      if (tx.type === 'SELL') qty -= tx.qty;
      if (tx.type === 'DIV_STOCK') qty += tx.qty;
    }
  }
  return qty; 
}
