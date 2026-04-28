-- =====================================================================
-- PlanbookAI - Chemistry curriculum seed for grades 10, 11, 12
-- Safe to run multiple times. It normalizes old "Hoa hoc THPT" seed data
-- into three teacher-facing subjects: Hoa hoc 10, Hoa hoc 11, Hoa hoc 12.
-- =====================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE db_curriculum;

-- ---------------------------------------------------------------------
-- Subjects
-- ---------------------------------------------------------------------
SET @chem10_id = (
  SELECT id
  FROM subjects
  WHERE name IN ('Hóa học 10', 'Hóa 10', 'Hóa học THPT')
  ORDER BY FIELD(name, 'Hóa học 10', 'Hóa học THPT', 'Hóa 10'), id
  LIMIT 1
);

INSERT INTO subjects (name, description)
SELECT 'Hóa học 10', 'Chương trình Hóa học lớp 10'
WHERE @chem10_id IS NULL;
SET @chem10_id = COALESCE(@chem10_id, LAST_INSERT_ID());

SET @chem11_id = (
  SELECT id
  FROM subjects
  WHERE name IN ('Hóa học 11', 'Hóa 11')
  ORDER BY FIELD(name, 'Hóa học 11', 'Hóa 11'), id
  LIMIT 1
);

INSERT INTO subjects (name, description)
SELECT 'Hóa học 11', 'Chương trình Hóa học lớp 11'
WHERE @chem11_id IS NULL;
SET @chem11_id = COALESCE(@chem11_id, LAST_INSERT_ID());

SET @chem12_id = (
  SELECT id
  FROM subjects
  WHERE name IN ('Hóa học 12', 'Hóa 12')
  ORDER BY FIELD(name, 'Hóa học 12', 'Hóa 12'), id
  LIMIT 1
);

INSERT INTO subjects (name, description)
SELECT 'Hóa học 12', 'Chương trình Hóa học lớp 12'
WHERE @chem12_id IS NULL;
SET @chem12_id = COALESCE(@chem12_id, LAST_INSERT_ID());

UPDATE subjects
SET name = 'Hóa học 10', description = 'Chương trình Hóa học lớp 10'
WHERE id = @chem10_id;

UPDATE subjects
SET name = 'Hóa học 11', description = 'Chương trình Hóa học lớp 11'
WHERE id = @chem11_id;

UPDATE subjects
SET name = 'Hóa học 12', description = 'Chương trình Hóa học lớp 12'
WHERE id = @chem12_id;

-- Move chapters from the old combined THPT subject to the correct grade
-- before upserting the final chapter names.
UPDATE chapters
SET subject_id = @chem11_id
WHERE subject_id = @chem10_id
  AND name IN (
    'Chương 6: Oxi - Lưu huỳnh',
    'Chương 7: Nitơ - Photpho',
    'Chương 8: Cacbon - Silic',
    'Chương 9: Đại cương hóa hữu cơ'
  );

UPDATE chapters
SET subject_id = @chem12_id
WHERE subject_id = @chem10_id
  AND name IN (
    'Chương 10: Este - Lipit',
    'Chương 11: Cacbohidrat',
    'Chương 12: Amin - Amino axit - Protein',
    'Chương 13: Polime',
    'Chương 14: Kim loại',
    'Chương 15: Điện hóa học'
  );

DROP PROCEDURE IF EXISTS seed_chapter;
DROP PROCEDURE IF EXISTS seed_topic;

DELIMITER //

CREATE PROCEDURE seed_chapter(
  IN p_subject_id BIGINT,
  IN p_name VARCHAR(255),
  IN p_alias1 VARCHAR(255),
  IN p_alias2 VARCHAR(255)
)
BEGIN
  DECLARE v_chapter_id BIGINT DEFAULT NULL;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_chapter_id = NULL;

  SELECT id
  INTO v_chapter_id
  FROM chapters
  WHERE subject_id = p_subject_id
    AND (
      name = p_name
      OR (p_alias1 IS NOT NULL AND name = p_alias1)
      OR (p_alias2 IS NOT NULL AND name = p_alias2)
    )
  ORDER BY CASE WHEN name = p_name THEN 0 ELSE 1 END, id
  LIMIT 1;

  IF v_chapter_id IS NULL THEN
    INSERT INTO chapters (name, subject_id) VALUES (p_name, p_subject_id);
    SET v_chapter_id = LAST_INSERT_ID();
  ELSE
    UPDATE chapters
    SET name = p_name, subject_id = p_subject_id
    WHERE id = v_chapter_id;
  END IF;

  SET @last_chapter_id = v_chapter_id;
