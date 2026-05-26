import { useBookingStore } from '../store/bookingStore';
import { MainView } from '../components/layouts/MainView';
import { CalendarView } from '../components/layouts/CalendarView';

export function ClientRouter() {
  const currentScreen = useBookingStore((state) => state.currentScreen);

  switch (currentScreen) {
    case 'profile':
      return <MainView />;
    case 'calendar':
      return <CalendarView />;
    default:
      return <MainView />;
  }
}
