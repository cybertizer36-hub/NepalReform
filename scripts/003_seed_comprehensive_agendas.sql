-- Insert comprehensive reform agendas from Nepal Manifesto
INSERT INTO public.agendas (title, description, problem_statement, key_points, category) VALUES

-- Anti-Corruption Reform
('Transform CIAA into Independent Anti-Corruption Force', 
'Restructure Nepal''s Commission for the Investigation of Abuse of Authority (CIAA) to become a truly independent and effective anti-corruption institution with enhanced powers and operational autonomy.',
'Nepal''s CIAA remains largely ineffective despite having strong legal powers on paper. The institution suffers from politicized leadership, lack of operational independence, narrowed jurisdiction, and weak institutional capacity. The Chief Commissioner wields sole discretionary power, making it vulnerable to political capture and selective enforcement.',
ARRAY[
  'Merit-based appointments through competitive examination by independent panel',
  'Constitutional budget allocation independent from Finance Ministry',
  'Integrated investigation-prosecution teams with enhanced powers',
  'Asset freezing authority and court-supervised procedures',
  'Fixed tenure protection (5-8 years) to prevent capture',
  'Jurisdiction over both corruption and improper conduct cases',
  'Performance accountability with quarterly public reports'
],
'Governance'),

-- Electoral Reform
('Fresh Elections with Strict Candidate Vetting',
'Conduct parliamentary dissolution under Article 76(7) followed by immediate elections within 180 days with comprehensive electoral reforms to restore public trust.',
'The current government has lost legitimacy and people no longer trust their representatives. The electoral system lacks proper candidate vetting and campaign finance transparency.',
ARRAY[
  'Ban candidates with proven criminal and corruption charges',
  'Real-time campaign finance transparency within 24 hours',
  'Ban corporate donations - only verified individual contributions',
  'Strict campaign spending limits with live monitoring',
  'Public finance dashboard for real-time tracking',
  'NOTA option - if "None of the Above" wins, re-election with new candidates',
  'Reform electoral laws to ensure implementation'
],
'Democracy'),

-- Decentralization
('Decentralize Power from Kathmandu to Provinces and Local Levels',
'Implement constitutional decentralization by enforcing existing Schedules 5-9 and transferring real power and resources to provinces and local governments.',
'Too much power concentrated in Kathmandu creates corruption bottlenecks. Every decision, budget, and project approval goes through the center, creating opportunities for bribes and delays.',
ARRAY[
  'Enforce constitutional Schedules 5-9 granting exclusive powers to provinces',
  '60% budget decentralization with ring-fenced sector transfers',
  '40% provincial tax retention from income tax, VAT, and resource royalties',
  '50 crore local approval authority for municipalities',
  'Provincial civil service recruitment and management',
  'Federal role limited to monitoring and national strategic projects'
],
'Governance'),

-- Wealth Disclosure
('Mandatory Wealth Disclosure for All Politicians',
'Implement comprehensive asset declaration system with public digital portal and automatic verification mechanisms for all politicians and candidates.',
'Politicians become millionaires on government salaries without clear explanation of wealth sources. Current disclosure systems lack transparency and verification.',
ARRAY[
  'Public digital portal with searchable, downloadable asset declarations',
  'Candidate disclosure at nomination with supporting documentation',
  'Automatic red-flag triggers for 50% annual wealth increases',
  'Annual wealth audits by Auditor-General for high-risk officials',
  'Multi-institutional verification across agencies',
  'Clear sanctions ladder: failure to file = disqualification'
],
'Transparency'),

-- Ministerial Qualifications
('Set Strict Qualifications for Government Ministers and MPs',
'Establish education and experience requirements for ministerial positions to ensure sectoral expertise and competent governance.',
'Ministers and MPs are often chosen through political bargaining rather than expertise, leading to governance failures and resource waste.',
ARRAY[
  'Bachelor''s degree and 3+ years relevant experience OR 10+ years sector experience',
  'Health Minister: Medical/public health background and management experience',
  'Finance Minister: Economics/finance education or banking experience',
  'IT Minister: Technology degree or 10+ years tech industry experience',
  'Minimum 5 years leadership experience in all cases',
  'Parliamentary justification required for all appointments'
],
'Governance'),

-- Constitutional Reform
('Constitutional Reform for Stable Governance',
'Implement immediate statutory reforms while building consensus for long-term constitutional amendments to create stable, accountable governance.',
'Nepal''s parliamentary system creates chronic instability, frequent coalition collapses, and allows unqualified party loyalists to become ministers without independent checks.',
ARRAY[
  'Independent Commission on Executive Appointments with public vetting',
  'Enhanced CIAA powers with independent prosecution wing',
  'Overseas voting implementation through Election Commission',
  'Direct Presidential Elections (long-term constitutional goal)',
  'Separation of Executive/Legislative roles',
  'Regional PR constituencies instead of single national list'
],
'Democracy'),

