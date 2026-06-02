import React, { useEffect, useState } from 'react';
import { shiftApi } from '../../api/shiftApi';
import { useApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const ShiftPage = () => {
  const { data: shifts, loading: loadingShifts, execute: fetchShifts } = useApi(shiftApi.getShifts);
  const { data: assignments, loading: loadingAssigns, execute: fetchAssignments } = useApi(shiftApi.getAssignments);
  
  const { execute: createShift, loading: creatingShift } = useApi(shiftApi.createShift);
  const { execute: createAssign, loading: assigning } = useApi(shiftApi.createAssignment);

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  const [shiftData, setShiftData] = useState({ name: '', startTime: '07:00', endTime: '12:00' });
  const [assignData, setAssignData] = useState({ userId: '', shiftId: '', workDate: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchShifts();
    fetchAssignments();
  }, [fetchShifts, fetchAssignments]);

  const handleCreateShift = async () => {
    try {
      await createShift({
        name: shiftData.name,
        startTime: shiftData.startTime,
        endTime: shiftData.endTime
      });
      setIsShiftModalOpen(false);
      fetchShifts();
    } catch (err) {
      alert('Có lỗi xảy ra khi tạo ca làm!');
    }
  };

  const handleCreateAssign = async () => {
    try {
      await createAssign({
        userId: Number(assignData.userId),
        shiftId: Number(assignData.shiftId),
        workDate: assignData.workDate
      });
      setIsAssignModalOpen(false);
      fetchAssignments();
      alert('Đã phân công ca thành công!');
    } catch (err) {
      alert('Có lỗi xảy ra khi phân công ca!');
    }
  };

  const shiftColumns = [
    { header: 'ID Ca', render: (row) => row.id },
    { header: 'Tên Ca', render: (row) => <span style={{ fontWeight: 'bold' }}>{row.name}</span> },
    { header: 'Bắt đầu', render: (row) => row.startTime ?? row.start_time },
    { header: 'Kết thúc', render: (row) => row.endTime ?? row.end_time }
  ];

  const assignColumns = [
    { header: 'ID NV', render: (row) => row.userId ?? row.user_id },
    { header: 'Nhân viên', render: (row) => <span style={{ fontWeight: 'bold' }}>{row.userFullName ?? row.user_full_name}</span> },
    { header: 'Ca làm', render: (row) => row.shiftName ?? row.shift_name },
    { header: 'Ngày làm', render: (row) => row.workDate ?? row.work_date }
  ];

  return (
    <div className="flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <h2>📅 1. Quản lý Khung Giờ Ca</h2>
        <Button onClick={() => setIsShiftModalOpen(true)}>+ Thêm Ca mới</Button>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden', marginBottom: '40px' }}>
        {loadingShifts ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải ca làm...</div>
        ) : (
          <Table columns={shiftColumns} data={Array.isArray(shifts) ? shifts : []} emptyMessage="Chưa có ca làm nào." />
        )}
      </Card>
      <div className="flex justify-between items-center mb-4">
        <h2>🎯 2. Phân công Nhân viên vào Ca</h2>
        <Button onClick={() => setIsAssignModalOpen(true)}>+ Gán ca cho Nhân viên</Button>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loadingAssigns ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải danh sách phân công...</div>
        ) : (
          <Table columns={assignColumns} data={Array.isArray(assignments) ? assignments : []} emptyMessage="Chưa có nhân viên nào được phân công." />
        )}
      </Card>


      <Modal 
        isOpen={isShiftModalOpen} 
        onClose={() => setIsShiftModalOpen(false)} 
        title="Thêm Ca làm mới"
        onSubmit={handleCreateShift}
        loading={creatingShift}
      >
        <Input 
          label="Tên ca (Ví dụ: Ca Sáng)" 
          value={shiftData.name} 
          onChange={(e) => setShiftData({...shiftData, name: e.target.value})} 
          required 
        />
        <Input 
          label="Giờ bắt đầu" 
          type="time"
          value={shiftData.startTime} 
          onChange={(e) => setShiftData({...shiftData, startTime: e.target.value})} 
          required 
        />
        <Input 
          label="Giờ kết thúc" 
          type="time"
          value={shiftData.endTime} 
          onChange={(e) => setShiftData({...shiftData, endTime: e.target.value})} 
          required 
        />
      </Modal>


      <Modal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)} 
        title="Gán Ca làm cho Nhân viên"
        onSubmit={handleCreateAssign}
        loading={assigning}
      >
        <Input 
          label="ID Nhân viên (Ví dụ: 2)" 
          type="number"
          value={assignData.userId} 
          onChange={(e) => setAssignData({...assignData, userId: e.target.value})} 
          required 
        />
        <Input 
          label="ID Ca làm (Xem ở bảng 1, VD: 1)" 
          type="number"
          value={assignData.shiftId} 
          onChange={(e) => setAssignData({...assignData, shiftId: e.target.value})} 
          required 
        />
        <Input 
          label="Ngày làm (YYYY-MM-DD)" 
          type="date"
          value={assignData.workDate} 
          onChange={(e) => setAssignData({...assignData, workDate: e.target.value})} 
          required 
        />
      </Modal>
    </div>
  );
};

export default ShiftPage;
