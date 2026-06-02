import React, { useEffect, useState } from 'react';
import { kitchenApi } from '../../api/kitchenApi';
import { orderApi } from '../../api/orderApi';
import { useApi } from '../../hooks/useApi';
import Button from '../../components/ui/Button';

const KitchenPage = () => {
  const { data: queue, execute: fetchQueue } = useApi(kitchenApi.getQueue);
  const { data: display, execute: fetchDisplay } = useApi(kitchenApi.getDisplay);
  const { execute: updateStatus } = useApi(orderApi.updateOrderStatus);
  useEffect(() => {
    const fetchData = () => {
      fetchQueue();
      fetchDisplay();
    };
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchQueue, fetchDisplay]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateStatus(orderId, newStatus);
      fetchQueue();
      fetchDisplay();
    } catch (err) {
      alert('Lỗi cập nhật trạng thái đơn hàng!');
    }
  };

  const pendingOrders = Array.isArray(queue) ? queue.filter(o => o.status === 'PENDING') : [];
  const preparingOrders = Array.isArray(queue) ? queue.filter(o => o.status === 'PREPARING') : [];
  const readyOrders = Array.isArray(display) ? display.filter(o => o.status === 'READY') : [];

  const OrderCard = ({ order, isPreparing }) => (
    <div style={{
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderLeft: `6px solid ${isPreparing ? '#ff9800' : '#f44336'}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      minWidth: '280px'
    }}>
      <div className="flex justify-between items-center" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '24px', color: '#333' }}>#{order.queueNumber ?? order.queue_number}</h3>
        <span style={{ fontSize: '12px', color: '#666' }}>
          {new Date(order.createdAt ?? order.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
        </span>
      </div>

      <ul style={{ margin: 0, paddingLeft: '20px', flex: 1 }}>
        {order.items?.map((item, idx) => (
          <li key={idx} style={{ marginBottom: '8px', fontSize: '15px' }}>
            <strong>{item.quantity}x</strong> {item.name}
            {item.toppings && item.toppings.length > 0 && (
              <div style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
                + {item.toppings.join(', ')}
              </div>
            )}
          </li>
        ))}
      </ul>

      {order.notes && (
        <div style={{ padding: '8px', backgroundColor: '#fff3cd', borderRadius: '4px', fontSize: '13px', color: '#856404' }}>
          Ghi chú: {order.notes}
        </div>
      )}

      <div>
        {isPreparing ? (
          <Button 
            style={{ width: '100%', backgroundColor: '#4caf50', borderColor: '#4caf50' }}
            onClick={() => handleStatusChange(order.id, 'READY')}
          >
            ✅ XONG (READY)
          </Button>
        ) : (
          <Button 
            style={{ width: '100%', backgroundColor: '#ff9800', borderColor: '#ff9800' }}
            onClick={() => handleStatusChange(order.id, 'PREPARING')}
          >
            🔥 BẮT ĐẦU LÀM
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-col gap-4" style={{ height: '100vh', backgroundColor: '#f0f2f5', padding: '20px', overflowY: 'auto' }}>
      <div className="flex justify-between items-center mb-4" style={{ backgroundColor: '#fff', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>🧑‍🍳 Màn hình Pha chế (Barista)</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline" onClick={async () => {
            try {
              const { attendanceApi } = await import('../../api/attendanceApi');
              await attendanceApi.checkIn();
              alert('✅ Check-in thành công!');
            } catch (e) { alert('Lỗi hoặc bạn đã check-in rồi.'); }
          }} style={{ borderColor: '#4caf50', color: '#4caf50' }}>🟢 VÀO CA</Button>
          
          <Button variant="outline" onClick={async () => {
            try {
              const { attendanceApi } = await import('../../api/attendanceApi');
              await attendanceApi.checkOut();
              alert('✅ Check-out thành công!');
            } catch (e) { alert('Lỗi hoặc bạn chưa check-in.'); }
          }} style={{ borderColor: '#ff9800', color: '#ff9800' }}>🔴 KẾT THÚC</Button>

          <Button variant="outline" onClick={() => { fetchQueue(); fetchDisplay(); }}>🔄 Cập nhật ngay</Button>
          <Button variant="outline" onClick={() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }} style={{ borderColor: '#d32f2f', color: '#d32f2f' }}>Đăng xuất</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', flex: 1, alignItems: 'flex-start' }}>

        <div style={{ backgroundColor: '#fff8e1', padding: '20px', borderRadius: '12px', minHeight: '600px' }}>
          <h3 style={{ color: '#d32f2f', marginBottom: '20px' }}>🔴 CHỜ PHA CHẾ ({pendingOrders.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingOrders.map(o => <OrderCard key={o.id} order={o} isPreparing={false} />)}
            {pendingOrders.length === 0 && <p className="text-muted">Không có đơn hàng chờ.</p>}
          </div>
        </div>

        <div style={{ backgroundColor: '#f3e5f5', padding: '20px', borderRadius: '12px', minHeight: '600px' }}>
          <h3 style={{ color: '#7b1fa2', marginBottom: '20px' }}>🟡 ĐANG PHA CHẾ ({preparingOrders.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {preparingOrders.map(o => <OrderCard key={o.id} order={o} isPreparing={true} />)}
            {preparingOrders.length === 0 && <p className="text-muted">Không có đơn đang làm.</p>}
          </div>
        </div>

        <div style={{ backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '12px', minHeight: '600px' }}>
          <h3 style={{ color: '#388e3c', marginBottom: '20px' }}>🟢 ĐÃ XONG / CHỜ KHÁCH LẤY ({readyOrders.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {readyOrders.map((o, idx) => (
              <div key={idx} style={{
                backgroundColor: '#fff', padding: '16px', borderRadius: '12px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderLeft: '6px solid #4caf50'
              }}>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#333' }}>#{o.queueNumber ?? o.queue_number}</h3>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Xong lúc: {new Date(o.readyAt ?? o.ready_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            ))}
            {readyOrders.length === 0 && <p className="text-muted">Chưa có đơn hoàn thành.</p>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default KitchenPage;
