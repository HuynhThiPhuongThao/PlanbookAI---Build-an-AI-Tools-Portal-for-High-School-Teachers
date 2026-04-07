import { Question, Exercise, Exam, LessonPlan, StudentResult, PromptTemplate } from './types';

// Mock Questions Database
export const mockQuestions: Question[] = [
  {
    id: 'q1',
    subject: 'Chemistry',
    topic: 'Atomic Structure',
    difficulty: 'medium',
    type: 'multiple-choice',
    question: 'What is the atomic number of Carbon?',
    options: ['4', '6', '12', '14'],
    correctAnswer: 1,
    explanation: 'Carbon has 6 protons, which defines its atomic number.',
    createdBy: 'staff1',
    createdAt: '2026-02-15T10:00:00Z',
    tags: ['atoms', 'periodic-table', 'elements']
  },
  {
    id: 'q2',
    subject: 'Chemistry',
    topic: 'Chemical Bonding',
    difficulty: 'easy',
    type: 'multiple-choice',
    question: 'Which type of bond forms between two non-metals?',
    options: ['Ionic bond', 'Covalent bond', 'Metallic bond', 'Hydrogen bond'],
    correctAnswer: 1,
    explanation: 'Covalent bonds form when non-metal atoms share electrons.',
    createdBy: 'staff1',
    createdAt: '2026-02-16T10:00:00Z',
    tags: ['bonding', 'covalent', 'molecules']
  },
  {
    id: 'q3',
    subject: 'Chemistry',
    topic: 'Acids and Bases',
    difficulty: 'hard',
    type: 'multiple-choice',
    question: 'What is the pH of a solution with [H+] = 1 × 10^-5 M?',
    options: ['3', '5', '9', '11'],
    correctAnswer: 1,
    explanation: 'pH = -log[H+] = -log(10^-5) = 5',
    createdBy: 'staff1',
    createdAt: '2026-02-17T10:00:00Z',
    tags: ['acids', 'bases', 'pH', 'calculations']
  },
  {
    id: 'q4',
    subject: 'Chemistry',
    topic: 'Stoichiometry',
    difficulty: 'medium',
    type: 'multiple-choice',
    question: 'How many moles of O2 are needed to react with 2 moles of H2 in: 2H2 + O2 → 2H2O?',
    options: ['0.5 moles', '1 mole', '2 moles', '4 moles'],
    correctAnswer: 1,
    explanation: 'The balanced equation shows a 2:1 ratio of H2:O2, so 2 moles H2 needs 1 mole O2.',
    createdBy: 'teacher1',
    createdAt: '2026-02-18T10:00:00Z',
    tags: ['stoichiometry', 'moles', 'reactions']
  },
  {
    id: 'q5',
    subject: 'Chemistry',
    topic: 'Organic Chemistry',
    difficulty: 'easy',
    type: 'multiple-choice',
    question: 'What is the general formula for alkanes?',
    options: ['CnH2n', 'CnH2n+2', 'CnH2n-2', 'CnHn'],
    correctAnswer: 1,
    explanation: 'Alkanes are saturated hydrocarbons with the formula CnH2n+2.',
    createdBy: 'staff1',
    createdAt: '2026-02-19T10:00:00Z',
    tags: ['organic', 'alkanes', 'hydrocarbons']
  },
  {
    id: 'q6',
    subject: 'Chemistry',
    topic: 'Periodic Table',
    difficulty: 'easy',
    type: 'multiple-choice',
    question: 'Which element is in Group 17 (Halogens)?',
    options: ['Sodium', 'Chlorine', 'Argon', 'Calcium'],
    correctAnswer: 1,
    explanation: 'Chlorine is a halogen found in Group 17 of the periodic table.',
    createdBy: 'staff1',
    createdAt: '2026-02-20T10:00:00Z',
    tags: ['periodic-table', 'halogens', 'groups']
  },
  {
    id: 'q7',
    subject: 'Chemistry',
    topic: 'Redox Reactions',
    difficulty: 'hard',
    type: 'multiple-choice',
    question: 'In the reaction: Zn + Cu²⁺ → Zn²⁺ + Cu, which species is oxidized?',
    options: ['Zn', 'Cu²⁺', 'Zn²⁺', 'Cu'],
    correctAnswer: 0,
    explanation: 'Zn loses electrons (oxidation) to become Zn²⁺.',
    createdBy: 'teacher1',
    createdAt: '2026-02-21T10:00:00Z',
    tags: ['redox', 'oxidation', 'reduction', 'electrons']
  },
  {
    id: 'q8',
    subject: 'Chemistry',
    topic: 'Thermochemistry',
    difficulty: 'medium',
    type: 'multiple-choice',
    question: 'An exothermic reaction:',
    options: ['Absorbs heat', 'Releases heat', 'Has no heat change', 'Only occurs at high temperatures'],
    correctAnswer: 1,
    explanation: 'Exothermic reactions release heat to the surroundings.',
    createdBy: 'staff1',
    createdAt: '2026-02-22T10:00:00Z',
    tags: ['thermochemistry', 'exothermic', 'energy']
  }
];

