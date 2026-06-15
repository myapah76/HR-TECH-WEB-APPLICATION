-- =============================================================================
-- STEP 1: CREATE THE PARENT JOBS FIRST
-- =============================================================================
INSERT INTO jobs (
    id, created_at, updated_at, is_deleted,
    company_id, created_by_id,
    title, description, location,
    salary_min, salary_max,
    job_type, experience_level,
    status, deadline,
    requirements, extraction_status
)
VALUES
-- 10 Jobs for FPT Software ('c0000000-0000-0000-0000-000000000001')
('10000000-0000-0000-0000-000000000001', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', 'Java Backend Developer', 'Build backend APIs using Spring Boot', 'Ho Chi Minh City', 800.0000, 1500.0000, 'FULL_TIME', 'JUNIOR', 'APPROVED', '2026-12-31', 'Java, Spring Boot, REST API', 'PENDING'),
('10000000-0000-0000-0000-000000000002', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'Frontend React Developer', 'Develop UI components using ReactJS', 'Hanoi', 700.0000, 1300.0000, 'FULL_TIME', 'JUNIOR', 'APPROVED', '2026-12-31', 'React, JavaScript, HTML, CSS', 'PENDING'),
('10000000-0000-0000-0000-000000000003', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'AI Engineer', 'Develop machine learning models and AI systems', 'Remote', 1500.0000, 3000.0000, 'FULL_TIME', 'SENIOR', 'APPROVED', '2026-12-31', 'Python, TensorFlow, Machine Learning', 'PENDING'),
('10000000-0000-0000-0000-000000000004', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'System Architect', 'Design scalable system architecture', 'Ho Chi Minh City', 2500.0000, 4000.0000, 'FULL_TIME', 'LEAD', 'APPROVED', '2026-12-31', 'System Design, Microservices', 'PENDING'),
('10000000-0000-0000-0000-000000000005', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'Business Analyst', 'Analyze business requirements', 'Ho Chi Minh City', 800.0000, 1500.0000, 'FULL_TIME', 'MID', 'APPROVED', '2026-12-31', 'Requirement Analysis, Communication', 'PENDING'),
('10000000-0000-0000-0000-000000000006', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', 'Frontend Angular Developer', 'Develop enterprise UI using Angular', 'Ho Chi Minh City', 800.0000, 1400.0000, 'FULL_TIME', 'MID', 'APPROVED', '2026-12-31', 'Angular, TypeScript, RxJS', 'PENDING'),
('10000000-0000-0000-0000-000000000007', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'AI Research Intern', 'Support AI model training and research', 'Hanoi', 300.0000, 600.0000, 'INTERN', 'FRESHER', 'APPROVED', '2026-12-31', 'Python, PyTorch, Math', 'PENDING'),
('10000000-0000-0000-0000-000000000008', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'Cybersecurity Engineer', 'Protect systems and monitor security threats', 'Da Nang', 1200.0000, 2500.0000, 'FULL_TIME', 'MID', 'APPROVED', '2026-12-31', 'Security, Networking, Linux', 'PENDING'),
('10000000-0000-0000-0000-000000000009', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', 'Data Scientist', 'Build predictive models and analytics systems', 'Ho Chi Minh City', 1500.0000, 3000.0000, 'FULL_TIME', 'SENIOR', 'APPROVED', '2026-12-31', 'Python, ML, Statistics', 'PENDING'),
('10000000-0000-0000-0000-000000000010', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'UI/UX Designer', 'Design modern user interfaces and experiences', 'Remote', 700.0000, 1500.0000, 'FULL_TIME', 'FRESHER', 'APPROVED', '2026-12-31', 'Figma, UX Research, Design Systems', 'PENDING'),

-- 10 Jobs for VNG Corporation ('c0000000-0000-0000-0000-000000000002')
('10000000-0000-0000-0000-000000000011', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000006', 'DevOps Engineer', 'Manage CI/CD pipelines and cloud infrastructure', 'Da Nang', 1200.0000, 2500.0000, 'FULL_TIME', 'MID', 'APPROVED', '2026-12-31', 'Docker, Kubernetes, AWS', 'PENDING'),
('10000000-0000-0000-0000-000000000012', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 'Data Analyst', 'Analyze business data and build reports', 'Ho Chi Minh City', 900.0000, 1800.0000, 'FULL_TIME', 'JUNIOR', 'APPROVED', '2026-12-31', 'SQL, Excel, Power BI', 'PENDING'),
('10000000-0000-0000-0000-000000000013', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 'Mobile Flutter Developer', 'Build cross-platform mobile apps', 'Hanoi', 800.0000, 1600.0000, 'FULL_TIME', 'JUNIOR', 'APPROVED', '2026-12-31', 'Flutter, Dart', 'PENDING'),
('10000000-0000-0000-0000-000000000014', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 'QA Engineer', 'Test software and ensure quality', 'Da Nang', 600.0000, 1200.0000, 'FULL_TIME', 'FRESHER', 'APPROVED', '2026-12-31', 'Testing, Automation', 'PENDING'),
('10000000-0000-0000-0000-000000000015', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 'Backend NodeJS Developer', 'Build APIs using NodeJS', 'Remote', 900.0000, 1700.0000, 'FULL_TIME', 'JUNIOR', 'APPROVED', '2026-12-31', 'NodeJS, Express, MongoDB', 'PENDING'),
('10000000-0000-0000-0000-000000000016', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000006', 'Cloud Engineer (AWS)', 'Manage AWS infrastructure and deployments', 'Remote', 1500.0000, 3000.0000, 'FULL_TIME', 'SENIOR', 'APPROVED', '2026-12-31', 'AWS, Terraform, CI/CD', 'PENDING'),
('10000000-0000-0000-0000-000000000017', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 'Product Manager', 'Define product roadmap and features', 'Ho Chi Minh City', 2000.0000, 4000.0000, 'FULL_TIME', 'LEAD', 'APPROVED', '2026-12-31', 'Agile, Communication, Roadmap', 'PENDING'),
('10000000-0000-0000-0000-000000000018', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 'Backend Python Developer', 'Build backend APIs using Django/FastAPI', 'Remote', 1000.0000, 2000.0000, 'FULL_TIME', 'JUNIOR', 'APPROVED', '2026-12-31', 'Python, Django, REST', 'PENDING'),
('10000000-0000-0000-0000-000000000019', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000006', 'Mobile React Native Developer', 'Build mobile apps using React Native', 'Hanoi', 900.0000, 1800.0000, 'FULL_TIME', 'MID', 'APPROVED', '2026-12-31', 'React Native, JavaScript', 'PENDING'),
('10000000-0000-0000-0000-000000000020', NOW(), NOW(), false, 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 'Fullstack Java Developer', 'Work on frontend and backend Java systems', 'Ho Chi Minh City', 1200.0000, 2500.0000, 'FULL_TIME', 'MID', 'APPROVED', '2026-12-31', 'Java, Spring Boot, React', 'PENDING')
    ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- STEP 2: LINK THE JOB SKILLS (Without is_deleted)
-- =============================================================================
INSERT INTO job_skills (
    id, created_at, updated_at,
    job_id, skill_neo4j_id, required_level, is_mandatory
)
VALUES
-- Job 1: Java Backend Developer
('f0000000-0000-0000-0000-000000000001', NOW(), NOW(), '10000000-0000-0000-0000-000000000001', 'neo4j-java-id', 'INTERMEDIATE', true),
('f0000000-0000-0000-0000-000000000002', NOW(), NOW(), '10000000-0000-0000-0000-000000000001', 'neo4j-spring-boot-id', 'INTERMEDIATE', true),

-- Job 2: Frontend React Developer
('f0000000-0000-0000-0000-000000000003', NOW(), NOW(), '10000000-0000-0000-0000-000000000002', 'neo4j-react-id', 'INTERMEDIATE', true),
('f0000000-0000-0000-0000-000000000004', NOW(), NOW(), '10000000-0000-0000-0000-000000000002', 'neo4j-javascript-id', 'BEGINNER', false),

-- Job 3: AI Engineer
('f0000000-0000-0000-0000-000000000005', NOW(), NOW(), '10000000-0000-0000-0000-000000000003', 'neo4j-python-id', 'EXPERT', true),
('f0000000-0000-0000-0000-000000000006', NOW(), NOW(), '10000000-0000-0000-0000-000000000003', 'neo4j-tensorflow-id', 'INTERMEDIATE', true),

-- Job 4: System Architect
('f0000000-0000-0000-0000-000000000007', NOW(), NOW(), '10000000-0000-0000-0000-000000000004', 'neo4j-sysdesign-id', 'EXPERT', true),

-- Job 5: Business Analyst
('f0000000-0000-0000-0000-000000000008', NOW(), NOW(), '10000000-0000-0000-0000-000000000005', 'neo4j-ba-id', 'INTERMEDIATE', true),

-- Job 6: Frontend Angular Developer
('f0000000-0000-0000-0000-000000000009', NOW(), NOW(), '10000000-0000-0000-0000-000000000006', 'neo4j-angular-id', 'INTERMEDIATE', true),

-- Job 7: AI Research Intern
('f0000000-0000-0000-0000-000000000010', NOW(), NOW(), '10000000-0000-0000-0000-000000000007', 'neo4j-pytorch-id', 'BEGINNER', true),

-- Job 8: Cybersecurity Engineer
('f0000000-0000-0000-0000-000000000011', NOW(), NOW(), '10000000-0000-0000-0000-000000000008', 'neo4j-security-id', 'INTERMEDIATE', true),

-- Job 9: Data Scientist
('f0000000-0000-0000-0000-000000000012', NOW(), NOW(), '10000000-0000-0000-0000-000000000009', 'neo4j-ml-id', 'EXPERT', true),

-- Job 10: UI/UX Designer
('f0000000-0000-0000-0000-000000000013', NOW(), NOW(), '10000000-0000-0000-0000-000000000010', 'neo4j-figma-id', 'INTERMEDIATE', true),

-- Job 11: DevOps Engineer
('f0000000-0000-0000-0000-000000000014', NOW(), NOW(), '10000000-0000-0000-0000-000000000011', 'neo4j-docker-id', 'INTERMEDIATE', true),
('f0000000-0000-0000-0000-000000000015', NOW(), NOW(), '10000000-0000-0000-0000-000000000011', 'neo4j-k8s-id', 'ADVANCED', true),

-- Job 12: Data Analyst
('f0000000-0000-0000-0000-000000000016', NOW(), NOW(), '10000000-0000-0000-0000-000000000012', 'neo4j-sql-id', 'INTERMEDIATE', true),

-- Job 13: Mobile Flutter Developer
('f0000000-0000-0000-0000-000000000017', NOW(), NOW(), '10000000-0000-0000-0000-000000000013', 'neo4j-flutter-id', 'INTERMEDIATE', true),

-- Job 14: QA Engineer
('f0000000-0000-0000-0000-000000000018', NOW(), NOW(), '10000000-0000-0000-0000-000000000014', 'neo4j-testing-id', 'INTERMEDIATE', true),

-- Job 15: Backend NodeJS Developer
('f0000000-0000-0000-0000-000000000019', NOW(), NOW(), '10000000-0000-0000-0000-000000000015', 'neo4j-nodejs-id', 'INTERMEDIATE', true),

-- Job 16: Cloud Engineer (AWS)
('f0000000-0000-0000-0000-000000000020', NOW(), NOW(), '10000000-0000-0000-0000-000000000016', 'neo4j-aws-id', 'EXPERT', true),

-- Job 17: Product Manager
('f0000000-0000-0000-0000-000000000021', NOW(), NOW(), '10000000-0000-0000-0000-000000000017', 'neo4j-agile-id', 'ADVANCED', true),

-- Job 18: Backend Python Developer
('f0000000-0000-0000-0000-000000000022', NOW(), NOW(), '10000000-0000-0000-0000-000000000018', 'neo4j-django-id', 'INTERMEDIATE', true),

-- Job 19: Mobile React Native Developer
('f0000000-0000-0000-0000-000000000023', NOW(), NOW(), '10000000-0000-0000-0000-000000000019', 'neo4j-reactnative-id', 'INTERMEDIATE', true),

-- Job 20: Fullstack Java Developer
('f0000000-0000-0000-0000-000000000024', NOW(), NOW(), '10000000-0000-0000-0000-000000000020', 'neo4j-java-id', 'INTERMEDIATE', true),
('f0000000-0000-0000-0000-000000000025', NOW(), NOW(), '10000000-0000-0000-0000-000000000020', 'neo4j-react-id', 'BEGINNER', false)
    ON CONFLICT (id) DO NOTHING;