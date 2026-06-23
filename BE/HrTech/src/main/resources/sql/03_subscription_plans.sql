INSERT INTO features (id, code, name, description, created_at, updated_at, is_deleted)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'JOB_POSTING', 'Đăng Job', 'Cho phép doanh nghiệp đăng tin tuyển dụng', NOW(), NOW(), false),
    ('22222222-2222-2222-2222-222222222222', 'AI_CREDIT', 'Năng lượng AI', 'Năng lượng dùng cho các tính năng AI', NOW(), NOW(), false),
    ('33333333-3333-3333-3333-333333333333', 'APP_SCORING', 'Chấm điểm Application', 'AI phân tích mức độ phù hợp của CV apply với JD', NOW(), NOW(), false),
    ('44444444-4444-4444-4444-444444444444', 'AI_MATCHING', 'Chấm điểm CV & SavedJob', 'AI chấm điểm độ phù hợp giữa CV và Job đã lưu', NOW(), NOW(), false),
    ('55555555-5555-5555-5555-555555555555', 'RECOMMEND_JOB', 'Gợi ý Job', 'Gợi ý Job phù hợp nhất dựa vào CV', NOW(), NOW(), false),
    ('66666666-6666-6666-6666-666666666666', 'RECOMMEND_CANDIDATE', 'Gợi ý Ứng viên', 'Gợi ý Ứng viên tài năng cho Doanh nghiệp', NOW(), NOW(), false),
    ('77777777-7777-7777-7777-777777777777', 'AI_CHATBOT', 'Trợ lý AI / Chatbox', 'Tư vấn, tạo JD hoặc hỗ trợ ứng viên tự động', NOW(), NOW(), false)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, code = EXCLUDED.code;

INSERT INTO company_subscription_plans
(id, name, description, price, duration_days, is_active, created_at, updated_at, is_deleted)
VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Khởi Đầu', 'Gói trải nghiệm miễn phí cho doanh nghiệp mới', 0, 30, true, NOW(), NOW(), false),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Tiêu Chuẩn', 'Gói tăng trưởng: Phù hợp tuyển dụng vừa và nhỏ', 500000, 30, true, NOW(), NOW(), false),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Chuyên Nghiệp', 'Gói doanh nghiệp: Dành cho nhu cầu tuyển dụng cực lớn', 2000000, 30, true, NOW(), NOW(), false)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO candidate_subscription_plans
(id, name, description, price, duration_days, is_active, created_at, updated_at, is_deleted)
VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Cơ Bản', 'Gói miễn phí cho ứng viên tìm việc', 0, 30, true, NOW(), NOW(), false),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Cao Cấp', 'Gói thành viên cao cấp: Trải nghiệm toàn bộ sức mạnh AI', 100000, 30, true, NOW(), NOW(), false)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Xóa dữ liệu cũ trong bảng trung gian để tạo lại từ đầu cho sạch
DELETE FROM company_plan_features;
DELETE FROM candidate_plan_features;

INSERT INTO company_plan_features (id, plan_id, feature_id, quota, created_at, updated_at)
VALUES
    -- COMPANY B2B_FREE
    ('c1111111-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 1, NOW(), NOW()),   -- Job Posting: 1
    ('c1111111-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 100, NOW(), NOW()), -- AI Credit: 100
    ('c1111111-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 1, NOW(), NOW()),   -- App Scoring
    
    -- COMPANY B2B_STANDARD
    ('c2222222-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 5, NOW(), NOW()),   -- Job Posting: 5
    ('c2222222-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 3000, NOW(), NOW()),-- AI Credit: 3000
    ('c2222222-0000-0000-0000-000000000003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 1, NOW(), NOW()),   -- App Scoring
    ('c2222222-0000-0000-0000-000000000004', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777', 1, NOW(), NOW()),   -- Chatbot

    -- COMPANY B2B_PRO
    ('c3333333-0000-0000-0000-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 20, NOW(), NOW()),  -- Job Posting: 20
    ('c3333333-0000-0000-0000-000000000002', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 15000, NOW(), NOW()),-- AI Credit: 15000
    ('c3333333-0000-0000-0000-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 1, NOW(), NOW()),   -- App Scoring
    ('c3333333-0000-0000-0000-000000000004', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '77777777-7777-7777-7777-777777777777', 1, NOW(), NOW()),   -- Chatbot
    ('c3333333-0000-0000-0000-000000000005', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '66666666-6666-6666-6666-666666666666', 1, NOW(), NOW())    -- Rcm Candidate
ON CONFLICT (id) DO NOTHING;

INSERT INTO candidate_plan_features (id, plan_id, feature_id, quota, created_at, updated_at)
VALUES
    -- CANDIDATE B2C_FREE
    ('a1111111-0000-0000-0000-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 50, NOW(), NOW()),  -- AI Credit: 50
    ('a1111111-0000-0000-0000-000000000002', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 1, NOW(), NOW()),   -- App Scoring
    
    -- CANDIDATE B2C_PREMIUM
    ('a2222222-0000-0000-0000-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 2000, NOW(), NOW()),-- AI Credit: 2000
    ('a2222222-0000-0000-0000-000000000002', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333', 1, NOW(), NOW()),   -- App Scoring
    ('a2222222-0000-0000-0000-000000000003', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '44444444-4444-4444-4444-444444444444', 1, NOW(), NOW()),   -- AI Matching
    ('a2222222-0000-0000-0000-000000000004', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '55555555-5555-5555-5555-555555555555', 1, NOW(), NOW()),   -- Recommend Job
    ('a2222222-0000-0000-0000-000000000005', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '77777777-7777-7777-7777-777777777777', 1, NOW(), NOW())    -- Chatbot
ON CONFLICT (id) DO NOTHING;