-- Digital Government
('Digitize All Government Services',
'Create comprehensive digital government infrastructure with interoperable systems, citizen-centric services, and robust cybersecurity measures.',
'Government systems remain fragmented despite progress in digitization. Lack of interoperability, inconsistent processes, and exclusion of technologically disadvantaged citizens limit effectiveness.',
ARRAY[
  'National Digital Framework with shared standards and decentralized ownership',
  'National E-Governance Service Center under Ministry of Communications & IT',
  'Unified One-Stop Portal (Nepal.gov.np) for all services',
  'Digital Public Infrastructure with national digital identity integration',
  'AI-Powered Citizen Support Center for 24/7 assistance',
  'Multi-language accessibility and offline kiosks for inclusion'
],
'Technology'),

-- Public Procurement
('Create Transparent Public Contracting',
'Establish comprehensive procurement reform with independent verification, revised awarding mechanisms, and real-time transparency.',
'Public procurement faces systemic challenges including unverified requirements, biased specifications, and flawed awarding systems that favor lowest bidders over quality.',
ARRAY[
  'Mandatory pre-procurement assessment and budget justification',
  'Independent bid document verification through third-party audits',
  'Mean-based awarding system instead of automatic lowest-bidder selection',
  'Upgraded PPMO e-GP system for all contracts above Rs. 500,000',
  'Real-time publication and public project tracking dashboard',
  'Performance bonds and automatic debarment for repeat violations'
],
'Transparency'),

-- Competition Policy
('Break Monopolies and Strengthen Consumer Protection',
'Implement comprehensive competition law enforcement and temporary import liberalization to increase market competition and protect consumers.',
'Monopolistic practices are widespread through unregulated associations. Transport and agricultural cartels control prices while weak enforcement allows continued exploitation of consumers.',
ARRAY[
  'Strengthen Competition Commission with investigation and penalty powers',
  'Temporarily ease import restrictions on monopolized goods',
  'Small Importer License for individuals (NPR 30,000/month duty-free)',
  'SME import permits up to NPR 9.5 million/year with simplified licensing',
  'Consumer courts in every district with penalty authority',
  'Mandatory Maximum Retail Price enforcement with heavy fines'
],
'Economic Policy'),

-- Transportation
('Reform Public Transportation with Smart Urban Planning',
'Transform public transport through dedicated infrastructure, massive Sajha Yatayat expansion, and integrated smart systems.',
'Traffic chaos, pollution, and unreliable public transport create daily hardship for citizens while undermining economic productivity.',
ARRAY[
  'Multi-modal dedicated lanes: electric buses, walking/cycling, private vehicles',
  'Fleet expansion target: 1 electric bus per 500-1,000 urban residents',
  'Integrated fare system with card-based and mobile app ticketing',
  'Real-time GPS tracking with public app showing live locations',
  'Mandatory city-wide consultations and GIS modeling for routes',
  'Performance-based operator payments linked to punctuality metrics'
],
'Infrastructure'),

-- Education Reform
('Transform Education for All Nepalis',
'Comprehensive education system transformation focusing on rural access, faculty development, skills-oriented curriculum, and quality assurance.',
'Rural areas lack quality education access due to cost and poor infrastructure. Private institutions exploit families while government schools suffer from unqualified teachers and outdated curricula.',
ARRAY[
  'Expand government school network with model construction in underserved areas',
  '5-year teacher requalification cycle with mandatory training',
  'Skills-oriented curriculum with TVET expansion and work-oriented subjects',
  'Digital learning infrastructure with National Education Digital Platform',
  'Independent Education Regulatory Authority for quality assurance',
  'Private school accountability with fee transparency and cross-subsidy enforcement'
],
'Education'),

-- Local Production
('Promote Local Production and Innovation',
'Establish Industrial Growth Fund and comprehensive support system to boost local manufacturing and reduce import dependency.',
'Nepal remains import-dependent with weak legal protections for farmers, high costs, bureaucracy, and unreliable energy sources discouraging local investment.',
ARRAY[
  'Industrial Growth Fund with 20% equity stakes and performance-based releases',
  'Conditional tax incentives linked to local content and employment targets',
  'Forward purchase agreements guaranteeing minimum prices for farmers',
  'University Innovation Fund for applied R&D projects',
  'Technology Transfer Offices in major universities',
  'Investment in vocational schools aligned with priority sectors'
],
'Economic Policy'),

-- Student Politics
('Transform Student Politics into Civic Education',
'Replace party-backed student unions with independent councils and comprehensive civic education programs.',
'Student unions act as extensions of national political parties, leading to intimidation, strikes, and property damage while graduates lack meaningful civic education.',
ARRAY[
  'Ban direct party affiliation of student unions through regulation amendments',
  'Independent student councils with elected representatives and gender quotas',
  'Graduated accountability system with community service for violations',
  'Strengthen National Youth Council for constructive engagement',
  'Comprehensive civic education from secondary through university levels',
  'Student-to-governance pathways with youth budget participation'
],
'Education'),

