import React, { useEffect, useState } from 'react';
import { inventoryApi } from '../../api/inventoryApi';
import { useApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

const InventoryPage = () => {
  const { data: ingredients, loading, error, execute: fetchIngredients } = useApi(inventoryApi.getIngredients);
  const { execute: createIngredient, loading: creating } = useApi(inventoryApi.createIngredient);
  const { execute: updateStock, loading: updatingStock } = useApi(inventoryApi.updateStock);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', unit: 'kg', stockQuantity: '', minThreshold: '' });
  
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockItem, setStockItem] = useState(null);
  const [stockAdjustment, setStockAdjustment] = useState('');

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const openCreateModal = () => {
    setFormData({ name: '', unit: 'kg', stockQuantity: '', minThreshold: '' });
    setIsModalOpen(true);
  };

  const openStockModal = (item) => {
    setStockItem(item);
    setStockAdjustment('');
    setIsStockModalOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!formData.name.trim() || !formData.unit) {
      alert('Vui lòng nhập tên và đơn vị tính!');
      return;
    }
    try {
      await createIngredient({
        name: formData.name,
        unit: formData.unit,
        stockQuantity: Number(formData.stockQuantity) || 0,
        minThreshold: Number(formData.minThreshold) || 0
      });
      setIsModalOpen(false);
      fetchIngredients();
    } catch (err) {
      alert('Lỗi tạo nguyên liệu!');
    }
  };

  const handleStockSubmit = async () => {
    const qty = Number(stockAdjustment);
    if (isNaN(qty) || qty < 0) {
      alert('Vui lòng nhập số lượng hợp lệ (>= 0)');
      return;
    }

    try {
      await updateStock(stockItem.id, {
        quantity: qty,
        action: 'set'
      });
      setIsStockModalOpen(false);
      fetchIngredients();
    } catch (err) {
      alert('Lỗi cập nhật kho!');
    }
  };

  const columns = [
    { header: 'ID', render: (row) => <span className="text-muted">#{row.id}</span> },
    { header: 'Tên Nguyên Liệu', render: (row) => <span style={{ fontWeight: 'bold' }}>{row.name}</span> },
    { header: 'Đơn vị', accessor: 'unit' },
    { 
      header: 'Tồn Kho', 
      render: (row) => {
        const isLow = row.stockQuantity <= row.minThreshold;
        return (
          <span style={{ 
            fontWeight: 'bold', 
            color: isLow ? 'var(--color-error)' : 'var(--color-success)'
          }}>
            {row.stockQuantity}
            {isLow && <span style={{ marginLeft: '8px', fontSize: '12px' }}>⚠️ Sắp hết</span>}
          </span>
        );
      } 
    },
    { 
      header: 'Thao tác', 
      align: 'right',
      render: (row) => (
        <Button variant="text" style={{ padding: '4px 8px' }} onClick={() => openStockModal(row)}>
          Sửa tồn kho
        </Button>
      )
    }
  ];

  return (
    <div className="flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <h2>📦 Quản lý Kho (Tồn kho)</h2>
        <Button onClick={openCreateModal}>+ Nhập nguyên liệu mới</Button>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      )}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="text-center text-muted" style={{ padding: '40px' }}>Đang tải dữ liệu kho...</div>
        ) : (
          <Table columns={columns} data={Array.isArray(ingredients) ? ingredients : []} emptyMessage="Chưa có nguyên liệu nào." />
        )}
      </Card>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm Nguyên Liệu" onSubmit={handleCreateSubmit} loading={creating}>
        <Input label="Tên nguyên liệu" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="Ví dụ: Đường cát" />
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Đơn vị tính</label>
          <select 
            value={formData.unit}
            onChange={(e) => setFormData({...formData, unit: e.target.value})}
            style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#fafafa', fontSize: '15px' }}
          >
            <option value="kg">Kilogram (kg)</option>
            <option value="g">Gram (g)</option>
            <option value="l">Lít (l)</option>
            <option value="ml">Mililit (ml)</option>
            <option value="pack">Gói (pack)</option>
            <option value="piece">Cái (piece)</option>
            <option value="shot">Shot (shot)</option>
            <option value="pump">Bơm (pump)</option>
            <option value="tbsp">Thìa (tbsp)</option>
          </select>
        </div>
        <Input label="Tồn kho ban đầu" type="number" value={formData.stockQuantity} onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})} />
        <Input label="Mức cảnh báo sắp hết" type="number" value={formData.minThreshold} onChange={(e) => setFormData({...formData, minThreshold: e.target.value})} />
      </Modal>

      <Modal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} title={`Cập nhật kho: ${stockItem?.name}`} onSubmit={handleStockSubmit} loading={updatingStock}>
        <p className="text-muted" style={{ marginBottom: '16px' }}>
          Tồn kho hiện tại: <strong>{stockItem?.stockQuantity} {stockItem?.unit}</strong>
        </p>
        <Input 
          label={`Tồn kho thực tế (${stockItem?.unit})`} 
          type="number"
          value={stockAdjustment} 
          onChange={(e) => setStockAdjustment(e.target.value)} 
          required 
          placeholder={`Ví dụ: 100`}
        />
      </Modal>
    </div>
  );
};

export default InventoryPage;