Phân Tích Thiết Kế Hệ Thống Web Quản lý quán cà phê

I. Các Biểu Đồ Use Case:

Xác định các Actor:

| Stt | Actor                             | Mô tả vai trò                                                                                                                           |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Nhân Viên Phục Vụ / Thu Ngân | Người trực tiếp tương tác với Khách Hàng tại quán<br />Quản lý sơ đồ bàn<br />Thực hiện order<br />Xử lý thanh toán |
| 2   | Nhân Viên Pha Chế              | Tiếp nhận danh sách món từ đơn hàng<br />Thực hiện chế biến và cập nhật trạng thái món ăn và đồ uống                |
| 3   | Chủ Cửa Hàng                   | Quản lý toàn bộ cấu hình hệ thống, nhân sự, kho bãi<br />Theo dõi báo cáo kinh doanh                                         |
| 4   | Khách Hàng                      | Người sử dụng các dịch vụ của quán(đặt bàn, đặt giao hàng) và các chương<br />trình ưu đãi                          |
| 5   | Hệ Thống Bên Thứ Ba           | Các cổng thanh toán(VNPay, MoMo)                                                                                                        |

Xác định các Use Case:

+ Nhóm use case: Phục vụ & Thanh Toán
