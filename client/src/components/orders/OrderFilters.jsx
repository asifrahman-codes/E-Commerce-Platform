
import { Search, SlidersHorizontal } from "lucide-react";

const OrderFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  statuses,
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="relative sm:w-56">
          <SlidersHorizontal
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Orders</option>

            {statuses.map((item) => (
              <option key={item} value={item}>
                {item.charAt(0) + item.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;
