import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import OrderReception from './OrderReception'; 
import AdminDashboard from './Admin/AdminDashboard'; 


function App() {
  return (
    <BrowserRouter>

      <div style={{ background: '#333', padding: '10px', textAlign: 'center' }}>
        <Link to="/thu-ngan" style={{ color: 'white', marginRight: '20px', textDecoration: 'none', fontWeight: 'bold' }}> Cổng Thu Ngân</Link>
        <Link to="/bep" style={{ color: 'white', marginRight: '20px', textDecoration: 'none', fontWeight: 'bold' }}> Cổng Pha Chế</Link>
        <Link to="/admin" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}> Cổng Chủ Quán</Link>
      </div>


      <Routes>

        <Route path="/bep" element={<OrderReception />} />
        

        <Route path="/admin" element={<AdminDashboard />} />


        <Route path="/" element={
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Hệ thống Quản lý Cafe</h1>
            <p>Vui lòng chọn cổng làm việc ở thanh menu phía trên!</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;