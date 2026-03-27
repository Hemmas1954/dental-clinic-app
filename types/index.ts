export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type AppointmentStatus = 'معلق' | 'مؤكد' | 'مكتمل' | 'ملغي';
export type ServiceCategory = 'تشخيص' | 'علاج' | 'تجميل' | 'جراحة';

export interface Patient {
  id: string;
  file_number: number;
  full_name: string;
  date_of_birth: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  blood_type: BloodType | null;
  chronic_diseases: string | null;
  allergies: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  category: ServiceCategory;
  is_active: boolean;
  created_at?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  service_id: string;
  appointment_date: string;
  status: AppointmentStatus;
  doctor_notes: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  
  // joins
  patient?: Patient;
  service?: Service;
}

export interface Visit {
  id: string;
  patient_id: string;
  appointment_id: string | null;
  service_id: string | null;
  visit_date: string;
  diagnosis: string | null;
  treatment: string | null;
  prescribed_medication: string | null;
  amount_paid: number | null;
  next_appointment_date: string | null;
  images_urls: string[] | null;
  notes: string | null;
  created_at: string;

  // joins
  patient?: Patient;
  appointment?: Appointment;
  service?: Service;
}

export interface ClinicSettings {
  id: string;
  name: string;
  doctor_name: string;
  phone: string | null;
  address: string | null;
  email: string | null;
  working_hours: { start: string; end: string } | null;
  logo_url: string | null;
}

export interface AiConfig {
  id: string;
  webhook_new_patient: string | null;
  webhook_book_appointment: string | null;
  webhook_confirm_appointment: string | null;
  webhook_patient_query: string | null;
  api_key: string | null;
  last_test_status: Record<string, any>;
}
