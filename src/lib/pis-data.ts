import type { Prospect, OrgType, ScoreFactors } from './pis';

type Seed = [string, OrgType, string, string, string, string, string, string, ScoreFactors];

const GENERIC: Record<OrgType, Pick<Prospect, 'challenges' | 'trainingOpportunities' | 'fundingSources' | 'decisionMakers'>> = {
  'School District': {
    challenges: ['Wide learner variability across classrooms', 'Inconsistent accessibility practices', 'Teacher turnover and onboarding load'],
    trainingOpportunities: ['Universal Design for Learning PD', 'Neurodivergent learner supports', 'Instructional coaching'],
    fundingSources: ['Title II-A', 'IDEA Part B', 'ESSER carryover / local levy'],
    decisionMakers: ['Superintendent', 'Chief Academic Officer', 'Director of ESE'],
  },
  College: {
    challenges: ['Programs misaligned with employer demand', 'Low completion in career programs', 'Accreditation documentation burden'],
    trainingOpportunities: ['Backward-design curriculum mapping', 'Faculty assessment training', 'Stackable credential design'],
    fundingSources: ['Perkins V', 'State workforce capitalization grants', 'Institutional innovation funds'],
    decisionMakers: ['Provost', 'VP of Workforce Programs', 'Dean of CTE'],
  },
  Construction: {
    challenges: ['Skilled-labor shortage', 'Inconsistent onboarding and safety competency', 'Rising incident and insurance costs'],
    trainingOpportunities: ['Competency-based apprenticeship', 'Foreman safety leadership', 'OJT sign-off and tracking'],
    fundingSources: ['Operating training budget', 'State apprenticeship grants', 'Insurance safety credits'],
    decisionMakers: ['Owner / President', 'Director of Safety', 'HR / Training Manager'],
  },
  'Workforce Board': {
    challenges: ['Unclear pathways from training to jobs', 'Employer engagement gaps', 'Performance-measure pressure under WIOA'],
    trainingOpportunities: ['Career pathway mapping', 'Employer-validated competencies', 'Provider alignment workshops'],
    fundingSources: ['WIOA Title I', 'State workforce grants', 'Regional employer consortia'],
    decisionMakers: ['Executive Director', 'Director of Programs', 'Board Chair'],
  },
  'Training Company': {
    challenges: ['Slow course development cycles', 'Content quality inconsistency', 'Pressure to adopt AI responsibly'],
    trainingOpportunities: ['AI-assisted course design', 'Assessment automation', 'Instructional designer upskilling'],
    fundingSources: ['Operating budget', 'Client-funded development', 'Innovation budget'],
    decisionMakers: ['CEO / Founder', 'Head of Learning', 'Director of Content'],
  },
};

const f = (urgency: number, budget: number, strategicFit: number, easeOfAccess: number): ScoreFactors => ({
  urgency, budget, strategicFit, easeOfAccess,
});

