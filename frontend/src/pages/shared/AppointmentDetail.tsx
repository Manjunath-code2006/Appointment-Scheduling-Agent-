import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, User, MapPin, FileText, ExternalLink, ArrowLeft,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { appointmentService } from '@/services/appointmentService';
import { formatDate, formatTime, getDurationLabel } from '@/utils';
import { useCancelAppointment } from '@/hooks/useAppointments';
import type { Appointment } from '@/types';

export default function AppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const { cancel, loading: cancelling } = useCancelAppointment();

  useEffect(() => {
    if (!id) return;
    appointmentService.getById(Number(id))
      .then(setAppointment)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!appointment) return <p className="text-muted-foreground">Appointment not found.</p>;

  const canModify = appointment.status === 'CONFIRMED' || appointment.status === 'PENDING';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Appointment Details</h1>
          <p className="text-sm text-muted-foreground">{appointment.appointmentNumber}</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={appointment.status} />
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoRow icon={<Calendar />} label="Date" value={formatDate(appointment.appointmentDate)} />
            <InfoRow icon={<Clock />} label="Time" value={`${formatTime(appointment.startTime)} — ${formatTime(appointment.endTime)}`} />
            <InfoRow icon={<User />} label="Provider" value={appointment.provider.fullName} />
            <InfoRow icon={<FileText />} label="Service" value={`${appointment.service.name} (${getDurationLabel(appointment.service.durationMinutes)})`} />
            {appointment.provider.location && (
              <InfoRow icon={<MapPin />} label="Location" value={appointment.provider.location} />
            )}
          </div>

          {appointment.meetingLink && (
            <>
              <Separator />
              <a
                href={appointment.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-primary hover:underline text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Join {appointment.meetingPlatform?.replace('_', ' ') ?? 'Meeting'}
              </a>
            </>
          )}

          {appointment.notes && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Notes</p>
                <p className="text-sm">{appointment.notes}</p>
              </div>
            </>
          )}

          {appointment.cancellationReason && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Cancellation Reason</p>
                <p className="text-sm text-destructive">{appointment.cancellationReason}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {canModify && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/appointments/${appointment.id}/reschedule`)}
          >
            Reschedule
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => setConfirmCancel(true)}
          >
            Cancel Appointment
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel Appointment"
        description="This cannot be undone. Cancel this appointment?"
        confirmLabel="Yes, Cancel"
        variant="destructive"
        loading={cancelling}
        onConfirm={async () => {
          const ok = await cancel(appointment.id, { reason: 'Cancelled by user' });
          if (ok) navigate('/appointments');
        }}
      />
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground shrink-0 h-4 w-4">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}
