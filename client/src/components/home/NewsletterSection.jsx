import { useState } from "react";

import { Mail } from "lucide-react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    // Backend newsletter integration will be added later.
    alert("Newsletter subscription is not available yet.");

    setEmail("");
  };

  return (
    <section className="bg-indigo-50 py-16">

      <div className="container-custom mx-auto max-w-3xl text-center">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
          <Mail size={27} />
        </div>

        <h2 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl">
          Stay Updated with ShopSphere
        </h2>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Stay informed about new arrivals and store updates.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
        >

          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email address"
            className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Subscribe
          </button>

        </form>

      </div>

    </section>
  );
};

export default NewsletterSection;