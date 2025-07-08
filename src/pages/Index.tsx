
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import TechnologySection from '@/components/TechnologySection';
import TestimonialsSection from '@/components/TestimonialsSection';
import MascotCTASection from '@/components/MascotCTASection';
import PricingSection from '@/components/PricingSection';
import Footer from '@/components/Footer';
import FloatingMascot from '@/components/FloatingMascot';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TechnologySection />
        <TestimonialsSection />
        <MascotCTASection />
        <PricingSection />
      </main>
      <Footer />
      <FloatingMascot />
    </div>
  );
};

export default Index;
