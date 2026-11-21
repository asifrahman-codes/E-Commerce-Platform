import {
  Truck,
  ShieldCheck,
  Headphones,
  CreditCard,
} from "lucide-react";

const benefits = [
  {
    icon: Truck,
    title: "Convenient Delivery",
    description: "Delivery options for your orders.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Shopping",
    description: "A safer shopping experience.",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description: "We're here to help.",
  },
  {
    icon: CreditCard,
    title: "Flexible Payment",
    description: "Available payment options.",
  },
];

const BenefitsSection = () => {
  return (
    <section className="border-b border-line bg-white">

      <div className="container-custom grid grid-cols-2 gap-x-5 gap-y-7 py-9 lg:grid-cols-4">

        {benefits.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-start gap-3"
            >

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                <Icon size={23} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-ink">
                  {item.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-muted">
                  {item.description}
                </p>
              </div>

            </div>
          );
        })}

      </div>

    </section>
  );
};

export default BenefitsSection;