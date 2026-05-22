import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CapNhatMon = () => {
    const navigate = useNavigate();
    const [menu, setMenu] = useState(() => {
        const savedMenu = localStorage.getItem('menuQuayPhaChe');
        if (savedMenu) return JSON.parse(savedMenu);
        return [
            {id: 1, name: "Cà phê", stock: true}, {id: 2, name: "Trà đào", stock: true},
            {id: 3, name: "Bạc xỉu", stock: true}, {id: 4, name: "Nước cam", stock: true},
            {id: 5, name: "Sinh tố bơ", stock: true}, {id: 6, name: "Trà sữa", stock: true}
        ];
    });
    const toggleStock = (id) => {
        setMenu(menu.map(item => item.id === id ? {...item, stock: !item.stock} : item));
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                    <button onClick={() => navigate('/home')} style={styles.backBtn}>
                        ← Quay lại Trang chủ
                    </button>
                <h2 style={styles.title}>🚫 BÁO CÁO HẾT MÓN</h2>
            </div>

            <div style={styles.content}>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Danh sách nguyên liệu / Đồ uống</h3>
                    <div style={styles.menuGrid}>
                        {menu.map(m => (
                            <div key={m.id} style={{...styles.menuItem, opacity: m.stock ? 1 : 0.6}}>
                                <strong style={{textDecoration: !m.stock ? 'line-through' : 'none', fontSize: '18px', color: '#333'}}>
                                    {m.name}
                                </strong>
                                <button 
                                    style={{...styles.stockBtn, backgroundColor: m.stock ? '#e74c3c' : '#27ae60'}}
                                    onClick={() => toggleStock(m.id)}
                                >
                                    {m.stock ? 'Báo hết' : 'Mở lại'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { backgroundColor: '#e9ecef', minHeight: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    header: { position: 'relative', backgroundColor: '#4b3832', padding: '20px 40px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' },
    backBtn: { position: 'absolute', left: '40px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'transparent', color: '#fff', border: '1px solid #fff', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    title: { color: '#fff', fontSize: '24px', margin: 0 },
    content: { padding: '30px 40px', maxWidth: '1000px', margin: '0 auto' },
    card: { backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    cardTitle: { color: '#4b3832', marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '25px', fontSize: '20px' },
    menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    menuItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid #e1e8ed', borderRadius: '8px', backgroundColor: '#f8f9fa', transition: '0.2s' },
    stockBtn: { textAlign: 'right', padding: '10px 20px', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' }
};

export default CapNhatMon;