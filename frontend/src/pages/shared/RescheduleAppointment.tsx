import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner, PageLoader } from '@/components/common/LoadingSpinner';
import { appointmentService } from '@/services/appointmentService';
import { useRescheduleAppointment } from '@/hooks/useAppointments';
import { formatTime } from '@/utils';
import type { Appointment, TimeSlot } from '@/types';

const schema = z.object({
  newDate: z.string().min(1, 'Select a date'),
  newStartTime: z.string().min(1, 'Select a time slot'),
  reason: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function RescheduleAppointment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const { reschedule, loading: saving } = useRescheduleAppointment();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { newDate: '', newStartTime: '', reason: '' },
  });
  const watchDate = watch('newDate');

  useEffect(() => {
    if (!id) return;
    appointmentService.getById(Number(id))
      .then(setAppointment)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!watchDate || !appointment) { setSlots([]); return; }
    setLoadingSlots(true);
    setValue('newStartTime', '');
    appointmentService
      .getAvailability(appointment.provider.id, watchDate, appointment.service.id)
      .then((av) => setSlots(av.availableSlots.filter((s) => s.available)))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [watchDate, appointment, setValue]);

  if (loading) return <PageLoader />;
  if (!appointment) return <p>Appointment not found.</p>;

  const today = format(new Date(), 'yyyy-MM-dd');

  const onSubmit = async (data: FormData) => {
    const appt = await reschedule(appointment.id, {
      newDate: data.newDate,
      newStartTime: data.newStartTime,
      reason: data.reason,
    });
    if (appt) navigate(`/appointments/${appt.id}`);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Reschedule Appointment</h1>
          <p className="text-sm text-muted-foreground">{appointment.appointmentNumber}</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>New Date &amp; Time</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="newDate">New Date *</Label>
              <Controller
                name="newDate"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="newDate"
                    type="date"
                    min={today}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                )}
              />
              {errors.newDate && <p className="text-xs text-destructive">{errors.newDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>New Time Slot *</Label>
              {loadingSlots ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LoadingSpinner className="h-4 w-4" /> Loading slots…
                </div>
              ) : watchDate ? (
                slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No slots available. Try another date.</p>
                ) : (
                  <Controller
                    name="newStartTime"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-4 gap-2">
                        {slots.map((s) => (
                          <button
                            key={s.startTime}
                            type="button"
                            onClick={() => field.onChange(s.startTime)}
                            className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                              field.value === s.startTime
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-input hover:bg-accent'
                            }`}
                          >
                            {formatTime(s.startTime)}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                )
              ) : (
                <p className="text-sm text-muted-foreground">Select a date first.</p>
              )}
              {errors.newStartTime && <p className="text-xs text-destructive">{errors.newStartTime.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <Textarea id="reason" placeholder="Reason for rescheduling…" {...field} />
                )}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving && <LoadingSpinner className="mr-2 h-4 w-4" />}
                Reschedule
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
