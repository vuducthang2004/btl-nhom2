import { useEffect, useState, useCallback } from 'react';
import { menuApi } from '../../api/menuApi';
import { orderApi } from '../../api/orderApi';
import { paymentApi } from '../../api/paymentApi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState('pos');
  const [categories, setCategories] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [orderNotes, setOrderNotes] = useState('');

  const [selectedItemForToppings, setSelectedItemForToppings] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [itemNotes, setItemNotes] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [isToppingsModalOpen, setIsToppingsModalOpen] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [receiptData, setReceiptData] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const [ordersList, setOrdersList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [paidOrderIds, setPaidOrderIds] = useState(new Set());

  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const loadMenuData = useCallback(async () => {
    try {
      const catRes = await menuApi.getCategories();
      const itemsRes = await menuApi.getItems();
      const catList = catRes.data || catRes;
      const itemsList = itemsRes.data || itemsRes;
      setCategories(catList);
      setAllItems(itemsList);
    } catch (error) {
      console.error(error);
      alert('Không thể tải thực đơn từ hệ thống!');
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const params = { date: dateFilter };
      if (statusFilter) {
        params.status = statusFilter;
      }
      const res = await orderApi.getOrders(params);
      const list = res.data || res;
      const orders = Array.isArray(list) ? list : [];
      setOrdersList(orders);

      const pendingOrders = orders.filter(o => o.status === 'PENDING');
      const paidList = await Promise.all(
        pendingOrders.map(async (o) => {
          try {
            const payRes = await paymentApi.getPaymentByOrderId(o.id);
            if (payRes) return o.id;
          } catch (e) {
            return null;
          }
          return null;
        })
      );
      setPaidOrderIds(new Set(paidList.filter(Boolean)));
    } catch (error) {
      console.error(error);
      alert('Không thể tải danh sách hóa đơn!');
    } finally {
      setOrdersLoading(false);
    }
  }, [dateFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMenuData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadMenuData]);

  useEffect(() => {
    if (activeTab === 'orders') {
      const timer = setTimeout(() => {
        loadOrders();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab, loadOrders]);

  const filteredItems = allItems.filter(item => {
    const matchesCategory = selectedCategory === null || item.categoryId === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectItem = (item) => {
    if (!item.isAvailable) return;
    setSelectedItemForToppings(item);
    setSelectedToppings([]);
    setItemNotes('');
    setItemQuantity(1);
    setIsToppingsModalOpen(true);
  };

  const handleToggleTopping = (topping) => {
    if (selectedToppings.find(t => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const handleAddToCart = () => {
    const existingIndex = cart.findIndex(cartItem => 
      cartItem.id === selectedItemForToppings.id &&
      JSON.stringify(cartItem.toppings.map(t => t.id).sort()) === JSON.stringify(selectedToppings.map(t => t.id).sort()) &&
      cartItem.notes === itemNotes
    );

    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += itemQuantity;
      setCart(newCart);
    } else {
      const cartItem = {
        cartId: Date.now() + Math.random().toString(36).substr(2, 9),
        id: selectedItemForToppings.id,
        name: selectedItemForToppings.name,
        basePrice: selectedItemForToppings.basePrice,
        toppings: selectedToppings,
        notes: itemNotes,
        quantity: itemQuantity
      };
      setCart([...cart, cartItem]);
    }

    setIsToppingsModalOpen(false);
    setSelectedItemForToppings(null);
  };

  const handleUpdateCartQuantity = (cartId, delta) => {
    const newCart = cart.map(item => {
      if (item.cartId === cartId) {
        const nextQty = item.quantity + delta;
        return nextQty > 0 ? { ...item, quantity: nextQty } : null;
      }
      return item;
    }).filter(Boolean);
    setCart(newCart);
  };

  const handleRemoveFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => {
      const toppingSum = item.toppings.reduce((tSum, t) => tSum + t.price, 0);
      return sum + (item.basePrice + toppingSum) * item.quantity;
    }, 0);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  const handleProcessPayment = async () => {
    try {
      setPaymentLoading(true);
      const orderPayload = {
        items: cart.map(cartItem => ({
          menuItemId: cartItem.id,
          quantity: cartItem.quantity,
          notes: cartItem.notes || undefined,
          toppingIds: cartItem.toppings.map(t => t.id)
        })),
        notes: orderNotes || undefined
      };

      const orderRes = await orderApi.createOrder(orderPayload);
      const orderInfo = orderRes.data || orderRes;
      const orderId = orderInfo.id;

      const paymentPayload = {
        orderId: orderId,
        method: paymentMethod,
        transactionRef: (paymentMethod !== 'CASH' && transactionRef.trim() !== '') ? transactionRef : undefined
      };

      await paymentApi.processPayment(paymentPayload);

      try {
        await orderApi.updateOrderStatus(orderId, 'PREPARING');
      } catch (e) {
        console.error(e);
      }

      setReceiptData({
        orderId: orderId,
        queueNumber: orderInfo.queueNumber || orderInfo.queue_number,
        method: paymentMethod,
        transactionRef: transactionRef,
        total: getCartTotal(),
        items: [...cart],
        date: new Date()
      });

      setCart([]);
      setOrderNotes('');
      setTransactionRef('');
      setPaymentMethod('CASH');
      setIsPaymentModalOpen(false);
      setIsReceiptModalOpen(true);
      loadOrders();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra trong quá trình xử lý đơn hàng và thanh toán.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleProcessUnpaidPayment = async (order) => {
    setReceiptData({
      orderId: order.id,
      queueNumber: order.queueNumber || order.queue_number,
      total: Number(order.totalAmount || order.total_amount || 0),
      items: order.items || [],
      isUnpaidOrder: true
    });
    setPaymentMethod('CASH');
    setTransactionRef('');
    setIsPaymentModalOpen(true);
  };

  const handlePayForExistingOrder = async () => {
    try {
      setPaymentLoading(true);
      const paymentPayload = {
        orderId: receiptData.orderId,
        method: paymentMethod,
        transactionRef: (paymentMethod !== 'CASH' && transactionRef.trim() !== '') ? transactionRef : undefined
      };

      await paymentApi.processPayment(paymentPayload);

      try {
        await orderApi.updateOrderStatus(receiptData.orderId, 'PREPARING');
      } catch (e) {
        console.error(e);
      }

      setIsPaymentModalOpen(false);
      setReceiptData(null);
      setTransactionRef('');
      setPaymentMethod('CASH');
      loadOrders();
      alert('Thanh toán đơn hàng thành công!');
    } catch (error) {
      console.error(error);
      const isAlreadyPaid = error.response?.status === 409 || error.response?.data?.message === 'Order already paid';
      if (isAlreadyPaid) {
        try {
          await orderApi.updateOrderStatus(receiptData.orderId, 'PREPARING');
        } catch (e) {
          console.error(e);
        }
        setIsPaymentModalOpen(false);
        setReceiptData(null);
        setTransactionRef('');
        setPaymentMethod('CASH');
        loadOrders();
        alert('Đơn hàng này đã được thanh toán thành công!');
      } else {
        alert(error.response?.data?.message || 'Không thể thực hiện thanh toán.');
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await orderApi.updateOrderStatus(orderId, 'COMPLETED');
      loadOrders();
      alert('Đã cập nhật đơn hàng thành hoàn thành!');
    } catch (error) {
      console.error(error);
      alert('Lỗi cập nhật trạng thái đơn hàng.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    try {
      await orderApi.updateOrderStatus(orderId, 'CANCELLED');
      loadOrders();
      alert('Đã hủy đơn hàng thành công!');
    } catch (error) {
      console.error(error);
      alert('Lỗi khi hủy đơn hàng.');
    }
  };

  const handleShowOrderDetails = async (order) => {
    try {
      const res = await orderApi.getOrderById(order.id);
      const details = res.data || res;
      setSelectedOrderDetails(details);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error(error);
      alert('Không thể tải chi tiết đơn hàng.');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const orderColumns = [
    { header: 'ID', render: (row) => <span className="text-muted">#{row.id}</span> },
    { header: 'Số thứ tự', render: (row) => <strong style={{ fontSize: '16px', color: 'var(--color-primary)' }}>#{row.queueNumber ?? row.queue_number}</strong> },
    { 
      header: 'Thời gian', 
      render: (row) => new Date(row.createdAt ?? row.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
    },
    { 
      header: 'Tổng tiền', 
      render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{formatCurrency(row.totalAmount ?? row.total_amount)}</strong> 
    },
    { 
      header: 'Trạng thái', 
      render: (row) => {
        let bg = '#777';
        let label = row.status;
        if (row.status === 'PENDING') {
          if (paidOrderIds.has(row.id)) {
            bg = '#9c27b0';
            label = 'Đang chế biến';
          } else {
            bg = '#ff9800';
            label = 'Chờ thanh toán';
          }
        }
        else if (row.status === 'PREPARING') { bg = '#9c27b0'; label = 'Đang chế biến'; }
        else if (row.status === 'READY') { bg = '#4caf50'; label = 'Chờ lấy đồ'; }
        else if (row.status === 'COMPLETED') { bg = '#2196f3'; label = 'Đã hoàn thành'; }
        else if (row.status === 'CANCELLED') { bg = '#f44336'; label = 'Đã hủy'; }

        return (
          <span style={{ 
            padding: '4px 8px', 
            borderRadius: '12px', 
            fontSize: '12px', 
            fontWeight: 'bold',
            backgroundColor: bg,
            color: '#fff'
          }}>
            {label}
          </span>
        );
      } 
    },
    { 
      header: 'Thao tác', 
      align: 'right',
      render: (row) => (
        <div className="flex items-center" style={{ justifyContent: 'flex-end', gap: '8px' }}>
          <Button variant="text" style={{ padding: '4px 8px' }} onClick={() => handleShowOrderDetails(row)}>Chi tiết</Button>
          {row.status === 'PENDING' && !paidOrderIds.has(row.id) && (
            <>
              <Button variant="primary" style={{ padding: '4px 10px', fontSize: '13px' }} onClick={() => handleProcessUnpaidPayment(row)}>Thanh toán</Button>
              <Button variant="danger" style={{ padding: '4px 10px', fontSize: '13px' }} onClick={() => handleCancelOrder(row.id)}>Hủy</Button>
            </>
          )}
          {(row.status === 'PREPARING' || (row.status === 'PENDING' && paidOrderIds.has(row.id))) && (
            <Button variant="danger" style={{ padding: '4px 10px', fontSize: '13px' }} onClick={() => handleCancelOrder(row.id)}>Hủy</Button>
          )}
          {row.status === 'READY' && (
            <Button style={{ padding: '4px 10px', fontSize: '13px', backgroundColor: '#4caf50', borderColor: '#4caf50' }} onClick={() => handleCompleteOrder(row.id)}>Hoàn thành</Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="flex-col gap-4" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
        <div className="flex items-center gap-4">
          <h2 style={{ color: 'var(--color-primary)' }}>💼 Màn hình Thu ngân & Bán hàng</h2>
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--color-secondary)', padding: '4px', borderRadius: '8px' }}>
            <button 
              onClick={() => setActiveTab('pos')}
              style={{
                padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600',
                backgroundColor: activeTab === 'pos' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'pos' ? '#fff' : 'var(--color-primary)',
                transition: 'all 0.2s'
              }}
            >
              Gọi món (POS)
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600',
                backgroundColor: activeTab === 'orders' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'orders' ? '#fff' : 'var(--color-primary)',
                transition: 'all 0.2s'
              }}
            >
              Quản lý Hóa đơn
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'pos' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '70% 30%', gap: '20px', flex: 1, overflow: 'hidden' }}>
          <div className="flex-col gap-4" style={{ height: '100%', overflowY: 'auto', paddingRight: '4px' }}>
            <div className="flex justify-between items-center gap-4" style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', flex: 1, padding: '4px 0' }}>
                <Button 
                  variant={selectedCategory === null ? 'primary' : 'outline'}
                  onClick={() => setSelectedCategory(null)}
                  style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
                >
                  Tất cả
                </Button>
                {categories.map(cat => (
                  <Button 
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'primary' : 'outline'}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
              <div style={{ width: '250px' }}>
                <input 
                  type="text"
                  placeholder="Tìm món ăn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: '1px solid var(--color-border)', outline: 'none', fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {filteredItems.map(item => (
                <div 
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  style={{
                    backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)', cursor: item.isAvailable ? 'pointer' : 'not-allowed',
                    border: '1px solid var(--color-border)', transition: 'all 0.2s',
                    position: 'relative', display: 'flex', flexDirection: 'column', height: '180px'
                  }}
                  onMouseEnter={(e) => { if(item.isAvailable) e.currentTarget.style.transform = 'translateY(-4px)' }}
                  onMouseLeave={(e) => { if(item.isAvailable) e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ height: '100px', backgroundColor: '#e5dcd5', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                    <img 
                      src={item.imageUrl || (
                        item.name?.toLowerCase().includes('cà phê') || item.name?.toLowerCase().includes('bạc xỉu') ? 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' : 
                        item.name?.toLowerCase().includes('trà') ? 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' :
                        item.name?.toLowerCase().includes('sinh tố') || item.name?.toLowerCase().includes('nước ép') ? 'https://images.unsplash.com/photo-1623512297893-6c701bcbf7e1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' :
                        item.name?.toLowerCase().includes('bánh') ? 'https://images.unsplash.com/photo-1579306194872-64d3b7bac4c2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' :
                        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
                      )} 
                      alt={item.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text-main)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {item.name}
                    </div>
                    <div style={{ fontWeight: '700', color: 'var(--color-primary)', fontSize: '14px' }}>
                      {formatCurrency(item.basePrice)}
                    </div>
                  </div>
                  {!item.isAvailable && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: 'rgba(255,255,255,0.8)', display: 'flex',
                      justifyContent: 'center', alignItems: 'center', zIndex: 2
                    }}>
                      <span style={{
                        padding: '6px 12px', backgroundColor: 'var(--color-error)', color: '#fff',
                        fontWeight: 'bold', fontSize: '12px', borderRadius: '8px'
                      }}>
                        TẠM HẾT HÀNG
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>
                  Không tìm thấy món ăn nào phù hợp.
                </div>
              )}
            </div>
          </div>

          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-secondary)' }}>
              <h3 style={{ margin: 0, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🛒 Giỏ hàng ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {cart.map(item => {
                const toppingSum = item.toppings.reduce((sum, t) => sum + t.price, 0);
                const itemTotal = (item.basePrice + toppingSum) * item.quantity;
                return (
                  <div key={item.cartId} style={{
                    paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid #eee',
                    display: 'flex', flexDirection: 'column', gap: '4px'
                  }}>
                    <div className="flex justify-between items-start">
                      <div style={{ fontWeight: '600', fontSize: '14px', flex: 1, paddingRight: '8px' }}>{item.name}</div>
                      <div style={{ fontWeight: '600', color: 'var(--color-primary)', fontSize: '14px' }}>{formatCurrency(itemTotal)}</div>
                    </div>
                    {item.toppings.length > 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', paddingLeft: '8px' }}>
                        + Topping: {item.toppings.map(t => `${t.name} (${formatCurrency(t.price)})`).join(', ')}
                      </div>
                    )}
                    {item.notes && (
                      <div style={{ fontSize: '12px', color: '#b8860b', backgroundColor: '#fffbe6', padding: '4px 8px', borderRadius: '4px' }}>
                        💡 {item.notes}
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleUpdateCartQuantity(item.cartId, -1)}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}
                        >
                          -
                        </button>
                        <span style={{ fontWeight: 'bold', fontSize: '14px', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateCartQuantity(item.cartId, 1)}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => handleRemoveFromCart(item.cartId)}
                        style={{ border: 'none', background: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: '13px' }}
                      >
                        Xóa khỏi giỏ
                      </button>
                    </div>
                  </div>
                );
              })}
              {cart.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px 0', fontSize: '14px' }}>
                  Chưa có sản phẩm nào. Chọn món bên trái để bắt đầu.
                </div>
              )}
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', backgroundColor: '#fafafa' }}>
              <div style={{ marginBottom: '12px' }}>
                <input 
                  type="text"
                  placeholder="Ghi chú toàn bộ đơn hàng (nếu có)..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)',
                    fontSize: '13px', outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div className="flex justify-between" style={{ fontSize: '14px' }}>
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(cart.reduce((sum, item) => sum + item.basePrice * item.quantity, 0))}</span>
                </div>
                <div className="flex justify-between" style={{ fontSize: '14px' }}>
                  <span>Tổng tiền Topping:</span>
                  <span>{formatCurrency(cart.reduce((sum, item) => sum + item.toppings.reduce((ts, t) => ts + t.price, 0) * item.quantity, 0))}</span>
                </div>
                <div className="flex justify-between" style={{ fontSize: '16px', fontWeight: 'bold', borderTop: '1px solid #eee', paddingTop: '8px', color: 'var(--color-primary)' }}>
                  <span>TỔNG CỘNG:</span>
                  <span>{formatCurrency(getCartTotal())}</span>
                </div>
              </div>

              <Button 
                onClick={handleCheckoutSubmit}
                disabled={cart.length === 0}
                style={{ width: '100%', padding: '14px' }}
              >
                GỬI BẾP & THANH TOÁN
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-col gap-4" style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Chọn ngày</label>
              <input 
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Lọc trạng thái</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ thanh toán</option>
                <option value="PREPARING">Đang chế biến</option>
                <option value="READY">Chờ lấy đồ</option>
                <option value="COMPLETED">Đã hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
              <Button onClick={loadOrders} style={{ padding: '8px 16px' }}>🔄 Làm mới danh sách</Button>
            </div>
          </div>

          <Card style={{ padding: 0 }}>
            {ordersLoading ? (
              <div className="text-center text-muted" style={{ padding: '40px' }}>Đang tải danh sách hóa đơn...</div>
            ) : (
              <Table 
                columns={orderColumns} 
                data={ordersList} 
                emptyMessage="Không tìm thấy hóa đơn nào trong thời gian này." 
              />
            )}
          </Card>
        </div>
      )}

      <Modal 
        isOpen={isToppingsModalOpen}
        onClose={() => { setIsToppingsModalOpen(false); setSelectedItemForToppings(null); }}
        title={`Cấu hình món: ${selectedItemForToppings?.name}`}
        onSubmit={handleAddToCart}
        submitText="Thêm vào giỏ"
      >
        {selectedItemForToppings && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Chọn Topping đi kèm:</div>
              {selectedItemForToppings.toppings && selectedItemForToppings.toppings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedItemForToppings.toppings.map(topping => (
                    <div 
                      key={topping.id}
                      onClick={() => topping.isAvailable && handleToggleTopping(topping)}
                      style={{
                        padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        cursor: topping.isAvailable ? 'pointer' : 'not-allowed',
                        backgroundColor: selectedToppings.find(t => t.id === topping.id) ? 'var(--color-secondary)' : '#fff',
                        borderColor: selectedToppings.find(t => t.id === topping.id) ? 'var(--color-primary)' : 'var(--color-border)',
                        opacity: topping.isAvailable ? 1 : 0.5
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          checked={!!selectedToppings.find(t => t.id === topping.id)}
                          disabled={!topping.isAvailable}
                          onChange={() => {}}
                          style={{ cursor: topping.isAvailable ? 'pointer' : 'not-allowed' }}
                        />
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{topping.name}</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                        +{formatCurrency(topping.price)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  Không có tùy chọn Topping cho món này.
                </div>
              )}
            </div>

            <div>
              <label style={{ fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Ghi chú riêng cho món này:</label>
              <input 
                type="text"
                placeholder="Ví dụ: ít đá, không đường, thêm sữa..."
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)',
                  fontSize: '14px', outline: 'none'
                }}
              />
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }} className="flex justify-between items-center">
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Số lượng:</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--color-border)', cursor: 'pointer', fontSize: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}
                >
                  -
                </button>
                <span style={{ fontWeight: 'bold', fontSize: '18px', width: '20px', textAlign: 'center' }}>{itemQuantity}</span>
                <button 
                  onClick={() => setItemQuantity(itemQuantity + 1)}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--color-border)', cursor: 'pointer', fontSize: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Thanh toán Đơn hàng"
        onSubmit={receiptData?.isUnpaidOrder ? handlePayForExistingOrder : handleProcessPayment}
        submitText={paymentLoading ? "Đang xử lý..." : "Xác nhận thanh toán"}
        loading={paymentLoading}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'var(--color-secondary)', borderRadius: '12px' }}>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Cần thanh toán</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              {formatCurrency(receiptData?.isUnpaidOrder ? receiptData.total : getCartTotal())}
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Phương thức thanh toán:</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[
                { id: 'CASH', label: 'Tiền mặt', icon: '💵' },
                { id: 'TRANSFER', label: 'Chuyển khoản', icon: '🏦' },
                { id: 'E_WALLET', label: 'Ví điện tử', icon: '📱' }
              ].map(m => (
                <div 
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  style={{
                    padding: '16px 8px', borderRadius: '8px', border: '1px solid var(--color-border)',
                    textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                    backgroundColor: paymentMethod === m.id ? 'var(--color-secondary)' : '#fff',
                    borderColor: paymentMethod === m.id ? 'var(--color-primary)' : 'var(--color-border)',
                    fontWeight: paymentMethod === m.id ? 'bold' : 'normal'
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{m.icon}</div>
                  <div style={{ fontSize: '13px' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {paymentMethod !== 'CASH' && (
            <Input 
              label="Mã tham chiếu / Số giao dịch" 
              placeholder="Nhập mã tham chiếu từ ứng dụng ngân hàng/ví..."
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
            />
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={isReceiptModalOpen}
        onClose={() => { setIsReceiptModalOpen(false); setReceiptData(null); }}
        title="Đơn hàng & Hóa đơn đã hoàn thành"
        onSubmit={handlePrintReceipt}
        submitText="In hóa đơn"
      >
        {receiptData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'Courier New, Courier, monospace' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #ccc', paddingBottom: '12px' }}>
              <h2 style={{ margin: '0 0 8px 0', color: 'var(--color-primary)' }}>☕ COFFEE SHOP</h2>
              <div style={{ fontSize: '12px' }}>Đơn hàng: #{receiptData.orderId}</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '12px 0', color: 'var(--color-primary)' }}>
                SỐ THỨ TỰ: #{receiptData.queueNumber}
              </div>
              <div style={{ fontSize: '12px' }}>
                Thời gian: {receiptData.date ? receiptData.date.toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN')}
              </div>
            </div>

            <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>CHI TIẾT:</div>
              {receiptData.items?.map((item, idx) => (
                <div key={idx} style={{ marginBottom: '8px', fontSize: '13px' }}>
                  <div className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{formatCurrency(item.basePrice * item.quantity)}</span>
                  </div>
                  {item.toppings?.length > 0 && (
                    <div style={{ paddingLeft: '12px', fontSize: '11px', color: '#666' }}>
                      + Topping: {item.toppings.map(t => t.name).join(', ')}
                    </div>
                  )}
                  {item.notes && (
                    <div style={{ paddingLeft: '12px', fontSize: '11px', color: '#b8860b' }}>
                      * Ghi chú: {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ borderBottom: '1px dashed #ccc', paddingBottom: '12px' }} className="flex justify-between">
              <span>Phương thức:</span>
              <strong>{receiptData.method === 'CASH' ? 'Tiền mặt' : receiptData.method === 'TRANSFER' ? 'Chuyển khoản' : 'Ví điện tử'}</strong>
            </div>

            <div style={{ fontSize: '18px', fontWeight: 'bold' }} className="flex justify-between">
              <span>TỔNG TIỀN:</span>
              <span>{formatCurrency(receiptData.total)}</span>
            </div>

            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', fontStyle: 'italic', borderTop: '1px dashed #ccc', paddingTop: '12px' }}>
              Cảm ơn quý khách. Hân hạnh được phục vụ!
            </div>
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={isDetailsModalOpen}
        onClose={() => { setIsDetailsModalOpen(false); setSelectedOrderDetails(null); }}
        title={`Chi tiết đơn hàng #${selectedOrderDetails?.id}`}
        onSubmit={() => setIsDetailsModalOpen(false)}
        submitText="Đóng"
      >
        {selectedOrderDetails && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
              <div>
                <span className="text-muted" style={{ fontSize: '12px', display: 'block' }}>Số thứ tự bếp</span>
                <strong>#{selectedOrderDetails.queueNumber ?? selectedOrderDetails.queue_number}</strong>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: '12px', display: 'block' }}>Thời gian tạo đơn</span>
                <strong>{new Date(selectedOrderDetails.createdAt ?? selectedOrderDetails.created_at).toLocaleString('vi-VN')}</strong>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: '12px', display: 'block' }}>Trạng thái đơn</span>
                <span style={{ fontWeight: 'bold' }}>{selectedOrderDetails.status}</span>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: '12px', display: 'block' }}>Tổng hóa đơn</span>
                <strong style={{ color: 'var(--color-primary)' }}>{formatCurrency(selectedOrderDetails.totalAmount ?? selectedOrderDetails.total_amount)}</strong>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Món đã gọi:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedOrderDetails.items?.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '13px' }}>
                    <div className="flex justify-between">
                      <strong>{item.quantity}x {item.name || item.menuItemName}</strong>
                      <span>{formatCurrency((item.price ?? item.basePrice ?? 0) * item.quantity)}</span>
                    </div>
                    {item.toppings && item.toppings.length > 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', paddingLeft: '8px' }}>
                        + Topping: {item.toppings.map(t => `${t.name} (+${formatCurrency(t.price)})`).join(', ')}
                      </div>
                    )}
                    {item.notes && (
                      <div style={{ fontSize: '12px', color: '#b8860b', paddingLeft: '8px' }}>
                        * Ghi chú: {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedOrderDetails.notes && (
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Ghi chú chung:</span>
                <div style={{ backgroundColor: '#fffbe6', padding: '8px 12px', borderRadius: '4px', fontSize: '13px' }}>
                  {selectedOrderDetails.notes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;
