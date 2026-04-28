export const PROMPT_NAME_OPTIONS = [
    { value: 'generate_exercise', label: 'Sinh bài tập', type: 'exercise' },
    { value: 'generate_lesson_plan', label: 'Sinh giáo án', type: 'lesson_plan' },
    { value: 'exam_generation_template', label: 'Sinh đề thi', type: 'exam' },
    { value: 'ocr_extract_answers', label: 'Chấm điểm bằng OCR', type: 'ocr' },
];

export const PROMPT_TYPE_OPTIONS = [
    { value: 'exercise', label: 'Bài tập' },
    { value: 'lesson_plan', label: 'Giáo án' },
    { value: 'exam', label: 'Đề thi' },
    { value: 'ocr', label: 'Chấm điểm OCR' },
    { value: 'question_bank', label: 'Ngân hàng câu hỏi' },
];

const promptNameLabels = new Map(PROMPT_NAME_OPTIONS.map((option) => [option.value, option.label]));
const promptTypeLabels = new Map(PROMPT_TYPE_OPTIONS.map((option) => [option.value, option.label]));

const placeholderLabels: Record<string, string> = {
    difficulty: 'độ khó',
    duration_minutes: 'thời lượng',
    grade: 'khối lớp',
    number_of_questions: 'số câu hỏi',
    subject: 'môn học',
    topic: 'chủ đề',
};

const placeholderValues = Object.entries(placeholderLabels).reduce<Record<string, string>>((acc, [key, label]) => {
    acc[label] = key;
    return acc;
}, {});

const promptKeyLabels: Record<string, string> = {
    answer: 'Đáp án',
    constraints: 'Ràng buộc',
    content: 'Nội dung',
    context: 'Ngữ cảnh',
    correct_answer: 'Đáp án đúng',
    difficulty: 'Độ khó',
    difficulty_level: 'Độ khó',
    examples: 'Ví dụ',
    explanation: 'Giải thích',
    format: 'Định dạng',
    grade: 'Khối lớp',
    input: 'Đầu vào',
    instruction: 'Hướng dẫn',
    instructions: 'Hướng dẫn',
    objective: 'Mục tiêu',
    objectives: 'Mục tiêu',
    options: 'Lựa chọn',
    output: 'Đầu ra',
    output_format: 'Định dạng đầu ra',
    prompt: 'Lời nhắc',
    question: 'Câu hỏi',
    question_text: 'Nội dung câu hỏi',
    requirements: 'Yêu cầu',
    role: 'Vai trò',
    rules: 'Quy tắc',
    steps: 'Các bước',
    subject: 'Môn học',
    system: 'Vai trò hệ thống',
    tone: 'Giọng văn',
    topic: 'Chủ đề',
};

export function getPromptNameLabel(name: string) {
    return promptNameLabels.get(name) || 'Mẫu lời nhắc khác';
}

export function getPromptTypeLabel(type: string) {
    return promptTypeLabels.get(type) || 'Khác';
}

export function getPromptDefaultType(name: string) {
    return PROMPT_NAME_OPTIONS.find((option) => option.value === name)?.type || 'exercise';
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getPromptKeyLabel(key: string) {
    if (promptKeyLabels[key]) {
        return promptKeyLabels[key];
    }

    const normalized = key.replace(/[_-]+/g, ' ');
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function formatScalar(value: unknown) {
    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'boolean') {
        return value ? 'Có' : 'Không';
    }

    return String(value);
}

function renderPromptValue(value: unknown, indent = 0): string[] {
    const prefix = '  '.repeat(indent);

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return [`${prefix}-`];
        }

        return value.flatMap((item) => {
            if (Array.isArray(item) || isRecord(item)) {
                const childLines = renderPromptValue(item, indent + 1);
                const [firstLine, ...restLines] = childLines;

                return [
                    `${prefix}- ${firstLine.trimStart()}`,
                    ...restLines,
                ];
            }

            return [`${prefix}- ${formatScalar(item)}`];
        });
    }

    if (isRecord(value)) {
        return Object.entries(value).flatMap(([key, item]) => {
            const label = getPromptKeyLabel(key);

            if (Array.isArray(item) || isRecord(item)) {
                return [
                    `${prefix}${label}:`,
                    ...renderPromptValue(item, indent + 1),
                ];
            }

            return [`${prefix}${label}: ${formatScalar(item)}`.trimEnd()];
        });
    }

    return [`${prefix}${formatScalar(value)}`.trimEnd()];
}

function getResultSummary(promptName: string) {
    switch (promptName) {
        case 'generate_exercise':
            return 'Định dạng kết quả: Danh sách câu hỏi gồm nội dung câu hỏi, 4 lựa chọn và đáp án đúng.';
        case 'generate_lesson_plan':
            return 'Định dạng kết quả: Giáo án gồm tiêu đề, chủ đề, khối lớp, thời lượng, mục tiêu, hoạt động và đánh giá.';
        case 'exam_generation_template':
            return 'Định dạng kết quả: Đề thi gồm tiêu đề, danh sách câu hỏi, lựa chọn và đáp án đúng.';
        case 'ocr_extract_answers':
            return 'Định dạng kết quả: Danh sách đáp án đọc được từ bài làm.';
        default:
            return 'Định dạng kết quả: Dữ liệu có cấu trúc để hệ thống đọc được.';
    }
}

function replacePlaceholdersForDisplay(text: string) {
    return text.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (_, key: string) => {
        const label = placeholderLabels[key];
        return label ? `[${label}]` : `[${key.replace(/_/g, ' ')}]`;
    });
}

