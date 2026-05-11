import React, { useState } from 'react';

const SoDoBan = () => {
    const [tables, setTables] = useState([
        { id: 5, name: 'Bàn 5', status: 'occupied' },
        { id: 6, name: 'Bàn 6', status: 'occupied' },
        { id: 7, name: 'Bàn 7', status: 'empty' },
        { id: 8, name: 'Bàn 8', status: 'empty' },
        { id: 9, name: 'Bàn 9', status: 'empty' },
        { id: 10, name: 'Bàn 10', status: 'empty' }
    ]);

    const [selectedTable, setSelectedTable] = useState(tables[0]);
    const [modalConfig, setModalConfig] = useState({ show: false, type: '' });
    const [targetTableId, setTargetTableId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    const mockOrder = [
        { id: 1, name: 'Cà phê Sữa Đá', quantity: 1, price: 30000 },
        { id: 2, name: 'Trà Đào', quantity: 1, price: 35000 },
        { id: 3, name: 'Bánh ngọt', quantity: 2, price: 40000 }
    ];

    const mockPending = [
        { id: 1, table: 'Bàn 5', item: 'Cà phê Sữa Đá (Chờ pha chế)' },
        { id: 2, table: 'Bàn 6', item: 'Trà Đào (Đang làm)' }
    ];

    const totalAmount = selectedTable.status === 'occupied' 
        ? mockOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0) 
        : 0;

    const handleOpenModal = (type) => {
        if (selectedTable.status === 'empty') {
            alert('Vui lòng chọn bàn đang có khách để thực hiện thao tác này!');
            return;
        }
        setModalConfig({ show: true, type });
        setTargetTableId('');
    };

    const handleConfirmAction = () => {
        if (modalConfig.type === 'transfer' && targetTableId) {
            const updatedTables = tables.map(t => {
                if (t.id === selectedTable.id) return { ...t, status: 'empty' };
                if (t.id === Number(targetTableId)) return { ...t, status: 'occupied' };
                return t;
            });
            setTables(updatedTables);
            setSelectedTable(updatedTables.find(t => t.id === Number(targetTableId)));
        } 
        else if (modalConfig.type === 'merge' && targetTableId) {
            const updatedTables = tables.map(t => {
                if (t.id === Number(targetTableId)) return { ...t, status: 'empty' };
                return t;
            });
            setTables(updatedTables);
            alert(`Đã gộp hóa đơn của bàn ${targetTableId} vào ${selectedTable.name}`);
        } 
        setModalConfig({ show: false, type: '' });
    };

    const handlePayment = () => {
        const methodNames = {
            cash: 'Tiền mặt',
            transfer: 'Chuyển khoản',
            ewallet: 'Ví điện tử'
        };
        
        alert(`Thanh toán thành công ${selectedTable.name}!\nTổng tiền: ${totalAmount.toLocaleString()}đ\nPhương thức: ${methodNames[paymentMethod]}`);
        
        const updatedTables = tables.map(t => {
            if (t.id === selectedTable.id) return { ...t, status: 'empty' };
            return t;
        });
        setTables(updatedTables);
        setSelectedTable({ ...selectedTable, status: 'empty' });
        setPaymentMethod('');
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.headerTitle}>☕ Coffee Manager - NHÓM PHỤC VỤ & THANH TOÁN</h2>
                <button style={styles.backBtn} onClick={() => window.location.href = '/home'}>Quay lại</button>
            </div>

            <div style={styles.topSection}>
                <div style={styles.leftPanel}>
                    <div style={styles.panelHeader}>
                        <h3 style={styles.panelTitle}>SƠ ĐỒ BÀN</h3>
                        <div style={styles.actionGroup}>
                            <button style={styles.actionBtn} onClick={() => handleOpenModal('transfer')}>Chuyển bàn</button>
                            <button style={styles.actionBtn} onClick={() => handleOpenModal('merge')}>Gộp bàn</button>
                        </div>
                    </div>
                    
                    <div style={styles.tableGrid}>
                        {tables.map(table => (
                            <div 
                                key={table.id} 
                                style={{
                                    ...styles.tableBox,
                                    backgroundColor: table.status === 'occupied' ? '#c0392b' : '#27ae60',
                                    border: selectedTable.id === table.id ? '3px solid #f1c40f' : '3px solid transparent'
                                }}
                                onClick={() => {
                                    setSelectedTable(table);
                                    setPaymentMethod('');
                                }}
                            >
                                <div style={styles.tableName}>{table.name}</div>
                                <div style={styles.tableStatus}>
                                    {table.status === 'occupied' ? 'Đang có khách' : 'Trống'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.rightPanel}>
                    <h3 style={styles.panelTitle}>HÓA ĐƠN</h3>
                    <div style={styles.invoiceHeader}>
                        <h2 style={{margin: 0, color: '#f39c12'}}>{selectedTable.name}</h2>
                        <span style={{color: '#aaa', fontSize: '14px'}}>
                            {selectedTable.status === 'occupied' ? 'Đang phục vụ' : 'Trống'}
                        </span>
                    </div>

                    <div style={styles.orderList}>
                        {selectedTable.status === 'occupied' ? (
                            <>
                                {mockOrder.map((item, index) => (
                                    <div key={item.id} style={styles.orderItem}>
                                        <span>{index + 1}. {item.name} x{item.quantity}</span>
                                        <span>{(item.price * item.quantity).toLocaleString()}đ</span>
                                    </div>
                                ))}
                                <div style={styles.totalRow}>
                                    <strong>Tổng cộng:</strong>
                                    <strong style={{color: '#e74c3c', fontSize: '18px'}}>{totalAmount.toLocaleString()}đ</strong>
                                </div>
                            </>
                        ) : (
                            <div style={{color: '#aaa', textAlign: 'center', marginTop: '20px'}}>Chưa có món nào</div>
                        )}
                    </div>

                    <div style={styles.paymentSection}>
                        <div style={styles.payMethods}>
                            <button 
                                style={{
                                    ...styles.methodBtn, 
                                    backgroundColor: paymentMethod === 'cash' ? '#f39c12' : '#333',
                                    color: paymentMethod === 'cash' ? '#000' : '#fff'
                                }}
                                onClick={() => setPaymentMethod('cash')}
                            >
                                💵 Tiền mặt
                            </button>
                            <button 
                                style={{
                                    ...styles.methodBtn, 
                                    backgroundColor: paymentMethod === 'transfer' ? '#f39c12' : '#333',
                                    color: paymentMethod === 'transfer' ? '#000' : '#fff'
                                }}
                                onClick={() => setPaymentMethod('transfer')}
                            >
                                💳 Chuyển khoản
                            </button>
                            <button 
                                style={{
                                    ...styles.methodBtn, 
                                    backgroundColor: paymentMethod === 'ewallet' ? '#f39c12' : '#333',
                                    color: paymentMethod === 'ewallet' ? '#000' : '#fff'
                                }}
                                onClick={() => setPaymentMethod('ewallet')}
                            >
                                📱 Ví điện tử
                            </button>
                        </div>

                        {paymentMethod === 'transfer' && selectedTable.status === 'occupied' && (
                            <div style={styles.qrContainer}>
                                <img 
                                    src={`https://img.vietqr.io/image/970422-0385721074-compact2.png?amount=${totalAmount}&addInfo=Thanh toan ${selectedTable.name}&accountName=TRAN MINH HA`} 
                                    alt="QR Code" 
                                    style={styles.qrImage} 
                                />
                                <div style={styles.qrInfo}>
                                    <p style={styles.qrText}>Ngân hàng: <strong>MB Bank</strong></p>
                                    <p style={styles.qrText}>Chủ TK: <strong>TRẦN MINH HÀ</strong></p>
                                    <p style={styles.qrTextAlert}>Vui lòng khách hàng quét mã để thanh toán</p>
                                </div>
                            </div>
                        )}

                        <button 
                            style={{
                                ...styles.payBtn,
                                opacity: (selectedTable.status === 'empty' || !paymentMethod) ? 0.5 : 1,
                                cursor: (selectedTable.status === 'empty' || !paymentMethod) ? 'not-allowed' : 'pointer'
                            }}
                            onClick={handlePayment}
                            disabled={selectedTable.status === 'empty' || !paymentMethod}
                        >
                            XÁC NHẬN THANH TOÁN
                        </button>
                    </div>
                </div>
            </div>

            <div style={styles.bottomSection}>
                <h3 style={styles.panelTitle}>DANH SÁCH MÓN ĐANG CHỜ</h3>
                <table style={styles.pendingTable}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Đơn hàng</th>
                            <th style={styles.th}>Món</th>
                            <th style={styles.th}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockPending.map(item => (
                            <tr key={item.id} style={styles.tr}>
                                <td style={styles.td}>Đơn hàng: {item.table}</td>
                                <td style={styles.td}>
                                    <span style={styles.quantityBadge}>1</span> {item.item}
                                </td>
                                <td style={{...styles.td, textAlign: 'right'}}>
                                    <button style={styles.statusBtnGreen}>Cập nhật hoàn thành</button>
                                    <button style={styles.statusBtnRed}>Thông báo hết món</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalConfig.show && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3 style={styles.modalTitle}>
                            {modalConfig.type === 'transfer' ? 'Chuyển Bàn' : 'Gộp Bàn'}
                        </h3>
                        
                        <select 
                            style={styles.selectInput}
                            value={targetTableId} 
                            onChange={(e) => setTargetTableId(e.target.value)}
                        >
                            <option value="">-- Vui lòng chọn bàn đích --</option>
                            {tables
                                .filter(t => t.id !== selectedTable.id && (modalConfig.type === 'transfer' ? t.status === 'empty' : t.status === 'occupied'))
                                .map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.status === 'empty' ? 'Trống' : 'Có khách'})</option>
                                ))
                            }
                        </select>

                        <div style={styles.btnGroup}>
                            <button style={styles.btnCancel} onClick={() => setModalConfig({ show: false, type: '' })}>Hủy</button>
                            <button style={styles.btnConfirm} onClick={handleConfirmAction}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { backgroundColor: '#1a1a1a', minHeight: '100vh', padding: '20px', color: '#fff', fontFamily: 'Arial, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    headerTitle: { margin: 0, fontSize: '20px', color: '#f39c12', fontWeight: 'bold' },
    backBtn: { padding: '8px 15px', backgroundColor: '#333', color: '#fff', border: '1px solid #555', borderRadius: '5px', cursor: 'pointer' },
    
    topSection: { display: 'flex', gap: '20px', marginBottom: '20px' },
    
    leftPanel: { flex: 2, border: '1px solid #f39c12', borderRadius: '10px', padding: '20px', backgroundColor: '#222' },
    rightPanel: { flex: 1, border: '1px solid #f39c12', borderRadius: '10px', padding: '20px', backgroundColor: '#222', display: 'flex', flexDirection: 'column' },
    
    panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    panelTitle: { margin: 0, color: '#fff', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase' },
    actionGroup: { display: 'flex', gap: '10px' },
    actionBtn: { backgroundColor: '#f39c12', color: '#000', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    
    tableGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' },
    tableBox: { padding: '25px 10px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', transition: '0.2s', position: 'relative' },
    tableName: { fontSize: '22px', fontWeight: 'bold', marginBottom: '5px' },
    tableStatus: { fontSize: '13px', opacity: 0.9 },

    invoiceHeader: { borderBottom: '1px solid #444', paddingBottom: '15px', marginBottom: '15px', marginTop: '15px' },
    orderList: { flexGrow: 1, marginBottom: '20px', overflowY: 'auto' },
    orderItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #333', fontSize: '15px' },
    totalRow: { display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderTop: '2px solid #444', marginTop: '10px', fontSize: '16px' },
    
    paymentSection: { marginTop: 'auto' },
    payBtn: { width: '100%', padding: '15px', backgroundColor: '#f39c12', color: '#000', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', marginTop: '15px' },
    payMethods: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' },
    methodBtn: { flex: 1, padding: '10px 5px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', minWidth: '30%' },
    
    qrContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '10px' },
    qrImage: { width: '200px', height: '200px', objectFit: 'contain', marginBottom: '10px' },
    qrInfo: { textAlign: 'center', color: '#000' },
    qrText: { margin: '2px 0', fontSize: '14px' },
    qrTextAlert: { margin: '10px 0 0 0', fontSize: '13px', color: '#e74c3c', fontStyle: 'italic' },

    bottomSection: { border: '1px solid #f39c12', borderRadius: '10px', padding: '20px', backgroundColor: '#222' },
    pendingTable: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
    th: { textAlign: 'left', padding: '10px', borderBottom: '1px solid #444', color: '#aaa', fontWeight: 'normal' },
    td: { padding: '15px 10px', borderBottom: '1px solid #333', fontSize: '15px' },
    quantityBadge: { backgroundColor: '#c0392b', color: '#fff', padding: '2px 8px', borderRadius: '4px', marginRight: '10px', fontSize: '12px' },
    statusBtnGreen: { backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' },
    statusBtnRed: { backgroundColor: '#c0392b', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' },

    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#2c3e50', padding: '30px', borderRadius: '10px', width: '400px', border: '2px solid #f39c12', boxShadow: '0 5px 15px rgba(0,0,0,0.5)' },
    modalTitle: { margin: '0 0 20px 0', color: '#f39c12', textAlign: 'center', textTransform: 'uppercase' },
    selectInput: { width: '100%', padding: '12px', marginBottom: '25px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #555', borderRadius: '5px', fontSize: '16px' },
    btnGroup: { display: 'flex', gap: '15px', justifyContent: 'flex-end' },
    btnConfirm: { padding: '10px 20px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    btnCancel: { padding: '10px 20px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
};

export default SoDoBan;