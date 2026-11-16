import { Banknote, CreditCard } from "lucide-react";

const METHODS = [
  {
    value: "COD",
    title: "Cash on delivery",
    description: "Pay in cash when your order arrives.",
    icon: Banknote,
  },
  {
    value: "ONLINE",
    title: "Pay online",
    description: "Pay now with the test payment gateway.",
    icon: CreditCard,
  },
];

export default function PaymentMethodSelector({ value, onChange }) {
  return (
    <section aria-labelledby="payment-heading" className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <h2 id="payment-heading" className="flex items-center gap-2 text-lg font-bold text-zinc-900">
        <CreditCard size={20} className="text-indigo-600" /> Payment method
      </h2>

      <div role="radiogroup" aria-labelledby="payment-heading" className="mt-5 grid gap-3 sm:grid-cols-2">
        {METHODS.map(({ value: method, title, description, icon: Icon }) => {
          const selected = value === method;
          return (
            <label
              key={method}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${selected ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600" : "border-zinc-200 hover:border-zinc-300"}`}
            >
              <input
                type="radio"
                name="payment-method"
                value={method}
                checked={selected}
                onChange={() => onChange(method)}
                className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <Icon size={20} className="mt-0.5 shrink-0 text-zinc-600" aria-hidden="true" />
              <span className="text-sm">
                <span className="block font-semibold text-zinc-900">{title}</span>
                <span className="block text-zinc-600">{description}</span>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
