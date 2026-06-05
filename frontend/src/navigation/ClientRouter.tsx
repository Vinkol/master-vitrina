import { CalendarView } from '../pages/client-booking/CalendarView';
import { MainView } from '../pages/client-booking/MainView';
import { useBookingStore } from '../store/useBookingStore';

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
