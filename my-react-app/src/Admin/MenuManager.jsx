import React, { useState } from 'react';

const MenuManager = () => {
  const [items, setItems] = useState([
    { id: 1, name: "Cà phê Muối", price: 35000 },
    { id: 2, name: "Trà Nhãn Cam Sả", price: 40000 }
  ]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const addItem = () => {
    if(!name || !price) return alert("Nhập đủ thông tin!");
    setItems([...items, { id: Date.now(), name, price: Number(price) }]);
    setName(""); setPrice("");
  };

  return (
    <div>
      <h3> QUẢN LÝ THỰC ĐƠN</h3>
      <div className="admin-form">
        <input className="admin-input" placeholder="Tên món" value={name} onChange={e => setName(e.target.value)} />
        <input className="admin-input" type="number" placeholder="Giá bán" value={price} onChange={e => setPrice(e.target.value)} />
        <button className="btn-add" onClick={addItem}>+ THÊM MÓN</button>
      </div>
      <table className="admin-table">
        <thead><tr><th>Tên món</th><th>Giá</th><th>Hành động</th></tr></thead>
        <tbody>
          {items.map(i => (
            <tr key={i.id}>
              <td>{i.name}</td><td>{i.price.toLocaleString()}đ</td>
              <td><button className="btn-del" onClick={() => setItems(items.filter(x => x.id !== i.id))}>Xóa</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default MenuManager;