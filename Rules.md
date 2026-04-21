## 1. Nguyên tắc hệ thống (Core Principles)

### 1.1 Ledger-based (Gốc sổ cái) - QUAN TRỌNG NHẤT
- **Source of Truth**: Transactions (Giao dịch) là nguồn dữ liệu duy nhất và cuối cùng.
- **Derived Data**: Các chỉ số như Holdings (Vị thế), NAV, P&L là dữ liệu được tính toán lại từ các giao dịch.
- **Không lưu cứng**: Hệ thống không lưu trữ giá trị ĐGBQ, P&L, hay Holdings vào DB; mọi thứ được recompute từ timeline giao dịch.

### 1.2 Event-driven Calculation
Toàn bộ hệ thống được tính toán dựa trên dòng thời gian (Timeline):
`Transactions -> Positions -> Market Value -> NAV`

Tách biệt rõ ràng:
- **Transactions**: Dữ liệu gốc (giao dịch thực hiện).
- **Positions**: Vị thế hiện tại của danh mục.
- **Cash Ledger**: Quản lý dòng tiền.
- **NAV**: Tổng hợp giá trị tài sản ròng cuối cùng.

## 2. Logic nghiệp vụ chuẩn

### 2.1 Đơn giá bình quân (ĐGBQ)
- Phương pháp: **Bình quân gia quyền di động (Moving Average)**.
- Được tính toán lại hoàn toàn từ dữ liệu giao dịch (**KHÔNG** lưu vào DB).
- Đảm bảo tính nhất quán khi có thay đổi trong quá khứ.

### 2.2 Phân loại trạng thái
**Position Status**:
- **Open**: Đang nắm giữ (Số lượng > 0).
- **Closed**: Đã bán hết (Số lượng = 0).

### 2.3 Chu kỳ thanh toán (Settlement Cycle)
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

### 2.4 Xử lý Sự kiện quyền (Corporate Actions)
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

### 2.5 Thuế và Phí
- **Thuế bán (Tax)**: Thường là 0.1% trên giá trị giao dịch bán.
- **Thuế cổ tức (Dividend Tax)**: 5% đối với cổ tức tiền mặt (DIV_CASH) và cổ tức cổ phiếu (DIV_STOCK)
- **Phí giao dịch (Fee)**: Phí trả cho công ty chứng khoán, tùy mỗi công ty sẽ có mức phí khác nhau (ví dụ: 0.1% - 0.2%).
- **Xử lý**: Phí và Thuế mua được cộng vào giá vốn. Thuế và Phí bán được trừ vào số tiền thực nhận.
