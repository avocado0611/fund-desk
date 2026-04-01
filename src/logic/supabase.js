import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cnjckhcapmdblrqzikyk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuamNraGNhcG1kYmxycXppa3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNDM5NzUsImV4cCI6MjA5MDYxOTk3NX0.fjLkjV0O2Es7R32yGesd-ZzrAtmVGqzLr4XBj0jrzxo'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Lấy dữ liệu quỹ dựa trên mã Access Code
 */
export async function getPortfolioByCode(accessCode) {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('access_code', accessCode)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching portfolio:', error);
    return null;
  }
  return data;
}

/**
 * Cập nhật dữ liệu lên Cloud
 */
export async function syncToCloud(id, updates) {
  const { error } = await supabase
    .from('portfolios')
    .update({ ...updates, updated_at: new Date() })
    .eq('id', id);

  if (error) {
    console.error('Error syncing to cloud:', error);
  }
}

/**
 * Tạo mới một quỹ (nếu mã code chưa tồn tại)
 */
export async function createPortfolio(accessCode) {
  const { data, error } = await supabase
    .from('portfolios')
    .insert([
      { 
        access_code: accessCode, 
        transactions: [], 
        initial_navs: { 'Tự doanh': 10000000000, 'QTN': 10000000000, 'QNV': 10000000000 }, 
        market_prices: {} 
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating portfolio:', error);
    return null;
  }
  return data;
}
