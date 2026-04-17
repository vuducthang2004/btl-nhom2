# A. Nhóm[]() chức năng cho Nhân viên pha chế (Barista)

1. Tác nhân chính: Nhân viên pha chế (Barista): Người trực tiếp tiếp nhận đơn hàng từ hệ thống POS và thực hiện pha chế đồ uống.
   Tác nhân phụ:

* Hệ thống POS / Nhân viên phục vụ: Gửi đơn hàng xuống khu vực pha chế.
* Hệ thống kho: Cập nhật tồn kho và trạng thái món (có thể tự động đánh dấu hết nguyên liệu).

2. Các trường hợp sử dụng:

* 2.1. UC_2.0 – Đăng nhập hệ thống
  Barista đăng nhập vào hệ thống bằng tài khoản, mã PIN hoặc quét thẻ để truy cập giao diện quản lý pha chế.
* 2.2. UC_2.1 – Tiếp nhận đơn hàng
  Barista tiếp nhận các đơn hàng được gửi từ hệ thống POS. Danh sách đơn hàng được hiển thị theo thứ tự thời gian.
* 2.3. UC_2.2 – Xem danh sách món cần pha chế
  Barista xem chi tiết các món trong từng đơn hàng (tên món, số lượng, topping, ghi chú).
* 2.4. UC_2.3 – Cập nhật trạng thái món
  Barista cập nhật trạng thái món theo quá trình pha chế (Đang làm / Hoàn thành). Khi món hoàn thành, hệ thống thông báo để nhân viên phục vụ mang ra.
* 2.5. UC_2.4 – Thông báo hết món / hết nguyên liệu
  Barista cập nhật trạng thái món “Hết hàng” hoặc nguyên liệu “Hết” để hệ thống không cho phép order món đó.

3. Các mối quan hệ
   3.1. Quan hệ bắt buộc (<`<include>`>)

* Mọi Use Case nghiệp vụ (UC_2.1 đến UC_2.4) đều <`<include>`> UC_2.0 (Đăng nhập hệ thống).
* UC_2.3 (Cập nhật trạng thái món) <`<include>`> Use Case Gửi thông báo hoàn thành món đến nhân viên phục vụ.
  3.2. Quan hệ tùy chọn (<`<extend>`>)
* Use Case Xem chi tiết ghi chú món (ít đá, nhiều sữa, ít đường…) <`<extend>`> UC_2.2 (Xem danh sách món cần pha chế).(Chỉ xảy ra khi món có yêu cầu đặc biệt).

# B. Nhóm chức năng dành cho khách hàng

1. Tác nhân chính: Khách hàng: Người sử dụng hệ thống để đặt bàn, đặt món giao hàng và theo dõi chương trình khuyến mãi.
   Tác nhân phụ:

* Hệ thống giao hàng / Shipper: Nhận đơn giao hàng từ hệ thống.
* Hệ thống thanh toán điện tử (Ví điện tử/Ngân hàng): Hỗ trợ thanh toán online khi khách đặt món giao hàng.
* Hệ thống quản lý khuyến mãi: Cập nhật voucher và chương trình giảm giá.

2. Các trường hợp sử dụng:

* 2.1. UC_3.0 – Đăng ký / Đăng nhập
  Khách hàng đăng ký tài khoản hoặc đăng nhập để sử dụng các chức năng đặt bàn, đặt món và nhận ưu đãi.
* 2.2. UC_3.1 – Đặt bàn
  Khách hàng chọn ngày, giờ, số lượng người và gửi yêu cầu đặt bàn. Hệ thống xác nhận đặt bàn và thông báo kết quả.
* 2.3. UC_3.2 – Đặt món giao hàng tận nơi
  Khách hàng chọn món, nhập địa chỉ nhận hàng, số điện thoại và xác nhận đặt hàng. Hệ thống tạo đơn và gửi đến bộ phận xử lý.
* 2.4. UC_3.3 – Xem chương trình khuyến mãi
  Khách hàng xem danh sách chương trình khuyến mãi hiện có (giảm giá, voucher, combo).

3. Các mối quan hệ
3.1 Quan hệ bắt buộc
* UC_3.1 (Đặt bàn) <<include>> UC_3.0 (Đăng ký/Đăng nhập).
* UC_3.2 (Đặt món giao hàng) <<include>> UC_3.0 (Đăng ký/Đăng nhập).
* UC_3.2 (Đặt món giao hàng) <<include>> Use Case Xác nhận đơn hàng.
* UC_3.2 (Đặt món giao hàng) <<include>> Use Case Gửi đơn cho hệ thống giao hàng.
3.2 Quan hệ tùy chọn
* Use Case Áp dụng voucher / mã giảm giá <<extend>> UC_3.2 (Đặt món giao hàng).
(Chỉ thực hiện khi khách có voucher).
* Use Case Thanh toán online <<extend>> UC_3.2 (Đặt món giao hàng).
(Chỉ thực hiện khi khách chọn thanh toán online).