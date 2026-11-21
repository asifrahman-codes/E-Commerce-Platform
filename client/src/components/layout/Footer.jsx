import { Link } from "react-router-dom";
import { ArrowUpRight, Headset, MapPin, ShoppingBag } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-16 bg-[#1d3026] text-white">
      <div className="container-custom grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-16 lg:py-16">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/10 text-[#d3dfce]">
              <ShoppingBag size={19} />
            </span>
            <span className="text-xl font-semibold tracking-tight text-white">ShopSphere</span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
            A considered collection for the things you use, love, and keep.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white">Discover</h2>
          <ul className="mt-5 space-y-3 text-sm text-white/65">
            <li><Link to="/products" className="transition hover:text-white">Shop all</Link></li>
            <li><Link to="/categories" className="transition hover:text-white">Categories</Link></li>
            <li><Link to="/flash-sales" className="transition hover:text-white">Current offers</Link></li>
            <li><Link to="/wishlist" className="transition hover:text-white">Your wishlist</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white">Your account</h2>
          <ul className="mt-5 space-y-3 text-sm text-white/65">
            <li><Link to="/account" className="transition hover:text-white">Profile & settings</Link></li>
            <li><Link to="/orders" className="transition hover:text-white">Orders & tracking</Link></li>
            <li><Link to="/my-reviews" className="transition hover:text-white">Your reviews</Link></li>
            <li><Link to="/account/notifications" className="transition hover:text-white">Notifications</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white">Here to help</h2>
          <ul className="mt-5 space-y-4 text-sm text-white/65">
            <li>
              <Link to="/support" className="inline-flex items-center gap-2 transition hover:text-white">
                <Headset size={16} className="text-[#c7d7bd]" />
                Customer support
                <ArrowUpRight size={14} />
              </Link>
            </li>
            <li className="inline-flex items-center gap-2">
              <MapPin size={16} className="text-[#c7d7bd]" />
              Online store
            </li>
          </ul>
          <p className="mt-5 text-xs leading-5 text-white/45">Support is available through your ShopSphere account.</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-custom flex flex-col gap-2 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
          <p>Thoughtful shopping, made simple.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
