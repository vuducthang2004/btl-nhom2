import React, { useState } from 'react';
import './AdminDashboard.css';
import MenuManager from './MenuManager';
import InventoryManager from './InventoryManager';

const AdminDashboard = () => {
  const [tab, setTab] = useState("menu");

  return (
    <div className="admin-layout">
      <div className="sidebar">
        <h2>ADMIN CAFE</h2>
        <div className={`sidebar-item ${tab === 'menu' ? 'active' : ''}`} onClick={() => setTab('menu')}> Quản lý Menu</div>
        <div className={`sidebar-item ${tab === 'inventory' ? 'active' : ''}`} onClick={() => setTab('inventory')}> Quản lý Kho</div>
        <div className={`sidebar-item ${tab === 'report' ? 'active' : ''}`} onClick={() => setTab('report')}> Báo cáo Doanh thu</div>
        <div className="sidebar-item" style={{marginTop: '50px', color: '#e74c3c'}} onClick={() => window.location.reload()}> Đăng xuất</div>
      </div>

      <div className="content">
        <div className="admin-card">
          {tab === 'menu' && <MenuManager />}
          {tab === 'inventory' && <InventoryManager />}
          {tab === 'report' && <div><h3> BÁO CÁO DOANH THU</h3></div>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;