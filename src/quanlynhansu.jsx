import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

const QuanLyNhanSu = () => {
    const navigate = useNavigate(); 

    const [users, setUsers] = useState([
        { id: 1, username: 'admin_ha', fullName: 'Trần Minh Hà', role: 'owner' },
        { id: 2, username: 'nv_phucvu1', fullName: 'Nguyễn Văn A', role: 'waiter' },
        { id: 3, username: 'nv_phache1', fullName: 'Trần Thị B', role: 'barista' }
    ]);

    const [newUser, setNewUser] = useState({ username: '', password: '', fullName: '', role: 'waiter' });

    const handleAddUser = (e) => {
        e.preventDefault();
        const user = {
            id: users.length + 1,
            ...newUser
        };
        setUsers([...users, user]);
        setNewUser({ username: '', password: '', fullName: '', role: 'waiter' });
    };

    const handleDeleteUser = (idXoa) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?");
        if (confirmDelete) {
            setUsers(users.filter(user => user.id !== idXoa));
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate('/home')} style={styles.backBtn}>
                    ← Quay lại Trang chủ
                </button>
                <h2 style={styles.title}>👥 QUẢN LÝ NHÂN SỰ</h2>
            </div>

            <div style={styles.content}>
                <div style={styles.formContainer}>
                    <h3 style={{ marginTop: 0, color: '#4b3832', marginBottom: '15px' }}>Cấp tài khoản mới</h3>
                    <form onSubmit={handleAddUser} style={styles.form}>
                        <input 
                            type="text" 
                            placeholder="Họ và tên" 
                            style={styles.input}
                            value={newUser.fullName}
                            onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                            required 
                        />
                        <input 
                            type="text" 
                            placeholder="Tên đăng nhập" 
                            style={styles.input}
                            value={newUser.username}
                            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                            required 
                        />
                        <input 
                            type="password" 
                            placeholder="Mật khẩu" 
                            style={styles.input}
                            value={newUser.password}
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            required 
                        />
                        <select 
                            style={styles.input}
                            value={newUser.role}
                            onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        >
                            <option value="waiter">Phục vụ</option>
                            <option value="barista">Pha chế</option>
                            <option value="owner">Chủ cửa hàng</option>
                        </select>
                        <button type="submit" style={styles.button}>+ CẤP TÀI KHOẢN</button>
                    </form>
                </div>

                <h3 style={{ marginTop: '30px', color: '#4b3832' }}>Danh sách tài khoản</h3>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Họ và tên</th>
                            <th style={styles.th}>Tên đăng nhập</th>
                            <th style={styles.th}>Vai trò</th>
                            <th style={styles.th}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td style={styles.td}>{user.id}</td>
                                <td style={{...styles.td, fontWeight: 'bold'}}>{user.fullName}</td>
                                <td style={styles.td}>{user.username}</td>
                                <td style={{...styles.td, fontWeight: 'bold', color: user.role === 'owner' ? '#e74c3c' : '#2980b9'}}>
                                    {user.role === 'owner' ? 'Chủ cửa hàng' : user.role === 'barista' ? 'Pha chế' : 'Phục vụ'}
                                </td>
                                <td style={styles.td}>
                                    <button 
                                        style={styles.deleteButton} 
                                        onClick={() => handleDeleteUser(user.id)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
    formContainer: { backgroundColor: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
    form: { display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' },
    input: { padding: '12px', borderRadius: '5px', border: '1px solid #ccc', flex: 1, minWidth: '150px', fontSize: '15px' },
    button: { padding: '12px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' },
    th: { backgroundColor: '#f8f9fa', color: '#333', padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    deleteButton: { padding: '8px 15px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
};

export default QuanLyNhanSu;