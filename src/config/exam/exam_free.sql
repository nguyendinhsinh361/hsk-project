ALTER TABLE questions_test ADD COLUMN payment_type VARCHAR(50) DEFAULT 'PREMIUM';
ALTER TABLE questions_test DROP COLUMN payment_type;
