-- ========================================================
-- TrafficGuard AI - MySQL Database Seed Script
-- Seeding initial database records for Andhra Pradesh locations
-- ========================================================

USE trafficguard_db;

-- Delete existing records in reverse dependency order
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE reports;
TRUNCATE TABLE violations;
TRUNCATE TABLE vehicle_owners;
TRUNCATE TABLE hotspots;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Seeding Users
INSERT INTO users (id, username, password, name, badge_number, role, district, created_at) VALUES
('u1', 'admin', 'admin123', 'Superintendent admin', 'TG-0001', 'admin', 'Vijayawada', NOW()),
('u2', 'officer1', 'officer123', 'Ramesh Kumar', 'TG-4402', 'officer', 'Visakhapatnam', NOW()),
('u3', 'officer2', 'officer123', 'Suresh Babu', 'TG-4518', 'officer', 'Guntur', NOW()),
('u4', 'officer3', 'officer123', 'K. Lakshmi', 'TG-4690', 'officer', 'Tirupati', NOW());

-- 2. Seeding Vehicle Owners
INSERT INTO vehicle_owners (vehicle_number, owner_name, phone, email, address, license_number, vehicle_model, previous_violations, created_at) VALUES
('AP16BZ1234', 'G. Venkateswarlu', '+91 9440123456', 'venkateswarlu.g@gmail.com', 'D.No: 12-4-5, Siddhartha Nagar, Vijayawada, Andhra Pradesh, 520010', 'AP1620150043210', 'Hyundai i20 (White)', 3, NOW()),
('AP39TX5678', 'M. Jagadeesh Kumar', '+91 8123456789', 'jagadeesh.m@yahoo.com', 'Flat 302, Sai Balaji Residency, MVP Colony, Visakhapatnam, Andhra Pradesh, 530017', 'AP3920180087654', 'Honda Activa 6G (Matte Blue)', 1, NOW()),
('AP07AX2468', 'K. Srinivasa Rao', '+91 9848011223', 'srinivas.k@rediffmail.com', 'D.No: 45-1-12, Arundalatpet, Guntur, Andhra Pradesh, 522002', 'AP0720120034567', 'Maruti Suzuki Swift (Silver)', 2, NOW()),
('AP26BY4321', 'Ch. Ramakrishna', '+91 7382910123', 'ramakrishna.ch@gmail.com', 'Srinivasa Nilayam, Alipiri Bypass Road, Tirupati, Andhra Pradesh, 517501', 'AP2620200054321', 'Royal Enfield Classic 350 (Black)', 0, NOW()),
('AP31CZ9876', 'P. Lakshmi Narayana', '+91 9177112233', 'narayana.p@outlook.com', 'Plot No 44, Sector 5, Ukkunagaram, Visakhapatnam, Andhra Pradesh, 530032', 'AP3120190098765', 'Tata Nexon (Red)', 1, NOW()),
('AP02JK1357', 'S. Abdul Rahman', '+91 9550124567', 'abdul.rahman@gmail.com', 'D.No: 5-34, Housing Board Colony, Anantapur, Andhra Pradesh, 515001', 'AP0220140024680', 'Kia Seltos (Grey)', 0, NOW());

