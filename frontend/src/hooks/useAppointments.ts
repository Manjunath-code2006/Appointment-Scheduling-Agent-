import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { appointmentService } from '@/services/appointmentService';
import type { Appointment, AppointmentRequest, RescheduleRequest, CancelRequest } from '@/types';

export function useMyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      setAppointments(await appointmentService.getMy());
      setError(null);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to load appointments';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { appointments, loading, error, refetch: fetch };
}

export function useUpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setAppointments(await appointmentService.getUpcoming()); }
    catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { appointments, loading, refetch: fetch };
}

export function useBookAppointment() {
  const [loading, setLoading] = useState(false);

  const book = async (req: AppointmentRequest): Promise<Appointment | null> => {
    setLoading(true);
    try {
      const appt = await appointmentService.book(req);
      toast.success('Appointment booked successfully!');
      return appt;
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Booking failed';
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { book, loading };
}

export function useCancelAppointment() {
  const [loading, setLoading] = useState(false);

  const cancel = async (id: number, req: CancelRequest): Promise<boolean> => {
    setLoading(true);
    try {
      await appointmentService.cancel(id, req);
      toast.success('Appointment cancelled.');
      return true;
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Cancellation failed';
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { cancel, loading };
}

export function useRescheduleAppointment() {
  const [loading, setLoading] = useState(false);

  const reschedule = async (
    id: number,
    req: RescheduleRequest,
  ): Promise<Appointment | null> => {
    setLoading(true);
    try {
      const appt = await appointmentService.reschedule(id, req);
      toast.success('Appointment rescheduled!');
      return appt;
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Reschedule failed';
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { reschedule, loading };
}
