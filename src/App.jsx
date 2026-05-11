import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DangNhap from './dangnhap';
import TrangChu from './TrangChu';
import QuanLyNhanSu from './QuanLyNhanSu';
import SoDoBan from './SoDoBan';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<DangNhap />} />
                <Route path="/home" element={<TrangChu />} />
                <Route path="/admin" element={<QuanLyNhanSu />} />
                <Route path="/tables" element={<SoDoBan />} />
            </Routes>
        </Router>
    );
}

export default App;