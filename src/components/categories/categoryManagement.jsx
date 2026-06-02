
import React, { useState, useEffect } from 'react';
import { categoryApi } from '../../api/categoryApi';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await categoryApi.update(editingId, formData);
        alert('Cập nhật thành công!');
      } else {
        await categoryApi.create(formData);
        alert('Tạo danh mục thành công!');
      }
      
      setFormData({ name: '', description: '' });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      alert(err.message); 
    }
  };

  const handleEdit = (category) => {
    setFormData({ name: category.name, description: category.description || '' });
    setEditingId(category.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá danh mục này?')) {
      try {
        await categoryApi.delete(id);
        fetchCategories();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Quản lý Danh mục (Thực đơn)</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
        <h3>{editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Tên danh mục (VD: Cà phê, Trà...)"
            value={formData.name}
            onChange={handleInputChange}
            required
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <input
            type="text"
            name="description"
            placeholder="Mô tả"
            value={formData.description}
            onChange={handleInputChange}
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <button type="submit" style={{ padding: '6px 15px' }}>
            {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
          </button>
          {editingId && (
            <button 
              type="button" 
              onClick={() => { setEditingId(null); setFormData({ name: '', description: '' }); }}
              style={{ marginLeft: '10px' }}
            >
              Huỷ
            </button>
          )}
        </form>
      </div>
      {loading ? <p>Đang tải dữ liệu...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Tên danh mục</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{cat.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{cat.name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                  <button onClick={() => handleEdit(cat)} style={{ marginRight: '10px' }}>Sửa</button>
                  <button onClick={() => handleDelete(cat.id)} style={{ color: 'red' }}>Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CategoryManagement;