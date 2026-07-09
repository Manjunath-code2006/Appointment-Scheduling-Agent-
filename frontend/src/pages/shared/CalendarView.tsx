import { useEffect, useState, useCallback } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday, isSameDay, addMonths, subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { appointmentService } from '@/services/appointmentService';
import { useAuth } from '@/context/AuthContext';
import { isAdmin, formatTime } from '@/utils';
import type { Appointment } from '@/types';

export default function CalendarView() {
  const { user } = useAuth();
  const [current, setCurrent] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selected, setSelected] = useState<Date | null>(null);

  const admin = user ? isAdmin(user.roles) : false;

  const fetchMonth = useCallback(async (date: Date) => {
    const start = format(startOfMonth(date), 'yyyy-MM-dd');
    const end = format(endOfMonth(date), 'yyyy-MM-dd');
    try {
      const data = admin
        ? await appointmentService.getByRange(start, end)
        : await appointmentService.getMy();
      setAppointments(data);
    } catch { /* silent */ }
  }, [admin]);

  useEffect(() => { fetchMonth(current); }, [current, fetchMonth]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(current)),
    end: endOfWeek(endOfMonth(current)),
  });

  const dayAppts = (day: Date) =>
    appointments.filter((a) => isSameDay(new Date(a.appointmentDate), day));

  const selectedAppts = selected ? dayAppts(selected) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Calendar</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(current, 'MMMM yyyy')}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrent(subMonths(current, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrent(new Date())}>Today</Button>
              <Button variant="outline" size="icon" onClick={() => setCurrent(addMonths(current, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 border-l border-t">
            {days.map((day) => {
              const appts = dayAppts(day);
              const inMonth = isSameMonth(day, current);
              const today = isToday(day);
              const sel = selected && isSameDay(day, selected);

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[80px] border-r border-b p-1 cursor-pointer transition-colors ${
                    !inMonth ? 'bg-muted/30' : 'hover:bg-accent'
                  } ${sel ? 'ring-2 ring-primary ring-inset' : ''}`}
                  onClick={() => setSelected(sel ? null : day)}
                >
                  <p className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                    today ? 'bg-primary text-primary-foreground' : ''
                  } ${!inMonth ? 'text-muted-foreground' : ''}`}>
                    {format(day, 'd')}
                  </p>
                  <div className="space-y-0.5">
                    {appts.slice(0, 2).map((a) => (
                      <div
                        key={a.id}
                        className="text-[10px] truncate rounded px-1 py-0.5 font-medium"
                        style={{ backgroundColor: a.service.color ?? '#3b82f6', color: '#fff' }}
                      >
                        {formatTime(a.startTime)} {a.service.name}
                      </div>
                    ))}
                    {appts.length > 2 && (
                      <p className="text-[10px] text-muted-foreground px-1">+{appts.length - 2} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Side panel for selected day */}
      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>{format(selected, 'EEEE, MMMM d, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAppts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No appointments on this day.</p>
            ) : (
              <div className="space-y-3">
                {selectedAppts.map((a) => (
                  <div key={a.id} className="flex items-start justify-between rounded-md border p-3">
                    <div>
                      <p className="text-sm font-medium">{a.service.name}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(a.startTime)} — {formatTime(a.endTime)}</p>
                      <p className="text-xs text-muted-foreground">{a.provider.fullName}</p>
                      <p className="text-xs text-muted-foreground">{a.customer.fullName}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
