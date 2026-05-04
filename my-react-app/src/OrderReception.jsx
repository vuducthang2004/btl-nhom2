import React, { useState } from 'react';
import OrderCard from './OrderCard';
import './OrderReception.css';

const OrderReception = () => {
  const [orders, setOrders] = useState([
    { id: "ORD-001", table: "Bàn 5", time: "10:15", status: "pending", items: [{ id: 1, name: "Cà phê Đen", qty: 2, note: "" }] },
    { id: "ORD-002", table: "Bàn 12", time: "10:18", status: "cooking", items: [{ id: 3, name: "Trà Đào", qty: 3, note: "Ít đá" }] }
  ]);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const cookingOrders = orders.filter(o => o.status === 'cooking');
  const doneOrders = orders.filter(o => o.status === 'done');

  return (
    <div className="kds-container">
      <div className="kds-header">
        <h1>Màn hình Pha chế (KDS)</h1>
      </div>
      <div className="kanban-board">
        <div className="kanban-column">
          <div className="column-title">1. CHỜ PHA CHẾ</div>
          <div className="column-content">
            {pendingOrders.map(order => <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />)}
          </div>
        </div>
        <div className="kanban-column">
          <div className="column-title">2. ĐANG THỰC HIỆN</div>
          <div className="column-content">
            {cookingOrders.map(order => <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />)}
          </div>
        </div>
        <div className="kanban-column">
          <div className="column-title">3. ĐÃ XONG</div>
          <div className="column-content">
            {doneOrders.map(order => <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReception;