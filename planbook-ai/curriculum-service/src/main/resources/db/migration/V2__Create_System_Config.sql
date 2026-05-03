CREATE TABLE IF NOT EXISTS system_config (
    id BIGINT PRIMARY KEY,
    ai_model VARCHAR(100) NOT NULL DEFAULT 'gemini-2.5-flash',
    ai_temperature DOUBLE NOT NULL DEFAULT 0.7,
    ai_max_tokens INT NOT NULL DEFAULT 2048,
    allow_teacher_register BOOLEAN NOT NULL DEFAULT TRUE,
    max_lesson_plans_per_day INT NOT NULL DEFAULT 10,
    max_questions_per_day INT NOT NULL DEFAULT 50,
    system_banner TEXT NULL,
    banner_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by BIGINT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO system_config (
    id,
    ai_model,
    ai_temperature,
    ai_max_tokens,
    allow_teacher_register,
    max_lesson_plans_per_day,
    max_questions_per_day,
    system_banner,
    banner_enabled,
    maintenance_mode
) VALUES (
    1,
    'gemini-2.5-flash',
    0.7,
    2048,
    TRUE,
    10,
    50,
    '',
    FALSE,
    FALSE
) ON DUPLICATE KEY UPDATE id = id;
