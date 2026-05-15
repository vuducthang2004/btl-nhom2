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

    const handleDeleteUser = (idXoa) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?");
        if (confirmDelete) {
            setUsers(users.filter(user => user.id !== idXoa));
        }
    };

    return (
        <div style={styles.content}>
            <h2 style={styles.headerTitle}>👥 Cấp tài khoản nhân viên</h2>
            
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
                        <option value="waiter">Phục vụ</option>
                        <option value="barista">Pha chế</option>
                        <option value="owner">Chủ cửa hàng</option>
                    </select>
                    <button type="submit" style={styles.button}>+ CẤP TÀI KHOẢN</button>
                </form>
            </div>

            <h3 style={{ marginTop: '30px', color: '#333' }}>Danh sách tài khoản</h3>
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
    );
};

const styles = {
    content: { flex: 1, padding: '10px' },
    headerTitle: { color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' },
    formContainer: { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee' },
    form: { display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' },
    input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', flex: 1, minWidth: '150px' },
    button: { padding: '10px 15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', marginTop: '10px' },
    th: { backgroundColor: '#343a40', color: '#fff', padding: '12px', textAlign: 'left' },
    td: { padding: '12px', borderBottom: '1px solid #eee' },
    deleteButton: { padding: '6px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default QuanLyNhanSu;