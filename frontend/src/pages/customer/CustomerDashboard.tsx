import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, CheckCircle, XCircle, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/common/StatCard';
import { AppointmentCard } from '@/components/common/AppointmentCard';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { appointmentService } from '@/services/appointmentService';
import { useAuth } from '@/context/AuthContext';
import type { Appointment } from '@/types';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [all, setAll] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([appointmentService.getUpcoming(), appointmentService.getMy()])
      .then(([u, a]) => { setUpcoming(u); setAll(a); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const completed = all.filter((a) => a.status === 'COMPLETED').length;
  const cancelled = all.filter((a) => a.status === 'CANCELLED').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hello, {user?.firstName}!</h1>
          <p className="text-muted-foreground mt-1">Manage your appointments from here</p>
        </div>
        <Button onClick={() => navigate('/appointments/book')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Book Appointment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Upcoming"  value={upcoming.length}  icon={<CalendarDays className="h-5 w-5" />} color="text-blue-500" />
        <StatCard title="Total"     value={all.length}       icon={<Clock className="h-5 w-5" />}        color="text-indigo-500" />
        <StatCard title="Completed" value={completed}        icon={<CheckCircle className="h-5 w-5" />} color="text-green-500" />
        <StatCard title="Cancelled" value={cancelled}        icon={<XCircle className="h-5 w-5" />}     color="text-red-500" />
      </div>

      {/* Upcoming appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Appointments</CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate('/appointments')}>
            View all
          </Button>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p>No upcoming appointments.</p>
              <Button className="mt-3" onClick={() => navigate('/appointments/book')}>
                Book one now
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.slice(0, 6).map((a) => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  onReschedule={(appt) => navigate(`/appointments/${appt.id}/reschedule`)}
                  onCancel={(appt) => navigate(`/appointments/${appt.id}/cancel`)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
