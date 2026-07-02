-- Seed Companies
INSERT INTO companies (id, created_at, updated_at, is_deleted, name, description, industry, size, address, status, tax_code, website, logo_url, ai_credit_balance, job_post_balance)
VALUES
    ('c0000000-0000-0000-0000-000000000001', NOW(), NOW(), false, 'FPT Software', 'Top IT Company in Vietnam. Leading provider of technology and IT services.', 'Information Technology', 'ENTERPRISE', 'F-Town, HCMC', 'APPROVED', '0301234567', 'https://fptsoftware.com', 'https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo_2010.svg', 0, 0),
    ('c0000000-0000-0000-0000-000000000002', NOW(), NOW(), false, 'VNG Corporation', 'Leading tech company in Vietnam. We believe in the power of the Internet to change lives.', 'Internet', 'ENTERPRISE', 'Z06, HCMC', 'APPROVED', '0301234568', 'https://vng.com.vn', 'https://res.cloudinary.com/dy45rrkhf/image/upload/v1782830907/uxuppro0k6fdoco4nzav.jpg', 0, 0)
    ON CONFLICT (id) DO NOTHING;
-- Seed Company Members
INSERT INTO company_members (id, created_at, updated_at, is_deleted, company_id, user_id, company_role, joined_at, membership_status)
VALUES
    ('d0000000-0000-0000-0000-000000000001', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'OWNER', NOW(), 'ACTIVE'),
    ('d0000000-0000-0000-0000-000000000002', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'HR_MANAGER', NOW(), 'ACTIVE'),
    ('d0000000-0000-0000-0000-000000000003', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', 'HR', NOW(), 'ACTIVE'),
    ('d0000000-0000-0000-0000-000000000004', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 'OWNER', NOW(), 'ACTIVE'),
    ('d0000000-0000-0000-0000-000000000005', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000006', 'HR_MANAGER', NOW(), 'ACTIVE'),
    ('d0000000-0000-0000-0000-000000000006', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 'HR', NOW(), 'ACTIVE')
    ON CONFLICT (id) DO NOTHING;
