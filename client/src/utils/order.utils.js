
export const formatCurrency = (value) => {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
};

export const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const getOrderStatusLabel = (status) => {
  const labels = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };

  return labels[status] || status || "Unknown";
};

export const canCancelOrder = (status) => {
  return ["PENDING", "CONFIRMED"].includes(status);
};

export const getOrderErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
};
