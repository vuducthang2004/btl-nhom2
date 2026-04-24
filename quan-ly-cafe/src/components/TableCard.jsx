export default function TableCard({ table, onClick }) {
  let bg = "bg-green-500";

  if (table.status === "using") bg = "bg-red-500";
  if (table.status === "reserved") bg = "bg-yellow-400";

  return (
    <div
      onClick={() => onClick(table)}
      className={`${bg} text-white p-5 rounded-xl shadow-md cursor-pointer hover:scale-105 transition`}
    >
      <h2 className="text-xl font-bold">{table.name}</h2>
      <p className="mt-2">
        Trạng thái:{" "}
        {table.status === "empty"
          ? "Trống"
          : table.status === "using"
          ? "Đang dùng"
          : "Đã đặt"}
      </p>
    </div>
  );
}