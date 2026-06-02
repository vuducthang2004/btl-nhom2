import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const { execute: login, loading, error } = useApi(authApi.login);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ username, password });
      const data = response.data || response;
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
         localStorage.setItem('refreshToken', data.refreshToken);
      }
      const userRole = data.user?.role || data.role;
      if (userRole === 'BARISTA') {
        navigate('/barista/queue');
      } else if (userRole === 'CASHIER') {
        navigate('/orders'); 
      } else {
        navigate('/dashboard'); 
      }
    } catch (err) {
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', backgroundColor: 'var(--color-secondary)' }}>
      <Card style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>☕</div>
        <h2 style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>COFFEE SHOP</h2>

        {error && (
          <div style={{
            backgroundColor: 'var(--color-error-bg)',
            color: 'var(--color-error)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            textAlign: 'left',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          <Input
            label="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Nhập tên tài khoản..."
          />
          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
          
          <Button 
            type="submit" 
            loading={loading} 
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;