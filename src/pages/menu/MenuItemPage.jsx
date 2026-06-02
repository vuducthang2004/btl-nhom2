import React, { useEffect, useState } from 'react';
import { menuApi } from '../../api/menuApi';
import { useApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const MenuItemPage = () => {
  const { data: items, loading, error, execute: fetchItems } = useApi(menuApi.getItems);
  const { data: categories, execute: fetchCategories } = useApi(menuApi.getCategories);
  const { execute: createItem, loading: creating } = useApi(menuApi.createItem);
  const { execute: updateItem, loading: updating } = useApi(menuApi.updateItem);
  const { execute: toggleAvailability } = useApi(menuApi.toggleItemAvailability);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    basePrice: '', 
    categoryId: '' 
  });

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [fetchItems, fetchCategories]);

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ 
        name: item.name, 
        description: item.description || '',
        basePrice: item.basePrice,
        categoryId: item.categoryId || (categories && categories.length > 0 ? categories[0].id : '')
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        name: '', 
        description: '',
        basePrice: '',
        categoryId: categories && categories.length > 0 ? categories[0].id : ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.basePrice || !formData.categoryId) {
      alert('Vui lòng nhập đủ các trường bắt buộc (Tên, Giá, Danh mục)!');
      return;
    }

    try {
      const payload = {
        ...formData,
        categoryId: Number(formData.categoryId),
        basePrice: Number(formData.basePrice)
      };

      if (editingItem) {
        await updateItem(editingItem.id, payload);
      } else {
        await createItem(payload);
      }
      closeModal();
      fetchItems();
    } catch (err) {
      alert('Có lỗi xảy ra khi lưu món ăn!');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleAvailability(id); 
      fetchItems();
    } catch (err) {
      alert('Không thể cập nhật trạng thái món ăn!');
    }
  };

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const columns = [
    { header: 'ID', render: (row) => <span className="text-muted">#{row.id}</span> },
    { 
      header: 'Tên món', 
      render: (row) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{row.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{row.categoryName || '---'}</div>
        </div>
      ) 
    },
    { header: 'Giá bán', render: (row) => <span style={{ fontWeight: '500', color: 'var(--color-primary)' }}>{formatCurrency(row.basePrice)}</span> },
    { 
      header: 'Trạng thái', 
      render: (row) => (
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '12px', 
          fontSize: '12px', 
          fontWeight: 'bold',
          backgroundColor: row.isAvailable ? 'var(--color-success)' : 'var(--color-error)',
          color: '#fff'
        }}>
          {row.isAvailable ? 'Đang Bán' : 'Hết Hàng'}
        </span>
      ) 
    },
    { 
      header: 'Thao tác', 
      align: 'right',
      render: (row) => (
        <div className="flex items-center" style={{ justifyContent: 'flex-end', gap: '8px' }}>
          <Button 
            variant="outline" 
            style={{ padding: '4px 8px', fontSize: '12px' }} 
            onClick={() => handleToggleStatus(row.id)}
          >
            {row.isAvailable ? 'Tạm ngưng' : 'Mở bán'}
          </Button>
          <Button variant="text" style={{ padding: '4px 8px' }} onClick={() => openModal(row)}>Sửa</Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <h2>☕ Quản lý Món ăn</h2>
        <Button onClick={() => openModal()}>+ Thêm món mới</Button>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      )}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="text-center text-muted" style={{ padding: '40px' }}>Đang tải danh sách món ăn...</div>
        ) : (
          <Table 
            columns={columns} 
            data={Array.isArray(items) ? items : []} 
            emptyMessage="Chưa có món ăn nào. Hãy thêm mới!" 
          />
        )}
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingItem ? "Sửa món ăn" : "Thêm món ăn mới"}
        onSubmit={handleSubmit}
        loading={creating || updating}
      >
        <Input 
          label="Tên món ăn" 
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})} 
          required 
          placeholder="Ví dụ: Cà phê đen đá..."
        />
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
            Danh mục <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <select 
            value={formData.categoryId}
            onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '8px', 
              border: '1px solid var(--color-border)', outline: 'none',
              backgroundColor: '#fafafa', fontSize: '15px'
            }}
          >
            <option value="">-- Chọn danh mục --</option>
            {Array.isArray(categories) && categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <Input 
          label="Giá bán cơ bản (VNĐ)" 
          type="number"
          value={formData.basePrice} 
          onChange={(e) => setFormData({...formData, basePrice: e.target.value})} 
          required 
          placeholder="25000"
        />

        <Input 
          label="Mô tả" 
          value={formData.description} 
          onChange={(e) => setFormData({...formData, description: e.target.value})} 
          placeholder="Giới thiệu ngắn về món..."
        />
      </Modal>
    </div>
  );
};

export default MenuItemPage;