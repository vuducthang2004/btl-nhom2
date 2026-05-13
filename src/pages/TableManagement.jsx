import { useState } from "react";
import { tables as initialTables } from "../data/tables";
import TableMap from "../components/TableMap.jsx";
import ModalTableDetail from "../components/ModalTableDetail.jsx";

export default function TableManagement() {
  const [tables, setTables] = useState(initialTables);
  const [selectedTable, setSelectedTable] = useState(null);

  const handleTableClick = (table) => {
    setSelectedTable(table);
  };

  const handleCloseModal = () => {
    setSelectedTable(null);
  };

  const handleUpdateStatus = (id, newStatus) => {
    const updatedTables = tables.map((t) =>
      t.id === id ? { ...t, status: newStatus } : t
    );

    setTables(updatedTables);

    const updatedSelected = updatedTables.find((t) => t.id === id);
    setSelectedTable(updatedSelected);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800">Quản lý sơ đồ bàn</h1>

      <p className="text-gray-600 mt-2">
        Click vào bàn để xem chi tiết và đổi trạng thái.
      </p>

      <div className="mt-8">
        <TableMap tables={tables} onTableClick={handleTableClick} />
      </div>

      <ModalTableDetail
        table={selectedTable}
        onClose={handleCloseModal}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}