-- Security Services
('Merit-Based Appointments in Security Services',
'Implement merit-based promotions, routine health checks, and transparent accountability for all security personnel.',
'Security personnel are chosen for loyalty rather than capability, undermining professionalism. Lack of health checks and integrity monitoring risks public safety.',
ARRAY[
  'Merit-based promotions through Public Service Commission exams',
  'Transparent scorecards published online with performance reviews',
  'Maximum 3 years per post with rotation requirements',
  'Annual mental health checks and quarterly substance screening',
  'Whistleblower protection for officers reporting political interference',
  'Civilian oversight through Auditor-General and Parliamentary committees'
],
'Security'),

-- Foreign Investment
('Attract Foreign Investment with Strong Safeguards',
'Create transparent investment framework with strategic screening and binding technology transfer requirements.',
'Nepal loses high-value investors due to fragmented rules and bureaucratic rigidity while lacking safeguards for strategic resources and community interests.',
ARRAY[
  'Consolidated Investment Manual with clear rules and approval timelines',
  'Investment Screening & Safeguards Unit within Investment Board',
  'Resource protection framework with local processing priority',
  'Binding Technology Transfer & Localisation Plans for strategic sectors',
  'Mandatory local partnerships for major investments',
  'Community consent requirements and benefit-sharing mandates'
],
'Economic Policy'),

-- Proportional Representation
('Reform Proportional Representation for Democratic Accountability',
'Democratize PR nomination processes while maintaining constitutional inclusion requirements for marginalized communities.',
'Party leaders appoint PR representatives without voter input, weakening democratic accountability while constitutional inclusion remains necessary.',
ARRAY[
  'Mandatory open party primaries for PR nominations with member voting',
  'Regional PR constituencies instead of single national list',
  'Public reporting requirements and performance scorecards for all MPs',
  'Recall provisions applicable to both FPTP and PR representatives',
  'Preserve mandatory quotas for marginalized communities',
  'Strengthen Election Commission authority for accountability enforcement'
],
'Democracy'),

-- Civil Service Reform
('End Permanent Government Jobs Without Accountability',
'Implement performance-based civil service with citizen complaint systems and accountability mechanisms while maintaining due process protections.',
'Government employees operate without consequences, leading to complacency and poor service while citizens suffer from inefficient bureaucracy.',
ARRAY[
  'National Citizen Complaint Portal with case tracking and escalation',
  'Quarterly KPIs for all frontline roles with public scorecards',
  'Modernized recruitment emphasizing practical skills over MCQs',
  'Civil liability framework allowing personal lawsuits for negligence',
  'Three-strikes rule with due process and judicial oversight',
  'Strong protections against abuse with presumption of innocence'
],
'Governance'),

-- Bureaucratic Reform
('Ban Political Appointments in Bureaucracy',
'Establish examination-based selection for all senior positions with independent panels and performance contracts.',
'All top government positions are filled through political loyalty rather than merit, creating incompetent administration serving party interests instead of citizens.',
ARRAY[
  'Examination-based selection for CDO, Secretary, Director General positions',
  'Minimum 8 years relevant experience with proven performance record',
  'Independent selection panels with technical experts and public representatives',
  'Public scorecards with transparent qualification and selection rationale',
  'Fixed tenure protection against arbitrary removal',
  'Civil Service Act amendment removing political party-based trade unions'
],
'Governance'),

-- Judicial Independence
('Establish Judicial Independence',
'Create independent judicial appointment process with accountability framework and constitutional protections.',
'Judges appointed through political connections compromise court independence and undermine rule of law and public trust.',
ARRAY[
  'Independent Judicial Appointment Commission with retired judges and scholars',
  'Merit-based selection through examination, case analysis, and public interviews',
  'Lifetime prohibition on judges holding party membership',
  'Annual asset declarations and performance transparency',
  'Fixed tenure security with impeachment-level removal process',
  'Financial independence with direct Parliamentary budget allocation'
],
'Justice'),

-- Financial Accountability
('Implement Real-Time Financial Accountability',
'Create comprehensive digital ledger system with real-time transaction tracking and mandatory asset declarations.',
'Citizens have no visibility into government spending. Financial transactions happen without transparency, enabling massive corruption and waste.',
ARRAY[
  'Every government transaction published online within 24 hours',
  'Searchable public database with complete transaction details',
  'Monthly verified statements from all ministries and local governments',
  'Mandatory asset declarations for all senior officials published online',
  'Automatic red-flag system for unexplained wealth increases',
  'Mobile-friendly interface with SMS alerts for constituency spending'
],
'Transparency'),

