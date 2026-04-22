import { format, addDays, addBusinessDays, isBefore, parseISO, subDays, differenceInDays, isSameDay } from 'date-fns';

export const PAR_VALUE = 10000;
export const DIVIDEND_TAX_RATE = 0.05;
export const MARGIN_INTEREST_RATE = 0.09; // 9% per year

const CORPORATE_ACTIONS = ['DIV_CASH', 'DIV_STOCK', 'BONUS_STOCK', 'RIGHT_ISSUE', 'STOCK_SPLIT', 'REVERSE_SPLIT'];

/**
 * Core engine to derive portfolio state from transactions and market prices.
 */
export function derivePortfolioState(transactions, marketPrices, initialNavMap = {}, targetDateStr = null) {
  const targetDate = targetDateStr ? parseISO(targetDateStr) : new Date();
  
  // Convert transactions into sequence of events
  const events = [];
  transactions.forEach(tx => {
    const tradeDate = parseISO(tx.tradeDate);
    const settlementDate = tx.settlementDate ? parseISO(tx.settlementDate) : tradeDate;

    if (CORPORATE_ACTIONS.includes(tx.type)) {
      events.push({ date: tradeDate, type: `${tx.type}_EX`, tx });
      events.push({ date: settlementDate, type: `${tx.type}_SETTLE`, tx });
    } else if (tx.type === 'BUY') {
      events.push({ date: tradeDate, type: 'BUY', tx });
      // Settlement of Buy (T+2 Business Days)
      events.push({ date: addBusinessDays(tradeDate, 2), type: 'BUY_SETTLE', tx });
    } else {
      events.push({ date: tradeDate, type: tx.type, tx });
    }
  });

  const sortedEvents = events.sort((a, b) => {
    const diff = a.date.getTime() - b.date.getTime();
    if (diff !== 0) return diff;
    
    const priority = {
      'DEPOSIT': 1,
      'WITHDRAW': 1,
      'BUY': 2,
      'SELL': 2,
      'DIV_CASH_EX': 0,
      'DIV_STOCK_EX': 0,
      'BONUS_STOCK_EX': 0,
      'RIGHT_ISSUE_EX': 0,
      'STOCK_SPLIT_EX': 0,
      'REVERSE_SPLIT_EX': 0,
      'BUY_SETTLE': 6,
      'DIV_CASH_SETTLE': 5,
      'DIV_STOCK_SETTLE': 5,
      'BONUS_STOCK_SETTLE': 5,
      'RIGHT_ISSUE_SETTLE': 5,
      'STOCK_SPLIT_SETTLE': 5,
      'REVERSE_SPLIT_SETTLE': 5
    };
    return (priority[a.type] || 3) - (priority[b.type] || 3);
  });

  const portfolios = {}; 
  const corpActionState = {}; 

  sortedEvents.forEach(event => {
    const { date, type, tx } = event;
    // CRITICAL FIX: Always filter future events relative to targetDate
    if (isBefore(targetDate, date)) return;

    if (!portfolios[tx.portfolio]) {
      portfolios[tx.portfolio] = {
        name: tx.portfolio,
        holdings: {},
        netCash: initialNavMap[tx.portfolio] || 0,
        totalInvested: initialNavMap[tx.portfolio] || 0,
        marginInterestAccrued: 0,
        lastUpdateDate: date,
        realizedPnL: 0
      };
    }

    const p = portfolios[tx.portfolio];
    
    const daysGap = differenceInDays(date, p.lastUpdateDate);
    if (daysGap > 0 && p.netCash < 0) {
      const dailyInterest = Math.abs(p.netCash) * (MARGIN_INTEREST_RATE / 365) * daysGap;
      p.marginInterestAccrued += dailyInterest;
    }
    p.lastUpdateDate = date;

    const ticker = tx.ticker;
    if (ticker && !p.holdings[ticker]) {
      p.holdings[ticker] = { 
        qty: 0, 
        availableQty: 0, 
        avgPrice: 0, 
        totalCost: 0, 
        dividendShares: 0, 
        realizedPnL: 0,
        t0: 0,
        t1: 0,
        t2: 0
      };
    }
    const h = ticker ? p.holdings[ticker] : null;

    switch (type) {
      case 'DEPOSIT':
        p.netCash += (tx.price || 0);
        p.totalInvested += (tx.price || 0);
        break;
      case 'WITHDRAW':
        p.netCash -= (tx.price || 0);
        p.totalInvested -= (tx.price || 0);
        break;

      case 'BUY':
        const buyValue = tx.qty * tx.price;
        const totalBuyCost = buyValue + (tx.fee || 0);
        h.avgPrice = (h.totalCost + totalBuyCost) / (h.qty + tx.qty);
        h.qty += tx.qty;
        h.totalCost += totalBuyCost;
        p.netCash -= (totalBuyCost + (tx.tax || 0));
        
        // Track Pending Status (at the time of the event)
        // This will be refined in the final holdings loop
        break;

      case 'BUY_SETTLE':
        h.availableQty += tx.qty;
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
        h.availableQty -= tx.qty;
        h.totalCost -= costOfSold;
        h.realizedPnL += gain;
        p.realizedPnL += gain;
        p.netCash += netSellProceeds;
        break;

      case 'DIV_CASH_EX':
        corpActionState[tx.id] = h.qty;
        h.totalCost -= (h.qty * (tx.price || 0));
        if (h.qty > 0) h.avgPrice = h.totalCost / h.qty;
        break;

      case 'DIV_STOCK_EX':
      case 'BONUS_STOCK_EX':
        corpActionState[tx.id] = h.qty;
        const b = tx.ratio || 0;
        if (b > 0) {
            h.avgPrice = h.avgPrice / (1 + b);
            h.totalCost = h.avgPrice * h.qty; 
        }
        break;

      case 'RIGHT_ISSUE_EX':
        corpActionState[tx.id] = h.qty;
        const a = tx.ratio || 0;
        const Pa = tx.price || 0;
        if (a > 0) {
            h.avgPrice = (h.avgPrice + Pa * a) / (1 + a);
            h.totalCost = h.avgPrice * h.qty;
        }
        break;

      case 'DIV_CASH_SETTLE':
        const eligCash = corpActionState[tx.id] || 0;
        p.netCash += eligCash * (tx.price || 0) * (1 - DIVIDEND_TAX_RATE);
        break;

      case 'DIV_STOCK_SETTLE':
      case 'BONUS_STOCK_SETTLE':
        const eligStock = corpActionState[tx.id] || 0;
        const addQty = eligStock * (tx.ratio || 0);
        h.qty += addQty;
        h.availableQty += addQty;
        h.dividendShares += addQty;
        h.totalCost = h.avgPrice * h.qty;
        break;

      case 'RIGHT_ISSUE_SETTLE':
        const eligRight = corpActionState[tx.id] || 0;
        const addRightQty = eligRight * (tx.ratio || 0);
        h.qty += addRightQty;
        h.availableQty += addRightQty;
        p.netCash -= addRightQty * (tx.price || 0);
        h.totalCost = h.avgPrice * h.qty;
        break;

      case 'STOCK_SPLIT_EX':
        corpActionState[tx.id] = h.qty;
        if (tx.ratio > 1) {
            h.avgPrice = h.avgPrice / tx.ratio;
            h.totalCost = h.avgPrice * h.qty;
        }
        break;

      case 'STOCK_SPLIT_SETTLE':
        const eligSplit = corpActionState[tx.id] || 0;
        const splitAdd = eligSplit * (tx.ratio - 1);
        h.qty += splitAdd;
        h.availableQty += splitAdd;
        h.totalCost = h.avgPrice * h.qty;
        break;
    }
  });

  // Calculate Settlement breakdown (T, T+1) for the targetDate
  Object.values(portfolios).forEach(p => {
    Object.keys(p.holdings).forEach(ticker => {
      const h = p.holdings[ticker];
      
      // Calculate T, T+1 from transactions
      // T = buys on targetDate
      // T+1 = buys on targetDate - 1 business day
      const tDate = targetDate;
      const tMinus1 = addBusinessDays(tDate, -1);
      
      let t0_qty = 0;
      let t1_qty = 0;
      
      transactions.forEach(tx => {
        if (tx.portfolio === p.name && tx.ticker === ticker && tx.type === 'BUY') {
            const txDate = parseISO(tx.tradeDate);
            if (isSameDay(txDate, tDate)) t0_qty += tx.qty;
            if (isSameDay(txDate, tMinus1)) t1_qty += tx.qty;
        }
      });
      
      h.t0 = t0_qty;
      h.t1 = t1_qty;
      h.pendingQty = h.qty - h.availableQty;

      const mktPrice = marketPrices[ticker] || 0;
      h.marketPrice = mktPrice;
      h.marketValue = h.qty * mktPrice;
      h.unrealizedPnL = h.marketValue - h.totalCost;
      h.isOpen = h.qty > 0;
    });

    p.cashAvailable = p.netCash > 0 ? p.netCash : 0;
    p.marginDebt = p.netCash < 0 ? Math.abs(p.netCash) : 0;
    p.nav = p.equityValue + p.netCash - p.marginInterestAccrued;
    
    // Recalculate p.equityValue since it might have changed
    p.equityValue = Object.values(p.holdings).reduce((sum, h) => sum + (h.isOpen ? h.marketValue : 0), 0);
    p.nav = p.equityValue + p.netCash - p.marginInterestAccrued;

    Object.values(p.holdings).forEach(h => {
      h.weight = p.nav > 0 ? (h.marketValue / p.nav) * 100 : 0;
    });
  });

  return portfolios;
}
