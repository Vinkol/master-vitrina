import { useBookingStore } from '../store/useBookingStore';
import { AdminLinkShareView } from '../views/admin/AdminLinkShareView';
import { AdminProfileEditView } from '../views/admin/AdminProfileEditView';
// import { AdminClientsCrmView } from '../views/admin/AdminClientsCrmView';
import { TabBar } from './TabBar';
import { AdminPlaceholderView } from '../components/admin/AdminPlaceholderView';
import { AdminDashboardView } from '../pages/admin-dashboard/AdminDashboardView';
import { AdminServicesView } from '../pages/admin-services/AdminServicesView';
import { AdminHoursEditView } from '../pages/admin-hours/AdminHoursEditView';
import { AdminMainDashboardView } from '../pages/admin-dashboard/AdminMainDashboardView';

export function AdminRouter() {
  const currentScreen = useBookingStore((state) => state.currentScreen);
  const renderScreen = () => {
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
      // return <AdminClientsCrmView />;
      default:
        return <AdminMainDashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 select-none antialiased">
      {renderScreen()}
      <TabBar />
    </div>
  );
}
