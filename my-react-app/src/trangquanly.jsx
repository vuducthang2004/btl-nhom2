import React, { useState } from "react";

export default function TrangQuanLy({ setDaDangNhap }) {
  const [menu, setMenu] = useState("tongquan");

  const dangXuat = () => {
    localStorage.removeItem("daDangNhap");
    setDaDangNhap(false);
  };

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>☕ Cafe Admin</h2>

        <div style={styles.menu}>
          <button
            style={menu === "tongquan" ? styles.btnActive : styles.btnMenu}
            onClick={() => setMenu("tongquan")}
          >
            📊 Tổng quan
          </button>

          <button
            style={menu === "ban" ? styles.btnActive : styles.btnMenu}
            onClick={() => setMenu("ban")}
          >
            🪑 Quản lý bàn
          </button>

          <button
            style={menu === "menu" ? styles.btnActive : styles.btnMenu}
            onClick={() => setMenu("menu")}
          >
            📋 Quản lý món
          </button>

          <button
            style={menu === "donhang" ? styles.btnActive : styles.btnMenu}
            onClick={() => setMenu("donhang")}
          >
            🧾 Đơn hàng
          </button>

          <button
            style={menu === "doanhthu" ? styles.btnActive : styles.btnMenu}
            onClick={() => setMenu("doanhthu")}
          >
            💰 Doanh thu
          </button>
        </div>

        <button style={styles.btnLogout} onClick={dangXuat}>
          🚪 Đăng xuất
        </button>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        {/* HEADER */}
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>
            {menu === "tongquan" && "📊 Trang tổng quan"}
            {menu === "ban" && "🪑 Quản lý bàn"}
            {menu === "menu" && "📋 Quản lý món"}
            {menu === "donhang" && "🧾 Quản lý đơn hàng"}
            {menu === "doanhthu" && "💰 Thống kê doanh thu"}
          </h2>

          <div style={styles.userBox}>
            <span style={{ fontWeight: "bold" }}>Quản lý</span>
            <span style={{ fontSize: "13px", color: "#555" }}>
              admin@cafe.com
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div style={styles.content}>
          {menu === "tongquan" && <TongQuan />}
          {menu === "ban" && <QuanLyBan />}
          {menu === "menu" && <QuanLyMon />}
          {menu === "donhang" && <QuanLyDonHang />}
          {menu === "doanhthu" && <DoanhThu />}
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function TongQuan() {
  return (
    <div>
      <div style={styles.cards}>
        <div style={styles.card}>
          <h3>🪑 Số bàn</h3>
          <p style={styles.number}>25</p>
        </div>

        <div style={styles.card}>
          <h3>🧾 Đơn hôm nay</h3>
          <p style={styles.number}>18</p>
        </div>

        <div style={styles.card}>
          <h3>💰 Doanh thu</h3>
          <p style={styles.number}>3.200.000đ</p>
        </div>

        <div style={styles.card}>
          <h3>👥 Nhân viên</h3>
          <p style={styles.number}>6</p>
        </div>
      </div>

      <h3 style={{ marginTop: 25 }}>📌 Đơn hàng gần đây</h3>

      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHead}>
            <th>Mã đơn</th>
            <th>Bàn</th>
            <th>Thời gian</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ORD-001</td>
            <td>Bàn 5</td>
            <td>10:30</td>
            <td style={{ color: "orange", fontWeight: "bold" }}>Đang làm</td>
          </tr>
          <tr>
            <td>ORD-002</td>
            <td>Bàn 2</td>
            <td>10:40</td>
            <td style={{ color: "green", fontWeight: "bold" }}>Hoàn thành</td>
          </tr>
          <tr>
            <td>ORD-003</td>
            <td>Bàn 10</td>
            <td>11:00</td>
            <td style={{ color: "red", fontWeight: "bold" }}>Chờ xử lý</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function QuanLyBan() {
  const dsBan = [
    { id: 1, ten: "Bàn 1", trangThai: "Trống" },
    { id: 2, ten: "Bàn 2", trangThai: "Có khách" },
    { id: 3, ten: "Bàn 3", trangThai: "Đã đặt" },
    { id: 4, ten: "Bàn 4", trangThai: "Trống" },
    { id: 5, ten: "Bàn 5", trangThai: "Có khách" },
  ];

  return (
    <div>
      <h3>Danh sách bàn</h3>

      <div style={styles.grid}>
        {dsBan.map((ban) => (
          <div key={ban.id} style={styles.banCard}>
            <h3>{ban.ten}</h3>
            <p>
              Trạng thái:{" "}
              <b
                style={{
                  color:
                    ban.trangThai === "Trống"
                      ? "green"
                      : ban.trangThai === "Có khách"
                      ? "red"
                      : "orange",
                }}
              >
                {ban.trangThai}
              </b>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuanLyMon() {
  const dsMon = [
    { id: 1, ten: "Cà phê đen", gia: 25000 },
    { id: 2, ten: "Cà phê sữa", gia: 30000 },
    { id: 3, ten: "Trà đào", gia: 35000 },
    { id: 4, ten: "Sinh tố bơ", gia: 45000 },
  ];

  return (
    <div>
      <h3>Danh sách món</h3>

      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHead}>
            <th>ID</th>
            <th>Tên món</th>
            <th>Giá</th>
          </tr>
        </thead>
        <tbody>
          {dsMon.map((mon) => (
            <tr key={mon.id}>
              <td>{mon.id}</td>
              <td>{mon.ten}</td>
              <td>{mon.gia.toLocaleString()}đ</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuanLyDonHang() {
  const dsDon = [
    { id: "ORD-001", ban: "Bàn 5", tong: 120000, trangThai: "Đang làm" },
    { id: "ORD-002", ban: "Bàn 2", tong: 90000, trangThai: "Hoàn thành" },
    { id: "ORD-003", ban: "Bàn 10", tong: 70000, trangThai: "Chờ xử lý" },
  ];

  return (
    <div>
      <h3>Danh sách đơn hàng</h3>

      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHead}>
            <th>Mã đơn</th>
            <th>Bàn</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {dsDon.map((don) => (
            <tr key={don.id}>
              <td>{don.id}</td>
              <td>{don.ban}</td>
              <td>{don.tong.toLocaleString()}đ</td>
              <td>{don.trangThai}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DoanhThu() {
  return (
    <div>
      <h3>Thống kê doanh thu</h3>
      <p>Hôm nay: <b>3.200.000đ</b></p>
      <p>Tuần này: <b>15.500.000đ</b></p>
      <p>Tháng này: <b>62.000.000đ</b></p>
    </div>
  );
}

/* ================= STYLE ================= */

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial",
  },

  sidebar: {
    width: "230px",
    background: "#1e293b",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },

  logo: {
    textAlign: "center",
    marginBottom: "25px",
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    flexGrow: 1,
  },

  btnMenu: {
    background: "transparent",
    border: "none",
    color: "white",
    textAlign: "left",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
  },

  btnActive: {
    background: "#2563eb",
    border: "none",
    color: "white",
    textAlign: "left",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
  },

  btnLogout: {
    background: "#dc2626",
    border: "none",
    color: "white",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  main: {
    flex: 1,
    background: "#f1f5f9",
    display: "flex",
    flexDirection: "column",
  },

  header: {
    background: "white",
    padding: "15px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #ddd",
  },

  userBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },

  content: {
    padding: "20px",
    overflowY: "auto",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },

  card: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },

  number: {
    fontSize: "22px",
    fontWeight: "bold",
    marginTop: "10px",
    color: "#2563eb",
  },

  table: {
    width: "100%",
    background: "white",
    borderCollapse: "collapse",
    marginTop: "15px",
    borderRadius: "10px",
    overflow: "hidden",
  },

  tableHead: {
    background: "#2563eb",
    color: "white",
    textAlign: "left",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
    marginTop: "15px",
  },

  banCard: {
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
};