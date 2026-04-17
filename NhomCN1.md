
# **Nhóm chức năng cho Nhân viên phục vụ, thanh toán**


#### 1. Xác định Actors

    1.1.**Tác nhân chính:** Nhân viên : Bao gồm cả vai trò Phục vụ và Thu ngân, thường dùng chung một cấp quyền trên màn hình POS để tối 			ưu thao tác.

    1.2.**Tác nhân phụ :** Hệ thống pha chế (Nhận thông báo tự động) và Hệ thống kho (Tự động trừ nguyên liệu).

#### 2. Các Use Case

  2.1.**UC_1.0 - Đăng nhập hệ thống:** Nhân viên nhập mã PIN hoặc quét thẻ để truy cập vào màn hình POS. (Đây là Use Case nền tảng bắt buộc).

  2.2.**UC_1.1 - Xem sơ đồ bàn:** Nhân viên xem lưới sơ đồ bàn. Hệ thống hiển thị trực quan trạng thái bàn (Trống / Đang có khách) bằng màu sắc theo thời gian thực.

  2.3.**UC_1.2 - Tạo Order (Gọi món):** Nhân viên chọn bàn, mở menu trên màn hình cảm ứng để chọn đồ uống, tùy chỉnh số lượng. Sau khi xác nhận, hệ thống tự động đẩy đơn hàng xuống khu vực pha chế.

  2.4.**UC_1.3 - Thanh toán hóa đơn:** Thu ngân chọn bàn cần tính tiền, kiểm tra lại chi tiết món. Hệ thống tự tính tổng tiền. Thu ngân thao tác chọn phương thức thanh toán (Tiền mặt, Chuyển khoản, Ví điện tử) và ra lệnh in hóa đơn.

  2.5.**UC_1.4 - Gộp bàn / Tách bàn:** Thu ngân thực hiện thao tác chuyển một số món từ bàn này sang bàn khác (Tách bill) hoặc gộp toàn bộ món của hai bàn đang ngồi lại thành một hóa đơn chung (Gộp bill).

#### 3. Các mối quan hệ

  3.1.**Quan hệ Bắt buộc (`<<include>>`):**

- Mọi Use Case thao tác nghiệp vụ (UC_1.1 đến UC_1.4) đều <`<include>>`  **UC_1.0 (Đăng nhập)** .

* Use Case **UC_1.2 (Tạo Order)** `<<include>>` Use Case  **Đẩy thông báo xuống Pha chế** .
* Use Case **UC_1.3 (Thanh toán)** `<<include>>` Use Case  **Cập nhật trạng thái bàn về "Trống"** .

  3.2/**Quan hệ Tùy chọn (`<<extend>>`):**

* Use Case **Thêm ghi chú món (Ít đá, nhiều sữa)** `<<extend>>`  **UC_1.2 (Tạo Order)** . (Chỉ thực hiện khi khách có yêu cầu đặc biệt).
* Use Case **Áp dụng mã khuyến mãi** `<<extend>>`  **UC_1.3 (Thanh toán)** .
