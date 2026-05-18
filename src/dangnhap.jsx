import React, { useState } from 'react';

const DangNhap = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('waiter');

    const handleLogin = (e) => {
        e.preventDefault();
        localStorage.setItem('user', JSON.stringify({ name: username, role: role }));
        
        window.location.href = '/home';
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleLogin} style={styles.form}>
                <h2 style={{ textAlign: 'center', color: '#4b3832', marginBottom: '25px' }}>COFFEE SHOP</h2>
                
                <input 
                    type="text" 
                    placeholder="Tên đăng nhập" 
                    style={styles.input}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                
                <input 
                    type="password" 
                    placeholder="Mật khẩu" 
                    style={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <select style={styles.input} value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="waiter">Nhân viên phục vụ</option>
                    <option value="barista">Nhân viên pha chế</option>
                    <option value="owner">Chủ cửa hàng</option>
                </select>

                <button type="submit" style={styles.button}>ĐĂNG NHẬP</button>
            </form>
        </div>
    );
};

const styles = {
    container: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url("https://thfvnext.bing.com/th/id/OIG3.gS2KZyZW7OS7CfdaxnCk?r=0&o=5&cb=thfvnext&dpr=1.5&pid=ImgGn")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    },
    form: { 
        padding: '40px', 
        backgroundColor: '#fff', 
        borderRadius: '10px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)', 
        width: '350px' 
    },
    input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', backgroundColor: '#4b3832', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
};

export default DangNhap;