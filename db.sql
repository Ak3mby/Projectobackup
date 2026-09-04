CREATE DATABASE IF NOT EXISTS booleanware;
USE booleanware;

CREATE TABLE reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player VARCHAR(50),
  infraccion VARCHAR(50),
  confianza INT,
  verdict ENUM('cheater','suspicious','clean'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO reports (player,infraccion,confianza,verdict)
VALUES
('p_55891','Aimbot',96,'cheater'),
('p_22047','Wallhack / ESP',88,'cheater'),
('p_91003','Speedhack',61,'suspicious'),
('p_30214','Triggerbot',79,'suspicious'),
('p_77512','Aimbot',99,'cheater'),
('p_10238','Sin flags',8,'clean'),
('p_64470','Wallhack / ESP',54,'suspicious'),
('p_40291','Speedhack',91,'cheater');

CREATE TABLE sanctions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NULL,
  player VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status ENUM('active','expired','revoked') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE SET NULL
);

CREATE TABLE appeals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player VARCHAR(50) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(255) NOT NULL,
  user VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE integrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  status ENUM('connected','paused','error') DEFAULT 'connected',
  last_sync TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value VARCHAR(255) NOT NULL
);

INSERT INTO appeals (player, reason, status) VALUES
('p_88210', 'Sancionado por wallhack hace 2h', 'pending'),
('p_40291', 'Ban temporal por speedhack', 'pending'),
('p_77512', 'Marcado por aimbot, evidencia adjunta', 'pending');

INSERT INTO integrations (name, endpoint, status, last_sync) VALUES
('Riftbound anti-cheat', '/v1/events', 'connected', CURRENT_TIMESTAMP),
('Moderation webhook', '/v1/moderation', 'connected', CURRENT_TIMESTAMP);

INSERT INTO settings (setting_key, setting_value) VALUES
('app_name', 'booleanware'),
('game_name', 'Riftbound Online'),
('api_version', 'v1'),
('alert_threshold', '80');
