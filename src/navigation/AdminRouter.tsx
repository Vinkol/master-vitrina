import { useBookingStore } from '../store/bookingStore';
import { AdminDashboardView } from '../views/admin/AdminDashboardView';
import { AdminServicesView } from '../views/admin/AdminServicesView';
import { AdminLinkShareView } from '../views/admin/AdminLinkShareView';
import { AdminProfileEditView } from '../views/admin/AdminProfileEditView';
import { AdminHoursEditView } from '../views/admin/AdminHoursEditView';
import { AdminPlaceholderView } from '../components/admin/AdminPlaceholderView';
import { AdminMainDashboardView } from '../views/admin/AdminMainDashboardView';

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
      return <AdminMainDashboardView />;
    case 'admin-placeholder-clients':
      return <AdminPlaceholderView title="Клиенты" icon="👥" />;
    default:
      return <AdminMainDashboardView />;
  }
}
