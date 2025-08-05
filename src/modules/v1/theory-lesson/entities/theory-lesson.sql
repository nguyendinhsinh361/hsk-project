use admin_hsk;
CREATE TABLE theory_lesson (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  user_id INT,
  lesson_id VARCHAR(255),
  level INT,
  content TEXT,
  completed_status INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_theory (user_id, lesson_id)
);

-- Adding indexes
use admin_hsk;
CREATE INDEX idx_user_id ON theory_lesson(user_id);

USE admin_hsk;
ALTER TABLE theory_lesson
ADD COLUMN kind VARCHAR(255) DEFAULT "hanzii"