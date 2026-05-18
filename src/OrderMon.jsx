import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderMon = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || { username: 'admin_ha', role: 'owner' };

    const categories = [
        { id: 'all', name: 'Tất cả' },
        { id: 'coffee', name: 'Hot/Cold Coffee' },
        { id: 'tea', name: 'Tea & Macchiato' },
        { id: 'pastry', name: 'Pastry & Cake' }
    ];

    const menuItems = [
        { id: 1, name: 'Cà phê Sữa Đá', price: 30000, category: 'coffee', hasSize: true, hasTopping: true, favorite: true },
        { id: 2, name: 'Bạc Xỉu', price: 35000, category: 'coffee', hasSize: true, hasTopping: true, favorite: true },
        { id: 3, name: 'Trà Đào Cam Sả', price: 40000, category: 'tea', hasSize: true, hasTopping: true, favorite: false },
        { id: 4, name: 'Trà Oolong Macchiato', price: 45000, category: 'tea', hasSize: true, hasTopping: true, favorite: true },
        { id: 5, name: 'Bánh Tiramisu', price: 40000, category: 'pastry', hasSize: false, hasTopping: false, favorite: false },
        { id: 6, name: 'Bánh Croissant', price: 30000, category: 'pastry', hasSize: false, hasTopping: false, favorite: false },
    ];

    const toppingOptions = [
        { id: 't1', name: 'Trân châu trắng', price: 10000 },
        { id: 't2', name: 'Thạch đào', price: 10000 },
        { id: 't3', name: 'Thêm shot Espresso', price: 15000 },
        { id: 't4', name: 'Kem Macchiato', price: 15000 }
    ];

    const [activeCategory, setActiveCategory] = useState('all');
    const [cart, setCart] = useState([]);
    const [auditLog, setAuditLog] = useState([]);
    
    const [orderMeta, setOrderMeta] = useState({
        table: 'Bàn 5',
        guests: 2,
        channel: 'Dine-in',
        discount: 0,
        staff: user.username
    });

    const [modalConfig, setModalConfig] = useState({
        isOpen: false, item: null, editCartId: null,
        size: 'M', toppings: [], qty: 1, note: ''
    });

    const logAction = (action, details) => {
        const log = { time: new Date().toLocaleTimeString(), staff: user.username, action, details };
        setAuditLog(prev => [log, ...prev]);
    };

    const handleOpenModal = (item, editCartItem = null) => {
        if (editCartItem) {
            setModalConfig({
                isOpen: true, item, editCartId: editCartItem.cartId,
                size: editCartItem.size, toppings: editCartItem.toppings, qty: editCartItem.qty, note: editCartItem.note
            });
        } else {
            if (!item.hasSize && !item.hasTopping) {
                handleAddToCart(item, 'M', [], 1, '');
                return;
            }
            setModalConfig({
                isOpen: true, item, editCartId: null,
                size: 'M', toppings: [], qty: 1, note: ''
            });
        }
    };

    const handleToppingToggle = (topping) => {
        const current = modalConfig.toppings;
        const exists = current.find(t => t.id === topping.id);
        setModalConfig({
            ...modalConfig,
            toppings: exists ? current.filter(t => t.id !== topping.id) : [...current, topping]
        });
    };

    const calculatePreviewPrice = () => {
        if (!modalConfig.item) return 0;
        let base = modalConfig.item.price;
        if (modalConfig.size === 'L') base += 10000;
        if (modalConfig.size === 'S') base -= 5000;
        const toppingTotal = modalConfig.toppings.reduce((sum, t) => sum + t.price, 0);
        return (base + toppingTotal) * modalConfig.qty;
    };

    const handleAddToCart = (item, size, toppings, qty, note, editCartId = null) => {
        const cartId = editCartId || Date.now() + Math.random();
        let base = item.price;
        if (size === 'L') base += 10000;
        if (size === 'S') base -= 5000;
        const toppingTotal = toppings.reduce((sum, t) => sum + t.price, 0);
        const unitPrice = base + toppingTotal;

        const newItem = { cartId, ...item, size, toppings, qty, note, unitPrice, status: 'Pending' };

        if (editCartId) {
            setCart(cart.map(c => c.cartId === editCartId ? newItem : c));
            logAction('EDIT_ITEM', `Sửa món ${item.name}`);
        } else {
            setCart([...cart, newItem]);
            logAction('ADD_ITEM', `Thêm ${qty}x ${item.name}`);
        }
        setModalConfig({ isOpen: false, item: null, toppings: [], qty: 1, note: '' });
    };

    const updateItemStatus = (cartId, status) => {
        setCart(cart.map(c => c.cartId === cartId ? { ...c, status } : c));
        logAction('CHANGE_STATUS', `Đổi trạng thái -> ${status}`);
    };

    const removeItem = (cartId, name) => {
        setCart(cart.filter(c => c.cartId !== cartId));
        logAction('REMOVE_ITEM', `Xóa món ${name}`);
    };

    const sendToKitchen = () => {
        const pendingItems = cart.filter(c => c.status === 'Pending');
        if (pendingItems.length === 0) return alert('Không có món mới để gửi!');
        
        setCart(cart.map(c => c.status === 'Pending' ? { ...c, status: 'Sent' } : c));
        logAction('SEND_KITCHEN', `Gửi ${pendingItems.length} món xuống bếp`);
        alert('Đã gửi yêu cầu pha chế thành công!');
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax - orderMeta.discount;
    const pendingCount = cart.filter(c => c.status === 'Pending').length;

    const filteredItems = activeCategory === 'all' 
        ? menuItems 
        : menuItems.filter(i => i.category === activeCategory);

    return (
        <div style={styles.container}>
            <div style={styles.navbar}>
                <div style={styles.navLeft}>
                    <button style={styles.backBtn} onClick={() => navigate('/home')}>◀ Trở về</button>
                    <h2 style={styles.navTitle}>COFFEE SHOP POS</h2>
                </div>
                <div style={styles.navRight}>
                    <span style={styles.metaBadge}>👤 {orderMeta.staff}</span>
                    <span style={styles.metaBadge}>🌐 Online</span>
                </div>
            </div>

            <div style={styles.mainLayout}>
                <div style={styles.leftCol}>
                    <h3 style={styles.colTitle}>Danh mục</h3>
                    <div style={styles.categoryList}>
                        {categories.map(cat => (
                            <button 
                                key={cat.id} 
                                style={{...styles.catBtn, ...(activeCategory === cat.id ? styles.catBtnActive : {})}}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={styles.centerCol}>
                    <div style={styles.searchBar}>
                        <input type="text" placeholder="Tìm kiếm món..." style={styles.searchInput} />
                    </div>
                    <div style={styles.menuGrid}>
                        {filteredItems.map(item => (
                            <div key={item.id} style={styles.menuCard} onClick={() => handleOpenModal(item)}>
                                <div style={styles.cardHeader}>
                                    <span style={{ color: item.favorite ? '#f1c40f' : '#555', fontSize: '18px' }}>★</span>
                                    <button style={styles.quickAddBtn}>+</button>
                                </div>
                                <div style={styles.cardName}>{item.name}</div>
                                <div style={styles.cardPrice}>{item.price.toLocaleString()}đ</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.rightCol}>
                    <div style={styles.orderHeader}>
                        <div style={styles.orderMetaRow}>
                            <select style={styles.metaSelect} value={orderMeta.table} onChange={e => setOrderMeta({...orderMeta, table: e.target.value})}>
                                <option>Bàn 5</option><option>Bàn 6</option><option>Bàn 7</option>
                            </select>
                            <select style={styles.metaSelect} value={orderMeta.channel} onChange={e => setOrderMeta({...orderMeta, channel: e.target.value})}>
                                <option>Dine-in</option><option>Takeaway</option><option>Delivery</option>
                            </select>
                            <div style={styles.guestCount}>👥 {orderMeta.guests}</div>
                        </div>
                        {pendingCount > 0 && <div style={styles.pendingBadge}>Chưa gửi bếp: {pendingCount} món</div>}
                    </div>

                    <div style={styles.cartList}>
                        {cart.length === 0 ? (
                            <div style={{textAlign:'center', color:'#888', marginTop:'50px'}}>Chưa có món nào</div>
                        ) : cart.map(item => (
                            <div key={item.cartId} style={{...styles.cartItem, borderLeft: item.status === 'Sent' ? '3px solid #27ae60' : item.status === 'Hold' ? '3px solid #f39c12' : '3px solid #3498db'}}>
                                <div style={styles.cartItemMain}>
                                    <div style={{flex: 1}}>
                                        <div style={styles.cartItemName}>{item.qty}x {item.name}</div>
                                        {item.hasSize && <div style={styles.cartItemDetail}>Size: {item.size}</div>}
                                        {item.toppings.length > 0 && <div style={styles.cartItemDetail}>+ {item.toppings.map(t=>t.name).join(', ')}</div>}
                                        {item.note && <div style={styles.cartItemDetail}>📝 {item.note}</div>}
                                    </div>
                                    <div style={{textAlign: 'right'}}>
                                        <div style={styles.cartItemPrice}>{(item.unitPrice * item.qty).toLocaleString()}đ</div>
                                        <div style={styles.statusLabel(item.status)}>{item.status}</div>
                                    </div>
                                </div>
                                <div style={styles.cartItemActions}>
                                    <button style={styles.actionBtn} onClick={() => handleOpenModal(item, item)}>Sửa</button>
                                    <button style={styles.actionBtn} onClick={() => updateItemStatus(item.cartId, item.status === 'Hold' ? 'Pending' : 'Hold')}>Hold</button>
                                    <button style={{...styles.actionBtn, color: '#e74c3c'}} onClick={() => removeItem(item.cartId, item.name)}>Xóa</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={styles.receiptArea}>
                        <div style={styles.receiptRow}><span>Tạm tính:</span><span>{subtotal.toLocaleString()}đ</span></div>
                        <div style={styles.receiptRow}><span>VAT (8%):</span><span>{tax.toLocaleString()}đ</span></div>
                        <div style={styles.receiptRow}><span>Giảm giá:</span><span>-{orderMeta.discount.toLocaleString()}đ</span></div>
                        <div style={{...styles.receiptRow, ...styles.totalRow}}><span>TỔNG CỘNG:</span><span>{total.toLocaleString()}đ</span></div>
                        
                        <div style={styles.footerBtns}>
                            <button style={styles.sendBtn} onClick={sendToKitchen}>GỬI PHA CHẾ</button>
                            <button style={styles.payBtn}>THANH TOÁN</button>
                        </div>
                    </div>
                </div>
            </div>

            {modalConfig.isOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h3>Tùy chỉnh món: {modalConfig.item.name}</h3>
                            <button style={styles.closeBtn} onClick={() => setModalConfig({...modalConfig, isOpen: false})}>✕</button>
                        </div>

                        <div style={styles.modalBody}>
                            {modalConfig.item.hasSize && (
                                <div style={styles.modSection}>
                                    <h4>Chọn Size</h4>
                                    <div style={styles.radioGroup}>
                                        {['S', 'M', 'L'].map(sz => (
                                            <button key={sz} 
                                                style={{...styles.radioBtn, ...(modalConfig.size === sz ? styles.radioBtnActive : {})}}
                                                onClick={() => setModalConfig({...modalConfig, size: sz})}
                                            >{sz}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {modalConfig.item.hasTopping && (
                                <div style={styles.modSection}>
                                    <h4>Thêm Topping</h4>
                                    <div style={styles.toppingGrid}>
                                        {toppingOptions.map(top => {
                                            const isSelected = modalConfig.toppings.find(t => t.id === top.id);
                                            return (
                                                <div key={top.id} style={{...styles.toppingCard, ...(isSelected ? styles.toppingCardActive : {})}}
                                                    onClick={() => handleToppingToggle(top)}>
                                                    <div>{top.name}</div>
                                                    <div style={{color: '#f1c40f', fontSize: '13px'}}>+{top.price.toLocaleString()}đ</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            <div style={styles.modSection}>
                                <h4>Ghi chú & Số lượng</h4>
                                <div style={styles.qtyNoteRow}>
                                    <div style={styles.qtyControl}>
                                        <button style={styles.qtyBtn} onClick={() => setModalConfig({...modalConfig, qty: Math.max(1, modalConfig.qty - 1)})}>-</button>
                                        <span style={{width: '40px', textAlign: 'center'}}>{modalConfig.qty}</span>
                                        <button style={styles.qtyBtn} onClick={() => setModalConfig({...modalConfig, qty: modalConfig.qty + 1})}>+</button>
                                    </div>
                                    <input type="text" placeholder="Ghi chú bếp (VD: Ít đá, Không đường...)" 
                                        style={styles.noteInput} 
                                        value={modalConfig.note}
                                        onChange={(e) => setModalConfig({...modalConfig, note: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={styles.modalFooter}>
                            <div style={styles.modalTotal}>Tổng: {calculatePreviewPrice().toLocaleString()}đ</div>
                            <button style={styles.addCartBtn} 
                                onClick={() => handleAddToCart(modalConfig.item, modalConfig.size, modalConfig.toppings, modalConfig.qty, modalConfig.note, modalConfig.editCartId)}>
                                {modalConfig.editCartId ? 'CẬP NHẬT' : 'THÊM VÀO ĐƠN'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#121212', color: '#e0e0e0', fontFamily: "'Segoe UI', sans-serif", overflow: 'hidden' },
    navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#1e1e1e', borderBottom: '1px solid #333' },
    navLeft: { display: 'flex', alignItems: 'center', gap: '20px' },
    backBtn: { padding: '8px 15px', backgroundColor: '#2d3436', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    navTitle: { margin: 0, fontSize: '18px', color: '#fff' },
    navRight: { display: 'flex', gap: '15px' },
    metaBadge: { backgroundColor: '#333', padding: '5px 10px', borderRadius: '20px', fontSize: '13px' },
    mainLayout: { display: 'flex', flex: 1, overflow: 'hidden' },
    leftCol: { width: '220px', backgroundColor: '#1e1e1e', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', padding: '20px 10px' },
    colTitle: { margin: '0 0 15px 10px', color: '#aaa', fontSize: '14px', textTransform: 'uppercase' },
    categoryList: { display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' },
    catBtn: { padding: '15px 20px', backgroundColor: 'transparent', color: '#ccc', border: 'none', textAlign: 'left', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', transition: '0.2s' },
    catBtnActive: { backgroundColor: '#3498db', color: '#fff', fontWeight: 'bold' },
    centerCol: { flex: 1, backgroundColor: '#121212', padding: '20px', display: 'flex', flexDirection: 'column' },
    searchBar: { marginBottom: '20px' },
    searchInput: { width: '100%', padding: '12px 15px', backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '15px' },
    menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', overflowY: 'auto', alignContent: 'start', paddingBottom: '20px' },
    menuCard: { backgroundColor: '#1e1e1e', borderRadius: '10px', padding: '15px', cursor: 'pointer', border: '1px solid #333', position: 'relative', transition: 'transform 0.1s' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    quickAddBtn: { width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#3498db', color: '#fff', border: 'none', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    cardName: { fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#fff' },
    cardPrice: { color: '#f1c40f', fontSize: '15px' },
    rightCol: { width: '380px', backgroundColor: '#1a1a1a', borderLeft: '1px solid #333', display: 'flex', flexDirection: 'column' },
    orderHeader: { padding: '15px', backgroundColor: '#222', borderBottom: '1px solid #333' },
    orderMetaRow: { display: 'flex', gap: '10px', marginBottom: '10px' },
    metaSelect: { flex: 1, padding: '8px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '5px' },
    guestCount: { padding: '8px 15px', backgroundColor: '#333', borderRadius: '5px', display: 'flex', alignItems: 'center' },
    pendingBadge: { backgroundColor: '#e74c3c', color: '#fff', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', textAlign: 'center', fontWeight: 'bold' },
    cartList: { flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' },
    cartItem: { backgroundColor: '#222', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' },
    cartItemMain: { display: 'flex', justifyContent: 'space-between' },
    cartItemName: { fontWeight: 'bold', color: '#fff', fontSize: '15px', marginBottom: '4px' },
    cartItemDetail: { fontSize: '12px', color: '#aaa', marginTop: '2px' },
    cartItemPrice: { fontWeight: 'bold', color: '#f1c40f' },
    statusLabel: (status) => ({ fontSize: '11px', padding: '3px 6px', borderRadius: '4px', marginTop: '5px', textAlign: 'center', backgroundColor: status === 'Sent' ? '#27ae60' : status === 'Hold' ? '#f39c12' : '#3498db', color: '#fff' }),
    cartItemActions: { display: 'flex', gap: '10px', borderTop: '1px solid #333', paddingTop: '8px' },
    actionBtn: { flex: 1, padding: '5px', backgroundColor: 'transparent', color: '#aaa', border: '1px solid #444', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' },
    receiptArea: { padding: '20px', backgroundColor: '#222', borderTop: '2px solid #333' },
    receiptRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#aaa', fontSize: '14px' },
    totalRow: { color: '#fff', fontSize: '18px', fontWeight: 'bold', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #555' },
    footerBtns: { display: 'flex', gap: '10px', marginTop: '20px' },
    sendBtn: { flex: 1, padding: '15px', backgroundColor: '#d35400', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    payBtn: { flex: 1, padding: '15px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { width: '500px', backgroundColor: '#1e1e1e', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
    modalHeader: { padding: '20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#222' },
    closeBtn: { background: 'none', border: 'none', color: '#aaa', fontSize: '20px', cursor: 'pointer' },
    modalBody: { padding: '20px', maxHeight: '60vh', overflowY: 'auto' },
    modSection: { marginBottom: '25px' },
    radioGroup: { display: 'flex', gap: '10px', marginTop: '10px' },
    radioBtn: { flex: 1, padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #444', borderRadius: '5px', cursor: 'pointer' },
    radioBtnActive: { backgroundColor: '#3498db', borderColor: '#3498db' },
    toppingGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' },
    toppingCard: { padding: '12px', backgroundColor: '#333', border: '1px solid #444', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' },
    toppingCardActive: { borderColor: '#f1c40f', backgroundColor: '#2a2613' },
    qtyNoteRow: { display: 'flex', gap: '15px', marginTop: '10px' },
    qtyControl: { display: 'flex', alignItems: 'center', backgroundColor: '#333', borderRadius: '5px', overflow: 'hidden' },
    qtyBtn: { width: '35px', height: '40px', backgroundColor: '#444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '18px' },
    noteInput: { flex: 1, padding: '10px', backgroundColor: '#333', border: '1px solid #444', borderRadius: '5px', color: '#fff' },
    modalFooter: { padding: '20px', backgroundColor: '#222', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalTotal: { fontSize: '20px', fontWeight: 'bold', color: '#f1c40f' },
    addCartBtn: { padding: '12px 30px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }
};

export default OrderMon;