// Mock Exercises
export const mockExercises: Exercise[] = [
  {
    id: 'ex1',
    title: 'Atomic Structure Practice',
    subject: 'Chemistry',
    topic: 'Atomic Structure',
    grade: 'Grade 10',
    questions: mockQuestions.slice(0, 3),
    createdBy: 'teacher1',
    createdAt: '2026-03-01T09:00:00Z'
  },
  {
    id: 'ex2',
    title: 'Chemical Bonding Exercises',
    subject: 'Chemistry',
    topic: 'Chemical Bonding',
    grade: 'Grade 11',
    questions: [mockQuestions[1], mockQuestions[3]],
    createdBy: 'teacher1',
    createdAt: '2026-03-02T09:00:00Z'
  }
];

// Mock Exams
export const mockExams: Exam[] = [
  {
    id: 'exam1',
    title: 'Chemistry Midterm Exam - Grade 10',
    subject: 'Chemistry',
    grade: 'Grade 10',
    duration: 90,
    totalMarks: 100,
    questions: mockQuestions.slice(0, 5),
    createdBy: 'teacher1',
    createdAt: '2026-02-28T14:00:00Z',
    versions: 2
  },
  {
    id: 'exam2',
    title: 'Organic Chemistry Quiz',
    subject: 'Chemistry',
    grade: 'Grade 11',
    duration: 45,
    totalMarks: 50,
    questions: mockQuestions.slice(4, 6),
    createdBy: 'teacher1',
    createdAt: '2026-03-03T14:00:00Z',
    versions: 1
  }
];

// Mock Lesson Plans
export const mockLessonPlans: LessonPlan[] = [
  {
    id: 'lp1',
    title: 'Introduction to Atomic Structure',
    subject: 'Chemistry',
    grade: 'Grade 10',
    duration: 45,
    objectives: [
      'Understand the basic structure of an atom',
      'Identify protons, neutrons, and electrons',
      'Calculate atomic number and mass number'
    ],
    materials: [
      'Periodic table charts',
      'Atomic model diagrams',
      'Whiteboard and markers',
      'Student worksheets'
    ],
    activities: [
      {
        time: '0-10 min',
        activity: 'Introduction & Review',
        description: 'Review previous knowledge about matter. Introduce the concept of atoms as building blocks.'
      },
      {
        time: '10-25 min',
        activity: 'Direct Instruction',
        description: 'Explain atomic structure using diagrams. Discuss protons, neutrons, electrons, and their properties.'
      },
      {
        time: '25-35 min',
        activity: 'Guided Practice',
        description: 'Work through examples calculating atomic number and mass number. Students practice with periodic table.'
      },
      {
        time: '35-45 min',
        activity: 'Independent Practice',
        description: 'Students complete worksheet problems individually. Review answers as a class.'
      }
    ],
    assessment: 'Exit ticket with 3 questions on atomic structure',
    homework: 'Complete worksheet problems 1-10 on atomic calculations',
    createdBy: 'teacher1',
    createdAt: '2026-02-25T08:00:00Z'
  },
  {
    id: 'lp2',
    title: 'Chemical Bonding: Ionic and Covalent',
    subject: 'Chemistry',
    grade: 'Grade 11',
    duration: 60,
    objectives: [
      'Distinguish between ionic and covalent bonding',
      'Predict bond type based on electronegativity difference',
      'Draw Lewis structures for simple molecules'
    ],
    materials: [
      'Electronegativity chart',
      'Molecular model kits',
      'Projector for demonstrations',
      'Practice worksheets'
    ],
    activities: [
      {
        time: '0-15 min',
        activity: 'Warm-up & Introduction',
        description: 'Quick review of electron configuration. Introduce concept of chemical bonding and why atoms bond.'
      },
      {
        time: '15-35 min',
        activity: 'Lecture & Demonstration',
        description: 'Explain ionic and covalent bonding mechanisms. Use molecular models to demonstrate bond formation.'
      },
      {
        time: '35-50 min',
        activity: 'Group Activity',
        description: 'Students work in pairs to build molecular models and draw Lewis structures for assigned compounds.'
      },
      {
        time: '50-60 min',
        activity: 'Wrap-up & Assessment',
        description: 'Groups present their molecules. Quick quiz on bond type prediction.'
      }
    ],
    assessment: 'In-class quiz and group presentation evaluation',
    homework: 'Draw Lewis structures for 8 molecules and identify bond types',
    createdBy: 'teacher1',
    createdAt: '2026-02-26T08:00:00Z'
  }
];

