import React from 'react';
import { useNavigate } from 'react-router-dom';

const TrangChu = () => {
    const navigate = useNavigate();
    
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { name: 'barista1' };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/dangnhap');
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>COFFEE SHOP</h1>
                    <p style={styles.subtitle}>Xin chào, <strong>{user.name || user.username}</strong></p>
                </div>
                <button onClick={handleLogout} style={styles.logoutBtn}>Đăng xuất</button>
            </div>

            <div style={styles.content}>
                <h2 style={{ textAlign: 'center', color: '#4b3832', marginBottom: '30px' }}>
                    CHỨC NĂNG PHA CHẾ
                </h2>
                
                <div style={styles.menuGrid}>
                    <div style={styles.card} onClick={() => navigate('/phache')}>
                        <div style={styles.icon}>☕</div>
                        <h3 style={styles.cardTitle}>Màn hình Bếp (KDS)</h3>
                    </div>
                    <div style={styles.card} onClick={() => navigate('/capnhatmon')}>
                        <div style={styles.icon}>🚫</div>
                        <h3 style={styles.cardTitle}>Báo Hết Món</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { backgroundColor: '#e9ecef', minHeight: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    header: { 
        backgroundColor: '#fff', 
        padding: '15px 40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '2px solid #4b3832',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    },
    title: { color: '#4b3832', margin: 0, fontSize: '28px', fontWeight: '900' },
    subtitle: { color: '#7f8c8d', margin: '5px 0 0 0', fontSize: '16px' },
    logoutBtn: { backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    
    content: { padding: '50px 20px', maxWidth: '900px', margin: '0 auto' },
    menuGrid: { display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' },
    
    card: { 
        backgroundColor: '#fff', 
        width: '300px', 
        padding: '30px 20px', 
        borderRadius: '15px', 
        textAlign: 'center',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
    },
    icon: { fontSize: '50px', marginBottom: '15px' },
    cardTitle: { color: '#2f3542', margin: '0 0 10px 0', fontSize: '20px' },
    cardDesc: { color: '#7f8c8d', margin: 0, fontSize: '15px', lineHeight: '1.5' }
};

export default TrangChu;