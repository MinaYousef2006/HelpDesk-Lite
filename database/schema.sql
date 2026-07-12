-- HelpDesk Lite Database Schema
-- Run this script to create the database and tables

CREATE DATABASE IF NOT EXISTS helpdesk_lite;
USE helpdesk_lite;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Client', 'Support_Agent', 'Manager') NOT NULL DEFAULT 'Client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id VARCHAR(20) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('Technical', 'Hardware', 'Access Request', 'Other') NOT NULL,
  urgency ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
  status ENUM('New', 'In Progress', 'Need Info', 'Resolved') NOT NULL DEFAULT 'New',
  client_id INT NOT NULL,
  agent_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Ticket messages (conversation)
CREATE TABLE IF NOT EXISTS ticket_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Status history
CREATE TABLE IF NOT EXISTS ticket_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by INT NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Ticket counter for generating ticket IDs
CREATE TABLE IF NOT EXISTS ticket_counter (
  id INT PRIMARY KEY DEFAULT 1,
  last_number INT NOT NULL DEFAULT 1000
);

INSERT INTO ticket_counter (id, last_number) VALUES (1, 1000)
ON DUPLICATE KEY UPDATE last_number = last_number;

-- Seed users: Run `node utils/seed.js` after schema setup
-- Default password: Password123!
