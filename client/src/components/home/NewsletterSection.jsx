import { ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const NewsletterSection = () => (
  <section className="container-custom py-8 sm:py-12">
    <div className="mx-auto max-w-5xl rounded-[2rem] bg-[#e9ede5] px-6 py-10 text-center sm:px-12 sm:py-14">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-700 shadow-sm">
        <Mail size={25} />
      </div>
      <h2 className="mt-6 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        A little more ShopSphere in your inbox
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
        Newsletter sign-up is coming soon. In the meantime, explore what’s new in the collection.
      </p>
      <div className="mt-7 flex flex-wrap justify-center">
        <Link to="/products" className="shop-button shop-button-primary">
          Explore the collection
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  </section>
);

export default NewsletterSection;
