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
- Được tính toán lại hoàn toàn từ dữ liệu giao dịch (**KHÔNG** lưu vào DB).
- Đảm bảo tính nhất quán khi có thay đổi trong quá khứ.

### 5.2 Phân loại trạng thái
**Position Status**:
- **Open**: Đang nắm giữ (Số lượng > 0).
- **Closed**: Đã bán hết (Số lượng = 0).

**Settlement Status**:
- **Pending**: Giao dịch chưa thanh toán (Ví dụ: T+2).
- **Settled**: Giao dịch đã thanh toán xong.

### 5.3 Xử lý Cổ tức
- **Cổ tức cổ phiếu (DIV_STOCK)**:
  - Không tạo dòng tiền (Cash = 0).
  - Tăng số lượng nắm giữ.
  - Không thay đổi tổng giá vốn (Total Cost), dẫn đến ĐGBQ giảm xuống.
- **Cổ tức tiền (DIV_CASH)**:
  - Tăng dòng tiền (Cash).
  - Không ảnh hưởng đến ĐGBQ.

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
- `Market Value = Market Price * Qty`
- `Unrealized P&L = Market Value - Cost Value`
- `Weight = Market Value / NAV`

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
