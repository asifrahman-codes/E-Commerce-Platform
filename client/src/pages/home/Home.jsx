import HeroSection from "../../components/home/HeroSection";

import BenefitsSection from "../../components/home/BenefitsSection";

import CategorySection from "../../components/home/CategorySection";

import PromoBanner from "../../components/home/PromoBanner";

import HomeRecommendations from "../../components/recommendations/HomeRecommendations";

import NewsletterSection from "../../components/home/NewsletterSection";
import FeaturedProducts from "../../components/home/FeaturedProducts";

const Home = () => {
  return (
    <div>
      <HeroSection />
      <BenefitsSection />
      <CategorySection />
      <FeaturedProducts />
      <PromoBanner />
      <HomeRecommendations />
      <NewsletterSection />
    </div>
  );
};

export default Home;