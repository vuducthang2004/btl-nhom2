import React, { useState } from 'react';
import OrderCard from './OrderCard';
import './OrderReception.css';

const OrderReception = () => {
  const [orders, setOrders] = useState([
    { id: 1, table: "Bàn 3", status: "pending", createdAt: Date.now() - 600000, items: [{id: 101, name: "Latte", qty: 1}] }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menu, setMenu] = useState([{id: 1, name: "Cà phê", stock: true}, {id: 2, name: "Trà đào", stock: true}]);

  const handleStatusChange = (id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? {...o, status: newStatus} : o));
  };

  const playSound = () => {
    new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play();
  };

  return (
    <div className="kds-container">
      <div className="kds-header">
        <h1>Bếp & Pha Chế</h1>
        <div>
          <button onClick={() => setIsModalOpen(true)} style={{marginRight: '10px'}}>🚫 Báo hết món</button>
          <button onClick={() => { setOrders([...orders, {id: Date.now(), table: "Mới", status: "pending", createdAt: Date.now(), items: [{id: 99, name: "Nước cam", qty: 1}]}]); playSound(); }}>
            🔔 Giả lập đơn mới
          </button>
        </div>
      </div>

      <div className="kanban-board">
        {['pending', 'cooking', 'done'].map(status => (
          <div className="kanban-column" key={status}>
            <div className="column-title">{status === 'pending' ? 'Chờ làm' : status === 'cooking' ? 'Đang làm' : 'Đã xong'}</div>
            <div className="column-content">
              {orders.filter(o => o.status === status).map(o => (
                <OrderCard key={o.id} order={o} onStatusChange={handleStatusChange} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Danh sách món</h3>
            {menu.map(m => (
              <div key={m.id} className={`menu-list-item ${!m.stock ? 'sold-out' : ''}`}>
                {m.name}
                <button onClick={() => setMenu(menu.map(i => i.id === m.id ? {...i, stock: !i.stock} : i))}>
                  {m.stock ? 'Báo hết' : 'Mở lại'}
                </button>
              </div>
            ))}
            <button onClick={() => setIsModalOpen(false)} style={{marginTop: '20px', width: '100%'}}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default OrderReception;