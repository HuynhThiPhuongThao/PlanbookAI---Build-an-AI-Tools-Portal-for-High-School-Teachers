USE db_ai;

DELETE FROM prompts;

INSERT INTO prompts (name, type, content, version, is_active, created_by, created_at, updated_at)
VALUES (
  'generate_lesson_plan',
  'lesson_plan',
  'You are an AI assistant for teachers.\n\nCreate a lesson plan for topic "{topic}", grade {grade}, duration {duration_minutes} minutes.\n\nSTRICT RULES:\n- Follow Vietnamese school teaching style\n- Total time of all activities must equal {duration_minutes} minutes\n\nRETURN ONLY VALID JSON:\n\n{\n  "title": "string",\n  "topic": "string",\n  "grade": "string",\n  "durationMinutes": 45,\n  "objectives": ["string"],\n  "activities": [\n    {"time": 5, "activity": "string"}\n  ],\n  "assessment": "string"\n}\n\nIMPORTANT:\n- activities.time must be a NUMBER in minutes\n- Do NOT return text outside JSON',
  1, 1, 'admin', NOW(), NOW()
);

INSERT INTO prompts (name, type, content, version, is_active, created_by, created_at, updated_at)
VALUES (
  'generate_exercise',
  'exercise',
  'You are an AI assistant for teachers.\n\nGenerate EXACTLY {number_of_questions} multiple choice questions about "{topic}" for grade {grade} with difficulty "{difficulty}".\n\nRETURN ONLY VALID JSON:\n\n{\n  "questions": [\n    {\n      "question": "string",\n      "options": ["string","string","string","string"],\n      "correctAnswer": "A"\n    }\n  ]\n}\n\nIMPORTANT: Do NOT return text outside JSON.',
  1, 1, 'admin', NOW(), NOW()
);

SELECT id, name, type, is_active FROM prompts;
