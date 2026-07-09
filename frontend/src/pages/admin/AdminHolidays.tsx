import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PageLoader, LoadingSpinner } from '@/components/common/LoadingSpinner';
import { holidayService } from '@/services/holidayService';
import { formatDate } from '@/utils';
import type { Holiday } from '@/types';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(2, 'Required'),
  date: z.string().min(1, 'Required'),
  description: z.string().optional(),
  recurring: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export default function AdminHolidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<Holiday | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const load = useCallback(async () => {
    setLoading(true);
    try { setHolidays(await holidayService.getAll()); }
    catch { toast.error('Failed to load holidays'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await holidayService.create(data);
      toast.success('Holiday added');
      setOpen(false); reset(); load();
    } catch { toast.error('Failed to add holiday'); }
    finally { setSaving(false); }
  };

  const deleteHoliday = async () => {
    if (!deleting) return;
    setActionLoading(true);
    try { await holidayService.delete(deleting.id); toast.success('Holiday deleted'); setDeleting(null); load(); }
    catch { toast.error('Delete failed'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <PageLoader />;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Holidays</h1>
        <Button onClick={() => { reset(); setOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" />Add Holiday</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {holidays.map((h) => (
          <Card key={h.id}>
            <CardContent className="p-4 flex items-start justify-between">
              <div>
                <p className="font-semibold">{h.name}</p>
                <p className="text-sm text-muted-foreground">{formatDate(h.date)}</p>
                {h.description && <p className="text-xs text-muted-foreground mt-1">{h.description}</p>}
                {h.recurring && <Badge variant="outline" className="mt-1 text-[10px]">Recurring</Badge>}
                {h.providerName && <p className="text-xs text-muted-foreground mt-1">Provider: {h.providerName}</p>}
              </div>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive shrink-0" onClick={() => setDeleting(h)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {holidays.length === 0 && (
          <p className="text-muted-foreground text-sm col-span-3">No holidays configured.</p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Holiday</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input {...register('name')} aria-invalid={!!errors.name} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <input type="date" min={today} {...register('date')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...register('description')} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="recurring" {...register('recurring')} className="rounded" />
              <Label htmlFor="recurring" className="cursor-pointer">Recurring annually</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <LoadingSpinner className="mr-2 h-4 w-4" />}
                Add Holiday
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)} title="Delete Holiday"
        description={`Delete "${deleting?.name}"?`} confirmLabel="Delete" variant="destructive"
        loading={actionLoading} onConfirm={deleteHoliday} />
    </div>
  );
}
