import { useEffect, useState } from 'react';
import {
  CalendarDays, CheckCircle, XCircle, Clock, Users, TrendingUp,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/common/StatCard';
import { AppointmentCard } from '@/components/common/AppointmentCard';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { dashboardService } from '@/services/dashboardService';
import type { DashboardStats } from '@/types';
import { MONTH_NAMES } from '@/utils';

const PIE_COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!stats) return <p className="text-muted-foreground">Failed to load dashboard.</p>;

  const barData = stats.monthlyStats.map((m) => ({
    month: MONTH_NAMES[m.month - 1],
    count: m.count,
  }));

  const pieData = Object.entries(stats.appointmentsByStatus).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of all appointments and activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Appointments" value={stats.totalAppointments} icon={<CalendarDays className="h-5 w-5" />} color="text-blue-500" />
        <StatCard title="Today" value={stats.todayAppointments} icon={<Clock className="h-5 w-5" />} color="text-yellow-500" subtitle="appointments today" />
        <StatCard title="Completed" value={stats.completedAppointments} icon={<CheckCircle className="h-5 w-5" />} color="text-green-500" />
        <StatCard title="Cancelled" value={stats.cancelledAppointments} icon={<XCircle className="h-5 w-5" />} color="text-red-500" />
        <StatCard title="Upcoming (Confirmed)" value={stats.upcomingAppointments} icon={<TrendingUp className="h-5 w-5" />} color="text-purple-500" />
        <StatCard title="Pending" value={stats.pendingAppointments} icon={<Clock className="h-5 w-5" />} color="text-orange-500" />
        <StatCard title="Total Customers" value={stats.totalCustomers} icon={<Users className="h-5 w-5" />} color="text-indigo-500" />
        <StatCard title="Tomorrow" value={stats.tomorrowAppointments} icon={<CalendarDays className="h-5 w-5" />} color="text-teal-500" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Monthly Appointments</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>By Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent appointments */}
      {stats.recentAppointments.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent Appointments</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stats.recentAppointments.slice(0, 6).map((a) => (
                <AppointmentCard key={a.id} appointment={a} compact />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
