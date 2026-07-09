import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';

// Auth pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

// Customer pages
import CustomerDashboard from '@/pages/customer/CustomerDashboard';

// Admin pages
import AdminDashboard  from '@/pages/admin/AdminDashboard';
import AdminUsers      from '@/pages/admin/AdminUsers';
import AdminProviders  from '@/pages/admin/AdminProviders';
import AdminServices   from '@/pages/admin/AdminServices';
import AdminHolidays   from '@/pages/admin/AdminHolidays';
import AdminReports    from '@/pages/admin/AdminReports';
import AdminSettings   from '@/pages/admin/AdminSettings';
import AdminAppointments from '@/pages/admin/AdminAppointments';

// Shared pages
import AppointmentList      from '@/pages/shared/AppointmentList';
import AppointmentDetail    from '@/pages/shared/AppointmentDetail';
import BookAppointment      from '@/pages/shared/BookAppointment';
import RescheduleAppointment from '@/pages/shared/RescheduleAppointment';
import CalendarView         from '@/pages/shared/CalendarView';
import ChatPage             from '@/pages/shared/ChatPage';
import NotificationsPage    from '@/pages/shared/NotificationsPage';
import ProfilePage          from '@/pages/shared/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* Authenticated routes — shared layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Customer dashboard */}
            <Route path="/dashboard"   element={<CustomerDashboard />} />

            {/* Shared appointment flows */}
            <Route path="/appointments"                       element={<AppointmentList />} />
            <Route path="/appointments/book"                  element={<BookAppointment />} />
            <Route path="/appointments/:id"                   element={<AppointmentDetail />} />
            <Route path="/appointments/:id/reschedule"        element={<RescheduleAppointment />} />

            {/* Shared utilities */}
            <Route path="/calendar"       element={<CalendarView />} />
            <Route path="/chat"           element={<ChatPage />} />
            <Route path="/notifications"  element={<NotificationsPage />} />
            <Route path="/profile"        element={<ProfilePage />} />
            <Route path="/settings"       element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Admin-only routes */}
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route element={<AppLayout />}>
            <Route path="/admin/dashboard"   element={<AdminDashboard />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />
            <Route path="/admin/users"        element={<AdminUsers />} />
            <Route path="/admin/providers"    element={<AdminProviders />} />
            <Route path="/admin/services"     element={<AdminServices />} />
            <Route path="/admin/holidays"     element={<AdminHolidays />} />
            <Route path="/admin/reports"      element={<AdminReports />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
