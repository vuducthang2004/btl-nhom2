import React, { useState, useEffect } from 'react';

const OrderCard = ({ order, onStatusChange }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - order.createdAt) / 60000));
    }, 10000);
    return () => clearInterval(timer);
  }, [order.createdAt]);

  const isLate = elapsed >= 10 && order.status === 'pending';

  return (
    <div className={`order-card card-${order.status}`}>
      <div style={{padding: '12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee'}}>
        <strong>{order.table}</strong>
        <span className={isLate ? 'time-warning' : ''}> {elapsed} phút</span>
      </div>
      <div style={{padding: '12px'}}>
        {order.items.map(item => (
          <div key={item.id}><strong>{item.qty}x</strong> {item.name}</div>
        ))}
      </div>
      {order.status !== 'done' && (
        <div style={{padding: '10px', background: '#f9f9f9'}}>
          <button 
            style={{width: '100%', padding: '8px', cursor: 'pointer'}}
            onClick={() => onStatusChange(order.id, order.status === 'pending' ? 'cooking' : 'done')}
          >
            {order.status === 'pending' ? 'BẮT ĐẦU' : 'HOÀN THÀNH'}
          </button>
        </div>
      )}
    </div>
  );
};
export default OrderCard;