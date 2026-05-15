import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MenuManager = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([
    { id: 1, name: "Cà phê Muối", price: 35000 },
    { id: 2, name: "Trà Nhãn Cam Sả", price: 40000 }
  ]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const addItem = () => {
    if(!name || !price) return alert("Nhập đủ thông tin!");
    setItems([...items, { id: Date.now(), name, price: Number(price) }]);
    setName(""); setPrice("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/home')} style={styles.backBtn}>
          ← Quay lại Trang chủ
        </button>
        <h2 style={styles.title}>📋 QUẢN LÝ THỰC ĐƠN</h2>
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Thêm món mới</h3>
          <div style={styles.form}>
            <input style={styles.inputName} placeholder="Tên món" value={name} onChange={e => setName(e.target.value)} />
            <input style={styles.inputPrice} type="number" placeholder="Giá bán" value={price} onChange={e => setPrice(e.target.value)} />
            <button style={styles.addBtn} onClick={addItem}>+ THÊM MÓN</button>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Danh sách món ăn</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tên món</th>
                <th style={styles.th}>Giá</th>
                <th style={styles.th}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id} style={styles.tr}>
                  <td style={{...styles.td, fontWeight: 'bold'}}>{i.name}</td>
                  <td style={{...styles.td, color: '#e74c3c', fontWeight: 'bold'}}>
                    {i.price.toLocaleString('vi-VN')} đ
                  </td>
                  <td style={styles.td}>
                    <button style={styles.deleteBtn} onClick={() => setItems(items.filter(x => x.id !== i.id))}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
    container: { backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    header: { backgroundColor: '#4b3832', padding: '20px 40px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    backBtn: { backgroundColor: 'transparent', color: '#fff', border: '1px solid #fff', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', marginRight: '20px', fontWeight: 'bold', transition: '0.2s' },
    title: { color: '#fff', margin: 0, fontSize: '24px' },
    content: { padding: '30px 40px', maxWidth: '1200px', margin: '0 auto' },
    card: { backgroundColor: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '30px' },
    cardTitle: { color: '#4b3832', marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' },
    form: { display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' },
    inputName: { padding: '12px', border: '1px solid #ccc', borderRadius: '5px', flex: '2', minWidth: '200px', fontSize: '15px' },
    inputPrice: { padding: '12px', border: '1px solid #ccc', borderRadius: '5px', flex: '1', minWidth: '150px', fontSize: '15px' },
    addBtn: { padding: '12px 25px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { backgroundColor: '#f8f9fa', color: '#333', padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd' },
    tr: { transition: '0.2s' },
    td: { padding: '15px', borderBottom: '1px solid #eee', color: '#444' },
    deleteBtn: { backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
};

export default MenuManager;