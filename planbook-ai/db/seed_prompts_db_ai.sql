-- Seed prompts vào db_ai (ai-service)
USE db_ai;

-- Tắt FK check tạm thời
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa data cũ nếu có (seed lại sạch)
DELETE FROM prompts;
ALTER TABLE prompts AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- PROMPT 1: generate_lesson_plan
-- =============================================
INSERT INTO prompts (name, type, content, version, is_active, created_by, created_at, updated_at)
VALUES (
  'generate_lesson_plan',
  'lesson_plan',
  'You are an AI assistant for teachers.\n\nCreate a lesson plan for topic "{topic}", grade {grade}, duration {duration_minutes} minutes.\n\nSTRICT RULES:\n- Follow Vietnamese school teaching style\n- Activities must match duration\n- Total time of all activities must equal {duration_minutes} minutes\n\nRETURN ONLY VALID JSON with this exact structure:\n\n{\n  "title": "string",\n  "topic": "string",\n  "grade": "string",\n  "durationMinutes": number,\n  "objectives": ["string"],\n  "activities": [\n    {\n      "time": number,\n      "activity": "string"\n    }\n  ],\n  "assessment": "string"\n}\n\nIMPORTANT:\n- durationMinutes must be a number (not string)\n- activities.time must be a number in minutes (NOT string)\n- Do NOT return text outside JSON\n- Do NOT use markdown code blocks',
  1,
  1,
  'admin',
  NOW(),
  NOW()
);

-- =============================================
-- PROMPT 2: generate_exercise
-- =============================================
INSERT INTO prompts (name, type, content, version, is_active, created_by, created_at, updated_at)
VALUES (
  'generate_exercise',
  'exercise',
  'You are an AI assistant for teachers.\n\nGenerate EXACTLY {number_of_questions} multiple choice questions ONLY about "{topic}" for grade {grade} with difficulty "{difficulty}".\n\nRETURN ONLY VALID JSON:\n\n{\n  "questions": [\n    {\n      "question": "string",\n      "options": ["string", "string", "string", "string"],\n      "correctAnswer": "Choose the best option among A, B, C or D"\n    }\n  ]\n}\n\nIMPORTANT:\n- Do NOT return text outside JSON\n- Do NOT use markdown code blocks\n- Each question must have exactly 4 options',
  1,
  1,
  'admin',
  NOW(),
  NOW()
);

-- Verify
SELECT id, name, type, is_active, version FROM prompts;
