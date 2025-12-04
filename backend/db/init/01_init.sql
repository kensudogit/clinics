-- Database initialization script for Clinics application
-- This script runs when the MySQL container starts for the first time

-- Create the production database if it doesn't exist
CREATE DATABASE IF NOT EXISTS clinics_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges to the clinics user
GRANT ALL PRIVILEGES ON clinics_production.* TO 'clinics_user'@'%';
FLUSH PRIVILEGES;

-- Use the production database
USE clinics_production;

-- Create initial tables (these will be created by Rails migrations, but we can add some initial data)
-- The actual table creation will be handled by Rails db:migrate
