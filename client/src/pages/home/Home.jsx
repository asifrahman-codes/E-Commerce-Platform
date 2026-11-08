import HeroSection from "../../components/home/HeroSection";

import BenefitsSection from "../../components/home/BenefitsSection";

import CategorySection from "../../components/home/CategorySection";

import FeaturedProducts from "../../components/home/FeaturedProducts";

import PromoBanner from "../../components/home/PromoBanner";

import NewArrivals from "../../components/home/NewArrivals";

import NewsletterSection from "../../components/home/NewsletterSection";

const Home = () => {
  return (
    <main>

      {/* Hero */}
      <HeroSection />

      {/* Shopping Benefits */}
      <BenefitsSection />

      {/* Categories */}
      <CategorySection />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Promotional Banner */}
      <PromoBanner />

      {/* New Arrivals */}
      <NewArrivals />

      {/* Newsletter */}
      <NewsletterSection />

    </main>
  );
};

export default Home;