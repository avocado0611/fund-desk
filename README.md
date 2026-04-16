# Fund-Desk Portfolio Management System

Fund-Desk is a professional-grade portfolio accounting and performance tracking application designed for investment management. It provides a comprehensive suite of tools to track transactions, monitor real-time (manually triggered) Net Asset Value (NAV), and analyze performance using industry-standard methodologies.

## Key Features

- **NAV Dashboard**: Real-time snapshot of Equity, Bonds, Cash, and Margin positions.
- **Position Holdings**: Detailed breakdown of current holdings with P&L tracking and automated weighted allocation visualization.
- **Performance Analytics**: 
  - **TWR (Time-Weighted Return)**: Measures the investment manager's performance excluding external cash flow impacts.
  - **ROI (Return on Investment)**: Measures actual dollar returns based on total invested capital.
  - **Benchmark Comparison**: Compare performance against VNIndex.
- **Transaction Ledger**: Track all Deposits, Withdrawals, Sells, and Buys with ease.
- **Automated Calculations**: Automatic margin interest accrual (9%/year) and transaction processing.
- **Secure Access Control**: Localized code-based authentication with persistent login state.

## Technology Stack

- **Frontend**: React.js with Vite
- **Database**: Supabase (Real-time data synchronization)
- **Styling**: Vanilla CSS (Custom professional theme)
- **Charts**: Recharts (Pie and Line charts)
- **Data APIs**: VNDIRECT & Vnstock integration for market data.

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/avocado0611/fund-desk.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. **Run the application**:
   ```bash
   npm run dev
   ```

## Design Philosophy

Fund-Desk focuses on a high-density, professional aesthetic that mimics institutional terminal software while remaining accessible and responsive. It prioritizes data integrity and calculation transparency for audit purposes.

---
© 2024 FUND-DESK. All rights reserved.
