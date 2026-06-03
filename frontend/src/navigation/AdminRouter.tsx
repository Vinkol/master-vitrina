import { useBookingStore } from '../store/useBookingStore';
import { AdminDashboardView } from '../views/admin/AdminDashboardView';
import { AdminServicesView } from '../views/admin/AdminServicesView';
import { AdminLinkShareView } from '../views/admin/AdminLinkShareView';
import { AdminProfileEditView } from '../views/admin/AdminProfileEditView';
import { AdminHoursEditView } from '../views/admin/AdminHoursEditView';
import { AdminMainDashboardView } from '../views/admin/AdminMainDashboardView';
// import { AdminClientsCrmView } from '../views/admin/AdminClientsCrmView';
import { TabBar } from './TabBar';
import { AdminPlaceholderView } from '../components/admin/AdminPlaceholderView';

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
    // ИСПРАВЛЕНО: Сюда переехала общая тёмная тема админки салона и нижнее меню!
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 select-none antialiased">
      {renderScreen()}
      <TabBar /> {/* Теперь навигация ВСЕГДА будет внутри личного кабинета мастера! */}
    </div>
  );
}
