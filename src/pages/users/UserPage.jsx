import React, { useEffect, useState } from 'react';
import { userApi } from '../../api/userApi';
import { useApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const UserPage = () => {
  const { data: users, loading, error, execute: fetchUsers } = useApi(userApi.getUsers);
  const { execute: createUser, loading: creating } = useApi(userApi.createUser);
  const { execute: toggleActive } = useApi(userApi.toggleActive);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', fullName: '', role: 'CASHIER' });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreateModal = () => {
    setFormData({ username: '', password: '', fullName: '', role: 'CASHIER' });
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!formData.username.trim() || !formData.password.trim() || !formData.fullName.trim()) {
      alert('Vui lòng nhập Tên đăng nhập, Mật khẩu và Họ tên!');
      return;
    }
    try {
      await createUser(formData);
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert('Lỗi tạo tài khoản!');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleActive(id);
      fetchUsers();
    } catch (err) {
      alert('Lỗi cập nhật trạng thái nhân viên!');
    }
  };

  const columns = [
    { header: 'ID', render: (row) => <span className="text-muted">#{row.id}</span> },
    { 
      header: 'Nhân viên', 
      render: (row) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{row.fullName}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>@{row.username || row.fullName.toLowerCase().replace(/\s/g, '')}</div>
        </div>
      ) 
    },
    { 
      header: 'Vai trò', 
      render: (row) => {
        let color = '#3498db';
        if (row.role === 'OWNER') color = '#9b59b6';
        if (row.role === 'BARISTA') color = '#e67e22';
        return <span style={{ color, fontWeight: 'bold' }}>{row.role}</span>;
      } 
    },
    { 
      header: 'Trạng thái', 
      render: (row) => (
        <span style={{ 
          color: row.isActive ? 'var(--color-success)' : 'var(--color-error)',
          fontWeight: 'bold'
        }}>
          {row.isActive ? 'Hoạt động' : 'Đã khóa'}
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
            style={{ padding: '4px 8px', fontSize: '12px', color: row.isActive ? 'var(--color-error)' : 'var(--color-success)' }} 
            onClick={() => handleToggleActive(row.id)}
          >
            {row.isActive ? 'Khóa' : 'Mở khóa'}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <h2>👥 Quản lý Nhân viên</h2>
        <Button onClick={openCreateModal}>+ Thêm tài khoản mới</Button>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      )}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="text-center text-muted" style={{ padding: '40px' }}>Đang tải danh sách...</div>
        ) : (
          <Table columns={columns} data={Array.isArray(users) ? users : []} emptyMessage="Chưa có tài khoản nào." />
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm Tài Khoản Nhân Viên" onSubmit={handleCreateSubmit} loading={creating}>
        <Input label="Họ và tên" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />
        <Input label="Tên đăng nhập" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
        <Input label="Mật khẩu" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
            Vai trò (Quyền hạn) <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          <select 
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: '8px', 
              border: '1px solid var(--color-border)', outline: 'none',
              backgroundColor: '#fafafa', fontSize: '15px'
            }}
          >
            <option value="CASHIER">CASHIER (Thu ngân)</option>
            <option value="BARISTA">BARISTA (Pha chế)</option>
          </select>
        </div>
      </Modal>
    </div>
  );
};

export default UserPage;