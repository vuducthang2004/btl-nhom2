import React, { useEffect, useState } from 'react';
import { attendanceApi } from '../../api/attendanceApi';
import { useApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const AttendancePage = () => {
  const { data: summary, loading: loadingSummary, execute: fetchSummary } = useApi(attendanceApi.getSummary);
  const { data: logs, loading: loadingLogs, execute: fetchLogs } = useApi(attendanceApi.getLogs);
  const { execute: override, loading: overRiding } = useApi(attendanceApi.overrideAttendance);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ assignmentId: '', checkIn: '', checkOut: '' });
  
  // Lọc theo tháng hiện tại
  const [filter, setFilter] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchSummary(filter);
    fetchLogs(filter);
  }, [fetchSummary, fetchLogs, filter]);

  const handleSubmit = async () => {
    try {
      await override({
        assignmentId: Number(formData.assignmentId),
        checkInAt: formData.checkIn ? `${formData.checkIn.includes('T') ? formData.checkIn : new Date().toISOString().split('T')[0] + 'T' + formData.checkIn}` : null,
        checkOutAt: formData.checkOut ? `${formData.checkOut.includes('T') ? formData.checkOut : new Date().toISOString().split('T')[0] + 'T' + formData.checkOut}` : null
      });
      setIsModalOpen(false);
      fetchSummary(filter);
      fetchLogs(filter);
      alert('Đã cập nhật giờ làm thành công!');
    } catch (err) {
      alert('Có lỗi xảy ra khi cập nhật giờ làm!');
    }
  };

  const summaryColumns = [
    { header: 'ID NV', render: (row) => row.userId ?? row.user_id },
    { header: 'Tên nhân viên', render: (row) => <span style={{ fontWeight: 'bold' }}>{row.fullName ?? row.full_name}</span> },
    { header: 'Chức vụ', render: (row) => row.role },
    { header: 'Tổng số ca', render: (row) => row.totalShifts ?? row.total_shifts },
    { header: 'Ca đã làm', render: (row) => row.attendedShifts ?? row.attended_shifts },
    { header: 'Đúng giờ', render: (row) => <span style={{ color: 'green', fontWeight: 'bold' }}>{row.onTimeCount ?? row.on_time_count}</span> },
    { header: 'Đi muộn', render: (row) => <span style={{ color: 'orange', fontWeight: 'bold' }}>{row.lateCount ?? row.late_count}</span> },
    { header: 'Về sớm', render: (row) => <span style={{ color: 'red', fontWeight: 'bold' }}>{row.earlyLeaveCount ?? row.early_leave_count}</span> },
    { header: 'Vắng mặt', render: (row) => <span style={{ color: 'gray', fontWeight: 'bold' }}>{row.absentCount ?? row.absent_count}</span> },
    { header: 'Tổng giờ làm', render: (row) => <span style={{ color: '#1976d2', fontWeight: 'bold' }}>{row.totalHours ?? row.total_hours}h</span> },
  ];

  const logColumns = [
    { header: 'ID Phân công', render: (row) => row.assignmentId ?? row.assignment_id },
    { header: 'Nhân viên', render: (row) => <span style={{ fontWeight: 'bold' }}>{row.userFullName ?? row.user_full_name}</span> },
    { header: 'Ngày làm', render: (row) => {
      const d = row.workDate ?? row.work_date;
      return d ? d.substring(0, 10) : '-';
    }},
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
    { header: 'Check In', render: (row) => {
      const t = row.checkInAt ?? row.check_in_at;
      return t ? new Date(t).toLocaleTimeString('vi-VN') : '-';
    }},
    { header: 'Check Out', render: (row) => {
      const t = row.checkOutAt ?? row.check_out_at;
      return t ? new Date(t).toLocaleTimeString('vi-VN') : '-';
    }},
    { header: 'Thao tác', render: (row) => (
      <Button variant="outline" onClick={() => {
        setFormData({
          assignmentId: row.assignmentId ?? row.assignment_id,
          checkIn: row.checkInAt ?? row.check_in_at ?? '',
          checkOut: row.checkOutAt ?? row.check_out_at ?? ''
        });
        setIsModalOpen(true);
      }}>Sửa giờ</Button>
    )}
  ];

  return (
    <div className="flex-col gap-4">
      {/* BỘ LỌC THỜI GIAN CHUNG */}
      <Card style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold' }}>Lọc theo khoảng thời gian:</div>
        <Input 
          type="date" 
          value={filter.from} 
          onChange={(e) => setFilter({...filter, from: e.target.value})} 
          style={{ width: 'auto' }}
        />
        <span>đến</span>
        <Input 
          type="date" 
          value={filter.to} 
          onChange={(e) => setFilter({...filter, to: e.target.value})} 
          style={{ width: 'auto' }}
        />
      </Card>

      {/* PHẦN 1: BẢNG TỔNG HỢP */}
      <div className="flex justify-between items-center mb-4">
        <h2>📊 1. Bảng Tổng hợp Chấm công</h2>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden', marginBottom: '40px' }}>
        {loadingSummary ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải bảng tổng hợp...</div>
        ) : (
          <Table columns={summaryColumns} data={Array.isArray(summary) ? summary : []} emptyMessage="Chưa có dữ liệu tổng hợp." />
        )}
      </Card>

      {/* PHẦN 2: LỊCH SỬ CHI TIẾT */}
      <div className="flex justify-between items-center mb-4">
        <h2>📅 2. Lịch sử Chi tiết & Chỉnh sửa</h2>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loadingLogs ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải lịch sử...</div>
        ) : (
          <Table columns={logColumns} data={Array.isArray(logs?.data) ? logs.data : (Array.isArray(logs) ? logs : [])} emptyMessage="Chưa có bản ghi chấm công nào." />
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
