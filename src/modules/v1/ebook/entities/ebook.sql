USE admin_hsk;

CREATE TABLE IF NOT EXISTS ebooks_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    favourites TEXT DEFAULT NULL,
    content TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- Thêm index cho cột user_id
CREATE INDEX idx_user_id ON ebooks_users(user_id);

USE admin_hsk;

CREATE TABLE IF NOT EXISTS ebooks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT DEFAULT NULL,
    cover_img_url VARCHAR(255) DEFAULT NULL,
    pdf_url VARCHAR(255) DEFAULT NULL,
    audio_url VARCHAR(255) DEFAULT NULL,
    type VARCHAR(255) NOT NULL,
    is_free TINYINT DEFAULT 0,
    priority INT NOT NULL,
    language VARCHAR(255) NOT NULL,
    flag VARCHAR(255) NOT NULL,
    CHECK (flag REGEXP '^[A-Za-z0-9_]+$'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
) 
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

CREATE INDEX idx_flag ON admin_hsk.ebooks(flag);

USE admin_hsk;
ALTER TABLE ebooks
MODIFY COLUMN audio_url TEXT;

USE admin_hsk;
ALTER TABLE ebooks
ADD COLUMN author VARCHAR(255);

USE admin_hsk;
ALTER TABLE ebooks
ADD COLUMN type_lang TEXT;

