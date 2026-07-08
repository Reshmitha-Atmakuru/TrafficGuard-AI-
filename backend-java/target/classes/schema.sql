-- ========================================================
-- TrafficGuard AI - MySQL Database Schema Generation Script
-- Database: trafficguard_db
-- Compatibility: MySQL 8.0+ / MySQL Workbench
-- ========================================================

CREATE DATABASE IF NOT EXISTS trafficguard_db;
USE trafficguard_db;

-- 1. Table: users (Traffic officers and administrators)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    badge_number VARCHAR(30) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'officer')),
    district VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: vehicle_owners (Stored vehicle registration and histories)
CREATE TABLE IF NOT EXISTS vehicle_owners (
    vehicle_number VARCHAR(20) PRIMARY KEY,
    owner_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    address TEXT NOT NULL,
    license_number VARCHAR(30) UNIQUE NOT NULL,
    vehicle_model VARCHAR(50) NOT NULL,
    previous_violations INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: violations (Traffic violation logs)
CREATE TABLE IF NOT EXISTS violations (
    id VARCHAR(50) PRIMARY KEY,
    vehicle_number VARCHAR(20) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    violation_type VARCHAR(100) NOT NULL,
    fine_amount DECIMAL(10, 2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    date_time DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid')),
    evidence_image LONGTEXT, -- Stores URL or base64 evidence
    officer_id VARCHAR(50),
    officer_name VARCHAR(100) NOT NULL,
    description TEXT,
    repeat_offender BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_violation_vehicle FOREIGN KEY (vehicle_number) REFERENCES vehicle_owners(vehicle_number) ON DELETE CASCADE,
    CONSTRAINT fk_violation_officer FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Table: hotspots (Accident-prone traffic locations in Andhra Pradesh)
CREATE TABLE IF NOT EXISTS hotspots (
    id VARCHAR(50) PRIMARY KEY,
    location_name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('High Risk', 'Medium Risk', 'Low Risk')),
    accident_count INT DEFAULT 0,
    violation_count INT DEFAULT 0,
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table: reports (Periodic performance metrics)
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(50) PRIMARY KEY,
    report_name VARCHAR(100) NOT NULL,
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('Weekly', 'Monthly')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_violations INT DEFAULT 0,
    total_fines_levied DECIMAL(12, 2) DEFAULT 0.0,
    total_fines_collected DECIMAL(12, 2) DEFAULT 0.0,
    generated_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_report_generator FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- Create indices to optimise queries
-- --------------------------------------------------------
CREATE INDEX idx_violations_vehicle ON violations(vehicle_number);
CREATE INDEX idx_violations_district ON violations(district);
CREATE INDEX idx_violations_date ON violations(date_time);
CREATE INDEX idx_hotspots_district ON hotspots(district);
