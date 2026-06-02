import React, { useEffect, useState } from 'react';
import { reportApi } from '../../api/reportApi';
import { useApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';

const ReportPage = () => {
  const { data: topSelling, execute: fetchTopSelling, loading } = useApi(reportApi.getTopSelling);
  const [filter, setFilter] = useState('month');

  useEffect(() => {
    fetchTopSelling({ limit: 10 });
  }, [fetchTopSelling, filter]);

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  const columns = [
    { header: 'Món ăn', render: (row) => <span style={{ fontWeight: 'bold' }}>{row.name}</span> },
    { header: 'Đã bán', render: (row) => `${row.totalSold ?? row.total_sold ?? 0} cốc` },
    { header: 'Doanh thu', render: (row) => <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{formatCurrency(row.totalRevenue ?? row.total_revenue)}</span> }
  ];

  return (
    <div className="flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <h2>📈 Báo cáo & Thống kê</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3>Top Món Bán Chạy Nhất</h3>
          </div>
          
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Đang tải dữ liệu báo cáo...
            </div>
          ) : (
            <Table 
              columns={columns} 
              data={Array.isArray(topSelling) ? topSelling : []} 
              emptyMessage="Chưa có dữ liệu bán hàng." 
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default ReportPage;