END//

CREATE PROCEDURE seed_topic(
  IN p_chapter_id BIGINT,
  IN p_title VARCHAR(255),
  IN p_alias1 VARCHAR(255),
  IN p_alias2 VARCHAR(255)
)
BEGIN
  DECLARE v_topic_id BIGINT DEFAULT NULL;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_topic_id = NULL;

  SELECT id
  INTO v_topic_id
  FROM topics
  WHERE chapter_id = p_chapter_id
    AND (
      title = p_title
      OR (p_alias1 IS NOT NULL AND title = p_alias1)
      OR (p_alias2 IS NOT NULL AND title = p_alias2)
    )
  ORDER BY CASE WHEN title = p_title THEN 0 ELSE 1 END, id
  LIMIT 1;

  IF v_topic_id IS NULL THEN
    INSERT INTO topics (title, chapter_id) VALUES (p_title, p_chapter_id);
  ELSE
    UPDATE topics
    SET title = p_title, chapter_id = p_chapter_id
    WHERE id = v_topic_id;
  END IF;
END//

DELIMITER ;

-- ---------------------------------------------------------------------
-- Hoa hoc 10
-- ---------------------------------------------------------------------
CALL seed_chapter(@chem10_id, 'Chương 1: Cấu tạo nguyên tử', 'Chương 1: Nguyên tử', NULL);
SET @c10_ch1 = @last_chapter_id;
CALL seed_topic(@c10_ch1, 'Thành phần của nguyên tử', 'Cấu tạo nguyên tử', NULL);
CALL seed_topic(@c10_ch1, 'Nguyên tố hóa học', NULL, NULL);
CALL seed_topic(@c10_ch1, 'Cấu trúc lớp vỏ electron', 'Cấu hình electron', NULL);
CALL seed_topic(@c10_ch1, 'Cấu hình electron nguyên tử', NULL, NULL);

CALL seed_chapter(@chem10_id, 'Chương 2: Bảng tuần hoàn các nguyên tố hóa học', 'Chương 2: Bảng tuần hoàn và định luật tuần hoàn', NULL);
SET @c10_ch2 = @last_chapter_id;
CALL seed_topic(@c10_ch2, 'Bảng tuần hoàn các nguyên tố hóa học', 'Bảng tuần hoàn nguyên tố', NULL);
CALL seed_topic(@c10_ch2, 'Xu hướng biến đổi tính chất của nguyên tố', 'Sự biến đổi tính chất của nguyên tố', NULL);
CALL seed_topic(@c10_ch2, 'Định luật tuần hoàn', NULL, NULL);

CALL seed_chapter(@chem10_id, 'Chương 3: Liên kết hóa học', NULL, NULL);
SET @c10_ch3 = @last_chapter_id;
CALL seed_topic(@c10_ch3, 'Quy tắc octet', NULL, NULL);
CALL seed_topic(@c10_ch3, 'Liên kết ion', NULL, NULL);
CALL seed_topic(@c10_ch3, 'Liên kết cộng hóa trị', NULL, NULL);
CALL seed_topic(@c10_ch3, 'Liên kết hydrogen và tương tác van der Waals', NULL, NULL);

CALL seed_chapter(@chem10_id, 'Chương 4: Phản ứng oxi hóa - khử', 'Chương 4: Phản ứng hóa học', NULL);
SET @c10_ch4 = @last_chapter_id;
CALL seed_topic(@c10_ch4, 'Số oxi hóa', NULL, NULL);
CALL seed_topic(@c10_ch4, 'Phản ứng oxi hóa - khử', 'Phản ứng oxi hóa khử', NULL);
CALL seed_topic(@c10_ch4, 'Cân bằng phản ứng oxi hóa - khử', 'Cân bằng phản ứng hóa học', NULL);

CALL seed_chapter(@chem10_id, 'Chương 5: Năng lượng hóa học', NULL, NULL);
SET @c10_ch5 = @last_chapter_id;
CALL seed_topic(@c10_ch5, 'Enthalpy tạo thành và biến thiên enthalpy', NULL, NULL);
CALL seed_topic(@c10_ch5, 'Ý nghĩa của biến thiên enthalpy trong phản ứng', NULL, NULL);

