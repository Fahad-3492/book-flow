export interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number | string;
  duration_minutes: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

export interface Booking {
  id: number;
  user_id?: number;
  service_id?: number;
  booking_datetime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  notes: string | null;
  service_name: string;
  price: number | string;
  duration_minutes: number;
  customer_name?: string;
  customer_email?: string;
}

export interface AvailableSlotsResponse {
  date: string;
  serviceId: number;
  slots: string[]; // "HH:MM" strings
}

export interface PaymentIntentResponse {
  clientSecret: string;
}

export interface DashboardStats {
  totalRevenue: number;
  bookingsToday: number;
  statusCounts: {
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  };
}

export interface ApiError {
  error: string;
  details?: Array<{ msg: string; path: string }>;
}
