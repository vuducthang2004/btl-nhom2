import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const QuanLyNhanSu = () => {
    const navigate = useNavigate(); 
const [users, setUsers] = useState(() => {
        const savedData = localStorage.getItem('danhSachNhanVien');
        if (savedData) return JSON.parse(savedData);
        
        return [
            { id: 1, username: 'admin_ha', fullName: 'Trịnh Văn Diện', role: 'owner' },
            { id: 2, username: 'nv_phucvu1', fullName: 'Nguyễn Văn A', role: 'waiter' },
            { id: 3, username: 'nv_phache1', fullName: 'Trần Thị B', role: 'barista' }
        ];
    });
    React.useEffect(() => { 
        localStorage.setItem('danhSachNhanVien', JSON.stringify(users));
    }, [users]);

    const [newUser, setNewUser] = useState({ username: '', password: '', fullName: '', role: 'waiter' });
    
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddUser = (e) => {
        e.preventDefault();
        const sttMoi = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        const user = {
            id: sttMoi,
            ...newUser
        };
        setUsers([...users, user]);
        setNewUser({ username: '', password: '', fullName: '', role: 'waiter' });
        

        setIsModalOpen(false);
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
                

                <div style={styles.toolbar}>
                    <h3 style={{ margin: 0, color: '#4b3832', fontSize: '22px' }}>Danh sách tài khoản</h3>
                    <button style={styles.openModalBtn} onClick={() => setIsModalOpen(true)}>
                        + CẤP TÀI KHOẢN MỚI
                    </button>
                </div>


                <div style={styles.tableContainer}>
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
                                <tr key={user.id} style={styles.tr}>
                                    <td style={styles.td}>#{user.id.toString().slice(-4)}</td>
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


                {isModalOpen && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modalContent}>
                            <h3 style={styles.modalTitle}>Cấp tài khoản mới</h3>
                            
                            <form onSubmit={handleAddUser} style={styles.form}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Họ và tên nhân viên:</label>
                                    <input 
                                        type="text" 
                                        placeholder="Nhập họ và tên" 
                                        style={styles.input}
                                        value={newUser.fullName}
                                        onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                                        required 
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Tên đăng nhập:</label>
                                    <input 
                                        type="text" 
                                        placeholder="VD: nv_nguyenvana" 
                                        style={styles.input}
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                        required 
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Mật khẩu:</label>
                                    <input 
                                        type="password" 
                                        placeholder="Nhập mật khẩu" 
                                        style={styles.input}
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                        required 
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Phân quyền:</label>
                                    <select 
                                        style={styles.input}
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                    >
                                        <option value="waiter">Phục vụ (POS)</option>
                                        <option value="barista">Pha chế (KDS)</option>
                                        <option value="owner">Chủ cửa hàng (Admin)</option>
                                    </select>
                                </div>

                                <div style={styles.btnGroup}>

                                    <button type="button" style={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                                    <button type="submit" style={styles.submitBtn}>Cấp tài khoản</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                
            </div>
        </div>
    );
};


const styles = {
container: { backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    header: { position: 'relative', backgroundColor: '#4b3832', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    backBtn: { position: 'absolute', left: '40px', backgroundColor: 'transparent', color: '#fff', border: '1px solid #fff', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' },
    title: { color: '#fff', margin: 0, fontSize: '24px', textAlign: 'center' },
    
    content: { padding: '30px 40px', maxWidth: '1200px', margin: '0 auto' },
    
    toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    openModalBtn: { padding: '12px 25px', backgroundColor: '#4b3832', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' },
    
    tableContainer: { backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { backgroundColor: '#f8f9fa', color: '#333', padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd' },
    tr: { transition: '0.2s' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    deleteButton: { padding: '8px 15px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },

    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
    modalTitle: { color: '#4b3832', marginTop: 0, marginBottom: '25px', borderBottom: '2px solid #eee', paddingBottom: '10px', fontSize: '20px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { fontWeight: 'bold', color: '#555', fontSize: '14px' },
    input: { padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '15px', outline: 'none' },
    
    btnGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' },
    cancelBtn: { padding: '10px 20px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    submitBtn: { padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
};

export default QuanLyNhanSu;