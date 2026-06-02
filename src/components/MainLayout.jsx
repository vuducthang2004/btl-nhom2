import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/authApi';
import Button from './ui/Button';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [user, setUser] = useState({ username: 'Đang tải...', role: '' });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authApi.getMe();
        const userData = res.data.data || res.data;
        setUser(userData);
      } catch (error) {
        console.error('Không thể tải thông tin user:', error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  };
  
  const isActive = (path) => location.pathname.startsWith(path);

  const MenuItem = ({ path, icon, label }) => {
    const active = isActive(path);
    return (
      <div 
        onClick={() => navigate(path)}
        style={{
          padding: '12px 20px',
          cursor: 'pointer',
          backgroundColor: active ? 'rgba(255, 179, 0, 0.1)' : 'transparent',
          color: active ? '#ffb300' : 'var(--color-secondary)',
          borderLeft: active ? '4px solid #ffb300' : '4px solid transparent',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: active ? '600' : '400'
        }}
        onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
        onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </div>
    );
  };

  return (
    <div className="flex" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <div style={{ 
        width: '260px', 
        backgroundColor: 'var(--color-primary)', 
        color: 'var(--color-secondary)', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '24px 0',
        boxShadow: 'var(--shadow-md)',
        zIndex: 10
      }}>
        <h2 style={{ color: '#ffb300', textAlign: 'center', marginBottom: '32px', fontSize: '22px', letterSpacing: '1px' }}>
          ☕ COFFEE ADMIN
        </h2>
        
        <MenuItem path="/dashboard" icon="📊" label="Bảng điều khiển" />
        <MenuItem path="/reports" icon="📈" label="Báo cáo Doanh thu" />
        <MenuItem path="/menu/categories" icon="📋" label="Quản lý Danh mục" />
        <MenuItem path="/menu/items" icon="☕" label="Quản lý Món ăn" />
        <MenuItem path="/menu/toppings" icon="🍒" label="Quản lý Topping" />
        <MenuItem path="/inventory" icon="📦" label="Tồn kho & Cảnh báo" />
        <MenuItem path="/recipes" icon="🧪" label="Thiết lập Công thức" />
        <MenuItem path="/users" icon="👥" label="Quản lý Nhân viên" />
        <MenuItem path="/hr/shifts" icon="📅" label="Phân công Ca làm" />
        <MenuItem path="/hr/attendance" icon="⏱️" label="Bảng Chấm công" />
      </div>
      <div className="flex-col" style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ 
          backgroundColor: 'var(--color-surface)', 
          padding: '16px 32px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          boxShadow: 'var(--shadow-sm)',
          zIndex: 5
        }}>
          <div style={{ fontWeight: '600', color: 'var(--color-primary)' }}>
            Xin chào, {user.username} <span className="text-muted" style={{ fontWeight: '400' }}>({user.role})</span>
          </div>
          <Button variant="outline" onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '14px' }}>
            Đăng xuất
          </Button>
        </div>
        <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;