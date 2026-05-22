import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div style={{
        ...styles.card, 
        borderTop: order.status === 'pending' ? '5px solid #e74c3c' : order.status === 'cooking' ? '5px solid #f39c12' : '5px solid #27ae60'
    }}>
      <div style={styles.cardHeader}>
        <strong style={styles.tableName}>{order.table}</strong>
        <span style={{...styles.timeBadge, backgroundColor: isLate ? '#e74c3c' : '#eee', color: isLate ? '#fff' : '#333'}}>
            ⏱ {elapsed} phút
        </span>
      </div>
      <div style={styles.cardBody}>
        {order.items.map(item => (
          <div key={item.id} style={styles.cardItem}>
              <strong style={styles.qtyBadge}>{item.qty}</strong> {item.name}
          </div>
        ))}
      </div>
      {order.status !== 'done' && (
        <div style={styles.cardFooter}>
          <button 
            style={{...styles.actionBtn, backgroundColor: order.status === 'pending' ? '#3498db' : '#27ae60'}}
            onClick={() => onStatusChange(order.id, order.status === 'pending' ? 'cooking' : 'done')}
          >
            {order.status === 'pending' ? '▶ BẮT ĐẦU LÀM' : '✔ HOÀN THÀNH'}
          </button>
        </div>
      )}
    </div>
  );
};

const OrderReception = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([
    { id: 1, table: "Bàn 3", status: "pending", createdAt: Date.now() - 600000, items: [{id: 101, name: "Latte", qty: 1}] }
  ]);

  const handleStatusChange = (id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? {...o, status: newStatus} : o));
  };

  const playSound = () => {
    new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
            <button onClick={() => navigate('/home')} style={styles.backBtn}>← Quay lại trang chủ</button>
        </div>
      
        <h2 style={styles.title}>☕ QUẦY PHA CHẾ (KDS)</h2>
        
        <div style={styles.headerRight}>
          <button style={styles.simulateBtn} onClick={() => { 
              setOrders([...orders, {id: Date.now(), table: "Đơn Mới", status: "pending", createdAt: Date.now(), items: [{id: 99, name: "Nước cam", qty: 2}]}]); 
              playSound(); 
          }}>
            + Giả lập đơn
          </button>
        </div>
      </div>

      <div style={styles.kanbanBoard}>
        {['pending', 'cooking', 'done'].map(status => (
          <div style={styles.kanbanColumn} key={status}>
            
            <div style={{
                ...styles.columnTitle, 
                backgroundColor: status === 'pending' ? '#e74c3c' : status === 'cooking' ? '#f39c12' : '#27ae60'
            }}>
                {status === 'pending' ? '🔴 CHỜ LÀM' : status === 'cooking' ? '🟡 ĐANG PHA CHẾ' : '🟢 ĐÃ XONG'}
                <span style={styles.countBadge}>{orders.filter(o => o.status === status).length}</span>
            </div>

            <div style={styles.columnContent}>
              {orders.filter(o => o.status === status).map(o => (
                <OrderCard key={o.id} order={o} onStatusChange={handleStatusChange} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
const styles = {
    container: { backgroundColor: '#e9ecef', minHeight: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    
    // Header
    header: { position: 'relative', backgroundColor: '#4b3832', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' },
    headerLeft: { display: 'flex', alignItems: 'center' },
    headerRight: { display: 'flex', alignItems: 'center' },
    title: { position: 'absolute', left: '50%', transform: 'translateX(-50%)', color: '#fff', margin: 0, fontSize: '22px' },
    
    backBtn: { backgroundColor: 'transparent', color: '#fff', border: '1px solid #fff', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    simulateBtn: { backgroundColor: '#3498db', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    
    // Bảng Kanban
    kanbanBoard: { display: 'flex', gap: '25px', padding: '30px', height: 'calc(100vh - 100px)', overflowX: 'auto' },
    kanbanColumn: { flex: 1, minWidth: '350px', backgroundColor: '#d1d8e0', borderRadius: '10px', display: 'flex', flexDirection: 'column', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)' },
    columnTitle: { color: '#fff', padding: '15px 20px', fontSize: '18px', fontWeight: 'bold', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', display: 'flex', justifyContent: 'space-between' },
    countBadge: { backgroundColor: 'rgba(255,255,255,0.3)', padding: '2px 10px', borderRadius: '15px', fontSize: '14px' },
    columnContent: { padding: '15px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' },

    // Order Card
    card: { backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', overflow: 'hidden' },
    cardHeader: { padding: '12px 15px', borderBottom: '1px solid #f1f2f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    tableName: { fontSize: '18px', color: '#2f3542' },
    timeBadge: { padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
    cardBody: { padding: '15px' },
    cardItem: { fontSize: '16px', color: '#2f3542', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' },
    qtyBadge: { backgroundColor: '#dfe4ea', color: '#2f3542', padding: '2px 8px', borderRadius: '4px' },
    cardFooter: { padding: '10px 15px', backgroundColor: '#f8f9fa', borderTop: '1px solid #f1f2f6' },
    actionBtn: { width: '100%', color: '#fff', border: 'none', padding: '12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: '0.2s' }
};

export default OrderReception;