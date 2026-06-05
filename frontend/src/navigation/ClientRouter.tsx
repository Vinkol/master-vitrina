import { CalendarView } from '../pages/client-booking/CalendarView';
import { MainView } from '../pages/client-booking/MainView';
import { useBookingStore } from '../store/useBookingStore';
import { BookingConfirmView } from '../views/client/BookingConfirmView';

export function ClientRouter() {
  const currentScreen = useBookingStore((state) => state.currentScreen);

  switch (currentScreen) {
    case 'profile':
      return <MainView />;
    case 'calendar':
      return <CalendarView />;
    case 'booking-confirm':
      return <BookingConfirmView />;
    default:
      return <MainView />;
  }
}
