import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import DangNhap from './dangnhap';
import TrangChu from './trangchu';
import QuanLyNhanSu from './quanlynhansu';
import SoDoBan from './sodoban';

import OrderReception from './OrderReception'; 
import InventoryManager from './InventoryManager';
import MenuManager from './MenuManager';
import LichLamViec from './lichlamviec';
import CapNhatMon from './capnhatmon';
/*import ReportDashboard from './ReportDashboard';*/

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<DangNhap />} />
                <Route path="/home" element={<TrangChu />} />
                <Route path="/nhansu" element={<QuanLyNhanSu />} />
                <Route path="/tables" element={<SoDoBan />} />

                <Route path="/phache" element={<OrderReception />} />
                <Route path="/kho" element={<InventoryManager />} />
                <Route path="/menu" element={<MenuManager />} />
                <Route path="/lichlamviec" element={<LichLamViec />} />
                <Route path="/capnhatmon" element={<CapNhatMon />} />
            </Routes>
        </Router>
    );
}

export default App;