-- Governance Transparency
('Mandate Transparency of Governance',
'Establish comprehensive transparency framework with live democratic processes and enhanced information access.',
'Government decisions made behind closed doors without public input or oversight. Citizens lack knowledge of representative discussions and decisions.',
ARRAY[
  'Broadcast all official meetings live except national security matters',
  '48-hour decision summaries with bullet-point explanations',
  '15-day information guarantee for all citizen requests',
  'Mandatory 30-day public comment periods for major policy changes',
  'Monthly town hall requirements in every constituency',
  'Multiple language access for key documents and processes'
],
'Transparency'),

-- Electoral Innovation
('Introduce "None of the Above" Voting Option',
'Implement NOTA option on all ballots with mandatory re-election trigger when NOTA wins plurality.',
'Citizens forced to choose between inadequate candidates have no way to reject all options, reducing democratic legitimacy and voter satisfaction.',
ARRAY[
  'NOTA option included in every election for every position',
  'Mandatory re-election with entirely new candidates if NOTA wins',
  'Original candidate disqualification forcing parties to field better options',
  'Transparent counting and publication of NOTA votes',
  'Voter education campaigns explaining NOTA purpose and impact',
  'Election Commission regulation implementation within 3 months'
],
'Democracy'),

-- Executive Term Limits
('Establish Prime Minister Term Limits',
'Constitutional amendment limiting Prime Minister service to maximum two terms to prevent power concentration and encourage democratic renewal.',
'Concentration of power in single leader for extended periods undermines democratic renewal and creates opportunities for institutional capture.',
ARRAY[
  'Two-term maximum (10 years total) for Prime Minister service',
  'Non-consecutive terms counted toward limit',
  'Mid-term calculation: more than half parliamentary term counts as full term',
  'Transitional provision applying from amendment enactment forward',
  'Constitutional amendment process requiring 2/3 Parliamentary majority',
  'Provincial assembly consultation for federal consensus building'
],
'Democracy'),

-- Property Management
('Reform Public Property Management',
'Establish transparent disposal system for seized vehicles with educational resource programs and revenue generation.',
'Thousands of seized vehicles deteriorate in police stations while educational institutions lack practical learning materials and public resources are wasted.',
ARRAY[
  '6-month reclaim deadline with automatic disposal entry',
  'Digital registry with photos, VIN numbers, and case status',
  'Technical school priority for non-roadworthy vehicles',
  'Public online auctions for roadworthy vehicles with transparent proceeds',
  'Student training projects for mechanical and EV retrofitting',
  'Treasury deposit of all proceeds to road safety fund'
],
'Governance'),

-- Healthcare Reform
('Transform Healthcare for All Nepalis',
'Comprehensive healthcare system transformation focusing on rural access, digital health infrastructure, and universal coverage.',
'Rural and marginalized communities face severe healthcare gaps due to underfunded primary care, lack of qualified professionals, and poor infrastructure creating preventable deaths.',
ARRAY[
  'Strengthen rural healthcare infrastructure with Primary Health Centers',
  'Human Resource strategy with rural doctor quotas and hardship allowances',
  'Gen Z-led community health mobilization and youth training programs',
  'National Digital Health Platform with electronic health records',
  'Universal health coverage expansion to all low-income households',
  'Independent Health Regulatory Authority for quality assurance'
],
'Healthcare'),

-- Social Protection
('Comprehensive Social Protection System',
'Operationalize Integrated National Social Protection Framework with expanded coverage and life-cycle based security.',
'Social protection system remains fragmented and underfunded with uneven coverage, leaving children, working-age people, and informal workers largely unprotected.',
ARRAY[
  'Universalize child grants and extend support to school-aged children',
  'Include informal workers in contributory schemes with unemployment insurance',
  'Integrate shock-responsive systems for crisis adaptability',
  'Strengthen legal frameworks guaranteeing universal programmes',
  'Address documentation barriers excluding vulnerable groups',
  'Ensure sustainable financing with balanced contributory/non-contributory mix'
],
'Social Policy'),

-- Financial Management
('Reform Public Financial Management',
'Integrate financial systems, establish citizen budget portals, and strengthen oversight mechanisms for transparent, efficient resource use.',
'Public financial management suffers from fragmented systems, weak accountability, oversized budgets, and limited public scrutiny preventing informed citizen participation.',
ARRAY[
  'Integrate LMBIS, Provincial LMBIS, SuTRA, RMS systems for interoperability',
  'Citizen budget portal with real-time ward-level data access',
  'Procurement reform with legal protection for good-faith bureaucrats',
  'Replace National Planning Commission with Ministry of Finance planning division',
  'Strict fiscal discipline with hard budget constraints enforcement',
  'Parliamentary Budget Office establishment for independent oversight'
],
'Governance');
