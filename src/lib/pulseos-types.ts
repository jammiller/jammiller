export type UnitStatus = 'draft' | 'in_review' | 'published' | 'archived';

export interface Stage1 {
  big_ideas: string[];
  understandings: string[];
  essential_questions: string[];
  knowledge_skills: string[];
  standards: string[];
}

export interface Stage2 {
  performance_tasks: string[];
  summative_assessments: string[];
  formative_checks: string[];
  rubrics: string[];
}

export interface Stage3 {
  learning_experiences: string[];
  sequence: string[];
  resources: string[];
  differentiation_notes: string;
}

export interface UbDUnit {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  stage1: Stage1;
  stage2: Stage2;
  stage3: Stage3;
  status: UnitStatus;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  grade_band: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  program_id: string;
  title: string;
  description: string | null;
  created_at: string;
}

export interface Lesson {
  id: string;
  unit_id: string;
  title: string;
  objectives: string[];
  essential_question: string | null;
  plan: string[];
  resources: string[];
  created_at: string;
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'open_response' | 'true_false';
  question: string;
  options?: string[];
  correct_answer?: string;
  points: number;
}

export interface Assessment {
  id: string;
  unit_id: string;
  lesson_id: string | null;
  type: 'summative' | 'formative' | 'performance';
  title: string;
  description: string | null;
  questions: AssessmentQuestion[];
  rubric: string[];
  created_at: string;
}

export interface AssessmentSubmission {
  id: string;
  assessment_id: string;
  respondent_name: string;
  answers: Record<string, string>;
  score: number | null;
  submitted_at: string;
}

export interface AnalyticsEvent {
  id: string;
  unit_id: string | null;
  lesson_id: string | null;
  assessment_id: string | null;
  event_type: string;
  value: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const emptyStage1: Stage1 = {
  big_ideas: [],
  understandings: [],
  essential_questions: [],
  knowledge_skills: [],
  standards: [],
};

export const emptyStage2: Stage2 = {
  performance_tasks: [],
  summative_assessments: [],
  formative_checks: [],
  rubrics: [],
};

export const emptyStage3: Stage3 = {
  learning_experiences: [],
  sequence: [],
  resources: [],
  differentiation_notes: '',
};

export function ubdCompleteness(unit: UbDUnit): { stage: number; total: number; details: string[] } {
  const details: string[] = [];
  let stage = 0;

  const s1Filled = unit.stage1.big_ideas.length > 0 || unit.stage1.understandings.length > 0 || unit.stage1.essential_questions.length > 0;
  const s2Filled = unit.stage2.performance_tasks.length > 0 || unit.stage2.summative_assessments.length > 0 || unit.stage2.formative_checks.length > 0;
  const s3Filled = unit.stage3.learning_experiences.length > 0 || unit.stage3.sequence.length > 0;

  if (s1Filled) stage = 1; else details.push('Stage 1 (Desired Results) is empty');
  if (s2Filled) stage = 2; else if (s1Filled) details.push('Stage 2 (Evidence) is empty');
  if (s3Filled) stage = 3; else if (s2Filled) details.push('Stage 3 (Learning Plan) is empty');

  if (!s1Filled && unit.stage1.essential_questions.length === 0) details.push('No essential questions defined');
  if (!s2Filled && unit.stage2.rubrics.length === 0) details.push('No rubrics defined');
  if (!s3Filled && !unit.stage3.differentiation_notes) details.push('No differentiation notes');

  return { stage, total: 3, details };
}
