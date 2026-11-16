import {
  Truck,
  MapPin,
  CalendarDays,
  PackageCheck,
  ExternalLink,
  Clock,
} from "lucide-react";

const STATUS_STYLES = {
  PENDING: "bg-gray-100 text-gray-700",
  READY: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  IN_TRANSIT: "bg-sky-100 text-sky-700",
  OUT_FOR_DELIVERY: "bg-amber-100 text-amber-700",
  DELIVERED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  RETURNED: "bg-orange-100 text-orange-700",
};

const STATUS_LABELS = {
  PENDING: "Pending",
  READY: "Ready for shipment",
  SHIPPED: "Shipped",
  IN_TRANSIT: "In transit",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  FAILED: "Delivery failed",
  RETURNED: "Returned",
};

const formatStatus = (status) =>
  STATUS_LABELS[status] || status?.replaceAll("_", " ") || "Unknown";

const formatDate = (value, includeTime = false) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" } : {}),
  }).format(date);
};

const ShipmentStatusBadge = ({ status }) => (
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
      STATUS_STYLES[status] || "bg-gray-100 text-gray-700"
    }`}
  >
    {formatStatus(status)}
  </span>
);

const TrackingEvent = ({ event, isLast }) => (
  <div className="relative flex gap-4">
    {!isLast && (
      <div className="absolute left-[11px] top-7 h-full w-px bg-gray-200" />
    )}

    <div className="relative z-10 mt-1 h-6 w-6 shrink-0 rounded-full border-2 border-indigo-600 bg-white" />

    <div className="min-w-0 flex-1 pb-7">
      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <p className="font-semibold text-gray-900">
          {formatStatus(event.status)}
        </p>

        <span className="text-xs text-gray-500">
          {formatDate(event.event_time, true)}
        </span>
      </div>

      {event.description && (
        <p className="mt-1 text-sm text-gray-600">
          {event.description}
        </p>
      )}

      {event.location && (
        <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={13} />
          {event.location}
        </p>
      )}
    </div>
  </div>
);

const ShipmentCard = ({ shipment }) => {
  const events = Array.isArray(shipment.events)
    ? [...shipment.events].sort(
        (a, b) =>
          new Date(a.event_time) - new Date(b.event_time)
      )
    : [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="text-indigo-600" size={21} />
            <h3 className="font-semibold text-gray-900">
              Shipment #{shipment.shipment_id}
            </h3>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            {shipment.shipping_method_name || "Shipping method"}
          </p>
        </div>

        <ShipmentStatusBadge status={shipment.status} />
      </div>

      <div className="mt-5 grid gap-4 border-y border-gray-100 py-5 sm:grid-cols-2">
        <div>
          <p className="text-xs text-gray-500">Carrier</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {shipment.carrier || "Not assigned"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Tracking number</p>
          <p className="mt-1 break-all text-sm font-semibold text-gray-900">
            {shipment.tracking_number || "Not available yet"}
          </p>
        </div>

        <div>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <CalendarDays size={13} />
            Estimated delivery
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {formatDate(shipment.estimated_delivery_date)}
          </p>
        </div>

        <div>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <PackageCheck size={13} />
            Shipped date
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {formatDate(shipment.shipped_at, true)}
          </p>
        </div>

        {shipment.delivered_at && (
          <div className="sm:col-span-2">
            <p className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={13} />
              Delivered date
            </p>
            <p className="mt-1 text-sm font-semibold text-green-700">
              {formatDate(shipment.delivered_at, true)}
            </p>
          </div>
        )}
      </div>

      {shipment.tracking_url && (
        <a
          href={shipment.tracking_url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Track on carrier website
          <ExternalLink size={15} />
        </a>
      )}

      <div className="mt-6">
        <h4 className="mb-5 font-semibold text-gray-900">
          Tracking history
        </h4>

        {events.length > 0 ? (
          <div>
            {events.map((event, index) => (
              <TrackingEvent
                key={event.tracking_event_id}
                event={event}
                isLast={index === events.length - 1}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No tracking events have been recorded yet.
          </p>
        )}
      </div>
    </div>
  );
};

const ShipmentTracking = ({ shipments = [] }) => {
  if (!shipments.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center">
        <Truck className="mx-auto text-gray-400" size={30} />

        <h3 className="mt-3 font-semibold text-gray-900">
          Shipment not created yet
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Tracking information will appear here once your order has been
          prepared for shipment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {shipments.map((shipment) => (
        <ShipmentCard
          key={shipment.shipment_id}
          shipment={shipment}
        />
      ))}
    </div>
  );
};

export default ShipmentTracking;