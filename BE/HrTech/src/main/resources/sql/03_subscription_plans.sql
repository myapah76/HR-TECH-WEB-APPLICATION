-- =====================================================================
-- Xóa dữ liệu cũ để tạo lại sạch
-- =====================================================================
DELETE FROM company_plan_features;
DELETE FROM candidate_plan_features;
DELETE FROM features WHERE code IN ('JOB_POSTING', 'AI_CREDIT');

-- =====================================================================
-- FEATURES SYSTEM
-- =====================================================================
INSERT INTO features (id, code, name, description, created_at, updated_at, is_deleted)
VALUES
    ('33333333-3333-3333-3333-333333333333', 'APP_SCORING', 'Chấm điểm Application', 'AI phân tích mức độ phù hợp của CV apply với JD', NOW(), NOW(), false),
    ('44444444-4444-4444-4444-444444444444', 'AI_MATCHING', 'Chấm điểm CV & SavedJob', 'AI chấm điểm độ phù hợp giữa CV và Job đã lưu', NOW(), NOW(), false),
    ('55555555-5555-5555-5555-555555555555', 'RECOMMEND_JOB', 'Gợi ý Job', 'Gợi ý Job phù hợp nhất dựa vào CV', NOW(), NOW(), false),
    ('66666666-6666-6666-6666-666666666666', 'RECOMMEND_CANDIDATE', 'Gợi ý Ứng viên', 'Gợi ý Ứng viên tài năng cho Doanh nghiệp', NOW(), NOW(), false),
    ('77777777-7777-7777-7777-777777777777', 'AI_CHATBOT', 'Trợ lý AI / Chatbox', 'Tư vấn, tạo JD hoặc hỗ trợ ứng viên tự động', NOW(), NOW(), false)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, code = EXCLUDED.code;

-- =====================================================================
-- COMPANY SUBSCRIPTION PLANS (with new balance columns)
-- =====================================================================
INSERT INTO company_subscription_plans
(id, name, description, price, duration_days, is_active, ai_credit_balance, job_post_balance, daily_ai_limit, weekly_ai_limit, created_at, updated_at, is_deleted)
VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Khởi Đầu', 'Gói trải nghiệm miễn phí cho doanh nghiệp mới', 0, 30, true, 100, 1, 20, 50, NOW(), NOW(), false),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Tiêu Chuẩn', 'Gói tăng trưởng: Phù hợp tuyển dụng vừa và nhỏ', 500000, 30, true, 3000, 5, 200, 500, NOW(), NOW(), false),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Chuyên Nghiệp', 'Gói doanh nghiệp: Dành cho nhu cầu tuyển dụng cực lớn', 2000000, 30, true, 15000, 20, 1000, 2500, NOW(), NOW(), false)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price, duration_days = EXCLUDED.duration_days, is_active = EXCLUDED.is_active, ai_credit_balance = EXCLUDED.ai_credit_balance, job_post_balance = EXCLUDED.job_post_balance, daily_ai_limit = EXCLUDED.daily_ai_limit, weekly_ai_limit = EXCLUDED.weekly_ai_limit;

-- =====================================================================
-- CANDIDATE SUBSCRIPTION PLANS (with new balance columns)
-- =====================================================================
INSERT INTO candidate_subscription_plans
(id, name, description, price, duration_days, is_active, ai_credit_balance, daily_ai_limit, weekly_ai_limit, created_at, updated_at, is_deleted)
VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Cơ Bản', 'Gói miễn phí cho ứng viên tìm việc', 0, 30, true, 50, 10, 25, NOW(), NOW(), false),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Cao Cấp', 'Gói thành viên cao cấp: Trải nghiệm toàn bộ sức mạnh AI', 2000, 30, true, 2000, 100, 250, NOW(), NOW(), false),
    ('99999999-9999-9999-9999-999999999999', 'Chuyên Nghiệp', 'Gói tối thượng cho người tìm việc: Mở khoá tất cả tính năng', 5000, 30, true, 5000, 300, 750, NOW(), NOW(), false)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price, duration_days = EXCLUDED.duration_days, is_active = EXCLUDED.is_active, ai_credit_balance = EXCLUDED.ai_credit_balance, daily_ai_limit = EXCLUDED.daily_ai_limit, weekly_ai_limit = EXCLUDED.weekly_ai_limit;

