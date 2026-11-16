import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PackageOpen, RefreshCw } from "lucide-react";

import { getUserOrders } from "../../services/order.service";

import OrderCard from "../../components/orders/OrderCard";
import OrderFilters from "../../components/orders/OrderFilters";
import OrderPagination from "../../components/orders/OrderPagination";

import { getOrderErrorMessage } from "../../utils/order.utils";

const PAGE_SIZE = 5;

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getUserOrders();

      if (!Array.isArray(response)) {
          throw new Error("Invalid orders response from server");
      }

      setOrders(response);

    } catch (err) {
      setError(getOrderErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const statuses = useMemo(() => {
    return [
      ...new Set(
        orders
          .map((order) => order.status)
          .filter(Boolean)
      ),
    ].sort();
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = String(
        order.order_number || ""
      )
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      const matchesStatus =
        status === "ALL" || order.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / PAGE_SIZE)
  );

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return filteredOrders.slice(
      start,
      start + PAGE_SIZE
    );
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

          <p className="mt-4 text-sm text-gray-500">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <PackageOpen className="mx-auto text-red-500" size={42} />

        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          Unable to load orders
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          {error}
        </p>

        <button
          type="button"
          onClick={fetchOrders}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-indigo-600">
            Your Account
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            My Orders
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            View and manage your previous purchases.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {orders.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">
              Active Orders
            </p>

            <p className="mt-1 text-2xl font-bold text-indigo-600">
              {
                orders.filter((order) =>
                  ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"]
                    .includes(order.status)
                ).length
              }
            </p>
          </div>
        </div>

        <OrderFilters
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          statuses={statuses}
        />

        <div className="mt-6 space-y-4">
          {paginatedOrders.length > 0 ? (
            paginatedOrders.map((order) => (
              <OrderCard
                key={order.order_id}
                order={order}
              />
            ))
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white px-5 py-16 text-center">
              <PackageOpen
                size={45}
                className="mx-auto text-gray-300"
              />

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No orders found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {orders.length === 0
                  ? "You have not placed any orders yet."
                  : "Try changing your search or status filter."}
              </p>

              {orders.length === 0 && (
                <Link
                  to="/products"
                  className="mt-5 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Start Shopping
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="mt-6">
          <OrderPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </section>
  );
};

export default MyOrders;
