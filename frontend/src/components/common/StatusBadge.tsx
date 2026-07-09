import { cn, getStatusColor } from '@/utils';
import type { AppointmentStatus } from '@/types';

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', getStatusColor(status))}>
      {status.replace('_', ' ')}
    </span>
  );
}
