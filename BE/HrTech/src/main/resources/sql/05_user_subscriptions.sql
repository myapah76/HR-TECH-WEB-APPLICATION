-- Seed User Subscriptions to bypass quota error for HR users
INSERT INTO subscriptions (id, created_at, updated_at, is_deleted, start_date, end_date, plan_type, status, remaining_ai_credits, remaining_job_posts, user_id, plan_id)
VALUES
    ('50000000-0000-0000-0000-000000000001', NOW(), NOW(), false, NOW(), NOW() + INTERVAL '30 days', 'COMPANY', 'ACTIVE', 5000, 20, 'b0000000-0000-0000-0000-000000000007', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    ('50000000-0000-0000-0000-000000000002', NOW(), NOW(), false, NOW(), NOW() + INTERVAL '30 days', 'COMPANY', 'ACTIVE', 5000, 20, 'b0000000-0000-0000-0000-000000000008', 'dddddddd-dddd-dddd-dddd-dddddddddddd')
ON CONFLICT (id) DO NOTHING;
