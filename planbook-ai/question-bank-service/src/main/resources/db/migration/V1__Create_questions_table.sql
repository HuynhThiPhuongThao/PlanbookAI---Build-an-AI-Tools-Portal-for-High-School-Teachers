CREATE TABLE questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content LONGTEXT NOT NULL,
    subject VARCHAR(100),
    topic VARCHAR(100),
    difficulty_level VARCHAR(50),  -- EASY, MEDIUM, HARD
    correct_answer VARCHAR(255),
    options JSON,  -- MCQ options
    explanation TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',  -- PENDING, APPROVED, REJECTED
    author_id BIGINT NOT NULL,
    author_name VARCHAR(255),
    approved_by BIGINT,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_status ON questions(status);
CREATE INDEX idx_subject ON questions(subject);
CREATE INDEX idx_author ON questions(author_id);
