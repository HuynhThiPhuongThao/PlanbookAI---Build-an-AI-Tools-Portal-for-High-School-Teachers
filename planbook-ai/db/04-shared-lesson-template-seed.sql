-- =====================================================================
-- PlanbookAI - Shared lesson-plan templates for Chemistry 10, 11, 12
-- Safe to run multiple times. All ACTIVE templates are made shared by
-- leaving subject_id NULL, so Staff can use them for every Chemistry grade.
-- =====================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE db_curriculum;

DROP PROCEDURE IF EXISTS add_curriculum_template_column;

DELIMITER //

CREATE PROCEDURE add_curriculum_template_column(
  IN p_column_name VARCHAR(64),
  IN p_alter_sql TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'curriculum_templates'
      AND column_name = p_column_name
  ) THEN
    SET @ddl = p_alter_sql;
    PREPARE ddl_stmt FROM @ddl;
    EXECUTE ddl_stmt;
    DEALLOCATE PREPARE ddl_stmt;
  END IF;
END//

DELIMITER ;

CALL add_curriculum_template_column(
  'grade_level',
  'ALTER TABLE curriculum_templates ADD COLUMN grade_level VARCHAR(255) NULL'
);

CALL add_curriculum_template_column(
  'status',
  'ALTER TABLE curriculum_templates ADD COLUMN status ENUM(''ACTIVE'', ''INACTIVE'') NOT NULL DEFAULT ''ACTIVE'''
);

CALL add_curriculum_template_column(
  'structure_json',
  'ALTER TABLE curriculum_templates ADD COLUMN structure_json TEXT NULL'
);

CALL add_curriculum_template_column(
  'subject_id',
  'ALTER TABLE curriculum_templates ADD COLUMN subject_id BIGINT NULL'
);

DROP PROCEDURE IF EXISTS add_curriculum_template_column;

-- Make existing active templates shared across Chemistry 10, 11, and 12.
UPDATE curriculum_templates
SET subject_id = NULL,
    grade_level = COALESCE(NULLIF(grade_level, ''), 'THPT')
WHERE status = 'ACTIVE';

-- Keep the first three templates from older data, but normalize them as
-- shared THPT templates.
UPDATE curriculum_templates
SET subject_id = NULL,
    grade_level = 'THPT',
    description = 'Khung dùng chung cho bài học kiến tạo ở Hóa học THPT'
WHERE name = 'Khung 5 hoạt động - Bài học kiến tạo';

UPDATE curriculum_templates
SET subject_id = NULL,
    grade_level = 'THPT',
    description = 'Khung dùng chung cho bài thực hành và thí nghiệm Hóa học THPT'
WHERE name = 'Khung thực hành - Thí nghiệm và quan sát';

UPDATE curriculum_templates
SET subject_id = NULL,
    grade_level = 'THPT',
    description = 'Khung dùng chung cho tiết ôn tập và luyện tập theo năng lực'
WHERE name = 'Khung ôn tập - Luyện tập theo năng lực';

INSERT INTO curriculum_templates (name, description, grade_level, status, structure_json, subject_id)
SELECT
  'Khung bài mới - Hình thành kiến thức',
  'Khung dùng chung cho bài học lý thuyết mới ở Hóa học 10, 11, 12',
  'THPT',
  'ACTIVE',
  '{"sections":[{"key":"start","title":"Khởi động","items":["Tình huống mở đầu","Câu hỏi gợi vấn đề","Kết nối kiến thức cũ"]},{"key":"knowledge","title":"Hình thành kiến thức","items":["Mục tiêu kiến thức","Hoạt động khám phá","Kết luận trọng tâm","Ví dụ minh họa"]},{"key":"practice","title":"Luyện tập","items":["Câu hỏi nhận biết","Câu hỏi thông hiểu","Bài tập vận dụng"]},{"key":"apply","title":"Vận dụng","items":["Bài tập thực tiễn","Nhiệm vụ về nhà","Tiêu chí đánh giá"]}]}',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM curriculum_templates WHERE name = 'Khung bài mới - Hình thành kiến thức'
);

INSERT INTO curriculum_templates (name, description, grade_level, status, structure_json, subject_id)
SELECT
  'Khung bài tập - Luyện tập phân hóa',
  'Khung dùng chung cho tiết bài tập với mức độ nhận biết, thông hiểu, vận dụng',
  'THPT',
  'ACTIVE',
  '{"sections":[{"key":"goals","title":"Mục tiêu luyện tập","items":["Kiến thức cần củng cố","Kỹ năng tính toán/giải thích","Năng lực cần phát triển"]},{"key":"levels","title":"Hệ thống bài tập theo mức độ","items":["Nhận biết","Thông hiểu","Vận dụng","Vận dụng cao"]},{"key":"organization","title":"Tổ chức lớp học","items":["Làm cá nhân","Thảo luận nhóm","Chữa bài và phản hồi"]},{"key":"assessment","title":"Đánh giá","items":["Đáp án/kết quả","Tiêu chí chấm nhanh","Lỗi thường gặp cần sửa"]}]}',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM curriculum_templates WHERE name = 'Khung bài tập - Luyện tập phân hóa'
);

INSERT INTO curriculum_templates (name, description, grade_level, status, structure_json, subject_id)
SELECT
  'Khung dự án/STEM - Vận dụng thực tiễn',
  'Khung dùng chung cho hoạt động dự án, trải nghiệm và vận dụng kiến thức Hóa học',
  'THPT',
  'ACTIVE',
  '{"sections":[{"key":"context","title":"Bối cảnh thực tiễn","items":["Vấn đề cần giải quyết","Liên hệ đời sống/sản xuất/môi trường","Sản phẩm học tập"]},{"key":"plan","title":"Kế hoạch thực hiện","items":["Nhiệm vụ nhóm","Dụng cụ/tài liệu","Tiến độ thực hiện"]},{"key":"process","title":"Hoạt động học tập","items":["Nghiên cứu kiến thức nền","Thiết kế phương án","Thử nghiệm hoặc mô phỏng","Báo cáo kết quả"]},{"key":"rubric","title":"Đánh giá sản phẩm","items":["Tiêu chí khoa học","Tiêu chí sáng tạo","Tiêu chí trình bày và hợp tác"]}]}',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM curriculum_templates WHERE name = 'Khung dự án/STEM - Vận dụng thực tiễn'
);

INSERT INTO curriculum_templates (name, description, grade_level, status, structure_json, subject_id)
SELECT
  'Khung kiểm tra nhanh - Đánh giá thường xuyên',
  'Khung dùng chung cho tiết kiểm tra ngắn, củng cố và phản hồi sau bài học',
  'THPT',
  'ACTIVE',
  '{"sections":[{"key":"scope","title":"Phạm vi đánh giá","items":["Bài/chủ đề cần kiểm tra","Chuẩn kiến thức kỹ năng","Thời lượng"]},{"key":"questions","title":"Cấu trúc câu hỏi","items":["Trắc nghiệm nhanh","Tự luận ngắn","Câu hỏi vận dụng thực tiễn"]},{"key":"grading","title":"Chấm và phản hồi","items":["Đáp án/hướng dẫn chấm","Nhận xét lỗi phổ biến","Hoạt động sửa sai"]},{"key":"followup","title":"Điều chỉnh sau đánh giá","items":["Nhóm học sinh cần hỗ trợ","Nội dung cần dạy lại","Bài tập bổ sung"]}]}',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM curriculum_templates WHERE name = 'Khung kiểm tra nhanh - Đánh giá thường xuyên'
);

SELECT id, name, grade_level, status, subject_id
FROM curriculum_templates
ORDER BY id;
