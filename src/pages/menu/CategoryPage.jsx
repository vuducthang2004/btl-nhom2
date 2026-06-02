import React, { useEffect, useState, useCallback } from 'react';
import { menuApi } from '../../api/menuApi';
import { useApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const CategoryPage = () => {
  const { data: categories, loading, error, execute: fetchCategories } = useApi(menuApi.getCategories);
  const { execute: createCategory, loading: creating } = useApi(menuApi.createCategory);
  const { execute: updateCategory, loading: updating } = useApi(menuApi.updateCategory);
  const { execute: deleteCategory } = useApi(menuApi.deleteCategory);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên danh mục!');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      closeModal();
      fetchCategories(); 
    } catch (err) {
      alert('Có lỗi xảy ra khi lưu danh mục!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Các món ăn bên trong có thể bị ảnh hưởng.')) {
      try {
        await deleteCategory(id);
        fetchCategories();
      } catch (err) {
        alert('Xóa thất bại!');
      }
    }
  };

  const columns = [
    { header: 'ID', render: (row) => <span className="text-muted">#{row.id}</span> },
    { header: 'Tên danh mục', render: (row) => <span style={{ fontWeight: 'bold' }}>{row.name}</span> },
    { header: 'Mô tả', accessor: 'description', render: (row) => row.description || '---' },
    { 
      header: 'Thao tác', 
      align: 'right',
      render: (row) => (
        <div className="flex items-center" style={{ justifyContent: 'flex-end', gap: '8px' }}>
          <Button variant="text" style={{ padding: '4px 8px' }} onClick={() => openModal(row)}>Sửa</Button>
          <Button variant="danger" style={{ padding: '4px 8px' }} onClick={() => handleDelete(row.id)}>Xoá</Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <h2>📋 Quản lý Danh mục</h2>
        <Button onClick={() => openModal()}>+ Thêm danh mục</Button>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      )}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="text-center text-muted" style={{ padding: '40px' }}>Đang tải dữ liệu...</div>
        ) : (
          <Table 
            columns={columns} 
            data={categories} 
            emptyMessage="Chưa có danh mục nào. Hãy thêm mới!" 
          />
        )}
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
        onSubmit={handleSubmit}
        loading={creating || updating}
      >
        <Input 
          label="Tên danh mục" 
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})} 
          required 
          placeholder="Ví dụ: Cà phê, Trà sữa..."
        />
        <Input 
          label="Mô tả" 
          value={formData.description} 
          onChange={(e) => setFormData({...formData, description: e.target.value})} 
          placeholder="Mô tả ngắn về danh mục này..."
        />
      </Modal>
    </div>
  );
};

export default CategoryPage;