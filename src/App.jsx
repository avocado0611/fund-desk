import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import NAVDashboard from './components/NAVDashboard';
import HoldingsTable from './components/HoldingsTable';
import TransactionLedger from './components/TransactionLedger';
import MarketPriceManager from './components/MarketPriceManager';
import TransactionForm from './components/TransactionForm';
import AccessGuard from './components/AccessGuard';
import PerformanceChart from './components/PerformanceChart';

import { derivePortfolioState } from './logic/engine';
import { syncToCloud } from './logic/supabase';
import { fetchVnStockPrices, fetchHistoricalIndex } from './logic/vnstock';
import { calculateNewUnits, INITIAL_UNIT_PRICE } from './logic/performance';

function App() {
  const [cloudData, setCloudData] = useState(null); 
  const [activePortfolio, setActivePortfolio] = useState('All');
  const [editingTx, setEditingTx] = useState(null);

  // Sync to cloud whenever data changes
  const updateCloud = async (updates) => {
    if (!cloudData) return;
    const newVersion = { ...cloudData, ...updates };
    setCloudData(newVersion);
    await syncToCloud(cloudData.id, updates);
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có muốn đăng xuất và đổi mã truy cập?')) {
        localStorage.removeItem('sgi_access_code');
        setCloudData(null);
        setActivePortfolio('All');
    }
  };

  // Compute state
  const portfolioData = useMemo(() => {
    if (!cloudData) return null;
    const { transactions, market_prices, initial_navs } = cloudData;
    const allStates = derivePortfolioState(transactions || [], market_prices || {}, initial_navs || {});
    
    if (activePortfolio === 'All') {
      const combined = {
        name: 'All Portfolios',
        holdings: {},
        cash: 0,
        nav: 0,
        equityValue: 0,
        bondValue: 0,
        warrantValue: 0,
        cashAvailable: 0,
        marginDebt: 0,
        marginInterestAccrued: 0,
        realizedPnL: 0,
        totalInvested: 0,
        weights: { equity: 0, bond: 0, cash: 0, margin: 0 }
      };

      Object.values(allStates).forEach(p => {
        combined.cash += p.netCash || 0;
        combined.equityValue += p.equityValue || 0;
        combined.bondValue += p.bondValue || 0;
        combined.warrantValue += p.warrantValue || 0;
        combined.nav += p.nav || 0;
        combined.totalInvested += p.totalInvested || 0;
        combined.marginInterestAccrued += p.marginInterestAccrued || 0;
        combined.realizedPnL += p.realizedPnL || 0;

        Object.entries(p.holdings).forEach(([ticker, h]) => {
          if (!combined.holdings[ticker]) {
            combined.holdings[ticker] = { ...h };
          } else {
            const ch = combined.holdings[ticker];
            const newQty = ch.qty + h.qty;
            const newTotalCost = ch.totalCost + h.totalCost;
            ch.avgPrice = newQty > 0 ? newTotalCost / newQty : 0;
            ch.qty = newQty;
            ch.totalCost = newTotalCost;
            ch.marketValue += h.marketValue;
            ch.unrealizedPnL += h.unrealizedPnL;
            ch.realizedPnL += h.realizedPnL;
          }
        });
      });

      combined.cashAvailable = combined.cash > 0 ? combined.cash : 0;
      combined.marginDebt = combined.cash < 0 ? Math.abs(combined.cash) : 0;

      combined.weights = {
        equity: combined.nav > 0 ? (combined.equityValue / combined.nav) * 100 : 0,
        bond: combined.nav > 0 ? (combined.bondValue / combined.nav) * 100 : 0,
        cash: combined.nav > 0 ? (combined.cashAvailable / combined.nav) * 100 : 0,
        margin: combined.nav > 0 ? (combined.marginDebt / combined.nav) * 100 : 0,
      };

      Object.values(combined.holdings).forEach(h => {
        h.weight = combined.nav > 0 ? (h.marketValue / combined.nav) * 100 : 0;
      });

      return combined;
    }

    return allStates[activePortfolio] || {
      name: activePortfolio,
      holdings: {},
      cashAvailable: 0,
      nav: 0,
      totalInvested: initial_navs[activePortfolio] || 0
    };
  }, [cloudData, activePortfolio]);

  const takeSnapshot = async (currentNav, portfolioName) => {
    if (!cloudData || portfolioName === 'All') return;
    const today = new Date().toISOString().split('T')[0];
    const currentIndex = await fetchHistoricalIndex('VNINDEX', today) || 1250; 
    const unitsObj = cloudData.total_units || {};
    
    // Effective Initial NAV (Committed Capital)
    const effectiveInitial = portfolioData.totalInvested;
    const currentUnits = unitsObj[portfolioName] || (effectiveInitial / INITIAL_UNIT_PRICE);
    const unitValue = currentUnits > 0 ? (currentNav / currentUnits) : INITIAL_UNIT_PRICE;

    const snapshot = {
      date: new Date().toISOString(),
      nav: currentNav,
      unitValue: unitValue,
      vnindex: currentIndex,
      portfolio: portfolioName,
      initialNav: effectiveInitial,
      totalInvested: effectiveInitial
    };
    
    updateCloud({ 
        nav_history: [...(cloudData.nav_history || []), snapshot],
        total_units: { ...unitsObj, [portfolioName]: currentUnits }
    });
  };

  const handleRefreshPrices = async () => {
    const holdingsTickers = Object.keys(portfolioData.holdings).filter(t => portfolioData.holdings[t].qty > 0);
    const existingTickers = Object.keys(cloudData.market_prices || {});
    const allTickers = Array.from(new Set([...holdingsTickers, ...existingTickers]));
    
    if (allTickers.length === 0) return;
    const newPrices = await fetchVnStockPrices(allTickers);
    if (Object.keys(newPrices).length > 0) {
      const updatedPrices = { ...cloudData.market_prices, ...newPrices };
      await updateCloud({ market_prices: updatedPrices });
      if (activePortfolio !== 'All') {
          const allStates = derivePortfolioState(cloudData.transactions, updatedPrices, cloudData.initial_navs);
          takeSnapshot(allStates[activePortfolio].nav, activePortfolio);
      }
    }
  };

  const handleAddTransaction = (newTx) => {
    const updatedTxs = [...(cloudData.transactions || []), newTx];
    updateCloud({ transactions: updatedTxs });
    // Snapshot after a small delay to ensure calc is ready
    setTimeout(() => {
        const allStates = derivePortfolioState(updatedTxs, cloudData.market_prices, cloudData.initial_navs);
        takeSnapshot(allStates[newTx.portfolio].nav, newTx.portfolio);
    }, 500);
  };

  if (!cloudData) return <AccessGuard onAccess={(data) => setCloudData(data)} />;

  const portfolios = ['All', 'Tự doanh', 'QTN', 'QNV'];

  return (
    <div className="App">
      <Header onLogout={handleLogout} />
      
      <main className="container">
        <div className="btn-toggle-group" style={{ marginBottom: '1.5rem' }}>
          {portfolios.map(p => (
            <button key={p} className={`btn-toggle ${activePortfolio === p ? 'active' : ''}`} onClick={() => setActivePortfolio(p)}>
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        <TransactionForm 
            onAdd={handleAddTransaction} 
            onUpdate={(tx) => updateCloud({ transactions: cloudData.transactions.map(t => t.id === tx.id ? tx : t) })}
            editingTx={editingTx}
            onCancelEdit={() => setEditingTx(null)}
        />

        <HoldingsTable holdings={portfolioData.holdings} />

        <NAVDashboard 
            data={portfolioData} 
            onRefresh={handleRefreshPrices} 
            initialNav={activePortfolio === 'All' ? 0 : (portfolioData.totalInvested || 0)}
            onInitialNavChange={(newVal) => {
              const oldVal = cloudData.initial_navs[activePortfolio] || 0;
              const unitsObj = cloudData.total_units || {};
              const currentUnits = unitsObj[activePortfolio] || (oldVal / INITIAL_UNIT_PRICE);
              const { totalUnits } = calculateNewUnits(portfolioData.nav, currentUnits, portfolioData.nav, newVal, oldVal);
              updateCloud({ initial_navs: { ...cloudData.initial_navs, [activePortfolio]: newVal }, total_units: { ...unitsObj, [activePortfolio]: totalUnits } });
            }}
            showInitialNav={activePortfolio !== 'All'}
        />

        <TransactionLedger 
          transactions={activePortfolio === 'All' ? cloudData.transactions : cloudData.transactions.filter(t => t.portfolio === activePortfolio)} 
          onDelete={(id) => updateCloud({ transactions: cloudData.transactions.filter(t => t.id !== id) })}
          onEdit={(tx) => { setEditingTx(tx); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        />

        <MarketPriceManager prices={cloudData.market_prices || {}} onChange={(p) => updateCloud({ market_prices: p })} />

        {activePortfolio !== 'All' && (
            <PerformanceChart 
                history={cloudData.nav_history || []} 
                activePortfolio={activePortfolio} 
            />
        )}
      </main>
    </div>
  );
}

export default App;
