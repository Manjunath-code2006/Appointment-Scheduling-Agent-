import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppointmentCard } from '@/components/common/AppointmentCard';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { useMyAppointments, useCancelAppointment } from '@/hooks/useAppointments';
import type { Appointment, AppointmentStatus } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AppointmentList() {
  const navigate = useNavigate();
  const { appointments, loading, refetch } = useMyAppointments();
  const { cancel, loading: cancelling } = useCancelAppointment();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [toCancel, setToCancel] = useState<Appointment | null>(null);

  const STATUS_OPTIONS: Array<{ label: string; value: string }> = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Pending',      value: 'PENDING' },
    { label: 'Confirmed',    value: 'CONFIRMED' },
    { label: 'Completed',    value: 'COMPLETED' },
    { label: 'Cancelled',    value: 'CANCELLED' },
  ];

  const filtered = appointments.filter((a) => {
    const matchSearch =
      !search ||
      a.appointmentNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.provider.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.service.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground mt-1">{appointments.length} total appointments</p>
        </div>
        <Button onClick={() => navigate('/appointments/book')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Book New
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by number, provider, service…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No appointments found.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              onView={(appt) => navigate(`/appointments/${appt.id}`)}
              onReschedule={(appt) => navigate(`/appointments/${appt.id}/reschedule`)}
              onCancel={(appt) => setToCancel(appt)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toCancel}
        onOpenChange={(v) => !v && setToCancel(null)}
        title="Cancel Appointment"
        description={`Cancel appointment ${toCancel?.appointmentNumber}? This action cannot be undone.`}
        confirmLabel="Yes, Cancel"
        variant="destructive"
        loading={cancelling}
        onConfirm={async () => {
          if (!toCancel) return;
          const ok = await cancel(toCancel.id, { reason: 'Cancelled by customer' });
          if (ok) { setToCancel(null); refetch(); }
        }}
      />
    </div>
  );
}
