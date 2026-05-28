import { useBookingStore } from '../store/bookingStore';
import { MainView } from '../views/client/MainView';
import { CalendarView } from '../views/client/CalendarView';

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
