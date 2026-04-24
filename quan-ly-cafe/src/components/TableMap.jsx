import TableCard from "./TableCard";

export default function TableMap({ tables, onTableClick }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {tables.map((t) => (
        <TableCard key={t.id} table={t} onClick={onTableClick} />
      ))}
    </div>
  );
}