-- Đảm bảo extension tồn tại
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SEEDING BẢNG ROLES (Dùng ID cố định để code dễ tham chiếu)
INSERT INTO roles (id, name, slug, description)
VALUES 
    ('e2000000-0000-0000-0000-000000000001', 'Administrator', 'admin', 'Toàn quyền hệ thống'),
    ('e2000000-0000-0000-0000-000000000002', 'Manager', 'manager', 'Quản lý cửa hàng'),
    ('e2000000-0000-0000-0000-000000000003', 'Staff', 'staff', 'Nhân viên bán hàng'),
    ('e2000000-0000-0000-0000-000000000004', 'Customer', 'customer', 'Khách hàng mua sắm')
ON CONFLICT (slug) DO NOTHING;

-- 2. SEEDING BẢNG USERS
DO $$
DECLARE
    -- Khai báo ID của Roles để gán cho User
    r_admin UUID := 'e2000000-0000-0000-0000-000000000001';
    r_manager UUID := 'e2000000-0000-0000-0000-000000000002';
    r_staff UUID := 'e2000000-0000-0000-0000-000000000003';
    r_customer UUID := 'e2000000-0000-0000-0000-000000000004';

    -- Các mảng ID cố định cho Staff và Customer quan trọng
    u_staff_ids UUID[] := ARRAY[
        '99999999-9999-9999-9999-999999999999',
        '88888888-8888-8888-8888-888888888888',
        '77777777-7777-7777-7777-777777777777',
        '66666666-6666-6666-6666-666666666666'
    ];

    cust_sample_ids UUID[] := ARRAY[
        '00964234-2ce1-4bbd-b926-64bf68fef73b', '01549a30-76eb-4148-9cae-97eb31b853d4',
        '07204f59-80da-4c1c-8a8f-462300a003de', '0d03e6fd-ae82-4183-aacd-707930a134fd',
        '134ff6db-eb5a-4bde-a92c-8faf8ffb37bf', '1ded7707-40d6-4467-997a-abeaf70d9470',
        '1ea54879-27d0-4b26-a0bf-60cb9b4f768a', '01feadb5-f1fc-45e9-8360-6fbdeea929ae',
        '24a66acc-f2cd-4e58-9b47-f17e19df80aa', '26c7f49d-c1ef-4f65-bab3-71f12f42e51c',
        '2a9dd74f-3284-4a0b-8cfc-0db5dbd43664', '2b9b0400-f37e-411a-ab97-7c58876182d6',
        '2e4194b0-649a-4103-ab63-15e5cc5cb92b', '3014aef9-f746-443f-85d8-a700185278db',
        '3707976c-40cf-4525-82af-88d22d23f56f'
    ];

    -- Password chung cho dev environment (vd: 'password123')
    pass_hash VARCHAR := '$2a$12$mbTUUQ8yfeZt9G736FQdbeBTfVY6CesLBxhLCuEYkkb6C96f4Hdj2';
    i INT;
BEGIN

    -- 1. Tạo 1 Admin duy nhất
    INSERT INTO users (first_name, last_name, email, username, password, role_id, date_of_birth)
    VALUES ('Super', 'Admin', 'admin@cahongban.com', 'okbanlanhat', pass_hash, r_admin, '1990-01-01')
    ON CONFLICT (email) DO NOTHING;

    -- 2. Tạo 10 Managers
    FOR i IN 1..10 LOOP
        INSERT INTO users (
            id, first_name, last_name, email, username, password, role_id, date_of_birth
        )
        VALUES (
            ('f0000000-0000-0000-0000-0000000000' || LPAD(i::text, 2, '0'))::UUID,
            'Manager', i::text,
            'manager' || i || '@cahongban.com',
            'mana' || LPAD(i::text, 2, '0'),
            pass_hash,
            r_manager,
            '1992-05-15'
        )
        ON CONFLICT (email) DO NOTHING;
    END LOOP;

    -- 3. Tạo 19 Staff
    FOR i IN 1..19 LOOP
        IF i <= 4 THEN
            -- Staff có ID cố định từ mảng
            INSERT INTO users (id, first_name, last_name, email, username, password, role_id, date_of_birth)
            VALUES (u_staff_ids[i], 'Staff Spec', i::text, 'staff' || i || '@cahongban.com', 'staff' || i, pass_hash, r_staff, '1998-01-01')
            ON CONFLICT (email) DO NOTHING;
        ELSE
            -- Staff có ID ngẫu nhiên
            INSERT INTO users (first_name, last_name, email, username, password, role_id, date_of_birth)
            VALUES ('Staff', i::text, 'staff' || i || '@cahongban.com', 'staff' || i, pass_hash, r_staff, '1999-01-01')
            ON CONFLICT (email) DO NOTHING;
        END IF;
    END LOOP;

    -- 4. Tạo 15 Customers (ID cố định)
    FOR i IN 1..15 LOOP
        INSERT INTO users (id, first_name, last_name, email, username, password, role_id, date_of_birth)
        VALUES (cust_sample_ids[i], 'Customer', i::text, 'cust' || i || '@gmail.com', 'cust' || i, pass_hash, r_customer, '2005-05-05')
        ON CONFLICT (email) DO NOTHING;
    END LOOP;

    -- 5. Tạo nốt các Customers còn lại đến 70
    FOR i IN 16..70 LOOP
        INSERT INTO users (first_name, last_name, email, username, password, role_id, date_of_birth)
        VALUES ('Customer', i::text, 'cust' || i || '@gmail.com', 'cust' || i, pass_hash, r_customer, '2005-05-05')
        ON CONFLICT (email) DO NOTHING;
    END LOOP;

END $$;