// ============================================================
// Auth
// ============================================================
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImageUrl?: string;
  roles: string[];
  emailVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

// ============================================================
// User
// ============================================================
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  profileImageUrl?: string;
  enabled: boolean;
  emailVerified: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  profileImageUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ============================================================
// Service
// ============================================================
export type AppointmentMode = 'ONLINE' | 'OFFLINE' | 'VIDEO';

export interface Service {
  id: number;
  name: string;
  description?: string;
  durationMinutes: number;
  price?: number;
  color?: string;
  active: boolean;
  mode: AppointmentMode;
  createdAt: string;
}

export interface ServiceRequest {
  name: string;
  description?: string;
  durationMinutes: number;
  price?: number;
  color?: string;
  mode: AppointmentMode;
}

// ============================================================
// Provider
// ============================================================
export interface Provider {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  specialization?: string;
  bio?: string;
  location?: string;
  bufferMinutes: number;
  maxAppointmentsPerDay: number;
  services: Service[];
  active: boolean;
}

export interface WorkingHoursRequest {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  lunchStart?: string;
  lunchEnd?: string;
  working: boolean;
}

// ============================================================
// Appointment
// ============================================================
export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'RESCHEDULED'
  | 'WAITING_LIST';

export type AppointmentType = 'REGULAR' | 'URGENT' | 'FOLLOW_UP' | 'RECURRING';
export type MeetingPlatform = 'GOOGLE_MEET' | 'ZOOM' | 'TEAMS';

export interface Appointment {
  id: number;
  appointmentNumber: string;
  customer: {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
  };
  provider: {
    id: number;
    fullName: string;
    specialization?: string;
    location?: string;
  };
  service: {
    id: number;
    name: string;
    durationMinutes: number;
    color?: string;
  };
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  type: AppointmentType;
  notes?: string;
  reason?: string;
  meetingLink?: string;
  meetingPlatform?: MeetingPlatform;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentRequest {
  providerId: number;
  serviceId: number;
  appointmentDate: string;
  startTime: string;
  notes?: string;
  reason?: string;
  type?: AppointmentType;
  meetingPlatform?: MeetingPlatform;
  customerId?: number;
}

export interface RescheduleRequest {
  newDate: string;
  newStartTime: string;
  reason?: string;
}

export interface CancelRequest {
  reason?: string;
}

// ============================================================
// Availability
// ============================================================
export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AvailabilityResponse {
  providerId: number;
  providerName: string;
  date: string;
  availableSlots: TimeSlot[];
  isHoliday: boolean;
  isWorkingDay: boolean;
}

// ============================================================
// Notification
// ============================================================
export type NotificationType =
  | 'APPOINTMENT_CONFIRMATION'
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'APPOINTMENT_COMPLETED'
  | 'SYSTEM';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  readAt?: string;
  appointmentId?: number;
  appointmentNumber?: string;
  createdAt: string;
}

// ============================================================
// Dashboard
// ============================================================
export interface MonthlyStats {
  month: number;
  monthName: string;
  count: number;
}

export interface DashboardStats {
  totalAppointments: number;
  todayAppointments: number;
  tomorrowAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  totalCustomers: number;
  totalProviders: number;
  monthlyStats: MonthlyStats[];
  appointmentsByService: Record<string, number>;
  appointmentsByStatus: Record<string, number>;
  recentAppointments: Appointment[];
}

// ============================================================
// Settings
// ============================================================
export interface AppSettings {
  id: number;
  businessName: string;
  businessLogoUrl?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  timezone: string;
  defaultAppointmentDuration: number;
  slotIntervalMinutes: number;
  officeStartTime: string;
  officeEndTime: string;
  maxAdvanceBookingDays: number;
  minCancellationHours: number;
  reminderHoursBefore: number;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  browserNotificationsEnabled: boolean;
}

// ============================================================
// Holiday
// ============================================================
export interface Holiday {
  id: number;
  name: string;
  date: string;
  description?: string;
  providerId?: number;
  providerName?: string;
  recurring: boolean;
  createdAt: string;
}

export interface HolidayRequest {
  name: string;
  date: string;
  description?: string;
  providerId?: number;
  recurring?: boolean;
}

// ============================================================
// Chat
// ============================================================
export type ChatIntent =
  | 'BOOK_APPOINTMENT'
  | 'CANCEL_APPOINTMENT'
  | 'RESCHEDULE_APPOINTMENT'
  | 'VIEW_APPOINTMENTS'
  | 'CHECK_AVAILABILITY'
  | 'GENERAL_INQUIRY'
  | 'CONFIRMATION'
  | 'UNKNOWN';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  appointmentDetails?: Appointment;
  suggestedSlots?: TimeSlot[];
  quickReplies?: string[];
  requiresConfirmation?: boolean;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  intent: ChatIntent;
  suggestedSlots?: TimeSlot[];
  appointmentDetails?: Appointment;
  requiresConfirmation?: boolean;
  quickReplies?: string[];
}

// ============================================================
// API Helpers
// ============================================================
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}
