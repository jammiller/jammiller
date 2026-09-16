export type CompetencyDomain = 'Safety' | 'Technical' | 'Quality' | 'Productivity' | 'Leadership' | 'Professional Behaviors';

export interface Competency {
  id: string; title: string; domain: CompetencyDomain; description: string; proficiencyLevel: number; industry: string;
  knowledge: string[]; skills: string[]; experience: string[]; behaviors: string[]; tasks: string[]; evidence: string[];
}
export interface RoleRequirement { competencyId: string; level: number; }
export interface CompetencyRole { id: string; title: string; occupation: string; requirements: RoleRequirement[]; }
export interface WorkerCompetency { competencyId: string; level: number; verified: boolean; evidenceCount: number; }
export interface WorkerProfile { id: string; name: string; role: string; competencies: WorkerCompetency[]; }

const competency = (id: string, title: string, domain: CompetencyDomain, description: string, knowledge: string[], skills: string[], tasks: string[]): Competency => ({
  id, title, domain, description, proficiencyLevel: 3, industry: 'Construction', knowledge, skills,
  experience: ['Applies this competency during supervised field work'], behaviors: ['Escalates unsafe conditions and deviations from plan'], tasks,
  evidence: ['Knowledge assessment', 'Practical demonstration', 'Supervisor observation'],
});

