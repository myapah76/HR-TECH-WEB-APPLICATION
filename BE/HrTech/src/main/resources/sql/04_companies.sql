-- Seed Companies
INSERT INTO companies (id, created_at, updated_at, is_deleted, name, description, industry, size, address, status, tax_code, website, logo_url)
VALUES
    ('c0000000-0000-0000-0000-000000000001', NOW(), NOW(), false, 'FPT Software', 'Top IT Company in Vietnam. Leading provider of technology and IT services.', 'Information Technology', 'ENTERPRISE', 'F-Town, HCMC', 'APPROVED', '0301234567', 'https://fptsoftware.com', 'https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo_2010.svg'),
    ('c0000000-0000-0000-0000-000000000002', NOW(), NOW(), false, 'VNG Corporation', 'Leading tech company in Vietnam. We believe in the power of the Internet to change lives.', 'Internet', 'ENTERPRISE', 'Z06, HCMC', 'APPROVED', '0301234568', 'https://vng.com.vn', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/VNG_logo.svg/1200px-VNG_logo.svg.png')
    ON CONFLICT (id) DO NOTHING;
-- Seed Company Members
INSERT INTO company_members (id, created_at, updated_at, is_deleted, company_id, user_id, company_role, joined_at, membership_status)
VALUES
    ('d0000000-0000-0000-0000-000000000001', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', 'HR', NOW(), 'ACTIVE'),
    ('d0000000-0000-0000-0000-000000000002', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'HR_MANAGER', NOW(), 'ACTIVE')
    ON CONFLICT (id) DO NOTHING;