import React, { useState } from 'react';

const InventoryManager = () => {
  const [stock, setStock] = useState([
    { id: 1, name: "Hạt Cà phê", qty: 5},
    { id: 2, name: "Sữa đặc", qty: 10}
  ]);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");

  const addStock = () => {
    setStock([...stock, { id: Date.now(), name, qty: Number(qty)}]);
    setName(""); setQty("");
  };

  return (
    <div>
      <h3> QUẢN LÝ KHO (TỒN KHO)</h3>
      <div className="admin-form">
        <input className="admin-input" placeholder="Tên nguyên liệu" value={name} onChange={e => setName(e.target.value)} />
        <input className="admin-input" type="number" placeholder="Số lượng" value={qty} onChange={e => setQty(e.target.value)} />
        <button className="btn-add" onClick={addStock}>+ NHẬP KHO</button>
      </div>
      <table className="admin-table">
        <thead><tr><th>Nguyên liệu</th><th>Tồn kho</th><th>Hành động</th></tr></thead>
        <tbody>
          {stock.map(s => (
            <tr key={s.id}><td>{s.name}</td><td>{s.qty}</td>
            <td><button className="btn-del" onClick={() => setStock(stock.filter(x => x.id !== s.id))}>Xóa</button></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default InventoryManager;