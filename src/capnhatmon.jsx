import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const CapNhatMon = () => {
    const navigate = useNavigate();
    const [menu, setMenu] = useState([]);
    const getAuthHeader = () => {
        const token = localStorage.getItem('accessToken');
        return { Authorization: `Bearer ${token}` };
    };
    const fetchMenu = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/menu/items`, {
                headers: getAuthHeader()
            });
            if (response.data.success) {
                setMenu(response.data.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách món:", error);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const toggleStock = async (id, currentAvailability) => {
        setMenu(menu.map(item => item.id === id ? { ...item, is_available: !currentAvailability } : item));

        try {
            await axios.patch(`${API_BASE_URL}/menu/items/${id}/availability`, {}, {
                headers: getAuthHeader()
            });
        } catch (error) {
            console.error("Lỗi cập nhật món:", error);
            alert("Lỗi khi cập nhật! Vui lòng kiểm tra lại quyền BARISTA hoặc kết nối mạng.");
            fetchMenu();
        }
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
                            <div key={m.id} style={{ ...styles.menuItem, opacity: m.is_available ? 1 : 0.6 }}>
                                <strong style={{ textDecoration: !m.is_available ? 'line-through' : 'none', fontSize: '18px', color: '#333' }}>
                                    {m.name}
                                </strong>
                                <button 
                                    style={{ ...styles.stockBtn, backgroundColor: m.is_available ? '#e74c3c' : '#27ae60' }}
                                    onClick={() => toggleStock(m.id, m.is_available)}
                                >
                                    {m.is_available ? 'Báo hết' : 'Mở lại'}
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