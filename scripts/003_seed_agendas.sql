-- Insert sample reform agendas based on the Nepal manifesto
INSERT INTO public.agendas (title, description, problem_statement, key_points, category) VALUES
(
  'Transform CIAA into Independent Anti-Corruption Force',
  'Restructure the Commission for Investigation of Abuse of Authority to become a truly independent and effective anti-corruption institution.',
  'The current CIAA lacks independence and effectiveness in fighting corruption due to political interference and limited powers.',
  ARRAY[
    'Grant constitutional independence to CIAA',
    'Expand investigative powers and resources',
    'Establish transparent appointment process',
    'Create specialized anti-corruption courts'
  ],
  'Governance'
),
(
  'Electoral System Reform',
  'Implement comprehensive electoral reforms to ensure fair representation and reduce political manipulation.',
  'Current electoral system allows for gerrymandering, vote buying, and unequal representation across constituencies.',
  ARRAY[
    'Introduce proportional representation',
    'Strengthen election commission independence',
    'Implement campaign finance transparency',
    'Establish constituency boundary commission'
  ],
  'Democracy'
),
(
  'Judicial Independence and Reform',
  'Establish a truly independent judiciary free from political interference with improved accountability mechanisms.',
  'Political appointments and interference have compromised judicial independence and public trust in the justice system.',
  ARRAY[
    'Reform judicial appointment process',
    'Establish judicial service commission',
    'Implement performance evaluation system',
    'Create specialized courts for different matters'
  ],
  'Justice'
),
(
  'Federalism Implementation',
  'Properly implement federalism with clear division of powers and resources between federal, provincial, and local governments.',
  'Unclear division of responsibilities and inadequate resource allocation has led to confusion and ineffective governance at all levels.',
  ARRAY[
    'Clarify constitutional division of powers',
    'Establish fiscal federalism framework',
    'Strengthen local government capacity',
    'Create inter-governmental coordination mechanisms'
  ],
  'Federalism'
),
(
  'Public Service Reform',
  'Modernize public service delivery through digitalization, merit-based appointments, and performance accountability.',
  'Inefficient bureaucracy, political appointments, and lack of accountability have resulted in poor public service delivery.',
  ARRAY[
    'Implement digital governance systems',
    'Establish merit-based recruitment',
    'Create performance evaluation framework',
    'Strengthen citizen feedback mechanisms'
  ],
  'Administration'
);
