import React from 'react';

const OrderCard = ({ order, onStatusChange }) => {
  return (
    <div className={`order-card card-${order.status}`}>
      <div className="card-header">
        <span>{order.table}</span>
        <span className="time-elapsed">{order.time}</span>
      </div>
      
      <div className="order-items">
        {order.items.map((item) => (
          <div key={item.id} className="item-row">
            <span className="item-qty">{item.qty}x</span>
            <span className="item-name">{item.name}</span>
            {item.note && <span className="item-note"> {item.note}</span>}
          </div>
        ))}
      </div>

      {order.status !== 'done' && (
        <div className="card-actions">
          {order.status === 'pending' && (
            <button className="btn-status btn-start" onClick={() => onStatusChange(order.id, 'cooking')}>
               BẮT ĐẦU PHA CHẾ
            </button>
          )}
          {order.status === 'cooking' && (
            <button className="btn-status btn-finish" onClick={() => onStatusChange(order.id, 'done')}>
               HOÀN THÀNH
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderCard;