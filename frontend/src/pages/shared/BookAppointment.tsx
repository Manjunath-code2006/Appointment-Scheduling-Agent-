import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { serviceTypeService } from '@/services/serviceTypeService';
import { providerService } from '@/services/providerService';
import { appointmentService } from '@/services/appointmentService';
import { formatTime, getDurationLabel, formatCurrency } from '@/utils';
import type { Service, Provider, TimeSlot } from '@/types';
import { toast } from 'sonner';

const schema = z.object({
  serviceId: z.string().min(1, 'Select a service'),
  providerId: z.string().min(1, 'Select a provider'),
  date: z.string().min(1, 'Select a date'),
  startTime: z.string().min(1, 'Select a time slot'),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function BookAppointment() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { serviceId: '', providerId: '', date: '', startTime: '', notes: '' },
  });

  const watchService = watch('serviceId');
  const watchProvider = watch('providerId');
  const watchDate = watch('date');

  useEffect(() => {
    serviceTypeService.getAll(true).then(setServices).catch(() => {});
    providerService.getAll().then(setProviders).catch(() => {});
  }, []);

  // Load slots when provider + date + service are selected
  useEffect(() => {
    if (!watchProvider || !watchDate || !watchService) { setSlots([]); return; }
    setLoadingSlots(true);
    setValue('startTime', '');
    appointmentService
      .getAvailability(Number(watchProvider), watchDate, Number(watchService))
      .then((av) => setSlots(av.availableSlots.filter((s) => s.available)))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [watchProvider, watchDate, watchService, setValue]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const appt = await appointmentService.book({
        serviceId: Number(data.serviceId),
        providerId: Number(data.providerId),
        appointmentDate: data.date,
        startTime: data.startTime,
        notes: data.notes,
      });
      toast.success('Appointment booked!');
      navigate(`/appointments/${appt.id}`);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Booking failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Min date = today
  const today = format(new Date(), 'yyyy-MM-dd');
  const maxDate = format(new Date(Date.now() + 60 * 86400000), 'yyyy-MM-dd');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Book Appointment</h1>
        <p className="text-muted-foreground mt-1">Fill in the details to schedule your appointment</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" />Appointment Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            {/* Service */}
            <div className="space-y-2">
              <Label>Service *</Label>
              <Controller
                name="serviceId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(v) => { field.onChange(v); setValue('providerId', ''); setValue('date', ''); setValue('startTime', ''); }} value={field.value}>
                    <SelectTrigger aria-invalid={!!errors.serviceId}><SelectValue placeholder="Select a service" /></SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name} — {getDurationLabel(s.durationMinutes)} {s.price ? `(${formatCurrency(s.price)})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.serviceId && <p className="text-xs text-destructive">{errors.serviceId.message}</p>}
            </div>

            {/* Provider */}
            <div className="space-y-2">
              <Label>Provider *</Label>
              <Controller
                name="providerId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(v) => { field.onChange(v); setValue('date', ''); setValue('startTime', ''); }} value={field.value} disabled={!watchService}>
                    <SelectTrigger aria-invalid={!!errors.providerId}><SelectValue placeholder="Select a provider" /></SelectTrigger>
                    <SelectContent>
                      {providers
                        .filter((p) => !watchService || p.services.some((s) => String(s.id) === watchService))
                        .map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.fullName}{p.specialization ? ` — ${p.specialization}` : ''}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.providerId && <p className="text-xs text-destructive">{errors.providerId.message}</p>}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="date"
                    type="date"
                    min={today}
                    max={maxDate}
                    disabled={!watchProvider}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                )}
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>

            {/* Time Slots */}
            <div className="space-y-2">
              <Label>Time Slot *</Label>
              {loadingSlots ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <LoadingSpinner className="h-4 w-4" /> Loading available slots…
                </div>
              ) : watchDate && watchProvider ? (
                slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No slots available on this date. Try another date.</p>
                ) : (
                  <Controller
                    name="startTime"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot.startTime}
                            type="button"
                            onClick={() => field.onChange(slot.startTime)}
                            className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                              field.value === slot.startTime
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-input hover:bg-accent'
                            }`}
                          >
                            {formatTime(slot.startTime)}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                )
              ) : (
                <p className="text-sm text-muted-foreground py-2">Select provider and date to see available slots.</p>
              )}
              {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <Textarea id="notes" placeholder="Add any notes or reason for the appointment…" {...field} />
                )}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting && <LoadingSpinner className="mr-2 h-4 w-4" />}
                Book Appointment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
