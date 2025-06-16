
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import PricingSection from '@/components/PricingSection';
import AffiliatePromoBanner from '@/components/AffiliatePromoBanner';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        
        {/* Banner do programa de afiliados */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-6">
            <AffiliatePromoBanner />
          </div>
        </section>
        
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
