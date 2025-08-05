use admin_hsk;
CREATE TABLE certificates (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  user_id INT,
  username VARCHAR(255),
  email VARCHAR(255),
  phone_number VARCHAR(255),
  certificate_img VARCHAR(255),
  note TEXT,
  share INT,
  active INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Adding indexes
use admin_hsk;
CREATE INDEX idx_user_id ON certificates(user_id);
use admin_hsk;
ALTER TABLE certificates
ADD COLUMN month_year VARCHAR(32) GENERATED ALWAYS AS (CONCAT(MONTH(created_at), YEAR(created_at))) VIRTUAL;
use admin_hsk;
CREATE UNIQUE INDEX idx_unique_user_month_year ON certificates(user_id, month_year);