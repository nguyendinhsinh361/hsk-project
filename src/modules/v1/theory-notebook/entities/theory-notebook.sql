use admin_hsk;
CREATE TABLE theory_notebook (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  user_id INT,
  theory_id INT,
  level INT,
  understand_level INT,
  tick INT,
  click INT,
  take_note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_theory (user_id, theory_id)
);

-- Adding indexes
use admin_hsk;
CREATE INDEX idx_user_id ON certificates(user_id);

USE admin_hsk;
ALTER TABLE theory_notebook
ADD COLUMN kind VARCHAR(255) DEFAULT "hanzii"

USE admin_hsk;
ALTER TABLE theory_notebook
ADD COLUMN click INT DEFAULT 0,
ADD COLUMN hanzii VARCHAR(255) DEFAULT NULL,
ADD COLUMN word VARCHAR(255) DEFAULT NULL,
ADD COLUMN grammar VARCHAR(255) DEFAULT NULL;

use admin_hsk;
ALTER TABLE `theory_notebook`
DROP INDEX `unique_user_theory`;

ALTER TABLE `theory_notebook`
ADD UNIQUE KEY `unique_user_theory_kind` (`user_id`, `theory_id`, `kind`);

ALTER TABLE `theory_notebook`
ADD UNIQUE KEY `unique_user_word` (`user_id`, `word`);

CREATE INDEX idx_kind ON theory_notebook(kind);
CREATE INDEX idx_level ON theory_notebook(level);
CREATE INDEX idx_understand_level ON theory_notebook(understand_level);