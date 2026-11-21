import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PackageOpen, RefreshCw } from "lucide-react";

import { getUserOrders } from "../../services/order.service";

import OrderCard from "../../components/orders/OrderCard";
import OrderFilters from "../../components/orders/OrderFilters";
import OrderPagination from "../../components/orders/OrderPagination";
import StorefrontSkeleton from "../../components/common/StorefrontSkeleton";

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
    return <StorefrontSkeleton label="Loading your orders" layout="list" />;
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
    <section className="shop-page px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-indigo-600">
            Your Account
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            My Orders
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            View and manage your previous purchases.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="shop-panel p-5">
            <p className="text-sm text-muted">
              Total Orders
            </p>

            <p className="mt-1 text-2xl font-semibold text-ink">
              {orders.length}
            </p>
          </div>

          <div className="shop-panel p-5">
            <p className="text-sm text-muted">
              Active Orders
            </p>

            <p className="mt-1 text-2xl font-semibold text-indigo-700">
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
            <div className="shop-panel px-5 py-16 text-center">
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