-- =====================================================================
-- COMPANY PLAN FEATURES (mapping with ai_credit_cost, no total_quota)
-- =====================================================================
INSERT INTO company_plan_features (id, plan_id, feature_id, ai_credit_cost, created_at, updated_at)
VALUES
    -- COMPANY: Khởi Đầu (Free)
    ('c1111111-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 10,  NOW(), NOW()),  -- APP_SCORING: 10 credits
    ('c1111111-0000-0000-0000-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '77777777-7777-7777-7777-777777777777', 5,   NOW(), NOW()),  -- AI_CHATBOT: 5 credits

    -- COMPANY: Tiêu Chuẩn
    ('c2222222-0000-0000-0000-000000000003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 10,  NOW(), NOW()),  -- APP_SCORING: 10 credits
    ('c2222222-0000-0000-0000-000000000004', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777', 5,   NOW(), NOW()),  -- AI_CHATBOT: 5 credits

    -- COMPANY: Chuyên Nghiệp
    ('c3333333-0000-0000-0000-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 10,  NOW(), NOW()),  -- APP_SCORING: 10 credits
    ('c3333333-0000-0000-0000-000000000004', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '77777777-7777-7777-7777-777777777777', 5,   NOW(), NOW()),  -- AI_CHATBOT: 5 credits
    ('c3333333-0000-0000-0000-000000000005', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '66666666-6666-6666-6666-666666666666', 50,  NOW(), NOW())   -- RECOMMEND_CANDIDATE: 50 credits
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- CANDIDATE PLAN FEATURES (mapping with ai_credit_cost, no total_quota)
-- =====================================================================
INSERT INTO candidate_plan_features (id, plan_id, feature_id, ai_credit_cost, created_at, updated_at)
VALUES
    -- CANDIDATE: Cơ Bản (Free)
    ('a1111111-0000-0000-0000-000000000002', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 10,  NOW(), NOW()),  -- APP_SCORING: 10 credits
    ('a1111111-0000-0000-0000-000000000003', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '77777777-7777-7777-7777-777777777777', 5,   NOW(), NOW()),  -- AI_CHATBOT: 5 credits

    -- CANDIDATE: Cao Cấp
    ('a2222222-0000-0000-0000-000000000002', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333', 10,  NOW(), NOW()),  -- APP_SCORING: 10 credits
    ('a2222222-0000-0000-0000-000000000003', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '44444444-4444-4444-4444-444444444444', 20,  NOW(), NOW()),  -- AI_MATCHING: 20 credits
    ('a2222222-0000-0000-0000-000000000004', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '55555555-5555-5555-5555-555555555555', 50,  NOW(), NOW()),  -- RECOMMEND_JOB: 50 credits
    ('a2222222-0000-0000-0000-000000000005', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '77777777-7777-7777-7777-777777777777', 5,   NOW(), NOW()),  -- AI_CHATBOT: 5 credits

    -- CANDIDATE: Chuyên Nghiệp
    ('a3333333-0000-0000-0000-000000000002', '99999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', 10,  NOW(), NOW()),  -- APP_SCORING: 10 credits
    ('a3333333-0000-0000-0000-000000000003', '99999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', 20,  NOW(), NOW()),  -- AI_MATCHING: 20 credits
    ('a3333333-0000-0000-0000-000000000004', '99999999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555555', 50,  NOW(), NOW()),  -- RECOMMEND_JOB: 50 credits
    ('a3333333-0000-0000-0000-000000000005', '99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-777777777777', 5,   NOW(), NOW())   -- AI_CHATBOT: 5 credits
ON CONFLICT (id) DO NOTHING;