-- 3. Seeding Hotspots
INSERT INTO hotspots (id, location_name, district, risk_level, accident_count, violation_count, description, latitude, longitude, created_at) VALUES
('h1', 'Benz Circle Crossing', 'Vijayawada', 'High Risk', 34, 840, 'High traffic density intersections connecting NH-16 and NH-65. Major issues: Red light jumping and lane violations during peak hours.', 16.50150000, 80.64360000, NOW()),
('h2', 'Kanaka Durga Varadhi Highway', 'Vijayawada', 'High Risk', 28, 612, 'Long bridge sector where motorists speed excessively. High accident rate at night due to limited heavy-vehicle speed control.', 16.49520000, 80.61890000, NOW()),
('h3', 'RTC Complex Flyover Exit', 'Visakhapatnam', 'Medium Risk', 18, 490, 'Merge bottleneck at the exit of the RTC complex flyover. Frequent minor collisions caused by hasty merges and triple riding.', 17.72440000, 83.30390000, NOW()),
('h4', 'Gajuwaka Industrial Junction', 'Visakhapatnam', 'High Risk', 31, 780, 'Intersects heavy industrial transport trucks with local two-wheelers. High incidence of helmetless driving and illegal overtaking.', 17.68970000, 83.21320000, NOW()),
('h5', 'Lodge Centre Crossing', 'Guntur', 'High Risk', 24, 550, 'Busy commercial core intersection. Major concern: Pedestrian safety endangered by speed limit violations and red light jumping.', 16.30670000, 80.43620000, NOW()),
('h6', 'Alipiri Bypass Junction', 'Tirupati', 'Low Risk', 6, 210, 'Scenic entrance bypass to Tirumala hills. Under continuous surveillance. High helmet check enforcement helps keep accidents low.', 13.65210000, 79.40340000, NOW()),
('h7', 'Kurnool Highway Toll Plaza Apex', 'Kurnool', 'Medium Risk', 14, 320, 'Approaching lanes near the toll plaza witness high speed transitions. Drivers lane drift under clear weather conditions.', 15.82810000, 78.03730000, NOW());

-- 4. Seeding Violations
INSERT INTO violations (id, vehicle_number, owner_name, violation_type, fine_amount, location, district, date_time, status, evidence_image, officer_id, officer_name, description, repeat_offender, created_at) VALUES
('v1', 'AP16BZ1234', 'G. Venkateswarlu', 'Over Speeding', 1500.00, 'Benz Circle, Vijayawada', 'Vijayawada', '2026-07-01 10:30:00', 'Pending', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop', 'u2', 'Ramesh Kumar', 'Vehicle detected travelling at 95 km/h in a 60 km/h zone. Verified by speed gun.', TRUE, NOW()),
('v2', 'AP39TX5678', 'M. Jagadeesh Kumar', 'No Helmet', 500.00, 'RTC Complex Junction, Visakhapatnam', 'Visakhapatnam', '2026-07-03 15:45:00', 'Paid', 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?q=80&w=600&auto=format&fit=crop', 'u2', 'Ramesh Kumar', 'Rider and pillion rider both traveling without protective headgear.', FALSE, NOW()),
('v3', 'AP07AX2468', 'K. Srinivasa Rao', 'Red Light Jump', 1000.00, 'Lodge Centre, Guntur', 'Guntur', '2026-07-04 08:15:00', 'Pending', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=600&auto=format&fit=crop', 'u3', 'Suresh Babu', 'Crossed signal 4 seconds after red light was active.', TRUE, NOW()),
('v4', 'AP26BY4321', 'Ch. Ramakrishna', 'Triple Riding', 1200.00, 'Alipiri Circle, Tirupati', 'Tirupati', '2026-07-05 18:20:00', 'Paid', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=600&auto=format&fit=crop', 'u4', 'K. Lakshmi', 'Two-wheeler riding with 3 adults, overloading safety limits.', FALSE, NOW()),
('v5', 'AP16BZ1234', 'G. Venkateswarlu', 'Drunk Driving', 10000.00, 'Kanaka Durga Varadhi, Vijayawada', 'Vijayawada', '2026-07-06 23:10:00', 'Pending', 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=600&auto=format&fit=crop', 'u2', 'Ramesh Kumar', 'Breathalyzer reading: 0.08% BAC. Vehicle seized and impounded.', TRUE, NOW());

-- 5. Seeding Reports
INSERT INTO reports (id, report_name, report_type, start_date, end_date, total_violations, total_fines_levied, total_fines_collected, generated_by, created_at) VALUES
('r1', 'Weekly Regional Audit Week 26', 'Weekly', '2026-07-01', '2026-07-07', 5, 14200.00, 1700.00, 'u1', NOW());
