# Project Recipe: Fund-Desk Mini PMS

### ● Project One-liner
An automated, ledger-based mini Portfolio Management System (PMS) designed for precise institutional-grade accounting.

### ● Project Background (Why you built this)
The project originated from the challenges of managing 10+ investment portfolios manually via Excel. Calculating Moving Average prices, NAV, and realized/unrealized P&L for multiple accounts was highly error-prone, especially when dealing with backdated entries and complex Vietnamese stock market rules.

### ● Implementation Goal (Core Feature)
The primary goal was to implement a **Ledger-based "Source of Truth"** system. Instead of storing static balances, the engine recomputes every metric (Holdings, NAV, P&L) directly from the transaction timeline, ensuring 100% data integrity and auditability.

### ● Current Progress (Status)
**Beta v1.0 Released**. The system successfully handles the full T+2 settlement cycle, automated dividend adjustments, and historical NAV snapshotting. Branding has been professionalized, and the system is ready for real-world accounting.

### ● 1–2 Key Features
- **Smart Corporate Action Engine**: Automatically recalibrates Average Cost across historical events like cash dividends (DIV_CASH) and stock dividends (DIV_STOCK), including the mandatory 5% tax at source for the Vietnamese market.
- **Dynamic Ledger Modes**: Toggles between three specialized views: Ticker-based analysis, a full historical Event Timeline, and a Daily NAV performance tracker.

### ● Service Structure (Simple flow / architecture)
The architecture follows an **Event-Driven Calculation** model:
`Transactions (Input) -> Ledger Engine (Recompute) -> State Derivation (NAV/Holdings) -> Frontend Presentation (Recharts/Tables)`.
Data is securely persisted in Supabase, but business logic lives in the derivation layer to allow for instant recalculations of the entire portfolio history.

### ● Tech Stack
- **Frontend**: React.js, Vite
- **Backend/DB**: Supabase (PostgreSQL)
- **Data Visualization**: Recharts, date-fns
- **UI Architecture**: Monospace-heavy typography for accounting precision, Navy/Gold institutional color palette.

### ● Troubleshooting (Problem-solving process)
**The Challenge**: Preventing "Artificial NAV Dips" on Ex-Dividend dates. When a stock price drops due to a dividend, the NAV would appear to fall if the corresponding "Pending Quantity" isn't recorded at the exact same moment.
**The Solution**: We developed an **Ex-Date Awareness** logic in the Ledger Engine. It recognizes pending assets as "Dividend Receivables" from the Ex-Date onwards, ensuring the NAV remains consistent and accurate during market adjustments before the actual settlement date.
