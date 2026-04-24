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

const OrderReception = () => {
  const [orders, setOrders] = useState(initialOrders);
  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    console.log(`Đã cập nhật đơn ${orderId} thành trạng thái: ${newStatus}`);
  };

  return (
    <div className="kds-container">
      <div className="kds-header">
        <h1>Màn hình Bếp / Pha chế
        </h1>
        <p>Số đơn đang chờ: {orders.filter(o => o.status === 'pending').length}</p>
      </div>

      <div className="order-grid">
        {orders.map(order => {

          if (order.status === 'done') return null;

          return (
            <div key={order.id} className="order-card">
              <div className={`card-header status-${order.status}`}>
                <span className="table-name">{order.table}</span>
                <span className="time-elapsed">{order.time}</span>
              </div>

              <div className="order-items">
                {order.items.map(item => (
                  <div key={item.id} className="item-row">
                    <div>
                      <span className="item-qty">{item.qty}x</span>
                      <span className="item-name">{item.name}</span>
                      {item.note && <span className="item-note">Ghi chú: {item.note}</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="card-actions">
                {order.status === 'pending' && (
                  <button 
                    className="btn-status btn-start"
                    onClick={() => handleUpdateStatus(order.id, 'cooking')}>
                    BẮT ĐẦU LÀM
                  </button>
                )}
                
                {order.status === 'cooking' && (
                  <button 
                    className="btn-status btn-finish"
                    onClick={() => handleUpdateStatus(order.id, 'done')}>
                    ĐÃ XONG (BÁO SẢNH)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderReception;