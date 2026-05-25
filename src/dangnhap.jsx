import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from './api';

const DangNhap = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axiosClient.post('/auth/login', {
                username: username,
                password: password
            });
            if (response.data && response.data.success) {

                localStorage.setItem('accessToken', response.data.data.accessToken);
                
                if (response.data.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.data.user));
                }
                
                alert('Đăng nhập thành công!');

                navigate('/home'); 
            }
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
           
            const errorMessage = error.response?.data?.message || 'Sai tên đăng nhập hoặc mật khẩu!';
            alert(errorMessage);
        }
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