// Construction v1 accelerator — competency-first, evidence-backed, and reusable across roles.
export const competencies: Competency[] = [
  competency('COMP-001', 'Hazard Recognition', 'Safety', 'Identify existing and predictable hazards and take action before work begins.', ['OSHA hazard categories', 'Site-specific safety plans'], ['Identify hazards', 'Select controls'], ['Complete a job hazard analysis', 'Escalate uncontrolled hazards']),
  competency('COMP-002', 'Personal Protective Equipment', 'Safety', 'Select, inspect, use, and maintain PPE appropriate to the task.', ['PPE limitations', 'Inspection requirements'], ['Select PPE', 'Inspect equipment'], ['Inspect PPE', 'Fit task-specific protection']),
  competency('COMP-003', 'Fall Protection', 'Safety', 'Plan and perform elevated work using compliant fall-protection systems.', ['Fall-protection hierarchy', 'Anchor requirements'], ['Inspect harnesses', 'Connect fall arrest'], ['Inspect a system', 'Plan elevated work']),
  competency('COMP-004', 'Scaffold Safety', 'Safety', 'Identify scaffold hazards and perform work safely on supported scaffolds.', ['Scaffold components', 'Access requirements'], ['Inspect scaffold tags', 'Use safe access'], ['Inspect scaffold condition', 'Report defects']),
  competency('COMP-005', 'Excavation Safety', 'Safety', 'Recognize excavation hazards and apply protective-system requirements.', ['Soil hazards', 'Protective systems'], ['Inspect excavations', 'Control access'], ['Complete excavation inspection', 'Escalate changing conditions']),
  competency('COMP-006', 'Confined Space Safety', 'Safety', 'Follow permit, atmospheric testing, and rescue procedures for confined spaces.', ['Permit requirements', 'Atmospheric hazards'], ['Use gas monitor', 'Control entry'], ['Review an entry permit', 'Respond to alarm']),
  competency('COMP-007', 'Electrical Safety', 'Safety', 'Recognize electrical hazards and apply lockout/tagout and safe-work practices.', ['Energy isolation', 'Arc-flash hazards'], ['Verify de-energization', 'Use GFCI protection'], ['Perform pre-use inspection', 'Report damaged cords']),
  competency('COMP-008', 'Emergency Response', 'Safety', 'Respond to incidents, alarms, and emergencies using site procedures.', ['Emergency action plan', 'Incident reporting'], ['Communicate emergency information', 'Use emergency equipment'], ['Report an incident', 'Participate in evacuation']),
  competency('COMP-009', 'Blueprint Reading', 'Technical', 'Interpret plans, sections, dimensions, symbols, and specifications to execute work correctly.', ['Drawing conventions', 'Scale and dimensions'], ['Read floor plans', 'Verify dimensions'], ['Interpret a floor plan', 'Read section detail']),
  competency('COMP-010', 'Layout and Measurement', 'Technical', 'Establish accurate lines, grades, elevations, and dimensions from project documents.', ['Measurement systems', 'Control points'], ['Use layout tools', 'Verify dimensions'], ['Set layout lines', 'Check elevation']),
  competency('COMP-011', 'Concrete Placement', 'Technical', 'Place, consolidate, finish, and cure concrete to project requirements.', ['Mix properties', 'Curing requirements'], ['Place concrete', 'Finish surfaces'], ['Prepare placement', 'Inspect finished work']),
  competency('COMP-012', 'Carpentry and Formwork', 'Technical', 'Build, install, and strip formwork and carpentry assemblies safely and accurately.', ['Material properties', 'Formwork loads'], ['Cut and fasten materials', 'Build forms'], ['Construct formwork', 'Verify alignment']),
  competency('COMP-013', 'Reinforcing Steel', 'Technical', 'Place, tie, inspect, and protect reinforcing steel per drawings and specifications.', ['Bar marks', 'Cover requirements'], ['Tie rebar', 'Read schedules'], ['Install reinforcement', 'Verify cover']),
  competency('COMP-014', 'Structural Steel and Rigging', 'Technical', 'Perform basic rigging, signaling, and steel-handling tasks safely.', ['Load charts', 'Rigging inspection'], ['Select rigging', 'Signal lifts'], ['Inspect rigging', 'Set a load']),
  competency('COMP-015', 'Electrical Installation', 'Technical', 'Install raceways, conductors, devices, and supports to drawings and code requirements.', ['Electrical drawings', 'Conductor protection'], ['Bend conduit', 'Terminate devices'], ['Install raceway', 'Verify circuit labeling']),
  competency('COMP-016', 'Mechanical and HVAC Installation', 'Technical', 'Install mechanical systems, supports, and components to coordinated drawings.', ['Mechanical plans', 'Equipment clearances'], ['Set equipment', 'Install ductwork'], ['Verify supports', 'Coordinate penetrations']),
  competency('COMP-017', 'Welding and Cutting', 'Technical', 'Perform or inspect hot-work activities using approved procedures and controls.', ['Hot-work permits', 'Weld symbols'], ['Set up hot work', 'Inspect welds'], ['Complete hot-work checklist', 'Identify weld defects']),
  competency('COMP-018', 'Equipment Operation', 'Technical', 'Operate mobile equipment within training, authorization, and site-control limits.', ['Equipment capacities', 'Travel hazards'], ['Conduct walk-around', 'Operate safely'], ['Complete pre-use inspection', 'Maintain exclusion zone']),
  competency('COMP-019', 'Quality Control', 'Quality', 'Inspect completed work against plans, specifications, and workmanship standards before it moves downstream.', ['Project specifications', 'Acceptance criteria'], ['Inspect work', 'Document deficiencies'], ['Verify work against plans', 'Create punch-list item']),
  competency('COMP-020', 'Inspection and Testing', 'Quality', 'Prepare work for inspection and verify required tests and records are complete.', ['Inspection test plans', 'Hold points'], ['Coordinate inspection', 'Record results'], ['Submit inspection request', 'Review test result']),
  competency('COMP-021', 'Punch List Resolution', 'Quality', 'Identify, assign, correct, and verify deficiencies through closeout.', ['Closeout requirements', 'Deficiency classification'], ['Document corrections', 'Verify completion'], ['Create punch item', 'Confirm correction']),
  competency('COMP-022', 'Document Control', 'Quality', 'Use current drawings, specifications, RFIs, and revisions at the point of work.', ['Revision control', 'RFI process'], ['Locate current documents', 'Track revisions'], ['Verify document currency', 'Escalate conflict']),
  competency('COMP-023', 'Production Planning', 'Productivity', 'Organize daily work to maintain flow, reduce waste, and meet production targets safely.', ['Production rates', 'Material staging'], ['Sequence work', 'Track output'], ['Stage materials', 'Report production against plan']),
  competency('COMP-024', 'Material Management', 'Productivity', 'Receive, store, stage, and protect materials to prevent loss and work interruption.', ['Storage requirements', 'Inventory controls'], ['Stage materials', 'Verify delivery'], ['Inspect delivery', 'Organize laydown area']),
  competency('COMP-025', 'Lean Workflow', 'Productivity', 'Remove constraints, reduce waste, and improve reliable handoffs between crews.', ['Constraints', 'Waste categories'], ['Identify constraints', 'Improve handoffs'], ['Run a constraint review', 'Plan handoff']),
  competency('COMP-026', 'Daily Reporting', 'Productivity', 'Record labor, quantities, conditions, issues, and progress accurately.', ['Daily report fields', 'Quantity tracking'], ['Capture field data', 'Summarize progress'], ['Complete daily report', 'Record quantities']),
  competency('COMP-027', 'Crew Supervision', 'Leadership', 'Direct crew work with clear expectations, coaching, and accountability.', ['Delegation', 'Crew capabilities'], ['Assign work', 'Coach performance'], ['Conduct crew huddle', 'Rebalance assignments']),
  competency('COMP-028', 'Work Planning', 'Leadership', 'Sequence work, resources, risks, and crew assignments for safe, reliable production.', ['Look-ahead planning', 'Constraint removal'], ['Plan work packages', 'Coordinate interfaces'], ['Build daily work plan', 'Run pre-task briefing']),
  competency('COMP-029', 'Risk Assessment', 'Leadership', 'Evaluate changing work conditions and select controls before exposure occurs.', ['Risk matrix', 'Control hierarchy'], ['Assess risk', 'Select controls'], ['Lead risk review', 'Update controls']),
  competency('COMP-030', 'Incident Investigation', 'Leadership', 'Collect facts, identify contributing conditions, and implement corrective actions.', ['Root-cause methods', 'Reporting requirements'], ['Interview witnesses', 'Document findings'], ['Preserve scene', 'Build corrective action']),
  competency('COMP-031', 'Coaching and Development', 'Leadership', 'Develop workers through observation, feedback, and evidence-based qualification.', ['Feedback principles', 'Competency levels'], ['Give feedback', 'Validate capability'], ['Document observation', 'Create development plan']),
  competency('COMP-032', 'Crew Communication', 'Professional Behaviors', 'Communicate work expectations, hazards, changes, and handoffs clearly across the crew.', ['Closed-loop communication', 'Escalation paths'], ['Deliver briefing', 'Confirm understanding'], ['Conduct toolbox talk', 'Document work handoff']),
  competency('COMP-033', 'Professional Accountability', 'Professional Behaviors', 'Own commitments, follow procedures, and communicate constraints early.', ['Site expectations', 'Reporting channels'], ['Manage commitments', 'Escalate issues'], ['Report constraint', 'Close assigned action']),
  competency('COMP-034', 'Team Collaboration', 'Professional Behaviors', 'Coordinate respectfully with other trades, supervisors, and project partners.', ['Trade interfaces', 'Respectful workplace expectations'], ['Coordinate handoffs', 'Resolve conflicts'], ['Plan shared work area', 'Confirm trade handoff']),
  competency('COMP-035', 'Continuous Improvement', 'Professional Behaviors', 'Use lessons learned and field observations to improve safety, quality, and production.', ['Lessons-learned process', 'Improvement cycles'], ['Identify improvement', 'Share learning'], ['Submit lesson learned', 'Test improved process']),
];

