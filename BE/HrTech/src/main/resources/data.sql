-- Seed Roles (idempotent via ON CONFLICT)
INSERT INTO roles (id, created_at, updated_at, is_deleted, name, slug, description)
VALUES
    ('a0000000-0000-0000-0000-000000000001', NOW(), NOW(), false, 'ADMIN_SYSTEM', 'System Administrator', 'System Administrator'),
    ('a0000000-0000-0000-0000-000000000002', NOW(), NOW(), false, 'RECRUITER', 'Recruiter', 'Recruiter'),
    ('a0000000-0000-0000-0000-000000000003', NOW(), NOW(), false, 'CANDIDATE', 'Candidate / Job Seeker', 'Candidate / Job Seeker')
ON CONFLICT (id) DO NOTHING;

-- Seed Users (password = 123456, BCrypt pre-hashed)
INSERT INTO users (id, created_at, updated_at, is_deleted, role_id, email, password, username, first_name, last_name, is_blocked)
VALUES
    ('b0000000-0000-0000-0000-000000000001', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000001', 'admin1@hrtech.com', '$2a$12$RBcyryCgZEe7ta5MMeX4huiO8V8txscrw/FunPgjW9bnFtRcTF4H.', 'admin1', 'Admin', 'System 1', false),
    ('b0000000-0000-0000-0000-000000000002', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000001', 'admin2@hrtech.com', '$2a$12$RBcyryCgZEe7ta5MMeX4huiO8V8txscrw/FunPgjW9bnFtRcTF4H.', 'admin2', 'Admin', 'System 2', false),
    ('b0000000-0000-0000-0000-000000000003', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000002', 'owner1@hrtech.com', '$2a$12$RBcyryCgZEe7ta5MMeX4huiO8V8txscrw/FunPgjW9bnFtRcTF4H.', 'owner1', 'Company', 'Owner 1', false),
    ('b0000000-0000-0000-0000-000000000004', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000002', 'owner2@hrtech.com', '$2a$12$RBcyryCgZEe7ta5MMeX4huiO8V8txscrw/FunPgjW9bnFtRcTF4H.', 'owner2', 'Company', 'Owner 2', false),
    ('b0000000-0000-0000-0000-000000000005', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000002', 'hrmgr1@hrtech.com', '$2a$12$RBcyryCgZEe7ta5MMeX4huiO8V8txscrw/FunPgjW9bnFtRcTF4H.', 'hrmgr1', 'HR', 'Manager 1', false),
    ('b0000000-0000-0000-0000-000000000006', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000002', 'hrmgr2@hrtech.com', '$2a$12$RBcyryCgZEe7ta5MMeX4huiO8V8txscrw/FunPgjW9bnFtRcTF4H.', 'hrmgr2', 'HR', 'Manager 2', false),
    ('b0000000-0000-0000-0000-000000000007', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000002', 'hr1@hrtech.com', '$2a$12$RBcyryCgZEe7ta5MMeX4huiO8V8txscrw/FunPgjW9bnFtRcTF4H.', 'hr1', 'HR', 'Staff 1', false),
    ('b0000000-0000-0000-0000-000000000008', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000002', 'hr2@hrtech.com', '$2a$12$RBcyryCgZEe7ta5MMeX4huiO8V8txscrw/FunPgjW9bnFtRcTF4H.', 'hr2', 'HR', 'Staff 2', false),
    ('b0000000-0000-0000-0000-000000000009', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000003', 'candidate1@hrtech.com', '$2a$12$RBcyryCgZEe7ta5MMeX4huiO8V8txscrw/FunPgjW9bnFtRcTF4H.', 'candidate1', 'Candidate', 'User 1', false),
    ('b0000000-0000-0000-0000-000000000010', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000003', 'candidate2@hrtech.com', '$2a$12$RBcyryCgZEe7ta5MMeX4huiO8V8txscrw/FunPgjW9bnFtRcTF4H.', 'candidate2', 'Candidate', 'User 2', false)
ON CONFLICT (id) DO NOTHING;

-- Seed Companies
INSERT INTO companies (id, created_at, updated_at, is_deleted, name, description, industry, size, address, status, tax_code, website, logo_url)
VALUES
    ('c0000000-0000-0000-0000-000000000001', NOW(), NOW(), false, 'FPT Software', 'Top IT Company in Vietnam. Leading provider of technology and IT services.', 'Information Technology', 'ENTERPRISE', 'F-Town, HCMC', 'APPROVED', '0301234567', 'https://fptsoftware.com', 'https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo_2010.svg'),
    ('c0000000-0000-0000-0000-000000000002', NOW(), NOW(), false, 'VNG Corporation', 'Leading tech company in Vietnam. We believe in the power of the Internet to change lives.', 'Internet', 'ENTERPRISE', 'Z06, HCMC', 'APPROVED', '0301234568', 'https://vng.com.vn', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/VNG_logo.svg/1200px-VNG_logo.svg.png')
ON CONFLICT (id) DO NOTHING;

-- Seed Company Members (mapping hr1 and hrmgr1 to FPT Software)
INSERT INTO company_members (id, created_at, updated_at, is_deleted, company_id, user_id, company_role, joined_at, membership_status)
VALUES
    ('d0000000-0000-0000-0000-000000000001', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', 'HR', NOW(), 'ACTIVE'),
    ('d0000000-0000-0000-0000-000000000002', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'HR_MANAGER', NOW(), 'ACTIVE')
ON CONFLICT (id) DO NOTHING;