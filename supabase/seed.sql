-- Insert Default Clinic Settings
INSERT INTO clinic_settings (name, doctor_name, phone, address, email) 
VALUES ('عيادة الابتسامة المشرقة', 'د. محمد أمين', '0555123456', 'الجزائر العاصمة', 'contact@brightsmile.dz');

-- Insert Initial AI Config (Empty, managed from UI)
INSERT INTO ai_config (webhook_new_patient, webhook_book_appointment, webhook_confirm_appointment, webhook_patient_query)
VALUES ('', '', '', '');

-- Insert Arabic Sample Patients
INSERT INTO patients (full_name, date_of_birth, phone, blood_type, address, chronic_diseases) VALUES
('أحمد بن بوزيد', '1985-03-15', '0661987654', 'O+', 'وهران', 'لا يوجد'),
('فاطمة الزهراء', '1992-07-22', '0550112233', 'A+', 'قسنطينة', 'ربو خفيف'),
('كريم منصوري', '1978-11-05', '0770445566', 'B-', 'عنابة', 'سكري نوع 2');

-- Fetch patient IDs for relationships
DO $$
DECLARE
    patient_1 UUID;
    patient_2 UUID;
    patient_3 UUID;
    service_clean UUID;
    service_fill UUID;
    service_extract UUID;
    service_ortho UUID;
    service_whiten UUID;
    service_implant UUID;
    appt_1 UUID;
    appt_2 UUID;
BEGIN
    SELECT id INTO patient_1 FROM patients WHERE full_name = 'أحمد بن بوزيد';
    SELECT id INTO patient_2 FROM patients WHERE full_name = 'فاطمة الزهراء';
    SELECT id INTO patient_3 FROM patients WHERE full_name = 'كريم منصوري';

    -- Insert Services
    INSERT INTO services (name, description, price, duration_minutes, category) VALUES
    ('تنظيف أسنان شامل', 'إزالة الجير والتلميع', 2000, 30, 'علاج') RETURNING id INTO service_clean;
    
    INSERT INTO services (name, description, price, duration_minutes, category) VALUES
    ('حشوة تجميلية', 'حشوة ضوئية بلون السن الأصلي', 4000, 45, 'علاج') RETURNING id INTO service_fill;
    
    INSERT INTO services (name, description, price, duration_minutes, category) VALUES
    ('خلع ضرس العقل', 'خلع جراحي لضرس العقل المنطمر', 3000, 60, 'جراحة') RETURNING id INTO service_extract;
    
    INSERT INTO services (name, description, price, duration_minutes, category) VALUES
    ('تقويم الأسنان الملون', 'تقويم معدني مع أربطة ملونة للشهر', 80000, 45, 'تجميل') RETURNING id INTO service_ortho;
    
    INSERT INTO services (name, description, price, duration_minutes, category) VALUES
    ('تبييض الأسنان بالليزر', 'جلسة تبييض سريعة', 15000, 60, 'تجميل') RETURNING id INTO service_whiten;
    
    INSERT INTO services (name, description, price, duration_minutes, category) VALUES
    ('زراعة أسنان سويسرية', 'زراعة تاج و وتد من التيتانيوم', 120000, 90, 'جراحة') RETURNING id INTO service_implant;

    -- Insert Appointments
    INSERT INTO appointments (patient_id, service_id, appointment_date, status) VALUES
    (patient_1, service_clean, NOW() + INTERVAL '1 day', 'مؤكد') RETURNING id INTO appt_1;
    
    INSERT INTO appointments (patient_id, service_id, appointment_date, status) VALUES
    (patient_2, service_fill, NOW() + INTERVAL '2 days', 'معلق') RETURNING id INTO appt_2;
    
    INSERT INTO appointments (patient_id, service_id, appointment_date, status) VALUES
    (patient_3, service_extract, NOW() - INTERVAL '5 days', 'مكتمل');
    
    INSERT INTO appointments (patient_id, service_id, appointment_date, status) VALUES
    (patient_1, service_implant, NOW() + INTERVAL '10 days', 'معلق');

    -- Insert Visits (Link to past appointments/services)
    INSERT INTO visits (patient_id, appointment_id, service_id, visit_date, diagnosis, treatment, prescribed_medication, amount_paid) VALUES
    (patient_3, NULL, service_extract, NOW() - INTERVAL '5 days', 'التهاب شديد في ضرس العقل', 'تم خلع الضرس تحت التخدير الموضعي', 'Paracetamol 1g, Amoxicillin 1g', 3000);
    
    INSERT INTO visits (patient_id, appointment_id, service_id, visit_date, diagnosis, treatment, amount_paid) VALUES
    (patient_1, NULL, service_clean, NOW() - INTERVAL '1 month', 'تراكم طبقة البلاك', 'تنظيف أسنان روتيني', 2000);
END $$;