// Mock Student Results
export const mockStudentResults: StudentResult[] = [
  {
    id: 'r1',
    studentId: 's1',
    studentName: 'Nguyễn Văn An',
    examId: 'exam1',
    examTitle: 'Chemistry Midterm Exam - Grade 10',
    score: 85,
    totalMarks: 100,
    percentage: 85,
    submittedAt: '2026-03-01T10:30:00Z',
    gradedAt: '2026-03-01T14:00:00Z',
    answers: [
      { questionId: 'q1', studentAnswer: '1', correctAnswer: '1', isCorrect: true, marks: 20 },
      { questionId: 'q2', studentAnswer: '1', correctAnswer: '1', isCorrect: true, marks: 20 },
      { questionId: 'q3', studentAnswer: '0', correctAnswer: '1', isCorrect: false, marks: 0 },
      { questionId: 'q4', studentAnswer: '1', correctAnswer: '1', isCorrect: true, marks: 20 },
      { questionId: 'q5', studentAnswer: '1', correctAnswer: '1', isCorrect: true, marks: 20 }
    ]
  },
  {
    id: 'r2',
    studentId: 's2',
    studentName: 'Trần Thị Bình',
    examId: 'exam1',
    examTitle: 'Chemistry Midterm Exam - Grade 10',
    score: 95,
    totalMarks: 100,
    percentage: 95,
    submittedAt: '2026-03-01T10:25:00Z',
    gradedAt: '2026-03-01T14:00:00Z',
    answers: [
      { questionId: 'q1', studentAnswer: '1', correctAnswer: '1', isCorrect: true, marks: 20 },
      { questionId: 'q2', studentAnswer: '1', correctAnswer: '1', isCorrect: true, marks: 20 },
      { questionId: 'q3', studentAnswer: '1', correctAnswer: '1', isCorrect: true, marks: 20 },
      { questionId: 'q4', studentAnswer: '1', correctAnswer: '1', isCorrect: true, marks: 20 },
      { questionId: 'q5', studentAnswer: '0', correctAnswer: '1', isCorrect: false, marks: 5 }
    ]
  },
  {
    id: 'r3',
    studentId: 's3',
    studentName: 'Lê Minh Châu',
    examId: 'exam1',
    examTitle: 'Chemistry Midterm Exam - Grade 10',
    score: 72,
    totalMarks: 100,
    percentage: 72,
    submittedAt: '2026-03-01T10:35:00Z',
    gradedAt: '2026-03-01T14:00:00Z',
    answers: [
      { questionId: 'q1', studentAnswer: '1', correctAnswer: '1', isCorrect: true, marks: 20 },
      { questionId: 'q2', studentAnswer: '0', correctAnswer: '1', isCorrect: false, marks: 0 },
      { questionId: 'q3', studentAnswer: '2', correctAnswer: '1', isCorrect: false, marks: 0 },
      { questionId: 'q4', studentAnswer: '1', correctAnswer: '1', isCorrect: true, marks: 20 },
      { questionId: 'q5', studentAnswer: '1', correctAnswer: '1', isCorrect: true, marks: 20 }
    ]
  },
  {
    id: 'r4',
    studentId: 's4',
    studentName: 'Phạm Quốc Dũng',
    examId: 'exam1',
    examTitle: 'Chemistry Midterm Exam - Grade 10',
    score: 88,
    totalMarks: 100,
    percentage: 88,
    submittedAt: '2026-03-01T10:28:00Z',
    gradedAt: '2026-03-01T14:00:00Z',
    answers: [
      { questionId: 'q1', studentAnswer: '1', correctAnswer: '1', isCorrect: true, marks: 20 },
      { questionId: 'q2', studentAnswer: '1', correctAnswer: '1', isCorrect: true, marks: 20 },
      { questionId: 'q3', studentAnswer: '1', correctAnswer: '1', isCorrect: true, marks: 20 },
      { questionId: 'q4', studentAnswer: '0', correctAnswer: '1', isCorrect: false, marks: 8 },
      { questionId: 'q5', studentAnswer: '1', correctAnswer: '1', isCorrect: true, marks: 20 }
    ]
  },
  {
    id: 'r5',
    studentId: 's5',
    studentName: 'Hoàng Thu Hà',
    examId: 'exam1',
    examTitle: 'Chemistry Midterm Exam - Grade 10',
    score: 91,
    totalMarks: 100,
    percentage: 91,
    submittedAt: '2026-03-01T10:20:00Z',
    gradedAt: '2026-03-01T14:00:00Z',
    answers: [
      { questionId: 'q1', studentAnswer: '1', correctAnswer: '1', isCorrect: true, marks: 20 },
      { questionId: 'q2', studentAnswer: '1', correctAnswer: '1', isCorrect: true, marks: 20 },
      { questionId: 'q3', studentAnswer: '1', correctAnswer: '1', isCorrect: true, marks: 20 },
      { questionId: 'q4', studentAnswer: '1', correctAnswer: '1', isCorrect: true, marks: 20 },
      { questionId: 'q5', studentAnswer: '2', correctAnswer: '1', isCorrect: false, marks: 11 }
    ]
  }
];

