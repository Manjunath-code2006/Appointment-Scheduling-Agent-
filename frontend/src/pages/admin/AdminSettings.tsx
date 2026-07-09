import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageLoader, LoadingSpinner } from '@/components/common/LoadingSpinner';
import { settingsService } from '@/services/settingsService';
import type { AppSettings } from '@/types';
import { toast } from 'sonner';

const schema = z.object({
  businessName: z.string().min(2, 'Required'),
  businessEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  businessPhone: z.string().optional(),
  businessAddress: z.string().optional(),
  timezone: z.string().min(1),
  defaultAppointmentDuration: z.coerce.number().min(5).max(480),
  slotIntervalMinutes: z.coerce.number().min(5).max(120),
  maxAdvanceBookingDays: z.coerce.number().min(1).max(365),
  minCancellationHours: z.coerce.number().min(0).max(168),
  reminderHoursBefore: z.coerce.number().min(1).max(72),
  officeStartTime: z.string(),
  officeEndTime: z.string(),
  emailNotificationsEnabled: z.boolean(),
  smsNotificationsEnabled: z.boolean(),
  browserNotificationsEnabled: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    settingsService.get().then((s) => {
      reset({
        ...s,
        businessEmail: s.businessEmail ?? '',
        businessPhone: s.businessPhone ?? '',
        businessAddress: s.businessAddress ?? '',
      });
    }).catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await settingsService.update(data);
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  if (loading) return <PageLoader />;

  const field = (name: keyof FormData, label: string, type = 'text') => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} {...register(name as never)} aria-invalid={!!errors[name]} />
      {errors[name] && <p className="text-xs text-destructive">{(errors[name] as { message?: string })?.message}</p>}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Settings className="h-7 w-7" /> Application Settings
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card>
          <CardHeader><CardTitle>Business Information</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {field('businessName', 'Business Name')}
            {field('businessEmail', 'Business Email', 'email')}
            {field('businessPhone', 'Business Phone', 'tel')}
            {field('timezone', 'Timezone')}
            <div className="space-y-2 sm:col-span-2">
              <Label>Business Address</Label>
              <Input {...register('businessAddress')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Scheduling Rules</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {field('defaultAppointmentDuration', 'Default Duration (min)', 'number')}
            {field('slotIntervalMinutes', 'Slot Interval (min)', 'number')}
            {field('maxAdvanceBookingDays', 'Max Advance Booking (days)', 'number')}
            {field('minCancellationHours', 'Min Cancellation Notice (hours)', 'number')}
            {field('reminderHoursBefore', 'Reminder Hours Before', 'number')}
            <div className="space-y-2">
              <Label>Office Start Time</Label>
              <Input type="time" {...register('officeStartTime')} />
            </div>
            <div className="space-y-2">
              <Label>Office End Time</Label>
              <Input type="time" {...register('officeEndTime')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(['emailNotificationsEnabled', 'smsNotificationsEnabled', 'browserNotificationsEnabled'] as const).map((k) => (
              <div key={k} className="flex items-center gap-3">
                <input type="checkbox" id={k} {...register(k)} className="h-4 w-4 rounded" />
                <Label htmlFor={k} className="cursor-pointer capitalize">
                  {k.replace(/([A-Z])/g, ' $1').replace('Enabled', '').trim()}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving && <LoadingSpinner className="mr-2 h-4 w-4" />}
          Save Settings
        </Button>
      </form>
    </div>
  );
}
