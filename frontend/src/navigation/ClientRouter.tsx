import { CalendarView } from '../pages/client-booking/CalendarView';
import { MainView } from '../pages/client-booking/MainView';
import { useBookingStore } from '../store/useBookingStore';
import { BookingConfirmView } from '../views/client/BookingConfirmView';
import { BookingSuccessView } from '../views/client/BookingSuccessView';

export function ClientRouter() {
  const currentScreen = useBookingStore((state) => state.currentScreen);

  switch (currentScreen) {
    case 'profile':
      return <MainView />;
    case 'calendar':
      return <CalendarView />;
    case 'booking-confirm':
      return <BookingConfirmView />;
    case 'booking-success':
      return <BookingSuccessView />;
    default:
      return <MainView />;
  }
}