// Mock Prompt Templates
export const mockPromptTemplates: PromptTemplate[] = [
  {
    id: 'pt1',
    name: 'Lesson Plan Generator',
    category: 'Lesson Planning',
    prompt: 'Create a detailed lesson plan for {subject} on the topic of {topic} for {grade} students. The lesson should be {duration} minutes long and include objectives, materials, activities, and assessment methods.',
    variables: ['subject', 'topic', 'grade', 'duration'],
    createdBy: 'staff1',
    createdAt: '2026-02-01T09:00:00Z'
  },
  {
    id: 'pt2',
    name: 'Multiple Choice Question Generator',
    category: 'Assessment',
    prompt: 'Generate {count} multiple choice questions for {subject} on the topic of {topic} at {difficulty} difficulty level. Include 4 options for each question, mark the correct answer, and provide brief explanations.',
    variables: ['count', 'subject', 'topic', 'difficulty'],
    createdBy: 'staff1',
    createdAt: '2026-02-01T09:00:00Z'
  },
  {
    id: 'pt3',
    name: 'Exercise Problem Creator',
    category: 'Practice',
    prompt: 'Create {count} practice problems for {subject} focusing on {topic}. Problems should be suitable for {grade} students and include solutions with step-by-step explanations.',
    variables: ['count', 'subject', 'topic', 'grade'],
    createdBy: 'staff1',
    createdAt: '2026-02-01T09:00:00Z'
  }
];

// Helper function to simulate AI generation
export const simulateAIGeneration = (template: PromptTemplate, variables: Record<string, string>): string => {
  let result = template.prompt;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(`{${key}}`, value);
  });
  return result;
};
