-- MỤC ĐÍCH:
--   Seed dữ liệu nền cho curriculum-service
--   Chủ đề: Hóa học THCS
--
-- PHỤC VỤ CHO CÁC LUỒNG:
--   1. Staff tạo Sample Lesson Plan theo Topic
--   2. Teacher chọn Subject -> Chapter -> Topic khi tạo Lesson Plan
--   3. Teacher lọc Approved Sample theo Topic / Curriculum Template
--
-- LƯU Ý:
--   - Script này có tên bảng là:
--       subjects
--       chapters
--       topics
--   - Script này có tên cột là:
--       subjects(id, name, description)
--       chapters(id, name, subject_id)
--       topics(id, title, chapter_id)

USE db_curriculum;

-- =========================================================
-- TẮT CHECK KHÓA NGOẠI TẠM THỜI ĐỂ DỄ XÓA / SEED LẠI
-- =========================================================
SET FOREIGN_KEY_CHECKS
= 0;

-- =========================================================
-- XÓA DỮ LIỆU CŨ
-- Chạy theo thứ tự từ bảng con -> bảng cha
-- =========================================================
DELETE FROM topics;
DELETE FROM chapters;
DELETE FROM subjects;

-- Nếu muốn reset AUTO_INCREMENT thì mở các dòng dưới đây
ALTER TABLE topics AUTO_INCREMENT = 1;
ALTER TABLE chapters AUTO_INCREMENT = 1;
ALTER TABLE subjects AUTO_INCREMENT = 1;

-- =========================================================
-- BẬT LẠI CHECK KHÓA NGOẠI
-- =========================================================
SET FOREIGN_KEY_CHECKS
= 1;

-- =========================================================
-- SUBJECT
-- =========================================================
INSERT INTO subjects
    (id, name, description)
VALUES
    (1, 'Hóa học THPT', 'Dữ liệu nền môn Hóa học cấp 3 cho curriculum-service');

-- =========================================================
-- CHAPTERS
-- =========================================================
INSERT INTO chapters
    (id, name, subject_id)
VALUES
    -- Lớp 10
    (1, 'Chương 1: Nguyên tử', 1),
    (2, 'Chương 2: Bảng tuần hoàn và định luật tuần hoàn', 1),
    (3, 'Chương 3: Liên kết hóa học', 1),
    (4, 'Chương 4: Phản ứng hóa học', 1),

    -- Lớp 11
    (5, 'Chương 5: Nhóm Halogen', 1),
    (6, 'Chương 6: Oxi - Lưu huỳnh', 1),
    (7, 'Chương 7: Nitơ - Photpho', 1),
    (8, 'Chương 8: Cacbon - Silic', 1),
    (9, 'Chương 9: Đại cương hóa hữu cơ', 1),

    -- Lớp 12
    (10, 'Chương 10: Este - Lipit', 1),
    (11, 'Chương 11: Cacbohidrat', 1),
    (12, 'Chương 12: Amin - Amino axit - Protein', 1),
    (13, 'Chương 13: Polime', 1),
    (14, 'Chương 14: Kim loại', 1),
    (15, 'Chương 15: Điện hóa học', 1);

-- =========================================================
-- TOPICS - CHƯƠNG 1
-- =========================================================
INSERT INTO topics
VALUES
    (1, 'Cấu tạo nguyên tử', 1),
    (2, 'Cấu hình electron', 1),
    (3, 'Số oxi hóa', 1);

-- =========================================================
-- TOPICS - CHƯƠNG 2
-- =========================================================
INSERT INTO topics
VALUES
    (4, 'Bảng tuần hoàn nguyên tố', 2),
    (5, 'Định luật tuần hoàn', 2),
    (6, 'Sự biến đổi tính chất của nguyên tố', 2);


-- =========================================================
-- TOPICS - CHƯƠNG 3
-- =========================================================
INSERT INTO topics
VALUES
    (7, 'Liên kết ion', 3),
    (8, 'Liên kết cộng hóa trị', 3),
    (9, 'Liên kết kim loại', 3);


-- =========================================================
-- TOPICS - CHƯƠNG 4
-- =========================================================
INSERT INTO topics
VALUES
    (10, 'Phản ứng oxi hóa khử', 4),
    (11, 'Cân bằng phản ứng hóa học', 4),
    (12, 'Tốc độ phản ứng', 4);


-- =========================================================
-- TOPICS - CHƯƠNG 5
-- =========================================================
INSERT INTO topics
VALUES
    (13, 'Clo', 5),
    (14, 'Hidro clorua và axit HCl', 5),
    (15, 'Muối clorua', 5);

-- =========================================================
-- TOPICS - CHƯƠNG 6
-- =========================================================
INSERT INTO topics
VALUES
    (16, 'Oxi và ozon', 6),
    (17, 'Lưu huỳnh', 6),
    (18, 'Axit sunfuric', 6);


-- =========================================================
-- KIỂM TRA NHANH DỮ LIỆU SAU KHI SEED
-- =========================================================

-- Xem subject
SELECT *
FROM subjects;

-- Xem chapters
SELECT *
FROM chapters
ORDER BY id;

-- Xem topics
SELECT *
FROM topics
ORDER BY id;

-- Xem cây Subject -> Chapter -> Topic
SELECT
    s.id AS subject_id,
    s.name AS subject_name,
    c.id AS chapter_id,
    c.name AS chapter_name,
    t.id AS topic_id,
    t.title AS topic_title
FROM subjects s
    JOIN chapters c ON c.subject_id = s.id
    JOIN topics t ON t.chapter_id = c.id
ORDER BY s.id, c.id, t.id;

