import { useState } from "react";
import { Mail } from "lucide-react";
import { subscribeNewsletter } from "../../services/platform.service";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      await subscribeNewsletter(email);
      setStatus("You are subscribed.");
      setEmail("");
    } catch (error) {
      setStatus(error.message || "Unable to subscribe.");
    }
  };

  return (
    <section className="container-custom py-8 sm:py-12">
      <div className="mx-auto max-w-5xl rounded-[2rem] bg-[#e9ede5] px-6 py-10 text-center sm:px-12 sm:py-14">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-700 shadow-sm">
          <Mail size={25} />
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">A little more ShopSphere in your inbox</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">Receive store news, product updates, and campaigns.</p>
        <form onSubmit={submit} className="mx-auto mt-7 flex max-w-lg flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="newsletter-email">Email address</label>
          <input id="newsletter-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-12 min-w-0 flex-1 rounded-xl border border-white bg-white px-4 text-sm outline-none focus:ring-4 focus:ring-[#315d47]/10" />
          <button type="submit" className="h-12 rounded-xl bg-[#315d47] px-5 text-sm font-semibold text-white">Subscribe</button>
        </form>
        {status && <p role="status" className="mt-3 text-sm font-medium text-[#315d47]">{status}</p>}
      </div>
    </section>
  );
};

export default NewsletterSection;
