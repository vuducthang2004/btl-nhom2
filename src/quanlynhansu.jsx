import React, { useState } from 'react';

const QuanLyNhanSu = () => {
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

    return (
        <div style={styles.container}>
            <div style={styles.sidebar}>
                <h3 style={styles.logo}>Quản lý quán cafe</h3>
                <ul style={styles.menu}>
                    <li style={styles.menuItemActive}>Quản lý nhân sự</li>
                </ul>
                <button 
                    style={styles.backBtn} 
                    onClick={() => window.location.href = '/home'}
                >
                    ← Quay lại trang chủ
                </button>
            </div>
            
            <div style={styles.content}>
                <h2 style={styles.headerTitle}>Cấp tài khoản nhân viên</h2>
                
                <div style={styles.formContainer}>
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
                            <option value="waiter">Nhân viên phục vụ</option>
                            <option value="barista">Nhân viên pha chế</option>
                            <option value="owner">Chủ cửa hàng</option>
                        </select>
                        <button type="submit" style={styles.button}>CẤP TÀI KHOẢN</button>
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
                                <td style={styles.td}>{user.fullName}</td>
                                <td style={styles.td}>{user.username}</td>
                                <td style={styles.td}>
                                    {user.role === 'owner' ? 'Chủ cửa hàng' : user.role === 'barista' ? 'Pha chế' : 'Phục vụ'}
                                </td>
                                <td style={styles.td}>
                                    <button style={styles.deleteButton}>Xóa</button>
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
    container: { display: 'flex', height: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif' },
    sidebar: { width: '250px', backgroundColor: '#4b3832', color: '#fff', padding: '20px', display: 'flex', flexDirection: 'column' },
    logo: { textAlign: 'center', borderBottom: '1px solid #6b554e', paddingBottom: '20px', marginBottom: '20px' },
    menu: { listStyle: 'none', padding: 0, margin: 0, flexGrow: 1 },
    menuItemActive: { padding: '15px', backgroundColor: '#6b554e', fontWeight: 'bold', borderRadius: '5px' },
    backBtn: { padding: '12px', backgroundColor: 'transparent', color: '#fff', border: '1px solid #6b554e', borderRadius: '5px', cursor: 'pointer', marginTop: 'auto' },
    content: { flex: 1, padding: '40px', overflowY: 'auto' },
    headerTitle: { color: '#4b3832', borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '20px' },
    formContainer: { backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
    form: { display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' },
    input: { padding: '12px', borderRadius: '5px', border: '1px solid #ddd', flex: 1, minWidth: '150px' },
    button: { padding: '12px 20px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderRadius: '8px', overflow: 'hidden', marginTop: '10px' },
    th: { backgroundColor: '#4b3832', color: '#fff', padding: '15px', textAlign: 'left' },
    td: { padding: '15px', borderBottom: '1px solid #ddd' },
    deleteButton: { padding: '8px 15px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default QuanLyNhanSu;