CALL seed_chapter(@chem10_id, 'Chương 6: Tốc độ phản ứng hóa học', NULL, NULL);
SET @c10_ch6 = @last_chapter_id;
CALL seed_topic(@c10_ch6, 'Tốc độ phản ứng', NULL, NULL);
CALL seed_topic(@c10_ch6, 'Các yếu tố ảnh hưởng đến tốc độ phản ứng', NULL, NULL);

CALL seed_chapter(@chem10_id, 'Chương 7: Nguyên tố nhóm VIIA - Halogen', 'Chương 5: Nhóm Halogen', NULL);
SET @c10_ch7 = @last_chapter_id;
CALL seed_topic(@c10_ch7, 'Chlorine', 'Clo', NULL);
CALL seed_topic(@c10_ch7, 'Hydrogen halide và hydrohalic acid', 'Hidro clorua và axit HCl', NULL);
CALL seed_topic(@c10_ch7, 'Muối halide', 'Muối clorua', NULL);

-- ---------------------------------------------------------------------
-- Hoa hoc 11
-- ---------------------------------------------------------------------
CALL seed_chapter(@chem11_id, 'Chương 1: Cân bằng hóa học', 'chương 1', NULL);
SET @c11_ch1 = @last_chapter_id;
CALL seed_topic(@c11_ch1, 'Khái niệm cân bằng hóa học', 'bài 1', NULL);
CALL seed_topic(@c11_ch1, 'Hằng số cân bằng', NULL, NULL);
CALL seed_topic(@c11_ch1, 'Cân bằng trong dung dịch nước', NULL, NULL);
CALL seed_topic(@c11_ch1, 'pH và chất chỉ thị acid - base', NULL, NULL);

CALL seed_chapter(@chem11_id, 'Chương 2: Nitrogen và sulfur', 'Chương 6: Oxi - Lưu huỳnh', 'Chương 7: Nitơ - Photpho');
SET @c11_ch2 = @last_chapter_id;
CALL seed_topic(@c11_ch2, 'Đơn chất nitrogen', 'nito', NULL);
CALL seed_topic(@c11_ch2, 'Ammonia và muối ammonium', NULL, NULL);
CALL seed_topic(@c11_ch2, 'Nitric acid và muối nitrate', NULL, NULL);
CALL seed_topic(@c11_ch2, 'Sulfur và sulfur dioxide', 'Lưu huỳnh', NULL);
CALL seed_topic(@c11_ch2, 'Sulfuric acid và muối sulfate', 'Axit sunfuric', NULL);

CALL seed_chapter(@chem11_id, 'Chương 3: Đại cương hóa học hữu cơ', 'Chương 9: Đại cương hóa hữu cơ', NULL);
SET @c11_ch3 = @last_chapter_id;
CALL seed_topic(@c11_ch3, 'Hợp chất hữu cơ và hóa học hữu cơ', NULL, NULL);
CALL seed_topic(@c11_ch3, 'Công thức phân tử hợp chất hữu cơ', NULL, NULL);
CALL seed_topic(@c11_ch3, 'Cấu tạo hóa học hợp chất hữu cơ', NULL, NULL);

CALL seed_chapter(@chem11_id, 'Chương 4: Hydrocarbon', NULL, NULL);
SET @c11_ch4 = @last_chapter_id;
CALL seed_topic(@c11_ch4, 'Alkane', NULL, NULL);
CALL seed_topic(@c11_ch4, 'Alkene', NULL, NULL);
CALL seed_topic(@c11_ch4, 'Alkyne', NULL, NULL);
CALL seed_topic(@c11_ch4, 'Arene', NULL, NULL);

CALL seed_chapter(@chem11_id, 'Chương 5: Dẫn xuất halogen - Alcohol - Phenol', NULL, NULL);
SET @c11_ch5 = @last_chapter_id;
CALL seed_topic(@c11_ch5, 'Dẫn xuất halogen', NULL, NULL);
CALL seed_topic(@c11_ch5, 'Alcohol', NULL, NULL);
CALL seed_topic(@c11_ch5, 'Phenol', NULL, NULL);

