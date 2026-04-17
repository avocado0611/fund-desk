# Fund-Desk: Portfolio Accounting Tool (Mini PMS)

## 1. Mục đích (Why)

### Vấn đề
- **Quản lý thủ công**: Kế toán quỹ đang quản lý 10+ danh mục bằng Excel.
- **Tính toán phức tạp**: Các chỉ số như Đơn giá bình quân (ĐGBQ), P&L, NAV hàng ngày được tính thủ công, dễ dẫn đến sai sót.
- **Các trường hợp đặc biệt**: Dễ sai khi có cổ tức cổ phiếu (DIV_STOCK), nhiều giao dịch cùng mã, hoặc khi có các giao dịch backdate/chỉnh sửa.

### Mục tiêu sản phẩm
Xây dựng hệ thống **Fund-Desk** (Portfolio Accounting Tool - mini PMS) nhằm:
- **Tự động hóa**: Toàn bộ quá trình tính toán đều được tự động hóa.
- **Chính xác tuyệt đối**: Đảm bảo NAV & P&L luôn chính xác theo thời gian thực hoặc theo dữ liệu lịch sử.
- **Khả năng kiểm chứng (Auditability)**: Mọi con số đều có thể trace ngược lại từng giao dịch cụ thể.

## 2. Người dùng (Who)
- **Kế toán quỹ / kế toán danh mục**: Những người phụ trách quản lý tài sản và báo cáo hiệu quả đầu tư.
- **Đặc điểm**: Thành thạo Excel, quen thuộc với định dạng CSV, làm việc trên PC (ưu tiên màn hình lớn để xem bảng biểu).

## 3. Nguyên tắc hệ thống (Core Principles)

### 3.1 Ledger-based (Gốc sổ cái) - QUAN TRỌNG NHẤT
- **Source of Truth**: Transactions (Giao dịch) là nguồn dữ liệu duy nhất và cuối cùng.
- **Derived Data**: Các chỉ số như Holdings (Vị thế), NAV, P&L là dữ liệu được tính toán lại từ các giao dịch.
- **Không lưu cứng**: Hệ thống không lưu trữ giá trị ĐGBQ, P&L, hay Holdings vào DB; mọi thứ được recompute từ timeline giao dịch.

### 3.2 Event-driven Calculation
Toàn bộ hệ thống được tính toán dựa trên dòng thời gian (Timeline):
`Transactions -> Positions -> Market Value -> NAV`

Tách biệt rõ ràng:
- **Transactions**: Dữ liệu gốc (giao dịch thực hiện).
- **Positions**: Vị thế hiện tại của danh mục.
- **Cash Ledger**: Quản lý dòng tiền.
- **NAV**: Tổng hợp giá trị tài sản ròng cuối cùng.

## 4. Tính năng cốt lõi (MVP)

### 4.1 Nhập giao dịch
Hỗ trợ các loại hình:
- **BUY**: Mua cổ phiếu.
- **SELL**: Bán cổ phiếu.
- **DIV_CASH**: Nhận cổ tức bằng tiền mặt.
- **DIV_STOCK**: Nhận cổ tức bằng cổ phiếu.

**Input fields**:
- Danh mục (Portfolio)
- Mã CK (Ticker)
- Số lượng (Qty)
- Giá (Price)
- Phí (Fee)
- Thuế (Tax)
- Ngày giao dịch (Trade Date)
- Ngày thanh toán (Settlement Date)

### 4.2 Import giá cuối ngày
Hệ thống cho phép cập nhật giá thị trường qua file hoặc input:
`Ticker | Close Price | Date`

### 4.3 Dashboard tổng hợp
- Hiển thị NAV của tất cả các danh mục.
- Tỷ lệ % cổ phiếu / NAV.
- Tỷ lệ Cash (Tiền mặt).

### 4.4 Sổ cái danh mục (Trang 4 - Core Feature)
Chi tiết từng giao dịch và biến động của danh mục.

## 5. Logic nghiệp vụ chuẩn

### 5.1 Đơn giá bình quân (ĐGBQ)
- Phương pháp: **Bình quân gia quyền di động (Moving Average)**.
- Được tính toán lại hoàn toàn từ dữ liệu giao dịch (**KHÔNG** lưu vào DB).
- Đảm bảo tính nhất quán khi có thay đổi trong quá khứ.

