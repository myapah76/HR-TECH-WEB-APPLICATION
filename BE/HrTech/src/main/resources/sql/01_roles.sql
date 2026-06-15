-- Seed Roles (idempotent via ON CONFLICT)
INSERT INTO roles (id, created_at, updated_at, is_deleted, name, slug, description)
VALUES
    ('a0000000-0000-0000-0000-000000000001', NOW(), NOW(), false, 'ADMIN_SYSTEM', 'System Administrator', 'System Administrator'),
    ('a0000000-0000-0000-0000-000000000002', NOW(), NOW(), false, 'RECRUITER', 'Recruiter', 'Recruiter'),
    ('a0000000-0000-0000-0000-000000000003', NOW(), NOW(), false, 'CANDIDATE', 'Candidate / Job Seeker', 'Candidate / Job Seeker')
    ON CONFLICT (id) DO NOTHING;