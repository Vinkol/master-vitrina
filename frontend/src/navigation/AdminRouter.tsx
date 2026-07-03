import { useBookingStore } from '../store/useBookingStore';
import { AdminLinkShareView } from '../pages/admin-link/AdminLinkShareView';
import { AdminProfileEditView } from '../pages/admin-profile/AdminProfileEditView';
import { TabBar } from './TabBar';
// import { AdminPlaceholderView } from '../components/admin/AdminPlaceholderView';
import { AdminDashboardView } from '../views/admin/AdminDashboardView';
import { AdminServicesView } from '../views/admin/AdminServicesView';
import { AdminHoursEditView } from '../pages/admin-hours/AdminHoursEditView';
import { AdminClientsCrmView } from '../views/admin/AdminClientsCrmView';
import { AdminSettingsView } from '../pages/admin-settings/AdminSettingsView';
import { AdminMainDashboardView } from '../views/admin/AdminMainDashboardView';

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
      case 'admin-settings':
        return <AdminSettingsView />;
      case 'admin-placeholder-main':
        return <AdminMainDashboardView />;
      case 'admin-placeholder-clients':
        // return <AdminPlaceholderView title="Клиенты" icon="👥" />;
        return <AdminClientsCrmView />;
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