### 5.2 Phân loại trạng thái
**Position Status**:
- **Open**: Đang nắm giữ (Số lượng > 0).
- **Closed**: Đã bán hết (Số lượng = 0).

### 5.2 Chu kỳ thanh toán (Settlement Cycle)
Hệ thống tuân thủ quy tắc thanh toán **T+2** của thị trường chứng khoán Việt Nam:

- **Quy tắc đếm ngày**:
  - T là ngày giao dịch (Trade Date).
  - Chỉ tính các ngày làm việc (Thứ 2 đến Thứ 6).
  - Loại trừ Thứ 7, Chủ nhật và các ngày nghỉ lễ theo quy định của Nhà nước.

- **Đối với lệnh MUA (BUY)**:
  - Ngày T: Tiền bị trừ ngay lập tức, cổ phiếu ở trạng thái **Pending (Chờ về)**.
  - Chiều ngày T+2: Cổ phiếu chính thức về tài khoản và chuyển sang trạng thái **Available (Khả dụng)** để có thể bán.

- **Đối với lệnh BÁN (SELL)**:
  - Ngày T: Cổ phiếu bị trừ ngay lập tức, tiền ở trạng thái **Cash Pending (Tiền chờ về)**.
  - Chiều ngày T+2: Tiền chính thức về tài khoản và chuyển sang trạng thái **Cash Available (Tiền mặt)** để có thể rút hoặc mua mã mới.

- **Trạng thái giao dịch (Settlement Status)**:
  - **Pending**: Giao dịch trong thời gian chờ thanh toán (T, T+1, sáng T+2).
  - **Settled**: Giao dịch đã hoàn tất thanh toán (sau chiều T+2).

### 5.3 Xử lý Sự kiện quyền (Corporate Actions)
Toàn bộ các sự kiện quyền đều dựa trên **Ngày Giao dịch không hưởng quyền (Ex-Date)** để tính toán số lượng/giá điều chỉnh.

- **Cổ tức tiền mặt (DIV_CASH)**:
  - **Tác động**: Tăng dòng tiền (`Cash`).
  - **ĐGBQ**: Điều chỉnh giảm tương ứng với số tiền cổ tức nhận được (để khớp với việc giá thị trường bị điều chỉnh giảm vào ngày Ex-Date).
  - **Công thức**: `ĐGBQ_mới = ĐGBQ_cũ - (Tỷ_lệ_cổ_tức * 10.000)`.
  - **Ghi nhận**: Tại ngày thanh toán (Settlement Date), tiền sẽ vào tài khoản.

- **Cổ tức cổ phiếu (DIV_STOCK) & Cổ phiếu thưởng (BONUS_STOCK)**:
  - **Tác động**: Tăng số lượng nắm giữ (`Qty`). `Cash = 0`.
  - **ĐGBQ**: Giảm xuống theo tỷ lệ.
  - **Công thức**: `ĐGBQ_mới = Total_Cost / (Qty_cũ + Qty_thêm)`.
  - **Trạng thái**: Số lượng tăng ngay tại Ex-Date nhưng ở trạng thái "Chờ về" (Pending Qty) cho đến khi chính thức giao dịch.

- **Quyền mua ưu đãi (RIGHT_ISSUE)**:
  - **Tác động**: Cổ đông có quyền mua thêm cổ phiếu với giá ưu đãi.
  - **Dòng tiền**: Giảm `Cash` khi thực hiện quyền (Exercise).
  - **ĐGBQ**: Thay đổi dựa trên số tiền nộp thêm.
  - **Công thức**: `ĐGBQ_mới = (Total_Cost + Qty_mua * Giá_mua) / (Qty_cũ + Qty_mua)`.
  - **Ghi nhận**: Số lượng tăng ngay tại Ex-Date nhưng ở trạng thái "Chờ về" (Pending Qty) cho đến khi chính thức giao dịch.

- **Tách/Gộp cổ phiếu (STOCK_SPLIT / REVERSE_SPLIT)**:
  - **Tác động**: Thay đổi số lượng (`Qty`) theo tỷ lệ, `Total_Cost` không đổi.
  - **ĐGBQ**: Thay đổi tỷ lệ nghịch với số lượng.
  - **Công thức**: `Qty_mới = Qty_cũ * Tỷ_lệ`; `ĐGBQ_mới = ĐGBQ_cũ / Tỷ_lệ`.
  - **Trạng thái**: Cổ phiếu thường được giao dịch lại rất nhanh (thường là T hoặc T+1 sau ngày điều chỉnh).

