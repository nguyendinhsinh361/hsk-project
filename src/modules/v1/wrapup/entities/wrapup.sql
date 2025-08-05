-- missions
USE admin_hsk;
CREATE TABLE IF NOT EXISTS missions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sequence_number INT NOT NULL,
    feature VARCHAR(255) DEFAULT NULL,
    mission VARCHAR(255) DEFAULT NULL,
    mission_code VARCHAR(255) DEFAULT NULL,
    description VARCHAR(255) DEFAULT NULL,
    mission_display VARCHAR(255) DEFAULT NULL,
    mission_point INT DEFAULT NULL,
    type VARCHAR(255) DEFAULT NULL,
    mission_number INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

USE admin_hsk;
CREATE INDEX idx_sequence_number ON missions(sequence_number);
CREATE INDEX idx_mission_code ON missions(mission_code);


-- missions_users
USE admin_hsk;
CREATE TABLE IF NOT EXISTS missions_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mission_id INT DEFAULT NULL,
    mission_name VARCHAR(255) DEFAULT NULL,
    mission_display VARCHAR(255) DEFAULT NULL,
    mission_code VARCHAR(255) DEFAULT NULL,
    mission_kind VARCHAR(255) DEFAULT NULL,
    mission_type VARCHAR(255) DEFAULT NULL,
    mission_level INT DEFAULT NULL,
    mission_count INT DEFAULT NULL,
    mission_progress INT DEFAULT NULL,
    mission_point INT DEFAULT NULL,
    time_start BIGINT DEFAULT NULL,
    time_end BIGINT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

USE admin_hsk;
CREATE INDEX idx_user_id ON missions_users(user_id);
CREATE INDEX idx_mission_id ON missions_users(mission_id);
CREATE INDEX idx_mission_code ON missions_users(mission_code);



-- ranking
USE admin_hsk;
CREATE TABLE IF NOT EXISTS ranking (
    user_id INT PRIMARY KEY NOT NULL,
    email VARCHAR(255) DEFAULT NULL,
    name VARCHAR(255) DEFAULT NULL,
    total_scores INT DEFAULT NULL,
    total_missions INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

USE admin_hsk;
CREATE INDEX idx_total_scores ON ranking(total_scores);
CREATE INDEX idx_scores_updated ON ranking (total_scores DESC, updated_at ASC);

USE admin_hsk;
ALTER TABLE ranking
ADD COLUMN email VARCHAR(255),
ADD COLUMN name VARCHAR(255);

CREATE INDEX idx_email ON ranking(email);

