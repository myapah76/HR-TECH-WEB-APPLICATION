-- Seed User Subscriptions to bypass quota error for HR users
INSERT INTO company_subscriptions (id, created_at, updated_at, is_deleted, start_date, end_date, status, company_id, purchased_by, plan_id)
VALUES
    ('50000000-0000-0000-0000-000000000001', NOW(), NOW(), false, NOW(), NOW() + INTERVAL '30 days', 'ACTIVE', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    ('50000000-0000-0000-0000-000000000002', NOW(), NOW(), false, NOW(), NOW() + INTERVAL '30 days', 'ACTIVE', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 'dddddddd-dddd-dddd-dddd-dddddddddddd')
ON CONFLICT (id) DO NOTHING;

INSERT INTO company_sub_feature_usages (id, created_at, updated_at, is_deleted, subscription_id, feature_id, quota, used)
VALUES
    ('60000000-0000-0000-0000-000000000001', NOW(), NOW(), false, '50000000-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 5000, 0), -- AI Credits
    ('60000000-0000-0000-0000-000000000002', NOW(), NOW(), false, '50000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 20, 0), -- Job Posting
    ('60000000-0000-0000-0000-000000000003', NOW(), NOW(), false, '50000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 5000, 0),
    ('60000000-0000-0000-0000-000000000004', NOW(), NOW(), false, '50000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 20, 0)
ON CONFLICT (id) DO NOTHING;
