import React, { useState } from 'react';
import './POS.css';

const initialOrders = [
  {
    id: "ORD-001",
    table: "Bàn 5",
    time: "10:15",
    status: "pending",
    items: [
      { id: 1, name: "Cà phê Đen đá", qty: 2, note: "Không đường" },
      { id: 2, name: "Bạc xỉu", qty: 1, note: "Ít sữa" }
    ]
  },
  {
    id: "ORD-002",
    table: "Bàn 12",
    time: "10:18",
    status: "pending",
    items: [
      { id: 3, name: "Trà Đào Cam Sả", qty: 3, note: "" }
    ]
  }
  
];

const APP = () => {
  const [orders, setOrders] = useState(initialOrders);

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };
  const activeOrders = orders.filter(order => order.status !== 'done');
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="kds-container">
      <header className="kds-header">
        <h1>Màn hình Pha chế</h1>
        <div className="kds-badge">
          Số đơn đang chờ: <strong>{pendingCount}</strong>
        </div>
      </header>

      <main className="order-grid">
        {activeOrders.length === 0 ? (
          <p className="empty-state">Hiện không có đơn hàng nào cần làm. Tuyệt vời! 🎉</p>
        ) : (
          activeOrders.map(order => (
            <div key={order.id} className={`order-card ${order.status}`}>
              <div className="card-header">
                <span className="table-name">{order.table}</span>
                <span className="time-elapsed">{order.time}</span>
              </div>

              <div className="order-items">
                {order.items.map(item => (
                  <div key={item.id} className="item-row">
                    <span className="item-qty">{item.qty}x</span>
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      {item.note && <span className="item-note">Ghi chú: {item.note}</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="card-actions">
                {order.status === 'pending' ? (
                  <button 
                    className="btn btn-start"
                    onClick={() => handleUpdateStatus(order.id, 'cooking')}>
                    BẮT ĐẦU LÀM
                  </button>
                ) : (
                  <button 
                    className="btn btn-finish"
                    onClick={() => handleUpdateStatus(order.id, 'done')}>
                    ĐÃ XONG (BÁO SẢNH)
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default APP;