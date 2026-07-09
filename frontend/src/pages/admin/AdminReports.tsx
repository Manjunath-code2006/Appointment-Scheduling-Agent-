import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { dashboardService } from '@/services/dashboardService';
import { appointmentService } from '@/services/appointmentService';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate, formatTime, MONTH_NAMES } from '@/utils';
import type { DashboardStats, Appointment } from '@/types';

const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4'];

export default function AdminReports() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState(format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'));
  const [end, setEnd]   = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    Promise.all([
      dashboardService.getStats(),
      appointmentService.getByRange(start, end),
    ]).then(([s, a]) => { setStats(s); setAppointments(a); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [start, end]);

  if (loading) return <PageLoader />;

  const barData = stats?.monthlyStats.map((m) => ({ month: MONTH_NAMES[m.month - 1], count: m.count })) ?? [];
  const pieData = Object.entries(stats?.appointmentsByService ?? {}).map(([name, value]) => ({ name, value }));

  const downloadCSV = () => {
    const header = 'Number,Date,Time,Customer,Provider,Service,Status\n';
    const rows = appointments.map((a) =>
      `${a.appointmentNumber},${a.appointmentDate},${a.startTime},${a.customer.fullName},${a.provider.fullName},${a.service.name},${a.status}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `appointments-${start}-${end}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          <span className="text-muted-foreground text-sm">to</span>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          <Button variant="outline" size="sm" onClick={downloadCSV}>Export CSV</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Monthly Volume</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>By Service</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name }) => name}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>Appointments ({appointments.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {['Reference', 'Date', 'Time', 'Customer', 'Provider', 'Service', 'Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-mono text-xs">{a.appointmentNumber}</td>
                    <td className="px-4 py-2.5">{formatDate(a.appointmentDate)}</td>
                    <td className="px-4 py-2.5">{formatTime(a.startTime)}</td>
                    <td className="px-4 py-2.5">{a.customer.fullName}</td>
                    <td className="px-4 py-2.5">{a.provider.fullName}</td>
                    <td className="px-4 py-2.5">{a.service.name}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">No appointments in this range.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
