import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const OrderCard = ({ order, onStatusChange }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const orderTime = new Date(order.created_at).getTime();
    
    const calculateTime = () => {
      setElapsed(Math.floor((Date.now() - orderTime) / 60000));
    };
    
    calculateTime(); 
    const timer = setInterval(calculateTime, 10000);
    
    return () => clearInterval(timer);
  }, [order.created_at]);

  const isLate = elapsed >= 10 && order.status === 'PENDING';

  return (
    <div style={{
        ...styles.card, 
        borderTop: order.status === 'PENDING' ? '5px solid #e74c3c' : order.status === 'PREPARING' ? '5px solid #f39c12' : '5px solid #27ae60'
    }}>
      <div style={styles.cardHeader}>
        <strong style={styles.tableName}>STT: #{order.queue_number}</strong>
        <span style={{...styles.timeBadge, backgroundColor: isLate ? '#e74c3c' : '#eee', color: isLate ? '#fff' : '#333'}}>
            ⏱ {elapsed} phút
        </span>
      </div>
      <div style={styles.cardBody}>
        {order.items?.map(item => (
          <div key={item.id} style={styles.cardItemContainer}>
            <div style={styles.cardItem}>
                <strong style={styles.qtyBadge}>{item.quantity}</strong> {item.name}
            </div>
            {item.toppings && item.toppings.length > 0 && (
              <div style={styles.toppingList}>
                + {item.toppings.map(t => t.name).join(', ')}
              </div>
            )}
            {item.notes && (
               <div style={styles.notesText}>📝 Ghi chú: {item.notes}</div>
            )}
          </div>
        ))}
      </div>
      
      {order.status !== 'READY' && (
        <div style={styles.cardFooter}>
          <button 
            style={{...styles.actionBtn, backgroundColor: order.status === 'PENDING' ? '#3498db' : '#27ae60'}}
            onClick={() => onStatusChange(order.id, order.status)}
          >
            {order.status === 'PENDING' ? '▶ BẮT ĐẦU LÀM' : '✔ HOÀN THÀNH'}
          </button>
        </div>
      )}
    </div>
  );
};

const OrderReception = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  
  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken'); 
    return { Authorization: `Bearer ${token}` };
  };

  const fetchQueue = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/kitchen/queue`, {
        headers: getAuthHeader()
      });
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu bếp:", error);
    }
  };

  const handleStatusChange = async (orderId, currentStatus) => {
    const nextStatus = currentStatus === 'PENDING' ? 'PREPARING' : 'READY';
    
    try {
      await axios.patch(`${API_BASE_URL}/orders/${orderId}/status`, 
        { status: nextStatus },
        { headers: getAuthHeader() }
      );
      fetchQueue();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert("Cập nhật thất bại. Kiểm tra lại quyền BARISTA!");
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/attendance/check-in`, {}, { headers: getAuthHeader() });
      alert(response.data.data?.message || "Check-in thành công!");
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi Check-in (Có thể bạn chưa được phân ca hôm nay hoặc đã check-in rồi)");
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/attendance/check-out`, {}, { headers: getAuthHeader() });
      alert("Đã Check-out kết thúc ca làm!");
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi Check-out (Chưa có record check-in)!");
    }
  };

  useEffect(() => {
    fetchQueue(); 
    
    const interval = setInterval(() => {
      fetchQueue();
    }, 10000); 
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
            <button onClick={() => navigate('/home')} style={styles.backBtn}>← Quay lại trang chủ</button>
        </div>
      
        <h2 style={styles.title}>☕ QUẦY PHA CHẾ (KDS)</h2>
        
        <div style={styles.headerRight}>

          <button style={{...styles.simulateBtn, backgroundColor: '#27ae60', marginRight: '10px'}} onClick={handleCheckIn}>
            👋 Check-in
          </button>

          <button style={{...styles.simulateBtn, backgroundColor: '#7f8c8d', marginRight: '10px'}} onClick={handleCheckOut}>
            🚪 Check-out
          </button>

          <button style={styles.simulateBtn} onClick={fetchQueue}>
            ↻ Làm mới đơn
          </button>
        </div>
      </div>

      <div style={styles.kanbanBoard}>
        {['PENDING', 'PREPARING', 'READY'].map(status => (
          <div style={styles.kanbanColumn} key={status}>
            
            <div style={{
                ...styles.columnTitle, 
                backgroundColor: status === 'PENDING' ? '#e74c3c' : status === 'PREPARING' ? '#f39c12' : '#27ae60'
            }}>
                {status === 'PENDING' ? '🔴 CHỜ LÀM' : status === 'PREPARING' ? '🟡 ĐANG PHA CHẾ' : '🟢 ĐÃ XONG'}
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
    cardItemContainer: { marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px dashed #eee' },
    cardItem: { fontSize: '16px', color: '#2f3542', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' },
    toppingList: { fontSize: '14px', color: '#7f8c8d', paddingLeft: '32px', fontStyle: 'italic' },
    notesText: { fontSize: '14px', color: '#e67e22', paddingLeft: '32px', fontWeight: 'bold', marginTop: '4px' },
    qtyBadge: { backgroundColor: '#dfe4ea', color: '#2f3542', padding: '2px 8px', borderRadius: '4px' },
    cardFooter: { padding: '10px 15px', backgroundColor: '#f8f9fa', borderTop: '1px solid #f1f2f6' },
    actionBtn: { width: '100%', color: '#fff', border: 'none', padding: '12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: '0.2s' }
};

export default OrderReception;