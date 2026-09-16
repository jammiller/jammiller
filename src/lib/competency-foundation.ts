export type CompetencyDomain = 'Safety' | 'Technical' | 'Quality' | 'Productivity' | 'Leadership' | 'Professional Behaviors';

export interface Competency {
  id: string;
  title: string;
  domain: CompetencyDomain;
  description: string;
  proficiencyLevel: number;
  industry: string;
  knowledge: string[];
  skills: string[];
  experience: string[];
  behaviors: string[];
  tasks: string[];
  evidence: string[];
}

export interface RoleRequirement {
  competencyId: string;
  level: number;
}

export interface CompetencyRole {
  id: string;
  title: string;
  occupation: string;
  requirements: RoleRequirement[];
}

export interface WorkerCompetency {
  competencyId: string;
  level: number;
  verified: boolean;
  evidenceCount: number;
}

export interface WorkerProfile {
  id: string;
  name: string;
  role: string;
  competencies: WorkerCompetency[];
}

export const competencies: Competency[] = [
  {
    id: 'COMP-001', title: 'Hazard Recognition', domain: 'Safety', industry: 'Construction', proficiencyLevel: 4,
    description: 'Identify existing and predictable hazards and take appropriate action before work begins.',
    knowledge: ['OSHA hazard categories', 'Site-specific safety plans'], skills: ['Identify hazards', 'Select controls'],
    experience: ['Participates in pre-task planning'], behaviors: ['Stops work when conditions change'],
    tasks: ['Complete a job hazard analysis', 'Escalate uncontrolled hazards'], evidence: ['Supervisor observation', 'Practical assessment'],
  },
  {
    id: 'COMP-002', title: 'Blueprint Reading', domain: 'Technical', industry: 'Construction', proficiencyLevel: 3,
    description: 'Interpret plans, sections, dimensions, symbols, and specifications to execute work correctly.',
    knowledge: ['Drawing conventions', 'Scale and dimensions'], skills: ['Read floor plans', 'Verify dimensions'],
    experience: ['Uses plans during layout'], behaviors: ['Clarifies conflicts before work proceeds'],
    tasks: ['Interpret a floor plan', 'Read a section detail', 'Verify dimensions'], evidence: ['Plan-reading assessment', 'Field observation'],
  },
  {
    id: 'COMP-003', title: 'Personal Protective Equipment', domain: 'Safety', industry: 'Construction', proficiencyLevel: 3,
    description: 'Select, inspect, use, and maintain PPE appropriate to the task and work conditions.',
    knowledge: ['PPE limitations', 'Inspection requirements'], skills: ['Select PPE', 'Inspect fall-protection equipment'],
    experience: ['Uses PPE in active work areas'], behaviors: ['Corrects unsafe PPE use'],
    tasks: ['Inspect PPE', 'Fit and use task-specific protection'], evidence: ['Training completion', 'Supervisor validation'],
  },
  {
    id: 'COMP-004', title: 'Work Planning', domain: 'Leadership', industry: 'Construction', proficiencyLevel: 4,
    description: 'Sequence work, resources, risks, and crew assignments to deliver safe, reliable production.',
    knowledge: ['Look-ahead planning', 'Constraint removal'], skills: ['Plan work packages', 'Coordinate trade interfaces'],
    experience: ['Leads daily planning'], behaviors: ['Communicates changes early'],
    tasks: ['Build a daily work plan', 'Run a pre-task briefing'], evidence: ['Project portfolio', 'Supervisor observation'],
  },
  {
    id: 'COMP-005', title: 'Crew Communication', domain: 'Professional Behaviors', industry: 'Construction', proficiencyLevel: 3,
    description: 'Communicate work expectations, hazards, changes, and handoffs clearly across the crew.',
    knowledge: ['Closed-loop communication', 'Escalation paths'], skills: ['Deliver a briefing', 'Confirm understanding'],
    experience: ['Coordinates work with adjacent crews'], behaviors: ['Raises concerns respectfully'],
    tasks: ['Conduct a toolbox talk', 'Document a work handoff'], evidence: ['Observation checklist', 'Peer feedback'],
  },
];

export const roles: CompetencyRole[] = [
  { id: 'ROLE-CARP-1', title: 'Carpenter I', occupation: 'Carpenter', requirements: [{ competencyId: 'COMP-001', level: 2 }, { competencyId: 'COMP-002', level: 2 }, { competencyId: 'COMP-003', level: 2 }, { competencyId: 'COMP-005', level: 2 }] },
  { id: 'ROLE-CARP-2', title: 'Carpenter II', occupation: 'Carpenter', requirements: [{ competencyId: 'COMP-001', level: 3 }, { competencyId: 'COMP-002', level: 3 }, { competencyId: 'COMP-003', level: 3 }, { competencyId: 'COMP-005', level: 3 }] },
  { id: 'ROLE-FOREMAN', title: 'Foreman', occupation: 'Construction Supervisor', requirements: [{ competencyId: 'COMP-001', level: 4 }, { competencyId: 'COMP-004', level: 4 }, { competencyId: 'COMP-005', level: 4 }] },
];

export const workers: WorkerProfile[] = [
  { id: 'WORKER-JC', name: 'James Carter', role: 'Carpenter II', competencies: [{ competencyId: 'COMP-001', level: 4, verified: true, evidenceCount: 4 }, { competencyId: 'COMP-002', level: 3, verified: true, evidenceCount: 3 }, { competencyId: 'COMP-003', level: 3, verified: true, evidenceCount: 2 }, { competencyId: 'COMP-005', level: 2, verified: false, evidenceCount: 1 }] },
];
