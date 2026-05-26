import { useBookingStore } from '../store/bookingStore';
import { AdminDashboardView } from '../components/layouts/AdminDashboardView';
import { AdminServicesView } from '../components/layouts/AdminServicesView';
import { AdminLinkShareView } from '../components/layouts/AdminLinkShareView';
import { AdminProfileEditView } from '../components/layouts/AdminProfileEditView';
import { AdminHoursEditView } from '../components/layouts/AdminHoursEditView';
import { AdminPlaceholderView } from '../components/layouts/AdminPlaceholderView';

export function AdminRouter() {
  const currentScreen = useBookingStore((state) => state.currentScreen);

  switch (currentScreen) {
    case 'admin-dashboard':
      return <AdminDashboardView />;
    case 'admin-services':
      return <AdminServicesView />;
    case 'admin-link-share':
      return <AdminLinkShareView />;
    case 'admin-profile-edit':
      return <AdminProfileEditView />;
    case 'admin-hours-edit':
      return <AdminHoursEditView />;
    case 'admin-placeholder-main':
      return <AdminPlaceholderView title="Главная" icon="📅" />;
    case 'admin-placeholder-clients':
      return <AdminPlaceholderView title="Клиенты" icon="👥" />;
    default:
      return <AdminDashboardView />;
  }
}