### 5.4 Thuế và Phí
- **Thuế bán (Tax)**: Thường là 0.1% trên giá trị giao dịch bán.
- **Thuế cổ tức (Dividend Tax)**: 5% đối với cổ tức tiền mặt (DIV_CASH) và có thể phát sinh khi bán cổ phiếu nhận từ cổ tức (tùy quy định từng thời kỳ).
- **Phí giao dịch (Fee)**: Phí trả cho công ty chứng khoán, tùy mỗi công ty sẽ có mức phí khác nhau (ví dụ: 0.1% - 0.2%).
- **Xử lý**: Phí và Thuế mua được cộng vào giá vốn. Thuế và Phí bán được trừ vào số tiền thực nhận.

## 6. Sổ cái danh mục (Trang 4 - Chi tiết)

### 6.1 UI Header
- **Tên danh mục — Mã tài khoản**.
- Style: Nền vàng `#FFD600`, Chữ đen đậm.

### 6.2 Bảng Holdings (Position Table)
Các cột thông tin:
- STT, Ticker.
- **Số lượng** (màu đỏ).
- Khả dụng.
- **Avg Price** (màu đỏ).
- Cost Value, Market Price, Market Value.
- Unrealized P&L, Unrealized %.
- Realized P&L.
- Weight (% NAV).

**Công thức**:
- `Cost Value = Avg Price * Qty`
- `Market Value = Market Price * (Qty_Available + Qty_Pending)`
- `Unrealized P&L = Market Value - Cost Value`
- `Weight = Market Value / NAV`

**Lưu ý về Cổ phiếu chờ về (Pending Qty)**:
- Ngay tại ngày Ex-Date, hệ thống phải ghi nhận `Qty_Pending` để đảm bảo NAV không bị sụt giảm ảo (do giá thị trường đã điều chỉnh giảm ngay tại ngày này).

### 6.3 NAV Box (Enhanced View)
Hiển thị tổng quát tài sản:
- Market Value (Equity).
- Cash Available.
- Cash Pending (T+2).
- Bond Value (Trái phiếu).
- Dividend Receivable (Cổ tức chờ về).
- **NAV Current** (Highlight: nền đỏ, chữ trắng).
- NAV Previous, Daily P&L, Daily %.
- Cash / NAV, Equity / NAV.

### 6.4 Transaction Ledger Modes
Hỗ trợ 3 chế độ chuyển đổi (Toggle):
- **Mode A: Theo mã CK**: Phân tách Closed Positions & Open Positions. Buyer/Seller flows.
- **Mode B: Timeline**: Danh sách giao dịch theo thời gian thực (Mới nhất lên đầu). Filter theo ngày, mã, loại, trạng thái.
- **Mode C: NAV Timeline**: Thống kê NAV theo từng ngày. `Date | NAV | Daily P&L | %`.

## 7. Quy tắc hiển thị UI
- **Header**: Vàng `#FFD600`.
- **Table header**: Xanh (Navy) `#1B6CA8`.
- **Section header**: Xanh lơ (Cyan) `#00BCD4`.
- **Số liệu quan trọng**: Số lượng & Giá bình quân hiển thị màu Đỏ.
- **Lãi/Lỗ**: Lãi màu Xanh | Lỗ màu Đỏ.
- **NAV Current**: Nền đỏ, chữ trắng.
- **Typography**: Cần sử dụng font **Monospace** cho các ô dữ liệu số, căn phải (text-align: right) để dễ so sánh.

## 8. Tiêu chí Hoàn thành (DONE Criteria)
1. **Chính xác dữ liệu**: ĐGBQ, Cash Flow, NAV khớp 100% với logic kế toán.
2. **Recompute**: Hệ thống tự động tính lại toàn bộ khi có sửa đổi dữ liệu cũ (Backdate).
3. **UI/UX**: Đáp ứng đầy đủ các bảng biểu, highlight màu sắc và 3 chế độ Toggle.
4. **Logic Separation**: Phân biệt rõ giữa trạng thái Settlement (Thanh toán) và Position (Vị thế).