CALL seed_chapter(@chem11_id, 'Chương 6: Hợp chất carbonyl và carboxylic acid', NULL, NULL);
SET @c11_ch6 = @last_chapter_id;
CALL seed_topic(@c11_ch6, 'Aldehyde và ketone', NULL, NULL);
CALL seed_topic(@c11_ch6, 'Carboxylic acid', NULL, NULL);

-- ---------------------------------------------------------------------
-- Hoa hoc 12
-- ---------------------------------------------------------------------
CALL seed_chapter(@chem12_id, 'Chương 1: Ester - Lipid', 'Chương 10: Este - Lipit', NULL);
SET @c12_ch1 = @last_chapter_id;
CALL seed_topic(@c12_ch1, 'Ester', NULL, NULL);
CALL seed_topic(@c12_ch1, 'Lipid và chất béo', NULL, NULL);
CALL seed_topic(@c12_ch1, 'Xà phòng và chất giặt rửa', NULL, NULL);

CALL seed_chapter(@chem12_id, 'Chương 2: Carbohydrate', 'Chương 11: Cacbohidrat', NULL);
SET @c12_ch2 = @last_chapter_id;
CALL seed_topic(@c12_ch2, 'Glucose và fructose', NULL, NULL);
CALL seed_topic(@c12_ch2, 'Saccharose và maltose', NULL, NULL);
CALL seed_topic(@c12_ch2, 'Tinh bột và cellulose', NULL, NULL);

CALL seed_chapter(@chem12_id, 'Chương 3: Amine - Amino acid - Protein', 'Chương 12: Amin - Amino axit - Protein', NULL);
SET @c12_ch3 = @last_chapter_id;
CALL seed_topic(@c12_ch3, 'Amine', NULL, NULL);
CALL seed_topic(@c12_ch3, 'Amino acid', NULL, NULL);
CALL seed_topic(@c12_ch3, 'Peptide và protein', NULL, NULL);

CALL seed_chapter(@chem12_id, 'Chương 4: Polymer', 'Chương 13: Polime', NULL);
SET @c12_ch4 = @last_chapter_id;
CALL seed_topic(@c12_ch4, 'Đại cương về polymer', NULL, NULL);
CALL seed_topic(@c12_ch4, 'Vật liệu polymer', NULL, NULL);

CALL seed_chapter(@chem12_id, 'Chương 5: Pin điện và điện phân', 'Chương 15: Điện hóa học', NULL);
SET @c12_ch5 = @last_chapter_id;
CALL seed_topic(@c12_ch5, 'Thế điện cực và pin điện hóa', NULL, NULL);
CALL seed_topic(@c12_ch5, 'Điện phân', NULL, NULL);

CALL seed_chapter(@chem12_id, 'Chương 6: Đại cương về kim loại', 'Chương 14: Kim loại', NULL);
SET @c12_ch6 = @last_chapter_id;
CALL seed_topic(@c12_ch6, 'Tính chất của kim loại', NULL, NULL);
CALL seed_topic(@c12_ch6, 'Dãy điện hóa của kim loại', NULL, NULL);
CALL seed_topic(@c12_ch6, 'Ăn mòn kim loại', NULL, NULL);
CALL seed_topic(@c12_ch6, 'Điều chế kim loại', NULL, NULL);

CALL seed_chapter(@chem12_id, 'Chương 7: Nguyên tố kim loại thông dụng', NULL, NULL);
SET @c12_ch7 = @last_chapter_id;
CALL seed_topic(@c12_ch7, 'Kim loại nhóm IA và IIA', NULL, NULL);
CALL seed_topic(@c12_ch7, 'Nhôm và hợp chất của nhôm', NULL, NULL);
CALL seed_topic(@c12_ch7, 'Sắt và hợp chất của sắt', NULL, NULL);

DROP PROCEDURE IF EXISTS seed_topic;
DROP PROCEDURE IF EXISTS seed_chapter;

-- Keep existing curriculum templates that pointed at duplicate grade subjects.
-- Fresh init databases may not have curriculum_templates.subject_id yet because
-- Hibernate adds that column later, so this block checks the schema first.
DROP PROCEDURE IF EXISTS seed_move_curriculum_templates;

DELIMITER //

