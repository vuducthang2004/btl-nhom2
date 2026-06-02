import React, { useEffect, useState } from 'react';
import { attendanceApi } from '../../api/attendanceApi';
import { useApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const AttendancePage = () => {
  const { data: summary, loading, execute: fetchSummary } = useApi(attendanceApi.getSummary);
  const { execute: override, loading: overRiding } = useApi(attendanceApi.overrideAttendance);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ userId: '', date: '', checkIn: '', checkOut: '' });

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleSubmit = async () => {
    try {
      await override({
        userId: Number(formData.userId),
        date: formData.date,
        checkInTime: formData.checkIn,
        checkOutTime: formData.checkOut
      });
      setIsModalOpen(false);
      fetchSummary();
      alert('Đã cập nhật giờ làm thành công!');
    } catch (err) {
      alert('Có lỗi xảy ra khi cập nhật giờ làm!');
    }
  };

  const columns = [
    { header: 'ID NV', render: (row) => row.userId ?? row.user_id },
    { header: 'Nhân viên', render: (row) => <span style={{ fontWeight: 'bold' }}>{row.username}</span> },
    { header: 'Ngày chấm công', render: (row) => row.date },
    { header: 'Trạng thái', render: (row) => {
      const statusMap = {
        'ON_TIME': { label: 'Đúng giờ', color: 'green' },
        'LATE': { label: 'Đi muộn', color: 'orange' },
        'EARLY_LEAVE': { label: 'Về sớm', color: 'red' },
        'ABSENT': { label: 'Vắng mặt', color: 'gray' }
      };
      const st = statusMap[row.status] || { label: row.status, color: 'black' };
      return <span style={{ color: st.color, fontWeight: 'bold' }}>{st.label}</span>;
    }},
    { header: 'Check In', render: (row) => row.checkInTime ?? row.check_in_time ?? '-' },
    { header: 'Check Out', render: (row) => row.checkOutTime ?? row.check_out_time ?? '-' },
    { header: 'Thao tác', render: (row) => (
      <Button variant="outline" onClick={() => {
        setFormData({
          userId: row.userId ?? row.user_id,
          date: row.date,
          checkIn: row.checkInTime ?? row.check_in_time ?? '',
          checkOut: row.checkOutTime ?? row.check_out_time ?? ''
        });
        setIsModalOpen(true);
      }}>Sửa giờ</Button>
    )}
  ];

  return (
    <div className="flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <h2>⏱️ Bảng tổng hợp chấm công</h2>
        <Button onClick={() => {
          setFormData({ userId: '', date: new Date().toISOString().split('T')[0], checkIn: '08:00:00', checkOut: '17:00:00' });
          setIsModalOpen(true);
        }}>+ Sửa giờ cho Nhân viên</Button>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải bảng chấm công...</div>
        ) : (
          <Table columns={columns} data={Array.isArray(summary) ? summary : []} emptyMessage="Chưa có dữ liệu chấm công." />
        )}
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Sửa đổi giờ chấm công"
        onSubmit={handleSubmit}
        loading={overRiding}
      >
        <Input 
          label="Mã ID Nhân viên" 
          type="number"
          value={formData.userId} 
          onChange={(e) => setFormData({...formData, userId: e.target.value})} 
          required 
        />
        <Input 
          label="Ngày" 
          type="date"
          value={formData.date} 
          onChange={(e) => setFormData({...formData, date: e.target.value})} 
          required 
        />
        <Input 
          label="Giờ Check In" 
          type="time"
          value={formData.checkIn} 
          onChange={(e) => setFormData({...formData, checkIn: e.target.value})} 
        />
        <Input 
          label="Giờ Check Out" 
          type="time"
          value={formData.checkOut} 
          onChange={(e) => setFormData({...formData, checkOut: e.target.value})} 
        />
      </Modal>
    </div>
  );
};

export default AttendancePage;