function replacePlaceholdersForSave(text: string) {
    return text.replace(/\[([^\]]+)\]/g, (match, label: string) => {
        const key = placeholderValues[String(label).trim().toLowerCase()];
        return key ? `{${key}}` : match;
    });
}

function stripTechnicalSchema(text: string, promptName: string) {
    const resultSummary = getResultSummary(promptName);

    return text
        .replace(/\n*RETURN ONLY VALID JSON:\s*[\s\S]*?(?=\n*IMPORTANT[:\n]|$)/gi, `\n\n${resultSummary}\n`)
        .replace(/\n*Tra ve dung cau truc du lieu:\s*[\s\S]*?(?=\n*(?:Chi tra ve|Luu y|IMPORTANT)|$)/gi, `\n\n${resultSummary}\n`)
        .replace(/\n*Yeu cau ky thuat cho AI:\s*[\s\S]*$/gi, `\n\n${resultSummary}`)
        .replace(/IMPORTANT:\s*Do NOT return text outside JSON\.?/gi, 'Lưu ý: Chỉ trả về kết quả đúng định dạng để hệ thống đọc được.')
        .replace(/Do NOT return text outside JSON\.?/gi, 'Không viết thêm nội dung bên ngoài kết quả.')
        .replace(/\bJSON\b/gi, 'định dạng dữ liệu');
}

function translateKnownPromptText(text: string) {
    return text
        .replace(/You are an AI assistant for teachers\./gi, 'Vai trò: Trợ lý AI hỗ trợ giáo viên.')
        .replace(
            /Generate EXACTLY \[số câu hỏi\] multiple choice questions about "\[chủ đề\]" for grade \[khối lớp\] with difficulty "\[độ khó\]"\./gi,
            'Hướng dẫn: Tạo đúng [số câu hỏi] câu hỏi trắc nghiệm về [chủ đề] cho khối [khối lớp], mức độ [độ khó].',
        )
        .replace(
            /Create a lesson plan for topic "\[chủ đề\]", grade \[khối lớp\], duration \[thời lượng\] minutes\./gi,
            'Hướng dẫn: Tạo giáo án cho chủ đề [chủ đề], khối [khối lớp], thời lượng [thời lượng] phút.',
        )
        .replace(/STRICT RULES:/gi, 'Quy tắc bắt buộc:')
        .replace(/Follow Vietnamese school teaching style/gi, 'Theo phong cách dạy học ở trường phổ thông Việt Nam')
        .replace(/Total time of all activities must equal \[thời lượng\] minutes/gi, 'Tổng thời gian các hoạt động phải bằng [thời lượng] phút')
        .replace(/activities\.time must be a NUMBER in minutes/gi, 'Thời gian từng hoạt động phải là số phút')
        .replace(/IMPORTANT:/gi, 'Lưu ý:');
}

function normalizeDisplaySpacing(text: string) {
    const withoutDuplicateResultLines = text
        .split('\n')
        .filter((line, index, lines) => {
            const normalizedLine = line.trim().toLowerCase();

            if (!normalizedLine.startsWith('dinh dang ket qua:')) {
                return true;
            }

            return lines.findIndex((item) => item.trim().toLowerCase() === normalizedLine) === index;
        })
        .join('\n');

    return withoutDuplicateResultLines
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

export function formatPromptContentForDisplay(content: string, promptName = '') {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
        return '';
    }

    try {
        const parsedContent = JSON.parse(trimmedContent);
        const renderedContent = renderPromptValue(parsedContent).join('\n').trim();

        return renderedContent || trimmedContent;
    } catch {
        const withReadablePlaceholders = replacePlaceholdersForDisplay(trimmedContent);
        const withoutSchema = stripTechnicalSchema(withReadablePlaceholders, promptName);
        const translatedContent = translateKnownPromptText(withoutSchema);

        return normalizeDisplaySpacing(translatedContent);
    }
}

function getTechnicalSchema(promptName: string) {
    switch (promptName) {
        case 'generate_exercise':
            return [
                'Yeu cau ky thuat cho AI:',
                'Tra ve dung cau truc du lieu:',
                '{',
                '  "questions": [',
                '    {',
                '      "question": "string",',
                '      "options": ["string", "string", "string", "string"],',
                '      "correctAnswer": "A"',
                '    }',
                '  ]',
                '}',
                'Chi tra ve dung cau truc tren, khong viet them noi dung ben ngoai.',
            ].join('\n');
        case 'generate_lesson_plan':
            return [
                'Yeu cau ky thuat cho AI:',
                'Tra ve dung cau truc du lieu:',
                '{',
                '  "title": "string",',
                '  "topic": "string",',
                '  "grade": "string",',
                '  "durationMinutes": 45,',
                '  "objectives": ["string"],',
                '  "activities": [',
                '    { "time": 5, "activity": "string" }',
                '  ],',
                '  "assessment": "string"',
                '}',
                'activities.time phai la so phut.',
                'Chi tra ve dung cau truc tren, khong viet them noi dung ben ngoai.',
            ].join('\n');
        default:
            return '';
    }
}

export function preparePromptContentForSave(promptName: string, displayContent: string) {
    const normalizedContent = replacePlaceholdersForSave(displayContent.trim());

    if (!normalizedContent) {
        return '';
    }

    if (/RETURN ONLY VALID JSON|Tra ve dung cau truc du lieu|Yeu cau ky thuat cho AI/i.test(normalizedContent)) {
        return normalizedContent;
    }

    const technicalSchema = getTechnicalSchema(promptName);

    return technicalSchema ? `${normalizedContent}\n\n${technicalSchema}` : normalizedContent;
}