CREATE PROCEDURE seed_move_curriculum_templates()
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'curriculum_templates'
      AND column_name = 'subject_id'
  ) THEN
    SET @template_sql = CONCAT(
      'UPDATE curriculum_templates SET subject_id = ', @chem10_id,
      ' WHERE subject_id IN (SELECT id FROM subjects WHERE id <> ', @chem10_id,
      ' AND name IN (''Hóa học THPT'', ''Hóa học 10'', ''Hóa 10''))'
    );
    PREPARE template_stmt FROM @template_sql;
    EXECUTE template_stmt;
    DEALLOCATE PREPARE template_stmt;

    SET @template_sql = CONCAT(
      'UPDATE curriculum_templates SET subject_id = ', @chem11_id,
      ' WHERE subject_id IN (SELECT id FROM subjects WHERE id <> ', @chem11_id,
      ' AND name IN (''Hóa học 11'', ''Hóa 11''))'
    );
    PREPARE template_stmt FROM @template_sql;
    EXECUTE template_stmt;
    DEALLOCATE PREPARE template_stmt;

    SET @template_sql = CONCAT(
      'UPDATE curriculum_templates SET subject_id = ', @chem12_id,
      ' WHERE subject_id IN (SELECT id FROM subjects WHERE id <> ', @chem12_id,
      ' AND name IN (''Hóa học 12'', ''Hóa 12''))'
    );
    PREPARE template_stmt FROM @template_sql;
    EXECUTE template_stmt;
    DEALLOCATE PREPARE template_stmt;
  END IF;
END//

DELIMITER ;

CALL seed_move_curriculum_templates();
DROP PROCEDURE IF EXISTS seed_move_curriculum_templates;

-- Remove old topics from the previous combined THPT seed when they are no
-- longer part of the grade-level curriculum and have no user content.
DELETE t
FROM topics t
JOIN chapters c ON c.id = t.chapter_id
LEFT JOIN lesson_plans lp ON lp.topic_id = t.id
LEFT JOIN sample_lesson_plans slp ON slp.topic_id = t.id
WHERE c.id IN (@c10_ch1, @c10_ch3, @c10_ch4, @c11_ch2)
  AND (
    (c.id = @c10_ch1 AND t.title = 'Số oxi hóa')
    OR (c.id = @c10_ch3 AND t.title = 'Liên kết kim loại')
    OR (c.id = @c10_ch4 AND t.title = 'Tốc độ phản ứng')
    OR (c.id = @c11_ch2 AND t.title = 'Oxi và ozon')
  )
  AND lp.id IS NULL
  AND slp.id IS NULL;

-- Remove empty duplicate subjects produced by older manual tests or seed files.
DELETE s
FROM subjects s
LEFT JOIN chapters c ON c.subject_id = s.id
LEFT JOIN topics t ON t.chapter_id = c.id
LEFT JOIN lesson_plans lp ON lp.topic_id = t.id
LEFT JOIN sample_lesson_plans slp ON slp.topic_id = t.id
WHERE s.id NOT IN (@chem10_id, @chem11_id, @chem12_id)
  AND s.name IN ('Hóa học THPT', 'Hóa học 10', 'Hóa 10', 'Hóa học 11', 'Hóa 11', 'Hóa học 12', 'Hóa 12')
  AND lp.id IS NULL
  AND slp.id IS NULL;

-- Remove empty legacy chapters that are left after the THPT split.
DELETE c
FROM chapters c
LEFT JOIN topics t ON t.chapter_id = c.id
LEFT JOIN lesson_plans lp ON lp.topic_id = t.id
LEFT JOIN sample_lesson_plans slp ON slp.topic_id = t.id
WHERE c.subject_id IN (@chem10_id, @chem11_id, @chem12_id)
  AND c.name IN (
    'Chương 7: Nitơ - Photpho',
    'Chương 8: Cacbon - Silic'
  )
  AND lp.id IS NULL
  AND slp.id IS NULL;

SELECT
  s.name AS subject_name,
  COUNT(DISTINCT c.id) AS chapter_count,
  COUNT(DISTINCT t.id) AS topic_count
FROM subjects s
LEFT JOIN chapters c ON c.subject_id = s.id
LEFT JOIN topics t ON t.chapter_id = c.id
WHERE s.id IN (@chem10_id, @chem11_id, @chem12_id)
GROUP BY s.id, s.name
ORDER BY s.name;
