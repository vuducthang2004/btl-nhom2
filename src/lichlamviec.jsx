import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LichLamViec = () => {
    const navigate = useNavigate();
    const danhSachNhanVien = ['Trịnh Văn Diện', 'Nguyễn Văn A', 'Trần Thị B'];
    const [schedules, setSchedules] = useState([
        { id: 1, employee: 'Trịnh Văn Diện', date: '2026-05-18', shift: 'Ca Sáng (07:00 - 12:00)' },
        { id: 2, employee: 'Nguyễn Văn A', date: '2026-05-18', shift: 'Ca Chiều (12:00 - 17:00)' },
        { id: 3, employee: 'Trần Thị B', date: '2026-05-19', shift: 'Ca Tối (17:00 - 22:30)' }
    ]);
    const [newSchedule, setNewSchedule] = useState({ 
        employee: 'Trịnh Văn Diện', 
        shift: 'Ca Sáng (07:00 - 12:00)' 
    });


    const handleAddSchedule = (e) => {
        e.preventDefault(); 
        const schedule = {
            id: Date.now(),
            ...newSchedule
        };
        setSchedules([...schedules, schedule]);

        setNewSchedule({ ...newSchedule, date: '' });
    };

    const handleDeleteSchedule = (id) => {
        const confirmDelete = window.confirm("Bạn muốn xóa ca làm việc này?");
        if (confirmDelete) {
            setSchedules(schedules.filter(item => item.id !== id));
        }
    };

    return (
        <div style={styles.container}>

            <div style={styles.header}>
                <button onClick={() => navigate('/home')} style={styles.backBtn}>
                    ← Quay lại Trang chủ
                </button>
                <h2 style={styles.title}>📅 QUẢN LÝ LỊCH LÀM VIỆC</h2>
            </div>

            <div style={styles.content}>

                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Phân ca làm việc</h3>
                    <form onSubmit={handleAddSchedule} style={styles.form}>
                        

                        <select 
                            style={styles.select}
                                    value={newSchedule.employee}
                                    onChange={(e) => setNewSchedule({...newSchedule, employee: e.target.value})}
                                    required
                                >
                                    <option value="" disabled hidden>-- Chọn nhân viên --</option>
                                    {danhSachNhanVien.map(nv => (
                                        <option key={nv.id} value={nv.fullName}>
                                            {nv.fullName} ({nv.role === 'owner' ? 'Quản lý' : nv.role === 'barista' ? 'Pha chế' : 'Phục vụ'})
                                        </option>
                                    ))} 
                        </select>

                        <input 
                            type="date" 
                            style={styles.input}
                            value={newSchedule.date}
                            onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
                            required 
                        />


                        <select 
                            style={styles.select}
                            value={newSchedule.shift}
                            onChange={(e) => setNewSchedule({...newSchedule, shift: e.target.value})}
                        >
                            <option value="Ca Sáng (07:00 - 12:00)">Ca Sáng (07:00 - 12:00)</option>
                            <option value="Ca Chiều (12:00 - 17:00)">Ca Chiều (12:00 - 17:00)</option>
                            <option value="Ca Tối (17:00 - 22:30)">Ca Tối (17:00 - 22:30)</option>
                        </select>

                        <button type="submit" style={styles.addBtn}>+ THÊM LỊCH</button>
                    </form>
                </div>

                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Lịch làm việc sắp tới</h3>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Ngày làm việc</th>
                                <th style={styles.th}>Nhân viên</th>
                                <th style={styles.th}>Ca làm</th>
                                <th style={styles.th}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                           
                            {schedules.sort((a, b) => new Date(a.date) - new Date(b.date)).map((item) => (
                                <tr key={item.id} style={styles.tr}>
                                    <td style={{...styles.td, fontWeight: 'bold', color: '#2980b9'}}>
                                        
                                        {item.date.split('-').reverse().join('/')}
                                    </td>
                                    <td style={{...styles.td, fontWeight: 'bold'}}>{item.employee}</td>
                                    <td style={{...styles.td, color: '#e74c3c'}}>{item.shift}</td>
                                    <td style={styles.td}>
                                        <button onClick={() => handleDeleteSchedule(item.id)} style={styles.deleteBtn}>
                                            Hủy ca
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {schedules.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{padding: '20px', textAlign: 'center', color: '#888'}}>
                                        Chưa có lịch làm việc nào được phân!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
    card: { backgroundColor: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '30px' },
    cardTitle: { color: '#4b3832', marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' },
    form: { display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' },
    input: { padding: '12px', border: '1px solid #ccc', borderRadius: '5px', flex: '1', minWidth: '150px', fontSize: '15px', outline: 'none' },
    select: { padding: '12px', border: '1px solid #ccc', borderRadius: '5px', flex: '1.5', minWidth: '200px', fontSize: '15px', outline: 'none' },
    addBtn: { padding: '12px 25px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { backgroundColor: '#f8f9fa', color: '#333', padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd' },
    tr: { transition: '0.2s' },
    td: { padding: '15px', borderBottom: '1px solid #eee', color: '#444' },
    deleteBtn: { backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
};

export default LichLamViec;