// [name, type, industry, location, website, size, contactName, contactTitle, factors]
const SEEDS: Seed[] = [
  ['Orange County Public Schools (sample)', 'School District', 'K-12 Education', 'Orlando, FL', 'example-ocps.org', '200000 students', 'Dana Whitfield|Chief Academic Officer', 'dana.whitfield@example-ocps.org|(407) 555-0101', f(90, 95, 95, 70)],
  ['Polk County Schools (sample)', 'School District', 'K-12 Education', 'Bartow, FL', 'example-polk.org', '105000 students', 'Marcus Lee|Director of ESE', 'marcus.lee@example-polk.org|(863) 555-0102', f(80, 75, 90, 65)],
  ['Alachua County Schools (sample)', 'School District', 'K-12 Education', 'Gainesville, FL', 'example-alachua.org', '28000 students', 'Priya Nair|Assistant Superintendent', 'priya.nair@example-alachua.org|(352) 555-0103', f(60, 55, 80, 80)],
  ['Valencia-style State College (sample)', 'College', 'Higher Education', 'Orlando, FL', 'example-valencia.edu', '50000 students', 'Helen Ortiz|VP Workforce Programs', 'helen.ortiz@example-valencia.edu|(407) 555-0201', f(85, 85, 90, 60)],
  ['Gulf Coast Community College (sample)', 'College', 'Higher Education', 'Panama City, FL', 'example-gccc.edu', '9000 students', 'Tom Reyes|Dean of CTE', 'tom.reyes@example-gccc.edu|(850) 555-0202', f(70, 60, 85, 75)],
  ['Suncoast Technical College (sample)', 'College', 'Higher Education', 'Tampa, FL', 'example-suncoast.edu', '4500 students', 'Aisha Grant|Provost', 'aisha.grant@example-suncoast.edu|(813) 555-0203', f(55, 50, 70, 60)],
  ['CareerSource Central (sample)', 'Workforce Board', 'Workforce Development', 'Orlando, FL', 'example-careersource.org', '60 staff', 'Brian Kovacs|Executive Director', 'brian.kovacs@example-careersource.org|(407) 555-0301', f(85, 70, 95, 75)],
  ['Workforce Alliance of the Gulf (sample)', 'Workforce Board', 'Workforce Development', 'Tampa, FL', 'example-gulfworkforce.org', '45 staff', 'Lena Park|Director of Programs', 'lena.park@example-gulfworkforce.org|(813) 555-0302', f(65, 60, 85, 70)],
  ['Atlas Builders Group (sample)', 'Construction', 'Commercial Construction', 'Jacksonville, FL', 'example-atlasbuilders.com', '1200 employees', 'Carlos Mendez|Director of Safety', 'carlos.mendez@example-atlasbuilders.com|(904) 555-0401', f(90, 90, 95, 80)],
  ['Palmetto Electrical Contractors (sample)', 'Construction', 'Electrical Contracting', 'Miami, FL', 'example-palmettoelectric.com', '350 employees', 'Jen Alvarez|HR Manager', 'jen.alvarez@example-palmettoelectric.com|(305) 555-0402', f(75, 65, 85, 70)],
  ['Everglades Civil & Site Co. (sample)', 'Construction', 'Civil Construction', 'Fort Myers, FL', 'example-evergladescivil.com', '120 employees', 'Walt Dixon|Owner', 'walt.dixon@example-evergladescivil.com|(239) 555-0403', f(50, 40, 70, 85)],
  ['SkillBridge Learning (sample)', 'Training Company', 'Corporate Training', 'Tampa, FL', 'example-skillbridge.com', '80 employees', 'Nora Chen|Head of Learning', 'nora.chen@example-skillbridge.com|(813) 555-0501', f(80, 60, 90, 90)],
  ['Coastal Compliance Training (sample)', 'Training Company', 'Compliance Training', 'Sarasota, FL', 'example-coastalcompliance.com', '35 employees', 'Eli Brooks|Founder', 'eli.brooks@example-coastalcompliance.com|(941) 555-0502', f(60, 45, 75, 90)],
  ['Georgia Technical Skills Co. (sample)', 'Training Company', 'Technical Training', 'Atlanta, GA', 'example-gtsc.com', '150 employees', 'Ravi Shah|Director of Content', 'ravi.shah@example-gtsc.com|(404) 555-0503', f(40, 40, 55, 50)],
];

export const SEED_PROSPECTS: Prospect[] = SEEDS.map(([name, orgType, industry, location, website, size, c1, c2, factors], i) => {
  const [cName, cTitle] = c1.split('|');
  const [email, phone] = c2.split('|');
  const g = GENERIC[orgType];
  return {
    id: `p${i + 1}`,
    name, orgType, industry, location, website, size,
    contact: { name: cName, title: cTitle, email, phone },
    factors,
    summary: `${name} is a ${industry.toLowerCase()} organization in ${location} (${size}). Sample data for demonstration; verify before outreach.`,
    ...g,
  };
});

export const SEED_STAGES: Record<string, import('./pis').Stage> = {
  p1: 'Meeting Scheduled', p4: 'Proposal Sent', p7: 'Qualified', p9: 'Negotiation', p12: 'Closed Won',
  p2: 'Researched', p3: 'Identified', p8: 'Contacted', p10: 'Closed Lost',
};
