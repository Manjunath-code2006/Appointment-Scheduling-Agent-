import { useEffect, useState, useCallback } from 'react';
import { PlusCircle, Pencil, Trash2, Clock } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PageLoader, LoadingSpinner } from '@/components/common/LoadingSpinner';
import { providerService } from '@/services/providerService';
import { userService } from '@/services/userService';
import { serviceTypeService } from '@/services/serviceTypeService';
import type { Provider, Service, User } from '@/types';
import { toast } from 'sonner';

const providerSchema = z.object({
  userId: z.coerce.number().min(1, 'Select a user'),
  specialization: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  bufferMinutes: z.coerce.number().min(0).max(60).default(0),
  maxAppointmentsPerDay: z.coerce.number().min(1).max(100).default(20),
  serviceIds: z.array(z.number()).optional(),
});
type ProviderFormData = z.infer<typeof providerSchema>;

const WH_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function AdminProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [users, setUsers]         = useState<User[]>([]);
  const [services, setServices]   = useState<Service[]>([]);
  const [loading, setLoading]     = useState(true);
  const [formOpen, setFormOpen]   = useState(false);
  const [whOpen, setWhOpen]       = useState(false);
  const [editing, setEditing]     = useState<Provider | null>(null);
  const [whProvider, setWhProvider] = useState<Provider | null>(null);
  const [deleting, setDeleting]   = useState<Provider | null>(null);
  const [saving, setSaving]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);

  // Working hours state: indexed by day
  const [whData, setWhData] = useState<Record<string, {
    startTime: string; endTime: string; lunchStart: string; lunchEnd: string; working: boolean;
  }>>(() =>
    Object.fromEntries(WH_DAYS.map((d) => [d, { startTime: '09:00', endTime: '17:00', lunchStart: '12:00', lunchEnd: '13:00', working: d !== 'SATURDAY' && d !== 'SUNDAY' }]))
  );

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: { bufferMinutes: 0, maxAppointmentsPerDay: 20 },
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, u, s] = await Promise.all([
        providerService.getAll(),
        userService.getAll(0, 200),
        serviceTypeService.getAll(true),
      ]);
      setProviders(p);
      setUsers(u.content);
      setServices(s);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setSelectedServiceIds([]);
    reset({ bufferMinutes: 0, maxAppointmentsPerDay: 20 });
    setFormOpen(true);
  };

  const openEdit = (p: Provider) => {
    setEditing(p);
    setSelectedServiceIds(p.services.map((s) => s.id));
    reset({
      userId: p.userId,
      specialization: p.specialization ?? '',
      bio: p.bio ?? '',
      location: p.location ?? '',
      bufferMinutes: p.bufferMinutes,
      maxAppointmentsPerDay: p.maxAppointmentsPerDay,
    });
    setFormOpen(true);
  };

  const onSubmit = async (data: ProviderFormData) => {
    setSaving(true);
    try {
      const payload = { ...data, serviceIds: selectedServiceIds };
      if (editing) {
        await providerService.update(editing.id, payload);
        toast.success('Provider updated');
      } else {
        await providerService.create(payload);
        toast.success('Provider created');
      }
      setFormOpen(false);
      load();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const saveWorkingHours = async () => {
    if (!whProvider) return;
    setSaving(true);
    try {
      const req = WH_DAYS.map((day) => ({
        dayOfWeek: day,
        startTime: whData[day].startTime,
        endTime: whData[day].endTime,
        lunchStart: whData[day].lunchStart || undefined,
        lunchEnd: whData[day].lunchEnd || undefined,
        working: whData[day].working,
      }));
      await providerService.updateWorkingHours(whProvider.id, req);
      toast.success('Working hours saved');
      setWhOpen(false);
    } catch { toast.error('Failed to save working hours'); }
    finally { setSaving(false); }
  };

  const deleteProvider = async () => {
    if (!deleting) return;
    setActionLoading(true);
    try {
      await providerService.delete(deleting.id);
      toast.success('Provider deactivated');
      setDeleting(null);
      load();
    } catch { toast.error('Delete failed'); }
    finally { setActionLoading(false); }
  };

  const toggleService = (id: number) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Providers</h1>
        <Button onClick={openCreate}><PlusCircle className="mr-2 h-4 w-4" />Add Provider</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{p.fullName}</p>
                  <p className="text-xs text-muted-foreground">{p.email}</p>
                  {p.specialization && (
                    <p className="text-xs text-muted-foreground mt-0.5">{p.specialization}</p>
                  )}
                </div>
                <Badge className={p.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                  {p.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {p.services.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {p.services.map((s) => (
                    <span key={s.id} className="text-[10px] rounded-full bg-primary/10 text-primary px-2 py-0.5">
                      {s.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                  <Pencil className="h-3 w-3 mr-1" />Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setWhProvider(p); setWhOpen(true); }}
                >
                  <Clock className="h-3 w-3 mr-1" />Hours
                </Button>
                {p.active && (
                  <Button size="sm" variant="destructive" onClick={() => setDeleting(p)}>
                    <Trash2 className="h-3 w-3 mr-1" />Remove
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {providers.length === 0 && (
          <p className="col-span-3 text-center text-muted-foreground py-8">No providers found.</p>
        )}
      </div>

      {/* Provider Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Provider' : 'New Provider'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {!editing && (
              <div className="space-y-2">
                <Label>User Account *</Label>
                <Controller
                  name="userId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={String(field.value || '')}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger aria-invalid={!!errors.userId}>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.fullName} — {u.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.userId && (
                  <p className="text-xs text-destructive">{errors.userId.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Specialization</Label>
              <Input {...register('specialization')} placeholder="e.g. General Medicine" />
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea {...register('bio')} placeholder="Short bio…" />
            </div>

            <div className="space-y-2">
              <Label>Location / Room</Label>
              <Input {...register('location')} placeholder="e.g. Room 101" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Buffer (min)</Label>
                <Input type="number" {...register('bufferMinutes')} />
              </div>
              <div className="space-y-2">
                <Label>Max per day</Label>
                <Input type="number" {...register('maxAppointmentsPerDay')} />
              </div>
            </div>

            {/* Services multi-select */}
            <div className="space-y-2">
              <Label>Services</Label>
              <div className="flex flex-wrap gap-2 border rounded-md p-3">
                {services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleService(s.id)}
                    className={`rounded-full text-xs px-3 py-1 border transition-colors ${
                      selectedServiceIds.includes(s.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-input hover:bg-accent'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
                {services.length === 0 && (
                  <p className="text-xs text-muted-foreground">No services available.</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <LoadingSpinner className="mr-2 h-4 w-4" />}
                {editing ? 'Save Changes' : 'Create Provider'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Working Hours Dialog */}
      <Dialog open={whOpen} onOpenChange={setWhOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Working Hours — {whProvider?.fullName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Header row */}
            <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr_60px] gap-2 text-xs font-medium text-muted-foreground px-1">
              <span>Day</span>
              <span>Start</span>
              <span>End</span>
              <span>Lunch Start</span>
              <span>Lunch End</span>
              <span>Working</span>
            </div>
            {WH_DAYS.map((day) => (
              <div key={day} className="grid grid-cols-[100px_1fr_1fr_1fr_1fr_60px] gap-2 items-center">
                <span className="text-sm font-medium">{day.slice(0, 3)}</span>
                <input
                  type="time"
                  value={whData[day].startTime}
                  disabled={!whData[day].working}
                  onChange={(e) => setWhData((d) => ({ ...d, [day]: { ...d[day], startTime: e.target.value } }))}
                  className="h-8 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-40"
                />
                <input
                  type="time"
                  value={whData[day].endTime}
                  disabled={!whData[day].working}
                  onChange={(e) => setWhData((d) => ({ ...d, [day]: { ...d[day], endTime: e.target.value } }))}
                  className="h-8 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-40"
                />
                <input
                  type="time"
                  value={whData[day].lunchStart}
                  disabled={!whData[day].working}
                  onChange={(e) => setWhData((d) => ({ ...d, [day]: { ...d[day], lunchStart: e.target.value } }))}
                  className="h-8 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-40"
                />
                <input
                  type="time"
                  value={whData[day].lunchEnd}
                  disabled={!whData[day].working}
                  onChange={(e) => setWhData((d) => ({ ...d, [day]: { ...d[day], lunchEnd: e.target.value } }))}
                  className="h-8 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-40"
                />
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={whData[day].working}
                    onChange={(e) => setWhData((d) => ({ ...d, [day]: { ...d[day], working: e.target.checked } }))}
                    className="h-4 w-4 rounded accent-primary"
                  />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setWhOpen(false)}>Cancel</Button>
            <Button onClick={saveWorkingHours} disabled={saving}>
              {saving && <LoadingSpinner className="mr-2 h-4 w-4" />}
              Save Hours
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Remove Provider"
        description={`Deactivate provider ${deleting?.fullName}?`}
        confirmLabel="Remove"
        variant="destructive"
        loading={actionLoading}
        onConfirm={deleteProvider}
      />
    </div>
  );
}
