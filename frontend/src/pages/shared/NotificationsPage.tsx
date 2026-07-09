import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDate } from '@/utils';
import { cn } from '@/utils';

const TYPE_COLOR: Record<string, string> = {
  APPOINTMENT_CONFIRMATION: 'bg-blue-100 text-blue-700',
  APPOINTMENT_REMINDER:     'bg-yellow-100 text-yellow-700',
  APPOINTMENT_CANCELLED:    'bg-red-100 text-red-700',
  APPOINTMENT_RESCHEDULED:  'bg-purple-100 text-purple-700',
  APPOINTMENT_COMPLETED:    'bg-green-100 text-green-700',
  SYSTEM:                   'bg-gray-100 text-gray-700',
};

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-7 w-7" /> Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BellOff className="mx-auto h-10 w-10 mb-3 opacity-40" />
            <p>No notifications yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={cn('cursor-pointer hover:shadow-md transition-shadow', !n.read && 'border-primary/30 bg-primary/5')}
              onClick={() => !n.read && markAsRead(n.id)}
            >
              <CardContent className="p-4 flex gap-3">
                <div className="shrink-0 mt-1">
                  <span className={cn('inline-flex rounded-full w-2 h-2 mt-1', n.read ? 'bg-transparent' : 'bg-primary')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <Badge className={cn('text-[10px] shrink-0', TYPE_COLOR[n.type] ?? 'bg-gray-100 text-gray-700')} variant="outline">
                      {n.type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(n.createdAt, 'MMM d, yyyy HH:mm')}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
