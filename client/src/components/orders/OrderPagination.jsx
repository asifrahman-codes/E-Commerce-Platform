
import { ChevronLeft, ChevronRight } from "lucide-react";

const OrderPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 pt-4">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} />
        Previous
      </button>

      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default OrderPagination;
