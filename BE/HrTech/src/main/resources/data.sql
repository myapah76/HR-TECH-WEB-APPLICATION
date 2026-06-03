-- Seed Roles (idempotent via ON CONFLICT)
INSERT INTO roles (id, created_at, updated_at, is_deleted, name,slug, description)
VALUES
    ('a0000000-0000-0000-0000-000000000001', NOW(), NOW(), false, 'ADMIN_SYSTEM', 'System Administrator','System Administrator'),
    ('a0000000-0000-0000-0000-000000000002', NOW(), NOW(), false, 'COMPANY_OWNER', 'Company Owner','Company Owner'),
    ('a0000000-0000-0000-0000-000000000003', NOW(), NOW(), false, 'HR_MANAGER', 'HR Manager','HR Manager'),
    ('a0000000-0000-0000-0000-000000000004', NOW(), NOW(), false, 'HR', 'Human Resources','Human Resources'),
    ('a0000000-0000-0000-0000-000000000005', NOW(), NOW(), false, 'CANDIDATE', 'Candidate / Job Seeker','Candidate / Job Seeker')
ON CONFLICT (id) DO NOTHING;

-- Seed Users (password = 12345, BCrypt pre-hashed)
-- BCrypt hash of '12345': $2a$10$JyUAVjK42zYjoF/uT9Po9.Oev6X695al30C5VUv74eqHdgM/rqbF2
INSERT INTO users (id, created_at, updated_at, is_deleted, role_id, email, password, username, first_name, last_name, is_blocked)
VALUES
    ('b0000000-0000-0000-0000-000000000001', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000001', 'admin1@hrtech.com', '$2a$10$JyUAVjK42zYjoF/uT9Po9.Oev6X695al30C5VUv74eqHdgM/rqbF2', 'admin1', 'Admin', 'System 1', false),
    ('b0000000-0000-0000-0000-000000000002', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000001', 'admin2@hrtech.com', '$2a$10$JyUAVjK42zYjoF/uT9Po9.Oev6X695al30C5VUv74eqHdgM/rqbF2', 'admin2', 'Admin', 'System 2', false),
    ('b0000000-0000-0000-0000-000000000003', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000002', 'owner1@hrtech.com', '$2a$10$JyUAVjK42zYjoF/uT9Po9.Oev6X695al30C5VUv74eqHdgM/rqbF2', 'owner1', 'Company', 'Owner 1', false),
    ('b0000000-0000-0000-0000-000000000004', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000002', 'owner2@hrtech.com', '$2a$10$JyUAVjK42zYjoF/uT9Po9.Oev6X695al30C5VUv74eqHdgM/rqbF2', 'owner2', 'Company', 'Owner 2', false),
    ('b0000000-0000-0000-0000-000000000005', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000003', 'hrmgr1@hrtech.com', '$2a$10$JyUAVjK42zYjoF/uT9Po9.Oev6X695al30C5VUv74eqHdgM/rqbF2', 'hrmgr1', 'HR', 'Manager 1', false),
    ('b0000000-0000-0000-0000-000000000006', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000003', 'hrmgr2@hrtech.com', '$2a$10$JyUAVjK42zYjoF/uT9Po9.Oev6X695al30C5VUv74eqHdgM/rqbF2', 'hrmgr2', 'HR', 'Manager 2', false),
    ('b0000000-0000-0000-0000-000000000007', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000004', 'hr1@hrtech.com', '$2a$10$JyUAVjK42zYjoF/uT9Po9.Oev6X695al30C5VUv74eqHdgM/rqbF2', 'hr1', 'HR', 'Staff 1', false),
    ('b0000000-0000-0000-0000-000000000008', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000004', 'hr2@hrtech.com', '$2a$10$JyUAVjK42zYjoF/uT9Po9.Oev6X695al30C5VUv74eqHdgM/rqbF2', 'hr2', 'HR', 'Staff 2', false),
    ('b0000000-0000-0000-0000-000000000009', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000005', 'candidate1@hrtech.com', '$2a$10$JyUAVjK42zYjoF/uT9Po9.Oev6X695al30C5VUv74eqHdgM/rqbF2', 'candidate1', 'Candidate', 'User 1', false),
    ('b0000000-0000-0000-0000-000000000010', NOW(), NOW(), false, 'a0000000-0000-0000-0000-000000000005', 'candidate2@hrtech.com', '$2a$10$JyUAVjK42zYjoF/uT9Po9.Oev6X695al30C5VUv74eqHdgM/rqbF2', 'candidate2', 'Candidate', 'User 2', false)
ON CONFLICT (id) DO NOTHING;