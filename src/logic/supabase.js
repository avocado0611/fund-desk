import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cnjckhcapmdblrqzikyk.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuamNraGNhcG1kYmxycXppa3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNDM5NzUsImV4cCI6MjA5MDYxOTk3NX0.fjLkjV0O2Es7R32yGesd-ZzrAtmVGqzLr4XBj0jrzxo'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Local Storage helpers
const LOCAL_STORAGE_KEY = 'fund_desk_local_portfolios';

function getLocalPortfolios() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Error reading local portfolios', e);
    return {};
  }
}

function saveLocalPortfolios(portfolios) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(portfolios));
  } catch (e) {
    console.error('Error saving local portfolios', e);
  }
}

function getLocalPortfolio(accessCode) {
  const portfolios = getLocalPortfolios();
  if (portfolios[accessCode]) {
    return portfolios[accessCode];
  }
  // If passcode is '123456' and no portfolio exists, seed a default one
  if (accessCode === '123456') {
    const initialCash = 10000000000; // 10B
    const seeded = {
      id: 'local_123456',
      access_code: '123456',
      transactions: [
        {
          id: 1,
          tradeDate: '2026-05-10',
          portfolio: 'Tự doanh',
          type: 'DEPOSIT',
          ticker: 'CASH',
          qty: 1,
          price: 10000000000, // Deposit 10B
          fee: 0,
          tax: 0,
          broker: 'SSI',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          tradeDate: '2026-05-15',
          portfolio: 'Tự doanh',
          type: 'BUY',
          ticker: 'FPT',
          qty: 20000,
          price: 120000, // FPT at 120,000
          fee: 2880000,
          tax: 0,
          broker: 'SSI',
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          tradeDate: '2026-05-20',
          portfolio: 'Tự doanh',
          type: 'BUY',
          ticker: 'VNM',
          qty: 50000,
          price: 70000, // VNM at 70,000
          fee: 5250000,
          tax: 0,
          broker: 'SSI',
          createdAt: new Date().toISOString()
        },
        {
          id: 4,
          tradeDate: '2026-05-25',
          portfolio: 'Tự doanh',
          type: 'DIV_CASH',
          ticker: 'VNM',
          qty: 50000,
          price: 2000, // Div 2,000 per share = 100M
          fee: 0,
          tax: 5000000, // 5% of 100M = 5M tax
          broker: 'SSI',
          createdAt: new Date().toISOString()
        },
        {
          id: 5,
          tradeDate: '2026-06-01',
          portfolio: 'QTN',
          type: 'DEPOSIT',
          ticker: 'CASH',
          qty: 1,
          price: 10000000000,
          fee: 0,
          tax: 0,
          broker: 'SSI',
          createdAt: new Date().toISOString()
        },
        {
          id: 6,
          tradeDate: '2026-06-05',
          portfolio: 'QTN',
          type: 'BUY',
          ticker: 'HPG',
          qty: 100000,
          price: 25000, // HPG at 25,000
          fee: 3750000,
          tax: 0,
          broker: 'SSI',
          createdAt: new Date().toISOString()
        }
      ],
      initial_navs: { 'Tự doanh': initialCash, 'QTN': initialCash, 'QNV': initialCash },
      total_units: { 'Tự doanh': initialCash/10000, 'QTN': initialCash/10000, 'QNV': initialCash/10000 },
      market_prices: { 'FPT': 135000, 'VNM': 72000, 'HPG': 27500 },
      nav_history: [],
      updated_at: new Date().toISOString()
    };
    portfolios[accessCode] = seeded;
    saveLocalPortfolios(portfolios);
    return seeded;
  }
  return null;
}

function saveLocalPortfolio(accessCode, portfolio) {
  const portfolios = getLocalPortfolios();
  portfolios[accessCode] = portfolio;
  saveLocalPortfolios(portfolios);
}

function updateLocalPortfolioById(id, updates) {
  const portfolios = getLocalPortfolios();
  let foundCode = null;
  for (const [code, p] of Object.entries(portfolios)) {
    if (p.id === id) {
      foundCode = code;
      break;
    }
  }
  if (foundCode) {
    portfolios[foundCode] = { ...portfolios[foundCode], ...updates, updated_at: new Date().toISOString() };
    saveLocalPortfolios(portfolios);
  }
}

function createLocalPortfolio(accessCode, portfolio) {
  const portfolios = getLocalPortfolios();
  const id = 'local_' + accessCode;
  const newPortfolio = { ...portfolio, id, updated_at: new Date().toISOString() };
  portfolios[accessCode] = newPortfolio;
  saveLocalPortfolios(portfolios);
  return newPortfolio;
}

/**
 * Lấy dữ liệu quỹ dựa trên mã Access Code
 */
export async function getPortfolioByCode(accessCode) {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('access_code', accessCode)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error fetching portfolio from Supabase:', error);
      }
      return getLocalPortfolio(accessCode);
    }
    if (data) {
      saveLocalPortfolio(accessCode, data);
      return data;
    }
  } catch (err) {
    console.warn('Supabase connection failed, falling back to LocalStorage:', err);
    return getLocalPortfolio(accessCode);
  }
  return null;
}

/**
 * Cập nhật dữ liệu lên Cloud
 */
export async function syncToCloud(id, updates) {
  // Luôn cập nhật local storage để đảm bảo dữ liệu mới nhất
  updateLocalPortfolioById(id, updates);

  try {
    const { error } = await supabase
      .from('portfolios')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id);

    if (error) {
      console.error('Error syncing to cloud:', error);
    }
  } catch (err) {
    console.warn('Supabase connection failed, local updates only:', err);
  }
}

/**
 * Tạo mới một quỹ (nếu mã code chưa tồn tại)
 * Mặc định Initial NAV = 10 tỷ mỗi quỹ
 */
export async function createPortfolio(accessCode) {
  const initialCash = 10000000000;
  const newPortfolio = { 
    access_code: accessCode, 
    transactions: [], 
    initial_navs: { 'Tự doanh': initialCash, 'QTN': initialCash, 'QNV': initialCash }, 
    total_units: { 'Tự doanh': initialCash/10000, 'QTN': initialCash/10000, 'QNV': initialCash/10000 },
    market_prices: {},
    nav_history: []
  };

  try {
    const { data, error } = await supabase
      .from('portfolios')
      .insert([newPortfolio])
      .select()
      .single();

    if (error) {
      console.error('Error creating portfolio on Supabase:', error);
      return createLocalPortfolio(accessCode, newPortfolio);
    }
    if (data) {
      saveLocalPortfolio(accessCode, data);
      return data;
    }
  } catch (err) {
    console.warn('Supabase connection failed, creating portfolio locally:', err);
    return createLocalPortfolio(accessCode, newPortfolio);
  }
  return null;
}
