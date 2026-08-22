export type TeachFlowStudent = {
  id: string;
  name: string;
  initials: string;
  streak_note: string;
  sort_order: number;
};

export type TeachFlowGrade = {
  id: string;
  student_name: string;
  description: string;
  score: string;
  confidence: string;
  note: string;
  status: 'pending' | 'graded';
};

export type TeachFlowNote = {
  id: string;
  title: string;
  body: string;
  note_type: 'lesson' | 'rubric' | 'feedback';
};

export const teachflowStudents: TeachFlowStudent[] = [
  { id: '0ffd352a-5c99-4e41-b46c-4d8b162d3b8f', name: 'Priya N.', initials: 'PN', streak_note: '6-day streak', sort_order: 0 },
  { id: 'f1fcec1c-01ed-4488-93ac-1afbef383dbd', name: 'Marcus D.', initials: 'MD', streak_note: 'perfect month', sort_order: 1 },
  { id: 'da810cc8-2ae2-49cf-bcc9-1e1edacb28e3', name: 'Jordan T.', initials: 'JT', streak_note: '2nd absence, unexplained', sort_order: 2 },
  { id: '31afb583-59ac-4c19-9717-bbb31c6a4e53', name: 'Elena R.', initials: 'ER', streak_note: 'perfect month', sort_order: 3 },
  { id: 'c2e23b6c-5ce4-400c-acfb-ba3475e66e50', name: 'Sam K.', initials: 'SK', streak_note: '3rd late this week', sort_order: 4 },
  { id: 'bc3a88a0-2cbe-4bdc-ad8a-a0aa309b92ba', name: 'Aisha B.', initials: 'AB', streak_note: '12-day streak', sort_order: 5 },
  { id: '6d5c183b-c419-4a82-9834-9568fcb724f2', name: 'Noah P.', initials: 'NP', streak_note: 'perfect month', sort_order: 6 },
  { id: 'b8bfa011-eca3-4524-a78e-2fcfc288ba2c', name: 'Grace L.', initials: 'GL', streak_note: 'not yet marked', sort_order: 7 },
];

export const teachflowGrades: TeachFlowGrade[] = [
  { id: '02f3eeb4-7ff7-450a-84b0-501657d4eaba', student_name: 'Priya N.', description: 'Quiz 4 — Cellular Respiration, short answer', score: '8.5/10', confidence: 'high', note: 'Suggested note: "Clear on glycolysis, missing detail on the electron transport chain — see Q3."', status: 'pending' },
  { id: '59e9cf06-c2ef-4ce1-9ab4-c6c18a22e60d', student_name: 'Marcus D.', description: 'Quiz 4 — Cellular Respiration, short answer', score: '6/10', confidence: 'medium', note: 'Suggested note: "Answer partially matches a classmate\'s phrasing on Q2 — worth a quick look before returning."', status: 'pending' },
  { id: 'bd4ab370-e0c0-4599-87d9-62cede838730', student_name: 'Elena R.', description: 'Quiz 4 — Cellular Respiration, short answer', score: '9.5/10', confidence: 'high', note: 'Suggested note: "Strong, complete answer across all three parts."', status: 'pending' },
  { id: 'a2bff172-00ed-4bc5-be1e-bc0bdccb73fc', student_name: 'Diego F.', description: 'Quiz 4 — Cellular Respiration, short answer', score: '7/10', confidence: 'edited by you', note: '', status: 'graded' },
];

export const teachflowNotes: TeachFlowNote[] = [
  {
    id: '61273dc8-9fc3-418b-b337-6931442a56bf',
    title: 'Today — Cellular Respiration',
    body: 'Glycolysis → pyruvate → Krebs cycle → electron transport chain.\nEmphasize: where ATP is actually produced at each stage.\nDemo tomorrow: yeast + sugar, watch the balloon inflate (CO₂).',
    note_type: 'lesson',
  },
  {
    id: '979125a4-7e80-4e21-9309-7fa5811d6ac5',
    title: 'Cellular Respiration — Short Answer Rubric',
    body: 'Criteria & Points (10 total):\n\n1. Identifies all stages (3 pts)\n- Glycolysis, pyruvate oxidation, Krebs cycle, ETC\n- 3 pts: all four named correctly\n- 2 pts: three named\n- 1 pt:  one to two named\n\n2. Explains ATP location (4 pts)\n- Glycolysis (cytoplasm): 2 ATP\n- Krebs (mitochondrial matrix): 2 ATP (GTP)\n- ETC (inner membrane): ~28-34 ATP\n- Full 4 pts only if location AND yield are correct\n\n3. Role of oxygen (3 pts)\n- Final electron acceptor in ETC (2 pts)\n- Explains why without it the chain stalls (1 pt)',
    note_type: 'rubric',
  },
  {
    id: '99ee2143-91f5-4fe0-98bb-4c7e3e737d20',
    title: 'Feedback Bank — Common Comments',
    body: 'Quick-insert comments (tap to add to a student\'s returned work):\n\nStrengths:\n- "Clear, well-structured answer — good use of terminology."\n- "Strong diagram, correctly labeled each stage."\n- "You explained the why, not just the what."\n\nGrowth areas:\n- "Review where ATP is produced — check ETC vs glycolysis."\n- "Add the specific enzyme name to strengthen your answer."\n- "Connect the stage to its location in the cell."\n\nEncouragement:\n- "You\'re close — the concept is there, the detail needs tightening."\n- "Great progress from last quiz — keep pushing on the mechanism."',
    note_type: 'feedback',
  },
];
