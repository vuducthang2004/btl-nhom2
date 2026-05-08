import React from "react";

export default function TrangQuanLy({ setDaDangNhap }) {
  const dangXuat = () => {
    localStorage.removeItem("daDangNhap");
    setDaDangNhap(false);
  };

  return (
    <div style={styles.khung}>
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>Hệ thống quản lý quán Cafe</h2>

        <button onClick={dangXuat} style={styles.btnDangXuat}>
          Đăng xuất
        </button>
      </div>

      <div style={styles.noiDung}>
        <h3>Xin chào quản lý 👋</h3>
        <p>Bạn đã đăng nhập thành công!</p>

        <div style={styles.menu}>
          <div style={styles.card}>📌 Quản lý bàn</div>
          <div style={styles.card}>📌 Quản lý menu</div>
          <div style={styles.card}>📌 Quản lý đơn hàng</div>
          <div style={styles.card}>📌 Thống kê doanh thu</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  khung: {
    minHeight: "100vh",
    background: "#f5f5f5",
  },
  header: {
    background: "#2575fc",
    color: "white",
    padding: "15px 25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  btnDangXuat: {
    background: "#dc3545",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  noiDung: {
    padding: "25px",
  },
  menu: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    fontWeight: "bold",
    fontSize: "16px",
  },
};
