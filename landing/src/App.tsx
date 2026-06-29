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
    <div>
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
