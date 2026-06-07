import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/authApi';
import Button from './ui/Button';

const MenuItem = ({ icon, label, active, onClick }) => {
  return (
    <div 
      onClick={onClick}
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
        if (userData.role === 'CASHIER' && location.pathname !== '/orders') {
          navigate('/orders');
        }
      } catch (error) {
        console.error('Không thể tải thông tin user:', error);
      }
    };
    fetchUser();
  }, [location.pathname, navigate]);

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
          {user.role === 'CASHIER' ? '☕ COFFEE POS' : '☕ COFFEE ADMIN'}
        </h2>
        
        {user.role === 'OWNER' && (
          <MenuItem 
            icon="📊" 
            label="Tổng quan hôm nay" 
            active={isActive('/dashboard')} 
            onClick={() => navigate('/dashboard')} 
          />
        )}
        
        <MenuItem 
          icon="💼" 
          label="Thu ngân & Gọi món" 
          active={isActive('/orders')} 
          onClick={() => navigate('/orders')} 
        />
        
        {user.role === 'OWNER' && (
          <>
            <MenuItem 
              icon="📈" 
              label="Báo cáo Doanh thu" 
              active={isActive('/reports')} 
              onClick={() => navigate('/reports')} 
            />
            <MenuItem 
              icon="📋" 
              label="Quản lý Danh mục" 
              active={isActive('/menu/categories')} 
              onClick={() => navigate('/menu/categories')} 
            />
            <MenuItem 
              icon="☕" 
              label="Quản lý Món ăn" 
              active={isActive('/menu/items')} 
              onClick={() => navigate('/menu/items')} 
            />
            <MenuItem 
              icon="🍒" 
              label="Quản lý Topping" 
              active={isActive('/menu/toppings')} 
              onClick={() => navigate('/menu/toppings')} 
            />
            <MenuItem 
              icon="📦" 
              label="Tồn kho & Cảnh báo" 
              active={isActive('/inventory')} 
              onClick={() => navigate('/inventory')} 
            />
            <MenuItem 
              icon="🧪" 
              label="Thiết lập Công thức" 
              active={isActive('/recipes')} 
              onClick={() => navigate('/recipes')} 
            />
            <MenuItem 
              icon="👥" 
              label="Quản lý Nhân viên" 
              active={isActive('/users')} 
              onClick={() => navigate('/users')} 
            />
            <MenuItem 
              icon="📅" 
              label="Phân công Ca làm" 
              active={isActive('/hr/shifts')} 
              onClick={() => navigate('/hr/shifts')} 
            />
            <MenuItem 
              icon="⏱️" 
              label="Bảng Chấm công" 
              active={isActive('/hr/attendance')} 
              onClick={() => navigate('/hr/attendance')} 
            />
          </>
        )}
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
            Xin chào, {user.username} <span className="text-muted" style={{ fontWeight: '400' }}></span>
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