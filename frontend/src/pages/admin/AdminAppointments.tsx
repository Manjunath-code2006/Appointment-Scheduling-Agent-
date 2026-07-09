import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { appointmentService } from '@/services/appointmentService';
import { formatDate, formatTime } from '@/utils';
import type { Appointment, AppointmentStatus } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const STATUSES: Array<{ label: string; value: string }> = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Pending',      value: 'PENDING' },
  { label: 'Confirmed',    value: 'CONFIRMED' },
  { label: 'Completed',    value: 'COMPLETED' },
  { label: 'Cancelled',    value: 'CANCELLED' },
  { label: 'No Show',      value: 'NO_SHOW' },
];

export default function AdminAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const load = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const res = await appointmentService.getAll(p, 20);
      setAppointments(res.content);
      setTotal(res.totalElements);
      setPage(p);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(0); }, [load]);

  const filtered = appointments.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      a.appointmentNumber.toLowerCase().includes(q) ||
      a.customer.fullName.toLowerCase().includes(q) ||
      a.customer.email.toLowerCase().includes(q) ||
      a.provider.fullName.toLowerCase().includes(q) ||
      a.service.name.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id: number, status: AppointmentStatus) => {
    try {
      const updated = await appointmentService.updateStatus(id, status);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Appointments</h1>
          <p className="text-muted-foreground mt-1">{total} total</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search reference, customer, provider…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {['Reference', 'Date', 'Time', 'Customer', 'Provider', 'Service', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-primary cursor-pointer hover:underline" onClick={() => navigate(`/appointments/${a.id}`)}>
                      {a.appointmentNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(a.appointmentDate)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatTime(a.startTime)}</td>
                    <td className="px-4 py-3">{a.customer.fullName}</td>
                    <td className="px-4 py-3">{a.provider.fullName}</td>
                    <td className="px-4 py-3">{a.service.name}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3">
                      {a.status === 'CONFIRMED' && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="text-[11px] h-7 px-2" onClick={() => updateStatus(a.id, 'COMPLETED')}>Complete</Button>
                          <Button size="sm" variant="destructive" className="text-[11px] h-7 px-2" onClick={() => updateStatus(a.id, 'CANCELLED')}>Cancel</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">No appointments found.</p>}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => load(page - 1)}>Previous</Button>
        <span className="flex items-center text-sm text-muted-foreground px-2">Page {page + 1}</span>
        <Button variant="outline" size="sm" disabled={(page + 1) * 20 >= total} onClick={() => load(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
