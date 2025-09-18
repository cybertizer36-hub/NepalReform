-- Insert sample testimonials with placeholder images
-- These use the placeholder image from the public folder

INSERT INTO public.testimonials (name, profession, testimonial, image_url, linkedin_url, is_active, display_order)
VALUES 
(
  'Kul Chandra Gautam',
  'Former UNICEF and United Nations official',
  'This manifesto is a great contribution to rethinking Nepal''s governance with concrete, actionable policy suggestions. It deserves serious attention from policymakers and think tanks, including the National Planning Commission.',
  '/placeholder-user.jpg', -- Using local placeholder image
  'https://www.linkedin.com/in/kul-chandra-gautam/',
  true,
  1
),
(
  'Dr. Mahabir Pun',
  'Social Entrepreneur & Innovator',
  'The digital governance and technology integration proposals in this manifesto align perfectly with Nepal''s need for modernization. The focus on connecting rural areas through technology is particularly important.',
  '/placeholder-user.jpg',
  'https://www.linkedin.com/in/mahabirpun/',
  true,
  2
),
(
  'Anuradha Koirala',
  'Social Activist & CNN Hero',
  'The emphasis on protecting vulnerable populations and strengthening social protection systems is crucial for Nepal''s development. These reforms could truly transform how we serve our most marginalized citizens.',
  '/placeholder-user.jpg',
  NULL,
  true,
  3
)
ON CONFLICT (id) DO NOTHING;
