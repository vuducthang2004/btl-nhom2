import React, { useEffect, useState } from 'react';
import { menuApi } from '../../api/menuApi';
import { useApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const ToppingPage = () => {
  const { data: toppings, loading, error, execute: fetchToppings } = useApi(menuApi.getToppings);
  const { execute: createTopping, loading: creating } = useApi(menuApi.createTopping);
  const { execute: updateTopping, loading: updating } = useApi(menuApi.updateTopping);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '' });

  useEffect(() => {
    fetchToppings();
  }, [fetchToppings]);

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, price: item.price });
    } else {
      setEditingItem(null);
      setFormData({ name: '', price: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.price) {
      alert('Vui lòng nhập đủ Tên topping và Giá tiền!');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price)
      };

      if (editingItem) {
        await updateTopping(editingItem.id, payload);
      } else {
        await createTopping(payload);
      }
      closeModal();
      fetchToppings();
    } catch (err) {
      alert('Có lỗi xảy ra khi lưu topping!');
    }
  };

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const columns = [
    { header: 'ID', render: (row) => <span className="text-muted">#{row.id}</span> },
    { header: 'Tên Topping', render: (row) => <span style={{ fontWeight: 'bold' }}>{row.name}</span> },
    { header: 'Giá bán', render: (row) => <span style={{ fontWeight: '500', color: 'var(--color-primary)' }}>+{formatCurrency(row.price)}</span> },
    { 
      header: 'Trạng thái', 
      render: (row) => (
        <span style={{ 
          color: row.isAvailable ? 'var(--color-success)' : 'var(--color-error)',
          fontWeight: 'bold'
        }}>
          {row.isAvailable ? 'Còn hàng' : 'Hết hàng'}
        </span>
      ) 
    },
    { 
      header: 'Thao tác', 
      align: 'right',
      render: (row) => (
        <Button variant="text" style={{ padding: '4px 8px' }} onClick={() => openModal(row)}>Sửa</Button>
      )
    }
  ];

  return (
    <div className="flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <h2>🍒 Quản lý Topping</h2>
        <Button onClick={() => openModal()}>+ Thêm topping mới</Button>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      )}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="text-center text-muted" style={{ padding: '40px' }}>Đang tải danh sách topping...</div>
        ) : (
          <Table columns={columns} data={Array.isArray(toppings) ? toppings : []} emptyMessage="Chưa có topping nào." />
        )}
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingItem ? "Sửa topping" : "Thêm topping mới"}
        onSubmit={handleSubmit}
        loading={creating || updating}
      >
        <Input 
          label="Tên topping" 
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})} 
          required 
          placeholder="Ví dụ: Trân châu trắng"
        />
        <Input 
          label="Giá cộng thêm (VNĐ)" 
          type="number"
          value={formData.price} 
          onChange={(e) => setFormData({...formData, price: e.target.value})} 
          required 
          placeholder="5000"
        />
      </Modal>
    </div>
  );
};

export default ToppingPage;
