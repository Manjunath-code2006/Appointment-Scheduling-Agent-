import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PageLoader, LoadingSpinner } from '@/components/common/LoadingSpinner';
import { serviceTypeService } from '@/services/serviceTypeService';
import { formatCurrency, getDurationLabel } from '@/utils';
import type { Service, ServiceRequest } from '@/types';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(2, 'Required'),
  description: z.string().optional(),
  durationMinutes: z.coerce.number().min(5).max(480),
  price: z.coerce.number().min(0).optional(),
  color: z.string().optional(),
  mode: z.enum(['ONLINE', 'OFFLINE', 'VIDEO']),
});
type FormData = z.infer<typeof schema>;

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { mode: 'OFFLINE', durationMinutes: 30 },
  });

  const load = useCallback(async () => {
    setLoading(true);
    try { setServices(await serviceTypeService.getAll(false)); }
    catch { toast.error('Failed to load services'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); reset({ mode: 'OFFLINE', durationMinutes: 30 }); setOpen(true); };
  const openEdit = (s: Service) => {
    setEditing(s);
    reset({ name: s.name, description: s.description, durationMinutes: s.durationMinutes, price: s.price, color: s.color ?? '', mode: s.mode });
    setOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const req: ServiceRequest = { ...data, mode: data.mode };
      if (editing) { await serviceTypeService.update(editing.id, req); toast.success('Service updated'); }
      else { await serviceTypeService.create(req); toast.success('Service created'); }
      setOpen(false); load();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Save failed');
    } finally { setSaving(false); }
  };

  const deleteService = async () => {
    if (!deleting) return;
    setActionLoading(true);
    try { await serviceTypeService.delete(deleting.id); toast.success('Service deactivated'); setDeleting(null); load(); }
    catch { toast.error('Delete failed'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Services</h1>
        <Button onClick={openCreate}><PlusCircle className="mr-2 h-4 w-4" />Add Service</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Card key={s.id} className={!s.active ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {s.color && <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />}
                  <span className="font-semibold">{s.name}</span>
                </div>
                <Badge variant={s.active ? 'success' : 'secondary'} className={s.active ? 'bg-green-100 text-green-800' : ''}>
                  {s.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {s.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</p>}
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{getDurationLabel(s.durationMinutes)}</span>
                <span>·</span>
                <span>{formatCurrency(s.price)}</span>
                <span>·</span>
                <span>{s.mode}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(s)}><Pencil className="h-3 w-3 mr-1" />Edit</Button>
                {s.active && <Button size="sm" variant="destructive" onClick={() => setDeleting(s)}><Trash2 className="h-3 w-3 mr-1" />Remove</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Service' : 'New Service'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input {...register('name')} aria-invalid={!!errors.name} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...register('description')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Duration (min) *</Label>
                <Input type="number" {...register('durationMinutes')} />
                {errors.durationMinutes && <p className="text-xs text-destructive">{errors.durationMinutes.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Price (USD)</Label>
                <Input type="number" step="0.01" {...register('price')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Color (hex)</Label>
                <Input {...register('color')} placeholder="#3b82f6" />
              </div>
              <div className="space-y-2">
                <Label>Mode *</Label>
                <Controller name="mode" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OFFLINE">Offline</SelectItem>
                      <SelectItem value="ONLINE">Online</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <LoadingSpinner className="mr-2 h-4 w-4" />}
                {editing ? 'Save Changes' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)} title="Remove Service"
        description={`Deactivate "${deleting?.name}"?`} confirmLabel="Remove" variant="destructive"
        loading={actionLoading} onConfirm={deleteService} />
    </div>
  );
}
