import { Header } from './sections/Header';
import { Hero } from './sections/Hero';
import { Steps } from './sections/Steps';
import { Demo } from './sections/Demo';
import { Faq } from './sections/Faq';
import { Pricing } from './sections/Pricing';
import { CtaMagnet } from './sections/CtaMagnet';
import { Footer } from './sections/Footer';
import { useTheme } from './hook/useTheme';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-[#030712] transition-colors duration-500 font-sans relative selection:bg-indigo-500/30">
      <div className="fixed-global-canvas" />
      <Header theme={theme} toggleTheme={toggleTheme} />    
      <Hero />
      <Steps />
      <Demo />
      <Faq />
      <Pricing />
      <CtaMagnet />
      <Footer />
    </div>
  );
}

export default App;
