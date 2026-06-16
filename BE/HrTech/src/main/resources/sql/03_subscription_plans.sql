INSERT INTO features (id, code, name, description,created_at, updated_at, is_deleted)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'JOB_POSTING', 'Job Posting', 'Post job vacancies', NOW(), NOW(), false),
    ('22222222-2222-2222-2222-222222222222', 'CV_SEARCH', 'CV Search', 'Search candidate CVs', NOW(), NOW(), false),
    ('33333333-3333-3333-3333-333333333333', 'COMPANY_PROFILE', 'Company Profile', 'Create and manage company profile', NOW(), NOW(), false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO subscription_plans
(id, name, description, price, duration_days, plan_type, is_active, created_at, updated_at, is_deleted)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Free', 'Basic plan for new employers', 0, 365, 'COMPANY', true, NOW(), NOW(), false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO plan_features (id, plan_id, feature_id, quota, created_at, updated_at)
VALUES
    ('44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 30, NOW(), NOW()),
    ('55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 100, NOW(), NOW() ),
    ('66666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 10, NOW(), NOW() )
ON CONFLICT (id) DO NOTHING;