const requirements = (ids: string[], level: number): RoleRequirement[] => ids.map(competencyId => ({ competencyId, level }));
export const roles: CompetencyRole[] = [
  { id: 'ROLE-LABORER', title: 'Construction Laborer', occupation: 'Construction Laborer', requirements: requirements(['COMP-001', 'COMP-002', 'COMP-008', 'COMP-023', 'COMP-024', 'COMP-032', 'COMP-033'], 2) },
  { id: 'ROLE-CARP-1', title: 'Carpenter I', occupation: 'Carpenter', requirements: requirements(['COMP-001', 'COMP-002', 'COMP-003', 'COMP-009', 'COMP-010', 'COMP-012', 'COMP-019', 'COMP-023', 'COMP-032'], 2) },
  { id: 'ROLE-CARP-2', title: 'Carpenter II', occupation: 'Carpenter', requirements: requirements(['COMP-001', 'COMP-003', 'COMP-004', 'COMP-009', 'COMP-010', 'COMP-012', 'COMP-019', 'COMP-020', 'COMP-023', 'COMP-025', 'COMP-032'], 3) },
  { id: 'ROLE-ELECTRICIAN', title: 'Electrician', occupation: 'Electrician', requirements: requirements(['COMP-001', 'COMP-002', 'COMP-007', 'COMP-009', 'COMP-015', 'COMP-019', 'COMP-022', 'COMP-023', 'COMP-032'], 3) },
  { id: 'ROLE-OPERATOR', title: 'Equipment Operator', occupation: 'Heavy Equipment Operator', requirements: requirements(['COMP-001', 'COMP-002', 'COMP-005', 'COMP-018', 'COMP-023', 'COMP-024', 'COMP-026', 'COMP-032'], 3) },
  { id: 'ROLE-FOREMAN', title: 'Foreman', occupation: 'Construction Supervisor', requirements: requirements(['COMP-001', 'COMP-003', 'COMP-019', 'COMP-020', 'COMP-023', 'COMP-025', 'COMP-026', 'COMP-027', 'COMP-028', 'COMP-029', 'COMP-031', 'COMP-032', 'COMP-034'], 4) },
  { id: 'ROLE-SUPERINTENDENT', title: 'Superintendent', occupation: 'Construction Manager', requirements: requirements(['COMP-001', 'COMP-019', 'COMP-020', 'COMP-022', 'COMP-025', 'COMP-026', 'COMP-027', 'COMP-028', 'COMP-029', 'COMP-030', 'COMP-031', 'COMP-032', 'COMP-034', 'COMP-035'], 4) },
  { id: 'ROLE-SAFETY', title: 'Safety Manager', occupation: 'Construction Safety Manager', requirements: requirements(['COMP-001', 'COMP-002', 'COMP-003', 'COMP-004', 'COMP-005', 'COMP-006', 'COMP-007', 'COMP-008', 'COMP-020', 'COMP-029', 'COMP-030', 'COMP-031', 'COMP-032'], 4) },
];

export const workers: WorkerProfile[] = [
  { id: 'WORKER-JC', name: 'James Carter', role: 'Carpenter II', competencies: [{ competencyId: 'COMP-001', level: 4, verified: true, evidenceCount: 4 }, { competencyId: 'COMP-009', level: 3, verified: true, evidenceCount: 3 }, { competencyId: 'COMP-003', level: 3, verified: true, evidenceCount: 2 }, { competencyId: 'COMP-012', level: 3, verified: true, evidenceCount: 3 }, { competencyId: 'COMP-019', level: 2, verified: false, evidenceCount: 1 }] },
];
