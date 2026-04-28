ALTER TABLE questions
    ADD COLUMN subject_id BIGINT NULL,
    ADD COLUMN chapter_id BIGINT NULL,
    ADD COLUMN topic_id BIGINT NULL;

CREATE INDEX idx_subject_id ON questions(subject_id);
CREATE INDEX idx_chapter_id ON questions(chapter_id);
CREATE INDEX idx_topic_id ON questions(topic_id);
