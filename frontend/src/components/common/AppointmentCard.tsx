import { Calendar, Clock, User, MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { formatDate, formatTime, getDurationLabel } from '@/utils';
import type { Appointment } from '@/types';

interface Props {
  appointment: Appointment;
  onCancel?: (a: Appointment) => void;
  onReschedule?: (a: Appointment) => void;
  onView?: (a: Appointment) => void;
  compact?: boolean;
}

export function AppointmentCard({ appointment: a, onCancel, onReschedule, onView, compact }: Props) {
  const canModify = a.status === 'CONFIRMED' || a.status === 'PENDING';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm">{a.appointmentNumber}</p>
            <p className="text-sm text-muted-foreground">{a.service.name}</p>
          </div>
          <StatusBadge status={a.status} />
        </div>

        {/* Details */}
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{formatDate(a.appointmentDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{formatTime(a.startTime)} — {formatTime(a.endTime)} ({getDurationLabel(a.service.durationMinutes)})</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 shrink-0" />
            <span>{a.provider.fullName}</span>
          </div>
          {a.provider.location && !compact && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{a.provider.location}</span>
            </div>
          )}
          {a.meetingLink && !compact && (
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 shrink-0" />
              <a href={a.meetingLink} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                Join Meeting
              </a>
            </div>
          )}
        </div>

        {/* Actions */}
        {!compact && canModify && (onReschedule || onCancel) && (
          <div className="flex gap-2 pt-1">
            {onView && (
              <Button size="sm" variant="outline" className="flex-1" onClick={() => onView(a)}>
                View
              </Button>
            )}
            {onReschedule && (
              <Button size="sm" variant="outline" className="flex-1" onClick={() => onReschedule(a)}>
                Reschedule
              </Button>
            )}
            {onCancel && (
              <Button size="sm" variant="destructive" className="flex-1" onClick={() => onCancel(a)}>
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
