SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS question_options (
    question_id BIGINT NOT NULL,
    option_text TEXT,
    CONSTRAINT fk_question_options_question
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP PROCEDURE IF EXISTS seed_question_bank_mcq;

DELIMITER //

CREATE PROCEDURE seed_question_bank_mcq(
    IN p_subject VARCHAR(100),
    IN p_topic VARCHAR(100),
    IN p_subject_id BIGINT,
    IN p_chapter_id BIGINT,
    IN p_topic_id BIGINT,
    IN p_difficulty VARCHAR(50),
    IN p_content TEXT,
    IN p_option_a TEXT,
    IN p_option_b TEXT,
    IN p_option_c TEXT,
    IN p_option_d TEXT,
    IN p_correct_answer TEXT,
    IN p_explanation TEXT
)
BEGIN
    DECLARE v_question_id BIGINT DEFAULT NULL;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_question_id = NULL;

    SELECT id
    INTO v_question_id
    FROM questions
    WHERE content = p_content
    LIMIT 1;

    IF v_question_id IS NULL THEN
        INSERT INTO questions (
            content, subject, topic, subject_id, chapter_id, topic_id,
            difficulty_level, correct_answer, `options`, explanation,
            status, author_id, author_name, approved_by, approved_at,
            created_at, updated_at
        ) VALUES (
            p_content, p_subject, p_topic, p_subject_id, p_chapter_id, p_topic_id,
            p_difficulty, p_correct_answer,
            JSON_ARRAY(p_option_a, p_option_b, p_option_c, p_option_d),
            p_explanation,
            'APPROVED', 1, 'Seed System', 1, CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        );
        SET v_question_id = LAST_INSERT_ID();
    ELSE
        UPDATE questions
        SET subject = p_subject,
            topic = p_topic,
            subject_id = p_subject_id,
            chapter_id = p_chapter_id,
            topic_id = p_topic_id,
            difficulty_level = p_difficulty,
            correct_answer = p_correct_answer,
            `options` = JSON_ARRAY(p_option_a, p_option_b, p_option_c, p_option_d),
            explanation = p_explanation,
            status = 'APPROVED',
            approved_by = COALESCE(approved_by, 1),
            approved_at = COALESCE(approved_at, CURRENT_TIMESTAMP),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_question_id;
    END IF;

    DELETE FROM question_options WHERE question_id = v_question_id;
    INSERT INTO question_options (question_id, option_text) VALUES
        (v_question_id, p_option_a),
        (v_question_id, p_option_b),
        (v_question_id, p_option_c),
        (v_question_id, p_option_d);
END//

DELIMITER ;

SET @chem10_id = (SELECT id FROM db_curriculum.subjects WHERE name = 'Hóa học 10' LIMIT 1);
SET @chem11_id = (SELECT id FROM db_curriculum.subjects WHERE name = 'Hóa học 11' LIMIT 1);
SET @chem12_id = (SELECT id FROM db_curriculum.subjects WHERE name = 'Hóa học 12' LIMIT 1);

SET @c10_redox_id = (
    SELECT id FROM db_curriculum.chapters
    WHERE subject_id = @chem10_id AND name = 'Chương 4: Phản ứng oxi hóa - khử'
    LIMIT 1
);
SET @t10_redox_id = (
    SELECT id FROM db_curriculum.topics
    WHERE chapter_id = @c10_redox_id AND title = 'Phản ứng oxi hóa - khử'
    LIMIT 1
);

SET @c11_nitrogen_sulfur_id = (
    SELECT id FROM db_curriculum.chapters
    WHERE subject_id = @chem11_id AND name = 'Chương 2: Nitrogen và sulfur'
    LIMIT 1
);
SET @t11_sulfur_id = (
    SELECT id FROM db_curriculum.topics
    WHERE chapter_id = @c11_nitrogen_sulfur_id AND title = 'Sulfur và sulfur dioxide'
    LIMIT 1
);

SET @c11_hydrocarbon_id = (
    SELECT id FROM db_curriculum.chapters
    WHERE subject_id = @chem11_id AND name = 'Chương 4: Hydrocarbon'
    LIMIT 1
);
SET @t11_alkane_id = (
    SELECT id FROM db_curriculum.topics
    WHERE chapter_id = @c11_hydrocarbon_id AND title = 'Alkane'
    LIMIT 1
);

SET @c12_ester_id = (
    SELECT id FROM db_curriculum.chapters
    WHERE subject_id = @chem12_id AND name = 'Chương 1: Ester - Lipid'
    LIMIT 1
);
SET @t12_ester_id = (
    SELECT id FROM db_curriculum.topics
    WHERE chapter_id = @c12_ester_id AND title = 'Ester'
    LIMIT 1
);

-- Hóa học 11 - Hydrocarbon - Alkane: bổ sung nhiều câu HARD để tạo đề dễ hơn.
CALL seed_question_bank_mcq('Hóa học 11', 'Alkane', @chem11_id, @c11_hydrocarbon_id, @t11_alkane_id, 'HARD',
'Đốt cháy hoàn toàn 0,10 mol một alkane X cần 0,65 mol O2. Công thức phân tử của X là gì?',
'C3H8',
'C4H10',
'C5H12',
'C6H14',
'C4H10',
'Với alkane CnH2n+2, 1 mol cần (3n + 1)/2 mol O2. Ta có 0,10(3n + 1)/2 = 0,65 nên n = 4.');

CALL seed_question_bank_mcq('Hóa học 11', 'Alkane', @chem11_id, @c11_hydrocarbon_id, @t11_alkane_id, 'HARD',
'Alkane nào khi thế monochlorine theo tỉ lệ mol 1:1 chỉ tạo một dẫn xuất monochloro?',
'Butane',
'2-methylpropane',
'2,2-dimethylpropane',
'Pentane',
'2,2-dimethylpropane',
'Trong neopentane, tất cả hydrogen tương đương nên thế một H bằng Cl chỉ cho một sản phẩm.');

CALL seed_question_bank_mcq('Hóa học 11', 'Alkane', @chem11_id, @c11_hydrocarbon_id, @t11_alkane_id, 'HARD',
'Một alkane X có phần trăm khối lượng carbon bằng 83,33% và khối lượng mol bằng 72 g/mol. Công thức phân tử của X là gì?',
'C4H10',
'C5H12',
'C6H14',
'C7H16',
'C5H12',
'Alkane có công thức CnH2n+2. Với M = 14n + 2 = 72, suy ra n = 5.');

CALL seed_question_bank_mcq('Hóa học 11', 'Alkane', @chem11_id, @c11_hydrocarbon_id, @t11_alkane_id, 'HARD',
'Đốt cháy hoàn toàn 5,8 gam alkane X thu được 8,96 lít CO2 ở điều kiện tiêu chuẩn. X là chất nào?',
'Propane',
'Butane',
'Pentane',
'Hexane',
'Butane',
'Số mol CO2 là 0,4. Với alkane CnH2n+2, m = (0,4/n)(14n + 2) = 5,8 nên n = 4.');

CALL seed_question_bank_mcq('Hóa học 11', 'Alkane', @chem11_id, @c11_hydrocarbon_id, @t11_alkane_id, 'HARD',
'Số đồng phân cấu tạo alkane ứng với công thức C5H12 là bao nhiêu?',
'2',
'3',
'4',
'5',
'3',
'C5H12 có n-pentane, isopentane và neopentane.');

CALL seed_question_bank_mcq('Hóa học 11', 'Alkane', @chem11_id, @c11_hydrocarbon_id, @t11_alkane_id, 'HARD',
'Trong phản ứng chlorination methane dưới ánh sáng, bước khơi mào chủ yếu là quá trình nào?',
'CH4 phân li thành CH3• và H•',
'Cl2 phân cắt đồng li tạo 2Cl•',
'CH3Cl phân li thành CH3• và Cl•',
'HCl phân li thành H• và Cl•',
'Cl2 phân cắt đồng li tạo 2Cl•',
'Ánh sáng làm liên kết Cl-Cl phân cắt đồng li, tạo gốc chlorine mở đầu chuỗi phản ứng.');

CALL seed_question_bank_mcq('Hóa học 11', 'Alkane', @chem11_id, @c11_hydrocarbon_id, @t11_alkane_id, 'HARD',
'Khi cho 2-methylpropane phản ứng thế với Cl2 theo tỉ lệ mol 1:1 dưới ánh sáng, số sản phẩm monochloro cấu tạo có thể tạo thành là bao nhiêu?',
'1',
'2',
'3',
'4',
'2',
'2-methylpropane có hydrogen bậc một và bậc ba không tương đương, nên tạo hai dẫn xuất monochloro.');

CALL seed_question_bank_mcq('Hóa học 11', 'Alkane', @chem11_id, @c11_hydrocarbon_id, @t11_alkane_id, 'HARD',
'Nhận định nào đúng về phản ứng của alkane với dung dịch bromine ở điều kiện thường trong bóng tối?',
'Làm mất màu bromine nhanh do phản ứng cộng',
'Không làm mất màu bromine đáng kể',
'Tạo kết tủa trắng ngay lập tức',
'Tạo alcohol tương ứng',
'Không làm mất màu bromine đáng kể',
'Alkane khá trơ; phản ứng thế với halogen cần ánh sáng hoặc nhiệt, không cộng bromine như alkene.');

CALL seed_question_bank_mcq('Hóa học 11', 'Alkane', @chem11_id, @c11_hydrocarbon_id, @t11_alkane_id, 'HARD',
'Cracking hoàn toàn một alkane X thu được hỗn hợp chỉ gồm ethane và ethene theo tỉ lệ mol 1:1. X phù hợp nhất là chất nào?',
'Propane',
'Butane',
'Pentane',
'Hexane',
'Butane',
'Phương trình phù hợp: C4H10 -> C2H6 + C2H4.');

CALL seed_question_bank_mcq('Hóa học 11', 'Alkane', @chem11_id, @c11_hydrocarbon_id, @t11_alkane_id, 'HARD',
'Yếu tố nào làm nhiệt độ sôi của các alkane mạch hở cùng số carbon giảm khi so sánh các đồng phân?',
'Mạch càng phân nhánh',
'Khối lượng mol càng tăng',
'Số liên kết C-H càng tăng',
'Số liên kết sigma càng tăng',
'Mạch càng phân nhánh',
'Phân nhánh làm giảm diện tích tiếp xúc giữa phân tử, lực London yếu hơn nên nhiệt độ sôi thấp hơn.');

CALL seed_question_bank_mcq('Hóa học 11', 'Alkane', @chem11_id, @c11_hydrocarbon_id, @t11_alkane_id, 'HARD',
'Một hydrocarbon no mạch hở có 6 nguyên tử carbon. Số nguyên tử hydrogen trong phân tử là bao nhiêu?',
'10',
'12',
'14',
'16',
'14',
'Alkane mạch hở có công thức chung CnH2n+2. Với n = 6, số H là 14.');

CALL seed_question_bank_mcq('Hóa học 11', 'Alkane', @chem11_id, @c11_hydrocarbon_id, @t11_alkane_id, 'HARD',
'Phát biểu nào giải thích đúng vì sao alkane chủ yếu tham gia phản ứng thế thay vì phản ứng cộng?',
'Alkane có liên kết pi kém bền',
'Alkane chỉ có liên kết sigma C-C và C-H khá bền',
'Alkane luôn phân cực mạnh',
'Alkane chứa nhóm chức hydroxyl',
'Alkane chỉ có liên kết sigma C-C và C-H khá bền',
'Alkane no, không có liên kết pi nên không thuận lợi cho phản ứng cộng như alkene hoặc alkyne.');

-- Hóa học 11 - Nitrogen và sulfur - Sulfur/SO2.
CALL seed_question_bank_mcq('Hóa học 11', 'Sulfur và sulfur dioxide', @chem11_id, @c11_nitrogen_sulfur_id, @t11_sulfur_id, 'HARD',
'Trong phản ứng SO2 + Br2 + 2H2O -> H2SO4 + 2HBr, vai trò của SO2 là gì?',
'Chất oxi hóa',
'Chất khử',
'Chất xúc tác',
'Môi trường phản ứng',
'Chất khử',
'S trong SO2 có số oxi hóa +4, trong H2SO4 là +6 nên SO2 bị oxi hóa và đóng vai trò chất khử.');

CALL seed_question_bank_mcq('Hóa học 11', 'Sulfur và sulfur dioxide', @chem11_id, @c11_nitrogen_sulfur_id, @t11_sulfur_id, 'HARD',
'Khí SO2 làm mất màu dung dịch KMnO4 trong môi trường acid vì nguyên nhân nào?',
'SO2 có tính oxi hóa mạnh',
'SO2 có tính khử, khử MnO4- thành Mn2+',
'SO2 tạo kết tủa MnO2 trong acid',
'SO2 làm bay hơi KMnO4',
'SO2 có tính khử, khử MnO4- thành Mn2+',
'SO2 bị oxi hóa từ +4 lên +6, còn Mn trong MnO4- bị khử từ +7 xuống +2.');

CALL seed_question_bank_mcq('Hóa học 11', 'Sulfur và sulfur dioxide', @chem11_id, @c11_nitrogen_sulfur_id, @t11_sulfur_id, 'HARD',
'Dãy chất nào đều có thể bị SO2 khử trong điều kiện thích hợp?',
'H2S, NaOH',
'Br2, KMnO4',
'CO2, NaCl',
'HCl, H2SO4 loãng',
'Br2, KMnO4',
'SO2 thể hiện tính khử với các chất oxi hóa mạnh như bromine và permanganate.');

CALL seed_question_bank_mcq('Hóa học 11', 'Sulfur và sulfur dioxide', @chem11_id, @c11_nitrogen_sulfur_id, @t11_sulfur_id, 'HARD',
'Khi dẫn SO2 dư vào dung dịch NaOH, muối chủ yếu thu được là gì?',
'Na2SO3',
'NaHSO3',
'Na2SO4',
'NaHSO4',
'NaHSO3',
'SO2 dư phản ứng với kiềm tạo muối acid: SO2 + NaOH -> NaHSO3.');

CALL seed_question_bank_mcq('Hóa học 11', 'Sulfur và sulfur dioxide', @chem11_id, @c11_nitrogen_sulfur_id, @t11_sulfur_id, 'HARD',
'Lưu huỳnh thể hiện đồng thời tính oxi hóa và tính khử trong cặp phản ứng nào sau đây?',
'S + O2 và S + H2',
'S + NaOH và S + H2SO4 đặc',
'S + Fe và S + O2',
'S + HCl và S + NaCl',
'S + Fe và S + O2',
'Với Fe, S bị khử về -2 nên là chất oxi hóa; với O2, S bị oxi hóa lên +4 nên là chất khử.');

-- Hóa học 10 - Redox.
CALL seed_question_bank_mcq('Hóa học 10', 'Phản ứng oxi hóa - khử', @chem10_id, @c10_redox_id, @t10_redox_id, 'HARD',
'Trong phản ứng Fe2O3 + 3CO -> 2Fe + 3CO2, chất bị oxi hóa là chất nào?',
'Fe2O3',
'CO',
'Fe',
'CO2',
'CO',
'Carbon trong CO tăng số oxi hóa từ +2 lên +4 trong CO2 nên CO bị oxi hóa.');

CALL seed_question_bank_mcq('Hóa học 10', 'Phản ứng oxi hóa - khử', @chem10_id, @c10_redox_id, @t10_redox_id, 'HARD',
'Tổng hệ số nguyên tối giản của phản ứng Al + HNO3 -> Al(NO3)3 + NO + H2O là bao nhiêu?',
'7',
'9',
'11',
'13',
'9',
'Hệ số tối giản là Al + 4HNO3 -> Al(NO3)3 + NO + 2H2O.');

CALL seed_question_bank_mcq('Hóa học 10', 'Phản ứng oxi hóa - khử', @chem10_id, @c10_redox_id, @t10_redox_id, 'HARD',
'Trong phản ứng 2KMnO4 -> K2MnO4 + MnO2 + O2, nguyên tố manganese thay đổi số oxi hóa như thế nào?',
'Từ +7 xuống +6 và +4',
'Từ +6 lên +7 và xuống +4',
'Từ +4 lên +7',
'Không đổi số oxi hóa',
'Từ +7 xuống +6 và +4',
'Mn trong KMnO4 là +7; trong K2MnO4 là +6 và trong MnO2 là +4.');

-- Hóa học 12 - Ester.
CALL seed_question_bank_mcq('Hóa học 12', 'Ester', @chem12_id, @c12_ester_id, @t12_ester_id, 'HARD',
'Thủy phân hoàn toàn một ester đơn chức X trong NaOH thu được sodium acetate và ethanol. Công thức cấu tạo của X là gì?',
'CH3COOC2H5',
'C2H5COOCH3',
'HCOOC2H5',
'CH3COOCH3',
'CH3COOC2H5',
'Muối sodium acetate cho biết gốc acid là CH3COO-, alcohol là ethanol nên ester là CH3COOC2H5.');

CALL seed_question_bank_mcq('Hóa học 12', 'Ester', @chem12_id, @c12_ester_id, @t12_ester_id, 'HARD',
'Một ester no đơn chức mạch hở có công thức phân tử C4H8O2. Số đồng phân ester cấu tạo phù hợp là bao nhiêu?',
'2',
'3',
'4',
'5',
'4',
'Các ester gồm HCOOC3H7 có 2 đồng phân, CH3COOC2H5 và C2H5COOCH3: tổng 4.');

DROP PROCEDURE IF EXISTS seed_question_bank_mcq;
