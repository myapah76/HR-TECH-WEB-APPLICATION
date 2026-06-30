-- Seed Role Aliases (idempotent via ON CONFLICT)
INSERT INTO role_aliases (id, created_at, updated_at, alias, canonical_role)
VALUES
    -- backend
    ('b0000000-0000-0000-0000-000000000001', NOW(), NOW(), 'back-end', 'backend'),
    ('b0000000-0000-0000-0000-000000000002', NOW(), NOW(), 'be', 'backend'),
    ('b0000000-0000-0000-0000-000000000003', NOW(), NOW(), 'server', 'backend'),
    ('b0000000-0000-0000-0000-000000000004', NOW(), NOW(), 'server-side', 'backend'),
    -- frontend
    ('b0000000-0000-0000-0000-000000000005', NOW(), NOW(), 'front-end', 'frontend'),
    ('b0000000-0000-0000-0000-000000000006', NOW(), NOW(), 'fe', 'frontend'),
    ('b0000000-0000-0000-0000-000000000007', NOW(), NOW(), 'client-side', 'frontend'),
    -- fullstack
    ('b0000000-0000-0000-0000-000000000008', NOW(), NOW(), 'full-stack', 'fullstack'),
    ('b0000000-0000-0000-0000-000000000009', NOW(), NOW(), 'full stack', 'fullstack'),
    -- qa
    ('b0000000-0000-0000-0000-000000000010', NOW(), NOW(), 'tester', 'qa'),
    ('b0000000-0000-0000-0000-000000000011', NOW(), NOW(), 'testing', 'qa'),
    ('b0000000-0000-0000-0000-000000000012', NOW(), NOW(), 'qc', 'qa'),
    ('b0000000-0000-0000-0000-000000000013', NOW(), NOW(), 'quality assurance', 'qa'),
    -- devops
    ('b0000000-0000-0000-0000-000000000014', NOW(), NOW(), 'dev-ops', 'devops'),
    ('b0000000-0000-0000-0000-000000000015', NOW(), NOW(), 'cloud', 'devops'),
    ('b0000000-0000-0000-0000-000000000016', NOW(), NOW(), 'sre', 'devops'),
    -- ai
    ('b0000000-0000-0000-0000-000000000017', NOW(), NOW(), 'ml', 'ai'),
    ('b0000000-0000-0000-0000-000000000018', NOW(), NOW(), 'machine learning', 'ai'),
    ('b0000000-0000-0000-0000-000000000019', NOW(), NOW(), 'deep learning', 'ai'),
    ('b0000000-0000-0000-0000-000000000020', NOW(), NOW(), 'llm', 'ai'),
    -- ba
    ('b0000000-0000-0000-0000-000000000021', NOW(), NOW(), 'business analyst', 'ba'),
    ('b0000000-0000-0000-0000-000000000022', NOW(), NOW(), 'po', 'ba'),
    ('b0000000-0000-0000-0000-000000000023', NOW(), NOW(), 'product owner', 'ba'),
    -- mobile
    ('b0000000-0000-0000-0000-000000000024', NOW(), NOW(), 'ios', 'mobile'),
    ('b0000000-0000-0000-0000-000000000025', NOW(), NOW(), 'android', 'mobile'),
    -- security
    ('b0000000-0000-0000-0000-000000000026', NOW(), NOW(), 'cybersecurity', 'security'),
    ('b0000000-0000-0000-0000-000000000027', NOW(), NOW(), 'infosec', 'security'),
    ('b0000000-0000-0000-0000-000000000028', NOW(), NOW(), 'pentest', 'security'),
    -- game
    ('b0000000-0000-0000-0000-000000000029', NOW(), NOW(), 'game dev', 'game'),
    ('b0000000-0000-0000-0000-000000000030', NOW(), NOW(), 'game developer', 'game'),
    -- design
    ('b0000000-0000-0000-0000-000000000031', NOW(), NOW(), 'designer', 'design'),
    ('b0000000-0000-0000-0000-000000000032', NOW(), NOW(), 'ux/ui', 'design'),
    -- embedded
    ('b0000000-0000-0000-0000-000000000033', NOW(), NOW(), 'firmware', 'embedded'),
    ('b0000000-0000-0000-0000-000000000034', NOW(), NOW(), 'iot', 'embedded'),
    -- data (data engineering / analytics - separate from ai/ml)
    ('b0000000-0000-0000-0000-000000000035', NOW(), NOW(), 'data engineer', 'data'),
    ('b0000000-0000-0000-0000-000000000036', NOW(), NOW(), 'data analyst', 'data'),
    ('b0000000-0000-0000-0000-000000000037', NOW(), NOW(), 'analytics', 'data'),
    ('b0000000-0000-0000-0000-000000000038', NOW(), NOW(), 'bi', 'data'),
    ('b0000000-0000-0000-0000-000000000039', NOW(), NOW(), 'business intelligence', 'data'),
    -- tools (cross-functional tool skills: git, jira, figma, linux, bash, postman, etc.)
    ('b0000000-0000-0000-0000-000000000040', NOW(), NOW(), 'tool', 'tools'),
    ('b0000000-0000-0000-0000-000000000041', NOW(), NOW(), 'tooling', 'tools'),
    ('b0000000-0000-0000-0000-000000000042', NOW(), NOW(), 'version control', 'tools'),
    ('b0000000-0000-0000-0000-000000000043', NOW(), NOW(), 'collaboration', 'tools'),
    ('b0000000-0000-0000-0000-000000000044', NOW(), NOW(), 'project management tool', 'tools')
ON CONFLICT (alias) DO NOTHING;
