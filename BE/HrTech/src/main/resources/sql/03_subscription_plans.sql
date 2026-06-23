INSERT INTO features (id, code, name, description, created_at, updated_at, is_deleted)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'JOB_POSTING', 'Đăng Job', 'Cho phép doanh nghiệp đăng tin tuyển dụng', NOW(), NOW(), false),
    ('22222222-2222-2222-2222-222222222222', 'CANDIDATE_SEARCH', 'Tìm ứng viên', 'Cho phép chủ động tìm kiếm ứng viên trên hệ thống', NOW(), NOW(), false),
    ('33333333-3333-3333-3333-333333333333', 'COMPANY_PROFILE', 'Hồ sơ Công ty', 'Tạo và quản lý hồ sơ công ty', NOW(), NOW(), false),
    ('44444444-4444-4444-4444-444444444444', 'AI_CHATBOT', 'AI Chatbot & Năng lượng', 'Cung cấp năng lượng AI (AI Credits) để dùng Chatbot và hệ thống Gợi ý', NOW(), NOW(), false),
    ('55555555-5555-5555-5555-555555555555', 'AI_MATCH_SCORING', 'AI Tính điểm CV', 'Hệ thống tự động chấm điểm độ khớp giữa CV và JD', NOW(), NOW(), false),
    ('66666666-6666-6666-6666-666666666666', 'RECOMMEND_JOB', 'Gợi ý Job', 'Hệ thống tự động gợi ý Job phù hợp cho ứng viên', NOW(), NOW(), false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO company_subscription_plans
(id, name, description, price, duration_days, is_active, created_at, updated_at, is_deleted)
VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Khởi Đầu', 'Gói trải nghiệm miễn phí cho doanh nghiệp mới', 0, 30, true, NOW(), NOW(), false),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Tiêu Chuẩn', 'Gói tăng trưởng: Mở khóa tìm ứng viên và tính điểm AI', 500000, 30, true, NOW(), NOW(), false),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Chuyên Nghiệp', 'Gói doanh nghiệp: Dành cho nhu cầu tuyển dụng cực lớn', 2000000, 30, true, NOW(), NOW(), false)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO candidate_subscription_plans
(id, name, description, price, duration_days, is_active, created_at, updated_at, is_deleted)
VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Cơ Bản', 'Gói miễn phí cho ứng viên tìm việc', 0, 30, true, NOW(), NOW(), false),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Cao Cấp', 'Gói thành viên cao cấp: Gợi ý Job & Chatbot', 100000, 30, true, NOW(), NOW(), false)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO company_plan_features (id, plan_id, feature_id, quota, created_at, updated_at)
VALUES
    -- B2B_FREE Features
    ('77777777-7777-7777-7777-777777777771', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 1, NOW(), NOW()), -- Job Posting: 1
    ('77777777-7777-7777-7777-777777777772', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 50, NOW(), NOW()), -- AI Credits: 50
    ('77777777-7777-7777-7777-777777777773', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 1, NOW(), NOW()), -- Company Profile
    
    -- B2B_BASIC Features
    ('88888888-8888-8888-8888-888888888881', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 5, NOW(), NOW()), -- Job Posting: 5
    ('88888888-8888-8888-8888-888888888882', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 1000, NOW(), NOW()), -- AI Credits: 1000
    ('88888888-8888-8888-8888-888888888883', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 100, NOW(), NOW()), -- Candidate Search: 100
    ('88888888-8888-8888-8888-888888888884', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555', 1, NOW(), NOW()), -- AI Match Scoring

    -- B2B_PRO Features
    ('99999999-9999-9999-9999-999999999991', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 20, NOW(), NOW()), -- Job Posting: 20
    ('99999999-9999-9999-9999-999999999992', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 5000, NOW(), NOW()), -- AI Credits: 5000
    ('99999999-9999-9999-9999-999999999993', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 9999, NOW(), NOW()), -- Candidate Search
    ('99999999-9999-9999-9999-999999999994', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', 1, NOW(), NOW()) -- AI Match Scoring
ON CONFLICT (id) DO NOTHING;

INSERT INTO candidate_plan_features (id, plan_id, feature_id, quota, created_at, updated_at)
VALUES
    -- B2C_FREE Features
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', 10, NOW(), NOW()), -- AI Credits: 10
    
    -- B2C_PREMIUM Features
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '44444444-4444-4444-4444-444444444444', 500, NOW(), NOW()), -- AI Credits: 500
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '66666666-6666-6666-6666-666666666666', 1, NOW(), NOW()) -- Recommend Job
ON CONFLICT (id) DO NOTHING;