-- Create agendas that correspond to the manifesto items with consistent UUIDs
-- This ensures the voting system works with the static manifesto data

-- First, let's create a function to generate consistent UUIDs for manifesto items
CREATE OR REPLACE FUNCTION generate_manifesto_uuid(manifesto_id INTEGER)
RETURNS UUID AS $$
BEGIN
  -- Generate a consistent UUID based on manifesto ID
  -- Using a namespace UUID and the manifesto ID as seed
  RETURN (
    LPAD(TO_HEX(ABS(HASHTEXT('manifesto-' || manifesto_id::TEXT))), 8, '0') ||
    '-' || LPAD(manifesto_id::TEXT, 4, '0') ||
    '-4000-8000-000000000000'
  )::UUID;
END;
$$ LANGUAGE plpgsql;

-- Insert manifesto items as agendas with consistent UUIDs
INSERT INTO public.agendas (id, title, description, problem_statement, key_points, category) VALUES
(generate_manifesto_uuid(1), 'Establish Independent Anti-Corruption Commission', 'Create a powerful, independent body to investigate and prosecute corruption cases with constitutional protection and adequate resources.', 'Nepal faces widespread corruption across all levels of government, undermining public trust and economic development.', ARRAY['Constitutional independence', 'Adequate funding', 'Prosecutorial powers', 'Public reporting'], 'Anti-Corruption'),

(generate_manifesto_uuid(2), 'Implement Transparent Public Procurement', 'Digitize all government procurement processes with real-time public access to contracts, bidding, and vendor information.', 'Opaque procurement processes enable corruption and waste billions in public resources annually.', ARRAY['Digital procurement platform', 'Real-time transparency', 'Public contract database', 'Vendor verification'], 'Procurement Reform'),

(generate_manifesto_uuid(3), 'Strengthen Electoral Transparency', 'Mandate real-time disclosure of campaign financing, political party funding sources, and election expenditures.', 'Lack of transparency in political financing undermines democratic accountability and enables undue influence.', ARRAY['Campaign finance disclosure', 'Party funding transparency', 'Real-time reporting', 'Public database access'], 'Electoral Reform')

-- Add more manifesto items as needed
ON CONFLICT (id) DO NOTHING;
