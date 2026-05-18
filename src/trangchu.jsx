import React from 'react';
import { useNavigate } from 'react-router-dom';


const TrangChu = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || { username: 'admin_ha', role: 'owner' };

    const functions = [
        { id: 1, title: 'Sơ đồ bàn', icon: '🪑', path: '/tables', roles: ['waiter', 'owner'] },

        { id: 2, title: 'Quản lý kho', icon: '📦', path: '/kho', roles: ['owner'] },
        { id: 3, title: 'Nhân sự', icon: '👥', path: '/nhansu', roles: ['owner'] }, 
        { id: 4, title: 'Báo cáo', icon: '📊', path: '/baocao', roles: ['owner'] },
        { id: 5, title: 'Thực đơn', icon: '📋', path: '/menu', roles: ['owner'] },
        { id: 6, title: 'Lịch làm việc', icon: '📅', path: '/lichlamviec', roles: ['owner'] },

        { id: 7, title: 'Pha chế', icon: '☕', path: '/phache', roles: ['barista'] },
        { id: 8, title: 'Cập nhật món', icon: '🚫', path: '/capnhatmon', roles: ['barista'] },
    ];

    const filteredFunctions = functions.filter(f => f.roles.includes(user.role));

    const handleLogout = () => {
        const confirmExit = window.confirm("Bạn muốn đăng xuất?");
        if (confirmExit) {
            localStorage.removeItem('user');
            navigate('/');
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.brandArea}>
                    <h1 style={styles.title}>COFFEE SHOP</h1>
                    <p style={styles.welcomeText}>Xin chào, <strong>{user.username}</strong></p>
                </div>
                <button style={styles.logoutBtn} onClick={handleLogout}>Đăng xuất</button>
            </header>

            <div style={styles.grid}>
                {filteredFunctions.map(f => (
                    <div key={f.id} style={styles.card} onClick={() => navigate(f.path)}>
                        <div style={styles.icon}>{f.icon}</div>
                        <div style={styles.cardTitle}>{f.title}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const styles = {
    container: { padding: '40px', backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    header: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '40px', 
        borderBottom: '2px solid #4b3832', 
        paddingBottom: '20px' 
    },
    brandArea: { display: 'flex', flexDirection: 'column', gap: '5px' },
    title: { margin: 0, color: '#4b3832', fontSize: '2.5rem', fontWeight: 'bold' },
    welcomeText: { margin: 0, color: '#666', fontSize: '1.1rem' },
    logoutBtn: { 
        padding: '10px 25px', 
        backgroundColor: '#e74c3c', 
        color: '#fff', 
        border: 'none', 
        borderRadius: '5px', 
        cursor: 'pointer',
        fontWeight: 'bold',
        marginTop: '10px'
    },
    grid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
        gap: '25px' 
    },
    card: { 
        backgroundColor: '#fff', 
        padding: '40px 20px', 
        borderRadius: '15px', 
        textAlign: 'center', 
        cursor: 'pointer', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
        transition: 'transform 0.2s, boxShadow 0.2s',
        border: '1px solid #eee'
    },
    icon: { fontSize: '60px', marginBottom: '20px' },
    cardTitle: { fontSize: '20px', fontWeight: 'bold', color: '#4b3832' }
};

export default TrangChu;