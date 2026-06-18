-- Seed CVs (idempotent via ON CONFLICT)
INSERT INTO cvs (id, created_at, updated_at, is_deleted, user_id, title, file_url, parsed_content, is_primary, extraction_status)
VALUES
    -- Candidate 1 ('b0000000-0000-0000-0000-000000000009') CVs
    ('d0000000-0000-0000-0000-000000000001', NOW(), NOW(), false, 'b0000000-0000-0000-0000-000000000009', 'CV Golang Senior.pdf', 'http://example.com/cv1.pdf', 'Golang, Kubernetes, Docker, PostgreSQL', true, 'COMPLETED'),
    ('d0000000-0000-0000-0000-000000000002', NOW(), NOW(), false, 'b0000000-0000-0000-0000-000000000009', 'CV Java Spring.pdf', 'http://example.com/cv2.pdf', 'Java, Spring Boot, MySQL, Redis', false, 'COMPLETED'),

    -- Candidate 2 ('b0000000-0000-0000-0000-000000000010') CVs
    ('d0000000-0000-0000-0000-000000000003', NOW(), NOW(), false, 'b0000000-0000-0000-0000-000000000010', 'CV Frontend React.pdf', 'http://example.com/cv3.pdf', 'React, TypeScript, Next.js, TailwindCSS', true, 'COMPLETED')
ON CONFLICT (id) DO NOTHING;
