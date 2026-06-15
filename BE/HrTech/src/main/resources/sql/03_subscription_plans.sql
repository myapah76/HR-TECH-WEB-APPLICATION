-- Seed Subscription Plans
INSERT INTO subscription_plans (id, created_at, updated_at, is_deleted, name, description, price, duration_days, plan_type, max_job_posts, max_recruiters, max_ai_cv_ratings, candidate_pool_access, analytics_access, is_active)
VALUES
    ('e0000000-0000-0000-0000-000000000001', NOW(), NOW(), false, 'Free', 'Basic plan for small companies.', 0, 30, 'COMPANY', 3, 1, 10, false, false, true),
    ('e0000000-0000-0000-0000-000000000002', NOW(), NOW(), false, 'Starter', 'Suitable for growing businesses.', 299000, 30, 'COMPANY', 15, 3, 200, false, true, true),
    ('e0000000-0000-0000-0000-000000000003', NOW(), NOW(), false, 'Professional', 'Advanced recruiting tools for medium-sized companies.', 999000, 30, 'COMPANY', 50, 10, 2000, true, true, true)
    ON CONFLICT (id) DO NOTHING;